<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('lead_attributions', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('attribution_visit_id')->constrained()->cascadeOnDelete();
            $table->foreignId('artwork_submission_id')->unique()->constrained()->cascadeOnDelete();
            $table->string('conversion_type', 50)->default('artwork_submission');
            $table->timestamp('converted_at');
            $table->unsignedInteger('time_to_convert_seconds');
            $table->timestamps();

            $table->index(['conversion_type', 'converted_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('lead_attributions');
    }
};
