<?php

namespace Database\Seeders;

use App\Models\Genre;
use Illuminate\Database\Seeder;

class GenreSeeder extends Seeder
{
    public function run(): void
    {
        $genres = [
            ['name_en' => 'Action',       'name_km' => 'សកម្មភាព',         'icon' => '⚔️'],
            ['name_en' => 'Adventure',    'name_km' => 'ការផ្សងព្រេង',      'icon' => '🗺️'],
            ['name_en' => 'Comedy',       'name_km' => 'គ្រោះថ្នាក់',        'icon' => '😂'],
            ['name_en' => 'Drama',        'name_km' => 'រឿងរ៉ាវ',           'icon' => '🎭'],
            ['name_en' => 'Fantasy',      'name_km' => 'ប្រឌិត',             'icon' => '🧙'],
            ['name_en' => 'Horror',       'name_km' => 'គួរឲ្យភ័យខ្លាច',    'icon' => '👻'],
            ['name_en' => 'Magic',        'name_km' => 'មន្ត',               'icon' => '✨'],
            ['name_en' => 'Mecha',        'name_km' => 'មេកា',               'icon' => '🤖'],
            ['name_en' => 'Mystery',      'name_km' => 'អាថ៌កំបាំង',         'icon' => '🔍'],
            ['name_en' => 'Romance',      'name_km' => 'ស្នេហា',             'icon' => '💕'],
            ['name_en' => 'Sci-Fi',       'name_km' => 'វិទ្យាសាស្ត្រ',      'icon' => '🚀'],
            ['name_en' => 'Slice of Life','name_km' => 'ជីវិតប្រចាំថ្ងៃ',   'icon' => '🌸'],
            ['name_en' => 'Sports',       'name_km' => 'កីឡា',               'icon' => '⚽'],
            ['name_en' => 'Supernatural', 'name_km' => 'លើធម្មជាតិ',         'icon' => '🌟'],
            ['name_en' => 'Thriller',     'name_km' => 'ភ័យចិត្ត',           'icon' => '😰'],
            ['name_en' => 'Historical',   'name_km' => 'ប្រវត្តិសាស្ត្រ',    'icon' => '📜'],
            ['name_en' => 'Isekai',       'name_km' => 'អ៊ីសេកៃ',            'icon' => '🌀'],
            ['name_en' => 'Martial Arts', 'name_km' => 'គុណ​ប្រយុទ្ធ',       'icon' => '🥋'],
            ['name_en' => 'School',       'name_km' => 'សាលារៀន',            'icon' => '🏫'],
            ['name_en' => 'Music',        'name_km' => 'តន្ត្រី',             'icon' => '🎵'],
        ];

        foreach ($genres as $genre) {
            Genre::firstOrCreate(
                ['name_en' => $genre['name_en']],
                ['name_km' => $genre['name_km'], 'icon' => $genre['icon']]
            );
        }

        $this->command->info(count($genres) . ' genres seeded.');
    }
}
