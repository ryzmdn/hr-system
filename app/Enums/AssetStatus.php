<?php

declare(strict_types=1);

namespace App\Enums;

enum AssetStatus: string
{
    case Assigned = 'ASSIGNED';
    case Returned = 'RETURNED';
    case Damaged = 'DAMAGED';
    case Lost = 'LOST';

    public function label(): string
    {
        return match ($this) {
            self::Assigned => 'Sedang Dipinjamkan',
            self::Returned => 'Telah Dikembalikan',
            self::Damaged => 'Rusak',
            self::Lost => 'Hilang',
        };
    }
}

