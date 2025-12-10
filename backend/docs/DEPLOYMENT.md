# VPS Deployment Guide

This guide explains how to deploy the WhatsApp CRM backend to a VPS (Ubuntu 22.04 LTS).

## Prerequisites

- Ubuntu 22.04 LTS VPS
- Root or sudo access
- Domain name pointed to your VPS IP

## 1. Initial Server Setup

### Update System

```bash
sudo apt update && sudo apt upgrade -y
```

### Create Deployment User

```bash
sudo adduser deployer
sudo usermod -aG sudo deployer
su - deployer
```

## 2. Install Required Software

### Install PHP 8.2

```bash
sudo apt install software-properties-common
sudo add-apt-repository ppa:ondrej/php
sudo apt update
sudo apt install php8.2 php8.2-fpm php8.2-cli php8.2-common php8.2-mysql php8.2-zip php8.2-gd php8.2-mbstring php8.2-curl php8.2-xml php8.2-bcmath php8.2-pgsql php8.2-redis -y
```

### Install Composer

```bash
curl -sS https://getcomposer.org/installer | php
sudo mv composer.phar /usr/local/bin/composer
```

### Install PostgreSQL

```bash
sudo apt install postgresql postgresql-contrib -y
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Create database
sudo -u postgres psql
CREATE DATABASE whatsapp_crm;
CREATE USER crm_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE whatsapp_crm TO crm_user;
\q
```

### Install Redis

```bash
sudo apt install redis-server -y
sudo systemctl start redis-server
sudo systemctl enable redis-server
```

### Install Nginx

```bash
sudo apt install nginx -y
sudo systemctl start nginx
sudo systemctl enable nginx
```

### Install Supervisor

```bash
sudo apt install supervisor -y
sudo systemctl start supervisor
sudo systemctl enable supervisor
```

## 3. Deploy Laravel Application

### Clone Repository

```bash
cd /var/www
sudo git clone your-repository-url whatsapp-crm
sudo chown -R deployer:deployer whatsapp-crm
cd whatsapp-crm/backend
```

### Install Dependencies

```bash
composer install --optimize-autoloader --no-dev
```

### Configure Environment

```bash
cp .env.example .env
php artisan key:generate
```

Edit `.env`:

```env
APP_NAME="WhatsApp CRM"
APP_ENV=production
APP_DEBUG=false
APP_URL=https://your-domain.com

DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=whatsapp_crm
DB_USERNAME=crm_user
DB_PASSWORD=your_secure_password

REDIS_HOST=127.0.0.1
REDIS_PORT=6379
QUEUE_CONNECTION=redis

EVOLUTION_API_URL=http://localhost:8080
EVOLUTION_API_GLOBAL_KEY=your-evolution-api-key

BROADCAST_CONNECTION=reverb
REVERB_APP_ID=1
REVERB_APP_KEY=your-app-key
REVERB_APP_SECRET=your-app-secret
REVERB_HOST=your-domain.com
REVERB_PORT=6001
REVERB_SCHEME=https
```

### Run Migrations

```bash
php artisan migrate --force
php artisan storage:link
```

### Set Permissions

```bash
sudo chown -R www-data:www-data /var/www/whatsapp-crm/backend/storage
sudo chown -R www-data:www-data /var/www/whatsapp-crm/backend/bootstrap/cache
sudo chmod -R 775 /var/www/whatsapp-crm/backend/storage
sudo chmod -R 775 /var/www/whatsapp-crm/backend/bootstrap/cache
```

## 4. Configure Nginx

Create `/etc/nginx/sites-available/whatsapp-crm`:

```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /var/www/whatsapp-crm/backend/public;

    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-Content-Type-Options "nosniff";

    index index.php;

    charset utf-8;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location = /favicon.ico { access_log off; log_not_found off; }
    location = /robots.txt  { access_log off; log_not_found off; }

    error_page 404 /index.php;

    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.2-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
    }

    location ~ /\.(?!well-known).* {
        deny all;
    }
}

# WebSocket server (Reverb)
server {
    listen 6001;
    server_name your-domain.com;

    location / {
        proxy_pass http://127.0.0.1:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "Upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable site:

```bash
sudo ln -s /etc/nginx/sites-available/whatsapp-crm /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## 5. Configure Supervisor

### Queue Worker

Create `/etc/supervisor/conf.d/whatsapp-crm-worker.conf`:

```ini
[program:whatsapp-crm-worker]
process_name=%(program_name)s_%(process_num)02d
command=php /var/www/whatsapp-crm/backend/artisan queue:work redis --sleep=3 --tries=3 --max-time=3600
autostart=true
autorestart=true
stopasgroup=true
killasgroup=true
user=deployer
numprocs=2
redirect_stderr=true
stdout_logfile=/var/www/whatsapp-crm/backend/storage/logs/worker.log
stopwaitsecs=3600
```

### Reverb Server

Create `/etc/supervisor/conf.d/whatsapp-crm-reverb.conf`:

