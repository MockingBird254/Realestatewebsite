/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { 
  Sparkles, Search, MapPin, Building2, Heart, 
  Phone, Mail, Calendar, Map, Eye, Plus, 
  CheckCircle2, ChevronRight, ChevronLeft, MessageSquare, ShieldCheck, 
  PlusCircle, Trash2, ArrowRight, DollarSign, Calculator,
  TrendingUp, Users, FileText, Settings, Award, Layers, Clock, Star, Landmark, Smartphone, X,
  Facebook, Instagram, Youtube, Linkedin, ThumbsUp, Share2, Play, Video
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, BarChart, Bar 
} from 'recharts';

import { Property, PropertyRequest, BlogArticle, CompanySettings } from './types';
import { INITIAL_SETTINGS, INITIAL_PROPERTIES, INITIAL_BLOGS } from './data';
import Header from './components/Header';
import InteractiveMap from './components/InteractiveMap';
import RentAdvisorCalculator from './components/RentAdvisorCalculator';
import PropertyRequestModal from './components/PropertyRequestModal';
import AddPropertyModal from './components/AddPropertyModal';

export default function App() {
  // Tabs: 'home', 'properties', 'management', 'buy', 'rent', 'commercial', 'land', 'about', 'blog', 'contact', 'dashboard'
  const [activeTab, setActiveTab] = useState<string>('home');
  
  const getWhatsAppLink = (text: string = "") => {
    const rawNum = settings.whatsapp || "0722710580";
    const digits = rawNum.replace(/\D/g, "");
    let cleanNumber = digits;
    if (digits.startsWith("0")) {
      cleanNumber = "254" + digits.substring(1);
    } else if (digits.startsWith("7")) {
      cleanNumber = "254" + digits;
    } else if (digits.startsWith("254")) {
      cleanNumber = digits;
    }
    return `https://wa.me/${cleanNumber}${text ? `?text=${encodeURIComponent(text)}` : ""}`;
  };
  const [properties, setProperties] = useState<Property[]>(() => {
    try {
      const cached = localStorage.getItem('unique_merchants_properties');
      if (cached) return JSON.parse(cached);
    } catch (e) {}
    return INITIAL_PROPERTIES;
  });
  const [settings, setSettings] = useState<CompanySettings>(() => {
    try {
      const cached = localStorage.getItem('unique_merchants_settings');
      if (cached) {
        const parsed = JSON.parse(cached);
        return { ...INITIAL_SETTINGS, ...parsed };
      }
    } catch (e) {}
    return INITIAL_SETTINGS;
  });
  const [blogs, setBlogs] = useState<BlogArticle[]>(() => {
    try {
      const cached = localStorage.getItem('unique_merchants_blogs');
      if (cached) return JSON.parse(cached);
    } catch (e) {}
    return INITIAL_BLOGS;
  });
  const [requests, setRequests] = useState<PropertyRequest[]>(() => {
    try {
      const cached = localStorage.getItem('unique_merchants_requests');
      if (cached) return JSON.parse(cached);
    } catch (e) {}
    return [];
  });
  const [favorites, setFavorites] = useState<string[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);

  useEffect(() => {
    setActiveImageIndex(0);
  }, [selectedProperty]);

  // Search & Filtering State
  const [searchQuery, setSearchQuery] = useState("");
  const [isAiSearching, setIsAiSearching] = useState(false);
  const [aiFeedback, setAiFeedback] = useState("");
  const [propertyFilters, setPropertyFilters] = useState({
    type: 'all', // all, buy, rent, commercial, land
    county: 'all',
    town: 'all',
    propertyType: 'all', // all, Maisonette, Apartment, Plot, Commercial Space
    minPrice: 0,
    maxPrice: 100000000
  });

  // Modals Toggles
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [isAddPropertyModalOpen, setIsAddPropertyModalOpen] = useState(false);
  
  // Blog Reader View
  const [readingBlog, setReadingBlog] = useState<BlogArticle | null>(null);
  const [blogCommentName, setBlogCommentName] = useState("");
  const [blogCommentText, setBlogCommentText] = useState("");

  // Admin Dashboard States
  const [adminPropertiesTab, setAdminPropertiesTab] = useState<'listings' | 'requests' | 'company' | 'downloads' | 'quicklinks'>('listings');
  const [editPriceId, setEditPriceId] = useState<string | null>(null);
  const [editPriceVal, setEditPriceVal] = useState<number>(0);

  // Pages & Dropdowns Admin UI States
  const [newDropdownTitle, setNewDropdownTitle] = useState("");
  const [newLinkLabels, setNewLinkLabels] = useState<Record<string, string>>({});
  const [newLinkUrls, setNewLinkUrls] = useState<Record<string, string>>({});
  
  const [newPageTitle, setNewPageTitle] = useState("");
  const [newPageSlug, setNewPageSlug] = useState("");
  const [newPageContent, setNewPageContent] = useState("");
  const [editingPageId, setEditingPageId] = useState<string | null>(null);
  const [editingPageTitle, setEditingPageTitle] = useState("");
  const [editingPageSlug, setEditingPageSlug] = useState("");
  const [editingPageContent, setEditingPageContent] = useState("");

  // Admin Session States
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginPasscode, setLoginPasscode] = useState('');
  const [loginError, setLoginError] = useState('');
  const [footerClicks, setFooterClicks] = useState(0);
  const [newSlideUrl, setNewSlideUrl] = useState('');
  const [newVideoTitle, setNewVideoTitle] = useState('');
  const [newVideoDesc, setNewVideoDesc] = useState('');
  const [newVideoDuration, setNewVideoDuration] = useState('');
  const [newVideoThumbnail, setNewVideoThumbnail] = useState('');
  const [newVideoUrl, setNewVideoUrl] = useState('');
  const [isLogoUploading, setIsLogoUploading] = useState(false);
  const [isLogoDragActive, setIsLogoDragActive] = useState(false);
  const [isIconUploading, setIsIconUploading] = useState(false);
  const [isIconDragActive, setIsIconDragActive] = useState(false);
  const [isSlideUploading, setIsSlideUploading] = useState(false);

  // Dark/Light Mode Theme States
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('theme') === 'dark';
  });

  // Contact / Prospectus form States
  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactMessage, setContactMessage] = useState("");
  const [isSendingContact, setIsSendingContact] = useState(false);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName.trim() || !contactPhone.trim() || !contactMessage.trim()) return;
    setIsSendingContact(true);
    try {
      const response = await fetch('/api/properties/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: contactName,
          phone: contactPhone,
          description: contactMessage,
          email: "",
          budget: "Inquiry Desk",
          propertyType: "General Prospectus Inquiry",
          location: "Contact Page"
        })
      });
      if (response.ok) {
        const whatsappMsg = `Hello Unique Merchants, I have submitted a general inquiry via your website's contact desk:\n\n*Name*: ${contactName}\n*Phone*: ${contactPhone}\n*Message*: ${contactMessage}`;
        const waUrl = getWhatsAppLink(whatsappMsg);
        
        setContactName("");
        setContactPhone("");
        setContactMessage("");
        syncPlatformData(); // Refresh requests in admin panel
        
        alert("Thank you! Your prospectus message has been logged in our secure database. Click OK to instantly chat with us on WhatsApp to finalize your inquiry.");
        try {
          window.open(waUrl, '_blank');
        } catch (e) {
          window.location.href = waUrl;
        }
      } else {
        alert("Failed to submit inquiry. Please try again.");
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred while transmitting your message.");
    } finally {
      setIsSendingContact(false);
    }
  };

  // Social Interactive Footer States
  const [fbLiked, setFbLiked] = useState<boolean>(false);
  const [fbLikesCount, setFbLikesCount] = useState<number>(420);
  const [instagramFollowed, setInstagramFollowed] = useState<boolean>(false);
  const [instagramFollowers, setInstagramFollowers] = useState<number>(12840);
  const [fbComments, setFbComments] = useState<{ id: string; author: string; text: string; time: string }[]>([
    { id: '1', author: 'Erick Mwangi', text: 'Confirmed! Just picked up my title deed today at Kenol Plaza. Process was very smooth.', time: '1h ago' },
    { id: '2', author: 'Grace Wambui', text: 'Are there still 1/8 acre plots remaining in Kabati?', time: '30m ago' }
  ]);
  const [newFbCommentText, setNewFbCommentText] = useState<string>('');

  // Team state with default members and local persistence
  const [team, setTeam] = useState<{ id: string; name: string; role: string; photo: string; bio: string; }[]>(() => {
    try {
      const saved = localStorage.getItem('unique_merchants_team');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.some((m: any) => m.name === 'Mercy Wanjiku' || m.name === 'David Kamau' || m.name === 'Samuel Njoroge')) {
          localStorage.removeItem('unique_merchants_team');
        } else {
          return parsed;
        }
      }
    } catch (e) {}
    return [
      {
        id: '1',
        name: 'Daniel Maina',
        role: 'Managing Director & Lead Broker',
        photo: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=300&q=80',
        bio: 'Specialist in Murang\'a County land law, high-end property letting, and secure commercial leasing. Daniel leads the Unique Merchants agency with a decade of local market experience.'
      }
    ];
  });

  const saveTeam = (newTeam: typeof team) => {
    setTeam(newTeam);
    localStorage.setItem('unique_merchants_team', JSON.stringify(newTeam));
  };

  // Dynamic slideshow slides with fallback images
  const dynamicSlides = settings?.heroSlides && settings.heroSlides.length > 0 
    ? settings.heroSlides 
    : [
        { image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=80" },
        { image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1600&q=80" },
        { image: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1600&q=80" }
      ];

  // Hero Slideshow State for Rama Homes premium style
  const [currentHeroSlide, setCurrentHeroSlide] = useState(0);

  // Auto cycle hero slides
  useEffect(() => {
    if (activeTab !== 'home') return;
    const timer = setInterval(() => {
      setCurrentHeroSlide((prev) => (prev + 1) % dynamicSlides.length);
    }, 6500);
    return () => clearInterval(timer);
  }, [activeTab, dynamicSlides.length]);

  // URL hash/query checking for secret login link
  useEffect(() => {
    const handleCheckHash = () => {
      const pathAndHash = window.location.hash + window.location.search;
      if (
        pathAndHash.includes('admin=true') || 
        pathAndHash.includes('login=true') || 
        pathAndHash.includes('#admin') || 
        pathAndHash.includes('#admin-login') ||
        pathAndHash.includes('#login')
      ) {
        setShowLoginModal(true);
      }
    };
    handleCheckHash();
    window.addEventListener('hashchange', handleCheckHash);
    return () => window.removeEventListener('hashchange', handleCheckHash);
  }, []);

  // Dynamic color variable injector loop
  useEffect(() => {
    if (!settings) return;
    let styleTag = document.getElementById('dynamic-theme');
    if (!styleTag) {
      styleTag = document.createElement('style');
      styleTag.id = 'dynamic-theme';
      document.head.appendChild(styleTag);
    }
    
    const primary = settings.primaryColor || '#0B1E5B';
    const secondary = settings.secondaryColor || '#FFF200';
    const burgundy = settings.burgundyColor || '#8C040E';

    styleTag.innerHTML = `
      :root {
        --color-emerald-950: ${primary}dd;
        --color-emerald-900: ${primary};
        --color-emerald-800: ${primary}ee;
        --color-emerald-700: ${primary}cc;
        --color-emerald-600: ${primary}aa;
        --color-emerald-500: ${primary};
        --color-emerald-100: ${primary}20;
        --color-emerald-50: ${primary}05;
        
        --color-gold-600: ${secondary};
        --color-gold-500: ${secondary};
        --color-gold-400: ${secondary}dd;
        --color-gold-300: ${secondary}bb;
        
        --color-burgundy-700: ${burgundy};
      }
    `;
  }, [settings?.primaryColor, settings?.secondaryColor, settings?.burgundyColor, settings]);

  const handleLogout = () => {
    setIsAdminLoggedIn(false);
    localStorage.removeItem('isAdminLoggedIn');
    setActiveTab('home');
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPasscode = loginPasscode.trim();
    const configuredPasscode = (settings?.adminPasscode || '1234').trim();
    
    if (cleanPasscode === configuredPasscode) {
      setIsAdminLoggedIn(true);
      localStorage.setItem('isAdminLoggedIn', 'true');
      setShowLoginModal(false);
      setLoginError('');
      setLoginPasscode('');
      setActiveTab('dashboard');
    } else {
      setLoginError('Invalid administrator passcode. Please try again.');
    }
  };

  // Fetch initial data on mount
  const syncPlatformData = async () => {
    // 1. Instantly load cache from localStorage
    try {
      const cachedProps = localStorage.getItem('unique_merchants_properties');
      const cachedSetts = localStorage.getItem('unique_merchants_settings');
      const cachedBlogsList = localStorage.getItem('unique_merchants_blogs');
      const cachedReqs = localStorage.getItem('unique_merchants_requests');

      if (cachedProps) setProperties(JSON.parse(cachedProps));
      if (cachedSetts) {
        const parsed = JSON.parse(cachedSetts);
        setSettings({ ...INITIAL_SETTINGS, ...parsed });
      }
      if (cachedBlogsList) setBlogs(JSON.parse(cachedBlogsList));
      if (cachedReqs) setRequests(JSON.parse(cachedReqs));
    } catch (err) {
      console.warn("Could not read local cache:", err);
    }

    // 2. Fetch fresh data from backend
    try {
      const [pRes, sRes, bRes, rRes] = await Promise.all([
        fetch('/api/properties'),
        fetch('/api/settings'),
        fetch('/api/blogs'),
        fetch('/api/properties/requests')
      ]);

      if (pRes.ok && sRes.ok && bRes.ok && rRes.ok) {
        const pData = await pRes.json();
        const sData = await sRes.json();
        const bData = await bRes.json();
        const rData = await rRes.json();

        const mergedSettings = sData ? { ...INITIAL_SETTINGS, ...sData } : INITIAL_SETTINGS;

        setProperties(pData);
        setSettings(mergedSettings);
        setBlogs(bData);
        setRequests(rData);

        // Update cache
        localStorage.setItem('unique_merchants_properties', JSON.stringify(pData));
        localStorage.setItem('unique_merchants_settings', JSON.stringify(mergedSettings));
        localStorage.setItem('unique_merchants_blogs', JSON.stringify(bData));
        localStorage.setItem('unique_merchants_requests', JSON.stringify(rData));
      } else {
        throw new Error("One or more backend requests failed");
      }
    } catch (e) {
      console.warn("Operating in local offline fallback cache mode: ", e);
    }
  };

  useEffect(() => {
    syncPlatformData();
  }, []);

  // Dynamically update browser tab title and favicon with 1:1 image or SVG emoji representation
  useEffect(() => {
    if (settings?.name) {
      document.title = settings.name;
    }
    
    if (settings?.icon) {
      const isUrl = settings.icon.startsWith('http') || settings.icon.startsWith('/') || settings.icon.startsWith('data:image');
      const link: HTMLLinkElement | null = document.querySelector("link[rel*='icon']");
      const faviconUrl = isUrl 
        ? settings.icon 
        : `data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>${settings.icon}</text></svg>`;
      
      if (link) {
        link.href = faviconUrl;
      } else {
        const newLink = document.createElement('link');
        newLink.rel = 'icon';
        newLink.href = faviconUrl;
        document.head.appendChild(newLink);
      }
    }
  }, [settings?.icon, settings?.name]);

  // Filter properties in memory based on local states
  const getFilteredProperties = () => {
    return properties.filter(p => {
      // Tab based routing filter
      if (activeTab === 'buy' && p.type !== 'buy') return false;
      if (activeTab === 'rent' && p.type !== 'rent') return false;
      if (activeTab === 'commercial' && p.type !== 'commercial') return false;
      if (activeTab === 'land' && p.type !== 'land') return false;

      // Sidebar property filters
      if (propertyFilters.type !== 'all' && p.type !== propertyFilters.type) return false;
      if (propertyFilters.county !== 'all' && p.county.toLowerCase() !== propertyFilters.county.toLowerCase()) return false;
      if (propertyFilters.town !== 'all' && p.town.toLowerCase() !== propertyFilters.town.toLowerCase()) return false;
      if (propertyFilters.propertyType !== 'all' && p.propertyType.toLowerCase() !== propertyFilters.propertyType.toLowerCase()) return false;
      
      // Price thresholds
      if (p.price < propertyFilters.minPrice || p.price > propertyFilters.maxPrice) return false;

      return true;
    });
  };

  const filteredList = getFilteredProperties();

  // AI-powered Natural Language Search Submission
  const handleAiSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsAiSearching(true);
    setAiFeedback("Consulting Gemini AI to structure filters...");

    try {
      const response = await fetch('/api/ai/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: searchQuery })
      });
      const result = await response.json();

      if (result.success && result.filters) {
        const f = result.filters;
        setPropertyFilters({
          type: f.type || 'all',
          county: f.county || 'all',
          town: f.town || 'all',
          propertyType: f.propertyType || 'all',
          minPrice: f.minPrice || 0,
          maxPrice: f.maxPrice || 100000000
        });

        setAiFeedback(`Gemini matched: ${f.propertyType || 'any property'} in ${f.town || 'all towns'} up to KES ${(f.maxPrice || 100000000).toLocaleString()}`);
        setActiveTab('properties'); // Go directly to directory to view results!
      } else {
        setAiFeedback("Sorry, I could not parse specific coordinates. Showing overall listings.");
      }
    } catch (err) {
      setAiFeedback("Connecting to fallback regex filter module.");
    } finally {
      setIsAiSearching(false);
      setTimeout(() => setAiFeedback(""), 5000);
    }
  };

  // Toggle Bookmark Favorites
  const toggleFavorite = (id: string) => {
    if (favorites.includes(id)) {
      setFavorites(favorites.filter(favId => favId !== id));
    } else {
      setFavorites([...favorites, id]);
    }
  };

  // Delete listing from Admin panel
  const handleDeleteProperty = async (id: string) => {
    // Optimistic / Local sync
    const updatedList = properties.filter(p => p.id !== id);
    setProperties(updatedList);
    localStorage.setItem('unique_merchants_properties', JSON.stringify(updatedList));

    try {
      const response = await fetch(`/api/properties/${id}`, {
        method: 'DELETE'
      });
      await response.json();
    } catch (e) {
      console.warn("Server delete offline, saved locally:", e);
    }
  };

  // Update listing price from Admin panel
  const handleUpdatePrice = async (id: string) => {
    if (editPriceVal <= 0) return;
    const updatedList = properties.map(p => p.id === id ? { ...p, price: editPriceVal } : p);
    setProperties(updatedList);
    localStorage.setItem('unique_merchants_properties', JSON.stringify(updatedList));
    setEditPriceId(null);

    try {
      const response = await fetch(`/api/properties/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ price: editPriceVal })
      });
      await response.json();
    } catch (e) {
      console.warn("Server update offline, saved locally:", e);
    }
  };

  // Submit Blog Comment
  const handleAddBlogComment = async (e: React.FormEvent, blogId: string) => {
    e.preventDefault();
    if (!blogCommentName.trim() || !blogCommentText.trim()) return;

    try {
      const response = await fetch(`/api/blogs/${blogId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ author: blogCommentName, comment: blogCommentText })
      });
      const data = await response.json();
      
      if (data.success) {
        // Sync blog lists
        const updatedBlogs = blogs.map(b => {
          if (b.id === blogId) {
            return {
              ...b,
              comments: [
                ...(b.comments || []),
                { author: blogCommentName, comment: blogCommentText, date: "Just now" }
              ]
            };
          }
          return b;
        });
        setBlogs(updatedBlogs);
        if (readingBlog) {
          setReadingBlog(updatedBlogs.find(b => b.id === blogId) || null);
        }
        setBlogCommentName("");
        setBlogCommentText("");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Upload dynamic company logo to server with automatic base64 fallback and local caching
  const handleLogoUpload = async (file: File) => {
    setIsLogoUploading(true);

    try {
      // 1. Try standard Multipart Form upload first
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.url) {
          setSettings(prev => {
            const next = { ...prev, logo: data.url };
            localStorage.setItem('unique_merchants_settings', JSON.stringify(next));
            fetch('/api/settings', {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(next)
            }).catch(e => console.warn("Failed to sync logo with server:", e));
            return next;
          });
          setIsLogoUploading(false);
          return;
        }
      }
      
      // 2. If response wasn't ok or success is false, fall back to base64
      console.warn('Multipart upload unsuccessful, attempting base64 fallback...');
      const base64Data = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const fallbackResponse = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          base64: base64Data,
          filename: file.name
        })
      });

      const fallbackData = await fallbackResponse.json();
      if (fallbackData.success && fallbackData.url) {
        setSettings(prev => {
          const next = { ...prev, logo: fallbackData.url };
          localStorage.setItem('unique_merchants_settings', JSON.stringify(next));
          fetch('/api/settings', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(next)
          }).catch(e => console.warn("Failed to sync logo with server:", e));
          return next;
        });
      } else {
        alert(fallbackData.error || 'Failed to upload logo.');
      }
    } catch (err) {
      console.error('Logo upload error:', err);
      // Try base64 fallback on error as well
      try {
        const base64Data = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });

        const fallbackResponse = await fetch('/api/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            base64: base64Data,
            filename: file.name
          })
        });

        const fallbackData = await fallbackResponse.json();
        if (fallbackData.success && fallbackData.url) {
          setSettings(prev => {
            const next = { ...prev, logo: fallbackData.url };
            localStorage.setItem('unique_merchants_settings', JSON.stringify(next));
            fetch('/api/settings', {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(next)
            }).catch(e => console.warn("Failed to sync logo with server:", e));
            return next;
          });
        } else {
          alert('Upload failed: ' + (fallbackData.error || 'Unable to store file.'));
        }
      } catch (fallbackErr) {
        console.error('Fallback upload error:', fallbackErr);
        alert('An error occurred while uploading the logo.');
      }
    } finally {
      setIsLogoUploading(false);
    }
  };

  // Upload dynamic brand icon (favicon) with automatic base64 fallback and local caching
  const handleIconUpload = async (file: File) => {
    setIsIconUploading(true);

    try {
      // 1. Try standard Multipart Form upload first
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.url) {
          setSettings(prev => {
            const next = { ...prev, icon: data.url };
            localStorage.setItem('unique_merchants_settings', JSON.stringify(next));
            fetch('/api/settings', {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(next)
            }).catch(e => console.warn("Failed to sync icon with server:", e));
            return next;
          });
          setIsIconUploading(false);
          return;
        }
      }
      
      // 2. If response wasn't ok or success is false, fall back to base64
      console.warn('Multipart icon upload unsuccessful, attempting base64 fallback...');
      const base64Data = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const fallbackResponse = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          base64: base64Data,
          filename: file.name
        })
      });

      const fallbackData = await fallbackResponse.json();
      if (fallbackData.success && fallbackData.url) {
        setSettings(prev => {
          const next = { ...prev, icon: fallbackData.url };
          localStorage.setItem('unique_merchants_settings', JSON.stringify(next));
          fetch('/api/settings', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(next)
          }).catch(e => console.warn("Failed to sync icon with server:", e));
          return next;
        });
      } else {
        alert(fallbackData.error || 'Failed to upload icon.');
      }
    } catch (err) {
      console.error('Icon upload error:', err);
      try {
        const base64Data = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });

        const fallbackResponse = await fetch('/api/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            base64: base64Data,
            filename: file.name
          })
        });

        const fallbackData = await fallbackResponse.json();
        if (fallbackData.success && fallbackData.url) {
          setSettings(prev => {
            const next = { ...prev, icon: fallbackData.url };
            localStorage.setItem('unique_merchants_settings', JSON.stringify(next));
            fetch('/api/settings', {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(next)
            }).catch(e => console.warn("Failed to sync icon with server:", e));
            return next;
          });
        } else {
          alert('Upload failed: ' + (fallbackData.error || 'Unable to store icon file.'));
        }
      } catch (fallbackErr) {
        console.error('Fallback upload error:', fallbackErr);
        alert('An error occurred while uploading the icon.');
      }
    } finally {
      setIsIconUploading(false);
    }
  };

  // Upload a slide image with automatic base64 fallback and local caching
  const handleSlideUpload = async (file: File) => {
    setIsSlideUploading(true);

    try {
      // 1. Try standard Multipart Form upload first
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.url) {
          setSettings(prev => {
            const next = { 
              ...prev, 
              heroSlides: [...(prev.heroSlides || []), { image: data.url }] 
            };
            localStorage.setItem('unique_merchants_settings', JSON.stringify(next));
            fetch('/api/settings', {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(next)
            }).catch(e => console.warn("Failed to sync slides with server:", e));
            return next;
          });
          setIsSlideUploading(false);
          return;
        }
      }
      
      // 2. If response wasn't ok or success is false, fall back to base64
      console.warn('Multipart slide upload unsuccessful, attempting base64 fallback...');
      const base64Data = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const fallbackResponse = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          base64: base64Data,
          filename: file.name
        })
      });

      const fallbackData = await fallbackResponse.json();
      if (fallbackData.success && fallbackData.url) {
        setSettings(prev => {
          const next = { 
            ...prev, 
            heroSlides: [...(prev.heroSlides || []), { image: fallbackData.url }] 
          };
          localStorage.setItem('unique_merchants_settings', JSON.stringify(next));
          fetch('/api/settings', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(next)
          }).catch(e => console.warn("Failed to sync slides with server:", e));
          return next;
        });
      } else {
        alert('Upload failed: ' + (fallbackData.error || 'Unable to store slide file.'));
      }
    } catch (fallbackErr) {
      console.error('Fallback upload error:', fallbackErr);
      alert('An error occurred while uploading the slide.');
    } finally {
      setIsSlideUploading(false);
    }
  };

  const handleSaveSpecificSettings = async (updatedSettings: typeof settings) => {
    setSettings(updatedSettings);
    localStorage.setItem('unique_merchants_settings', JSON.stringify(updatedSettings));
    try {
      await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedSettings)
      });
    } catch (e) {
      console.warn("Offline, saved settings locally:", e);
    }
  };

  // Save modified Company settings to Express
  const handleSaveCompanySettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Always save to localStorage cache instantly
      localStorage.setItem('unique_merchants_settings', JSON.stringify(settings));

      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
      const data = await response.json();
      if (data.success) {
        alert("Company settings synchronized and published live!");
      } else {
        alert("Settings updated locally inside browser cache.");
      }
    } catch (err) {
      console.warn("Server settings sync offline, saved to local cache:", err);
      alert("Settings updated locally inside browser cache.");
    }
  };

  // Pages & Dropdowns Administrator Handlers
  const handleSaveServicesContent = (content: string) => {
    const updated = { ...settings, servicesContent: content };
    handleSaveSpecificSettings(updated);
    alert("Services Page content successfully updated and published live!");
  };

  const handleSaveManagementContent = (content: string) => {
    const updated = { ...settings, propertyManagementContent: content };
    handleSaveSpecificSettings(updated);
    alert("Property Management Breakdown content successfully updated and published live!");
  };

  const handleAddDropdown = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDropdownTitle.trim()) return;
    const newDrop = {
      id: "drop-" + Date.now(),
      title: newDropdownTitle.trim(),
      links: []
    };
    const updated = { ...settings, customDropdowns: [...(settings.customDropdowns || []), newDrop] };
    handleSaveSpecificSettings(updated);
    setNewDropdownTitle("");
    alert(`Dropdown "${newDrop.title}" created successfully!`);
  };

  const handleDeleteDropdown = (id: string) => {
    if (!confirm("Are you sure you want to delete this dropdown menu? This will remove all nested links.")) return;
    const updated = {
      ...settings,
      customDropdowns: (settings.customDropdowns || []).filter(d => d.id !== id)
    };
    handleSaveSpecificSettings(updated);
  };

  const handleAddLinkToDropdown = (dropdownId: string) => {
    const label = newLinkLabels[dropdownId] || "";
    const url = newLinkUrls[dropdownId] || "";
    if (!label.trim() || !url.trim()) {
      alert("Please enter both a link label and destination URL!");
      return;
    }
    const updated = {
      ...settings,
      customDropdowns: (settings.customDropdowns || []).map(d => {
        if (d.id === dropdownId) {
          return {
            ...d,
            links: [...d.links, { label: label.trim(), url: url.trim() }]
          };
        }
        return d;
      })
    };
    handleSaveSpecificSettings(updated);
    setNewLinkLabels({ ...newLinkLabels, [dropdownId]: "" });
    setNewLinkUrls({ ...newLinkUrls, [dropdownId]: "" });
  };

  const handleDeleteLinkFromDropdown = (dropdownId: string, linkIndex: number) => {
    const updated = {
      ...settings,
      customDropdowns: (settings.customDropdowns || []).map(d => {
        if (d.id === dropdownId) {
          return {
            ...d,
            links: d.links.filter((_, idx) => idx !== linkIndex)
          };
        }
        return d;
      })
    };
    handleSaveSpecificSettings(updated);
  };

  const handleAddCustomPage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPageTitle.trim() || !newPageSlug.trim()) {
      alert("Please fill in both the Title and unique URL Slug!");
      return;
    }
    const slug = newPageSlug.trim().toLowerCase().replace(/[^a-z0-9\-]/g, "-");
    const existing = (settings.customPages || []).find(p => p.slug === slug);
    if (existing) {
      alert(`A page with slug "/page/${slug}" already exists! Please use a unique slug.`);
      return;
    }
    const newPage = {
      id: "page-" + Date.now(),
      title: newPageTitle.trim(),
      slug,
      content: newPageContent
    };
    const updated = {
      ...settings,
      customPages: [...(settings.customPages || []), newPage]
    };
    handleSaveSpecificSettings(updated);
    setNewPageTitle("");
    setNewPageSlug("");
    setNewPageContent("");
    alert(`Custom Page "${newPage.title}" created successfully!`);
  };

  const handleUpdateCustomPage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPageId) return;
    const slug = editingPageSlug.trim().toLowerCase().replace(/[^a-z0-9\-]/g, "-");
    const existing = (settings.customPages || []).find(p => p.slug === slug && p.id !== editingPageId);
    if (existing) {
      alert(`A page with slug "/page/${slug}" already exists! Please use a unique slug.`);
      return;
    }
    const updated = {
      ...settings,
      customPages: (settings.customPages || []).map(p => {
        if (p.id === editingPageId) {
          return {
            ...p,
            title: editingPageTitle.trim(),
            slug,
            content: editingPageContent
          };
        }
        return p;
      })
    };
    handleSaveSpecificSettings(updated);
    setEditingPageId(null);
    alert("Custom page successfully updated!");
  };

  const handleDeleteCustomPage = (id: string) => {
    if (!confirm("Are you sure you want to delete this custom page? Any menu links routing here will become broken.")) return;
    const updated = {
      ...settings,
      customPages: (settings.customPages || []).filter(p => p.id !== id)
    };
    handleSaveSpecificSettings(updated);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans relative">
      
      {/* Platform Header */}
      <Header 
        settings={settings} 
        activeTab={activeTab} 
        setActiveTab={(tab) => {
          setActiveTab(tab);
          setReadingBlog(null);
        }} 
        favoritesCount={favorites.length}
        isAdminLoggedIn={isAdminLoggedIn}
        onLogout={handleLogout}
        isDarkMode={isDarkMode}
        onToggleTheme={() => setIsDarkMode(prev => !prev)}
      />

      {/* Hero Slideshow rendered outside main for HOME tab to be full-width & fit perfectly edge to edge just like Rama Homes */}
      {activeTab === 'home' && (
        <section className="relative h-[380px] sm:h-[480px] md:h-[550px] lg:h-[620px] w-full overflow-hidden transition-all duration-300 group">
          {/* Dynamic Slideshow Backgrounds with Fades - Full brightness */}
          {dynamicSlides.map((slide, idx) => (
            <div
              key={idx}
              className={`absolute inset-0 bg-cover bg-center transition-all duration-1000 ease-in-out ${currentHeroSlide === idx ? 'opacity-100 scale-100' : 'opacity-0 scale-105 pointer-events-none'}`}
              style={{ backgroundImage: `url('${slide.image}')` }}
            >
              {/* Elegant dark gradient overlay to ensure text is perfectly legible */}
              <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-transparent to-black/65" />
            </div>
          ))}

          {/* Clean minimalist text overlaid on the hero slider - Rama Homes style */}
          <div className="absolute inset-0 flex flex-col justify-end p-6 sm:p-12 md:p-16 text-white max-w-7xl mx-auto w-full z-10 pointer-events-none pb-24 sm:pb-28">
            <span className="text-[9px] sm:text-[10px] font-display font-black tracking-[0.2em] text-gold-400 uppercase bg-emerald-950/80 backdrop-blur-md px-3.5 py-1.5 rounded-full w-fit mb-3 border border-gold-500/15">
              ✨ Premium Verified Properties
            </span>
            <h1 className="font-display font-black text-2xl sm:text-4xl md:text-5xl text-white tracking-tight uppercase leading-none max-w-3xl drop-shadow-xl">
              FIND YOUR PERFECT TENANCY WITH {(settings?.name || "Unique Merchants").toUpperCase()}
            </h1>
            <p className="text-[10px] sm:text-xs text-gray-200 mt-2 tracking-wide uppercase font-bold drop-shadow-lg">
              WE VET DEEDS, SECURE TENANCIES, AND MANAGE COMMERCIAL PREMISES IN KENOL & NATIONWIDE
            </p>
          </div>

          {/* Minimalist premium glass navigation arrows */}
          <button 
            type="button"
            onClick={() => setCurrentHeroSlide((prev) => (prev - 1 + dynamicSlides.length) % dynamicSlides.length)}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 hover:bg-gold-500 hover:text-emerald-950 text-white flex items-center justify-center backdrop-blur-md border border-white/10 transition-all cursor-pointer opacity-0 group-hover:opacity-100 z-20"
          >
            ←
          </button>
          <button 
            type="button"
            onClick={() => setCurrentHeroSlide((prev) => (prev + 1) % dynamicSlides.length)}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 hover:bg-gold-500 hover:text-emerald-950 text-white flex items-center justify-center backdrop-blur-md border border-white/10 transition-all cursor-pointer opacity-0 group-hover:opacity-100 z-20"
          >
            →
          </button>

          {/* Custom micro slider dot indicators */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-20">
            {dynamicSlides.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setCurrentHeroSlide(idx)}
                className={`h-1.5 rounded-full transition-all cursor-pointer ${currentHeroSlide === idx ? 'w-6 bg-gold-500' : 'w-2 bg-white/40 hover:bg-white'}`}
              />
            ))}
          </div>
        </section>
      )}

      {/* Primary content area */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

        {/* ================= tab: HOME ================= */}
        {activeTab === 'home' && (
          <div className="flex flex-col gap-12">

            {/* SEARCH AND DISCOVERY CONSOLE (Sleek, high-end, layered naturally over the hero slideshow) */}
            <section className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-8 shadow-xl -mt-20 relative z-10 mx-auto w-11/12 max-w-4xl">
              <div className="text-center mb-6">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-900/5 text-emerald-900 text-[10px] font-extrabold tracking-widest uppercase rounded-full mb-3 border border-emerald-900/10">
                  <Sparkles className="w-3.5 h-3.5 fill-gold-500 text-gold-500 animate-pulse" /> UNIQUE MERCHANTS 
                </span>
                <h2 className="font-display font-black text-2xl sm:text-3xl text-emerald-950 leading-tight">
                  High-End Letting & Property Management
                </h2>
                <p className="text-gray-500 text-xs sm:text-sm max-w-xl leading-relaxed mt-2 mx-auto">
                  Premium maisonettes, luxury letting apartments, and verified commercial land leaseholds in Kenol, Murang'a and across Kenya.
                </p>
              </div>

              {/* AI SEARCH PANEL */}
              <form onSubmit={handleAiSearch} className="bg-white p-2 rounded-2xl shadow-md border border-gray-100 flex flex-col sm:flex-row items-center gap-2 max-w-2xl mx-auto relative">
                <div className="relative w-full flex-1">
                  <input 
                    type="text" 
                    placeholder="Ask Unique: 'Find a maisonette to rent in Kenol under 80k KES...'" 
                    className="w-full bg-transparent text-gray-800 text-xs px-3 py-3 pl-9 focus:outline-none placeholder-gray-400"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <Sparkles className="absolute left-3 top-3.5 w-4 h-4 text-gold-500 fill-gold-500" />
                </div>
                <div className="flex w-full sm:w-auto gap-2">
                  <button 
                    type="submit"
                    disabled={isAiSearching}
                    className="w-full sm:w-auto bg-emerald-900 hover:bg-emerald-950 text-white font-bold px-5 py-3 rounded-xl text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md"
                  >
                    {isAiSearching ? 'Gemini parsing...' : 'Search Unique'}
                    <Search className="w-3.5 h-3.5" />
                  </button>
                </div>
              </form>

              {aiFeedback && (
                <div className="mt-3.5 bg-emerald-950/95 border border-gold-500/20 text-gold-400 font-mono text-[10px] px-3 py-1.5 rounded-lg max-w-xl mx-auto text-center animate-pulse">
                  ⚡ {aiFeedback}
                </div>
              )}

              {/* Example Quick Links */}
              <div className="mt-4 flex flex-wrap items-center justify-center gap-2.5 text-xs">
                <span className="font-bold text-[10px] uppercase tracking-wider text-gray-400">Try asking:</span>
                {[
                  "Plots in Kenol",
                  "3 bedroom Maisonette",
                  "Commercial rent under 50K",
                  "Juja gated community"
                ].map((phrase, idx) => (
                  <button 
                    key={idx}
                    type="button"
                    onClick={() => {
                      setSearchQuery(phrase);
                      setPropertyFilters({
                        type: phrase.toLowerCase().includes("rent") ? "rent" : "all",
                        county: "all",
                        town: phrase.toLowerCase().includes("kenol") ? "kenol" : phrase.toLowerCase().includes("juja") ? "juja" : "all",
                        propertyType: phrase.toLowerCase().includes("plot") ? "plot" : phrase.toLowerCase().includes("maisonette") ? "maisonette" : "all",
                        minPrice: 0,
                        maxPrice: phrase.toLowerCase().includes("50k") ? 50000 : 100000000
                      });
                      setAiFeedback(`Matched query: ${phrase}`);
                      setActiveTab('properties');
                    }}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-2.5 py-1 rounded-full text-[10px] transition-all cursor-pointer"
                  >
                    "{phrase}"
                  </button>
                ))}
              </div>

              {/* Stats Metrics bar */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-6 border-t border-gray-100 mt-6 text-center">
                {[
                  { value: "100%", label: "Verified Tenancies" },
                  { value: "4.9★", label: "Tenant Satisfaction" },
                  { value: "KES 95M+", label: "Deposits Handled" },
                  { value: "8am-4:30pm", label: "Saturday Hours" }
                ].map((stat, i) => (
                  <div key={i}>
                    <h4 className="font-display font-extrabold text-base sm:text-lg text-emerald-900">{stat.value}</h4>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{stat.label}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* INTERACTIVE CENTERPIECE MAP */}
            <section className="flex flex-col gap-3 max-w-5xl mx-auto w-full">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                <div>
                  <h2 className="font-display font-extrabold text-xl text-emerald-900 uppercase tracking-tight">Interactive Map Navigator</h2>
                  <p className="text-xs text-gray-500">Pan, filter amenities, draw custom zones, or click property markers around Kenol</p>
                </div>
                {isAdminLoggedIn && (
                  <button
                    onClick={() => setIsAddPropertyModalOpen(true)}
                    className="bg-emerald-900 hover:bg-emerald-950 text-white text-xs font-bold py-2 px-3.5 rounded-xl flex items-center gap-1.5 self-start cursor-pointer shadow border border-gold-500/20"
                  >
                    <PlusCircle className="w-4 h-4 text-gold-400" /> Add Property Draft
                  </button>
                )}
              </div>

              <InteractiveMap 
                properties={properties} 
                onSelectProperty={setSelectedProperty} 
                selectedProperty={selectedProperty}
                filters={propertyFilters}
              />
            </section>

            {/* FEATURED PROPERTIES PREVIEW GRID */}
            <section className="flex flex-col gap-6">
              <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-2">
                <div>
                  <h2 className="font-display font-extrabold text-xl text-emerald-900 uppercase tracking-tight">Featured Listings</h2>
                  <p className="text-xs text-gray-500">Highest-tier properties vetted by our legal and property compliance engines</p>
                </div>
                <button 
                  onClick={() => setActiveTab('properties')}
                  className="text-xs font-bold text-gold-600 hover:text-gold-700 flex items-center gap-1 uppercase tracking-wider"
                >
                  Browse all {properties.length} properties <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {properties.slice(0, 3).map((p) => {
                  const isFav = favorites.includes(p.id);
                  return (
                    <div 
                      key={p.id}
                      className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden group flex flex-col justify-between"
                    >
                      <div className="relative h-48 overflow-hidden bg-gray-100">
                        <img 
                          src={p.images[0]} 
                          alt={p.title}
                          className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
                        />
                        <span className="absolute top-3 left-3 bg-emerald-900 text-white text-[9px] uppercase tracking-wider font-extrabold px-2.5 py-1 rounded-md border border-gold-500/20">
                          {p.propertyType}
                        </span>
                        
                        {p.isAiVerified && (
                          <span className="absolute top-3 right-3 bg-gold-500 text-emerald-950 text-[9px] font-extrabold px-2.5 py-1 rounded-md flex items-center gap-1 shadow-sm">
                            <Sparkles className="w-3 h-3 text-emerald-950 fill-emerald-950 animate-spin" /> AI Verified
                          </span>
                        )}

                        <span className="absolute bottom-3 left-3 bg-emerald-950/80 backdrop-blur-sm text-gold-400 font-display font-extrabold text-xs px-3 py-1 rounded-lg">
                          KES {p.price.toLocaleString()}{p.type === 'rent' ? '/mo' : ''}
                        </span>
                      </div>

                      <div className="p-5 flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-start gap-2 mb-1.5">
                            <h3 className="font-display font-extrabold text-sm text-emerald-950 group-hover:text-gold-600 transition-colors line-clamp-1">
                              {p.title}
                            </h3>
                            <button 
                              onClick={() => toggleFavorite(p.id)}
                              className="p-1.5 bg-gray-50 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-full transition-colors cursor-pointer"
                            >
                              <Heart className={`w-4 h-4 ${isFav ? 'fill-red-500 text-red-500' : ''}`} />
                            </button>
                          </div>

                          <p className="text-[11px] text-gray-500 flex items-center gap-1 mb-3">
                            <MapPin className="w-3.5 h-3.5 text-gold-500 shrink-0" /> {p.estate}, {p.town}, {p.county}
                          </p>

                          <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed mb-4">
                            {p.description}
                          </p>
                        </div>

                        <div>
                          {/* Specs block */}
                          <div className="grid grid-cols-3 gap-2 py-2 border-t border-b border-gray-100 mb-4 text-[10px] font-bold text-gray-500 text-center uppercase tracking-wider">
                            <div>
                              <span className="block text-emerald-900">📏 Size</span>
                              <span className="font-semibold text-[10px] text-gray-700">{p.size}</span>
                            </div>
                            <div>
                              <span className="block text-emerald-900">🛏️ Rooms</span>
                              <span className="font-semibold text-[10px] text-gray-700">{p.bedrooms > 0 ? `${p.bedrooms} Bed` : 'N/A'}</span>
                            </div>
                            <div>
                              <span className="block text-emerald-900">🛁 Baths</span>
                              <span className="font-semibold text-[10px] text-gray-700">{p.bathrooms > 0 ? `${p.bathrooms} Bath` : 'N/A'}</span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between gap-3">
                            <button
                              onClick={() => setSelectedProperty(p)}
                              className="flex-1 bg-emerald-900 hover:bg-emerald-950 text-white text-[11px] font-bold py-2 px-3 rounded-lg text-center uppercase tracking-wider transition-colors cursor-pointer"
                            >
                              Inspect Specs
                            </button>
                            <a 
                              href={getWhatsAppLink(`Hello! I'm inquiring about the property: ${p.title}`)}
                              target="_blank"
                              referrerPolicy="no-referrer"
                              className="p-2 bg-emerald-900/5 hover:bg-emerald-900/10 text-emerald-900 border border-emerald-900/10 rounded-lg"
                              title="Message agent on WhatsApp"
                            >
                              <MessageSquare className="w-4 h-4" />
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Testimonials removed per user request */}

          </div>
        )}

        {/* ================= tab: PROPERTIES (DIRECTORY) ================= */}
        {activeTab === 'properties' && (
          <div className="flex flex-col gap-6">
            
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <h2 className="font-display font-extrabold text-xl text-emerald-900 uppercase tracking-tight">Vetted Listings Directory</h2>
              <p className="text-xs text-gray-500 mt-0.5">Filter by pricing limits, preferred county sectors, and property specifications</p>

              {/* Filtering board */}
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mt-6">
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Buy/Rent Mode</label>
                  <select 
                    className="w-full bg-gray-50 border border-gray-200 px-2 py-2 rounded-xl text-xs text-gray-700"
                    value={propertyFilters.type}
                    onChange={(e) => setPropertyFilters({ ...propertyFilters, type: e.target.value })}
                  >
                    <option value="all">Any Category</option>
                    <option value="buy">For Sale</option>
                    <option value="rent">To Rent</option>
                    <option value="land">Land Plot</option>
                    <option value="commercial">Commercial</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">County Selection</label>
                  <select 
                    className="w-full bg-gray-50 border border-gray-200 px-2 py-2 rounded-xl text-xs text-gray-700"
                    value={propertyFilters.county}
                    onChange={(e) => setPropertyFilters({ ...propertyFilters, county: e.target.value })}
                  >
                    <option value="all">Any County</option>
                    <option value="murang'a">Murang'a County</option>
                    <option value="kiambu">Kiambu County</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Town Selection</label>
                  <select 
                    className="w-full bg-gray-50 border border-gray-200 px-2 py-2 rounded-xl text-xs text-gray-700"
                    value={propertyFilters.town}
                    onChange={(e) => setPropertyFilters({ ...propertyFilters, town: e.target.value })}
                  >
                    <option value="all">Any Town</option>
                    <option value="kenol">Kenol</option>
                    <option value="thika">Thika</option>
                    <option value="juja">Juja</option>
                    <option value="makuyu">Makuyu</option>
                    <option value="murang'a town">Murang'a Town</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Property Type</label>
                  <select 
                    className="w-full bg-gray-50 border border-gray-200 px-2 py-2 rounded-xl text-xs text-gray-700"
                    value={propertyFilters.propertyType}
                    onChange={(e) => setPropertyFilters({ ...propertyFilters, propertyType: e.target.value })}
                  >
                    <option value="all">Any Type</option>
                    <option value="maisonette">Maisonette</option>
                    <option value="apartment">Apartment</option>
                    <option value="plot">Land Plot</option>
                    <option value="commercial space">Office / Commercial</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Max Price (KES)</label>
                  <select 
                    className="w-full bg-gray-50 border border-gray-200 px-2 py-2 rounded-xl text-xs text-gray-700"
                    value={propertyFilters.maxPrice}
                    onChange={(e) => setPropertyFilters({ ...propertyFilters, maxPrice: parseInt(e.target.value) || 100000000 })}
                  >
                    <option value="100000000">No Limit</option>
                    <option value="1500000">Under KES 1.5 Million</option>
                    <option value="5000000">Under KES 5 Million</option>
                    <option value="15000000">Under KES 15 Million</option>
                    <option value="30000000">Under KES 30 Million</option>
                  </select>
                </div>

                <div className="flex items-end">
                  <button
                    onClick={() => {
                      setPropertyFilters({
                        type: 'all',
                        county: 'all',
                        town: 'all',
                        propertyType: 'all',
                        minPrice: 0,
                        maxPrice: 100000000
                      });
                      setSearchQuery("");
                    }}
                    className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs py-2 px-3 rounded-xl font-bold uppercase transition-colors"
                  >
                    Reset filters
                  </button>
                </div>
              </div>
            </div>

            {/* List vs Results Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredList.map((p) => {
                const isFav = favorites.includes(p.id);
                return (
                  <div 
                    key={p.id}
                    className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col justify-between"
                  >
                    <div className="relative h-48 bg-gray-100">
                      <img src={p.images[0]} alt={p.title} className="w-full h-full object-cover" />
                      <span className="absolute top-3 left-3 bg-emerald-900 text-white text-[9px] uppercase tracking-wider font-extrabold px-2.5 py-1 rounded-md border border-gold-500/20">
                        {p.propertyType}
                      </span>
                      {p.isAiVerified && (
                        <span className="absolute top-3 right-3 bg-gold-500 text-emerald-950 text-[9px] font-extrabold px-2.5 py-1 rounded-md flex items-center gap-1 shadow">
                          <Sparkles className="w-3 h-3 text-emerald-950 fill-emerald-950 animate-spin" /> AI Verified
                        </span>
                      )}
                      <span className="absolute bottom-3 left-3 bg-emerald-950/80 backdrop-blur-sm text-gold-400 font-display font-extrabold text-xs px-3 py-1 rounded-lg">
                        KES {p.price.toLocaleString()}{p.type === 'rent' ? '/mo' : ''}
                      </span>
                    </div>

                    <div className="p-5 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start gap-2 mb-1.5">
                          <h3 className="font-display font-extrabold text-sm text-emerald-950 line-clamp-1">{p.title}</h3>
                          <button 
                            onClick={() => toggleFavorite(p.id)}
                            className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                          >
                            <Heart className={`w-4 h-4 ${isFav ? 'fill-red-500 text-red-500' : ''}`} />
                          </button>
                        </div>

                        <p className="text-[11px] text-gray-500 flex items-center gap-1 mb-3">
                          <MapPin className="w-3.5 h-3.5 text-gold-500 shrink-0" /> {p.estate}, {p.town}
                        </p>

                        <p className="text-xs text-gray-600 line-clamp-3 leading-relaxed mb-4">
                          {p.description}
                        </p>
                      </div>

                      <div>
                        <div className="grid grid-cols-3 gap-2 py-2 border-t border-b border-gray-100 mb-4 text-[9px] font-extrabold text-gray-500 uppercase text-center tracking-wider">
                          <div>
                            <span className="block text-emerald-900">📏 Size</span>
                            <span>{p.size}</span>
                          </div>
                          <div>
                            <span className="block text-emerald-900">🛏️ Rooms</span>
                            <span>{p.bedrooms > 0 ? `${p.bedrooms} Bed` : 'N/A'}</span>
                          </div>
                          <div>
                            <span className="block text-emerald-900">🛁 Baths</span>
                            <span>{p.bathrooms > 0 ? `${p.bathrooms} Bath` : 'N/A'}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2.5">
                          <button
                            onClick={() => setSelectedProperty(p)}
                            className="flex-1 bg-emerald-900 hover:bg-emerald-950 text-white text-[11px] font-bold py-2 rounded-lg text-center uppercase tracking-wider cursor-pointer"
                          >
                            Inspect Specs
                          </button>
                          <a 
                            href={getWhatsAppLink(`Inquiring about ${p.title}`)}
                            target="_blank"
                            referrerPolicy="no-referrer"
                            className="p-2 bg-emerald-900/5 hover:bg-emerald-900/10 text-emerald-900 border border-emerald-900/10 rounded-lg shrink-0"
                          >
                            <MessageSquare className="w-4 h-4" />
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              {filteredList.length === 0 && (
                <div className="col-span-full py-16 text-center bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center justify-center gap-3">
                  <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center text-gray-400">
                    <Building2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-display font-extrabold text-emerald-950 text-xs uppercase tracking-wider">No Properties Found</h4>
                    <p className="text-xs text-gray-500 mt-1 max-w-xs mx-auto">
                      No verified properties currently match your selected filters. Reset filters or submit a request directly to our agency sourcing team.
                    </p>
                  </div>
                  <button
                    onClick={() => setIsRequestModalOpen(true)}
                    className="bg-gold-500 hover:bg-gold-600 text-emerald-950 text-xs font-bold py-2 px-4 rounded-xl uppercase tracking-wider mt-2 cursor-pointer shadow"
                  >
                    Submit Custom Sourcing Request
                  </button>
                </div>
              )}
            </div>

          </div>
        )}

        {/* ================= tab: SERVICES ================= */}
        {activeTab === 'services' && (
          <div className="flex flex-col gap-10">
            <section className="bg-emerald-900 text-white rounded-3xl p-8 md:p-14 relative overflow-hidden shadow-xl">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,rgba(200,163,77,0.1),transparent_35%)]" />
              <div className="max-w-2xl relative z-10">
                <span className="text-[10px] bg-gold-500/10 text-gold-400 border border-gold-500/20 font-bold px-3 py-1 rounded-full uppercase tracking-widest">
                  Our Expertise
                </span>
                <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-white mt-3 uppercase tracking-tight">Our Premium Real Estate Services</h2>
                <p className="text-xs text-gray-300 mt-2 leading-relaxed">
                  Unique Merchants delivers premium residential management, secure land purchases, and tailored real estate services across Murang'a County and neighboring regions.
                </p>
                <button
                  onClick={() => setIsRequestModalOpen(true)}
                  className="bg-gold-500 hover:bg-gold-600 text-emerald-950 text-xs font-bold py-3 px-6 rounded-xl uppercase tracking-wider mt-6 cursor-pointer shadow"
                >
                  Request Call Back
                </button>
              </div>
            </section>

            {/* Editable Content */}
            <div className="bg-white rounded-3xl border border-gray-100 p-8 sm:p-12 shadow-sm">
              {isAdminLoggedIn && (
                <div className="mb-6 bg-amber-50 border border-amber-200 rounded-xl p-3 flex justify-between items-center text-xs text-amber-900">
                  <span>💡 <strong>Admin Live Editor:</strong> You can edit this text live inside the admin dashboard.</span>
                  <button
                    onClick={() => {
                      setActiveTab('dashboard');
                      setAdminPropertiesTab('quicklinks');
                    }}
                    className="bg-amber-600 hover:bg-amber-700 text-white font-bold py-1 px-3 rounded text-[10px] uppercase cursor-pointer"
                  >
                    Edit Content
                  </button>
                </div>
              )}
              
              <div className="prose max-w-none text-gray-600 text-sm whitespace-pre-line leading-relaxed space-y-4">
                {(settings.servicesContent || "").split('\n\n').map((paragraph, idx) => {
                  if (paragraph.startsWith('###')) {
                    return <h3 key={idx} className="font-display font-extrabold text-emerald-950 text-base uppercase tracking-wider mt-6 first:mt-0">{paragraph.replace('###', '').trim()}</h3>;
                  }
                  if (paragraph.startsWith('##')) {
                    return <h2 key={idx} className="font-display font-extrabold text-emerald-950 text-lg uppercase tracking-wider mt-8 first:mt-0">{paragraph.replace('##', '').trim()}</h2>;
                  }
                  return <p key={idx} className="text-gray-600 leading-relaxed">{paragraph}</p>;
                })}
              </div>
            </div>
          </div>
        )}

        {/* ================= tab: PROPERTY MANAGEMENT ================= */}
        {activeTab === 'management' && (
          <div className="flex flex-col gap-10">
            
            <section className="bg-emerald-900 text-white rounded-3xl p-8 md:p-14 relative overflow-hidden shadow-xl">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,rgba(200,163,77,0.1),transparent_35%)]" />
              <div className="max-w-2xl relative z-10">
                <span className="text-[10px] bg-gold-500/10 text-gold-400 border border-gold-500/20 font-bold px-3 py-1 rounded-full uppercase tracking-widest">
                  Enterprise Real Estate
                </span>
                <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-white mt-3 uppercase tracking-tight">Digital Property Management Services</h2>
                <p className="text-xs text-gray-300 mt-2 leading-relaxed">
                  We leverage advanced, digitized portals and secure compliance engines to run hassle-free management routines for land developers, commercial premises, and residential estates.
                </p>
                <button
                  onClick={() => setIsRequestModalOpen(true)}
                  className="bg-gold-500 hover:bg-gold-600 text-emerald-950 text-xs font-bold py-3 px-6 rounded-xl uppercase tracking-wider mt-6 cursor-pointer shadow"
                >
                  Request Management Consultation
                </button>
              </div>
            </section>

            {/* Editable Content */}
            <div className="bg-white rounded-3xl border border-gray-100 p-8 sm:p-12 shadow-sm">
              {isAdminLoggedIn && (
                <div className="mb-6 bg-amber-50 border border-amber-200 rounded-xl p-3 flex justify-between items-center text-xs text-amber-900">
                  <span>💡 <strong>Admin Live Editor:</strong> You can edit this text live inside the admin dashboard.</span>
                  <button
                    onClick={() => {
                      setActiveTab('dashboard');
                      setAdminPropertiesTab('quicklinks');
                    }}
                    className="bg-amber-600 hover:bg-amber-700 text-white font-bold py-1 px-3 rounded text-[10px] uppercase cursor-pointer"
                  >
                    Edit Content
                  </button>
                </div>
              )}
              
              <div className="prose max-w-none text-gray-600 text-sm whitespace-pre-line leading-relaxed space-y-4">
                {(settings.propertyManagementContent || "").split('\n\n').map((paragraph, idx) => {
                  if (paragraph.startsWith('###')) {
                    return <h3 key={idx} className="font-display font-bold text-emerald-950 text-xs uppercase tracking-wider mt-6 first:mt-0">{paragraph.replace('###', '').trim()}</h3>;
                  }
                  if (paragraph.startsWith('##')) {
                    return <h2 key={idx} className="font-display font-extrabold text-emerald-950 text-base uppercase tracking-wider mt-8 first:mt-0">{paragraph.replace('##', '').trim()}</h2>;
                  }
                  if (paragraph.startsWith('#')) {
                    return <h2 key={idx} className="font-display font-extrabold text-emerald-900 text-lg uppercase tracking-wider mt-8 first:mt-0">{paragraph.replace('#', '').trim()}</h2>;
                  }
                  return <p key={idx} className="text-gray-600 leading-relaxed">{paragraph}</p>;
                })}
              </div>
            </div>

          </div>
        )}

        {/* ================= tab: CUSTOM RICH PAGE VIEWER ================= */}
        {activeTab.startsWith('page-') && (() => {
          const slug = activeTab.replace('page-', '');
          const customPage = (settings.customPages || []).find(p => p.slug === slug);
          if (!customPage) {
            return (
              <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm">
                <p className="text-gray-400 text-sm">Requested page could not be located on the server.</p>
                <button onClick={() => setActiveTab('home')} className="mt-4 bg-emerald-900 text-white font-bold px-5 py-2 rounded-xl text-xs uppercase tracking-wide cursor-pointer">
                  Back to Home
                </button>
              </div>
            );
          }

          return (
            <div className="flex flex-col gap-10 animate-in fade-in duration-200">
              <section className="bg-gradient-to-r from-emerald-900 via-slate-900 to-emerald-950 text-white rounded-3xl p-8 md:p-14 relative overflow-hidden shadow-xl">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,rgba(200,163,77,0.1),transparent_35%)]" />
                <div className="max-w-2xl relative z-10">
                  <span className="text-[10px] bg-gold-500/10 text-gold-400 border border-gold-500/20 font-bold px-3 py-1 rounded-full uppercase tracking-widest">
                    Verified Guide
                  </span>
                  <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-white mt-3 uppercase tracking-tight">{customPage.title}</h2>
                  <p className="text-xs text-gray-300 mt-2 leading-relaxed">
                    Provided directly by Unique Merchants as an informative service for our clients and property owners in Murang'a County.
                  </p>
                </div>
              </section>

              {/* Editable Content */}
              <div className="bg-white rounded-3xl border border-gray-100 p-8 sm:p-12 shadow-sm">
                {isAdminLoggedIn && (
                  <div className="mb-6 bg-amber-50 border border-amber-200 rounded-xl p-3 flex justify-between items-center text-xs text-amber-900">
                    <span>💡 <strong>Admin Live Editor:</strong> You can edit this custom page live inside the admin dashboard.</span>
                    <button
                      onClick={() => {
                        setActiveTab('dashboard');
                        setAdminPropertiesTab('quicklinks');
                        setEditingPageId(customPage.id);
                        setEditingPageTitle(customPage.title);
                        setEditingPageSlug(customPage.slug);
                        setEditingPageContent(customPage.content);
                      }}
                      className="bg-amber-600 hover:bg-amber-700 text-white font-bold py-1 px-3 rounded text-[10px] uppercase cursor-pointer"
                    >
                      Edit Custom Page
                    </button>
                  </div>
                )}
                
                <div className="prose max-w-none text-gray-600 text-sm whitespace-pre-line leading-relaxed space-y-4">
                  {(customPage.content || "").split('\n\n').map((paragraph, idx) => {
                    if (paragraph.startsWith('####')) {
                      return <h4 key={idx} className="font-display font-bold text-emerald-950 text-xs uppercase tracking-wider mt-4 first:mt-0">{paragraph.replace('####', '').trim()}</h4>;
                    }
                    if (paragraph.startsWith('###')) {
                      return <h3 key={idx} className="font-display font-extrabold text-emerald-950 text-sm uppercase tracking-wider mt-6 first:mt-0">{paragraph.replace('###', '').trim()}</h3>;
                    }
                    if (paragraph.startsWith('##')) {
                      return <h2 key={idx} className="font-display font-extrabold text-emerald-900 text-base uppercase tracking-wider mt-8 first:mt-0">{paragraph.replace('##', '').trim()}</h2>;
                    }
                    return <p key={idx} className="text-gray-600 leading-relaxed">{paragraph}</p>;
                  })}
                </div>
              </div>
            </div>
          );
        })()}

        {/* ================= tab: ABOUT ================= */}
        {activeTab === 'about' && (
          <div className="flex flex-col gap-14">
            
            {/* What we do */}
            <section id="about-what-we-do" className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center scroll-mt-24">
              <div>
                <span className="text-[10px] bg-emerald-900/5 text-emerald-900 font-extrabold px-3 py-1 rounded-full uppercase tracking-widest">
                  Our Corporate Identity
                </span>
                <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-emerald-900 mt-3 uppercase tracking-tight">The Story & What We Do</h2>
                <p className="text-xs text-gray-600 leading-relaxed mt-4">
                  Based in Kenol, Murang'a County, <strong>Unique Merchants</strong> was established to bridge the transparency gap in the Kenyan land and real estate sector. Historically, diaspora and regional buyers faced severe hurdles with duplicate property claims, zoning limitations, and lengthy title conveyancing routines.
                </p>
                <p className="text-xs text-gray-600 leading-relaxed mt-3">
                  We solve this by utilizing state-of-the-art AI verification protocols, thorough local zoning analysis, and direct county land registry synchronizations. Every single property on our platform is 100% compliant, zoned correctly, and has a verified ready individual title deed. We offer a high-contrast experience for commercial lets, residential homes, and land plots.
                </p>
              </div>

              <div className="rounded-3xl overflow-hidden shadow-xl border border-gray-100 h-[380px] relative">
                <img 
                  src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=800&q=80" 
                  alt="Modern office meeting" 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-emerald-900/10" />
              </div>
            </section>

            {/* Mission & Vision */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div id="about-mission" className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm scroll-mt-24 flex flex-col justify-between">
                <div>
                  <span className="text-gold-500 font-display font-black text-3xl">01</span>
                  <h3 className="font-display font-extrabold text-base text-emerald-950 uppercase mt-2">Company Mission</h3>
                  <p className="text-xs text-gray-500 mt-4 leading-relaxed">{settings.mission}</p>
                </div>
                <div className="border-t border-gray-100 pt-4 mt-6 flex justify-between items-center">
                  <span className="text-[10px] font-bold text-emerald-900 uppercase tracking-widest">Guiding Direction</span>
                  <span className="w-2 h-2 bg-emerald-900 rounded-full"></span>
                </div>
              </div>

              <div id="about-vision" className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm scroll-mt-24 flex flex-col justify-between">
                <div>
                  <span className="text-gold-500 font-display font-black text-3xl">02</span>
                  <h3 className="font-display font-extrabold text-base text-emerald-950 uppercase mt-2">Company Vision</h3>
                  <p className="text-xs text-gray-500 mt-4 leading-relaxed">{settings.vision}</p>
                </div>
                <div className="border-t border-gray-100 pt-4 mt-6 flex justify-between items-center">
                  <span className="text-[10px] font-bold text-emerald-900 uppercase tracking-widest">Future Outlook</span>
                  <span className="w-2 h-2 bg-emerald-900 rounded-full"></span>
                </div>
              </div>
            </section>

            {/* Core values */}
            <section id="about-core-values" className="bg-emerald-900 text-white rounded-3xl p-8 md:p-12 text-center scroll-mt-24">
              <h3 className="font-display font-extrabold text-lg uppercase tracking-wider text-gold-500 mb-6">Our Core Professional Pillars</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {settings.coreValues.map((val, i) => (
                  <div key={i} className="bg-emerald-950/40 p-5 rounded-xl border border-emerald-800 flex flex-col justify-between items-center">
                    <CheckCircle2 className="w-6 h-6 text-gold-500 mb-3" />
                    <h4 className="font-display font-extrabold text-xs text-white uppercase tracking-wider leading-snug">{val}</h4>
                  </div>
                ))}
              </div>
            </section>

            {/* Team Section */}
            <section id="about-team" className="scroll-mt-24">
              <div className="text-center max-w-2xl mx-auto mb-10">
                <span className="text-[10px] bg-emerald-900/5 text-emerald-900 font-extrabold px-3 py-1 rounded-full uppercase tracking-widest">
                  Leadership Desk
                </span>
                <h2 className="font-display font-extrabold text-2xl text-emerald-900 mt-3 uppercase tracking-tight">Our Executive Vetting & Sales Brokers</h2>
                <p className="text-xs text-gray-500 mt-1.5">Experienced Conveyancers & real estate professionals on the ground in Murang'a County</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {team.map((member) => (
                  <div key={member.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow p-5 flex flex-col items-center text-center">
                    <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-gold-500 p-0.5 shadow bg-gray-100 mb-4">
                      <img src={member.photo} alt={member.name} className="w-full h-full object-cover rounded-full" />
                    </div>
                    <h3 className="font-display font-bold text-sm text-emerald-950 uppercase">{member.name}</h3>
                    <span className="text-[10px] bg-emerald-900/5 text-emerald-900 font-bold px-2 py-0.5 rounded-full mt-1.5 uppercase tracking-wide">
                      {member.role}
                    </span>
                    <p className="text-xs text-gray-500 mt-3 leading-relaxed">
                      {member.bio}
                    </p>
                  </div>
                ))}
              </div>
            </section>

          </div>
        )}

        {/* ================= tab: BLOG ================= */}
        {activeTab === 'blog' && (
          <div className="flex flex-col gap-6">
            
            {readingBlog ? (
              // Single Article Reading view
              <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden max-w-4xl mx-auto">
                <div className="relative h-72">
                  <img src={readingBlog.image} alt={readingBlog.title} className="w-full h-full object-cover" />
                  <button 
                    onClick={() => setReadingBlog(null)}
                    className="absolute top-4 left-4 bg-emerald-900 text-white text-xs px-3 py-1.5 rounded-lg font-bold"
                  >
                    ← Back to Articles
                  </button>
                </div>

                <div className="p-6 md:p-10">
                  <div className="flex gap-2 text-[10px] text-gray-400 uppercase tracking-widest font-bold mb-2">
                    <span>{readingBlog.category}</span>
                    <span>•</span>
                    <span>{readingBlog.date}</span>
                  </div>

                  <h1 className="font-display font-extrabold text-xl sm:text-2xl text-emerald-950 leading-tight mb-6">
                    {readingBlog.title}
                  </h1>

                  <div className="text-xs text-gray-700 leading-relaxed whitespace-pre-line border-b border-gray-100 pb-8 mb-8">
                    {readingBlog.content}
                  </div>

                  {/* Comments Section */}
                  <div>
                    <h3 className="font-display font-bold text-xs uppercase tracking-wider text-emerald-950 mb-4 flex items-center gap-1">
                      <MessageSquare className="w-4 h-4 text-gold-500" /> Member Comments ({(readingBlog.comments || []).length})
                    </h3>

                    <div className="flex flex-col gap-4 mb-6">
                      {(readingBlog.comments || []).map((cmt, idx) => (
                        <div key={idx} className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-xs font-bold text-emerald-950">{cmt.author}</span>
                            <span className="text-[10px] text-gray-400">{cmt.date}</span>
                          </div>
                          <p className="text-xs text-gray-600 leading-relaxed">"{cmt.comment}"</p>
                        </div>
                      ))}
                    </div>

                    {/* Add Comment form */}
                    <form onSubmit={(e) => handleAddBlogComment(e, readingBlog.id)} className="bg-gray-50 p-5 rounded-2xl border border-gray-100 flex flex-col gap-3">
                      <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Leave a Comment</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <input 
                          type="text" 
                          required
                          placeholder="Your name" 
                          className="bg-white border border-gray-200 px-3 py-2 rounded-xl text-xs"
                          value={blogCommentName}
                          onChange={(e) => setBlogCommentName(e.target.value)}
                        />
                      </div>
                      <textarea 
                        required
                        rows={3}
                        placeholder="Type comment..." 
                        className="bg-white border border-gray-200 px-3 py-2 rounded-xl text-xs resize-none"
                        value={blogCommentText}
                        onChange={(e) => setBlogCommentText(e.target.value)}
                      />
                      <button
                        type="submit"
                        className="bg-emerald-900 hover:bg-emerald-950 text-white font-bold py-2 px-4 rounded-xl text-xs uppercase tracking-wider self-start"
                      >
                        Publish Comment
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            ) : (
              // Blogs list directory
              <div className="flex flex-col gap-6">
                <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                  <h2 className="font-display font-extrabold text-xl text-emerald-900 uppercase tracking-tight">County Education & Blog CMS</h2>
                  <p className="text-xs text-gray-500 mt-0.5">Learn about title searches, land laws, soil matching, and commercial space yields in Kenya</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {blogs.map((b) => (
                    <div key={b.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col justify-between">
                      <div className="h-44 bg-gray-100">
                        <img src={b.image} alt={b.title} className="w-full h-full object-cover" />
                      </div>
                      <div className="p-5 flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex gap-2 text-[9px] text-gray-400 uppercase tracking-wider font-bold mb-2">
                            <span>{b.category}</span>
                            <span>•</span>
                            <span>{b.date}</span>
                          </div>
                          <h3 className="font-display font-bold text-xs sm:text-sm text-emerald-950 mb-2 line-clamp-1">
                            {b.title}
                          </h3>
                          <p className="text-xs text-gray-500 line-clamp-3 leading-relaxed mb-4">
                            {b.content}
                          </p>
                        </div>

                        <button 
                          onClick={() => setReadingBlog(b)}
                          className="w-full py-2 bg-emerald-900/5 hover:bg-emerald-900/10 text-emerald-900 border border-emerald-900/10 text-xs font-bold rounded-lg text-center uppercase tracking-wider transition-colors"
                        >
                          Read Article ({(b.comments || []).length} Comments)
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        )}

        {/* ================= tab: CONTACT ================= */}
        {activeTab === 'contact' && (
          <div className="flex flex-col gap-8">
            
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <h2 className="font-display font-extrabold text-xl text-emerald-900 uppercase tracking-tight">Contact Murang'a Agent Desks</h2>
              <p className="text-xs text-gray-500 mt-0.5">Drop a line, visit our headquarters, or consult our conveyancing attorneys</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Form card */}
              <div className="lg:col-span-7 bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                <h3 className="font-display font-bold text-xs uppercase tracking-wider text-emerald-950 mb-4">Send a secure inquiry</h3>
                
                <form onSubmit={handleContactSubmit} className="flex flex-col gap-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 block">Your Name</label>
                      <input 
                        type="text" 
                        required 
                        placeholder="e.g., John Mwangi" 
                        className="w-full bg-gray-50 border border-gray-200 px-3 py-2 rounded-xl text-xs" 
                        value={contactName}
                        onChange={(e) => setContactName(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 block">Phone Number</label>
                      <input 
                        type="tel" 
                        required 
                        placeholder="e.g., +254 712..." 
                        className="w-full bg-gray-50 border border-gray-200 px-3 py-2 rounded-xl text-xs" 
                        value={contactPhone}
                        onChange={(e) => setContactPhone(e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 block">Message</label>
                    <textarea 
                      required 
                      rows={4} 
                      placeholder="Type your message..." 
                      className="w-full bg-gray-50 border border-gray-200 px-3 py-2 rounded-xl text-xs resize-none" 
                      value={contactMessage}
                      onChange={(e) => setContactMessage(e.target.value)}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSendingContact}
                    className="w-full bg-emerald-900 hover:bg-emerald-950 text-white font-bold py-3 rounded-xl text-xs uppercase tracking-wider disabled:opacity-50 cursor-pointer"
                  >
                    {isSendingContact ? "Transmitting..." : "Transmit Message"}
                  </button>
                </form>
              </div>

              {/* Contact info cards */}
              <div className="lg:col-span-5 flex flex-col gap-4">
                <div className="bg-emerald-900 text-white p-6 rounded-2xl border border-emerald-950 shadow-md">
                  <h3 className="font-display font-extrabold text-sm uppercase tracking-wider text-gold-500 mb-4">Head Office Info</h3>
                  <div className="flex flex-col gap-3.5 text-xs">
                    <p className="flex items-start gap-2 text-gray-300">
                      <MapPin className="w-4 h-4 text-gold-500 shrink-0" /> {settings.address}
                    </p>
                    <p className="flex items-center gap-2 text-gray-300">
                      <Phone className="w-4 h-4 text-gold-500" /> {settings.mobile}
                    </p>
                    <p className="flex items-center gap-2 text-gray-300">
                      <Mail className="w-4 h-4 text-gold-500" /> {settings.email}
                    </p>
                    <p className="flex items-center gap-2 text-gray-300">
                      <Clock className="w-4 h-4 text-gold-500" /> {settings.officeHours}
                    </p>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                  <h4 className="font-display font-bold text-xs uppercase text-emerald-950 mb-2">Daily Working Days Caravans</h4>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    We host daily physical viewing trips departing from Kenol Town Center directly to our Properties. Contact Office desk to book a seat.
                  </p>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* ================= tab: ADMIN DASHBOARD ================= */}
        {activeTab === 'dashboard' && (
          <div className="flex flex-col gap-6">
            
            {/* Top Stat widgets */}
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { title: "Total active properties", val: properties.length, icon: Building2, color: 'text-blue-500 bg-blue-50' },
                { title: "Sourced Requests", val: requests.length, icon: Landmark, color: 'text-amber-500 bg-amber-50' },
                { title: "Registered comments", val: blogs.reduce((acc, curr) => acc + (curr.comments || []).length, 0), icon: MessageSquare, color: 'text-emerald-500 bg-emerald-50' },
                { title: "Sponsor Listings", val: properties.filter(p => p.price > 10000000).length, icon: Award, color: 'text-purple-500 bg-purple-50' }
              ].map((stat, i) => (
                <div key={i} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                  <div className={`p-2.5 rounded-xl ${stat.color}`}>
                    <stat.icon className="w-5 h-5 text-gold-500" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{stat.title}</span>
                    <h3 className="font-display font-extrabold text-lg text-emerald-950 mt-0.5">{stat.val}</h3>
                  </div>
                </div>
              ))}
            </section>

            {/* Recharts Analytics chart */}
            <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              <div className="lg:col-span-8 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <h3 className="font-display font-extrabold text-xs text-emerald-950 uppercase tracking-wider mb-4">Traffic & Leads Analytics Reps</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={(() => {
                        const baseData = [
                          { name: 'Jan', visitors: 1200, leads: 400 },
                          { name: 'Feb', visitors: 1900, leads: 600 },
                          { name: 'Mar', visitors: 2800, leads: 950 },
                          { name: 'Apr', visitors: 3400, leads: 1100 },
                          { name: 'May', visitors: 4100, leads: 1400 },
                          { name: 'Jun', visitors: 4900, leads: 1800 }
                        ];
                        const liveCount = requests.length;
                        baseData[5].leads += liveCount;
                        baseData[5].visitors += liveCount * 3;
                        return baseData;
                      })()}
                      margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id="colorVis" cx="0" cy="0" r="1">
                          <stop offset="5%" stopColor="#0B3D2E" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#0B3D2E" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} />
                      <YAxis stroke="#94a3b8" fontSize={10} />
                      <Tooltip />
                      <Area type="monotone" dataKey="visitors" stroke="#0B3D2E" strokeWidth={2} fillOpacity={1} fill="url(#colorVis)" name="Site Visitors" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="lg:col-span-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
                <div>
                  <h3 className="font-display font-extrabold text-xs text-emerald-950 uppercase tracking-wider mb-4">Active Leads distribution</h3>
                  <div className="h-44">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={[
                          { name: 'Plots', count: 450 + requests.filter(r => /plot|land/i.test(r.propertyType)).length },
                          { name: 'Home', count: 320 + requests.filter(r => /house|home|villa|apartment|mansion|commercial/i.test(r.propertyType)).length },
                          { name: 'Rent/Inq', count: 180 + requests.filter(r => !/plot|land/i.test(r.propertyType) && !/house|home|villa|apartment|mansion|commercial/i.test(r.propertyType)).length }
                        ]}
                      >
                        <XAxis dataKey="name" fontSize={10} />
                        <YAxis fontSize={10} />
                        <Tooltip />
                        <Bar dataKey="count" fill="#C8A34D" radius={[4, 4, 0, 0]} name="Inquiries" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                <div className="text-[10px] text-gray-400 text-center pt-4 border-t border-gray-100">
                  Data derived directly from client request submissions.
                </div>
              </div>

            </section>

            {/* Sub Tabs Controller */}
            <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm flex flex-wrap gap-2">
              <button
                onClick={() => setAdminPropertiesTab('listings')}
                className={`px-4 py-2 text-xs font-bold uppercase rounded-xl transition-all cursor-pointer ${adminPropertiesTab === 'listings' ? 'bg-emerald-900 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                Catalog Manager ({properties.length})
              </button>
              <button
                onClick={() => setAdminPropertiesTab('requests')}
                className={`px-4 py-2 text-xs font-bold uppercase rounded-xl transition-all cursor-pointer ${adminPropertiesTab === 'requests' ? 'bg-emerald-900 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                Prospective Requests ({requests.length})
              </button>
              <button
                onClick={() => setAdminPropertiesTab('company')}
                className={`px-4 py-2 text-xs font-bold uppercase rounded-xl transition-all cursor-pointer ${adminPropertiesTab === 'company' ? 'bg-emerald-900 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                Company Configuration Studio
              </button>
              <button
                onClick={() => setAdminPropertiesTab('quicklinks')}
                className={`px-4 py-2 text-xs font-bold uppercase rounded-xl transition-all cursor-pointer ${adminPropertiesTab === 'quicklinks' ? 'bg-emerald-900 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                🔗 Pages & Dropdowns
              </button>
              <button
                onClick={() => setAdminPropertiesTab('downloads')}
                className={`px-4 py-2 text-xs font-bold uppercase rounded-xl transition-all cursor-pointer ${adminPropertiesTab === 'downloads' ? 'bg-emerald-900 text-white' : 'bg-blue-50 text-blue-800 hover:bg-blue-100 border border-blue-200'}`}
              >
                💾 Export & Download Center
              </button>
            </div>

            {/* Tab view: listings */}
            {adminPropertiesTab === 'listings' && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                  <h4 className="font-display font-bold text-xs text-emerald-950 uppercase">Registered Properties</h4>
                  <button
                    onClick={() => setIsAddPropertyModalOpen(true)}
                    className="bg-emerald-900 hover:bg-emerald-950 text-white font-bold text-[10px] py-1.5 px-3 rounded-lg uppercase tracking-wide flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5 text-gold-500" /> New Property Draft
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-gray-700">
                    <thead className="bg-gray-100 text-gray-500 text-[10px] uppercase font-bold tracking-wider border-b border-gray-200">
                      <tr>
                        <th className="p-4">Title & Location</th>
                        <th className="p-4">Zoning / Type</th>
                        <th className="p-4">Base Price (KES)</th>
                        <th className="p-4 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {properties.map(p => (
                        <tr key={p.id} className="hover:bg-gray-50/55">
                          <td className="p-4 font-bold text-emerald-950">
                            <div>
                              <span>{p.title}</span>
                              <span className="block text-[10px] text-gray-400 font-medium font-sans mt-0.5">{p.estate}, {p.town}, {p.county}</span>
                            </div>
                          </td>
                          <td className="p-4">
                            <span className="bg-emerald-900/5 text-emerald-900 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full border border-emerald-900/10">
                              {p.propertyType} ({p.type})
                            </span>
                          </td>
                          <td className="p-4 font-bold text-gray-800">
                            {editPriceId === p.id ? (
                              <div className="flex items-center gap-1">
                                <input 
                                  type="number" 
                                  className="w-24 bg-white border border-gray-200 p-1 text-xs text-gray-800"
                                  value={editPriceVal}
                                  onChange={(e) => setEditPriceVal(parseInt(e.target.value) || 0)}
                                />
                                <button 
                                  onClick={() => handleUpdatePrice(p.id)}
                                  className="bg-emerald-900 text-white px-2 py-1 text-[10px]"
                                >
                                  Save
                                </button>
                                <button 
                                  onClick={() => setEditPriceId(null)}
                                  className="text-red-600 px-1 text-xs"
                                >
                                  ×
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1.5">
                                <span>KES {p.price.toLocaleString()}</span>
                                <button 
                                  onClick={() => { setEditPriceId(p.id); setEditPriceVal(p.price); }}
                                  className="text-gold-600 hover:text-gold-700 text-[10px] underline font-medium"
                                >
                                  Edit Price
                                </button>
                              </div>
                            )}
                          </td>
                          <td className="p-4 text-center">
                            <button
                              onClick={() => handleDeleteProperty(p.id)}
                              className="text-red-500 hover:text-red-700 p-1 bg-red-50 hover:bg-red-100 rounded-lg transition-colors cursor-pointer"
                              title="Delete listing"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Tab view: requests */}
            {adminPropertiesTab === 'requests' && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-gray-100 bg-gray-50">
                  <h4 className="font-display font-bold text-xs text-emerald-950 uppercase">Active Sourced Requests from web</h4>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-gray-700">
                    <thead className="bg-gray-100 text-gray-500 text-[10px] uppercase font-bold tracking-wider border-b border-gray-200">
                      <tr>
                        <th className="p-4 text-left">Contact</th>
                        <th className="p-4 text-left">Zoning Specs</th>
                        <th className="p-4 text-left">Description</th>
                        <th className="p-4 text-left">Budget</th>
                        <th className="p-4 text-center">Status</th>
                        <th className="p-4 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {requests.map(r => (
                        <tr key={r.id} className="hover:bg-gray-50/55">
                          <td className="p-4 font-bold text-emerald-950">
                            <div>
                              <span>{r.name}</span>
                              <span className="block text-[10px] text-gray-400 mt-0.5">📞 {r.phone}</span>
                            </div>
                          </td>
                          <td className="p-4 font-bold">
                            <span className="bg-gold-500/10 text-gold-600 text-[10px] px-2 py-0.5 rounded-full uppercase">
                              {r.propertyType}
                            </span>
                            <span className="block text-[10px] text-gray-400 mt-0.5">Town: {r.location}</span>
                          </td>
                          <td className="p-4 text-gray-600 leading-normal max-w-sm">
                            {r.description}
                          </td>
                          <td className="p-4 font-bold text-gray-800">
                            {r.budget}
                          </td>
                          <td className="p-4 text-center">
                            <span className={`text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full border ${
                              r.status === 'matched' 
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                                : r.status === 'contacted'
                                ? 'bg-gray-100 text-gray-500 border-gray-200'
                                : 'bg-amber-50 text-amber-700 border-amber-200 animate-pulse'
                            }`}>
                              {r.status === 'matched' ? 'Approved & Listed' : r.status === 'contacted' ? 'Dismissed' : 'Pending'}
                            </span>
                          </td>
                          <td className="p-4 text-center">
                            {r.status === 'pending' ? (
                              <div className="flex items-center justify-center gap-1.5">
                                <button
                                  onClick={async () => {
                                    try {
                                      const cleanPrice = parseInt(r.budget.replace(/[^0-9]/g, '')) || 1500000;
                                      const response = await fetch('/api/properties', {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({
                                          title: `${r.propertyType} in ${r.location} (${r.name})`,
                                          description: r.description,
                                          price: cleanPrice,
                                          type: 'land',
                                          propertyType: r.propertyType,
                                          county: "Murang'a",
                                          town: r.location,
                                          estate: "Main Area",
                                          bedrooms: 0,
                                          bathrooms: 0,
                                          parking: 0,
                                          size: "1/8 Acre",
                                          agent: {
                                            name: settings.leadBrokerName || "Daniel Maina",
                                            phone: settings.leadBrokerPhone || "+254 722 710 580",
                                            email: settings.leadBrokerEmail || "info@uniquemerchants.co.ke",
                                            photo: settings.leadBrokerPhoto || "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=200&q=80"
                                          },
                                          isAiVerified: true,
                                          isFeatured: false,
                                          isSponsored: false,
                                          images: ["https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80"],
                                          coordinates: {
                                            lat: -0.9995 + (Math.random() - 0.5) * 0.04,
                                            lng: 37.1265 + (Math.random() - 0.5) * 0.04
                                          }
                                        })
                                      });
                                      if (response.ok) {
                                        await fetch(`/api/properties/requests/${r.id}/status`, {
                                          method: 'POST',
                                          headers: { 'Content-Type': 'application/json' },
                                          body: JSON.stringify({ status: 'matched' })
                                        });
                                        alert("Successfully approved request and added property draft listing to the Interactive Map!");
                                        syncPlatformData();
                                      }
                                    } catch (e) {
                                      console.error("Failed to approve request:", e);
                                    }
                                  }}
                                  className="bg-emerald-900 hover:bg-emerald-950 text-white font-extrabold py-1 px-2.5 rounded-lg text-[9px] uppercase cursor-pointer shadow transition-colors"
                                  title="Approve this sourcing request and publish to map draft listings"
                                >
                                  Approve & Draft
                                </button>
                                <button
                                  onClick={async () => {
                                    if (confirm("Are you sure you want to dismiss this sourcing request?")) {
                                      try {
                                        await fetch(`/api/properties/requests/${r.id}/status`, {
                                          method: 'POST',
                                          headers: { 'Content-Type': 'application/json' },
                                          body: JSON.stringify({ status: 'contacted' })
                                        });
                                        syncPlatformData();
                                      } catch (e) {
                                        console.error(e);
                                      }
                                    }
                                  }}
                                  className="bg-red-50 hover:bg-red-100 text-red-600 font-extrabold py-1 px-2.5 rounded-lg text-[9px] uppercase cursor-pointer transition-colors"
                                  title="Dismiss request"
                                >
                                  Dismiss
                                </button>
                              </div>
                            ) : (
                              <span className="text-[10px] text-gray-400 italic">No actions</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Tab view: Company settings form */}
            {adminPropertiesTab === 'company' && (
              <div className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8 shadow-sm">
                <div className="border-b border-gray-100 pb-4 mb-6">
                  <h3 className="font-display font-extrabold text-sm text-emerald-950 uppercase tracking-wider">
                    Company Configuration Studio
                  </h3>
                  <p className="text-gray-400 text-xs mt-1">
                    Fine-tune colors, manage public media handles, and publish updated slideshow content in real-time.
                  </p>
                </div>
                
                <form onSubmit={handleSaveCompanySettings} className="flex flex-col gap-6">
                  {/* GROUP 1: Core Company Meta */}
                  <div className="bg-gray-50/50 p-5 rounded-2xl border border-gray-200/40">
                    <h4 className="text-[10px] font-extrabold text-emerald-900 uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">
                      1. Core Corporate Information & Brand Assets
                    </h4>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                      <div>
                        <label className="text-[10px] font-bold text-gray-500 uppercase">Platform Name</label>
                        <input 
                          type="text" 
                          required
                          className="w-full bg-white border border-gray-200 px-3 py-2 rounded-xl text-xs mt-1 focus:outline-none focus:border-emerald-900" 
                          value={settings.name}
                          onChange={(e) => setSettings({ ...settings, name: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-gray-500 uppercase">Interactive Logo (Banner Width)</label>
                        <div className="mt-1 flex flex-col gap-3">
                          {/* Drag & Drop Upload Zone */}
                          <div 
                            onDragOver={(e) => {
                              e.preventDefault();
                              setIsLogoDragActive(true);
                            }}
                            onDragLeave={() => setIsLogoDragActive(false)}
                            onDrop={(e) => {
                              e.preventDefault();
                              setIsLogoDragActive(false);
                              if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                                handleLogoUpload(e.dataTransfer.files[0]);
                              }
                            }}
                            onClick={() => {
                              const fileInput = document.getElementById('logo-file-input');
                              if (fileInput) fileInput.click();
                            }}
                            className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all flex flex-col items-center justify-center min-h-[90px] ${
                              isLogoDragActive 
                                ? 'border-gold-500 bg-emerald-900/5 shadow-inner' 
                                : 'border-gray-200 bg-white hover:bg-gray-50 shadow-sm'
                            }`}
                          >
                            <input 
                              id="logo-file-input"
                              type="file" 
                              className="hidden" 
                              accept="image/*"
                              onChange={(e) => {
                                if (e.target.files && e.target.files[0]) {
                                  handleLogoUpload(e.target.files[0]);
                                }
                              }}
                            />
                            {isLogoUploading ? (
                              <div className="flex flex-col items-center gap-1.5">
                                <div className="w-5 h-5 border-2 border-emerald-900 border-t-transparent rounded-full animate-spin"></div>
                                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Uploading your logo...</span>
                              </div>
                            ) : (
                              <div className="flex flex-col items-center gap-1">
                                <div className="flex items-center gap-2">
                                  {settings.logo && (settings.logo.startsWith('http') || settings.logo.startsWith('/')) ? (
                                    <img src={settings.logo} alt="Preview Logo" className="w-7 h-7 object-contain rounded bg-gray-50 border p-0.5" />
                                  ) : (
                                    <span className="text-xl">{settings.logo || '🏛️'}</span>
                                  )}
                                  <span className="text-[10px] font-extrabold text-emerald-950 uppercase tracking-wide">
                                    Logo
                                  </span>
                                </div>
                                <p className="text-[9px] text-gray-400 font-medium">
                                  Drop logo here, or <span className="text-emerald-900 underline font-bold">browse</span>
                                </p>
                              </div>
                            )}
                          </div>

                          {/* Fallback Manual Text Input */}
                          <div className="flex gap-2">
                            <input 
                              type="text" 
                              required
                              placeholder="Image URL or Emoji/Text"
                              className="flex-1 bg-white border border-gray-200 px-3 py-2 rounded-xl text-xs focus:outline-none focus:border-emerald-900" 
                              value={settings.logo}
                              onChange={(e) => setSettings({ ...settings, logo: e.target.value })}
                            />
                          </div>
                        </div>
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-gray-500 uppercase">Interactive Icon / Favicon (Square 1:1)</label>
                        <div className="mt-1 flex flex-col gap-3">
                          {/* Drag & Drop Upload Zone */}
                          <div 
                            onDragOver={(e) => {
                              e.preventDefault();
                              setIsIconDragActive(true);
                            }}
                            onDragLeave={() => setIsIconDragActive(false)}
                            onDrop={(e) => {
                              e.preventDefault();
                              setIsIconDragActive(false);
                              if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                                handleIconUpload(e.dataTransfer.files[0]);
                              }
                            }}
                            onClick={() => {
                              const fileInput = document.getElementById('icon-file-input');
                              if (fileInput) fileInput.click();
                            }}
                            className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all flex flex-col items-center justify-center min-h-[90px] ${
                              isIconDragActive 
                                ? 'border-gold-500 bg-emerald-900/5 shadow-inner' 
                                : 'border-gray-200 bg-white hover:bg-gray-50 shadow-sm'
                            }`}
                          >
                            <input 
                              id="icon-file-input"
                              type="file" 
                              className="hidden" 
                              accept="image/*"
                              onChange={(e) => {
                                if (e.target.files && e.target.files[0]) {
                                  handleIconUpload(e.target.files[0]);
                                }
                              }}
                            />
                            {isIconUploading ? (
                              <div className="flex flex-col items-center gap-1.5">
                                <div className="w-5 h-5 border-2 border-emerald-900 border-t-transparent rounded-full animate-spin"></div>
                                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Uploading your icon...</span>
                              </div>
                            ) : (
                              <div className="flex flex-col items-center gap-1">
                                <div className="flex items-center gap-2">
                                  {settings.icon && (settings.icon.startsWith('http') || settings.icon.startsWith('/')) ? (
                                    <img src={settings.icon} alt="Preview Icon" className="w-7 h-7 object-contain rounded bg-gray-50 border p-0.5" />
                                  ) : (
                                    <span className="text-xl">{settings.icon || '🏢'}</span>
                                  )}
                                  <span className="text-[10px] font-extrabold text-emerald-950 uppercase tracking-wide">
                                    Icon
                                  </span>
                                </div>
                                <p className="text-[9px] text-gray-400 font-medium">
                                  Drop icon here, or <span className="text-emerald-900 underline font-bold">browse</span>
                                </p>
                              </div>
                            )}
                          </div>

                          {/* Fallback Manual Text Input */}
                          <div className="flex gap-2">
                            <input 
                              type="text" 
                              required
                              placeholder="Image URL or Emoji/Text"
                              className="flex-1 bg-white border border-gray-200 px-3 py-2 rounded-xl text-xs focus:outline-none focus:border-emerald-900" 
                              value={settings.icon || ''}
                              onChange={(e) => setSettings({ ...settings, icon: e.target.value })}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Logo Presets Row */}
                    <div className="mb-6">
                      <label className="text-[9px] font-bold text-gray-400 uppercase tracking-wide block mb-2">Or Choose a Premium Logo Preset</label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {[
                          { name: '🏛️ Classical', value: '🏛️' },
                          { name: '🏢 Corporate', value: '🏢' },
                          { name: '🌿 Eco Estate', value: '🌿' },
                          { name: '✨ Luxury Crest', value: 'https://images.unsplash.com/photo-1516880711640-ef7db81be3e1?auto=format&fit=crop&w=150&h=150&q=80' },
                          { name: '⚜️ Golden Seal', value: 'https://images.unsplash.com/photo-1606857521015-7f9fcf423740?auto=format&fit=crop&w=150&h=150&q=80' },
                          { name: '🌿 Premium Leaf', value: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=150&h=150&q=80' },
                          { name: '🏠 Modern Villa', value: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=150&h=150&q=80' },
                          { name: '🏛️ Default MU', value: '🏛️' }
                        ].map((preset, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setSettings({ ...settings, logo: preset.value })}
                            className={`px-2.5 py-1.5 border rounded-lg text-[10px] font-semibold text-center transition-all truncate cursor-pointer ${settings.logo === preset.value ? 'bg-emerald-900 text-white border-emerald-950 shadow' : 'bg-white hover:bg-gray-100 border-gray-200 text-gray-600'}`}
                          >
                            {preset.name}
                          </button>
                        ))}
                      </div>
                    </div>

                    <h5 className="text-[9px] font-bold text-emerald-800 uppercase tracking-widest mb-3 mt-4 border-t border-gray-100 pt-3">Leading Broker / Representative Details</h5>
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-4">
                      <div>
                        <label className="text-[10px] font-bold text-gray-500 uppercase">Representative Name</label>
                        <input 
                          type="text" 
                          required
                          className="w-full bg-white border border-gray-200 px-3 py-2 rounded-xl text-xs mt-1 focus:outline-none focus:border-emerald-900" 
                          value={settings.leadBrokerName || 'Daniel Maina'}
                          onChange={(e) => setSettings({ ...settings, leadBrokerName: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-gray-500 uppercase">Representative Phone</label>
                        <input 
                          type="text" 
                          required
                          className="w-full bg-white border border-gray-200 px-3 py-2 rounded-xl text-xs mt-1 focus:outline-none focus:border-emerald-900" 
                          value={settings.leadBrokerPhone || '+254 722 710 580'}
                          onChange={(e) => setSettings({ ...settings, leadBrokerPhone: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-gray-500 uppercase">Representative Email</label>
                        <input 
                          type="email" 
                          required
                          className="w-full bg-white border border-gray-200 px-3 py-2 rounded-xl text-xs mt-1 focus:outline-none focus:border-emerald-900" 
                          value={settings.leadBrokerEmail || 'info@uniquemerchants.co.ke'}
                          onChange={(e) => setSettings({ ...settings, leadBrokerEmail: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-gray-500 uppercase">Representative Photo URL</label>
                        <input 
                          type="text" 
                          required
                          className="w-full bg-white border border-gray-200 px-3 py-2 rounded-xl text-xs mt-1 focus:outline-none focus:border-emerald-900" 
                          value={settings.leadBrokerPhoto || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=200&q=80'}
                          onChange={(e) => setSettings({ ...settings, leadBrokerPhoto: e.target.value })}
                        />
                      </div>
                    </div>

                    <h5 className="text-[9px] font-bold text-emerald-800 uppercase tracking-widest mb-3 mt-4 border-t border-gray-100 pt-3">Corporate Contact Directives</h5>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                      <div>
                        <label className="text-[10px] font-bold text-gray-500 uppercase">Mobile Phone Contact</label>
                        <input 
                          type="text" 
                          required
                          className="w-full bg-white border border-gray-200 px-3 py-2 rounded-xl text-xs mt-1 focus:outline-none focus:border-emerald-900" 
                          value={settings.mobile}
                          onChange={(e) => setSettings({ ...settings, mobile: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-gray-500 uppercase">Office Landline</label>
                        <input 
                          type="text" 
                          className="w-full bg-white border border-gray-200 px-3 py-2 rounded-xl text-xs mt-1 focus:outline-none focus:border-emerald-900" 
                          value={settings.telephone || ''}
                          onChange={(e) => setSettings({ ...settings, telephone: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-gray-500 uppercase">WhatsApp Support Line</label>
                        <input 
                          type="text" 
                          required
                          className="w-full bg-white border border-gray-200 px-3 py-2 rounded-xl text-xs mt-1 focus:outline-none focus:border-emerald-900" 
                          value={settings.whatsapp}
                          onChange={(e) => setSettings({ ...settings, whatsapp: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                      <div>
                        <label className="text-[10px] font-bold text-gray-500 uppercase">Broker Email Line</label>
                        <input 
                          type="email" 
                          required
                          className="w-full bg-white border border-gray-200 px-3 py-2 rounded-xl text-xs mt-1 focus:outline-none focus:border-emerald-900" 
                          value={settings.email}
                          onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-gray-500 uppercase">Operating Hours</label>
                        <input 
                          type="text" 
                          required
                          className="w-full bg-white border border-gray-200 px-3 py-2 rounded-xl text-xs mt-1 focus:outline-none focus:border-emerald-900" 
                          value={settings.officeHours}
                          onChange={(e) => setSettings({ ...settings, officeHours: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-gray-500 uppercase">Postal Address & Code</label>
                        <input 
                          type="text" 
                          required
                          className="w-full bg-white border border-gray-200 px-3 py-2 rounded-xl text-xs mt-1 focus:outline-none focus:border-emerald-900" 
                          value={settings.postalAddress}
                          onChange={(e) => setSettings({ ...settings, postalAddress: e.target.value })}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-gray-500 uppercase">Headquarters Location Address</label>
                      <input 
                        type="text" 
                        required
                        className="w-full bg-white border border-gray-200 px-3 py-2 rounded-xl text-xs mt-1 focus:outline-none focus:border-emerald-900" 
                        value={settings.address}
                        onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                      />
                    </div>
                  </div>

                  {/* GROUP 2: Color Scheme & Palette Theme */}
                  <div className="bg-gray-50/50 p-5 rounded-2xl border border-gray-200/40">
                    <h4 className="text-[10px] font-extrabold text-emerald-900 uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">
                      2. Corporate Color Customizer (Real-time Live Preview)
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="text-[10px] font-bold text-gray-500 uppercase">Primary Color (Deep Emerald / Navy)</label>
                        <div className="flex gap-2 items-center mt-1">
                          <input 
                            type="color" 
                            className="w-10 h-10 border border-gray-200 rounded-xl cursor-pointer p-0.5 shrink-0" 
                            value={settings.primaryColor || '#0B1E5B'}
                            onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })}
                          />
                          <input 
                            type="text" 
                            className="w-full bg-white border border-gray-200 px-3 py-2 rounded-xl text-xs" 
                            value={settings.primaryColor || '#0B1E5B'}
                            onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })}
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-gray-500 uppercase">Secondary Color (Elegant Gold / Yellow)</label>
                        <div className="flex gap-2 items-center mt-1">
                          <input 
                            type="color" 
                            className="w-10 h-10 border border-gray-200 rounded-xl cursor-pointer p-0.5 shrink-0" 
                            value={settings.secondaryColor || '#FFF200'}
                            onChange={(e) => setSettings({ ...settings, secondaryColor: e.target.value })}
                          />
                          <input 
                            type="text" 
                            className="w-full bg-white border border-gray-200 px-3 py-2 rounded-xl text-xs" 
                            value={settings.secondaryColor || '#FFF200'}
                            onChange={(e) => setSettings({ ...settings, secondaryColor: e.target.value })}
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-gray-500 uppercase">Burgundy Indicator Color</label>
                        <div className="flex gap-2 items-center mt-1">
                          <input 
                            type="color" 
                            className="w-10 h-10 border border-gray-200 rounded-xl cursor-pointer p-0.5 shrink-0" 
                            value={settings.burgundyColor || '#8C040E'}
                            onChange={(e) => setSettings({ ...settings, burgundyColor: e.target.value })}
                          />
                          <input 
                            type="text" 
                            className="w-full bg-white border border-gray-200 px-3 py-2 rounded-xl text-xs" 
                            value={settings.burgundyColor || '#8C040E'}
                            onChange={(e) => setSettings({ ...settings, burgundyColor: e.target.value })}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* GROUP 3: Social Media Connections */}
                  <div className="bg-gray-50/50 p-5 rounded-2xl border border-gray-200/40">
                    <h4 className="text-[10px] font-extrabold text-emerald-900 uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">
                      3. Dynamic Social Media Handles & API Integrations
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="text-[10px] font-bold text-gray-500 uppercase">Facebook Page Link</label>
                        <input 
                          type="text" 
                          required
                          className="w-full bg-white border border-gray-200 px-3 py-2 rounded-xl text-xs mt-1" 
                          value={settings.facebook}
                          onChange={(e) => setSettings({ ...settings, facebook: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-gray-500 uppercase">Instagram Link</label>
                        <input 
                          type="text" 
                          required
                          className="w-full bg-white border border-gray-200 px-3 py-2 rounded-xl text-xs mt-1" 
                          value={settings.instagram}
                          onChange={(e) => setSettings({ ...settings, instagram: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="text-[10px] font-bold text-gray-500 uppercase">LinkedIn Profile</label>
                        <input 
                          type="text" 
                          required
                          className="w-full bg-white border border-gray-200 px-3 py-2 rounded-xl text-xs mt-1" 
                          value={settings.linkedin}
                          onChange={(e) => setSettings({ ...settings, linkedin: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-gray-500 uppercase">YouTube Channel URL</label>
                        <input 
                          type="text" 
                          required
                          className="w-full bg-white border border-gray-200 px-3 py-2 rounded-xl text-xs mt-1" 
                          value={settings.youtube || ''}
                          onChange={(e) => setSettings({ ...settings, youtube: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-bold text-gray-500 uppercase">X (Twitter) URL</label>
                        <input 
                          type="text" 
                          required
                          className="w-full bg-white border border-gray-200 px-3 py-2 rounded-xl text-xs mt-1" 
                          value={settings.x}
                          onChange={(e) => setSettings({ ...settings, x: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-gray-500 uppercase">WhatsApp URL API / Number</label>
                        <input 
                          type="text" 
                          required
                          className="w-full bg-white border border-gray-200 px-3 py-2 rounded-xl text-xs mt-1" 
                          value={settings.whatsapp}
                          onChange={(e) => setSettings({ ...settings, whatsapp: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="mt-4 border-t border-gray-100 pt-3 flex items-center gap-2">
                      <input 
                        type="checkbox" 
                        id="social-media-not-live-checkbox"
                        className="w-4 h-4 text-emerald-900 border-gray-300 rounded focus:ring-emerald-900"
                        checked={settings.socialMediaNotLive || false}
                        onChange={(e) => setSettings({ ...settings, socialMediaNotLive: e.target.checked })}
                      />
                      <label htmlFor="social-media-not-live-checkbox" className="text-xs font-bold text-gray-700 cursor-pointer select-none">
                        Disable Simulated 'Live' Community Feeds (Set Social Media to Static/Not Live)
                      </label>
                    </div>

                    {/* Instagram Custom Uploads */}
                    <div className="mt-6 border-t border-gray-150 pt-4">
                      <h5 className="text-[10px] font-extrabold text-emerald-950 uppercase tracking-wider mb-2">
                        Customize Instagram Grid Images
                      </h5>
                      <p className="text-gray-400 text-[9px] mb-3 leading-relaxed">
                        Upload your custom images to replace the default Instagram live grid cards.
                      </p>
                      
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {[0, 1, 2, 3].map((idx) => {
                          const currentImg = (settings.instagramImages || [])[idx] || (INITIAL_SETTINGS.instagramImages || [])[idx];
                          return (
                            <div key={idx} className="flex flex-col gap-2 p-2 bg-white rounded-xl border border-gray-150 shadow-sm">
                              <span className="text-[9px] font-extrabold text-gray-400 uppercase">Slot {idx + 1}</span>
                              <div className="aspect-square rounded-lg overflow-hidden bg-gray-50 border border-gray-100 relative group">
                                <img src={currentImg} className="w-full h-full object-cover" />
                              </div>
                              <label className="w-full text-center bg-gray-50 hover:bg-gray-100 border border-gray-200 text-[10px] font-bold py-1.5 px-2 rounded-lg cursor-pointer text-gray-700 transition-colors">
                                Choose File
                                <input 
                                  type="file" 
                                  accept="image/*" 
                                  className="hidden" 
                                  onChange={async (e) => {
                                    if (e.target.files && e.target.files[0]) {
                                      const file = e.target.files[0];
                                      const formData = new FormData();
                                      formData.append('file', file);
                                      try {
                                        const res = await fetch('/api/upload', {
                                          method: 'POST',
                                          body: formData
                                        });
                                        const data = await res.json();
                                        if (data.success && data.url) {
                                          const newImgs = [...(settings.instagramImages || ["", "", "", ""])];
                                          while(newImgs.length < 4) newImgs.push("");
                                          newImgs[idx] = data.url;
                                          const updatedSetts = { ...settings, instagramImages: newImgs };
                                          setSettings(updatedSetts);
                                          await fetch('/api/settings', {
                                            method: 'POST',
                                            headers: { 'Content-Type': 'application/json' },
                                            body: JSON.stringify(updatedSetts)
                                          });
                                          alert(`Instagram image ${idx + 1} updated successfully!`);
                                        } else {
                                          alert('Upload failed: ' + (data.error || 'unknown error'));
                                        }
                                      } catch (err) {
                                        console.error(err);
                                        alert('Upload failed: ' + (err as Error).message);
                                      }
                                    }
                                  }}
                                />
                              </label>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* GROUP 4: Slideshow Manager */}
                  <div className="bg-gray-50/50 p-5 rounded-2xl border border-gray-200/40">
                    <h4 className="text-[10px] font-extrabold text-emerald-900 uppercase tracking-wider mb-2 border-b border-gray-100 pb-2">
                      4. Luxury Hero Slideshow Manager
                    </h4>
                    <p className="text-gray-400 text-[10px] mb-4">
                      Add, delete, and view high-resolution slide backgrounds used on the landing homepage carousel.
                    </p>

                    {/* Current slide list */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4">
                      {(settings.heroSlides || []).map((slide, idx) => (
                        <div key={idx} className="relative rounded-xl overflow-hidden aspect-video border border-gray-200 group bg-gray-100">
                          <img src={slide.image} alt={`Slide ${idx+1}`} className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/45 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity p-2 text-center">
                            <button
                              type="button"
                              onClick={() => {
                                const updated = (settings.heroSlides || []).filter((_, i) => i !== idx);
                                setSettings({ ...settings, heroSlides: updated });
                              }}
                              className="bg-red-600 hover:bg-red-700 text-white font-extrabold text-[10px] px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
                            >
                              Remove Slide
                            </button>
                          </div>
                          <span className="absolute bottom-1 right-1 bg-black/70 text-white text-[8px] font-mono px-1 rounded">
                            Slide {idx + 1}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Add slide row */}
                    <div className="flex flex-col gap-3">
                      <div className="flex gap-2">
                        <input 
                          type="text" 
                          placeholder="Paste image Unsplash URL (e.g. https://images.unsplash.com/photo-...)"
                          className="flex-1 bg-white border border-gray-200 px-3 py-2 rounded-xl text-xs focus:outline-none focus:border-emerald-900" 
                          value={newSlideUrl}
                          onChange={(e) => setNewSlideUrl(e.target.value)}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (!newSlideUrl.trim()) return;
                            const updated = [...(settings.heroSlides || []), { image: newSlideUrl.trim() }];
                            setSettings({ ...settings, heroSlides: updated });
                            setNewSlideUrl('');
                          }}
                          className="bg-emerald-900 hover:bg-emerald-950 text-white font-bold px-4 py-2 rounded-xl text-xs uppercase cursor-pointer shrink-0"
                        >
                          Add URL
                        </button>
                      </div>

                      <div className="flex items-center justify-center border border-dashed border-gray-300 bg-white rounded-xl p-4 text-center transition-all hover:bg-gray-50/50">
                        <label className="cursor-pointer w-full h-full flex flex-col items-center justify-center gap-1.5">
                          <input 
                            type="file" 
                            accept="image/*"
                            className="hidden" 
                            onChange={(e) => {
                              if (e.target.files && e.target.files[0]) {
                                handleSlideUpload(e.target.files[0]);
                              }
                            }}
                            disabled={isSlideUploading}
                          />
                          <div className="flex items-center gap-2 justify-center">
                            {isSlideUploading ? (
                              <div className="w-4 h-4 border-2 border-emerald-900 border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                              <span className="text-emerald-900 text-sm">📤</span>
                            )}
                            <span className="text-xs font-bold text-gray-700">
                              {isSlideUploading ? "Uploading slide..." : "Upload local slide image from device"}
                            </span>
                          </div>
                          <span className="text-[10px] text-gray-400">Supports PNG, JPG, JPEG, WEBP</span>
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* GROUP 5: YouTube Property Videos Manager */}
                  <div className="bg-gray-50/50 p-5 rounded-2xl border border-gray-200/40">
                    <h4 className="text-[10px] font-extrabold text-emerald-900 uppercase tracking-wider mb-2 border-b border-gray-100 pb-2">
                      5. YouTube Property Walkthrough Videos Manager
                    </h4>
                    <p className="text-gray-400 text-[10px] mb-4">
                      Add, delete, and manage dynamic YouTube HD walkthrough videos shown on the platform.
                    </p>

                    {/* Current videos list */}
                    <div className="space-y-3 mb-6">
                      {(settings.youtubeVideos || []).map((video, idx) => (
                        <div key={video.id || idx} className="flex gap-4 p-3 bg-white rounded-xl border border-gray-100 items-center justify-between shadow-sm">
                          <div className="flex gap-3 items-center min-w-0">
                            <div className="relative w-16 h-11 rounded-lg overflow-hidden shrink-0 border border-gray-200">
                              <img src={video.thumbnail || "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=150&q=80"} alt={video.title} className="w-full h-full object-cover" />
                              <span className="absolute bottom-0.5 right-0.5 bg-black/80 text-[8px] font-mono text-white px-1 py-0.2 rounded font-bold">
                                {video.duration}
                              </span>
                            </div>
                            <div className="min-w-0">
                              <h5 className="text-[11px] font-bold text-gray-800 truncate">{video.title}</h5>
                              <p className="text-[9px] text-gray-400 line-clamp-1">{video.desc}</p>
                              <span className="text-[8px] font-mono text-emerald-600 truncate block">{video.url}</span>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              const updated = (settings.youtubeVideos || []).filter((_, i) => i !== idx);
                              setSettings({ ...settings, youtubeVideos: updated });
                            }}
                            className="text-red-500 hover:text-red-700 font-bold text-xs p-1 cursor-pointer shrink-0"
                            title="Delete video"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>

                    {/* Add video controls */}
                    <div className="bg-emerald-50/30 p-4 rounded-xl border border-emerald-900/10 flex flex-col gap-3">
                      <span className="text-[10px] font-extrabold text-emerald-900 uppercase">Add Real Property Walkthrough Video</span>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="text-[9px] font-bold text-gray-500 uppercase">Video Title</label>
                          <input 
                            type="text" 
                            placeholder="e.g., Kabati Phase 4 Site Tour"
                            className="w-full bg-white border border-gray-200 px-3 py-1.5 rounded-xl text-xs mt-0.5" 
                            value={newVideoTitle}
                            onChange={(e) => setNewVideoTitle(e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="text-[9px] font-bold text-gray-500 uppercase">Duration</label>
                          <input 
                            type="text" 
                            placeholder="e.g., 5:20"
                            className="w-full bg-white border border-gray-200 px-3 py-1.5 rounded-xl text-xs mt-0.5" 
                            value={newVideoDuration}
                            onChange={(e) => setNewVideoDuration(e.target.value)}
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-[9px] font-bold text-gray-500 uppercase">Short Description</label>
                        <input 
                          type="text" 
                          placeholder="e.g., Beautiful view of the sunset plots and ready infrastructure."
                          className="w-full bg-white border border-gray-200 px-3 py-1.5 rounded-xl text-xs mt-0.5" 
                          value={newVideoDesc}
                          onChange={(e) => setNewVideoDesc(e.target.value)}
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="text-[9px] font-bold text-gray-500 uppercase">YouTube Video URL</label>
                          <input 
                            type="text" 
                            placeholder="e.g., https://www.youtube.com/watch?v=..."
                            className="w-full bg-white border border-gray-200 px-3 py-1.5 rounded-xl text-xs mt-0.5" 
                            value={newVideoUrl}
                            onChange={(e) => setNewVideoUrl(e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="text-[9px] font-bold text-gray-500 uppercase">Thumbnail Image URL</label>
                          <input 
                            type="text" 
                            placeholder="e.g., Unsplash house photo link"
                            className="w-full bg-white border border-gray-200 px-3 py-1.5 rounded-xl text-xs mt-0.5" 
                            value={newVideoThumbnail}
                            onChange={(e) => setNewVideoThumbnail(e.target.value)}
                          />
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          if (!newVideoTitle.trim() || !newVideoUrl.trim()) {
                            alert("Please enter at least a Video Title and YouTube URL!");
                            return;
                          }
                          const defaultThumb = "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=300&q=80";
                          const addedVideo = {
                            id: `yt-${Date.now()}`,
                            title: newVideoTitle.trim(),
                            desc: newVideoDesc.trim() || "Dynamic walkthrough of real properties.",
                            duration: newVideoDuration.trim() || "3:00",
                            thumbnail: newVideoThumbnail.trim() || defaultThumb,
                            url: newVideoUrl.trim()
                          };
                          const updated = [...(settings.youtubeVideos || []), addedVideo];
                          setSettings({ ...settings, youtubeVideos: updated });
                          
                          // Reset inputs
                          setNewVideoTitle('');
                          setNewVideoDesc('');
                          setNewVideoDuration('');
                          setNewVideoThumbnail('');
                          setNewVideoUrl('');
                        }}
                        className="w-full bg-emerald-900 hover:bg-emerald-950 text-white font-bold py-2 rounded-xl text-xs uppercase cursor-pointer"
                      >
                        Add Video to Playlist
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase">Corporate Identity (What We Do)</label>
                    <textarea 
                      rows={3} 
                      className="w-full bg-white border border-gray-200 px-3 py-2 rounded-xl text-xs mt-1" 
                      value={settings.about}
                      onChange={(e) => setSettings({ ...settings, about: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase">Company Mission Statement</label>
                    <textarea 
                      rows={2} 
                      className="w-full bg-white border border-gray-200 px-3 py-2 rounded-xl text-xs mt-1" 
                      value={settings.mission}
                      onChange={(e) => setSettings({ ...settings, mission: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase">Company Vision Statement</label>
                    <textarea 
                      rows={2} 
                      className="w-full bg-white border border-gray-200 px-3 py-2 rounded-xl text-xs mt-1" 
                      value={settings.vision}
                      onChange={(e) => setSettings({ ...settings, vision: e.target.value })}
                    />
                  </div>

                  {/* Core Values list editor */}
                  <div className="bg-gray-50/50 p-5 rounded-2xl border border-gray-200/40">
                    <h4 className="text-[10px] font-extrabold text-emerald-900 uppercase tracking-wider mb-2 border-b border-gray-100 pb-2">
                      5. Core Values Professional Pillars
                    </h4>
                    <div className="space-y-2 mb-4">
                      {settings.coreValues.map((val, idx) => (
                        <div key={idx} className="flex gap-2 items-center">
                          <input 
                            type="text" 
                            className="flex-1 bg-white border border-gray-200 px-3 py-1.5 rounded-xl text-xs" 
                            value={val}
                            onChange={(e) => {
                              const updated = [...settings.coreValues];
                              updated[idx] = e.target.value;
                              setSettings({ ...settings, coreValues: updated });
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const updated = settings.coreValues.filter((_, i) => i !== idx);
                              setSettings({ ...settings, coreValues: updated });
                            }}
                            className="bg-red-50 text-red-600 hover:bg-red-100 font-extrabold text-[10px] px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        id="new-core-value-input"
                        placeholder="Add a new core pillar..."
                        className="flex-1 bg-white border border-gray-200 px-3 py-1.5 rounded-xl text-xs" 
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            const input = e.currentTarget;
                            if (input.value.trim()) {
                              setSettings({ ...settings, coreValues: [...settings.coreValues, input.value.trim()] });
                              input.value = '';
                            }
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const el = document.getElementById('new-core-value-input') as HTMLInputElement;
                          if (el && el.value.trim()) {
                            setSettings({ ...settings, coreValues: [...settings.coreValues, el.value.trim()] });
                            el.value = '';
                          }
                        }}
                        className="bg-emerald-900 hover:bg-emerald-950 text-white font-bold px-4 py-1.5 rounded-xl text-xs uppercase cursor-pointer"
                      >
                        Add Pillar
                      </button>
                    </div>
                  </div>

                  {/* Team Roster Editor */}
                  <div className="bg-gray-50/50 p-5 rounded-2xl border border-gray-200/40">
                    <h4 className="text-[10px] font-extrabold text-emerald-900 uppercase tracking-wider mb-2 border-b border-gray-100 pb-2">
                      6. Executive Team & Sourcing Broker Roster
                    </h4>
                    <p className="text-gray-400 text-[10px] mb-4">
                      Update details, roles, photos, and bios of personnel displayed on the About Us page.
                    </p>
                    
                    {/* List of current team members */}
                    <div className="space-y-4 mb-6 border-b border-gray-100 pb-4">
                      {team.map((member, idx) => (
                        <div key={member.id} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col sm:flex-row gap-4">
                          <img src={member.photo} alt={member.name} className="w-16 h-16 rounded-full object-cover border border-gray-100 shrink-0 mx-auto sm:mx-0" />
                          <div className="flex-1 space-y-2">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              <div>
                                <label className="text-[8px] font-bold text-gray-400 uppercase">Member Name</label>
                                <input 
                                  type="text" 
                                  className="w-full bg-white border border-gray-200 px-2 py-1 rounded-lg text-xs mt-0.5" 
                                  value={member.name}
                                  onChange={(e) => {
                                    const updated = [...team];
                                    updated[idx] = { ...member, name: e.target.value };
                                    saveTeam(updated);
                                  }}
                                />
                              </div>
                              <div>
                                <label className="text-[8px] font-bold text-gray-400 uppercase">Role / Title</label>
                                <input 
                                  type="text" 
                                  className="w-full bg-white border border-gray-200 px-2 py-1 rounded-lg text-xs mt-0.5" 
                                  value={member.role}
                                  onChange={(e) => {
                                    const updated = [...team];
                                    updated[idx] = { ...member, role: e.target.value };
                                    saveTeam(updated);
                                  }}
                                />
                              </div>
                            </div>
                            <div>
                              <label className="text-[8px] font-bold text-gray-400 uppercase">Photo URL</label>
                              <input 
                                type="text" 
                                className="w-full bg-white border border-gray-200 px-2 py-1 rounded-lg text-xs mt-0.5" 
                                value={member.photo}
                                onChange={(e) => {
                                    const updated = [...team];
                                    updated[idx] = { ...member, photo: e.target.value };
                                    saveTeam(updated);
                                }}
                              />
                            </div>
                            <div>
                              <label className="text-[8px] font-bold text-gray-400 uppercase">Brief bio profile</label>
                              <textarea 
                                rows={1} 
                                className="w-full bg-white border border-gray-200 px-2 py-1 rounded-lg text-xs mt-0.5" 
                                value={member.bio}
                                onChange={(e) => {
                                    const updated = [...team];
                                    updated[idx] = { ...member, bio: e.target.value };
                                    saveTeam(updated);
                                }}
                              />
                            </div>
                            <div className="flex justify-end pt-1">
                              <button
                                type="button"
                                onClick={() => {
                                  const updated = team.filter((_, i) => i !== idx);
                                  saveTeam(updated);
                                }}
                                className="bg-red-50 text-red-600 hover:bg-red-100 font-extrabold text-[9px] px-3 py-1 rounded-lg transition-colors cursor-pointer"
                              >
                                Delete Representative
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Add team member card */}
                    <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-900/10">
                      <h5 className="font-display font-extrabold text-[10px] text-emerald-950 uppercase tracking-wider mb-2">Enroll New Officer</h5>
                      <div className="grid grid-cols-2 gap-2 mb-2">
                        <input 
                          type="text" 
                          id="new-member-name" 
                          placeholder="Full Name" 
                          className="bg-white border border-gray-200 px-2 py-1.5 rounded-lg text-xs" 
                        />
                        <input 
                          type="text" 
                          id="new-member-role" 
                          placeholder="Corporate Role" 
                          className="bg-white border border-gray-200 px-2 py-1.5 rounded-lg text-xs" 
                        />
                      </div>
                      <input 
                        type="text" 
                        id="new-member-photo" 
                        placeholder="Photo URL" 
                        className="w-full bg-white border border-gray-200 px-2 py-1.5 rounded-lg text-xs mb-2" 
                      />
                      <textarea 
                        rows={1} 
                        id="new-member-bio" 
                        placeholder="Short Professional Bio..." 
                        className="w-full bg-white border border-gray-200 px-2 py-1.5 rounded-lg text-xs mb-2" 
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const nameEl = document.getElementById('new-member-name') as HTMLInputElement;
                          const roleEl = document.getElementById('new-member-role') as HTMLInputElement;
                          const photoEl = document.getElementById('new-member-photo') as HTMLInputElement;
                          const bioEl = document.getElementById('new-member-bio') as HTMLInputElement;
                          
                          if (nameEl && roleEl && nameEl.value.trim() && roleEl.value.trim()) {
                            const newMember = {
                              id: String(Date.now()),
                              name: nameEl.value.trim(),
                              role: roleEl.value.trim(),
                              photo: photoEl?.value.trim() || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80',
                              bio: bioEl?.value.trim() || 'Qualified agent on-site in Murang\'a.'
                            };
                            saveTeam([...team, newMember]);
                            nameEl.value = '';
                            roleEl.value = '';
                            if (photoEl) photoEl.value = '';
                            if (bioEl) bioEl.value = '';
                          }
                        }}
                        className="w-full bg-emerald-900 hover:bg-emerald-950 text-white font-bold py-2 rounded-lg text-xs uppercase cursor-pointer"
                      >
                        Approve and Add Member
                      </button>
                    </div>
                  </div>

                  {/* GROUP 7: Security Credentials & Access Control */}
                  <div className="bg-gray-50/50 p-5 rounded-2xl border border-gray-200/40">
                    <h4 className="text-[10px] font-extrabold text-emerald-900 uppercase tracking-wider mb-2 border-b border-gray-100 pb-2">
                      7. Security Credentials & Access Control
                    </h4>
                    <p className="text-gray-400 text-[10px] mb-4">
                      Modify the passcode used to unlock the Administrator Dashboard. Default is <span className="font-bold">1234</span>.
                    </p>
                    <div className="max-w-xs">
                      <label className="text-[10px] font-bold text-gray-500 uppercase">New Administrator Passcode</label>
                      <input 
                        type="text" 
                        required
                        placeholder="e.g., 1234 or custom_passcode"
                        className="w-full bg-white border border-gray-200 px-3 py-2 rounded-xl text-xs mt-1 font-bold tracking-widest focus:outline-none focus:border-emerald-900" 
                        value={settings.adminPasscode || ''}
                        onChange={(e) => setSettings({ ...settings, adminPasscode: e.target.value })}
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-emerald-900 hover:bg-emerald-950 text-white font-bold py-3 rounded-xl text-xs uppercase tracking-wider transition-colors shadow-lg cursor-pointer"
                  >
                    Commit Configuration Updates
                  </button>
                </form>
              </div>
            )}

            {/* Tab view: local export & download center */}
            {adminPropertiesTab === 'downloads' && (
              <div className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8 shadow-sm">
                <div className="border-b border-gray-100 pb-4 mb-6">
                  <h3 className="font-display font-extrabold text-sm text-emerald-950 uppercase tracking-wider flex items-center gap-1.5">
                    💾 System Database Backup & Export Center
                  </h3>
                  <p className="text-gray-400 text-xs mt-1">
                    Export real-time listings, user submissions, and team configurations into versatile file formats for local warehousing, backup, or Excel analytics.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  {/* Option A: CSV Listing */}
                  <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200/50 flex flex-col justify-between">
                    <div>
                      <div className="bg-emerald-900/10 text-emerald-950 text-[9px] font-extrabold uppercase px-2.5 py-1 rounded-md tracking-wider w-fit mb-3">
                        Option 1: spreadsheet friendly
                      </div>
                      <h4 className="font-display font-bold text-xs text-emerald-950 uppercase">Properties Catalog (CSV)</h4>
                      <p className="text-gray-500 text-[11px] leading-relaxed mt-2">
                        Download a clean comma-separated values (.csv) spreadsheet file containing all registered real estate properties, pricing sheets, coordinates, and AI-vetted specifications. Perfect for opening directly inside Microsoft Excel, Google Sheets, or LibreOffice.
                      </p>
                      <div className="mt-4 bg-white/70 border border-gray-100 p-2.5 rounded-lg text-[10px] text-gray-500 flex flex-col gap-1 font-mono">
                        <span>• Rows: {properties.length} Listings</span>
                        <span>• Encodings: UTF-8 with BOM</span>
                        <span>• Columns: ID, Title, Type, Price, County, Estate, Specs...</span>
                      </div>
                    </div>
                    <a
                      href="/api/properties/download?format=csv"
                      className="mt-6 w-full text-center bg-emerald-900 hover:bg-emerald-950 text-white font-bold py-2.5 rounded-xl text-xs uppercase tracking-wider transition-colors inline-block cursor-pointer"
                    >
                      Export CSV Spreadsheet
                    </a>
                  </div>

                  {/* Option B: JSON Backup */}
                  <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200/50 flex flex-col justify-between">
                    <div>
                      <div className="bg-blue-500/10 text-blue-700 text-[9px] font-extrabold uppercase px-2.5 py-1 rounded-md tracking-wider w-fit mb-3">
                        Option 2: full relational backup
                      </div>
                      <h4 className="font-display font-bold text-xs text-emerald-950 uppercase">Unified System Data (JSON)</h4>
                      <p className="text-gray-500 text-[11px] leading-relaxed mt-2">
                        Download a comprehensive structured JSON (.json) database dump. This packages all existing properties, company configurations, customized themes, and prospective client inquiries in a single cohesive backup. Perfect for developers, security audits, or importing into other databases.
                      </p>
                      <div className="mt-4 bg-white/70 border border-gray-100 p-2.5 rounded-lg text-[10px] text-gray-500 flex flex-col gap-1 font-mono">
                        <span>• Data blocks: Properties ({properties.length}), Inquiries ({requests.length}), Settings</span>
                        <span>• Format: Structured Key-Value Document</span>
                        <span>• Utility: Disaster recovery & backup</span>
                      </div>
                    </div>
                    <a
                      href="/api/properties/download?format=json"
                      className="mt-6 w-full text-center bg-emerald-900 hover:bg-slate-950 text-white font-bold py-2.5 rounded-xl text-xs uppercase tracking-wider transition-colors inline-block border border-gray-900 cursor-pointer"
                    >
                      Download JSON DB Backup
                    </a>
                  </div>
                </div>

                <div className="text-[10px] text-gray-400 text-center bg-amber-50/50 p-3 rounded-xl border border-amber-500/10 leading-normal">
                  ⚠️ <strong>Administrator Notice:</strong> Ensure you store downloaded catalogs securely. These files contain live client inquiries and contact details sourced directly from web visitors.
                </div>
              </div>
            )}

            {/* Tab view: quicklinks (Pages & Dropdowns manager) */}
            {adminPropertiesTab === 'quicklinks' && (
              <div className="space-y-8">
                
                {/* Intro banner */}
                <div className="bg-gradient-to-r from-emerald-900 to-slate-900 rounded-2xl border border-emerald-800 p-6 sm:p-8 text-white shadow-md relative overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="relative z-10">
                    <span className="bg-gold-500 text-emerald-950 font-extrabold text-[9px] uppercase tracking-wider px-2.5 py-1 rounded-md">
                      CMS Engine
                    </span>
                    <h3 className="font-display font-extrabold text-lg mt-3 uppercase tracking-wider">
                      🔗 Pages & Dropdown Navigation Studio
                    </h3>
                    <p className="text-gray-300 text-xs mt-2 max-w-2xl leading-relaxed">
                      Configure dynamic content pages and nested dropdown lists. Changes are synchronized instantly with the cloud storage database and populate the header navbar and mobile menu for all visitors.
                    </p>
                  </div>
                  <div className="absolute right-0 top-0 bottom-0 opacity-10 flex items-center justify-center p-8 pointer-events-none animate-pulse">
                    <Layers className="w-48 h-48 text-white" />
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  
                  {/* Left Column: Editable Pages */}
                  <div className="space-y-8">
                    
                    {/* Services Page Editor */}
                    <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                      <div className="border-b border-gray-100 pb-3 mb-4 flex items-center justify-between">
                        <div>
                          <h4 className="font-display font-bold text-xs text-emerald-950 uppercase tracking-wider">
                            🛠️ Services Page Content
                          </h4>
                          <p className="text-gray-400 text-[10px] mt-0.5">Edit content displayed under the main Services tab</p>
                        </div>
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wide mb-2">
                          Page Body Content (Plain Text with double linebreaks)
                        </label>
                        <textarea
                          rows={6}
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-xs focus:ring-2 focus:ring-emerald-900 focus:bg-white outline-none font-mono"
                          value={settings.servicesContent || ""}
                          onChange={(e) => setSettings({ ...settings, servicesContent: e.target.value })}
                          placeholder="Write services page content..."
                        />
                        <button
                          onClick={() => handleSaveServicesContent(settings.servicesContent || "")}
                          className="mt-3 bg-emerald-900 hover:bg-emerald-950 text-white font-bold py-2 px-4 rounded-xl text-xs uppercase tracking-wider transition-colors flex items-center gap-1.5 cursor-pointer"
                        >
                          Save Services Content
                        </button>
                      </div>
                    </div>

                    {/* Property Management Editor */}
                    <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                      <div className="border-b border-gray-100 pb-3 mb-4 flex items-center justify-between">
                        <div>
                          <h4 className="font-display font-bold text-xs text-emerald-950 uppercase tracking-wider">
                            🏢 Property Management Breakdown Page
                          </h4>
                          <p className="text-gray-400 text-[10px] mt-0.5">Edit the Property Management Breakdown content</p>
                        </div>
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wide mb-2">
                          Page Body Content (Plain Text with double linebreaks)
                        </label>
                        <textarea
                          rows={6}
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-xs focus:ring-2 focus:ring-emerald-900 focus:bg-white outline-none font-mono"
                          value={settings.propertyManagementContent || ""}
                          onChange={(e) => setSettings({ ...settings, propertyManagementContent: e.target.value })}
                          placeholder="Write property management content..."
                        />
                        <button
                          onClick={() => handleSaveManagementContent(settings.propertyManagementContent || "")}
                          className="mt-3 bg-emerald-900 hover:bg-emerald-950 text-white font-bold py-2 px-4 rounded-xl text-xs uppercase tracking-wider transition-colors flex items-center gap-1.5 cursor-pointer"
                        >
                          Save Management Content
                        </button>
                      </div>
                    </div>

                    {/* Custom Content Pages Builder */}
                    <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-6">
                      <div className="border-b border-gray-100 pb-3">
                        <h4 className="font-display font-bold text-xs text-emerald-950 uppercase tracking-wider">
                          📄 Custom Rich Content Pages
                        </h4>
                        <p className="text-gray-400 text-[10px] mt-0.5">Create fully independent new pages for guidebooks, checklists, or news</p>
                      </div>

                      {/* Add page form */}
                      {!editingPageId ? (
                        <form onSubmit={handleAddCustomPage} className="space-y-3 bg-gray-50 p-4 rounded-xl border border-gray-100 animate-in zoom-in-95 duration-150">
                          <span className="font-display font-extrabold text-[10px] text-emerald-900 uppercase tracking-wider block">
                            ➕ Create New Custom Page
                          </span>
                          <div>
                            <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Page Title</label>
                            <input
                              type="text"
                              className="w-full bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-xs focus:ring-2 focus:ring-emerald-900 outline-none"
                              value={newPageTitle}
                              onChange={(e) => {
                                setNewPageTitle(e.target.value);
                                if (!newPageSlug) {
                                  setNewPageSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-"));
                                }
                              }}
                              placeholder="e.g. Land Inspection Guide"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">URL Slug (lowercase, unique)</label>
                            <input
                              type="text"
                              className="w-full bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-xs focus:ring-2 focus:ring-emerald-900 outline-none font-mono"
                              value={newPageSlug}
                              onChange={(e) => setNewPageSlug(e.target.value)}
                              placeholder="e.g. land-inspection-guide"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Page Content (Plain Text with linebreaks)</label>
                            <textarea
                              rows={4}
                              className="w-full bg-white border border-gray-200 rounded-lg p-2.5 text-xs focus:ring-2 focus:ring-emerald-900 outline-none font-mono"
                              value={newPageContent}
                              onChange={(e) => setNewPageContent(e.target.value)}
                              placeholder="Write your custom page content here..."
                            />
                          </div>
                          <button
                            type="submit"
                            className="w-full bg-emerald-900 hover:bg-emerald-950 text-white font-bold py-2 rounded-xl text-xs uppercase tracking-wider transition-colors cursor-pointer"
                          >
                            Create Custom Page
                          </button>
                        </form>
                      ) : (
                        <form onSubmit={handleUpdateCustomPage} className="space-y-3 bg-amber-50/70 p-4 rounded-xl border border-amber-200 animate-in zoom-in-95 duration-150">
                          <span className="font-display font-extrabold text-[10px] text-amber-950 uppercase tracking-wider block">
                            📝 Edit Custom Page
                          </span>
                          <div>
                            <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Page Title</label>
                            <input
                              type="text"
                              className="w-full bg-white border border-amber-200 rounded-lg px-3 py-1.5 text-xs focus:ring-2 focus:ring-amber-500 outline-none"
                              value={editingPageTitle}
                              onChange={(e) => setEditingPageTitle(e.target.value)}
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">URL Slug</label>
                            <input
                              type="text"
                              className="w-full bg-white border border-amber-200 rounded-lg px-3 py-1.5 text-xs focus:ring-2 focus:ring-amber-500 outline-none font-mono"
                              value={editingPageSlug}
                              onChange={(e) => setEditingPageSlug(e.target.value)}
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Page Content</label>
                            <textarea
                              rows={4}
                              className="w-full bg-white border border-amber-200 rounded-lg p-2.5 text-xs focus:ring-2 focus:ring-amber-500 outline-none font-mono"
                              value={editingPageContent}
                              onChange={(e) => setEditingPageContent(e.target.value)}
                            />
                          </div>
                          <div className="flex gap-2">
                            <button
                              type="submit"
                              className="flex-1 bg-amber-600 hover:bg-amber-700 text-white font-bold py-2 rounded-xl text-xs uppercase tracking-wider transition-colors cursor-pointer"
                            >
                              Update Page
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingPageId(null)}
                              className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-2 px-4 rounded-xl text-xs uppercase tracking-wider transition-colors cursor-pointer"
                            >
                              Cancel
                            </button>
                          </div>
                        </form>
                      )}

                      {/* List existing custom pages */}
                      <div className="space-y-3">
                        <span className="block text-[11px] font-bold text-gray-500 uppercase tracking-wide">
                          Active Custom Pages ({ (settings.customPages || []).length })
                        </span>
                        {!(settings.customPages && settings.customPages.length) ? (
                          <p className="text-gray-400 text-xs italic">No custom pages created yet.</p>
                        ) : (
                          <div className="divide-y divide-gray-100">
                            {(settings.customPages || []).map(p => (
                              <div key={p.id} className="py-3 flex items-center justify-between gap-4">
                                <div>
                                  <h5 className="text-xs font-bold text-emerald-950 uppercase">{p.title}</h5>
                                  <div className="text-[10px] text-gray-400 mt-1 font-mono flex items-center gap-1">
                                    <span>Route URL:</span>
                                    <span className="bg-emerald-50 text-emerald-800 px-1.5 py-0.5 rounded">/page/{p.slug}</span>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => {
                                      setEditingPageId(p.id);
                                      setEditingPageTitle(p.title);
                                      setEditingPageSlug(p.slug);
                                      setEditingPageContent(p.content);
                                    }}
                                    className="p-1.5 bg-gray-100 hover:bg-amber-100 text-gray-600 hover:text-amber-900 rounded-lg transition-colors cursor-pointer"
                                    title="Edit Page Content"
                                  >
                                    <Sparkles className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => setActiveTab(`page-${p.slug}`)}
                                    className="p-1.5 bg-gray-100 hover:bg-emerald-100 text-gray-600 hover:text-emerald-900 rounded-lg transition-colors cursor-pointer"
                                    title="Preview Page"
                                  >
                                    <Eye className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteCustomPage(p.id)}
                                    className="p-1.5 bg-gray-100 hover:bg-red-100 text-gray-600 hover:text-red-900 rounded-lg transition-colors cursor-pointer"
                                    title="Delete Page"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                  </div>

                  {/* Right Column: Custom Dropdown Menus */}
                  <div className="space-y-8">
                    
                    <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-6">
                      <div className="border-b border-gray-100 pb-3">
                        <h4 className="font-display font-bold text-xs text-emerald-950 uppercase tracking-wider">
                          🗂️ Dropdown Navigation Menu Builder
                        </h4>
                        <p className="text-gray-400 text-[10px] mt-0.5">Add, group, and order custom clickable links in top & mobile drawers</p>
                      </div>

                      {/* Form to add new dropdown */}
                      <form onSubmit={handleAddDropdown} className="flex gap-2 bg-gray-50 p-3 rounded-xl border border-gray-100">
                        <input
                          type="text"
                          className="flex-1 bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-xs focus:ring-2 focus:ring-emerald-900 outline-none"
                          value={newDropdownTitle}
                          onChange={(e) => setNewDropdownTitle(e.target.value)}
                          placeholder="e.g. Tenant Portal Options"
                        />
                        <button
                          type="submit"
                          className="bg-emerald-900 hover:bg-emerald-950 text-white font-bold py-1.5 px-4 rounded-lg text-xs uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-1 shrink-0"
                        >
                          <Plus className="w-3.5 h-3.5" /> Dropdown
                        </button>
                      </form>

                      {/* Dropdown list and link config */}
                      <div className="space-y-6">
                        <span className="block text-[11px] font-bold text-gray-500 uppercase tracking-wide">
                          Active Dropdowns ({ (settings.customDropdowns || []).length })
                        </span>
                        
                        {!(settings.customDropdowns && settings.customDropdowns.length) ? (
                          <p className="text-gray-400 text-xs italic">No custom dropdowns created yet.</p>
                        ) : (
                          <div className="space-y-4">
                            {(settings.customDropdowns || []).map(drop => (
                              <div key={drop.id} className="bg-gray-50/50 rounded-xl border border-gray-100 p-4 space-y-3">
                                <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                                  <h5 className="font-display font-bold text-xs text-emerald-950 uppercase">
                                    📂 {drop.title}
                                  </h5>
                                  <button
                                    onClick={() => handleDeleteDropdown(drop.id)}
                                    className="text-[10px] font-bold text-red-600 hover:text-red-800 transition-colors cursor-pointer flex items-center gap-0.5"
                                  >
                                    <Trash2 className="w-3 h-3" /> Delete Menu
                                  </button>
                                </div>

                                {/* Link items inside dropdown */}
                                <div className="space-y-1.5">
                                  {!(drop.links && drop.links.length) ? (
                                    <p className="text-gray-400 text-[10px] italic">No links added to this dropdown yet.</p>
                                  ) : (
                                    <div className="space-y-1.5">
                                      {drop.links.map((link, lidx) => (
                                        <div key={lidx} className="flex items-center justify-between bg-white px-2.5 py-1.5 rounded-lg border border-gray-100 text-xs">
                                          <div>
                                            <span className="font-bold text-emerald-950 uppercase tracking-wide text-[11px]">{link.label}</span>
                                            <span className="text-[10px] text-gray-400 ml-2 font-mono">({link.url})</span>
                                          </div>
                                          <button
                                            onClick={() => handleDeleteLinkFromDropdown(drop.id, lidx)}
                                            className="text-gray-400 hover:text-red-600 cursor-pointer"
                                            title="Remove link"
                                          >
                                            <Trash2 className="w-3.5 h-3.5" />
                                          </button>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>

                                {/* Form to add link inline */}
                                <div className="pt-2 border-t border-dashed border-gray-200 grid grid-cols-1 sm:grid-cols-2 gap-2">
                                  <div>
                                    <input
                                      type="text"
                                      className="w-full bg-white border border-gray-200 rounded-lg px-2.5 py-1 text-[11px] focus:ring-1 focus:ring-emerald-900 outline-none"
                                      value={newLinkLabels[drop.id] || ""}
                                      onChange={(e) => setNewLinkLabels({ ...newLinkLabels, [drop.id]: e.target.value })}
                                      placeholder="Link Label (e.g. Land Guide)"
                                    />
                                  </div>
                                  <div className="flex gap-1.5">
                                    <select
                                      className="flex-1 bg-white border border-gray-200 rounded-lg px-1 py-1 text-[11px] focus:ring-1 focus:ring-emerald-900 outline-none font-mono"
                                      value={newLinkUrls[drop.id] || ""}
                                      onChange={(e) => setNewLinkUrls({ ...newLinkUrls, [drop.id]: e.target.value })}
                                    >
                                      <option value="">-- Destination URL --</option>
                                      <option value="/services">/services (Our Services)</option>
                                      <option value="/management">/management (Management)</option>
                                      <option value="/properties">/properties (Rent/Let Listings)</option>
                                      {(settings.customPages || []).map(cp => (
                                        <option key={cp.id} value={`/page/${cp.slug}`}>/page/{cp.slug} ({cp.title})</option>
                                      ))}
                                    </select>
                                    <button
                                      type="button"
                                      onClick={() => handleAddLinkToDropdown(drop.id)}
                                      className="bg-emerald-900 hover:bg-emerald-950 text-white font-bold px-2.5 rounded-lg text-xs transition-colors cursor-pointer"
                                    >
                                      Add
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                  </div>

                </div>

              </div>
            )}

          </div>
        )}

      </main>

      {/* ================= RENT & YIELD ADVISOR CALCULATOR COMPONENT ================= */}
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 mt-12 border-t border-gray-200/60">
        <RentAdvisorCalculator />
      </section>

      {/* ================= DYNAMIC SELECTED PROPERTY DETAIL MODAL ================= */}
      {selectedProperty && (
        <div className="fixed inset-0 bg-emerald-950/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-4xl w-full border border-gray-100 shadow-2xl overflow-hidden flex flex-col md:flex-row h-[90vh] max-h-[700px] animate-in zoom-in duration-200">
            
            {/* Gallery Left */}
            <div className="w-full md:w-1/2 relative bg-emerald-950 h-80 md:h-full flex items-center justify-center">
              <img 
                src={selectedProperty.images[activeImageIndex] || "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80"} 
                alt={selectedProperty.title} 
                className="w-full h-full object-cover" 
              />
              
              {/* Image Type Badge */}
              <div className="absolute top-4 left-4 bg-emerald-900 text-white text-[9px] uppercase tracking-wider font-extrabold px-3 py-1 rounded-md border border-gold-500/20">
                {selectedProperty.propertyType}
              </div>
              
              {selectedProperty.isAiVerified && (
                <div className="absolute top-4 right-4 bg-gold-500 text-emerald-950 text-[10px] font-extrabold px-3 py-1 rounded-md flex items-center gap-1.5 shadow">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-950 fill-emerald-950 animate-spin" /> AI Validated Specs
                </div>
              )}

              {/* Prev / Next navigation buttons */}
              {selectedProperty.images && selectedProperty.images.length > 1 && (
                <>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveImageIndex((prev) => (prev === 0 ? selectedProperty.images.length - 1 : prev - 1));
                    }}
                    className="absolute left-3 top-1/2 -translate-y-1/2 bg-emerald-950/80 hover:bg-emerald-900 hover:scale-105 text-white p-2 rounded-full border border-gold-500/20 backdrop-blur-sm transition-all focus:outline-none focus:ring-2 focus:ring-gold-500 z-10 cursor-pointer"
                    title="Previous Image"
                  >
                    <ChevronLeft className="w-4 h-4 text-gold-500" />
                  </button>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveImageIndex((prev) => (prev === selectedProperty.images.length - 1 ? 0 : prev + 1));
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 bg-emerald-950/80 hover:bg-emerald-900 hover:scale-105 text-white p-2 rounded-full border border-gold-500/20 backdrop-blur-sm transition-all focus:outline-none focus:ring-2 focus:ring-gold-500 z-10 cursor-pointer"
                    title="Next Image"
                  >
                    <ChevronRight className="w-4 h-4 text-gold-500" />
                  </button>
                  
                  {/* Image counter indicator */}
                  <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-emerald-950/80 text-[10px] text-white px-2 py-1 rounded-md font-mono pointer-events-none z-10">
                    {activeImageIndex + 1} / {selectedProperty.images.length}
                  </div>
                </>
              )}

              {/* Interactive sub images indicators */}
              {selectedProperty.images && selectedProperty.images.length > 0 && (
                <div className="absolute bottom-4 left-4 right-4 flex gap-2 overflow-x-auto py-1.5 px-2 bg-emerald-950/60 backdrop-blur-md rounded-xl border border-white/10 max-w-[90%] mx-auto scrollbar-thin">
                  {selectedProperty.images.map((img, index) => {
                    const isActive = index === activeImageIndex;
                    return (
                      <button 
                        key={index} 
                        onClick={() => setActiveImageIndex(index)}
                        className={`w-10 h-10 rounded-lg border-2 overflow-hidden shadow transition-all shrink-0 cursor-pointer ${
                          isActive 
                            ? 'border-gold-500 scale-110 shadow-lg' 
                            : 'border-white/30 hover:border-white/80 opacity-70 hover:opacity-100'
                        }`}
                      >
                        <img src={img} alt={`Thumbnail ${index + 1}`} className="w-full h-full object-cover" />
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Specifications Details Right */}
            <div className="flex-1 p-6 sm:p-8 flex flex-col justify-between overflow-y-auto h-full">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[10px] bg-emerald-900/5 text-emerald-900 font-extrabold px-3 py-1 rounded-full uppercase tracking-widest border border-emerald-900/10">
                    For {selectedProperty.type === 'buy' ? 'Sale' : selectedProperty.type === 'rent' ? 'Rent' : selectedProperty.type}
                  </span>
                  <button 
                    onClick={() => setSelectedProperty(null)}
                    className="p-1 text-gray-400 hover:text-gray-600 rounded-lg"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <h2 className="font-display font-extrabold text-lg sm:text-xl text-emerald-950 mb-1.5 leading-tight">{selectedProperty.title}</h2>
                
                <p className="text-[11px] text-gray-500 flex items-center gap-1 mb-4">
                  <MapPin className="w-4 h-4 text-gold-500 shrink-0" /> {selectedProperty.estate}, {selectedProperty.town}, {selectedProperty.county}
                </p>

                <h3 className="text-xl font-extrabold text-emerald-900 mb-4">
                  KES {selectedProperty.price.toLocaleString()}{selectedProperty.type === 'rent' ? '/mo' : ''}
                </h3>

                <p className="text-xs text-gray-600 leading-relaxed mb-6 whitespace-pre-line bg-gray-50 p-4 rounded-2xl border border-gray-100">
                  {selectedProperty.description}
                </p>

                {/* Virtual Property Tour Video (YouTube embed) */}
                {selectedProperty.videoUrl && (
                  <div className="mb-6">
                    <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse inline-block" /> High-Resolution Video Walkthrough Tour
                    </h4>
                    <div className="relative rounded-2xl overflow-hidden border border-gray-100 shadow-md bg-black aspect-video">
                      <iframe 
                        className="absolute inset-0 w-full h-full"
                        src={selectedProperty.videoUrl}
                        title="Property Video Walkthrough"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  </div>
                )}

                {/* Grid layout indicators */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6 text-xs border-b border-gray-100 pb-5">
                  <div className="bg-gray-50 p-3 rounded-xl border border-gray-200/50 text-center">
                    <span className="block text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-0.5">Land Size</span>
                    <span className="font-extrabold text-emerald-950">{selectedProperty.size}</span>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-xl border border-gray-200/50 text-center">
                    <span className="block text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-0.5">Bedrooms</span>
                    <span className="font-extrabold text-emerald-950">{selectedProperty.bedrooms > 0 ? selectedProperty.bedrooms : 'N/A'}</span>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-xl border border-gray-200/50 text-center">
                    <span className="block text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-0.5">Bathrooms</span>
                    <span className="font-extrabold text-emerald-950">{selectedProperty.bathrooms > 0 ? selectedProperty.bathrooms : 'N/A'}</span>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-xl border border-gray-200/50 text-center">
                    <span className="block text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-0.5">Parking</span>
                    <span className="font-extrabold text-emerald-950">{selectedProperty.parking > 0 ? selectedProperty.parking : 'N/A'}</span>
                  </div>
                </div>

                {/* Amenities List */}
                {selectedProperty.amenities && selectedProperty.amenities.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Included Amenities</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedProperty.amenities.map((amenity, idx) => (
                        <span key={idx} className="bg-emerald-900/5 text-emerald-900 text-[10px] font-extrabold px-2.5 py-1 rounded-md border border-emerald-900/10 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-gold-500" /> {amenity}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Agent contact panel footer */}
              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 flex items-center justify-between gap-4 mt-4">
                <div className="flex items-center gap-2.5">
                  <img src={selectedProperty.agent.photo} alt={selectedProperty.agent.name} className="w-10 h-10 rounded-full object-cover border border-emerald-900" />
                  <div>
                    <h4 className="font-display font-extrabold text-xs text-gray-800 leading-tight">{selectedProperty.agent.name}</h4>
                    <p className="text-[10px] text-gray-400">Lead Sourcing Agent</p>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <a 
                    href={`tel:${selectedProperty.agent.phone}`}
                    className="px-3.5 py-2 bg-white hover:bg-gray-100 text-gray-700 border border-gray-200 text-xs font-bold rounded-xl transition-all flex items-center gap-1 shadow-sm"
                  >
                    <Phone className="w-3.5 h-3.5 text-gold-500" /> Call
                  </a>
                  <a 
                    href={getWhatsAppLink(`Hello ${selectedProperty.agent.name}, I am inquiring about the property: ${selectedProperty.title}`)}
                    target="_blank"
                    referrerPolicy="no-referrer"
                    className="px-4 py-2 bg-emerald-900 hover:bg-emerald-950 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1 shadow-md"
                  >
                    WhatsApp Agent
                  </a>
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* ================= PERSISTENT FLOATING ACTIONS & CHATS ================= */}

      {/* Floating Circular WhatsApp Button (Rama Homes style) */}
      <a 
        href={getWhatsAppLink("Hello Unique Merchants, I am inquiring about your vetted properties and plots.")}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 left-6 z-50 w-14 h-14 bg-[#25D366] hover:bg-[#20ba5a] text-white rounded-full flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-all group border border-white/10"
        title="Chat on WhatsApp"
      >
        <span className="absolute inset-0 rounded-full bg-[#25D366] opacity-40 animate-ping"></span>
        <svg className="w-7 h-7 fill-white relative z-10" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M12.012 2c-5.506 0-9.988 4.482-9.988 9.988 0 1.761.459 3.472 1.332 4.981L2 22l5.161-1.353c1.464.798 3.111 1.22 4.84 1.22 5.507 0 9.989-4.483 9.989-9.989A9.99 9.99 0 0012.012 2zm6.183 14.19c-.27.761-1.355 1.391-1.854 1.439-.49.049-.968.232-3.136-.667-2.613-1.083-4.281-3.754-4.412-3.929-.13-.174-1.055-1.401-1.055-2.673 0-1.272.651-1.898.88-2.147.23-.249.501-.311.667-.311h.478c.153 0 .358-.058.555.419.202.49.691 1.684.75 1.807.059.123.1.266.019.429-.082.164-.123.266-.245.41-.122.143-.257.32-.367.429-.122.122-.25.255-.108.5.142.245.632 1.042 1.355 1.684.93.829 1.713 1.085 1.956 1.208.244.123.385.102.528-.061.143-.164.61-.715.773-.959.163-.245.326-.204.544-.122.218.082 1.385.653 1.624.774.239.121.397.182.455.281.058.099.058.572-.213 1.333z" />
        </svg>
      </a>

      {/* Sourcing request floater */}
      <button 
        onClick={() => setIsRequestModalOpen(true)}
        className="fixed bottom-24 right-6 bg-gold-500 hover:bg-gold-600 text-emerald-950 rounded-full py-2.5 px-4 shadow-2xl hover:scale-105 active:scale-95 transition-all text-xs font-extrabold tracking-wider uppercase border border-gold-400/30 flex items-center gap-1.5 z-40 cursor-pointer"
      >
        <Sparkles className="w-4 h-4 text-emerald-950 fill-emerald-950" /> Describe Plot Sourcing
      </button>

      {/* Modals Injections */}
      <PropertyRequestModal 
        isOpen={isRequestModalOpen} 
        onClose={() => setIsRequestModalOpen(false)} 
        onSuccess={() => syncPlatformData()}
        leadBrokerName={settings.leadBrokerName}
      />

      <AddPropertyModal 
        isOpen={isAddPropertyModalOpen} 
        onClose={() => setIsAddPropertyModalOpen(false)} 
        onSuccess={() => syncPlatformData()}
        leadBrokerName={settings.leadBrokerName}
        leadBrokerPhone={settings.leadBrokerPhone}
        leadBrokerEmail={settings.leadBrokerEmail}
        leadBrokerPhoto={settings.leadBrokerPhoto}
      />

      {showLoginModal && (
        <div className="fixed inset-0 bg-emerald-950/80 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-sm w-full border border-gray-100 shadow-2xl overflow-hidden animate-in zoom-in duration-200">
            <div className="relative p-6 border-b border-gray-100 flex flex-col items-center text-center">
              <button 
                onClick={() => {
                  setShowLoginModal(false);
                  setLoginError('');
                  setLoginPasscode('');
                }}
                className="absolute top-4 right-4 w-7 h-7 text-gray-400 hover:text-emerald-900 rounded-full flex items-center justify-center text-lg font-bold"
              >
                ×
              </button>
              <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-900 flex items-center justify-center mb-3">
                <ShieldCheck className="w-6 h-6 text-emerald-900" />
              </div>
              <h3 className="font-display font-extrabold text-sm text-emerald-950 uppercase tracking-wider">
                Administrator Authentication
              </h3>
              <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-widest font-semibold">
                Unique Merchants Secure Portal
              </p>
            </div>
            <form onSubmit={handleLoginSubmit} className="p-6 flex flex-col gap-4">
              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 block text-left">
                  Admin Passcode
                </label>
                <input 
                  type="text" 
                  style={{ WebkitTextSecurity: 'disc' } as React.CSSProperties}
                  required 
                  value={loginPasscode}
                  onChange={(e) => setLoginPasscode(e.target.value)}
                  placeholder="Enter passcode" 
                  className="w-full bg-gray-50 border border-gray-200 px-3 py-2.5 rounded-xl text-xs text-center font-bold tracking-widest focus:outline-none focus:ring-1 focus:ring-emerald-900" 
                  autoFocus
                  autoComplete="new-password"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck={false}
                />
              </div>

              {loginError && (
                <div className="text-[10px] bg-red-50 text-red-600 px-3 py-2 rounded-lg font-semibold text-center border border-red-100">
                  {loginError}
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-emerald-900 hover:bg-emerald-950 text-white font-bold py-3 rounded-xl text-xs uppercase tracking-wider transition-colors shadow-lg shadow-emerald-900/10 cursor-pointer"
              >
                Unlock Dashboard
              </button>
              
              <div className="text-[10px] text-gray-400 text-center leading-relaxed">
                <p><span className="font-bold text-gray-600"></span><span className="font-bold text-gray-600"></span></p>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer className="bg-emerald-950 text-white mt-20 border-t border-emerald-900">
        {/* Social Community Feeds Grid */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-8 border-b border-emerald-900/60">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div>
              <h3 className="font-display font-extrabold text-sm uppercase tracking-wider text-gold-500">
                {settings.socialMediaNotLive ? "📲 Official Social Community Hub" : "📲 Live Social Community Hub"}
              </h3>
              <p className="text-gray-400 text-xs mt-1">
                Real-time updates, client handovers, and vetted property tours straight from our active social networks.
              </p>
            </div>
            <div className="flex items-center gap-3">
              {settings.socialMediaNotLive ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Official Channels
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20 animate-pulse">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping"></span> Live Sourcing Feeds
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* COLUMN 1: INSTAGRAM MEDIA FEED */}
            <div className="bg-emerald-900/20 rounded-2xl border border-emerald-900/40 p-5 sm:p-6 flex flex-col justify-between h-[520px]">
              <div>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 pb-4 border-b border-emerald-900/40">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-yellow-500 via-pink-500 to-purple-600 p-[1.5px]">
                      <div className="w-full h-full rounded-full bg-emerald-950 flex items-center justify-center">
                        <Instagram className="w-3.5 h-3.5 text-white" />
                      </div>
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white tracking-wide">@uniquemerchants</h4>
                      <p className="text-[9px] text-gray-400">
                        {instagramFollowers.toLocaleString()} followers • Live Grid
                      </p>
                    </div>
                  </div>
                  <span className="text-[9px] font-bold uppercase tracking-widest text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-900/40">
                    Latest Posts
                  </span>
                </div>

                {/* Instagram Feed Grid */}
                <div className="grid grid-cols-2 gap-3">
                  {(settings.instagramImages || [
                    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=300&q=80",
                    "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=300&q=80",
                    "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=300&q=80",
                    "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=300&q=80"
                  ]).map((imgUrl, i) => {
                    const postDetails = [
                      { likes: "242", comments: "15", tag: "Golden Ridge Estate" },
                      { likes: "185", comments: "9", tag: "Juja Plain Prime" },
                      { likes: "312", comments: "24", tag: "University View Apt" },
                      { likes: "420", comments: "37", tag: "Ready Title Deeds!" }
                    ];
                    const details = postDetails[i] || { likes: "120", comments: "5", tag: "Verified Listing" };
                    return (
                      <a 
                        key={i} 
                        href={settings.instagram || "https://www.instagram.com/uniquemerchants/"}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group relative aspect-square rounded-xl overflow-hidden border border-emerald-900/30 cursor-pointer block"
                      >
                        <img
                          src={imgUrl}
                          alt={details.tag}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        {/* Hover Stats Overlay */}
                        <div className="absolute inset-0 bg-emerald-950/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center gap-1.5 p-1 text-center">
                          <span className="text-[9px] font-extrabold uppercase tracking-wider text-gold-500 px-1.5 py-0.5 bg-emerald-900/80 rounded">
                            {details.tag}
                          </span>
                          <div className="flex items-center gap-2 text-[10px] font-bold text-white">
                            <span className="flex items-center gap-0.5">
                              <Heart className="w-3 h-3 fill-rose-500 text-rose-500" /> {details.likes}
                            </span>
                            <span className="flex items-center gap-0.5">
                              <MessageSquare className="w-3 h-3 fill-sky-400 text-sky-400" /> {details.comments}
                            </span>
                          </div>
                        </div>
                      </a>
                    );
                  })}
                </div>
              </div>

              <div className="border-t border-emerald-900/40 pt-4 mt-auto">
                <a
                  href="https://www.instagram.com/uniquemerchants/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider bg-gold-500 hover:bg-gold-600 text-emerald-950 transition-all shadow-md cursor-pointer font-extrabold"
                >
                  <Instagram className="w-4 h-4 text-emerald-950" />
                  Follow on Instagram
                </a>
              </div>
            </div>

            {/* COLUMN 2: REAL FACEBOOK TIMELINE WIDGET */}
            <div className="bg-emerald-900/20 rounded-2xl border border-emerald-900/40 p-5 sm:p-6 flex flex-col justify-between h-[520px]">
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-emerald-900/40 mb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white">
                      <Facebook className="w-4 h-4 fill-white text-white" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1">
                        <h4 className="text-xs font-extrabold text-white">Unique Merchants</h4>
                        <span className="w-3.5 h-3.5 rounded-full bg-blue-500 flex items-center justify-center" title="Verified page">
                          <svg className="w-2 h-2 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        </span>
                      </div>
                      <p className="text-[9px] text-gray-400">Live Feed • 🌐 Public</p>
                    </div>
                  </div>
                  <span className="text-[9px] font-bold uppercase tracking-widest text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-900/40 animate-pulse">
                    Real-Time Feed
                  </span>
                </div>

                {/* Facebook Page Plugin Live Timeline Embed */}
                <div className="w-full h-[320px] rounded-xl overflow-hidden bg-black/10 border border-emerald-900/20 relative">
                  <iframe 
                    src="https://www.facebook.com/plugins/page.php?href=https%3A%2F%2Fwww.facebook.com%2Funiquemerchants&tabs=timeline&width=340&height=320&small_header=true&adapt_container_width=true&hide_cover=false&show_facepile=true" 
                    width="100%" 
                    height="100%" 
                    style={{ border: 'none', overflow: 'hidden' }} 
                    scrolling="no" 
                    frameBorder="0" 
                    allowFullScreen={true} 
                    allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                    className="w-full h-full rounded-xl"
                    title="Unique Merchants Live Facebook Feed"
                  />
                </div>
              </div>

              {/* Action area linking to direct live page */}
              <div className="border-t border-emerald-900/40 pt-4 mt-auto">
                <a 
                  href="https://www.facebook.com/uniquemerchants"
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider bg-gold-500 hover:bg-gold-600 text-emerald-950 transition-all shadow-md cursor-pointer font-extrabold"
                >
                  <Facebook className="w-4 h-4 fill-emerald-950 text-emerald-950" />
                  Visit Facebook Page
                </a>
              </div>
            </div>

            {/* COLUMN 3: YOUTUBE PROPERTY TOURS */}
            <div className="bg-emerald-900/20 rounded-2xl border border-emerald-900/40 p-5 sm:p-6 flex flex-col justify-between h-[520px]">
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-emerald-900/40 mb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center text-white">
                      <Youtube className="w-4 h-4 fill-white text-white" />
                    </div>
                    <div>
                      <h4 className="text-xs font-extrabold text-white">Property Videos</h4>
                      <p className="text-[9px] text-gray-400">@uniquemerchants • Walkthroughs</p>
                    </div>
                  </div>
                  <span className="text-[9px] font-bold uppercase tracking-widest text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-900/40 animate-pulse">
                    HD Tours
                  </span>
                </div>

                {/* Property Walkthrough list */}
                <div className="space-y-3 max-h-[320px] overflow-y-auto scrollbar-thin pr-1">
                  {(settings.youtubeVideos || []).map((video, idx) => (
                    <a 
                      key={video.id || idx}
                      href={video.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex gap-3 bg-emerald-950/60 hover:bg-emerald-950/90 p-2 rounded-xl border border-emerald-900/30 transition-all group block text-left"
                    >
                      <div className="relative w-20 h-14 rounded-lg overflow-hidden shrink-0 border border-white/10">
                        <img 
                          src={video.thumbnail} 
                          alt={video.title} 
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                          <div className="w-6 h-6 rounded-full bg-red-600 flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform">
                            <Play className="w-2.5 h-2.5 fill-white text-white ml-0.5" />
                          </div>
                        </div>
                        <span className="absolute bottom-0.5 right-0.5 bg-black/80 text-[8px] font-mono text-white px-1 py-0.2 rounded font-extrabold">
                          {video.duration}
                        </span>
                      </div>
                      <div className="flex flex-col justify-center min-w-0">
                        <h5 className="text-[10px] font-bold text-white line-clamp-1 group-hover:text-gold-400 transition-colors">
                          {video.title}
                        </h5>
                        <p className="text-[9px] text-gray-400 line-clamp-2 mt-0.5 leading-snug">
                          {video.desc}
                        </p>
                      </div>
                    </a>
                  ))}
                </div>
              </div>

              {/* Action area linking to direct live channel */}
              <div className="border-t border-emerald-900/40 pt-4 mt-auto">
                <a 
                  href={settings.youtube || "https://youtube.com/@uniquemerchants_ke"}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider bg-gold-500 hover:bg-gold-600 text-emerald-950 transition-all shadow-md cursor-pointer font-extrabold"
                >
                  <Youtube className="w-4 h-4 fill-emerald-950 text-emerald-950" />
                  Watch on YouTube
                </a>
              </div>
            </div>

          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
          
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              {settings?.logo && (settings.logo.startsWith('http') || settings.logo.startsWith('/')) ? (
                <div className="relative w-12 h-8 rounded-lg overflow-hidden flex items-center justify-center bg-white/10 p-0.5 border border-white/20">
                  <img 
                    src={settings.logo} 
                    alt={settings?.name || "Unique Merchants"} 
                    referrerPolicy="no-referrer" 
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
              ) : (
                <div className="relative w-12 h-8 bg-gold-500 rounded-[50%/50%] flex items-center justify-center border border-emerald-900 shadow-sm overflow-hidden px-1">
                  <div className="relative flex items-center justify-center font-display font-black text-[11px] tracking-tight leading-none select-none">
                    {settings?.logo && settings.logo.length > 0 && settings.logo !== '🏛️' ? (
                      <span className="text-emerald-900 font-black text-xs">{settings.logo}</span>
                    ) : (
                      <>
                        {/* Interlocked M and U */}
                        <span className="text-emerald-900 font-extrabold -mr-1">M</span>
                        <span className="text-burgundy-700 font-serif font-black -ml-1 mt-0.5">U</span>
                      </>
                    )}
                  </div>
                </div>
              )}
              <h4 className="font-display font-extrabold uppercase tracking-wide text-sm text-white">
                {(settings?.name || "Unique Merchants").split(' ')[0]} <span className="text-gold-500">{(settings?.name || "Unique Merchants").split(' ').slice(1).join(' ') || 'MERCHANTS'}</span>
              </h4>
            </div>
            <p className="text-[11px] text-gray-400 leading-relaxed">
              Kenya's premium Property & Real Estate platform based in Kenol, Murang'a County. We leverage AI vetting and absolute direct title validations.
            </p>
            {/* Footer Social media buttons */}
            <div className="flex items-center gap-2.5 mt-2">
              <a href={settings.facebook || "https://www.facebook.com/uniquemerchants"} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-emerald-900/40 hover:bg-gold-500 hover:text-emerald-950 flex items-center justify-center text-white border border-emerald-800 transition-all" title="Facebook">
                <Facebook className="w-3.5 h-3.5" />
              </a>
              <a href={settings.instagram || "https://www.instagram.com/uniquemerchants/"} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-emerald-900/40 hover:bg-gold-500 hover:text-emerald-950 flex items-center justify-center text-white border border-emerald-800 transition-all" title="Instagram">
                <Instagram className="w-3.5 h-3.5" />
              </a>
              <a href={settings.youtube || "https://youtube.com"} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-emerald-900/40 hover:bg-gold-500 hover:text-emerald-950 flex items-center justify-center text-white border border-emerald-800 transition-all" title="YouTube">
                <Youtube className="w-3.5 h-3.5" />
              </a>
              <a href={settings.linkedin || "https://linkedin.com"} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-emerald-900/40 hover:bg-gold-500 hover:text-emerald-950 flex items-center justify-center text-white border border-emerald-800 transition-all" title="LinkedIn">
                <Linkedin className="w-3.5 h-3.5" />
              </a>
              <a href={settings.x || "https://twitter.com"} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-emerald-900/40 hover:bg-gold-500 hover:text-emerald-950 flex items-center justify-center text-white border border-emerald-800 font-bold text-[11px] transition-all" title="X (Twitter)">
                𝕏
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-display font-extrabold text-xs uppercase tracking-wider text-gold-500 mb-4">Quick Links</h4>
            <div className="flex flex-col gap-2.5 text-xs text-gray-300">
              <button onClick={() => setActiveTab('properties')} className="text-left hover:text-white transition-colors">Vetted Plots</button>
              <button onClick={() => setActiveTab('management')} className="text-left hover:text-white transition-colors">Property Management</button>
              <button onClick={() => setActiveTab('about')} className="text-left hover:text-white transition-colors">Our Story</button>
              <button onClick={() => setActiveTab('blog')} className="text-left hover:text-white transition-colors">Land Registry Education</button>
            </div>
          </div>

          <div>
            <h4 className="font-display font-extrabold text-xs uppercase tracking-wider text-gold-500 mb-4">Statutory Compliance</h4>
            <div className="flex flex-col gap-2.5 text-[11px] text-gray-400">
              <p>✔ Ready Individual Title Deeds</p>
              <p>✔ Certified Soil Sourcing</p>
              <p>✔ Land Conveyancing Lawyers</p>
              <p>✔ Murang'a Zoning Laws Compliant</p>
            </div>
          </div>

          <div>
            <h4 className="font-display font-extrabold text-xs uppercase tracking-wider text-gold-500 mb-4">Headquarters Contacts</h4>
            <div className="flex flex-col gap-2.5 text-xs text-gray-300">
              <p>{settings.address}</p>
              <p>📞 Phone: {settings.mobile}</p>
              <p>✉ Email: {settings.email}</p>
              <p>🕒 Hrs: {settings.officeHours}</p>
            </div>
          </div>

        </div>

        {/* Legal bar */}
        <div className="border-t border-emerald-900 py-4 text-center text-[10px] text-gray-400">
          <p>© {new Date().getFullYear()} {settings?.name || "Unique Merchants"}. All rights reserved. Powered By <button onClick={() => setShowLoginModal(true)} className="text-gray-400 hover:text-gold-500 underline ml-1 cursor-pointer transition-colors font-semibold">Kathurima Jr</button></p>
        </div>
      </footer>

    </div>
  );
}
