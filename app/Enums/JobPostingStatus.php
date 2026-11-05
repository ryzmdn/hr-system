<?php

declare(strict_types=1);

namespace App\Enums;

enum JobPostingStatus: string
{
    case Draft = 'DRAFT';
    case Published = 'PUBLISHED';
    case Closed = 'CLOSED';

    public function label(): string
    {
        return match ($this) {
            self::Draft => 'Draft',
            self::Published => 'Dibuka (Published)',
            self::Closed => 'Ditutup (Closed)',
        };
    }
}

