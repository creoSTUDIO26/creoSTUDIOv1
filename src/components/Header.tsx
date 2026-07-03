import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, X, Instagram, AtSign, ArrowRight } from 'lucide-react';

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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleMobileScroll = (selector: string) => {
    setMobileMenuOpen(false);
    scrollToSection(selector);
  };

  const handleMobileBack = () => {
    setMobileMenuOpen(false);
    resetAllViews();
  };

  return (
    <header 
      id="main-app-header"
      className="sticky top-0 z-50 w-full bg-[#f7f7f7]/90 backdrop-blur-md border-b border-black/5 px-6 py-4"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand Logo */}
        <button 
          id="btn-brand-home"
          onClick={() => {
            setMobileMenuOpen(false);
            resetAllViews();
          }}
          className="flex items-center text-left focus:outline-none group z-50 relative"
        >
          <img src="/creo_studio_brand_2.png" alt="creoSTUDIO" className="h-6 sm:h-8" />
        </button>

        {/* Navigation Elements */}
        {!activeServiceId ? (
          <nav id="nav-desktop-links" className="hidden md:flex flex-1 justify-center items-center gap-10 text-xs font-sans font-semibold tracking-widest uppercase mt-2">
            <button 
              id="link-nav-projects"
              onClick={() => scrollToSection('#featured-work-section')}
              className="text-black/60 hover:text-black transition-colors cursor-pointer"
            >
              Work
            </button>
            <button 
              id="link-nav-services"
              onClick={() => scrollToSection('#services-index-section')}
              className="text-black/60 hover:text-black transition-colors cursor-pointer"
            >
              Services
            </button>
            <button 
              id="link-nav-testimonials"
              onClick={() => scrollToSection('#brands-section')}
              className="text-black/60 hover:text-black transition-colors cursor-pointer"
            >
              About
            </button>
            <a 
              href="#/review"
              className="text-black/60 hover:text-black transition-colors cursor-pointer"
            >
              Reviews
            </a>
          </nav>
        ) : (
          <div className="hidden md:flex flex-1 justify-center items-center gap-3 mt-2">
            <button 
              id="btn-nav-return-showcase"
              onClick={resetAllViews}
              className="text-xs font-sans font-semibold uppercase text-black/60 hover:text-black transition-all"
            >
              ← Back to Showcase
            </button>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex items-center gap-4 mt-2 z-50 relative">
          {/* Desktop Social Icons */}
          <div className="hidden lg:flex items-center gap-3 md:gap-4 mr-0 md:mr-2 border-r border-black/10 pr-4 md:pr-6">
            <a href="https://www.instagram.com/creo_studio_26" target="_blank" rel="noopener noreferrer" className="text-black/40 hover:text-black hover:scale-110 transition-all" aria-label="Instagram">
              <Instagram className="w-4 h-4" />
            </a>
            <a href="https://www.threads.net/@creo_studio_26" target="_blank" rel="noopener noreferrer" className="text-black/40 hover:text-black hover:scale-110 transition-all" aria-label="Threads">
              <AtSign className="w-4 h-4" />
            </a>
            <a href="https://pin.it/2xPFnkZ43" target="_blank" rel="noopener noreferrer" className="text-black/40 hover:text-[#E60023] hover:scale-110 transition-all" aria-label="Pinterest">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.401.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.951-7.252 4.163 0 7.398 2.967 7.398 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.354-.629-2.758-1.379l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.55.535 6.607 0 11.985-5.365 11.985-11.987C23.97 5.366 18.622 0 12.017 0z"/>
              </svg>
            </a>
            <a href="https://wa.me/919785983564?text=I%20want%20to%20use%20your%20CREOSTUDIO%20services" target="_blank" rel="noopener noreferrer" className="text-black/40 hover:text-[#25D366] hover:scale-110 transition-all" aria-label="WhatsApp">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
              </svg>
            </a>
          </div>

          <button 
            id="link-nav-contact"
            onClick={() => scrollToSection('#collaboration-contact-form')}
            className="bg-black text-white px-5 py-2.5 rounded-none text-xs font-semibold hover:bg-neutral-800 transition-colors shadow-sm hidden sm:block cursor-pointer tracking-wide"
          >
            Let's Talk
          </button>
          <button 
            className="text-black/80 hover:text-black transition-colors p-2 cursor-pointer md:hidden flex"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-[73px] sm:top-[85px] left-0 w-full h-[calc(100vh-73px)] bg-white shadow-xl pt-8 pb-12 px-8 flex flex-col z-[100] overflow-y-auto"
          >
            {!activeServiceId ? (
              <div className="flex flex-col gap-6 mt-4">
                <button onClick={() => handleMobileScroll('#featured-work-section')} className="text-left py-2 text-3xl font-display font-bold text-black flex justify-between items-center group">
                  Work <ArrowRight className="w-6 h-6 text-[#007A93] opacity-0 group-hover:opacity-100 transition-opacity transform group-hover:translate-x-2" />
                </button>
                <button onClick={() => handleMobileScroll('#services-index-section')} className="text-left py-2 text-3xl font-display font-bold text-black flex justify-between items-center group">
                  Services <ArrowRight className="w-6 h-6 text-[#007A93] opacity-0 group-hover:opacity-100 transition-opacity transform group-hover:translate-x-2" />
                </button>
                <button onClick={() => handleMobileScroll('#brands-section')} className="text-left py-2 text-3xl font-display font-bold text-black flex justify-between items-center group">
                  About <ArrowRight className="w-6 h-6 text-[#007A93] opacity-0 group-hover:opacity-100 transition-opacity transform group-hover:translate-x-2" />
                </button>
                <a href="#/review" onClick={() => setMobileMenuOpen(false)} className="text-left py-2 text-3xl font-display font-bold text-black flex justify-between items-center group">
                  Reviews <ArrowRight className="w-6 h-6 text-[#007A93] opacity-0 group-hover:opacity-100 transition-opacity transform group-hover:translate-x-2" />
                </a>
              </div>
            ) : (
              <button onClick={handleMobileBack} className="text-left py-4 text-lg font-sans font-semibold text-black/60 hover:text-black flex items-center gap-2">
                ← Back to Showcase
              </button>
            )}
            
            <div className="border-t border-black/10 pt-8 mt-auto flex flex-col gap-8">
              {/* Mobile Social Icons */}
              <div className="flex items-center gap-8 justify-center">
                <a href="https://www.instagram.com/creo_studio_26" target="_blank" rel="noopener noreferrer" className="text-black/40 hover:text-black hover:scale-110 transition-all p-2 bg-black/5 rounded-full">
                  <Instagram className="w-5 h-5" />
                </a>
                <a href="https://www.threads.net/@creo_studio_26" target="_blank" rel="noopener noreferrer" className="text-black/40 hover:text-black hover:scale-110 transition-all p-2 bg-black/5 rounded-full">
                  <AtSign className="w-5 h-5" />
                </a>
                <a href="https://pin.it/2xPFnkZ43" target="_blank" rel="noopener noreferrer" className="text-black/40 hover:text-[#E60023] hover:scale-110 transition-all p-2 bg-black/5 rounded-full">
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.401.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.951-7.252 4.163 0 7.398 2.967 7.398 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.354-.629-2.758-1.379l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.55.535 6.607 0 11.985-5.365 11.985-11.987C23.97 5.366 18.622 0 12.017 0z"/>
                  </svg>
                </a>
                <a href="https://wa.me/919785983564?text=I%20want%20to%20use%20your%20CREOSTUDIO%20services" target="_blank" rel="noopener noreferrer" className="text-black/40 hover:text-[#25D366] hover:scale-110 transition-all p-2 bg-black/5 rounded-full">
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                  </svg>
                </a>
              </div>

              <button 
                onClick={() => handleMobileScroll('#collaboration-contact-form')}
                className="bg-black text-white px-6 py-5 rounded-none text-xs font-bold w-full uppercase tracking-[0.2em] shadow-lg flex justify-center items-center gap-2"
              >
                Let's Talk <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

