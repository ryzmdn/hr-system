<?php

declare(strict_types=1);

namespace App\Enums;

enum AssetCondition: string
{
    case Good = 'GOOD';
    case Fair = 'FAIR';
    case Damaged = 'DAMAGED';

    public function label(): string
    {
        return match ($this) {
            self::Good => 'Sangat Baik / Mulus',
            self::Fair => 'Cukup Baik (Normal Wear)',
            self::Damaged => 'Rusak / Perlu Perbaikan',
        };
    }
}

