<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Enums\EmployeeStatus;
use App\Enums\SalaryComponentType;
use App\Models\Employee;
use App\Models\EmployeeSalaryComponent;
use App\Models\SalaryComponent;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SalaryComponentController extends Controller
{
    public function index(): Response
    {
        $components = SalaryComponent::query()
            ->withCount('employeeComponents')
            ->orderBy('type')
            ->orderBy('name')
            ->get();

        $employees = Employee::query()
            ->where('status', EmployeeStatus::Active)
            ->with(['branch', 'department', 'salaryComponents.component'])
            ->orderBy('name')
            ->get();

        return Inertia::render('payroll/components', [
            'components' => $components,
            'employees' => $employees,
            'componentTypes' => array_map(fn (SalaryComponentType $t) => [
                'value' => $t->value,
                'label' => $t->label(),
            ], SalaryComponentType::cases()),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'code' => ['required', 'string', 'max:50', 'unique:salary_components,code'],
            'name' => ['required', 'string', 'max:150'],
            'type' => ['required', 'string'],
            'is_taxable' => ['boolean'],
            'is_bpjs_tk_base' => ['boolean'],
            'is_bpjs_kes_base' => ['boolean'],
            'default_amount' => ['nullable', 'numeric', 'min:0'],
            'is_active' => ['boolean'],
        ]);

        SalaryComponent::create([
            'code' => strtoupper($validated['code']),
            'name' => $validated['name'],
            'type' => SalaryComponentType::from($validated['type']),
            'is_taxable' => (bool) ($validated['is_taxable'] ?? true),
            'is_bpjs_tk_base' => (bool) ($validated['is_bpjs_tk_base'] ?? false),
            'is_bpjs_kes_base' => (bool) ($validated['is_bpjs_kes_base'] ?? false),
            'default_amount' => (float) ($validated['default_amount'] ?? 0),
            'is_active' => (bool) ($validated['is_active'] ?? true),
        ]);

        return redirect()->back()->with('success', 'Komponen gaji berhasil ditambahkan.');
    }

    public function update(Request $request, SalaryComponent $component): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:150'],
            'type' => ['required', 'string'],
            'is_taxable' => ['boolean'],
            'is_bpjs_tk_base' => ['boolean'],
            'is_bpjs_kes_base' => ['boolean'],
            'default_amount' => ['nullable', 'numeric', 'min:0'],
            'is_active' => ['boolean'],
        ]);

        $component->update([
            'name' => $validated['name'],
            'type' => SalaryComponentType::from($validated['type']),
            'is_taxable' => (bool) ($validated['is_taxable'] ?? true),
            'is_bpjs_tk_base' => (bool) ($validated['is_bpjs_tk_base'] ?? false),
            'is_bpjs_kes_base' => (bool) ($validated['is_bpjs_kes_base'] ?? false),
            'default_amount' => (float) ($validated['default_amount'] ?? 0),
            'is_active' => (bool) ($validated['is_active'] ?? true),
        ]);

        return redirect()->back()->with('success', 'Komponen gaji berhasil diperbarui.');
    }

    public function destroy(SalaryComponent $component): RedirectResponse
    {
        $component->employeeComponents()->delete();
        $component->delete();

        return redirect()->back()->with('success', 'Komponen gaji berhasil dihapus.');
    }

    public function assignToEmployee(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'employee_id' => ['required', 'exists:employees,id'],
            'salary_component_id' => ['required', 'exists:salary_components,id'],
            'amount' => ['required', 'numeric', 'min:0'],
        ]);

        EmployeeSalaryComponent::updateOrCreate(
            [
                'employee_id' => $validated['employee_id'],
                'salary_component_id' => $validated['salary_component_id'],
            ],
            [
                'amount' => (float) $validated['amount'],
            ]
        );

        return redirect()->back()->with('success', 'Tunjangan karyawan berhasil diperbarui.');
    }
}
