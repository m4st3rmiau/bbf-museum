<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ArtworkResource extends JsonResource
{
    public static $wrap = null;

    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'petName' => $this->pet_name,
            'age' => fmod((float) $this->age, 1.0) === 0.0 ? (string) (int) $this->age : rtrim(rtrim((string) $this->age, '0'), '.'),
            'title' => $this->title,
            'description' => $this->description,
            'petImage' => $this->imageUrl('pet_image_path'),
            'objectImage' => $this->imageUrl('object_image_path'),
            'createdAt' => $this->created_at?->toISOString(),
            'demo' => $this->is_demo,
        ];
    }
}
