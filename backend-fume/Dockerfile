FROM php:8.3-apache

# Install system dependencies and PHP extensions for PostgreSQL
RUN apt-get update \
    && apt-get install -y --no-install-recommends git unzip libpq-dev \
    && docker-php-ext-install pdo pdo_pgsql \
    && rm -rf /var/lib/apt/lists/*

# Enable Apache rewrite for Laravel routing
RUN a2enmod rewrite

# Set working directory
WORKDIR /var/www/html

# Copy source (Render builds with repo root as context)
# Copy only the Laravel app directory into the container root
COPY backend-fume/ /var/www/html

# Install Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# Install PHP dependencies, optimize autoloader, and cache configs
RUN composer install --no-dev --prefer-dist --optimize-autoloader --no-interaction \
    && mkdir -p storage/framework/{cache,sessions,views} bootstrap/cache \
    && php artisan config:clear || true \
    && php artisan route:clear || true \
    && php artisan view:clear || true \
    && chown -R www-data:www-data storage bootstrap/cache

# Set Apache document root to Laravel's public directory
ENV APACHE_DOCUMENT_ROOT=/var/www/html/public
RUN sed -ri -e 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/sites-available/*.conf /etc/apache2/apache2.conf /etc/apache2/conf-available/*.conf

# Health check path should be /up per Laravel 11 bootstrap config
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD curl -fsS http://localhost/up || exit 1

# On container start: ensure runtime dirs exist, run migrations (idempotent), then start Apache
CMD bash -lc "mkdir -p storage/framework/{cache,sessions,views} bootstrap/cache && chown -R www-data:www-data storage bootstrap/cache && php artisan migrate --force --no-interaction || true; apache2-foreground"


