<?php

declare(strict_types=1);

namespace App\Enums;

enum ApprovalStatus: string
{
    case Pending = 'PENDING';
    case Approved = 'APPROVED';
    case Rejected = 'REJECTED';
    case Escalated = 'ESCALATED';
    case Cancelled = 'CANCELLED';

    public function label(): string
    {
        return match ($this) {
            self::Pending => 'Menunggu Persetujuan',
            self::Approved => 'Disetujui',
            self::Rejected => 'Ditolak',
            self::Escalated => 'Dieskalasi ke Atasan',
            self::Cancelled => 'Dibatalkan',
        };
    }
}

