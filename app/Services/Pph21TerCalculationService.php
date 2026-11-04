<?php

declare(strict_types=1);

namespace App\Services;

use App\Enums\TaxCalculationMethod;
use App\Enums\TaxPtkpStatus;

class Pph21TerCalculationService
{
    public function determineTerCategory(TaxPtkpStatus $ptkp): string
    {
        return $ptkp->terCategory();
    }

    public function getTerMonthlyRate(string $category, float $grossIncome): float
    {
        if ($grossIncome <= 5400000) {
            return 0.0;
        }

        return match ($category) {
            'A' => $this->getCategoryARate($grossIncome),
            'B' => $this->getCategoryBRate($grossIncome),
            'C' => $this->getCategoryCRate($grossIncome),
            default => 0.0,
        };
    }

    protected function getCategoryARate(float $gross): float
    {
        return match (true) {
            $gross <= 5400000 => 0.0,
            $gross <= 5650000 => 0.0025,
            $gross <= 5950000 => 0.005,
            $gross <= 6300000 => 0.0075,
            $gross <= 6750000 => 0.01,
            $gross <= 7500000 => 0.0125,
            $gross <= 8550000 => 0.015,
            $gross <= 9650000 => 0.0175,
            $gross <= 10050000 => 0.02,
            $gross <= 10350000 => 0.0225,
            $gross <= 10700000 => 0.025,
            $gross <= 11050000 => 0.03,
            $gross <= 11600000 => 0.035,
            $gross <= 12500000 => 0.04,
            $gross <= 13750000 => 0.05,
            $gross <= 15100000 => 0.06,
            $gross <= 16950000 => 0.07,
            $gross <= 19750000 => 0.08,
            $gross <= 24150000 => 0.09,
            $gross <= 26450000 => 0.10,
            $gross <= 28000000 => 0.11,
            $gross <= 30050000 => 0.12,
            $gross <= 32400000 => 0.13,
            $gross <= 35400000 => 0.14,
            $gross <= 39100000 => 0.15,
            $gross <= 43850000 => 0.16,
            $gross <= 47800000 => 0.17,
            $gross <= 51400000 => 0.18,
            $gross <= 56300000 => 0.19,
            $gross <= 62200000 => 0.20,
            $gross <= 68600000 => 0.21,
            $gross <= 77500000 => 0.22,
            $gross <= 89000000 => 0.23,
            $gross <= 103000000 => 0.24,
            $gross <= 125000000 => 0.25,
            $gross <= 157000000 => 0.26,
            $gross <= 206000000 => 0.27,
            $gross <= 337000000 => 0.28,
            $gross <= 454000000 => 0.29,
            $gross <= 550000000 => 0.30,
            $gross <= 695000000 => 0.31,
            $gross <= 910000000 => 0.32,
            $gross <= 1400000000 => 0.33,
            default => 0.34,
        };
    }

    protected function getCategoryBRate(float $gross): float
    {
        return match (true) {
            $gross <= 6200000 => 0.0,
            $gross <= 6500000 => 0.0025,
            $gross <= 6850000 => 0.005,
            $gross <= 7300000 => 0.0075,
            $gross <= 9200000 => 0.01,
            $gross <= 10750000 => 0.015,
            $gross <= 12550000 => 0.02,
            $gross <= 14050000 => 0.03,
            $gross <= 16300000 => 0.04,
            $gross <= 18050000 => 0.05,
            $gross <= 19900000 => 0.06,
            $gross <= 22350000 => 0.07,
            $gross <= 25350000 => 0.08,
            $gross <= 27950000 => 0.09,
            $gross <= 30850000 => 0.10,
            $gross <= 34350000 => 0.11,
            $gross <= 38500000 => 0.12,
            $gross <= 43350000 => 0.13,
            $gross <= 48850000 => 0.14,
            $gross <= 55100000 => 0.15,
            $gross <= 62150000 => 0.16,
            $gross <= 70050000 => 0.17,
            $gross <= 78900000 => 0.18,
            $gross <= 88750000 => 0.19,
            $gross <= 99650000 => 0.20,
            $gross <= 111650000 => 0.21,
            $gross <= 124800000 => 0.22,
            $gross <= 139150000 => 0.23,
            $gross <= 154750000 => 0.24,
            $gross <= 171650000 => 0.25,
            $gross <= 211900000 => 0.26,
            default => 0.27,
        };
    }

    protected function getCategoryCRate(float $gross): float
    {
        return match (true) {
            $gross <= 6600000 => 0.0,
            $gross <= 6950000 => 0.0025,
            $gross <= 7350000 => 0.005,
            $gross <= 7800000 => 0.0075,
            $gross <= 8850000 => 0.01,
            $gross <= 10750000 => 0.015,
            $gross <= 12500000 => 0.02,
            $gross <= 14000000 => 0.03,
            $gross <= 16300000 => 0.04,
            $gross <= 18050000 => 0.05,
            $gross <= 19900000 => 0.06,
            $gross <= 22350000 => 0.07,
            $gross <= 25350000 => 0.08,
            $gross <= 27950000 => 0.09,
            $gross <= 30850000 => 0.10,
            $gross <= 34350000 => 0.11,
            $gross <= 38500000 => 0.12,
            $gross <= 43350000 => 0.13,
            $gross <= 48850000 => 0.14,
            $gross <= 55100000 => 0.15,
            default => 0.16,
        };
    }

    public function calculateTaxAmount(
        float $grossIncome,
        TaxPtkpStatus $ptkp,
        TaxCalculationMethod $method = TaxCalculationMethod::Gross,
    ): array {
        $category = $this->determineTerCategory($ptkp);
        $rate = $this->getTerMonthlyRate($category, $grossIncome);

        $taxAmount = 0.0;

        if ($method === TaxCalculationMethod::Gross || $method === TaxCalculationMethod::Netto) {
            $taxAmount = round($grossIncome * $rate, 2);
        } elseif ($method === TaxCalculationMethod::GrossUp) {
            if ($rate < 1.0) {
                $grossUpIncome = $grossIncome / (1.0 - $rate);
                $adjustedRate = $this->getTerMonthlyRate($category, $grossUpIncome);
                $taxAmount = round($grossUpIncome * $adjustedRate, 2);
            }
        }

        return [
            'category' => $category,
            'rate' => $rate,
            'tax_amount' => $taxAmount,
        ];
    }
}

