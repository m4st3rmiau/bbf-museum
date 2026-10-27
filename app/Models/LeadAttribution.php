<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LeadAttribution extends Model
{
    protected $fillable = [
        'attribution_visit_id',
        'artwork_submission_id',
        'conversion_type',
        'converted_at',
        'time_to_convert_seconds',
    ];

    protected function casts(): array
    {
        return ['converted_at' => 'datetime'];
    }

    public function visit(): BelongsTo
    {
        return $this->belongsTo(AttributionVisit::class, 'attribution_visit_id');
    }

    public function artworkSubmission(): BelongsTo
    {
        return $this->belongsTo(ArtworkSubmission::class);
    }
}
