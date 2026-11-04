<?php

declare(strict_types=1);

namespace App\Services;

use App\Enums\ApprovalModule;
use App\Enums\ApprovalStatus;
use App\Enums\ApproverType;
use App\Models\ApprovalAction;
use App\Models\ApprovalDelegation;
use App\Models\ApprovalStep;
use App\Models\ApprovalTransaction;
use App\Models\ApprovalWorkflow;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;
use RuntimeException;

class ApprovalEngineService
{
    public function __construct(
        protected AuditLogService $auditLogService,
    ) {}

    public function initiate(
        ApprovalModule $module,
        Model $reference,
        User $requester,
        ?string $notes = null,
    ): ApprovalTransaction {
        $workflow = ApprovalWorkflow::where('module', $module)
            ->where('is_active', true)
            ->first();

        if (! $workflow) {
            throw new RuntimeException("Tidak ada alur persetujuan aktif untuk modul {$module->value}.");
        }

        $firstStep = $workflow->steps()->where('step_order', 1)->first();
        if (! $firstStep) {
            throw new RuntimeException("Alur persetujuan {$workflow->name} belum memiliki tahapan langkah.");
        }

        return DB::transaction(function () use ($workflow, $reference, $requester, $notes) {
            $transaction = ApprovalTransaction::create([
                'workflow_id' => $workflow->id,
                'reference_type' => $reference->getMorphClass(),
                'reference_id' => $reference->getKey(),
                'current_step_order' => 1,
                'status' => ApprovalStatus::Pending,
                'requester_user_id' => $requester->id,
                'notes' => $notes,
            ]);

            $this->auditLogService->log('approval.initiated', $transaction, null, [
                'module' => $workflow->module->value,
                'reference_type' => $reference->getMorphClass(),
                'reference_id' => $reference->getKey(),
                'requester_id' => $requester->id,
            ]);

            return $transaction;
        });
    }

    public function approve(ApprovalTransaction $transaction, User $approver, ?string $remarks = null): ApprovalTransaction
    {
        if ($transaction->status !== ApprovalStatus::Pending) {
            throw new RuntimeException('Transaksi ini sudah selesai diproses dan tidak dapat disetujui lagi.');
        }

        $currentStep = $transaction->workflow->steps()
            ->where('step_order', $transaction->current_step_order)
            ->first();

        if (! $currentStep) {
            throw new RuntimeException('Tahapan persetujuan aktif tidak ditemukan.');
        }

        if (! $this->canUserApproveStep($approver, $currentStep, $transaction->requester)) {
            throw new RuntimeException('Anda tidak memiliki wewenang untuk menyetujui tahapan ini.');
        }

        return DB::transaction(function () use ($transaction, $currentStep, $approver, $remarks) {
            ApprovalAction::create([
                'transaction_id' => $transaction->id,
                'step_id' => $currentStep->id,
                'action_by_user_id' => $approver->id,
                'status' => ApprovalStatus::Approved,
                'remarks' => $remarks,
                'created_at' => now(),
            ]);

            $nextStep = $transaction->workflow->steps()
                ->where('step_order', $transaction->current_step_order + 1)
                ->first();

            if ($nextStep) {
                $transaction->update([
                    'current_step_order' => $nextStep->step_order,
                ]);
            } else {
                $transaction->update([
                    'status' => ApprovalStatus::Approved,
                ]);
            }

            $this->auditLogService->log('approval.step_approved', $transaction, null, [
                'step_order' => $currentStep->step_order,
                'approved_by' => $approver->id,
                'is_final' => ! $nextStep,
            ]);

            return $transaction->fresh(['workflow', 'actions.actionBy', 'requester']);
        });
    }

