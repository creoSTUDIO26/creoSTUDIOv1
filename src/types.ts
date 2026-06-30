export interface ServiceSubsection {
  id?: string;
  title: string;
  description: string;
  visualUrl: string;
  visualType: 'image' | 'video' | 'automation' | 'pdf' | 'website';
  meta?: string;
  subCategory?: string;
  originalUrls?: string[];
  generatedVariants?: string[];
  // Per-service fields
  brandName?: string;
  instaLink?: string;
  websiteUrl?: string;
  pdfUrl?: string;
  popupType?: 'image' | 'video' | 'pdf' | 'website-embed' | 'website-link' | 'text';
  subSubCategory?: string;
}

export interface ServiceDetail {
  id: string;
  name: string;
  count: string;
  tagline: string;
  image: string;
  features: string[];
  subsections: ServiceSubsection[];
}

export interface BrandWorkItem {
  id: string;
  type: 'image' | 'video' | 'text';
  url?: string;
  text?: string;
  title?: string;
}

export interface ClientProfile {
  id: string;
  name: string;
  industry: string;
  logo: string;
  logoImage?: string;
  featured: boolean;
  collaborationYear: string;
  workItems?: BrandWorkItem[];
}

export interface Testimonial {
  id: string;
  author: string;
  role: string;
  company: string;
  text: string;
  rating: number;
  avatar: string;
}

export interface ProjectSection {
  title: string;
  description: string;
  image: string;
  badge?: string;
}

export interface PortfolioProject {
  id: string;
  title: string;
  subtitle: string;
  category: string; // matches ServiceDetail.id
  image: string;
  client: string;
  year: string;
  timeToDeliver: string; // e.g., "2 Days"
  accuracy: string; // e.g., "98%"
  resolution: string; // e.g., "2K"
  featured: boolean;
  sections: ProjectSection[];
  linkedWorkId?: string;
}

export interface ClientInquiry {
  id: string;
  name: string;
  email: string;
  serviceId: string;
  message: string;
  timestamp: string;
  status: 'unread' | 'contacted' | 'approved';
}

