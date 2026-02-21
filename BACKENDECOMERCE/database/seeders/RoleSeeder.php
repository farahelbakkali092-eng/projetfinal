<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class RoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        \App\Models\Role::updateOrCreate(['name' => 'admin'], ['name' => 'admin']);
        \App\Models\Role::updateOrCreate(['name' => 'client'], ['name' => 'client']);
    }
}
