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
            $data = $request->only(['id', 'nombre', 'logoUrl', 'descripcion', 'whatsapp', 'imagenes', 'productos']);
            $data['created_at'] = now();
            $data['updated_at'] = now();
            
            DB::table('allies')->insert($data);
            return response()->json(['success' => true]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function update(Request $request, $id) {
        try {
            $data = $request->only(['nombre', 'logoUrl', 'descripcion', 'whatsapp', 'imagenes', 'productos']);
            $data['updated_at'] = now();
            
            DB::table('allies')->where('id', $id)->update($data);
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
