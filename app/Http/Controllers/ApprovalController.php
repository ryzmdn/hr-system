<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Enums\ApprovalStatus;
use App\Http\Requests\StoreDelegationRequest;
use App\Models\ApprovalDelegation;
use App\Models\ApprovalTransaction;
use App\Models\ApprovalWorkflow;
use App\Models\User;
use App\Services\ApprovalEngineService;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ApprovalController extends Controller
{
    public function __construct(
        protected ApprovalEngineService $approvalService,
    ) {}

    public function inbox(Request $request): Response
    {
        $user = $request->user();

        $pending = $this->approvalService->getPendingTransactionsForUser($user)
            ->map(function (ApprovalTransaction $tx) {
                $currentStep = $tx->workflow->steps->firstWhere('step_order', $tx->current_step_order);

                return [
                    'id' => $tx->id,
                    'module' => $tx->workflow->module->value,
                    'module_label' => $tx->workflow->module->label(),
                    'workflow_name' => $tx->workflow->name,
                    'current_step_order' => $tx->current_step_order,
                    'current_step_name' => $currentStep ? $currentStep->name : '-',
                    'total_steps' => $tx->workflow->steps->count(),
                    'status' => $tx->status->value,
                    'status_label' => $tx->status->label(),
                    'requester' => [
                        'name' => $tx->requester->name,
                        'email' => $tx->requester->email,
                        'department' => $tx->requester->employee?->department?->name ?? '-',
                        'branch' => $tx->requester->employee?->branch?->name ?? '-',
                    ],
                    'notes' => $tx->notes,
                    'created_at' => $tx->created_at->diffForHumans(),
                ];
            });

        $history = ApprovalTransaction::with(['workflow', 'requester', 'actions.actionBy'])
            ->whereHas('actions', fn ($q) => $q->where('action_by_user_id', $user->id))
            ->latest()
            ->take(20)
            ->get()
            ->map(fn (ApprovalTransaction $tx) => [
                'id' => $tx->id,
                'workflow_name' => $tx->workflow->name,
                'requester_name' => $tx->requester->name,
                'status' => $tx->status->value,
                'status_label' => $tx->status->label(),
                'updated_at' => $tx->updated_at->diffForHumans(),
            ]);

        $activeDelegations = ApprovalDelegation::with(['delegator', 'delegatee'])
            ->where(function ($q) use ($user) {
                $q->where('delegator_user_id', $user->id)
                    ->orWhere('delegatee_user_id', $user->id);
            })
            ->latest()
            ->get()
            ->map(fn (ApprovalDelegation $d) => [
                'id' => $d->id,
                'is_outgoing' => $d->delegator_user_id === $user->id,
                'delegator_name' => $d->delegator->name,
                'delegatee_name' => $d->delegatee->name,
                'start_date' => $d->start_date->toDateString(),
                'end_date' => $d->end_date->toDateString(),
                'reason' => $d->reason,
                'is_active' => $d->is_active && $d->end_date->isFuture(),
            ]);

        $availableUsers = User::where('id', '!=', $user->id)
            ->select('id', 'name', 'email')
            ->orderBy('name')
            ->get();

        return Inertia::render('approvals/inbox', [
            'pending' => $pending,
            'history' => $history,
            'delegations' => $activeDelegations,
            'availableUsers' => $availableUsers,
        ]);
    }

    public function approve(Request $request, ApprovalTransaction $transaction): RedirectResponse
    {
        $validated = $request->validate([
            'remarks' => ['nullable', 'string', 'max:500'],
        ]);

        $this->approvalService->approve($transaction, $request->user(), $validated['remarks'] ?? null);

        return back()->with('success', 'Pengajuan berhasil disetujui.');
    }

    public function reject(Request $request, ApprovalTransaction $transaction): RedirectResponse
    {
        $validated = $request->validate([
            'remarks' => ['required', 'string', 'max:500'],
        ]);

        $this->approvalService->reject($transaction, $request->user(), $validated['remarks']);

        return back()->with('success', 'Pengajuan telah ditolak.');
    }

    public function storeDelegation(StoreDelegationRequest $request): RedirectResponse
    {
        ApprovalDelegation::create([
            'delegator_user_id' => $request->user()->id,
            'delegatee_user_id' => (int) $request->input('delegatee_user_id'),
            'start_date' => $request->input('start_date'),
            'end_date' => $request->input('end_date'),
            'reason' => $request->input('reason'),
            'is_active' => true,
        ]);

        return back()->with('success', 'Delegasi wewenang persetujuan berhasil diaktifkan.');
    }

    public function revokeDelegation(ApprovalDelegation $delegation, Request $request): RedirectResponse
    {
        if ($delegation->delegator_user_id !== $request->user()->id && ! $request->user()->isSuperAdmin()) {
            abort(403);
        }

        $delegation->update(['is_active' => false]);

        return back()->with('success', 'Delegasi wewenang persetujuan berhasil dinonaktifkan.');
    }

    public function workflows(): Response
    {
        $workflows = ApprovalWorkflow::with(['steps.role', 'steps.specificUser'])
            ->get()
            ->map(fn (ApprovalWorkflow $w) => [
                'id' => $w->id,
                'module' => $w->module->value,
                'module_label' => $w->module->label(),
                'name' => $w->name,
                'description' => $w->description,
                'is_active' => $w->is_active,
                'steps' => $w->steps->map(fn ($s) => [
                    'id' => $s->id,
                    'step_order' => $s->step_order,
                    'name' => $s->name,
                    'approver_type' => $s->approver_type->value,
                    'approver_type_label' => $s->approver_type->label(),
                    'role_name' => $s->role?->name,
                    'user_name' => $s->specificUser?->name,
                ]),
            ]);

        return Inertia::render('approvals/workflows', [
            'workflows' => $workflows,
        ]);
    }
}

