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

        // Generar un UUID si la BD en producción no tiene el auto_increment habilitado
        $data['id'] = (string) \Illuminate\Support\Str::uuid();
        $data['created_at'] = now();

        DB::table('messages')->insert($data);

        return response()->json(['success' => true]);
    }
}
