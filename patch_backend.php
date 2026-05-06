<?php
$baseDir = __DIR__;
$aliadoContent = <<<'EOD'
<?php
namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AliadoController extends Controller {
    public function index() {
        try {
            return response()->json(DB::table('allies')->get());
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function store(Request $request) {
        try {
            $data = $request->only(['id', 'nombre', 'logoUrl', 'descripcion', 'whatsapp', 'imagenes', 'productos', 'ownerEmail', 'aprobado']);
            $data['created_at'] = now();
            $data['updated_at'] = now();
            
            DB::table('allies')->insert($data);

            // Sincronizar con usuarios
            if (isset($data['aprobado']) && isset($data['ownerEmail'])) {
                DB::table('users')->where('email', $data['ownerEmail'])->update([
                    'aprobado' => $data['aprobado'],
                    'updated_at' => now()
                ]);
            }

            return response()->json(['success' => true]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function update(Request $request, $id) {
        try {
            $data = $request->only(['nombre', 'logoUrl', 'descripcion', 'whatsapp', 'imagenes', 'productos', 'ownerEmail', 'aprobado']);
            $data['updated_at'] = now();
            
            DB::table('allies')->where('id', $id)->update($data);

            // Sincronizar con usuarios
            if (isset($data['aprobado'])) {
                // Obtener el ownerEmail actual si no viene en el request
                $email = $data['ownerEmail'] ?? DB::table('allies')->where('id', $id)->value('ownerEmail');
                if ($email) {
                    DB::table('users')->where('email', $email)->update([
                        'aprobado' => $data['aprobado'],
                        'updated_at' => now()
                    ]);
                }
            }

            return response()->json(['success' => true]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function destroy($id) {
        try {
            DB::table('allies')->where('id', $id)->delete();
            return response()->json(['success' => true]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
}
EOD;

$userContent = <<<'EOD'
<?php
namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller {
    public function index() {
        return response()->json(DB::table('users')->get());
    }

    public function show($uid) {
        $user = DB::table('users')->where('uid', $uid)->orWhere('id', $uid)->first();
        if (!$user) return response()->json(['error' => 'Usuario no encontrado'], 404);
        return response()->json($user);
    }
    
    public function sync(Request $request) {
        $uid = $request->uid;
        if (!$uid) return response()->json(['error' => 'UID requerido'], 400);
        
        $data = $request->only(['nombre', 'email', 'rol', 'placaVehiculo', 'disponible', 'ocupado', 'aprobado']);
        $data['updated_at'] = now();
        
        $user = DB::table('users')->where('uid', $uid)->first();
        if ($user) {
            DB::table('users')->where('uid', $uid)->update($data);
        } else {
            $data['uid'] = $uid;
            $data['created_at'] = now();
            DB::table('users')->insert($data);
        }

        // Sincronizar con tabla de aliados si es necesario
        if (isset($data['aprobado']) && isset($data['email'])) {
            DB::table('allies')->where('ownerEmail', $data['email'])->update([
                'aprobado' => $data['aprobado'],
                'updated_at' => now()
            ]);
        }
        
        return response()->json(['success' => true]);
    }

    public function update(Request $request, $id) {
        $data = $request->only(['nombre', 'email', 'rol', 'placaVehiculo', 'disponible', 'ocupado', 'tipoVehiculo', 'documentoId', 'fotoUrl', 'telefono', 'aprobado']);
        if ($request->has('password') && !empty($request->password)) {
            $data['password'] = Hash::make($request->password);
        }
        $data['updated_at'] = now();
        
        DB::table('users')->where('id', $id)->orWhere('uid', $id)->update($data);

        // Sincronizar con tabla de aliados por email
        $user = DB::table('users')->where('id', $id)->orWhere('uid', $id)->first();
        if ($user && isset($data['aprobado']) && $user->email) {
            DB::table('allies')->where('ownerEmail', $user->email)->update([
                'aprobado' => $data['aprobado'],
                'updated_at' => now()
            ]);
        }

        return response()->json(['success' => true]);
    }

    public function destroy($id) {
        DB::table('users')->where('id', $id)->orWhere('uid', $id)->delete();
        return response()->json(['success' => true]);
    }
}
EOD;

file_put_contents($baseDir . '/app/Http/Controllers/Api/AliadoController.php', $aliadoContent);
file_put_contents($baseDir . '/app/Http/Controllers/Api/UserController.php', $userContent);
echo "Backend Patched Successfully.\n";
