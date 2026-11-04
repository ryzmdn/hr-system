<?php

declare(strict_types=1);

namespace App\Enums;

enum TaxCalculationMethod: string
{
    case Gross = 'GROSS';
    case GrossUp = 'GROSS_UP';
    case Netto = 'NETTO';

    public function label(): string
    {
        return match ($this) {
            self::Gross => 'Gross (Pajak Dipotong dari Gaji Karyawan)',
            self::GrossUp => 'Gross-Up (Perusahaan Memberikan Tunjangan Pajak)',
            self::Netto => 'Netto (Pajak Ditanggung Penuh oleh Perusahaan)',
        };
    }
}

