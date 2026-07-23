import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ServiceDetail, ServiceSubsection } from '../types';
import { ArrowLeft, Sparkles, Plus, Image, ArrowUpRight, Check, Sliders, Play, Cpu, Film, Compass, Globe, Upload, Loader, AlertCircle, X, ChevronLeft, ChevronRight, Instagram, ExternalLink, FileText, Download } from 'lucide-react';
import { getThumbnailUrl } from '../lib/supabase';

interface ServiceInnerViewProps {
  key?: string;
  service: ServiceDetail;
  services: ServiceDetail[];
  onBack: () => void;
  onNavigateToService: (id: string) => void;
  onEnquire: () => void;
  initialItemId?: string;
  initialBrand?: string;
}

// Service-specific category configs
const SERVICE_CATEGORIES: Record<string, string[]> = {
  'e-invitation': ['Still Cards', 'Motion Cards', 'Invitation Website'],
  'catalog': ['PDF', 'Website'],
  'insta-grid-stories': ['Grid', 'Stories', 'Posters', 'Others'],
  'automation': ['Email Automation', 'WhatsApp Automation', 'Internal Workflow', 'Chatbots'],
  'website-design': ['E-Commerce', 'Corporate', 'Landing Pages', 'Portfolio'],
  'brand-building': ['Brand Identity', 'Strategy', 'Naming', 'Positioning']
};

const EINVITATION_SUBCATEGORIES = ['Wedding', 'Other Function'];

