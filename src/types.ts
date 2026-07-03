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
  { id: "c1", name: "Studio Link", logo: "STUDIOLINK" },
  { id: "c2", name: "Zentrox", logo: "ZENTROX" },
  { id: "c3", name: "Core Hue", logo: "COREHUE" },
  { id: "c4", name: "Elevana", logo: "ELEVANA" },
  { id: "c5", name: "Nexus", logo: "NEXUS" }
];
export const TESTIMONIALS_DATA: Testimonial[] = [
  {
    id: "t1",
    author: "Sarah Jenkins",
    role: "Marketing Director",
    company: "Zentrox",
    content: "Creo Studio completely transformed our digital presence. The 3D integration they implemented skyrocketed our engagement metrics within the first week.",
    rating: 5,
    timestamp: new Date().toISOString()
  },
  {
    id: "t2",
    author: "Marcus Chen",
    role: "Founder",
    company: "CoreHue",
    content: "Working with the Creo team was seamless from start to finish. They didn't just build a website; they crafted an experience that perfectly represents our brand.",
    rating: 5,
    timestamp: new Date().toISOString()
  }
];
export const FEATURED_PROJECTS: PortfolioProject[] = [
  {
    id: "proj-1",
    client: "STUDIOLINK",
    category: "Branding",
    description: "A complete brand overhaul and digital presence redesign for a leading architectural firm.",
    image: "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&q=80&w=1200",
    date: "2023",
    services: ["Brand Strategy", "Visual Identity", "Web Design"]
  },
  {
    id: "proj-2",
    client: "ZENTROX",
    category: "UI/UX",
    description: "Sleek and highly functional user interface for a next-gen fintech application.",
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&q=80&w=800",
    date: "2023",
    services: ["UI/UX Design", "Prototyping", "Design System"]
  },
  {
    id: "proj-3",
    client: "COREHUE",
    category: "Development",
    description: "High-performance marketing website with integrated 3D experiences.",
    image: "https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&q=80&w=800",
    date: "2024",
    services: ["Web Development", "3D Integration", "Performance Optimization"]
  },
  {
    id: "proj-4",
    client: "ELEVANA",
    category: "Motion",
    description: "Brand launch campaign featuring high-end motion graphics and video editing.",
    image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=1200",
    date: "2024",
    services: ["Motion Graphics", "Video Production", "Campaign Strategy"]
  }
];

