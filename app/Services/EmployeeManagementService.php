<?php

declare(strict_types=1);

namespace App\Services;

use App\Enums\CareerChangeType;
use App\Enums\EmployeeStatus;
use App\Models\Employee;
use App\Models\EmployeeHistory;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class EmployeeManagementService
{
    public function __construct(
        protected AuditLogService $auditLogService,
    ) {}

    public function createEmployee(array $attributes, float $baseSalary, ?int $approvedByUserId = null): Employee
    {
        return DB::transaction(function () use ($attributes, $baseSalary, $approvedByUserId) {
            $employee = Employee::create($attributes);

            $effectiveStartDate = Carbon::parse($attributes['join_date'])->format('Y-m-d');

            $history = EmployeeHistory::create([
                'employee_id' => $employee->id,
                'change_type' => CareerChangeType::Hire,
                'effective_start_date' => $effectiveStartDate,
                'effective_end_date' => null,
                'base_salary' => (string) $baseSalary,
                'branch_id' => $employee->current_branch_id,
                'department_id' => $employee->current_department_id,
                'position_id' => $employee->current_position_id,
                'manager_id' => $employee->current_manager_id,
                'approved_by_user_id' => $approvedByUserId,
                'reason' => 'Initial employee onboarding',
            ]);

            $this->auditLogService->log('employee.created', $employee, null, [
                'nik' => $employee->nik,
                'name' => $employee->name,
                'branch_id' => $employee->current_branch_id,
                'department_id' => $employee->current_department_id,
                'position_id' => $employee->current_position_id,
            ]);

            $this->auditLogService->log('employee_history.created', $history, null, [
                'change_type' => $history->change_type->value,
                'effective_start_date' => $history->effective_start_date->toDateString(),
            ]);

            return $employee;
        });
    }

    public function recordCareerTransition(
        Employee $employee,
        CareerChangeType $changeType,
        string $effectiveStartDate,
        float $baseSalary,
        int $branchId,
        int $departmentId,
        int $positionId,
        ?int $managerId,
        int $approvedByUserId,
        ?string $reason = null,
    ): EmployeeHistory {
        return DB::transaction(function () use (
            $employee,
            $changeType,
            $effectiveStartDate,
            $baseSalary,
            $branchId,
            $departmentId,
            $positionId,
            $managerId,
            $approvedByUserId,
            $reason,
        ) {
            $startDate = Carbon::parse($effectiveStartDate);

            $previousHistory = EmployeeHistory::where('employee_id', $employee->id)
                ->where('effective_start_date', '<', $startDate->toDateString())
                ->where(function ($query) use ($startDate) {
                    $query->whereNull('effective_end_date')
                        ->orWhere('effective_end_date', '>=', $startDate->toDateString());
                })
                ->latest('effective_start_date')
                ->first();

            if ($previousHistory) {
                $previousEnd = (clone $startDate)->subDay()->toDateString();
                $previousHistory->update([
                    'effective_end_date' => $previousEnd,
                ]);
            }

            $newHistory = EmployeeHistory::create([
                'employee_id' => $employee->id,
                'change_type' => $changeType,
                'effective_start_date' => $startDate->toDateString(),
                'effective_end_date' => null,
                'base_salary' => (string) $baseSalary,
                'branch_id' => $branchId,
                'department_id' => $departmentId,
                'position_id' => $positionId,
                'manager_id' => $managerId,
                'approved_by_user_id' => $approvedByUserId,
                'reason' => $reason,
            ]);

            if ($startDate->isPast() || $startDate->isToday()) {
                $employee->update([
                    'current_branch_id' => $branchId,
                    'current_department_id' => $departmentId,
                    'current_position_id' => $positionId,
                    'current_manager_id' => $managerId,
                ]);
            }

            $this->auditLogService->log('career_transition.recorded', $newHistory, null, [
                'employee_id' => $employee->id,
                'change_type' => $changeType->value,
                'effective_start_date' => $startDate->toDateString(),
                'branch_id' => $branchId,
                'department_id' => $departmentId,
                'position_id' => $positionId,
            ]);

            return $newHistory;
        });
    }

    public function updateStatus(Employee $employee, EmployeeStatus $newStatus, ?string $reason = null): Employee
    {
        return DB::transaction(function () use ($employee, $newStatus, $reason) {
            $oldStatus = $employee->status;

            $updateData = ['status' => $newStatus];
            if ($newStatus === EmployeeStatus::Resigned || $newStatus === EmployeeStatus::Terminated) {
                $updateData['resign_date'] = now()->toDateString();
            }

            $employee->update($updateData);

            $this->auditLogService->log('employee.status_updated', $employee, [
                'status' => $oldStatus->value,
            ], [
                'status' => $newStatus->value,
                'reason' => $reason,
            ]);

            return $employee;
        });
    }
}

