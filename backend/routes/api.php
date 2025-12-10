<?php

use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\BroadcastController;
use App\Http\Controllers\ContactController;
use App\Http\Controllers\ConversationController;
use App\Http\Controllers\MessageController;
use App\Http\Controllers\TagController;
use App\Http\Controllers\TemplateController;
use App\Http\Controllers\WebhookController;
use App\Http\Controllers\WhatsappInstanceController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// Public routes
Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/login', [AuthController::class, 'login']);
Route::post('/auth/forgot-password', [AuthController::class, 'forgotPassword']);
Route::post('/auth/reset-password', [AuthController::class, 'resetPassword']);

// Webhook routes (no auth required)
Route::post('/webhook/evolution/{instanceName}', [WebhookController::class, 'handleEvolutionWebhook']);

// Test routes (no auth required - for testing database)
Route::get('/test/debug', function() {
    try {
        $dbConnected = DB::connection()->getPdo() ? 'Connected' : 'Not Connected';
        $contactsCount = DB::table('contacts')->count();
        return response()->json([
            'database' => $dbConnected,
            'contacts_count' => $contactsCount,
            'php_version' => PHP_VERSION,
            'laravel_version' => app()->version(),
        ]);
    } catch (\Exception $e) {
        return response()->json(['error' => $e->getMessage()], 500);
    }
});
Route::get('/test/contacts', [\App\Http\Controllers\TestContactController::class, 'index']);
Route::post('/test/contacts', [\App\Http\Controllers\TestContactController::class, 'store']);
Route::get('/test/messages/{contactId}', [\App\Http\Controllers\TestMessageController::class, 'index']);
Route::post('/test/messages', [\App\Http\Controllers\TestMessageController::class, 'store']);




// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    // Auth
    Route::get('/auth/me', [AuthController::class, 'me']);
    Route::post('/auth/logout', [AuthController::class, 'logout']);

    // Contacts
    Route::get('/contacts', [ContactController::class, 'index']);
    Route::post('/contacts', [ContactController::class, 'store']);
    Route::get('/contacts/{id}', [ContactController::class, 'show']);
    Route::put('/contacts/{id}', [ContactController::class, 'update']);
    Route::delete('/contacts/{id}', [ContactController::class, 'destroy']);

    // Conversations
    Route::get('/conversations', [ConversationController::class, 'index']);
    Route::get('/conversations/{id}', [ConversationController::class, 'show']);
    Route::put('/conversations/{id}/assign', [ConversationController::class, 'assign']);
    Route::put('/conversations/{id}/status', [ConversationController::class, 'updateStatus']);
    Route::post('/conversations/{id}/tags', [ConversationController::class, 'addTags']);
    Route::post('/conversations/{id}/read', [ConversationController::class, 'markAsRead']);

    // Messages
    Route::get('/messages/{conversationId}', [MessageController::class, 'index']);
    Route::post('/messages', [MessageController::class, 'store']);
    Route::put('/messages/{id}/read', [MessageController::class, 'markAsRead']);

    // Broadcasts
    Route::get('/broadcasts', [BroadcastController::class, 'index']);
    Route::post('/broadcasts', [BroadcastController::class, 'store']);
    Route::get('/broadcasts/{id}', [BroadcastController::class, 'show']);
    Route::post('/broadcasts/{id}/send', [BroadcastController::class, 'send']);

    // Templates
    Route::get('/templates', [TemplateController::class, 'index']);
    Route::post('/templates', [TemplateController::class, 'store']);
    Route::get('/templates/{id}', [TemplateController::class, 'show']);
    Route::put('/templates/{id}', [TemplateController::class, 'update']);
    Route::delete('/templates/{id}', [TemplateController::class, 'destroy']);

    // Tags
    Route::get('/tags', [TagController::class, 'index']);
    Route::post('/tags', [TagController::class, 'store']);
    Route::put('/tags/{id}', [TagController::class, 'update']);
    Route::delete('/tags/{id}', [TagController::class, 'destroy']);

    // WhatsApp Instances
    Route::get('/whatsapp-instances', [WhatsappInstanceController::class, 'index']);
    Route::post('/whatsapp-instances', [WhatsappInstanceController::class, 'store']);
    Route::get('/whatsapp-instances/{id}', [WhatsappInstanceController::class, 'show']);
    Route::get('/whatsapp-instances/{id}/qr', [WhatsappInstanceController::class, 'getQRCode']);
    Route::get('/whatsapp-instances/{id}/status', [WhatsappInstanceController::class, 'getStatus']);
    Route::delete('/whatsapp-instances/{id}', [WhatsappInstanceController::class, 'destroy']);
});