// Default High-Fidelity Data
export const SERVICES_DATA: ServiceDetail[] = [
  {
    id: "ai-photo-shoot",
    name: "AI Photo Shoot",
    count: "01",
    tagline: "Ultra-realistic studio-grade fashion and product visual creations with zero logistical limits.",
    image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=1200",
    features: [
      "Custom brand models training",
      "Dynamic background lighting customization",
      "Zero camera sets needed",
      "Perfect lighting & material fidelity",
      "Commercial rights included"
    ],
    subsections: [
      {
        id: "work-ai-1",
        title: "Virtual Model Showcase",
        description: "Generated elite fashion talent wearing new couture concepts on black volcanic rocks, capturing perfect cloth drapery and realistic skin pores.",
        visualUrl: "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&q=80&w=800",
        visualType: "image",
        meta: "Model G-32 // Hyper-Real Lens 85mm"
      },
      {
        id: "work-ai-2",
        title: "Product Fluid Dynamics",
        description: "Perfume bottle renders with generative glass refractions and mid-air splashing fluid elements, reflecting studio strobe setups.",
        visualUrl: "https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&q=80&w=800",
        visualType: "image",
        meta: "Amber & Obsidian Refraction Setup"
      },
      {
        id: "work-ai-3",
        title: "Architectural Exterior Renders",
        description: "Geometric Brutalist hotel suites rendered inside custom desert parameters under a high-altitude noon sun shadow layout.",
        visualUrl: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=800",
        visualType: "image",
        meta: "Desert Brutalism // Clay Ratios"
      }
    ]
  },
  {
    id: "ai-video-shoot",
    name: "AI Video Shoot",
    count: "02",
    tagline: "High-octane commercial assets and hyper-real cinematic clips with instant rendering.",
    image: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&q=80&w=1200",
    features: [
      "2K production standard export",
      "Dynamic motion panning algorithms",
      "Bespoke voice-to-character integration",
      "3D volumetric depth tracking",
      "Sound effects and synthetic mixing"
    ],
    subsections: [
      {
        id: "work-ai-4",
        title: "Cinematic Narrative Shorts",
        description: "Stunning sequences showcasing simulated astronauts exploring deep, crystalline cavern structures on far-off worlds.",
        visualUrl: "https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?auto=format&fit=crop&q=80&w=800",
        visualType: "image",
        meta: "Format: 2K Video Render // 24 FPS"
      },
      {
        id: "work-ai-5",
        title: "Social Ad Campaigns",
        description: "Fast-clip hyper-cuts for streetwear branding, blending computer-generated neon streets with continuous camera zooms.",
        visualUrl: "https://images.unsplash.com/photo-1511556532299-8f662fc26c06?auto=format&fit=crop&q=80&w=800",
        visualType: "image",
        meta: "Render SLA: 48 Hours"
      }
    ]
  },
  {
    id: "automation",
    name: "Automation",
    count: "03",
    tagline: "Seamless workflow automations and intelligent AI agents connecting your digital operations.",
    image: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=1200",
    features: [
      "Custom workflow triggers & API endpoints",
      "No-code / code database sync tools",
      "Automated lead responding agents",
      "Bulk client catalog sync systems",
      "24/7 autonomous process execution"
    ],
    subsections: [
      {
        id: "work-ai-6",
        title: "Intelligent Lead Dispatch",
        description: "Active server-less loop fetching web inquiries, analyzing context using AI, and matching with ideal team members within minutes.",
        visualUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=800",
        visualType: "automation",
        meta: "Engine: GPT Agent Sync V2"
      },
      {
        id: "work-ai-7",
        title: "Social Handle Content Pipeline",
        description: "Autonomous content poster driving catalog assets, drafting SEO tags, and refreshing insta grid feeds automatically.",
        visualUrl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=800",
        visualType: "automation",
        meta: "Operational uptime: 99.9%"
      }
    ]
  },
  {
    id: "website-design",
    name: "Website Design",
    count: "04",
    tagline: "Ultra-modern, high-contrast digital experiences with editorial typography and immersive details.",
    image: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&q=80&w=1200",
    features: [
      "Bespoke Framer & React web blueprints",
      "High-contrast minimalist alignment",
      "Flawless responsive transition layout",
      "Blazing performance indicators",
      "Integrated SEO with semantic architecture"
    ],
    subsections: [
      {
        id: "work-ai-8",
        title: "Interactive Client Portfolios",
        description: "Custom grids with architectural wireframe style guide, featuring thin border separators and seamless dark/light overlays.",
        visualUrl: "https://images.unsplash.com/photo-1481487196290-c112eed0b828?auto=format&fit=crop&q=80&w=800",
        visualType: "image",
        meta: "Lighthouse Score: 100/100"
      },
      {
        id: "work-ai-9",
        title: "Next-Gen Editorial Blogs",
        description: "Minimalist typeface scaling utilizing Inter, Syne header layouts, and JetBrains Mono specs for clean reading grids.",
        visualUrl: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?auto=format&fit=crop&q=80&w=800",
        visualType: "image",
        meta: "Tailwind v4 Engine Integration"
      }
    ]
  },
  {
    id: "brand-building",
    name: "Brand Building",
    count: "05",
    tagline: "Constructing legendary identities. Typography, visual grids, and asset guidelines that dominate markets.",
    image: "https://images.unsplash.com/photo-1434626881859-194d67b2b86f?auto=format&fit=crop&q=80&w=1200",
    features: [
      "Custom vector logotypes & branding guides",
      "Dynamic typography pairing specifications",
      "Packaging rendering with luxury setups",
      "Social alignment & messaging guides",
      "Multi-channel marketing asset starter matrices"
    ],
    subsections: [
      {
        id: "work-ai-10",
        title: "Logotype Anatomy & Grid",
        description: "Detailed grid geometry analysis of the brand symbol, ensuring strict proportions and geometric scalability.",
        visualUrl: "https://images.unsplash.com/photo-1557683316-973673baf926?auto=format&fit=crop&q=80&w=800",
        visualType: "image",
        meta: "Brand Target: Swiss Minimalist"
      },
      {
        id: "work-ai-11",
        title: "Luxury Packaging Systems",
        description: "Cardboard and glass texture wraps modeled in studio context, styled with high contrast typography and raw details.",
        visualUrl: "https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&q=80&w=800",
        visualType: "image",
        meta: "Textury SLA: Matte Velvet Premium"
      }
    ]
  },
  {
    id: "e-invitation",
    name: "E Invitation",
    count: "06",
    tagline: "Exquisite high-end virtual envelopes and animated invites for executive launch events.",
    image: "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?auto=format&fit=crop&q=80&w=1200",
    features: [
      "Animated digital envelope opening",
      "Gold foil & custom card texture shaders",
      "Interactive attendee RSVP portals",
      "Direct calendar integration",
      "Ultra-crisp mobile display sizing"
    ],
    subsections: [
      {
        id: "work-ai-12",
        title: "Gala Invitation Sequence",
        description: "An animated, luxurious dark envelope that splits apart under an organic light beam, sliding out a modern invitation card.",
        visualUrl: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=800",
        visualType: "image",
        meta: "Interactions: 60fps Spring Motion"
      }
    ]
  },
  {
    id: "catalog",
    name: "Catalog",
    count: "07",
    tagline: "Beautifully organized editorial catalogs. Turn dense product spreadsheets into stunning layouts.",
    image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=1200",
    features: [
      "Minimalist print-ready layout grids",
      "Digital responsive browsing decks",
      "Automatic CSV-to-Catalog pipelines",
      "High-contrast paper texture backgrounds",
      "Perfect typesetting and alignment"
    ],
    subsections: [
      {
        id: "work-ai-13",
        title: "Autumn Lookbook Collection",
        description: "A 48-page editorial catalog displaying clean layout tables, negative space margins, and custom serif annotations.",
        visualUrl: "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&q=80&w=800",
        visualType: "image",
        meta: "Format: PDF Catalog & Responsive Deck"
      }
    ]
  },
  {
    id: "insta-grid-stories",
    name: "Insta Grid and Stories Handle",
    count: "08",
    tagline: "Continuous visual narratives on Instagram. Styled layout blocks that make your feed unforgettable.",
    image: "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?auto=format&fit=crop&q=80&w=1200",
    features: [
      "3x3 integrated feed layout grids",
      "Bespoke static-to-animated story boards",
      "Typography styling presets",
      "Auto-scheduling automation integrated",
      "Clean visual rhythm structure support"
    ],
    subsections: [
      {
        id: "work-ai-14",
        title: "Continuous 9-Grid Concept",
        description: "Designed a stunning monochrome layout block where photos overflow naturally across borders to force active scrolling.",
        visualUrl: "https://images.unsplash.com/photo-1522542550221-31fd19575a2d?auto=format&fit=crop&q=80&w=800",
        visualType: "image",
        meta: "Feed Theme: Slate Dark & White Accent"
      }
    ]
  }
];

