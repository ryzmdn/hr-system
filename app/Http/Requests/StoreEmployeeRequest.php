<?php

declare(strict_types=1);

namespace App\Http\Requests;

use App\Enums\EmployeeStatus;
use App\Enums\EmploymentStatus;
use App\Enums\TaxPtkpStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreEmployeeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->hasPermission('employee.manage') ?? false;
    }

    public function rules(): array
    {
        return [
            'nik' => ['required', 'string', 'max:50', 'unique:employees,nik'],
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:employees,email'],
            'phone_number' => ['nullable', 'string', 'max:30'],
            'id_card_number' => ['required', 'string', 'digits:16'],
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
            'join_date' => ['required', 'date'],
            'probation_end_date' => ['nullable', 'date', 'after_or_equal:join_date'],
            'contract_end_date' => ['nullable', 'date', 'after_or_equal:join_date'],
            'current_branch_id' => ['required', 'exists:branches,id'],
            'current_department_id' => ['required', 'exists:departments,id'],
            'current_position_id' => ['required', 'exists:job_positions,id'],
            'current_manager_id' => ['nullable', 'exists:employees,id'],
            'base_salary' => ['required', 'numeric', 'min:0'],
            'create_user_account' => ['boolean'],
            'user_password' => ['nullable', 'string', 'min:8', 'required_if:create_user_account,true'],
            'role_id' => ['nullable', 'exists:roles,id', 'required_if:create_user_account,true'],
        ];
    }
}

