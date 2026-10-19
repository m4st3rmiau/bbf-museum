<?php

namespace Tests\Feature;

use App\Models\Artwork;
use Illuminate\Foundation\Testing\LazilyRefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class ArtworkSubmissionTest extends TestCase
{
    use LazilyRefreshDatabase;

    public function test_a_complete_artwork_and_private_contact_record_are_saved(): void
    {
        Storage::fake('public');

        $response = $this->post('/obras', [
            'pet_name' => 'Milo',
            'age' => '12',
            'title' => 'Una pelota',
            'description' => 'Una historia que queremos conservar para siempre.',
            'pet_image' => UploadedFile::fake()->image('milo.jpg', 800, 800),
            'object_image' => UploadedFile::fake()->image('pelota.webp', 800, 600),
            'contact_name' => 'Ana Pérez',
            'email' => 'ana@example.com',
            'phone' => '55 1234 5678',
            'interest' => 'gallery',
        ]);

        $artwork = Artwork::query()->sole();
        $response->assertRedirect(route('thanks', $artwork));
        $this->assertSame('ana@example.com', $artwork->submission->email);
        $this->assertSame('Ana Pérez', DB::table('artwork_submissions')->value('contact_name'));
        $this->assertSame('ana@example.com', DB::table('artwork_submissions')->value('email'));
        $this->assertSame('55 1234 5678', DB::table('artwork_submissions')->value('phone'));
        Storage::disk('public')->assertExists($artwork->pet_image_path);
        Storage::disk('public')->assertExists($artwork->object_image_path);

        $this->get('/galeria')->assertInertia(fn (Assert $page) => $page
            ->component('Gallery')
            ->has('artworks', 1)
            ->where('artworks.0.petName', 'Milo')
            ->where('artworks.0.petImage', '/storage/'.$artwork->pet_image_path)
            ->where('artworks.0.objectImage', '/storage/'.$artwork->object_image_path)
            ->missing('artworks.0.email')
            ->missing('artworks.0.phone')
            ->missing('artworks.0.contactName'));
    }

    public function test_invalid_contact_and_images_are_rejected(): void
    {
        $response = $this->from('/exhibir/datos')->post('/obras', [
            'pet_name' => 'Milo', 'age' => '12', 'title' => 'Recuerdo',
            'description' => 'Historia', 'contact_name' => 'Ana',
            'email' => 'correo-invalido', 'phone' => '123', 'interest' => '',
        ]);

        $response->assertRedirect('/exhibir/datos');
        $response->assertSessionHasErrors(['pet_image', 'object_image', 'email', 'phone', 'interest']);
        $this->assertDatabaseEmpty('artworks');
    }
}
