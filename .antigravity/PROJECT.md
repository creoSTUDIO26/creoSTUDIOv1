# PROJECT.md

## Purpose
A portfolio and creative studio website for showcasing AI photo shoots, AI video shoots, automation workflows, website design projects, catalogs, e-invitations, and brand building work, complete with an administrative CMS panel for publishing and managing portfolio assets, live project links, client profiles, and customer inquiries.

## Target User/Client
Potential clients seeking high-end creative, digital agency, design, and AI/automation services, as well as the agency admin team managing showcase assets.

## Core Features/Scope
- **Interactive Portfolio & Showcase**: Rich editorial views with media preview modals (video, pdf, iframe, live link).
- **Direct Link Navigation**: Instant redirection to external demo/production URLs for Automation and Website Design cards.
- **Category Management**: Granular category organization for Shoot services, Catalogs, E-Invitations, and Brand Building; flat direct listing for Automation and Website Design.
- **Admin Control Panel**: Full management of service items, reordering, direct visual file uploads, testimonials, and client inquiries.
- **Persistent Data Store**: Supabase backend integration with local storage fallback.

## Known Constraints
- React 18 + Vite + Tailwind CSS / Vanilla CSS styling.
- Works offline/standalone with localStorage fallback when Supabase credentials are not supplied.
