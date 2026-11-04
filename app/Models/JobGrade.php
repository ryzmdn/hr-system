<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class JobGrade extends Model
{
    use HasFactory;

    protected $fillable = [
        'company_id',
        'grade_level',
        'name',
        'min_salary',
        'max_salary',
    ];

    protected function casts(): array
    {
        return [
            'grade_level' => 'integer',
            'min_salary' => 'float',
            'max_salary' => 'float',
        ];
    }

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    public function positions(): HasMany
    {
        return $this->hasMany(JobPosition::class);
    }
}