export const CLIENTS_DATA: ClientProfile[] = [
  { 
    id: "1", 
    name: "AURA COSMETICS", 
    industry: "Lux Beauty", 
    logo: "AURA", 
    featured: true, 
    collaborationYear: "2025",
    workItems: [
      {
        id: "w1-1",
        type: "image",
        title: "Virtual Model Skincare Campaign",
        url: "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&q=80&w=800",
        text: "Generated elite fashion talent showcasing organic skincare textures."
      },
      {
        id: "w1-2",
        type: "image",
        title: "Liquid Fluid Dynamics Renders",
        url: "https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&q=80&w=800",
        text: "Studio strobe setup rendering luxury perfume reflections."
      },
      {
        id: "w1-3",
        type: "text",
        title: "Campaign Impact",
        text: "Delivered 50+ unique fashion assets via creo STUDIO's AI Photo Shoot engine in under 48 hours, eliminating physical studio overhead."
      }
    ]
  },
  { 
    id: "2", 
    name: "NEBULA APPAREL", 
    industry: "High Fashion", 
    logo: "NEBL", 
    featured: true, 
    collaborationYear: "2026",
    workItems: [
      {
        id: "w2-1",
        type: "image",
        title: "Synth Outerwear Campaign",
        url: "https://images.unsplash.com/photo-1511556532299-8f662fc26c06?auto=format&fit=crop&q=80&w=800",
        text: "Futuristic spacesuit assets for the winter catalog launch."
      },
      {
        id: "w2-2",
        type: "text",
        title: "Automated Content Loop",
        text: "Engineered an autonomous posting pipeline that schedules catalog grids and stories directly to Instagram, improving visual coherence and feed interaction."
      }
    ]
  },
  { 
    id: "3", 
    name: "VESTA ROBOTICS", 
    industry: "Deep Automation", 
    logo: "VST.", 
    featured: true, 
    collaborationYear: "2025",
    workItems: [
      {
        id: "w3-1",
        type: "image",
        title: "Autonomous Sync Pipeline",
        url: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=800",
        text: "Active cron loops linking warehouse stock parameters with graphic design outputs."
      }
    ]
  },
  { 
    id: "4", 
    name: "CHRONOS AI", 
    industry: "SaaS & Scale", 
    logo: "CHRN", 
    featured: true, 
    collaborationYear: "2026",
    workItems: [
      {
        id: "w4-1",
        type: "text",
        title: "Lead Generation Automation",
        text: "Custom server-less script routing website inquiry data to specialized AI support dispatchers, responding to potential clients under 5 minutes."
      }
    ]
  },
  { 
    id: "5", 
    name: "OBSIDIAN LABS", 
    industry: "Decentralized Tech", 
    logo: "OBSD", 
    featured: false, 
    collaborationYear: "2025",
    workItems: [
      {
        id: "w5-1",
        type: "image",
        title: "Branding and Identity Grid",
        url: "https://images.unsplash.com/photo-1557683316-973673baf926?auto=format&fit=crop&q=80&w=800",
        text: "Swiss minimalist layout blueprints detailing logotype constraints."
      }
    ]
  }
];

