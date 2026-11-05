<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Services\ExecutiveAnalyticsService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Http\Response as HttpResponse;
use Inertia\Inertia;
use Inertia\Response;

class ExecutiveAnalyticsController extends Controller
{
    public function __construct(
        protected ExecutiveAnalyticsService $analyticsService,
    ) {}

    public function index(Request $request): Response
    {
        $year = (int) $request->input('year', Carbon::now()->year);
        $metrics = $this->analyticsService->getExecutiveMetrics($year);

        return Inertia::render('analytics/index', [
            'metrics' => $metrics,
            'selectedYear' => $year,
        ]);
    }

    public function exportWlkp(): HttpResponse
    {
        $csvContent = $this->analyticsService->generateWlkpCsv();
        $filename = 'WLKP_Report_' . Carbon::now()->format('YmdHis') . '.csv';

        return response($csvContent, 200, [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
        ]);
    }
}

