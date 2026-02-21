<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\User;
use Illuminate\Support\Facades\Hash;

$log = "";

function logger($msg) {
    global $log;
    echo $msg;
    $log .= $msg;
}

$emails = ['admin@cosmetic.com', 'admin@cosmetic.ma'];
$password = 'Admin@123';

logger("\n--- DIAGNOSTIC START ---\n");

foreach ($emails as $email) {
    logger("\n------------------------------------------------\n");
    logger("Checking User: $email\n");
    $user = User::with('role')->where('email', $email)->first();

    if ($user) {
        logger("STATUS: FOUND\n");
        logger("ID: " . $user->id . "\n");
        logger("Name: " . $user->first_name . " " . $user->last_name . "\n");
        logger("Role: " . ($user->role->name ?? 'NONE') . " (ID: " . $user->role_id . ")\n");
        logger("Is Admin (via isAdmin()): " . ($user->isAdmin() ? "YES" : "NO") . "\n");
        
        $match = Hash::check($password, $user->password);
        logger("Password Match ('$password'): " . ($match ? "YES" : "NO") . "\n");
        
        // Show raw password safest way
        $rawPass = substr($user->password, 0, 15) . "...";
        logger("Password Hash in DB: " . $rawPass . "\n");
        
        // Check hash info
        $info = password_get_info($user->password);
        logger("Hash algorithm: " . print_r($info, true) . "\n");

        // Attempt to fix password if not matching
        if (!$match) {
            logger("FIX ATTEMPT: Updating password to '$password'...\n");
            $user->password = $password; 
            $user->save();
            logger("Password updated.\n");
            $user->refresh();
            if (Hash::check($password, $user->password)) {
                 logger("VERIFICATION: Success! Password now matches.\n");
            } else {
                 logger("VERIFICATION: Failed to verify after update.\n");
            }
        }
    } else {
        logger("STATUS: NOT FOUND (This is likely the problem if you are using this email)\n");
    }
}
logger("\n------------------------------------------------\n");
logger("--- DIAGNOSTIC END ---\n");

file_put_contents('diagnostic_output.txt', $log);
