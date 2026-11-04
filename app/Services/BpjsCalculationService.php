<?php

declare(strict_types=1);

namespace App\Services;

class BpjsCalculationService
{
    public const JP_MAX_SALARY_CAP = 10042300.0;
    public const KES_MAX_SALARY_CAP = 12000000.0;

    public function calculate(float $baseSalary, float $jkkRate = 0.0024): array
    {
        $jkkEmployer = round($baseSalary * $jkkRate, 2);
        $jkmEmployer = round($baseSalary * 0.0030, 2);

        $jhtEmployer = round($baseSalary * 0.037, 2);
        $jhtEmployee = round($baseSalary * 0.020, 2);

        $jpBaseSalary = min($baseSalary, self::JP_MAX_SALARY_CAP);
        $jpEmployer = round($jpBaseSalary * 0.020, 2);
        $jpEmployee = round($jpBaseSalary * 0.010, 2);

        $kesBaseSalary = min($baseSalary, self::KES_MAX_SALARY_CAP);
        $kesEmployer = round($kesBaseSalary * 0.040, 2);
        $kesEmployee = round($kesBaseSalary * 0.010, 2);

        $totalEmployer = round($jkkEmployer + $jkmEmployer + $jhtEmployer + $jpEmployer + $kesEmployer, 2);
        $totalEmployee = round($jhtEmployee + $jpEmployee + $kesEmployee, 2);

        return [
            'base_salary' => $baseSalary,
            'jkk_rate' => $jkkRate,
            'jkk_employer' => $jkkEmployer,
            'jkm_employer' => $jkmEmployer,
            'jht_employer' => $jhtEmployer,
            'jht_employee' => $jhtEmployee,
            'jp_employer' => $jpEmployer,
            'jp_employee' => $jpEmployee,
            'bpjs_ketenagakerjaan_employer' => round($jkkEmployer + $jkmEmployer + $jhtEmployer + $jpEmployer, 2),
            'bpjs_ketenagakerjaan_employee' => round($jhtEmployee + $jpEmployee, 2),
            'bpjs_kesehatan_employer' => $kesEmployer,
            'bpjs_kesehatan_employee' => $kesEmployee,
            'kes_employer' => $kesEmployer,
            'kes_employee' => $kesEmployee,
            'total_employer' => $totalEmployer,
            'total_employee' => $totalEmployee,
        ];
    }
}
