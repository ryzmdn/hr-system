<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class EmployeeRoster extends Model
{
    use HasFactory;

    protected $fillable = [
        'employee_id',
        'shift_template_id',
        'date',
        'is_off_day',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'date' => 'date',
            'is_off_day' => 'boolean',
        ];
    }

    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class);
    }

    public function shift(): BelongsTo
    {
        return $this->belongsTo(ShiftTemplate::class, 'shift_template_id');
    }

    public function logs(): HasMany
    {
        return $this->hasMany(AttendanceLog::class, 'roster_id');
    }

    public function summary(): HasOne
    {
        return $this->hasOne(AttendanceSummary::class, 'roster_id');
    }
}

