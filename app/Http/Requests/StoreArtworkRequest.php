<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreArtworkRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'pet_name' => ['bail', 'required', 'string', 'max:60'],
            'age' => ['bail', 'required', 'numeric', 'between:0,50'],
            'title' => ['bail', 'required', 'string', 'max:80'],
            'description' => ['bail', 'required', 'string', 'max:800'],
            'pet_image' => ['bail', 'required', 'file', 'image', 'mimes:jpg,jpeg,png,webp', 'max:10240'],
            'object_image' => ['bail', 'required', 'file', 'image', 'mimes:jpg,jpeg,png,webp', 'max:10240'],
            'contact_name' => ['bail', 'required', 'string', 'max:100'],
            'email' => ['bail', 'required', 'email:rfc', 'max:254'],
            'phone' => ['bail', 'required', 'string', 'regex:/^[+\d\s()\-]+$/', function ($attribute, $value, $fail): void {
                $digits = preg_replace('/\D/', '', $value);
                if (strlen($digits) < 10 || strlen($digits) > 15) {
                    $fail('Escribe un teléfono válido de 10 a 15 dígitos.');
                }
            }],
            'interest' => ['required', Rule::in(['yes', 'later', 'gallery'])],
        ];
    }

    public function attributes(): array
    {
        return ['pet_image' => 'foto de tu mascota', 'object_image' => 'foto del objeto'];
    }
}
