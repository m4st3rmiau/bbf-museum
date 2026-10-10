<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="theme-color" content="#f8f6f2">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <link rel="icon" href="/favicon.svg">
    @if (request()->routeIs('home', 'exhibit', 'exhibit.contact', 'thanks'))
        <link rel="preload" as="image" type="image/webp" href="/home/bbf-background-1280.webp" imagesrcset="/home/bbf-background-1280.webp 1280w, /home/bbf-background-2560.webp 2560w" imagesizes="100vw">
    @endif
    @viteReactRefresh
    @vite(['resources/css/app.css', 'resources/js/app.tsx'])
    @inertiaHead
</head>
<body>@inertia</body>
</html>
