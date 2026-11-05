<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EmployeeReimbursementBalance extends Model
{
    use HasFactory;

    protected $fillable = [
        'employee_id',
        'reimbursement_type_id',
        'year',
        'allocated_amount',
        'used_amount',
        'remaining_amount',
    ];

    protected function casts(): array
    {
        return [
            'year' => 'integer',
            'allocated_amount' => 'float',
            'used_amount' => 'float',
            'remaining_amount' => 'float',
        ];
    }

    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class);
    }

    public function type(): BelongsTo
    {
        return $this->belongsTo(ReimbursementType::class, 'reimbursement_type_id');
    }
}

