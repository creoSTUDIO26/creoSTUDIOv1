import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  LayoutGrid,
  Folder,
  Mail,
  Upload,
  Trash2,
  Edit,
  Plus,
  Check,
  RotateCcw,
  FileText,
  X,
  Image as ImageIcon,
  Video as VideoIcon,
  Play,
  ArrowLeft,
  Settings,
  Database,
  Loader,
  AlertCircle,
  Award,
  Globe
} from 'lucide-react';
import { ServiceDetail, ServiceSubsection, ClientInquiry, ClientProfile, BrandWorkItem, PortfolioProject } from '../types';
import { supabase } from '../lib/supabase';

// Per-service category configs for admin
const ADMIN_CATEGORIES: Record<string, string[]> = {
  'ai-photo-shoot': ['Clothing Shoot', 'Footwear Shoot'],
  'ai-video-shoot': ['Clothing Shoot', 'Footwear Shoot'],
  'e-invitation': ['Still Cards', 'Motion Cards', 'Invitation Website'],
  'catalog': ['PDF', 'Website'],
  'insta-grid-stories': ['Grid', 'Stories', 'Posters', 'Others'],
};

const POPUP_TYPE_OPTIONS: Record<string, { value: string; label: string }[]> = {
  'automation': [
    { value: 'video', label: 'Video Demo' },
    { value: 'pdf', label: 'PDF Document' },
    { value: 'image', label: 'Image / Screenshot' },
    { value: 'text', label: 'Text Content' },
  ],
  'website-design': [
    { value: 'image', label: 'Image / Screenshot' },
    { value: 'video', label: 'Video Walkthrough' },
    { value: 'website-embed', label: 'Embedded Website (iframe)' },
    { value: 'website-link', label: 'Website Link (opens new tab)' },
  ],
  'brand-building': [
    { value: 'image', label: 'Image / Screenshot' },
    { value: 'video', label: 'Video' },
    { value: 'website-embed', label: 'Embedded Website' },
    { value: 'pdf', label: 'PDF Document' },
    { value: 'website-link', label: 'External Link' },
  ],
  'e-invitation': [
    { value: 'pdf', label: 'PDF (Still Invitation)' },
    { value: 'video', label: 'Video (Motion Invitation)' },
    { value: 'website-embed', label: 'Website Invitation (embed)' },
    { value: 'website-link', label: 'Website Invitation (link)' },
  ],
  'catalog': [
    { value: 'pdf', label: 'PDF Catalog' },
    { value: 'video', label: 'Video Showcase' },
    { value: 'website-embed', label: 'Website Catalog (embed)' },
    { value: 'website-link', label: 'Website Catalog (link)' },
  ],
  'insta-grid-stories': [
    { value: 'image', label: 'Image Gallery' },
  ],
};

interface AdminPanelProps {
  key?: React.Key;
  services: ServiceDetail[];
  inquiries: ClientInquiry[];
  clients: ClientProfile[];
  projects: PortfolioProject[];
  updateClients: (clients: ClientProfile[]) => Promise<void>;
  updateProjects: (projects: PortfolioProject[]) => Promise<void>;
  onBack: () => void;
  onRefreshData: () => Promise<void>;
  updateServices: (services: ServiceDetail[]) => Promise<void>;
  deleteInquiry: (id: string) => Promise<void>;
  resetDatabase: () => Promise<void>;
}

type Tab = 'dashboard' | 'services' | 'work' | 'inquiries' | 'brands' | 'projects';

