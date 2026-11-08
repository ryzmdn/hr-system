<?php

declare(strict_types=1);

use App\Http\Controllers\ApprovalController;
use App\Http\Controllers\AttendanceController;
use App\Http\Controllers\AuditLogController;
use App\Http\Controllers\EmployeeAssetController;
use App\Http\Controllers\EmployeeController;
use App\Http\Controllers\EmployeeLoanController;
use App\Http\Controllers\EssAttendanceController;
use App\Http\Controllers\ExecutiveAnalyticsController;
use App\Http\Controllers\LeaveController;
use App\Http\Controllers\OffboardingController;
use App\Http\Controllers\OrganizationController;
use App\Http\Controllers\OvertimeController;
use App\Http\Controllers\PayrollController;
use App\Http\Controllers\PayslipController;
use App\Http\Controllers\PerformanceController;
use App\Http\Controllers\RecruitmentController;
use App\Http\Controllers\ReimbursementController;
use App\Http\Controllers\SalaryComponentController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::inertia('/', 'welcome')->name('home');
Route::get('/verify/paklaring/{token}', [OffboardingController::class, 'showLetter'])->name('paklaring.verify');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/dashboard', fn () => Inertia::render('dashboard'))->name('dashboard');

    Route::prefix('dashboard')->group(function () {
        Route::prefix('organization')->name('organization.')->group(function () {
            Route::get('/', [OrganizationController::class, 'index'])->middleware('permission:org.view')->name('index');
            Route::post('/branches', [OrganizationController::class, 'storeBranch'])->middleware('permission:org.manage')->name('branches.store');
            Route::put('/branches/{branch}', [OrganizationController::class, 'updateBranch'])->middleware('permission:org.manage')->name('branches.update');
            Route::post('/departments', [OrganizationController::class, 'storeDepartment'])->middleware('permission:org.manage')->name('departments.store');
            Route::post('/positions', [OrganizationController::class, 'storePosition'])->middleware('permission:org.manage')->name('positions.store');
        });

        Route::prefix('employees')->name('employees.')->group(function () {
            Route::get('/', [EmployeeController::class, 'index'])->middleware('permission:employee.view')->name('index');
            Route::get('/create', [EmployeeController::class, 'create'])->middleware('permission:employee.manage')->name('create');
            Route::post('/', [EmployeeController::class, 'store'])->middleware('permission:employee.manage')->name('store');
            Route::get('/{employee}', [EmployeeController::class, 'show'])->name('show');
            Route::put('/{employee}', [EmployeeController::class, 'update'])->middleware('permission:employee.manage')->name('update');
            Route::post('/{employee}/transition', [EmployeeController::class, 'transition'])->middleware('permission:employee.manage')->name('transition');
        });

        Route::prefix('attendance')->name('attendance.')->group(function () {
            Route::get('/', [AttendanceController::class, 'index'])->middleware('permission:attendance.manage')->name('index');
            Route::get('/roster', [AttendanceController::class, 'roster'])->middleware('permission:attendance.manage')->name('roster');
            Route::post('/roster', [AttendanceController::class, 'storeRoster'])->middleware('permission:attendance.manage')->name('roster.store');
        });

        Route::prefix('ess')->name('ess.')->group(function () {
            Route::get('/attendance', [EssAttendanceController::class, 'index'])->name('attendance');
            Route::post('/attendance/clock-in', [EssAttendanceController::class, 'clockIn'])->name('clock-in');
            Route::post('/attendance/clock-out', [EssAttendanceController::class, 'clockOut'])->name('clock-out');
            Route::get('/payslips', [PayslipController::class, 'essPayslips'])->name('payslips');
        });

        Route::prefix('payroll')->name('payroll.')->middleware('permission:payroll.calculate')->group(function () {
            Route::get('/', [PayrollController::class, 'index'])->name('index');
            Route::post('/periods', [PayrollController::class, 'storePeriod'])->name('periods.store');
            Route::post('/periods/{period}/process', [PayrollController::class, 'processRun'])->name('periods.process');
            Route::post('/runs/{run}/lock', [PayrollController::class, 'lockRun'])->name('runs.lock');
            Route::post('/runs/{run}/export-bank', [PayrollController::class, 'exportBank'])->name('runs.export-bank');
            Route::get('/disbursements/{batch}/download', [PayrollController::class, 'downloadBatch'])->name('disbursements.download');
            Route::get('/components', [SalaryComponentController::class, 'index'])->name('components.index');
            Route::post('/components', [SalaryComponentController::class, 'store'])->name('components.store');
            Route::put('/components/{component}', [SalaryComponentController::class, 'update'])->name('components.update');
            Route::delete('/components/{component}', [SalaryComponentController::class, 'destroy'])->name('components.destroy');
            Route::post('/components/assign', [SalaryComponentController::class, 'assignToEmployee'])->name('components.assign');
        });

        Route::prefix('payslips')->name('payslips.')->group(function () {
            Route::get('/{payslip}', [PayslipController::class, 'show'])->name('show');
            Route::post('/{payslip}/download', [PayslipController::class, 'download'])->name('download');
        });

        Route::prefix('loans')->name('loans.')->group(function () {
            Route::get('/', [EmployeeLoanController::class, 'index'])->middleware('permission:loan.view')->name('index');
            Route::post('/', [EmployeeLoanController::class, 'store'])->middleware('permission:loan.request')->name('store');
            Route::post('/{loan}/approve', [EmployeeLoanController::class, 'approve'])->middleware('permission:loan.approve')->name('approve');
        });

        Route::prefix('claims')->name('claims.')->group(function () {
            Route::get('/', [ReimbursementController::class, 'index'])->middleware('permission:reimbursement.view')->name('index');
            Route::post('/', [ReimbursementController::class, 'store'])->middleware('permission:reimbursement.request')->name('store');
            Route::post('/types', [ReimbursementController::class, 'storeType'])->middleware('permission:reimbursement.manage')->name('types.store');
            Route::post('/{reimbursement}/approve', [ReimbursementController::class, 'approve'])->middleware('permission:reimbursement.approve')->name('approve');
            Route::post('/{reimbursement}/pay', [ReimbursementController::class, 'markPaid'])->middleware('permission:reimbursement.approve')->name('pay');
        });

        Route::prefix('assets')->name('assets.')->group(function () {
            Route::get('/', [EmployeeAssetController::class, 'index'])->middleware('permission:asset.view')->name('index');
            Route::post('/', [EmployeeAssetController::class, 'store'])->middleware('permission:asset.manage')->name('store');
            Route::post('/{asset}/return', [EmployeeAssetController::class, 'returnAsset'])->middleware('permission:asset.manage')->name('return');
        });

        Route::prefix('offboarding')->name('offboarding.')->group(function () {
            Route::get('/', [OffboardingController::class, 'index'])->middleware('permission:offboarding.manage')->name('index');
            Route::post('/', [OffboardingController::class, 'store'])->name('store');
            Route::get('/{offboarding}', [OffboardingController::class, 'show'])->middleware('permission:offboarding.manage')->name('show');
            Route::post('/clearance/{item}/clear', [OffboardingController::class, 'clearItem'])->name('clearance.clear');
            Route::post('/{offboarding}/finalize', [OffboardingController::class, 'finalize'])->middleware('permission:offboarding.manage')->name('finalize');
        });

        Route::prefix('recruitment')->name('recruitment.')->group(function () {
            Route::get('/', [RecruitmentController::class, 'index'])->middleware('permission:recruitment.view')->name('index');
            Route::post('/postings', [RecruitmentController::class, 'storePosting'])->middleware('permission:recruitment.manage')->name('postings.store');
            Route::post('/apply', [RecruitmentController::class, 'apply'])->name('apply');
            Route::post('/candidates/{candidate}/stage', [RecruitmentController::class, 'updateStage'])->middleware('permission:recruitment.manage')->name('candidates.stage');
            Route::post('/candidates/{candidate}/hire', [RecruitmentController::class, 'hire'])->middleware('permission:recruitment.manage')->name('candidates.hire');
        });

        Route::prefix('performance')->name('performance.')->group(function () {
            Route::get('/', [PerformanceController::class, 'index'])->middleware('permission:performance.view')->name('index');
            Route::post('/periods', [PerformanceController::class, 'storePeriod'])->middleware('permission:performance.manage')->name('periods.store');
            Route::post('/appraisals', [PerformanceController::class, 'storeAppraisal'])->middleware('permission:performance.evaluate')->name('appraisals.store');
            Route::post('/appraisals/{appraisal}/evaluate', [PerformanceController::class, 'evaluate'])->middleware('permission:performance.evaluate')->name('appraisals.evaluate');
        });

        Route::prefix('analytics')->name('analytics.')->group(function () {
            Route::get('/', [ExecutiveAnalyticsController::class, 'index'])->middleware('permission:analytics.view')->name('index');
            Route::get('/wlkp/export', [ExecutiveAnalyticsController::class, 'exportWlkp'])->middleware('permission:analytics.export')->name('wlkp.export');
        });

        Route::prefix('leaves')->name('leaves.')->group(function () {
            Route::get('/', [LeaveController::class, 'index'])->middleware('permission:leave.view')->name('index');
            Route::post('/', [LeaveController::class, 'store'])->middleware('permission:leave.request')->name('store');
        });

        Route::prefix('overtime')->name('overtime.')->group(function () {
            Route::get('/', [OvertimeController::class, 'index'])->middleware('permission:overtime.view')->name('index');
            Route::post('/', [OvertimeController::class, 'store'])->middleware('permission:overtime.request')->name('store');
        });

        Route::prefix('approvals')->name('approvals.')->group(function () {
            Route::get('/', [ApprovalController::class, 'inbox'])->middleware('permission:approval.inbox')->name('inbox');
            Route::post('/{transaction}/approve', [ApprovalController::class, 'approve'])->middleware('permission:approval.inbox')->name('approve');
            Route::post('/{transaction}/reject', [ApprovalController::class, 'reject'])->middleware('permission:approval.inbox')->name('reject');
            Route::post('/delegations', [ApprovalController::class, 'storeDelegation'])->middleware('permission:approval.inbox')->name('delegations.store');
            Route::delete('/delegations/{delegation}', [ApprovalController::class, 'revokeDelegation'])->middleware('permission:approval.inbox')->name('delegations.revoke');
            Route::get('/workflows', [ApprovalController::class, 'workflows'])->middleware('permission:approval.manage_workflow')->name('workflows');
        });

        Route::get('/audit-logs', [AuditLogController::class, 'index'])->middleware('permission:audit.view')->name('audit-logs.index');
    });
});

require __DIR__.'/settings.php';
