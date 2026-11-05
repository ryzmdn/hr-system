<?php

declare(strict_types=1);

namespace App\Enums;

enum OffboardingType: string
{
    case Resignation = 'RESIGNATION';
    case EfficiencyLoss = 'EFFICIENCY_LOSS';
    case EfficiencyPreventive = 'EFFICIENCY_PREVENTIVE';
    case ClosureForceMajeure = 'CLOSURE_FORCE_MAJEURE';
    case Bankruptcy = 'BANKRUPTCY';
    case Retirement = 'RETIREMENT';
    case Death = 'DEATH';
    case Violation = 'VIOLATION';
    case EndOfContract = 'END_OF_CONTRACT';

    public function label(): string
    {
        return match ($this) {
            self::Resignation => 'Pengunduran Diri Sukarela (Resign)',
            self::EfficiencyLoss => 'Efisiensi Perusahaan Karena Rugi (PP 35/2021 Ps. 43)',
            self::EfficiencyPreventive => 'Efisiensi Pencegahan Kerugian (PP 35/2021 Ps. 43)',
            self::ClosureForceMajeure => 'Penutupan Karena Force Majeure (PP 35/2021 Ps. 44)',
            self::Bankruptcy => 'Kepailitan Perusahaan (PP 35/2021 Ps. 47)',
            self::Retirement => 'Mencapai Usia Pensiun (PP 35/2021 Ps. 56)',
            self::Death => 'Karyawan Meninggal Dunia (PP 35/2021 Ps. 57)',
            self::Violation => 'Pelanggaran Perjanjian Kerja / SP (PP 35/2021 Ps. 52)',
            self::EndOfContract => 'Berakhirnya Jangka Waktu PKWT (Kompensasi Ps. 61)',
        };
    }

    public function upMultiplier(): float
    {
        return match ($this) {
            self::Resignation => 0.0,
            self::EfficiencyLoss, self::ClosureForceMajeure, self::Bankruptcy, self::Violation => 0.5,
            self::EfficiencyPreventive => 1.0,
            self::Retirement => 1.75,
            self::Death => 2.0,
            self::EndOfContract => 0.0,
        };
    }

    public function upmkMultiplier(): float
    {
        return match ($this) {
            self::Resignation, self::EndOfContract => 0.0,
            default => 1.0,
        };
    }
}

