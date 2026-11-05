<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\OffboardingStatus;
use App\Enums\OffboardingType;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\MorphOne;

class OffboardingRequest extends Model
{
    use HasFactory;

    protected $fillable = [
        'employee_id',
        'type',
        'reason',
        'notice_date',
        'effective_date',
        'status',
        'approved_by_user_id',
    ];

    protected function casts(): array
    {
        return [
            'type' => OffboardingType::class,
            'notice_date' => 'date',
            'effective_date' => 'date',
            'status' => OffboardingStatus::class,
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

    public function clearanceItems(): HasMany
    {
        return $this->hasMany(ExitClearanceItem::class);
    }

    public function severance(): HasOne
    {
        return $this->hasOne(SeveranceSettlement::class);
    }

    public function experienceLetter(): HasOne
    {
        return $this->hasOne(ExperienceLetter::class);
    }

    public function approvalTransaction(): MorphOne
    {
        return $this->morphOne(ApprovalTransaction::class, 'reference');
    }
}

