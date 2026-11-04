<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\LoanStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class EmployeeLoan extends Model
{
    use HasFactory;

    protected $fillable = [
        'employee_id',
        'loan_number',
        'total_amount',
        'installment_months',
        'monthly_amount',
        'remaining_amount',
        'start_month',
        'reason',
        'status',
        'approved_by_user_id',
    ];

    protected function casts(): array
    {
        return [
            'total_amount' => 'float',
            'installment_months' => 'integer',
            'monthly_amount' => 'float',
            'remaining_amount' => 'float',
            'start_month' => 'date',
            'status' => LoanStatus::class,
        ];
    }

    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class);
    }

    public function installments(): HasMany
    {
        return $this->hasMany(LoanInstallment::class, 'loan_id');
    }

    public function approvedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by_user_id');
    }
}

