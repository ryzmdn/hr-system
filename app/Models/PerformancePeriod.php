<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\PerformancePeriodStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PerformancePeriod extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'start_date',
        'end_date',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'start_date' => 'date',
            'end_date' => 'date',
            'status' => PerformancePeriodStatus::class,
        ];
    }

    public function appraisals(): HasMany
    {
        return $this->hasMany(PerformanceAppraisal::class);
    }
}

