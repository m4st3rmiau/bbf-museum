<?php

namespace Tests\Feature;

use App\Models\Artwork;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Foundation\Testing\LazilyRefreshDatabase;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class ArtworkSubmissionContactMigrationTest extends TestCase
{
    use LazilyRefreshDatabase;

    public function test_existing_encrypted_contact_fields_are_converted_to_plain_text(): void
    {
        $artwork = Artwork::create([
            'pet_name' => 'Milo',
            'age' => '12',
            'title' => 'Una pelota',
            'description' => 'Una historia que queremos conservar para siempre.',
            'pet_image_path' => 'artworks/pets/milo.webp',
            'object_image_path' => 'artworks/objects/pelota.webp',
            'is_published' => true,
        ]);
        DB::table('artwork_submissions')->insert([
            'artwork_id' => $artwork->id,
            'contact_name' => Crypt::encryptString('Ana Pérez'),
            'email' => Crypt::encryptString('ana@example.com'),
            'phone' => Crypt::encryptString('55 1234 5678'),
            'interest' => 'gallery',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        /** @var Migration $migration */
        $migration = require database_path('migrations/2026_10_19_172119_decrypt_artwork_submission_contact_fields.php');
        $migration->up();

        $this->assertDatabaseHas('artwork_submissions', [
            'artwork_id' => $artwork->id,
            'contact_name' => 'Ana Pérez',
            'email' => 'ana@example.com',
            'phone' => '55 1234 5678',
        ]);
    }
}
