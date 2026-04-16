<?php
namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class MotoTaxiController extends Controller
{
    /**
     * Listar todas las tarifas de moto taxi.
     */
    public function index()
    {
        $tarifas = DB::table('mototaxi_tarifas')
            ->orderBy('created_at', 'desc')
            ->get();
        return response()->json($tarifas);
    }

    /**
     * Crear una nueva tarifa.
     */
    public function store(Request $request)
    {
        $request->validate([
            'nombre'  => 'required|string|max:150',
            'precio'  => 'required|numeric|min:0',
            'activo'  => 'boolean',
        ]);

        $id = DB::table('mototaxi_tarifas')->insertGetId([
            'nombre'      => $request->nombre,
            'descripcion' => $request->descripcion ?? null,
            'precio'      => $request->precio,
            'activo'      => $request->has('activo') ? (bool) $request->activo : true,
            'created_at'  => now(),
            'updated_at'  => now(),
        ]);

        $tarifa = DB::table('mototaxi_tarifas')->where('id', $id)->first();
        return response()->json($tarifa, 201);
    }

    /**
     * Actualizar una tarifa existente.
     */
    public function update(Request $request, $id)
    {
        $tarifa = DB::table('mototaxi_tarifas')->where('id', $id)->first();
        if (!$tarifa) {
            return response()->json(['error' => 'Tarifa no encontrada'], 404);
        }

        $data = array_filter([
            'nombre'      => $request->nombre,
            'descripcion' => $request->descripcion,
            'precio'      => $request->precio,
            'activo'      => $request->has('activo') ? (bool) $request->activo : null,
        ], fn($v) => !is_null($v));

        $data['updated_at'] = now();

        DB::table('mototaxi_tarifas')->where('id', $id)->update($data);
        return response()->json(['success' => true]);
    }

    /**
     * Eliminar una tarifa.
     */
    public function destroy($id)
    {
        DB::table('mototaxi_tarifas')->where('id', $id)->delete();
        return response()->json(['success' => true]);
    }
}
