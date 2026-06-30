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

