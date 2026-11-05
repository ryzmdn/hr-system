<?php

declare(strict_types=1);

namespace App\Services;

use App\Enums\ClearanceDepartment;
use App\Enums\EmployeeStatus;
use App\Enums\OffboardingStatus;
use App\Enums\OffboardingType;
use App\Models\Employee;
use App\Models\ExitClearanceItem;
use App\Models\ExperienceLetter;
use App\Models\OffboardingRequest;
use App\Models\SeveranceSettlement;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class OffboardingService
{
    public function __construct(
        protected SeveranceCalculationService $severanceService,
    ) {}

    public function initiateOffboarding(
        Employee $employee,
        OffboardingType $type,
        string $noticeDate,
        string $effectiveDate,
        string $reason,
        float $uphAmount = 0.0,
    ): OffboardingRequest {
        return DB::transaction(function () use ($employee, $type, $noticeDate, $effectiveDate, $reason, $uphAmount): OffboardingRequest {
            $offboarding = OffboardingRequest::create([
                'employee_id' => $employee->id,
                'type' => $type,
                'reason' => $reason,
                'notice_date' => $noticeDate,
                'effective_date' => $effectiveDate,
                'status' => OffboardingStatus::Clearance,
            ]);

            $defaultClearanceItems = [
                ['department' => ClearanceDepartment::It, 'item' => 'Pengembalian Laptop & Perangkat Keras'],
                ['department' => ClearanceDepartment::It, 'item' => 'Pencabutan Akses Email, VPN, & SSO Korporat'],
                ['department' => ClearanceDepartment::It, 'item' => 'Pencabutan Akses Repository Kode & Server'],
                ['department' => ClearanceDepartment::Hr, 'item' => 'Pengembalian ID Card & Kartu Akses Gedung'],
                ['department' => ClearanceDepartment::Hr, 'item' => 'Pengembalian Kartu Asuransi / BPJS Fisik'],
                ['department' => ClearanceDepartment::Finance, 'item' => 'Penyelesaian Sisa Kasbon / Pinjaman Karyawan'],
                ['department' => ClearanceDepartment::Finance, 'item' => 'Rekonsiliasi Klaim Reimbursement & Petty Cash'],
                ['department' => ClearanceDepartment::Supervisor, 'item' => 'Handover Dokumen & Tanggung Jawab Pekerjaan'],
                ['department' => ClearanceDepartment::Supervisor, 'item' => 'Transfer Knowledge & Kredensial Tim'],
            ];

            foreach ($defaultClearanceItems as $item) {
                ExitClearanceItem::create([
                    'offboarding_request_id' => $offboarding->id,
                    'department' => $item['department'],
                    'item_name' => $item['item'],
                    'is_cleared' => false,
                ]);
            }

            $effectiveCarbon = Carbon::parse($effectiveDate);
            $joinCarbon = Carbon::parse($employee->join_date);
            $baseSalary = $employee->getEffectiveSalary($effectiveCarbon);

            $calc = $this->severanceService->calculate(
                $baseSalary,
                $joinCarbon,
                $effectiveCarbon,
                $type,
                $uphAmount
            );

            SeveranceSettlement::create([
                'offboarding_request_id' => $offboarding->id,
                'base_salary' => $baseSalary,
                'service_years' => $calc['service_years'],
                'service_months' => $calc['service_months'],
                'up_multiplier' => $calc['up_multiplier'],
                'up_amount' => $calc['up_amount'],
                'upmk_multiplier' => $calc['upmk_multiplier'],
                'upmk_amount' => $calc['upmk_amount'],
                'uph_amount' => $calc['uph_amount'],
                'pkwt_compensation_amount' => $calc['pkwt_compensation_amount'],
                'total_gross_severance' => $calc['total_gross_severance'],
                'tax_pph21_severance' => $calc['tax_pph21_severance'],
                'net_severance' => $calc['net_severance'],
                'status' => 'PENDING',
            ]);

            $letterNumber = 'PKL/' . Carbon::now()->format('Ym') . '/' . strtoupper(Str::random(5));
            ExperienceLetter::create([
                'offboarding_request_id' => $offboarding->id,
                'employee_id' => $employee->id,
                'letter_number' => $letterNumber,
                'issued_date' => $effectiveDate,
                'start_date' => $employee->join_date,
                'end_date' => $effectiveDate,
                'last_position' => $employee->position?->name ?? 'Staf',
                'last_department' => $employee->department?->name ?? 'Operasional',
                'verification_token' => hash('sha256', $letterNumber . $employee->nik . microtime()),
                'is_active' => true,
            ]);

            return $offboarding->fresh(['clearanceItems', 'severance', 'experienceLetter']);
        });
    }

    public function clearItem(ExitClearanceItem $item, User $actor, ?string $notes = null): ExitClearanceItem
    {
        return DB::transaction(function () use ($item, $actor, $notes): ExitClearanceItem {
            $item->update([
                'is_cleared' => true,
                'cleared_by_user_id' => $actor->id,
                'cleared_at' => Carbon::now(),
                'notes' => $notes ?? $item->notes,
            ]);

            $offboarding = $item->offboardingRequest;
            $allCleared = $offboarding->clearanceItems()->where('is_cleared', false)->count() === 0;

            if ($allCleared) {
                $offboarding->update(['status' => OffboardingStatus::Approved]);
            }

            return $item->fresh();
        });
    }

    public function finalizeOffboarding(OffboardingRequest $request, User $actor): OffboardingRequest
    {
        return DB::transaction(function () use ($request, $actor): OffboardingRequest {
            $request->update([
                'status' => OffboardingStatus::Completed,
                'approved_by_user_id' => $actor->id,
            ]);

            $employee = $request->employee;
            $newStatus = match ($request->type) {
                OffboardingType::Resignation => EmployeeStatus::Resigned,
                default => EmployeeStatus::Terminated,
            };

            $employee->update([
                'status' => $newStatus,
                'resign_date' => $request->effective_date,
            ]);

            if ($request->severance) {
                $request->severance->update([
                    'status' => 'PAID',
                    'paid_at' => Carbon::now(),
                ]);
            }

            return $request->fresh(['clearanceItems', 'severance', 'experienceLetter', 'employee']);
        });
    }
}