export const TESTIMONIALS_DATA: Testimonial[] = [
  {
    id: "t1",
    author: "Elena Rostova",
    role: "Creative Director",
    company: "Aura Cosmetics",
    text: "creo STUDIO revolutionized our look book. They designed and rendered 50 unique fashion assets via their AI Photo Shoot engine in exactly 2 days with breathtaking 2K quality. Highly recommended!",
    rating: 5,
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200"
  },
  {
    id: "t2",
    author: "Malik Vance",
    role: "Co-Founder",
    company: "Nebula Apparel",
    text: "The Automation engine they built for our Insta Grid handles and catalogue updates is flawless. Processed over 1,400 content posts 100% autonomously, giving us an SLA output timeline under 2 days. 98% accuracy indeed.",
    rating: 5,
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200"
  },
  {
    id: "t3",
    author: "Marcus Vance",
    role: "VP Marketing",
    company: "Vesta Robotics",
    text: "Building premium landing guides with creo STUDIO was a masterclass in high-contrast editorial craft. Absolute precision in grid lines, ultra-responsive screens, and a fantastic collaborate portal.",
    rating: 5,
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200"
  }
];

export const FEATURED_PROJECTS: PortfolioProject[] = [
  {
    id: "project-1",
    title: "Liquid Metamorphosis",
    subtitle: "AI fluid physics cosmetics shoot with custom high-contrast styling.",
    category: "ai-photo-shoot",
    image: "https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&q=80&w=1200",
    client: "STUDIOLINK",
    year: "2025",
    timeToDeliver: "2 Days",
    accuracy: "99%",
    resolution: "2K",
    featured: true,
    sections: [
      {
        title: "The Project Mandate",
        description: "Aura needed custom high-end fluid simulations paired with model photography for an upcoming line. Traditional studio shoots quoted 3 weeks of work and substantial lighting costs.",
        image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=800",
        badge: "01 / The Challenge"
      },
      {
        title: "AI Synthesis & Refraction",
        description: "We trained custom product masks representing their premium glass structures, and generated beautiful splash refractions with extreme precision. Turnaround was completed in 48 hours.",
        image: "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&q=80&w=800",
        badge: "02 / The Execution"
      }
    ]
  },
  {
    id: "project-2",
    title: "Synth Astronautics",
    subtitle: "A cinematic AI short video clip for Nebula Apparel outerwear.",
    category: "ai-video-shoot",
    image: "https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?auto=format&fit=crop&q=80&w=1200",
    client: "ZENTROX",
    year: "2026",
    timeToDeliver: "2 Days",
    accuracy: "98%",
    resolution: "2K Dual",
    featured: true,
    sections: [
      {
        title: "Futuristic Horizon",
        description: "Designing a high-contrast social campaign showcasing hyper-detailed survival spacesuits in simulated toxic gas caverns.",
        image: "https://images.unsplash.com/photo-1511556532299-8f662fc26c06?auto=format&fit=crop&q=80&w=800",
        badge: "01 / Concept Blueprint"
      }
    ]
  },
  {
    id: "project-3",
    title: "Vesta Autonomous Pipelines",
    subtitle: "Deep automation integrating stock management with catalogue publishing.",
    category: "automation",
    image: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=1200",
    client: "COREHUE",
    year: "2025",
    timeToDeliver: "2 Days",
    accuracy: "98.5%",
    resolution: "Serverless",
    featured: true,
    sections: [
      {
        title: "Catalytic Sync Loop",
        description: "Created active cron setups that monitor inventory changes and draft social mockups, creating beautifully stylized catalogue lines instantly.",
        image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=800",
        badge: "01 / Architecture"
      }
    ]
  },
  {
    id: "project-4",
    title: "Editorial Design System",
    subtitle: "High contrast UI system for Elevana.",
    category: "website-design",
    image: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&q=80&w=1200",
    client: "ELEVANA",
    year: "2026",
    timeToDeliver: "2 Days",
    accuracy: "99%",
    resolution: "4K",
    featured: true,
    sections: [
      {
        title: "Visual Identity",
        description: "Designing a fully modular, high-contrast system.",
        image: "https://images.unsplash.com/photo-1481487196290-c112eed0b828?auto=format&fit=crop&q=80&w=800",
        badge: "01 / Concept Blueprint"
      }
    ]
  }
];