export default function ServiceInnerView({
  service,
  services,
  onBack,
  onNavigateToService,
  onEnquire,
  initialItemId,
  initialBrand,
}: ServiceInnerViewProps) {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedSubCategory, setSelectedSubCategory] = useState('All');
  const initialItem = initialItemId ? (service.subsections?.find(sub => sub.id === initialItemId) || null) : null;
  const [selectedItem, setSelectedItem] = useState<ServiceSubsection | null>(initialItem);
  const [activePreviewUrl, setActivePreviewUrl] = useState<string>(initialItem?.visualUrl || '');
  const [activeBrand, setActiveBrand] = useState<string | null>(initialBrand || null);

  const isShootService = service.id === 'ai-photo-shoot' || service.id === 'ai-video-shoot';
  // #5 — All services now derive categories dynamically from their subsection data
  // This fixes insta-grid-stories and other services where category filter was not working
  const hasFixedCategories = !isShootService && !['automation', 'website-design', 'brand-building'].includes(service.id);

  const getExistingCategories = () => {
    // For shoot services, collect from data (not hardcoded)
    const cats = new Set<string>();
    service.subsections?.forEach(sub => {
      if (sub.subCategory && sub.subCategory !== 'Custom') cats.add(sub.subCategory);
    });
    // Fallback to SERVICE_CATEGORIES if no data categories exist yet
    if (cats.size === 0 && SERVICE_CATEGORIES[service.id]) {
      return SERVICE_CATEGORIES[service.id];
    }
    
    const catsArray = Array.from(cats);
    const order = service.categoryOrder || [];
    if (order.length > 0) {
      catsArray.sort((a, b) => {
        const indexA = order.indexOf(a);
        const indexB = order.indexOf(b);
        if (indexA !== -1 && indexB !== -1) return indexA - indexB;
        if (indexA !== -1) return -1;
        if (indexB !== -1) return 1;
        return 0;
      });
    }
    return catsArray;
  };

  const categories = ['All', ...getExistingCategories()];

  const filteredSubsections = (() => {
    let items = service.subsections;
    if (selectedCategory !== 'All') {
      items = items.filter(sub => (sub.subCategory || 'General') === selectedCategory);
    }
    if (service.id === 'e-invitation' && selectedSubCategory !== 'All') {
      items = items.filter(sub => (sub.subSubCategory || 'Wedding') === selectedSubCategory);
    }
    if (isShootService && activeBrand) {
      items = items.filter(sub => (sub.brandName || 'Other') === activeBrand);
    }
    return items;
  })();

  React.useEffect(() => {
    setActiveBrand(null);
  }, [selectedCategory, service.id]);

  const isVideoUrl = (url?: string) => {
    if (!url) return false;
    return /\.(mp4|webm|ogg|mov)$/i.test(url) || url.includes('video');
  };

  // Modal media resolution for shoot services
  const getModalMediaGroup = (item: ServiceSubsection) => {
    return { 
      originalUrls: item.originalUrls || [], 
      generatedVariants: item.generatedVariants || [item.visualUrl].filter(Boolean)
    };
  };

  const currentItemIdx = selectedItem ? filteredSubsections.indexOf(selectedItem) : -1;
  const currentMediaGroup = selectedItem ? getModalMediaGroup(selectedItem) : null;
  const currentVariantIdx = currentMediaGroup ? currentMediaGroup.generatedVariants.indexOf(activePreviewUrl) : -1;

  const handlePrevVariant = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentMediaGroup || currentMediaGroup.generatedVariants.length === 0) return;
    let newIdx = currentVariantIdx - 1;
    if (newIdx < 0) newIdx = currentMediaGroup.generatedVariants.length - 1;
    setActivePreviewUrl(currentMediaGroup.generatedVariants[newIdx]);
  };

  const handleNextVariant = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentMediaGroup || currentMediaGroup.generatedVariants.length === 0) return;
    let newIdx = currentVariantIdx + 1;
    if (newIdx >= currentMediaGroup.generatedVariants.length) newIdx = 0;
    setActivePreviewUrl(currentMediaGroup.generatedVariants[newIdx]);
  };

  const handlePrevItem = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (filteredSubsections.length === 0) return;
    let newIdx = currentItemIdx - 1;
    if (newIdx < 0) newIdx = filteredSubsections.length - 1;
    const nextItem = filteredSubsections[newIdx];
    setSelectedItem(nextItem);
    setActivePreviewUrl(nextItem.generatedVariants?.[0] || nextItem.visualUrl);
  };

  const handleNextItem = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (filteredSubsections.length === 0) return;
    let newIdx = currentItemIdx + 1;
    if (newIdx >= filteredSubsections.length) newIdx = 0;
    const nextItem = filteredSubsections[newIdx];
    setSelectedItem(nextItem);
    setActivePreviewUrl(nextItem.generatedVariants?.[0] || nextItem.visualUrl);
  };

  // --- Determine popup type for a given item ---
  const getEffectivePopupType = (item: ServiceSubsection): string => {
    if (item.popupType) return item.popupType;
    if (item.visualType === 'text') return 'text';
    if (item.pdfUrl) return 'pdf';
    if (item.websiteUrl) return 'website-embed';
    if (item.visualType === 'video' || isVideoUrl(item.visualUrl)) return 'video';
    return 'image';
  };

  // --- RENDER: Universal Popup ---
  const renderUniversalPopup = () => {
    if (!selectedItem) return null;
    const popupType = getEffectivePopupType(selectedItem);

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[200] bg-[#fafafa]/90 backdrop-blur-xl flex items-center justify-center p-4 md:p-16"
        onClick={() => setSelectedItem(null)}
      >
        <motion.div
          initial={{ scale: 0.95, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.95, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="relative bg-[#f5f5f5] text-black border border-black/10 rounded-none w-full max-w-5xl h-[85vh] md:h-[80vh] flex flex-col overflow-hidden shadow-2xl shadow-black/10"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button
            onClick={() => setSelectedItem(null)}
            className="absolute top-4 right-4 z-50 p-2 bg-white/90 hover:bg-black hover:text-white rounded-none border border-black/5 shadow-md text-black cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Title Bar */}
          {(selectedItem.title || selectedItem.brandName) && (
            <div className="px-6 py-4 border-b border-black/5 bg-white shrink-0 flex items-center justify-between gap-4 pr-16">
              <div>
                <h4 className="font-display text-sm font-bold uppercase tracking-wide text-black">{selectedItem.brandName || selectedItem.title}</h4>
                {selectedItem.meta && <p className="text-[10px] font-mono text-black/50 uppercase mt-0.5">{selectedItem.meta}</p>}
              </div>
              <div className="flex items-center gap-2">
                {selectedItem.instaLink && (
                  <a href={selectedItem.instaLink} target="_blank" rel="noopener noreferrer" className="p-2 bg-black/5 hover:bg-black hover:text-white rounded-none border border-black/10 transition-colors" onClick={e => e.stopPropagation()}>
                    <Instagram className="w-4 h-4" />
                  </a>
                )}
                {selectedItem.websiteUrl && (
                  <a href={selectedItem.websiteUrl} target="_blank" rel="noopener noreferrer" className="p-2 bg-black/5 hover:bg-black hover:text-white rounded-none border border-black/10 transition-colors" onClick={e => e.stopPropagation()}>
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
                {selectedItem.pdfUrl && (
                  <a href={selectedItem.pdfUrl} download className="p-2 bg-black/5 hover:bg-black hover:text-white rounded-none border border-black/10 transition-colors" onClick={e => e.stopPropagation()}>
                    <Download className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Content Area */}
          <div className="flex-1 relative flex items-center justify-center overflow-hidden min-h-0 bg-[#f3f3f3]">
            {popupType === 'pdf' && selectedItem.pdfUrl ? (
              <iframe
                src={selectedItem.pdfUrl}
                className="w-full h-full border-none"
                title={selectedItem.title}
              />
            ) : popupType === 'website-embed' && selectedItem.websiteUrl ? (
              <iframe
                src={selectedItem.websiteUrl}
                className="w-full h-full border-none"
                title={selectedItem.title}
                sandbox="allow-scripts allow-same-origin allow-popups"
              />
            ) : popupType === 'website-link' && selectedItem.websiteUrl ? (
              <div className="flex flex-col items-center justify-center gap-6 p-8 text-center">
                <img src={selectedItem.visualUrl} alt={selectedItem.title} className="max-w-md w-full h-auto object-contain shadow-lg border border-black/5" />
                <a
                  href={selectedItem.websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-8 py-4 bg-black text-white hover:bg-[#007A93] rounded-none font-mono text-xs font-bold uppercase tracking-widest transition-colors flex items-center gap-2"
                  onClick={e => e.stopPropagation()}
                >
                  <ExternalLink className="w-4 h-4" /> Visit Website
                </a>
              </div>
            ) : popupType === 'video' ? (
              <video
                src={selectedItem.visualUrl}
                className="w-full h-full object-contain"
                controls
                autoPlay
                loop
                playsInline
              />
            ) : popupType === 'text' ? (
              <div className="flex items-center justify-center p-8 md:p-16 h-full w-full overflow-y-auto">
                <p className="font-sans text-lg sm:text-2xl text-black/80 leading-relaxed max-w-3xl text-center">
                  {selectedItem.description}
                </p>
              </div>
            ) : (
              <img
                src={activePreviewUrl || selectedItem.visualUrl}
                alt={selectedItem.title}
                className="w-full h-full object-contain"
              />
            )}
          </div>

          {/* Navigation arrows */}
          {filteredSubsections.length > 1 && (
            <>
              <button
                onClick={handlePrevItem}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-30 p-2.5 bg-white/90 hover:bg-[#007A93] hover:text-white text-black rounded-none border border-black/5 transition-all cursor-pointer backdrop-blur shadow-md"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={handleNextItem}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-30 p-2.5 bg-white/90 hover:bg-[#007A93] hover:text-white text-black rounded-none border border-black/5 transition-all cursor-pointer backdrop-blur shadow-md"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}
        </motion.div>
      </motion.div>
    );
  };

  // --- RENDER: Shoot Modal (existing 80/20 layout or 1:1 Comparison) ---
  const renderShootModal = () => {
    if (!selectedItem) return null;
    const mediaGroup = getModalMediaGroup(selectedItem);

    if (selectedItem.isComparisonMode && mediaGroup.originalUrls.length > 0) {
      const allOutputs = [selectedItem.visualUrl, ...(selectedItem.generatedVariants || [])];
      
      return (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] bg-[#fafafa]/95 backdrop-blur-xl flex flex-col p-4 md:p-8 overflow-y-auto"
          onClick={() => setSelectedItem(null)}
        >
          <button onClick={() => setSelectedItem(null)} className="fixed top-6 right-6 z-[250] p-3 bg-white hover:bg-black hover:text-white rounded-none border border-black/5 shadow-md text-black cursor-pointer transition-colors">
            <X className="w-5 h-5" />
          </button>

          {filteredSubsections.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); handlePrevItem(e); }}
                className="fixed left-4 top-1/2 -translate-y-1/2 z-[250] p-3 bg-white/90 hover:bg-[#007A93] hover:text-white text-black rounded-none border border-black/5 shadow-md hover:scale-105 cursor-pointer transition-all hidden sm:flex"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); handleNextItem(e); }}
                className="fixed right-4 top-1/2 -translate-y-1/2 z-[250] p-3 bg-white/90 hover:bg-[#007A93] hover:text-white text-black rounded-none border border-black/5 shadow-md hover:scale-105 cursor-pointer transition-all hidden sm:flex"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}
          
          <div className="w-full max-w-5xl mx-auto flex flex-col gap-16 py-12 mb-20" onClick={e => e.stopPropagation()}>
            <div className="text-center mb-2">
              <h3 className="font-display text-2xl md:text-3xl font-bold uppercase tracking-tight text-black">{selectedItem.title}</h3>
              <p className="text-xs font-mono text-black/50 uppercase tracking-widest mt-3">{selectedItem.meta || '1:1 Transformation Comparison'}</p>
            </div>
            
            {/* Main overarching shoot image/video */}
            <div className="w-full relative bg-[#fcfcfc] border border-black/10 shadow-xl overflow-hidden rounded-none mb-8">
               <span className="absolute top-4 left-4 z-10 bg-[#007A93] text-white px-3 py-1.5 font-mono text-[10px] uppercase font-bold tracking-widest shadow-sm">Main Shoot Result</span>
               <div className="w-full bg-[#f3f3f3] p-4 flex items-center justify-center min-h-[40vh] md:min-h-[60vh]">
                 {isVideoUrl(selectedItem.visualUrl) ? (
                    <video src={selectedItem.visualUrl} className="w-full h-auto max-h-[75vh] object-contain" controls autoPlay muted loop playsInline />
                 ) : (
                    <img src={selectedItem.visualUrl} alt="Main Visual" className="w-full h-auto max-h-[75vh] object-contain mx-auto drop-shadow-md" />
                 )}
               </div>
            </div>

            {mediaGroup.originalUrls.map((originalUrl, idx) => {
              let outputUrl: string | undefined;
              if (selectedItem.generatedVariants && selectedItem.generatedVariants.length > 0) {
                outputUrl = selectedItem.generatedVariants[idx];
              } else if (idx === 0) {
                outputUrl = selectedItem.visualUrl;
              }
              if (!outputUrl) return null;

              return (
                <div key={idx} className="flex flex-col md:flex-row w-full bg-[#f5f5f5] border border-black/10 shadow-xl overflow-hidden rounded-none">
                  {/* Left: Original */}
                  <div className="w-full md:w-1/2 relative bg-[#eaeaea] p-4 flex flex-col border-b md:border-b-0 md:border-r border-black/10">
                    <span className="absolute top-4 left-4 z-10 bg-white/90 px-3 py-1.5 font-mono text-[10px] uppercase font-bold tracking-widest border border-black/5 shadow-sm">Original Input #{idx + 1}</span>
                    <div className="flex-1 min-h-[30vh] md:min-h-[50vh] flex items-center justify-center pt-12 pb-4">
                      {isVideoUrl(originalUrl) ? (
                        <video src={originalUrl} className="w-full h-auto max-h-[60vh] object-contain" controls autoPlay muted loop playsInline />
                      ) : (
                        <img src={originalUrl} alt={`Original ${idx + 1}`} className="w-full h-auto max-h-[60vh] object-contain drop-shadow-md" />
                      )}
                    </div>
                  </div>
                  {/* Right: Output */}
                  <div className="w-full md:w-1/2 relative bg-[#fcfcfc] p-4 flex flex-col">
                    <span className="absolute top-4 left-4 z-10 bg-[#007A93] text-white px-3 py-1.5 font-mono text-[10px] uppercase font-bold tracking-widest shadow-sm">Final Visual #{idx + 1}</span>
                    <div className="flex-1 min-h-[30vh] md:min-h-[50vh] flex items-center justify-center pt-12 pb-4">
                      {isVideoUrl(outputUrl) ? (
                        <video src={outputUrl} className="w-full h-auto max-h-[60vh] object-contain" controls autoPlay muted loop playsInline />
                      ) : (
                        <img src={outputUrl} alt={`Generated ${idx + 1}`} className="w-full h-auto max-h-[60vh] object-contain drop-shadow-md" />
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      );
    }

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[200] bg-[#fafafa]/90 backdrop-blur-xl flex items-center justify-center p-4 md:p-16"
        onClick={() => setSelectedItem(null)}
      >
        <button onClick={handlePrevItem} className="absolute left-4 md:left-6 z-50 p-3 bg-white hover:bg-[#007A93] hover:text-white text-black rounded-none border border-black/5 shadow-md hover:scale-105 cursor-pointer transition-all items-center justify-center hidden sm:flex">
          <ChevronLeft className="w-6 h-6" />
        </button>

        <motion.div
          initial={{ scale: 0.95, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.95, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="relative bg-[#f5f5f5] text-black border border-black/10 rounded-none w-full max-w-5xl h-[85vh] md:h-[75vh] flex flex-col md:flex-row overflow-hidden shadow-2xl shadow-black/10"
          onClick={(e) => e.stopPropagation()}
        >
          <button onClick={() => setSelectedItem(null)} className="absolute top-4 right-4 z-50 p-2 bg-white/90 hover:bg-black hover:text-white rounded-none border border-black/5 shadow-md text-black cursor-pointer transition-colors">
            <X className="w-5 h-5" />
          </button>

          {/* 20% Left Panel */}
          <div className="w-full md:w-[20%] h-auto md:h-full border-b md:border-b-0 md:border-r border-black/10 bg-[#f8f8f8] flex flex-row md:flex-col p-4 gap-3 shrink-0 items-center md:items-stretch overflow-x-auto md:overflow-y-auto">
            <span className="block font-mono text-[9px] text-black/40 uppercase tracking-widest md:mb-3 font-bold shrink-0 w-max md:w-auto mr-2 md:mr-0">Original Input</span>
            <div className="flex flex-row md:flex-col gap-2 shrink-0">
              {mediaGroup.originalUrls.map((url, idx) => (
                <div key={idx} className={`relative h-14 w-auto md:h-28 md:w-full shrink-0 flex items-center md:items-start justify-center overflow-hidden group cursor-pointer transition-all ${activePreviewUrl === url ? 'opacity-100 scale-95 drop-shadow-md' : 'opacity-60 hover:opacity-100 drop-shadow-sm'}`} onClick={() => setActivePreviewUrl(url)}>
                  {isVideoUrl(url) ? <video src={url} className="h-full w-auto md:h-full md:w-auto max-w-full object-contain" autoPlay muted loop playsInline /> : <img src={url} alt="Original input" className="h-full w-auto md:h-full md:w-auto max-w-full object-contain" />}
                  <div className="absolute inset-0 bg-white/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><span className="text-[8px] font-mono font-bold uppercase tracking-wider text-black bg-white/80 px-2 py-1">View</span></div>
                </div>
              ))}
            </div>
          </div>

          {/* 80% Right Panel */}
          <div className="w-full md:w-[80%] flex-grow md:h-full flex flex-col min-h-0 relative bg-[#fcfcfc]">
            <div className="flex-1 relative flex items-center justify-center overflow-hidden min-h-[40vh] md:min-h-0 bg-[#f3f3f3]">
              {isVideoUrl(activePreviewUrl) ? (
                // #7 — autoPlay when shoot modal opens
                <video src={activePreviewUrl} className="w-full h-full object-contain" controls autoPlay muted loop playsInline />
              ) : (
                <img src={activePreviewUrl} alt={selectedItem.title} className="w-full h-full object-contain" />
              )}
              {mediaGroup.generatedVariants.length > 1 && (
                <>
                  <button onClick={handlePrevVariant} className="absolute left-4 top-1/2 -translate-y-1/2 z-30 p-2.5 bg-white/90 hover:bg-[#007A93] hover:text-white text-black rounded-none border border-black/5 transition-all cursor-pointer backdrop-blur shadow-md"><ChevronLeft className="w-4 h-4" /></button>
                  <button onClick={handleNextVariant} className="absolute right-4 top-1/2 -translate-y-1/2 z-30 p-2.5 bg-white/90 hover:bg-[#007A93] hover:text-white text-black rounded-none border border-black/5 transition-all cursor-pointer backdrop-blur shadow-md"><ChevronRight className="w-4 h-4" /></button>
                </>
              )}
              <div className="absolute bottom-6 left-6 z-10 bg-white/90 backdrop-blur px-4 py-2 border border-black/5 rounded-none shadow-md max-w-md text-left">
                <h4 className="font-display text-sm font-bold uppercase tracking-wide text-black">{selectedItem.title}</h4>
                <p className="text-[10px] font-mono text-black/50 uppercase mt-1">{selectedItem.meta || 'Campaign Render'}</p>
              </div>
            </div>

            {/* Variant thumbnails */}
            <div className="border-t border-black/5 bg-[#fafafa] p-4 flex flex-col gap-2 shrink-0 text-left">
              <span className="block font-mono text-[9px] text-[#007A93] uppercase tracking-widest font-bold">AI Shoot Renders ({mediaGroup.generatedVariants.length})</span>
              <div className="flex gap-2.5 overflow-x-auto pb-1">
                {mediaGroup.generatedVariants.map((url, idx) => (
                  <div key={idx} className={`relative w-16 h-16 shrink-0 bg-[#eaeaea] border rounded-none overflow-hidden cursor-pointer transition-all ${activePreviewUrl === url ? 'border-[#007A93] scale-95 shadow-lg shadow-[#007A93]/20' : 'border-black/5 hover:border-black/20'}`} onClick={() => setActivePreviewUrl(url)}>
                    {isVideoUrl(url) ? <video src={url} className="w-full h-full object-cover" autoPlay muted loop playsInline /> : <img src={url} alt="Variant output" className="w-full h-full object-cover" />}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        <button onClick={handleNextItem} className="absolute right-4 md:right-6 z-50 p-3 bg-white hover:bg-[#007A93] hover:text-white text-black rounded-none border border-black/5 shadow-md hover:scale-105 cursor-pointer transition-all items-center justify-center hidden sm:flex">
          <ChevronRight className="w-6 h-6" />
        </button>
      </motion.div>
    );
  };

  // --- RENDER: Card layouts per service ---
  const openItem = (item: ServiceSubsection) => {
    setSelectedItem(item);
    setActivePreviewUrl(item.generatedVariants?.[0] || item.visualUrl);
  };

  // Square cards: Website Design, Brand Building
  const renderSquareCards = () => (
    <div className="grid grid-cols-2 gap-4 sm:gap-6">
      {filteredSubsections.map((sub, idx) => (
        <div
          key={idx}
          onClick={() => openItem(sub)}
          className="group cursor-pointer bg-white border border-black/5 hover:border-black/15 rounded-none overflow-hidden shadow-sm hover:shadow-lg transition-all duration-500"
        >
          <div className="aspect-square overflow-hidden bg-[#eaeaea] relative">
            <img
              src={getThumbnailUrl(sub.visualUrl, 600, 75)}
              alt={sub.brandName || sub.title}
              loading="lazy"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
          </div>
          <div className="p-4 sm:p-5">
            <h4 className="font-display text-sm sm:text-base font-bold uppercase tracking-tight text-black mb-1 truncate">
              {sub.brandName || sub.title}
            </h4>
            {service.id === 'brand-building' && sub.instaLink && (
              <a
                href={sub.instaLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-[10px] font-mono text-black/50 hover:text-[#007A93] transition-colors mb-2"
                onClick={e => e.stopPropagation()}
              >
                <Instagram className="w-3.5 h-3.5" />
                <span className="uppercase tracking-wider">Instagram</span>
              </a>
            )}
            <p className="text-xs sm:text-sm font-sans text-black/60 leading-relaxed line-clamp-2">
              {sub.description}
            </p>
          </div>
        </div>
      ))}
    </div>
  );

  // Image-only cards: E-Invitation, Catalog, Insta Grid
  // #2 — Use object-contain so images are not cropped; padded background gives context
  const renderImageOnlyCards = () => (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-5">
      {filteredSubsections.map((sub, idx) => (
        <div
          key={idx}
          onClick={() => openItem(sub)}
          className="group cursor-pointer rounded-none overflow-hidden bg-[#f0f0f0] relative aspect-[3/4] shadow-sm hover:shadow-xl transition-all duration-500 flex items-center justify-center"
        >
          <img
            src={getThumbnailUrl(sub.visualUrl, 600, 75)}
            alt={sub.title}
            loading="lazy"
            className="w-full h-full object-contain group-hover:scale-[1.03] transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
          {sub.instaLink && (
            <a
              href={sub.instaLink}
              target="_blank"
              rel="noopener noreferrer"
              className="absolute bottom-3 right-3 p-2 bg-white/90 hover:bg-black hover:text-white rounded-none border border-black/5 shadow-md transition-colors z-10"
              onClick={e => e.stopPropagation()}
            >
              <Instagram className="w-4 h-4" />
            </a>
          )}
        </div>
      ))}
    </div>
  );

  // Automation: rectangle layout with popup
  const renderAutomationCards = () => (
    <div className="space-y-8 sm:space-y-16">
      {filteredSubsections.map((sub, idx) => (
        <div
          key={idx}
          onClick={() => openItem(sub)}
          className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-10 items-center border border-black/5 bg-white hover:border-black/10 transition-all p-5 xs:p-6 sm:p-10 lg:p-12 rounded-none relative overflow-hidden shadow-sm cursor-pointer group"
        >
          <div className="absolute top-0 right-0 p-4 sm:p-6 font-mono text-[10px] text-black/30 uppercase hidden sm:block">
            NODE // S0{idx + 1}
          </div>
          <div className="lg:col-span-6 flex flex-col justify-center">
            <span className="font-mono text-[10px] text-black/60 bg-black/5 border border-black/5 w-fit px-3 py-1 rounded-none uppercase mb-6 tracking-wider flex items-center gap-1.5 font-bold">
              <Cpu className="w-3 h-3" /> AUTOMATION
            </span>
            <h3 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-black mb-6 uppercase">{sub.title}</h3>
            <p className="text-base font-sans text-black/70 leading-relaxed mb-8">{sub.description}</p>
            {sub.meta && (
              <div className="text-[10px] font-mono text-black/50 border-t border-black/5 pt-4">
                SYSTEM ARTIFACT: <span className="text-black/80 font-bold ml-1">{sub.meta}</span>
              </div>
            )}
          </div>
          <div className="lg:col-span-6 relative rounded-none overflow-hidden aspect-[4/3] bg-[#eaeaea]">
            <img src={getThumbnailUrl(sub.visualUrl, 800, 80)} alt={sub.title} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000 ease-out" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
            <div className="absolute bottom-6 right-6 bg-white/90 backdrop-blur px-4 py-2 rounded-none text-[10px] font-sans font-bold text-black uppercase flex items-center gap-2 shadow-lg">
              <Play className="w-3 h-3 text-black" /> View Demo
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  // Shoot gallery (existing)
  const renderShootGallery = () => (
    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
      {filteredSubsections.map((sub, idx) => (
        <div
          key={idx}
          onClick={() => { setSelectedItem(sub); setActivePreviewUrl(sub.generatedVariants?.[0] || sub.visualUrl); }}
          className="rounded-none overflow-hidden shadow-md border border-black/5 bg-[#eaeaea] group relative cursor-pointer aspect-[3/4]"
        >
          {sub.visualType === 'video' ? (
            <div className="relative w-full h-full">
              <video src={sub.visualUrl} className="w-full h-full object-cover" muted loop playsInline autoPlay />
              <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors" />
            </div>
          ) : (
            <div className="relative w-full h-full">
              <img src={getThumbnailUrl(sub.visualUrl, 600, 75)} alt={sub.title} loading="lazy" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-black/5 group-hover:bg-black/15 transition-colors" />
            </div>
          )}
        </div>
      ))}
    </div>
  );

  // --- Brand Group Gallery for AI Shoots ---
  const renderBrandGallery = () => {
    const brandsMap = new Map<string, ServiceSubsection>();
    filteredSubsections.forEach(sub => {
      const bName = sub.brandName || 'Other';
      if (!brandsMap.has(bName)) {
        brandsMap.set(bName, sub);
      }
    });

    const brandEntries = Array.from(brandsMap.entries());

    if (brandEntries.length === 0) {
      return (
        <div className="text-center py-16 border border-dashed border-black/10 rounded-none bg-white/30">
          <span className="font-sans text-sm text-black/40">No brands found.</span>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6">
        {brandEntries.map(([brandName, firstSub]) => (
          <div
            key={brandName}
            onClick={() => setActiveBrand(brandName)}
            className="group cursor-pointer rounded-none overflow-hidden bg-white border border-black/5 relative aspect-square shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col"
          >
            <div className="w-full flex-1 relative overflow-hidden">
              <img
                src={getThumbnailUrl(firstSub.visualUrl, 600, 75)}
                alt={brandName}
                loading="lazy"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-300" />
            </div>
            <div className="p-4 bg-white border-t border-black/5 flex items-center justify-between">
              <span className="font-display font-bold uppercase text-black truncate pr-4">{brandName}</span>
              <ArrowUpRight className="w-4 h-4 text-black/40 group-hover:text-black transition-colors" />
            </div>
          </div>
        ))}
      </div>
    );
  };

  // --- Main gallery render logic ---
  const renderGallery = () => {
    if (service.subsections.length === 0) {
      return (
        <div className="text-center py-20 border border-dashed border-black/20 rounded-none bg-white/50">
          <span className="font-sans text-sm text-black/50 block">No work sections added yet to this category.</span>
        </div>
      );
    }
    if (filteredSubsections.length === 0) {
      return (
        <div className="text-center py-16 border border-dashed border-black/10 rounded-none bg-white/30">
          <span className="font-sans text-sm text-black/40">No items found matching the selected category.</span>
        </div>
      );
    }

    switch (service.id) {
      case 'automation': return renderAutomationCards();
      case 'website-design': return renderSquareCards();
      case 'brand-building': return renderSquareCards();
      case 'e-invitation': return renderImageOnlyCards();
      case 'catalog': return renderImageOnlyCards();
      case 'insta-grid-stories': return renderImageOnlyCards();
      default:
        if (isShootService) {
          if (activeBrand) {
            return (
              <div className="space-y-6">
                <button 
                  onClick={() => setActiveBrand(null)} 
                  className="flex items-center gap-2 text-sm font-sans font-bold uppercase tracking-wider text-black/60 hover:text-black transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" /> BACK TO BRANDS
                </button>
                <div className="flex items-center gap-3 pb-4 border-b border-black/5">
                  <h2 className="font-display text-2xl font-bold uppercase">{activeBrand} <span className="font-sans text-sm text-black/40 font-normal normal-case ml-2">Shoot Gallery</span></h2>
                </div>
                {renderShootGallery()}
              </div>
            );
          } else {
            return renderBrandGallery();
          }
        }
        // fallback for any other service
        return renderSquareCards();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.5 }}
      className="relative w-full min-w-0 max-w-7xl mx-auto px-4 sm:px-6 pt-24 pb-8 sm:pt-28 sm:pb-10"
    >
      {/* Back button & Service Navigation tabs */}
      <div className="mb-6 relative z-10 flex flex-col gap-3 border-b border-black/5 pb-4">
        <button
          id="btn-back-to-home"
          onClick={onBack}
          className="group flex items-center gap-2 text-black/60 hover:text-black transition-all text-xs font-sans font-bold uppercase tracking-widest cursor-pointer shrink-0 w-max"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Home
        </button>

        <div className="-mx-4 sm:mx-0">
          <div className="flex flex-nowrap gap-2 sm:gap-1.5 lg:gap-2 overflow-x-auto sm:overflow-hidden pb-2 sm:pb-0 px-4 sm:px-0 scrollbar-hide sm:justify-center lg:justify-start" style={{WebkitOverflowScrolling: 'touch'}}>
            {services.map((s) => (
              <button
                key={s.id}
                onClick={() => { setSelectedCategory('All'); setSelectedSubCategory('All'); onNavigateToService(s.id); }}
                className={`px-4 py-2 sm:px-2.5 sm:py-1.5 lg:px-3 lg:py-2 text-[10px] sm:text-[9px] md:text-[10px] lg:text-[11px] font-mono font-bold uppercase tracking-widest sm:tracking-wider lg:tracking-widest whitespace-nowrap border transition-all cursor-pointer shrink-0 ${
                  s.id === service.id ? 'bg-black text-white border-black' : 'bg-white text-black/60 border-black/10 hover:border-black/30 hover:text-black'
                }`}
              >
                {s.name}
              </button>
            ))}
            <div className="shrink-0 w-4 sm:hidden" aria-hidden="true" />
          </div>
        </div>
      </div>

      {/* Grid Header */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-12 pb-8 sm:pb-10 mb-6 relative z-10 w-full min-w-0">
        <div className="col-span-1 lg:col-span-12 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12 items-start w-full min-w-0">
          <div className="col-span-1 lg:col-span-6 flex flex-col items-start w-full min-w-0">
            <div className="flex items-center gap-2 text-black/40 font-mono text-sm mb-4 sm:mb-6">
              <span>SERVICE</span><span>/</span>
              <span className="text-black/80 font-semibold border border-black/10 px-2 py-0.5 rounded-none bg-white">0{service.count}</span>
            </div>
            <h1 className={`font-display font-bold tracking-tighter text-black uppercase leading-[0.85] w-full break-words ${
              service.id === 'automation'
                ? 'text-4xl xs:text-5xl sm:text-6xl lg:text-[5rem] xl:text-[5.5rem]'
                : service.name.length > 20
                ? 'text-4xl xs:text-5xl sm:text-6xl lg:text-[3.5rem] xl:text-[4.2rem]'
                : 'text-4xl xs:text-5xl sm:text-7xl lg:text-[5.8rem] xl:text-[6.8rem]'
            }`}>
              {service.name}
            </h1>
          </div>
          <div className="col-span-1 lg:col-span-6 lg:pt-11 flex flex-col justify-start overflow-hidden w-full min-w-0">
            <p className="font-sans text-sm sm:text-[15px] text-black/60 leading-normal mb-4 sm:mb-6 w-full break-words whitespace-normal">
              "{service.tagline}"
            </p>
            <ul className="space-y-2 sm:space-y-2.5 font-sans text-sm text-black/60 pl-1">
              {service.features.map((feat, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 bg-[#007A93] mt-1.5 shrink-0" />
                  <span style={{wordBreak: 'break-word'}}>{feat}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Category System */}
      <div className="mb-10 relative z-10">
        {/* Shoot services: category cards or back button */}
        {isShootService && selectedCategory === 'All' ? (
          <div className="-mx-4 sm:mx-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 pb-6 pt-2 px-4 sm:px-0 w-full">
              {categories.filter(cat => cat !== 'All').map((cat, idx) => {
                // #6/#12 — Use admin-set category cover image if available, else fallback to first item's visual
                const adminCover = service.categoryCoverImages?.[cat];
                const coverItem = service.subsections.find(sub => (sub.subCategory || 'General') === cat);
                const coverUrl = adminCover || coverItem?.visualUrl || service.image;
                const itemCount = service.subsections.filter(sub => (sub.subCategory || 'General') === cat).length;
                return (
                  <div key={idx} onClick={() => setSelectedCategory(cat)} className="relative w-full aspect-[3/4.2] rounded-none overflow-hidden group cursor-pointer shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 bg-[#eaeaea]">
                    {isVideoUrl(coverUrl) ? (
                      <video src={coverUrl} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" muted loop playsInline autoPlay />
                    ) : (
                      <img src={getThumbnailUrl(coverUrl, 400, 70)} alt={cat} loading="lazy" className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                    <div className="absolute bottom-5 left-5 right-5 text-left">
                      <p className="font-mono text-[8px] text-white/40 tracking-widest uppercase mb-1">0{idx + 1} // CAMPAIGN</p>
                      <h3 className="font-display text-base sm:text-2xl font-bold text-white uppercase tracking-tight mb-2">{cat}</h3>
                      <span className="bg-white/10 backdrop-blur px-2 py-1 rounded-none text-[8px] font-mono text-white tracking-wider uppercase">{itemCount} {itemCount === 1 ? 'Asset' : 'Assets'}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {/* Back to All / Category pills for non-shoot services */}
            {isShootService && selectedCategory !== 'All' && (
              <button
                onClick={() => setSelectedCategory('All')}
                className="text-xs font-sans font-bold uppercase tracking-wider text-black/60 hover:text-black transition-colors flex items-center gap-1 bg-black/5 hover:bg-black/10 px-3 py-1.5 rounded-none cursor-pointer w-max shrink-0"
              >
                ← All Categories
              </button>
            )}

            {/* Category pills — show for all services that have categories */}
            {categories.length > 1 && (
              <div className="flex flex-wrap gap-2">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => { setSelectedCategory(cat); setSelectedSubCategory('All'); }}
                    className={`px-4 py-2 text-[10px] font-mono font-bold uppercase tracking-widest border transition-all cursor-pointer ${
                      selectedCategory === cat ? 'bg-black text-white border-black' : 'bg-white text-black/60 border-black/10 hover:border-black/30 hover:text-black'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            )}

            {/* Sub-category pills for E-Invitation */}
            {service.id === 'e-invitation' && selectedCategory !== 'All' && (
              <div className="flex flex-wrap gap-2">
                {['All', ...EINVITATION_SUBCATEGORIES, ...Array.from(new Set(service.subsections.filter(s => s.subSubCategory && !EINVITATION_SUBCATEGORIES.includes(s.subSubCategory)).map(s => s.subSubCategory!)))].map(sub => (
                  <button
                    key={sub}
                    onClick={() => setSelectedSubCategory(sub)}
                    className={`px-3 py-1.5 text-[9px] font-mono font-bold uppercase tracking-widest border transition-all cursor-pointer ${
                      selectedSubCategory === sub ? 'bg-[#007A93] text-white border-[#007A93]' : 'bg-white text-black/50 border-black/10 hover:border-black/20'
                    }`}
                  >
                    {sub}
                  </button>
                ))}
              </div>
            )}

            {/* Render Gallery */}
            {renderGallery()}
          </div>
        )}

        {/* If shoot service showing category cards only, don't render gallery yet */}
        {isShootService && selectedCategory === 'All' ? null : !hasFixedCategories && !isShootService && renderGallery()}
      </div>

      {/* Portal: Modal */}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {selectedItem && (isShootService ? renderShootModal() : renderUniversalPopup())}
        </AnimatePresence>,
        document.body
      )}

      {/* Footer Return Nav */}
      <div className="flex justify-center relative z-20 pb-12 px-4">
        <button
          onClick={onBack}
          className="text-[10px] sm:text-sm font-sans font-bold uppercase tracking-wider sm:tracking-[0.2em] border border-black/10 bg-white shadow-sm px-5 py-3 sm:px-8 sm:py-4 hover:bg-black hover:text-white hover:border-black rounded-none text-black/60 transition-all cursor-pointer inline-flex items-center gap-2 shrink-0 w-max"
        >
          <ArrowLeft className="w-4 h-4 shrink-0" />
          <span>Return to Home</span>
        </button>
      </div>
    </motion.div>
  );
}
