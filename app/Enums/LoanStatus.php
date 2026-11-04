<?php

declare(strict_types=1);

namespace App\Enums;

enum LoanStatus: string
{
    case Pending = 'PENDING';
    case Active = 'ACTIVE';
    case PaidOff = 'PAID_OFF';
    case Rejected = 'REJECTED';

    public function label(): string
    {
        return match ($this) {
            self::Pending => 'Menunggu Persetujuan',
            self::Active => 'Aktif (Sedang Dicicil)',
            self::PaidOff => 'Lunas (Paid Off)',
            self::Rejected => 'Ditolak',
        };
    }
}

