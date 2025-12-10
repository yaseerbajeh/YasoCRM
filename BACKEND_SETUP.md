# WhatsApp CRM Backend - Setup Guide

This guide will help you set up the Laravel backend for the WhatsApp CRM system.

## Prerequisites Installation

### 1. Install PHP 8.2+

#### Option A: Using XAMPP (Recommended for Windows)
1. Download XAMPP from [https://www.apachefriends.org/](https://www.apachefriends.org/)
2. Install XAMPP (includes PHP, MySQL, and Apache)
3. Add PHP to your system PATH:
   - Open System Environment Variables
   - Edit PATH variable
   - Add: `C:\xampp\php`
4. Verify installation:
   ```powershell
   php --version
   ```

#### Option B: Using PHP for Windows
1. Download PHP from [https://windows.php.net/download/](https://windows.php.net/download/)
2. Extract to `C:\php`
3. Add `C:\php` to system PATH
4. Copy `php.ini-development` to `php.ini`
5. Enable required extensions in `php.ini`:
   ```ini
   extension=pdo_pgsql
   extension=pgsql
   extension=mbstring
   extension=openssl
   extension=curl
   extension=fileinfo
   extension=redis
   ```

### 2. Install Composer

1. Download Composer installer from [https://getcomposer.org/Composer-Setup.exe](https://getcomposer.org/Composer-Setup.exe)
2. Run the installer (it will detect your PHP installation)
3. Verify installation:
   ```powershell
   composer --version
   ```

### 3. Install PostgreSQL

1. Download PostgreSQL from [https://www.postgresql.org/download/windows/](https://www.postgresql.org/download/windows/)
2. Install PostgreSQL (remember the password you set for the `postgres` user)
3. During installation, note the port (default: 5432)
4. Create database:
   ```powershell
   # Open psql command line
   psql -U postgres
   
   # Create database
   CREATE DATABASE whatsapp_crm;
   
   # Create user (optional)
   CREATE USER crm_user WITH PASSWORD 'your_password';
   GRANT ALL PRIVILEGES ON DATABASE whatsapp_crm TO crm_user;
   ```

### 4. Install Redis

#### Option A: Using WSL (Windows Subsystem for Linux)
```bash
wsl --install
# After WSL is installed and restarted
wsl
sudo apt update
sudo apt install redis-server
sudo service redis-server start
```

#### Option B: Using Memurai (Redis for Windows)
1. Download Memurai from [https://www.memurai.com/](https://www.memurai.com/)
2. Install and start the service
3. Default port: 6379

### 5. Install Node.js (for Laravel Mix/Vite)

1. Download Node.js LTS from [https://nodejs.org/](https://nodejs.org/)
2. Install Node.js
3. Verify:
   ```powershell
   node --version
   npm --version
   ```

## Laravel Project Setup

Once all prerequisites are installed, run:

```powershell
# Navigate to project directory
cd c:\Users\yass1\Desktop\Yaso\YasoCRM\project

# Create Laravel project
composer create-project laravel/laravel backend

# Navigate to backend
cd backend

# Copy environment file
cp .env.example .env

# Generate application key
php artisan key:generate

# Configure .env file (see below)

# Install additional packages
composer require laravel/sanctum
composer require predis/predis
composer require laravel/reverb

# Run migrations
php artisan migrate

# Install Sanctum
php artisan vendor:publish --provider="Laravel\Sanctum\SanctumServiceProvider"

# Install Reverb
php artisan reverb:install
```

## Environment Configuration

Edit `backend/.env`:

```env
APP_NAME="WhatsApp CRM"
APP_ENV=local
APP_KEY=base64:... # Generated automatically
APP_DEBUG=true
APP_URL=http://localhost:8000

# Database Configuration
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=whatsapp_crm
DB_USERNAME=postgres
DB_PASSWORD=your_postgres_password

# Redis Configuration
REDIS_CLIENT=predis
REDIS_HOST=127.0.0.1
REDIS_PASSWORD=null
REDIS_PORT=6379

# Queue Configuration
QUEUE_CONNECTION=redis

# Evolution API Configuration
EVOLUTION_API_URL=http://localhost:8080
EVOLUTION_API_GLOBAL_KEY=your-global-api-key

# File Storage (use local for development)
FILESYSTEM_DISK=local
# For production with S3:
# FILESYSTEM_DISK=s3
# AWS_ACCESS_KEY_ID=
# AWS_SECRET_ACCESS_KEY=
# AWS_DEFAULT_REGION=us-east-1
# AWS_BUCKET=

# Laravel Reverb (WebSockets)
BROADCAST_CONNECTION=reverb
REVERB_APP_ID=your-app-id
REVERB_APP_KEY=your-app-key
REVERB_APP_SECRET=your-app-secret
REVERB_HOST=localhost
REVERB_PORT=8080
REVERB_SCHEME=http

# CORS Configuration for Next.js frontend
SANCTUM_STATEFUL_DOMAINS=localhost:3000
SESSION_DOMAIN=localhost
```

## Running the Application

You'll need 3 terminal windows:

### Terminal 1: Laravel Development Server
```powershell
cd c:\Users\yass1\Desktop\Yaso\YasoCRM\project\backend
php artisan serve
# Server runs on http://localhost:8000
```

### Terminal 2: Queue Worker
```powershell
cd c:\Users\yass1\Desktop\Yaso\YasoCRM\project\backend
php artisan queue:work redis --verbose
```

### Terminal 3: WebSocket Server (Reverb)
```powershell
cd c:\Users\yass1\Desktop\Yaso\YasoCRM\project\backend
php artisan reverb:start
# WebSocket server runs on ws://localhost:8080
```

## Verification

Test that everything is working:

```powershell
# Check database connection
php artisan migrate:status

# Check Redis connection
php artisan tinker
# Then in tinker:
Redis::set('test', 'value');
Redis::get('test');
exit

# Test API endpoint
curl http://localhost:8000/api/health
```

## Next Steps

After setup is complete:
1. Run database migrations to create all tables
2. Seed initial data (admin user, sample contacts)
3. Configure Evolution API instance
4. Test webhook integration
5. Connect Next.js frontend to Laravel API

## Troubleshooting

### "Class 'Redis' not found"
- Enable `extension=redis` in `php.ini`
- Restart your terminal/server

### "SQLSTATE[08006] [7] could not connect to server"
- Ensure PostgreSQL service is running
- Check credentials in `.env`
- Verify database exists

### "cURL error 28: Connection timed out"
- Check Evolution API is running
- Verify `EVOLUTION_API_URL` in `.env`

### Port already in use
- Laravel: Change port with `php artisan serve --port=8001`
- Reverb: Change `REVERB_PORT` in `.env`

## Additional Resources

- [Laravel Documentation](https://laravel.com/docs)
- [Laravel Sanctum](https://laravel.com/docs/sanctum)
- [Laravel Reverb](https://laravel.com/docs/reverb)
- [Evolution API Documentation](https://doc.evolution-api.com/)
