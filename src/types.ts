/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Property {
  id: string;
  title: string;
  description: string;
  price: number;
  type: 'buy' | 'rent' | 'commercial' | 'land';
  propertyType: string; // e.g., "Maisonette", "Apartment", "Townhouse", "Commercial Space", "Plot"
  county: string;
  town: string;
  estate: string;
  bedrooms: number;
  bathrooms: number;
  parking: number;
  size: string; // e.g., "120 sq m", "0.25 Acres"
  agent: {
    name: string;
    phone: string;
    email: string;
    photo: string;
  };
  isAiVerified: boolean;
  isFeatured: boolean;
  isSponsored: boolean;
  isRecentlyViewed?: boolean;
  images: string[];
  dateListed: string;
  videoUrl?: string;
  virtualTourUrl?: string; // simulation link
  floorPlanUrl?: string;
  coordinates?: {
    lat?: number;
    lng?: number;
  };
}

export interface PropertyRequest {
  id: string;
  name: string;
  email: string;
  phone: string;
  description: string;
  budget: string;
  propertyType: string;
  location: string;
  status: 'pending' | 'matched' | 'contacted';
  dateSubmitted: string;
}

export interface BlogComment {
  id: string;
  author: string;
  text: string;
  date: string;
}

export interface BlogArticle {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  category: string;
  tags: string[];
  author: string;
  date: string;
  readTime: string;
  image: string;
  comments: BlogComment[];
}

export interface CompanySettings {
  name: string;
  logo: string;
  icon: string;
  primaryColor: string;
  secondaryColor: string;
  address: string;
  postalAddress: string;
  telephone: string;
  mobile: string;
  whatsapp: string;
  email: string;
  website: string;
  facebook: string;
  instagram: string;
  linkedin: string;
  youtube: string;
  tiktok: string;
  x: string;
  officeHours: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  about: string;
  mission: string;
  vision: string;
  coreValues: string[];
  terms: string;
  privacy: string;
  burgundyColor?: string;
  adminPasscode?: string;
  socialMediaNotLive?: boolean;
  leadBrokerName?: string;
  leadBrokerPhone?: string;
  leadBrokerEmail?: string;
  leadBrokerPhoto?: string;
  heroSlides?: {
    image: string;
    title?: string;
    highlight?: string;
    subtitle?: string;
    tag?: string;
  }[];
  youtubeVideos?: {
    id: string;
    title: string;
    desc: string;
    duration: string;
    thumbnail: string;
    url: string;
  }[];
  servicesContent?: string;
  propertyManagementContent?: string;
  customPages?: {
    id: string;
    title: string;
    slug: string;
    content: string;
  }[];
  customDropdowns?: {
    id: string;
    title: string;
    links: {
      label: string;
      url: string;
    }[];
  }[];
  instagramImages?: string[];
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  photo: string;
  text: string;
  rating: number;
  successStory: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
}
