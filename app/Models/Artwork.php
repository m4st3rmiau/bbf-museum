<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class Artwork extends Model
{
    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = [
        'pet_name', 'age', 'title', 'description', 'pet_image_path',
        'object_image_path', 'is_demo', 'is_published',
    ];

    protected function casts(): array
    {
        return ['is_demo' => 'boolean', 'is_published' => 'boolean'];
    }

    protected static function booted(): void
    {
        static::creating(function (Artwork $artwork): void {
            $artwork->id ??= (string) Str::uuid();
        });
    }

    public function submission(): HasOne
    {
        return $this->hasOne(ArtworkSubmission::class);
    }

    public function imageUrl(string $attribute): string
    {
        $path = $this->{$attribute};

        if ($this->is_demo) {
            $optimizedPath = preg_replace('/\.jpe?g$/i', '.webp', $path) ?? $path;

            return url(file_exists(public_path(ltrim($optimizedPath, '/'))) ? $optimizedPath : $path);
        }

        return Storage::disk('public')->url($path);
    }
}
