<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\User;
use Illuminate\Support\Facades\Hash;
use App\Models\Role;

echo "--- ADMIN LOGIN FIX ---\n";

// 1. Find the admin role
$adminRole = Role::where('name', 'admin')->first();
if (!$adminRole) {
    echo "Error: Admin role not found. Creating it...\n";
    $adminRole = Role::create(['name' => 'admin']);
}

// 2. Find the user (try .ma first, then .com)
// We want the final result to be .ma
$targetEmail = 'admin@cosmetic.ma';
$oldEmail = 'admin@cosmetic.com';

$user = User::where('email', $targetEmail)->first();

if (!$user) {
    echo "User $targetEmail not found. Checking for $oldEmail...\n";
    $user = User::where('email', $oldEmail)->first();
    
    if ($user) {
        echo "Found $oldEmail. Updating to $targetEmail...\n";
        $user->email = $targetEmail;
    } else {
        echo "Neither user found. Creating new admin $targetEmail...\n";
        $user = new User();
        $user->email = $targetEmail;
        $user->first_name = 'System';
        $user->last_name = 'Admin';
        $user->phone = '1234567890';
        $user->is_active = true;
    }
}

// 3. Update password and role
$user->password = 'Admin@123'; // Model casts to 'hashed', so plain text assignment works in Laravel 10+ if cast is present
// But we want to be 100% sure it's bcrypt.
// If valid hash is passed, cast might double hash? 
// Let's check the model Casts again. 
// Model has 'password' => 'hashed'.
// If I assign plain text, it hashes it.
// If I assign hash, it might rehash it?
// Laravel's 'hashed' cast usually handles this intelligently, but let's trust the cast.

$user->role_id = $adminRole->id;
$user->save();

echo "User saved.\n";
echo "Email: " . $user->email . "\n";
echo "Role ID: " . $user->role_id . "\n";

// 4. Verify
$user->refresh();
if (Hash::check('Admin@123', $user->password)) {
    echo "SUCCESS: Password matches 'Admin@123'.\n";
    echo "You can now login with:\n";
    echo "Email: $targetEmail\n";
    echo "Password: Admin@123\n";
} else {
    echo "WARNING: Password check failed. Check hashing config.\n";
}
