<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PlanDownload;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class DownloadController extends Controller
{
    public function download(Request $request, string $token): BinaryFileResponse|JsonResponse
    {
        $download = PlanDownload::query()
            ->where('token', $token)
            ->with(['orderItem.order', 'orderItem.plan'])
            ->first();

        if (! $download || ! $download->orderItem || ! $download->orderItem->order) {
            return response()->json([
                'message' => 'Lien de telechargement invalide.',
            ], 404);
        }

        if ($download->orderItem->order->buyer_id !== $request->user()->id) {
            return response()->json([
                'message' => 'Acces refuse.',
            ], 403);
        }

        if ($download->expires_at && $download->expires_at->isPast()) {
            return response()->json([
                'message' => 'Lien de telechargement expire.',
            ], 410);
        }

        $plan = $download->orderItem->plan;
        if (! $plan || ! $plan->file_path) {
            return response()->json([
                'message' => 'Aucun fichier n\'est associe a ce plan.',
            ], 404);
        }

        if (! Storage::disk('local')->exists($plan->file_path)) {
            return response()->json([
                'message' => 'Fichier du plan introuvable sur le serveur.',
            ], 404);
        }

        if (! $download->downloaded_at) {
            $download->update(['downloaded_at' => now()]);
        }

        return response()->download(
            Storage::disk('local')->path($plan->file_path),
            basename($plan->file_path)
        );
    }
}
