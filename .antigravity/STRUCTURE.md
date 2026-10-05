# STRUCTURE.md

## Project Tree
```
THE_WEBSITE/
├── .antigravity/
│   ├── PROJECT.md          # Project purpose, scope, constraints
│   ├── STRUCTURE.md        # File and folder layout
│   └── CHANGELOG.md        # Change history log
├── data/
│   ├── brandData.ts        # Brand showcase data and configurations
│   ├── portfolioProjects.ts# Portfolio project definitions
│   ├── serviceData.ts      # Core service definitions, default subsections & details
│   └── testimonials.ts     # Client testimonials data
├── public/                 # Static public assets
├── src/
│   ├── components/
│   │   ├── AdminPanel.tsx  # Admin dashboard for publishing and managing services & items
│   │   ├── Header.tsx      # Main navigation header
│   │   ├── Hero.tsx        # Hero section with brand styling
│   │   ├── InteractiveShowcase.tsx # Showcase container for interactive cards
│   │   ├── ReelSection.tsx # Video reel showcases
│   │   ├── ServiceInnerView.tsx # Detailed view of individual services and cards
│   │   ├── WaveStatCircle.tsx   # Canvas-powered animated liquid sine wave circular stat widget
│   │   ├── SpatialCard3D.tsx    # Hardware-accelerated 3D perspective tilt & specular lighting wrapper
│   │   ├── HeroSpatial3D.tsx    # Interactive 3D spatial geometric emblem with IntersectionObserver
│   │   └── ...
│   ├── lib/
│   │   └── supabase.ts     # Supabase client initialization and helpers
│   ├── types.ts            # TypeScript interfaces for services, subsections, and data models
│   ├── App.tsx             # Root React component and routing/state orchestration
│   ├── main.tsx            # React application entry point
│   └── index.css           # Global stylesheet and Tailwind tokens
├── index.html              # HTML entry point
├── package.json            # Project dependencies and script commands
└── vite.config.ts          # Vite bundler configuration
```

## Major File Descriptions
- `src/components/ServiceInnerView.tsx`: Displays service details, sub-work cards, category filters, and preview modals.
- `src/components/AdminPanel.tsx`: Administrative CMS to publish new work items, edit details, and reorder assets.
- `src/data/serviceData.ts`: Default fallback data for all services and initial portfolio subsections.
- `src/types.ts`: Type definitions for `ServiceDetail`, `ServiceSubsection`, `PortfolioProject`, etc.

## Naming Conventions
- React Components: PascalCase (`ServiceInnerView.tsx`, `AdminPanel.tsx`)
- Data & Utilities: camelCase (`serviceData.ts`, `supabase.ts`)
- CSS & Assets: kebab-case (`index.css`, `theme-change.js`)
