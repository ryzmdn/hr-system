<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\AttendanceStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AttendanceSummary extends Model
{
    use HasFactory;

    protected $fillable = [
        'employee_id',
        'roster_id',
        'date',
        'clock_in_at',
        'clock_out_at',
        'late_minutes',
        'early_leave_minutes',
        'work_duration_minutes',
        'status',
        'is_overtime',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'date' => 'date',
            'clock_in_at' => 'datetime',
            'clock_out_at' => 'datetime',
            'late_minutes' => 'integer',
            'early_leave_minutes' => 'integer',
            'work_duration_minutes' => 'integer',
            'status' => AttendanceStatus::class,
            'is_overtime' => 'boolean',
        ];
    }

    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class);
    }

    public function roster(): BelongsTo
    {
        return $this->belongsTo(EmployeeRoster::class, 'roster_id');
    }
}

