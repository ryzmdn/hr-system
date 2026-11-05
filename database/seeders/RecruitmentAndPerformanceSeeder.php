<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Enums\AppraisalStatus;
use App\Enums\CandidateStage;
use App\Enums\EmploymentStatus;
use App\Enums\JobPostingStatus;
use App\Enums\PerformancePeriodStatus;
use App\Enums\PerformanceRatingGrade;
use App\Models\Branch;
use App\Models\Department;
use App\Models\Employee;
use App\Models\JobPosition;
use App\Models\PerformanceAppraisal;
use App\Models\PerformanceAppraisalItem;
use App\Models\PerformancePeriod;
use App\Models\RecruitmentCandidate;
use App\Models\RecruitmentJobPosting;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class RecruitmentAndPerformanceSeeder extends Seeder
{
    public function run(): void
    {
        $jktBranch = Branch::where('code', 'JKT01')->firstOrFail();
        $techDept = Department::where('code', 'TECH')->firstOrFail();
        $finDept = Department::where('code', 'FIN')->firstOrFail();
        $posLeadBe = JobPosition::where('code', 'POS-LEAD-BE')->firstOrFail();
        $posFeDev = JobPosition::where('code', 'POS-FE-DEV')->firstOrFail();
        $posAccSr = JobPosition::where('code', 'POS-ACC-SR')->firstOrFail();

        $postingDevOps = RecruitmentJobPosting::firstOrCreate(
            ['slug' => 'senior-cloud-devops-engineer-jkt'],
            [
                'branch_id' => $jktBranch->id,
                'department_id' => $techDept->id,
                'position_id' => $posLeadBe->id,
                'title' => 'Senior Cloud & DevOps Engineer (Kubernetes & AWS)',
                'employment_status' => EmploymentStatus::Pkwtt,
                'quota' => 2,
                'min_experience_years' => 5,
                'salary_range_min' => 18000000.0,
                'salary_range_max' => 26000000.0,
                'description' => 'Membangun infrastruktur cloud scalable, CI/CD automated pipeline, dan observabilitas Prometheus/Grafana.',
                'requirements' => 'Pengalaman mendalam dengan Docker, Kubernetes, Terraform, dan manajemen beban tinggi.',
                'status' => JobPostingStatus::Published,
                'deadline_date' => Carbon::now()->addDays(45)->toDateString(),
            ]
        );

        $postingFrontend = RecruitmentJobPosting::firstOrCreate(
            ['slug' => 'lead-frontend-engineer-react-jkt'],
            [
                'branch_id' => $jktBranch->id,
                'department_id' => $techDept->id,
                'position_id' => $posFeDev->id,
                'title' => 'Lead Frontend Engineer (Next.js & TypeScript)',
                'employment_status' => EmploymentStatus::Pkwtt,
                'quota' => 1,
                'min_experience_years' => 4,
                'salary_range_min' => 15000000.0,
                'salary_range_max' => 22000000.0,
                'description' => 'Memimpin pengembangan desain sistem antarmuka web portal enterprise dan optimasi performa render.',
                'requirements' => 'Menguasai ekosistem React, Next.js App Router, Tailwind CSS, serta state management modern.',
                'status' => JobPostingStatus::Published,
                'deadline_date' => Carbon::now()->addDays(30)->toDateString(),
            ]
        );

        $postingTax = RecruitmentJobPosting::firstOrCreate(
            ['slug' => 'senior-tax-compliance-accountant-jkt'],
            [
                'branch_id' => $jktBranch->id,
                'department_id' => $finDept->id,
                'position_id' => $posAccSr->id,
                'title' => 'Senior Tax & Payroll Compliance Accountant',
                'employment_status' => EmploymentStatus::Pkwtt,
                'quota' => 1,
                'min_experience_years' => 3,
                'salary_range_min' => 12000000.0,
                'salary_range_max' => 16000000.0,
                'description' => 'Memastikan kepatuhan pelaporan e-Bupot 21/26, PPh 21 TER, serta audit kepesertaan BPJS.',
                'requirements' => 'Memiliki sertifikasi Brevet Pajak A/B, pemahaman mendalam PMK 168/2023 dan PP 58/2023.',
                'status' => JobPostingStatus::Published,
                'deadline_date' => Carbon::now()->addDays(20)->toDateString(),
            ]
        );

        RecruitmentCandidate::firstOrCreate(
            ['email' => 'kevin.sanjaya@example.com'],
            [
                'job_posting_id' => $postingDevOps->id,
                'name' => 'Kevin Sanjaya, S.Kom',
                'phone_number' => '081211112222',
                'portfolio_url' => 'https:' . chr(47) . chr(47) . 'github.com/kevinsanjaya',
                'stage' => CandidateStage::Offering,
                'rating' => 5,
                'expected_salary' => 24000000.0,
                'offered_salary' => 23000000.0,
                'notes' => 'Lolos tahapan interview teknis dan negosiasi paket remunerasi disetujui HRD.',
            ]
        );

        RecruitmentCandidate::firstOrCreate(
            ['email' => 'amanda.putri@example.com'],
            [
                'job_posting_id' => $postingFrontend->id,
                'name' => 'Amanda Putri, S.Ds',
                'phone_number' => '081233334444',
                'portfolio_url' => 'https:' . chr(47) . chr(47) . 'amandaputri.design',
                'stage' => CandidateStage::TechnicalTest,
                'rating' => 5,
                'expected_salary' => 19000000.0,
                'offered_salary' => 0.0,
                'notes' => 'Tugas take-home test slicing antarmuka sangat rapi dan memenuhi kriteria audit accessibility.',
            ]
        );

        RecruitmentCandidate::firstOrCreate(
            ['email' => 'fajar.pratama@example.com'],
            [
                'job_posting_id' => $postingDevOps->id,
                'name' => 'Fajar Pratama',
                'phone_number' => '081255556666',
                'portfolio_url' => 'https:' . chr(47) . chr(47) . 'linkedin.com/in/fajarpratama',
                'stage' => CandidateStage::Interview,
                'rating' => 4,
                'expected_salary' => 20000000.0,
                'offered_salary' => 0.0,
                'notes' => 'Jadwal interview user dijadwalkan dengan VP Engineering.',
            ]
        );

        RecruitmentCandidate::firstOrCreate(
            ['email' => 'nadia.syahrini@example.com'],
            [
                'job_posting_id' => $postingTax->id,
                'name' => 'Nadia Syahrini, SE',
                'phone_number' => '081277778888',
                'portfolio_url' => null,
                'stage' => CandidateStage::Screening,
                'rating' => 0,
                'expected_salary' => 13500000.0,
                'offered_salary' => 0.0,
                'notes' => 'CV sesuai kriteria pengalaman minimal 3 tahun di Kantor Konsultan Pajak.',
            ]
        );

        $periodQ4 = PerformancePeriod::firstOrCreate(
            ['name' => 'Siklus OKR & KPI Kuartal 4 2026'],
            [
                'start_date' => '2026-10-01',
                'end_date' => '2026-12-31',
                'status' => PerformancePeriodStatus::Active,
            ]
        );

        PerformancePeriod::firstOrCreate(
            ['name' => 'Evaluasi Kinerja Komprehensif Tahunan 2026'],
            [
                'start_date' => '2026-01-01',
                'end_date' => '2026-12-31',
                'status' => PerformancePeriodStatus::Draft,
            ]
        );

        $budi = Employee::where('nik', 'EMP202302005')->first();
        $siti = Employee::where('nik', 'EMP202403006')->first();
        $dian = Employee::where('nik', 'EMP202201004')->first();

        if ($budi && $dian) {
            $appraisalBudi = PerformanceAppraisal::firstOrCreate(
                [
                    'performance_period_id' => $periodQ4->id,
                    'employee_id' => $budi->id,
                ],
                [
                    'evaluator_id' => $dian->id,
                    'overall_score' => 97.5,
                    'rating_grade' => PerformanceRatingGrade::A,
                    'feedback' => 'Hasil arsitektur sistem backend berdaya tahan tinggi, proaktif dalam mereview pull request tim.',
                    'status' => AppraisalStatus::Finalized,
                ]
            );

            PerformanceAppraisalItem::firstOrCreate(
                [
                    'performance_appraisal_id' => $appraisalBudi->id,
                    'kpi_name' => 'System Uptime & Core API Availability SLA',
                ],
                [
                    'target_description' => 'Mempertahankan ketersediaan API minimal 99.9% uptime per kuartal.',
                    'weight_percentage' => 40.0,
                    'target_value' => 100.0,
                    'actual_value' => 100.0,
                    'score' => 100.0,
                    'weighted_score' => 40.0,
                ]
            );

            PerformanceAppraisalItem::firstOrCreate(
                [
                    'performance_appraisal_id' => $appraisalBudi->id,
                    'kpi_name' => 'Sprint Velocity & Backend Feature Delivery',
                ],
                [
                    'target_description' => 'Ketepatan rilis modul payroll dan presensi sesuai target sprint board.',
                    'weight_percentage' => 35.0,
                    'target_value' => 50.0,
                    'actual_value' => 48.0,
                    'score' => 96.0,
                    'weighted_score' => 33.6,
                ]
            );

            PerformanceAppraisalItem::firstOrCreate(
                [
                    'performance_appraisal_id' => $appraisalBudi->id,
                    'kpi_name' => 'Engineering Code Review & Tim Mentoring',
                ],
                [
                    'target_description' => 'Kepatuhan review code tim junior dan zero security flaw di produksi.',
                    'weight_percentage' => 25.0,
                    'target_value' => 20.0,
                    'actual_value' => 20.0,
                    'score' => 100.0,
                    'weighted_score' => 25.0,
                ]
            );
        }

        if ($siti && $dian) {
            $appraisalSiti = PerformanceAppraisal::firstOrCreate(
                [
                    'performance_period_id' => $periodQ4->id,
                    'employee_id' => $siti->id,
                ],
                [
                    'evaluator_id' => $dian->id,
                    'overall_score' => 88.0,
                    'rating_grade' => PerformanceRatingGrade::B,
                    'feedback' => 'Antarmuka web portal sangat intuitif dan mobile friendly.',
                    'status' => AppraisalStatus::Submitted,
                ]
            );

            PerformanceAppraisalItem::firstOrCreate(
                [
                    'performance_appraisal_id' => $appraisalSiti->id,
                    'kpi_name' => 'Pembangunan Halaman Antarmuka Mobile-First',
                ],
                [
                    'target_description' => 'Menyelesaikan modul ESS Clock-in dan portal persetujuan supervisor.',
                    'weight_percentage' => 60.0,
                    'target_value' => 10.0,
                    'actual_value' => 9.0,
                    'score' => 90.0,
                    'weighted_score' => 54.0,
                ]
            );

            PerformanceAppraisalItem::firstOrCreate(
                [
                    'performance_appraisal_id' => $appraisalSiti->id,
                    'kpi_name' => 'Lighthouse Performance & Core Web Vitals',
                ],
                [
                    'target_description' => 'Skor performa Lighthouse di atas 85 untuk seluruh halaman portal.',
                    'weight_percentage' => 40.0,
                    'target_value' => 85.0,
                    'actual_value' => 72.0,
                    'score' => 84.7,
                    'weighted_score' => 33.88,
                ]
            );
        }
    }
}

