<?php

declare(strict_types=1);

namespace App\Http\Requests;

use App\Enums\EmployeeStatus;
use App\Enums\EmploymentStatus;
use App\Enums\TaxPtkpStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateEmployeeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->hasPermission('employee.manage') ?? false;
    }

    public function rules(): array
    {
        $employeeId = $this->route('employee')?->id;

        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', Rule::unique('employees', 'email')->ignore($employeeId)],
            'phone_number' => ['nullable', 'string', 'max:30'],
            'id_card_number' => ['required', 'string'],
            'tax_number' => ['nullable', 'string', 'max:30'],
            'bank_name' => ['nullable', 'string', 'max:100'],
            'bank_account_number' => ['nullable', 'string', 'max:50'],
            'bank_account_holder' => ['nullable', 'string', 'max:255'],
            'gender' => ['required', 'in:MALE,FEMALE'],
            'birth_place' => ['nullable', 'string', 'max:100'],
            'birth_date' => ['nullable', 'date'],
            'marital_status' => ['required', 'in:SINGLE,MARRIED,DIVORCED,WIDOWED'],
            'tax_ptkp_status' => ['required', Rule::enum(TaxPtkpStatus::class)],
            'employment_status' => ['required', Rule::enum(EmploymentStatus::class)],
            'probation_end_date' => ['nullable', 'date'],
            'contract_end_date' => ['nullable', 'date'],
            'status' => ['required', Rule::enum(EmployeeStatus::class)],
        ];
    }
}

