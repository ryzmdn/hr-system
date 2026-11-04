<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ShiftSwapRequest extends Model
{
    use HasFactory;

    protected $fillable = [
        'requester_employee_id',
        'target_employee_id',
        'requester_roster_id',
        'target_roster_id',
        'reason',
        'status',
        'approved_by_user_id',
    ];

    public function requester(): BelongsTo
    {
        return $this->belongsTo(Employee::class, 'requester_employee_id');
    }

    public function target(): BelongsTo
    {
        return $this->belongsTo(Employee::class, 'target_employee_id');
    }

    public function requesterRoster(): BelongsTo
    {
        return $this->belongsTo(EmployeeRoster::class, 'requester_roster_id');
    }

    public function targetRoster(): BelongsTo
    {
        return $this->belongsTo(EmployeeRoster::class, 'target_roster_id');
    }

    public function approvedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by_user_id');
    }
}

