<?php

namespace Tests\Feature;

use App\Models\ArtworkSubmission;
use App\Models\AttributionVisit;
use Illuminate\Foundation\Testing\LazilyRefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class AttributionTrackingTest extends TestCase
{
    use LazilyRefreshDatabase;

    public function test_anonymous_influencer_visit_is_saved_with_its_acquisition_data(): void
    {
        $response = $this
            ->withHeader('referer', 'https://instagram.com/influencer-profile')
            ->withHeader('user-agent', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Version/18.0 Mobile/15E148 Safari/604.1')
            ->get('/?utm_source=instagram&utm_medium=influencer&utm_campaign=museo_2026&utm_content=reel_ana&fbclid=click-123');

        $response->assertOk();
        $response->assertCookie('bbf_visitor_id');
        $this->assertDatabaseCount('attribution_visitors', 1);
        $this->assertDatabaseHas('attribution_visits', [
            'utm_source' => 'instagram',
            'utm_medium' => 'influencer',
            'utm_campaign' => 'museo_2026',
            'utm_content' => 'reel_ana',
            'fbclid' => 'click-123',
            'referrer_domain' => 'instagram.com',
            'device_type' => 'mobile',
            'browser' => 'Safari',
            'os' => 'iOS',
        ]);
        $this->assertDatabaseEmpty('lead_attributions');
    }

    public function test_navigation_in_the_same_session_does_not_duplicate_the_visit(): void
    {
        $this->get('/?utm_source=instagram&utm_campaign=museo_2026');
        $visit = AttributionVisit::query()->sole();

        $response = $this
            ->withCookie('bbf_visitor_id', $visit->visitor_id)
            ->withSession(['attribution.visit_id' => $visit->getKey()])
            ->get('/galeria');

        $response->assertOk();
        $this->assertDatabaseCount('attribution_visits', 1);
    }

    public function test_a_different_campaign_in_the_same_session_creates_a_new_attribution_visit(): void
    {
        $this->get('/?utm_source=instagram&utm_campaign=museo_2026');
        $firstVisit = AttributionVisit::query()->sole();

        $response = $this
            ->withCookie('bbf_visitor_id', $firstVisit->visitor_id)
            ->withSession(['attribution.visit_id' => $firstVisit->getKey()])
            ->get('/?utm_source=tiktok&utm_campaign=museo_2026');

        $response->assertOk();
        $this->assertDatabaseCount('attribution_visitors', 1);
        $this->assertDatabaseCount('attribution_visits', 2);
        $this->assertDatabaseHas('attribution_visits', [
            'visitor_id' => $firstVisit->visitor_id,
            'utm_source' => 'tiktok',
            'utm_campaign' => 'museo_2026',
        ]);
    }

    public function test_registration_is_linked_to_the_current_attribution_visit(): void
    {
        Storage::fake('public');
        $this->travelTo('2026-10-26 12:00:00');
        $this->get('/?utm_source=instagram&utm_medium=influencer&utm_campaign=museo_2026');
        $visit = AttributionVisit::query()->sole();
        $this->travel(90)->seconds();

        $response = $this
            ->withSession(['attribution.visit_id' => $visit->getKey()])
            ->post('/obras', [
                'pet_name' => 'Milo',
                'age' => '12',
                'title' => 'Una pelota',
                'description' => 'Una historia que queremos conservar para siempre.',
                'pet_image' => UploadedFile::fake()->image('milo.jpg', 800, 800),
                'object_image' => UploadedFile::fake()->image('pelota.webp', 800, 600),
                'contact_name' => 'Ana Pérez',
                'email' => 'ana@example.com',
                'phone' => '55 1234 5678',
                'interest' => 'gallery',
            ]);

        $submission = ArtworkSubmission::query()->sole();
        $response->assertRedirect();
        $this->assertDatabaseHas('lead_attributions', [
            'attribution_visit_id' => $visit->getKey(),
            'artwork_submission_id' => $submission->getKey(),
            'conversion_type' => 'artwork_submission',
            'time_to_convert_seconds' => 90,
        ]);
    }
}
