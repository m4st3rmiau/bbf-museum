<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::transaction(function (): void {
            DB::table('artworks')
                ->where('id', 'demo-luna')
                ->where('pet_name', 'Luna')
                ->where('title', 'Su lugar en el mundo')
                ->update([
                    'pet_image_path' => '/luna.jpeg',
                    'updated_at' => now(),
                ]);

            DB::table('artworks')
                ->where('id', 'demo-nina')
                ->where('pet_name', 'Nina')
                ->where('title', 'Siempre a mi lado')
                ->update([
                    'pet_image_path' => '/nina.jpeg',
                    'updated_at' => now(),
                ]);

            DB::table('artworks')
                ->where('pet_name', 'Cloe')
                ->where('title', 'Mascada Rosa')
                ->delete();
        });
    }

    /**
     * Restore the previous demo photo paths.
     *
     * The deleted Cloe artwork cannot be reconstructed because its contents are unknown.
     */
    public function down(): void
    {
        DB::transaction(function (): void {
            DB::table('artworks')
                ->where('id', 'demo-luna')
                ->where('pet_name', 'Luna')
                ->where('title', 'Su lugar en el mundo')
                ->update([
                    'pet_image_path' => '/images/cat-1.webp',
                    'updated_at' => now(),
                ]);

            DB::table('artworks')
                ->where('id', 'demo-nina')
                ->where('pet_name', 'Nina')
                ->where('title', 'Siempre a mi lado')
                ->update([
                    'pet_image_path' => '/images/cat-2.webp',
                    'updated_at' => now(),
                ]);
        });
    }
};
