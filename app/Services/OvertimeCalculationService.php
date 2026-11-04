<?php

declare(strict_types=1);

namespace App\Services;

class OvertimeCalculationService
{
    public function calculateOvertimeEquivalentHours(float $hours, bool $isHoliday): float
    {
        if ($hours <= 0) {
            return 0.0;
        }

        $equivalentHours = 0.0;

        if (! $isHoliday) {
            if ($hours <= 1.0) {
                $equivalentHours = $hours * 1.5;
            } else {
                $equivalentHours = 1.5 + (($hours - 1.0) * 2.0);
            }
        } else {
            if ($hours <= 7.0) {
                $equivalentHours = $hours * 2.0;
            } elseif ($hours <= 8.0) {
                $equivalentHours = (7.0 * 2.0) + (($hours - 7.0) * 3.0);
            } else {
                $remaining = min($hours, 10.0) - 8.0;
                $equivalentHours = (7.0 * 2.0) + (1.0 * 3.0) + ($remaining * 4.0);
            }
        }

        return round($equivalentHours, 2);
    }

    public function calculateOvertimePay(float $baseSalary, float $equivalentHours): float
    {
        $hourlyRate = $baseSalary / 173.0;

        return round($hourlyRate * $equivalentHours, 2);
    }
}