    public function reject(ApprovalTransaction $transaction, User $approver, string $remarks): ApprovalTransaction
    {
        if ($transaction->status !== ApprovalStatus::Pending) {
            throw new RuntimeException('Transaksi ini sudah tidak dalam status pending.');
        }

        $currentStep = $transaction->workflow->steps()
            ->where('step_order', $transaction->current_step_order)
            ->first();

        if (! $currentStep) {
            throw new RuntimeException('Tahapan persetujuan aktif tidak ditemukan.');
        }

        if (! $this->canUserApproveStep($approver, $currentStep, $transaction->requester)) {
            throw new RuntimeException('Anda tidak memiliki wewenang untuk menolak tahapan ini.');
        }

        return DB::transaction(function () use ($transaction, $currentStep, $approver, $remarks) {
            ApprovalAction::create([
                'transaction_id' => $transaction->id,
                'step_id' => $currentStep->id,
                'action_by_user_id' => $approver->id,
                'status' => ApprovalStatus::Rejected,
                'remarks' => $remarks,
                'created_at' => now(),
            ]);

            $transaction->update([
                'status' => ApprovalStatus::Rejected,
            ]);

            $this->auditLogService->log('approval.rejected', $transaction, null, [
                'step_order' => $currentStep->step_order,
                'rejected_by' => $approver->id,
                'remarks' => $remarks,
            ]);

            return $transaction->fresh(['workflow', 'actions.actionBy', 'requester']);
        });
    }

    public function canUserApproveStep(User $user, ApprovalStep $step, User $requester): bool
    {
        if ($user->isSuperAdmin()) {
            return true;
        }

        $eligibleUsers = $this->resolveEligibleApprovers($step, $requester);

        if ($eligibleUsers->contains('id', $user->id)) {
            return true;
        }

        $today = Carbon::today();
        $delegatorIds = ApprovalDelegation::where('delegatee_user_id', $user->id)
            ->activeOnDate($today)
            ->pluck('delegator_user_id');

        return $eligibleUsers->whereIn('id', $delegatorIds)->isNotEmpty();
    }

    public function resolveEligibleApprovers(ApprovalStep $step, User $requester): Collection
    {
        $requesterEmployee = $requester->employee;

        return match ($step->approver_type) {
            ApproverType::DirectManager => $this->resolveDirectManager($requesterEmployee),
            ApproverType::DepartmentHead => $this->resolveDepartmentHead($requesterEmployee),
            ApproverType::Role => $this->resolveRoleApprovers($step, $requesterEmployee?->current_branch_id),
            ApproverType::SpecificUser => $step->specificUser ? Collection::make([$step->specificUser]) : Collection::empty(),
        };
    }

    protected function resolveDirectManager(?Model $requesterEmployee): Collection
    {
        if (! $requesterEmployee || ! $requesterEmployee->current_manager_id) {
            return Collection::empty();
        }

        $manager = $requesterEmployee->manager?->user;

        return $manager ? Collection::make([$manager]) : Collection::empty();
    }

    protected function resolveDepartmentHead(?Model $requesterEmployee): Collection
    {
        if (! $requesterEmployee || ! $requesterEmployee->current_department_id) {
            return Collection::empty();
        }

        $headEmployee = $requesterEmployee->department->employees()
            ->whereHas('position', fn ($q) => $q->where('code', 'LIKE', '%HEAD%')->orWhere('code', 'LIKE', '%MGR%'))
            ->first();

        $user = $headEmployee?->user;

        return $user ? Collection::make([$user]) : Collection::empty();
    }

    protected function resolveRoleApprovers(ApprovalStep $step, ?int $branchId): Collection
    {
        if (! $step->approver_role_id) {
            return Collection::empty();
        }

        return User::whereHas('roles', function ($query) use ($step, $branchId) {
            $query->where('roles.id', $step->approver_role_id)
                ->when($branchId !== null, function ($q) use ($branchId) {
                    $q->where(function ($sub) use ($branchId) {
                        $sub->whereNull('user_has_roles.branch_id')
                            ->orWhere('user_has_roles.branch_id', $branchId);
                    });
                });
        })->get();
    }

    public function getPendingTransactionsForUser(User $user): Collection
    {
        $transactions = ApprovalTransaction::with(['workflow.steps', 'requester.employee.department', 'requester.employee.branch'])
            ->where('status', ApprovalStatus::Pending)
            ->get();

        return $transactions->filter(function (ApprovalTransaction $transaction) use ($user) {
            $currentStep = $transaction->workflow->steps
                ->firstWhere('step_order', $transaction->current_step_order);

            if (! $currentStep) {
                return false;
            }

            return $this->canUserApproveStep($user, $currentStep, $transaction->requester);
        })->values();
    }
}

