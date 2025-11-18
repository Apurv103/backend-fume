<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\TableController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\AnalyticsController;

Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:5,1');

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/me', [AuthController::class, 'me']);

    Route::middleware('role:manager,owner')->group(function () {
        Route::get('/tables', [TableController::class, 'index']);
        Route::get('/orders', [OrderController::class, 'index']);
        Route::get('/orders/summary', [OrderController::class, 'summary']);
    });

    Route::get('/tables/{table}/orders', [OrderController::class, 'indexForTable']);
    Route::post('/orders', [OrderController::class, 'store'])->middleware('role:server,manager,owner');
    Route::patch('/orders/{order}', [OrderController::class, 'updateStatus'])->middleware('role:manager,owner');
    Route::get('/orders/open', [OrderController::class, 'open']);

    // Owner analytics endpoints
    Route::middleware('role:owner')->group(function () {
        Route::get('/analytics/summary', [AnalyticsController::class, 'summary']);
        Route::get('/analytics/products', [AnalyticsController::class, 'products']);
        Route::get('/analytics/staff', [AnalyticsController::class, 'staff']);
        Route::get('/analytics/orders', [AnalyticsController::class, 'orders']);
    });
});


