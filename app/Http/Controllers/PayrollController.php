<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Enums\BankFormat;
use App\Enums\PayrollPeriodStatus;
use App\Models\BankDisbursementBatch;
use App\Models\Branch;
use App\Models\PayrollPeriod;
use App\Models\PayrollRun;
use App\Services\BankDisbursementExportService;
use App\Services\PayrollExecutionService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class PayrollController extends Controller
{
    public function __construct(
        protected PayrollExecutionService $payrollService,
        protected BankDisbursementExportService $exportService,
    ) {}

    public function index(Request $request): Response
    {
        $periods = PayrollPeriod::query()
            ->with(['runs.branch', 'runs.payslips.employee'])
            ->orderBy('start_date', 'desc')
            ->get();

        $branches = Branch::query()
            ->where('is_active', true)
            ->get(['id', 'name', 'code']);

        $recentBatches = BankDisbursementBatch::query()
            ->with(['payrollRun.period', 'exportedBy'])
            ->latest()
            ->limit(10)
            ->get();

        return Inertia::render('payroll/index', [
            'periods' => $periods,
            'branches' => $branches,
            'recentBatches' => $recentBatches,
            'bankFormats' => array_map(fn (BankFormat $b) => [
                'value' => $b->value,
                'label' => $b->label(),
            ], BankFormat::cases()),
        ]);
    }

    public function storePeriod(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:100'],
            'start_date' => ['required', 'date'],
            'end_date' => ['required', 'date', 'after_or_equal:start_date'],
            'cut_off_date' => ['required', 'date'],
        ]);

        PayrollPeriod::create([
            'name' => $validated['name'],
            'start_date' => $validated['start_date'],
            'end_date' => $validated['end_date'],
            'cut_off_date' => $validated['cut_off_date'],
            'status' => PayrollPeriodStatus::Draft,
        ]);

        return redirect()->back()->with('success', 'Periode penggajian baru berhasil dibuat.');
    }

    public function processRun(PayrollPeriod $period, Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'branch_id' => ['nullable', 'exists:branches,id'],
        ]);

        $branchId = ! empty($validated['branch_id']) ? (int) $validated['branch_id'] : null;

        $this->payrollService->executeRun($period, $branchId, $request->user());

        return redirect()->back()->with('success', 'Kalkulasi payroll berhasil diproses secara otomatis.');
    }

    public function lockRun(PayrollRun $run): RedirectResponse
    {
        $this->payrollService->lockRun($run);

        return redirect()->back()->with('success', 'Payroll berhasil dikunci dan slip gaji telah diterbitkan untuk karyawan.');
    }

    public function exportBank(PayrollRun $run, Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'bank_name' => ['required', 'string'],
        ]);

        $format = BankFormat::from($validated['bank_name']);
        $result = $this->exportService->generateBatchFile($run, $format, $request->user());

        return redirect()->back()->with('success', 'File disbursement ' . $format->value . ' berhasil digenerate: ' . $result['filename']);
    }

    public function downloadBatch(BankDisbursementBatch $batch): BinaryFileResponse
    {
        $filePath = storage_path('app/' . $batch->file_path);

        return response()->download($filePath, basename($batch->file_path), [
            'Content-Type' => 'text/csv',
        ]);
    }
}

