<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('offboarding_requests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('employee_id')->constrained('employees')->cascadeOnDelete();
            $table->string('type');
            $table->text('reason');
            $table->date('notice_date');
            $table->date('effective_date');
            $table->string('status')->default('SUBMITTED');
            $table->foreignId('approved_by_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });

        Schema::create('exit_clearance_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('offboarding_request_id')->constrained('offboarding_requests')->cascadeOnDelete();
            $table->string('department');
            $table->string('item_name');
            $table->boolean('is_cleared')->default(false);
            $table->foreignId('cleared_by_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->dateTime('cleared_at')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        Schema::create('severance_settlements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('offboarding_request_id')->constrained('offboarding_requests')->cascadeOnDelete();
            $table->decimal('base_salary', 15, 2);
            $table->decimal('service_years', 5, 2);
            $table->integer('service_months');
            $table->decimal('up_multiplier', 4, 2)->default(0);
            $table->decimal('up_amount', 15, 2)->default(0);
            $table->decimal('upmk_multiplier', 4, 2)->default(0);
            $table->decimal('upmk_amount', 15, 2)->default(0);
            $table->decimal('uph_amount', 15, 2)->default(0);
            $table->decimal('pkwt_compensation_amount', 15, 2)->default(0);
            $table->decimal('total_gross_severance', 15, 2)->default(0);
            $table->decimal('tax_pph21_severance', 15, 2)->default(0);
            $table->decimal('net_severance', 15, 2)->default(0);
            $table->string('status')->default('DRAFT');
            $table->dateTime('paid_at')->nullable();
            $table->timestamps();
        });

        Schema::create('experience_letters', function (Blueprint $table) {
            $table->id();
            $table->foreignId('offboarding_request_id')->constrained('offboarding_requests')->cascadeOnDelete();
            $table->foreignId('employee_id')->constrained('employees')->cascadeOnDelete();
            $table->string('letter_number')->unique();
            $table->date('issued_date');
            $table->date('start_date');
            $table->date('end_date');
            $table->string('last_position');
            $table->string('last_department');
            $table->string('verification_token')->unique();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('experience_letters');
        Schema::dropIfExists('severance_settlements');
        Schema::dropIfExists('exit_clearance_items');
        Schema::dropIfExists('offboarding_requests');
    }
};

