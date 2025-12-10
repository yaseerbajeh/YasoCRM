# WhatsApp CRM Backend

A comprehensive Laravel-based backend API for a WhatsApp CRM SaaS system with Evolution API integration, real-time messaging, and broadcast capabilities.

## Features

- ✅ **Multi-tenant Architecture** - Support for multiple organizations
- ✅ **Role-based Access Control** - Admin and Agent roles
- ✅ **Evolution API Integration** - WhatsApp message sending/receiving
- ✅ **Real-time Messaging** - Laravel Reverb WebSocket support
- ✅ **Queue System** - Redis-based queue for broadcasts and message processing
- ✅ **Media Handling** - Support for images, videos, documents, and audio
- ✅ **Broadcast System** - Send bulk messages to multiple contacts
- ✅ **Message Templates** - Reusable message templates with variables
- ✅ **Conversation Management** - Tag, assign, and track conversations
- ✅ **RESTful API** - Complete API for Next.js frontend integration

## Tech Stack

- **Framework**: Laravel 11
- **Database**: PostgreSQL
- **Cache/Queue**: Redis
- **Authentication**: Laravel Sanctum
- **WebSockets**: Laravel Reverb
- **WhatsApp**: Evolution API v2

## Prerequisites

Before setting up the backend, ensure you have:

- PHP 8.2 or higher
- Composer
- PostgreSQL 14+
- Redis
- Evolution API instance (see [Evolution API Setup](docs/EVOLUTION_API_SETUP.md))

## Installation

### 1. Install Dependencies

```bash
cd backend
composer install
```

### 2. Environment Configuration

```bash
cp .env.example .env
php artisan key:generate
```

Edit `.env` and configure:

```env
# Database
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=whatsapp_crm
DB_USERNAME=postgres
DB_PASSWORD=your_password

# Redis
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
QUEUE_CONNECTION=redis

# Evolution API
EVOLUTION_API_URL=http://localhost:8080
EVOLUTION_API_GLOBAL_KEY=your-evolution-api-key

# Laravel Reverb
BROADCAST_CONNECTION=reverb
REVERB_APP_ID=1
REVERB_APP_KEY=your-app-key
REVERB_APP_SECRET=your-app-secret
```

### 3. Database Setup

```bash
# Run migrations
php artisan migrate

# Seed initial data (optional)
php artisan db:seed
```

### 4. Storage Setup

```bash
# Create storage symlink
php artisan storage:link
```

## Running the Application

You need to run three services:

### Terminal 1: Laravel Server

```bash
php artisan serve
# Runs on http://localhost:8000
```

### Terminal 2: Queue Worker

```bash
php artisan queue:work redis --verbose
```

### Terminal 3: WebSocket Server

```bash
php artisan reverb:start
# Runs on ws://localhost:8080
```

## API Documentation

### Authentication

```bash
# Register
POST /api/auth/register
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password",
  "password_confirmation": "password",
  "organization_name": "My Company"
}

# Login
POST /api/auth/login
{
  "email": "john@example.com",
  "password": "password"
}

# Get current user
GET /api/auth/me
Authorization: Bearer {token}
```

### Contacts

```bash
# List contacts
GET /api/contacts?search=john&per_page=20
Authorization: Bearer {token}

# Create contact
POST /api/contacts
{
  "phone_number": "1234567890",
  "name": "John Doe",
  "email": "john@example.com"
}

# Get contact
GET /api/contacts/{id}

# Update contact
PUT /api/contacts/{id}

# Delete contact
DELETE /api/contacts/{id}
```

### Conversations

```bash
# List conversations
GET /api/conversations?status=open&assigned_to=1

# Get conversation
GET /api/conversations/{id}

# Assign conversation
PUT /api/conversations/{id}/assign
{
  "agent_id": 1
}

# Update status
PUT /api/conversations/{id}/status
{
  "status": "closed"
}

# Add tags
POST /api/conversations/{id}/tags
{
  "tag_ids": [1, 2, 3]
}
```

### Messages

```bash
# Get messages
GET /api/messages/{conversationId}?per_page=50

# Send text message
POST /api/messages
{
  "conversation_id": 1,
  "content": "Hello!"
}

# Send media message
POST /api/messages
Content-Type: multipart/form-data
{
  "conversation_id": 1,
  "content": "Check this out",
  "media": [file],
  "media_type": "image"
}
```

### Broadcasts

```bash
# Create broadcast
POST /api/broadcasts
{
  "whatsapp_instance_id": 1,
  "name": "Summer Sale",
  "message": "Get 50% off!",
  "contact_ids": [1, 2, 3, 4, 5]
}

# Send broadcast
POST /api/broadcasts/{id}/send
```

For complete API documentation, see [API.md](docs/API.md)

## WebSocket Events

Connect to WebSocket server and listen for events:

```javascript
// Subscribe to conversation
Echo.private(`conversations.${conversationId}`)
  .listen('.message.received', (e) => {
    console.log('New message:', e.message);
  })
  .listen('.message.sent', (e) => {
    console.log('Message sent:', e.message);
  });
```

## Project Structure

```
backend/
├── app/
│   ├── Events/              # WebSocket events
│   ├── Http/
│   │   └── Controllers/     # API controllers
│   ├── Jobs/                # Queue jobs
│   ├── Models/              # Eloquent models
│   └── Services/            # Business logic services
├── config/                  # Configuration files
├── database/
│   ├── migrations/          # Database migrations
│   └── seeders/             # Database seeders
├── docs/                    # Documentation
├── routes/
│   ├── api.php             # API routes
│   └── channels.php        # WebSocket channels
└── storage/                # File storage
```

## Development

### Running Tests

```bash
php artisan test
```

### Code Style

```bash
./vendor/bin/pint
```

### Queue Monitoring

```bash
php artisan queue:monitor redis
```

## Deployment

See [DEPLOYMENT.md](docs/DEPLOYMENT.md) for VPS deployment instructions.

## Documentation

- [Evolution API Setup](docs/EVOLUTION_API_SETUP.md)
- [Frontend Integration](docs/FRONTEND_INTEGRATION.md)
- [Deployment Guide](docs/DEPLOYMENT.md)
- [API Reference](docs/API.md)

## License

MIT License
