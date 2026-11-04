<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\TaxCalculationMethod;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Payslip extends Model
{
    use HasFactory;

    protected $fillable = [
        'payroll_run_id',
        'employee_id',
        'basic_salary',
        'gross_income',
        'total_deductions',
        'take_home_pay',
        'overtime_pay',
        'tax_pph21_method',
        'tax_pph21_ter_category',
        'tax_pph21_rate',
        'tax_pph21_amount',
        'bpjs_jkk_company',
        'bpjs_jkm_company',
        'bpjs_jht_company',
        'bpjs_jht_employee',
        'bpjs_jp_company',
        'bpjs_jp_employee',
        'bpjs_kes_company',
        'bpjs_kes_employee',
        'loan_deduction',
        'components_snapshot',
        'is_published',
        'downloaded_at',
    ];

    protected function casts(): array
    {
        return [
            'basic_salary' => 'float',
            'gross_income' => 'float',
            'total_deductions' => 'float',
            'take_home_pay' => 'float',
            'overtime_pay' => 'float',
            'tax_pph21_method' => TaxCalculationMethod::class,
            'tax_pph21_rate' => 'float',
            'tax_pph21_amount' => 'float',
            'bpjs_jkk_company' => 'float',
            'bpjs_jkm_company' => 'float',
            'bpjs_jht_company' => 'float',
            'bpjs_jht_employee' => 'float',
            'bpjs_jp_company' => 'float',
            'bpjs_jp_employee' => 'float',
            'bpjs_kes_company' => 'float',
            'bpjs_kes_employee' => 'float',
            'loan_deduction' => 'float',
            'components_snapshot' => 'array',
            'is_published' => 'boolean',
            'downloaded_at' => 'datetime',
        ];
    }

    public function run(): BelongsTo
    {
        return $this->belongsTo(PayrollRun::class, 'payroll_run_id');
    }

    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class);
    }
}

