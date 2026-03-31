<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Role;
use App\Models\User;


class UserSeeder extends Seeder
{
    public function run(): void
    {
        $adminRole = Role::where('name', 'admin')->first();

        if ($adminRole) {
            User::updateOrCreate(
                ['email' => 'admin@cosmetic.com'],
                [
                    'first_name' => 'Admin',
                    'phone' => '0693607645',
                   'password' => 'Admin@123', // 👈 2. FORCE LE HASH ICI
                    'role_id' => $adminRole->id,
                    'is_active' => true,
                ]
            );
        }
    }
}