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
        Schema::create('attribution_visits', function (Blueprint $table): void {
            $table->id();
            $table->foreignUuid('visitor_id')->constrained('attribution_visitors')->cascadeOnDelete();
            $table->string('session_id', 64);

            $table->string('utm_source', 100)->nullable();
            $table->string('utm_medium', 100)->nullable();
            $table->string('utm_campaign', 150)->nullable();
            $table->string('utm_content', 150)->nullable();
            $table->string('utm_term', 150)->nullable();

            $table->string('fbclid')->nullable();
            $table->string('gclid')->nullable();
            $table->string('ttclid')->nullable();
            $table->string('msclkid')->nullable();
            $table->string('fbc')->nullable();
            $table->string('fbp')->nullable();

            $table->text('landing_page');
            $table->string('referrer_domain')->nullable();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->string('device_type', 20)->nullable();
            $table->string('browser', 50)->nullable();
            $table->string('os', 50)->nullable();
            $table->string('country', 50)->nullable();
            $table->string('city', 100)->nullable();
            $table->timestamp('visited_at');
            $table->timestamps();

            $table->index(['visitor_id', 'visited_at']);
            $table->index(['session_id', 'visited_at']);
            $table->index(['utm_source', 'utm_campaign', 'visited_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('attribution_visits');
    }
};
