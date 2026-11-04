<?php

declare(strict_types=1);

namespace App\Enums;

enum EmployeeStatus: string
{
    case Active = 'ACTIVE';
    case Suspended = 'SUSPENDED';
    case Resigned = 'RESIGNED';
    case Terminated = 'TERMINATED';

    public function label(): string
    {
        return match ($this) {
            self::Active => 'Aktif',
            self::Suspended => 'Suspended (Dirumahkan/Skorsing)',
            self::Resigned => 'Resigned (Mengundurkan Diri)',
            self::Terminated => 'Terminated (PHK)',
        };
    }
}

