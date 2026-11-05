<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Enums\AppraisalStatus;
use App\Enums\PerformancePeriodStatus;
use App\Enums\PerformanceRatingGrade;
use App\Models\Employee;
use App\Models\PerformanceAppraisal;
use App\Models\PerformancePeriod;
use App\Services\PerformanceAppraisalService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PerformanceController extends Controller
{
    public function __construct(
        protected PerformanceAppraisalService $appraisalService,
    ) {}

    public function index(): Response
    {
        $periods = PerformancePeriod::query()
            ->withCount('appraisals')
            ->latest('start_date')
            ->get();

        $appraisals = PerformanceAppraisal::query()
            ->with(['employee.branch', 'employee.department', 'evaluator', 'period', 'items'])
            ->latest()
            ->get();

        $employees = Employee::query()
            ->where('status', 'ACTIVE')
            ->orderBy('name')
            ->get(['id', 'nik', 'name']);

        return Inertia::render('performance/index', [
            'periods' => $periods,
            'appraisals' => $appraisals,
            'employees' => $employees,
            'ratingGrades' => array_map(fn (PerformanceRatingGrade $g) => [
                'value' => $g->value,
                'label' => $g->label(),
            ], PerformanceRatingGrade::cases()),
            'periodStatuses' => array_map(fn (PerformancePeriodStatus $s) => [
                'value' => $s->value,
                'label' => $s->label(),
            ], PerformancePeriodStatus::cases()),
        ]);
    }

    public function storePeriod(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:100'],
            'start_date' => ['required', 'date'],
            'end_date' => ['required', 'date', 'after_or_equal:start_date'],
        ]);

        PerformancePeriod::create([
            'name' => $validated['name'],
            'start_date' => $validated['start_date'],
            'end_date' => $validated['end_date'],
            'status' => PerformancePeriodStatus::Active,
        ]);

        return redirect()->back()->with('success', 'Periode evaluasi kinerja baru berhasil dibuka.');
    }

    public function storeAppraisal(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'performance_period_id' => ['required', 'exists:performance_periods,id'],
            'employee_id' => ['required', 'exists:employees,id'],
            'evaluator_id' => ['nullable', 'exists:employees,id'],
            'kpi_items' => ['required', 'array', 'min:1'],
            'kpi_items.*.kpi_name' => ['required', 'string', 'max:150'],
            'kpi_items.*.target_description' => ['nullable', 'string', 'max:500'],
            'kpi_items.*.weight_percentage' => ['required', 'numeric', 'min:1', 'max:100'],
            'kpi_items.*.target_value' => ['required', 'numeric', 'min:0.01'],
            'kpi_items.*.actual_value' => ['nullable', 'numeric', 'min:0'],
        ]);

        $period = PerformancePeriod::findOrFail($validated['performance_period_id']);
        $employee = Employee::findOrFail($validated['employee_id']);
        $evaluator = ! empty($validated['evaluator_id']) ? Employee::find($validated['evaluator_id']) : null;

        $this->appraisalService->createAppraisal(
            $period,
            $employee,
            $evaluator,
            $validated['kpi_items']
        );

        return redirect()->back()->with('success', 'Target KPI karyawan berhasil ditetapkan.');
    }

    public function evaluate(PerformanceAppraisal $appraisal, Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'items' => ['required', 'array'],
            'items.*' => ['required', 'numeric', 'min:0'],
            'feedback' => ['nullable', 'string', 'max:1000'],
        ]);

        $this->appraisalService->evaluateAppraisal(
            $appraisal,
            $validated['items'],
            $validated['feedback'] ?? null,
            AppraisalStatus::Finalized
        );

        return redirect()->back()->with('success', 'Penilaian kinerja KPI selesai dievaluasi.');
    }
}

