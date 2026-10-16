<?php

namespace Database\Seeders;

use App\Models\Artwork;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $items = [
            ['demo-milo', 'Milo', 12, 'Una pelota, mil aventuras', 'Nunca necesitó mucho para ser feliz. Su pelota, un poco de sol y nosotros a su lado. La guardamos para recordar que las mejores cosas siempre fueron las más sencillas.', '/images/dog-1.webp', '/images/ball.webp'],
            ['demo-luna', 'Luna', 15, 'Su lugar en el mundo', 'Esta mantita fue su rincón favorito. Aún parece guardar el calor de todas esas tardes en las que se quedaba dormida junto a nosotros.', '/luna.jpeg', '/images/blanket.webp'],
            ['demo-bruno', 'Bruno', 11, 'La hora más feliz', 'El sonido de su plato era suficiente para verlo correr por toda la casa. Cada comida era una pequeña celebración que compartíamos.', '/images/dog-2.webp', '/images/bowl.webp'],
            ['demo-nina', 'Nina', 14, 'Siempre a mi lado', 'Su collar nos acompañó en tantos caminos. Ahora lo conservamos como un recuerdo de todos los lugares que descubrimos juntos.', '/nina.jpeg', '/images/collar.webp'],
            ['demo-toby', 'Toby', 10, 'Vamos a dar una vuelta', 'En cuanto veía su correa, todo se convertía en alegría. Los paseos eran su manera de recordarnos que siempre hay algo nuevo por descubrir.', '/images/dog-3.webp', '/images/leash.webp'],
            ['demo-simba', 'Simba', 13, 'Un compañero de sueños', 'Era su juguete favorito. Lo llevaba de una habitación a otra, como si también necesitara mostrarle cada pequeño descubrimiento.', '/images/cat-3.webp', '/images/plush.webp'],
        ];

        foreach ($items as [$id, $pet, $age, $title, $description, $petImagePath, $objectImagePath]) {
            Artwork::query()->updateOrCreate(['id' => $id], [
                'pet_name' => $pet,
                'age' => $age,
                'title' => $title,
                'description' => $description,
                'pet_image_path' => $petImagePath,
                'object_image_path' => $objectImagePath,
                'is_demo' => true,
                'is_published' => true,
            ]);
        }
    }
}
