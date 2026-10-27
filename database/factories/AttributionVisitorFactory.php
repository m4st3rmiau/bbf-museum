<?php

namespace Database\Factories;

use App\Models\AttributionVisitor;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<AttributionVisitor>
 */
class AttributionVisitorFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'id' => (string) Str::uuid(),
            'first_visited_at' => now(),
            'last_visited_at' => now(),
        ];
    }
}
