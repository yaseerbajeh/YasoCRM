# Evolution API Setup Guide

This guide explains how to install and configure Evolution API for WhatsApp integration.

## What is Evolution API?

Evolution API is an open-source WhatsApp Web API that allows you to send and receive messages programmatically. It uses WhatsApp Web's multi-device feature.

## Installation Methods

### Method 1: Docker (Recommended)

#### Prerequisites
- Docker and Docker Compose installed

#### Steps

1. **Create docker-compose.yml**

```yaml
version: '3.8'

services:
  evolution-api:
    image: atendai/evolution-api:latest
    container_name: evolution-api
    ports:
      - "8080:8080"
    environment:
      - SERVER_URL=http://localhost:8080
      - AUTHENTICATION_API_KEY=your-global-api-key-here
      - DATABASE_ENABLED=true
      - DATABASE_PROVIDER=postgresql
      - DATABASE_CONNECTION_URI=postgresql://postgres:password@postgres:5432/evolution
      - RABBITMQ_ENABLED=false
      - WEBSOCKET_ENABLED=true
    depends_on:
      - postgres
    networks:
      - evolution-network

  postgres:
    image: postgres:15-alpine
    container_name: evolution-postgres
    environment:
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
      - POSTGRES_DB=evolution
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - evolution-network

networks:
  evolution-network:
    driver: bridge

volumes:
  postgres_data:
```

2. **Start Evolution API**

```bash
docker-compose up -d
```

3. **Verify Installation**

```bash
curl http://localhost:8080
```

### Method 2: Manual Installation

#### Prerequisites
- Node.js 18+ installed
- PostgreSQL installed

#### Steps

1. **Clone Repository**

```bash
git clone https://github.com/EvolutionAPI/evolution-api.git
cd evolution-api
```

2. **Install Dependencies**

```bash
npm install
```

3. **Configure Environment**

Create `.env` file:

```env
# Server
SERVER_URL=http://localhost:8080
SERVER_PORT=8080

# Authentication
AUTHENTICATION_API_KEY=your-global-api-key-here

# Database
DATABASE_ENABLED=true
DATABASE_PROVIDER=postgresql
DATABASE_CONNECTION_URI=postgresql://postgres:password@localhost:5432/evolution

# Logs
LOG_LEVEL=ERROR
LOG_COLOR=true

# WebSocket
WEBSOCKET_ENABLED=true
```

4. **Start Server**

```bash
npm run start:prod
```

## Creating WhatsApp Instance

### Via API

```bash
curl -X POST http://localhost:8080/instance/create \
  -H "apikey: your-global-api-key-here" \
  -H "Content-Type: application/json" \
  -d '{
    "instanceName": "my-whatsapp",
    "qrcode": true,
    "integration": "WHATSAPP-BAILEYS"
  }'
```

### Via Laravel Backend

The Laravel backend handles instance creation automatically:

```bash
POST /api/whatsapp-instances
{
  "instance_name": "my-whatsapp"
}
```

## Connecting WhatsApp

### 1. Get QR Code

```bash
curl -X GET http://localhost:8080/instance/connect/my-whatsapp \
  -H "apikey: your-global-api-key-here"
```

Or via Laravel:

```bash
GET /api/whatsapp-instances/{id}/qr
```

### 2. Scan QR Code

1. Open WhatsApp on your phone
2. Go to Settings > Linked Devices
3. Tap "Link a Device"
4. Scan the QR code from the API response

### 3. Verify Connection

```bash
curl -X GET http://localhost:8080/instance/connectionState/my-whatsapp \
  -H "apikey: your-global-api-key-here"
```

## Webhook Configuration

Evolution API will send webhooks to your Laravel backend for incoming messages.

### Set Webhook URL

```bash
curl -X POST http://localhost:8080/webhook/set/my-whatsapp \
  -H "apikey: your-global-api-key-here" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "http://your-domain.com/api/webhook/evolution/my-whatsapp",
    "webhook_by_events": false,
    "webhook_base64": false,
    "events": [
      "messages.upsert",
      "messages.update",
      "connection.update"
    ]
  }'
```

The Laravel backend automatically sets this webhook when you create an instance.

## Testing Message Sending

### Send Text Message

```bash
curl -X POST http://localhost:8080/message/sendText/my-whatsapp \
  -H "apikey: your-global-api-key-here" \
  -H "Content-Type: application/json" \
  -d '{
    "number": "1234567890",
    "text": "Hello from Evolution API!"
  }'
```

