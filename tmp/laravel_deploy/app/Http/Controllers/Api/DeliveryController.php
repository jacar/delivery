<?php
namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DeliveryController extends Controller {
    public function index() {
        $orders = DB::table('orders')->orderBy('created_at', 'desc')->limit(50)->get();
        foreach($orders as $order) {
            if (is_string($order->ubicacion_recogida)) {
                $order->ubicacion_recogida = json_decode($order->ubicacion_recogida, true);
            }
            if (is_string($order->ubicacion_entrega)) {
                $order->ubicacion_entrega = json_decode($order->ubicacion_entrega, true);
            }
        }
        return response()->json($orders);
    }
    public function store(Request $request) {
        $data = $request->all();
        // Serializar arrays a JSON
        if (isset($data['ubicacion_recogida']) && is_array($data['ubicacion_recogida'])) {
            $data['ubicacion_recogida'] = json_encode($data['ubicacion_recogida']);
        }
        if (isset($data['ubicacion_entrega']) && is_array($data['ubicacion_entrega'])) {
            $data['ubicacion_entrega'] = json_encode($data['ubicacion_entrega']);
        }
        // Usar UUID en lugar de AUTO_INCREMENT
        $data['id'] = $data['id'] ?? (string) \Illuminate\Support\Str::uuid();
        $data['created_at'] = now();
        $data['updated_at'] = now();
        DB::table('orders')->insert($data);
        return response()->json(['id' => $data['id'], 'success' => true]);
    }
    public function updateStatus(Request $request, $id) {
        $data = $request->all();
        $data['updated_at'] = now();
        DB::table('orders')->where('id', $id)->update($data);

        // Si el pedido se marca como 'entregado', liberar al motorizado
        $estado = $request->input('estado');
        if ($estado === 'entregado') {
            $order = DB::table('orders')->where('id', $id)->first();
            if ($order && $order->motorizado_id) {
                DB::table('users')
                    ->where('uid', $order->motorizado_id)
                    ->orWhere('id', $order->motorizado_id)
                    ->update(['ocupado' => false, 'disponible' => true, 'updated_at' => now()]);
            }
        }
        // Si el pedido se asigna o pasa a en_camino, marcar motorizado como ocupado
        if ($estado === 'asignado' || $estado === 'en_camino') {
            $motorizadoId = $request->input('motorizado_id');
            if ($motorizadoId) {
                DB::table('users')
                    ->where('uid', $motorizadoId)
                    ->orWhere('id', $motorizadoId)
                    ->update(['ocupado' => true, 'updated_at' => now()]);
            }
        }

        return response()->json(['success' => true]);
    }
    public function updateLocation(Request $request, $id) {
        try {
            $ubicacion = json_encode(['lat' => $request->lat, 'lng' => $request->lng]);
            DB::table('orders')->where('id', $id)->update([
                'ubicacion_actual' => $ubicacion,
                'updated_at' => now()
            ]);
        } catch (\Exception $e) {
            // Si la columna no existe, ignorar silenciosamente
            // El GPS de tracking no es crítico para el flujo
        }
        return response()->json(['success' => true]);
    }
}
