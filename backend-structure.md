# Backend Project Structure

This document outlines the complete structure of the Laravel backend that will be created.

## Directory Structure

```
backend/
├── app/
│   ├── Console/
│   │   └── Kernel.php
│   ├── Events/
│   │   ├── MessageReceived.php
│   │   ├── MessageSent.php
│   │   └── ConversationUpdated.php
│   ├── Exceptions/
│   │   └── Handler.php
│   ├── Http/
│   │   ├── Controllers/
│   │   │   ├── Auth/
│   │   │   │   ├── AuthController.php
│   │   │   │   ├── PasswordResetController.php
│   │   │   │   └── RegisterController.php
│   │   │   ├── BroadcastController.php
│   │   │   ├── ContactController.php
│   │   │   ├── ConversationController.php
│   │   │   ├── MessageController.php
│   │   │   ├── TagController.php
│   │   │   ├── TemplateController.php
│   │   │   ├── WebhookController.php
│   │   │   └── WhatsappInstanceController.php
│   │   ├── Middleware/
│   │   │   ├── Authenticate.php
│   │   │   ├── CheckRole.php
│   │   │   └── VerifyWebhookSignature.php
│   │   ├── Requests/
│   │   │   ├── Auth/
│   │   │   │   ├── LoginRequest.php
│   │   │   │   └── RegisterRequest.php
│   │   │   ├── BroadcastRequest.php
│   │   │   ├── ContactRequest.php
│   │   │   ├── MessageRequest.php
│   │   │   └── TemplateRequest.php
│   │   └── Resources/
│   │       ├── ContactResource.php
│   │       ├── ConversationResource.php
│   │       ├── MessageResource.php
│   │       └── UserResource.php
│   ├── Jobs/
│   │   ├── ProcessIncomingMessage.php
│   │   ├── SendBroadcastMessage.php
│   │   └── DownloadMediaFile.php
│   ├── Listeners/
│   │   ├── BroadcastMessageToClients.php
│   │   └── LogAutomationEvent.php
│   ├── Models/
│   │   ├── AutomationLog.php
│   │   ├── Broadcast.php
│   │   ├── BroadcastMessage.php
│   │   ├── Contact.php
│   │   ├── Conversation.php
│   │   ├── Media.php
│   │   ├── Message.php
│   │   ├── Organization.php
│   │   ├── Tag.php
│   │   ├── Template.php
│   │   ├── User.php
│   │   └── WhatsappInstance.php
│   ├── Providers/
│   │   ├── AppServiceProvider.php
│   │   ├── AuthServiceProvider.php
│   │   ├── BroadcastServiceProvider.php
│   │   └── EventServiceProvider.php
│   └── Services/
│       ├── EvolutionApiService.php
│       └── MediaService.php
├── bootstrap/
│   ├── app.php
│   └── cache/
├── config/
│   ├── app.php
│   ├── auth.php
│   ├── broadcasting.php
│   ├── cache.php
│   ├── cors.php
│   ├── database.php
│   ├── evolution.php (custom)
│   ├── filesystems.php
│   ├── queue.php
│   └── sanctum.php
├── database/
│   ├── factories/
│   │   ├── ContactFactory.php
│   │   ├── ConversationFactory.php
│   │   └── UserFactory.php
│   ├── migrations/
│   │   ├── 2024_01_01_000001_create_organizations_table.php
│   │   ├── 2024_01_01_000002_create_users_table.php
│   │   ├── 2024_01_01_000003_create_whatsapp_instances_table.php
│   │   ├── 2024_01_01_000004_create_contacts_table.php
│   │   ├── 2024_01_01_000005_create_conversations_table.php
│   │   ├── 2024_01_01_000006_create_messages_table.php
│   │   ├── 2024_01_01_000007_create_media_table.php
│   │   ├── 2024_01_01_000008_create_tags_table.php
│   │   ├── 2024_01_01_000009_create_conversation_tag_table.php
│   │   ├── 2024_01_01_000010_create_templates_table.php
│   │   ├── 2024_01_01_000011_create_broadcasts_table.php
│   │   ├── 2024_01_01_000012_create_broadcast_messages_table.php
│   │   ├── 2024_01_01_000013_create_automation_logs_table.php
│   │   └── 2024_01_01_000014_create_personal_access_tokens_table.php
│   └── seeders/
│       ├── DatabaseSeeder.php
│       ├── OrganizationSeeder.php
│       ├── UserSeeder.php
│       └── TagSeeder.php
├── docs/
│   ├── API.md
│   ├── DEPLOYMENT.md
│   ├── EVOLUTION_API_SETUP.md
│   └── FRONTEND_INTEGRATION.md
├── public/
│   ├── index.php
│   └── storage/ (symlink)
├── resources/
│   └── views/
├── routes/
│   ├── api.php
│   ├── channels.php
│   ├── console.php
│   └── web.php
├── storage/
│   ├── app/
│   │   ├── media/
│   │   └── public/
│   ├── framework/
│   └── logs/
├── tests/
│   ├── Feature/
│   │   ├── AuthenticationTest.php
│   │   ├── BroadcastTest.php
│   │   ├── ContactApiTest.php
│   │   ├── MessageApiTest.php
│   │   └── WebhookTest.php
│   └── Unit/
│       ├── EvolutionApiServiceTest.php
│       └── MediaServiceTest.php
├── .env.example
├── .gitignore
├── artisan
├── composer.json
├── composer.lock
├── phpunit.xml
└── README.md
```

