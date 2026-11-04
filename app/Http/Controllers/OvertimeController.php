<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\Employee;
use App\Models\OvertimeRequest;
use App\Services\OvertimeCalculationService;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class OvertimeController extends Controller
{
    public function __construct(
        protected OvertimeCalculationService $overtimeService,
    ) {}

    public function index(Request $request): Response
    {
        $user = $request->user();
        $employee = $user->employee;

        $query = OvertimeRequest::with(['employee.department', 'employee.branch'])
            ->latest('date');

        if (! $user->hasPermission('attendance.manage') && $employee) {
            $query->where('employee_id', $employee->id);
        }

        $overtimes = $query->paginate(15)->withQueryString();

        $overtimes->through(function (OvertimeRequest $ot) {
            $salary = $ot->employee->getEffectiveSalary();
            $estimatedPay = $this->overtimeService->calculateOvertimePay($salary, (float) $ot->calculated_overtime_hours);

            return [
                'id' => $ot->id,
                'employee_name' => $ot->employee->name,
                'employee_nik' => $ot->employee->nik,
                'branch_name' => $ot->employee->branch?->name ?? '-',
                'date' => $ot->date->toDateString(),
                'start_time' => $ot->start_time,
                'end_time' => $ot->end_time,
                'is_holiday' => $ot->is_holiday,
                'duration_hours' => $ot->duration_hours,
                'calculated_overtime_hours' => $ot->calculated_overtime_hours,
                'estimated_pay' => $estimatedPay,
                'reason' => $ot->reason,
                'status' => $ot->status,
            ];
        });

        return Inertia::render('overtime/index', [
            'overtimes' => $overtimes,
            'isManagerOrAdmin' => $user->hasPermission('attendance.manage'),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'date' => ['required', 'date'],
            'start_time' => ['required'],
            'end_time' => ['required'],
            'is_holiday' => ['boolean'],
            'reason' => ['required', 'string', 'max:1000'],
        ]);

        $employee = $request->user()->employee;
        if (! $employee) {
            abort(403);
        }

        $start = Carbon::parse("{$validated['date']} {$validated['start_time']}");
        $end = Carbon::parse("{$validated['date']} {$validated['end_time']}");
        if ($end->lessThan($start)) {
            $end->addDay();
        }

        $durationHours = round($start->diffInMinutes($end) / 60.0, 2);
        $isHoliday = (bool) ($validated['is_holiday'] ?? false);
        $calculatedHours = $this->overtimeService->calculateOvertimeEquivalentHours($durationHours, $isHoliday);

        OvertimeRequest::create([
            'employee_id' => $employee->id,
            'date' => $validated['date'],
            'start_time' => $validated['start_time'],
            'end_time' => $validated['end_time'],
            'is_holiday' => $isHoliday,
            'duration_hours' => $durationHours,
            'reason' => $validated['reason'],
            'status' => 'PENDING',
            'calculated_overtime_hours' => $calculatedHours,
        ]);

        return back()->with('success', 'Surat Perintah Lembur (SPL) berhasil diajukan.');
    }
}

