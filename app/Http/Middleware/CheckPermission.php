<?php

declare(strict_types=1);

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckPermission
{
    public function handle(Request $request, Closure $next, string $permission): Response
    {
        $user = $request->user();

        if (! $user) {
            abort(Response::HTTP_UNAUTHORIZED);
        }

        $branchId = $request->route('branch')?->id
            ?? $request->input('branch_id')
            ?? $request->user()->employee?->current_branch_id;

        if (! $user->hasPermission($permission, $branchId ? (int) $branchId : null)) {
            abort(Response::HTTP_FORBIDDEN, 'Akses ditolak: Anda tidak memiliki izin untuk tindakan ini.');
        }

        return $next($request);
    }
}

