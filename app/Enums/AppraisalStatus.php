<?php

declare(strict_types=1);

namespace App\Enums;

enum AppraisalStatus: string
{
    case Draft = 'DRAFT';
    case Submitted = 'SUBMITTED';
    case Finalized = 'FINALIZED';

    public function label(): string
    {
        return match ($this) {
            self::Draft => 'Draft Karyawan',
            self::Submitted => 'Diserahkan ke Evaluator',
            self::Finalized => 'Final / Selesai Dinilai',
        };
    }
}

