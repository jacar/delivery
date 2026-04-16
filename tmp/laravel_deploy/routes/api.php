<?php
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\DeliveryController;
use App\Http\Controllers\Api\AliadoController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\MessageController;
use App\Http\Controllers\Api\UploadController;
use App\Http\Controllers\Api\MotoTaxiController;

// Autenticación (Reemplazo de Firebase Auth)
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/auth/google', [AuthController::class, 'googleAuth']);

// Pedidos y GPS
Route::get('/orders', [DeliveryController::class, 'index']);
Route::post('/orders', [DeliveryController::class, 'store']);
Route::put('/orders/{id}/status', [DeliveryController::class, 'updateStatus']);
Route::post('/orders/{id}/location', [DeliveryController::class, 'updateLocation']);

// Aliados y Negocios
Route::get('/allies', [AliadoController::class, 'index']);
Route::post('/allies', [AliadoController::class, 'store']);
Route::put('/allies/{id}', [AliadoController::class, 'update']);
Route::delete('/allies/{id}', [AliadoController::class, 'destroy']);

// Usuarios y Perfiles (Reemplazo de Firestore Users)
Route::get('/users', [UserController::class, 'index']);
Route::get('/users/{uid}', [UserController::class, 'show']);
Route::post('/users/sync', [UserController::class, 'sync']);
Route::put('/users/{id}', [UserController::class, 'update']);
Route::delete('/users/{id}', [UserController::class, 'destroy']);

// Mensajes y Chat (Reemplazo de Firestore Messages)
Route::get('/messages', [MessageController::class, 'index']);
Route::post('/messages', [MessageController::class, 'store']);

// Subida de Archivos (Reemplazo de Firebase Storage)
Route::post('/upload', [UploadController::class, 'upload']);

// Tarifas Moto Taxi
Route::get('/mototaxi-tarifas', [MotoTaxiController::class, 'index']);
Route::post('/mototaxi-tarifas', [MotoTaxiController::class, 'store']);
Route::put('/mototaxi-tarifas/{id}', [MotoTaxiController::class, 'update']);
Route::delete('/mototaxi-tarifas/{id}', [MotoTaxiController::class, 'destroy']);
