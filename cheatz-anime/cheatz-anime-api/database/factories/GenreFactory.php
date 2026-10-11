<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class GenreFactory extends Factory
{
    public function definition(): array
    {
        $name = fake()->unique()->word();

        return [
            'name_en'   => ucfirst($name),
            'name_km'   => null,
            'slug'      => Str::slug($name),
            'is_active' => true,
        ];
    }
}
