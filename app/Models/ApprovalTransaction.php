<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\ApprovalStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class ApprovalTransaction extends Model
{
    use HasFactory;

    protected $fillable = [
        'workflow_id',
        'reference_type',
        'reference_id',
        'current_step_order',
        'status',
        'requester_user_id',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'current_step_order' => 'integer',
            'status' => ApprovalStatus::class,
        ];
    }

    public function workflow(): BelongsTo
    {
        return $this->belongsTo(ApprovalWorkflow::class, 'workflow_id');
    }

    public function requester(): BelongsTo
    {
        return $this->belongsTo(User::class, 'requester_user_id');
    }

    public function actions(): HasMany
    {
        return $this->hasMany(ApprovalAction::class, 'transaction_id');
    }

    public function reference(): MorphTo
    {
        return $this->morphTo();
    }
}

