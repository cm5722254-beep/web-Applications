<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class AnimeFactory extends Factory
{
    public function definition(): array
    {
        $title = fake()->words(3, true);

        return [
            'slug'              => Str::slug($title) . '-' . fake()->unique()->numberBetween(1, 9999),
            'title_en'          => ucwords($title),
            'title_km'          => null,
            'title_original'    => null,
            'synopsis_en'       => fake()->paragraphs(2, true),
            'poster_url'        => null,
            'type'              => fake()->randomElement(['anime', 'donghua', 'movie']),
            'status'            => 'published',
            'airing_status'     => fake()->randomElement(['ongoing', 'completed', 'upcoming']),
            'age_rating'        => 'PG-13',
            'country_of_origin' => fake()->randomElement(['JP', 'CN', 'KR']),
            'release_year'      => fake()->numberBetween(2000, 2025),
            'is_premium'        => false,
            'views_count'       => 0,
            'favorites_count'   => 0,
        ];
    }

    public function draft(): static
    {
        return $this->state(fn (array $attributes) => ['status' => 'draft']);
    }

    public function premium(): static
    {
        return $this->state(fn (array $attributes) => ['is_premium' => true]);
    }
}
