<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\SalaryComponentType;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class SalaryComponent extends Model
{
    use HasFactory;

    protected $fillable = [
        'code',
        'name',
        'type',
        'is_taxable',
        'is_bpjs_tk_base',
        'is_bpjs_kes_base',
        'default_amount',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'type' => SalaryComponentType::class,
            'is_taxable' => 'boolean',
            'is_bpjs_tk_base' => 'boolean',
            'is_bpjs_kes_base' => 'boolean',
            'default_amount' => 'float',
            'is_active' => 'boolean',
        ];
    }

    public function employeeComponents(): HasMany
    {
        return $this->hasMany(EmployeeSalaryComponent::class);
    }
}

