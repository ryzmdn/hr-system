<?php

declare(strict_types=1);

namespace App\Enums;

enum VerificationStatus: string
{
    case Valid = 'VALID';
    case Suspicious = 'SUSPICIOUS';
    case ManualApproved = 'MANUAL_APPROVED';

    public function label(): string
    {
        return match ($this) {
            self::Valid => 'Terverifikasi Valid',
            self::Suspicious => 'Mencurigakan / Luar Radius',
            self::ManualApproved => 'Disetujui Manual HR',
        };
    }
}

