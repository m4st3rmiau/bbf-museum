<?php

namespace Database\Factories;

use App\Models\AttributionVisit;
use App\Models\AttributionVisitor;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<AttributionVisit>
 */
class AttributionVisitFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'visitor_id' => AttributionVisitor::factory(),
            'session_id' => Str::random(40),
            'landing_page' => fake()->url(),
            'ip_address' => fake()->ipv4(),
            'user_agent' => fake()->userAgent(),
            'visited_at' => now(),
        ];
    }
}
