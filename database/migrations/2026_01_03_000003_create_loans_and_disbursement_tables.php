<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('employee_loans', function (Blueprint $table) {
            $table->id();
            $table->foreignId('employee_id')->constrained('employees')->cascadeOnDelete();
            $table->string('loan_number')->unique();
            $table->decimal('total_amount', 15, 2);
            $table->unsignedSmallInteger('installment_months')->default(1);
            $table->decimal('monthly_amount', 15, 2);
            $table->decimal('remaining_amount', 15, 2);
            $table->date('start_month');
            $table->text('reason')->nullable();
            $table->string('status')->default('PENDING');
            $table->foreignId('approved_by_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });

        Schema::create('loan_installments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('loan_id')->constrained('employee_loans')->cascadeOnDelete();
            $table->foreignId('payroll_period_id')->nullable()->constrained('payroll_periods')->nullOnDelete();
            $table->unsignedSmallInteger('installment_number');
            $table->decimal('amount', 15, 2);
            $table->boolean('is_paid')->default(false);
            $table->dateTime('paid_at')->nullable();
            $table->timestamps();
        });

        Schema::create('bank_disbursement_batches', function (Blueprint $table) {
            $table->id();
            $table->foreignId('payroll_run_id')->constrained('payroll_runs')->cascadeOnDelete();
            $table->string('bank_name');
            $table->string('batch_reference')->unique();
            $table->unsignedInteger('total_records');
            $table->decimal('total_amount', 15, 2);
            $table->string('file_path');
            $table->foreignId('exported_by_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('bank_disbursement_batches');
        Schema::dropIfExists('loan_installments');
        Schema::dropIfExists('employee_loans');
    }
};

