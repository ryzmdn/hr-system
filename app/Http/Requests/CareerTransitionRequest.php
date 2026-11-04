<?php

declare(strict_types=1);

namespace App\Http\Requests;

use App\Enums\CareerChangeType;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class CareerTransitionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->hasPermission('employee.manage') ?? false;
    }

    public function rules(): array
    {
        return [
            'change_type' => ['required', Rule::enum(CareerChangeType::class)],
            'effective_start_date' => ['required', 'date'],
            'base_salary' => ['required', 'numeric', 'min:0'],
            'branch_id' => ['required', 'exists:branches,id'],
            'department_id' => ['required', 'exists:departments,id'],
            'position_id' => ['required', 'exists:job_positions,id'],
            'manager_id' => ['nullable', 'exists:employees,id'],
            'reason' => ['nullable', 'string', 'max:1000'],
        ];
    }
}

