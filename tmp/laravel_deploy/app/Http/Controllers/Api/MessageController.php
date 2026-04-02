<?php
namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class MessageController extends Controller {
    public function index(Request $request) {
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

        $data['created_at'] = now();

        DB::table('messages')->insert($data);

        return response()->json(['success' => true]);
    }
}
