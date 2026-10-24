FROM php:8.3-apache

# Install system dependencies
RUN apt-get update && apt-get install -y \
    git \
    curl \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    libsqlite3-dev \
    libzip-dev \
    zip \
    unzip \
    && rm -rf /var/lib/apt/lists/*

# Install Node.js 20 LTS for building Vite frontend
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs \
    && rm -rf /var/lib/apt/lists/*

# Install PHP extensions required by Laravel
RUN docker-php-ext-install pdo pdo_sqlite mbstring zip bcmath gd opcache

# Enable Apache mod_rewrite
RUN a2enmod rewrite

# Configure Apache DocumentRoot to Laravel's public directory
ENV APACHE_DOCUMENT_ROOT=/var/www/html/public
RUN sed -ri -e 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/sites-available/*.conf
RUN sed -ri -e 's!/var/www/!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/apache2.conf /etc/apache2/conf-available/*.conf

# Allow .htaccess overrides in public directory
RUN sed -ri -e 's/AllowOverride None/AllowOverride All/g' /etc/apache2/apache2.conf

# Install Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# Set working directory
WORKDIR /var/www/html

# Copy application files
COPY . /var/www/html

# Install Composer dependencies (optimized for production)
RUN composer install --no-dev --optimize-autoloader --no-interaction

# Install NPM dependencies and build Vite frontend production bundle
RUN npm ci || npm install
RUN npm run build

# Setup entrypoint script
COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# Setup directory permissions for storage, cache, and database
RUN mkdir -p /var/www/html/storage /var/www/html/bootstrap/cache /var/www/html/database \
    && chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache /var/www/html/database \
    && chmod -R 775 /var/www/html/storage /var/www/html/bootstrap/cache /var/www/html/database

ENV PORT=80
EXPOSE ${PORT}

ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["apache2-foreground"]
