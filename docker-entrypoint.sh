#!/bin/bash
set -e

# Dynamically bind Apache port to Render's $PORT env variable
PORT="${PORT:-80}"
sed -i "s/Listen [0-9]*/Listen $PORT/g" /etc/apache2/ports.conf
sed -i "s/<VirtualHost \*:[0-9]*>/<VirtualHost *:$PORT>/g" /etc/apache2/sites-available/000-default.conf

# Ensure SQLite database directory & file exist with proper permissions
mkdir -p /var/www/html/database
if [ ! -f /var/www/html/database/database.sqlite ]; then
    touch /var/www/html/database/database.sqlite
fi

# Ensure storage subdirectories exist
mkdir -p /var/www/html/storage/framework/sessions \
         /var/www/html/storage/framework/views \
         /var/www/html/storage/framework/cache \
         /var/www/html/storage/logs

# Set writable permissions
chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache /var/www/html/database
chmod -R 775 /var/www/html/storage /var/www/html/bootstrap/cache /var/www/html/database
chmod 664 /var/www/html/database/database.sqlite

# Run database migrations and seed default admin/employees if fresh
php artisan migrate --force --seed || php artisan migrate --force

# Create storage symlink
php artisan storage:link || true

# Production caches
php artisan config:cache || true
php artisan route:cache || true
php artisan view:cache || true

exec "$@"
