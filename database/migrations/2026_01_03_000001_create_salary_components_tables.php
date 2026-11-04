<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('salary_components', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique();
            $table->string('name');
            $table->string('type');
            $table->boolean('is_taxable')->default(true);
            $table->boolean('is_bpjs_tk_base')->default(true);
            $table->boolean('is_bpjs_kes_base')->default(true);
            $table->decimal('default_amount', 15, 2)->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('employee_salary_components', function (Blueprint $table) {
            $table->id();
            $table->foreignId('employee_id')->constrained('employees')->cascadeOnDelete();
            $table->foreignId('salary_component_id')->constrained('salary_components')->cascadeOnDelete();
            $table->decimal('amount', 15, 2);
            $table->timestamps();

            $table->unique(['employee_id', 'salary_component_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('employee_salary_components');
        Schema::dropIfExists('salary_components');
    }
};

