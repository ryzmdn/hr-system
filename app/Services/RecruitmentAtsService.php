<?php

declare(strict_types=1);

namespace App\Services;

use App\Enums\CandidateStage;
use App\Enums\CareerChangeType;
use App\Enums\EmployeeStatus;
use App\Enums\EmploymentStatus;
use App\Enums\JobPostingStatus;
use App\Enums\TaxPtkpStatus;
use App\Models\Employee;
use App\Models\EmployeeHistory;
use App\Models\RecruitmentCandidate;
use App\Models\RecruitmentJobPosting;
use Carbon\Carbon;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class RecruitmentAtsService
{
    public function createJobPosting(array $data): RecruitmentJobPosting
    {
        $title = (string) $data['title'];
        $baseSlug = Str::slug($title);
        $slug = $baseSlug . '-' . Str::random(5);

        return RecruitmentJobPosting::create([
            'branch_id' => $data['branch_id'] ?? null,
            'department_id' => $data['department_id'] ?? null,
            'position_id' => $data['position_id'] ?? null,
            'title' => $title,
            'slug' => $slug,
            'employment_status' => EmploymentStatus::from($data['employment_status'] ?? 'PKWTT'),
            'quota' => (int) ($data['quota'] ?? 1),
            'min_experience_years' => (int) ($data['min_experience_years'] ?? 0),
            'salary_range_min' => (float) ($data['salary_range_min'] ?? 0),
            'salary_range_max' => (float) ($data['salary_range_max'] ?? 0),
            'description' => (string) $data['description'],
            'requirements' => (string) ($data['requirements'] ?? ''),
            'status' => JobPostingStatus::from($data['status'] ?? 'PUBLISHED'),
            'deadline_date' => $data['deadline_date'] ?? null,
        ]);
    }

    public function applyCandidate(
        int $jobPostingId,
        string $name,
        string $email,
        ?string $phoneNumber,
        ?UploadedFile $resumeFile,
        ?string $portfolioUrl,
        float $expectedSalary = 0.0,
    ): RecruitmentCandidate {
        $resumePath = null;
        if ($resumeFile !== null) {
            $resumePath = $resumeFile->store('resumes', 'public');
        }

        return RecruitmentCandidate::create([
            'job_posting_id' => $jobPostingId,
            'name' => $name,
            'email' => $email,
            'phone_number' => $phoneNumber,
            'resume_file_path' => $resumePath,
            'portfolio_url' => $portfolioUrl,
            'stage' => CandidateStage::Applied,
            'rating' => 0,
            'expected_salary' => $expectedSalary,
            'offered_salary' => 0.0,
        ]);
    }

    public function updateCandidateStage(
        RecruitmentCandidate $candidate,
        CandidateStage $newStage,
        ?float $offeredSalary = null,
        ?string $notes = null,
        ?int $rating = null,
    ): RecruitmentCandidate {
        $candidate->update([
            'stage' => $newStage,
            'offered_salary' => $offeredSalary ?? $candidate->offered_salary,
            'notes' => $notes ?? $candidate->notes,
            'rating' => $rating ?? $candidate->rating,
        ]);

        return $candidate->fresh();
    }

    public function hireCandidate(
        RecruitmentCandidate $candidate,
        int $branchId,
        int $departmentId,
        int $positionId,
        string $joinDate,
        float $agreedSalary,
    ): Employee {
        return DB::transaction(function () use ($candidate, $branchId, $departmentId, $positionId, $joinDate, $agreedSalary): Employee {
            $posting = $candidate->jobPosting;
            $nik = 'EMP' . Carbon::now()->format('ym') . str_pad((string) rand(1, 9999), 4, '0', STR_PAD_LEFT);

            $employee = Employee::create([
                'user_id' => null,
                'nik' => $nik,
                'name' => $candidate->name,
                'email' => $candidate->email,
                'phone_number' => $candidate->phone_number,
                'id_card_number' => '3171' . rand(100000000000, 999999999999),
                'gender' => 'MALE',
                'current_branch_id' => $branchId,
                'current_department_id' => $departmentId,
                'current_position_id' => $positionId,
                'tax_ptkp_status' => TaxPtkpStatus::Tk0,
                'employment_status' => $posting?->employment_status ?? EmploymentStatus::Pkwtt,
                'join_date' => $joinDate,
                'status' => EmployeeStatus::Active,
            ]);

            EmployeeHistory::create([
                'employee_id' => $employee->id,
                'branch_id' => $branchId,
                'department_id' => $departmentId,
                'position_id' => $positionId,
                'base_salary' => $agreedSalary,
                'effective_start_date' => $joinDate,
                'change_type' => CareerChangeType::Hire,
            ]);

            $candidate->update([
                'stage' => CandidateStage::Hired,
                'offered_salary' => $agreedSalary,
                'hired_employee_id' => $employee->id,
            ]);

            return $employee;
        });
    }
}

