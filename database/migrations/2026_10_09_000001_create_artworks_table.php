<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('artworks', function (Blueprint $table): void {
            $table->string('id', 64)->primary();
            $table->string('pet_name', 60);
            $table->decimal('age', 3, 1);
            $table->string('title', 80);
            $table->text('description');
            $table->string('pet_image_path');
            $table->string('object_image_path');
            $table->boolean('is_demo')->default(false);
            $table->boolean('is_published')->default(true);
            $table->timestamps();
            $table->index(['is_published', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('artworks');
    }
};
