<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\AuditLog;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AuditLogController extends Controller
{
    public function index(Request $request): Response
    {
        $logs = AuditLog::with('user')
            ->when($request->input('event'), fn ($q, $event) => $q->where('event', 'LIKE', "%{$event}%"))
            ->when($request->input('user_id'), fn ($q, $uid) => $q->where('user_id', $uid))
            ->orderBy('id', 'desc')
            ->paginate(20)
            ->withQueryString();

        $logs->through(fn (AuditLog $log) => [
            'id' => $log->id,
            'event' => $log->event,
            'auditable_type' => class_basename($log->auditable_type),
            'auditable_id' => $log->auditable_id,
            'old_values' => $log->old_values,
            'new_values' => $log->new_values,
            'user_name' => $log->user?->name ?? 'System',
            'ip_address' => $log->ip_address,
            'created_at' => $log->created_at->toDateTimeString(),
        ]);

        return Inertia::render('audit/index', [
            'logs' => $logs,
            'filters' => $request->only(['event', 'user_id']),
        ]);
    }
}