```ini
[program:whatsapp-crm-reverb]
process_name=%(program_name)s
command=php /var/www/whatsapp-crm/backend/artisan reverb:start
autostart=true
autorestart=true
stopasgroup=true
killasgroup=true
user=deployer
redirect_stderr=true
stdout_logfile=/var/www/whatsapp-crm/backend/storage/logs/reverb.log
```

Reload Supervisor:

```bash
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl start all
```

## 6. SSL Certificate (Let's Encrypt)

```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d your-domain.com
```

Update Nginx config to use SSL:

```nginx
server {
    listen 443 ssl http2;
    server_name your-domain.com;
    
    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;
    
    # ... rest of configuration
}
```

## 7. Deploy Evolution API

### Using Docker

```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker deployer

# Create docker-compose.yml
cd /var/www/whatsapp-crm
nano docker-compose.yml
```

Paste Evolution API configuration (see EVOLUTION_API_SETUP.md).

```bash
docker-compose up -d
```

## 8. Firewall Configuration

```bash
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443
sudo ufw allow 6001
sudo ufw enable
```

## 9. Monitoring and Logs

### View Logs

```bash
# Laravel logs
tail -f /var/www/whatsapp-crm/backend/storage/logs/laravel.log

# Queue worker logs
tail -f /var/www/whatsapp-crm/backend/storage/logs/worker.log

# Reverb logs
tail -f /var/www/whatsapp-crm/backend/storage/logs/reverb.log

# Nginx logs
tail -f /var/log/nginx/error.log
```

### Monitor Queue

```bash
php artisan queue:monitor redis
```

### Supervisor Status

```bash
sudo supervisorctl status
```

## 10. Automated Deployment Script

Create `deploy.sh`:

```bash
#!/bin/bash

cd /var/www/whatsapp-crm/backend

# Maintenance mode
php artisan down

# Pull latest code
git pull origin main

# Install dependencies
composer install --optimize-autoloader --no-dev

# Run migrations
php artisan migrate --force

# Clear caches
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Restart services
sudo supervisorctl restart all

# Exit maintenance mode
php artisan up

echo "Deployment completed!"
```

Make executable:

```bash
chmod +x deploy.sh
```

## 11. Backup Strategy

### Database Backup

Create `/usr/local/bin/backup-db.sh`:

```bash
#!/bin/bash
BACKUP_DIR="/var/backups/whatsapp-crm"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

pg_dump -U crm_user whatsapp_crm > $BACKUP_DIR/db_$DATE.sql

# Keep only last 7 days
find $BACKUP_DIR -name "db_*.sql" -mtime +7 -delete
```

Add to crontab:

```bash
crontab -e
# Add:
0 2 * * * /usr/local/bin/backup-db.sh
```

## 12. Performance Optimization

### PHP-FPM Tuning

Edit `/etc/php/8.2/fpm/pool.d/www.conf`:

```ini
pm = dynamic
pm.max_children = 50
pm.start_servers = 10
pm.min_spare_servers = 5
pm.max_spare_servers = 20
pm.max_requests = 500
```

### Redis Optimization

Edit `/etc/redis/redis.conf`:

```
maxmemory 256mb
maxmemory-policy allkeys-lru
```

### Nginx Optimization

```nginx
client_max_body_size 20M;
fastcgi_buffers 16 16k;
fastcgi_buffer_size 32k;
```

## 13. Security Checklist

- [ ] Change default PostgreSQL password
- [ ] Configure firewall (UFW)
- [ ] Enable SSL/HTTPS
- [ ] Disable directory listing
- [ ] Set proper file permissions
- [ ] Use strong Evolution API key
- [ ] Enable fail2ban
- [ ] Regular security updates
- [ ] Monitor logs for suspicious activity

## 14. Troubleshooting

### Queue Not Processing

```bash
sudo supervisorctl restart whatsapp-crm-worker:*
```

### WebSocket Not Connecting

```bash
# Check Reverb is running
sudo supervisorctl status whatsapp-crm-reverb

# Check port is open
sudo netstat -tulpn | grep 6001
```

### 500 Internal Server Error

```bash
# Check Laravel logs
tail -f storage/logs/laravel.log

# Check Nginx logs
tail -f /var/log/nginx/error.log

# Clear cache
php artisan cache:clear
php artisan config:clear
```

## 15. Maintenance Commands

```bash
# Clear all caches
php artisan optimize:clear

# Rebuild caches
php artisan optimize

# Restart queue workers
sudo supervisorctl restart whatsapp-crm-worker:*

# Restart Reverb
sudo supervisorctl restart whatsapp-crm-reverb
```

## Production Checklist

- [ ] Environment set to production
- [ ] Debug mode disabled
- [ ] Database credentials secured
- [ ] SSL certificate installed
- [ ] Queue workers running
- [ ] Reverb server running
- [ ] Evolution API configured
- [ ] Backups automated
- [ ] Monitoring setup
- [ ] Firewall configured
- [ ] Logs rotation configured

## Support

For issues or questions:
- Check logs first
- Review documentation
- Check Evolution API status
- Verify all services are running
