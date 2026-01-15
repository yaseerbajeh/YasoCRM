<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('whatsapp_instances', function (Blueprint $table) {
            $table->id();
            $table->foreignId('organization_id')->constrained()->onDelete('cascade');
            $table->string('instance_name')->unique();
            $table->string('api_key')->nullable();
            $table->string('phone_number')->nullable();
            $table->enum('status', ['disconnected', 'connecting', 'connected', 'failed'])->default('disconnected');
            $table->json('webhook_config')->nullable();
            $table->json('settings')->nullable();
            $table->timestamp('last_connected_at')->nullable();
            $table->timestamps();
            
            $table->index(['organization_id', 'status']);
            $table->index('instance_name');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('whatsapp_instances');
    }
};
