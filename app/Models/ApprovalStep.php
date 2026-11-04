<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\ApproverType;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ApprovalStep extends Model
{
    use HasFactory;

    protected $fillable = [
        'approval_workflow_id',
        'step_order',
        'name',
        'approver_type',
        'approver_role_id',
        'specific_user_id',
    ];

    protected function casts(): array
    {
        return [
            'step_order' => 'integer',
            'approver_type' => ApproverType::class,
        ];
    }

    public function workflow(): BelongsTo
    {
        return $this->belongsTo(ApprovalWorkflow::class, 'approval_workflow_id');
    }

    public function role(): BelongsTo
    {
        return $this->belongsTo(Role::class, 'approver_role_id');
    }

    public function specificUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'specific_user_id');
    }
}

