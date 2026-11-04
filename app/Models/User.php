<?php

declare(strict_types=1);

namespace App\Models;

use Database\Factories\UserFactory;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Fortify\Contracts\PasskeyUser;
use Laravel\Fortify\PasskeyAuthenticatable;
use Laravel\Fortify\TwoFactorAuthenticatable;

class User extends Authenticatable implements MustVerifyEmail, PasskeyUser
{
    use HasFactory, Notifiable, PasskeyAuthenticatable, TwoFactorAuthenticatable;

    protected $fillable = [
        'name',
        'email',
        'password',
    ];

    protected $hidden = [
        'password',
        'two_factor_secret',
        'two_factor_recovery_codes',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'two_factor_confirmed_at' => 'datetime',
        ];
    }

    public function roles(): BelongsToMany
    {
        return $this->belongsToMany(Role::class, 'user_has_roles')
            ->withPivot('branch_id');
    }

    public function employee(): HasOne
    {
        return $this->hasOne(Employee::class);
    }

    public function delegationsGiven(): HasMany
    {
        return $this->hasMany(ApprovalDelegation::class, 'delegator_user_id');
    }

    public function delegationsReceived(): HasMany
    {
        return $this->hasMany(ApprovalDelegation::class, 'delegatee_user_id');
    }

    public function isSuperAdmin(): bool
    {
        return $this->hasRole('super_admin');
    }

    public function hasRole(string $roleCode, ?int $branchId = null): bool
    {
        if ($this->relationLoaded('roles')) {
            return $this->roles->contains(function (Role $role) use ($roleCode, $branchId) {
                if ($role->code !== $roleCode) {
                    return false;
                }
                if ($branchId === null) {
                    return true;
                }
                $pivotBranchId = $role->pivot->branch_id ?? null;

                return $pivotBranchId === null || (int) $pivotBranchId === $branchId;
            });
        }

        return $this->roles()
            ->where('code', $roleCode)
            ->when($branchId !== null, function ($query) use ($branchId) {
                $query->where(function ($q) use ($branchId) {
                    $q->whereNull('user_has_roles.branch_id')
                        ->orWhere('user_has_roles.branch_id', $branchId);
                });
            })
            ->exists();
    }

    public function hasPermission(string $permissionCode, ?int $branchId = null): bool
    {
        if ($this->isSuperAdmin()) {
            return true;
        }

        $roles = $this->relationLoaded('roles') ? $this->roles : $this->roles()->with('permissions')->get();

        foreach ($roles as $role) {
            $pivotBranchId = $role->pivot->branch_id ?? null;
            if ($branchId !== null && $pivotBranchId !== null && (int) $pivotBranchId !== $branchId) {
                continue;
            }

            if ($role->permissions->contains('code', $permissionCode)) {
                return true;
            }
        }

        return false;
    }
}
