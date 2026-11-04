<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Enums\JkkRiskGrade;
use App\Enums\Timezone;
use App\Http\Requests\StoreBranchRequest;
use App\Http\Requests\UpdateBranchRequest;
use App\Models\Branch;
use App\Models\Company;
use App\Models\Department;
use App\Models\JobGrade;
use App\Models\JobPosition;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class OrganizationController extends Controller
{
    public function index(Request $request): Response
    {
        $company = Company::withCount(['branches', 'departments'])->firstOrFail();

        $branches = Branch::withCount('employees')
            ->orderBy('id')
            ->get()
            ->map(fn (Branch $b) => [
                'id' => $b->id,
                'code' => $b->code,
                'name' => $b->name,
                'latitude' => $b->latitude,
                'longitude' => $b->longitude,
                'radius_meters' => $b->radius_meters,
                'timezone' => $b->timezone->value,
                'timezone_label' => $b->timezone->label(),
                'jkk_risk_grade' => $b->jkk_risk_grade->value,
                'jkk_risk_label' => $b->jkk_risk_grade->label(),
                'address' => $b->address,
                'is_active' => $b->is_active,
                'employees_count' => $b->employees_count,
            ]);

        $departments = Department::with(['parent', 'positions.grade'])
            ->withCount('employees')
            ->orderBy('id')
            ->get();

        $jobGrades = JobGrade::withCount('positions')
            ->orderBy('grade_level')
            ->get();

        return Inertia::render('organization/index', [
            'company' => $company,
            'branches' => $branches,
            'departments' => $departments,
            'jobGrades' => $jobGrades,
            'timezones' => array_map(fn (Timezone $tz) => [
                'value' => $tz->value,
                'label' => $tz->label(),
            ], Timezone::cases()),
            'jkkRiskGrades' => array_map(fn (JkkRiskGrade $g) => [
                'value' => $g->value,
                'label' => $g->label(),
            ], JkkRiskGrade::cases()),
        ]);
    }

    public function storeBranch(StoreBranchRequest $request): RedirectResponse
    {
        Branch::create($request->validated());

        return back()->with('success', 'Cabang baru berhasil ditambahkan.');
    }

    public function updateBranch(UpdateBranchRequest $request, Branch $branch): RedirectResponse
    {
        $branch->update($request->validated());

        return back()->with('success', 'Informasi cabang berhasil diperbarui.');
    }

    public function storeDepartment(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'company_id' => ['required', 'exists:companies,id'],
            'parent_id' => ['nullable', 'exists:departments,id'],
            'code' => ['required', 'string', 'max:50', 'unique:departments,code'],
            'name' => ['required', 'string', 'max:255'],
        ]);

        Department::create($validated);

        return back()->with('success', 'Departemen baru berhasil ditambahkan.');
    }

    public function storePosition(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'department_id' => ['required', 'exists:departments,id'],
            'job_grade_id' => ['nullable', 'exists:job_grades,id'],
            'code' => ['required', 'string', 'max:50', 'unique:job_positions,code'],
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:1000'],
        ]);

        JobPosition::create($validated);

        return back()->with('success', 'Posisi jabatan baru berhasil ditambahkan.');
    }
}

