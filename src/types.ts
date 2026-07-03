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

// Service categories define the website structure — these are your actual offerings
// Work items (subsections), brands, and testimonials are managed via Admin Panel + Supabase
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
    subsections: []
  },
  {
    id: "ai-video-shoot",
    name: "AI Video Shoot",
    count: "02",
    tagline: "High-octane commercial assets and hyper-real cinematic clips with instant rendering.",
    image: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&q=80&w=1200",
    features: [
      "AI-driven motion & physics",
      "Custom scene generation",
      "Cinematic color grading",
      "4K+ output resolution",
      "Instant render pipeline"
    ],
    subsections: []
  },
  {
    id: "automation",
    name: "Automation",
    count: "03",
    tagline: "Custom automation pipelines for business workflows, CRM, and repetitive task elimination.",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=1200",
    features: [
      "Custom workflow automation",
      "CRM & ERP integration",
      "No-code/low-code solutions",
      "Real-time monitoring dashboards",
      "24/7 automated operations"
    ],
    subsections: []
  },
  {
    id: "website-design",
    name: "Website Design",
    count: "04",
    tagline: "Premium, conversion-focused web experiences with cutting-edge design and performance.",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=1200",
    features: [
      "Custom UI/UX design",
      "Responsive & mobile-first",
      "SEO optimized architecture",
      "Performance & speed focused",
      "CMS integration"
    ],
    subsections: []
  },
  {
    id: "brand-building",
    name: "Brand Building",
    count: "05",
    tagline: "Complete brand identity systems from logo to guidelines, built for market impact.",
    image: "https://images.unsplash.com/photo-1558655146-9f40138edfeb?auto=format&fit=crop&q=80&w=1200",
    features: [
      "Logo & visual identity",
      "Brand strategy & positioning",
      "Style guides & brand books",
      "Social media branding kits",
      "Packaging design"
    ],
    subsections: []
  },
  {
    id: "e-invitation",
    name: "E-Invitation",
    count: "06",
    tagline: "Stunning digital invitations with motion graphics, interactive elements, and RSVP systems.",
    image: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&q=80&w=1200",
    features: [
      "Motion invitation cards",
      "Interactive RSVP systems",
      "Custom illustration & animation",
      "WhatsApp & social optimized",
      "Multi-language support"
    ],
    subsections: []
  },
  {
    id: "catalog",
    name: "Catalog",
    count: "07",
    tagline: "Professional product catalogs with premium layouts for digital and print distribution.",
    image: "https://images.unsplash.com/photo-1586717791821-3f44a563fa4c?auto=format&fit=crop&q=80&w=1200",
    features: [
      "Digital & print-ready formats",
      "Product photography integration",
      "Interactive PDF catalogs",
      "E-commerce ready designs",
      "Bulk product layout automation"
    ],
    subsections: []
  },
  {
    id: "insta-grid-stories",
    name: "Insta Grid & Stories",
    count: "08",
    tagline: "Cohesive Instagram grid aesthetics and engaging story templates for brand consistency.",
    image: "https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?auto=format&fit=crop&q=80&w=1200",
    features: [
      "Grid layout planning",
      "Story template systems",
      "Animated story designs",
      "Brand-consistent aesthetics",
      "Content calendar templates"
    ],
    subsections: []
  }
];

// These are managed entirely via Admin Panel + Supabase
export const CLIENTS_DATA: ClientProfile[] = [
  { id: "c1", name: "Studio Link", logo: "STUDIOLINK", industry: "Design", featured: true, collaborationYear: "2023" },
  { id: "c2", name: "Zentrox", logo: "ZENTROX", industry: "Technology", featured: true, collaborationYear: "2023" },
  { id: "c3", name: "Core Hue", logo: "COREHUE", industry: "Marketing", featured: false, collaborationYear: "2022" },
  { id: "c4", name: "Elevana", logo: "ELEVANA", industry: "Consulting", featured: false, collaborationYear: "2022" },
  { id: "c5", name: "Nexus", logo: "NEXUS", industry: "Development", featured: true, collaborationYear: "2024" }
];
export const TESTIMONIALS_DATA: Testimonial[] = [
  {
    id: "t1",
    author: "Sarah Jenkins",
    role: "Marketing Director",
    company: "Zentrox",
    text: "Creo Studio completely transformed our digital presence. The 3D integration they implemented skyrocketed our engagement metrics within the first week.",
    rating: 5,
    avatar: "https://ui-avatars.com/api/?name=Sarah+Jenkins&background=random"
  },
  {
    id: "t2",
    author: "Marcus Chen",
    role: "Founder",
    company: "CoreHue",
    text: "Working with the Creo team was seamless from start to finish. They didn't just build a website; they crafted an experience that perfectly represents our brand.",
    rating: 5,
    avatar: "https://ui-avatars.com/api/?name=Marcus+Chen&background=random"
  }
];

export const FEATURED_PROJECTS: PortfolioProject[] = [
  {
    id: "proj-1",
    title: "Brand Overhaul",
    subtitle: "Digital Presence Redesign",
    category: "brand-building",
    client: "STUDIOLINK",
    year: "2023",
    image: "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&q=80&w=1200",
    timeToDeliver: "14 Days",
    accuracy: "99%",
    resolution: "4K",
    featured: true,
    sections: []
  },
  {
    id: "proj-2",
    title: "Fintech App UI",
    subtitle: "Next-gen Interface Design",
    category: "website-design",
    client: "ZENTROX",
    year: "2023",
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&q=80&w=800",
    timeToDeliver: "21 Days",
    accuracy: "100%",
    resolution: "4K",
    featured: true,
    sections: []
  },
  {
    id: "proj-3",
    title: "3D Marketing Site",
    subtitle: "High-performance Web Experience",
    category: "website-design",
    client: "COREHUE",
    year: "2024",
    image: "https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&q=80&w=800",
    timeToDeliver: "30 Days",
    accuracy: "98%",
    resolution: "4K",
    featured: true,
    sections: []
  },
  {
    id: "proj-4",
    title: "Launch Campaign",
    subtitle: "Motion Graphics & Video",
    category: "ai-video-shoot",
    client: "ELEVANA",
    year: "2024",
    image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=1200",
    timeToDeliver: "10 Days",
    accuracy: "95%",
    resolution: "4K",
    featured: true,
    sections: []
  }
];

