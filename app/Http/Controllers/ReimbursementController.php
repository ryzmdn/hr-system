<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Enums\ReimbursementStatus;
use App\Models\Employee;
use App\Models\EmployeeReimbursementBalance;
use App\Models\ReimbursementRequest;
use App\Models\ReimbursementType;
use App\Services\ReimbursementService;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ReimbursementController extends Controller
{
    public function __construct(
        protected ReimbursementService $reimbursementService,
    ) {}

    public function index(Request $request): Response
    {
        $year = (int) $request->input('year', Carbon::now()->year);

        $requests = ReimbursementRequest::query()
            ->with(['employee.branch', 'type', 'approvedBy'])
            ->latest()
            ->get();

        $types = ReimbursementType::query()
            ->where('is_active', true)
            ->withCount('requests')
            ->get();

        $currentUserEmployee = $request->user()->employee;
        $balances = [];

        if ($currentUserEmployee) {
            foreach ($types as $type) {
                $balances[] = $this->reimbursementService->ensureBalance($currentUserEmployee, $type, $year);
            }
        }

        $employees = Employee::query()
            ->where('status', 'ACTIVE')
            ->orderBy('name')
            ->get(['id', 'nik', 'name']);

        return Inertia::render('claims/index', [
            'requests' => $requests,
            'types' => $types,
            'balances' => $balances,
            'employees' => $employees,
            'currentEmployee' => $currentUserEmployee,
            'statuses' => array_map(fn (ReimbursementStatus $s) => [
                'value' => $s->value,
                'label' => $s->label(),
            ], ReimbursementStatus::cases()),
            'selectedYear' => $year,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'employee_id' => ['nullable', 'exists:employees,id'],
            'reimbursement_type_id' => ['required', 'exists:reimbursement_types,id'],
            'receipt_date' => ['required', 'date'],
            'amount' => ['required', 'numeric', 'min:1000'],
            'description' => ['required', 'string', 'max:500'],
            'receipt_file' => ['nullable', 'file', 'mimes:jpg,jpeg,png,pdf', 'max:5120'],
        ]);

        $employee = null;
        if (! empty($validated['employee_id'])) {
            $employee = Employee::findOrFail($validated['employee_id']);
        } else {
            $employee = $request->user()->employee;
        }

        if (! $employee) {
            return redirect()->back()->withErrors(['employee_id' => 'Data karyawan tidak ditemukan.']);
        }

        $this->reimbursementService->submitClaim(
            $employee,
            (int) $validated['reimbursement_type_id'],
            $validated['receipt_date'],
            (float) $validated['amount'],
            $validated['description'],
            $request->file('receipt_file')
        );

        return redirect()->back()->with('success', 'Pengajuan klaim reimbursement berhasil dikirimkan.');
    }

    public function approve(ReimbursementRequest $reimbursement, Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'approved_amount' => ['required', 'numeric', 'min:0'],
        ]);

        $this->reimbursementService->approveClaim(
            $reimbursement,
            (float) $validated['approved_amount'],
            $request->user()
        );

        return redirect()->back()->with('success', 'Klaim reimbursement berhasil disetujui.');
    }

    public function markPaid(ReimbursementRequest $reimbursement): RedirectResponse
    {
        $this->reimbursementService->markAsPaid($reimbursement);

        return redirect()->back()->with('success', 'Klaim reimbursement ditandai telah dibayarkan (disbursed).');
    }

    public function storeType(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'code' => ['required', 'string', 'max:50', 'unique:reimbursement_types,code'],
            'name' => ['required', 'string', 'max:150'],
            'annual_limit' => ['required', 'numeric', 'min:0'],
            'requires_receipt' => ['boolean'],
        ]);

        ReimbursementType::create([
            'code' => strtoupper($validated['code']),
            'name' => $validated['name'],
            'annual_limit' => (float) $validated['annual_limit'],
            'requires_receipt' => (bool) ($validated['requires_receipt'] ?? true),
            'is_active' => true,
        ]);

        return redirect()->back()->with('success', 'Kategori klaim reimbursement baru berhasil dibuat.');
    }
}

