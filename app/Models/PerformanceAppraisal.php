<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\AppraisalStatus;
use App\Enums\PerformanceRatingGrade;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PerformanceAppraisal extends Model
{
    use HasFactory;

    protected $fillable = [
        'performance_period_id',
        'employee_id',
        'evaluator_id',
        'overall_score',
        'rating_grade',
        'feedback',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'overall_score' => 'float',
            'rating_grade' => PerformanceRatingGrade::class,
            'status' => AppraisalStatus::class,
        ];
    }

    public function period(): BelongsTo
    {
        return $this->belongsTo(PerformancePeriod::class, 'performance_period_id');
    }

    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class);
    }

    public function evaluator(): BelongsTo
    {
        return $this->belongsTo(Employee::class, 'evaluator_id');
    }

    public function items(): HasMany
    {
        return $this->hasMany(PerformanceAppraisalItem::class);
    }
}

