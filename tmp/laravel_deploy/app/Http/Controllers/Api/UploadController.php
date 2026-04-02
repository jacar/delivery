<?php
namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class UploadController extends Controller {
    public function upload(Request $request) {
        if (!$request->hasFile('file')) {
            return response()->json(['error' => 'No se subió ningún archivo'], 400);
        }

        $file = $request->file('file');
        $path = $file->store('uploads', 'public');
        
        // Retornar la URL pública completa
        $url = asset('storage/' . $path);
        
        return response()->json(['url' => $url]);
    }
}