export default function AdminPanel({
  services,
  inquiries,
  clients,
  projects,
  updateClients,
  updateProjects,
  onBack,
  onRefreshData,
  updateServices,
  deleteInquiry,
  resetDatabase
}: AdminPanelProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return sessionStorage.getItem('creo_admin_auth') === 'true';
  });
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState(false);

  const [activeTab, setActiveTab] = useState<Tab>('dashboard');

  // Services Edit State
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);
  const [editTagline, setEditTagline] = useState('');
  const [editImage, setEditImage] = useState('');
  const [editFeatures, setEditFeatures] = useState<string[]>([]);
  const [newFeatureText, setNewFeatureText] = useState('');

  // Subsections Add State
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [selectedServiceId, setSelectedServiceId] = useState(services[0]?.id || '');
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('Clothing Shoot');
  const [newCustomCategory, setNewCustomCategory] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newVisualType, setNewVisualType] = useState<'image' | 'video' | 'automation' | 'pdf' | 'website'>('image');
  const [newVisualUrl, setNewVisualUrl] = useState('');
  const [newMeta, setNewMeta] = useState('');
  const [newOriginalUrls, setNewOriginalUrls] = useState('');
  const [newGeneratedVariants, setNewGeneratedVariants] = useState('');

  // Per-service extra fields
  const [newBrandName, setNewBrandName] = useState('');
  const [newInstaLink, setNewInstaLink] = useState('');
  const [newWebsiteUrl, setNewWebsiteUrl] = useState('');
  const [newPdfUrl, setNewPdfUrl] = useState('');
  const [newPopupType, setNewPopupType] = useState('image');
  const [newSubSubCategory, setNewSubSubCategory] = useState('');

  // Brands/Clients State
  const [editingClientId, setEditingClientId] = useState<string | null>(null);
  const [clientName, setClientName] = useState('');
  const [clientIndustry, setClientIndustry] = useState('');
  const [clientLogo, setClientLogo] = useState('');
  const [clientLogoImage, setClientLogoImage] = useState('');
  const [clientCollaborationYear, setClientCollaborationYear] = useState('');
  const [clientFeatured, setClientFeatured] = useState(false);

  // Brand Work Items Management State
  const [selectedBrandIdForWork, setSelectedBrandIdForWork] = useState<string | null>(null);
  const [newWorkType, setNewWorkType] = useState<'image' | 'video' | 'text'>('image');
  const [newWorkUrl, setNewWorkUrl] = useState('');
  const [newWorkTitle, setNewWorkTitle] = useState('');
  const [newWorkText, setNewWorkText] = useState('');

  // File Upload State
  const [uploadingFile, setUploadingFile] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState(false);

  // Status banners
  const [statusMsg, setStatusMsg] = useState('');
  const [isResetting, setIsResetting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [pendingTabSwitch, setPendingTabSwitch] = useState<Tab | null>(null);

  useEffect(() => {
    if (services.length > 0 && !selectedServiceId) {
      setSelectedServiceId(services[0].id);
    }
  }, [services]);

  // Handle file uploads
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, target: 'visual' | 'original' | 'variant' | 'brand-logo' | 'brand-work' | 'pdf') => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingFile(true);
    setUploadError('');
    setUploadSuccess(false);

    try {
      const uploadedUrls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

        const { data, error } = await supabase.storage
          .from('portfolio-media')
          .upload(fileName, file, { cacheControl: '3600', upsert: false });

        if (error) {
          throw error;
        }

        const { data: { publicUrl } } = supabase.storage
          .from('portfolio-media')
          .getPublicUrl(fileName);

        if (publicUrl) {
          uploadedUrls.push(publicUrl);
          if (target === 'visual' && i === 0) {
            if (files[i].type.startsWith('video/')) setNewVisualType('video');
            else setNewVisualType('image');
          }
          if (target === 'brand-work' && i === 0) {
            if (files[i].type.startsWith('video/')) setNewWorkType('video');
            else setNewWorkType('image');
          }
        } else {
          throw new Error('Failed to retrieve public URL from Supabase.');
        }
      }

      if (target === 'visual') {
        setNewVisualUrl(uploadedUrls[0]);
      } else if (target === 'original') {
        setNewOriginalUrls(prev => prev ? prev + ', ' + uploadedUrls.join(', ') : uploadedUrls.join(', '));
      } else if (target === 'variant') {
        setNewGeneratedVariants(prev => prev ? prev + ', ' + uploadedUrls.join(', ') : uploadedUrls.join(', '));
      } else if (target === 'brand-logo') {
        setClientLogoImage(uploadedUrls[0]);
      } else if (target === 'brand-work') {
        setNewWorkUrl(uploadedUrls[0]);
      } else if (target === 'pdf') {
        setNewPdfUrl(uploadedUrls[0]);
      }

      setUploadSuccess(true);
    } catch (err: any) {
      setUploadError(err.message || 'Error uploading file.');
    } finally {
      setUploadingFile(false);
    }
  };

  const handleEditServiceClick = (service: ServiceDetail) => {
    setEditingServiceId(service.id);
    setEditTagline(service.tagline);
    setEditImage(service.image);
    setEditFeatures([...service.features]);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSaveService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingServiceId) return;

    setIsSaving(true);
    const updatedServices = services.map(s => {
      if (s.id === editingServiceId) {
        return {
          ...s,
          tagline: editTagline,
          image: editImage,
          features: editFeatures
        };
      }
      return s;
    });

    try {
      await updateServices(updatedServices);
      setEditingServiceId(null);
      triggerToast('Service updated successfully!');
    } catch (err) {
      triggerToast('Failed to update service.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddFeature = () => {
    if (newFeatureText.trim() && !editFeatures.includes(newFeatureText.trim())) {
      setEditFeatures([...editFeatures, newFeatureText.trim()]);
      setNewFeatureText('');
    }
  };

  const handleRemoveFeature = (feature: string) => {
    setEditFeatures(editFeatures.filter(f => f !== feature));
  };

  // Which services hide title/description (image-only cards)
  const getExistingCategories = () => {
    const cats = new Set<string>();
    const svc = services.find(s => s.id === selectedServiceId);
    svc?.subsections?.forEach(sub => {
      if (sub.subCategory) cats.add(sub.subCategory);
    });
    return Array.from(cats).length > 0 ? Array.from(cats) : ['General'];
  };

  const isNoTextService = ['e-invitation', 'catalog', 'insta-grid-stories'].includes(selectedServiceId);
  const isShootService = selectedServiceId === 'ai-photo-shoot' || selectedServiceId === 'ai-video-shoot';
  const showBrandName = ['website-design', 'brand-building', 'ai-photo-shoot', 'ai-video-shoot'].includes(selectedServiceId);
  const showInstaLink = ['brand-building', 'insta-grid-stories'].includes(selectedServiceId);
  const showWebsiteUrl = ['website-design', 'brand-building', 'e-invitation', 'catalog'].includes(selectedServiceId) || newVisualType === 'website' || newPopupType === 'website-link' || newPopupType === 'website-embed' || newVisualType === 'automation';
  const showPdfUrl = ['brand-building', 'e-invitation', 'catalog'].includes(selectedServiceId) || newVisualType === 'pdf' || newPopupType === 'pdf';
  const showPopupType = !!POPUP_TYPE_OPTIONS[selectedServiceId];
  const showSubSubCategory = selectedServiceId === 'e-invitation';
  const adminCats = ADMIN_CATEGORIES[selectedServiceId];

  const handleEditSubsection = (item: ServiceSubsection, serviceId: string) => {
    const targetId = item.id || `work_${Date.now()}`;
    if (!item.id) {
      item.id = targetId; // Mutate to ensure save works
    }

    setSelectedServiceId(serviceId);
    setEditingItemId(targetId);

    setNewTitle(item.title || '');
    setNewDescription(item.description || '');
    setNewVisualType(item.visualType || 'image');
    setNewVisualUrl(item.visualUrl || '');
    setNewMeta(item.meta || '');
    setNewOriginalUrls(item.originalUrls ? item.originalUrls.join(', ') : '');
    setNewGeneratedVariants(item.generatedVariants ? item.generatedVariants.join(', ') : '');
    setNewBrandName(item.brandName || '');
    setNewInstaLink(item.instaLink || '');
    setNewWebsiteUrl(item.websiteUrl || '');
    setNewPdfUrl(item.pdfUrl || '');
    setNewPopupType(item.popupType || 'image');
    setNewSubSubCategory(item.subSubCategory || '');

    const standardCats = ADMIN_CATEGORIES[serviceId] || ['General'];
    if (item.subCategory && !standardCats.includes(item.subCategory) && item.subCategory !== 'General') {
      setNewCategory('Custom');
      setNewCustomCategory(item.subCategory);
    } else {
      setNewCategory(item.subCategory || 'General');
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingItemId(null);
    setNewTitle(''); setNewDescription(''); setNewVisualUrl(''); setNewMeta('');
    setNewCustomCategory(''); setNewOriginalUrls(''); setNewGeneratedVariants('');
    setNewBrandName(''); setNewInstaLink(''); setNewWebsiteUrl(''); setNewPdfUrl('');
    setNewPopupType('image'); setNewSubSubCategory('');
  };

  const handleAddSubsection = async (e: React.FormEvent) => {
    e.preventDefault();
    // For no-text services, auto-generate title
    const finalTitle = isNoTextService ? (newCategory + (newSubSubCategory ? ' - ' + newSubSubCategory : '') + ' #' + Date.now().toString().slice(-4)) : newTitle;
    const finalDesc = isNoTextService ? (newCategory || 'Work item') : newDescription;
    if (!isNoTextService && (!newTitle || !newDescription)) return;

    setIsSaving(true);
    const finalCategory = newCategory === 'Custom' ? (newCustomCategory.trim() || 'General') : newCategory;
    const finalUrl = newVisualUrl.trim() || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=800";

    const originalUrlsArray = newOriginalUrls.split(',').map(s => s.trim()).filter(Boolean);
    const generatedVariantsArray = newGeneratedVariants.split(',').map(s => s.trim()).filter(Boolean);

    const newSection: ServiceSubsection = {
      id: editingItemId || "work-" + Date.now().toString(36),
      title: finalTitle,
      description: finalDesc,
      visualUrl: finalUrl,
      visualType: newVisualType,
      meta: newMeta || undefined,
      subCategory: finalCategory,
      originalUrls: originalUrlsArray.length > 0 ? originalUrlsArray : undefined,
      generatedVariants: generatedVariantsArray.length > 0 ? generatedVariantsArray : undefined,
      brandName: newBrandName.trim() || undefined,
      instaLink: newInstaLink.trim() || undefined,
      websiteUrl: newWebsiteUrl.trim() || undefined,
      pdfUrl: newPdfUrl.trim() || undefined,
      popupType: (newPopupType as ServiceSubsection['popupType']) || undefined,
      subSubCategory: newSubSubCategory.trim() || undefined,
    };

    const updatedServices = services.map(s => {
      if (s.id === selectedServiceId) {
        if (editingItemId) {
          return {
            ...s,
            subsections: s.subsections.map(sub => sub.id === editingItemId ? newSection : sub)
          };
        }
        return { ...s, subsections: [newSection, ...s.subsections] };
      }
      return s;
    });

    try {
      await updateServices(updatedServices);
      handleCancelEdit();
      setUploadSuccess(false);
      triggerToast(editingItemId ? 'Work updated successfully!' : 'Work published successfully!');
    } catch (err) {
      triggerToast('Failed to save work item.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemoveSubsection = async (serviceId: string, indexToRemove: number) => {
    if (!window.confirm('Are you sure you want to remove this work sample?')) return;

    setIsSaving(true);
    const updatedServices = services.map(s => {
      if (s.id === serviceId) {
        const newSubsecs = [...s.subsections];
        newSubsecs.splice(indexToRemove, 1);
        return {
          ...s,
          subsections: newSubsecs
        };
      }
      return s;
    });

    try {
      await updateServices(updatedServices);
      triggerToast('Work sample removed.');
    } catch (err) {
      triggerToast('Failed to remove work sample.');
    } finally {
      setIsSaving(false);
    }
  };

  // Save Brand Handler
  const handleSaveBrand = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim() || !clientLogo.trim() || !clientIndustry.trim()) {
      triggerToast('Please fill all required brand fields.');
      return;
    }

    setIsSaving(true);
    let updatedClients: ClientProfile[];

    if (editingClientId) {
      updatedClients = clients.map(c => {
        if (c.id === editingClientId) {
          return {
            ...c,
            name: clientName.trim(),
            industry: clientIndustry.trim(),
            logo: clientLogo.trim(),
            logoImage: clientLogoImage.trim() || undefined,
            collaborationYear: clientCollaborationYear.trim() || new Date().getFullYear().toString(),
            featured: clientFeatured
          };
        }
        return c;
      });
    } else {
      const newBrand: ClientProfile = {
        id: "brand-" + Date.now().toString().slice(-6),
        name: clientName.trim(),
        industry: clientIndustry.trim(),
        logo: clientLogo.trim(),
        logoImage: clientLogoImage.trim() || undefined,
        collaborationYear: clientCollaborationYear.trim() || new Date().getFullYear().toString(),
        featured: clientFeatured,
        workItems: []
      };
      updatedClients = [...clients, newBrand];
    }

    try {
      await updateClients(updatedClients);
      setEditingClientId(null);
      setClientName('');
      setClientIndustry('');
      setClientLogo('');
      setClientLogoImage('');
      setClientCollaborationYear('');
      setClientFeatured(false);
      setUploadSuccess(false);
      triggerToast(editingClientId ? 'Brand updated successfully!' : 'Brand added successfully!');
    } catch (err) {
      triggerToast('Failed to save brand.');
    } finally {
      setIsSaving(false);
    }
  };

  // Populate Brand Edit Form
  const handleEditBrandClick = (client: ClientProfile) => {
    setEditingClientId(client.id);
    setClientName(client.name);
    setClientIndustry(client.industry);
    setClientLogo(client.logo);
    setClientLogoImage(client.logoImage || '');
    setClientCollaborationYear(client.collaborationYear);
    setClientFeatured(client.featured);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Delete Brand Handler
  const handleRemoveBrand = async (id: string) => {
    if (!window.confirm('Are you sure you want to remove this brand?')) return;
    setIsSaving(true);
    const updated = clients.filter(c => c.id !== id);
    try {
      await updateClients(updated);
      if (selectedBrandIdForWork === id) {
        setSelectedBrandIdForWork(null);
      }
      triggerToast('Brand removed successfully.');
    } catch (err) {
      triggerToast('Failed to remove brand.');
    } finally {
      setIsSaving(false);
    }
  };

  // Add Brand Work Item
  const handleAddBrandWorkItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBrandIdForWork) return;

    if (newWorkType !== 'text' && !newWorkUrl.trim()) {
      triggerToast('Media URL or file upload is required for image/video items.');
      return;
    }

    setIsSaving(true);
    const newWorkItem: BrandWorkItem = {
      id: "work-" + Date.now().toString().slice(-6),
      type: newWorkType,
      url: newWorkType !== 'text' ? newWorkUrl.trim() : undefined,
      title: newWorkTitle.trim() || undefined,
      text: newWorkText.trim() || undefined
    };

    const updated = clients.map(c => {
      if (c.id === selectedBrandIdForWork) {
        return {
          ...c,
          workItems: [...(c.workItems || []), newWorkItem]
        };
      }
      return c;
    });

    try {
      await updateClients(updated);
      setNewWorkUrl('');
      setNewWorkTitle('');
      setNewWorkText('');
      setUploadSuccess(false);
      triggerToast('Brand work item published.');
    } catch (err) {
      triggerToast('Failed to add brand work item.');
    } finally {
      setIsSaving(false);
    }
  };

  // Delete Brand Work Item
  const handleRemoveBrandWorkItem = async (brandId: string, itemId: string) => {
    if (!window.confirm('Delete this brand work item?')) return;
    setIsSaving(true);
    const updated = clients.map(c => {
      if (c.id === brandId) {
        return {
          ...c,
          workItems: (c.workItems || []).filter(item => item.id !== itemId)
        };
      }
      return c;
    });

    try {
      await updateClients(updated);
      triggerToast('Brand work item removed.');
    } catch (err) {
      triggerToast('Failed to remove brand work item.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteInquiryClick = async (id: string) => {
    if (!window.confirm('Delete this inquiry?')) return;

    try {
      await deleteInquiry(id);
      triggerToast('Inquiry removed.');
    } catch (err) {
      triggerToast('Failed to delete inquiry.');
    }
  };

  const handleResetClick = async () => {
    if (!window.confirm('WARNING: This will reset all service details, work subsections, and inquiries to default values. Continue?')) return;

    setIsResetting(true);
    try {
      await resetDatabase();
      triggerToast('Database reset to defaults.');
    } catch (err) {
      triggerToast('Failed to reset database.');
    } finally {
      setIsResetting(false);
    }
  };

  const handleTabSwitch = (newTab: Tab) => {
    if (editingItemId || editingServiceId || editingClientId || (activeTab === 'work' && newTitle) || (activeTab === 'brands' && clientName)) {
      setPendingTabSwitch(newTab);
      return;
    }
    
    executeTabSwitch(newTab);
  };

  const executeTabSwitch = (newTab: Tab) => {
    // Reset forms state
    if (typeof handleCancelEdit === 'function') handleCancelEdit();
    setEditingServiceId(null);
    setEditingClientId(null);
    setSelectedBrandIdForWork(null);
    
    // Brand Form Reset
    setClientName('');
    setClientIndustry('');
    setClientLogo('');
    setClientLogoImage('');
    setClientCollaborationYear('');
    setClientFeatured(false);

    setActiveTab(newTab);
    setPendingTabSwitch(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const triggerToast = (msg: string) => {
    setStatusMsg(msg);
    setTimeout(() => setStatusMsg(''), 3000);
  };

  // Total stats helper
  const totalWorkSections = services.reduce((acc, s) => acc + (s.subsections?.length || 0), 0);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6 relative overflow-hidden font-sans">
        <div className="absolute inset-0 pointer-events-none opacity-20">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-[#007A93]/10 blur-3xl"></div>
          <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] rounded-full bg-emerald-500/10 blur-3xl"></div>
        </div>
        
        <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl shadow-2xl p-8 md:p-12 w-full max-w-md relative z-10 text-center">
           <div className="flex items-center justify-center gap-3 mb-6">
              <Settings className="w-8 h-8 text-[#007A93] animate-spin-slow" />
              <h1 className="font-display text-2xl font-bold tracking-tight uppercase text-white">
                STUDIO<span className="font-serif italic font-normal text-white/50 lowercase ml-1">portal</span>
              </h1>
           </div>
           <p className="font-mono text-[10px] text-white/40 uppercase tracking-[0.2em] mb-10">Restricted Access Area</p>

           <form onSubmit={(e) => {
             e.preventDefault();
             if (username === 'CREOSTUDIO@admin' && password === 'CS@admin26') {
               setIsAuthenticated(true);
               sessionStorage.setItem('creo_admin_auth', 'true');
               setLoginError(false);
             } else {
               setLoginError(true);
             }
           }} className="space-y-6 text-left">
              <div>
                <label className="block font-mono text-[10px] text-white/60 uppercase tracking-widest mb-2">User ID</label>
                <input 
                  type="text" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 focus:border-[#007A93] text-white px-4 py-3 rounded-none outline-none transition-colors font-mono text-xs" 
                  placeholder="Enter admin ID"
                />
              </div>
              <div>
                <label className="block font-mono text-[10px] text-white/60 uppercase tracking-widest mb-2">Password</label>
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 focus:border-[#007A93] text-white px-4 py-3 rounded-none outline-none transition-colors font-mono text-xs" 
                  placeholder="Enter password"
                />
              </div>
              {loginError && (
                <p className="text-rose-500 font-mono text-[10px] uppercase text-center mt-2">Invalid Credentials</p>
              )}
              <button 
                type="submit" 
                className="w-full bg-white text-black font-bold uppercase tracking-widest text-xs py-4 hover:bg-gray-200 transition-colors mt-8"
              >
                Authenticate
              </button>
           </form>
           
           <button onClick={onBack} className="mt-8 font-mono text-[10px] text-white/40 hover:text-white uppercase transition-colors">
              &larr; Return to Website
           </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 selection:bg-gray-900 selection:text-white font-sans relative pb-20">

      {/* Background aesthetics */}
      <div className="absolute inset-0 pointer-events-none opacity-20 overflow-hidden z-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-none bg-emerald-500/10 blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] rounded-none bg-[#007A93]/5 blur-3xl"></div>
      </div>

      {/* Admin Header Banner */}
      <header className="sticky top-0 z-30 w-full bg-white/90 backdrop-blur-md border-b border-gray-300 px-6 py-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="p-2 bg-gray-100 hover:bg-gray-200 rounded-none text-gray-700 hover:text-gray-900 transition-all cursor-pointer mr-2"
              title="Return to Site"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <Settings className="w-6 h-6 text-[#007A93] animate-spin-slow" />
              <h1 className="font-display text-xl sm:text-2xl font-bold tracking-tight uppercase">
                STUDIO<span className="font-serif italic font-normal text-gray-600 lowercase ml-1">portal</span>
              </h1>
            </div>
            <span className="bg-gray-200 border border-gray-200 px-2.5 py-0.5 rounded-none text-[10px] font-mono tracking-widest text-[#007A93] uppercase ml-2 hidden xs:inline-block">
              DB LIVE // V4
            </span>
          </div>

          <div className="flex items-center gap-4 font-mono text-[10px] uppercase tracking-widest text-gray-500">
            <span className="hidden sm:inline">Uptime: 100%</span>
            <button
              onClick={() => {
                sessionStorage.removeItem('creo_admin_auth');
                setIsAuthenticated(false);
              }}
              className="px-3 py-1.5 border border-gray-300 hover:bg-gray-100 hover:text-gray-900 transition-colors cursor-pointer"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Toast Alert */}
      <AnimatePresence>
        {statusMsg && (
          <motion.div
            initial={{ opacity: 0, y: -50, x: '-50%' }}
            animate={{ opacity: 1, y: 20, x: '-50%' }}
            exit={{ opacity: 0, y: -50, x: '-50%' }}
            className="fixed top-0 left-1/2 z-50 bg-[#007A93] text-gray-900 text-xs font-mono font-bold uppercase tracking-widest px-6 py-3 rounded-none shadow-2xl max-w-sm text-center"
          >
            {statusMsg}
          </motion.div>
        )}
      </AnimatePresence>

      <main className="relative z-10 max-w-7xl mx-auto px-6 mt-10">

        {/* Layout Grid: Navigation Sidebar & Content Body */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* Sidebar Nav */}
          <nav className="lg:col-span-3 flex flex-row lg:flex-col overflow-x-auto lg:overflow-x-visible gap-2 bg-white border border-gray-200 p-2 rounded-none w-full">
            <button
              onClick={() => handleTabSwitch('dashboard')}
              className={`flex items-center gap-3 px-4 py-3 rounded-none text-xs font-mono font-bold uppercase tracking-wider transition-all w-full text-left whitespace-nowrap cursor-pointer ${activeTab === 'dashboard' ? 'bg-[#007A93] text-gray-900' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
            >
              <LayoutGrid className="w-4 h-4" />
              <span>Dashboard</span>
            </button>

            <button
              onClick={() => handleTabSwitch('services')}
              className={`flex items-center gap-3 px-4 py-3 rounded-none text-xs font-mono font-bold uppercase tracking-wider transition-all w-full text-left whitespace-nowrap cursor-pointer ${activeTab === 'services' ? 'bg-[#007A93] text-gray-900' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
            >
              <FileText className="w-4 h-4" />
              <span>Services List</span>
            </button>

            <button
              onClick={() => handleTabSwitch('work')}
              className={`flex items-center gap-3 px-4 py-3 rounded-none text-xs font-mono font-bold uppercase tracking-wider transition-all w-full text-left whitespace-nowrap cursor-pointer ${activeTab === 'work' ? 'bg-[#007A93] text-gray-900' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
            >
              <Folder className="w-4 h-4" />
              <span>Publish Work</span>
            </button>

            <button
              onClick={() => handleTabSwitch('brands')}
              className={`flex items-center gap-3 px-4 py-3 rounded-none text-xs font-mono font-bold uppercase tracking-wider transition-all w-full text-left whitespace-nowrap cursor-pointer ${activeTab === 'brands' ? 'bg-[#007A93] text-gray-900' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
            >
              <Award className="w-4 h-4" />
              <span>Brands List</span>
            </button>

            <button
              onClick={() => handleTabSwitch('inquiries')}
              className={`flex items-center justify-between px-4 py-3 rounded-none text-xs font-mono font-bold uppercase tracking-wider transition-all w-full text-left whitespace-nowrap cursor-pointer ${activeTab === 'inquiries' ? 'bg-[#007A93] text-gray-900' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
            >
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4" />
                <span>Leads Box</span>
              </div>
              {inquiries.length > 0 && (
                <span className="bg-gray-900 text-white text-[10px] px-2 py-0.5 rounded-none font-bold">
                  {inquiries.length}
                </span>
              )}
            </button>

            <button
              onClick={() => handleTabSwitch('projects')}
              className={`flex items-center gap-3 px-4 py-3 rounded-none text-xs font-mono font-bold uppercase tracking-wider transition-all w-full text-left whitespace-nowrap cursor-pointer ${activeTab === 'projects' ? 'bg-[#007A93] text-gray-900' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
            >
              <LayoutGrid className="w-4 h-4" />
              <span>Landing Projects</span>
            </button>
          </nav>

          {/* Main Content Area */}
          <div className="lg:col-span-9 bg-white border border-gray-200 rounded-none p-6 sm:p-8 min-h-[500px]">

            {/* TAB 1: DASHBOARD */}
            {activeTab === 'dashboard' && (
              <div className="space-y-8 animate-fadeIn">
                <div className="border-b border-gray-300 pb-6">
                  <h2 className="font-display text-2xl font-bold uppercase tracking-tight">System Overview</h2>
                  <p className="text-gray-500 text-xs font-sans mt-1">Real-time status parameters and portfolio statistics.</p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                  <div className="bg-gray-50 border border-gray-200 rounded-none p-5 text-center">
                    <span className="block font-mono text-[10px] text-gray-500 uppercase tracking-widest mb-1">SERVICES</span>
                    <span className="font-display text-3xl font-bold text-[#007A93]">{services.length}</span>
                  </div>

                  <div className="bg-gray-50 border border-gray-200 rounded-none p-5 text-center">
                    <span className="block font-mono text-[10px] text-gray-500 uppercase tracking-widest mb-1">WORK ITEMS</span>
                    <span className="font-display text-3xl font-bold text-[#007A93]">{totalWorkSections}</span>
                  </div>

                  <div className="bg-gray-50 border border-gray-200 rounded-none p-5 text-center">
                    <span className="block font-mono text-[10px] text-gray-500 uppercase tracking-widest mb-1">BRANDS</span>
                    <span className="font-display text-3xl font-bold text-[#007A93]">{clients.length}</span>
                  </div>

                  <div className="bg-gray-50 border border-gray-200 rounded-none p-5 text-center">
                    <span className="block font-mono text-[10px] text-gray-500 uppercase tracking-widest mb-1">LEADS</span>
                    <span className="font-display text-3xl font-bold text-[#007A93]">{inquiries.length}</span>
                  </div>

                  <div className="bg-gray-50 border border-gray-200 rounded-none p-5 text-center col-span-2 sm:col-span-1">
                    <span className="block font-mono text-[10px] text-gray-500 uppercase tracking-widest mb-1">DB STATE</span>
                    <span className="font-display text-xs font-bold text-emerald-400 uppercase tracking-widest flex items-center justify-center gap-1.5 h-9">
                      <Database className="w-3.5 h-3.5 fill-emerald-500/20" /> PERSISTENT
                    </span>
                  </div>
                </div>

                {/* Database Operations */}
                <div className="bg-gray-50 border border-gray-200 rounded-none p-6">
                  <h3 className="font-mono text-xs font-bold uppercase text-[#007A93] tracking-widest mb-2">System Operations</h3>
                  <p className="text-gray-600 text-xs leading-relaxed mb-6 font-sans">
                    Warning: resetting the database will overwrite all your customized portfolio entries, uploads, and contact forms, restoring the static creo STUDIO defaults.
                  </p>

                  <button
                    onClick={handleResetClick}
                    disabled={isResetting}
                    className="bg-transparent border border-red-500/30 hover:border-red-500 text-red-400 hover:text-red-300 transition-all font-mono text-xs font-bold uppercase tracking-widest px-6 py-3.5 rounded-none cursor-pointer flex items-center gap-2 disabled:opacity-50"
                  >
                    {isResetting ? (
                      <>
                        <Loader className="w-4 h-4 animate-spin" />
                        <span>Resetting...</span>
                      </>
                    ) : (
                      <>
                        <RotateCcw className="w-4 h-4" />
                        <span>Reset Database to Default</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* TAB 2: SERVICES EDITOR */}
            {activeTab === 'services' && (
              <div className="space-y-8 animate-fadeIn">
                <div className="border-b border-gray-300 pb-6">
                  <h2 className="font-display text-2xl font-bold uppercase tracking-tight">Services Editor</h2>
                  <p className="text-gray-500 text-xs font-sans mt-1">Modify tagline descriptions, features list, and hero images for service pages.</p>
                </div>

                {editingServiceId ? (
                  <form onSubmit={handleSaveService} className="space-y-6">
                    <div className="flex items-center justify-between border-b border-gray-200 pb-4">
                      <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-[#007A93]">
                        Editing {services.find(s => s.id === editingServiceId)?.name}
                      </h3>
                      <button
                        type="button"
                        onClick={() => setEditingServiceId(null)}
                        className="text-gray-500 hover:text-gray-900 p-2 rounded-none hover:bg-gray-100 cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono uppercase tracking-widest text-gray-500 mb-2">Tagline Description *</label>
                      <textarea
                        value={editTagline}
                        onChange={(e) => setEditTagline(e.target.value)}
                        required
                        rows={3}
                        className="w-full bg-gray-50 border border-gray-300 rounded-none px-4 py-3 text-sm focus:border-white focus:outline-none text-gray-900 font-mono transition-all resize-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono uppercase tracking-widest text-gray-500 mb-2">Service Cover Image URL *</label>
                      <input
                        type="text"
                        value={editImage}
                        onChange={(e) => setEditImage(e.target.value)}
                        required
                        className="w-full bg-gray-50 border border-gray-300 rounded-none px-4 py-3 text-sm focus:border-white focus:outline-none text-gray-900 font-mono transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono uppercase tracking-widest text-gray-500 mb-2">Service Features</label>
                      <div className="flex flex-wrap gap-2 mb-4 bg-gray-50 border border-gray-200 p-4 rounded-none">
                        {editFeatures.length === 0 ? (
                          <span className="text-gray-400 text-xs font-sans">No features listed.</span>
                        ) : (
                          editFeatures.map((feat, idx) => (
                            <span key={idx} className="bg-gray-100 border border-gray-200 rounded-none px-3 py-1 text-xs text-gray-800 font-sans flex items-center gap-1.5">
                              {feat}
                              <button
                                type="button"
                                onClick={() => handleRemoveFeature(feat)}
                                className="text-gray-400 hover:text-red-400 p-0.5 rounded-none cursor-pointer transition-colors"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </span>
                          ))
                        )}
                      </div>

                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newFeatureText}
                          onChange={(e) => setNewFeatureText(e.target.value)}
                          placeholder="Add new feature..."
                          className="flex-1 bg-gray-50 border border-gray-300 rounded-none px-4 py-3 text-sm focus:border-white focus:outline-none text-gray-900 font-mono transition-all"
                        />
                        <button
                          type="button"
                          onClick={handleAddFeature}
                          className="bg-gray-900 text-white hover:bg-gray-800 px-5 rounded-none font-mono text-xs font-bold uppercase tracking-widest cursor-pointer transition-all flex items-center gap-1"
                        >
                          <Plus className="w-4 h-4" /> Add
                        </button>
                      </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
                      <button
                        type="button"
                        onClick={() => setEditingServiceId(null)}
                        className="px-6 py-3.5 text-xs font-mono font-bold uppercase tracking-wider text-gray-500 hover:text-gray-900 rounded-none bg-transparent transition-all cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isSaving}
                        className="px-6 py-3.5 text-xs font-mono font-bold uppercase tracking-wider bg-gray-900 text-white hover:bg-gray-800 rounded-none transition-all cursor-pointer shadow-md flex items-center gap-2 disabled:opacity-50"
                      >
                        {isSaving && <Loader className="w-4 h-4 animate-spin" />}
                        <span>Save Changes</span>
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-4">
                    {services.map((s) => (
                      <div key={s.id} className="bg-gray-50 border border-gray-200 p-5 rounded-none flex items-center justify-between gap-6">
                        <div className="flex items-center gap-4">
                          <img src={s.image} alt={s.name} className="w-16 h-12 object-cover rounded-none bg-gray-200" />
                          <div>
                            <h3 className="font-display text-base font-bold uppercase text-gray-900">{s.name}</h3>
                            <span className="font-mono text-[10px] text-[#007A93] tracking-widest uppercase">0{s.count} // {s.subsections?.length || 0} items</span>
                          </div>
                        </div>

                        <button
                          onClick={() => handleEditServiceClick(s)}
                          className="p-3 bg-gray-100 hover:bg-gray-200 rounded-none text-gray-700 hover:text-gray-900 transition-all cursor-pointer flex items-center gap-1 text-xs font-mono uppercase tracking-wider border border-gray-200"
                        >
                          <Edit className="w-3.5 h-3.5" /> Edit
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: PUBLISH WORK (SUBSECTIONS) */}
            {activeTab === 'work' && (
              <div className="space-y-8 animate-fadeIn">
                <div className="border-b border-gray-300 pb-6">
                  <h2 className="font-display text-2xl font-bold uppercase tracking-tight">Publish Work</h2>
                  <p className="text-gray-500 text-xs font-sans mt-1">Upload files and add new categorized work subsections to service pages.</p>
                </div>

                <form onSubmit={handleAddSubsection} className="space-y-6">

                  {/* Select Service */}
                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-widest text-gray-500 mb-2 font-bold">Target Service Page *</label>
                    <select
                      value={selectedServiceId}
                      onChange={(e) => setSelectedServiceId(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-300 rounded-none px-4 py-3.5 text-sm focus:border-white focus:outline-none text-gray-900 font-mono transition-all cursor-pointer"
                    >
                      {services.map(s => (
                        <option key={s.id} value={s.id}>
                          {s.name} (0{s.count})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Category - dynamic per service */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Title - hidden for no-text services */}
                    {!isNoTextService && (
                      <div>
                        <label className="block text-[10px] font-mono uppercase tracking-widest text-gray-500 mb-2 font-bold">Project / Asset Title *</label>
                        <input type="text" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} required placeholder="e.g. Model Autumn Coat Shoot" className="w-full bg-gray-50 border border-gray-300 rounded-none px-4 py-3 text-sm focus:border-white focus:outline-none text-gray-900 font-mono transition-all placeholder:text-gray-400" />
                      </div>
                    )}

                    {/* Category selector */}
                    <div>
                      <label className="block text-[10px] font-mono uppercase tracking-widest text-gray-500 mb-2 font-bold">Category{adminCats ? ' *' : ''}</label>
                      <div className="flex gap-2">
                        <select value={newCategory} onChange={(e) => setNewCategory(e.target.value)} disabled={!adminCats && !isShootService} className={`flex-1 bg-gray-50 border border-gray-300 rounded-none px-4 py-3 text-sm focus:border-white focus:outline-none text-gray-900 font-mono transition-all ${!adminCats && !isShootService ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
                          {(adminCats || getExistingCategories()).map((cat, idx) => (
                            <option key={idx} value={cat}>{cat}</option>
                          ))}
                          <option value="Custom">+ Create New Category...</option>
                        </select>
                        {newCategory === 'Custom' && (
                          <input type="text" value={newCustomCategory} onChange={(e) => setNewCustomCategory(e.target.value)} required placeholder="New category name" className="flex-1 bg-gray-50 border border-gray-300 rounded-none px-4 py-3 text-sm focus:border-white focus:outline-none text-gray-900 font-mono transition-all placeholder:text-gray-400" />
                        )}
                      </div>
                    </div>

                    {/* Sub-sub category (E-Invitation) */}
                    {showSubSubCategory && (
                      <div>
                        <label className="block text-[10px] font-mono uppercase tracking-widest text-gray-500 mb-2 font-bold">Event Type</label>
                        <div className="flex gap-2">
                          <select value={newSubSubCategory} onChange={(e) => setNewSubSubCategory(e.target.value)} className="flex-1 bg-gray-50 border border-gray-300 rounded-none px-4 py-3 text-sm focus:border-white focus:outline-none text-gray-900 font-mono transition-all cursor-pointer">
                            <option value="Wedding">Wedding</option>
                            <option value="Other Function">Other Function</option>
                            <option value="Custom">+ Custom...</option>
                          </select>
                          {newSubSubCategory === 'Custom' && (
                            <input type="text" onChange={(e) => setNewSubSubCategory(e.target.value)} placeholder="Custom event type" className="flex-1 bg-gray-50 border border-gray-300 rounded-none px-4 py-3 text-sm focus:border-white focus:outline-none text-gray-900 font-mono transition-all placeholder:text-gray-400" />
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Description - hidden for no-text services */}
                  {!isNoTextService && (
                    <div>
                      <label className="block text-[10px] font-mono uppercase tracking-widest text-gray-500 mb-2 font-bold">Description / What We Did *</label>
                      <textarea value={newDescription} onChange={(e) => setNewDescription(e.target.value)} required rows={3} placeholder="What was done for this client..." className="w-full bg-gray-50 border border-gray-300 rounded-none px-4 py-3 text-sm focus:border-white focus:outline-none text-gray-900 font-mono transition-all resize-none placeholder:text-gray-400" />
                    </div>
                  )}

                  {/* Per-service extra fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {showBrandName && (
                      <div>
                        <label className="block text-[10px] font-mono uppercase tracking-widest text-gray-500 mb-2 font-bold">Brand / Client Name</label>
                        <input type="text" list="client-brands-list" value={newBrandName} onChange={(e) => setNewBrandName(e.target.value)} placeholder="e.g., LUXE Fashion" className="w-full bg-gray-50 border border-gray-300 rounded-none px-4 py-3 text-sm focus:border-white focus:outline-none text-gray-900 font-mono transition-all placeholder:text-gray-400" />
                        <datalist id="client-brands-list">
                          {clients.map(c => (
                            <option key={c.id} value={c.name} />
                          ))}
                        </datalist>
                      </div>
                    )}
                    {showInstaLink && (
                      <div>
                        <label className="block text-[10px] font-mono uppercase tracking-widest text-gray-500 mb-2 font-bold">Instagram Link</label>
                        <input type="url" value={newInstaLink} onChange={(e) => setNewInstaLink(e.target.value)} placeholder="https://instagram.com/..." className="w-full bg-gray-50 border border-gray-300 rounded-none px-4 py-3 text-sm focus:border-white focus:outline-none text-gray-900 font-mono transition-all placeholder:text-gray-400" />
                      </div>
                    )}

                    {showPopupType && (
                      <div>
                        <label className="block text-[10px] font-mono uppercase tracking-widest text-gray-500 mb-2 font-bold">Popup Display Type</label>
                        <select value={newPopupType} onChange={(e) => setNewPopupType(e.target.value)} className="w-full bg-gray-50 border border-gray-300 rounded-none px-4 py-3.5 text-sm focus:border-white focus:outline-none text-gray-900 font-mono transition-all cursor-pointer">
                          {(POPUP_TYPE_OPTIONS[selectedServiceId] || [{ value: 'image', label: 'Image' }]).map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>

                  {/* Visual Type & Meta */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-[10px] font-mono uppercase tracking-widest text-gray-500 mb-2 font-bold">Visual Content Type</label>
                      <select value={newVisualType} onChange={(e) => setNewVisualType(e.target.value as any)} className="w-full bg-gray-50 border border-gray-300 rounded-none px-4 py-3.5 text-sm focus:border-white focus:outline-none text-gray-900 font-mono transition-all cursor-pointer">
                        <option value="image">Still Image</option>
                        <option value="video">Video</option>
                        <option value="automation">Automation Flow</option>
                        <option value="pdf">PDF Document</option>
                        <option value="website">Website</option>
                        <option value="text">Text Content</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-mono uppercase tracking-widest text-gray-500 mb-2 font-bold">Meta / Specs (Optional)</label>
                      <input type="text" value={newMeta} onChange={(e) => setNewMeta(e.target.value)} placeholder="e.g., Format: 2K Video // 24 FPS" className="w-full bg-gray-50 border border-gray-300 rounded-none px-4 py-3 text-sm focus:border-white focus:outline-none text-gray-900 font-mono transition-all placeholder:text-gray-400" />
                    </div>
                  </div>

                  {/* File Upload / Visual URL */}
                  <div className="bg-gray-50 border border-gray-200 p-6 rounded-none space-y-4">
                    <div className="flex items-center justify-between border-b border-gray-200 pb-3">
                      <span className="font-mono text-xs font-bold uppercase text-[#007A93] tracking-widest">Media Storage</span>
                      <span className="text-[10px] font-sans text-gray-500">Upload cover image or paste URL</span>
                    </div>
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                        <div className="md:col-span-4">
                          <label className="bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-none p-4 flex flex-col items-center justify-center text-center cursor-pointer transition-all select-none">
                            {uploadingFile ? <Loader className="w-5 h-5 animate-spin mb-1" /> : <Upload className="w-5 h-5 text-gray-600 mb-1" />}
                            <span className="text-[10px] font-mono font-bold uppercase tracking-wider">Cover Media</span>
                            <input type="file" accept="image/*,video/*" onChange={(e) => handleFileUpload(e, 'visual')} disabled={uploadingFile} className="hidden" />
                          </label>
                        </div>
                        <div className="md:col-span-8">
                          <label className="block text-[9px] font-mono uppercase text-gray-500 mb-1">Visual Cover URL</label>
                          <input type="text" value={newVisualUrl} onChange={(e) => setNewVisualUrl(e.target.value)} placeholder="Main cover media URL" className="w-full bg-gray-50 border border-gray-300 px-4 py-2 text-xs focus:border-white focus:outline-none text-gray-900 transition-all" />
                        </div>
                      </div>

                      {showPdfUrl && (
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center border-t border-gray-200 pt-4">
                          <div className="md:col-span-4">
                            <label className="bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-none p-4 flex flex-col items-center justify-center text-center cursor-pointer transition-all select-none">
                              {uploadingFile ? <Loader className="w-5 h-5 animate-spin mb-1" /> : <Upload className="w-5 h-5 text-gray-600 mb-1" />}
                              <span className="text-[10px] font-mono font-bold uppercase tracking-wider">Upload PDF</span>
                              <input type="file" accept="application/pdf" onChange={(e) => handleFileUpload(e, 'pdf')} disabled={uploadingFile} className="hidden" />
                            </label>
                          </div>
                          <div className="md:col-span-8">
                            <label className="block text-[9px] font-mono uppercase text-gray-500 mb-1">PDF Document URL</label>
                            <input type="url" value={newPdfUrl} onChange={(e) => setNewPdfUrl(e.target.value)} placeholder="https://example.com/file.pdf" className="w-full bg-gray-50 border border-gray-300 px-4 py-2 text-xs focus:border-white focus:outline-none text-gray-900 transition-all" />
                          </div>
                        </div>
                      )}

                      {showWebsiteUrl && (
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center border-t border-gray-200 pt-4">
                          <div className="md:col-span-4 flex items-center justify-center">
                            <div className="bg-gray-100 border border-gray-300 rounded-none p-4 flex flex-col items-center justify-center text-center opacity-50 cursor-not-allowed w-full">
                              <Globe className="w-5 h-5 text-gray-600 mb-1" />
                              <span className="text-[10px] font-mono font-bold uppercase tracking-wider">Web Link</span>
                            </div>
                          </div>
                          <div className="md:col-span-8">
                            <label className="block text-[9px] font-mono uppercase text-gray-500 mb-1">Website / Live Demo URL</label>
                            <input type="url" value={newWebsiteUrl} onChange={(e) => setNewWebsiteUrl(e.target.value)} placeholder="https://example.com" className="w-full bg-gray-50 border border-gray-300 px-4 py-2 text-xs focus:border-white focus:outline-none text-gray-900 transition-all" />
                          </div>
                        </div>
                      )}

                      {/* Originals / Variants - only for shoot services */}
                      {isShootService && (
                        <>
                          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center border-t border-gray-200 pt-4">
                            <div className="md:col-span-4">
                              <label className="bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-none p-4 flex flex-col items-center justify-center text-center cursor-pointer transition-all select-none">
                                {uploadingFile ? <Loader className="w-5 h-5 animate-spin mb-1" /> : <Upload className="w-5 h-5 text-gray-600 mb-1" />}
                                <span className="text-[10px] font-mono font-bold uppercase tracking-wider">Originals</span>
                                <input type="file" multiple accept="image/*" onChange={(e) => handleFileUpload(e, 'original')} disabled={uploadingFile} className="hidden" />
                              </label>
                            </div>
                            <div className="md:col-span-8">
                              <label className="block text-[9px] font-mono uppercase text-gray-500 mb-1">Original Images (Comma Separated)</label>
                              <input type="text" value={newOriginalUrls} onChange={(e) => setNewOriginalUrls(e.target.value)} placeholder="Comma separated URLs" className="w-full bg-gray-50 border border-gray-300 px-4 py-2 text-xs focus:border-white focus:outline-none text-gray-900 transition-all" />
                            </div>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                            <div className="md:col-span-4">
                              <label className="bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-none p-4 flex flex-col items-center justify-center text-center cursor-pointer transition-all select-none">
                                {uploadingFile ? <Loader className="w-5 h-5 animate-spin mb-1" /> : <Upload className="w-5 h-5 text-gray-600 mb-1" />}
                                <span className="text-[10px] font-mono font-bold uppercase tracking-wider">AI Variants</span>
                                <input type="file" multiple accept="image/*" onChange={(e) => handleFileUpload(e, 'variant')} disabled={uploadingFile} className="hidden" />
                              </label>
                            </div>
                            <div className="md:col-span-8">
                              <label className="block text-[9px] font-mono uppercase text-gray-500 mb-1">AI Shoot Images (Comma Separated)</label>
                              <input type="text" value={newGeneratedVariants} onChange={(e) => setNewGeneratedVariants(e.target.value)} placeholder="Comma separated URLs" className="w-full bg-gray-50 border border-gray-300 px-4 py-2 text-xs focus:border-white focus:outline-none text-gray-900 transition-all" />
                            </div>
                          </div>
                        </>
                      )}

                      {(uploadError || uploadSuccess) && (
                        <div className="pt-2">
                          {uploadError && <div className="text-xs text-red-400 font-sans flex items-center gap-1"><AlertCircle className="w-4 h-4" /> {uploadError}</div>}
                          {uploadSuccess && <div className="text-xs text-emerald-400 font-sans flex items-center gap-1"><Check className="w-4 h-4" /> Files processed successfully!</div>}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-4">
                    {editingItemId && (
                      <button
                        type="button"
                        onClick={handleCancelEdit}
                        className="px-8 py-4 bg-gray-200 text-gray-800 hover:bg-gray-300 rounded-none font-mono text-xs font-bold uppercase tracking-widest cursor-pointer transition-all flex items-center shadow-md"
                      >
                        Cancel
                      </button>
                    )}
                    <button
                      type="submit"
                      disabled={isSaving || (!isNoTextService && (!newTitle || !newDescription))}
                      className="px-8 py-4 bg-gray-900 text-white hover:bg-gray-800 rounded-none font-mono text-xs font-bold uppercase tracking-widest cursor-pointer transition-all flex items-center gap-2 disabled:opacity-50 shadow-md"
                    >
                      {isSaving && <Loader className="w-4 h-4 animate-spin" />}
                      {editingItemId ? (
                        <><Check className="w-4 h-4" /> Update Work</>
                      ) : (
                        <><Plus className="w-4 h-4" /> Publish Work</>
                      )}
                    </button>
                  </div>
                </form>

                {/* Listing current subsections to delete */}
                <div className="border-t border-gray-200 pt-10 mt-10">
                  <h3 className="font-display text-xl font-bold uppercase tracking-tight mb-6">Manage Published Subsections</h3>

                  <div className="space-y-8">
                    {services.map(s => {
                      if (!s.subsections || s.subsections.length === 0) return null;
                      return (
                        <div key={s.id} className="space-y-4">
                          <h4 className="font-mono text-xs font-bold uppercase text-[#007A93] tracking-widest border-b border-gray-200 pb-2">
                            {s.name} Subsections ({s.subsections.length})
                          </h4>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {s.subsections.map((sub, idx) => (
                              <div key={idx} className="bg-gray-50 border border-gray-200 p-4 rounded-none flex justify-between gap-4 items-start">
                                <div className="flex gap-3 items-start overflow-hidden">
                                  <img
                                    src={sub.visualUrl}
                                    alt={sub.title}
                                    className="w-14 h-14 object-cover rounded-none bg-gray-200 shrink-0"
                                  />
                                  <div className="overflow-hidden">
                                    <h5 className="font-sans text-xs font-bold text-gray-900 truncate">{sub.title}</h5>
                                    <span className="font-sans text-[10px] text-gray-500 block mt-0.5">
                                      Category: <span className="text-gray-600 font-semibold">{sub.subCategory || 'General'}</span>
                                    </span>
                                    <span className="font-mono text-[9px] text-[#007A93] tracking-wider uppercase mt-1 block">
                                      {sub.visualType}
                                    </span>
                                  </div>
                                </div>

                                <div className="flex items-center">
                                  <button
                                    type="button"
                                    onClick={() => handleEditSubsection(sub, s.id)}
                                    className="text-gray-400 hover:text-blue-500 p-2 rounded-none hover:bg-gray-100 cursor-pointer transition-colors"
                                    title="Edit subsection"
                                  >
                                    <Edit className="w-4 h-4" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveSubsection(s.id, idx)}
                                    className="text-gray-400 hover:text-red-400 p-2 rounded-none hover:bg-gray-100 cursor-pointer transition-colors"
                                    title="Remove subsection"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>
            )}

            {/* TAB 4: CLIENT INQUIRIES */}
            {activeTab === 'inquiries' && (
              <div className="space-y-8 animate-fadeIn">
                <div className="border-b border-gray-300 pb-6 flex items-center justify-between">
                  <div>
                    <h2 className="font-display text-2xl font-bold uppercase tracking-tight">Client Inquiries</h2>
                    <p className="text-gray-500 text-xs font-sans mt-1">Review contact forms submitted by potential brand leads.</p>
                  </div>
                  <span className="font-mono text-xs text-[#007A93] bg-[#007A93]/10 px-3 py-1 rounded-none">
                    Total: {inquiries.length}
                  </span>
                </div>

                {inquiries.length === 0 ? (
                  <div className="text-center py-20 border border-dashed border-gray-300 rounded-none bg-gray-50/50">
                    <Mail className="w-10 h-10 text-gray-400 mx-auto mb-4" />
                    <span className="text-gray-500 text-xs font-sans">No client inquiries found in the database.</span>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {inquiries.map((inq) => (
                      <div key={inq.id} className="bg-gray-50 border border-gray-200 p-6 rounded-none space-y-4 relative overflow-hidden">
                        {/* Status bar */}
                        <div className="absolute top-0 left-0 w-1.5 h-full bg-[#007A93]"></div>

                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-200 pb-4">
                          <div>
                            <h3 className="font-display text-base font-bold uppercase text-gray-900 flex items-center gap-2">
                              {inq.name}
                            </h3>
                            <a href={`mailto:${inq.email}`} className="text-xs text-gray-500 hover:underline">{inq.email}</a>
                          </div>

                          <div className="flex items-center gap-3">
                            <span className="font-mono text-[9px] text-[#007A93] tracking-widest uppercase border border-[#007A93]/30 px-2 py-0.5 rounded-none bg-[#007A93]/5">
                              {services.find(s => s.id === inq.serviceId)?.name || inq.serviceId || 'General Inquiry'}
                            </span>
                            <span className="text-[10px] text-gray-400 font-mono">{inq.timestamp}</span>
                          </div>
                        </div>

                        <p className="text-sm font-sans text-gray-700 leading-relaxed italic bg-gray-100 p-4 rounded-none">
                          "{inq.message}"
                        </p>

                        <div className="flex justify-end pt-2 border-t border-gray-200">
                          <button
                            onClick={() => handleDeleteInquiryClick(inq.id)}
                            className="bg-transparent text-gray-500 hover:text-red-400 font-mono text-[10px] uppercase tracking-widest flex items-center gap-1.5 py-1 px-3 rounded-none hover:bg-gray-100 transition-all cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Delete Lead File
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 5: BRANDS MANAGER */}
            {activeTab === 'brands' && (
              <div className="space-y-8 animate-fadeIn">
                {selectedBrandIdForWork ? (
                  (() => {
                    const brand = clients.find(c => c.id === selectedBrandIdForWork);
                    if (!brand) {
                      setSelectedBrandIdForWork(null);
                      return null;
                    }
                    return (
                      <div className="space-y-6">
                        <div className="border-b border-gray-300 pb-4 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <button
                              type="button"
                              onClick={() => setSelectedBrandIdForWork(null)}
                              className="p-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 hover:text-gray-900 transition-all cursor-pointer border border-gray-200"
                              title="Back to Brands List"
                            >
                              <ArrowLeft className="w-4 h-4" />
                            </button>
                            <div>
                              <h3 className="text-lg font-display font-bold uppercase text-gray-900">
                                {brand.name}
                              </h3>
                              <p className="text-[10px] font-sans text-gray-500 uppercase tracking-wider">
                                Manage Portfolio Work Done for {brand.name}
                              </p>
                            </div>
                          </div>
                          <span className="font-mono text-xs text-[#007A93] bg-[#007A93]/10 px-2 py-0.5 border border-[#007A93]/20">
                            {brand.workItems?.length || 0} items
                          </span>
                        </div>

                        {/* List of current work items */}
                        <div className="space-y-4">
                          <h4 className="font-mono text-xs font-bold uppercase text-[#007A93] tracking-widest">
                            Current Portfolio Items
                          </h4>
                          {(!brand.workItems || brand.workItems.length === 0) ? (
                            <div className="text-center py-10 border border-dashed border-gray-300 rounded-none bg-gray-50/30">
                              <span className="text-gray-500 text-xs font-sans">No work items uploaded for this brand yet.</span>
                            </div>
                          ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {brand.workItems.map((item) => (
                                <div key={item.id} className="bg-gray-50 border border-gray-200 p-4 rounded-none flex justify-between gap-4 items-start">
                                  <div className="flex gap-3 items-start overflow-hidden">
                                    {item.type === 'image' && item.url && (
                                      <img src={item.url} alt={item.title} className="w-14 h-14 object-cover rounded-none bg-gray-200 shrink-0" />
                                    )}
                                    {item.type === 'video' && item.url && (
                                      <div className="w-14 h-14 bg-gray-200 flex items-center justify-center shrink-0 border border-gray-200">
                                        <Play className="w-5 h-5 text-gray-500" />
                                      </div>
                                    )}
                                    {item.type === 'text' && (
                                      <div className="w-14 h-14 bg-gray-100 flex items-center justify-center shrink-0 border border-gray-200">
                                        <FileText className="w-5 h-5 text-gray-500" />
                                      </div>
                                    )}
                                    <div className="overflow-hidden">
                                      <h5 className="font-sans text-xs font-bold text-gray-900 truncate">{item.title || 'Untitled Work'}</h5>
                                      <span className="font-mono text-[9px] text-[#007A93] tracking-wider uppercase mt-0.5 block">
                                        {item.type}
                                      </span>
                                      {item.text && (
                                        <p className="font-sans text-[10px] text-gray-500 line-clamp-2 mt-1 leading-snug">
                                          {item.text}
                                        </p>
                                      )}
                                    </div>
                                  </div>

                                  <button
                                    type="button"
                                    onClick={() => handleRemoveBrandWorkItem(brand.id, item.id)}
                                    className="text-gray-400 hover:text-red-400 p-2 rounded-none hover:bg-gray-100 cursor-pointer transition-colors"
                                    title="Remove item"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Add brand work item form */}
                        <form onSubmit={handleAddBrandWorkItem} className="bg-gray-50 border border-gray-200 p-6 rounded-none space-y-6">
                          <h4 className="font-mono text-xs font-bold uppercase text-[#007A93] tracking-widest border-b border-gray-200 pb-2">
                            Add Portfolio Item
                          </h4>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <label className="block text-[10px] font-mono uppercase tracking-widest text-gray-500 mb-2">Item Type *</label>
                              <select
                                value={newWorkType}
                                onChange={(e) => {
                                  setNewWorkType(e.target.value as 'image' | 'video' | 'text');
                                  setNewWorkUrl('');
                                }}
                                className="w-full bg-gray-50 border border-gray-300 rounded-none px-4 py-3.5 text-sm focus:border-white focus:outline-none text-gray-900 font-mono transition-all cursor-pointer"
                              >
                                <option value="image">Still Image Visual</option>
                                <option value="video">Motion Video Loop</option>
                                <option value="text">Narrative Text Block</option>
                              </select>
                            </div>

                            <div>
                              <label className="block text-[10px] font-mono uppercase tracking-widest text-gray-500 mb-2">Item Title</label>
                              <input
                                type="text"
                                value={newWorkTitle}
                                onChange={(e) => setNewWorkTitle(e.target.value)}
                                placeholder="e.g. Autumn Lookbook Layout"
                                className="w-full bg-gray-50 border border-gray-300 rounded-none px-4 py-3 text-sm focus:border-white focus:outline-none text-gray-900 font-mono transition-all placeholder:text-gray-400"
                              />
                            </div>
                          </div>

                          {newWorkType !== 'text' && (
                            <div className="bg-gray-50 border border-gray-300 p-5 rounded-none space-y-4">
                              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                                <div className="md:col-span-4">
                                  <label className="bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-none p-4 flex flex-col items-center justify-center text-center cursor-pointer transition-all select-none">
                                    {uploadingFile ? <Loader className="w-5 h-5 animate-spin mb-1" /> : <Upload className="w-5 h-5 text-gray-600 mb-1" />}
                                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider">Upload File</span>
                                    <input
                                      type="file"
                                      accept={newWorkType === 'image' ? "image/*" : "video/*"}
                                      onChange={(e) => handleFileUpload(e, 'brand-work')}
                                      disabled={uploadingFile}
                                      className="hidden"
                                    />
                                  </label>
                                </div>
                                <div className="md:col-span-8">
                                  <label className="block text-[9px] font-mono uppercase text-gray-500 mb-1">Visual / Video URL *</label>
                                  <input
                                    type="text"
                                    value={newWorkUrl}
                                    onChange={(e) => setNewWorkUrl(e.target.value)}
                                    placeholder="Enter URL or upload file"
                                    required
                                    className="w-full bg-gray-50 border border-gray-300 px-4 py-2 text-xs focus:border-white focus:outline-none text-gray-900 transition-all"
                                  />
                                </div>
                              </div>
                              {uploadError && <div className="text-xs text-red-400 font-sans mt-2 flex items-center gap-1"><AlertCircle className="w-4 h-4" /> {uploadError}</div>}
                              {uploadSuccess && <div className="text-xs text-emerald-400 font-sans mt-2 flex items-center gap-1"><Check className="w-4 h-4" /> File processed successfully!</div>}
                            </div>
                          )}

                          <div>
                            <label className="block text-[10px] font-mono uppercase tracking-widest text-gray-500 mb-2">
                              {newWorkType === 'text' ? 'Narrative Text Content *' : 'Description / Narrative Caption'}
                            </label>
                            <textarea
                              value={newWorkText}
                              onChange={(e) => setNewWorkText(e.target.value)}
                              required={newWorkType === 'text'}
                              rows={4}
                              placeholder={newWorkType === 'text' ? "Enter editorial narrative here..." : "Caption detail to accompany the visual element."}
                              className="w-full bg-gray-50 border border-gray-300 rounded-none px-4 py-3 text-sm focus:border-white focus:outline-none text-gray-900 font-mono transition-all resize-none placeholder:text-gray-400"
                            />
                          </div>

                          <div className="flex justify-end pt-2">
                            <button
                              type="submit"
                              disabled={isSaving || (newWorkType !== 'text' && !newWorkUrl)}
                              className="px-6 py-3.5 bg-gray-900 text-white hover:bg-gray-800 rounded-none font-mono text-xs font-bold uppercase tracking-widest cursor-pointer transition-all flex items-center gap-2 disabled:opacity-50"
                            >
                              {isSaving && <Loader className="w-4 h-4 animate-spin" />}
                              <Plus className="w-4 h-4" /> Publish Brand Item
                            </button>
                          </div>
                        </form>
                      </div>
                    );
                  })()
                ) : (
                  <div className="space-y-8">
                    <div className="border-b border-gray-300 pb-6">
                      <h2 className="font-display text-2xl font-bold uppercase tracking-tight">Brands Manager</h2>
                      <p className="text-gray-500 text-xs font-sans mt-1">
                        Register companies we work with, modify details, and upload client logos.
                      </p>
                    </div>

                    {/* Brand Add/Edit Form */}
                    <form onSubmit={handleSaveBrand} className="bg-gray-50 border border-gray-200 p-6 rounded-none space-y-6">
                      <h3 className="font-mono text-xs font-bold uppercase text-[#007A93] tracking-widest border-b border-gray-200 pb-2">
                        {editingClientId ? 'Edit Brand Details' : 'Register New Brand'}
                      </h3>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                          <label className="block text-[10px] font-mono uppercase tracking-widest text-gray-500 mb-2">Brand / Client Name *</label>
                          <input
                            type="text"
                            value={clientName}
                            onChange={(e) => setClientName(e.target.value)}
                            required
                            placeholder="e.g. NEBULA APPAREL"
                            className="w-full bg-gray-50 border border-gray-300 rounded-none px-4 py-3 text-sm focus:border-white focus:outline-none text-gray-900 font-mono transition-all placeholder:text-gray-400"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-mono uppercase tracking-widest text-gray-500 mb-2">Industry / Sector *</label>
                          <input
                            type="text"
                            value={clientIndustry}
                            onChange={(e) => setClientIndustry(e.target.value)}
                            required
                            placeholder="e.g. High Fashion"
                            className="w-full bg-gray-50 border border-gray-300 rounded-none px-4 py-3 text-sm focus:border-white focus:outline-none text-gray-900 font-mono transition-all placeholder:text-gray-400"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-mono uppercase tracking-widest text-gray-500 mb-2">Logo Display Text (Abbreviation) *</label>
                          <input
                            type="text"
                            value={clientLogo}
                            onChange={(e) => setClientLogo(e.target.value)}
                            required
                            placeholder="e.g. NEBL"
                            className="w-full bg-gray-50 border border-gray-300 rounded-none px-4 py-3 text-sm focus:border-white focus:outline-none text-gray-900 font-mono transition-all placeholder:text-gray-400"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
                        <div>
                          <label className="block text-[10px] font-mono uppercase tracking-widest text-gray-500 mb-2">Collaboration Year</label>
                          <input
                            type="text"
                            value={clientCollaborationYear}
                            onChange={(e) => setClientCollaborationYear(e.target.value)}
                            placeholder="e.g. 2026"
                            className="w-full bg-gray-50 border border-gray-300 rounded-none px-4 py-3 text-sm focus:border-white focus:outline-none text-gray-900 font-mono transition-all placeholder:text-gray-400"
                          />
                        </div>

                        <div className="flex items-center h-12">
                          <label className="flex items-center gap-2 cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={clientFeatured}
                              onChange={(e) => setClientFeatured(e.target.checked)}
                              className="w-4 h-4 rounded-none bg-gray-50 border border-gray-300 text-[#007A93] focus:ring-0 focus:ring-offset-0 cursor-pointer"
                            />
                            <span className="text-[10px] font-mono uppercase tracking-wider text-gray-600">Featured Brand Marquee</span>
                          </label>
                        </div>

                        {/* File Upload for Logo Image */}
                        <div>
                          <label className="block text-[10px] font-mono uppercase tracking-widest text-gray-500 mb-2">Brand Graphic Logo (File Upload)</label>
                          <div className="flex gap-2">
                            <label className="bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-none px-4 py-3 flex items-center justify-center cursor-pointer transition-all select-none">
                              {uploadingFile ? <Loader className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4 text-gray-600" />}
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleFileUpload(e, 'brand-logo')}
                                disabled={uploadingFile}
                                className="hidden"
                              />
                            </label>
                            <input
                              type="text"
                              value={clientLogoImage}
                              onChange={(e) => setClientLogoImage(e.target.value)}
                              placeholder="Logo Image URL (optional)"
                              className="flex-1 bg-gray-50 border border-gray-300 rounded-none px-4 py-3 text-sm focus:border-white focus:outline-none text-gray-900 font-mono transition-all placeholder:text-gray-400"
                            />
                          </div>
                        </div>
                      </div>

                      {uploadError && <div className="text-xs text-red-400 font-sans flex items-center gap-1"><AlertCircle className="w-4 h-4" /> {uploadError}</div>}

                      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                        {editingClientId && (
                          <button
                            type="button"
                            onClick={() => {
                              setEditingClientId(null);
                              setClientName('');
                              setClientIndustry('');
                              setClientLogo('');
                              setClientLogoImage('');
                              setClientCollaborationYear('');
                              setClientFeatured(false);
                            }}
                            className="px-6 py-3 text-xs font-mono font-bold uppercase tracking-wider text-gray-500 hover:text-gray-900 rounded-none bg-transparent transition-all cursor-pointer"
                          >
                            Cancel
                          </button>
                        )}
                        <button
                          type="submit"
                          disabled={isSaving || !clientName || !clientLogo || !clientIndustry}
                          className="px-6 py-3 bg-gray-900 text-white hover:bg-gray-800 rounded-none font-mono text-xs font-bold uppercase tracking-widest cursor-pointer transition-all flex items-center gap-2 disabled:opacity-50"
                        >
                          {isSaving && <Loader className="w-4 h-4 animate-spin" />}
                          <span>{editingClientId ? 'Save Brand' : 'Register Brand'}</span>
                        </button>
                      </div>
                    </form>

                    {/* Brands list */}
                    <div className="space-y-4">
                      <h3 className="font-display text-lg font-bold uppercase tracking-tight">Active Brand Registrations</h3>
                      <div className="grid grid-cols-1 gap-4">
                        {clients.map((client) => (
                          <div key={client.id} className="bg-gray-50 border border-gray-200 p-5 rounded-none flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                              {client.logoImage ? (
                                <img src={client.logoImage} alt={client.name} className="w-16 h-12 object-contain bg-gray-100 p-1 border border-gray-200 rounded-none" />
                              ) : (
                                <div className="w-16 h-12 bg-gray-200 border border-gray-200 rounded-none flex items-center justify-center font-display font-black tracking-tighter text-sm text-[#007A93]">
                                  {client.logo}
                                </div>
                              )}
                              <div>
                                <h4 className="font-display text-base font-bold uppercase text-gray-900 flex items-center gap-2">
                                  {client.name}
                                  {client.featured && (
                                    <span className="text-[8px] font-mono uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5">
                                      Featured
                                    </span>
                                  )}
                                </h4>
                                <span className="font-mono text-[10px] text-gray-500 uppercase tracking-widest block">
                                  {client.industry} // Year: {client.collaborationYear}
                                </span>
                              </div>
                            </div>

                            <div className="flex flex-wrap gap-2 items-center">
                              <button
                                onClick={() => setSelectedBrandIdForWork(client.id)}
                                className="px-3 py-2 bg-[#007A93]/15 hover:bg-[#007A93]/25 border border-[#007A93]/35 text-[#007A93] hover:text-gray-900 rounded-none text-xs font-mono uppercase tracking-wider cursor-pointer transition-all flex items-center gap-1.5"
                              >
                                <Plus className="w-3.5 h-3.5" /> Work ({client.workItems?.length || 0})
                              </button>

                              <button
                                onClick={() => handleEditBrandClick(client)}
                                className="px-3 py-2 bg-gray-100 hover:bg-gray-200 border border-gray-200 text-gray-700 hover:text-gray-900 rounded-none text-xs font-mono uppercase tracking-wider cursor-pointer transition-all flex items-center gap-1"
                              >
                                <Edit className="w-3.5 h-3.5" /> Edit
                              </button>

                              <button
                                onClick={() => handleRemoveBrand(client.id)}
                                className="p-2.5 bg-red-500/5 hover:bg-red-500/15 border border-red-500/10 hover:border-red-500/30 text-red-400 hover:text-red-300 rounded-none cursor-pointer transition-all"
                                title="Delete Brand registration"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB: PROJECTS */}
            {activeTab === 'projects' && (
              <div className="space-y-8 animate-fadeIn">
                <div className="border-b border-gray-300 pb-6">
                  <h2 className="font-display text-2xl font-bold uppercase tracking-tight">Landing Page Projects</h2>
                  <p className="text-gray-500 text-xs font-sans mt-1">Manage the 4 highlighted case studies on the main site.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {projects.slice(0, 4).map((project, index) => (
                    <div key={project.id} className="border border-gray-200 bg-gray-50 p-6 flex flex-col gap-4 relative">
                      <div className="absolute top-0 right-0 bg-gray-200 text-gray-500 font-mono text-[10px] uppercase px-2 py-1">
                        Slot 0{index + 1}
                      </div>

                      <div className="flex flex-col gap-2">
                        <label className="text-xs font-mono font-bold uppercase tracking-widest text-gray-500">Client / Brand</label>
                        <input
                          type="text"
                          value={project.client}
                          onChange={(e) => {
                            const updated = [...projects];
                            updated[index] = { ...updated[index], client: e.target.value };
                            updateProjects(updated);
                          }}
                          className="w-full bg-white border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:border-[#007A93] transition-colors rounded-none"
                        />
                      </div>

                      <div className="flex flex-col gap-2">
                        <label className="text-xs font-mono font-bold uppercase tracking-widest text-gray-500">Linked Work (Optional)</label>
                        <select
                          value={project.linkedWorkId || ''}
                          onChange={(e) => {
                            const updated = [...projects];
                            updated[index] = { ...updated[index], linkedWorkId: e.target.value };
                            updateProjects(updated);
                          }}
                          className="w-full bg-white border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:border-[#007A93] transition-colors rounded-none"
                        >
                          <option value="">Select a connected work...</option>
                          <optgroup label="Service Subsections">
                            {services.flatMap(s => s.subsections).map(w => (
                              <option key={w.id} value={w.id}>{w.title}</option>
                            ))}
                          </optgroup>
                          <optgroup label="Client Work Items">
                            {clients.flatMap(c => c.workItems || []).map(w => (
                              <option key={w.id} value={w.id}>{w.title || 'Untitled Work'}</option>
                            ))}
                          </optgroup>
                        </select>
                      </div>

                      <div className="flex flex-col gap-2">
                        <label className="text-xs font-mono font-bold uppercase tracking-widest text-gray-500">Preview Image URL</label>
                        <input
                          type="text"
                          value={project.image}
                          onChange={(e) => {
                            const updated = [...projects];
                            updated[index] = { ...updated[index], image: e.target.value };
                            updateProjects(updated);
                          }}
                          className="w-full bg-white border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:border-[#007A93] transition-colors rounded-none"
                        />
                      </div>

                    </div>
                  ))}
                </div>
              </div>
            )}


          </div>
        </div>

      </main>

      {/* Unsaved Changes Confirmation Modal */}
      <AnimatePresence>
        {pendingTabSwitch && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              className="bg-white border border-gray-200 shadow-2xl max-w-sm w-full p-6 text-center"
            >
              <div className="mx-auto w-12 h-12 bg-rose-50 flex items-center justify-center rounded-full mb-4">
                <AlertCircle className="w-6 h-6 text-rose-500" />
              </div>
              <h3 className="font-display text-lg font-bold uppercase text-gray-900 tracking-tight mb-2">Unsaved Changes</h3>
              <p className="text-gray-500 text-xs font-sans mb-6">
                You are currently editing an item. If you switch tabs now, your unsaved progress will be lost. Do you wish to continue?
              </p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => setPendingTabSwitch(null)}
                  className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-mono font-bold uppercase tracking-widest transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={() => executeTabSwitch(pendingTabSwitch)}
                  className="px-5 py-2.5 bg-rose-500 hover:bg-rose-600 text-white text-xs font-mono font-bold uppercase tracking-widest transition-colors cursor-pointer"
                >
                  Discard & Leave
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
