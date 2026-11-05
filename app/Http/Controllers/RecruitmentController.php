<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Enums\CandidateStage;
use App\Enums\EmploymentStatus;
use App\Enums\JobPostingStatus;
use App\Models\Branch;
use App\Models\Department;
use App\Models\JobPosition;
use App\Models\RecruitmentCandidate;
use App\Models\RecruitmentJobPosting;
use App\Services\RecruitmentAtsService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class RecruitmentController extends Controller
{
    public function __construct(
        protected RecruitmentAtsService $atsService,
    ) {}

    public function index(): Response
    {
        $postings = RecruitmentJobPosting::query()
            ->with(['branch', 'department', 'position'])
            ->withCount('candidates')
            ->latest()
            ->get();

        $candidates = RecruitmentCandidate::query()
            ->with(['jobPosting.position', 'hiredEmployee'])
            ->latest()
            ->limit(50)
            ->get();

        $branches = Branch::query()->where('is_active', true)->get(['id', 'name', 'code']);
        $departments = Department::query()->where('is_active', true)->get(['id', 'name', 'code']);
        $positions = JobPosition::query()->where('is_active', true)->get(['id', 'name', 'code']);

        return Inertia::render('recruitment/index', [
            'postings' => $postings,
            'candidates' => $candidates,
            'branches' => $branches,
            'departments' => $departments,
            'positions' => $positions,
            'stages' => array_map(fn (CandidateStage $s) => [
                'value' => $s->value,
                'label' => $s->label(),
            ], CandidateStage::cases()),
            'postingStatuses' => array_map(fn (JobPostingStatus $s) => [
                'value' => $s->value,
                'label' => $s->label(),
            ], JobPostingStatus::cases()),
        ]);
    }

    public function storePosting(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'branch_id' => ['nullable', 'exists:branches,id'],
            'department_id' => ['nullable', 'exists:departments,id'],
            'position_id' => ['nullable', 'exists:job_positions,id'],
            'title' => ['required', 'string', 'max:150'],
            'employment_status' => ['required', 'string'],
            'quota' => ['required', 'integer', 'min:1'],
            'min_experience_years' => ['required', 'integer', 'min:0'],
            'salary_range_min' => ['nullable', 'numeric', 'min:0'],
            'salary_range_max' => ['nullable', 'numeric', 'min:0'],
            'description' => ['required', 'string'],
            'requirements' => ['nullable', 'string'],
            'deadline_date' => ['nullable', 'date'],
        ]);

        $this->atsService->createJobPosting($validated);

        return redirect()->back()->with('success', 'Lowongan pekerjaan baru berhasil diterbitkan.');
    }

    public function apply(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'job_posting_id' => ['required', 'exists:recruitment_job_postings,id'],
            'name' => ['required', 'string', 'max:150'],
            'email' => ['required', 'email', 'max:150'],
            'phone_number' => ['nullable', 'string', 'max:30'],
            'portfolio_url' => ['nullable', 'url', 'max:255'],
            'expected_salary' => ['nullable', 'numeric', 'min:0'],
            'resume_file' => ['nullable', 'file', 'mimes:pdf', 'max:5120'],
        ]);

        $this->atsService->applyCandidate(
            (int) $validated['job_posting_id'],
            $validated['name'],
            $validated['email'],
            $validated['phone_number'] ?? null,
            $request->file('resume_file'),
            $validated['portfolio_url'] ?? null,
            (float) ($validated['expected_salary'] ?? 0)
        );

        return redirect()->back()->with('success', 'Lamaran kandidat berhasil dicatat ke dalam pipeline seleksi.');
    }

    public function updateStage(RecruitmentCandidate $candidate, Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'stage' => ['required', 'string'],
            'offered_salary' => ['nullable', 'numeric', 'min:0'],
            'notes' => ['nullable', 'string', 'max:1000'],
            'rating' => ['nullable', 'integer', 'min:1', 'max:5'],
        ]);

        $stage = CandidateStage::from($validated['stage']);

        $this->atsService->updateCandidateStage(
            $candidate,
            $stage,
            isset($validated['offered_salary']) ? (float) $validated['offered_salary'] : null,
            $validated['notes'] ?? null,
            isset($validated['rating']) ? (int) $validated['rating'] : null
        );

        return redirect()->back()->with('success', 'Tahapan kandidat berhasil diperbarui.');
    }

    public function hire(RecruitmentCandidate $candidate, Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'branch_id' => ['required', 'exists:branches,id'],
            'department_id' => ['required', 'exists:departments,id'],
            'position_id' => ['required', 'exists:job_positions,id'],
            'join_date' => ['required', 'date'],
            'agreed_salary' => ['required', 'numeric', 'min:1000000'],
        ]);

        $this->atsService->hireCandidate(
            $candidate,
            (int) $validated['branch_id'],
            (int) $validated['department_id'],
            (int) $validated['position_id'],
            $validated['join_date'],
            (float) $validated['agreed_salary']
        );

        return redirect()->back()->with('success', 'Kandidat resmi di-hire dan data master karyawan baru berhasil dibuat.');
    }
}

