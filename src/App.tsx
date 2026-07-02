import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowUpRight, 
  Clock, 
  ShieldCheck, 
  Video, 
  Send, 
  CheckCircle2, 
  Star, 
  Sparkles, 
  Compass, 
  Sliders, 
  Mail, 
  ArrowLeft,
  Flame,
  ChevronRight,
  User,
  Heart,
  Laptop,
  Check,
  Zap,
  LayoutGrid,
  Repeat,
  Sun,
  Hexagon,
  Instagram,
  Twitter,
  Dribbble,
  Linkedin,
  X
} from 'lucide-react';

import { 
  SERVICES_DATA, 
  CLIENTS_DATA, 
  TESTIMONIALS_DATA, 
  FEATURED_PROJECTS, 
  ServiceDetail, 
  ClientProfile, 
  Testimonial, 
  PortfolioProject, 
  ClientInquiry 
} from './types';

// Subcomponents
import Header from './components/Header';
import ServiceInnerView from './components/ServiceInnerView';
import ProjectDetailView from './components/ProjectDetailView';
import AdminPanel from './components/AdminPanel';
import { supabase } from './lib/supabase';

function AnimatedCounter({ value, duration = 2000, suffix = "" }: { value: number, duration?: number, suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let animationFrame: number;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !hasAnimated.current) {
        hasAnimated.current = true;
        if (animationFrame) cancelAnimationFrame(animationFrame);
        const endValue = value;
        const start = performance.now();
        
        // Smaller numbers need less time to animate so they don't sit at 0 for too long
        const actualDuration = endValue <= 1 ? 400 : endValue <= 20 ? 1000 : duration;
        
        // Delay the start of smaller numbers so that ALL counters finish at the exact same moment (duration)
        const delay = Math.max(0, duration - actualDuration);
        
        const update = (currentTime: number) => {
          const elapsed = currentTime - start;
          
          if (elapsed < delay) {
            // We are in the delay phase, just show 0
            el.textContent = `0${suffix}`;
            animationFrame = requestAnimationFrame(update);
            return;
          }
          
          // We are in the active animation phase
          const activeElapsed = elapsed - delay;
          const progress = Math.min(activeElapsed / actualDuration, 1);
          
          // easeOutQuad for a smooth, natural deceleration
          const easeProgress = 1 - (1 - progress) * (1 - progress);
          
          const currentCount = Math.round(easeProgress * endValue);
          el.textContent = `${currentCount}${suffix}`;
          
          if (progress < 1) {
            animationFrame = requestAnimationFrame(update);
          } else {
            el.textContent = `${endValue}${suffix}`;
          }
        };
        
        animationFrame = requestAnimationFrame(update);
        observer.unobserve(el);
      }
    }, { threshold: 0.15 });

    observer.observe(el);

    return () => {
      observer.disconnect();
      if(animationFrame) cancelAnimationFrame(animationFrame);
    };
  }, [value, duration, suffix]);

  return <span ref={ref} style={{ fontVariantNumeric: 'tabular-nums' }}>0{suffix}</span>;
}

