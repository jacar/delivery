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
use App\Http\Controllers\Api\NotificationController;

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

// Notificaciones
Route::get('/notifications', [NotificationController::class, 'index']);
Route::put('/notifications/{id}/read', [NotificationController::class, 'markAsRead']);
Route::delete('/notifications', [NotificationController::class, 'clearAll']);

// =========================================================================
// RUTA DE REPARACIÓN INTEGRAL (EJECUTAR UNA VEZ EN PRODUCCIÓN)
// =========================================================================
// =========================================================================
// RUTA DE REPARACIÓN INTEGRAL (EJECUTAR EN PRODUCCIÓN)
// =========================================================================
Route::get('/repair-all', function () {
    $results = [];

    // 1. REPARAR TABLA ALLIES (ESTRUCTURA)
    try {
        \Illuminate\Support\Facades\DB::statement("ALTER TABLE allies MODIFY COLUMN imagenes LONGTEXT NULL");
        \Illuminate\Support\Facades\DB::statement("ALTER TABLE allies MODIFY COLUMN productos LONGTEXT NULL");
        $results['allies_structure'] = 'Estructura de tabla aliados verificada/actualizada.';
    } catch (\Exception $e) {
        $results['allies_structure'] = 'Omitido o ya actualizado: ' . $e->getMessage();
    }
    
    // 2. CORREGIR URLS DE IMÁGENES ROTAS
    try {
        $oldBases = [
            'www.webcincodev.com/b2b/public',
            'webcincodev.com/b2b/public',
            'amvdev.com/b2b/public',
            'amvdev.com',
            'deliveryexpress.com.co'
        ];
        $newBase = 'deliveryexpressmg.com';
        
        $totalLogosFixed = 0;
        $totalItemsFixed = 0;

        foreach ($oldBases as $oldBase) {
            // Corregir logoUrl (String simple)
            $logoFixCount = \Illuminate\Support\Facades\DB::table('allies')
                ->where('logoUrl', 'LIKE', "%$oldBase%")
                ->update([
                    'logoUrl' => \Illuminate\Support\Facades\DB::raw("REPLACE(logoUrl, '$oldBase', '$newBase')")
                ]);
            $totalLogosFixed += $logoFixCount;
        }

        // Corregir imagenes y productos (JSON o LongText con JSON)
        \Illuminate\Support\Facades\DB::table('allies')->get()->each(function ($aliado) use ($oldBases, $newBase, &$totalItemsFixed) {
            $updated = false;
            $newImagenes = $aliado->imagenes;
            $newProductos = $aliado->productos;

            foreach ($oldBases as $oldBase) {
                if (str_contains($newImagenes, $oldBase)) {
                    $newImagenes = str_replace($oldBase, $newBase, $newImagenes);
                    $updated = true;
                }
                if (str_contains($newProductos, $oldBase)) {
                    $newProductos = str_replace($oldBase, $newBase, $newProductos);
                    $updated = true;
                }
            }

            if ($updated) {
                \Illuminate\Support\Facades\DB::table('allies')->where('id', $aliado->id)->update([
                    'imagenes' => $newImagenes,
                    'productos' => $newProductos
                ]);
                $totalItemsFixed++;
            }
        });

        $results['image_fix'] = "URLs corregidas: $totalLogosFixed logos y $totalItemsFixed registros de galería/productos.";
    } catch (\Exception $e) {
        $results['image_fix'] = 'Error en reparación de imágenes: ' . $e->getMessage();
    }

    // 3. REPARAR TABLA MOTOTAXI_TARIFAS
    try {
        if (!\Illuminate\Support\Facades\Schema::hasTable('mototaxi_tarifas')) {
            \Illuminate\Support\Facades\Schema::create('mototaxi_tarifas', function ($table) {
                $table->increments('id');
                $table->string('nombre', 150);
                $table->text('descripcion')->nullable();
                $table->decimal('precio', 10, 2)->default(0);
                $table->boolean('activo')->default(true);
                $table->timestamps();
            });
            $results['tariffs_table'] = 'Tabla mototaxi_tarifas CREADA.';
        } else {
            $results['tariffs_table'] = 'Tabla mototaxi_tarifas ya EXISTE.';
        }
    } catch (\Exception $e) {
        $results['tariffs_error'] = 'Error en tabla tarifas: ' . $e->getMessage();
    }

    // 4. CREAR TABLA NOTIFICACIONES
    try {
        if (!\Illuminate\Support\Facades\Schema::hasTable('notifications')) {
            \Illuminate\Support\Facades\Schema::create('notifications', function ($table) {
                $table->id();
                $table->string('user_id');
                $table->string('titulo');
                $table->text('mensaje');
                $table->string('tipo')->default('sistema');
                $table->boolean('leido')->default(false);
                $table->timestamps();
            });
            $results['notifications_table'] = 'Tabla notifications CREADA.';
        } else {
            $results['notifications_table'] = 'Tabla notifications ya EXISTE.';
        }
    } catch (\Exception $e) {
        $results['notifications_error'] = 'Error en tabla notificaciones: ' . $e->getMessage();
    }

    // 5. LIMPIEZA DE CACHÉ
    try {
        \Illuminate\Support\Facades\Artisan::call('cache:clear');
        \Illuminate\Support\Facades\Artisan::call('config:clear');
        $results['cache'] = 'Caché de Laravel limpiada con éxito.';
    } catch (\Exception $e) {
        $results['cache'] = 'Aviso: Error al limpiar caché (puede requerir permisos): ' . $e->getMessage();
    }

    return response()->json([
        'success' => true,
        'mensaje' => '¡Sistema reparado integralmente para el nuevo dominio! (v2.1 - Notifications Active)',
        'dominio_detectado' => url('/'),
        'detalles' => $results
    ]);
});

// Ruta heredada de instalación (simplificada)
Route::get('/install-db', function () {
    return redirect('/api/repair-all');
});
