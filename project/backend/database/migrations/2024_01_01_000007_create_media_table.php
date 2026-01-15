<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('media', function (Blueprint $table) {
            $table->id();
            $table->foreignId('message_id')->constrained()->onDelete('cascade');
            $table->string('file_name');
            $table->string('mime_type');
            $table->string('storage_path');
            $table->string('storage_disk')->default('local');
            $table->bigInteger('file_size')->nullable();
            $table->string('thumbnail_path')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();
            
            $table->index('message_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('media');
    }
};
