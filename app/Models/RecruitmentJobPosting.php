<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\EmploymentStatus;
use App\Enums\JobPostingStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class RecruitmentJobPosting extends Model
{
    use HasFactory;

    protected $fillable = [
        'branch_id',
        'department_id',
        'position_id',
        'title',
        'slug',
        'employment_status',
        'quota',
        'min_experience_years',
        'salary_range_min',
        'salary_range_max',
        'description',
        'requirements',
        'status',
        'deadline_date',
    ];

    protected function casts(): array
    {
        return [
            'employment_status' => EmploymentStatus::class,
            'quota' => 'integer',
            'min_experience_years' => 'integer',
            'salary_range_min' => 'float',
            'salary_range_max' => 'float',
            'status' => JobPostingStatus::class,
            'deadline_date' => 'date',
        ];
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

    public function candidates(): HasMany
    {
        return $this->hasMany(RecruitmentCandidate::class, 'job_posting_id');
    }
}

