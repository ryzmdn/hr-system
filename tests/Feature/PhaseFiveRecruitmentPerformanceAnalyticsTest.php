<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Enums\AppraisalStatus;
use App\Enums\AttendanceType;
use App\Enums\CandidateStage;
use App\Enums\CareerChangeType;
use App\Enums\EmployeeStatus;
use App\Enums\EmploymentStatus;
use App\Enums\JobPostingStatus;
use App\Enums\PerformancePeriodStatus;
use App\Enums\PerformanceRatingGrade;
use App\Enums\TaxPtkpStatus;
use App\Enums\VerificationStatus;
use App\Models\AttendanceLog;
use App\Models\Branch;
use App\Models\Company;
use App\Models\Department;
use App\Models\Employee;
use App\Models\EmployeeHistory;
use App\Models\JobGrade;
use App\Models\JobPosition;
use App\Models\PerformanceAppraisal;
use App\Models\PerformancePeriod;
use App\Models\RecruitmentCandidate;
use App\Models\RecruitmentJobPosting;
use App\Models\User;
use App\Services\ExecutiveAnalyticsService;
use App\Services\PerformanceAppraisalService;
use App\Services\RecruitmentAtsService;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class PhaseFiveRecruitmentPerformanceAnalyticsTest extends TestCase
{
    use RefreshDatabase;

    protected Company $company;
    protected Branch $branch;
    protected Department $department;
    protected JobGrade $grade;
    protected JobPosition $position;
    protected User $user;

    protected function setUp(): void
    {
        parent::setUp();

        $this->company = Company::create([
            'code' => 'ENT01',
            'name' => 'PT Enterprise Utama',
            'tax_id' => '01.234.567.8-999.000',
            'email' => 'corporate@enterprise.co.id',
            'phone' => '021-99998888',
            'address' => 'Sudirman Central Business District',
            'is_active' => true,
        ]);

        $this->branch = Branch::create([
            'company_id' => $this->company->id,
            'name' => 'Kantor Pusat Jakarta',
            'code' => 'JKT01',
            'latitude' => -6.2088,
            'longitude' => 106.8456,
            'radius_meters' => 150,
            'timezone' => 'Asia/Jakarta',
            'address' => 'Jl. Jend. Sudirman Kav 1',
            'is_active' => true,
        ]);

        $this->department = Department::create([
            'company_id' => $this->company->id,
            'name' => 'Technology & Engineering',
            'code' => 'TECH',
            'is_active' => true,
        ]);

        $this->grade = JobGrade::create([
            'company_id' => $this->company->id,
            'grade_level' => 4,
            'name' => 'Senior Grade',
            'min_salary' => 10000000,
            'max_salary' => 30000000,
        ]);

        $this->position = JobPosition::create([
            'department_id' => $this->department->id,
            'job_grade_id' => $this->grade->id,
            'code' => 'SBE01',
            'name' => 'Senior Backend Engineer',
            'is_active' => true,
        ]);

        $this->user = User::factory()->create([
            'email' => 'hr.director@enterprise.co.id',
        ]);
    }

    public function test_ats_job_posting_application_stages_and_hiring_bridge(): void
    {
        $atsService = app(RecruitmentAtsService::class);

        $posting = $atsService->createJobPosting([
            'branch_id' => $this->branch->id,
            'department_id' => $this->department->id,
            'position_id' => $this->position->id,
            'title' => 'Senior Backend Engineer (PHP/Go)',
            'description' => 'Membangun arsitektur microservices performa tinggi.',
            'requirements' => 'Pengalaman minimal 5 tahun di sistem enterprise berkonkurensi tinggi.',
            'quota' => 2,
            'min_experience_years' => 5,
            'employment_status' => EmploymentStatus::Pkwtt->value,
            'salary_range_min' => 18000000,
            'salary_range_max' => 25000000,
            'deadline_date' => Carbon::now()->addDays(30)->toDateString(),
            'status' => JobPostingStatus::Published->value,
        ]);

        $this->assertInstanceOf(RecruitmentJobPosting::class, $posting);
        $this->assertEquals(JobPostingStatus::Published, $posting->status);

        $candidate = $atsService->applyCandidate(
            $posting->id,
            'Budi Santoso',
            'budi.santoso@example.com',
            '081234567890',
            null,
            'https:' . chr(47) . chr(47) . 'linkedin.com/in/budisantoso',
            22000000.0
        );

        $this->assertInstanceOf(RecruitmentCandidate::class, $candidate);
        $this->assertEquals(CandidateStage::Applied, $candidate->stage);

        $candidate = $atsService->updateCandidateStage(
            $candidate,
            CandidateStage::Screening,
            notes: 'CV memenuhi spesifikasi teknis.'
        );
        $this->assertEquals(CandidateStage::Screening, $candidate->stage);

        $candidate = $atsService->updateCandidateStage(
            $candidate,
            CandidateStage::Interview,
            notes: 'Lolos screening awal HR.'
        );
        $this->assertEquals(CandidateStage::Interview, $candidate->stage);

        $candidate = $atsService->updateCandidateStage(
            $candidate,
            CandidateStage::TechnicalTest,
            rating: 5,
            notes: 'Skor live coding sempurna.'
        );
        $this->assertEquals(CandidateStage::TechnicalTest, $candidate->stage);
        $this->assertEquals(5, $candidate->rating);

        $candidate = $atsService->updateCandidateStage(
            $candidate,
            CandidateStage::Offering,
            offeredSalary: 23000000.0,
            notes: 'Penawaran paket remunerasi disetujui manajemen.'
        );
        $this->assertEquals(CandidateStage::Offering, $candidate->stage);
        $this->assertEquals(23000000.0, (float) $candidate->offered_salary);

        $newEmployee = $atsService->hireCandidate(
            $candidate,
            $this->branch->id,
            $this->department->id,
            $this->position->id,
            Carbon::now()->toDateString(),
            23000000.0
        );

        $this->assertInstanceOf(Employee::class, $newEmployee);
        $this->assertEquals('Budi Santoso', $newEmployee->name);
        $this->assertEquals('budi.santoso@example.com', $newEmployee->email);
        $this->assertEquals(EmployeeStatus::Active, $newEmployee->status);
        $this->assertEquals(EmploymentStatus::Pkwtt, $newEmployee->employment_status);

        $candidate->refresh();
        $this->assertEquals(CandidateStage::Hired, $candidate->stage);
        $this->assertEquals($newEmployee->id, $candidate->hired_employee_id);

        $history = EmployeeHistory::where('employee_id', $newEmployee->id)->first();
        $this->assertNotNull($history);
        $this->assertEquals(23000000.0, (float) $history->base_salary);
        $this->assertEquals(CareerChangeType::Hire, $history->change_type);
    }

    public function test_performance_appraisal_scoring_and_grading(): void
    {
        $appraisalService = app(PerformanceAppraisalService::class);

        $period = PerformancePeriod::create([
            'name' => 'Evaluasi Kinerja Q4 2026',
            'start_date' => '2026-10-01',
            'end_date' => '2026-12-31',
            'status' => PerformancePeriodStatus::Active,
        ]);

        $employee = Employee::create([
            'nik' => 'EMP20261001',
            'name' => 'Siti Aminah',
            'email' => 'siti.aminah@enterprise.co.id',
            'phone_number' => '081298765432',
            'id_card_number' => '3201999988887777',
            'gender' => 'FEMALE',
            'current_branch_id' => $this->branch->id,
            'current_department_id' => $this->department->id,
            'current_position_id' => $this->position->id,
            'tax_ptkp_status' => TaxPtkpStatus::Tk0,
            'employment_status' => EmploymentStatus::Pkwtt,
            'join_date' => '2024-01-15',
            'status' => EmployeeStatus::Active,
        ]);

        $evaluator = Employee::create([
            'nik' => 'EMP20260001',
            'name' => 'Ahmad Manager',
            'email' => 'ahmad.mgr@enterprise.co.id',
            'phone_number' => '081111222333',
            'id_card_number' => '3201111122223333',
            'gender' => 'MALE',
            'current_branch_id' => $this->branch->id,
            'current_department_id' => $this->department->id,
            'current_position_id' => $this->position->id,
            'tax_ptkp_status' => TaxPtkpStatus::K1,
            'employment_status' => EmploymentStatus::Pkwtt,
            'join_date' => '2022-01-10',
            'status' => EmployeeStatus::Active,
        ]);

        $kpis = [
            [
                'kpi_name' => 'System Uptime SLA',
                'target_description' => 'Target 99.9% uptime sistem core',
                'weight_percentage' => 40.0,
                'target_value' => 100.0,
                'actual_value' => 100.0,
            ],
            [
                'kpi_name' => 'Sprint Velocity Delivery',
                'target_description' => 'Realisasi poin cerita dalam sprint',
                'weight_percentage' => 40.0,
                'target_value' => 50.0,
                'actual_value' => 45.0,
            ],
            [
                'kpi_name' => 'Code Review Compliance',
                'target_description' => 'Kepatuhan review code tim junior',
                'weight_percentage' => 20.0,
                'target_value' => 10.0,
                'actual_value' => 10.0,
            ],
        ];

        $appraisal = $appraisalService->createAppraisal(
            $period,
            $employee,
            $evaluator,
            $kpis,
            'Evaluasi awal target kinerja'
        );

        $this->assertInstanceOf(PerformanceAppraisal::class, $appraisal);
        $this->assertCount(3, $appraisal->items);

        $this->assertEquals(96.0, $appraisal->overall_score);
        $this->assertEquals(PerformanceRatingGrade::A, $appraisal->rating_grade);

        $items = $appraisal->items->keyBy('kpi_name');
        $this->assertEquals(40.0, (float) $items['System Uptime SLA']->weighted_score);
        $this->assertEquals(36.0, (float) $items['Sprint Velocity Delivery']->weighted_score);
        $this->assertEquals(20.0, (float) $items['Code Review Compliance']->weighted_score);

        $evalUpdates = [
            $items['Sprint Velocity Delivery']->id => 50.0,
        ];

        $updatedAppraisal = $appraisalService->evaluateAppraisal(
            $appraisal,
            $evalUpdates,
            'Kinerja sangat memuaskan melampaui target velocity',
            AppraisalStatus::Finalized
        );

        $this->assertEquals(100.0, $updatedAppraisal->overall_score);
        $this->assertEquals(PerformanceRatingGrade::A, $updatedAppraisal->rating_grade);
        $this->assertEquals(AppraisalStatus::Finalized, $updatedAppraisal->status);
    }

    public function test_executive_analytics_bradford_turnover_and_wlkp_export(): void
    {
        $analyticsService = app(ExecutiveAnalyticsService::class);

        $lowRisk = $analyticsService->calculateBradfordFactor(spells: 2, totalDays: 3);
        $this->assertEquals(12, $lowRisk['score']);
        $this->assertEquals('Low Risk', $lowRisk['risk_level']);

        $medRisk = $analyticsService->calculateBradfordFactor(spells: 6, totalDays: 8);
        $this->assertEquals(288, $medRisk['score']);
        $this->assertEquals('Medium Risk', $medRisk['risk_level']);

        $highRisk = $analyticsService->calculateBradfordFactor(spells: 9, totalDays: 9);
        $this->assertEquals(729, $highRisk['score']);
        $this->assertEquals('High Risk', $highRisk['risk_level']);

        $activeEmp = Employee::create([
            'nik' => 'EMP1001',
            'name' => 'Karyawan Aktif 1',
            'email' => 'aktif1@enterprise.co.id',
            'phone_number' => '081230001',
            'id_card_number' => '3171000000000001',
            'gender' => 'MALE',
            'current_branch_id' => $this->branch->id,
            'current_department_id' => $this->department->id,
            'current_position_id' => $this->position->id,
            'tax_ptkp_status' => TaxPtkpStatus::Tk0,
            'employment_status' => EmploymentStatus::Pkwtt,
            'join_date' => '2023-01-01',
            'status' => EmployeeStatus::Active,
        ]);

        $resignedEmp = Employee::create([
            'nik' => 'EMP1002',
            'name' => 'Karyawan Resign',
            'email' => 'resign@enterprise.co.id',
            'phone_number' => '081230002',
            'id_card_number' => '3171000000000002',
            'gender' => 'FEMALE',
            'current_branch_id' => $this->branch->id,
            'current_department_id' => $this->department->id,
            'current_position_id' => $this->position->id,
            'tax_ptkp_status' => TaxPtkpStatus::Tk0,
            'employment_status' => EmploymentStatus::Pkwt,
            'join_date' => '2023-01-01',
            'resign_date' => Carbon::now()->toDateString(),
            'status' => EmployeeStatus::Resigned,
        ]);

        $currentYear = Carbon::now()->year;
        $metrics = $analyticsService->getExecutiveMetrics($currentYear);

        $this->assertGreaterThanOrEqual(1, $metrics['headcount']['total_active']);
        $this->assertGreaterThanOrEqual(1, $metrics['headcount']['resigned_this_year']);
        $this->assertGreaterThan(0.0, $metrics['headcount']['turnover_rate']);

        $csv = $analyticsService->generateWlkpCsv();
        $this->assertStringContainsString('LAPORAN WAJIB LAPOR KETENAGAKERJAAN PERUSAHAAN (WLKP)', $csv);
        $this->assertStringContainsString('Undang-Undang No. 7 Tahun 1981', $csv);
        $this->assertStringContainsString('Karyawan Aktif 1', $csv);
        $this->assertStringContainsString('Sudirman Central Business District', $csv);

        $response = $this->actingAs($this->user)->get('/analytics');
        $response->assertStatus(200);

        $exportResponse = $this->actingAs($this->user)->get('/analytics/wlkp/export');
        $exportResponse->assertStatus(200);
        $this->assertEquals('text/csv; charset=UTF-8', $exportResponse->headers->get('content-type'));
    }

    public function test_high_concurrency_stress_simulation_5000_clock_in_actions(): void
    {
        $batchSize = 1000;
        $totalRecords = 5000;

        $employees = [];
        for ($i = 1; $i <= 10; $i++) {
            $employees[] = Employee::create([
                'nik' => 'BURST' . str_pad((string) $i, 4, '0', STR_PAD_LEFT),
                'name' => 'Burst Worker ' . $i,
                'email' => 'burst' . $i . '@enterprise.co.id',
                'phone_number' => '0899999' . str_pad((string) $i, 4, '0', STR_PAD_LEFT),
                'id_card_number' => '320100000000' . str_pad((string) $i, 4, '0', STR_PAD_LEFT),
                'gender' => $i % 2 === 0 ? 'FEMALE' : 'MALE',
                'current_branch_id' => $this->branch->id,
                'current_department_id' => $this->department->id,
                'current_position_id' => $this->position->id,
                'tax_ptkp_status' => TaxPtkpStatus::Tk0,
                'employment_status' => EmploymentStatus::Pkwtt,
                'join_date' => '2024-01-01',
                'status' => EmployeeStatus::Active,
            ]);
        }

        $now = Carbon::now();
        $initialCount = AttendanceLog::count();
        $records = [];

        for ($i = 0; $i < $totalRecords; $i++) {
            $emp = $employees[$i % count($employees)];
            $records[] = [
                'employee_id' => $emp->id,
                'roster_id' => null,
                'recorded_at' => $now->copy()->addSeconds($i % 600)->toDateTimeString(),
                'type' => AttendanceType::ClockIn->value,
                'latitude' => -6.2088,
                'longitude' => 106.8456,
                'distance_to_branch_meters' => 15,
                'is_within_geofence' => true,
                'selfie_path' => 'selfies/burst_' . $i . '.jpg',
                'device_info' => 'Enterprise Mobile App v2.5.0; DeviceID=sim-' . ($i % 50),
                'is_mock_location' => false,
                'verification_status' => VerificationStatus::Valid->value,
                'notes' => 'Bulk simulated clock-in',
                'created_at' => $now->toDateTimeString(),
                'updated_at' => $now->toDateTimeString(),
            ];

            if (count($records) >= $batchSize) {
                DB::table('attendance_logs')->insert($records);
                $records = [];
            }
        }

        if (count($records) > 0) {
            DB::table('attendance_logs')->insert($records);
        }

        $finalCount = AttendanceLog::count();
        $this->assertEquals($initialCount + $totalRecords, $finalCount);

        $validCount = AttendanceLog::where('verification_status', VerificationStatus::Valid->value)
            ->where('notes', 'Bulk simulated clock-in')
            ->count();
        $this->assertEquals($totalRecords, $validCount);
    }
}

