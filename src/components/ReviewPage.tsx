import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Star, Send, ArrowLeft, CheckCircle2, X } from 'lucide-react';
import { Testimonial, ServiceDetail } from '../types';

interface ReviewPageProps {
  services: ServiceDetail[];
  testimonials: Testimonial[];
  onBack: () => void;
  onSubmitReview: (review: Testimonial) => Promise<void>;
}

export default function ReviewPage({ services, testimonials = [], onBack, onSubmitReview }: ReviewPageProps) {
  const [name, setName] = useState('');
  const [service, setService] = useState('');
  const [brandName, setBrandName] = useState('');
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  
  const [hoveredStar, setHoveredStar] = useState<number | null>(null);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  // Added state to toggle form visibility
  const [showForm, setShowForm] = useState(false);

  const averageRating = testimonials.length > 0 
    ? (testimonials.reduce((acc, curr) => acc + curr.rating, 0) / testimonials.length).toFixed(1)
    : "5.0";

  const ratingCounts = [5, 4, 3, 2, 1].map(stars => {
    return testimonials.filter(t => t.rating === stars).length;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !service || !rating) {
      setErrorMsg('Please fill out all required fields.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const newReview: Testimonial = {
        id: crypto.randomUUID(),
        author: name,
        role: service,
        company: brandName || 'Client',
        rating: rating,
        text: reviewText || '',
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&color=fff`
      };

      await onSubmitReview(newReview);
      setIsSuccess(true);
    } catch (err: any) {
      setErrorMsg(err.message || 'Something went wrong. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafa] flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-black/[0.02] rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-black/[0.03] rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none" />

      <div className="w-full max-w-2xl relative z-10">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-black/40 hover:text-black transition-colors mb-12 group uppercase tracking-widest text-xs font-bold"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to site
        </button>

        <AnimatePresence mode="wait">
          {!isSuccess ? (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white p-8 md:p-12 shadow-2xl shadow-black/5 rounded-none border border-black/5"
            >
              <div className="mb-10 text-center">
                <h1 className="font-display text-4xl md:text-5xl font-bold uppercase tracking-tighter text-black mb-4">
                  Client <span className="font-serif italic font-normal text-black/60 lowercase">Reviews</span>
                </h1>
                
                {/* Play Store Style Rating Summary */}
                <div className="flex flex-col md:flex-row items-center justify-center gap-8 mt-8 mb-6 p-6 bg-black/5">
                  <div className="flex flex-col items-center">
                    <span className="font-display text-6xl font-bold">{averageRating}</span>
                    <div className="flex items-center gap-1 my-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star key={star} className={`w-4 h-4 ${star <= Math.round(Number(averageRating)) ? 'fill-black text-black' : 'fill-transparent text-black/20'}`} />
                      ))}
                    </div>
                    <span className="text-xs font-mono uppercase tracking-widest text-black/40">{testimonials.length} Reviews</span>
                  </div>
                  
                  <div className="flex-1 w-full max-w-[250px] space-y-2">
                    {[5, 4, 3, 2, 1].map((stars, index) => {
                      const count = ratingCounts[index];
                      const percentage = testimonials.length > 0 ? (count / testimonials.length) * 100 : 0;
                      return (
                        <div key={stars} className="flex items-center gap-3">
                          <span className="text-xs font-mono text-black/60 w-2">{stars}</span>
                          <div className="flex-1 h-2 bg-black/10 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-black rounded-full" 
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {!showForm && (
                  <button
                    onClick={() => setShowForm(true)}
                    className="mt-4 bg-black text-white px-8 py-4 text-xs font-bold uppercase tracking-widest hover:bg-black/80 transition-all inline-block"
                  >
                    Write a Review
                  </button>
                )}
              </div>

              {errorMsg && (
                <div className="mb-8 p-4 bg-red-50 text-red-600 text-sm font-medium border border-red-100 flex items-center justify-center">
                  {errorMsg}
                </div>
              )}

              <AnimatePresence>
                {showForm && (
                  <motion.form 
                    initial={{ opacity: 0, height: 0, overflow: 'hidden' }}
                    animate={{ opacity: 1, height: 'auto', overflow: 'visible' }}
                    exit={{ opacity: 0, height: 0, overflow: 'hidden' }}
                    onSubmit={handleSubmit} 
                    className="space-y-6 mb-12 border-b border-black/10 pb-12"
                  >
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="font-display text-2xl font-bold uppercase tracking-tight">Leave a Review</h3>
                      <button 
                        type="button" 
                        onClick={() => setShowForm(false)}
                        className="text-black/40 hover:text-black transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-widest text-black/40 mb-2 font-bold">Your Name *</label>
                    <input 
                      type="text" 
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      placeholder="John Doe"
                      className="w-full bg-black/5 border-none px-4 py-3 text-sm focus:ring-1 focus:ring-black outline-none transition-all placeholder:text-black/20"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-widest text-black/40 mb-2 font-bold">Brand Name (Optional)</label>
                    <input 
                      type="text" 
                      value={brandName}
                      onChange={(e) => setBrandName(e.target.value)}
                      placeholder="Your Company"
                      className="w-full bg-black/5 border-none px-4 py-3 text-sm focus:ring-1 focus:ring-black outline-none transition-all placeholder:text-black/20"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-widest text-black/40 mb-2 font-bold">Service Received *</label>
                  <select 
                    value={service}
                    onChange={(e) => setService(e.target.value)}
                    required
                    className="w-full bg-black/5 border-none px-4 py-3 text-sm focus:ring-1 focus:ring-black outline-none transition-all appearance-none text-black cursor-pointer"
                  >
                    <option value="" disabled>Select a service...</option>
                    {services.map(s => (
                      <option key={s.id} value={s.name}>{s.name}</option>
                    ))}
                    <option value="Multiple Services">Multiple Services</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-widest text-black/40 mb-2 font-bold text-center">Your Rating *</label>
                  <div className="flex justify-center gap-2 mb-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onMouseEnter={() => setHoveredStar(star)}
                        onMouseLeave={() => setHoveredStar(null)}
                        onClick={() => setRating(star)}
                        className="p-1 transition-transform hover:scale-110 focus:outline-none"
                      >
                        <Star 
                          className={`w-8 h-8 transition-colors ${
                            star <= (hoveredStar ?? rating) 
                              ? 'fill-black text-black' 
                              : 'fill-transparent text-black/20'
                          }`} 
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-widest text-black/40 mb-2 font-bold">Your Review (Optional)</label>
                  <textarea 
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    placeholder="Tell us about your experience..."
                    rows={4}
                    className="w-full bg-black/5 border-none px-4 py-3 text-sm focus:ring-1 focus:ring-black outline-none transition-all resize-none placeholder:text-black/20"
                  />
                </div>

                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-black text-white px-8 py-4 text-xs font-bold uppercase tracking-widest hover:bg-black/80 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-4"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Review'}
                  {!isSubmitting && <Send className="w-4 h-4" />}
                </button>
              </motion.form>
              )}
              </AnimatePresence>

              {/* Reviews List */}
              <div className="space-y-6">
                <h3 className="font-display text-2xl font-bold uppercase tracking-tight mb-6">Recent Reviews</h3>
                {testimonials.length === 0 ? (
                  <p className="text-black/40 text-sm italic text-center py-8">No reviews yet. Be the first to leave one!</p>
                ) : (
                  testimonials.map(review => (
                    <div key={review.id} className="border border-black/5 p-6 bg-black/[0.02]">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                          <img src={review.avatar} alt={review.author} className="w-10 h-10 rounded-full" />
                          <div>
                            <h4 className="font-bold text-sm">{review.author}</h4>
                            <p className="text-[10px] uppercase tracking-widest text-black/40 font-mono">{review.role} {review.company ? `• ${review.company}` : ''}</p>
                          </div>
                        </div>
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className={`w-3 h-3 ${i < review.rating ? 'fill-black text-black' : 'fill-transparent text-black/20'}`} />
                          ))}
                        </div>
                      </div>
                      {review.text && (
                        <p className="text-sm text-black/70 leading-relaxed font-sans">{review.text}</p>
                      )}
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white p-12 shadow-2xl shadow-black/5 rounded-none border border-black/5 text-center flex flex-col items-center"
            >
              <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mb-6">
                <CheckCircle2 className="w-10 h-10 text-green-500" />
              </div>
              <h2 className="font-display text-3xl font-bold uppercase tracking-tight text-black mb-4">
                Thank You!
              </h2>
              <p className="text-black/60 font-sans mb-8">
                Your review has been successfully submitted. We appreciate your feedback and support.
              </p>
              <button 
                onClick={onBack}
                className="bg-black text-white px-8 py-4 text-xs font-bold uppercase tracking-widest hover:bg-black/80 transition-all"
              >
                Return to Website
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
