<?php

declare(strict_types=1);

namespace App\Enums;

enum PayrollPeriodStatus: string
{
    case Draft = 'DRAFT';
    case Processing = 'PROCESSING';
    case Locked = 'LOCKED';
    case Disbursed = 'DISBURSED';

    public function label(): string
    {
        return match ($this) {
            self::Draft => 'Draft / Persiapan',
            self::Processing => 'Sedang Diproses',
            self::Locked => 'Terkunci (Final)',
            self::Disbursed => 'Telah Ditransfer (Disbursed)',
        };
    }
}

