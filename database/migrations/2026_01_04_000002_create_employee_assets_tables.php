<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('employee_assets', function (Blueprint $table) {
            $table->id();
            $table->foreignId('employee_id')->constrained('employees')->cascadeOnDelete();
            $table->string('asset_tag')->unique();
            $table->string('name');
            $table->string('category');
            $table->string('serial_number')->nullable();
            $table->date('handover_date');
            $table->date('returned_date')->nullable();
            $table->string('handover_condition')->default('GOOD');
            $table->string('return_condition')->nullable();
            $table->string('bast_number')->nullable();
            $table->string('status')->default('ASSIGNED');
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('employee_assets');
    }
};

