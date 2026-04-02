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
        
        $data = $request->only(['nombre', 'email', 'rol', 'placaVehiculo', 'disponible', 'ocupado']);
        $data['updated_at'] = now();
        
        $user = DB::table('users')->where('uid', $uid)->first();
        if ($user) {
            DB::table('users')->where('uid', $uid)->update($data);
        } else {
            $data['uid'] = $uid;
            $data['created_at'] = now();
            DB::table('users')->insert($data);
        }
        
        return response()->json(['success' => true]);
    }

    public function update(Request $request, $id) {
        $data = $request->only(['nombre', 'email', 'rol', 'placaVehiculo', 'disponible', 'ocupado']);
        if ($request->has('password')) {
            $data['password'] = Hash::make($request->password);
        }
        $data['updated_at'] = now();
        
        DB::table('users')->where('id', $id)->orWhere('uid', $id)->update($data);
        return response()->json(['success' => true]);
    }

    public function destroy($id) {
        DB::table('users')->where('id', $id)->orWhere('uid', $id)->delete();
        return response()->json(['success' => true]);
    }
}