## Key Components

### Models (13 files)
All Eloquent models with relationships, scopes, and business logic.

### Controllers (12 files)
RESTful API controllers for all resources.

### Services (2 files)
- **EvolutionApiService**: Handles all Evolution API communication
- **MediaService**: Manages media upload/download and storage

### Jobs (3 files)
Queue jobs for asynchronous processing:
- Message processing
- Broadcast sending
- Media downloads

### Events & Listeners (5 files)
Real-time event broadcasting for WebSocket updates.

### Migrations (14 files)
Database schema creation with proper foreign keys and indexes.

### Tests (7 files)
Feature and unit tests for core functionality.

## API Routes Overview

```
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/logout
POST   /api/auth/forgot-password
POST   /api/auth/reset-password
GET    /api/auth/me

GET    /api/contacts
POST   /api/contacts
GET    /api/contacts/{id}
PUT    /api/contacts/{id}
DELETE /api/contacts/{id}

GET    /api/conversations
GET    /api/conversations/{id}
PUT    /api/conversations/{id}/assign
PUT    /api/conversations/{id}/status
POST   /api/conversations/{id}/tags

GET    /api/messages/{conversationId}
POST   /api/messages
PUT    /api/messages/{id}/read

GET    /api/broadcasts
POST   /api/broadcasts
GET    /api/broadcasts/{id}
POST   /api/broadcasts/{id}/send

GET    /api/templates
POST   /api/templates
PUT    /api/templates/{id}
DELETE /api/templates/{id}

GET    /api/tags
POST   /api/tags
PUT    /api/tags/{id}
DELETE /api/tags/{id}

POST   /api/webhook/evolution/{instanceName}

GET    /api/whatsapp-instances
POST   /api/whatsapp-instances
GET    /api/whatsapp-instances/{id}/qr
```

## WebSocket Channels

```
Private Channels:
- conversations.{conversationId}
- organizations.{organizationId}
```

## Queue Jobs

All jobs run on Redis queue:
- `broadcasts` queue: Broadcast message sending
- `default` queue: Message processing, media downloads
- `high` queue: Real-time message processing

## File Storage

Development: `storage/app/media/`
Production: S3 bucket configured in `.env`

Media files organized by:
- `media/{organizationId}/{conversationId}/{filename}`
