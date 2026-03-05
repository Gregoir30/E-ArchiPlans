<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class SanitizeInput
{
    private const KEYS_EXCLUDED = [
        'password',
        'password_confirmation',
        'api_token',
    ];

    public function handle(Request $request, Closure $next): Response
    {
        $request->merge($this->sanitizeArray($request->all()));

        return $next($request);
    }

    private function sanitizeArray(array $data): array
    {
        $cleaned = [];

        foreach ($data as $key => $value) {
            if (is_array($value)) {
                $cleaned[$key] = $this->sanitizeArray($value);
                continue;
            }

            if (! is_string($value) || in_array((string) $key, self::KEYS_EXCLUDED, true)) {
                $cleaned[$key] = $value;
                continue;
            }

            $normalized = preg_replace('/[\x00-\x1F\x7F]/u', '', $value) ?? $value;
            $cleaned[$key] = trim(strip_tags($normalized));
        }

        return $cleaned;
    }
}

