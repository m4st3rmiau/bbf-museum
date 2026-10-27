<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

class ArtworkSubmission extends Model
{
    protected $fillable = ['contact_name', 'email', 'phone', 'interest'];

    protected $hidden = ['contact_name', 'email', 'phone'];

    public function artwork(): BelongsTo
    {
        return $this->belongsTo(Artwork::class);
    }

    public function leadAttribution(): HasOne
    {
        return $this->hasOne(LeadAttribution::class);
    }
}
