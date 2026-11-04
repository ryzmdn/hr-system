<?php

declare(strict_types=1);

namespace App\Enums;

enum Timezone: string
{
    case WesternIndonesiaTime = 'Asia/Jakarta';
    case CentralIndonesiaTime = 'Asia/Makassar';
    case EasternIndonesiaTime = 'Asia/Jayapura';

    public function label(): string
    {
        return match ($this) {
            self::WesternIndonesiaTime => 'WIB (Asia/Jakarta)',
            self::CentralIndonesiaTime => 'WITA (Asia/Makassar)',
            self::EasternIndonesiaTime => 'WIT (Asia/Jayapura)',
        };
    }
}

