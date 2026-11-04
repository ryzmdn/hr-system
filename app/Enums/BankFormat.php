<?php

declare(strict_types=1);

namespace App\Enums;

enum BankFormat: string
{
    case Bca = 'BCA';
    case Mandiri = 'MANDIRI';
    case Bni = 'BNI';
    case Bri = 'BRI';

    public function label(): string
    {
        return match ($this) {
            self::Bca => 'BCA KlikBCA Bisnis (Payroll Format)',
            self::Mandiri => 'Bank Mandiri (Mandiri Cash Management - MCM)',
            self::Bni => 'BNI Direct (Corporate Payroll)',
            self::Bri => 'BRI Cash Management System (CMS)',
        };
    }
}

