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
  Globe,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Crop
} from 'lucide-react';
import { ServiceDetail, ServiceSubsection, ClientInquiry, ClientProfile, BrandWorkItem, PortfolioProject, Testimonial, SiteSettings } from '../types';
import { supabase } from '../lib/supabase';

// Per-service category configs for admin
// #3 — Added brand-building and more insta categories
const ADMIN_CATEGORIES: Record<string, string[]> = {
  'ai-photo-shoot': ['Clothing Shoot', 'Footwear Shoot', 'Lifestyle Shoot'],
  'ai-video-shoot': ['Clothing Shoot', 'Footwear Shoot', 'Lifestyle Shoot'],
  'automation': ['Email Automation', 'WhatsApp Automation', 'Internal Workflow', 'Chatbots', 'Custom Tools', 'General'],
  'website-design': ['E-Commerce', 'Corporate', 'Landing Pages', 'Portfolio', 'Web Applications', 'General'],
  'e-invitation': ['Still Cards', 'Motion Cards', 'Invitation Website'],
  'catalog': ['PDF', 'Website', 'Product Catalog', 'Lookbook'],
  'insta-grid-stories': ['Grid', 'Stories', 'Posters', 'Reels Cover', 'Others'],
  'brand-building': ['Logo Design', 'Brand Identity', 'Color Palette', 'Typography', 'Brand Guide', 'Others'],
};

