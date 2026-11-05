<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\CandidateStage;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RecruitmentCandidate extends Model
{
    use HasFactory;

    protected $fillable = [
        'job_posting_id',
        'name',
        'email',
        'phone_number',
        'resume_file_path',
        'portfolio_url',
        'stage',
        'rating',
        'expected_salary',
        'offered_salary',
        'notes',
        'hired_employee_id',
    ];

    protected function casts(): array
    {
        return [
            'stage' => CandidateStage::class,
            'rating' => 'integer',
            'expected_salary' => 'float',
            'offered_salary' => 'float',
        ];
    }

    public function jobPosting(): BelongsTo
    {
        return $this->belongsTo(RecruitmentJobPosting::class, 'job_posting_id');
    }

    public function hiredEmployee(): BelongsTo
    {
        return $this->belongsTo(Employee::class, 'hired_employee_id');
    }
}

