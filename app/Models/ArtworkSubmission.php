<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ArtworkSubmission extends Model
{
    protected $fillable = ['contact_name', 'email', 'phone', 'interest'];

    protected $hidden = ['contact_name', 'email', 'phone'];

    protected function casts(): array
    {
        return [
            'contact_name' => 'encrypted',
            'email' => 'encrypted',
            'phone' => 'encrypted',
        ];
    }

    public function artwork(): BelongsTo
    {
        return $this->belongsTo(Artwork::class);
    }
}
