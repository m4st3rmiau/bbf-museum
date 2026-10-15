<?php

namespace Tests\Feature;

use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class TermsPageTest extends TestCase
{
    public function test_the_terms_page_is_available(): void
    {
        $this->get('/terminos-y-condiciones')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page->component('Terms'));
    }
}
