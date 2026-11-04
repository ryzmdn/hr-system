<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('leave_types', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique();
            $table->string('name');
            $table->unsignedSmallInteger('default_quota')->default(12);
            $table->boolean('is_paid')->default(true);
            $table->boolean('requires_attachment')->default(false);
            $table->unsignedSmallInteger('max_consecutive_days')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('leave_balances', function (Blueprint $table) {
            $table->id();
            $table->foreignId('employee_id')->constrained('employees')->cascadeOnDelete();
            $table->foreignId('leave_type_id')->constrained('leave_types')->cascadeOnDelete();
            $table->unsignedSmallInteger('year');
            $table->unsignedSmallInteger('allocated_days')->default(0);
            $table->unsignedSmallInteger('used_days')->default(0);
            $table->unsignedSmallInteger('carry_over_days')->default(0);
            $table->unsignedSmallInteger('remaining_days')->default(0);
            $table->timestamps();

            $table->unique(['employee_id', 'leave_type_id', 'year']);
        });

        Schema::create('leave_requests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('employee_id')->constrained('employees')->cascadeOnDelete();
            $table->foreignId('leave_type_id')->constrained('leave_types')->cascadeOnDelete();
            $table->date('start_date');
            $table->date('end_date');
            $table->unsignedSmallInteger('total_days');
            $table->text('reason');
            $table->string('attachment_path')->nullable();
            $table->string('emergency_contact')->nullable();
            $table->string('status')->default('PENDING');
            $table->timestamps();

            $table->index(['employee_id', 'start_date', 'end_date']);
        });

        Schema::create('overtime_requests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('employee_id')->constrained('employees')->cascadeOnDelete();
            $table->date('date');
            $table->time('start_time');
            $table->time('end_time');
            $table->boolean('is_holiday')->default(false);
            $table->decimal('duration_hours', 5, 2);
            $table->text('reason');
            $table->string('status')->default('PENDING');
            $table->time('actual_start_time')->nullable();
            $table->time('actual_end_time')->nullable();
            $table->decimal('calculated_overtime_hours', 5, 2)->default(0);
            $table->timestamps();

            $table->index(['employee_id', 'date']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('overtime_requests');
        Schema::dropIfExists('leave_requests');
        Schema::dropIfExists('leave_balances');
        Schema::dropIfExists('leave_types');
    }
};

