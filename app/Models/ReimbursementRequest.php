<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\ReimbursementStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphOne;

class ReimbursementRequest extends Model
{
    use HasFactory;

    protected $fillable = [
        'employee_id',
        'reimbursement_type_id',
        'claim_number',
        'receipt_date',
        'amount',
        'approved_amount',
        'description',
        'receipt_file_path',
        'status',
        'approved_by_user_id',
        'paid_at',
    ];

    protected function casts(): array
    {
        return [
            'receipt_date' => 'date',
            'amount' => 'float',
            'approved_amount' => 'float',
            'status' => ReimbursementStatus::class,
            'paid_at' => 'datetime',
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

    public function approvedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by_user_id');
    }

    public function approvalTransaction(): MorphOne
    {
        return $this->morphOne(ApprovalTransaction::class, 'reference');
    }
}

