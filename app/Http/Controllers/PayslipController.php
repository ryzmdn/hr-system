<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\Payslip;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PayslipController extends Controller
{
    public function show(Payslip $payslip, Request $request): Response
    {
        $employee = $payslip->employee;
        $user = $request->user();

        if ($employee->user_id !== $user->id && ! $user->hasPermission('view_all_payslips') && ! $user->isSuperAdmin()) {
            abort(403, 'Anda tidak memiliki hak akses untuk melihat slip gaji ini.');
        }

        $payslip->load([
            'run.period',
            'employee.branch',
            'employee.department',
            'employee.position',
        ]);

        return Inertia::render('payslips/show', [
            'payslip' => $payslip,
        ]);
    }

    public function download(Payslip $payslip, Request $request): RedirectResponse
    {
        $employee = $payslip->employee;
        $user = $request->user();

        if ($employee->user_id !== $user->id && ! $user->hasPermission('view_all_payslips') && ! $user->isSuperAdmin()) {
            abort(403, 'Akses ditolak.');
        }

        $payslip->update(['downloaded_at' => Carbon::now()]);

        return redirect()->back()->with('success', 'Slip gaji berhasil ditandai telah diunduh.');
    }

    public function essPayslips(Request $request): Response
    {
        $user = $request->user();
        $employee = $user->employee;

        $payslips = [];
        if ($employee) {
            $payslips = Payslip::query()
                ->where('employee_id', $employee->id)
                ->where('is_published', true)
                ->with(['run.period'])
                ->latest()
                ->get();
        }

        return Inertia::render('ess/payslips', [
            'employee' => $employee,
            'payslips' => $payslips,
        ]);
    }
}

