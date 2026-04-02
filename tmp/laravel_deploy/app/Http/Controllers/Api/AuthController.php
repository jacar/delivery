<?php
namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class AuthController extends Controller {

    // Registro de usuario nuevo (Email/Password)
    public function register(Request $request) {
        $validated = $request->validate([
            'nombre'   => 'required',
            'email'    => 'required|email',
            'password' => 'required|min:6',
            'rol'      => 'required'
        ]);

        // Verificar si existe
        $exists = DB::table('users')->where('email', $validated['email'])->first();
        if ($exists) {
            return response()->json(['error' => 'Este correo ya está registrado'], 400);
        }

        $uid = (string) Str::uuid();
        DB::table('users')->insert([
            'id'         => $uid,
            'uid'        => $uid,
            'nombre'     => $validated['nombre'],
            'email'      => $validated['email'],
            'password'   => Hash::make($validated['password']),
            'rol'        => $validated['rol'],
            'created_at' => now(),
            'updated_at' => now()
        ]);

        $user = DB::table('users')->where('uid', $uid)->first();
        return response()->json($user);
    }

    // Login Tradicional
    public function login(Request $request) {
        $email = $request->email;
        $password = $request->password;

        // Auto-bootstrap: si es el admin maestro, asegurar que exista con hash correcto
        if ($email === 'admin@delivery.com' && $password === 'admin123') {
            $admin = DB::table('users')->where('email', $email)->first();
            if (!$admin || !Hash::check($password, $admin->password)) {
                // Borrar registro corrupto si existe
                DB::table('users')->where('email', $email)->delete();
                // Recrear con hash limpio
                $uid = (string) Str::uuid();
                DB::table('users')->insert([
                    'id'         => $uid,
                    'uid'        => $uid,
                    'nombre'     => 'Super Admin',
                    'email'      => $email,
                    'password'   => Hash::make($password),
                    'rol'        => 'admin',
                    'created_at' => now(),
                    'updated_at' => now()
                ]);
            }
        }

        $user = DB::table('users')->where('email', $email)->first();
        if (!$user) {
            return response()->json(['error' => 'Correo no registrado: ' . $email], 401);
        }
        if (!Hash::check($password, $user->password)) {
            return response()->json(['error' => 'Contrasena incorrecta'], 401);
        }
        return response()->json($user);
    }

    // Autenticación con Google
    public function googleAuth(Request $request) {
        $email     = $request->email;
        $nombre    = $request->nombre;

        if (!$email) return response()->json(['error' => 'Email requerido'], 400);

        $user = DB::table('users')->where('email', $email)->first();

        if ($user) {
            DB::table('users')->where('email', $email)->update([
                'nombre'     => $nombre,
                'updated_at' => now()
            ]);
            $user = DB::table('users')->where('email', $email)->first();
        } else {
            $uid = (string) Str::uuid();
            DB::table('users')->insert([
                'id'         => $uid,
                'uid'        => $uid,
                'nombre'     => $nombre,
                'email'      => $email,
                'rol'        => 'cliente',
                'created_at' => now(),
                'updated_at' => now()
            ]);
            $user = DB::table('users')->where('uid', $uid)->first();
        }

        return response()->json($user);
    }
}
