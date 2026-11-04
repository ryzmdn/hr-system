<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\JkkRiskGrade;
use App\Enums\Timezone;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Branch extends Model
{
    use HasFactory;

    protected $fillable = [
        'company_id',
        'code',
        'name',
        'latitude',
        'longitude',
        'radius_meters',
        'timezone',
        'jkk_risk_grade',
        'address',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'latitude' => 'float',
            'longitude' => 'float',
            'radius_meters' => 'integer',
            'timezone' => Timezone::class,
            'jkk_risk_grade' => JkkRiskGrade::class,
            'is_active' => 'boolean',
        ];
    }

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    public function employees(): HasMany
    {
        return $this->hasMany(Employee::class, 'current_branch_id');
    }
}

