<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        // Global middleware applied to all routes
        $middleware->append([
            \App\Http\Middleware\SanitizeInputMiddleware::class,
        ]);

        // Middleware aliases for specific routes
        $middleware->alias([
            'admin' => \App\Http\Middleware\AdminMiddleware::class,
        ]);

        // Enables stateful frontend requests for Sanctum (SPA auth)
        $middleware->statefulApi();

        // Exempt Stripe webhook from CSRF protection
        $middleware->validateCsrfTokens(except: [
            'api/v1/payments/webhook',
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        //
    })->create();