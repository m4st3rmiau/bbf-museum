<?php

namespace App\Http\Middleware;

use App\Models\AttributionVisit;
use App\Models\AttributionVisitor;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cookie;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\Response;
use Throwable;

class TrackAttribution
{
    private const VISITOR_COOKIE = 'bbf_visitor_id';

    private const VISIT_SESSION_KEY = 'attribution.visit_id';

    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        if ($request->isMethod('GET') && ! $request->expectsJson()) {
            try {
                $this->track($request);
            } catch (Throwable $exception) {
                report($exception);
            }
        }

        return $next($request);
    }

    private function track(Request $request): void
    {
        $visitor = $this->resolveVisitor($request);
        $visitor->update(['last_visited_at' => now()]);

        $currentVisit = AttributionVisit::query()
            ->whereKey($request->session()->get(self::VISIT_SESSION_KEY))
            ->whereBelongsTo($visitor, 'visitor')
            ->first();

        $acquisition = $this->acquisitionData($request);

        if ($currentVisit !== null && ! $this->startsNewAttribution($currentVisit, $acquisition)) {
            return;
        }

        $visit = $visitor->visits()->create([
            ...$acquisition,
            'session_id' => $this->limited($request->session()->getId(), 64),
            'fbc' => $this->limited($request->cookie('_fbc'), 255),
            'fbp' => $this->limited($request->cookie('_fbp'), 255),
            'landing_page' => $request->fullUrl(),
            'referrer_domain' => $this->referrerDomain($request),
            'ip_address' => $this->limited($request->ip(), 45),
            'user_agent' => $request->userAgent(),
            'device_type' => $this->deviceType($request->userAgent()),
            'browser' => $this->browser($request->userAgent()),
            'os' => $this->operatingSystem($request->userAgent()),
            'visited_at' => now(),
        ]);

        $request->session()->put(self::VISIT_SESSION_KEY, $visit->getKey());
    }

    private function resolveVisitor(Request $request): AttributionVisitor
    {
        $visitorId = $request->cookie(self::VISITOR_COOKIE);
        $isNewVisitor = ! is_string($visitorId) || ! Str::isUuid($visitorId);

        if ($isNewVisitor) {
            $visitorId = (string) Str::uuid();
        }

        $visitor = AttributionVisitor::query()->firstOrCreate(
            ['id' => $visitorId],
            ['first_visited_at' => now(), 'last_visited_at' => now()],
        );

        if ($isNewVisitor) {
            Cookie::queue(cookie(
                self::VISITOR_COOKIE,
                $visitor->getKey(),
                60 * 24 * 365,
                '/',
                null,
                $request->isSecure(),
                true,
                false,
                'lax',
            ));
        }

        return $visitor;
    }

    /** @return array<string, string|null> */
    private function acquisitionData(Request $request): array
    {
        return [
            'utm_source' => $this->limited($request->query('utm_source'), 100),
            'utm_medium' => $this->limited($request->query('utm_medium'), 100),
            'utm_campaign' => $this->limited($request->query('utm_campaign'), 150),
            'utm_content' => $this->limited($request->query('utm_content'), 150),
            'utm_term' => $this->limited($request->query('utm_term'), 150),
            'fbclid' => $this->limited($request->query('fbclid'), 255),
            'gclid' => $this->limited($request->query('gclid'), 255),
            'ttclid' => $this->limited($request->query('ttclid'), 255),
            'msclkid' => $this->limited($request->query('msclkid'), 255),
        ];
    }

    /** @param array<string, string|null> $acquisition */
    private function startsNewAttribution(AttributionVisit $visit, array $acquisition): bool
    {
        foreach ($acquisition as $attribute => $value) {
            if ($value !== null && $visit->{$attribute} !== $value) {
                return true;
            }
        }

        return false;
    }

    private function limited(mixed $value, int $length): ?string
    {
        if (! is_scalar($value)) {
            return null;
        }

        $value = trim((string) $value);

        return $value === '' ? null : mb_substr($value, 0, $length);
    }

    private function referrerDomain(Request $request): ?string
    {
        $host = parse_url((string) $request->headers->get('referer'), PHP_URL_HOST);

        return is_string($host) ? $this->limited(Str::lower($host), 255) : null;
    }

    private function deviceType(?string $userAgent): ?string
    {
        if ($userAgent === null) {
            return null;
        }

        return match (true) {
            preg_match('/bot|crawler|spider|slurp/i', $userAgent) === 1 => 'bot',
            preg_match('/ipad|tablet/i', $userAgent) === 1 => 'tablet',
            preg_match('/mobile|iphone|ipod|android/i', $userAgent) === 1 => 'mobile',
            default => 'desktop',
        };
    }

    private function browser(?string $userAgent): ?string
    {
        if ($userAgent === null) {
            return null;
        }

        return match (true) {
            str_contains($userAgent, 'Edg/') => 'Edge',
            str_contains($userAgent, 'OPR/') => 'Opera',
            str_contains($userAgent, 'Firefox/') => 'Firefox',
            str_contains($userAgent, 'Chrome/') => 'Chrome',
            str_contains($userAgent, 'Safari/') => 'Safari',
            default => null,
        };
    }

    private function operatingSystem(?string $userAgent): ?string
    {
        if ($userAgent === null) {
            return null;
        }

        return match (true) {
            preg_match('/iphone|ipad|ipod/i', $userAgent) === 1 => 'iOS',
            str_contains($userAgent, 'Android') => 'Android',
            str_contains($userAgent, 'Windows') => 'Windows',
            str_contains($userAgent, 'Mac OS X') => 'macOS',
            str_contains($userAgent, 'Linux') => 'Linux',
            default => null,
        };
    }
}
