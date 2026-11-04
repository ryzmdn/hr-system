<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Enums\CareerChangeType;
use App\Enums\EmployeeStatus;
use App\Enums\EmploymentStatus;
use App\Enums\TaxPtkpStatus;
use App\Http\Requests\CareerTransitionRequest;
use App\Http\Requests\StoreEmployeeRequest;
use App\Http\Requests\UpdateEmployeeRequest;
use App\Models\Branch;
use App\Models\Department;
use App\Models\Employee;
use App\Models\JobPosition;
use App\Models\Role;
use App\Models\User;
use App\Services\EmployeeManagementService;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Inertia\Response;

class EmployeeController extends Controller
{
    public function __construct(
        protected EmployeeManagementService $employeeService,
    ) {}

    public function index(Request $request): Response
    {
        $user = $request->user();
        $canViewSensitive = $user->hasPermission('employee.view_sensitive');

        $query = Employee::with(['branch', 'department', 'position', 'manager'])
            ->when($request->input('search'), function ($q, $search) {
                $q->where(function ($sub) use ($search) {
                    $sub->where('name', 'LIKE', "%{$search}%")
                        ->orWhere('nik', 'LIKE', "%{$search}%")
                        ->orWhere('email', 'LIKE', "%{$search}%");
                });
            })
            ->when($request->input('branch_id'), fn ($q, $b) => $q->where('current_branch_id', $b))
            ->when($request->input('department_id'), fn ($q, $d) => $q->where('current_department_id', $d))
            ->when($request->input('status'), fn ($q, $s) => $q->where('status', $s))
            ->when($request->input('employment_status'), fn ($q, $e) => $q->where('employment_status', $e));

        $employees = $query->orderBy('name')->paginate(15)->withQueryString();

        $employees->through(function (Employee $emp) use ($canViewSensitive) {
            return [
                'id' => $emp->id,
                'nik' => $emp->nik,
                'name' => $emp->name,
                'email' => $emp->email,
                'phone_number' => $emp->phone_number,
                'gender' => $emp->gender,
                'employment_status' => $emp->employment_status->value,
                'employment_status_label' => $emp->employment_status->label(),
                'status' => $emp->status->value,
                'status_label' => $emp->status->label(),
                'join_date' => $emp->join_date->toDateString(),
                'branch' => $emp->branch ? ['id' => $emp->branch->id, 'name' => $emp->branch->name] : null,
                'department' => $emp->department ? ['id' => $emp->department->id, 'name' => $emp->department->name] : null,
                'position' => $emp->position ? ['id' => $emp->position->id, 'name' => $emp->position->name] : null,
                'manager' => $emp->manager ? ['id' => $emp->manager->id, 'name' => $emp->manager->name] : null,
                'effective_salary' => $canViewSensitive ? $emp->getEffectiveSalary() : null,
            ];
        });

        $branches = Branch::where('is_active', true)->select('id', 'name')->get();
        $departments = Department::where('is_active', true)->select('id', 'name')->get();

        return Inertia::render('employees/index', [
            'employees' => $employees,
            'filters' => $request->only(['search', 'branch_id', 'department_id', 'status', 'employment_status']),
            'branches' => $branches,
            'departments' => $departments,
            'canViewSensitive' => $canViewSensitive,
        ]);
    }

    public function create(): Response
    {
        $branches = Branch::where('is_active', true)->select('id', 'name')->get();
        $departments = Department::where('is_active', true)->select('id', 'name')->get();
        $positions = JobPosition::where('is_active', true)->with('grade')->get();
        $managers = Employee::where('status', EmployeeStatus::Active)->select('id', 'name', 'nik')->get();
        $roles = Role::select('id', 'name', 'code')->get();

        return Inertia::render('employees/create', [
            'branches' => $branches,
            'departments' => $departments,
            'positions' => $positions,
            'managers' => $managers,
            'roles' => $roles,
            'taxPtkpStatuses' => array_map(fn ($s) => $s->value, TaxPtkpStatus::cases()),
            'employmentStatuses' => array_map(fn ($s) => [
                'value' => $s->value,
                'label' => $s->label(),
            ], EmploymentStatus::cases()),
        ]);
    }

    public function store(StoreEmployeeRequest $request): RedirectResponse
    {
        $validated = $request->validated();
        $baseSalary = (float) $validated['base_salary'];

        DB::transaction(function () use ($validated, $baseSalary, $request) {
            $userId = null;

            if (! empty($validated['create_user_account'])) {
                $user = User::create([
                    'name' => $validated['name'],
                    'email' => $validated['email'],
                    'password' => Hash::make($validated['user_password']),
                    'email_verified_at' => now(),
                ]);

                if (! empty($validated['role_id'])) {
                    $user->roles()->attach($validated['role_id'], [
                        'branch_id' => $validated['current_branch_id'],
                    ]);
                }

                $userId = $user->id;
            }

            $employeeData = collect($validated)->except([
                'base_salary',
                'create_user_account',
                'user_password',
                'role_id',
            ])->all();

            $employeeData['user_id'] = $userId;
            $employeeData['status'] = EmployeeStatus::Active;

            $this->employeeService->createEmployee($employeeData, $baseSalary, $request->user()->id);
        });

        return redirect()->route('employees.index')->with('success', 'Data karyawan baru dan riwayat karir awal berhasil dibuat.');
    }

