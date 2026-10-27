<?php

namespace App\Models;

use Database\Factories\AttributionVisitFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class AttributionVisit extends Model
{
    /** @use HasFactory<AttributionVisitFactory> */
    use HasFactory;

    protected $fillable = [
        'visitor_id',
        'session_id',
        'utm_source',
        'utm_medium',
        'utm_campaign',
        'utm_content',
        'utm_term',
        'fbclid',
        'gclid',
        'ttclid',
        'msclkid',
        'fbc',
        'fbp',
        'landing_page',
        'referrer_domain',
        'ip_address',
        'user_agent',
        'device_type',
        'browser',
        'os',
        'country',
        'city',
        'visited_at',
    ];

    protected function casts(): array
    {
        return ['visited_at' => 'datetime'];
    }

    public function visitor(): BelongsTo
    {
        return $this->belongsTo(AttributionVisitor::class, 'visitor_id');
    }

    public function leadAttributions(): HasMany
    {
        return $this->hasMany(LeadAttribution::class);
    }
}
