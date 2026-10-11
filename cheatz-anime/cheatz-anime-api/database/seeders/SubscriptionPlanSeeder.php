<?php

namespace Database\Seeders;

use App\Models\SubscriptionPlan;
use Illuminate\Database\Seeder;

class SubscriptionPlanSeeder extends Seeder
{
    public function run(): void
    {
        SubscriptionPlan::firstOrCreate(
            ['slug' => 'premium-monthly'],
            [
                'name_en'        => 'Premium Monthly',
                'name_km'        => 'ព្រីមៀមមួយខែ',
                'description_en' => 'Unlimited access to all anime and donghua with Khmer subtitles.',
                'description_km' => 'ទស្សនាអ្នីម៉េ និង ដុងហ្វ័រគ្មានដែន ជាមួយប្រអប់ភាសាខ្មែរ។',
                'price_cents'    => 100, // $1.00 USD
                'currency'       => 'USD',
                'interval'       => 'monthly',
                'interval_count' => 1,
                'is_active'      => true,
                'is_featured'    => true,
                'features'       => [
                    'Unlimited anime & donghua',
                    'HD streaming',
                    'Khmer subtitles',
                    'No ads',
                    'Watch history sync',
                    'Early access to new episodes',
                ],
            ]
        );

        SubscriptionPlan::firstOrCreate(
            ['slug' => 'premium-yearly'],
            [
                'name_en'        => 'Premium Yearly',
                'name_km'        => 'ព្រីមៀមមួយឆ្នាំ',
                'description_en' => '12 months of premium access at a discounted rate.',
                'description_km' => 'ព្រីមៀម ១២ខែ ក្នុងតម្លៃបញ្ចុះ',
                'price_cents'    => 1000, // $10.00 USD (2 months free)
                'currency'       => 'USD',
                'interval'       => 'yearly',
                'interval_count' => 1,
                'is_active'      => true,
                'is_featured'    => false,
                'features'       => [
                    'Everything in Monthly',
                    '2 months free',
                    'Priority support',
                ],
            ]
        );

        $this->command->info('Subscription plans seeded.');
    }
}
