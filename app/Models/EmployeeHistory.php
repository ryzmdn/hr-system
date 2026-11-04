<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\CareerChangeType;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EmployeeHistory extends Model
{
    use HasFactory;

    protected $fillable = [
        'employee_id',
        'change_type',
        'effective_start_date',
        'effective_end_date',
        'base_salary',
        'branch_id',
        'department_id',
        'position_id',
        'manager_id',
        'approved_by_user_id',
        'reason',
    ];

    protected function casts(): array
    {
        return [
            'change_type' => CareerChangeType::class,
            'effective_start_date' => 'date',
            'effective_end_date' => 'date',
            'base_salary' => 'encrypted',
        ];
    }

    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class);
    }

    public function branch(): BelongsTo
    {
        return $this->belongsTo(Branch::class);
    }

    public function department(): BelongsTo
    {
        return $this->belongsTo(Department::class);
    }

    public function position(): BelongsTo
    {
        return $this->belongsTo(JobPosition::class);
    }

    public function manager(): BelongsTo
    {
        return $this->belongsTo(Employee::class, 'manager_id');
    }

    public function approvedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by_user_id');
    }
}

