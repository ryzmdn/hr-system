<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\Branch;
use App\Models\Company;
use App\Models\Department;
use App\Models\Employee;
use App\Models\JobPosition;
use App\Models\PayrollPeriod;
use App\Models\PerformancePeriod;
use App\Models\RecruitmentJobPosting;
use App\Models\ShiftTemplate;
use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DatabaseSeederTest extends TestCase
{
    use RefreshDatabase;

    public function test_database_seeder_executes_and_populates_enterprise_records(): void
    {
        $this->seed(DatabaseSeeder::class);

        $this->assertDatabaseHas('companies', [
            'code' => 'NMC01',
            'name' => 'PT Nusantara Mega Corpora',
        ]);

        $this->assertEquals(3, Branch::count());
        $this->assertEquals(5, Department::count());
        $this->assertGreaterThanOrEqual(8, JobPosition::count());
        $this->assertGreaterThanOrEqual(6, User::count());
        $this->assertGreaterThanOrEqual(10, Employee::count());

        $this->assertDatabaseHas('users', [
            'email' => 'admin@enterprise.co.id',
        ]);
        $this->assertDatabaseHas('users', [
            'email' => 'hr.director@enterprise.co.id',
        ]);

        $this->assertGreaterThanOrEqual(4, ShiftTemplate::count());
        $this->assertGreaterThanOrEqual(2, PayrollPeriod::count());
        $this->assertGreaterThanOrEqual(3, RecruitmentJobPosting::count());
        $this->assertGreaterThanOrEqual(2, PerformancePeriod::count());
    }
}

