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

export const SERVICES_DATA: ServiceDetail[] = [];
export const CLIENTS_DATA: ClientProfile[] = [];
export const TESTIMONIALS_DATA: Testimonial[] = [];
export const FEATURED_PROJECTS: PortfolioProject[] = [];