const POPUP_TYPE_OPTIONS: Record<string, { value: string; label: string }[]> = {
  'automation': [
    { value: 'video', label: 'Video Demo' },
    { value: 'pdf', label: 'PDF Document' },
    { value: 'image', label: 'Image / Screenshot' },
    { value: 'text', label: 'Text Content' },
  ],
  'website-design': [
    { value: 'website-embed', label: 'Embedded Live Website (Interactive Demo)' },
    { value: 'image', label: 'Image / Screenshot' },
    { value: 'video', label: 'Video Walkthrough' },
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

const isVideoUrl = (url?: string) => {
  if (!url) return false;
  return /\.(mp4|webm|mov|ogg)(\?.*)?$/i.test(url) || url.includes('/video/');
};

interface AdminPanelProps {
  key?: React.Key;
  services: ServiceDetail[];
  inquiries: ClientInquiry[];
  clients: ClientProfile[];
  projects: PortfolioProject[];
  testimonials: Testimonial[];
  siteSettings: SiteSettings;
  updateClients: (clients: ClientProfile[]) => Promise<void>;
  updateProjects: (projects: PortfolioProject[]) => Promise<void>;
  updateTestimonials: (testimonials: Testimonial[]) => Promise<void>;
  updateSiteSettings: (settings: SiteSettings) => Promise<void>;
  onBack: () => void;
  onRefreshData: () => Promise<void>;
  updateServices: (services: ServiceDetail[]) => Promise<void>;
  deleteInquiry: (id: string) => Promise<void>;
  resetDatabase: () => Promise<void>;
}

type Tab = 'dashboard' | 'settings' | 'services' | 'work' | 'inquiries' | 'brands' | 'projects' | 'reviews';

export default function AdminPanel({
  services,
  inquiries,
  clients,
  projects,
  testimonials,
  siteSettings,
  updateClients,
  updateProjects,
  updateTestimonials,
  updateSiteSettings,
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
  const [editName, setEditName] = useState('');
  const [editCount, setEditCount] = useState('');
  const [editTagline, setEditTagline] = useState('');
  const [editImage, setEditImage] = useState('');
  const [editFeatures, setEditFeatures] = useState<string[]>([]);
  const [newFeatureText, setNewFeatureText] = useState('');

  // Add New Service State
  const [isAddingService, setIsAddingService] = useState(false);
  const [newServiceName, setNewServiceName] = useState('');
  const [newServiceId, setNewServiceId] = useState('');
  const [newServiceCount, setNewServiceCount] = useState('');
  const [newServiceTagline, setNewServiceTagline] = useState('');
  const [newServiceImage, setNewServiceImage] = useState('');
  const [newServiceFeatures, setNewServiceFeatures] = useState<string[]>([]);
  const [newServiceFeatureInput, setNewServiceFeatureInput] = useState('');

  // Subsections Add State
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [selectedServiceId, setSelectedServiceId] = useState(services[0]?.id || '');
  const [newWorkflowSteps, setNewWorkflowSteps] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('Clothing Shoot');
  const [newCustomCategory, setNewCustomCategory] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newVisualType, setNewVisualType] = useState<'image' | 'video' | 'automation' | 'pdf' | 'website'>('image');
  const [newVisualUrl, setNewVisualUrl] = useState('');
  const [newVideoUrl, setNewVideoUrl] = useState('');
  const [newMeta, setNewMeta] = useState('');
  const [newOriginalUrls, setNewOriginalUrls] = useState('');
  const [newGeneratedVariants, setNewGeneratedVariants] = useState('');
  const [newIsComparisonMode, setNewIsComparisonMode] = useState(false);

  // Drag & Drop and Collapsible States for Subsections
  const [collapsedServices, setCollapsedServices] = useState<Record<string, boolean>>({});
  const [collapsedCategories, setCollapsedCategories] = useState<Record<string, boolean>>({});
  const [manageWorksOpen, setManageWorksOpen] = useState(false);
  const [draggedItemIndex, setDraggedItemIndex] = useState<number | null>(null);
  const [draggedItemService, setDraggedItemService] = useState<string | null>(null);
  const [previewServices, setPreviewServices] = useState<ServiceDetail[] | null>(null);

  // Category Drag & Drop State (for reordering category groups)
  const [draggedCatName, setDraggedCatName] = useState<string | null>(null);
  const [draggedCatService, setDraggedCatService] = useState<string | null>(null);

  // Per-service extra fields
  const [newBrandName, setNewBrandName] = useState('');
  const [newInstaLink, setNewInstaLink] = useState('');
  const [newWebsiteUrl, setNewWebsiteUrl] = useState('');
  const [newPdfUrl, setNewPdfUrl] = useState('');
  const [newPopupType, setNewPopupType] = useState('image');
  const [newSubSubCategory, setNewSubSubCategory] = useState('');
  const [newImagePosition, setNewImagePosition] = useState<string>('center');

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
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetAdminPass, setResetAdminPass] = useState('');
  const [resetSecurityPin, setResetSecurityPin] = useState('');
  const [resetError, setResetError] = useState('');
  const [pendingTabSwitch, setPendingTabSwitch] = useState<Tab | null>(null);

  useEffect(() => {
    if (services.length > 0 && !selectedServiceId) {
      setSelectedServiceId(services[0].id);
    }
  }, [services]);

  // Handle file uploads
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, target: 'visual' | 'original' | 'variant' | 'brand-logo' | 'brand-work' | 'pdf' | 'video' | 'service-cover' | 'new-service-cover') => {
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
          if (target === 'video' && i === 0) {
            setNewPopupType('video');
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
      } else if (target === 'video') {
        setNewVideoUrl(uploadedUrls[0]);
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
      } else if (target === 'service-cover') {
        setEditImage(uploadedUrls[0]);
      } else if (target === 'new-service-cover') {
        setNewServiceImage(uploadedUrls[0]);
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
    setEditName(service.name);
    setEditCount(service.count);
    setEditTagline(service.tagline);
    setEditImage(service.image);
    setEditFeatures([...service.features]);
    setIsAddingService(false);
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
          name: editName.trim() || s.name,
          count: editCount.trim() || s.count,
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

  const handleCreateService = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = newServiceName.trim();
    const slug = (newServiceId.trim() || trimmedName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''));
    if (!trimmedName || !slug) {
      triggerToast('Please provide a valid service name.');
      return;
    }
    if (services.some(s => s.id.toLowerCase() === slug.toLowerCase())) {
      triggerToast(`A service with ID "${slug}" already exists.`);
      return;
    }

    setIsSaving(true);
    const newServiceObj: ServiceDetail = {
      id: slug,
      name: trimmedName,
      count: newServiceCount.trim() || String(services.length + 1).padStart(2, '0'),
      tagline: newServiceTagline.trim(),
      image: newServiceImage.trim() || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=1200',
      features: newServiceFeatures,
      subsections: []
    };

    try {
      const updated = [...services, newServiceObj];
      await updateServices(updated);
      setIsAddingService(false);
      setNewServiceName('');
      setNewServiceId('');
      setNewServiceCount('');
      setNewServiceTagline('');
      setNewServiceImage('');
      setNewServiceFeatures([]);
      triggerToast('New service created successfully!');
    } catch (err) {
      triggerToast('Failed to create new service.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteService = async (serviceId: string) => {
    const target = services.find(s => s.id === serviceId);
    if (!target) return;
    if (!window.confirm(`Are you sure you want to delete the service "${target.name}"? All its work items will also be removed.`)) {
      return;
    }
    setIsSaving(true);
    try {
      const updated = services.filter(s => s.id !== serviceId);
      await updateServices(updated);
      if (editingServiceId === serviceId) setEditingServiceId(null);
      if (selectedServiceId === serviceId && updated.length > 0) {
        setSelectedServiceId(updated[0].id);
      }
      triggerToast(`Service "${target.name}" deleted.`);
    } catch (err) {
      triggerToast('Failed to delete service.');
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

  const handleAddNewServiceFeature = () => {
    if (newServiceFeatureInput.trim() && !newServiceFeatures.includes(newServiceFeatureInput.trim())) {
      setNewServiceFeatures([...newServiceFeatures, newServiceFeatureInput.trim()]);
      setNewServiceFeatureInput('');
    }
  };

  const handleRemoveNewServiceFeature = (feature: string) => {
    setNewServiceFeatures(newServiceFeatures.filter(f => f !== feature));
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
  // #4 — Expanded showBrandName to include social media, catalog, automation services
  const showBrandName = ['website-design', 'brand-building', 'ai-photo-shoot', 'ai-video-shoot', 'insta-grid-stories', 'catalog', 'automation'].includes(selectedServiceId);
  const showInstaLink = ['brand-building', 'insta-grid-stories'].includes(selectedServiceId);
  const showWebsiteUrl = ['website-design', 'brand-building', 'e-invitation', 'catalog', 'automation'].includes(selectedServiceId) || newVisualType === 'website' || newPopupType === 'website-link' || newPopupType === 'website-embed' || newVisualType === 'automation';
  const showPdfUrl = ['brand-building', 'e-invitation', 'catalog', 'automation'].includes(selectedServiceId) || newVisualType === 'pdf' || newPopupType === 'pdf';
  const showVideoUrl = ['automation', 'website-design', 'catalog', 'e-invitation', 'brand-building', 'ai-video-shoot'].includes(selectedServiceId) || newVisualType === 'video' || newPopupType === 'video';
  const showGalleryImages = isShootService || ['automation', 'website-design', 'brand-building', 'catalog'].includes(selectedServiceId);
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
    setNewVideoUrl(item.videoUrl || '');
    setNewMeta(item.meta || '');
    setNewOriginalUrls(item.originalUrls ? item.originalUrls.join(', ') : '');
    setNewGeneratedVariants(item.generatedVariants ? item.generatedVariants.join(', ') : '');
    setNewBrandName(item.brandName || '');
    setNewInstaLink(item.instaLink || '');
    setNewWebsiteUrl(item.websiteUrl || '');
    setNewPdfUrl(item.pdfUrl || '');
    setNewPopupType(item.popupType || 'image');
    setNewSubSubCategory(item.subSubCategory || '');
    setNewIsComparisonMode(item.isComparisonMode || false);
    setNewImagePosition(item.imagePosition || (serviceId === 'website-design' ? 'top' : 'center'));
    setNewWorkflowSteps(item.workflowSteps ? item.workflowSteps.join(' -> ') : '');

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
    setNewTitle(''); setNewDescription(''); setNewVisualUrl(''); setNewVideoUrl(''); setNewMeta('');
    setNewCustomCategory(''); setNewOriginalUrls(''); setNewGeneratedVariants('');
    setNewBrandName(''); setNewInstaLink(''); setNewWebsiteUrl(''); setNewPdfUrl('');
    setNewPopupType('image'); setNewSubSubCategory('');
    setNewIsComparisonMode(false);
    setNewImagePosition(selectedServiceId === 'website-design' ? 'top' : 'center');
    setNewWorkflowSteps('');
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
    const parsedWorkflowSteps = newWorkflowSteps.trim()
      ? newWorkflowSteps.split(/->|→|\n/).map(s => s.trim().toUpperCase()).filter(Boolean)
      : undefined;

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
      videoUrl: newVideoUrl.trim() || undefined,
      popupType: (newPopupType as ServiceSubsection['popupType']) || undefined,
      subSubCategory: newSubSubCategory.trim() || undefined,
      isComparisonMode: newIsComparisonMode,
      imagePosition: newImagePosition || (selectedServiceId === 'website-design' ? 'top' : 'center'),
      workflowSteps: parsedWorkflowSteps,
    };

    const updatedServices = services.map(s => {
      if (s.id === selectedServiceId) {
        if (editingItemId) {
          return {
            ...s,
            subsections: s.subsections.map(sub => sub.id === editingItemId ? newSection : sub)
          };
        }
        // #9 — Auto-save new custom categories so they appear in the dropdown next time
        const newCategoryCoverImages = s.categoryCoverImages ? { ...s.categoryCoverImages } : {};
        return { ...s, subsections: [newSection, ...s.subsections], categoryCoverImages: newCategoryCoverImages };
      }
      return s;
    });
    // #9 — Update the global ADMIN_CATEGORIES if new custom category was typed
    if (newCategory === 'Custom' && newCustomCategory.trim()) {
      const customCat = newCustomCategory.trim();
      if (!ADMIN_CATEGORIES[selectedServiceId]) ADMIN_CATEGORIES[selectedServiceId] = [];
      if (!ADMIN_CATEGORIES[selectedServiceId].includes(customCat)) {
        ADMIN_CATEGORIES[selectedServiceId] = [...ADMIN_CATEGORIES[selectedServiceId], customCat];
      }
    }

    try {
      await updateServices(updatedServices);
      handleCancelEdit();
      setUploadSuccess(false);
      setNewCustomCategory('');
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
    setShowResetModal(true);
    setResetAdminPass('');
    setResetSecurityPin('');
    setResetError('');
  };

  const executeDatabaseReset = async () => {
    if (resetAdminPass !== 'CS@admin26') {
      setResetError('Invalid Admin Password. Reset aborted.');
      return;
    }

    if (resetSecurityPin !== '020798') {
      setResetError('Invalid Security PIN. Reset aborted.');
      return;
    }

    setShowResetModal(false);
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

  const handleMoveCategory = async (e: React.MouseEvent, serviceId: string, category: string, direction: 'up' | 'down') => {
    e.stopPropagation();

    const service = services.find(s => s.id === serviceId);
    if (!service) return;

    let currentOrder = service.categoryOrder || [];
    const allCategories = Array.from(new Set(service.subsections.map(sub => sub.subCategory || 'General')));
    
    currentOrder = currentOrder.filter(cat => allCategories.includes(cat));
    allCategories.forEach(cat => {
      if (!currentOrder.includes(cat)) currentOrder.push(cat);
    });

    const index = currentOrder.indexOf(category);
    if (index === -1) return;

    if (direction === 'up' && index > 0) {
      const temp = currentOrder[index - 1];
      currentOrder[index - 1] = currentOrder[index];
      currentOrder[index] = temp;
    } else if (direction === 'down' && index < currentOrder.length - 1) {
      const temp = currentOrder[index + 1];
      currentOrder[index + 1] = currentOrder[index];
      currentOrder[index] = temp;
    } else {
      return;
    }

    setIsSaving(true);
    const updatedServices = services.map(s => {
      if (s.id === serviceId) {
        return {
          ...s,
          categoryOrder: currentOrder
        };
      }
      return s;
    });

    try {
      await updateServices(updatedServices);
      triggerToast('Category order updated!');
    } catch (err) {
      triggerToast('Failed to update order.');
    } finally {
      setIsSaving(false);
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
              onClick={() => handleTabSwitch('settings')}
              className={`flex items-center gap-3 px-4 py-3 rounded-none text-xs font-mono font-bold uppercase tracking-wider transition-all w-full text-left whitespace-nowrap cursor-pointer ${activeTab === 'settings' ? 'bg-[#007A93] text-gray-900' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
            >
              <Settings className="w-4 h-4" />
              <span>Settings</span>
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

            <button
              onClick={() => handleTabSwitch('reviews')}
              className={`flex items-center justify-between px-4 py-3 rounded-none text-xs font-mono font-bold uppercase tracking-wider transition-all w-full text-left whitespace-nowrap cursor-pointer ${activeTab === 'reviews' ? 'bg-[#007A93] text-gray-900' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
            >
              <div className="flex items-center gap-3">
                <FileText className="w-4 h-4" />
                <span>Reviews</span>
              </div>
              {testimonials.length > 0 && (
                <span className="bg-gray-900 text-white text-[10px] px-2 py-0.5 rounded-none font-bold">
                  {testimonials.length}
                </span>
              )}
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

                  <div className="bg-gray-50 border border-gray-200 rounded-none p-5 text-center">
                    <span className="block font-mono text-[10px] text-gray-500 uppercase tracking-widest mb-1">REVIEWS</span>
                    <span className="font-display text-3xl font-bold text-[#007A93]">{testimonials.length}</span>
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

            {/* TAB: SETTINGS */}
            {activeTab === 'settings' && (
              <div className="space-y-8 animate-fadeIn">
                <div className="border-b border-gray-300 pb-6">
                  <h2 className="font-display text-2xl font-bold uppercase tracking-tight">Site Settings</h2>
                  <p className="text-gray-500 text-xs font-sans mt-1">Configure global site settings and features.</p>
                </div>

                <div className="bg-gray-50 border border-gray-200 rounded-none p-6">
                  <h3 className="font-mono text-xs font-bold uppercase text-[#007A93] tracking-widest mb-4">Hero Animation (Studio Olimpo Style)</h3>
                  
                  <div className="flex items-center justify-between bg-white border border-gray-200 p-4 mb-6">
                    <div>
                      <h4 className="font-bold text-sm">Enable Animated Hero Sequence</h4>
                      <p className="text-xs text-gray-500 mt-1">Uses a fast-flashing image sequence loader at the start of the site instead of the static glassmorphism card.</p>
                    </div>
                    <button
                      onClick={async () => {
                        setIsSaving(true);
                        try {
                          await updateSiteSettings({
                            ...siteSettings,
                            useHeroAnimation: !siteSettings.useHeroAnimation
                          });
                          triggerToast(siteSettings.useHeroAnimation ? 'Hero animation disabled.' : 'Hero animation enabled.');
                        } catch(e) {
                          triggerToast('Failed to update settings');
                        } finally {
                          setIsSaving(false);
                        }
                      }}
                      disabled={isSaving}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        siteSettings.useHeroAnimation ? 'bg-[#007A93]' : 'bg-gray-300'
                      }`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        siteSettings.useHeroAnimation ? 'translate-x-6' : 'translate-x-1'
                      }`} />
                    </button>
                  </div>

                  {siteSettings.useHeroAnimation && (
                    <div className="bg-white border border-gray-200 p-4">
                      <h4 className="font-bold text-sm mb-4">Hero Animation Slides (8 Required)</h4>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {siteSettings.heroSlides.map((slide, index) => (
                          <div key={index} className="relative group aspect-video bg-gray-100 border border-gray-200">
                            <img src={slide} alt={`Slide ${index + 1}`} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-2">
                               <input 
                                 type="text"
                                 value={slide}
                                 onChange={(e) => {
                                   const newSlides = [...siteSettings.heroSlides];
                                   newSlides[index] = e.target.value;
                                   updateSiteSettings({ ...siteSettings, heroSlides: newSlides });
                                 }}
                                 className="w-full text-[10px] p-1 bg-white text-black"
                               />
                            </div>
                          </div>
                        ))}
                      </div>
                      <p className="text-[10px] text-gray-500 mt-3 uppercase tracking-wider font-mono">Tip: Hover over an image to paste a new URL.</p>
                    </div>
                  )}
                </div>

                {/* #11 — Live Operations Graph Editor */}
                <div className="bg-gray-50 border border-gray-200 rounded-none p-6">
                  <h3 className="font-mono text-xs font-bold uppercase text-[#007A93] tracking-widest mb-4">Live Operations Graph (By The Numbers)</h3>
                  <p className="text-xs text-gray-500 mb-6 font-sans">Set manual overrides for the live operations stats. Leave blank to auto-calculate from uploaded work.</p>
                  <div className="space-y-4">
                    {/* Total Brands Override */}
                    <div className="bg-white border border-gray-200 p-4 grid grid-cols-2 gap-3 items-end">
                      <div>
                        <label className="block text-[10px] font-mono font-bold uppercase text-gray-700 mb-1">Total Brands</label>
                        <p className="text-[9px] font-sans text-gray-400 mb-2">Auto-calculated: {clients.length}</p>
                      </div>
                      <div>
                        <input
                          type="number"
                          placeholder="Leave blank for auto"
                          value={siteSettings.liveStatsOverrides?.['total_brands'] ?? ''}
                          onChange={async (e) => {
                            const val = e.target.value === '' ? undefined : Number(e.target.value);
                            const overrides = { ...(siteSettings.liveStatsOverrides || {}) };
                            if (val === undefined) delete overrides['total_brands'];
                            else overrides['total_brands'] = val;
                            await updateSiteSettings({ ...siteSettings, liveStatsOverrides: overrides });
                          }}
                          className="w-full bg-gray-50 border border-gray-300 rounded-none px-3 py-2 text-sm focus:outline-none font-mono"
                        />
                      </div>
                    </div>
                    {/* Service overrides */}
                    {services.map(s => {
                      const currentAuto = s.subsections?.length || 0;
                      return (
                        <div key={s.id} className="bg-white border border-gray-200 p-4 grid grid-cols-2 gap-3 items-end">
                          <div>
                            <label className="block text-[10px] font-mono font-bold uppercase text-gray-700 mb-1">{s.name}</label>
                            <p className="text-[9px] font-sans text-gray-400 mb-2">Auto-calculated: {currentAuto}</p>
                          </div>
                          <div>
                            <input
                              type="number"
                              placeholder="Leave blank for auto"
                              value={siteSettings.liveStatsOverrides?.[s.id] ?? ''}
                              onChange={async (e) => {
                                const val = e.target.value === '' ? undefined : Number(e.target.value);
                                const overrides = { ...(siteSettings.liveStatsOverrides || {}) };
                                if (val === undefined) delete overrides[s.id];
                                else overrides[s.id] = val;
                                await updateSiteSettings({ ...siteSettings, liveStatsOverrides: overrides });
                              }}
                              className="w-full bg-gray-50 border border-gray-300 rounded-none px-3 py-2 text-sm focus:outline-none font-mono"
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: SERVICES EDITOR */}
            {activeTab === 'services' && (
              <div className="space-y-8 animate-fadeIn">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-300 pb-6 gap-4">
                  <div>
                    <h2 className="font-display text-2xl font-bold uppercase tracking-tight">Services Editor</h2>
                    <p className="text-gray-500 text-xs font-sans mt-1">Create new service offerings, modify taglines, features list, and hero images.</p>
                  </div>
                  {!isAddingService && !editingServiceId && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsAddingService(true);
                        setEditingServiceId(null);
                        setNewServiceName('');
                        setNewServiceId('');
                        setNewServiceCount(String(services.length + 1).padStart(2, '0'));
                        setNewServiceTagline('');
                        setNewServiceImage('');
                        setNewServiceFeatures([]);
                        setNewServiceFeatureInput('');
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="bg-gray-900 text-white hover:bg-gray-800 px-5 py-3 rounded-none font-mono text-xs font-bold uppercase tracking-wider cursor-pointer transition-all flex items-center gap-2 shadow-sm shrink-0"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add New Service</span>
                    </button>
                  )}
                </div>

                {/* CREATE NEW SERVICE FORM */}
                {isAddingService ? (
                  <form onSubmit={handleCreateService} className="space-y-6 bg-gray-50 border border-gray-300 p-6 md:p-8 rounded-none">
                    <div className="flex items-center justify-between border-b border-gray-200 pb-4">
                      <div>
                        <span className="text-[10px] font-mono uppercase tracking-widest text-[#007A93] font-bold block">New Offering</span>
                        <h3 className="text-base font-display font-bold uppercase tracking-tight text-gray-900">
                          Create Brand New Service
                        </h3>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsAddingService(false)}
                        className="text-gray-500 hover:text-gray-900 p-2 rounded-none hover:bg-gray-200 cursor-pointer transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                      <div className="md:col-span-8">
                        <label className="block text-[10px] font-mono uppercase tracking-widest text-gray-500 mb-2">Service Name *</label>
                        <input
                          type="text"
                          value={newServiceName}
                          onChange={(e) => {
                            setNewServiceName(e.target.value);
                            if (!newServiceId || newServiceId === newServiceName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')) {
                              setNewServiceId(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''));
                            }
                          }}
                          placeholder="e.g. Motion Graphics & VFX"
                          required
                          className="w-full bg-white border border-gray-300 rounded-none px-4 py-3 text-sm focus:border-gray-900 focus:outline-none text-gray-900 font-sans transition-all"
                        />
                      </div>

                      <div className="md:col-span-4">
                        <label className="block text-[10px] font-mono uppercase tracking-widest text-gray-500 mb-2">Counter Number *</label>
                        <input
                          type="text"
                          value={newServiceCount}
                          onChange={(e) => setNewServiceCount(e.target.value)}
                          placeholder="09"
                          required
                          className="w-full bg-white border border-gray-300 rounded-none px-4 py-3 text-sm focus:border-gray-900 focus:outline-none text-gray-900 font-mono transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono uppercase tracking-widest text-gray-500 mb-2">Service ID (URL Slug) *</label>
                      <input
                        type="text"
                        value={newServiceId}
                        onChange={(e) => setNewServiceId(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                        placeholder="e.g. motion-graphics-vfx"
                        required
                        className="w-full bg-white border border-gray-300 rounded-none px-4 py-3 text-sm focus:border-gray-900 focus:outline-none text-gray-900 font-mono transition-all"
                      />
                      <span className="text-[10px] text-gray-400 font-mono mt-1 block">Unique slug identifier used in navigation and routes.</span>
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono uppercase tracking-widest text-gray-500 mb-2">Tagline Description *</label>
                      <textarea
                        value={newServiceTagline}
                        onChange={(e) => setNewServiceTagline(e.target.value)}
                        required
                        rows={3}
                        placeholder="Concise, high-impact description of what this service delivers..."
                        className="w-full bg-white border border-gray-300 rounded-none px-4 py-3 text-sm focus:border-gray-900 focus:outline-none text-gray-900 font-mono transition-all resize-none"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                      <div className="md:col-span-4">
                        <label className="bg-white hover:bg-gray-100 border-2 border-dashed border-gray-300 hover:border-[#007A93] rounded-none p-4 flex flex-col items-center justify-center text-center cursor-pointer transition-all select-none min-h-[95px]">
                          {uploadingFile ? <Loader className="w-5 h-5 animate-spin mb-1" /> : <Upload className="w-5 h-5 text-gray-600 mb-1" />}
                          <span className="text-[10px] font-mono font-bold uppercase tracking-wider">Upload Cover</span>
                          <span className="text-[9px] text-gray-400 mt-0.5">Click to upload file</span>
                          <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, 'new-service-cover')} disabled={uploadingFile} className="hidden" />
                        </label>
                      </div>
                      <div className="md:col-span-8">
                        <label className="block text-[10px] font-mono uppercase tracking-widest text-gray-500 mb-2">Service Cover Image URL *</label>
                        <input
                          type="text"
                          value={newServiceImage}
                          onChange={(e) => setNewServiceImage(e.target.value)}
                          placeholder="https://images.unsplash.com/..."
                          required
                          className="w-full bg-white border border-gray-300 rounded-none px-4 py-3 text-sm focus:border-gray-900 focus:outline-none text-gray-900 font-mono transition-all"
                        />
                      </div>
                    </div>

                    {newServiceImage && (
                      <div className="w-32 h-20 rounded-none overflow-hidden border border-gray-300 bg-gray-200">
                        <img src={newServiceImage} alt="Preview" className="w-full h-full object-cover" />
                      </div>
                    )}

                    <div>
                      <label className="block text-[10px] font-mono uppercase tracking-widest text-gray-500 mb-2">Service Features</label>
                      <div className="flex flex-wrap gap-2 mb-4 bg-white border border-gray-200 p-4 rounded-none min-h-[50px]">
                        {newServiceFeatures.length === 0 ? (
                          <span className="text-gray-400 text-xs font-sans">No features added yet. Add key bullet points below.</span>
                        ) : (
                          newServiceFeatures.map((feat, idx) => (
                            <span key={idx} className="bg-gray-100 border border-gray-200 rounded-none px-3 py-1 text-xs text-gray-800 font-sans flex items-center gap-1.5">
                              {feat}
                              <button
                                type="button"
                                onClick={() => handleRemoveNewServiceFeature(feat)}
                                className="text-gray-400 hover:text-red-500 p-0.5 rounded-none cursor-pointer transition-colors"
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
                          value={newServiceFeatureInput}
                          onChange={(e) => setNewServiceFeatureInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddNewServiceFeature();
                            }
                          }}
                          placeholder="Add new feature bullet (e.g. 4K High Resolution)..."
                          className="flex-1 bg-white border border-gray-300 rounded-none px-4 py-3 text-sm focus:border-gray-900 focus:outline-none text-gray-900 font-mono transition-all"
                        />
                        <button
                          type="button"
                          onClick={handleAddNewServiceFeature}
                          className="bg-gray-900 text-white hover:bg-gray-800 px-5 rounded-none font-mono text-xs font-bold uppercase tracking-widest cursor-pointer transition-all flex items-center gap-1"
                        >
                          <Plus className="w-4 h-4" /> Add
                        </button>
                      </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
                      <button
                        type="button"
                        onClick={() => setIsAddingService(false)}
                        className="px-6 py-3.5 text-xs font-mono font-bold uppercase tracking-wider text-gray-500 hover:text-gray-900 rounded-none bg-transparent transition-all cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isSaving}
                        className="px-7 py-3.5 text-xs font-mono font-bold uppercase tracking-wider bg-gray-900 text-white hover:bg-gray-800 rounded-none transition-all cursor-pointer shadow-md flex items-center gap-2 disabled:opacity-50"
                      >
                        {isSaving ? <Loader className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                        <span>Create Service</span>
                      </button>
                    </div>
                  </form>
                ) : editingServiceId ? (
                  /* EDIT SERVICE FORM */
                  <form onSubmit={handleSaveService} className="space-y-6 bg-gray-50 border border-gray-300 p-6 md:p-8 rounded-none">
                    <div className="flex items-center justify-between border-b border-gray-200 pb-4">
                      <div>
                        <span className="text-[10px] font-mono uppercase tracking-widest text-[#007A93] font-bold block">Editing Service</span>
                        <h3 className="text-base font-display font-bold uppercase tracking-tight text-gray-900">
                          {editName || services.find(s => s.id === editingServiceId)?.name}
                        </h3>
                      </div>
                      <button
                        type="button"
                        onClick={() => setEditingServiceId(null)}
                        className="text-gray-500 hover:text-gray-900 p-2 rounded-none hover:bg-gray-200 cursor-pointer transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                      <div className="md:col-span-8">
                        <label className="block text-[10px] font-mono uppercase tracking-widest text-gray-500 mb-2">Service Display Name *</label>
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          required
                          className="w-full bg-white border border-gray-300 rounded-none px-4 py-3 text-sm focus:border-gray-900 focus:outline-none text-gray-900 font-sans transition-all"
                        />
                      </div>
                      <div className="md:col-span-4">
                        <label className="block text-[10px] font-mono uppercase tracking-widest text-gray-500 mb-2">Counter Number *</label>
                        <input
                          type="text"
                          value={editCount}
                          onChange={(e) => setEditCount(e.target.value)}
                          required
                          className="w-full bg-white border border-gray-300 rounded-none px-4 py-3 text-sm focus:border-gray-900 focus:outline-none text-gray-900 font-mono transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono uppercase tracking-widest text-gray-500 mb-2">Tagline Description *</label>
                      <textarea
                        value={editTagline}
                        onChange={(e) => setEditTagline(e.target.value)}
                        required
                        rows={3}
                        className="w-full bg-white border border-gray-300 rounded-none px-4 py-3 text-sm focus:border-gray-900 focus:outline-none text-gray-900 font-mono transition-all resize-none"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                      <div className="md:col-span-4">
                        <label className="bg-white hover:bg-gray-100 border-2 border-dashed border-gray-300 hover:border-[#007A93] rounded-none p-4 flex flex-col items-center justify-center text-center cursor-pointer transition-all select-none min-h-[95px]">
                          {uploadingFile ? <Loader className="w-5 h-5 animate-spin mb-1" /> : <Upload className="w-5 h-5 text-gray-600 mb-1" />}
                          <span className="text-[10px] font-mono font-bold uppercase tracking-wider">Replace Cover</span>
                          <span className="text-[9px] text-gray-400 mt-0.5">Click to upload file</span>
                          <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, 'service-cover')} disabled={uploadingFile} className="hidden" />
                        </label>
                      </div>
                      <div className="md:col-span-8">
                        <label className="block text-[10px] font-mono uppercase tracking-widest text-gray-500 mb-2">Service Cover Image URL *</label>
                        <input
                          type="text"
                          value={editImage}
                          onChange={(e) => setEditImage(e.target.value)}
                          required
                          className="w-full bg-white border border-gray-300 rounded-none px-4 py-3 text-sm focus:border-gray-900 focus:outline-none text-gray-900 font-mono transition-all"
                        />
                      </div>
                    </div>

                    {editImage && (
                      <div className="w-32 h-20 rounded-none overflow-hidden border border-gray-300 bg-gray-200">
                        <img src={editImage} alt="Cover Preview" className="w-full h-full object-cover" />
                      </div>
                    )}

                    <div>
                      <label className="block text-[10px] font-mono uppercase tracking-widest text-gray-500 mb-2">Service Features</label>
                      <div className="flex flex-wrap gap-2 mb-4 bg-white border border-gray-200 p-4 rounded-none min-h-[50px]">
                        {editFeatures.length === 0 ? (
                          <span className="text-gray-400 text-xs font-sans">No features listed.</span>
                        ) : (
                          editFeatures.map((feat, idx) => (
                            <span key={idx} className="bg-gray-100 border border-gray-200 rounded-none px-3 py-1 text-xs text-gray-800 font-sans flex items-center gap-1.5">
                              {feat}
                              <button
                                type="button"
                                onClick={() => handleRemoveFeature(feat)}
                                className="text-gray-400 hover:text-red-500 p-0.5 rounded-none cursor-pointer transition-colors"
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
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddFeature();
                            }
                          }}
                          placeholder="Add new feature..."
                          className="flex-1 bg-white border border-gray-300 rounded-none px-4 py-3 text-sm focus:border-gray-900 focus:outline-none text-gray-900 font-mono transition-all"
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
                        className="px-7 py-3.5 text-xs font-mono font-bold uppercase tracking-wider bg-gray-900 text-white hover:bg-gray-800 rounded-none transition-all cursor-pointer shadow-md flex items-center gap-2 disabled:opacity-50"
                      >
                        {isSaving ? <Loader className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                        <span>Save Changes</span>
                      </button>
                    </div>
                  </form>
                ) : (
                  /* SERVICES LIST */
                  <div className="space-y-4">
                    {services.map((s) => (
                      <div key={s.id} className="bg-gray-50 border border-gray-200 p-5 rounded-none flex items-center justify-between gap-6 hover:border-gray-400 transition-colors">
                        <div className="flex items-center gap-4 min-w-0">
                          <img src={s.image} alt={s.name} className="w-16 h-12 object-cover rounded-none bg-gray-200 shrink-0" />
                          <div className="min-w-0">
                            <h3 className="font-display text-base font-bold uppercase text-gray-900 truncate">{s.name}</h3>
                            <span className="font-mono text-[10px] text-[#007A93] tracking-widest uppercase block">
                              {s.count} // {s.subsections?.length || 0} items // ID: {s.id}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleEditServiceClick(s)}
                            className="p-2.5 sm:px-3 sm:py-2 bg-gray-100 hover:bg-gray-200 rounded-none text-gray-700 hover:text-gray-900 transition-all cursor-pointer flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider border border-gray-200"
                          >
                            <Edit className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Edit</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteService(s.id)}
                            className="p-2.5 sm:px-3 sm:py-2 bg-red-50 hover:bg-red-100 rounded-none text-red-600 hover:text-red-800 transition-all cursor-pointer flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider border border-red-200"
                            title="Delete service"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Delete</span>
                          </button>
                        </div>
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
                      onChange={(e) => {
                        const newSvcId = e.target.value;
                        setSelectedServiceId(newSvcId);
                        const availableCats = ADMIN_CATEGORIES[newSvcId] || ['General'];
                        setNewCategory(availableCats[0] || 'General');
                        setNewCustomCategory('');
                        if (newSvcId === 'website-design' && (!newImagePosition || newImagePosition === 'center')) {
                          setNewImagePosition('top');
                        }
                      }}
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
                      <label className="block text-[10px] font-mono uppercase tracking-widest text-gray-500 mb-2 font-bold">Category *</label>
                      <div className="flex flex-col gap-2">
                        <select 
                          value={newCategory} 
                          onChange={(e) => setNewCategory(e.target.value)} 
                          className="w-full bg-gray-50 border border-gray-300 rounded-none px-4 py-3 text-sm focus:border-white focus:outline-none text-gray-900 font-mono transition-all cursor-pointer"
                        >
                          {Array.from(new Set([...(ADMIN_CATEGORIES[selectedServiceId] || []), ...getExistingCategories()])).map((cat, idx) => (
                            <option key={idx} value={cat}>{cat}</option>
                          ))}
                          <option value="Custom">+ Create New Category...</option>
                        </select>
                        {newCategory === 'Custom' && (
                          <input 
                            type="text" 
                            value={newCustomCategory} 
                            onChange={(e) => setNewCustomCategory(e.target.value)} 
                            required 
                            placeholder="New category name" 
                            className="w-full bg-gray-50 border border-gray-300 rounded-none px-4 py-3 text-sm focus:border-white focus:outline-none text-gray-900 font-mono transition-all placeholder:text-gray-400" 
                          />
                        )}
                      </div>
                    </div>

                    {/* Sub-sub category (E-Invitation) */}
                    {showSubSubCategory && (
                      <div>
                        <label className="block text-[10px] font-mono uppercase tracking-widest text-gray-500 mb-2 font-bold">Event Type</label>
                        <div className="flex flex-col gap-2">
                          <select value={newSubSubCategory} onChange={(e) => setNewSubSubCategory(e.target.value)} className="w-full bg-gray-50 border border-gray-300 rounded-none px-4 py-3 text-sm focus:border-white focus:outline-none text-gray-900 font-mono transition-all cursor-pointer">
                            <option value="Wedding">Wedding</option>
                            <option value="Other Function">Other Function</option>
                            <option value="Custom">+ Custom...</option>
                          </select>
                          {newSubSubCategory === 'Custom' && (
                            <input type="text" onChange={(e) => setNewSubSubCategory(e.target.value)} placeholder="Custom event type" className="w-full bg-gray-50 border border-gray-300 rounded-none px-4 py-3 text-sm focus:border-white focus:outline-none text-gray-900 font-mono transition-all placeholder:text-gray-400" />
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
                        <div className="flex flex-col gap-2">
                          <select 
                            value={clients.some(c => c.name === newBrandName) ? newBrandName : (newBrandName === '' ? '' : 'Custom')}
                            onChange={(e) => {
                              if (e.target.value === 'Custom') {
                                setNewBrandName(' '); 
                              } else {
                                setNewBrandName(e.target.value);
                              }
                            }}
                            className="w-full bg-gray-50 border border-gray-300 rounded-none px-4 py-3 text-sm focus:border-white focus:outline-none text-gray-900 font-mono transition-all cursor-pointer"
                          >
                            <option value="">-- No Brand --</option>
                            {clients.map(c => (
                              <option key={c.id} value={c.name}>{c.name}</option>
                            ))}
                            <option value="Custom">+ Custom Brand...</option>
                          </select>
                          {(!clients.some(c => c.name === newBrandName) && newBrandName !== '') && (
                            <input 
                              type="text" 
                              value={newBrandName.trimStart()} 
                              onChange={(e) => setNewBrandName(e.target.value)} 
                              placeholder="Type custom brand name..." 
                              className="w-full bg-gray-50 border border-gray-300 rounded-none px-4 py-3 text-sm focus:border-white focus:outline-none text-gray-900 font-mono transition-all placeholder:text-gray-400" 
                            />
                          )}
                        </div>
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
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-200 pb-3 gap-1">
                      <div>
                        <span className="font-mono text-xs font-bold uppercase text-[#007A93] tracking-widest block">Media & Artifact Storage</span>
                        <span className="text-[11px] font-sans text-gray-500">Upload cover image, demo video, PDF documentation, and demo link. You can provide any or all.</span>
                      </div>
                      <span className="text-[10px] font-mono text-gray-500 bg-gray-100 px-2 py-0.5 border border-gray-200 uppercase w-fit font-semibold">
                        Image • Video • PDF • Web
                      </span>
                    </div>

                    <div className="space-y-6">
                      {/* 1. Cover Image / Visual Media */}
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                        <div className="md:col-span-4">
                          <label
                            className="bg-gray-100 hover:bg-gray-200 border-2 border-dashed border-gray-300 hover:border-[#007A93] rounded-none p-4 flex flex-col items-center justify-center text-center cursor-pointer transition-all select-none min-h-[85px]"
                            onDragOver={e => { e.preventDefault(); e.currentTarget.classList.add('border-[#007A93]', 'bg-blue-50'); }}
                            onDragLeave={e => { e.currentTarget.classList.remove('border-[#007A93]', 'bg-blue-50'); }}
                            onDrop={e => { e.preventDefault(); e.currentTarget.classList.remove('border-[#007A93]', 'bg-blue-50'); const dt = { target: { files: e.dataTransfer.files } } as any; handleFileUpload(dt, 'visual'); }}
                          >
                            {uploadingFile ? <Loader className="w-5 h-5 animate-spin mb-1" /> : <ImageIcon className="w-5 h-5 text-gray-600 mb-1" />}
                            <span className="text-[10px] font-mono font-bold uppercase tracking-wider">Cover Image / Media</span>
                            <span className="text-[9px] text-gray-400 mt-1">Upload JPG, PNG, WEBP, MP4</span>
                            <input type="file" accept="image/*,video/*" multiple onChange={(e) => handleFileUpload(e, 'visual')} disabled={uploadingFile} className="hidden" />
                          </label>
                        </div>
                        <div className="md:col-span-8">
                          <label className="block text-[9px] font-mono uppercase text-gray-500 mb-1">Visual Cover URL *</label>
                          <input type="text" value={newVisualUrl} onChange={(e) => setNewVisualUrl(e.target.value)} placeholder="Main cover image or video URL" className="w-full bg-gray-50 border border-gray-300 px-4 py-2 text-xs focus:border-white focus:outline-none text-gray-900 transition-all" />
                          <span className="text-[9px] font-sans text-gray-400 mt-1 block">Primary thumbnail displayed on the service page cards.</span>
                        </div>
                      </div>

                      {/* Crop Alignment / Focus Point Control */}
                      <div className="bg-gray-100/70 border border-gray-200 p-3.5 rounded-none">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 mb-2.5">
                          <div>
                            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-gray-900 flex items-center gap-1.5">
                              <Crop className="w-3.5 h-3.5 text-[#007A93]" /> Thumbnail Crop Focus & Alignment
                            </span>
                            <span className="text-[10px] text-gray-500 block">
                              Select which part of the image to display in cropped cards (select "Top" for websites so the header/hero is visible).
                            </span>
                          </div>
                          {newVisualUrl && !isVideoUrl(newVisualUrl) && (
                            <span className="text-[8px] font-mono font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 uppercase tracking-wider">
                              Interactive Preview
                            </span>
                          )}
                        </div>

                        <div className="flex flex-wrap sm:flex-nowrap items-center gap-4">
                          {/* 3x3 Interactive Direction Grid */}
                          <div className="grid grid-cols-3 gap-1 w-24 h-24 bg-white p-1 border border-gray-300 shrink-0 shadow-sm" title="Click a position to anchor crop">
                            {[
                              { id: 'top left', label: 'TL', title: 'Top Left' },
                              { id: 'top', label: 'TOP', title: 'Top (Header / Hero)' },
                              { id: 'top right', label: 'TR', title: 'Top Right' },
                              { id: 'left', label: 'LFT', title: 'Left' },
                              { id: 'center', label: 'CTR', title: 'Center (Default)' },
                              { id: 'right', label: 'RGT', title: 'Right' },
                              { id: 'bottom left', label: 'BL', title: 'Bottom Left' },
                              { id: 'bottom', label: 'BTM', title: 'Bottom (Footer)' },
                              { id: 'bottom right', label: 'BR', title: 'Bottom Right' },
                            ].map(pos => {
                              const activePos = newImagePosition || (selectedServiceId === 'website-design' ? 'top' : 'center');
                              const isSelected = activePos === pos.id;
                              return (
                                <button
                                  key={pos.id}
                                  type="button"
                                  title={pos.title}
                                  onClick={() => setNewImagePosition(pos.id)}
                                  className={`text-[8px] font-mono font-bold transition-all flex items-center justify-center border ${
                                    isSelected
                                      ? 'bg-[#007A93] text-white border-[#007A93] shadow-inner'
                                      : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-200 hover:border-gray-400'
                                  }`}
                                >
                                  {pos.label}
                                </button>
                              );
                            })}
                          </div>

                          {/* Quick selection preset pills */}
                          <div className="flex-1 space-y-2">
                            <div className="flex flex-wrap gap-1.5">
                              {[
                                { id: 'top', label: 'Top (Header / Hero)' },
                                { id: 'center', label: 'Center (Balanced)' },
                                { id: 'bottom', label: 'Bottom (Footer)' },
                                { id: 'left', label: 'Left' },
                                { id: 'right', label: 'Right' },
                              ].map(pill => {
                                const activePos = newImagePosition || (selectedServiceId === 'website-design' ? 'top' : 'center');
                                const isSelected = activePos === pill.id;
                                return (
                                  <button
                                    key={pill.id}
                                    type="button"
                                    onClick={() => setNewImagePosition(pill.id)}
                                    className={`px-2.5 py-1 text-[10px] font-mono uppercase tracking-wider border transition-all ${
                                      isSelected
                                        ? 'bg-black text-white border-black font-bold shadow-sm'
                                        : 'bg-white text-gray-700 border-gray-300 hover:border-gray-500 hover:text-black'
                                    }`}
                                  >
                                    {pill.label}
                                  </button>
                                );
                              })}
                            </div>
                            <p className="text-[10px] text-gray-500 font-sans">
                              Active crop alignment: <span className="font-mono font-bold text-black uppercase bg-gray-200 px-1.5 py-0.5 border border-gray-300 ml-1">{newImagePosition || (selectedServiceId === 'website-design' ? 'top' : 'center')}</span>
                              {selectedServiceId === 'website-design' && (
                                <span className="text-[#007A93] ml-2 font-medium">✨ 'Top' is recommended for website screenshots</span>
                              )}
                            </p>
                          </div>

                          {/* Live preview square thumbnail */}
                          {newVisualUrl && !isVideoUrl(newVisualUrl) && (
                            <div className="flex flex-col items-center shrink-0">
                              <span className="text-[8px] font-mono text-gray-500 uppercase tracking-wider mb-1 font-bold">Card Preview</span>
                              <div className="w-20 h-20 border-2 border-black overflow-hidden bg-gray-200 relative shadow-sm">
                                <img
                                  src={newVisualUrl}
                                  alt="Crop Preview"
                                  className="w-full h-full object-cover transition-all duration-300"
                                  style={{ objectPosition: newImagePosition || (selectedServiceId === 'website-design' ? 'top' : 'center') }}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* 2. Demo Video */}
                      {showVideoUrl && (
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center border-t border-gray-200 pt-4">
                          <div className="md:col-span-4">
                            <label
                              className="bg-gray-100 hover:bg-gray-200 border-2 border-dashed border-gray-300 hover:border-purple-600 rounded-none p-4 flex flex-col items-center justify-center text-center cursor-pointer transition-all select-none min-h-[85px]"
                              onDragOver={e => { e.preventDefault(); e.currentTarget.classList.add('border-purple-600', 'bg-purple-50'); }}
                              onDragLeave={e => { e.currentTarget.classList.remove('border-purple-600', 'bg-purple-50'); }}
                              onDrop={e => { e.preventDefault(); e.currentTarget.classList.remove('border-purple-600', 'bg-purple-50'); const dt = { target: { files: e.dataTransfer.files } } as any; handleFileUpload(dt, 'video'); }}
                            >
                              {uploadingFile ? <Loader className="w-5 h-5 animate-spin mb-1" /> : <Play className="w-5 h-5 text-purple-600 mb-1" />}
                              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-purple-900">Upload Video</span>
                              <span className="text-[9px] text-gray-400 mt-1">MP4, WebM, MOV</span>
                              <input type="file" accept="video/*" onChange={(e) => handleFileUpload(e, 'video')} disabled={uploadingFile} className="hidden" />
                            </label>
                          </div>
                          <div className="md:col-span-8">
                            <label className="block text-[9px] font-mono uppercase text-gray-500 mb-1">Demo Video URL (Direct MP4, Loom, YouTube, or Vimeo)</label>
                            <input type="text" value={newVideoUrl} onChange={(e) => setNewVideoUrl(e.target.value)} placeholder="https://... video file, Loom, or YouTube URL" className="w-full bg-gray-50 border border-gray-300 px-4 py-2 text-xs focus:border-white focus:outline-none text-gray-900 transition-all" />
                            <span className="text-[9px] font-sans text-gray-400 mt-1 block">Full demo video playable in the popup modal when visitors click View Demo.</span>
                          </div>
                        </div>
                      )}

                      {/* 3. PDF Document */}
                      {showPdfUrl && (
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center border-t border-gray-200 pt-4">
                          <div className="md:col-span-4">
                            <label className="bg-gray-100 hover:bg-gray-200 border-2 border-dashed border-gray-300 hover:border-amber-600 rounded-none p-4 flex flex-col items-center justify-center text-center cursor-pointer transition-all select-none min-h-[85px]">
                              {uploadingFile ? <Loader className="w-5 h-5 animate-spin mb-1" /> : <FileText className="w-5 h-5 text-amber-600 mb-1" />}
                              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-900">Upload PDF</span>
                              <span className="text-[9px] text-gray-400 mt-1">Flowcharts, Architecture, Specs</span>
                              <input type="file" accept="application/pdf" onChange={(e) => handleFileUpload(e, 'pdf')} disabled={uploadingFile} className="hidden" />
                            </label>
                          </div>
                          <div className="md:col-span-8">
                            <label className="block text-[9px] font-mono uppercase text-gray-500 mb-1">PDF Document URL</label>
                            <input type="url" value={newPdfUrl} onChange={(e) => setNewPdfUrl(e.target.value)} placeholder="https://example.com/workflow-diagram.pdf" className="w-full bg-gray-50 border border-gray-300 px-4 py-2 text-xs focus:border-white focus:outline-none text-gray-900 transition-all" />
                            <span className="text-[9px] font-sans text-gray-400 mt-1 block">PDF documentation viewable and downloadable directly in the modal.</span>
                          </div>
                        </div>
                      )}

                      {/* 4. Website / Live Demo */}
                      {showWebsiteUrl && (
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center border-t border-gray-200 pt-4">
                          <div className="md:col-span-4 flex items-center justify-center">
                            <div className="bg-gray-100 border border-gray-300 rounded-none p-4 flex flex-col items-center justify-center text-center w-full min-h-[85px]">
                              <Globe className="w-5 h-5 text-emerald-600 mb-1" />
                              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-900">Live Web / Tool Link</span>
                              <span className="text-[9px] text-gray-400 mt-1">Endpoint or Web App</span>
                            </div>
                          </div>
                          <div className="md:col-span-8">
                            <label className="block text-[9px] font-mono uppercase text-gray-500 mb-1">Website / Live Demo URL</label>
                            <input type="url" value={newWebsiteUrl} onChange={(e) => setNewWebsiteUrl(e.target.value)} placeholder="https://example.com" className="w-full bg-gray-50 border border-gray-300 px-4 py-2 text-xs focus:border-white focus:outline-none text-gray-900 transition-all" />
                            <span className="text-[9px] font-sans text-gray-400 mt-1 block">Embedded iframe or external link to live application / webhook.</span>
                          </div>
                        </div>
                      )}

                      {/* 4.5. End-to-End Workflow Pipeline (Automation specific) */}
                      {(selectedServiceId === 'automation' || newVisualType === 'automation') && (
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center border-t border-gray-200 pt-4">
                          <div className="md:col-span-4 flex items-center justify-center">
                            <div className="bg-cyan-50 border border-cyan-200 rounded-none p-4 flex flex-col items-center justify-center text-center w-full min-h-[85px]">
                              <span className="text-[#007A93] font-bold text-xs mb-1">■ WORKFLOW</span>
                              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-cyan-900">Pipeline Steps</span>
                              <span className="text-[9px] text-cyan-600 mt-1">Image 4 Flowchart</span>
                            </div>
                          </div>
                          <div className="md:col-span-8">
                            <label className="block text-[9px] font-mono uppercase text-gray-500 mb-1 font-bold">
                              End-to-End Workflow Steps (Separate steps with &quot;-&gt;&quot; or commas)
                            </label>
                            <input
                              type="text"
                              value={newWorkflowSteps}
                              onChange={(e) => setNewWorkflowSteps(e.target.value)}
                              placeholder="VISITOR -> ENQUIRY FORM -> SUBMISSION -> CONFIRMATION TO SENDER + NOTIFICATION TO CLIENT -> INSTAGRAM REDIRECT"
                              className="w-full bg-white border border-gray-300 px-4 py-2 text-xs focus:border-gray-900 focus:outline-none text-gray-900 font-mono transition-all"
                            />
                            <span className="text-[9px] font-sans text-gray-400 mt-1 block">
                              Displays connected flowchart badges in the case study popup (Image 4). Leave blank to use auto-detected steps.
                            </span>
                          </div>
                        </div>
                      )}

                      {/* 5. Additional Media / Screenshots / Variants */}
                      {showGalleryImages && (
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center border-t border-gray-200 pt-4">
                          <div className="md:col-span-4">
                            <label
                              className="bg-gray-100 hover:bg-gray-200 border-2 border-dashed border-gray-300 hover:border-[#007A93] rounded-none p-4 flex flex-col items-center justify-center text-center cursor-pointer transition-all select-none min-h-[85px]"
                              onDragOver={e => { e.preventDefault(); e.currentTarget.classList.add('border-[#007A93]', 'bg-blue-50'); }}
                              onDragLeave={e => { e.currentTarget.classList.remove('border-[#007A93]', 'bg-blue-50'); }}
                              onDrop={e => { e.preventDefault(); e.currentTarget.classList.remove('border-[#007A93]', 'bg-blue-50'); const dt = { target: { files: e.dataTransfer.files } } as any; handleFileUpload(dt, 'variant'); }}
                            >
                              {uploadingFile ? <Loader className="w-5 h-5 animate-spin mb-1" /> : <Upload className="w-5 h-5 text-gray-600 mb-1" />}
                              <span className="text-[10px] font-mono font-bold uppercase tracking-wider">Additional Media</span>
                              <span className="text-[9px] text-gray-400 mt-1">Batch upload screenshots</span>
                              <input type="file" multiple accept="image/*,video/*" onChange={(e) => handleFileUpload(e, 'variant')} disabled={uploadingFile} className="hidden" />
                            </label>
                          </div>
                          <div className="md:col-span-8">
                            <label className="block text-[9px] font-mono uppercase text-gray-500 mb-1">{isShootService ? 'AI Shoot Images (Comma Separated)' : 'Additional Screenshots / Diagrams (Comma Separated)'}</label>
                            <input type="text" value={newGeneratedVariants} onChange={(e) => setNewGeneratedVariants(e.target.value)} placeholder="https://img1.jpg, https://img2.jpg" className="w-full bg-gray-50 border border-gray-300 px-4 py-2 text-xs focus:border-white focus:outline-none text-gray-900 transition-all" />
                            <span className="text-[9px] font-sans text-gray-400 mt-1 block">Secondary images or workflow diagrams displayed in the modal gallery.</span>
                          </div>
                        </div>
                      )}

                      {/* Originals - only for shoot services */}
                      {isShootService && (
                        <>
                          <div className="grid grid-cols-1 gap-6 items-center border-t border-gray-200 pt-4">
                            <label className="flex items-center gap-3 cursor-pointer p-4 bg-gray-50 border border-gray-200 w-max hover:bg-gray-100 transition-colors select-none">
                              <input type="checkbox" checked={newIsComparisonMode} onChange={(e) => setNewIsComparisonMode(e.target.checked)} className="w-4 h-4 accent-[#007A93]" />
                              <span className="text-[10px] font-mono uppercase tracking-widest text-gray-700 font-bold">Enable 1:1 Comparison Mode (Stacked Pairs)</span>
                            </label>
                            <p className="text-[10px] font-sans text-gray-500 -mt-4">
                              Pairs Original Input #1 with Final Visual #1, Original #2 with Final #2, etc. Ideal for showing direct before-and-after transformations.
                            </p>
                            <p className="text-[10px] font-sans text-orange-600 -mt-4">
                              <strong>Upload Tip:</strong> To keep pairs in the correct sequence, rename your files (e.g. 1.jpg, 2.jpg) before batch uploading, or upload them one by one. You can also manually reorder the comma-separated URLs below.
                            </p>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center border-t border-gray-200 pt-4">
                            <div className="md:col-span-4">
                              <label
                                className="bg-gray-100 hover:bg-gray-200 border-2 border-dashed border-gray-300 hover:border-[#007A93] rounded-none p-4 flex flex-col items-center justify-center text-center cursor-pointer transition-all select-none min-h-[85px]"
                                onDragOver={e => { e.preventDefault(); e.currentTarget.classList.add('border-[#007A93]', 'bg-blue-50'); }}
                                onDragLeave={e => { e.currentTarget.classList.remove('border-[#007A93]', 'bg-blue-50'); }}
                                onDrop={e => { e.preventDefault(); e.currentTarget.classList.remove('border-[#007A93]', 'bg-blue-50'); const dt = { target: { files: e.dataTransfer.files } } as any; handleFileUpload(dt, 'original'); }}
                              >
                                {uploadingFile ? <Loader className="w-5 h-5 animate-spin mb-1" /> : <Upload className="w-5 h-5 text-gray-600 mb-1" />}
                                <span className="text-[10px] font-mono font-bold uppercase tracking-wider">Originals</span>
                                <span className="text-[9px] text-gray-400 mt-1">Click or drag & drop</span>
                                <input type="file" multiple accept="image/*" onChange={(e) => handleFileUpload(e, 'original')} disabled={uploadingFile} className="hidden" />
                              </label>
                            </div>
                            <div className="md:col-span-8">
                              <label className="block text-[9px] font-mono uppercase text-gray-500 mb-1">Original Images (Comma Separated)</label>
                              <input type="text" value={newOriginalUrls} onChange={(e) => setNewOriginalUrls(e.target.value)} placeholder="Comma separated URLs" className="w-full bg-gray-50 border border-gray-300 px-4 py-2 text-xs focus:border-white focus:outline-none text-gray-900 transition-all" />
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

                {/* Listing current subsections to delete & reorder */}
                <div className="border-t border-gray-200 pt-10 mt-10">
                  <div 
                    className="flex justify-between items-center mb-6 cursor-pointer hover:bg-gray-50 p-2 -mx-2 transition-colors select-none" 
                    onClick={() => setManageWorksOpen(!manageWorksOpen)}
                  >
                    <h3 className="font-display text-xl font-bold uppercase tracking-tight">Manage Published Subsections</h3>
                    <button type="button" className="p-2 bg-gray-100 hover:bg-gray-200 rounded-none transition-colors">
                      {manageWorksOpen ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                    </button>
                  </div>

                  {manageWorksOpen && (
                    <div className="animate-fadeIn">

                  {/* #12 — Category Cover Images for Shoot Services */}
                  {services.filter(s => s.id === 'ai-photo-shoot' || s.id === 'ai-video-shoot').map(s => (
                    <div key={`cover-${s.id}`} className="mb-8 bg-gray-50 border border-gray-200 p-6 rounded-none">
                      <h4 className="font-mono text-xs font-bold uppercase text-[#007A93] tracking-widest mb-4">{s.name} — Category Cover Images</h4>
                      <p className="text-xs text-gray-500 mb-4 font-sans">Set a custom cover image for each shoot category. This overrides the auto-detected first item.</p>
                      <div className="space-y-3">
                        {(ADMIN_CATEGORIES[s.id] || []).map(cat => {
                          const currentCover = s.categoryCoverImages?.[cat] || '';
                          return (
                            <div key={cat} className="grid grid-cols-12 gap-4 items-center">
                              <span className="col-span-3 text-xs font-mono font-bold text-gray-700 uppercase">{cat}</span>
                              {currentCover && <img src={currentCover} alt={cat} className="col-span-2 w-full aspect-square object-cover border border-gray-200" />}
                              <div className="col-span-5 flex gap-2">
                                <input
                                  type="text"
                                  value={currentCover}
                                  onChange={async (e) => {
                                    const updatedServices = services.map(sv => sv.id === s.id ? { ...sv, categoryCoverImages: { ...(sv.categoryCoverImages || {}), [cat]: e.target.value } } : sv);
                                    await updateServices(updatedServices);
                                  }}
                                  placeholder="Paste image URL..."
                                  className="flex-1 bg-gray-50 border border-gray-300 rounded-none px-3 py-2 text-xs focus:outline-none font-mono"
                                />
                              </div>
                              <label className="col-span-2 bg-gray-100 hover:bg-gray-200 border border-gray-200 p-2 flex items-center justify-center text-center cursor-pointer transition-all select-none">
                                {uploadingFile ? <Loader className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4 text-gray-600" />}
                                <input
                                  type="file"
                                  accept="image/*,video/*"
                                  onChange={async (e) => {
                                    const files = e.target.files;
                                    if (!files || files.length === 0) return;
                                    setUploadingFile(true);
                                    try {
                                      const file = files[0];
                                      const fileExt = file.name.split('.').pop();
                                      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
                                      const { error } = await supabase.storage.from('portfolio-media').upload(fileName, file, { cacheControl: '3600', upsert: false });
                                      if (error) throw error;
                                      const { data: { publicUrl } } = supabase.storage.from('portfolio-media').getPublicUrl(fileName);
                                      const updatedServices = services.map(sv => sv.id === s.id ? { ...sv, categoryCoverImages: { ...(sv.categoryCoverImages || {}), [cat]: publicUrl } } : sv);
                                      await updateServices(updatedServices);
                                      triggerToast(`Cover for "${cat}" updated!`);
                                    } catch (err) { triggerToast('Upload failed.'); }
                                    finally { setUploadingFile(false); }
                                  }}
                                  className="hidden"
                                />
                              </label>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}

                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-4">
                    <p className="text-xs text-gray-500 font-sans">
                      Organize, reorder, or minimize/maximize service subsections and their categories.
                    </p>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          const allCollapsed: Record<string, boolean> = {};
                          (previewServices || services).forEach(s => {
                            if (s.subsections?.length) allCollapsed[s.id] = false;
                          });
                          setCollapsedServices(allCollapsed);
                        }}
                        className="text-[10px] font-mono uppercase tracking-wider text-gray-600 hover:text-black bg-white hover:bg-gray-100 border border-gray-200 px-2.5 py-1 transition-colors cursor-pointer shadow-xs"
                      >
                        Expand All
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const allCollapsed: Record<string, boolean> = {};
                          (previewServices || services).forEach(s => {
                            if (s.subsections?.length) allCollapsed[s.id] = true;
                          });
                          setCollapsedServices(allCollapsed);
                        }}
                        className="text-[10px] font-mono uppercase tracking-wider text-gray-600 hover:text-black bg-white hover:bg-gray-100 border border-gray-200 px-2.5 py-1 transition-colors cursor-pointer shadow-xs"
                      >
                        Collapse All
                      </button>
                    </div>
                  </div>

                  <div className="space-y-6">
                    {(previewServices || services).map(s => {
                      if (!s.subsections || s.subsections.length === 0) return null;
                      const isServiceCollapsed = collapsedServices[s.id];

                      return (
                        <div key={s.id} className="space-y-4 bg-gray-50/50 p-4 border border-gray-200 rounded-none">
                          {/* Service Header with Minimize/Maximize Toggle */}
                          <div 
                            className="flex justify-between items-center cursor-pointer select-none bg-white p-3 border border-gray-200 hover:border-[#007A93]/60 transition-all shadow-xs"
                            onClick={() => setCollapsedServices(prev => ({ ...prev, [s.id]: !isServiceCollapsed }))}
                          >
                            <h4 className="font-mono text-xs font-bold uppercase text-[#007A93] tracking-widest flex items-center gap-2">
                              <span>{s.name} Subsections</span>
                              <span className="bg-[#007A93]/10 text-[#007A93] px-2 py-0.5 rounded-none text-[10px] font-bold">
                                ({s.subsections.length})
                              </span>
                            </h4>
                            <div className="flex items-center gap-3">
                              <span className="text-gray-400 font-mono text-[10px] w-14 text-right font-bold tracking-wider">
                                {isServiceCollapsed ? 'SHOW ▼' : 'HIDE ▲'}
                              </span>
                            </div>
                          </div>

                          {!isServiceCollapsed && (
                            <div className="space-y-6 mt-4">
                            {/* Group subsections by category */}
                            {(() => {
                              const grouped = s.subsections.reduce((acc, sub, idx) => {
                                const cat = sub.subCategory || 'General';
                                if (!acc[cat]) acc[cat] = [];
                                acc[cat].push({ sub, idx });
                                return acc;
                              }, {} as Record<string, { sub: any, idx: number }[]>);
                              
                              const cats = Object.keys(grouped);
                              const order = s.categoryOrder || [];
                              if (order.length > 0) {
                                cats.sort((a, b) => {
                                  const indexA = order.indexOf(a);
                                  const indexB = order.indexOf(b);
                                  if (indexA !== -1 && indexB !== -1) return indexA - indexB;
                                  if (indexA !== -1) return -1;
                                  if (indexB !== -1) return 1;
                                  return 0;
                                });
                              }

                              return cats.map((category, catIdx) => {
                                const items = grouped[category];
                                const isCollapsed = collapsedCategories[`${s.id}-${category}`];
                                return (
                                  <div key={category} className="space-y-3">
                                    {/* Category Header */}
                                    <div 
                                      className="flex justify-between items-center cursor-pointer bg-gray-100 hover:bg-gray-200 transition-colors p-3 border-l-4 border-[#007A93]"
                                      onClick={() => setCollapsedCategories(prev => ({ ...prev, [`${s.id}-${category}`]: !isCollapsed }))}
                                    >
                                      <h5 className="font-sans text-xs font-bold text-gray-700 uppercase tracking-widest">{category} <span className="text-gray-400 font-normal ml-1">({items.length})</span></h5>
                                      <div className="flex items-center gap-3">
                                        <div className="flex items-center gap-1 bg-white border border-gray-200 p-0.5 rounded-sm shadow-sm" onClick={(e) => e.stopPropagation()}>
                                          <button 
                                            disabled={catIdx === 0}
                                            onClick={(e) => handleMoveCategory(e, s.id, category, 'up')}
                                            className={`p-1 hover:bg-gray-100 transition-colors ${catIdx === 0 ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'}`}
                                            title="Move Category Up"
                                          >
                                            <ChevronUp className="w-3.5 h-3.5 text-gray-600" />
                                          </button>
                                          <div className="w-[1px] h-3 bg-gray-200"></div>
                                          <button 
                                            disabled={catIdx === cats.length - 1}
                                            onClick={(e) => handleMoveCategory(e, s.id, category, 'down')}
                                            className={`p-1 hover:bg-gray-100 transition-colors ${catIdx === cats.length - 1 ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'}`}
                                            title="Move Category Down"
                                          >
                                            <ChevronDown className="w-3.5 h-3.5 text-gray-600" />
                                          </button>
                                        </div>
                                        <span className="text-gray-400 font-mono text-[10px] w-14 text-right">{isCollapsed ? 'SHOW ▼' : 'HIDE ▲'}</span>
                                      </div>
                                    </div>

                                  {/* Items List */}
                                  {!isCollapsed && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      {items.map(({ sub, idx }) => (
                                        <motion.div 
                                          layout
                                          key={sub.title + idx} 
                                          draggable
                                          onDragStart={(e) => {
                                            e.dataTransfer.effectAllowed = "move";
                                            setDraggedItemIndex(idx);
                                            setDraggedItemService(s.id);
                                            setPreviewServices(services);
                                          }}
                                          onDragEnter={(e) => {
                                            e.preventDefault();
                                            if (draggedItemService !== s.id || draggedItemIndex === null || draggedItemIndex === idx) return;

                                            setPreviewServices(prev => {
                                              const nextServices = prev ? [...prev] : [...services];
                                              const sIndex = nextServices.findIndex(sv => sv.id === s.id);
                                              if (sIndex === -1) return nextServices;
                                          
                                              const sCopy = { ...nextServices[sIndex] };
                                              const subs = [...(sCopy.subsections || [])];
                                              
                                              const [removed] = subs.splice(draggedItemIndex, 1);
                                              removed.subCategory = category === 'General' ? '' : category;
                                              subs.splice(idx, 0, removed);
                                              
                                              sCopy.subsections = subs;
                                              nextServices[sIndex] = sCopy;
                                              return nextServices;
                                            });
                                            setDraggedItemIndex(idx);
                                          }}
                                          onDragOver={(e) => {
                                            e.preventDefault();
                                            e.dataTransfer.dropEffect = "move";
                                          }}
                                          onDrop={async (e) => {
                                            e.preventDefault();
                                            if (draggedItemService !== s.id || draggedItemIndex === null) return;
                                            if (previewServices) {
                                              await updateServices(previewServices);
                                            }
                                            setDraggedItemIndex(null);
                                            setDraggedItemService(null);
                                            setPreviewServices(null);
                                          }}
                                          onDragEnd={() => {
                                            setDraggedItemIndex(null);
                                            setDraggedItemService(null);
                                            setPreviewServices(null);
                                          }}
                                          className={`bg-gray-50 border border-gray-200 p-4 rounded-none flex justify-between gap-4 items-start ${draggedItemIndex === idx ? 'opacity-30 border-dashed border-[#007A93]' : 'cursor-move hover:border-gray-400 hover:shadow-sm transition-all'}`}
                                        >
                                          <div className="flex gap-3 items-start overflow-hidden pointer-events-none">
                                            <div className="text-gray-300 mt-3 mr-1 shrink-0">
                                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8h16M4 16h16"></path></svg>
                                            </div>
                                            <img
                                              src={sub.visualUrl}
                                              alt={sub.title}
                                              className="w-14 h-14 object-cover rounded-none bg-gray-200 shrink-0"
                                              style={{ objectPosition: sub.imagePosition || (s.id === 'website-design' ? 'top' : 'center') }}
                                            />
                                            <div className="overflow-hidden">
                                              <h5 className="font-sans text-xs font-bold text-gray-900 truncate">{sub.title}</h5>
                                              <span className="font-sans text-[10px] text-gray-500 block mt-0.5">
                                                Category: <span className="text-gray-600 font-semibold">{sub.subCategory || 'General'}</span>
                                              </span>
                                              <div className="flex items-center gap-1.5 flex-wrap mt-1">
                                                <span className="font-mono text-[9px] text-[#007A93] bg-[#007A93]/10 px-1.5 py-0.5 tracking-wider uppercase font-semibold">
                                                  {sub.visualType || 'image'}
                                                </span>
                                                {sub.imagePosition && (
                                                  <span className="font-mono text-[8px] text-gray-700 bg-gray-200 border border-gray-300 px-1 py-0.5 tracking-wider uppercase font-bold">
                                                    Crop: {sub.imagePosition}
                                                  </span>
                                                )}
                                                {sub.videoUrl && (
                                                  <span className="font-mono text-[8px] text-purple-700 bg-purple-50 border border-purple-200 px-1 py-0.5 tracking-wider uppercase font-bold">
                                                    + Video
                                                  </span>
                                                )}
                                                {sub.pdfUrl && (
                                                  <span className="font-mono text-[8px] text-amber-700 bg-amber-50 border border-amber-200 px-1 py-0.5 tracking-wider uppercase font-bold">
                                                    + PDF
                                                  </span>
                                                )}
                                                {sub.websiteUrl && (
                                                  <span className="font-mono text-[8px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-1 py-0.5 tracking-wider uppercase font-bold">
                                                    + Web
                                                  </span>
                                                )}
                                              </div>
                                            </div>
                                          </div>

                                          <div className="flex items-center gap-1">
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
                                        </motion.div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              );
                            })
                            })()}
                          </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                    </div>
                  )}
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
                            {(brand.workItems?.length || 0) + services.reduce((acc, s) => acc + (s.subsections?.filter(sub => sub.brandName?.toLowerCase() === brand.name.toLowerCase()).length || 0), 0)} items
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
                        <div className="md:col-span-3 bg-gray-50 border border-gray-300 p-5 rounded-none space-y-4">
                           <label className="block text-[10px] font-mono uppercase tracking-widest text-gray-500">Brand Graphic Logo Upload</label>
                           <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                              <div className="md:col-span-4">
                                <label className="bg-white hover:bg-gray-50 border border-gray-300 rounded-none p-4 flex flex-col items-center justify-center text-center cursor-pointer transition-all select-none h-full min-h-[80px]">
                                  {uploadingFile ? (
                                    <>
                                      <Loader className="w-5 h-5 animate-spin mb-1 text-emerald-500" />
                                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-600">Uploading...</span>
                                    </>
                                  ) : (
                                    <>
                                      <Upload className="w-5 h-5 text-gray-600 mb-1" />
                                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider">Upload Logo</span>
                                    </>
                                  )}
                                  <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => handleFileUpload(e, 'brand-logo')}
                                    disabled={uploadingFile}
                                    className="hidden"
                                  />
                                </label>
                              </div>
                              <div className="md:col-span-8">
                                <label className="block text-[9px] font-mono uppercase text-gray-500 mb-1">Logo Image URL</label>
                                <input
                                  type="text"
                                  value={clientLogoImage}
                                  onChange={(e) => setClientLogoImage(e.target.value)}
                                  placeholder="Logo Image URL (optional)"
                                  className="w-full bg-white border border-gray-300 px-4 py-2 text-xs focus:border-gray-400 focus:outline-none text-gray-900 transition-all"
                                />
                              </div>
                           </div>
                        </div>
                      </div>

                      {uploadError && <div className="text-xs text-red-400 font-sans flex items-center gap-1"><AlertCircle className="w-4 h-4" /> {uploadError}</div>}
                      {uploadSuccess && <div className="text-xs text-emerald-400 font-sans flex items-center gap-1"><Check className="w-4 h-4" /> Logo uploaded successfully!</div>}

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
                        {clients.map((client) => {
                          const legacyCount = client.workItems?.length || 0;
                          const serviceCount = services.reduce((acc, s) => acc + (s.subsections?.filter(sub => sub.brandName?.toLowerCase() === client.name.toLowerCase()).length || 0), 0);
                          const totalWorkCount = legacyCount + serviceCount;
                          
                          return (
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
                                <Plus className="w-3.5 h-3.5" /> Work ({totalWorkCount})
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
                          );
                        })}
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

            {/* TAB: REVIEWS */}
            {activeTab === 'reviews' && (
              <div className="space-y-8 animate-fadeIn">
                <div className="border-b border-gray-300 pb-6">
                  <h2 className="font-display text-2xl font-bold uppercase tracking-tight">Client Reviews</h2>
                  <p className="text-gray-500 text-xs font-sans mt-1">Manage user-submitted reviews that appear in the 'They Love Us' section.</p>
                </div>

                {testimonials.length === 0 ? (
                  <div className="text-center py-20 bg-gray-50 border border-dashed border-gray-300 rounded-none">
                    <Award className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="font-mono text-sm font-bold uppercase tracking-widest text-gray-500 mb-1">No Reviews Yet</h3>
                    <p className="text-xs text-gray-400 font-sans">User submissions will appear here.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {testimonials.map((review) => (
                      <div key={review.id} className="bg-white border border-gray-200 shadow-sm p-6 flex flex-col gap-4 relative">
                        <div className="flex justify-between items-start gap-4">
                          <div>
                            <h4 className="font-display text-lg font-bold text-gray-900 leading-tight">{review.author}</h4>
                            <p className="text-[10px] font-mono text-[#007A93] uppercase tracking-widest">{review.role} {review.company ? `• ${review.company}` : ''}</p>
                          </div>
                          <button
                            onClick={async () => {
                              if (!window.confirm('Delete this review? It will be removed from the public site.')) return;
                              try {
                                await updateTestimonials(testimonials.filter(t => t.id !== review.id));
                                triggerToast('Review removed.');
                              } catch (err) {
                                triggerToast('Failed to remove review.');
                              }
                            }}
                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors rounded-none"
                            title="Delete Review"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <svg key={i} className={`w-4 h-4 ${i < review.rating ? 'text-black fill-current' : 'text-gray-300 fill-current'}`} viewBox="0 0 24 24">
                              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                            </svg>
                          ))}
                        </div>

                        {review.text && (
                          <p className="text-xs text-gray-600 font-sans leading-relaxed italic border-l-2 border-gray-200 pl-3">
                            "{review.text}"
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
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

      {/* Reset Database Security Modal */}
      <AnimatePresence>
        {showResetModal && (
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
              className="bg-white border border-gray-200 shadow-2xl max-w-md w-full p-8 text-center relative"
            >
              <button 
                onClick={() => setShowResetModal(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-900 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="mx-auto w-12 h-12 bg-rose-50 flex items-center justify-center rounded-full mb-4">
                <AlertCircle className="w-6 h-6 text-rose-500" />
              </div>
              
              <h3 className="font-display text-2xl font-bold uppercase text-gray-900 tracking-tight mb-2">Security Verification</h3>
              <p className="text-gray-500 text-xs font-sans mb-6">
                WARNING: This will reset all service details, work subsections, and inquiries to default values. Please verify your credentials to proceed.
              </p>

              <div className="space-y-4 text-left mb-6">
                <div>
                  <label className="block font-mono text-[10px] text-gray-500 uppercase tracking-widest mb-1">Step 1: Admin Password</label>
                  <input
                    type="password"
                    value={resetAdminPass}
                    onChange={(e) => setResetAdminPass(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-300 focus:border-rose-500 text-gray-900 px-4 py-3 rounded-none outline-none transition-colors font-mono text-xs"
                    placeholder="Enter Admin Password"
                  />
                </div>
                <div>
                  <label className="block font-mono text-[10px] text-gray-500 uppercase tracking-widest mb-1">Step 2: Security PIN</label>
                  <input
                    type="password"
                    value={resetSecurityPin}
                    onChange={(e) => setResetSecurityPin(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-300 focus:border-rose-500 text-gray-900 px-4 py-3 rounded-none outline-none transition-colors font-mono text-xs"
                    placeholder="Enter 6-digit PIN"
                    maxLength={6}
                  />
                </div>
                {resetError && (
                  <p className="text-rose-500 font-mono text-[10px] uppercase text-center mt-2">{resetError}</p>
                )}
              </div>

              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => setShowResetModal(false)}
                  className="w-full px-5 py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-mono font-bold uppercase tracking-widest transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={executeDatabaseReset}
                  disabled={!resetAdminPass || !resetSecurityPin}
                  className="w-full px-5 py-3 bg-rose-500 hover:bg-rose-600 text-white text-xs font-mono font-bold uppercase tracking-widest transition-colors cursor-pointer disabled:opacity-50"
                >
                  Confirm Reset
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
