<?php

declare(strict_types=1);

namespace App\Enums;

enum AttendanceType: string
{
    case ClockIn = 'CLOCK_IN';
    case ClockOut = 'CLOCK_OUT';

    public function label(): string
    {
        return match ($this) {
            self::ClockIn => 'Masuk Kerja (Clock In)',
            self::ClockOut => 'Pulang Kerja (Clock Out)',
        };
    }
}

