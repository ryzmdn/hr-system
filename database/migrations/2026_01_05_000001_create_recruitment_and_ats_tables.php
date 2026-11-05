<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('recruitment_job_postings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('branch_id')->nullable()->constrained('branches')->nullOnDelete();
            $table->foreignId('department_id')->nullable()->constrained('departments')->nullOnDelete();
            $table->foreignId('position_id')->nullable()->constrained('job_positions')->nullOnDelete();
            $table->string('title');
            $table->string('slug')->unique();
            $table->string('employment_status')->default('PKWTT');
            $table->integer('quota')->default(1);
            $table->integer('min_experience_years')->default(0);
            $table->decimal('salary_range_min', 15, 2)->default(0);
            $table->decimal('salary_range_max', 15, 2)->default(0);
            $table->text('description');
            $table->text('requirements')->nullable();
            $table->string('status')->default('DRAFT');
            $table->date('deadline_date')->nullable();
            $table->timestamps();
        });

        Schema::create('recruitment_candidates', function (Blueprint $table) {
            $table->id();
            $table->foreignId('job_posting_id')->constrained('recruitment_job_postings')->cascadeOnDelete();
            $table->string('name');
            $table->string('email');
            $table->string('phone_number')->nullable();
            $table->string('resume_file_path')->nullable();
            $table->string('portfolio_url')->nullable();
            $table->string('stage')->default('APPLIED');
            $table->integer('rating')->default(0);
            $table->decimal('expected_salary', 15, 2)->default(0);
            $table->decimal('offered_salary', 15, 2)->default(0);
            $table->text('notes')->nullable();
            $table->foreignId('hired_employee_id')->nullable()->constrained('employees')->nullOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('recruitment_candidates');
        Schema::dropIfExists('recruitment_job_postings');
    }
};

