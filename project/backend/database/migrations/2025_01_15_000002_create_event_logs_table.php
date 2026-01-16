<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('event_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('organization_id')->constrained()->onDelete('cascade');
            $table->string('event_type'); // message_sent, message_received, contact_created, etc.
            $table->nullableMorphs('loggable'); // polymorphic relation
            $table->json('metadata')->nullable();
            $table->timestamps();

            $table->index(['organization_id', 'event_type']);
            $table->index(['organization_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('event_logs');
    }
};
