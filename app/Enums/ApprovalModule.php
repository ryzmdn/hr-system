<?php

declare(strict_types=1);

namespace App\Enums;

enum ApprovalModule: string
{
    case Leave = 'LEAVE';
    case Overtime = 'OVERTIME';
    case Reimbursement = 'REIMBURSEMENT';
    case CareerTransition = 'CAREER_TRANSITION';
    case Offboarding = 'OFFBOARDING';

    public function label(): string
    {
        return match ($this) {
            self::Leave => 'Pengajuan Cuti / Izin',
            self::Overtime => 'Surat Perintah Lembur',
            self::Reimbursement => 'Klaim & Biaya',
            self::CareerTransition => 'Promosi & Mutasi',
            self::Offboarding => 'Pengunduran Diri / Exit',
        };
    }
}

