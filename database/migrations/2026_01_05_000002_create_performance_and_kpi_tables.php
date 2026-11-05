<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('performance_periods', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->date('start_date');
            $table->date('end_date');
            $table->string('status')->default('DRAFT');
            $table->timestamps();
        });

        Schema::create('performance_appraisals', function (Blueprint $table) {
            $table->id();
            $table->foreignId('performance_period_id')->constrained('performance_periods')->cascadeOnDelete();
            $table->foreignId('employee_id')->constrained('employees')->cascadeOnDelete();
            $table->foreignId('evaluator_id')->nullable()->constrained('employees')->nullOnDelete();
            $table->decimal('overall_score', 5, 2)->default(0);
            $table->string('rating_grade')->default('B');
            $table->text('feedback')->nullable();
            $table->string('status')->default('DRAFT');
            $table->timestamps();

            $table->unique(['performance_period_id', 'employee_id']);
        });

        Schema::create('performance_appraisal_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('performance_appraisal_id')->constrained('performance_appraisals')->cascadeOnDelete();
            $table->string('kpi_name');
            $table->text('target_description')->nullable();
            $table->decimal('weight_percentage', 5, 2);
            $table->decimal('target_value', 10, 2);
            $table->decimal('actual_value', 10, 2)->default(0);
            $table->decimal('score', 5, 2)->default(0);
            $table->decimal('weighted_score', 5, 2)->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('performance_appraisal_items');
        Schema::dropIfExists('performance_appraisals');
        Schema::dropIfExists('performance_periods');
    }
};

