<?php
namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AliadoController extends Controller {
    public function index() {
        return response()->json(DB::table('allies')->get());
    }
    public function store(Request $request) {
        DB::table('allies')->insert($request->all() + ['created_at' => now()]);
        return response()->json(['success' => true]);
    }
    public function update(Request $request, $id) {
        DB::table('allies')->where('id', $id)->update($request->except(['id', 'created_at']) + ['updated_at' => now()]);
        return response()->json(['success' => true]);
    }
    public function destroy($id) {
        DB::table('allies')->where('id', $id)->delete();
        return response()->json(['success' => true]);
    }
}
