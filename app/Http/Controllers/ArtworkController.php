<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreArtworkRequest;
use App\Models\Artwork;
use App\Models\AttributionVisit;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Throwable;

class ArtworkController extends Controller
{
    public function store(StoreArtworkRequest $request): RedirectResponse
    {
        $validated = $request->validated();
        $stored = [];

        try {
            $artwork = DB::transaction(function () use ($request, $validated, &$stored): Artwork {
                $stored['pet'] = $request->file('pet_image')->store('artworks/pets', 'public');
                $stored['object'] = $request->file('object_image')->store('artworks/objects', 'public');
                throw_unless($stored['pet'] && $stored['object'], new \RuntimeException('No se pudieron guardar las fotografías.'));

                $artwork = Artwork::create([
                    'pet_name' => $validated['pet_name'],
                    'age' => (string) $validated['age'],
                    'title' => $validated['title'],
                    'description' => $validated['description'],
                    'pet_image_path' => $stored['pet'],
                    'object_image_path' => $stored['object'],
                    'is_published' => true,
                ]);

                $submission = $artwork->submission()->create([
                    'contact_name' => $validated['contact_name'],
                    'email' => $validated['email'],
                    'phone' => $validated['phone'],
                    'interest' => $validated['interest'],
                ]);

                $visit = AttributionVisit::query()->find($request->session()->get('attribution.visit_id'));

                if ($visit !== null) {
                    $visit->leadAttributions()->create([
                        'artwork_submission_id' => $submission->getKey(),
                        'conversion_type' => 'artwork_submission',
                        'converted_at' => now(),
                        'time_to_convert_seconds' => (int) $visit->visited_at->diffInSeconds(now()),
                    ]);
                }

                return $artwork;
            });
        } catch (Throwable $exception) {
            Storage::disk('public')->delete(array_values($stored));
            report($exception);

            return back()->withInput()->withErrors(['submission' => 'No pudimos registrar la obra. Inténtalo nuevamente.']);
        }

        return redirect()->route('thanks', $artwork)->with('success', 'La obra se registró correctamente.');
    }
}
