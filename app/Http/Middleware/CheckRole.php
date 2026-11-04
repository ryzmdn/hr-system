<?php

declare(strict_types=1);

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckRole
{
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $user = $request->user();

        if (! $user) {
            abort(Response::HTTP_UNAUTHORIZED);
        }

        if ($user->isSuperAdmin()) {
            return $next($request);
        }

        $branchId = $request->route('branch')?->id
            ?? $request->input('branch_id')
            ?? $request->user()->employee?->current_branch_id;

        foreach ($roles as $role) {
            if ($user->hasRole($role, $branchId ? (int) $branchId : null)) {
                return $next($request);
            }
        }

        abort(Response::HTTP_FORBIDDEN, 'Akses ditolak: Peran Anda tidak memiliki otoritas pada modul ini.');
    }
}

