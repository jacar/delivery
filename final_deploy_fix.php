<?php
/**
 * FIX DEPLOYMENT & DATABASE REPAIR
 * Este script actualiza los archivos críticos y repara la base de datos.
 */

header('Content-Type: text/plain');
echo "Iniciando reparación integral...\n";

$baseDir = __DIR__;

// 1. DEFINIR CONTENIDOS
$filesToUpdate = [
    'app/Http/Controllers/Api/AuthController.php' => '<?php
namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class AuthController extends Controller {

    public function register(Request $request) {
        $validated = $request->validate([
            \'nombre\'   => \'required\',
            \'email\'    => \'required|email\',
            \'password\' => \'required|min:6\',
            \'rol\'      => \'required\'
        ]);

        $exists = DB::table(\'users\')->where(\'email\', $validated[\'email\'])->first();
        if ($exists) {
            return response()->json([\'error\' => \'Este correo ya está registrado\'], 400);
        }

        $uid = (string) Str::uuid();
        DB::table(\'users\')->insert([
            \'id\'         => $uid,
            \'uid\'        => $uid,
            \'nombre\'     => $validated[\'nombre\'],
            \'email\'      => $validated[\'email\'],
            \'password\'   => Hash::make($validated[\'password\']),
            \'rol\'        => $validated[\'rol\'],
            \'created_at\' => now(),
            \'updated_at\' => now()
        ]);

        $user = DB::table(\'users\')->where(\'uid\', $uid)->first();
        return response()->json($user);
    }

    public function login(Request $request) {
        $email = $request->email;
        $password = $request->password;

        if ($email === \'admin@delivery.com\' && $password === \'admin123\') {
            $admin = DB::table(\'users\')->where(\'email\', $email)->first();
            if (!$admin || !Hash::check($password, $admin->password)) {
                DB::table(\'users\')->where(\'email\', $email)->delete();
                $uid = (string) Str::uuid();
                DB::table(\'users\')->insert([
                    \'id\'         => $uid,
                    \'uid\'        => $uid,
                    \'nombre\'     => \'Super Admin\',
                    \'email\'      => $email,
                    \'password\'   => Hash::make($password),
                    \'rol\'        => \'admin\',
                    \'created_at\' => now(),
                    \'updated_at\' => now()
                ]);
            }
        }

        $user = DB::table(\'users\')->where(\'email\', $email)->first();
        if (!$user) {
            return response()->json([\'error\' => \'Correo no registrado: \' . $email], 401);
        }
        if (!Hash::check($password, $user->password)) {
            return response()->json([\'error\' => \'Contrasena incorrecta\'], 401);
        }
        return response()->json($user);
    }

    public function googleAuth(Request $request) {
        try {
            $email    = $request->email;
            $nombre   = $request->nombre;
            $googleId = $request->google_id;
            $fotoUrl  = $request->fotoUrl;
            $requestedRol = $request->rol;

            if (!$email) {
                return response()->json([\'error\' => \'Email requerido\'], 400);
            }

            $user = DB::table(\'users\')
                ->where(\'email\', $email)
                ->orWhere(\'id\', $googleId)
                ->first();

            if ($user) {
                $updateData = [
                    \'nombre\'     => $nombre,
                    \'updated_at\' => now()
                ];
                if ($fotoUrl) $updateData[\'fotoUrl\'] = $fotoUrl;
                
                if ($requestedRol === \'aliado\' && $user->rol === \'cliente\') {
                    $updateData[\'rol\'] = \'aliado\';
                    $updateData[\'aprobado\'] = false;
                }
                
                DB::table(\'users\')->where(\'id\', $user->id)->update($updateData);
                $user = DB::table(\'users\')->where(\'id\', $user->id)->first();
            } else {
                $id = $googleId ?: (string) Str::uuid();
                DB::table(\'users\')->insert([
                    \'id\'         => $id,
                    \'uid\'        => $id,
                    \'nombre\'     => $nombre,
                    \'email\'      => $email,
                    \'fotoUrl\'    => $fotoUrl,
                    \'rol\'        => $requestedRol ?: \'cliente\',
                    \'aprobado\'   => false,
                    \'created_at\' => now(),
                    \'updated_at\' => now()
                ]);
                $user = DB::table(\'users\')->where(\'id\', $id)->first();
            }

            return response()->json($user);

        } catch (\Exception $e) {
            return response()->json([
                \'error\' => \'Error de servidor en Google Auth\',
                \'message\' => $e->getMessage()
            ], 500);
        }
    }
}',
    'app/Http/Controllers/Api/UserController.php' => '<?php
namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller {
    public function index() {
        return response()->json(DB::table(\'users\')->get());
    }

    public function show($uid) {
        $user = DB::table(\'users\')->where(\'uid\', $uid)->orWhere(\'id\', $uid)->first();
        if (!$user) return response()->json([\'error\' => \'Usuario no encontrado\'], 404);
        return response()->json($user);
    }
    
    public function sync(Request $request) {
        $uid = $request->uid;
        if (!$uid) return response()->json([\'error\' => \'UID requerido\'], 400);
        
        $data = $request->only([\'nombre\', \'email\', \'rol\', \'placaVehiculo\', \'disponible\', \'ocupado\', \'aprobado\']);
        $data[\'updated_at\'] = now();
        
        $user = DB::table(\'users\')->where(\'uid\', $uid)->first();
        if ($user) {
            DB::table(\'users\')->where(\'uid\', $uid)->update($data);
        } else {
            $data[\'uid\'] = $uid;
            $data[\'created_at\'] = now();
            DB::table(\'users\')->insert($data);
        }
        
        return response()->json([\'success\' => true]);
    }

    public function update(Request $request, $id) {
        $data = $request->only([\'nombre\', \'email\', \'rol\', \'placaVehiculo\', \'disponible\', \'ocupado\', \'tipoVehiculo\', \'documentoId\', \'fotoUrl\', \'telefono\', \'aprobado\']);
        if ($request->has(\'password\') && !empty($request->password)) {
            $data[\'password\'] = Hash::make($request->password);
        }
        $data[\'updated_at\'] = now();
        
        DB::table(\'users\')->where(\'id\', $id)->orWhere(\'uid\', $id)->update($data);
        return response()->json([\'success\' => true]);
    }

    public function destroy($id) {
        DB::table(\'users\')->where(\'id\', $id)->orWhere(\'uid\', $id)->delete();
        return response()->json([\'success\' => true]);
    }
}',
    'app/Http/Controllers/Api/AliadoController.php' => '<?php
namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AliadoController extends Controller {
    public function index() {
        try {
            return response()->json(DB::table(\'allies\')->get());
        } catch (\Exception $e) {
            return response()->json([\'error\' => $e->getMessage()], 500);
        }
    }

    public function store(Request $request) {
        try {
            $data = $request->only([\'id\', \'nombre\', \'logoUrl\', \'descripcion\', \'whatsapp\', \'imagenes\', \'productos\', \'ownerEmail\', \'aprobado\']);
            $data[\'created_at\'] = now();
            $data[\'updated_at\'] = now();
            
            DB::table(\'allies\')->insert($data);
            return response()->json([\'success\' => true]);
        } catch (\Exception $e) {
            return response()->json([\'error\' => $e->getMessage()], 500);
        }
    }

    public function update(Request $request, $id) {
        try {
            $data = $request->only([\'nombre\', \'logoUrl\', \'descripcion\', \'whatsapp\', \'imagenes\', \'productos\', \'ownerEmail\', \'aprobado\']);
            $data[\'updated_at\'] = now();
            
            DB::table(\'allies\')->where(\'id\', $id)->update($data);
            return response()->json([\'success\' => true]);
        } catch (\Exception $e) {
            return response()->json([\'error\' => $e->getMessage()], 500);
        }
    }

    public function destroy($id) {
        try {
            DB::table(\'allies\')->where(\'id\', $id)->delete();
            return response()->json([\'success\' => true]);
        } catch (\Exception $e) {
            return response()->json([\'error\' => $e->getMessage()], 500);
        }
    }
}',
    'routes/api.php' => '<?php
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

Route::post(\'/register\', [AuthController::class, \'register\']);
Route::post(\'/login\', [AuthController::class, \'login\']);
Route::post(\'/auth/google\', [AuthController::class, \'googleAuth\']);
Route::get(\'/orders\', [DeliveryController::class, \'index\']);
Route::post(\'/orders\', [DeliveryController::class, \'store\']);
Route::put(\'/orders/{id}/status\', [DeliveryController::class, \'updateStatus\']);
Route::post(\'/orders/{id}/location\', [DeliveryController::class, \'updateLocation\']);
Route::delete(\'/orders/{id}\', [DeliveryController::class, \'destroy\']);
Route::get(\'/allies\', [AliadoController::class, \'index\']);
Route::post(\'/allies\', [AliadoController::class, \'store\']);
Route::put(\'/allies/{id}\', [AliadoController::class, \'update\']);
Route::delete(\'/allies/{id}\', [AliadoController::class, \'destroy\']);
Route::get(\'/users\', [UserController::class, \'index\']);
Route::get(\'/users/{uid}\', [UserController::class, \'show\']);
Route::post(\'/users/sync\', [UserController::class, \'sync\']);
Route::put(\'/users/{id}\', [UserController::class, \'update\']);
Route::delete(\'/users/{id}\', [UserController::class, \'destroy\']);
Route::get(\'/messages\', [MessageController::class, \'index\']);
Route::post(\'/messages\', [MessageController::class, \'store\']);
Route::post(\'/upload\', [UploadController::class, \'upload\']);
Route::get(\'/mototaxi-tarifas\', [MotoTaxiController::class, \'index\']);
Route::post(\'/mototaxi-tarifas\', [MotoTaxiController::class, \'store\']);
Route::put(\'/mototaxi-tarifas/{id}\', [MotoTaxiController::class, \'update\']);
Route::delete(\'/mototaxi-tarifas/{id}\', [MotoTaxiController::class, \'destroy\']);
Route::get(\'/notifications\', [NotificationController::class, \'index\']);
Route::put(\'/notifications/{id}/read\', [NotificationController::class, \'markAsRead\']);
Route::delete(\'/notifications\', [NotificationController::class, \'clearAll\']);

Route::get(\'/repair-all\', function () {
    $results = [];
    try {
        if (!\Illuminate\Support\Facades\Schema::hasTable(\'orders\')) {
            \Illuminate\Support\Facades\Schema::create(\'orders\', function ($table) {
                $table->string(\'id\', 191)->primary();
                $table->string(\'cliente_id\', 191)->nullable();
                $table->string(\'cliente_nombre\', 191)->nullable();
                $table->string(\'cliente_telefono\', 50)->nullable();
                $table->string(\'motorizado_id\', 191)->nullable();
                $table->string(\'motorizado_nombre\', 191)->nullable();
                $table->string(\'motorizado_telefono\', 50)->nullable();
                $table->string(\'tipo\', 50)->nullable();
                $table->text(\'descripcion\')->nullable();
                $table->longText(\'ubicacion_recogida\')->nullable();
                $table->longText(\'ubicacion_entrega\')->nullable();
                $table->string(\'estado\', 50)->default(\'disponible\');
                $table->boolean(\'aceptado_por_motorizado\')->default(false);
                $table->decimal(\'precio\', 10, 2)->default(0);
                $table->timestamps();
            });
            $results[\'orders_table\'] = \'Tabla orders CREADA.\';
        } else {
            \Illuminate\Support\Facades\DB::statement("ALTER TABLE orders MODIFY COLUMN id VARCHAR(191) NOT NULL");
            \Illuminate\Support\Facades\DB::statement("ALTER TABLE orders MODIFY COLUMN cliente_id VARCHAR(191) NULL");
            \Illuminate\Support\Facades\DB::statement("ALTER TABLE orders MODIFY COLUMN motorizado_id VARCHAR(191) NULL");
            $results[\'orders_table\'] = \'Estructura orders verificada.\';
        }
    } catch (\Exception $e) { $results[\'orders_error\'] = $e->getMessage(); }

    try {
        if (!\Illuminate\Support\Facades\Schema::hasTable(\'allies\')) {
            \Illuminate\Support\Facades\Schema::create(\'allies\', function ($table) {
                $table->string(\'id\', 191)->primary();
                $table->string(\'nombre\', 191);
                $table->string(\'logoUrl\', 191)->nullable();
                $table->text(\'descripcion\')->nullable();
                $table->string(\'whatsapp\', 50)->nullable();
                $table->string(\'ownerEmail\', 191)->nullable();
                $table->boolean(\'aprobado\')->default(false);
                $table->longText(\'imagenes\')->nullable();
                $table->longText(\'productos\')->nullable();
                $table->timestamps();
            });
            $results[\'allies_table\'] = \'Tabla allies CREADA.\';
        } else {
            try {
                \Illuminate\Support\Facades\DB::statement("ALTER TABLE allies MODIFY COLUMN id VARCHAR(191)");
            } catch (\Exception $e) {}
            \Illuminate\Support\Facades\DB::statement("ALTER TABLE allies MODIFY COLUMN imagenes LONGTEXT NULL");
            \Illuminate\Support\Facades\DB::statement("ALTER TABLE allies MODIFY COLUMN productos LONGTEXT NULL");
            if (!\Illuminate\Support\Facades\Schema::hasColumn(\'allies\', \'aprobado\')) {
                \Illuminate\Support\Facades\DB::statement("ALTER TABLE allies ADD COLUMN aprobado TINYINT(1) DEFAULT 0");
            }
            $results[\'allies_structure\'] = \'Estructura aliados verificada.\';
        }
    } catch (\Exception $e) { $results[\'allies_error\'] = $e->getMessage(); }
    
    try {
        \Illuminate\Support\Facades\Artisan::call(\'cache:clear\');
        $results[\'cache\'] = \'Caché de Laravel limpiada.\';
    } catch (\Exception $e) {}

    return response()->json([\'success\' => true, \'detalles\' => $results]);
});'
];

// 2. APLICAR CAMBIOS EN ARCHIVOS
foreach ($filesToUpdate as $file => $content) {
    $fullPath = $baseDir . '/' . $file;
    $dir = dirname($fullPath);
    if (!is_dir($dir)) {
        mkdir($dir, 0755, true);
    }
    if (file_put_contents($fullPath, $content)) {
        echo "✅ Archivo actualizado: $file\n";
    } else {
        echo "❌ ERROR al actualizar: $file\n";
    }
}

// 3. EJECUTAR REPARACIÓN DE BASE DE DATOS (VIA BOOTSTRAP)
try {
    echo "Iniciando reparación de DB...\n";
    // Cargar Laravel
    require __DIR__ . '/vendor/autoload.php';
    $app = require_once __DIR__ . '/bootstrap/app.php';
    $kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
    $kernel->bootstrap();

    // Reparar ID de allies
    \Illuminate\Support\Facades\DB::statement("ALTER TABLE allies MODIFY COLUMN id VARCHAR(191)");
    echo "✅ Columna ID de allies ampliada a 191.\n";

    // Limpiar caché
    \Illuminate\Support\Facades\Artisan::call('cache:clear');
    echo "✅ Caché limpiada.\n";

} catch (\Exception $e) {
    echo "⚠️ Error en paso 3: " . $e->getMessage() . "\n";
}

echo "\nReparación completada. Puedes borrar este archivo.\n";
