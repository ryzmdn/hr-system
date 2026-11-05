<?php

declare(strict_types=1);

namespace App\Enums;

enum PerformancePeriodStatus: string
{
    case Draft = 'DRAFT';
    case Active = 'ACTIVE';
    case Evaluation = 'EVALUATION';
    case Closed = 'CLOSED';

    public function label(): string
    {
        return match ($this) {
            self::Draft => 'Draft Persiapan',
            self::Active => 'Target Berjalan (Active)',
            self::Evaluation => 'Masa Penilaian Evaluator',
            self::Closed => 'Selesai & Dikunci (Closed)',
        };
    }
}

