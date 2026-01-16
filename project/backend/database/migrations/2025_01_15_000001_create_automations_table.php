<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('automations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('organization_id')->constrained()->onDelete('cascade');
            $table->string('name');
            $table->enum('trigger_type', [
                'new_message',
                'keyword',
                'time_delay',
                'conversation_end',
                'new_contact'
            ])->default('new_message');
            $table->string('trigger_value')->nullable(); // keyword or delay value
            $table->enum('status', ['active', 'paused'])->default('paused');
            $table->integer('run_count')->default(0);
            $table->timestamps();
            $table->softDeletes();

            $table->index(['organization_id', 'status']);
            $table->index('trigger_type');
        });

        Schema::create('automation_steps', function (Blueprint $table) {
            $table->id();
            $table->foreignId('automation_id')->constrained()->onDelete('cascade');
            $table->integer('step_order')->default(1);
            $table->enum('action_type', [
                'send_message',
                'send_media',
                'add_tag',
                'remove_tag',
                'assign_agent',
                'wait_delay'
            ]);
            $table->json('action_config'); // message content, media URL, tag ID, etc.
            $table->timestamps();

            $table->index(['automation_id', 'step_order']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('automation_steps');
        Schema::dropIfExists('automations');
    }
};
