<?php

declare(strict_types=1);

namespace App\Enums;

enum EmploymentStatus: string
{
    case Probation = 'PROBATION';
    case Pkwt = 'PKWT';
    case Pkwtt = 'PKWTT';
    case Freelance = 'FREELANCE';
    case Internship = 'INTERNSHIP';

    public function label(): string
    {
        return match ($this) {
            self::Probation => 'Probation (Masa Percobaan)',
            self::Pkwt => 'PKWT (Kontrak)',
            self::Pkwtt => 'PKWTT (Tetap)',
            self::Freelance => 'Freelance / Harian',
            self::Internship => 'Magang / Internship',
        };
    }
}

