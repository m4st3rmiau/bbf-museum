# Galería de los recuerdos

Museo interactivo construido como una sola aplicación Laravel. Laravel e Inertia sirven la interfaz React; Three.js renderiza la sala; MySQL conserva las obras y los datos de registro; las fotografías se guardan mediante Laravel Storage.

## Requisitos

- PHP 8.3 o superior con extensiones `pdo_mysql`, `mbstring`, `fileinfo`, `openssl` y `gd`
- Composer 2
- Node.js 22 y npm
- MySQL 8
- Nginx o Apache apuntando a `public/`

## Desarrollo local

```bash
composer install
npm install
cp .env.example .env
php artisan key:generate
```

Configura una base MySQL en `.env` y ejecuta:

```bash
php artisan migrate --seed
php artisan storage:link
composer run dev
```

Para una instalación local rápida también puede usarse SQLite cambiando `DB_CONNECTION=sqlite` y creando `database/database.sqlite`.

## Datos y archivos

- `artworks`: contenido público de cada obra.
- `artwork_submissions`: nombre, correo, teléfono e interés, separado del contenido público.
- `storage/app/public/artworks`: fotografías cargadas.
- `public/images`: fotografías iniciales sembradas por `DatabaseSeeder`.

La galería únicamente recibe recursos serializados por `ArtworkResource`, por lo que los datos de contacto no se envían al navegador.

## Despliegue

1. Copia `.env.example` a `.env` y configura `APP_URL`, `APP_KEY` y las credenciales MySQL.
2. Configura el document root del servidor en `public/`.
3. Asegura permisos de escritura para `storage/` y `bootstrap/cache/`. En despliegues por versiones, conserva `storage/app/public` en un volumen o directorio compartido para no perder fotografías.
4. Ajusta PHP a `upload_max_filesize=10M` y `post_max_size=24M`.
5. Ejecuta `bash scripts/deploy.sh` desde cada versión publicada.
6. Reinicia PHP-FPM si utiliza OPcache con validación de timestamps desactivada.

El archivo `deploy/nginx.conf.example` incluye la ruta pública y el límite necesario para las dos fotografías. El despliegue crea el enlace de Storage, ejecuta migraciones y semillas idempotentes, compila los assets y activa las cachés de Laravel.

## Validación

```bash
npm run typecheck
npm run build
php artisan test
./vendor/bin/pint --test
```

No debe versionarse `.env`, `vendor/`, `node_modules/`, `public/build/` ni `public/storage`.
