<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphOne;

class OvertimeRequest extends Model
{
    use HasFactory;

    protected $fillable = [
        'employee_id',
        'date',
        'start_time',
        'end_time',
        'is_holiday',
        'duration_hours',
        'reason',
        'status',
        'actual_start_time',
        'actual_end_time',
        'calculated_overtime_hours',
    ];

    protected function casts(): array
    {
        return [
            'date' => 'date',
            'is_holiday' => 'boolean',
            'duration_hours' => 'float',
            'calculated_overtime_hours' => 'float',
        ];
    }

    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class);
    }

    public function approvalTransaction(): MorphOne
    {
        return $this->morphOne(ApprovalTransaction::class, 'reference');
    }
}

