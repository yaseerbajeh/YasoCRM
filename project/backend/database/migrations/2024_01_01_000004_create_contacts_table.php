<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('contacts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('organization_id')->constrained()->onDelete('cascade');
            $table->string('phone_number');
            $table->string('name')->nullable();
            $table->string('email')->nullable();
            $table->string('avatar_url')->nullable();
            $table->json('custom_fields')->nullable();
            $table->timestamp('last_interaction_at')->nullable();
            $table->timestamps();
            
            $table->unique(['organization_id', 'phone_number']);
            $table->index('phone_number');
            $table->index('last_interaction_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('contacts');
    }
};
