import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Instagram, AtSign, ArrowRight } from 'lucide-react';

interface HeaderProps {
  activeServiceId: string | null;
  resetAllViews: () => void;
  scrollToSection: (selector: string) => void;
}

export default function Header({
  activeServiceId,
  resetAllViews,
  scrollToSection,
}: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  // Disable body scroll when menu is open
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [menuOpen]);

  const handleMenuClick = (selector?: string, isReviewRoute?: boolean) => {
    setMenuOpen(false);
    if (isReviewRoute) {
      window.location.hash = '#/review';
    } else if (selector) {
      // If we are currently on the review page, we should go back to home first before scrolling
      if (window.location.hash.includes('#/review')) {
        window.location.hash = '';
        setTimeout(() => scrollToSection(selector), 100);
      } else {
        scrollToSection(selector);
      }
    }
  };

  const menuItems = [
    { num: '01', label: 'WORKS', action: () => handleMenuClick('#featured-work-section') },
    { num: '02', label: 'SERVICES', action: () => handleMenuClick('#services-index-section') },
    { num: '03', label: 'ABOUT', action: () => handleMenuClick('#brands-section') },
    { num: '04', label: 'REVIEWS', action: () => handleMenuClick(undefined, true) },
    { num: '05', label: 'CONTACT', action: () => handleMenuClick('#collaboration-contact-form') },
  ];

  const [isDarkBg, setIsDarkBg] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (menuOpen) return;
      setIsScrolled(window.scrollY > 20);
      
      const darkSections = document.querySelectorAll('.dark-section');
      let isDark = false;
      darkSections.forEach(section => {
        const rect = section.getBoundingClientRect();
        // Header is roughly 50px tall at the top
        if (rect.top <= 50 && rect.bottom >= 20) {
          isDark = true;
        }
      });
      setIsDarkBg(isDark);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll, { passive: true });
    handleScroll();
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, [menuOpen]);

  return (
    <>
      <header 
        id="main-app-header"
        className={`fixed top-0 left-0 w-full z-[100] px-6 py-4 flex items-center justify-between pointer-events-none transition-colors duration-300 ${isScrolled ? (isDarkBg ? 'bg-[#0a0a0a]/90 backdrop-blur-md' : 'bg-[#f7f7f7]/90 backdrop-blur-md shadow-sm') : ''}`}
      >
        {/* Brand Logo */}
        <button 
          id="btn-brand-home"
          onClick={() => {
            setMenuOpen(false);
            resetAllViews();
            window.location.hash = '';
          }}
          className={`flex items-center text-left focus:outline-none group relative pointer-events-auto transition-all duration-300 ${menuOpen || isDarkBg ? 'invert drop-shadow-lg' : ''}`}
        >
          <img src="/creo_studio_brand_2.png" alt="creoSTUDIO" className="h-6 sm:h-8" />
        </button>

        {/* Action buttons (Right Side) */}
        <div className={`flex items-center gap-4 pointer-events-auto transition-colors duration-300`}>
          {/* Social Icons */}
          <motion.div 
            className={`hidden md:flex items-center gap-3 md:gap-4 mr-0 md:mr-2 pr-2 md:pr-4 ${(menuOpen || isDarkBg) ? 'text-[#F8F6F1]/80 border-white/20' : 'text-black/40 border-black/10'} border-r transition-colors duration-300`}
          >
            <a href="https://www.instagram.com/creo_studio_26" target="_blank" rel="noopener noreferrer" className={`hover:scale-110 transition-all ${(menuOpen || isDarkBg) ? 'hover:text-white' : 'hover:text-black'}`} aria-label="Instagram">
              <Instagram className="w-4 h-4 md:w-5 md:h-5" />
            </a>
            <a href="https://www.threads.net/@creo_studio_26" target="_blank" rel="noopener noreferrer" className={`hover:scale-110 transition-all ${(menuOpen || isDarkBg) ? 'hover:text-white' : 'hover:text-black'}`} aria-label="Threads">
              <AtSign className="w-4 h-4 md:w-5 md:h-5" />
            </a>
            <a href="https://pin.it/2xPFnkZ43" target="_blank" rel="noopener noreferrer" className={`hover:scale-110 transition-all hover:text-[#E60023]`} aria-label="Pinterest">
              <svg className="w-4 h-4 md:w-5 md:h-5 fill-current" viewBox="0 0 24 24">
                <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.401.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.951-7.252 4.163 0 7.398 2.967 7.398 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.354-.629-2.758-1.379l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.55.535 6.607 0 11.985-5.365 11.985-11.987C23.97 5.366 18.622 0 12.017 0z"/>
              </svg>
            </a>
            <a href="https://wa.me/919785983564?text=I%20want%20to%20use%20your%20CREOSTUDIO%20services" target="_blank" rel="noopener noreferrer" className={`hover:scale-110 transition-all hover:text-[#25D366]`} aria-label="WhatsApp">
              <svg className="w-4 h-4 md:w-5 md:h-5 fill-current" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
            </a>
          </motion.div>

          <button 
            onClick={() => setMenuOpen(!menuOpen)}
            className="relative overflow-hidden h-6 w-16 focus:outline-none flex flex-col justify-start items-start"
          >
            <motion.div 
              initial={false}
              animate={{ y: menuOpen ? '-50%' : '0%' }}
              transition={{ duration: 0.6, ease: [0.76, 0, 0.24, 1] }}
              className="w-full flex flex-col items-center"
            >
              <span className={`h-6 flex items-center justify-center font-sans font-bold text-xs tracking-widest transition-colors duration-300 ${(menuOpen || isDarkBg) ? 'text-[#F8F6F1]' : 'text-black'}`}>
                MENU
              </span>
              <span className="h-6 flex items-center justify-center font-sans font-bold text-xs tracking-widest text-[#F8F6F1]">
                CLOSE
              </span>
            </motion.div>
          </button>
        </div>
      </header>

      {/* Full Screen Menu Overlay */}
      <AnimatePresence mode="wait">
        {menuOpen && (
          <>
            {/* Dimmer */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6 }}
              className="fixed inset-0 bg-black/40 z-[80]"
              onClick={() => setMenuOpen(false)}
            />

            {/* Menu Panel */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: '0%' }}
              exit={{ y: '-100%' }}
              transition={{ duration: 0.7, ease: [0.76, 0, 0.24, 1] }}
              className="fixed inset-0 bg-[#0D0D0D] z-[90] flex flex-col justify-center text-[#F8F6F1] overflow-y-auto"
            >
              <div className="w-full max-w-7xl mx-auto px-6 lg:px-12 min-h-full flex flex-col pt-24 pb-8">
                  <motion.div 
                    initial={{ y: '20%' }}
                    animate={{ y: '0%' }}
                    exit={{ y: '-20%' }}
                    transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
                    className="flex-1 flex flex-col justify-center my-auto"
                  >
                    <nav className="w-full">
                    {menuItems.map((item, index) => (
                      <div key={item.label} className="relative group overflow-hidden">
                        <motion.div 
                          initial={{ scaleX: 0 }}
                          animate={{ scaleX: 1 }}
                          exit={{ scaleX: 0 }}
                          transition={{ duration: 0.8, delay: index * 0.1, ease: [0.76, 0, 0.24, 1] }}
                          className="w-full h-px bg-[#F8F6F1]/20 origin-left"
                        />

                        <button 
                          onClick={item.action}
                          className="w-full flex items-baseline justify-between py-1.5 sm:py-2 md:py-3 text-left hover:text-white transition-colors focus:outline-none"
                        >
                          <div className="overflow-hidden">
                            <motion.span 
                              initial={{ y: '100%', opacity: 0 }}
                              animate={{ y: '0%', opacity: 1 }}
                              exit={{ y: '-100%', opacity: 0 }}
                              transition={{ duration: 0.6, delay: 0.1 + (index * 0.1), ease: [0.76, 0, 0.24, 1] }}
                              className="inline-block text-[10px] sm:text-xs font-sans font-medium tracking-widest text-[#F8F6F1]/50 w-8 sm:w-16"
                            >
                              {item.num}
                            </motion.span>
                          </div>
                          <div className="overflow-hidden flex-1 text-right">
                            <motion.span 
                              initial={{ y: '120%', opacity: 0 }}
                              animate={{ y: '0%', opacity: 1 }}
                              exit={{ y: '-100%', opacity: 0 }}
                              transition={{ duration: 0.7, delay: 0.15 + (index * 0.1), ease: [0.76, 0, 0.24, 1] }}
                              className="inline-block font-serif text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-light uppercase tracking-tight leading-none"
                            >
                              {item.label}
                            </motion.span>
                          </div>
                        </button>
                      </div>
                    ))}
                    <motion.div 
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      exit={{ scaleX: 0 }}
                      transition={{ duration: 0.8, delay: menuItems.length * 0.1, ease: [0.76, 0, 0.24, 1] }}
                      className="w-full h-px bg-[#F8F6F1]/20 origin-left"
                    />
                  </nav>
                </motion.div>

                {/* Footer Section */}
                <div className="mt-8 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 overflow-hidden">
                  <motion.div
                    initial={{ y: '100%', opacity: 0 }}
                    animate={{ y: '0%', opacity: 1 }}
                    exit={{ y: '-100%', opacity: 0 }}
                    transition={{ duration: 0.6, delay: 0.6, ease: [0.76, 0, 0.24, 1] }}
                  >
                    <p className="text-[10px] sm:text-xs font-sans tracking-widest text-[#F8F6F1]/50 uppercase">
                      © 2026 CREO STUDIO
                    </p>
                  </motion.div>

                  <motion.div
                    initial={{ y: '100%', opacity: 0 }}
                    animate={{ y: '0%', opacity: 1 }}
                    exit={{ y: '-100%', opacity: 0 }}
                    transition={{ duration: 0.6, delay: 0.7, ease: [0.76, 0, 0.24, 1] }}
                    className="flex flex-wrap items-center gap-4 sm:gap-6 md:gap-8"
                  >
                    <a 
                      href="https://www.instagram.com/creo_studio_26" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-white/60 hover:text-white hover:scale-110 transition-all flex items-center gap-2"
                    >
                      <Instagram className="w-4 h-4" />
                      <span className="text-[10px] sm:text-xs font-sans font-bold tracking-widest uppercase">Instagram</span>
                    </a>
                    <a 
                      href="https://www.threads.net/@creo_studio_26" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-white/60 hover:text-white hover:scale-110 transition-all flex items-center gap-2"
                    >
                      <AtSign className="w-4 h-4" />
                      <span className="text-[10px] sm:text-xs font-sans font-bold tracking-widest uppercase">Threads</span>
                    </a>
                    <a 
                      href="https://pin.it/2xPFnkZ43" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-white/60 hover:text-[#E60023] hover:scale-110 transition-all flex items-center gap-2"
                    >
                      <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                        <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.401.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.951-7.252 4.163 0 7.398 2.967 7.398 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.354-.629-2.758-1.379l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.55.535 6.607 0 11.985-5.365 11.985-11.987C23.97 5.366 18.622 0 12.017 0z"/>
                      </svg>
                      <span className="text-[10px] sm:text-xs font-sans font-bold tracking-widest uppercase">Pinterest</span>
                    </a>
                    <a 
                      href="https://wa.me/919785983564?text=I%20want%20to%20use%20your%20CREOSTUDIO%20services" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-white/60 hover:text-[#25D366] hover:scale-110 transition-all flex items-center gap-2"
                    >
                      <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                      </svg>
                      <span className="text-[10px] sm:text-xs font-sans font-bold tracking-widest uppercase">WhatsApp</span>
                    </a>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
