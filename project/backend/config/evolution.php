<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Evolution API Configuration
    |--------------------------------------------------------------------------
    |
    | Configuration for Evolution API integration
    |
    */

    'base_url' => env('EVOLUTION_API_URL', 'http://localhost:8080'),
    
    'global_api_key' => env('EVOLUTION_API_GLOBAL_KEY'),
    
    'timeout' => env('EVOLUTION_API_TIMEOUT', 30),
    
    'webhook' => [
        'enabled' => env('EVOLUTION_WEBHOOK_ENABLED', true),
        'url' => env('APP_URL') . '/api/webhook/evolution',
        'events' => [
            'messages.upsert',
            'messages.update',
            'messages.delete',
            'send.message',
            'connection.update',
        ],
    ],
    
    'instance' => [
        'qrcode' => [
            'count' => 5,
        ],
        'integration' => 'WHATSAPP-BAILEYS',
        'reject_call' => false,
        'msg_call' => '',
        'groups_ignore' => true,
        'always_online' => false,
        'read_messages' => false,
        'read_status' => false,
        'sync_full_history' => false,
    ],
    
    'rate_limit' => [
        'enabled' => true,
        'messages_per_minute' => 20,
        'delay_between_messages' => 3, // seconds
    ],

];
