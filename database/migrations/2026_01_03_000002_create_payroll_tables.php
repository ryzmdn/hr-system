<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payroll_periods', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->date('start_date');
            $table->date('end_date');
            $table->date('cut_off_date');
            $table->string('status')->default('DRAFT');
            $table->timestamps();
        });

        Schema::create('payroll_runs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('payroll_period_id')->constrained('payroll_periods')->cascadeOnDelete();
            $table->foreignId('branch_id')->nullable()->constrained('branches')->nullOnDelete();
            $table->decimal('total_gross', 15, 2)->default(0);
            $table->decimal('total_net', 15, 2)->default(0);
            $table->decimal('total_tax', 15, 2)->default(0);
            $table->decimal('total_bpjs_company', 15, 2)->default(0);
            $table->decimal('total_bpjs_employee', 15, 2)->default(0);
            $table->string('status')->default('DRAFT');
            $table->foreignId('processed_by_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->dateTime('processed_at')->nullable();
            $table->timestamps();
        });

        Schema::create('payslips', function (Blueprint $table) {
            $table->id();
            $table->foreignId('payroll_run_id')->constrained('payroll_runs')->cascadeOnDelete();
            $table->foreignId('employee_id')->constrained('employees')->cascadeOnDelete();
            $table->decimal('basic_salary', 15, 2);
            $table->decimal('gross_income', 15, 2);
            $table->decimal('total_deductions', 15, 2);
            $table->decimal('take_home_pay', 15, 2);
            $table->decimal('overtime_pay', 15, 2)->default(0);
            $table->string('tax_pph21_method')->default('GROSS');
            $table->string('tax_pph21_ter_category')->default('A');
            $table->decimal('tax_pph21_rate', 6, 4)->default(0);
            $table->decimal('tax_pph21_amount', 15, 2)->default(0);
            $table->decimal('bpjs_jkk_company', 15, 2)->default(0);
            $table->decimal('bpjs_jkm_company', 15, 2)->default(0);
            $table->decimal('bpjs_jht_company', 15, 2)->default(0);
            $table->decimal('bpjs_jht_employee', 15, 2)->default(0);
            $table->decimal('bpjs_jp_company', 15, 2)->default(0);
            $table->decimal('bpjs_jp_employee', 15, 2)->default(0);
            $table->decimal('bpjs_kes_company', 15, 2)->default(0);
            $table->decimal('bpjs_kes_employee', 15, 2)->default(0);
            $table->decimal('loan_deduction', 15, 2)->default(0);
            $table->json('components_snapshot');
            $table->boolean('is_published')->default(false);
            $table->dateTime('downloaded_at')->nullable();
            $table->timestamps();

            $table->unique(['payroll_run_id', 'employee_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payslips');
        Schema::dropIfExists('payroll_runs');
        Schema::dropIfExists('payroll_periods');
    }
};

