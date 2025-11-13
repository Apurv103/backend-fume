<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS) Configuration
    |--------------------------------------------------------------------------
    |
    | Here you may configure your settings for cross-origin resource sharing
    | or "CORS". This determines what cross-origin operations may execute
    | in web browsers. You are free to adjust these settings as needed.
    |
    | To learn more: https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS
    |
    */

    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    'allowed_methods' => ['*'],

    // Use your actual Vercel domain in SANCTUM_STATEFUL_DOMAINS; we also allow any origin by default.
    'allowed_origins' => explode(',', env('CORS_ALLOWED_ORIGINS', '*')),

    'allowed_origins_patterns' => [],

    // Allow Authorization and standard headers
    'allowed_headers' => ['*'],

    // Expose Authorization header in responses if needed
    'exposed_headers' => ['Authorization', 'X-CSRF-TOKEN'],

    // Set to true only if you rely on Sanctum cookie-based auth; we use token auth,
    // but leaving this configurable via env doesn't hurt.
    'supports_credentials' => env('CORS_SUPPORTS_CREDENTIALS', false),

    'max_age' => 0,

];


