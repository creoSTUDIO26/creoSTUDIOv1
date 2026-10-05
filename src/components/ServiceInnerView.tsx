import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ServiceDetail, ServiceSubsection, ClientProfile } from '../types';
import { ArrowLeft, Sparkles, Plus, Image, ArrowUpRight, Check, Sliders, Play, Cpu, Film, Compass, Globe, Upload, Loader, AlertCircle, X, ChevronLeft, ChevronRight, Instagram, ExternalLink, FileText, Download, Monitor, Tablet, Smartphone, Lock, RefreshCw } from 'lucide-react';
import { getThumbnailUrl } from '../lib/supabase';

interface ServiceInnerViewProps {
  key?: string;
  service: ServiceDetail;
  services: ServiceDetail[];
  clients?: ClientProfile[];
  onBack: () => void;
  onNavigateToService: (id: string) => void;
  onEnquire: () => void;
  initialItemId?: string;
  initialBrand?: string;
}

// Service-specific category configs
const SERVICE_CATEGORIES: Record<string, string[]> = {
  'ai-photo-shoot': ['Clothing Shoot', 'Footwear Shoot', 'Lifestyle Shoot']
};

const EINVITATION_SUBCATEGORIES = ['Wedding', 'Other Function'];

export default function ServiceInnerView({
  service,
  services,
  clients,
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
  const [activeModalTab, setActiveModalTab] = useState<'video' | 'pdf' | 'image' | 'website'>('image');
  const [deviceView, setDeviceView] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [iframeKey, setIframeKey] = useState<number>(0);

  const isShootService = service.id === 'ai-photo-shoot' || service.id === 'ai-video-shoot';
  const isCategoryDisabled = service.id !== 'ai-photo-shoot';

  const getExistingCategories = () => {
    if (isCategoryDisabled) return [];
    // For photo shoot, collect from data (not hardcoded)
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

  const categories = isCategoryDisabled ? [] : ['All', ...getExistingCategories()];

  const filteredSubsections = (() => {
    let items = service.subsections;
    if (service.id === 'ai-photo-shoot' && selectedCategory !== 'All') {
      items = items.filter(sub => (sub.subCategory || 'General') === selectedCategory);
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

  const getVideoEmbedUrl = (url?: string) => {
    if (!url) return null;
    const ytMatch = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([a-zA-Z0-9_-]+)/);
    if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1`;
    const loomMatch = url.match(/loom\.com\/(?:share|embed)\/([a-zA-Z0-9]+)/);
    if (loomMatch) return `https://www.loom.com/embed/${loomMatch[1]}?autoplay=1`;
    const vimeoMatch = url.match(/vimeo\.com\/(?:video\/)?([0-9]+)/);
    if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=1`;
    return null;
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

  // --- Formatted Description Component for Structured Points, Headers & Flow ---
  const FormattedDescription: React.FC<{ text?: string }> = ({ text }) => {
    if (!text) return null;

    const lines = text.split('\n');

    return (
      <div className="space-y-2.5 font-sans text-xs sm:text-sm text-black/75 leading-relaxed">
        {lines.map((line, idx) => {
          const trimmed = line.trim();
          if (!trimmed) {
            return <div key={idx} className="h-1.5" />;
          }

          // 1. Process / Workflow arrow pipeline (contains →)
          if (trimmed.includes('→')) {
            const steps = trimmed.split('→').map(s => s.trim()).filter(Boolean);
            return (
              <div key={idx} className="my-3 p-3 bg-black/[0.03] border border-black/10 rounded-none flex flex-wrap items-center gap-1.5 text-xs font-mono font-medium text-black">
                {steps.map((step, sIdx) => (
                  <React.Fragment key={sIdx}>
                    <span className="bg-white px-2.5 py-1 border border-black/10 shadow-xs font-bold text-[10px] sm:text-[11px] uppercase tracking-wide text-black">
                      {step}
                    </span>
                    {sIdx < steps.length - 1 && (
                      <span className="text-[#007A93] font-bold px-0.5 text-xs">→</span>
                    )}
                  </React.Fragment>
                ))}
              </div>
            );
          }

          // 2. Section Header detection (e.g. "Key Features", "The Concept", "What We Delivered", "End-to-End Workflow", or short lines ending in colon)
          const isKnownHeader = /^(Key Features|The Concept|What We Delivered|End-to-End Workflow|Workflow|Overview|Features|Highlights|Summary):?$/i.test(trimmed);
          const isShortColonHeader = trimmed.length < 40 && trimmed.endsWith(':') && !trimmed.includes('—');
          if (isKnownHeader || isShortColonHeader) {
            return (
              <div key={idx} className="pt-2.5 pb-1">
                <h4 className="font-display text-xs sm:text-sm font-bold uppercase tracking-wider text-black flex items-center gap-2 border-b border-black/10 pb-1.5 w-full">
                  <span className="w-1.5 h-1.5 bg-[#007A93] shrink-0" />
                  {trimmed.replace(/:$/, '')}
                </h4>
              </div>
            );
          }

          // 3. Bullet Point / Feature item with separator (e.g. "Product Library — Store and manage...")
          const hasDash = trimmed.includes(' — ') || trimmed.includes(' - ');
          const isBulletList = trimmed.startsWith('•') || trimmed.startsWith('- ') || trimmed.startsWith('* ');

          if (hasDash || isBulletList) {
            let cleanLine = trimmed;
            if (cleanLine.startsWith('•') || cleanLine.startsWith('- ') || cleanLine.startsWith('* ')) {
              cleanLine = cleanLine.replace(/^[•\-*]\s*/, '');
            }

            const dashIndex = cleanLine.indexOf(' — ') !== -1 ? cleanLine.indexOf(' — ') : cleanLine.indexOf(' - ');
            if (dashIndex !== -1) {
              const title = cleanLine.substring(0, dashIndex).trim();
              const desc = cleanLine.substring(dashIndex + 3).trim();
              return (
                <div key={idx} className="flex items-start gap-2.5 pl-1 py-0.5">
                  <span className="w-1.5 h-1.5 rounded-none bg-black/40 mt-1.5 shrink-0" />
                  <div className="text-xs sm:text-sm leading-relaxed text-black/75">
                    <span className="text-black font-bold uppercase font-mono tracking-wider text-[11px] sm:text-xs mr-1.5">
                      {title}
                    </span>
                    <span className="text-black/40 font-mono text-xs mr-1.5">—</span>
                    <span>{desc}</span>
                  </div>
                </div>
              );
            } else {
              return (
                <div key={idx} className="flex items-start gap-2.5 pl-1 py-0.5">
                  <span className="w-1.5 h-1.5 rounded-none bg-black/40 mt-1.5 shrink-0" />
                  <span className="text-xs sm:text-sm text-black/75 leading-relaxed">{cleanLine}</span>
                </div>
              );
            }
          }

          // 4. Standard text line with line-break preserved
          return (
            <p key={idx} className="text-xs sm:text-sm text-black/70 leading-relaxed whitespace-pre-line">
              {trimmed}
            </p>
          );
        })}
      </div>
    );
  };

  // --- RENDER: Universal Popup ---
  // --- RENDER: Universal Popup ---
  const renderUniversalPopup = () => {
    if (!selectedItem) return null;
    const hasVideo = !!(selectedItem.videoUrl || selectedItem.visualType === 'video' || isVideoUrl(selectedItem.visualUrl));
    const hasPdf = !!selectedItem.pdfUrl;
    const hasImage = !!(selectedItem.visualUrl && !isVideoUrl(selectedItem.visualUrl) && selectedItem.visualType !== 'pdf');
    const hasWebsite = !!selectedItem.websiteUrl;
    const availableFormatsCount = [hasVideo, hasPdf, hasImage, hasWebsite].filter(Boolean).length;

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

          {/* Multi-format switcher tabs if more than one media type is available */}
          {availableFormatsCount > 1 && (
            <div className="flex items-center gap-2 px-6 py-2.5 bg-[#fbfbfb] border-b border-black/5 overflow-x-auto shrink-0">
              <span className="font-mono text-[9px] uppercase tracking-widest text-black/40 font-bold mr-1">Formats:</span>
              {hasVideo && (
                <button
                  type="button"
                  onClick={() => setActiveModalTab('video')}
                  className={`px-3 py-1 text-[10px] font-mono font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer rounded-none ${activeModalTab === 'video' ? 'bg-[#007A93] text-white shadow-sm' : 'bg-white text-black/70 hover:bg-black/5 border border-black/10'}`}
                >
                  <Play className="w-3 h-3" /> Video Demo
                </button>
              )}
              {hasPdf && (
                <button
                  type="button"
                  onClick={() => setActiveModalTab('pdf')}
                  className={`px-3 py-1 text-[10px] font-mono font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer rounded-none ${activeModalTab === 'pdf' ? 'bg-[#007A93] text-white shadow-sm' : 'bg-white text-black/70 hover:bg-black/5 border border-black/10'}`}
                >
                  <FileText className="w-3 h-3" /> PDF Document
                </button>
              )}
              {hasImage && (
                <button
                  type="button"
                  onClick={() => setActiveModalTab('image')}
                  className={`px-3 py-1 text-[10px] font-mono font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer rounded-none ${activeModalTab === 'image' ? 'bg-[#007A93] text-white shadow-sm' : 'bg-white text-black/70 hover:bg-black/5 border border-black/10'}`}
                >
                  <Image className="w-3 h-3" /> Visual / Screenshot
                </button>
              )}
              {hasWebsite && (
                <button
                  type="button"
                  onClick={() => setActiveModalTab('website')}
                  className={`px-3 py-1 text-[10px] font-mono font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer rounded-none ${activeModalTab === 'website' ? 'bg-[#007A93] text-white shadow-sm' : 'bg-white text-black/70 hover:bg-black/5 border border-black/10'}`}
                >
                  <Globe className="w-3 h-3" /> Live Demo
                </button>
              )}
            </div>
          )}

          {/* Content Area */}
          <div className="flex-1 relative flex items-center justify-center overflow-hidden min-h-0 bg-[#f3f3f3]">
            {activeModalTab === 'pdf' && selectedItem.pdfUrl ? (
              <iframe
                src={selectedItem.pdfUrl}
                className="w-full h-full border-none"
                title={selectedItem.title}
              />
            ) : activeModalTab === 'website' && selectedItem.websiteUrl ? (
              <div className="w-full h-full flex flex-col bg-[#111] overflow-hidden">
                {/* Browser Navigation & Device Toolbar */}
                <div className="bg-[#1c1c1e] text-white/80 px-3 sm:px-4 py-2 flex items-center justify-between gap-3 shrink-0 border-b border-white/10 select-none">
                  {/* Left: Window dots and site URL */}
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 shrink-0 hidden sm:flex">
                      <span className="w-2.5 h-2.5 rounded-full bg-red-500/80 inline-block" />
                      <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80 inline-block" />
                      <span className="w-2.5 h-2.5 rounded-full bg-green-500/80 inline-block" />
                    </div>
                    <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-3 py-1 text-[11px] font-mono text-white/70 truncate flex-1 max-w-md">
                      <Lock className="w-3 h-3 text-emerald-400 shrink-0" />
                      <span className="truncate">{selectedItem.websiteUrl}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIframeKey(k => k + 1)}
                      className="p-1.5 text-white/60 hover:text-white hover:bg-white/10 transition-colors"
                      title="Reload website"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Center: Device Switcher (Desktop, Tablet, Mobile) */}
                  <div className="flex items-center gap-1 bg-white/5 p-0.5 border border-white/10 shrink-0">
                    <button
                      type="button"
                      onClick={() => setDeviceView('desktop')}
                      className={`p-1.5 transition-colors ${deviceView === 'desktop' ? 'bg-[#007A93] text-white shadow-sm' : 'text-white/50 hover:text-white'}`}
                      title="Desktop View (100%)"
                    >
                      <Monitor className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeviceView('tablet')}
                      className={`p-1.5 transition-colors ${deviceView === 'tablet' ? 'bg-[#007A93] text-white shadow-sm' : 'text-white/50 hover:text-white'}`}
                      title="Tablet View (768px)"
                    >
                      <Tablet className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeviceView('mobile')}
                      className={`p-1.5 transition-colors ${deviceView === 'mobile' ? 'bg-[#007A93] text-white shadow-sm' : 'text-white/50 hover:text-white'}`}
                      title="Mobile View (390px)"
                    >
                      <Smartphone className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Right: Open in new tab link */}
                  <a
                    href={selectedItem.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-[10px] font-mono text-white/80 hover:text-white px-2.5 py-1 bg-white/10 hover:bg-white/20 border border-white/15 transition-colors shrink-0"
                    title="Open in new window"
                  >
                    <ExternalLink className="w-3 h-3" />
                    <span className="hidden sm:inline">New Tab</span>
                  </a>
                </div>

                {/* Live Interactive Iframe Frame */}
                <div className="flex-1 w-full h-full flex items-center justify-center overflow-auto bg-[#0a0a0a] p-1 sm:p-2">
                  <div
                    className={`h-full transition-all duration-300 bg-white relative flex flex-col ${
                      deviceView === 'mobile'
                        ? 'w-[390px] max-w-full rounded-md shadow-2xl border-4 border-[#222]'
                        : deviceView === 'tablet'
                        ? 'w-[768px] max-w-full rounded-md shadow-2xl border-4 border-[#222]'
                        : 'w-full shadow-lg'
                    }`}
                  >
                    <iframe
                      key={iframeKey}
                      src={selectedItem.websiteUrl}
                      className="w-full h-full border-none flex-1"
                      title={selectedItem.title}
                      sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-modals"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    />
                  </div>
                </div>
              </div>
            ) : activeModalTab === 'video' ? (
              (() => {
                const vidUrl = selectedItem.videoUrl || (isVideoUrl(selectedItem.visualUrl) ? selectedItem.visualUrl : '');
                const embedUrl = getVideoEmbedUrl(vidUrl);
                if (embedUrl) {
                  return (
                    <iframe
                      src={embedUrl}
                      className="w-full h-full border-none"
                      title={selectedItem.title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  );
                }
                return (
                  <video
                    src={vidUrl || selectedItem.visualUrl}
                    className="w-full h-full object-contain"
                    controls
                    autoPlay
                    loop
                    playsInline
                  />
                );
              })()
            ) : selectedItem.visualType === 'text' ? (
              <div className="flex items-center justify-center p-8 md:p-16 h-full w-full overflow-y-auto">
                <div className="max-w-3xl w-full text-left bg-white p-6 sm:p-8 border border-black/10 shadow-sm">
                  <FormattedDescription text={selectedItem.description} />
                </div>
              </div>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center relative">
                <img
                  src={activePreviewUrl || selectedItem.visualUrl}
                  alt={selectedItem.title}
                  className="w-full h-full object-contain"
                />
                {((selectedItem.generatedVariants && selectedItem.generatedVariants.length > 0) || (selectedItem.originalUrls && selectedItem.originalUrls.length > 0)) && (
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur border border-black/10 p-2 flex gap-2 max-w-[90%] overflow-x-auto shadow-lg z-20">
                    {[selectedItem.visualUrl, ...(selectedItem.generatedVariants || []), ...(selectedItem.originalUrls || [])].filter((u, i, arr) => arr.indexOf(u) === i && !isVideoUrl(u)).map((imgUrl, iIdx) => (
                      <img
                        key={iIdx}
                        src={imgUrl}
                        alt="Thumbnail"
                        onClick={() => setActivePreviewUrl(imgUrl)}
                        className={`w-12 h-12 object-cover cursor-pointer border transition-all shrink-0 ${activePreviewUrl === imgUrl ? 'border-[#007A93] scale-105' : 'border-transparent opacity-70 hover:opacity-100'}`}
                      />
                    ))}
                  </div>
                )}
              </div>
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

  // --- RENDER: Website Design Case Study Modal (matching Image 3) ---
  const renderWebsitePopup = () => {
    if (!selectedItem) return null;

    const allScreenshots = [
      selectedItem.visualUrl,
      ...(selectedItem.generatedVariants || []),
      ...(selectedItem.originalUrls || [])
    ].filter((u, i, arr) => Boolean(u) && arr.indexOf(u) === i && !isVideoUrl(u));

    const currentIndex = filteredSubsections.findIndex(s => (s.id && s.id === selectedItem.id) || s.title === selectedItem.title);
    const nextProject = filteredSubsections.length > 1
      ? filteredSubsections[(currentIndex + 1) % filteredSubsections.length]
      : null;

    // Detect or generate workflow steps (Image 4)
    const getWorkflowSteps = (): string[] | null => {
      if (selectedItem.workflowSteps && selectedItem.workflowSteps.length > 0) {
        return selectedItem.workflowSteps;
      }
      if (selectedItem.description) {
        const lines = selectedItem.description.split('\n');
        for (const line of lines) {
          if (line.includes('->') || line.includes('→')) {
            const parts = line
              .replace(/^(workflow|pipeline|steps|end-to-end workflow):?/i, '')
              .split(/->|→/)
              .map(s => s.trim().toUpperCase())
              .filter(Boolean);
            if (parts.length >= 2) return parts;
          }
        }
      }
      if (service.id === 'automation' || selectedItem.visualType === 'automation') {
        return [
          'VISITOR',
          'ENQUIRY FORM',
          'SUBMISSION',
          'CONFIRMATION TO SENDER + NOTIFICATION TO CLIENT',
          'INSTAGRAM REDIRECT'
        ];
      }
      return null;
    };

    const workflowSteps = getWorkflowSteps();
    const cleanDescription = selectedItem.description
      ? selectedItem.description
          .split('\n')
          .filter(line => !line.toLowerCase().includes('workflow:') && !line.includes('->') && !line.includes('→'))
          .join('\n')
          .trim() || selectedItem.description
      : '';

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[200] bg-black/75 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 md:p-8 lg:p-12 overflow-y-auto"
        onClick={() => setSelectedItem(null)}
      >
        <motion.div
          initial={{ scale: 0.96, y: 24, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.96, y: 24, opacity: 0 }}
          transition={{ type: 'spring', damping: 28, stiffness: 220 }}
          className="relative bg-[#FAF9F5] text-black border border-black/10 rounded-none w-full max-w-7xl max-h-[92vh] flex flex-col overflow-hidden shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Top navigation bar matching Image 3: Back button & Close button */}
          <div className="px-6 sm:px-10 py-5 border-b border-black/5 bg-[#FAF9F5] flex items-center justify-between shrink-0">
            <button
              onClick={() => setSelectedItem(null)}
              className="inline-flex items-center gap-2 text-xs sm:text-sm font-sans font-medium text-black/70 hover:text-black transition-colors cursor-pointer group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              <span>Back</span>
            </button>
            <button
              onClick={() => setSelectedItem(null)}
              className="p-1.5 text-black/40 hover:text-black hover:bg-black/5 transition-colors cursor-pointer"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Main scrollable 2-column layout */}
          <div className="overflow-y-auto flex-1 px-6 sm:px-10 lg:px-14 py-8 sm:py-12">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
              
              {/* Left Column: Title, Overview, Details, Next Project */}
              <div className="lg:col-span-5 flex flex-col justify-between">
                <div>
                  {/* Huge Editorial Serif Title */}
                  <h1 className="font-editorial text-4xl sm:text-6xl lg:text-7xl font-normal tracking-tight text-black uppercase leading-[0.95] mb-8 sm:mb-12">
                    {selectedItem.brandName || selectedItem.title}
                  </h1>

                  {/* OVERVIEW Section */}
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 sm:gap-4 border-t border-black/10 pt-6 pb-8">
                    <div className="sm:col-span-4">
                      <span className="font-mono text-[10px] sm:text-[11px] uppercase tracking-widest text-black/40 font-bold block">
                        OVERVIEW
                      </span>
                    </div>
                    <div className="sm:col-span-8 space-y-6">
                      <div className="font-sans text-xs sm:text-sm text-black/75 leading-relaxed">
                        <FormattedDescription text={cleanDescription} />
                      </div>

                      {/* END-TO-END WORKFLOW (Matching Image 4) */}
                      {workflowSteps && workflowSteps.length > 0 && (
                        <div className="space-y-3 pt-2">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 bg-[#007A93] shrink-0" />
                            <h4 className="font-mono text-xs font-bold uppercase tracking-widest text-black">
                              END-TO-END WORKFLOW
                            </h4>
                          </div>

                          <div className="bg-[#f4f4f0] border border-black/10 p-4 sm:p-5 rounded-none">
                            <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
                              {workflowSteps.map((step, idx) => (
                                <React.Fragment key={idx}>
                                  <span className="bg-white border border-black/10 px-3 py-1.5 font-mono text-[10px] sm:text-[11px] font-bold tracking-wider text-black shadow-2xs uppercase">
                                    {step}
                                  </span>
                                  {idx < workflowSteps.length - 1 && (
                                    <span className="text-[#007A93] font-mono text-xs font-bold select-none">
                                      →
                                    </span>
                                  )}
                                </React.Fragment>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* DETAILS Section */}
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 sm:gap-4 border-t border-black/10 pt-6 pb-8">
                    <div className="sm:col-span-4">
                      <span className="font-mono text-[10px] sm:text-[11px] uppercase tracking-widest text-black/40 font-bold block">
                        DETAILS
                      </span>
                    </div>
                    <div className="sm:col-span-8 space-y-3.5">
                      {/* Client */}
                      <div className="flex items-center justify-between border-b border-black/5 pb-2 text-xs sm:text-sm">
                        <span className="text-black/50 font-sans">Client</span>
                        <span className="font-sans font-medium text-black">
                          {selectedItem.brandName || 'Case Study'}
                        </span>
                      </div>

                      {/* Year */}
                      <div className="flex items-center justify-between border-b border-black/5 pb-2 text-xs sm:text-sm">
                        <span className="text-black/50 font-sans">Year</span>
                        <span className="font-sans font-medium text-black">
                          {selectedItem.meta || '2025'}
                        </span>
                      </div>

                      {/* Preview -> See It Live / Demo Video / PDF */}
                      <div className="flex items-center justify-between border-b border-black/5 pb-2 text-xs sm:text-sm">
                        <span className="text-black/50 font-sans">Preview</span>
                        {selectedItem.websiteUrl ? (
                          <a
                            href={selectedItem.websiteUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 font-sans font-semibold text-black hover:text-[#007A93] transition-colors group cursor-pointer"
                          >
                            <span>See It Live</span>
                            <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                          </a>
                        ) : selectedItem.videoUrl ? (
                          <a
                            href={selectedItem.videoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 font-sans font-semibold text-purple-700 hover:text-black transition-colors group cursor-pointer"
                          >
                            <span>Watch Demo</span>
                            <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                          </a>
                        ) : selectedItem.pdfUrl ? (
                          <a
                            href={selectedItem.pdfUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 font-sans font-semibold text-amber-700 hover:text-black transition-colors group cursor-pointer"
                          >
                            <span>View Document</span>
                            <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                          </a>
                        ) : (
                          <span className="text-black/40 italic text-xs">Available on request</span>
                        )}
                      </div>

                      {/* Scope */}
                      <div className="flex items-start justify-between text-xs sm:text-sm">
                        <span className="text-black/50 font-sans">Scope</span>
                        <div className="font-sans font-medium text-black text-right space-y-0.5">
                          <p>{selectedItem.subCategory || service.name}</p>
                          <p className="text-[11px] text-black/50">Custom Production</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* NEXT PROJECTS Section */}
                {nextProject && (
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 sm:gap-4 border-t border-black/10 pt-6 mt-4">
                    <div className="sm:col-span-4">
                      <span className="font-mono text-[10px] sm:text-[11px] uppercase tracking-widest text-black/40 font-bold block">
                        NEXT PROJECTS
                      </span>
                    </div>
                    <div className="sm:col-span-8">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedItem(nextProject);
                          setActivePreviewUrl(nextProject.generatedVariants?.[0] || nextProject.visualUrl);
                        }}
                        className="font-sans text-2xl sm:text-3xl font-bold text-black hover:text-[#007A93] transition-colors text-left flex items-center gap-2 group cursor-pointer"
                      >
                        <span className="truncate">{nextProject.brandName || nextProject.title}</span>
                        <ArrowUpRight className="w-5 h-5 opacity-40 group-hover:opacity-100 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all shrink-0" />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column: Screenshot & Media Stack (NO IFRAME EMBED) */}
              <div className="lg:col-span-7 space-y-6 sm:space-y-8">
                {/* Optional embedded direct video player */}
                {(selectedItem.videoUrl || (isVideoUrl(selectedItem.visualUrl) && selectedItem.visualType === 'video')) && (
                  <div className="w-full bg-black border border-black/10 shadow-lg overflow-hidden rounded-none aspect-video flex items-center justify-center">
                    <video
                      src={selectedItem.videoUrl || selectedItem.visualUrl}
                      controls
                      autoPlay
                      muted
                      loop
                      playsInline
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                {allScreenshots.length > 0 ? (
                  allScreenshots.map((imgUrl, sIdx) => (
                    <div
                      key={sIdx}
                      className="w-full bg-white border border-black/10 shadow-lg overflow-hidden rounded-none"
                    >
                      <img
                        src={imgUrl}
                        alt={`${selectedItem.title} - Visual ${sIdx + 1}`}
                        loading="lazy"
                        className="w-full h-auto object-cover"
                      />
                    </div>
                  ))
                ) : !selectedItem.videoUrl && !isVideoUrl(selectedItem.visualUrl) && (
                  <div className="w-full bg-white border border-black/10 shadow-lg overflow-hidden rounded-none aspect-video flex items-center justify-center">
                    <img src={selectedItem.visualUrl} alt={selectedItem.title} className="w-full h-auto object-cover" />
                  </div>
                )}

                {/* Direct action buttons */}
                <div className="pt-2 flex flex-col sm:flex-row gap-3">
                  {selectedItem.websiteUrl && (
                    <a
                      href={selectedItem.websiteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 py-4 px-6 bg-black hover:bg-[#007A93] text-white font-mono text-xs uppercase tracking-widest font-bold flex items-center justify-center gap-2 transition-all duration-300 shadow-md group"
                    >
                      <Globe className="w-4 h-4 text-[#007A93] group-hover:text-white transition-colors" />
                      <span>See It Live ({selectedItem.websiteUrl.replace(/^https?:\/\//, '')}) &rarr;</span>
                    </a>
                  )}
                  {selectedItem.pdfUrl && (
                    <a
                      href={selectedItem.pdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      download
                      className="flex-1 py-4 px-6 bg-amber-700 hover:bg-black text-white font-mono text-xs uppercase tracking-widest font-bold flex items-center justify-center gap-2 transition-all duration-300 shadow-md group"
                    >
                      <FileText className="w-4 h-4" />
                      <span>Download PDF Spec &rarr;</span>
                    </a>
                  )}
                  {selectedItem.videoUrl && !selectedItem.websiteUrl && (
                    <a
                      href={selectedItem.videoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 py-4 px-6 bg-purple-700 hover:bg-black text-white font-mono text-xs uppercase tracking-widest font-bold flex items-center justify-center gap-2 transition-all duration-300 shadow-md group"
                    >
                      <Play className="w-4 h-4" />
                      <span>Watch Full Demo Video &rarr;</span>
                    </a>
                  )}
                </div>
              </div>

            </div>
          </div>
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

  const getDirectLink = (item: ServiceSubsection): string | null => {
    if (item.websiteUrl?.trim()) return item.websiteUrl.trim();
    if (item.instaLink?.trim()) return item.instaLink.trim();
    if (item.pdfUrl?.trim()) return item.pdfUrl.trim();
    if (item.videoUrl?.trim()) return item.videoUrl.trim();
    if (item.visualUrl?.trim() && (item.visualUrl.startsWith('http://') || item.visualUrl.startsWith('https://')) && !item.visualUrl.includes('unsplash.com')) {
      return item.visualUrl.trim();
    }
    return null;
  };

  const formatExternalUrl = (url: string): string => {
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('/')) {
      return url;
    }
    return `https://${url}`;
  };

  const openItem = (item: ServiceSubsection) => {
    // For automation and website design services (or popupType === 'website-link'), take the user directly to the site/link instead of opening a popup
    if (service.id === 'automation' || service.id === 'website-design' || item.popupType === 'website-link') {
      const link = getDirectLink(item);
      if (link) {
        window.open(formatExternalUrl(link), '_blank', 'noopener,noreferrer');
        return;
      }
    }

    setSelectedItem(item);
    setActivePreviewUrl(item.generatedVariants?.[0] || item.visualUrl);
    setDeviceView('desktop');
    if ((service.id === 'website-design' || item.popupType === 'website-embed') && item.websiteUrl) {
      setActiveModalTab('website');
    } else if (item.popupType === 'video' || item.videoUrl || (item.visualType === 'video' && !item.pdfUrl)) {
      setActiveModalTab('video');
    } else if (item.popupType === 'pdf' || (item.pdfUrl && !item.videoUrl && item.visualType === 'pdf')) {
      setActiveModalTab('pdf');
    } else if (item.websiteUrl) {
      setActiveModalTab('website');
    } else {
      setActiveModalTab(item.videoUrl ? 'video' : item.pdfUrl ? 'pdf' : 'image');
    }
  };

  // Editorial Numbered Cards: Clean layout matching Image 2 (Website Design & Automation)
  const renderEditorialCards = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
      {filteredSubsections.map((sub, idx) => {
        const directLink = getDirectLink(sub);

        return (
          <div
            key={idx}
            onClick={() => openItem(sub)}
            className="group cursor-pointer flex flex-col transition-all duration-300"
          >
            {/* Top: Screenshot / Video container */}
            <div className="relative w-full aspect-[4/3] bg-[#eaeaea] overflow-hidden border border-black/5 group-hover:border-black/20 transition-all duration-500 shadow-sm group-hover:shadow-md">
              {isVideoUrl(sub.visualUrl) ? (
                <video src={sub.visualUrl} className="w-full h-full object-cover" muted loop playsInline autoPlay />
              ) : (
                <img
                  src={getThumbnailUrl(sub.visualUrl, 800, 80)}
                  alt={sub.brandName || sub.title}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                  style={{ objectPosition: sub.imagePosition || (service.id === 'website-design' ? 'top' : 'center') }}
                />
              )}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 flex items-center justify-center">
                {directLink && (
                  <span className="opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 px-3 py-1.5 bg-black/90 text-white font-mono text-[9px] uppercase tracking-widest font-bold flex items-center gap-1.5 shadow-lg">
                    <span>Visit Link</span>
                    <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400" />
                  </span>
                )}
              </div>
              
              {/* Badges for media availability */}
              <div className="absolute top-3 left-3 flex flex-wrap gap-1 z-10">
                {sub.videoUrl && (
                  <span className="bg-black/80 backdrop-blur text-white text-[8px] font-mono font-bold px-2 py-0.5 uppercase tracking-wider flex items-center gap-1 shadow-sm">
                    <Play className="w-2 h-2 text-[#007A93]" /> Video
                  </span>
                )}
                {sub.pdfUrl && (
                  <span className="bg-black/80 backdrop-blur text-white text-[8px] font-mono font-bold px-2 py-0.5 uppercase tracking-wider flex items-center gap-1 shadow-sm">
                    <FileText className="w-2 h-2 text-amber-400" /> PDF
                  </span>
                )}
                {sub.websiteUrl && (
                  <span className="bg-black/80 backdrop-blur text-white text-[8px] font-mono font-bold px-2 py-0.5 uppercase tracking-wider flex items-center gap-1 shadow-sm">
                    <Globe className="w-2 h-2 text-emerald-400" /> Live
                  </span>
                )}
              </div>
            </div>

            {/* Bottom: Number + Category/Year + Title matching Image 2 */}
            <div className="mt-4 flex items-start">
              <span className="font-serif text-3xl sm:text-4xl lg:text-5xl text-black font-normal leading-none mr-3 sm:mr-4 shrink-0 select-none tracking-tight">
                {String(idx + 1).padStart(2, '0')}.
              </span>
              <div className="overflow-hidden min-w-0 pt-0.5 flex-1">
                <span className="font-mono text-[9px] sm:text-[10px] text-black/50 uppercase tracking-widest block font-medium">
                  {sub.meta ? sub.meta.toUpperCase() : service.name.toUpperCase()}
                </span>
                <h3 className="font-sans text-sm sm:text-base font-bold text-black tracking-tight mt-0.5 truncate group-hover:text-[#007A93] transition-colors flex items-center justify-between gap-1">
                  <span className="truncate">{sub.brandName || sub.title}</span>
                  {directLink && <ArrowUpRight className="w-3.5 h-3.5 shrink-0 opacity-40 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />}
                </h3>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );

  const renderWebsiteDesignCards = renderEditorialCards;

  // Brand Building cards: compact grid so full card fits neatly into viewport
  const renderBrandBuildingCards = () => (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-5">
      {filteredSubsections.map((sub, idx) => (
        <div
          key={idx}
          onClick={() => openItem(sub)}
          className="group cursor-pointer bg-white border border-black/10 hover:border-black/30 rounded-none overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 flex flex-col"
        >
          <div className="aspect-[4/3] sm:aspect-square overflow-hidden bg-[#f4f4f4] relative flex items-center justify-center p-2.5">
            <img
              src={getThumbnailUrl(sub.visualUrl, 500, 75)}
              alt={sub.brandName || sub.title}
              loading="lazy"
              className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
              style={{ objectPosition: sub.imagePosition || 'center' }}
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300" />
            {sub.pdfUrl && (
              <span className="absolute top-2 left-2 bg-black/80 backdrop-blur text-white text-[8px] font-mono font-bold px-1.5 py-0.5 uppercase tracking-wider flex items-center gap-1 shadow-sm">
                <FileText className="w-2 h-2 text-amber-400" /> Brand Kit
              </span>
            )}
          </div>
          <div className="p-3 sm:p-3.5 flex flex-col justify-between flex-1 border-t border-black/5 bg-white">
            <div className="flex items-center justify-between gap-1 mb-1">
              <h4 className="font-display text-xs sm:text-sm font-bold uppercase tracking-tight text-black truncate">
                {sub.brandName || sub.title}
              </h4>
              <ArrowUpRight className="w-3.5 h-3.5 text-black/30 group-hover:text-black group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all shrink-0" />
            </div>
            {sub.meta && (
              <span className="font-mono text-[9px] text-black/50 uppercase tracking-wider block mb-1 truncate">
                {sub.meta}
              </span>
            )}
            {sub.instaLink && (
              <a
                href={sub.instaLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[9px] font-mono text-[#007A93] hover:text-black transition-colors w-max mt-0.5"
                onClick={e => e.stopPropagation()}
              >
                <Instagram className="w-3 h-3" />
                <span className="uppercase tracking-wider">Instagram</span>
              </a>
            )}
          </div>
        </div>
      ))}
    </div>
  );

  const renderSquareCards = renderBrandBuildingCards;

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

  // Automation: rectangle layout with structured points & popup
  const renderAutomationCards = () => (
    <div className="space-y-8 sm:space-y-16">
      {filteredSubsections.map((sub, idx) => (
        <div
          key={idx}
          onClick={() => openItem(sub)}
          className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-10 items-start border border-black/5 bg-white hover:border-black/10 transition-all p-5 xs:p-6 sm:p-10 lg:p-12 rounded-none relative overflow-hidden shadow-sm cursor-pointer group"
        >
          <div className="absolute top-0 right-0 p-4 sm:p-6 font-mono text-[10px] text-black/30 uppercase hidden sm:block">
            NODE // S0{idx + 1}
          </div>
          <div className="lg:col-span-6 flex flex-col justify-start">
            <span className="font-mono text-[10px] text-black/60 bg-black/5 border border-black/5 w-fit px-3 py-1 rounded-none uppercase mb-6 tracking-wider flex items-center gap-1.5 font-bold">
              <Cpu className="w-3 h-3" /> AUTOMATION
            </span>
            <h3 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-black mb-6 uppercase">{sub.title}</h3>
            
            <div className="mb-8">
              <FormattedDescription text={sub.description} />
            </div>

            {sub.meta && (
              <div className="text-[10px] font-mono text-black/50 border-t border-black/5 pt-4">
                SYSTEM ARTIFACT: <span className="text-black/80 font-bold ml-1">{sub.meta}</span>
              </div>
            )}
          </div>
          <div className="lg:col-span-6 relative rounded-none overflow-hidden aspect-[4/3] bg-[#eaeaea] lg:sticky lg:top-24">
            {isVideoUrl(sub.visualUrl) ? (
              <video src={sub.visualUrl} className="w-full h-full object-cover" muted loop playsInline autoPlay />
            ) : (
              <img
                src={getThumbnailUrl(sub.visualUrl, 800, 80)}
                alt={sub.title}
                loading="lazy"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000 ease-out"
                style={{ objectPosition: sub.imagePosition || (service.id === 'website-design' ? 'top' : 'center') }}
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
            
            {/* Badges for available media */}
            <div className="absolute top-4 left-4 flex flex-wrap gap-1.5 z-10">
              {sub.videoUrl && (
                <span className="bg-black/80 backdrop-blur text-white text-[9px] font-mono font-bold px-2.5 py-1 uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
                  <Play className="w-2.5 h-2.5 text-[#007A93]" /> Video Demo
                </span>
              )}
              {sub.pdfUrl && (
                <span className="bg-black/80 backdrop-blur text-white text-[9px] font-mono font-bold px-2.5 py-1 uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
                  <FileText className="w-2.5 h-2.5 text-amber-400" /> PDF Document
                </span>
              )}
              {sub.websiteUrl && (
                <span className="bg-black/80 backdrop-blur text-white text-[9px] font-mono font-bold px-2.5 py-1 uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
                  <Globe className="w-2.5 h-2.5 text-emerald-400" /> Live Demo
                </span>
              )}
            </div>

            <div className="absolute bottom-6 right-6 bg-white/90 backdrop-blur px-4 py-2 rounded-none text-[10px] font-sans font-bold text-black uppercase flex items-center gap-2 shadow-lg">
              {sub.videoUrl || sub.visualType === 'video' || isVideoUrl(sub.visualUrl) ? (
                <><Play className="w-3 h-3 text-black" /> View Demo</>
              ) : sub.pdfUrl ? (
                <><FileText className="w-3 h-3 text-black" /> View Document</>
              ) : (
                <><Play className="w-3 h-3 text-black" /> View Details</>
              )}
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
              <img
                src={getThumbnailUrl(sub.visualUrl, 600, 75)}
                alt={sub.title}
                loading="lazy"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                style={{ objectPosition: sub.imagePosition || 'center' }}
              />
              <div className="absolute inset-0 bg-black/5 group-hover:bg-black/15 transition-colors" />
            </div>
          )}
        </div>
      ))}
    </div>
  );

  // Helper to get what the brand is (e.g. Interior Design)
  const getBrandDescriptor = (bName: string, sub?: ServiceSubsection) => {
    if (sub?.meta && sub.meta.trim()) return sub.meta.trim();
    if (sub?.subCategory && sub.subCategory !== 'General' && sub.subCategory !== 'Custom' && sub.subCategory.trim()) {
      return sub.subCategory.trim();
    }
    if (sub?.title && sub.title.trim().toLowerCase() !== bName.trim().toLowerCase()) {
      return sub.title.trim();
    }
    const clientMatch = clients?.find(c => c.name.toLowerCase() === bName.toLowerCase());
    if (clientMatch?.industry && clientMatch.industry.trim()) {
      return clientMatch.industry.trim();
    }
    const normalized = bName.toLowerCase();
    if (normalized.includes('studio@mrs') || normalized.includes('mrs')) return 'Interior Design';
    if (normalized.includes('neelant')) return 'Product Shoot';
    if (normalized.includes('happy homes')) return 'Interior Design';
    if (normalized.includes('other')) return 'Footwear & Lifestyle';
    return '';
  };

  // --- Brand Group Gallery for AI Shoots ---
  const renderBrandGallery = () => {
    const brandsMap = new Map<string, ServiceSubsection[]>();
    filteredSubsections.forEach(sub => {
      const bName = sub.brandName || 'Other';
      if (!brandsMap.has(bName)) {
        brandsMap.set(bName, []);
      }
      brandsMap.get(bName)!.push(sub);
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
        {brandEntries.map(([brandName, brandSubs]) => {
          const firstSub = brandSubs[0];
          const descriptor = getBrandDescriptor(brandName, firstSub);

          const handleBrandClick = () => {
            if (brandSubs.length === 1) {
              setSelectedItem(firstSub);
              setActivePreviewUrl(firstSub.generatedVariants?.[0] || firstSub.visualUrl);
            } else {
              setActiveBrand(brandName);
            }
          };

          return (
            <div
              key={brandName}
              onClick={handleBrandClick}
              className="group cursor-pointer rounded-none overflow-hidden bg-white border border-black/5 relative aspect-square shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col"
            >
              <div className="w-full flex-1 relative overflow-hidden">
                <img
                  src={getThumbnailUrl(firstSub.visualUrl, 600, 75)}
                  alt={brandName}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  style={{ objectPosition: firstSub.imagePosition || 'center' }}
                />
                <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-300" />
              </div>
              <div className="p-4 bg-white border-t border-black/5 flex items-center justify-between gap-2">
                <div className="flex items-baseline flex-wrap gap-1.5 min-w-0 pr-2">
                  <span className="font-display font-bold uppercase text-black truncate">{brandName}</span>
                  {descriptor && (
                    <span className="text-[11px] sm:text-xs font-sans font-normal italic text-black/60 whitespace-nowrap">
                      ({descriptor})
                    </span>
                  )}
                </div>
                <ArrowUpRight className="w-4 h-4 text-black/40 group-hover:text-black transition-colors shrink-0" />
              </div>
            </div>
          );
        })}
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
      case 'automation': return renderEditorialCards();
      case 'website-design': return renderEditorialCards();
      case 'brand-building': return renderSquareCards();
      case 'e-invitation': return renderImageOnlyCards();
      case 'catalog': return renderImageOnlyCards();
      case 'insta-grid-stories': return renderImageOnlyCards();
      default:
        if (isShootService) {
          if (activeBrand) {
            const activeSub = filteredSubsections.find(sub => (sub.brandName || 'Other') === activeBrand);
            const activeDescriptor = getBrandDescriptor(activeBrand, activeSub);
            return (
              <div className="space-y-6">
                <button 
                  onClick={() => setActiveBrand(null)} 
                  className="flex items-center gap-2 text-sm font-sans font-bold uppercase tracking-wider text-black/60 hover:text-black transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" /> BACK TO BRANDS
                </button>
                <div className="flex items-center gap-3 pb-4 border-b border-black/5">
                  <h2 className="font-display text-2xl font-bold uppercase flex items-baseline flex-wrap gap-2">
                    <span>{activeBrand}</span>
                    {activeDescriptor && (
                      <span className="text-base font-sans font-normal italic lowercase first-letter:uppercase text-black/50">
                        ({activeDescriptor})
                      </span>
                    )}
                    <span className="font-sans text-sm text-black/40 font-normal normal-case ml-1">Shoot Gallery</span>
                  </h2>
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
        {service.id === 'ai-photo-shoot' && selectedCategory === 'All' ? (
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
                      <img
                        src={getThumbnailUrl(coverUrl, 400, 70)}
                        alt={cat}
                        loading="lazy"
                        className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                        style={{ objectPosition: coverItem?.imagePosition || (service.id === 'website-design' ? 'top' : 'center') }}
                      />
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
            {service.id === 'ai-photo-shoot' && selectedCategory !== 'All' && (
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

            {/* Render Gallery */}
            {renderGallery()}
          </div>
        )}
      </div>

      {/* Portal: Modal */}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {selectedItem && (
            (service.id === 'website-design' || service.id === 'automation')
              ? renderWebsitePopup()
              : isShootService
              ? renderShootModal()
              : renderUniversalPopup()
          )}
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
