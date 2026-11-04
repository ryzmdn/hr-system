<?php

declare(strict_types=1);

namespace App\Http\Middleware;

use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    protected $rootView = 'app';

    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    public function share(Request $request): array
    {
        $user = $request->user();
        $permissions = [];
        $roles = [];

        if ($user instanceof User) {
            $user->loadMissing(['roles.permissions', 'employee.branch', 'employee.department', 'employee.position']);

            if ($user->isSuperAdmin()) {
                $permissions = ['*'];
            } else {
                $permissions = $user->roles
                    ->flatMap(fn ($role) => $role->permissions->pluck('code'))
                    ->unique()
                    ->values()
                    ->all();
            }

            $roles = $user->roles->map(fn ($role) => [
                'id' => $role->id,
                'code' => $role->code,
                'name' => $role->name,
                'branch_id' => $role->pivot->branch_id,
            ])->all();
        }

        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'auth' => [
                'user' => $user ? [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'email_verified_at' => $user->email_verified_at,
                    'roles' => $roles,
                    'is_super_admin' => $user->isSuperAdmin(),
                    'employee' => $user->employee ? [
                        'id' => $user->employee->id,
                        'nik' => $user->employee->nik,
                        'name' => $user->employee->name,
                        'branch' => $user->employee->branch ? [
                            'id' => $user->employee->branch->id,
                            'name' => $user->employee->branch->name,
                            'timezone' => $user->employee->branch->timezone->value,
                        ] : null,
                        'department' => $user->employee->department ? [
                            'id' => $user->employee->department->id,
                            'name' => $user->employee->department->name,
                        ] : null,
                        'position' => $user->employee->position ? [
                            'id' => $user->employee->position->id,
                            'name' => $user->employee->position->name,
                        ] : null,
                    ] : null,
                ] : null,
                'permissions' => $permissions,
            ],
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
            ],
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
        ];
    }
}
