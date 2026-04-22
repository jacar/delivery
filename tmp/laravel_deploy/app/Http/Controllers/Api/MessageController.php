<?php
namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class MessageController extends Controller {
    public function index(Request $request) {
        // Auto-crear la tabla si no existe (solución rápida para DB en producción)
        if (!\Illuminate\Support\Facades\Schema::hasTable('messages')) {
            \Illuminate\Support\Facades\Schema::create('messages', function ($table) {
                $table->id();
                $table->string('chatId');
                $table->string('remitenteId');
                $table->string('remitenteNombre');
                $table->text('texto');
                $table->timestamp('created_at')->nullable();
                $table->timestamp('updated_at')->nullable();
            });
        }

        $chatId = $request->chatId;
        if (!$chatId) return response()->json([], 200);

        $messages = DB::table('messages')
            ->where('chatId', $chatId)
            ->orderBy('created_at', 'asc')
            ->get();

        return response()->json($messages);
    }

    public function store(Request $request) {
        $data = $request->validate([
            'chatId' => 'required',
            'remitenteId' => 'required',
            'remitenteNombre' => 'required',
            'texto' => 'required'
        ]);

        if (!\Illuminate\Support\Facades\Schema::hasTable('messages')) {
            \Illuminate\Support\Facades\Schema::create('messages', function ($table) {
                $table->id();
                $table->string('chatId');
                $table->string('remitenteId');
                $table->string('remitenteNombre');
                $table->text('texto');
                $table->timestamp('created_at')->nullable();
                $table->timestamp('updated_at')->nullable();
            });
        }

        // El ID será generado por AUTO_INCREMENT en la DB
        $data['created_at'] = now();
        $data['updated_at'] = now();

        DB::table('messages')->insert($data);

        // --- DISPARAR NOTIFICACIÓN AL DESTINATARIO ---
        try {
            $chatId = $data['chatId'];
            $remitenteId = $data['remitenteId'];
            $remitenteNombre = $data['remitenteNombre'];
            $destinatarioId = null;

            // 1. Intentar encontrar si el chatId es un Pedido
            $order = DB::table('orders')->where('id', $chatId)->first();
            if ($order) {
                // Si el remitente es el cliente, notificar al motorizado
                if ($remitenteId === $order->cliente_id) {
                    $destinatarioId = $order->motorizado_id;
                } else {
                    $destinatarioId = $order->cliente_id;
                }
            } else {
                // 2. Si no es un pedido, ver si el remitente es un usuario y el chat es con admin
                // En el flujo actual, si un motorizado escribe a soporte, el admin recibe (no implementado aún notif a admin)
                // Si el admin escribe a un motorizado, el chatId suele ser el UID del motorizado
                if ($remitenteId === 'admin_uid' || $remitenteId === 'admin') {
                     $destinatarioId = $chatId; // El chatId es el destinatario (motorizado)
                }
            }

            if ($destinatarioId && $destinatarioId !== $remitenteId) {
                DB::table('notifications')->insert([
                    'user_id' => $destinatarioId,
                    'titulo' => "Nuevo mensaje de $remitenteNombre",
                    'mensaje' => $data['texto'],
                    'tipo' => 'mensaje',
                    'leido' => false,
                    'created_at' => now(),
                    'updated_at' => now()
                ]);
            }
        } catch (\Exception $e) {
            // Ignorar errores en notificación para no bloquear el envío del mensaje
        }

        return response()->json(['success' => true]);
    }
}
