<?php

declare(strict_types=1);

namespace App\Enums;

enum CareerChangeType: string
{
    case Hire = 'HIRE';
    case Promotion = 'PROMOTION';
    case Demotion = 'DEMOTION';
    case Mutation = 'MUTATION';
    case SalaryAdjustment = 'SALARY_ADJUSTMENT';

    public function label(): string
    {
        return match ($this) {
            self::Hire => 'Perekrutan Baru',
            self::Promotion => 'Promosi Jabatan',
            self::Demotion => 'Demosi',
            self::Mutation => 'Mutasi Antar Divisi/Cabang',
            self::SalaryAdjustment => 'Penyesuaian Gaji',
        };
    }
}

