<?php

declare(strict_types=1);

namespace App\Http\Requests;

use App\Enums\JkkRiskGrade;
use App\Enums\Timezone;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateBranchRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->hasPermission('org.manage') ?? false;
    }

    public function rules(): array
    {
        $branchId = $this->route('branch')?->id;

        return [
            'name' => ['required', 'string', 'max:255'],
            'latitude' => ['required', 'numeric', 'between:-90,90'],
            'longitude' => ['required', 'numeric', 'between:-180,180'],
            'radius_meters' => ['required', 'integer', 'min:10', 'max:10000'],
            'timezone' => ['required', Rule::enum(Timezone::class)],
            'jkk_risk_grade' => ['required', Rule::enum(JkkRiskGrade::class)],
            'address' => ['nullable', 'string', 'max:1000'],
            'is_active' => ['boolean'],
        ];
    }
}

