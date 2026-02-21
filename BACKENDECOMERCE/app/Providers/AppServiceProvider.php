<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Auth\Notifications\ResetPassword;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        // Configuration existante du RateLimiter...
        \Illuminate\Support\Facades\RateLimiter::for('api', function (\Illuminate\Http\Request $request) {
            return \Illuminate\Cache\RateLimiting\Limit::perMinute(60)->by($request->user()?->id ?: $request->ip());
        });

        // NOUVEAU : Personnalisation de l'URL de réinitialisation du mot de passe
        ResetPassword::createUrlUsing(function (object $notifiable, string $token) {
            // Construit l'URL vers ton frontend React (ex: http://localhost:3000/reset-password?token=...&email=...)
            $frontendUrl = env('FRONTEND_URL', 'http://localhost:3000');
            
            return $frontendUrl . '/reset-password?token=' . $token . '&email=' . $notifiable->getEmailForPasswordReset();
        });
    }
}