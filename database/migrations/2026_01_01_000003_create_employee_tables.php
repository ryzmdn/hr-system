<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('employees', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->unique()->constrained('users')->nullOnDelete();
            $table->string('nik')->unique();
            $table->string('name');
            $table->string('email')->unique();
            $table->string('phone_number')->nullable();
            $table->text('id_card_number');
            $table->text('tax_number')->nullable();
            $table->string('bank_name')->nullable();
            $table->text('bank_account_number')->nullable();
            $table->string('bank_account_holder')->nullable();
            $table->string('gender')->default('MALE');
            $table->string('birth_place')->nullable();
            $table->date('birth_date')->nullable();
            $table->string('marital_status')->default('SINGLE');
            $table->string('tax_ptkp_status')->default('TK/0');
            $table->string('employment_status')->default('PROBATION');
            $table->date('join_date');
            $table->date('probation_end_date')->nullable();
            $table->date('contract_end_date')->nullable();
            $table->date('resign_date')->nullable();
            $table->foreignId('current_branch_id')->constrained('branches')->cascadeOnDelete();
            $table->foreignId('current_department_id')->constrained('departments')->cascadeOnDelete();
            $table->foreignId('current_position_id')->constrained('job_positions')->cascadeOnDelete();
            $table->foreignId('current_manager_id')->nullable()->constrained('employees')->nullOnDelete();
            $table->string('status')->default('ACTIVE');
            $table->timestamps();

            $table->index(['current_branch_id', 'status']);
            $table->index(['current_department_id', 'status']);
            $table->index(['current_position_id', 'status']);
            $table->index(['current_manager_id', 'status']);
        });

        Schema::create('employee_histories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('employee_id')->constrained('employees')->cascadeOnDelete();
            $table->string('change_type');
            $table->date('effective_start_date');
            $table->date('effective_end_date')->nullable();
            $table->text('base_salary');
            $table->foreignId('branch_id')->constrained('branches')->cascadeOnDelete();
            $table->foreignId('department_id')->constrained('departments')->cascadeOnDelete();
            $table->foreignId('position_id')->constrained('job_positions')->cascadeOnDelete();
            $table->foreignId('manager_id')->nullable()->constrained('employees')->nullOnDelete();
            $table->foreignId('approved_by_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->text('reason')->nullable();
            $table->timestamps();

            $table->index(['employee_id', 'effective_start_date', 'effective_end_date']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('employee_histories');
        Schema::dropIfExists('employees');
    }
};

