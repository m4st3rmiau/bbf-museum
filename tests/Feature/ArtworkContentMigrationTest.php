<?php

namespace Tests\Feature;

use Illuminate\Database\Migrations\Migration;
use Illuminate\Foundation\Testing\LazilyRefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class ArtworkContentMigrationTest extends TestCase
{
    use LazilyRefreshDatabase;

    public function test_deployment_updates_demo_photos_and_removes_only_the_cloe_artwork(): void
    {
        DB::table('artworks')->insert([
            [
                'id' => 'demo-luna',
                'pet_name' => 'Luna',
                'age' => 15,
                'title' => 'Su lugar en el mundo',
                'description' => 'Recuerdo de Luna.',
                'pet_image_path' => '/images/cat-1.webp',
                'object_image_path' => '/images/blanket.webp',
                'is_demo' => true,
                'is_published' => true,
            ],
            [
                'id' => 'demo-nina',
                'pet_name' => 'Nina',
                'age' => 14,
                'title' => 'Siempre a mi lado',
                'description' => 'Recuerdo de Nina.',
                'pet_image_path' => '/images/cat-2.webp',
                'object_image_path' => '/images/collar.webp',
                'is_demo' => true,
                'is_published' => true,
            ],
            [
                'id' => 'demo-cloe',
                'pet_name' => 'Cloe',
                'age' => 10,
                'title' => 'Mascada Rosa',
                'description' => 'Recuerdo de Cloe.',
                'pet_image_path' => '/images/cloe.webp',
                'object_image_path' => '/images/mascada.webp',
                'is_demo' => true,
                'is_published' => true,
            ],
            [
                'id' => 'demo-milo',
                'pet_name' => 'Milo',
                'age' => 12,
                'title' => 'Una pelota, mil aventuras',
                'description' => 'Recuerdo de Milo.',
                'pet_image_path' => '/images/dog-1.webp',
                'object_image_path' => '/images/ball.webp',
                'is_demo' => true,
                'is_published' => true,
            ],
        ]);

        /** @var Migration $migration */
        $migration = require database_path('migrations/2026_10_16_171903_update_demo_artwork_photos_and_remove_cloe_artwork.php');
        $migration->up();

        $this->assertDatabaseHas('artworks', [
            'id' => 'demo-luna',
            'pet_image_path' => '/luna.jpeg',
        ]);
        $this->assertDatabaseHas('artworks', [
            'id' => 'demo-nina',
            'pet_image_path' => '/nina.jpeg',
        ]);
        $this->assertDatabaseMissing('artworks', [
            'pet_name' => 'Cloe',
            'title' => 'Mascada Rosa',
        ]);

        $this->assertDatabaseHas('artworks', [
            'id' => 'demo-milo',
            'pet_image_path' => '/images/dog-1.webp',
        ]);
    }
}
