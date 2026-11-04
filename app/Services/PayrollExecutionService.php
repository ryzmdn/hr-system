<?php

declare(strict_types=1);

namespace App\Services;

use App\Enums\EmployeeStatus;
use App\Enums\LoanStatus;
use App\Enums\PayrollPeriodStatus;
use App\Enums\SalaryComponentType;
use App\Enums\TaxCalculationMethod;
use App\Enums\TaxPtkpStatus;
use App\Models\Employee;
use App\Models\LoanInstallment;
use App\Models\OvertimeRequest;
use App\Models\PayrollPeriod;
use App\Models\PayrollRun;
use App\Models\Payslip;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class PayrollExecutionService
{
    public function __construct(
        protected Pph21TerCalculationService $taxService,
        protected BpjsCalculationService $bpjsService,
    ) {}

    public function executeRun(PayrollPeriod $period, ?int $branchId, User $processedBy): PayrollRun
    {
        return DB::transaction(function () use ($period, $branchId, $processedBy): PayrollRun {
            $payrollRun = PayrollRun::firstOrCreate(
                [
                    'payroll_period_id' => $period->id,
                    'branch_id' => $branchId,
                ],
                [
                    'total_gross' => 0,
                    'total_net' => 0,
                    'total_tax' => 0,
                    'total_bpjs_company' => 0,
                    'total_bpjs_employee' => 0,
                    'status' => 'PROCESSING',
                    'processed_by_user_id' => $processedBy->id,
                    'processed_at' => Carbon::now(),
                ]
            );

            $employeesQuery = Employee::query()->where('status', EmployeeStatus::Active);
            if ($branchId !== null) {
                $employeesQuery->where('current_branch_id', $branchId);
            }

            $employees = $employeesQuery->with([
                'branch',
                'salaryComponents.component',
                'loans.installments',
            ])->get();

            $totalGross = 0.0;
            $totalNet = 0.0;
            $totalTax = 0.0;
            $totalBpjsCompany = 0.0;
            $totalBpjsEmployee = 0.0;

            foreach ($employees as $employee) {
                $basicSalary = $employee->getEffectiveSalary(Carbon::parse($period->end_date));

                $approvedOvertimeHours = (float) OvertimeRequest::query()
                    ->where('employee_id', $employee->id)
                    ->where('status', 'approved')
                    ->whereBetween('date', [$period->start_date, $period->end_date])
                    ->sum('calculated_overtime_hours');

                $overtimePay = round($approvedOvertimeHours * ($basicSalary / 173), 2);

                $allowancesList = [];
                $deductionsList = [];
                $totalAllowances = 0.0;
                $totalOtherDeductions = 0.0;

                foreach ($employee->salaryComponents as $employeeComponent) {
                    $component = $employeeComponent->component;
                    if (! $component || ! $component->is_active) {
                        continue;
                    }

                    $amount = (float) $employeeComponent->amount;

                    if ($component->type === SalaryComponentType::Allowance) {
                        $totalAllowances += $amount;
                        $allowancesList[] = [
                            'name' => $component->name,
                            'code' => $component->code,
                            'amount' => $amount,
                            'is_taxable' => $component->is_taxable,
                        ];
                    } elseif ($component->type === SalaryComponentType::Deduction) {
                        $totalOtherDeductions += $amount;
                        $deductionsList[] = [
                            'name' => $component->name,
                            'code' => $component->code,
                            'amount' => $amount,
                        ];
                    }
                }

                $jkkRate = $employee->branch?->jkk_risk_grade?->rate() ?? 0.0024;
                $bpjs = $this->bpjsService->calculate($basicSalary, $jkkRate);

                $taxableGross = $basicSalary + $totalAllowances + $overtimePay + $bpjs['jkk_employer'] + $bpjs['jkm_employer'] + $bpjs['kes_employer'];

                $ptkp = $employee->tax_ptkp_status ?? TaxPtkpStatus::Tk0;
                $taxMethod = TaxCalculationMethod::Gross;
                $taxResult = $this->taxService->calculateTaxAmount($taxableGross, $ptkp, $taxMethod);
                $taxAmount = (float) $taxResult['tax_amount'];

                $loanDeduction = 0.0;
                $activeLoan = $employee->loans->firstWhere('status', LoanStatus::Active);
                $loanInstallment = null;

                if ($activeLoan) {
                    $loanInstallment = $activeLoan->installments
                        ->where('is_paid', false)
                        ->first();

                    if ($loanInstallment) {
                        $loanDeduction = (float) $loanInstallment->amount;
                    }
                }

                $grossIncome = round($basicSalary + $totalAllowances + $overtimePay, 2);
                $employeeBpjsTotal = (float) $bpjs['total_employee'];
                $totalDeductions = round($employeeBpjsTotal + $taxAmount + $loanDeduction + $totalOtherDeductions, 2);
                $takeHomePay = max(0.0, round($grossIncome - $totalDeductions, 2));

                $snapshot = [
                    'basic_salary' => $basicSalary,
                    'allowances' => $allowancesList,
                    'overtime' => [
                        'hours' => $approvedOvertimeHours,
                        'rate_per_hour' => round($basicSalary / 173, 2),
                        'amount' => $overtimePay,
                    ],
                    'bpjs_company' => [
                        'jkk' => $bpjs['jkk_employer'],
                        'jkm' => $bpjs['jkm_employer'],
                        'jht' => $bpjs['jht_employer'],
                        'jp' => $bpjs['jp_employer'],
                        'kes' => $bpjs['kes_employer'],
                        'total' => $bpjs['total_employer'],
                    ],
                    'bpjs_employee' => [
                        'jht' => $bpjs['jht_employee'],
                        'jp' => $bpjs['jp_employee'],
                        'kes' => $bpjs['kes_employee'],
                        'total' => $bpjs['total_employee'],
                    ],
                    'tax_pph21' => [
                        'method' => $taxMethod->value,
                        'ptkp' => $ptkp->value,
                        'ter_category' => $taxResult['category'],
                        'rate' => $taxResult['rate'],
                        'taxable_gross' => $taxableGross,
                        'tax_amount' => $taxAmount,
                    ],
                    'loan' => [
                        'deduction' => $loanDeduction,
                        'installment_id' => $loanInstallment?->id,
                        'loan_id' => $activeLoan?->id,
                    ],
                    'other_deductions' => $deductionsList,
                    'gross_income' => $grossIncome,
                    'total_deductions' => $totalDeductions,
                    'take_home_pay' => $takeHomePay,
                ];

                Payslip::updateOrCreate(
                    [
                        'payroll_run_id' => $payrollRun->id,
                        'employee_id' => $employee->id,
                    ],
                    [
                        'basic_salary' => $basicSalary,
                        'gross_income' => $grossIncome,
                        'total_deductions' => $totalDeductions,
                        'take_home_pay' => $takeHomePay,
                        'overtime_pay' => $overtimePay,
                        'tax_pph21_method' => $taxMethod,
                        'tax_pph21_ter_category' => (string) $taxResult['category'],
                        'tax_pph21_rate' => (float) $taxResult['rate'],
                        'tax_pph21_amount' => $taxAmount,
                        'bpjs_jkk_company' => $bpjs['jkk_employer'],
                        'bpjs_jkm_company' => $bpjs['jkm_employer'],
                        'bpjs_jht_company' => $bpjs['jht_employer'],
                        'bpjs_jht_employee' => $bpjs['jht_employee'],
                        'bpjs_jp_company' => $bpjs['jp_employer'],
                        'bpjs_jp_employee' => $bpjs['jp_employee'],
                        'bpjs_kes_company' => $bpjs['kes_employer'],
                        'bpjs_kes_employee' => $bpjs['kes_employee'],
                        'loan_deduction' => $loanDeduction,
                        'components_snapshot' => $snapshot,
                        'is_published' => false,
                    ]
                );

                if ($loanInstallment && $payrollRun->status === 'COMPLETED') {
                    $loanInstallment->update([
                        'payroll_period_id' => $period->id,
                        'is_paid' => true,
                        'paid_at' => Carbon::now(),
                    ]);

                    $remainingAmount = max(0.0, (float) $activeLoan->remaining_amount - $loanDeduction);
                    $activeLoan->update([
                        'remaining_amount' => $remainingAmount,
                        'status' => $remainingAmount <= 0 ? LoanStatus::Completed : LoanStatus::Active,
                    ]);
                }

                $totalGross += $grossIncome;
                $totalNet += $takeHomePay;
                $totalTax += $taxAmount;
                $totalBpjsCompany += (float) $bpjs['total_employer'];
                $totalBpjsEmployee += (float) $bpjs['total_employee'];
            }

            $payrollRun->update([
                'total_gross' => $totalGross,
                'total_net' => $totalNet,
                'total_tax' => $totalTax,
                'total_bpjs_company' => $totalBpjsCompany,
                'total_bpjs_employee' => $totalBpjsEmployee,
                'status' => 'COMPLETED',
                'processed_by_user_id' => $processedBy->id,
                'processed_at' => Carbon::now(),
            ]);

            $period->update(['status' => PayrollPeriodStatus::Processing]);

            return $payrollRun->fresh(['payslips.employee']);
        });
    }

    public function lockRun(PayrollRun $run): void
    {
        DB::transaction(function () use ($run): void {
            $run->update(['status' => 'LOCKED']);
            $run->payslips()->update(['is_published' => true]);

            foreach ($run->payslips as $payslip) {
                $snapshot = $payslip->components_snapshot;
                if (! empty($snapshot['loan']['installment_id'])) {
                    $installment = LoanInstallment::find($snapshot['loan']['installment_id']);
                    if ($installment && ! $installment->is_paid) {
                        $installment->update([
                            'payroll_period_id' => $run->payroll_period_id,
                            'is_paid' => true,
                            'paid_at' => Carbon::now(),
                        ]);

                        $loan = $installment->loan;
                        if ($loan) {
                            $remaining = max(0.0, (float) $loan->remaining_amount - (float) $installment->amount);
                            $loan->update([
                                'remaining_amount' => $remaining,
                                'status' => $remaining <= 0 ? LoanStatus::Completed : LoanStatus::Active,
                            ]);
                        }
                    }
                }
            }

            $period = $run->period;
            $allLocked = $period->runs()->where('status', '!=', 'LOCKED')->count() === 0;
            if ($allLocked) {
                $period->update(['status' => PayrollPeriodStatus::Locked]);
            }
        });
    }
}
