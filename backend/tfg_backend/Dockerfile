FROM php:8.2-apache

# Instala extensiones necesarias
RUN apt-get update && apt-get install -y \
    libicu-dev \
    libzip-dev \
    zip \
    git \
    unzip \
    && docker-php-ext-install intl pdo pdo_mysql zip

# Habilita mod_rewrite
RUN a2enmod rewrite

# Copia el código de la app
COPY . /var/www/html

# Da permisos a la carpeta var y vendor
RUN chown -R www-data:www-data /var/www/html/var /var/www/html/vendor

# Configura el DocumentRoot
ENV APACHE_DOCUMENT_ROOT /var/www/html/public
RUN sed -ri -e 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/sites-available/*.conf

# Instala Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

# Instala dependencias de Composer
RUN composer install --no-interaction --optimize-autoloader

EXPOSE 80

# Comando para arrancar Apache en primer plano (necesario para Docker y Render)
CMD ["apache2-foreground"]
