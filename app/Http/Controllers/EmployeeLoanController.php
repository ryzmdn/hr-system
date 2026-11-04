<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Enums\EmployeeStatus;
use App\Enums\LoanStatus;
use App\Models\Employee;
use App\Models\EmployeeLoan;
use App\Models\LoanInstallment;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class EmployeeLoanController extends Controller
{
    public function index(Request $request): Response
    {
        $loans = EmployeeLoan::query()
            ->with(['employee.branch', 'installments', 'approvedBy'])
            ->latest()
            ->get();

        $employees = Employee::query()
            ->where('status', EmployeeStatus::Active)
            ->orderBy('name')
            ->get(['id', 'nik', 'name']);

        return Inertia::render('loans/index', [
            'loans' => $loans,
            'employees' => $employees,
            'loanStatuses' => array_map(fn (LoanStatus $s) => [
                'value' => $s->value,
                'label' => $s->label(),
            ], LoanStatus::cases()),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'employee_id' => ['required', 'exists:employees,id'],
            'total_amount' => ['required', 'numeric', 'min:100000'],
            'installment_months' => ['required', 'integer', 'min:1', 'max:60'],
            'start_month' => ['required', 'date'],
            'reason' => ['required', 'string', 'max:255'],
        ]);

        $totalAmount = (float) $validated['total_amount'];
        $months = (int) $validated['installment_months'];
        $monthlyAmount = round($totalAmount / $months, 2);
        $loanNumber = 'LN-' . Carbon::now()->format('Ymd') . '-' . strtoupper(substr(uniqid(), -4));

        DB::transaction(function () use ($validated, $totalAmount, $months, $monthlyAmount, $loanNumber, $request): void {
            $loan = EmployeeLoan::create([
                'employee_id' => $validated['employee_id'],
                'loan_number' => $loanNumber,
                'total_amount' => $totalAmount,
                'installment_months' => $months,
                'monthly_amount' => $monthlyAmount,
                'remaining_amount' => $totalAmount,
                'start_month' => $validated['start_month'],
                'reason' => $validated['reason'],
                'status' => LoanStatus::Active,
                'approved_by_user_id' => $request->user()->id,
            ]);

            for ($i = 1; $i <= $months; $i++) {
                LoanInstallment::create([
                    'loan_id' => $loan->id,
                    'installment_number' => $i,
                    'amount' => $monthlyAmount,
                    'is_paid' => false,
                ]);
            }
        });

        return redirect()->back()->with('success', 'Pengajuan kasbon karyawan berhasil disetujui dan jadwal angsuran telah dibuat.');
    }

    public function approve(EmployeeLoan $loan, Request $request): RedirectResponse
    {
        $loan->update([
            'status' => LoanStatus::Active,
            'approved_by_user_id' => $request->user()->id,
        ]);

        return redirect()->back()->with('success', 'Pinjaman telah disetujui.');
    }
}
