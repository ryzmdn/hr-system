<?php

declare(strict_types=1);

namespace App\Services;

use App\Enums\OffboardingType;
use Carbon\Carbon;

class SeveranceCalculationService
{
    public function calculateServiceDuration(Carbon $joinDate, Carbon $effectiveDate): array
    {
        $diff = $joinDate->diff($effectiveDate);
        $totalMonths = ($diff->y * 12) + $diff->m;
        $totalYears = round($totalMonths / 12, 2);

        return [
            'years' => $diff->y,
            'months' => $diff->m,
            'days' => $diff->d,
            'total_months' => $totalMonths,
            'total_years' => $totalYears,
        ];
    }

    public function getBaseUpMultiplier(int $years): float
    {
        return match (true) {
            $years < 1 => 1.0,
            $years < 2 => 2.0,
            $years < 3 => 3.0,
            $years < 4 => 4.0,
            $years < 5 => 5.0,
            $years < 6 => 6.0,
            $years < 7 => 7.0,
            $years < 8 => 8.0,
            default => 9.0,
        };
    }

    public function getBaseUpmkMultiplier(int $years): float
    {
        return match (true) {
            $years < 3 => 0.0,
            $years < 6 => 2.0,
            $years < 9 => 3.0,
            $years < 12 => 4.0,
            $years < 15 => 5.0,
            $years < 18 => 6.0,
            $years < 21 => 7.0,
            $years < 24 => 8.0,
            default => 10.0,
        };
    }

    public function calculateSeveranceTax(float $grossSeverance): float
    {
        if ($grossSeverance <= 50000000.0) {
            return 0.0;
        }

        $tax = 0.0;
        $remaining = $grossSeverance;

        $tier1 = min($remaining, 50000000.0);
        $remaining -= $tier1;

        if ($remaining > 0) {
            $tier2 = min($remaining, 50000000.0);
            $tax += $tier2 * 0.05;
            $remaining -= $tier2;
        }

        if ($remaining > 0) {
            $tier3 = min($remaining, 400000000.0);
            $tax += $tier3 * 0.15;
            $remaining -= $tier3;
        }

        if ($remaining > 0) {
            $tax += $remaining * 0.25;
        }

        return round($tax, 2);
    }

    public function calculate(
        float $baseSalary,
        Carbon $joinDate,
        Carbon $effectiveDate,
        OffboardingType $type,
        float $uphAmount = 0.0,
    ): array {
        $duration = $this->calculateServiceDuration($joinDate, $effectiveDate);
        $years = $duration['years'];
        $totalMonths = $duration['total_months'];

        $upMultiplier = 0.0;
        $upAmount = 0.0;
        $upmkMultiplier = 0.0;
        $upmkAmount = 0.0;
        $pkwtCompensation = 0.0;

        if ($type === OffboardingType::EndOfContract) {
            $pkwtCompensation = round(($totalMonths / 12) * $baseSalary, 2);
        } else {
            $baseUp = $this->getBaseUpMultiplier($years);
            $baseUpmk = $this->getBaseUpmkMultiplier($years);

            $upMultiplier = round($baseUp * $type->upMultiplier(), 2);
            $upAmount = round($upMultiplier * $baseSalary, 2);

            $upmkMultiplier = round($baseUpmk * $type->upmkMultiplier(), 2);
            $upmkAmount = round($upmkMultiplier * $baseSalary, 2);
        }

        $totalGross = round($upAmount + $upmkAmount + $uphAmount + $pkwtCompensation, 2);
        $tax = $this->calculateSeveranceTax($totalGross);
        $netSeverance = max(0.0, round($totalGross - $tax, 2));

        return [
            'base_salary' => $baseSalary,
            'duration' => $duration,
            'service_years' => $duration['total_years'],
            'service_months' => $totalMonths,
            'up_multiplier' => $upMultiplier,
            'up_amount' => $upAmount,
            'upmk_multiplier' => $upmkMultiplier,
            'upmk_amount' => $upmkAmount,
            'uph_amount' => $uphAmount,
            'pkwt_compensation_amount' => $pkwtCompensation,
            'total_gross_severance' => $totalGross,
            'tax_pph21_severance' => $tax,
            'net_severance' => $netSeverance,
        ];
    }
}

