# Landing Page Redesign Plan

## Goal
Transform the landing page from cluttered to premium SaaS quality (Eventbrite meets Stripe).

## New Section Flow (12 sections, conversion-optimized)

| # | Section | Action | Description |
|---|---------|--------|-------------|
| 1 | **LandingNav** | Enhance | Add "Create Event" link, better transitions |
| 2 | **HeroSection** | Rewrite | Bigger typography (7xl), remove CategoryBar from hero, add trust line, wider search, mesh gradient |
| 3 | **TrustBar** | New (replaces StatsBar+TrustBanner) | Animated count-up numbers + trust badges in one elegant strip |
| 4 | **Event Discovery** | Consolidate | Merge CategoryFilter + TabFilter + single event display (removes duplicate PriceSection x2) |
| 5 | **FeaturedCalendars** | Wire existing | Already built, just import + pass `mockFeaturedCalendars` |
| 6 | **PopularCities** | Wire existing | Already built, just import + pass `mockPopularCities` |
| 7 | **HowItWorks** | Enhance | Larger icons, connecting lines, staggered animations |
| 8 | **Testimonials** | Wire existing | Already built `SocialProofSection`, pass `mockTestimonials` + `mockTrustMetrics` |
| 9 | **CategoryInterests** | Keep (minor) | Add section bg + subtitle |
| 10 | **CreateEventCTA** | Keep (minor) | Already great, minor polish |
| 11 | **NewsletterSignup** | New component | Email capture with gradient bg |
| 12 | **LandingFooter** | Enhance | Richer content, back-to-top, social hover colors |

## Sections REMOVED (reducing clutter)
- `PriceSection x2` (Free Events + Under $25) — redundant, replaced by tab filtering
- `StatsBar` — merged into TrustBar
- `TrustBanner` — merged into TrustBar

## Files to Create
1. `src/lib/hooks/useInView.ts` — lightweight IntersectionObserver hook for scroll animations
2. `src/lib/hooks/useCountUp.ts` — animated counter hook for stats
3. `src/modules/shared-common/components/landing/NewsletterSignup.tsx` — email signup section

## Files to Modify
1. `src/modules/shared-common/components/landing/HeroSection.tsx` — bigger hero, remove CategoryBar, trust line
2. `src/modules/event-management/pages/landing.tsx` — main orchestrator: new section flow, import unused components, new TrustBar/HowItWorks/Footer, scroll animations

## Data Flow (unchanged)
- Events still fetched from `/api/events` with JWT
- `useEventFilters` hooks remain at top level
- Mock data from `mock-landing-data.ts` wired to existing components

## Implementation Order
1. Create utility hooks (useInView, useCountUp)
2. Create NewsletterSignup component
3. Rewrite HeroSection
4. Rewrite landing.tsx (main page with all new sections)
5. TypeScript build check
