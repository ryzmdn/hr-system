<?php

declare(strict_types=1);

namespace App\Services;

use App\Enums\ReimbursementStatus;
use App\Models\Employee;
use App\Models\EmployeeReimbursementBalance;
use App\Models\ReimbursementRequest;
use App\Models\ReimbursementType;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class ReimbursementService
{
    public function ensureBalance(Employee $employee, ReimbursementType $type, int $year): EmployeeReimbursementBalance
    {
        return EmployeeReimbursementBalance::firstOrCreate(
            [
                'employee_id' => $employee->id,
                'reimbursement_type_id' => $type->id,
                'year' => $year,
            ],
            [
                'allocated_amount' => $type->annual_limit,
                'used_amount' => 0.0,
                'remaining_amount' => $type->annual_limit,
            ]
        );
    }

    public function submitClaim(
        Employee $employee,
        int $typeId,
        string $receiptDate,
        float $amount,
        string $description,
        ?UploadedFile $receiptFile,
    ): ReimbursementRequest {
        return DB::transaction(function () use ($employee, $typeId, $receiptDate, $amount, $description, $receiptFile): ReimbursementRequest {
            $type = ReimbursementType::findOrFail($typeId);
            $year = (int) Carbon::parse($receiptDate)->format('Y');
            $balance = $this->ensureBalance($employee, $type, $year);

            if ($type->annual_limit > 0 && $amount > $balance->remaining_amount) {
                throw new \InvalidArgumentException('Nominal klaim melebihi sisa plafon tahunan Anda.');
            }

            $claimNumber = 'CLM-' . Carbon::now()->format('Ym') . '-' . strtoupper(Str::random(6));

            $receiptPath = null;
            if ($receiptFile !== null) {
                $receiptPath = $receiptFile->store('receipts', 'public');
            }

            return ReimbursementRequest::create([
                'employee_id' => $employee->id,
                'reimbursement_type_id' => $type->id,
                'claim_number' => $claimNumber,
                'receipt_date' => $receiptDate,
                'amount' => $amount,
                'approved_amount' => $amount,
                'description' => $description,
                'receipt_file_path' => $receiptPath,
                'status' => ReimbursementStatus::Submitted,
            ]);
        });
    }

    public function approveClaim(ReimbursementRequest $request, float $approvedAmount, User $approver): ReimbursementRequest
    {
        return DB::transaction(function () use ($request, $approvedAmount, $approver): ReimbursementRequest {
            $type = $request->type;
            $year = (int) Carbon::parse($request->receipt_date)->format('Y');
            $balance = $this->ensureBalance($request->employee, $type, $year);

            $newUsed = $balance->used_amount + $approvedAmount;
            $newRemaining = max(0.0, $balance->allocated_amount - $newUsed);

            $balance->update([
                'used_amount' => $newUsed,
                'remaining_amount' => $newRemaining,
            ]);

            $request->update([
                'approved_amount' => $approvedAmount,
                'status' => ReimbursementStatus::Approved,
                'approved_by_user_id' => $approver->id,
            ]);

            return $request->fresh();
        });
    }

    public function markAsPaid(ReimbursementRequest $request): ReimbursementRequest
    {
        $request->update([
            'status' => ReimbursementStatus::Paid,
            'paid_at' => Carbon::now(),
        ]);

        return $request->fresh();
    }
}

