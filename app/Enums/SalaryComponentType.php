<?php

declare(strict_types=1);

namespace App\Enums;

enum SalaryComponentType: string
{
    case Allowance = 'ALLOWANCE';
    case Deduction = 'DEDUCTION';
    case Benefit = 'BENEFIT';

    public function label(): string
    {
        return match ($this) {
            self::Allowance => 'Tunjangan (Pendapatan)',
            self::Deduction => 'Potongan Gaji',
            self::Benefit => 'Benefit Perusahaan (Non-Tunai)',
        };
    }
}

