<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('reimbursement_types', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique();
            $table->string('name');
            $table->decimal('annual_limit', 15, 2)->default(0);
            $table->boolean('requires_receipt')->default(true);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('employee_reimbursement_balances', function (Blueprint $table) {
            $table->id();
            $table->foreignId('employee_id')->constrained('employees')->cascadeOnDelete();
            $table->foreignId('reimbursement_type_id')->constrained('reimbursement_types')->cascadeOnDelete();
            $table->integer('year');
            $table->decimal('allocated_amount', 15, 2)->default(0);
            $table->decimal('used_amount', 15, 2)->default(0);
            $table->decimal('remaining_amount', 15, 2)->default(0);
            $table->timestamps();

            $table->unique(['employee_id', 'reimbursement_type_id', 'year']);
        });

        Schema::create('reimbursement_requests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('employee_id')->constrained('employees')->cascadeOnDelete();
            $table->foreignId('reimbursement_type_id')->constrained('reimbursement_types')->cascadeOnDelete();
            $table->string('claim_number')->unique();
            $table->date('receipt_date');
            $table->decimal('amount', 15, 2);
            $table->decimal('approved_amount', 15, 2)->default(0);
            $table->text('description');
            $table->string('receipt_file_path')->nullable();
            $table->string('status')->default('SUBMITTED');
            $table->foreignId('approved_by_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->dateTime('paid_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('reimbursement_requests');
        Schema::dropIfExists('employee_reimbursement_balances');
        Schema::dropIfExists('reimbursement_types');
    }
};

