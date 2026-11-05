<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PerformanceAppraisalItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'performance_appraisal_id',
        'kpi_name',
        'target_description',
        'weight_percentage',
        'target_value',
        'actual_value',
        'score',
        'weighted_score',
    ];

    protected function casts(): array
    {
        return [
            'weight_percentage' => 'float',
            'target_value' => 'float',
            'actual_value' => 'float',
            'score' => 'float',
            'weighted_score' => 'float',
        ];
    }

    public function appraisal(): BelongsTo
    {
        return $this->belongsTo(PerformanceAppraisal::class, 'performance_appraisal_id');
    }
}

