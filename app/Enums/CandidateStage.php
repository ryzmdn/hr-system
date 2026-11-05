<?php

declare(strict_types=1);

namespace App\Enums;

enum CandidateStage: string
{
    case Applied = 'APPLIED';
    case Screening = 'SCREENING';
    case Interview = 'INTERVIEW';
    case TechnicalTest = 'TECHNICAL_TEST';
    case Offering = 'OFFERING';
    case Hired = 'HIRED';
    case Rejected = 'REJECTED';

    public function label(): string
    {
        return match ($this) {
            self::Applied => 'Berkas Diterima (Applied)',
            self::Screening => 'Skrining CV / HR',
            self::Interview => 'Wawancara User',
            self::TechnicalTest => 'Tes Teknis & Kemampuan',
            self::Offering => 'Penawaran Gaji (Offering)',
            self::Hired => 'Diterima Bekerja (Hired)',
            self::Rejected => 'Tidak Lolos (Rejected)',
        };
    }
}