// Static Services List with Moving Bracket Selector for Mobile - Page Scroll Driven
function CircularServicesList({ 
  services, 
  onSelectService 
}: { 
  services: any[], 
  onSelectService: (id: string) => void 
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const itemHeight = 50;

  useEffect(() => {
    const track = trackRef.current;
    const container = containerRef.current;
    if (!track || !container) return;

    // Cache DOM references
    const items = container.querySelectorAll('.service-item') as NodeListOf<HTMLDivElement>;

    const updatePositions = (progress: number) => {
      const activeFloat = progress * (services.length - 1);
      const bracketY = activeFloat * itemHeight;

      // Update the translation of the bracket-selector
      const selector = container.querySelector('.bracket-selector') as HTMLDivElement;
      if (selector) {
        selector.style.transform = `translateY(${bracketY}px)`;
      }

      // Update style of each service item
      for (let idx = 0; idx < items.length; idx++) {
        const item = items[idx];
        const diff = Math.abs(idx - activeFloat);

        // Smoothly fade out inactive items and scale slightly
        const opacity = 1 - Math.min(0.65, diff * 0.65);
        const scale = 1.12 - Math.min(0.12, diff * 0.12);

        item.style.opacity = String(opacity);
        item.style.transform = `scale(${scale})`;

        const isActive = diff < 0.5;
        const titleEl = item.querySelector('.service-title');
        const countEl = item.querySelector('.service-count');

        if (titleEl) {
          if (isActive) {
            titleEl.classList.add('text-white');
            titleEl.classList.remove('text-[#444444]');
          } else {
            titleEl.classList.remove('text-white');
            titleEl.classList.add('text-[#444444]');
          }
        }
        if (countEl) {
          if (isActive) {
            countEl.classList.add('text-[#ff4500]');
            countEl.classList.remove('text-[#222222]');
          } else {
            countEl.classList.remove('text-[#ff4500]');
            countEl.classList.add('text-[#222222]');
          }
        }
      }
    };

    let ticking = false;

    const handleScroll = () => {
      const rect = track.getBoundingClientRect();
      const totalScrollable = track.offsetHeight - window.innerHeight;
      
      const scrolled = -rect.top;
      let progress = 0;
      if (totalScrollable > 0) {
        progress = Math.max(0, Math.min(1, scrolled / totalScrollable));
      }

      if (!ticking) {
        requestAnimationFrame(() => {
          updatePositions(progress);
          ticking = false;
        });
        ticking = true;
      }
    };

    // Initial layout calculation
    handleScroll();

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, [services, itemHeight]);

  // Track height based on service count to give comfortable scrolling distance (e.g. 100vh + 35vh per item)
  const trackHeight = `calc(100vh + ${(services.length - 1) * 35}vh)`;

  return (
    <div 
      ref={trackRef} 
      className="w-full relative" 
      style={{ height: trackHeight }}
    >
      {/* Sticky viewport container */}
      <div className="sticky top-0 w-full h-[100vh] flex flex-col items-center justify-center overflow-hidden bg-[#0a0a0a] px-6">
        
        {/* Mobile View Sticky Title Header */}
        <div className="w-full max-w-[340px] xs:max-w-[350px] mb-2 text-left border-b border-white/10 pb-3">
          <h2 className="font-display text-2xl xs:text-3xl font-bold tracking-tighter text-white uppercase leading-none">
            Studio Services <br />
            <span className="font-serif italic font-normal text-white/40 lowercase text-xl xs:text-2xl">curation</span>
          </h2>
        </div>

        {/* Dynamic Sub-header instruction */}
        <div className="font-mono text-[9px] text-[#ff4500] tracking-[0.25em] uppercase mb-4 animate-pulse">
          SCROLL DOWN TO EXPLORE // TAP TO ENTER
        </div>

        {/* Editorial picker guides */}
        <div 
          ref={containerRef}
          className="relative w-full max-w-[370px] xs:max-w-[395px] flex items-center justify-center"
          style={{ height: `${services.length * itemHeight}px` }}
        >
          {/* Moving Selection Brackets */}
          <div 
            className="bracket-selector absolute left-[-16px] right-[-16px] border-y border-white/10 pointer-events-none flex items-center justify-between px-2 z-0"
            style={{ 
              height: `${itemHeight}px`,
              top: 0,
              transform: 'translateY(0px)',
              willChange: 'transform'
            }}
          >
            <div className="w-2 h-4 border-l border-y border-[#ff4500]" />
            <div className="w-2 h-4 border-r border-y border-[#ff4500]" />
          </div>

          {/* Static Vertical List of Items */}
          <div className="relative z-10 w-full h-full flex flex-col justify-between">
            {services.map((s) => {
              return (
                <div
                  key={s.id}
                  onClick={() => onSelectService(s.id)}
                  className="service-item w-full flex items-center justify-center cursor-pointer select-none"
                  style={{ 
                    height: `${itemHeight}px`,
                    willChange: 'transform, opacity',
                  }}
                >
                  <div className="flex items-start gap-1 relative text-center">
                    <h3 className={`service-title font-sans font-black tracking-tighter uppercase transition-all duration-300 ${
                      s.name.length > 20 
                        ? 'text-lg xs:text-xl' 
                        : 'text-2xl xs:text-3xl'
                    } text-[#444444]`}>
                      {s.name}
                    </h3>
                    <span className="service-count font-mono text-[10px] font-black transition-all duration-300 self-start mt-0.5 text-[#222222]">
                      ({s.count})
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  // State Initialization from Persistent LocalStorage
  const [services, setServices] = useState<ServiceDetail[]>(() => {
    const saved = localStorage.getItem('creo_services');
    const parsed = saved ? JSON.parse(saved) : null;
    return parsed && parsed.length > 0 ? parsed : SERVICES_DATA;
  });

  const [clients, setClients] = useState<ClientProfile[]>(() => {
    const saved = localStorage.getItem('creo_clients');
    const parsed = saved ? JSON.parse(saved) : null;
    return parsed && parsed.length > 0 ? parsed : CLIENTS_DATA;
  });

  const [testimonials, setTestimonials] = useState<Testimonial[]>(() => {
    const saved = localStorage.getItem('creo_testimonials');
    const parsed = saved ? JSON.parse(saved) : null;
    return parsed && parsed.length > 0 ? parsed : TESTIMONIALS_DATA;
  });

  const [projects, setProjects] = useState<PortfolioProject[]>(() => {
    const saved = localStorage.getItem('creo_projects');
    const parsed = saved ? JSON.parse(saved) : null;
    return parsed && parsed.length > 0 ? parsed : FEATURED_PROJECTS;
  });

  const [inquiries, setInquiries] = useState<ClientInquiry[]>(() => {
    const saved = localStorage.getItem('creo_inquiries');
    return saved ? JSON.parse(saved) : [];
  });

  const [selectedBrand, setSelectedBrand] = useState<ClientProfile | null>(null);
  const [serviceParams, setServiceParams] = useState<{subId?: string; brand?: string} | null>(null);

  // Custom Hash Router State
  const [route, setRoute] = useState<{ path: 'home' | 'service' | 'project' | 'admin'; id?: string }>(() => {
    const hash = window.location.hash;
    if (hash.startsWith('#/services/')) {
      return { path: 'service', id: hash.replace('#/services/', '') };
    }
    if (hash.startsWith('#/projects/')) {
      return { path: 'project', id: hash.replace('#/projects/', '') };
    }
    if (hash === '#/admin') {
      return { path: 'admin' };
    }
    return { path: 'home' };
  });

  // Derived back-compatibility state variables
  const activeServiceId = route.path === 'service' ? route.id : null;
  const activeProjectId = route.path === 'project' ? route.id : null;

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash.startsWith('#/services/')) {
        setRoute({ path: 'service', id: hash.replace('#/services/', '') });
      } else if (hash.startsWith('#/projects/')) {
        setRoute({ path: 'project', id: hash.replace('#/projects/', '') });
      } else if (hash === '#/admin') {
        setRoute({ path: 'admin' });
      } else {
        setRoute({ path: 'home' });
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigateTo = (path: 'home' | 'service' | 'project' | 'admin', id?: string) => {
    if (path === 'service' && id) {
      window.location.hash = `#/services/${id}`;
    } else if (path === 'project' && id) {
      window.location.hash = `#/projects/${id}`;
    } else if (path === 'admin') {
      window.location.hash = '#/admin';
    } else {
      window.location.hash = '#/';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const saveToSupabase = async (key: string, data: any) => {
    try {
      const { data: current, error } = await supabase.from('site_data').select('content').eq('id', 'main').single();
      const currentContent = error ? {} : (current?.content || {});
      const newContent = { ...currentContent, [key]: data };
      await supabase.from('site_data').upsert({ id: 'main', content: newContent });
    } catch (e) {
      console.error('Supabase save error:', e);
    }
  };

  const loadDbData = async () => {
    try {
      const { data, error } = await supabase.from('site_data').select('content').eq('id', 'main').single();
      if (error) throw error;
      
      const content = data?.content || {};
      
      // Always use Supabase as the source of truth when available, fallback to default data if missing/empty
      const loadedServices = content.services && content.services.length > 0 ? content.services : SERVICES_DATA;
      setServices(loadedServices);
      localStorage.setItem('creo_services', JSON.stringify(loadedServices));
      
      const loadedClients = content.clients && content.clients.length > 0 ? content.clients : CLIENTS_DATA;
      setClients(loadedClients);
      localStorage.setItem('creo_clients', JSON.stringify(loadedClients));
      
      const loadedTestimonials = content.testimonials && content.testimonials.length > 0 ? content.testimonials : TESTIMONIALS_DATA;
      setTestimonials(loadedTestimonials);
      localStorage.setItem('creo_testimonials', JSON.stringify(loadedTestimonials));
      
      const loadedProjects = content.projects && content.projects.length > 0 ? content.projects : FEATURED_PROJECTS;
      setProjects(loadedProjects);
      localStorage.setItem('creo_projects', JSON.stringify(loadedProjects));
      
      setInquiries(content.inquiries || []);
      localStorage.setItem('creo_inquiries', JSON.stringify(content.inquiries || []));
    } catch (err) {
      console.log('Using offline localStorage persistence:', err);
    }
  };

  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
    window.scrollTo(0, 0);
    
    loadDbData();
  }, []);

  // Active hover states (for our elegant Norell services list)
  const [hoveredServiceId, setHoveredServiceId] = useState<string | null>(services[0]?.id || null);

  // Contact Collaboration Form State
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formService, setFormService] = useState('');
  const [formMessage, setFormMessage] = useState('');
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formErrorMsg, setFormErrorMsg] = useState('');

  // Floating notification indicator
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMsg, setNotificationMsg] = useState('');

  // Sync state functions with localstorage and Supabase
  const updateClientsState = async (newClients: ClientProfile[]) => {
    setClients(newClients);
    localStorage.setItem('creo_clients', JSON.stringify(newClients));
    await saveToSupabase('clients', newClients);
  };

  const updateServicesState = async (newServices: ServiceDetail[]) => {
    setServices(newServices);
    localStorage.setItem('creo_services', JSON.stringify(newServices));
    await saveToSupabase('services', newServices);
  };

  const updateProjectsState = async (newProjects: PortfolioProject[]) => {
    setProjects(newProjects);
    localStorage.setItem('creo_projects', JSON.stringify(newProjects));
    await saveToSupabase('projects', newProjects);
  };

  const updateInquiriesState = async (newInquiries: ClientInquiry[]) => {
    setInquiries(newInquiries);
    localStorage.setItem('creo_inquiries', JSON.stringify(newInquiries));
    await saveToSupabase('inquiries', newInquiries);
  };

  // Submit Contact Form handler
  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || !formEmail || !formMessage) {
      setFormErrorMsg("Please enter all required parameters.");
      return;
    }

    const newInquiry: ClientInquiry = {
      id: "inq-" + Date.now().toString().slice(-5),
      name: formName,
      email: formEmail,
      serviceId: formService,
      message: formMessage,
      timestamp: new Date().toLocaleString(),
      status: 'unread'
    };

    const updated = [newInquiry, ...inquiries];
    setInquiries(updated);
    localStorage.setItem('creo_inquiries', JSON.stringify(updated));
    await saveToSupabase('inquiries', updated);
    
    // Clear fields
    setFormName('');
    setFormEmail('');
    setFormMessage('');
    setFormErrorMsg('');
    setFormSubmitted(true);

    triggerAlert("Inquiry received! Check STUDIO Portal to view incoming campaign details.");

    setTimeout(() => {
      setFormSubmitted(false);
    }, 4500);
  };

  const deleteInquiry = async (id: string) => {
    const updated = inquiries.filter(i => i.id !== id);
    setInquiries(updated);
    localStorage.setItem('creo_inquiries', JSON.stringify(updated));
    await saveToSupabase('inquiries', updated);
  };

  const resetDatabase = async () => {
    try {
      // Just push default values
      const defaultData = {
        services: SERVICES_DATA,
        clients: CLIENTS_DATA,
        testimonials: TESTIMONIALS_DATA,
        projects: FEATURED_PROJECTS,
        inquiries: []
      };
      await supabase.from('site_data').upsert({ id: 'main', content: defaultData });

      setServices(SERVICES_DATA);
      setClients(CLIENTS_DATA);
      setTestimonials(TESTIMONIALS_DATA);
      setProjects(FEATURED_PROJECTS);
      setInquiries([]);
      
      localStorage.setItem('creo_services', JSON.stringify(SERVICES_DATA));
      localStorage.setItem('creo_clients', JSON.stringify(CLIENTS_DATA));
      localStorage.setItem('creo_testimonials', JSON.stringify(TESTIMONIALS_DATA));
      localStorage.setItem('creo_projects', JSON.stringify(FEATURED_PROJECTS));
      localStorage.setItem('creo_inquiries', JSON.stringify([]));
    } catch (err) {
      console.error('Failed to reset database:', err);
      throw err;
    }
  };

  // Helper alert popover
  const triggerAlert = (msg: string) => {
    setNotificationMsg(msg);
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 4000);
  };

  // Reset and Return to showcase landing page
  const resetAllViewsAndScroll = () => {
    navigateTo('home');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Section smooth scroller
  const scrollToSection = (selector: string) => {
    // If on inner page, return to home first
    if (route.path !== 'home') {
      navigateTo('home');
      
      // Delay scrolling slightly for transition component mount
      setTimeout(() => {
        const el = document.querySelector(selector);
        el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    } else {
      const el = document.querySelector(selector);
      el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f7f7] text-black selection:bg-black selection:text-white font-sans relative w-full">
      
      {/* Background Architectural Grid Lines Overlays */}
      <div className="fixed inset-y-0 left-0 right-0 pointer-events-none flex justify-between px-6 md:px-12 xl:px-24 z-0 opacity-100 overflow-hidden">
        <div className="grid-line-vertical h-full"></div>
        <div className="grid-line-vertical h-full hidden xs:block"></div>
        <div className="grid-line-vertical h-full hidden md:block"></div>
        <div className="grid-line-vertical h-full hidden lg:block"></div>
        <div className="grid-line-vertical h-full hidden xl:block"></div>
        <div className="grid-line-vertical h-full"></div>
      </div>

      {/* Global Toast Alert banner */}
      <AnimatePresence>
        {showNotification && (
          <motion.div
            initial={{ opacity: 0, y: -50, x: '-50%' }}
            animate={{ opacity: 1, y: 20, x: '-50%' }}
            exit={{ opacity: 0, y: -50, x: '-50%' }}
            className="fixed top-0 left-1/2 z-50 bg-black text-white text-xs font-mono font-bold uppercase tracking-widest px-6 py-3 rounded-none shadow-2xl max-w-sm text-center flex items-center gap-2 "
          >
            <Zap className="w-4 h-4 text-emerald-400 fill-emerald-400 animate-bounce" />
            <span>{notificationMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation Header */}
      {route.path !== 'admin' && (
        <Header 
          activeServiceId={activeServiceId}
          resetAllViews={resetAllViewsAndScroll}
          scrollToSection={scrollToSection}
        />
      )}

      {/* Dynamic Main Body Content Panel routing */}
      <main className="relative z-10 w-full flex flex-col flex-1">
        <AnimatePresence mode="wait">
          {route.path === 'admin' ? (
            <AdminPanel
              key="admin-view"
              services={services}
              inquiries={inquiries}
              clients={clients}
              projects={projects}
              updateClients={updateClientsState}
              updateProjects={updateProjectsState}
              onBack={() => navigateTo('home')}
              onRefreshData={loadDbData}
              updateServices={updateServicesState}
              deleteInquiry={deleteInquiry}
              resetDatabase={resetDatabase}
            />
          ) : route.path === 'service' && activeServiceId ? (
            /* 2. Service Subsection Details Inner View */
            <ServiceInnerView 
              key="service-view"
              service={services.find(s => s.id === activeServiceId) || services[0]}
              services={services}
              initialItemId={serviceParams?.subId}
              initialBrand={serviceParams?.brand}
              onBack={() => {
                setServiceParams(null);
                navigateTo('home');
              }}
              onNavigateToService={(id) => {
                setServiceParams(null);
                navigateTo('service', id);
              }}
              onEnquire={() => {
                const serviceToSelect = activeServiceId;
                navigateTo('home');
                setTimeout(() => {
                  setFormService(serviceToSelect);
                  const el = document.querySelector('#collaboration-contact-form');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }, 200);
              }}
            />
          ) : route.path === 'project' && activeProjectId ? (
            /* 3. Case Study project details view */
            <ProjectDetailView 
              key="project-view"
              project={projects.find(p => p.id === activeProjectId) || projects[0]}
              onBack={() => navigateTo('home')}
              onEnquire={() => {
                navigateTo('home');
                setTimeout(() => {
                  const el = document.querySelector('#collaboration-contact-form');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }, 200);
              }}
            />
          ) : (
            /* 4. Full Core Landing Page Layout */
            <motion.div
              key="landing-showcase"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col"
            >
              {/* LANDING SECTION 1: HERO */}
              <section id="hero-landing-section" className="max-w-7xl mx-auto px-4 sm:px-6 h-auto md:h-[70vh] pt-6 md:pt-0 min-h-[420px] md:min-h-[480px] flex flex-col justify-end pb-4 md:pb-10 sm:pb-12 overflow-hidden">
                {/* Mobile Animated Graphic Element */}
                <div className="flex-grow w-full flex items-center justify-center relative md:hidden py-2 select-none overflow-hidden min-h-[220px]">
                  {/* Animated background gradient glow */}
                  <motion.div
                    animate={{
                      scale: [1, 1.15, 1],
                      rotate: [0, 180, 360],
                      borderRadius: ["40% 60% 70% 30% / 40% 50% 60% 50%", "70% 30% 52% 48% / 60% 40% 70% 30%", "40% 60% 70% 30% / 40% 50% 60% 50%"]
                    }}
                    transition={{
                      duration: 12,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                    className="absolute w-48 h-48 bg-gradient-to-tr from-[#007A93]/20 via-emerald-400/10 to-transparent blur-2xl pointer-events-none"
                  />

                  {/* Thin architectural wireframe grid */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-[0.07] pointer-events-none">
                    <div className="w-56 h-56 border border-dashed border-black rounded-full animate-[spin_40s_linear_infinite]" />
                    <div className="absolute w-40 h-40 border border-black rounded-full animate-[spin_20s_linear_infinite_reverse]" />
                    <div className="absolute w-56 h-[1px] bg-black" />
                    <div className="absolute h-56 w-[1px] bg-black" />
                  </div>

                  {/* Main Interactive/Floating Element: Premium Glassmorphism Card */}
                  <motion.div
                    initial={{ y: 20, opacity: 0, scale: 0.9 }}
                    animate={{ y: 0, opacity: 1, scale: 1 }}
                    transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                    className="relative"
                  >
                    {/* Floating Glass Card 1 */}
                    <motion.div
                      animate={{ y: [0, -8, 0] }}
                      transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                      className="w-40 h-24 bg-white/45 backdrop-blur-md border border-white/40 rounded-none p-4 shadow-[0_8px_32px_0_rgba(0,0,0,0.06)] relative z-10 flex flex-col justify-between"
                    >
                      <div className="flex justify-between items-start">
                        <div className="w-8 h-8 rounded-none bg-black/5 flex items-center justify-center">
                          <Sparkles className="w-4 h-4 text-[#007A93] animate-pulse" />
                        </div>
                        <div className="font-mono text-[8px] text-black/40 font-bold uppercase tracking-wider">
                          creo // S-01
                        </div>
                      </div>
                      <div>
                        <div className="w-12 h-1 bg-[#007A93]/40 rounded-none mb-1.5" />
                        <div className="w-16 h-1 bg-black/10 rounded-none" />
                      </div>
                    </motion.div>

                    {/* Floating Glass Card 2 - overlapping slightly offset */}
                    <motion.div
                      animate={{ y: [0, 8, 0] }}
                      transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                      className="absolute -bottom-6 -right-6 w-32 h-20 bg-black/[0.02] backdrop-blur-sm border border-black/5 rounded-none p-3 shadow-sm z-20 flex flex-col justify-between"
                    >
                      <div className="flex justify-between items-start">
                        <span className="text-[9px] font-mono font-bold tracking-widest text-black/50">ACTIVE</span>
                        <div className="w-1.5 h-1.5 rounded-none bg-emerald-400 animate-ping" />
                      </div>
                      <div className="flex gap-1 items-end">
                        <div className="w-3 h-4 bg-black/10 rounded-none" />
                        <div className="w-3 h-7 bg-[#007A93]/60 rounded-none" />
                        <div className="w-3 h-5 bg-black/10 rounded-none" />
                      </div>
                    </motion.div>
                  </motion.div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 items-end">
                  <div className="md:col-span-2">
                    <h1 className="font-display text-[2.5rem] xs:text-5xl sm:text-7xl xl:text-[8rem] font-bold text-black tracking-tighter uppercase leading-[0.88] mb-2 relative z-10">
                      Crafting digital <br />
                      <span className="font-serif italic font-normal text-black/70 lowercase text-[2rem] xs:text-4xl sm:text-6xl xl:text-[7rem]">experiences</span>
                    </h1>
                  </div>

                  <div className="hidden sm:flex flex-col items-start md:items-end justify-end text-sm text-black/60 font-sans leading-relaxed relative z-10">
                    <p className="mb-6 max-w-xs md:text-right">A creative studio crafting stunning digital experiences with precision and scale.</p>
                    <div className="flex gap-4 font-mono text-[10px] uppercase tracking-widest text-black/40">
                      <a href="#" className="hover:text-black transition-colors">X</a>
                      <span>-</span>
                      <a href="#" className="hover:text-black transition-colors">Ins</a>
                      <span>-</span>
                      <a href="#" className="hover:text-black transition-colors">Tg</a>
                    </div>
                  </div>
                </div>
              </section>

              {/* LANDING SECTION 2: PROJECTS START */}
              <section id="featured-work-section" className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 md:pt-24 pb-12 relative z-10 overflow-hidden">
                <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-black/10 pb-8 mb-10 md:mb-12 gap-4 md:gap-6">
                  <div>
                    <h2 className="font-display text-3xl sm:text-4xl md:text-6xl font-bold tracking-tighter text-black uppercase">
                      Projects we're <br className="hidden md:block"/>
                      <span className="font-serif italic font-normal text-black/60 lowercase">proud of</span>
                    </h2>
                  </div>
                  <div className="max-w-xs text-sm text-black/60 font-sans">
                    <p>
                      A curated collection of projects that demonstrate our approach to design and development.
                    </p>
                  </div>
                </div>

                {/* Case studies interior bento grid */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:auto-rows-[400px]">
                  {/* First item - STUDIOLINK (wider) */}
                  {projects[0] && (
                    <div 
                      onClick={() => {
                        navigateTo('project', projects[0].id);
                        window.scrollTo({ top: 0, behavior: 'instant' });
                      }}
                      className="md:col-span-7 h-[280px] sm:h-[340px] md:h-auto rounded-none overflow-hidden group cursor-pointer relative"
                    >
                      <img 
                        src={projects[0].image || "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&q=80&w=1200"} 
                        alt={projects[0].client}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000 ease-[cubic-bezier(0.2,1,0.2,1)]"
                      />
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors duration-500"></div>
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="flex items-center gap-2 text-white font-sans font-bold text-2xl uppercase tracking-tighter">
                          <Repeat className="w-8 h-8 text-white relative top-[-1px]" />
                          <span>{projects[0].client}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Second item - ZENTROX (narrower) */}
                  {projects[1] && (
                    <div 
                      onClick={() => {
                        navigateTo('project', projects[1].id);
                        window.scrollTo({ top: 0, behavior: 'instant' });
                      }}
                      className="md:col-span-5 h-[240px] sm:h-[300px] md:h-auto rounded-none overflow-hidden group cursor-pointer relative"
                    >
                      <img 
                        src={projects[1].image || "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&q=80&w=800"} 
                        alt={projects[1].client}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000 ease-[cubic-bezier(0.2,1,0.2,1)]"
                      />
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors duration-500"></div>
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="flex items-center gap-2 text-white font-sans font-medium text-xl tracking-tight">
                          <Sun className="w-5 h-5 text-white" />
                          <span>{projects[1].client}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Third item - COREHUE (narrower) */}
                  {projects[2] && (
                    <div 
                      onClick={() => {
                        navigateTo('project', projects[2].id);
                        window.scrollTo({ top: 0, behavior: 'instant' });
                      }}
                      className="md:col-span-5 h-[240px] sm:h-[300px] md:h-auto rounded-none overflow-hidden group cursor-pointer relative"
                    >
                      <img 
                        src={projects[2].image || "https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&q=80&w=800"} 
                        alt={projects[2].client}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000 ease-[cubic-bezier(0.2,1,0.2,1)]"
                      />
                      <div className="absolute inset-0 bg-black/30 group-hover:bg-black/50 transition-colors duration-500"></div>
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="flex items-center gap-2 text-white font-sans font-bold text-xl uppercase tracking-widest">
                          <Hexagon className="w-6 h-6 text-white" fill="white" />
                          <span>{projects[2].client}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Fourth item - ELEVANA (wider) */}
                  {projects[3] && (
                    <div 
                      onClick={() => {
                        navigateTo('project', projects[3].id);
                        window.scrollTo({ top: 0, behavior: 'instant' });
                      }}
                      className="md:col-span-7 h-[280px] sm:h-[340px] md:h-auto rounded-none overflow-hidden group cursor-pointer relative"
                    >
                      <img 
                        src={projects[3].image || "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=1200"} 
                        alt={projects[3].client}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000 ease-[cubic-bezier(0.2,1,0.2,1)]"
                      />
                      <div className="absolute inset-0 bg-black/40 group-hover:bg-black/60 transition-colors duration-500"></div>
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="flex items-center gap-2 text-white font-sans font-semibold text-2xl tracking-tight">
                          <span>{projects[3].client}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </section>

              {/* LANDING SECTION 3: THE BIG INTERACTIVE SERVICES ACCORDION LIST */}
              <section id="services-index-section" className="w-full pt-0 pb-0 md:pt-24 md:pb-16 relative md:overflow-hidden bg-[#0a0a0a] border-y border-white/5">
                {/* Desktop view header & list (hidden on mobile) */}
                <div className="hidden md:block max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
                  <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-white/10 pb-8 mb-10 md:mb-16 gap-4 md:gap-6">
                    <div>
                      <h2 className="font-display text-3xl sm:text-4xl md:text-6xl font-bold tracking-tighter text-white uppercase">
                        Studio Services <br className="hidden md:block"/>
                        <span className="font-serif italic font-normal text-white/40 lowercase">curation</span>
                      </h2>
                    </div>
                  </div>

                  {/* Desktop view accordion list */}
                  <div className="flex flex-col">
                    {services.map((s, idx) => (
                      <div
                        key={s.id}
                        id={`service-row-${s.id}`}
                        onMouseEnter={() => setHoveredServiceId(s.id)}
                        onClick={() => {
                          navigateTo('service', s.id);
                          window.scrollTo({ top: 0, behavior: 'instant' });
                        }}
                        className={`group relative flex flex-col md:flex-row md:items-end justify-between py-8 md:py-10 border-b border-white/10 cursor-pointer transition-all duration-500`}
                      >
                        <div className="flex items-start gap-1 md:gap-4 relative z-10 w-full md:w-auto mb-2 md:mb-0">
                          <h3 className={`font-sans text-2xl sm:text-4xl lg:text-[4rem] xl:text-[4.5rem] font-bold tracking-tight transition-all duration-500 origin-left whitespace-normal leading-[1] md:leading-[0.85] max-w-[80vw] md:max-w-[800px] ${
                            hoveredServiceId === s.id ? 'text-white' : 'text-white md:text-[#333333]'
                          }`}>
                            {s.name}
                          </h3>
                          <span className={`font-mono text-xs sm:text-sm md:text-lg font-bold transition-all duration-500 shrink-0 ${
                            hoveredServiceId === s.id ? 'text-[#ff4500] -translate-y-2 md:-translate-y-8' : 'text-white/40 md:text-[#333333] -translate-y-2 md:-translate-y-8'
                          }`}>
                            ({s.count})
                          </span>
                        </div>
                        
                        <div className={`hidden md:block text-sm font-sans max-w-xs transition-all duration-500 relative z-10 ${
                          hoveredServiceId === s.id ? 'opacity-100 text-white/70' : 'opacity-0 text-white/0'
                        }`}>
                          {s.tagline}
                        </div>

                        {/* Floating image on hover - desktop only, clipped to not overflow */}
                        <div className={`hidden md:block absolute top-1/2 -translate-y-1/2 left-[42%] lg:left-[45%] w-48 lg:w-64 xl:w-72 shadow-2xl rounded-none overflow-hidden aspect-[4/3] pointer-events-none transition-all duration-700 ease-out z-0 border border-white/10 ${
                            hoveredServiceId === s.id ? 'opacity-100 scale-100 rotate-2' : 'opacity-0 scale-90 -rotate-2'
                        }`}>
                            <div className="relative w-full h-full">
                                <img src={s.image} alt={s.name} className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/40" />
                            </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Mobile view 3D circular scroll picker (full-bleed) */}
                <div className="md:hidden">
                  <CircularServicesList 
                    services={services} 
                    onSelectService={(id) => {
                      navigateTo('service', id);
                      window.scrollTo({ top: 0, behavior: 'instant' });
                    }}
                  />
                </div>
              </section>

              {/* LANDING SECTION 4: PERFORMANCE STATS */}
              <section id="performance-stats-section" className="bg-white border-y border-black/10 py-12 sm:py-16 relative z-10 w-full overflow-hidden">
                <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12">
                  <div className="flex flex-col items-center justify-center text-center">
                    <div className="font-display text-5xl md:text-6xl lg:text-7xl font-bold tracking-tighter text-black mb-2"><AnimatedCounter value={2} /><span className="font-serif italic font-normal text-black/50 ml-1">Days</span></div>
                    <div className="font-sans text-[10px] sm:text-xs font-semibold text-black/60 uppercase tracking-[0.2em] max-w-[120px] mx-auto text-center">
                      Fast Delivery Guarantee
                    </div>
                  </div>

                  <div className="flex flex-col items-center justify-center text-center">
                    <div className="font-display text-5xl md:text-6xl lg:text-7xl font-bold tracking-tighter text-black mb-2"><AnimatedCounter value={98} /><span className="font-serif italic font-normal text-black/50 ml-1">%</span></div>
                    <div className="font-sans text-[10px] sm:text-xs font-semibold text-black/60 uppercase tracking-[0.2em] max-w-[120px] mx-auto text-center">
                      Campaign Accuracy
                    </div>
                  </div>

                  <div className="flex flex-col items-center justify-center text-center">
                    <div className="font-display text-5xl md:text-6xl lg:text-7xl font-bold tracking-tighter text-black mb-2"><AnimatedCounter value={2} /><span className="font-serif italic font-normal text-black/50 ml-1">K</span></div>
                    <div className="font-sans text-[10px] sm:text-xs font-semibold text-black/60 uppercase tracking-[0.2em] max-w-[120px] mx-auto text-center">
                      Mastering Resolution
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-center justify-center text-center">
                    <div className="font-display text-5xl md:text-6xl lg:text-7xl font-bold tracking-tighter text-black mb-2"><AnimatedCounter value={12} /><span className="font-serif italic font-normal text-black/50 ml-1">+</span></div>
                    <div className="font-sans text-[10px] sm:text-xs font-semibold text-black/60 uppercase tracking-[0.2em] max-w-[120px] mx-auto text-center">
                      Global Brands Served
                    </div>
                  </div>
                </div>
              </section>

              {/* LANDING SECTION 5: BRANDS WE ARE WORKING WITH */}
              <section id="brands-section" className="max-w-7xl mx-auto px-4 sm:px-6 py-16 md:py-24 relative z-10 w-full overflow-hidden">
                <div className="border-b border-black/10 pb-6 mb-10 md:mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
                  <h2 className="font-display text-3xl sm:text-4xl md:text-6xl font-bold uppercase text-black tracking-tighter">
                    Brands we are <span className="font-serif italic font-normal text-black/60 lowercase">working with</span>
                  </h2>
                </div>

                <style>{`
                  @keyframes marquee {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-50%); }
                  }
                  .animate-marquee {
                    animation: marquee 25s linear infinite;
                    display: flex;
                    width: max-content;
                  }
                  .animate-marquee:hover {
                    animation-play-state: paused;
                  }
                `}</style>
                <div className="w-full overflow-hidden relative">
                  {/* Fade masks for edges */}
                  <div className="absolute top-0 left-0 w-16 md:w-32 h-full bg-gradient-to-r from-white to-transparent z-10 pointer-events-none"></div>
                  <div className="absolute top-0 right-0 w-16 md:w-32 h-full bg-gradient-to-l from-white to-transparent z-10 pointer-events-none"></div>
                  
                  <div className="animate-marquee gap-4 pr-4">
                    {/* Double the array for seamless infinite scroll */}
                    {[...clients, ...clients].map((client, idx) => {
                      const icons = [<Sun className="w-8 h-8 lg:w-8 lg:h-8" />, <Hexagon className="w-8 h-8 lg:w-8 lg:h-8" />, <Zap className="w-8 h-8 lg:w-8 lg:h-8" />, <Laptop className="w-8 h-8 lg:w-8 lg:h-8" />, <LayoutGrid className="w-8 h-8 lg:w-8 lg:h-8" />];
                      const ClientIcon = icons[idx % icons.length];
                      return (
                      <div 
                        key={`${client.id || idx}-${idx}`} 
                        onClick={() => setSelectedBrand(client)}
                        className="cursor-pointer shrink-0 group transition-transform duration-500 hover:scale-[1.05]"
                      >
                        {client.logoImage ? (
                          <img src={client.logoImage} alt={client.name} className="h-28 md:h-40 w-auto object-contain" />
                        ) : (
                          <div className="bg-[#f7f7f7] border border-black/5 flex items-center justify-center px-10 h-28 md:h-40 group-hover:bg-gray-100 transition-colors">
                            <span className="font-black font-display tracking-tighter text-3xl md:text-4xl text-black/40 group-hover:text-black/80 transition-colors uppercase truncate">{client.logo}</span>
                          </div>
                        )}
                      </div>
                    )})}
                  </div>
                </div>
              </section>

              {/* LANDING SECTION 5.5: LIVE STATS */}
              <section id="live-stats-section" className="bg-[#fcfcfc] border-y border-black/10 py-12 md:py-20 relative z-10 w-full overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6">
                  <div className="text-center mb-10 md:mb-16">
                    <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold uppercase text-black tracking-tighter">
                      By The <span className="font-serif italic font-normal text-black/40 lowercase">Numbers</span>
                    </h2>
                    <p className="font-mono text-xs text-black/40 mt-4 uppercase tracking-widest">Live Operations Graph</p>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 md:gap-6">
                    
                    {/* Brands Stat */}
                    <div className="bg-white rounded-3xl shadow-[0_10px_30px_-10px_rgba(0,0,0,0.08)] p-4 sm:p-6 flex flex-col items-center justify-center text-center group hover:-translate-y-1 transition-transform duration-500">
                       <div className="relative w-20 h-20 sm:w-24 sm:h-24 flex items-center justify-center mb-4">
                          <svg className="w-full h-full transform -rotate-90 absolute inset-0" viewBox="0 0 96 96">
                             <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="5" fill="transparent" className="text-emerald-500/10" />
                             <motion.circle 
                                cx="48" cy="48" r="40" 
                                stroke="currentColor" 
                                strokeWidth="5" 
                                fill="transparent" 
                                strokeDasharray={2 * Math.PI * 40}
                                initial={{ strokeDashoffset: 2 * Math.PI * 40 }}
                                whileInView={{ strokeDashoffset: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 1.5, ease: "easeOut" }}
                                className="text-emerald-500 drop-shadow-[0_0_6px_rgba(16,185,129,0.4)]" 
                                strokeLinecap="round"
                             />
                          </svg>
                          <div className="flex flex-col items-center absolute inset-0 justify-center">
                            <span className="font-display text-xl sm:text-2xl font-bold text-black"><AnimatedCounter value={clients.length} /></span>
                          </div>
                       </div>
                       <h3 className="font-sans text-[10px] sm:text-xs font-bold text-black uppercase tracking-tight line-clamp-1 w-full">Total Brands</h3>
                       <p className="font-mono text-[8px] sm:text-[9px] text-black/40 uppercase mt-1">Partnerships</p>
                    </div>

                    {/* Services Stats */}
                    {services.map((service, idx) => {
                       const count = service.subsections?.length || 0;
                       const maxCount = Math.max(...services.map(s => s.subsections?.length || 0), 1);
                       const percent = Math.max((count / maxCount) * 100, 5); // at least 5% so it's visible
                       
                       const radius = 40;
                       const circumference = 2 * Math.PI * radius;
                       const offset = circumference - (percent / 100) * circumference;

                       const colors = ['text-pink-500', 'text-blue-500', 'text-purple-500', 'text-orange-500', 'text-cyan-500'];
                       const bgColors = ['text-pink-500/10', 'text-blue-500/10', 'text-purple-500/10', 'text-orange-500/10', 'text-cyan-500/10'];
                       const dropShadows = ['drop-shadow-[0_0_6px_rgba(236,72,153,0.4)]', 'drop-shadow-[0_0_6px_rgba(59,130,246,0.4)]', 'drop-shadow-[0_0_6px_rgba(168,85,247,0.4)]', 'drop-shadow-[0_0_6px_rgba(249,115,22,0.4)]', 'drop-shadow-[0_0_6px_rgba(6,182,212,0.4)]'];
                       
                       const activeColor = colors[idx % colors.length];
                       const activeBgColor = bgColors[idx % bgColors.length];
                       const activeDropShadow = dropShadows[idx % dropShadows.length];

                       return (
                        <div key={service.id} className="bg-white rounded-3xl shadow-[0_10px_30px_-10px_rgba(0,0,0,0.08)] p-4 sm:p-6 flex flex-col items-center justify-center text-center group hover:-translate-y-1 transition-transform duration-500">
                           <div className="relative w-20 h-20 sm:w-24 sm:h-24 flex items-center justify-center mb-4">
                              <svg className="w-full h-full transform -rotate-90 absolute inset-0" viewBox="0 0 96 96">
                                 <circle cx="48" cy="48" r={radius} stroke="currentColor" strokeWidth="5" fill="transparent" className={activeBgColor} />
                                 <motion.circle 
                                    cx="48" cy="48" r={radius} 
                                    stroke="currentColor" 
                                    strokeWidth="5" 
                                    fill="transparent" 
                                    strokeDasharray={circumference}
                                    initial={{ strokeDashoffset: circumference }}
                                    whileInView={{ strokeDashoffset: offset }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 1.5, ease: "easeOut", delay: idx * 0.1 }}
                                    className={`${activeColor} ${activeDropShadow}`} 
                                    strokeLinecap="round"
                                 />
                              </svg>
                              <div className="flex flex-col items-center absolute inset-0 justify-center">
                                <span className="font-display text-xl sm:text-2xl font-bold text-black"><AnimatedCounter value={count} /></span>
                              </div>
                           </div>
                           <h3 className="font-sans text-[10px] sm:text-xs font-bold text-black uppercase tracking-tight line-clamp-1 w-full">{service.name}</h3>
                           <p className="font-mono text-[8px] sm:text-[9px] text-black/40 uppercase mt-1">Total Delivered</p>
                        </div>
                       )
                    })}
                  </div>
                </div>
              </section>

              {/* LANDING SECTION 6: CONTACT FORM */}
              <section id="collaboration-contact-form" className="bg-[#0a0a0a] border-t border-white/5 py-12 md:pt-24 md:pb-12 scroll-mt-24 relative z-10 w-full overflow-hidden">
                <div className="max-w-7xl mx-auto px-0 sm:px-6">
                  <div className="bg-[#f2f2f2] rounded-none sm:rounded-none p-4 sm:p-8 lg:p-12 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-[#e8e8e8] rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
                    <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#e8e8e8] rounded-full blur-3xl translate-y-1/3 -translate-x-1/3"></div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 relative z-10">
                    
                    {/* Left side text info details */}
                    <div className="lg:col-span-5 flex flex-col gap-6 px-2 sm:px-0">
                      <div>
                        <h2 className="font-display text-4xl sm:text-5xl lg:text-[5rem] font-bold uppercase text-black tracking-tighter leading-[0.85] mb-4">
                          Get In <br />
                          <span className="font-serif italic font-normal text-black/60 lowercase">Touch</span>
                        </h2>

                        <div className="flex items-center gap-3 mb-4">
                          <a href="https://www.instagram.com/creo_studio_26" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-none bg-black/5 hover:bg-black hover:text-white text-black/60 transition-colors flex items-center justify-center" title="Instagram">
                            <Instagram className="w-4 h-4" />
                          </a>
                          <a href="https://www.threads.net/@creo_studio_26" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-none bg-black/5 hover:bg-black hover:text-white text-black/60 transition-colors flex items-center justify-center" title="Threads">
                            <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
                              <path d="M12.02 2C6.49 2 2.02 6.47 2.02 12c0 5.53 4.47 10 10 10 1.95 0 3.78-.56 5.33-1.52.47-.29.56-.91.19-1.31-.32-.35-.85-.39-1.24-.13a7.925 7.925 0 0 1-4.28 1.16c-4.41 0-8-3.59-8-8s3.59-8 8-8c4.27 0 7.78 3.36 7.99 7.6-.08-.05-.17-.11-.26-.16-.94-.52-2.02-.79-3.13-.79-3.48 0-6.31 2.83-6.31 6.31s2.83 6.31 6.31 6.31c2.19 0 4.14-1.12 5.29-2.85.73-1.1 1.11-2.42 1.11-3.83-.02-5.41-4.4-9.8-9.8-9.8zm3.2 13.91c-.72 1.08-1.95 1.79-3.32 1.79-2.21 0-4-1.79-4-4s1.79-4 4-4c1.19 0 2.26.52 3 1.35v4.86z"/>
                            </svg>
                          </a>
                          <a href="https://pin.it/2xPFnkZ43" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-none bg-black/5 hover:bg-black hover:text-white text-black/60 transition-colors flex items-center justify-center" title="Pinterest">
                            <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
                              <path d="M12.289 2C6.617 2 2 6.617 2 12.289c0 4.34 2.686 8.052 6.513 9.58-.093-.812-.176-2.062.037-2.951.192-.802 1.24-5.264 1.24-5.264s-.317-.633-.317-1.567c0-1.47.851-2.564 1.902-2.564.9 0 1.333.675 1.333 1.482 0 .903-.575 2.253-.872 3.504-.247 1.05.528 1.905 1.561 1.905 1.874 0 3.314-1.977 3.314-4.832 0-2.527-1.815-4.293-4.407-4.293-3.003 0-4.767 2.253-4.767 4.58 0 .908.35 1.882.788 2.413a.36.36 0 0 1 .083.344c-.086.357-.278 1.134-.316 1.291-.05.207-.164.25-.378.15-1.408-.656-2.288-2.716-2.288-4.375 0-3.562 2.59-6.83 7.458-6.83 3.916 0 6.957 2.79 6.957 6.518 0 3.89-2.451 7.02-5.852 7.02-1.143 0-2.217-.593-2.585-1.294 0 0-.565 2.152-.703 2.68-.255.978-.946 2.203-1.407 2.954a10.323 10.323 0 0 0 2.934.426c5.672 0 10.289-4.617 10.289-10.289C22.578 6.617 17.96 2 12.289 2z"/>
                            </svg>
                          </a>
                        </div>
                        
                        <p className="text-sm text-black/60 leading-relaxed font-sans max-w-sm">
                          We respond within 2 hours to confirm your project specs. Let's build your creative campaign under 2-day delivery guidelines.
                        </p>
                      </div>

                      <div className="space-y-4 font-mono text-xs text-black/60 pt-5 border-t border-black/10">
                        <div>
                          <div className="text-black/40 text-[10px] mb-1">DIRECTOR</div>
                          <span className="text-black font-semibold">Harsh Agrawal</span>
                        </div>
                        <div>
                          <div className="text-black/40 text-[10px] mb-1">EMAIL DIRECTORY</div>
                          <a href="mailto:Harsh.da.ind@gmail.com" className="text-black hover:underline cursor-pointer">Harsh.da.ind@gmail.com</a>
                        </div>
                        <div>
                          <div className="text-black/40 text-[10px] mb-1">OPERATIONS DESK</div>
                          <a href="tel:+919785983564" className="text-black hover:underline cursor-pointer">+91 9785983564</a>
                        </div>
                        <div>
                          <div className="text-black/40 text-[10px] mb-1">GLOBAL TIMEZONE</div>
                          <span className="text-black">UTC+5:30 Active Compilation</span>
                        </div>
                      </div>
                    </div>

                    {/* Right side form */}
                    <div className="lg:col-span-7">
                      
                      {formSubmitted ? (
                        <div className="bg-white/80 backdrop-blur border border-black/5 rounded-none h-full p-12 flex flex-col items-center justify-center text-center font-sans shadow-xl">
                          <CheckCircle2 className="w-16 h-16 text-emerald-500 mb-6" />
                          <h4 className="font-display text-3xl font-bold uppercase tracking-tight text-black mb-4">Inquiry Deployed</h4>
                          <p className="text-sm text-black/60 max-w-md">
                            Your lead details have compiled successfully. We will be in touch shortly.
                          </p>
                        </div>
                      ) : (
                        <form onSubmit={handleContactSubmit} className="bg-white/60 backdrop-blur p-6 sm:p-8 rounded-none sm:rounded-none border border-black/5 shadow-lg space-y-6">
                          
                          {formErrorMsg && (
                            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-none text-sm font-sans mb-6">
                              Warning: {formErrorMsg}
                            </div>
                          )}

                          <div className="grid grid-cols-1 gap-6">
                            <div>
                              <label className="block text-xs font-mono uppercase text-black/50 mb-2">Business Name / Name *</label>
                              <input 
                                type="text"
                                value={formName}
                                onChange={(e) => setFormName(e.target.value)}
                                required
                                placeholder="Your Name"
                                className="w-full bg-white border border-black/10 rounded-none px-4 py-3 text-sm text-black focus:border-black focus:outline-none focus:ring-1 focus:ring-black placeholder:text-black/20 font-sans transition-all"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-mono uppercase text-black/50 mb-2">Email *</label>
                              <input 
                                type="email"
                                value={formEmail}
                                onChange={(e) => setFormEmail(e.target.value)}
                                required
                                placeholder="Your Email"
                                className="w-full bg-white border border-black/10 rounded-none px-4 py-3 text-sm text-black focus:border-black focus:outline-none focus:ring-1 focus:ring-black placeholder:text-black/20 font-sans transition-all"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-xs font-mono uppercase text-black/50 mb-2">Service</label>
                            <input 
                              type="text"
                              value={formService}
                              onChange={(e) => setFormService(e.target.value)}
                              placeholder="E.g., UI/UX Design, Development..."
                              className="w-full bg-white border border-black/10 rounded-none px-4 py-3 text-sm text-black focus:border-black focus:outline-none focus:ring-1 focus:ring-black placeholder:text-black/20 font-sans transition-all"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-mono uppercase text-black/50 mb-2">Message *</label>
                            <textarea 
                              value={formMessage}
                              onChange={(e) => setFormMessage(e.target.value)}
                              required
                              rows={4}
                              placeholder="Tell us about your project..."
                              className="w-full bg-white border border-black/10 rounded-none px-4 py-3 text-sm text-black focus:border-black focus:outline-none focus:ring-1 focus:ring-black placeholder:text-black/20 font-sans transition-all resize-none"
                            />
                          </div>

                          <button 
                            type="submit"
                            id="btn-submit-contact-landing"
                            className="w-full bg-black hover:bg-neutral-800 text-white py-4 mt-6 rounded-none font-sans text-sm font-bold uppercase tracking-widest cursor-pointer transition-colors duration-300 flex items-center justify-center gap-2 shadow-sm"
                          >
                            <span>Send Message</span>
                            <Send className="w-4 h-4 ml-1" />
                          </button>
                        </form>
                      )}
                    </div>
                  </div>
                </div>
                </div>
              </section>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* FOOTER SECTION */}
      {route.path !== 'admin' && (
        <footer className="w-full flex flex-col z-10 relative mt-0">
          <div className="bg-[#f7f7f7] py-8 sm:py-10 w-full">
            <div className="max-w-7xl mx-auto px-6 flex flex-col lg:flex-row justify-between items-start gap-8 lg:gap-8">
              <div className="flex flex-col items-start max-w-sm">
                <div className="flex items-center justify-start relative w-max max-w-full lg:pl-0 mb-4">
                  <img src="/creo_studio_brand_2.png" alt="creoSTUDIO" className="h-10 xs:h-12 sm:h-16 lg:h-20 max-w-full object-contain" />
                  <span className="absolute top-0 -right-8 font-sans text-xl sm:text-2xl text-black">®</span>
                </div>
                                 <div className="font-mono text-[11px] text-black/60 space-y-2.5 mt-2">
                  <div className="flex items-center gap-2">
                    <span className="text-black/35 text-[9px] uppercase tracking-widest font-bold w-12">Email:</span>
                    <a href="mailto:Harsh.da.ind@gmail.com" className="text-black hover:text-[#007A93] transition-colors font-medium">Harsh.da.ind@gmail.com</a>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-black/35 text-[9px] uppercase tracking-widest font-bold w-12">Call:</span>
                    <a href="tel:+919785983564" className="text-black hover:text-[#007A93] transition-colors font-medium">+91 9785983564</a>
                  </div>
                </div>

                <div className="flex gap-4 mt-5 text-black/40">
                  <a href="https://www.instagram.com/creo_studio_26" target="_blank" rel="noopener noreferrer" className="hover:text-[#007A93] hover:scale-105 transition-all" title="Instagram"><Instagram className="w-4 h-4" /></a>
                  <a href="https://www.threads.net/@creo_studio_26" target="_blank" rel="noopener noreferrer" className="hover:text-[#007A93] hover:scale-105 transition-all" title="Threads">
                    <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
                      <path d="M12.02 2C6.49 2 2.02 6.47 2.02 12c0 5.53 4.47 10 10 10 1.95 0 3.78-.56 5.33-1.52.47-.29.56-.91.19-1.31-.32-.35-.85-.39-1.24-.13a7.925 7.925 0 0 1-4.28 1.16c-4.41 0-8-3.59-8-8s3.59-8 8-8c4.27 0 7.78 3.36 7.99 7.6-.08-.05-.17-.11-.26-.16-.94-.52-2.02-.79-3.13-.79-3.48 0-6.31 2.83-6.31 6.31s2.83 6.31 6.31 6.31c2.19 0 4.14-1.12 5.29-2.85.73-1.1 1.11-2.42 1.11-3.83-.02-5.41-4.4-9.8-9.8-9.8zm3.2 13.91c-.72 1.08-1.95 1.79-3.32 1.79-2.21 0-4-1.79-4-4s1.79-4 4-4c1.19 0 2.26.52 3 1.35v4.86z"/>
                    </svg>
                  </a>
                  <a href="https://pin.it/2xPFnkZ43" target="_blank" rel="noopener noreferrer" className="hover:text-[#007A93] hover:scale-105 transition-all" title="Pinterest">
                    <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
                      <path d="M12.289 2C6.617 2 2 6.617 2 12.289c0 4.34 2.686 8.052 6.513 9.58-.093-.812-.176-2.062.037-2.951.192-.802 1.24-5.264 1.24-5.264s-.317-.633-.317-1.567c0-1.47.851-2.564 1.902-2.564.9 0 1.333.675 1.333 1.482 0 .903-.575 2.253-.872 3.504-.247 1.05.528 1.905 1.561 1.905 1.874 0 3.314-1.977 3.314-4.832 0-2.527-1.815-4.293-4.407-4.293-3.003 0-4.767 2.253-4.767 4.58 0 .908.35 1.882.788 2.413a.36.36 0 0 1 .083.344c-.086.357-.278 1.134-.316 1.291-.05.207-.164.25-.378.15-1.408-.656-2.288-2.716-2.288-4.375 0-3.562 2.59-6.83 7.458-6.83 3.916 0 6.957 2.79 6.957 6.518 0 3.89-2.451 7.02-5.852 7.02-1.143 0-2.217-.593-2.585-1.294 0 0-.565 2.152-.703 2.68-.255.978-.946 2.203-1.407 2.954a10.323 10.323 0 0 0 2.934.426c5.672 0 10.289-4.617 10.289-10.289C22.578 6.617 17.96 2 12.289 2z"/>
                    </svg>
                  </a>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-x-12 sm:gap-x-16 gap-y-8 lg:pt-3">
                <div className="flex flex-col gap-3">
                  <span className="text-[10px] font-display uppercase tracking-widest text-black/40 font-bold mb-1">Studio</span>
                  <button onClick={() => {resetAllViewsAndScroll();}} className="font-mono text-[11px] uppercase tracking-wider text-black/70 hover:text-[#007A93] hover:translate-x-1 transition-all duration-200 text-left w-max">Home</button>
                  <button onClick={() => scrollToSection('#featured-work-section')} className="font-mono text-[11px] uppercase tracking-wider text-black/70 hover:text-[#007A93] hover:translate-x-1 transition-all duration-200 text-left w-max">Featured Work</button>
                  <button onClick={() => scrollToSection('#brands-section')} className="font-mono text-[11px] uppercase tracking-wider text-black/70 hover:text-[#007A93] hover:translate-x-1 transition-all duration-200 text-left w-max">About Studio</button>
                  <button onClick={() => scrollToSection('#collaboration-contact-form')} className="font-mono text-[11px] uppercase tracking-wider text-black/70 hover:text-[#007A93] hover:translate-x-1 transition-all duration-200 text-left w-max">Contact Us</button>
                </div>
                
                <div className="flex flex-col gap-3">
                  <span className="text-[10px] font-display uppercase tracking-widest text-black/40 font-bold mb-1">Services</span>
                  <button onClick={() => { navigateTo('service', 'ai-photo-shoot'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="font-mono text-[11px] uppercase tracking-wider text-black/70 hover:text-[#007A93] hover:translate-x-1 transition-all duration-200 text-left w-max">AI Photo Shoot</button>
                  <button onClick={() => { navigateTo('service', 'ai-video-shoot'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="font-mono text-[11px] uppercase tracking-wider text-black/70 hover:text-[#007A93] hover:translate-x-1 transition-all duration-200 text-left w-max">AI Video Shoot</button>
                  <button onClick={() => { navigateTo('service', 'automation'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="font-mono text-[11px] uppercase tracking-wider text-black/70 hover:text-[#007A93] hover:translate-x-1 transition-all duration-200 text-left w-max">Automation</button>
                  <button onClick={() => { navigateTo('service', 'website-design'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="font-mono text-[11px] uppercase tracking-wider text-black/70 hover:text-[#007A93] hover:translate-x-1 transition-all duration-200 text-left w-max">Web Design</button>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-[#0a0a0a] py-5 w-full border-t border-white/5">
            <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4 font-mono text-[10px] uppercase tracking-wider text-white/50">
              <div>
                © {new Date().getFullYear()} creoSTUDIO. All rights reserved.
              </div>
              <div className="flex items-center gap-2 text-white/30">
                <span>Visual intelligence console</span>
                <span>•</span>
                <span>v2.1.0</span>
              </div>
            </div>
          </div>
        </footer>
      )}

      {/* Brand Profile Details Modal Popup */}
      <AnimatePresence>
        {selectedBrand && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-black/75 backdrop-blur-md flex items-center justify-center p-4 md:p-8"
            onClick={() => setSelectedBrand(null)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="bg-[#f5f5f5] text-black border border-black/10 rounded-none w-full max-w-4xl max-h-[85vh] md:max-h-[75vh] flex flex-col overflow-hidden shadow-2xl relative"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedBrand(null)}
                className="absolute top-6 right-6 z-50 p-2 bg-neutral-100 hover:bg-black hover:text-white rounded-none text-black cursor-pointer transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Header Info */}
              <div className="p-6 md:p-8 border-b border-black/5 bg-[#eaeaea]">
                <div className="flex items-center gap-3 mb-2">
                  <span className="font-mono text-[10px] text-emerald-600 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-none uppercase tracking-wider font-bold">
                    Partner Brand
                  </span>
                  <span className="font-mono text-[10px] text-black/50 uppercase">
                    COLLAB // {selectedBrand.collaborationYear}
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  {selectedBrand.logoImage && (
                    <img src={selectedBrand.logoImage} alt={selectedBrand.name} className="h-10 md:h-14 w-auto object-contain shrink-0" />
                  )}
                  <div>
                    <h3 className="font-display text-2xl md:text-4xl font-bold uppercase tracking-tight text-black">
                      {selectedBrand.name}
                    </h3>
                    <p className="text-xs md:text-sm font-sans text-black/60 mt-1">
                      Industry sector: <span className="font-semibold text-black">{selectedBrand.industry}</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Scrollable Brand Work Gallery */}
              <div className="flex-1 overflow-y-auto min-h-0">
                <div className="p-4 md:p-6 space-y-3">
                  <h4 className="font-mono text-xs font-bold uppercase tracking-widest text-[#007A93] border-b border-neutral-100 pb-3">
                    Delivered Campaign Deliverables
                  </h4>

                {(() => {
                  const brandNameLower = selectedBrand.name.toLowerCase();
                  const groupedWorks: { serviceName: string; works: any[] }[] = [];
                  
                  services.forEach(service => {
                    const matchingWorks = service.subsections.filter(sub => 
                      sub.brandName?.toLowerCase() === brandNameLower
                    );
                    if (matchingWorks.length > 0) {
                      groupedWorks.push({ serviceName: service.name, works: matchingWorks });
                    }
                  });

                  const hasLegacyWorks = selectedBrand.workItems && selectedBrand.workItems.length > 0;
                  const hasDynamicWorks = groupedWorks.length > 0;

                  if (!hasLegacyWorks && !hasDynamicWorks) {
                    return (
                      <div className="text-center py-16 border border-dashed border-black/10 rounded-none bg-neutral-50/50">
                        <span className="font-sans text-sm text-black/40 block">Campaign assets are currently secure and under confidentiality SLA guidelines.</span>
                      </div>
                    );
                  }

                  return (
                    <div className="space-y-4">
                      {hasLegacyWorks && (
                        <div className="flex flex-wrap gap-3 md:gap-4">
                          {selectedBrand.workItems!.map((item) => (
                            <div key={item.id} className="w-36 md:w-44 shrink-0 border border-neutral-100 bg-neutral-50/30 rounded-none p-2 flex flex-col justify-start shadow-sm relative overflow-hidden">
                              <div>
                                <div className="flex justify-between items-center mb-2">
                                  <span className="font-mono text-[9px] text-black/40 uppercase bg-black/5 px-2 py-0.5 rounded-none font-bold">
                                    {item.type}
                                  </span>
                                </div>
                                
                                {item.title && (
                                  <h5 className="font-display text-xs font-bold text-black uppercase mb-1 line-clamp-1">
                                    {item.title}
                                  </h5>
                                )}

                                {item.text && (
                                  <p className="text-[10px] font-sans text-black/60 leading-relaxed line-clamp-2">
                                    {item.text}
                                  </p>
                                )}
                              </div>

                              {item.url && (
                                <div className="mt-2 rounded-none overflow-hidden h-24 md:h-28 bg-transparent flex items-center justify-center relative">
                                  {item.type === 'video' ? (
                                    <video src={item.url} className="w-full h-full object-contain" controls playsInline />
                                  ) : (
                                    <img src={item.url} alt={item.title || "Brand Work"} className="w-full h-full object-contain" />
                                  )}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      {hasDynamicWorks && (
                        <div className="flex overflow-x-auto gap-4 md:gap-6 pb-4 snap-x snap-mandatory hide-scrollbar" style={{WebkitOverflowScrolling: 'touch'}}>
                          {groupedWorks.map((group, gIdx) => (
                            <div key={gIdx} className={`shrink-0 snap-start space-y-3 ${groupedWorks.length === 1 ? 'w-full' : 'w-[90%] md:w-[65%]'}`}>
                              <h5 className="font-mono text-[10px] font-bold uppercase tracking-widest text-black/60 bg-black/5 inline-block px-3 py-1.5 border border-black/10">
                                {group.serviceName}
                              </h5>
                              <div className="flex flex-wrap gap-3 md:gap-4">
                                {group.works.map((item, idx) => {
                                   const targetService = services.find(s => s.name === group.serviceName);
                                   return (
                                   <div 
                                     key={idx} 
                                     onClick={() => {
                                       if (targetService) {
                                         setServiceParams({ subId: item.id, brand: selectedBrand.name });
                                         setSelectedBrand(null);
                                         navigateTo('service', targetService.id);
                                       }
                                     }}
                                     className="w-36 md:w-44 shrink-0 border border-neutral-100 bg-neutral-50/30 rounded-none p-2 flex flex-col justify-start shadow-sm relative overflow-hidden group cursor-pointer hover:border-[#007A93]/30 transition-colors">
                                     <div>
                                       <div className="flex justify-between items-center mb-1.5">
                                         <span className="font-mono text-[9px] text-[#007A93] uppercase bg-[#007A93]/10 px-1.5 py-0.5 rounded-none font-bold">
                                           {item.visualType}
                                         </span>
                                       </div>
                                       <h5 className="font-display text-[10px] sm:text-xs font-bold text-black uppercase mb-0 line-clamp-2 leading-tight">
                                         {item.title}
                                       </h5>
                                     </div>
                                     <div className="mt-2 rounded-none overflow-hidden h-20 md:h-24 bg-transparent relative flex items-center justify-center">
                                       {item.visualType === 'video' ? (
                                         <video src={item.visualUrl} className="w-full h-full object-contain" controls playsInline />
                                       ) : (
                                         <img src={item.visualUrl} alt={item.title} className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-700" />
                                       )}
                                     </div>
                                   </div>
                                   );
                                })}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })()}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
