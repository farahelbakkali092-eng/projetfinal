<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\User;
use Illuminate\Support\Facades\Hash;

$email = 'admin@cosmetic.com';
$password = 'Admin@123';

$user = User::with('role')->where('email', $email)->first();

if ($user) {
    echo "--- DIAGNOSTIC ---" . PHP_EOL;
    echo "User found: " . $user->first_name . " " . $user->last_name . PHP_EOL;
    echo "Email: " . $user->email . PHP_EOL;
    echo "Role: " . ($user->role->name ?? 'NONE') . " (ID: " . $user->role_id . ")" . PHP_EOL;
    
    $match = Hash::check($password, $user->password);
    echo "Password Match (Admin@123): " . ($match ? "YES" : "NO") . PHP_EOL;
    echo "Hash in DB: " . $user->password . PHP_EOL;
    
    if (!$match) {
        echo "Updating password to 'Admin@123'..." . PHP_EOL;
        $user->password = $password;
        $user->save();
        $match = Hash::check($password, $user->password);
    }
    file_put_contents('match_result.txt', $match ? "MATCH_SUCCESS" : "MATCH_FAILED");
} else {
    file_put_contents('match_result.txt', "USER_NOT_FOUND");
}
