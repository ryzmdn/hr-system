<?php

declare(strict_types=1);

namespace App\Enums;

enum JkkRiskGrade: string
{
    case Group1 = '1';
    case Group2 = '2';
    case Group3 = '3';
    case Group4 = '4';
    case Group5 = '5';

    public function rate(): float
    {
        return match ($this) {
            self::Group1 => 0.0024,
            self::Group2 => 0.0054,
            self::Group3 => 0.0089,
            self::Group4 => 0.0127,
            self::Group5 => 0.0174,
        };
    }

    public function label(): string
    {
        return match ($this) {
            self::Group1 => 'Tingkat I - Risiko Sangat Rendah (0.24%)',
            self::Group2 => 'Tingkat II - Risiko Rendah (0.54%)',
            self::Group3 => 'Tingkat III - Risiko Sedang (0.89%)',
            self::Group4 => 'Tingkat IV - Risiko Tinggi (1.27%)',
            self::Group5 => 'Tingkat V - Risiko Sangat Tinggi (1.74%)',
        };
    }
}

