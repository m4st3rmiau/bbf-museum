<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="theme-color" content="#f8f6f2">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <link rel="icon" href="/favicon.svg">
    @if (request()->routeIs('home'))
        <link rel="preload" as="font" type="font/ttf" href="/Font/Kangen.ttf" crossorigin>
        <link rel="preload" as="image" type="image/webp" href="/home/memorial-displays-mobile.webp" media="(max-width: 800px)">
        <link rel="preload" as="image" type="image/webp" href="/home/background-2-1280.webp" imagesrcset="/home/background-2-1280.webp 1280w, /home/background-2-1672.webp 1672w" imagesizes="100vw" media="(min-width: 801px)">
    @elseif (request()->routeIs('exhibit', 'exhibit.contact', 'thanks'))
        <link rel="preload" as="image" type="image/webp" href="/home/memorial-displays-mobile.webp" media="(max-width: 800px)">
        <link rel="preload" as="image" type="image/webp" href="/home/background-2-1280.webp" imagesrcset="/home/background-2-1280.webp 1280w, /home/background-2-1672.webp 1672w" imagesizes="100vw" media="(min-width: 801px)">
    @endif
    @viteReactRefresh
    @vite(['resources/css/app.css', 'resources/js/app.tsx'])
    @inertiaHead
</head>
<body>@inertia</body>
</html>
