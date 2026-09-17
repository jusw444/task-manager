FROM php:8.2-fpm

RUN apt-get update \
    && apt-get install -y \
        libicu-dev \
        libzip-dev \
        unzip \
    && docker-php-ext-install \
        intl \
        opcache \
        pdo_mysql \
        zip \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www

COPY docker/php/conf.d/opcache.ini /usr/local/etc/php/conf.d/opcache.ini

COPY composer.json composer.lock ./

RUN composer install \
    --no-interaction \
    --prefer-dist \
    --no-progress \
    --no-dev \
    --optimize-autoloader \
    --no-scripts

COPY --chown=www-data:www-data . .

RUN mkdir -p \
        storage/framework/cache \
        storage/framework/sessions \
        storage/framework/views \
        storage/logs \
        bootstrap/cache \
    && chown -R www-data:www-data storage bootstrap/cache

RUN php artisan package:discover --ansi