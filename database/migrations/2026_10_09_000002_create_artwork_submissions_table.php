<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('artwork_submissions', function (Blueprint $table): void {
            $table->id();
            $table->string('artwork_id', 64)->unique();
            $table->text('contact_name');
            $table->text('email');
            $table->text('phone');
            $table->string('interest', 20)->index();
            $table->timestamps();
            $table->foreign('artwork_id')->references('id')->on('artworks')->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('artwork_submissions');
    }
};
