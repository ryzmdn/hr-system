<?php

declare(strict_types=1);

use App\Http\Controllers\ApprovalController;
use App\Http\Controllers\AuditLogController;
use App\Http\Controllers\EmployeeController;
use App\Http\Controllers\OrganizationController;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');

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

    Route::prefix('approvals')->name('approvals.')->group(function () {
        Route::get('/', [ApprovalController::class, 'inbox'])->middleware('permission:approval.inbox')->name('inbox');
        Route::post('/{transaction}/approve', [ApprovalController::class, 'approve'])->name('approve');
        Route::post('/{transaction}/reject', [ApprovalController::class, 'reject'])->name('reject');
        Route::post('/delegations', [ApprovalController::class, 'storeDelegation'])->name('delegations.store');
        Route::delete('/delegations/{delegation}', [ApprovalController::class, 'revokeDelegation'])->name('delegations.revoke');
        Route::get('/workflows', [ApprovalController::class, 'workflows'])->middleware('permission:approval.manage_workflow')->name('workflows');
    });

    Route::get('/audit-logs', [AuditLogController::class, 'index'])->middleware('permission:audit.view')->name('audit-logs.index');
});

require __DIR__.'/settings.php';
