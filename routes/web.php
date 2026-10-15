<?php

use App\Http\Controllers\ArtworkController;
use App\Http\Resources\ArtworkResource;
use App\Models\Artwork;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', fn () => Inertia::render('Home'))->name('home');
Route::get('/exhibir', fn () => Inertia::render('Exhibit'))->name('exhibit');
Route::get('/exhibir/datos', fn () => Inertia::render('ExhibitContact'))->name('exhibit.contact');

Route::post('/obras', [ArtworkController::class, 'store'])
    ->middleware('throttle:8,1')
    ->name('artworks.store');

Route::get('/gracias/{artwork}', fn (Artwork $artwork) => Inertia::render('Thanks', [
    'artwork' => ArtworkResource::make($artwork)->resolve(),
]))->name('thanks');

Route::get('/galeria', fn () => Inertia::render('Gallery', [
    'artworks' => ArtworkResource::collection(
        Artwork::query()->where('is_published', true)->latest()->get()
    )->resolve(),
]))->name('gallery');

Route::get('/creditos', fn () => Inertia::render('Credits'))->name('credits');
Route::get('/terminos-y-condiciones', fn () => Inertia::render('Terms'))->name('terms');
