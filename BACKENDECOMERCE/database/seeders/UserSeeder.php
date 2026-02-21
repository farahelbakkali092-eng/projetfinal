<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Role;
use App\Models\User;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $adminRole = Role::where('name', 'admin')->first();

        // On vérifie que le rôle existe pour éviter une erreur SQL
        if ($adminRole) {
            User::updateOrCreate(
                ['email' => 'admin@cosmetic.com'],
                [
                    'first_name' => 'Admin',
                    'phone' => '12345678',
                    'password' => 'Admin@123', // Auto-hashed par le Model cast
                    'role_id' => $adminRole->id,
                    'is_active' => true,
                ]
            );
        }
    }
}