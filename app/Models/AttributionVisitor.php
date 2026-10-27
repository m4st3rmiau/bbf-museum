<?php

namespace App\Models;

use Database\Factories\AttributionVisitorFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class AttributionVisitor extends Model
{
    /** @use HasFactory<AttributionVisitorFactory> */
    use HasFactory;

    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = [
        'id',
        'first_visited_at',
        'last_visited_at',
    ];

    protected function casts(): array
    {
        return [
            'first_visited_at' => 'datetime',
            'last_visited_at' => 'datetime',
        ];
    }

    public function visits(): HasMany
    {
        return $this->hasMany(AttributionVisit::class, 'visitor_id');
    }
}
