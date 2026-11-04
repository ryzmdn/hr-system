<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('attendance_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('employee_id')->constrained('employees')->cascadeOnDelete();
            $table->foreignId('roster_id')->nullable()->constrained('employee_rosters')->nullOnDelete();
            $table->dateTime('recorded_at');
            $table->string('type');
            $table->decimal('latitude', 10, 8);
            $table->decimal('longitude', 11, 8);
            $table->unsignedInteger('distance_to_branch_meters');
            $table->boolean('is_within_geofence')->default(true);
            $table->string('selfie_path')->nullable();
            $table->string('device_info')->nullable();
            $table->boolean('is_mock_location')->default(false);
            $table->string('verification_status')->default('VALID');
            $table->string('notes')->nullable();
            $table->timestamps();

            $table->index(['employee_id', 'recorded_at']);
            $table->index(['recorded_at', 'verification_status']);
        });

        Schema::create('attendance_summaries', function (Blueprint $table) {
            $table->id();
            $table->foreignId('employee_id')->constrained('employees')->cascadeOnDelete();
            $table->foreignId('roster_id')->nullable()->constrained('employee_rosters')->nullOnDelete();
            $table->date('date');
            $table->dateTime('clock_in_at')->nullable();
            $table->dateTime('clock_out_at')->nullable();
            $table->unsignedInteger('late_minutes')->default(0);
            $table->unsignedInteger('early_leave_minutes')->default(0);
            $table->unsignedInteger('work_duration_minutes')->default(0);
            $table->string('status')->default('ABSENT');
            $table->boolean('is_overtime')->default(false);
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->unique(['employee_id', 'date']);
            $table->index(['date', 'status']);
        });

        Schema::create('attendance_corrections', function (Blueprint $table) {
            $table->id();
            $table->foreignId('employee_id')->constrained('employees')->cascadeOnDelete();
            $table->date('date');
            $table->string('correction_type');
            $table->dateTime('proposed_clock_in')->nullable();
            $table->dateTime('proposed_clock_out')->nullable();
            $table->text('reason');
            $table->string('attachment_path')->nullable();
            $table->string('status')->default('PENDING');
            $table->foreignId('approved_by_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('attendance_corrections');
        Schema::dropIfExists('attendance_summaries');
        Schema::dropIfExists('attendance_logs');
    }
};