    public function show(Request $request, Employee $employee): Response
    {
        $user = $request->user();
        $canViewSensitive = $user->hasPermission('employee.view_sensitive') || $user->id === $employee->user_id;

        $employee->load([
            'branch',
            'department',
            'position.grade',
            'manager',
            'subordinates',
            'histories.branch',
            'histories.department',
            'histories.position',
            'histories.approvedBy',
        ]);

        $histories = $employee->histories->map(function ($history) use ($canViewSensitive) {
            return [
                'id' => $history->id,
                'change_type' => $history->change_type->value,
                'change_type_label' => $history->change_type->label(),
                'effective_start_date' => $history->effective_start_date->toDateString(),
                'effective_end_date' => $history->effective_end_date?->toDateString(),
                'base_salary' => $canViewSensitive ? (float) $history->base_salary : null,
                'branch' => $history->branch ? $history->branch->name : '-',
                'department' => $history->department ? $history->department->name : '-',
                'position' => $history->position ? $history->position->name : '-',
                'manager' => $history->manager ? $history->manager->name : null,
                'approved_by' => $history->approvedBy ? $history->approvedBy->name : null,
                'reason' => $history->reason,
            ];
        });

        $branches = Branch::where('is_active', true)->select('id', 'name')->get();
        $departments = Department::where('is_active', true)->select('id', 'name')->get();
        $positions = JobPosition::where('is_active', true)->select('id', 'name', 'department_id')->get();
        $managers = Employee::where('status', EmployeeStatus::Active)
            ->where('id', '!=', $employee->id)
            ->select('id', 'name', 'nik')
            ->get();

        return Inertia::render('employees/show', [
            'employee' => [
                'id' => $employee->id,
                'nik' => $employee->nik,
                'name' => $employee->name,
                'email' => $employee->email,
                'phone_number' => $employee->phone_number,
                'id_card_number' => $canViewSensitive ? $employee->id_card_number : '****************',
                'tax_number' => $canViewSensitive ? $employee->tax_number : '****************',
                'bank_name' => $employee->bank_name,
                'bank_account_number' => $canViewSensitive ? $employee->bank_account_number : '**********',
                'bank_account_holder' => $employee->bank_account_holder,
                'gender' => $employee->gender,
                'birth_place' => $employee->birth_place,
                'birth_date' => $employee->birth_date?->toDateString(),
                'marital_status' => $employee->marital_status,
                'tax_ptkp_status' => $employee->tax_ptkp_status->value,
                'employment_status' => $employee->employment_status->value,
                'employment_status_label' => $employee->employment_status->label(),
                'status' => $employee->status->value,
                'status_label' => $employee->status->label(),
                'join_date' => $employee->join_date->toDateString(),
                'probation_end_date' => $employee->probation_end_date?->toDateString(),
                'contract_end_date' => $employee->contract_end_date?->toDateString(),
                'branch' => $employee->branch ? ['id' => $employee->branch->id, 'name' => $employee->branch->name] : null,
                'department' => $employee->department ? ['id' => $employee->department->id, 'name' => $employee->department->name] : null,
                'position' => $employee->position ? ['id' => $employee->position->id, 'name' => $employee->position->name] : null,
                'manager' => $employee->manager ? ['id' => $employee->manager->id, 'name' => $employee->manager->name] : null,
                'subordinates_count' => $employee->subordinates->count(),
                'current_salary' => $canViewSensitive ? $employee->getEffectiveSalary() : null,
            ],
            'histories' => $histories,
            'canViewSensitive' => $canViewSensitive,
            'branches' => $branches,
            'departments' => $departments,
            'positions' => $positions,
            'managers' => $managers,
            'careerChangeTypes' => array_map(fn ($c) => [
                'value' => $c->value,
                'label' => $c->label(),
            ], [
                CareerChangeType::Promotion,
                CareerChangeType::Demotion,
                CareerChangeType::Mutation,
                CareerChangeType::SalaryAdjustment,
            ]),
        ]);
    }

    public function update(UpdateEmployeeRequest $request, Employee $employee): RedirectResponse
    {
        $employee->update($request->validated());

        return back()->with('success', 'Informasi profil karyawan berhasil diperbarui.');
    }

    public function transition(CareerTransitionRequest $request, Employee $employee): RedirectResponse
    {
        $validated = $request->validated();

        $this->employeeService->recordCareerTransition(
            $employee,
            $validated['change_type'],
            $validated['effective_start_date'],
            (float) $validated['base_salary'],
            (int) $validated['branch_id'],
            (int) $validated['department_id'],
            (int) $validated['position_id'],
            ! empty($validated['manager_id']) ? (int) $validated['manager_id'] : null,
            $request->user()->id,
            $validated['reason'] ?? null,
        );

        return back()->with('success', 'Perubahan karir & penyesuaian remunerasi berhasil dicatat.');
    }
}

