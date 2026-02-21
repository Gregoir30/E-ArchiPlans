<?php

namespace Tests\Unit;

use App\Services\FileUploadService;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class FileUploadServiceTest extends TestCase
{
    public function test_it_uploads_file_to_a_directory(): void
    {
        Storage::fake('local');
        $service = new FileUploadService;
        $file = UploadedFile::fake()->create('plan.pdf', 100, 'application/pdf');

        $path = $service->upload($file, 'plans');

        Storage::disk('local')->assertExists($path);
        $this->assertStringStartsWith('plans/', $path);
    }

    public function test_it_replaces_existing_file(): void
    {
        Storage::fake('local');
        $service = new FileUploadService;

        $oldFile = UploadedFile::fake()->create('old-plan.pdf', 50, 'application/pdf');
        $newFile = UploadedFile::fake()->create('new-plan.pdf', 120, 'application/pdf');

        $oldPath = $service->upload($oldFile, 'plans');
        $newPath = $service->replace($newFile, $oldPath, 'plans');

        Storage::disk('local')->assertMissing($oldPath);
        Storage::disk('local')->assertExists($newPath);
    }

    public function test_it_deletes_existing_file(): void
    {
        Storage::fake('local');
        $service = new FileUploadService;
        $file = UploadedFile::fake()->create('cover.jpg', 80, 'image/jpeg');

        $path = $service->upload($file, 'covers');

        $result = $service->delete($path);

        $this->assertTrue($result);
        Storage::disk('local')->assertMissing($path);
    }
}

