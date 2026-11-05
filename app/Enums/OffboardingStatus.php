<?php

declare(strict_types=1);

namespace App\Enums;

enum OffboardingStatus: string
{
    case Submitted = 'SUBMITTED';
    case InReview = 'IN_REVIEW';
    case Clearance = 'CLEARANCE';
    case Approved = 'APPROVED';
    case Completed = 'COMPLETED';
    case Rejected = 'REJECTED';

    public function label(): string
    {
        return match ($this) {
            self::Submitted => 'Diajukan',
            self::InReview => 'Ditinjau HR & Manajemen',
            self::Clearance => 'Proses Exit Clearance Antar Divisi',
            self::Approved => 'Disetujui',
            self::Completed => 'Selesai & Paklaring Terbit',
            self::Rejected => 'Dibatalkan / Ditolak',
        };
    }
}

