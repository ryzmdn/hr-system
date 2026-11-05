<?php

declare(strict_types=1);

namespace App\Enums;

enum ClearanceDepartment: string
{
    case It = 'IT';
    case Hr = 'HR';
    case Finance = 'FINANCE';
    case Supervisor = 'SUPERVISOR';

    public function label(): string
    {
        return match ($this) {
            self::It => 'Divisi Teknologi Informasi (IT & Akses)',
            self::Hr => 'Divisi Human Resource (Aset & ID Card)',
            self::Finance => 'Divisi Keuangan (Kasbon & Petty Cash)',
            self::Supervisor => 'Atasan Langsung (Serah Terima Tugas/Handover)',
        };
    }
}

