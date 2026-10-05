# CHANGELOG.md

## [2026-10-05 17:05] — Fixed header logo overlap on Project Detail View
- Action:
  - In `src/components/ProjectDetailView.tsx`: adjusted top padding from `py-8 sm:py-10` to `pt-24 pb-8 sm:pt-28 sm:pb-10` with a clean bottom-bordered navigation wrapper, ensuring the "Back to Case Studies" button and editorial title clear the fixed top navigation bar and `creoSTUDIO` logo.
  - In `src/components/ReviewPage.tsx`: ensured adequate `pt-28` top padding for consistent clearance.
- Reason: User reported that clicking "Projects We Are Proud Of" caused a UI error in the top left corner where the fixed logo overlapped the back button.
- Type: fix | UI

## [2026-10-04 13:08] — Made Brand Building cards compact to fit full view on screen
- Action:
  - In `src/components/ServiceInnerView.tsx`: replaced the 2-column oversized square card layout for Brand Building with a responsive 4-column compact grid (`grid-cols-2 sm:grid-cols-3 lg:grid-cols-4`); configured image container to `aspect-[4/3] sm:aspect-square` with `object-contain`, compact padding, streamlined brand metadata, and direct interaction buttons so cards fit cleanly within the viewport without requiring vertical scrolling.
- Reason: User requested making the cards in Brand Building small so they fit on screen without needing to scroll down for full view.
- Type: style | UI

## [2026-10-04 00:51] — Upgraded Wave Stat Circles to Framer-exact HTML5 Canvas animation
- Action:
  - In `src/components/WaveStatCircle.tsx`: integrated an HTML5 Canvas wave rendering engine using the exact mathematical sine wave formulation from Framer (`https://adorable-operators-424677.framer.app/`); features dual-layer liquid waves (depth back-wave and vibrant front-wave), dynamic crest highlights, device pixel ratio retina scaling, and clean `requestAnimationFrame` lifecycle.
- Reason: User requested adding the exact animation from the Framer reference website.
- Type: feature | UI

## [2026-10-04 00:40] — By The Numbers circular wave stats and preset admin manager
- Action:
  - Created `src/components/WaveStatCircle.tsx`: implemented circular liquid wave stat widgets with smooth dual-layer animated rolling sine waves, luminous ring borders, custom fill levels, and color themes matching the reference design.
  - In `src/types.ts`: added `ByTheNumbersStat` interface and updated `SiteSettings` with `byTheNumbersStats` and default preset stats.
  - In `src/App.tsx`: updated the "By The Numbers" landing section to render the preset wave stat circles on a dark luxury backdrop with ambient atmospheric glows.
  - In `src/components/AdminPanel.tsx`: replaced old auto-calculated overrides with a dedicated preset stats manager supporting value, label, sublabel, wave fill height slider, theme color selection, and live interactive widget preview.
- Reason: User requested converting the By The Numbers section to only preset numbers editable in the admin panel and updating the UI to circular wave badges matching the reference design.
- Type: feature | UI

## [2026-10-04 00:29] — Converted Chapter III Studio Services to vertical cards grid
- Action:
  - In `src/components/ChapterServices.tsx`: refactored the section from a horizontal scroll runway into a vertical, responsive 4-column architectural card grid; preserved the dark luxury editorial styling, typography, numerals, curtain reveal image hover animations, and exploration links without horizontal scroll hijacking.
- Reason: User requested making the services cards with the exact same design and no horizontal scroll effect.
- Type: feature | UI

## [2026-10-04 00:23] — Removed categories from all services except Photo Shoot
- Action:
  - In `src/components/ServiceInnerView.tsx`: generalized `isCategoryDisabled` so only `ai-photo-shoot` has categories; removed category tabs, pills, and e-invitation sub-category buttons for all other services (`ai-video-shoot`, `automation`, `website-design`, `brand-building`, `e-invitation`, `catalog`, `insta-grid-stories`), rendering items directly into their respective gallery views.
  - In `src/components/AdminPanel.tsx`: updated `ADMIN_CATEGORIES` to empty arrays for all services except `ai-photo-shoot`, set `isCategoryDisabled = selectedServiceId !== 'ai-photo-shoot'`, disabled `showSubSubCategory`, and unified subsection management into a flat drag-and-drop list with edit/delete actions for all non-photo-shoot services.
- Reason: User requested removing categories from all services except photo shoot, across both frontend and admin panel.
- Type: feature | refactor

## [2026-10-04 00:18] — 100% transparent nav bar across all pages
- Action:
  - In `src/components/Header.tsx`: removed scroll-triggered background colors, backdrop blur (`backdrop-blur-md`), and shadow effects, making the navigation header 100% transparent on all pages and scroll positions while maintaining dynamic text/logo invert contrast over dark sections.
- Reason: User requested the nav bar to remain completely transparent without frosted/blurred bar effects across all pages.
- Type: style | UI

## [2026-10-04 00:16] — Direct shoot open for single-shoot brands in Video Shoot
- Action:
  - In `src/components/ServiceInnerView.tsx`: updated `renderBrandGallery` so clicking a brand card that has only 1 shoot item immediately opens the shoot details/preview modal directly, bypassing the single-item intermediary gallery page.
- Reason: User requested that if a brand has only a single shoot in video shoot, clicking it should directly open the shoot page instead of the intermediate gallery view.
- Type: feature | UX

## [2026-10-04 00:12] — Brand descriptor styling in Video Shoot
- Action:
  - In `src/components/ServiceInnerView.tsx`: added `getBrandDescriptor` helper and rendered brand descriptors in small, non-bold, italic text in parentheses next to the brand name (e.g. `STUDIO@MRS (Interior Design)`); updated brand gallery header to display the descriptor as well.
  - In `src/App.tsx`: passed `clients` prop to `ServiceInnerView` for resolving brand industry tags.
  - In `src/components/AdminPanel.tsx`: updated Meta input field label and placeholder to clarify it configures the brand industry/type tag for Video Shoot items.
- Reason: User requested brand descriptors on video shoot cards to be displayed next to the brand name in smaller, italic, non-bold text in parentheses.
- Type: feature

## [2026-10-04 00:06] — Category removal for Video Shoot
- Action:
  - In `src/components/ServiceInnerView.tsx`: removed category filter cards and badges for `ai-video-shoot` service, rendering direct brand/video shoot items.
  - In `src/components/AdminPanel.tsx`: emptied `ADMIN_CATEGORIES` for `ai-video-shoot`, hid the category selector in the Publish Work form, and displayed video shoot subsections in a flat list with full drag-and-drop reorder and management.
- Reason: User requested removal of categories from Video Shoot across frontend and admin panel.
- Type: feature | refactor

## [2026-10-03 23:58] — Direct link opening and category removal for Automation and Website Design
- Action:
  - In `src/components/ServiceInnerView.tsx`: configured cards in `automation` and `website-design` to open their external / demo link directly upon clicking; removed category filters, tabs, and category badges for both services.
  - In `src/components/AdminPanel.tsx`: removed predefined categories for `automation` and `website-design`, concealed category input fields when publishing work for these services, and rendered published subsections in a flat list without category headers or grouping.
- Reason: User requested direct linking on cards for Automation & Website Design, and complete removal of categories from both frontend views and admin panel for these two services.
- Type: feature | refactor
