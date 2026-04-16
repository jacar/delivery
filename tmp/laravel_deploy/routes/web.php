<?php
use Illuminate\Support\Facades\Route;

// Ayuda para crear el enlace simbólico en hostings compartidos
Route::get('/storage-link', function () {
    $target = storage_path('app/public');
    $link = public_path('storage');
    if (file_exists($link)) {
        return "El enlace simbólico ya existe.";
    }
    app('files')->link($target, $link);
    return "Enlace simbólico 'storage' creado con éxito.";
});


// RUTA ESPECIAL TEMPORAL PARA CREAR LAS TABLAS MySQL
Route::get('/install-db', function () {
    try {
        // Recrear users con todos los campos necesarios
        \Illuminate\Support\Facades\Schema::dropIfExists('users');
        \Illuminate\Support\Facades\Schema::create('users', function ($table) {
            $table->string('id')->primary();
            $table->string('uid')->unique();
            $table->string('nombre');
            $table->string('email')->nullable()->unique();
            $table->string('password')->nullable();
            $table->string('rol')->default('cliente');
            $table->string('fcmToken')->nullable();
            $table->string('telefono')->nullable();
            $table->string('tipoVehiculo')->nullable();
            $table->string('placaVehiculo')->nullable();
            $table->string('documentoId')->nullable();
            $table->text('fotoUrl')->nullable();
            $table->boolean('disponible')->default(true);
            $table->boolean('ocupado')->default(false);
            $table->timestamps();
        });

        if (!\Illuminate\Support\Facades\Schema::hasTable('allies')) {
            \Illuminate\Support\Facades\Schema::create('allies', function ($table) {
                $table->string('id')->primary();
                $table->string('nombre');
                $table->text('logoUrl')->nullable();
                $table->text('descripcion')->nullable();
                $table->string('whatsapp')->nullable();
                $table->longText('imagenes')->nullable();
                $table->longText('productos')->nullable();
                $table->timestamp('timestamp')->nullable();
                $table->timestamps();
            });
        } else {
            // Reparar/Ampliar capacidad si ya existe
            \Illuminate\Support\Facades\Schema::table('allies', function ($table) {
                $table->longText('imagenes')->nullable()->change();
                $table->longText('productos')->nullable()->change();
            });
        }

        if (!\Illuminate\Support\Facades\Schema::hasTable('orders')) {
            \Illuminate\Support\Facades\Schema::create('orders', function ($table) {
                $table->string('id')->primary();
                $table->string('cliente_id');
                $table->string('cliente_nombre')->nullable();
                $table->string('cliente_telefono')->nullable();
                $table->string('tipo');
                $table->text('descripcion')->nullable();
                $table->json('ubicacion_recogida')->nullable();
                $table->json('ubicacion_entrega')->nullable();
                $table->string('estado');
                $table->string('motorizado_id')->nullable();
                $table->string('motorizado_nombre')->nullable();
                $table->string('motorizado_telefono')->nullable();
                $table->boolean('aceptado_por_motorizado')->default(false);
                $table->json('ubicacion_actual')->nullable();
                $table->timestamp('last_update')->nullable();
                $table->timestamp('timestamp')->nullable();
                $table->timestamps();
            });
        }

        if (!\Illuminate\Support\Facades\Schema::hasTable('messages')) {
            \Illuminate\Support\Facades\Schema::create('messages', function ($table) {
                $table->string('id')->primary();
                $table->string('chatId');
                $table->string('remitenteId');
                $table->string('remitenteNombre');
                $table->text('texto');
                $table->timestamp('timestamp')->nullable();
                $table->timestamps();
            });
        }
        return "¡Tablas creadas/verificadas con éxito! Servidor 100% operativo.";
    } catch (\Exception $e) {
        return "Error: " . $e->getMessage();
    }
});

// Cualquier ruta que no sea de la API...
Route::get('/{any?}', function () {
    $path = public_path('index.html');
    if (file_exists($path)) {
        return file_get_contents($path);
    }
    return "Error: index.html no encontrado en la carpeta public. Verifica la subida.";
})->where('any', '^(?!api).*$');
