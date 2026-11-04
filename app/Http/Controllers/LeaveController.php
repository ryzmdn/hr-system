<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\Employee;
use App\Models\LeaveBalance;
use App\Models\LeaveRequest;
use App\Models\LeaveType;
use App\Services\LeaveManagementService;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class LeaveController extends Controller
{
    public function __construct(
        protected LeaveManagementService $leaveService,
    ) {}

    public function index(Request $request): Response
    {
        $user = $request->user();
        $employee = $user->employee;

        $leaveTypes = LeaveType::where('is_active', true)->get();

        $balances = [];
        if ($employee) {
            $year = Carbon::now()->year;
            $balances = LeaveBalance::with('leaveType')
                ->where('employee_id', $employee->id)
                ->where('year', $year)
                ->get()
                ->map(fn ($b) => [
                    'id' => $b->id,
                    'leave_type_name' => $b->leaveType->name,
                    'allocated_days' => $b->allocated_days,
                    'used_days' => $b->used_days,
                    'remaining_days' => $b->remaining_days,
                ]);
        }

        $requestsQuery = LeaveRequest::with(['employee.department', 'employee.branch', 'leaveType'])
            ->latest();

        if (! $user->hasPermission('attendance.manage') && $employee) {
            $requestsQuery->where('employee_id', $employee->id);
        }

        $requests = $requestsQuery->paginate(15)->withQueryString();

        $requests->through(fn (LeaveRequest $r) => [
            'id' => $r->id,
            'employee_name' => $r->employee->name,
            'employee_nik' => $r->employee->nik,
            'leave_type_name' => $r->leaveType->name,
            'start_date' => $r->start_date->toDateString(),
            'end_date' => $r->end_date->toDateString(),
            'total_days' => $r->total_days,
            'reason' => $r->reason,
            'status' => $r->status,
            'created_at' => $r->created_at->diffForHumans(),
        ]);

        return Inertia::render('leave/index', [
            'leaveTypes' => $leaveTypes,
            'balances' => $balances,
            'requests' => $requests,
            'isManagerOrAdmin' => $user->hasPermission('attendance.manage'),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'leave_type_id' => ['required', 'exists:leave_types,id'],
            'start_date' => ['required', 'date'],
            'end_date' => ['required', 'date', 'after_or_equal:start_date'],
            'reason' => ['required', 'string', 'max:1000'],
            'emergency_contact' => ['nullable', 'string', 'max:100'],
        ]);

        $employee = $request->user()->employee;
        if (! $employee) {
            abort(403);
        }

        try {
            $this->leaveService->submitLeaveRequest(
                $employee,
                (int) $validated['leave_type_id'],
                $validated['start_date'],
                $validated['end_date'],
                $validated['reason'],
                null,
                $validated['emergency_contact'] ?? null,
            );
        } catch (\RuntimeException $e) {
            return back()->with('error', $e->getMessage());
        }

        return back()->with('success', 'Permohonan cuti berhasil diajukan dan diteruskan ke atasan.');
    }
}

