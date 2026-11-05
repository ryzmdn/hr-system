<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\EmployeeStatus;
use App\Enums\EmploymentStatus;
use App\Enums\TaxPtkpStatus;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Employee extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'nik',
        'name',
        'email',
        'phone_number',
        'id_card_number',
        'tax_number',
        'bank_name',
        'bank_account_number',
        'bank_account_holder',
        'gender',
        'birth_place',
        'birth_date',
        'marital_status',
        'tax_ptkp_status',
        'employment_status',
        'join_date',
        'probation_end_date',
        'contract_end_date',
        'resign_date',
        'current_branch_id',
        'current_department_id',
        'current_position_id',
        'current_manager_id',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'id_card_number' => 'encrypted',
            'tax_number' => 'encrypted',
            'bank_account_number' => 'encrypted',
            'birth_date' => 'date',
            'join_date' => 'date',
            'probation_end_date' => 'date',
            'contract_end_date' => 'date',
            'resign_date' => 'date',
            'tax_ptkp_status' => TaxPtkpStatus::class,
            'employment_status' => EmploymentStatus::class,
            'status' => EmployeeStatus::class,
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function branch(): BelongsTo
    {
        return $this->belongsTo(Branch::class, 'current_branch_id');
    }

    public function department(): BelongsTo
    {
        return $this->belongsTo(Department::class, 'current_department_id');
    }

    public function position(): BelongsTo
    {
        return $this->belongsTo(JobPosition::class, 'current_position_id');
    }

    public function manager(): BelongsTo
    {
        return $this->belongsTo(Employee::class, 'current_manager_id');
    }

    public function subordinates(): HasMany
    {
        return $this->hasMany(Employee::class, 'current_manager_id');
    }

    public function histories(): HasMany
    {
        return $this->hasMany(EmployeeHistory::class)->orderBy('effective_start_date', 'desc');
    }

    public function activeHistory(?Carbon $date = null): HasOne
    {
        $targetDate = $date ?? Carbon::today();

        return $this->hasOne(EmployeeHistory::class)
            ->where('effective_start_date', '<=', $targetDate)
            ->where(function ($query) use ($targetDate) {
                $query->whereNull('effective_end_date')
                    ->orWhere('effective_end_date', '>=', $targetDate);
            })
            ->latest('effective_start_date');
    }

    public function getEffectiveSalary(?Carbon $date = null): float
    {
        $history = $this->activeHistory($date)->first();

        return $history ? (float) $history->base_salary : 0.0;
    }

    public function salaryComponents(): HasMany
    {
        return $this->hasMany(EmployeeSalaryComponent::class);
    }

    public function loans(): HasMany
    {
        return $this->hasMany(EmployeeLoan::class);
    }

    public function payslips(): HasMany
    {
        return $this->hasMany(Payslip::class);
    }

    public function reimbursementBalances(): HasMany
    {
        return $this->hasMany(EmployeeReimbursementBalance::class);
    }

    public function reimbursementRequests(): HasMany
    {
        return $this->hasMany(ReimbursementRequest::class);
    }

    public function assets(): HasMany
    {
        return $this->hasMany(EmployeeAsset::class);
    }

    public function offboardingRequests(): HasMany
    {
        return $this->hasMany(OffboardingRequest::class);
    }

    public function experienceLetters(): HasMany
    {
        return $this->hasMany(ExperienceLetter::class);
    }
}

