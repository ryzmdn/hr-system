<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Enums\SalaryComponentType;
use App\Models\Employee;
use App\Models\EmployeeLoan;
use App\Models\EmployeeSalaryComponent;
use App\Models\LoanInstallment;
use App\Models\PayrollPeriod;
use App\Models\SalaryComponent;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class PayrollSeeder extends Seeder
{
    public function run(): void
    {
        $compBasic = SalaryComponent::firstOrCreate(
            ['code' => 'BASIC'],
            [
                'name' => 'Gaji Pokok',
                'type' => SalaryComponentType::Allowance->value,
                'is_taxable' => true,
                'is_bpjs_tk_base' => true,
                'is_bpjs_kes_base' => true,
                'default_amount' => 0.0,
                'is_active' => true,
            ]
        );

        $compJab = SalaryComponent::firstOrCreate(
            ['code' => 'TUNJ_JAB'],
            [
                'name' => 'Tunjangan Jabatan',
                'type' => SalaryComponentType::Allowance->value,
                'is_taxable' => true,
                'is_bpjs_tk_base' => true,
                'is_bpjs_kes_base' => true,
                'default_amount' => 0.0,
                'is_active' => true,
            ]
        );

        $compTrans = SalaryComponent::firstOrCreate(
            ['code' => 'TUNJ_TRANS'],
            [
                'name' => 'Tunjangan Transportasi',
                'type' => SalaryComponentType::Allowance->value,
                'is_taxable' => true,
                'is_bpjs_tk_base' => false,
                'is_bpjs_kes_base' => false,
                'default_amount' => 1500000.0,
                'is_active' => true,
            ]
        );

        $compMakan = SalaryComponent::firstOrCreate(
            ['code' => 'TUNJ_MAKAN'],
            [
                'name' => 'Tunjangan Uang Makan',
                'type' => SalaryComponentType::Allowance->value,
                'is_taxable' => true,
                'is_bpjs_tk_base' => false,
                'is_bpjs_kes_base' => false,
                'default_amount' => 1200000.0,
                'is_active' => true,
            ]
        );

        $compKom = SalaryComponent::firstOrCreate(
            ['code' => 'TUNJ_KOM'],
            [
                'name' => 'Tunjangan Komunikasi & Internet',
                'type' => SalaryComponentType::Allowance->value,
                'is_taxable' => true,
                'is_bpjs_tk_base' => false,
                'is_bpjs_kes_base' => false,
                'default_amount' => 500000.0,
                'is_active' => true,
            ]
        );

        $compKasbon = SalaryComponent::firstOrCreate(
            ['code' => 'POT_KASBON'],
            [
                'name' => 'Pemotongan Angsuran Pinjaman',
                'type' => SalaryComponentType::Deduction->value,
                'is_taxable' => false,
                'is_bpjs_tk_base' => false,
                'is_bpjs_kes_base' => false,
                'default_amount' => 0.0,
                'is_active' => true,
            ]
        );

        $budi = Employee::where('nik', 'EMP202302005')->first();
        $siti = Employee::where('nik', 'EMP202403006')->first();
        $dian = Employee::where('nik', 'EMP202201004')->first();

        if ($budi) {
            EmployeeSalaryComponent::firstOrCreate(
                ['employee_id' => $budi->id, 'salary_component_id' => $compJab->id],
                ['amount' => 3000000.0]
            );
            EmployeeSalaryComponent::firstOrCreate(
                ['employee_id' => $budi->id, 'salary_component_id' => $compTrans->id],
                ['amount' => 1500000.0]
            );
            EmployeeSalaryComponent::firstOrCreate(
                ['employee_id' => $budi->id, 'salary_component_id' => $compKom->id],
                ['amount' => 500000.0]
            );
        }

        if ($siti) {
            EmployeeSalaryComponent::firstOrCreate(
                ['employee_id' => $siti->id, 'salary_component_id' => $compTrans->id],
                ['amount' => 1200000.0]
            );
            EmployeeSalaryComponent::firstOrCreate(
                ['employee_id' => $siti->id, 'salary_component_id' => $compMakan->id],
                ['amount' => 1000000.0]
            );
        }

        if ($dian) {
            EmployeeSalaryComponent::firstOrCreate(
                ['employee_id' => $dian->id, 'salary_component_id' => $compJab->id],
                ['amount' => 5000000.0]
            );
            EmployeeSalaryComponent::firstOrCreate(
                ['employee_id' => $dian->id, 'salary_component_id' => $compTrans->id],
                ['amount' => 2000000.0]
            );
        }

        $now = Carbon::now();
        $prevMonth = $now->copy()->subMonth();

        $prevPeriod = PayrollPeriod::firstOrCreate(
            ['name' => 'Payroll ' . $prevMonth->translatedFormat('F Y')],
            [
                'start_date' => $prevMonth->copy()->startOfMonth()->toDateString(),
                'end_date' => $prevMonth->copy()->endOfMonth()->toDateString(),
                'cut_off_date' => $prevMonth->copy()->day(25)->toDateString(),
                'status' => 'LOCKED',
            ]
        );

        $currentPeriod = PayrollPeriod::firstOrCreate(
            ['name' => 'Payroll ' . $now->translatedFormat('F Y')],
            [
                'start_date' => $now->copy()->startOfMonth()->toDateString(),
                'end_date' => $now->copy()->endOfMonth()->toDateString(),
                'cut_off_date' => $now->copy()->day(25)->toDateString(),
                'status' => 'DRAFT',
            ]
        );

        $financeUser = User::where('email', 'finance.manager@enterprise.co.id')->first();

        if ($budi) {
            $loan = EmployeeLoan::firstOrCreate(
                ['loan_number' => 'LOAN-2026-001'],
                [
                    'employee_id' => $budi->id,
                    'total_amount' => 6000000.0,
                    'installment_months' => 6,
                    'monthly_amount' => 1000000.0,
                    'remaining_amount' => 4000000.0,
                    'start_month' => $now->copy()->subMonths(2)->startOfMonth()->toDateString(),
                    'reason' => 'Pinjaman lunak biaya renovasi rumah tinggal',
                    'status' => 'ACTIVE',
                    'approved_by_user_id' => $financeUser?->id,
                ]
            );

            for ($i = 1; $i <= 6; $i++) {
                $isPaid = $i <= 2;
                LoanInstallment::firstOrCreate(
                    ['loan_id' => $loan->id, 'installment_number' => $i],
                    [
                        'payroll_period_id' => $isPaid ? $prevPeriod->id : null,
                        'amount' => 1000000.0,
                        'is_paid' => $isPaid,
                        'paid_at' => $isPaid ? $prevMonth->copy()->day(28)->toDateTimeString() : null,
                    ]
                );
            }
        }
    }
}
