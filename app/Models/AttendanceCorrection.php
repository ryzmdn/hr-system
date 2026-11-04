<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AttendanceCorrection extends Model
{
    use HasFactory;

    protected $fillable = [
        'employee_id',
        'date',
        'correction_type',
        'proposed_clock_in',
        'proposed_clock_out',
        'reason',
        'attachment_path',
        'status',
        'approved_by_user_id',
    ];

    protected function casts(): array
    {
        return [
            'date' => 'date',
            'proposed_clock_in' => 'datetime',
            'proposed_clock_out' => 'datetime',
        ];
    }

    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class);
    }

    public function approvedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by_user_id');
    }
}

