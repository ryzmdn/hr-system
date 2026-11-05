<?php

declare(strict_types=1);

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            OrganizationSeeder::class,
            SecurityAndUserSeeder::class,
            EmployeeSeeder::class,
            ApprovalWorkflowSeeder::class,
            TimeAndAttendanceSeeder::class,
            PayrollSeeder::class,
            CompensationAndOffboardingSeeder::class,
            RecruitmentAndPerformanceSeeder::class,
        ]);
    }
}
