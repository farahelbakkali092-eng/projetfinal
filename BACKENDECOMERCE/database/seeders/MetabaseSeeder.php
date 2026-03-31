<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Brand;
use App\Models\Category;
use App\Models\Product;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Diagnostic;
use App\Models\Role;

class MetabaseSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Essential Seeders
        $this->call([
            RoleSeeder::class,
            SectionSeeder::class,
            BrandSeeder::class,
            CategorySeeder::class,
            SettingSeeder::class,
        ]);

        // 2. Create Admin
        $adminRole = Role::where('name', 'admin')->first();
        User::updateOrCreate(
            ['email' => 'admin@cosmetic.com'],
            [
                'first_name' => 'Admin',
                'last_name' => 'DAWSM',
                'phone' => '0693607645',
                'password' => \Illuminate\Support\Facades\Hash::make('Admin@123'),
                'role_id' => $adminRole->id,
                'is_active' => true,
            ]
        );

        // 3. Brands & Categories are now seeded via BrandSeeder and CategorySeeder above.

        // 4. Create Products
        Product::factory()->count(60)->create();

        // 5. Create Clients
        User::factory()->count(100)->create();

        // 6. Create Orders & Items (Historical)
        Order::factory()->count(400)->create()->each(function ($order) {
            $itemsCount = rand(1, 4);
            $items = OrderItem::factory()->count($itemsCount)->make(['order_id' => $order->id]);
            
            $total = 0;
            foreach ($items as $item) {
                $item->save();
                $total += ($item->price * $item->quantity);
            }

            $order->update(['total_price' => $total]);
        });

        // 7. Create Diagnostics
        Diagnostic::factory()->count(250)->create();
        
        $this->command->info('Metabase data seeding completed successfully!');
    }
}
