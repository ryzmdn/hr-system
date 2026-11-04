<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Enums\AttendanceStatus;
use App\Enums\AttendanceType;
use App\Models\AttendanceCorrection;
use App\Models\AttendanceLog;
use App\Models\AttendanceSummary;
use App\Models\Branch;
use App\Models\Department;
use App\Models\Employee;
use App\Models\EmployeeRoster;
use App\Models\ShiftTemplate;
use App\Services\AttendanceService;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AttendanceController extends Controller
{
    public function __construct(
        protected AttendanceService $attendanceService,
    ) {}

    public function index(Request $request): Response
    {
        $today = Carbon::today()->toDateString();
        $branchId = $request->input('branch_id');

        $summariesQuery = AttendanceSummary::with(['employee.branch', 'employee.department', 'employee.position', 'roster.shift'])
            ->where('date', $today)
            ->when($branchId, fn ($q, $b) => $q->whereHas('employee', fn ($sq) => $sq->where('current_branch_id', $b)));

        $summaries = $summariesQuery->get();

        $metrics = [
            'total_scheduled' => $summaries->count(),
            'present' => $summaries->whereIn('status', [AttendanceStatus::Present, AttendanceStatus::Late])->count(),
            'late' => $summaries->where('status', AttendanceStatus::Late)->count(),
            'leave' => $summaries->where('status', AttendanceStatus::Leave)->count(),
            'sick' => $summaries->where('status', AttendanceStatus::Sick)->count(),
            'absent' => $summaries->where('status', AttendanceStatus::Absent)->count(),
        ];

        $logs = AttendanceLog::with(['employee.branch', 'employee.department'])
            ->whereDate('recorded_at', $today)
            ->when($branchId, fn ($q, $b) => $q->whereHas('employee', fn ($sq) => $sq->where('current_branch_id', $b)))
            ->latest('recorded_at')
            ->paginate(15)
            ->withQueryString();

        $logs->through(fn (AttendanceLog $log) => [
            'id' => $log->id,
            'employee_name' => $log->employee->name,
            'employee_nik' => $log->employee->nik,
            'branch_name' => $log->employee->branch?->name ?? '-',
            'type' => $log->type->value,
            'type_label' => $log->type->label(),
            'recorded_at' => $log->recorded_at->format('H:i:s'),
            'distance_meters' => $log->distance_to_branch_meters,
            'is_within_geofence' => $log->is_within_geofence,
            'verification_status' => $log->verification_status->value,
            'verification_label' => $log->verification_status->label(),
            'selfie_url' => $log->selfie_path ? asset('storage/' . $log->selfie_path) : null,
        ]);

        $branches = Branch::where('is_active', true)->select('id', 'name')->get();

        return Inertia::render('attendance/index', [
            'date' => $today,
            'metrics' => $metrics,
            'logs' => $logs,
            'branches' => $branches,
            'selectedBranchId' => $branchId,
        ]);
    }

    public function roster(Request $request): Response
    {
        $startDate = $request->input('start_date', Carbon::now()->startOfWeek()->toDateString());
        $endDate = $request->input('end_date', Carbon::now()->endOfWeek()->toDateString());
        $departmentId = $request->input('department_id');

        $employees = Employee::with(['branch', 'department'])
            ->where('status', \App\Enums\EmployeeStatus::Active)
            ->when($departmentId, fn ($q, $d) => $q->where('current_department_id', $d))
            ->get();

        $rosters = EmployeeRoster::with('shift')
            ->whereBetween('date', [$startDate, $endDate])
            ->whereIn('employee_id', $employees->pluck('id'))
            ->get();

        $shiftTemplates = ShiftTemplate::where('is_active', true)->get();
        $departments = Department::where('is_active', true)->select('id', 'name')->get();

        return Inertia::render('attendance/roster', [
            'startDate' => $startDate,
            'endDate' => $endDate,
            'employees' => $employees->map(fn ($e) => [
                'id' => $e->id,
                'name' => $e->name,
                'nik' => $e->nik,
                'department' => $e->department?->name,
                'branch' => $e->branch?->name,
            ]),
            'rosters' => $rosters->map(fn ($r) => [
                'id' => $r->id,
                'employee_id' => $r->employee_id,
                'date' => $r->date->toDateString(),
                'shift_name' => $r->shift?->name ?? ($r->is_off_day ? 'OFF' : 'Regular'),
                'shift_code' => $r->shift?->code ?? ($r->is_off_day ? 'OFF' : 'REG'),
                'is_off_day' => $r->is_off_day,
            ]),
            'shifts' => $shiftTemplates,
            'departments' => $departments,
        ]);
    }

    public function storeRoster(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'employee_id' => ['required', 'exists:employees,id'],
            'shift_template_id' => ['nullable', 'exists:shift_templates,id'],
            'date' => ['required', 'date'],
            'is_off_day' => ['boolean'],
            'notes' => ['nullable', 'string', 'max:255'],
        ]);

        EmployeeRoster::updateOrCreate(
            ['employee_id' => $validated['employee_id'], 'date' => $validated['date']],
            [
                'shift_template_id' => $validated['shift_template_id'],
                'is_off_day' => $validated['is_off_day'] ?? false,
                'notes' => $validated['notes'] ?? null,
            ],
        );

        return back()->with('success', 'Jadwal shift berhasil diperbarui.');
    }
}

