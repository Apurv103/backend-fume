<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return response('OK', 200);
});

// Fallback login route to satisfy framework redirects when a browser hits API without token.
Route::get('/login', function () {
    return response()->json(['message' => 'Unauthenticated. Please use API login endpoint.'], 401);
})->name('login');


