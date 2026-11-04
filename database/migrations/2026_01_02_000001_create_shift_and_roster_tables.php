<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('shift_templates', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique();
            $table->string('name');
            $table->time('start_time');
            $table->time('end_time');
            $table->boolean('is_cross_day')->default(false);
            $table->unsignedSmallInteger('break_minutes')->default(60);
            $table->unsignedSmallInteger('grace_period_minutes')->default(15);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('employee_rosters', function (Blueprint $table) {
            $table->id();
            $table->foreignId('employee_id')->constrained('employees')->cascadeOnDelete();
            $table->foreignId('shift_template_id')->nullable()->constrained('shift_templates')->nullOnDelete();
            $table->date('date');
            $table->boolean('is_off_day')->default(false);
            $table->string('notes')->nullable();
            $table->timestamps();

            $table->unique(['employee_id', 'date']);
            $table->index(['date', 'shift_template_id']);
        });

        Schema::create('shift_swap_requests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('requester_employee_id')->constrained('employees')->cascadeOnDelete();
            $table->foreignId('target_employee_id')->constrained('employees')->cascadeOnDelete();
            $table->foreignId('requester_roster_id')->constrained('employee_rosters')->cascadeOnDelete();
            $table->foreignId('target_roster_id')->constrained('employee_rosters')->cascadeOnDelete();
            $table->text('reason')->nullable();
            $table->string('status')->default('PENDING');
            $table->foreignId('approved_by_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('shift_swap_requests');
        Schema::dropIfExists('employee_rosters');
        Schema::dropIfExists('shift_templates');
    }
};

