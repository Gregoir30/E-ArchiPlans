<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class FileUploadService
{
    public function upload(
        UploadedFile $file,
        string $directory,
        string $disk = 'local',
        ?string $filename = null
    ): string {
        $targetDirectory = $this->normalizeDirectory($directory);
        $targetFilename = $filename !== null && $filename !== ''
            ? $filename
            : Str::uuid()->toString().'.'.$file->getClientOriginalExtension();

        return $file->storeAs($targetDirectory, $targetFilename, $disk);
    }

    public function replace(
        UploadedFile $file,
        ?string $existingPath,
        string $directory,
        string $disk = 'local',
        ?string $filename = null
    ): string {
        $newPath = $this->upload($file, $directory, $disk, $filename);

        if ($existingPath !== null && $existingPath !== '' && Storage::disk($disk)->exists($existingPath)) {
            Storage::disk($disk)->delete($existingPath);
        }

        return $newPath;
    }

    public function delete(?string $path, string $disk = 'local'): bool
    {
        if ($path === null || $path === '') {
            return false;
        }

        if (! Storage::disk($disk)->exists($path)) {
            return false;
        }

        return Storage::disk($disk)->delete($path);
    }

    private function normalizeDirectory(string $directory): string
    {
        return trim($directory, '/');
    }
}

