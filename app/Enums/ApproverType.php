<?php

declare(strict_types=1);

namespace App\Enums;

enum ApproverType: string
{
    case DirectManager = 'DIRECT_MANAGER';
    case DepartmentHead = 'HOD';
    case Role = 'ROLE';
    case SpecificUser = 'SPECIFIC_USER';

    public function label(): string
    {
        return match ($this) {
            self::DirectManager => 'Atasan Langsung (Direct Manager)',
            self::DepartmentHead => 'Kepala Departemen (HOD)',
            self::Role => 'Role Tertentu',
            self::SpecificUser => 'Karyawan Spesifik',
        };
    }
}

