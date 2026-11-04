<?php

declare(strict_types=1);

namespace App\Services;

use App\Enums\ApprovalModule;
use App\Models\Employee;
use App\Models\LeaveBalance;
use App\Models\LeaveRequest;
use App\Models\LeaveType;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use RuntimeException;

class LeaveManagementService
{
    public function __construct(
        protected ApprovalEngineService $approvalService,
        protected AuditLogService $auditLogService,
    ) {}

    public function submitLeaveRequest(
        Employee $employee,
        int $leaveTypeId,
        string $startDate,
        string $endDate,
        string $reason,
        ?string $attachmentPath = null,
        ?string $emergencyContact = null,
    ): LeaveRequest {
        $leaveType = LeaveType::findOrFail($leaveTypeId);
        $start = Carbon::parse($startDate);
        $end = Carbon::parse($endDate);

        if ($end->lessThan($start)) {
            throw new RuntimeException('Tanggal selesai cuti tidak boleh lebih awal dari tanggal mulai.');
        }

        $totalDays = (int) $start->diffInDays($end) + 1;

        if ($leaveType->max_consecutive_days && $totalDays > $leaveType->max_consecutive_days) {
            throw new RuntimeException("Jenis cuti {$leaveType->name} maksimal berdurasi {$leaveType->max_consecutive_days} hari berturut-turut.");
        }

        $year = (int) $start->year;

        $balance = LeaveBalance::firstOrCreate(
            ['employee_id' => $employee->id, 'leave_type_id' => $leaveType->id, 'year' => $year],
            [
                'allocated_days' => $leaveType->default_quota,
                'used_days' => 0,
                'carry_over_days' => 0,
                'remaining_days' => $leaveType->default_quota,
            ],
        );

        if ($leaveType->default_quota > 0 && $balance->remaining_days < $totalDays) {
            throw new RuntimeException("Sisa kuota cuti {$leaveType->name} Anda tidak mencukupi (Tersisa: {$balance->remaining_days} hari, Diajukan: {$totalDays} hari).");
        }

        return DB::transaction(function () use (
            $employee,
            $leaveType,
            $start,
            $end,
            $totalDays,
            $reason,
            $attachmentPath,
            $emergencyContact,
        ) {
            $leaveRequest = LeaveRequest::create([
                'employee_id' => $employee->id,
                'leave_type_id' => $leaveType->id,
                'start_date' => $start->toDateString(),
                'end_date' => $end->toDateString(),
                'total_days' => $totalDays,
                'reason' => $reason,
                'attachment_path' => $attachmentPath,
                'emergency_contact' => $emergencyContact,
                'status' => 'PENDING',
            ]);

            if ($employee->user) {
                $this->approvalService->initiate(
                    ApprovalModule::Leave,
                    $leaveRequest,
                    $employee->user,
                    "Pengajuan {$leaveType->name} ({$totalDays} hari)",
                );
            }

            $this->auditLogService->log('leave.requested', $leaveRequest, null, [
                'employee_id' => $employee->id,
                'leave_type' => $leaveType->name,
                'total_days' => $totalDays,
            ]);

            return $leaveRequest;
        });
    }

    public function finalizeApprovedLeave(LeaveRequest $leaveRequest): void
    {
        DB::transaction(function () use ($leaveRequest) {
            $leaveRequest->update(['status' => 'APPROVED']);

            $year = Carbon::parse($leaveRequest->start_date)->year;
            $balance = LeaveBalance::where('employee_id', $leaveRequest->employee_id)
                ->where('leave_type_id', $leaveRequest->leave_type_id)
                ->where('year', $year)
                ->first();

            if ($balance) {
                $balance->used_days += $leaveRequest->total_days;
                $balance->remaining_days = max(0, $balance->remaining_days - $leaveRequest->total_days);
                $balance->save();
            }

            $start = Carbon::parse($leaveRequest->start_date);
            $end = Carbon::parse($leaveRequest->end_date);
            for ($d = $start->copy(); $d->lte($end); $d->addDay()) {
                \App\Models\AttendanceSummary::updateOrCreate(
                    ['employee_id' => $leaveRequest->employee_id, 'date' => $d->toDateString()],
                    ['status' => \App\Enums\AttendanceStatus::Leave, 'notes' => "Cuti: {$leaveRequest->leaveType->name}"],
                );
            }
        });
    }
}

