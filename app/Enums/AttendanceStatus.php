<?php

declare(strict_types=1);

namespace App\Enums;

enum AttendanceStatus: string
{
    case Present = 'PRESENT';
    case Late = 'LATE';
    case Absent = 'ABSENT';
    case Leave = 'LEAVE';
    case Permit = 'PERMIT';
    case Sick = 'SICK';
    case Off = 'OFF';

    public function label(): string
    {
        return match ($this) {
            self::Present => 'Hadir Tepat Waktu',
            self::Late => 'Terlambat Masuk',
            self::Absent => 'Alpa / Tanpa Keterangan',
            self::Leave => 'Cuti Tahunan / Khusus',
            self::Permit => 'Izin Dinas / Pribadi',
            self::Sick => 'Izin Sakit',
            self::Off => 'Hari Libur / Off',
        };
    }
}