### Send Media Message

```bash
curl -X POST http://localhost:8080/message/sendMedia/my-whatsapp \
  -H "apikey: your-global-api-key-here" \
  -H "Content-Type: application/json" \
  -d '{
    "number": "1234567890",
    "mediatype": "image",
    "media": "https://example.com/image.jpg",
    "caption": "Check this out!"
  }'
```

## Webhook Payload Examples

### Incoming Message

```json
{
  "event": "messages.upsert",
  "instance": "my-whatsapp",
  "data": {
    "key": {
      "remoteJid": "1234567890@s.whatsapp.net",
      "fromMe": false,
      "id": "3EB0XXXXX"
    },
    "pushName": "John Doe",
    "message": {
      "conversation": "Hello!"
    },
    "messageType": "conversation",
    "messageTimestamp": 1234567890
  }
}
```

### Connection Update

```json
{
  "event": "connection.update",
  "instance": "my-whatsapp",
  "data": {
    "state": "open"
  }
}
```

## Laravel Backend Integration

The Laravel backend is already configured to work with Evolution API. Here's what happens:

1. **Instance Creation**: When you create a WhatsApp instance via the API, it:
   - Creates the instance in Evolution API
   - Stores instance details in the database
   - Sets up the webhook automatically

2. **Message Receiving**: When a message arrives:
   - Evolution API sends webhook to `/api/webhook/evolution/{instanceName}`
   - Laravel queues the message for processing
   - Message is stored in database
   - Real-time event is broadcast to frontend

3. **Message Sending**: When you send a message:
   - Laravel calls Evolution API
   - Message is sent via WhatsApp
   - Status is tracked in database

## Production Deployment

### Security Recommendations

1. **Use Strong API Key**
```env
AUTHENTICATION_API_KEY=$(openssl rand -base64 32)
```

2. **Enable HTTPS**
```env
SERVER_URL=https://your-domain.com
```

3. **Firewall Rules**
- Only allow your Laravel backend IP to access Evolution API
- Use VPN or private network if possible

4. **Database Security**
- Use strong PostgreSQL password
- Enable SSL for database connections

### Nginx Configuration

```nginx
server {
    listen 80;
    server_name evolution.yourdomain.com;

    location / {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Process Manager (PM2)

```bash
npm install -g pm2

# Start Evolution API with PM2
pm2 start npm --name evolution-api -- run start:prod

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
```

## Troubleshooting

### QR Code Not Generating

- Check Evolution API logs: `docker logs evolution-api`
- Ensure instance was created successfully
- Try deleting and recreating the instance

### Messages Not Receiving

- Verify webhook URL is accessible from Evolution API
- Check Laravel logs: `tail -f storage/logs/laravel.log`
- Ensure queue worker is running

### Connection Keeps Dropping

- WhatsApp may have rate-limited your number
- Try using a different phone number
- Ensure stable internet connection

### Instance Not Connecting

- Delete instance and create new one
- Clear WhatsApp app cache on phone
- Try unlinking all devices and reconnecting

## Useful Commands

```bash
# List all instances
curl -X GET http://localhost:8080/instance/fetchInstances \
  -H "apikey: your-global-api-key-here"

# Delete instance
curl -X DELETE http://localhost:8080/instance/delete/my-whatsapp \
  -H "apikey: your-global-api-key-here"

# Logout instance
curl -X DELETE http://localhost:8080/instance/logout/my-whatsapp \
  -H "apikey: your-global-api-key-here"
```

## Resources

- [Evolution API Documentation](https://doc.evolution-api.com/)
- [Evolution API GitHub](https://github.com/EvolutionAPI/evolution-api)
- [WhatsApp Business Policy](https://www.whatsapp.com/legal/business-policy)

## Important Notes

⚠️ **WhatsApp Terms of Service**
- Using unofficial APIs may violate WhatsApp's Terms of Service
- Use at your own risk
- Consider using official WhatsApp Business API for production

⚠️ **Rate Limiting**
- WhatsApp may ban numbers sending too many messages
- Implement delays between messages (3-5 seconds recommended)
- Monitor for connection drops

⚠️ **Backup**
- Regularly backup Evolution API database
- Keep QR codes secure
- Document your instance names and configurations
