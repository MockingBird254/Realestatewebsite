/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Building, Menu, X, Sparkles, MapPin, 
  User, LayoutDashboard, Heart, Settings, LogOut, PhoneCall,
  Facebook, Instagram, Youtube, Linkedin, ChevronDown, Sun, Moon
} from 'lucide-react';
import { CompanySettings } from '../types';

interface HeaderProps {
  settings: CompanySettings;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  favoritesCount: number;
  isAdminLoggedIn?: boolean;
  onLogout?: () => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
}

export default function Header({ 
  settings, 
  activeTab, 
  setActiveTab, 
  favoritesCount, 
  isAdminLoggedIn = false, 
  onLogout,
  isDarkMode,
  onToggleTheme
}: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [aboutDropdownOpen, setAboutDropdownOpen] = useState(false);
  const [mobileAboutOpen, setMobileAboutOpen] = useState(false);
  const [servicesDropdownOpen, setServicesDropdownOpen] = useState(false);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [mobileDropdownsOpen, setMobileDropdownsOpen] = useState<Record<string, boolean>>({});

  const handleAboutSubClick = (sectionId: string) => {
    setActiveTab('about');
    setTimeout(() => {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 150);
  };

  const isHome = activeTab === 'home';

  return (
    <header className={`w-full z-50 transition-all duration-300 ${isHome ? 'absolute top-0 left-0 bg-gradient-to-b from-black/70 via-black/35 to-transparent border-none' : 'sticky top-0 bg-white/95 backdrop-blur-md border-b border-gray-100'}`}>
      {/* Main Navbar */}
      <div className="w-full px-4 sm:px-8 lg:px-12">
        <div className="flex justify-between h-20 items-center">
          
          {/* Brand Logo */}
          <div 
            onClick={() => setActiveTab('home')} 
            className="flex items-center gap-3 cursor-pointer group"
          >
            {/* Custom Logo mimicking the real logo oval monogram or displaying an image URL */}
            {settings?.logo && (settings.logo.startsWith('http') || settings.logo.startsWith('/')) ? (
              <div className="relative w-14 h-9 rounded-lg overflow-hidden flex items-center justify-center transform group-hover:scale-105 transition-transform bg-white/10 p-0.5 border border-white/20">
                <img 
                  src={settings.logo} 
                  alt={settings?.name || "Unique Merchants"} 
                  referrerPolicy="no-referrer" 
                  className="max-w-full max-h-full object-contain"
                />
              </div>
            ) : (
              <div className={`relative w-14 h-9 bg-gold-500 rounded-[50%/50%] flex items-center justify-center border-2 shadow-sm overflow-hidden transform group-hover:scale-105 transition-transform px-1 ${isHome ? 'border-white' : 'border-emerald-900'}`}>
                <div className="relative flex items-center justify-center font-display font-black text-[13px] tracking-tight leading-none select-none">
                  {settings?.logo && settings.logo.length > 0 && settings.logo !== '🏛️' ? (
                    <span className="text-emerald-900 font-black text-sm">{settings.logo}</span>
                  ) : (
                    <>
                      {/* Interlocked M and U */}
                      <span className="text-emerald-900 font-extrabold -mr-1">M</span>
                      <span className="text-burgundy-700 font-serif font-black -ml-1 mt-1">U</span>
                    </>
                  )}
                </div>
              </div>
            )}
            <div>
              <h1 className={`font-display font-extrabold text-base leading-none tracking-tight uppercase ${isHome ? 'text-white' : 'text-emerald-900'}`}>
                {(settings?.name || "Unique Merchants").split(' ')[0]} <span className={isHome ? 'text-gold-400 font-black' : 'text-burgundy-700 font-black'}>{(settings?.name || "Unique Merchants").split(' ').slice(1).join(' ') || 'MERCHANTS'}</span>
              </h1>
              <p className={`text-[8px] tracking-widest font-semibold uppercase leading-none mt-1 ${isHome ? 'text-gold-300/90' : 'text-emerald-800'}`}>
                Property and Real Estate
              </p>
            </div>
          </div>
 
          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-1">
            <button
              onClick={() => setActiveTab('home')}
              className={`px-3.5 py-2 text-xs font-display font-bold tracking-wide uppercase transition-all duration-200 border-b-2 ${
                isHome 
                  ? 'text-white border-gold-500 font-extrabold' 
                  : activeTab === 'home' 
                    ? 'text-emerald-900 border-gold-500 font-extrabold' 
                    : 'text-gray-500 border-transparent hover:text-emerald-900 hover:border-emerald-900/30'
              }`}
            >
              Home
            </button>
 
            <button
              onClick={() => setActiveTab('properties')}
              className={`px-3.5 py-2 text-xs font-display font-bold tracking-wide uppercase transition-all duration-200 border-b-2 ${
                isHome
                  ? 'text-white/80 border-transparent hover:text-white hover:border-white/30'
                  : activeTab === 'properties'
                    ? 'text-emerald-900 border-gold-500 font-extrabold'
                    : 'text-gray-500 border-transparent hover:text-emerald-900 hover:border-emerald-900/30'
              }`}
            >
              Rent/Let
            </button>

            {/* Services & Property Management Dropdown */}
            <div 
              className="relative"
              onMouseEnter={() => setServicesDropdownOpen(true)}
              onMouseLeave={() => setServicesDropdownOpen(false)}
            >
              <button
                className={`px-3.5 py-2 text-xs font-display font-bold tracking-wide uppercase transition-all duration-200 border-b-2 flex items-center gap-1 cursor-pointer ${
                  isHome
                    ? 'text-white/80 border-transparent hover:text-white hover:border-white/30'
                    : (activeTab === 'services' || activeTab === 'management')
                      ? 'text-emerald-900 border-gold-500 font-extrabold'
                      : 'text-gray-500 border-transparent hover:text-emerald-900 hover:border-emerald-900/30'
                }`}
              >
                Services <ChevronDown className={`w-3 h-3 ${isHome ? 'text-white/70' : 'text-gray-500'}`} />
              </button>
              {servicesDropdownOpen && (
                <div className="absolute left-0 mt-0 w-64 bg-white rounded-xl border border-gray-100 shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                  <div className="px-3.5 py-1.5 border-b border-gray-100 bg-gray-50/50 rounded-t-xl">
                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block">Core Services</span>
                  </div>
                  <div className="py-1">
                    <button
                      onClick={() => {
                        setActiveTab('services');
                        setServicesDropdownOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-xs font-bold uppercase transition-colors ${
                        activeTab === 'services' 
                          ? 'bg-emerald-50 text-emerald-950 font-black' 
                          : 'text-gray-700 hover:bg-emerald-50 hover:text-emerald-950'
                      }`}
                    >
                      Our Services
                    </button>
                    <button
                      onClick={() => {
                        setActiveTab('management');
                        setServicesDropdownOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-xs font-bold uppercase transition-colors ${
                        activeTab === 'management' 
                          ? 'bg-emerald-50 text-emerald-950 font-black' 
                          : 'text-gray-700 hover:bg-emerald-50 hover:text-emerald-950'
                      }`}
                    >
                      Property Management
                    </button>
                  </div>

                  {/* Dynamic Custom Dropdowns configured by Admin (excluding Quick Info) */}
                  {(settings.customDropdowns || [])
                    .filter(drop => drop.title !== 'Quick Info')
                    .map((drop) => (
                      <div key={drop.id} className="border-t border-gray-100">
                        <div className="px-3.5 py-1.5 bg-gray-50/40">
                          <span className="text-[9px] font-bold text-gold-600 uppercase tracking-wider block">
                            {drop.title}
                          </span>
                        </div>
                        <div className="py-1">
                          {drop.links.map((link, lidx) => {
                            const isServices = link.url === '/services' || link.url === 'services';
                            const isManagement = link.url === '/management' || link.url === 'management';
                            const isCustomPage = link.url.startsWith('/page/') || link.url.startsWith('page/');
                            let targetTab = 'home';
                            if (isServices) targetTab = 'services';
                            else if (isManagement) targetTab = 'management';
                            else if (isCustomPage) {
                              const slug = link.url.replace('/page/', '').replace('page/', '');
                              targetTab = `page-${slug}`;
                            } else if (link.url === '/properties' || link.url === 'properties') {
                              targetTab = 'properties';
                            } else if (link.url === '/about' || link.url === 'about') {
                              targetTab = 'about';
                            } else if (link.url === '/contact' || link.url === 'contact') {
                              targetTab = 'contact';
                            }

                            return (
                              <button
                                key={lidx}
                                onClick={() => {
                                  setActiveTab(targetTab);
                                  setServicesDropdownOpen(false);
                                }}
                                className="w-full text-left px-5 py-2 text-xs text-gray-600 hover:bg-emerald-50 hover:text-emerald-950 font-bold uppercase transition-colors"
                              >
                                {link.label}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>

            {/* About Us dropdown */}
            <div 
              className="relative"
              onMouseEnter={() => setAboutDropdownOpen(true)}
              onMouseLeave={() => setAboutDropdownOpen(false)}
            >
              <button
                onClick={() => setActiveTab('about')}
                className={`px-3.5 py-2 text-xs font-display font-bold tracking-wide uppercase transition-all duration-200 border-b-2 flex items-center gap-1 cursor-pointer ${
                  isHome
                    ? 'text-white/80 border-transparent hover:text-white hover:border-white/30'
                    : activeTab === 'about'
                      ? 'text-emerald-900 border-gold-500 font-extrabold'
                      : 'text-gray-500 border-transparent hover:text-emerald-900 hover:border-emerald-900/30'
                }`}
              >
                About Us <ChevronDown className={`w-3 h-3 ${isHome ? 'text-white/70' : 'text-gray-500'}`} />
              </button>
              
              {aboutDropdownOpen && (
                <div className="absolute left-0 mt-0 w-44 bg-white rounded-xl border border-gray-100 shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                  {[
                    { id: 'about-team', label: 'Team' },
                    { id: 'about-core-values', label: 'Core Values' },
                    { id: 'about-vision', label: 'Vision' },
                    { id: 'about-mission', label: 'Mission' },
                    { id: 'about-what-we-do', label: 'What We Do' }
                  ].map((sub) => (
                    <button
                      key={sub.id}
                      onClick={() => handleAboutSubClick(sub.id)}
                      className="w-full text-left px-4 py-2 text-xs text-gray-700 hover:bg-emerald-50 hover:text-emerald-950 font-bold tracking-wide uppercase transition-colors"
                    >
                      {sub.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
 
            <button
              onClick={() => setActiveTab('contact')}
              className={`px-3.5 py-2 text-xs font-display font-bold tracking-wide uppercase transition-all duration-200 border-b-2 ${
                isHome
                  ? 'text-white/80 border-transparent hover:text-white hover:border-white/30'
                  : activeTab === 'contact'
                    ? 'text-emerald-900 border-gold-500 font-extrabold'
                    : 'text-gray-500 border-transparent hover:text-emerald-900 hover:border-emerald-900/30'
              }`}
            >
              Contact
            </button>
          </nav>
 
          {/* Right Action Icons */}
          <div className="hidden sm:flex items-center gap-3">
            {/* Theme Toggle Button */}
            <button
              onClick={onToggleTheme}
              className={`p-2 rounded-full border transition-all cursor-pointer hover:scale-105 active:scale-95 ${
                isHome 
                  ? 'bg-white/10 hover:bg-white/20 border-white/15 text-white hover:text-gold-400' 
                  : 'bg-gray-50 hover:bg-emerald-50 border-gray-100 text-gray-600 hover:text-emerald-900'
              }`}
              title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Favorites Badge */}
            <button 
              onClick={() => setActiveTab('properties')}
              className={`relative p-2 rounded-full border transition-colors group ${
                isHome 
                  ? 'bg-white/10 hover:bg-white/20 border-white/15 text-white hover:text-gold-400' 
                  : 'bg-gray-50 hover:bg-emerald-50 border-gray-100 text-gray-600 hover:text-emerald-900'
              }`}
              title="View saved favorites"
            >
              <Heart className="w-4 h-4" />
              {favoritesCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-gold-500 text-emerald-950 font-display font-extrabold text-[9px] w-4.5 h-4.5 rounded-full flex items-center justify-center shadow animate-bounce">
                  {favoritesCount}
                </span>
              )}
            </button>
 
            {/* Dashboard Navigation */}
            {isAdminLoggedIn && (
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`p-2 rounded-full border transition-all flex items-center gap-1 text-xs font-semibold ${
                  isHome
                    ? 'bg-white/10 text-white hover:bg-white/20 border-white/15'
                    : activeTab === 'dashboard'
                      ? 'bg-emerald-900 text-white border-emerald-900'
                      : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border-gray-200'
                }`}
                title="Access Management Dashboard"
              >
                <LayoutDashboard className="w-4 h-4" />
                <span className="hidden md:inline px-1">Admin Panel</span>
              </button>
            )}
 
            {/* Quick Profile Portal Toggle */}
            {isAdminLoggedIn && (
              <div className="relative">
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs cursor-pointer ${
                    isHome 
                      ? 'bg-white/15 hover:bg-white/25 border border-white/20 text-white' 
                      : 'bg-emerald-900/5 hover:bg-emerald-900/10 border border-emerald-900/10 text-emerald-900'
                  }`}
                >
                  UM
                </button>
                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2.5 w-52 bg-white rounded-xl border border-gray-100 shadow-2xl py-2 z-50 animate-in fade-in duration-200">
                    <div className="px-4 py-2 border-b border-gray-100 mb-1">
                      <p className="text-xs font-bold text-emerald-950">Agent Account</p>
                      <p className="text-[10px] text-gray-400 truncate">agent@uniquemerchants.co.ke</p>
                    </div>
                    <button 
                      onClick={() => { setActiveTab('dashboard'); setProfileDropdownOpen(false); }}
                      className="w-full text-left px-4 py-2 text-xs text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                    >
                      <LayoutDashboard className="w-4 h-4 text-emerald-800" /> Admin Dashboard
                    </button>
                    <button 
                      onClick={() => { setActiveTab('properties'); setProfileDropdownOpen(false); }}
                      className="w-full text-left px-4 py-2 text-xs text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                    >
                      <Heart className="w-4 h-4 text-red-500" /> Saved Properties
                    </button>
                    <hr className="border-gray-100 my-1" />
                    <button 
                      onClick={() => { onLogout?.(); setProfileDropdownOpen(false); }}
                      className="w-full text-left px-4 py-2 text-xs text-red-600 hover:bg-red-50 flex items-center gap-2 font-bold"
                    >
                      <LogOut className="w-4 h-4" /> Logout Admin
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
 
          {/* Mobile Menu Icon */}
          <div className="flex lg:hidden items-center gap-2">
            {isAdminLoggedIn && (
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`p-2 rounded-full border transition-all ${
                  isHome 
                    ? 'bg-white/10 text-white border-white/15' 
                    : activeTab === 'dashboard' 
                      ? 'bg-emerald-900 text-white border-emerald-900' 
                      : 'bg-gray-50 text-gray-700 border-gray-200'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`p-2 rounded-lg transition-colors cursor-pointer ${
                isHome 
                  ? 'bg-white/15 text-white hover:bg-gold-500 hover:text-emerald-950 border border-white/10' 
                  : 'bg-emerald-900 text-white hover:bg-emerald-950'
              }`}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-t border-gray-100 shadow-inner py-3 animate-in slide-in-from-top duration-300 z-50">
          <div className="px-4 space-y-1">
            <button
              onClick={() => {
                setActiveTab('home');
                setMobileMenuOpen(false);
              }}
              className={`w-full text-left px-4 py-2.5 rounded-lg text-xs uppercase tracking-wide font-display font-bold ${activeTab === 'home' ? 'bg-emerald-900 text-white' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              Home
            </button>
            <button
              onClick={() => {
                setActiveTab('properties');
                setMobileMenuOpen(false);
              }}
              className={`w-full text-left px-4 py-2.5 rounded-lg text-xs uppercase tracking-wide font-display font-bold ${activeTab === 'properties' ? 'bg-emerald-900 text-white' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              Rent/Let
            </button>

            {/* Services Collapsible Drawer Menu */}
            <div>
              <button
                onClick={() => setMobileDropdownsOpen({ ...mobileDropdownsOpen, services: !mobileDropdownsOpen.services })}
                className={`w-full text-left px-4 py-2.5 rounded-lg text-xs uppercase tracking-wide font-display font-bold flex justify-between items-center ${(activeTab === 'services' || activeTab === 'management') ? 'bg-emerald-900/5 text-emerald-900' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                <span>Services</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${mobileDropdownsOpen.services ? 'rotate-180' : ''}`} />
              </button>
              {mobileDropdownsOpen.services && (
                <div className="pl-4 pr-2 py-1 space-y-1 bg-gray-50 rounded-lg mt-1">
                  <button
                    onClick={() => {
                      setActiveTab('services');
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 text-xs font-bold uppercase tracking-wider ${activeTab === 'services' ? 'text-emerald-900' : 'text-gray-500 hover:text-emerald-900'}`}
                  >
                    • Our Services
                  </button>
                  <button
                    onClick={() => {
                      setActiveTab('management');
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 text-xs font-bold uppercase tracking-wider ${activeTab === 'management' ? 'text-emerald-900' : 'text-gray-500 hover:text-emerald-900'}`}
                  >
                    • Property Management
                  </button>

                  {/* Other services/custom dropdowns (excluding Quick Info) */}
                  {(settings.customDropdowns || [])
                    .filter(drop => drop.title !== 'Quick Info')
                    .map((drop) => (
                      <div key={drop.id} className="pt-2 border-t border-gray-200 mt-2 space-y-1">
                        <div className="px-3 py-0.5">
                          <span className="text-[9px] font-bold text-gold-600 uppercase tracking-wide">{drop.title}</span>
                        </div>
                        {drop.links.map((link, lidx) => {
                          const isServices = link.url === '/services' || link.url === 'services';
                          const isManagement = link.url === '/management' || link.url === 'management';
                          const isCustomPage = link.url.startsWith('/page/') || link.url.startsWith('page/');
                          let targetTab = 'home';
                          if (isServices) targetTab = 'services';
                          else if (isManagement) targetTab = 'management';
                          else if (isCustomPage) {
                            const slug = link.url.replace('/page/', '').replace('page/', '');
                            targetTab = `page-${slug}`;
                          } else if (link.url === '/properties' || link.url === 'properties') {
                            targetTab = 'properties';
                          } else if (link.url === '/about' || link.url === 'about') {
                            targetTab = 'about';
                          } else if (link.url === '/contact' || link.url === 'contact') {
                            targetTab = 'contact';
                          }

                          return (
                            <button
                              key={lidx}
                              onClick={() => {
                                setActiveTab(targetTab);
                                setMobileMenuOpen(false);
                              }}
                              className="w-full text-left pl-5 pr-2 py-1 text-xs text-gray-500 hover:text-emerald-900 font-medium uppercase tracking-wide"
                            >
                              - {link.label}
                            </button>
                          );
                        })}
                      </div>
                    ))}
                </div>
              )}
            </div>

            {/* About Us (collapsible on mobile) */}
            <div>
              <button
                onClick={() => setMobileAboutOpen(!mobileAboutOpen)}
                className={`w-full text-left px-4 py-2.5 rounded-lg text-xs uppercase tracking-wide font-display font-bold flex justify-between items-center ${activeTab === 'about' ? 'bg-emerald-900/5 text-emerald-900' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                <span>About Us</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${mobileAboutOpen ? 'rotate-180' : ''}`} />
              </button>
              {mobileAboutOpen && (
                <div className="pl-4 pr-2 py-1 space-y-1 bg-gray-50 rounded-lg mt-1">
                  {[
                    { id: 'about-team', label: 'Team' },
                    { id: 'about-core-values', label: 'Core Values' },
                    { id: 'about-vision', label: 'Vision' },
                    { id: 'about-mission', label: 'Mission' },
                    { id: 'about-what-we-do', label: 'What We Do' }
                  ].map((sub) => (
                    <button
                      key={sub.id}
                      onClick={() => {
                        handleAboutSubClick(sub.id);
                        setMobileMenuOpen(false);
                      }}
                      className="w-full text-left px-3 py-1.5 text-xs text-gray-500 hover:text-emerald-900 font-bold uppercase tracking-wider"
                    >
                      • {sub.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={() => {
                setActiveTab('contact');
                setMobileMenuOpen(false);
              }}
              className={`w-full text-left px-4 py-2.5 rounded-lg text-xs uppercase tracking-wide font-display font-bold ${activeTab === 'contact' ? 'bg-emerald-900 text-white' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              Contact
            </button>
            
            <div className="pt-4 border-t border-gray-100 flex flex-col gap-2">
              <button
                onClick={() => {
                  onToggleTheme();
                  setMobileMenuOpen(false);
                }}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-lg text-xs uppercase tracking-wider text-center flex items-center justify-center gap-2"
              >
                {isDarkMode ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4" />}
                {isDarkMode ? "Light Mode" : "Dark Mode"}
              </button>

              {isAdminLoggedIn && (
                <button
                  onClick={() => {
                    setActiveTab('dashboard');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full bg-emerald-900 text-white font-bold py-2 px-4 rounded-lg text-xs uppercase tracking-wider text-center"
                >
                  Admin Dashboard Portal
                </button>
              )}
              <button
                onClick={() => {
                  setActiveTab('properties');
                  setMobileMenuOpen(false);
                }}
                className="w-full bg-gold-500 text-emerald-950 font-bold py-2 px-4 rounded-lg text-xs uppercase tracking-wider text-center"
              >
                Browse Properties ({favoritesCount} Favs)
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
