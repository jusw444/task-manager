# --------------------------------------------------
# Stage 1: Build frontend assets
# --------------------------------------------------
FROM node:22-alpine AS frontend

WORKDIR /var/www

COPY package*.json ./

RUN npm ci

COPY resources ./resources
COPY public ./public
COPY vite.config.* ./

RUN npm run build


# --------------------------------------------------
# Stage 2: Install PHP dependencies
# --------------------------------------------------
FROM composer:2 AS composer

WORKDIR /var/www

COPY composer.json composer.lock ./

RUN composer install \
    --no-interaction \
    --prefer-dist \
    --no-progress \
    --no-dev \
    --optimize-autoloader \
    --no-scripts


# --------------------------------------------------
# Stage 3: Laravel application
# --------------------------------------------------
FROM php:8.2-fpm AS app

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

WORKDIR /var/www

COPY docker/php/conf.d/opcache.ini /usr/local/etc/php/conf.d/opcache.ini

# Composer dependencies
COPY --from=composer /var/www/vendor ./vendor

# Laravel source
COPY --chown=www-data:www-data . .

# IMPORTANT:
# Use the exact frontend build created in Stage 1.
COPY --from=frontend /var/www/public/build ./public/build

RUN mkdir -p \
        storage/framework/cache \
        storage/framework/sessions \
        storage/framework/views \
        storage/logs \
        bootstrap/cache \
    && chown -R www-data:www-data storage bootstrap/cache

RUN php artisan package:discover --ansi


# --------------------------------------------------
# Stage 4: Nginx
# --------------------------------------------------
FROM nginx:1.27-alpine AS nginx

COPY --from=app /var/www/public /var/www/public

COPY docker/nginx/default.conf /etc/nginx/conf.d/default.conf