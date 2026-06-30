import { motion } from 'motion/react';
import { PortfolioProject } from '../types';
import { ArrowLeft, Clock, ShieldCheck, Eye, Compass, Calendar, ArrowUpRight } from 'lucide-react';

interface ProjectDetailViewProps {
  key?: string;
  project: PortfolioProject;
  onBack: () => void;
  onEnquire: () => void;
}

export default function ProjectDetailView({
  project,
  onBack,
  onEnquire,
}: ProjectDetailViewProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.5 }}
      className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10 overflow-x-hidden"
    >
      {/* Back to Case Studies */}
      <div className="mb-8 relative z-10">
        <button
          id="btn-project-back"
          onClick={onBack}
          className="group flex items-center gap-2 text-black/60 hover:text-black transition-all text-xs font-sans font-bold uppercase tracking-widest cursor-pointer border-none bg-transparent"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Case Studies
        </button>
      </div>

      {/* Editorial Title Header */}
      <div className="border-b border-black/10 pb-10 mb-10 relative z-10">
        <div className="flex items-center gap-4 text-xs font-mono text-black/40 uppercase tracking-widest mb-4">
          <span>Client Lead Case Study</span>
          <span>•</span>
          <span className="text-black/80">{project.year}</span>
        </div>
        
        <h1 className="font-display text-4xl sm:text-5xl lg:text-[6rem] font-bold tracking-tighter text-black mb-6 uppercase leading-[0.85]">
          {project.title}
        </h1>
        
        <p className="text-lg text-black/70 max-w-3xl leading-relaxed font-sans">
          {project.subtitle}
        </p>
      </div>

      {/* Spec Specs Metric Roster Panel */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12 relative z-10">
        <div className="bg-white border border-black/5 rounded-none p-6 font-sans shadow-sm">
          <div className="text-[10px] sm:text-xs text-black/40 uppercase font-bold mb-2 flex items-center gap-1.5 tracking-widest">
            <Compass className="w-3 h-3" /> CLIENT
          </div>
          <div className="text-lg font-bold text-black">{project.client}</div>
        </div>

        <div className="bg-white border border-black/5 rounded-none p-6 font-sans shadow-sm">
          <div className="text-[10px] sm:text-xs text-black/40 uppercase font-bold mb-2 flex items-center gap-1.5 tracking-widest">
            <Clock className="w-3 h-3 text-emerald-500" /> TIMELINE
          </div>
          <div className="text-lg font-bold text-emerald-600">{project.timeToDeliver}</div>
        </div>

        <div className="bg-white border border-black/5 rounded-none p-6 font-sans shadow-sm">
          <div className="text-[10px] sm:text-xs text-black/40 uppercase font-bold mb-2 flex items-center gap-1.5 tracking-widest">
            <ShieldCheck className="w-3 h-3 text-cyan-500" /> ACCURACY
          </div>
          <div className="text-lg font-bold text-cyan-700">{project.accuracy}</div>
        </div>

        <div className="bg-white border border-black/5 rounded-none p-6 font-sans shadow-sm">
          <div className="text-[10px] sm:text-xs text-black/40 uppercase font-bold mb-2 flex items-center gap-1.5 tracking-widest">
            <Eye className="w-3 h-3 text-amber-500" /> RESOLUTION
          </div>
          <div className="text-lg font-bold text-black">{project.resolution} Code</div>
        </div>
      </div>

      {/* Hero Banner Large Asset */}
      <div className="rounded-none overflow-hidden shadow-2xl shadow-black/10 mb-16 aspect-video relative z-10 bg-[#eaeaea]">
        <img
          src={project.image}
          alt={project.title}
          className="w-full h-full object-cover hover:scale-105 transition-all duration-1000 ease-out"
        />
        <div className="absolute inset-x-0 bottom-0 p-8 bg-gradient-to-t from-black/80 via-black/20 to-transparent">
            <div className="font-mono text-[10px] uppercase tracking-widest text-white/50">
            creo STUDIO // CREATIVE ARCHIVE
            </div>
        </div>
      </div>

      {/* Case sections narrative stream */}
      <div className="space-y-20 mb-20 relative z-10">
        <h2 className="text-xs font-sans font-bold uppercase tracking-[0.2em] text-black/40 mb-10 border-b border-black/10 pb-4">
          Project Details
        </h2>

        {project.sections.map((sect, idx) => (
          <div key={idx} className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Split layout based on index index alternate */}
            <div className={`lg:col-span-5 flex flex-col justify-center ${idx % 2 === 1 ? 'lg:order-2' : ''}`}>
              <div className="font-mono text-[10px] text-black/50 uppercase tracking-widest mb-4 border border-black/10 w-fit px-3 py-1 rounded-none bg-white">
                {sect.badge || `Part 0${idx + 1}`}
              </div>
              <h3 className="font-display font-bold text-3xl uppercase text-black tracking-tight mb-4">
                {sect.title}
              </h3>
              <p className="text-base text-black/60 leading-relaxed font-sans">
                {sect.description}
              </p>
            </div>

            <div className={`lg:col-span-7 relative ${idx % 2 === 1 ? 'lg:order-1' : ''}`}>
              <div className="rounded-none overflow-hidden aspect-[16/10] bg-[#eaeaea] shadow-xl group">
                <img
                  src={sect.image}
                  alt={sect.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000 ease-out"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Action CTA */}
      <div className="bg-white border border-black/5 rounded-none p-10 sm:p-14 text-center max-w-3xl mx-auto shadow-2xl relative z-10 overflow-hidden">
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-[#f7f7f7] rounded-full blur-2xl"></div>
        <span className="font-sans text-xs font-bold text-black/40 uppercase tracking-widest block mb-4">Ready to start?</span>
        <h3 className="font-display text-3xl sm:text-4xl font-bold uppercase tracking-tight text-black mb-6">
          Want a bespoke execution like this?
        </h3>
        <p className="text-sm border-t border-black/5 pt-6 text-black/60 leading-relaxed mb-8 max-w-md mx-auto">
          Take advantage of our 2-day delivery parameters and precise accuracy framework. Let's create your next campaign.
        </p>
        <button
          onClick={onEnquire}
          className="px-8 py-4 bg-black hover:bg-neutral-800 text-white font-sans text-sm font-bold uppercase tracking-widest rounded-none transition-all shadow-md inline-flex items-center gap-2"
        >
          <span>Initiate Campaign Now</span>
          <ArrowUpRight className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
}
