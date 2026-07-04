import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface AnimatedHeroProps {
  slides: string[];
}

let hasSeenIntroGlobal = false;

export default function AnimatedHero({ slides }: AnimatedHeroProps) {
  const [hasSeenIntro] = useState(() => hasSeenIntroGlobal);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [showLogos, setShowLogos] = useState(hasSeenIntro);
  const [flashingDone, setFlashingDone] = useState(hasSeenIntro);
  const [progress, setProgress] = useState(hasSeenIntro ? 100 : 0);

  useEffect(() => {
    if (hasSeenIntro) return;

    if (slides.length === 0) {
      setFlashingDone(true);
      setShowLogos(true);
      return;
    }

    let intervalId: NodeJS.Timeout;
    let frame = 0;
    const totalFrames = 20; // Will loop slides for about 2.4 seconds
    
    // Fast flashing interval
    intervalId = setInterval(() => {
      frame++;
      if (frame < totalFrames) {
        setCurrentSlideIndex(frame % slides.length);
        setProgress(Math.round((frame / totalFrames) * 98));
      } else {
        setCurrentSlideIndex(frame % slides.length);
        setProgress(100);
        clearInterval(intervalId);
        // Wait a moment on the final image before transitioning
        setTimeout(() => {
          setFlashingDone(true);
          hasSeenIntroGlobal = true;
          setTimeout(() => setShowLogos(true), 100);
        }, 400);
      }
    }, 120); // 120ms per image

    return () => clearInterval(intervalId);
  }, [hasSeenIntro, slides.length]); // Empty dependency array so it never resets on re-render

  return (
    <section id="hero-landing-section" className="relative w-full h-[100vh] min-h-[600px] overflow-hidden bg-[#F8F6F1] flex flex-col items-center justify-center">
      
      {/* Flashing Sequence */}
      <AnimatePresence>
        {!flashingDone && slides.length > 0 && (
          <motion.div 
            initial={{ y: '100vh', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ opacity: 0, scale: 0.9, filter: "blur(10px)", y: -40 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-center z-10 w-full max-w-sm px-6"
          >
            <div className="flex justify-between w-64 md:w-72 mb-4 text-[10px] sm:text-xs font-sans font-bold tracking-widest uppercase text-black">
              <span className="flex items-center">
                CREO STUDIO
                <span className="ml-2 flex space-x-[2px] tracking-normal">
                  <motion.span animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 1.2, delay: 0 }}>.</motion.span>
                  <motion.span animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 1.2, delay: 0.4 }}>.</motion.span>
                  <motion.span animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 1.2, delay: 0.8 }}>.</motion.span>
                </span>
              </span>
              <span>{progress}</span>
            </div>
            <div className="w-64 h-80 md:w-72 md:h-[22rem] bg-gray-200 overflow-hidden shadow-2xl relative rounded-sm">
              <AnimatePresence initial={false}>
                <motion.img 
                  key={currentSlideIndex}
                  src={slides[currentSlideIndex]} 
                  alt={`Studio Intro`} 
                  initial={{ y: "100%" }}
                  animate={{ y: "0%" }}
                  exit={{ y: "-100%" }}
                  transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Content after flashing */}
      <AnimatePresence>
        {showLogos && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="absolute inset-0 w-full h-full flex flex-col items-center justify-center z-20 pointer-events-none"
          >
            {/* The Huge Logos Container */}
            <div className="relative w-full h-full max-w-[1800px] mx-auto px-6 sm:px-12 lg:px-24">
              
              {/* MOBILE LAYOUT (Stacked at bottom) */}
              <div className="absolute inset-0 md:hidden z-30 pointer-events-none px-6">
                
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 1, delay: 0.9, ease: [0.16, 1, 0.3, 1] }}
                  className="absolute inset-0 flex items-center justify-center z-30 pointer-events-none"
                >
                  <p className="text-[9px] font-sans font-bold tracking-[0.2em] uppercase text-black text-center leading-relaxed">
                    Creative Studio
                  </p>
                </motion.div>
                
                <div className="absolute bottom-[22vw] left-0 w-full flex justify-center z-20">
                  <motion.div
                    initial={{ y: '100%' }}
                    animate={{ y: '0%' }}
                    transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
                    className="w-[90vw]"
                  >
                    <img src="/creo.svg" alt="CREO" className="w-full h-auto drop-shadow-sm" />
                  </motion.div>
                </div>
                  
                <div className="absolute bottom-0 left-0 w-full flex justify-center z-10">
                  <motion.div
                    initial={{ y: '100%' }}
                    animate={{ y: '0%' }}
                    transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
                    className="w-[90vw]"
                  >
                    <img src="/studio.svg" alt="STUDIO" className="w-full h-auto drop-shadow-sm" />
                  </motion.div>
                </div>
              </div>

              {/* DESKTOP LAYOUT (Absolute positions) */}
              
              {/* Additional Text (Desktop) */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.9, ease: [0.16, 1, 0.3, 1] }}
                className="hidden md:block absolute bottom-12 left-12 lg:left-24 pointer-events-none z-30"
              >
                <p className="text-xs font-sans font-bold tracking-[0.2em] uppercase text-black text-left leading-relaxed">
                  Creative Studio
                </p>
              </motion.div>

              {/* CREO SVG (Desktop) */}
              <div className="hidden md:flex absolute top-12 left-12 lg:left-24 w-[50vw] max-w-[900px] overflow-hidden z-20">
                <motion.div
                  initial={{ y: '100%' }}
                  animate={{ y: '0%' }}
                  transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
                  className="w-full"
                >
                  <img src="/creo.svg" alt="CREO" className="w-full h-auto drop-shadow-sm" />
                </motion.div>
              </div>

              {/* STUDIO SVG (Desktop) */}
              <div className="hidden md:flex absolute bottom-12 right-12 lg:right-24 w-[50vw] max-w-[900px] overflow-hidden z-20">
                <motion.div
                  initial={{ y: '-100%' }}
                  animate={{ y: '0%' }}
                  transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
                  className="w-full"
                >
                  <img src="/studio.svg" alt="STUDIO" className="w-full h-auto drop-shadow-sm" />
                </motion.div>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </section>
  );
}
