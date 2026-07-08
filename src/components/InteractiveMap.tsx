/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  MapPin, School, Landmark, Shield, ShoppingBag, 
  Flame, Crosshair, Map, Navigation, Eye, Phone, Info,
  Sparkles, Coffee, Plane, Library, RefreshCw, PenTool, Check, Trash2
} from 'lucide-react';
import { Property } from '../types';
import { APIProvider, Map as GoogleMap, AdvancedMarker, Pin, useMap } from '@vis.gl/react-google-maps';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const API_KEY =
  process.env.GOOGLE_MAPS_PLATFORM_KEY ||
  (import.meta as any).env?.VITE_GOOGLE_MAPS_PLATFORM_KEY ||
  (globalThis as any).GOOGLE_MAPS_PLATFORM_KEY ||
  '';
const hasValidKey = Boolean(API_KEY) && API_KEY !== 'YOUR_API_KEY' && API_KEY !== '';

const getRealCoordinatesForTown = (town: string) => {
  switch (town.toLowerCase()) {
    case 'kenol': return { lat: -0.9995, lng: 37.1265 };
    case 'murang\'a town':
    case 'muranga': return { lat: -0.7210, lng: 37.1517 };
    case 'makuyu': return { lat: -0.9067, lng: 37.2625 };
    case 'thika': return { lat: -1.0396, lng: 37.0900 };
    case 'juja': return { lat: -1.1028, lng: 37.0144 };
    default: return { lat: -0.9995, lng: 37.1265 };
  }
};

const getRealPropertyCoordinates = (p: Property) => {
  if (p.coordinates && p.coordinates.lat !== undefined && p.coordinates.lng !== undefined) {
    const lat = Number(p.coordinates.lat);
    const lng = Number(p.coordinates.lng);
    if (!isNaN(lat) && !isNaN(lng)) {
      return { lat, lng };
    }
  }
  return getRealCoordinatesForTown(p.town);
};

const createCustomMarkerElement = (price: number, isSelected: boolean) => {
  const formattedPrice = price >= 1000000 
    ? `${(price / 1000000).toFixed(1)}M` 
    : `${price.toLocaleString()}`;
  
  return L.divIcon({
    html: `
      <div class="flex items-center gap-1 p-1 rounded-lg border shadow-lg transform hover:scale-105 transition-all cursor-pointer ${
        isSelected 
          ? 'bg-gold-500 border-emerald-950 text-emerald-950 scale-110 font-bold z-[1000]' 
          : 'bg-emerald-900 border-gold-500 text-white z-[500]'
      }" style="white-space: nowrap; font-family: sans-serif;">
        <svg class="w-3.5 h-3.5 text-white inline-block align-middle" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24" style="width: 14px; height: 14px;">
          <path stroke-linecap="round" stroke-linejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
          <path stroke-linecap="round" stroke-linejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
        </svg>
        <span class="text-[10px] px-0.5 font-semibold inline-block align-middle">
          KES ${formattedPrice}
        </span>
      </div>
    `,
    className: 'custom-leaflet-marker-icon',
    iconSize: [100, 32],
    iconAnchor: [50, 16]
  });
};

function MapUpdater({ selectedProperty }: { selectedProperty: Property | null }) {
  const map = useMap();
  
  useEffect(() => {
    if (!map || !selectedProperty) return;
    const coords = getRealPropertyCoordinates(selectedProperty);
    map.panTo(coords);
    map.setZoom(14);
  }, [map, selectedProperty]);

  return null;
}

interface InteractiveMapProps {
  properties: Property[];
  onSelectProperty: (property: Property) => void;
  selectedProperty: Property | null;
  filters: {
    type: string;
    county: string;
    town: string;
    propertyType: string;
    minPrice: number;
    maxPrice: number;
  };
}

export default function InteractiveMap({ 
  properties, 
  onSelectProperty, 
  selectedProperty,
  filters
}: InteractiveMapProps) {
  const [mapMode, setMapMode] = useState<'street' | 'satellite' | 'heatmap'>('street');
  const [mobileView, setMobileView] = useState<'map' | 'controls'>('map');
  const [showAmenities, setShowAmenities] = useState<string[]>([]);
  const [drawingArea, setDrawingArea] = useState<boolean>(false);
  const [drawnArea, setDrawnArea] = useState<{ x: number; y: number; w: number; h: number } | null>(null);
  const [radiusKm, setRadiusKm] = useState<number>(3);
  const [currentCenter, setCurrentCenter] = useState({ name: "Kenol Town Center", x: 50, y: 50 });
  const [userLocation, setUserLocation] = useState<{ x: number; y: number } | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [hoveredProperty, setHoveredProperty] = useState<Property | null>(null);
  const [directionsActive, setDirectionsActive] = useState<boolean>(false);
  const [directionsStart, setDirectionsStart] = useState<{ x: number; y: number }>({ x: 50, y: 50 });
  const [directionsEnd, setDirectionsEnd] = useState<{ x: number; y: number }>({ x: 50, y: 50 });
  const [directionsMeta, setDirectionsMeta] = useState<{ distance: number; duration: number } | null>(null);

  const mapContainerRef = useRef<HTMLDivElement>(null);

  const leafletMapRef = useRef<L.Map | null>(null);
  const leafletMarkersRef = useRef<L.Marker[]>([]);
  const leafletContainerRef = useRef<HTMLDivElement>(null);
  const activeTileLayerRef = useRef<L.TileLayer | null>(null);

  // Invalidate Leaflet map size on mobile view tab switch and window resize to prevent gray boxes
  useEffect(() => {
    const handleInvalidate = () => {
      if (leafletMapRef.current) {
        leafletMapRef.current.invalidateSize();
      }
    };
    
    // Add resize event listener
    window.addEventListener('resize', handleInvalidate);
    
    // Trigger immediately and after timeouts
    handleInvalidate();
    const t1 = setTimeout(handleInvalidate, 150);
    const t2 = setTimeout(handleInvalidate, 600);
    
    return () => {
      window.removeEventListener('resize', handleInvalidate);
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [mobileView]);

  // Initialize Leaflet Map
  useEffect(() => {
    if (hasValidKey) return;
    if (!leafletContainerRef.current) return;

    // Check if map is already initialized
    if (leafletMapRef.current) return;

    const initialCoords = selectedProperty 
      ? getRealPropertyCoordinates(selectedProperty) 
      : { lat: -0.86, lng: 37.14 }; // Murang'a County Center

    // Constrain map range specifically to Murang'a County area
    const southWest = L.latLng(-1.12, 36.85);
    const northEast = L.latLng(-0.65, 37.35);
    const bounds = L.latLngBounds(southWest, northEast);

    const map = L.map(leafletContainerRef.current, {
      zoomControl: false,
      maxBounds: bounds,
      maxBoundsViscosity: 1.0,
      minZoom: 9,
    }).setView([initialCoords.lat, initialCoords.lng], 11.5);

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    leafletMapRef.current = map;

    return () => {
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
    };
  }, [hasValidKey]);

  // Handle tile layer updates
  useEffect(() => {
    const map = leafletMapRef.current;
    if (!map || hasValidKey) return;

    if (activeTileLayerRef.current) {
      activeTileLayerRef.current.remove();
    }

    let url = 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';
    let attribution = '&copy; OpenStreetMap contributors &copy; CARTO';

    if (mapMode === 'satellite') {
      url = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
      attribution = 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community';
    }

    const tileLayer = L.tileLayer(url, { attribution }).addTo(map);
    activeTileLayerRef.current = tileLayer;
  }, [mapMode, hasValidKey]);

  // Synchronize Leaflet Markers
  useEffect(() => {
    const map = leafletMapRef.current;
    if (!map || hasValidKey) return;

    // Clear existing markers
    leafletMarkersRef.current.forEach(marker => marker.remove());
    leafletMarkersRef.current = [];

    // Add new markers
    properties.forEach(p => {
      const coords = getRealPropertyCoordinates(p);
      const isSelected = selectedProperty?.id === p.id;
      
      const markerIcon = createCustomMarkerElement(p.price, isSelected);
      const marker = L.marker([coords.lat, coords.lng], { icon: markerIcon })
        .addTo(map)
        .on('click', () => {
          onSelectProperty(p);
        })
        .on('mouseover', () => {
          setHoveredProperty(p);
        })
        .on('mouseout', () => {
          setHoveredProperty(null);
        });

      // Bind an elegant visual tooltip that triggers on hover
      const tooltipContent = `
        <div class="flex gap-2.5 p-2 font-sans bg-white text-gray-900 border border-emerald-100 rounded-xl shadow-xl w-60 text-left pointer-events-none" style="white-space: normal;">
          ${p.images && p.images[0] ? `<img src="${p.images[0]}" class="w-16 h-16 object-cover rounded-lg shrink-0 border border-gray-100" referrerpolicy="no-referrer" />` : ''}
          <div class="flex-1 min-w-0">
            <div class="font-extrabold text-[10px] text-emerald-950 truncate leading-tight">${p.title}</div>
            <div class="text-[8px] text-gray-500 truncate mt-0.5">${p.estate}, ${p.town}</div>
            <div class="flex items-center gap-1.5 mt-1">
              <span class="text-[7px] text-emerald-950 font-black uppercase tracking-wider bg-gold-400/80 px-1 rounded-sm">${p.propertyType}</span>
              <span class="text-[7px] text-gray-400 font-bold">${p.size}</span>
            </div>
            <div class="text-[11px] font-black text-emerald-900 mt-1">KES ${p.price >= 1000000 ? `${(p.price / 1000000).toFixed(1)}M` : p.price.toLocaleString()}</div>
          </div>
        </div>
      `;

      marker.bindTooltip(tooltipContent, {
        direction: 'top',
        className: 'custom-property-tooltip',
        offset: [0, -10],
        opacity: 0.98,
      });
        
      leafletMarkersRef.current.push(marker);
    });
  }, [properties, selectedProperty, hasValidKey]);

  // Smooth view syncing when selectedProperty changes
  useEffect(() => {
    const map = leafletMapRef.current;
    if (!map || !selectedProperty || hasValidKey) return;
    const coords = getRealPropertyCoordinates(selectedProperty);
    map.setView([coords.lat, coords.lng], 14, { animate: true });
  }, [selectedProperty, hasValidKey]);

  // Convert GPS Lat/Lng to local map coordinates
  const getPropertyCoordinates = (p: Property) => {
    if (p.coordinates && p.coordinates.lat !== undefined && p.coordinates.lng !== undefined) {
      const lat = Number(p.coordinates.lat);
      const lng = Number(p.coordinates.lng);
      if (!isNaN(lat) && !isNaN(lng)) {
        // Center of map (50, 50) is Kenol interchange: lat -0.9995, lng 37.1265
        const NORTH_LAT = -0.9595;
        const SOUTH_LAT = -1.0395;
        const WEST_LNG = 37.0865;
        const EAST_LNG = 37.1665;
        
        const absoluteLat = lat > 0 ? -lat : lat;
        let x = ((lng - WEST_LNG) / (EAST_LNG - WEST_LNG)) * 100;
        let y = ((absoluteLat - NORTH_LAT) / (SOUTH_LAT - NORTH_LAT)) * 100;
        
        x = Math.max(5, Math.min(95, x));
        y = Math.max(5, Math.min(95, y));
        return { x, y, isCustom: true };
      }
    }
    const coords = getCoordinatesForTown(p.town);
    return { ...coords, isCustom: false };
  };

  // Helper for Haversine distance
  const getHaversineDistance = (lat1: number, lng1: number, lat2: number, lng2: number) => {
    const R = 6371; // km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // in km
  };

  const handleGetDirections = () => {
    if (!selectedProperty) return;
    
    const endCoords = getPropertyCoordinates(selectedProperty);
    
    // Toggle if clicked again on same property
    if (directionsActive && directionsEnd.x === endCoords.x && directionsEnd.y === endCoords.y) {
      setDirectionsActive(false);
      return;
    }
    
    const startCoords = userLocation ? userLocation : { x: 50, y: 50 };
    setDirectionsStart(startCoords);
    setDirectionsEnd(endCoords);
    setDirectionsActive(true);
    
    const gridDist = Math.sqrt(Math.pow(endCoords.x - startCoords.x, 2) + Math.pow(endCoords.y - startCoords.y, 2));
    let distanceKm = gridDist * 0.15;
    
    if (userLocation && selectedProperty.coordinates?.lat && selectedProperty.coordinates?.lng) {
      const userLat = -0.9995;
      const userLng = 37.1265;
      const realDist = getHaversineDistance(userLat, userLng, selectedProperty.coordinates.lat, selectedProperty.coordinates.lng);
      if (realDist > 0) distanceKm = realDist;
    }
    
    distanceKm = Math.round(distanceKm * 10) / 10;
    if (distanceKm < 0.2) distanceKm = 0.2;
    
    const durationMin = Math.round(distanceKm * 2.5);
    setDirectionsMeta({
      distance: distanceKm,
      duration: Math.max(1, durationMin)
    });
  };

  // Murang'a / Kenol Town Simulation Map Layout coordinate mappings
  // Focused and tightly zoomed around Kenol Town Center
  const getCoordinatesForTown = (town: string) => {
    switch (town.toLowerCase()) {
      case 'kenol': return { x: 50, y: 50 };
      case 'murang\'a town':
      case 'muranga': return { x: 44, y: 38 }; // Kenol North / Murang'a Rd
      case 'makuyu': return { x: 58, y: 46 }; // Kenol East / Makuyu Rd
      case 'thika': return { x: 40, y: 62 }; // Kenol South / Thika Rd
      case 'juja': return { x: 45, y: 54 }; // Kabati Estate
      default: return { x: 50, y: 50 };
    }
  };

  // Static landmarks/amenities nearby mapping around the active center
  const mockAmenities = [
    { id: 'sc-1', name: 'Kenol University Campus', type: 'school', x: 46, y: 38 },
    { id: 'sc-2', name: 'Kenol Academy', type: 'school', x: 52, y: 47 },
    { id: 'sc-3', name: 'Kenol Heights High School', type: 'school', x: 42, y: 44 },
    { id: 'hp-1', name: 'Kenol Hospital & Trauma Center', type: 'hospital', x: 48, y: 52 },
    { id: 'hp-2', name: 'Kenol West Clinic', type: 'hospital', x: 43, y: 48 },
    { id: 'sh-1', name: 'Kenol Golden Mall', type: 'shopping', x: 51, y: 51 },
    { id: 'sh-2', name: 'Kenol Plaza Commercial', type: 'shopping', x: 49, y: 49 },
    { id: 'pl-1', name: 'Kenol Police Station', type: 'police', x: 49, y: 46 },
    { id: 'pl-2', name: 'Kenol Traffic Post', type: 'police', x: 51, y: 45 },
    { id: 'fu-1', name: 'Rubis Fuel Kenol Interchange', type: 'fuel', x: 53, y: 53 },
    { id: 'fu-2', name: 'Shell Kenol Bypass', type: 'fuel', x: 48, y: 55 }
  ];

  // Request actual device location if supported & granted
  const handleLocateMe = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          // Simulate user placing on the map grid center
          setUserLocation({ x: 48, y: 54 });
          setCurrentCenter({ name: "Your Location", x: 48, y: 54 });
          // Highlight near Kenol
          const locMarker = document.getElementById("user-location-ping");
          if (locMarker) {
            locMarker.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        },
        () => {
          // Fallback if denied
          setUserLocation({ x: 48, y: 54 });
        }
      );
    } else {
      setUserLocation({ x: 48, y: 54 });
    }
  };

  // Draw Area Handling
  const handleMapMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!drawingArea) return;
    const rect = mapContainerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const clickX = ((e.clientX - rect.left) / rect.width) * 100;
    const clickY = ((e.clientY - rect.top) / rect.height) * 100;
    
    setDrawnArea({ x: clickX, y: clickY, w: 20, h: 20 });
    setDrawingArea(false);
  };

  const toggleAmenity = (type: string) => {
    if (showAmenities.includes(type)) {
      setShowAmenities(showAmenities.filter(t => t !== type));
    } else {
      setShowAmenities([...showAmenities, type]);
    }
  };

  // Pan to property when selected
  useEffect(() => {
    if (selectedProperty) {
      const coords = getPropertyCoordinates(selectedProperty);
      setCurrentCenter({ name: selectedProperty.title, x: coords.x, y: coords.y });
    } else {
      setDirectionsActive(false);
    }
  }, [selectedProperty]);

  // Simulate Map Refreshing on move/zoom
  const triggerRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 800);
  };

  useEffect(() => {
    triggerRefresh();
  }, [radiusKm, mapMode, drawnArea]);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-xl overflow-hidden flex flex-col h-[480px] relative">
      {/* Top Controls Bar */}
      <div className="bg-emerald-900 text-white p-4 flex flex-wrap items-center justify-between gap-3 z-10">
        <div className="flex items-center gap-2">
          <Map className="text-gold-500 w-5 h-5" />
          <h3 className="font-display font-semibold text-base">Interactive Property Map</h3>
          {isRefreshing && (
            <RefreshCw className="w-4 h-4 animate-spin text-gold-400 ml-2" />
          )}
        </div>

        {/* Search Coordinates/Query */}
        <div className="relative w-full sm:w-64">
          <input 
            type="text" 
            placeholder="Search on map (e.g. Kenol)..." 
            className="w-full bg-emerald-950 text-white placeholder-gray-400 text-xs px-3 py-2 pl-8 rounded-lg border border-emerald-800 focus:outline-none focus:border-gold-500"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              const q = e.target.value.toLowerCase();
              if (q.includes("kenol")) setCurrentCenter({ name: "Kenol Town Center", x: 50, y: 50 });
              else if (q.includes("thika")) setCurrentCenter({ name: "Kenol South", x: 40, y: 62 });
              else if (q.includes("juja")) setCurrentCenter({ name: "Kabati Estate", x: 45, y: 54 });
              else if (q.includes("makuyu")) setCurrentCenter({ name: "Kenol East", x: 58, y: 46 });
              else if (q.includes("murang")) setCurrentCenter({ name: "Kenol North", x: 44, y: 38 });
            }}
          />
          <MapPin className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-gray-400" />
        </div>

        {/* Layer Toggles */}
        <div className="flex bg-emerald-950 p-1 rounded-lg border border-emerald-800 text-xs">
          <button 
            className={`px-3 py-1.5 rounded-md font-medium transition-colors ${mapMode === 'street' ? 'bg-gold-500 text-emerald-950' : 'hover:text-gold-500'}`}
            onClick={() => setMapMode('street')}
          >
            Street Map
          </button>
          <button 
            className={`px-3 py-1.5 rounded-md font-medium transition-colors ${mapMode === 'satellite' ? 'bg-gold-500 text-emerald-950' : 'hover:text-gold-500'}`}
            onClick={() => setMapMode('satellite')}
          >
            Satellite View
          </button>
          <button 
            className={`px-3 py-1.5 rounded-md font-medium transition-colors ${mapMode === 'heatmap' ? 'bg-gold-500 text-emerald-950' : 'hover:text-gold-500'}`}
            onClick={() => setMapMode('heatmap')}
          >
            Density Heatmap
          </button>
        </div>
      </div>

      {/* Mobile Tab Selector (Visible only on mobile screen widths) */}
      <div className="flex md:hidden bg-emerald-950 p-1.5 border-b border-emerald-800 shrink-0">
        <button
          type="button"
          onClick={() => setMobileView('map')}
          className={`flex-1 py-2 text-xs font-bold uppercase rounded-lg transition-all cursor-pointer text-center ${
            mobileView === 'map' 
              ? 'bg-gold-500 text-emerald-950 shadow-sm' 
              : 'text-gray-300 hover:text-white'
          }`}
        >
          🗺️ View Map
        </button>
        <button
          type="button"
          onClick={() => setMobileView('controls')}
          className={`flex-1 py-2 text-xs font-bold uppercase rounded-lg transition-all cursor-pointer text-center ${
            mobileView === 'controls' 
              ? 'bg-gold-500 text-emerald-950 shadow-sm' 
              : 'text-gray-300 hover:text-white'
          }`}
        >
          ⚙️ Tools & Filters
        </button>
      </div>

      {/* Main Map Container & Sidebar Split */}
      <div className="flex-1 flex flex-col md:flex-row relative overflow-hidden">
        
        {/* Left Map Controls Sidebar */}
        <div className={`w-full md:w-64 bg-gray-50 border-r border-gray-100 p-4 overflow-y-auto flex-col gap-5 z-10 md:flex ${mobileView === 'controls' ? 'flex flex-1' : 'hidden'}`}>
          
          {/* Live Driving Directions Panel */}
          {directionsActive && selectedProperty && directionsMeta && (
            <div className="bg-emerald-950 text-white p-3.5 rounded-xl border border-emerald-800 shadow-lg flex flex-col gap-2.5 animate-in slide-in-from-top duration-300">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-gold-500 uppercase tracking-wider flex items-center gap-1">
                  <Navigation className="w-3 h-3 transform rotate-45 animate-pulse text-gold-400" /> Live Route Active
                </span>
                <button 
                  onClick={() => setDirectionsActive(false)}
                  className="text-xs hover:text-red-400 text-gray-300 font-bold px-1.5"
                  title="Clear Route"
                >
                  Clear
                </button>
              </div>
              <div>
                <h5 className="font-display font-bold text-xs truncate text-white">{selectedProperty.title}</h5>
                <p className="text-[10px] text-gray-400 mt-0.5">Destination: {selectedProperty.estate}, {selectedProperty.town}</p>
              </div>
              <div className="grid grid-cols-2 gap-2 bg-emerald-900/40 p-2 rounded-lg text-center border border-emerald-800/50">
                <div>
                  <p className="text-[8px] text-gray-400 uppercase font-semibold">Distance</p>
                  <p className="text-sm font-black text-gold-400">{directionsMeta.distance} km</p>
                </div>
                <div>
                  <p className="text-[8px] text-gray-400 uppercase font-semibold">Travel Time</p>
                  <p className="text-sm font-black text-gold-400">{directionsMeta.duration} mins</p>
                </div>
              </div>
              <div className="text-[9px] text-gray-300 space-y-1.5 border-t border-emerald-800/50 pt-2.5">
                <p className="font-bold text-[8px] text-emerald-400 uppercase tracking-wider">Driving Instructions:</p>
                <div className="flex gap-1.5 items-start">
                  <span className="bg-emerald-900 text-gold-500 w-3.5 h-3.5 rounded-full flex items-center justify-center text-[8px] font-bold shrink-0">1</span>
                  <p className="leading-tight">
                    {userLocation ? "Depart from your current GPS position." : "Depart from Kenol Town Interchange Center."}
                  </p>
                </div>
                <div className="flex gap-1.5 items-start">
                  <span className="bg-emerald-900 text-gold-500 w-3.5 h-3.5 rounded-full flex items-center justify-center text-[8px] font-bold shrink-0">2</span>
                  <p className="leading-tight">
                    Follow {selectedProperty.town} highway heading towards {selectedProperty.estate} Estate.
                  </p>
                </div>
                {selectedProperty.coordinates?.lat && (
                  <div className="flex gap-1.5 items-start">
                    <span className="bg-emerald-900 text-gold-500 w-3.5 h-3.5 rounded-full flex items-center justify-center text-[8px] font-bold shrink-0">3</span>
                    <p className="leading-tight text-gold-300 font-semibold">
                      GPS coordinates: {selectedProperty.coordinates.lat.toFixed(4)}, {selectedProperty.coordinates.lng.toFixed(4)}.
                    </p>
                  </div>
                )}
                <div className="flex gap-1.5 items-start">
                  <span className="bg-emerald-900 text-gold-500 w-3.5 h-3.5 rounded-full flex items-center justify-center text-[8px] font-bold shrink-0">{selectedProperty.coordinates?.lat ? 4 : 3}</span>
                  <p className="leading-tight">
                    Arrive at <strong>{selectedProperty.title}</strong> on your left.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Draw / Radius Selector */}
          <div>
            <h4 className="font-display font-semibold text-xs text-emerald-900 uppercase tracking-wider mb-2.5">Custom Search Tools</h4>
            <div className="flex flex-col gap-2">
              <button 
                onClick={() => {
                  setDrawingArea(true);
                  setDrawnArea(null);
                }}
                className={`w-full py-2 px-3 text-xs rounded-lg font-medium flex items-center justify-center gap-2 border transition-all ${drawingArea ? 'bg-emerald-900 text-white border-emerald-900' : 'bg-white border-gray-200 text-gray-700 hover:border-emerald-900 hover:text-emerald-900'}`}
              >
                <PenTool className="w-4 h-4 text-gold-500" />
                {drawingArea ? 'Click & Drag on Map' : 'Draw Custom Area'}
              </button>
              
              {drawnArea && (
                <button 
                  onClick={() => setDrawnArea(null)}
                  className="w-full py-1.5 px-3 text-xs bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors flex items-center justify-center gap-1 font-medium"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Clear Drawn Boundary
                </button>
              )}

              <div className="mt-2.5">
                <div className="flex justify-between text-xs text-gray-600 mb-1">
                  <span>Radius Search:</span>
                  <span className="font-semibold text-emerald-900">{radiusKm} km</span>
                </div>
                <input 
                  type="range" 
                  min="1" 
                  max="15" 
                  value={radiusKm} 
                  onChange={(e) => setRadiusKm(parseInt(e.target.value))}
                  className="w-full accent-emerald-900 cursor-pointer h-1 bg-gray-200 rounded-lg"
                />
                <div className="flex justify-between text-[10px] text-gray-400 mt-1">
                  <span>1km</span>
                  <span>Center: {currentCenter.name}</span>
                  <span>15km</span>
                </div>
              </div>
            </div>
          </div>

          <hr className="border-gray-200" />

          {/* Nearby Amenities Filter */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-display font-semibold text-xs text-emerald-900 uppercase tracking-wider">Map Amenities</h4>
              <span className="text-[10px] text-gold-600 font-semibold uppercase">Filter Live</span>
            </div>
            
            <div className="flex flex-col gap-1.5">
              {[
                { type: 'school', label: 'Schools & Universities', icon: School, color: 'text-blue-500 bg-blue-50' },
                { type: 'hospital', label: 'Hospitals & Medical', icon: Landmark, color: 'text-red-500 bg-red-50' },
                { type: 'shopping', label: 'Shopping Centers', icon: ShoppingBag, color: 'text-amber-500 bg-amber-50' },
                { type: 'police', label: 'Police Stations', icon: Shield, color: 'text-emerald-500 bg-emerald-50' },
                { type: 'fuel', label: 'Fuel Stations', icon: Coffee, color: 'text-indigo-500 bg-indigo-50' }
              ].map(item => {
                const isSelected = showAmenities.includes(item.type);
                return (
                  <button
                    key={item.type}
                    onClick={() => toggleAmenity(item.type)}
                    className={`w-full text-left py-2 px-2.5 rounded-lg text-xs flex items-center justify-between transition-all border ${isSelected ? 'bg-white border-emerald-900 shadow-sm text-emerald-950 font-medium' : 'bg-transparent border-transparent text-gray-600 hover:bg-gray-100'}`}
                  >
                    <div className="flex items-center gap-2">
                      <div className={`p-1 rounded-md ${item.color}`}>
                        <item.icon className="w-3.5 h-3.5" />
                      </div>
                      <span>{item.label}</span>
                    </div>
                    {isSelected && <Check className="w-3.5 h-3.5 text-emerald-900" />}
                  </button>
                );
              })}
            </div>
          </div>

          <hr className="border-gray-200" />

          {/* GPS Location Finder */}
          <div className="mt-auto">
            <button 
              onClick={handleLocateMe}
              className="w-full bg-gold-500 hover:bg-gold-600 text-emerald-950 text-xs py-2 px-3 rounded-lg font-bold flex items-center justify-center gap-1.5 transition-colors shadow-sm"
            >
              <Crosshair className="w-4 h-4" /> Locate My GPS
            </button>
          </div>
        </div>

        {/* Right Map Drawing Field */}
        <div 
          ref={mapContainerRef}
          onClick={hasValidKey ? undefined : handleMapMouseDown}
          className={`flex-1 relative h-full overflow-hidden select-none md:block ${mobileView === 'map' ? 'block' : 'hidden'} ${hasValidKey ? 'cursor-default' : drawingArea ? 'cursor-crosshair' : 'cursor-grab active:cursor-grabbing'}`}
        >
          {hasValidKey ? (
            <APIProvider apiKey={API_KEY} version="weekly">
              <GoogleMap
                defaultCenter={{ lat: -0.86, lng: 37.14 }}
                defaultZoom={11.5}
                restriction={{
                  latLngBounds: {
                    north: -0.65,
                    south: -1.12,
                    east: 37.35,
                    west: 36.85,
                  },
                  strictBounds: false,
                }}
                mapId="DEMO_MAP_ID"
                style={{ width: '100%', height: '100%' }}
                gestureHandling="greedy"
                disableDefaultUI={false}
                mapTypeId={mapMode === 'satellite' ? 'satellite' : 'roadmap'}
                internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
              >
                <MapUpdater selectedProperty={selectedProperty} />
                {properties.map(p => {
                  const realCoords = getRealPropertyCoordinates(p);
                  const isSelected = selectedProperty?.id === p.id;
                  const isHovered = hoveredProperty?.id === p.id;
                  return (
                    <AdvancedMarker 
                      key={p.id} 
                      position={realCoords}
                      onClick={() => onSelectProperty(p)}
                    >
                      <div className="relative">
                        {/* Google Map Style Mini-Toggle Popup Card (Hover or Selected) */}
                        {(isHovered || isSelected) && (
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-60 bg-white rounded-xl border border-gray-100 shadow-2xl overflow-hidden z-50 pointer-events-auto animate-in fade-in zoom-in-95 duration-200">
                            <div className="relative h-20 bg-gray-100">
                              {p.images && p.images[0] && (
                                <img src={p.images[0]} alt={p.title} className="w-full h-full object-cover" referrerpolicy="no-referrer" />
                              )}
                              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                              <span className="absolute bottom-1 left-2 text-[8px] uppercase tracking-wider font-extrabold text-white bg-emerald-900/90 px-1.5 py-0.5 rounded">
                                {p.propertyType}
                              </span>
                              <span className="absolute bottom-1 right-2 text-[9px] font-black text-gold-400">
                                KES {p.price.toLocaleString()}{p.type === 'rent' ? '/mo' : ''}
                              </span>
                            </div>
                            <div className="p-2 text-left">
                              <h5 className="font-display font-extrabold text-[10px] text-emerald-950 truncate">{p.title}</h5>
                              <p className="text-[8px] text-gray-500 truncate flex items-center gap-0.5 mt-0.5">
                                <MapPin className="w-2.5 h-2.5 text-gold-500 shrink-0" /> {p.estate}, {p.town}
                              </p>
                              <div className="flex justify-between items-center mt-2 pt-1 border-t border-gray-100 text-[8px] font-semibold text-gray-400">
                                <span>📏 {p.size}</span>
                                <span className="text-emerald-950 font-extrabold uppercase text-[7px] tracking-wider bg-gold-500 px-1 rounded">
                                  {p.type === 'rent' ? 'To Let' : 'For Sale'}
                                </span>
                              </div>
                            </div>
                            {/* Tiny arrow pointing down to pin */}
                            <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 w-2 h-2 bg-white border-r border-b border-gray-100 rotate-45" />
                          </div>
                        )}

                        <div 
                          onMouseEnter={() => setHoveredProperty(p)}
                          onMouseLeave={() => setHoveredProperty(null)}
                          className={`flex items-center gap-1 p-1 rounded-lg border shadow-lg transform hover:scale-105 transition-all cursor-pointer ${isSelected ? 'bg-gold-500 border-emerald-950 text-emerald-950 scale-110 z-30 font-bold' : 'bg-emerald-900 border-gold-500 text-white'}`}
                        >
                          <MapPin className="w-3.5 h-3.5 text-white" />
                          <span className="text-[10px] px-0.5 font-semibold">
                            KES {p.price >= 1000000 ? `${(p.price / 1000000).toFixed(1)}M` : `${p.price.toLocaleString()}`}
                          </span>
                        </div>
                      </div>
                    </AdvancedMarker>
                  );
                })}
              </GoogleMap>
            </APIProvider>
          ) : (
            <div className="w-full h-full relative">
              {/* Leaflet Map Div */}
              <div ref={leafletContainerRef} className="w-full h-full" style={{ zIndex: 1 }} />
            </div>
          )}

          {/* Hidden Simulated Mockup Map */}
          {false && (
            <>
              {/* Simulated Map Notification Banner */}
              <div className="absolute top-4 left-4 right-4 bg-amber-50/95 backdrop-blur-sm border border-amber-200 p-3 rounded-xl shadow-lg z-30 flex items-start gap-2.5 text-xs text-amber-900 animate-in slide-in-from-top duration-300 pointer-events-auto">
                <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-bold text-amber-950">🌍 Currently in Simulated Map Mode (Approximate Coordinates)</p>
                  <p className="mt-0.5 leading-relaxed text-amber-800">
                    Because a Google Maps API Key is not set, we've enabled an interactive local mockup of Kenol Town. Regional towns (like Thika, Juja, or Muranga Town) are clamped to local offsets.
                  </p>
                  <div className="mt-2 text-[11px] bg-emerald-900/10 text-emerald-950 p-2 rounded-lg border border-emerald-900/20 font-medium">
                    <span className="font-bold">✨ To unlock highly accurate real maps:</span> add a <code>GOOGLE_MAPS_PLATFORM_KEY</code> secret under AI Studio Settings.
                  </div>
                </div>
              </div>

              {/* Stylized Simulated Map Background */}
              <div className="absolute inset-0 w-full h-full">
            {mapMode === 'satellite' ? (
              // Satellite view stylings - darker green/grey ambient grids with simulated landscape
              <div className="absolute inset-0 bg-[#0e1f18] flex flex-col justify-between p-4" style={{ backgroundImage: 'radial-gradient(circle, #1a3c2c 10%, #0e1f18 90%)' }}>
                {/* Lat/Long grids */}
                <div className="absolute inset-0 border-t border-b border-emerald-950/20 grid grid-cols-6 grid-rows-6 pointer-events-none opacity-40">
                  {Array.from({ length: 36 }).map((_, i) => (
                    <div key={i} className="border-r border-b border-emerald-900/10 text-[8px] text-emerald-500/30 p-1 font-mono">
                      0.99{i}° S / 37.12{i}° E
                    </div>
                  ))}
                </div>
                {/* Simulated topographical contours or highway lines */}
                <svg className="absolute inset-0 w-full h-full opacity-30 pointer-events-none">
                  <path d="M-10,120 Q120,400 340,320 T700,500 T1200,300" fill="none" stroke="#C8A34D" strokeWidth="2.5" />
                  <path d="M-50,220 Q200,100 450,250 T890,300 T1300,450" fill="none" stroke="#22c55e" strokeWidth="1" strokeDasharray="3,3" />
                  <circle cx="50%" cy="50%" r="200" fill="none" stroke="#C8A34D" strokeWidth="1" strokeDasharray="5,5" className="animate-pulse" />
                </svg>
              </div>
            ) : mapMode === 'heatmap' ? (
              // Heatmap style
              <div className="absolute inset-0 bg-emerald-950" style={{ backgroundImage: 'radial-gradient(circle, #0e1f18 30%, #030806 100%)' }}>
                <svg className="absolute inset-0 w-full h-full opacity-60 pointer-events-none">
                  <circle cx="50%" cy="50%" r="80" fill="url(#heat-high)" />
                  <circle cx="32%" cy="72%" r="120" fill="url(#heat-med)" />
                  <circle cx="22%" cy="85%" r="60" fill="url(#heat-high)" />
                  <circle cx="42%" cy="22%" r="90" fill="url(#heat-low)" />
                  
                  <defs>
                    <radialGradient id="heat-high" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="#ef4444" stopOpacity="0.8" />
                      <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
                    </radialGradient>
                    <radialGradient id="heat-med" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.7" />
                      <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
                    </radialGradient>
                    <radialGradient id="heat-low" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="#22c55e" stopOpacity="0.6" />
                      <stop offset="100%" stopColor="#22c55e" stopOpacity="0" />
                    </radialGradient>
                  </defs>
                </svg>
              </div>
            ) : (
              // High-Fidelity Google Maps Style Simulated Street Map of Kenol Town Only
              <div className="absolute inset-0 bg-[#f4f3f0] overflow-hidden select-none">
                {/* 1. Populated/Urban Shading Polygons (Yellow-Orange Google Maps Style) */}
                <svg className="absolute inset-0 w-full h-full opacity-60 pointer-events-none">
                  {/* Kenol Central CBD */}
                  <polygon points="400,280 480,260 550,300 560,380 480,410 400,380" fill="#fdf0dd" stroke="#f6deb4" strokeWidth="1" />
                  {/* Kenol Suburbs / Golden Gate */}
                  <polygon points="260,340 380,320 420,380 340,440 280,420" fill="#fcf0d8" stroke="#f4dbb1" strokeWidth="1" />
                  {/* Kenol Heights Estate */}
                  <polygon points="460,180 560,160 620,240 540,290 480,250" fill="#fdf0dd" stroke="#f6deb4" strokeWidth="1" />
                  {/* Lower Kenol / Market District */}
                  <polygon points="350,420 440,400 480,480 390,520 320,460" fill="#faf0da" stroke="#f4dbb1" strokeWidth="1" />
                  {/* Kabati Residential Extension */}
                  <polygon points="420,540 520,520 580,590 490,630 430,580" fill="#fbf0db" stroke="#f4dbb1" strokeWidth="1" />
                </svg>

                {/* 2. Green Reserves & Parks (Google Maps Green #d2f2d2) */}
                <svg className="absolute inset-0 w-full h-full opacity-65 pointer-events-none">
                  {/* Kenol Central Park & Sports Ground */}
                  <polygon points="430,310 490,295 510,340 450,355" fill="#d2f1d2" stroke="#bce6bc" strokeWidth="1" />
                  {/* Kenol Greenbelt Buffer Zone */}
                  <polygon points="120,220 220,180 250,240 180,280" fill="#daf2da" stroke="#c0e7c0" strokeWidth="1" />
                  {/* Upper Kenol Hills Sanctuary */}
                  <polygon points="580,80 720,60 760,130 640,160" fill="#d2f1d2" stroke="#bce6bc" strokeWidth="1" />
                </svg>

                {/* 3. Hydrology: Rivers (Google Maps Blue #a5dbf8) */}
                <svg className="absolute inset-0 w-full h-full opacity-80 pointer-events-none">
                  {/* Maragua River Tributary stream bordering Kenol Town */}
                  <path d="M50,-10 Q190,120 340,220 T580,410 T840,480 T1100,520" fill="none" stroke="#a3daf8" strokeWidth="3.5" strokeLinecap="round" />
                  {/* Kenol North Springs creek */}
                  <path d="M420,-10 Q450,110 520,180 T680,290" fill="none" stroke="#a3daf8" strokeWidth="2" strokeLinecap="round" />
                </svg>

                {/* 4. Secondary Local Roads & Estate Streets (Thin White Grid) */}
                <svg className="absolute inset-0 w-full h-full opacity-60 pointer-events-none">
                  {/* Kenol-Heights Estate Link Rd */}
                  <path d="M480,310 Q540,240 600,160" fill="none" stroke="#ffffff" strokeWidth="4" />
                  <path d="M480,310 Q540,240 600,160" fill="none" stroke="#dcdbd7" strokeWidth="2" />
                  
                  {/* Lower Kenol Market access ring */}
                  <path d="M480,310 Q420,410 380,510" fill="none" stroke="#ffffff" strokeWidth="3.5" strokeLinecap="round" />
                  <path d="M480,310 Q420,410 380,510" fill="none" stroke="#cbd5e1" strokeWidth="1.5" />
                  
                  {/* Estate Streets in Kenol Suburbs */}
                  <path d="M300,320 L400,330 M310,350 L410,360 M320,380 L420,390" fill="none" stroke="#ffffff" strokeWidth="3" />
                  
                  {/* Kenol central residential grid layout */}
                  <path d="M440,280 L520,290 M450,310 L530,320 M430,250 L510,260" fill="none" stroke="#ffffff" strokeWidth="2.5" />
                </svg>

                {/* 5. Primary National Freeways (Thick Dual Orange/Yellow with Grey casing) */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none">
                  {/* A2 Highway: Nairobi-Thika-Kenol-Nyeri Dual Carriageway (Passing through Kenol Interchange) */}
                  <path d="M-10,540 L320,420 L480,310 L780,220 L1200,140" fill="none" stroke="#cccccc" strokeWidth="11" strokeLinejoin="round" />
                  <path d="M-10,540 L320,420 L480,310 L780,220 L1200,140" fill="none" stroke="#ffcc33" strokeWidth="7.5" strokeLinejoin="round" />
                  <path d="M-10,540 L320,420 L480,310 L780,220 L1200,140" fill="none" stroke="#ffffff" strokeWidth="1" strokeDasharray="5,4" />

                  {/* C70 Road: Murang'a Highway branching off directly from Kenol Interchange */}
                  <path d="M480,310 L380,180 L310,80" fill="none" stroke="#dddddd" strokeWidth="7" strokeLinejoin="round" />
                  <path d="M480,310 L380,180 L310,80" fill="none" stroke="#ffeb99" strokeWidth="4.5" strokeLinejoin="round" />
                </svg>

                {/* 6. Live Traffic Flow Indicators (Google Green and Red Bottlenecks) */}
                <svg className="absolute inset-0 w-full h-full opacity-70 pointer-events-none">
                  {/* Flow along the A2 Highway: Green except around the central Kenol Interchange */}
                  <path d="M-10,540 L280,435" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinejoin="round" />
                  {/* Heavy traffic bottleneck approaching Kenol Central Interchange */}
                  <path d="M280,435 L480,310" fill="none" stroke="#ef4444" strokeWidth="2.5" strokeLinejoin="round" />
                  {/* Clear traffic heading North to Nyeri */}
                  <path d="M480,310 L780,220" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinejoin="round" />
                  <path d="M780,220 L1200,140" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinejoin="round" />
                </svg>

                {/* 7. Google Maps Style Road Shields & Labels */}
                {/* A2 Shield Banner */}
                <div className="absolute left-[34%] top-[54%] rotate-[-18deg] bg-[#007a33] text-white text-[8px] font-mono font-bold px-1 rounded border border-white/20 select-none pointer-events-none shadow-sm animate-fade-in">
                  A2
                </div>
                {/* C70 Shield Banner */}
                <div className="absolute left-[39%] top-[24%] bg-[#007a33] text-white text-[8px] font-mono font-bold px-1 rounded border border-white/20 select-none pointer-events-none shadow-sm animate-fade-in">
                  C70
                </div>

                {/* 8. Google-like Populated Area and Town Labels */}
                {/* Nature Labels */}
                <div className="absolute left-[47%] top-[34%] -translate-x-1/2 text-[#4c845c] font-sans font-bold tracking-wider text-[8px] uppercase pointer-events-none select-none">
                  🌳 Kenol Central Park
                </div>
                <div className="absolute left-[15%] top-[18%] -translate-x-1/2 text-[#4c845c] font-sans font-bold tracking-wider text-[8px] uppercase pointer-events-none select-none">
                  🌲 Kenol Hills Reserve
                </div>
                
                {/* River Labels */}
                <div className="absolute left-[24%] top-[25%] rotate-[32deg] text-[#4b7a9f] font-sans font-medium tracking-wide text-[7px] pointer-events-none select-none">
                  ~ Maragua Tributary ~
                </div>

                {/* Populated Sub-Estates and Districts inside Kenol Town */}
                <div className="absolute left-[22%] top-[38%] text-gray-500 font-sans text-[8px] font-semibold pointer-events-none select-none uppercase">
                  Kenol Suburbs
                </div>
                <div className="absolute left-[34%] top-[45%] text-gray-500 font-sans text-[8px] font-semibold pointer-events-none select-none uppercase">
                  Golden Ridge Estate
                </div>
                <div className="absolute left-[42%] top-[58%] text-gray-500 font-sans text-[8px] font-semibold pointer-events-none select-none uppercase">
                  Kabati Road Area
                </div>
                <div className="absolute left-[48%] top-[45%] text-[#aa731d] font-sans text-[10px] font-bold tracking-wide pointer-events-none select-none uppercase drop-shadow-sm">
                  Kenol Interchange CBD
                </div>
                <div className="absolute left-[54%] top-[21%] text-[#aa731d] font-sans text-[9px] font-bold tracking-wide pointer-events-none select-none uppercase drop-shadow-sm">
                  Kenol Heights
                </div>
                <div className="absolute left-[33%] top-[51%] text-[#aa731d] font-sans text-[9px] font-bold tracking-wide pointer-events-none select-none uppercase drop-shadow-sm">
                  Lower Kenol / Market
                </div>

                {/* 9. Authentic Google Brand Watermark & Map Credit */}
                <div className="absolute bottom-2 left-2 bg-white/70 backdrop-blur-sm px-1.5 py-0.5 rounded text-[8px] text-gray-500 font-sans font-bold border border-gray-100 flex items-center gap-1 shadow-sm select-none pointer-events-none">
                  <span className="text-blue-600">G</span>
                  <span className="text-red-500">o</span>
                  <span className="text-yellow-500">o</span>
                  <span className="text-blue-600">g</span>
                  <span className="text-green-500">l</span>
                  <span className="text-red-500">e</span>
                  <span className="text-gray-400 font-normal"> (Simulated) | Kenol Town Local Area, Murang'a County ©2026</span>
                </div>
              </div>
            )}
          </div>

          {/* Draw Circle Overlay showing radius search boundary */}
          <div 
            className="absolute border-2 border-dashed border-gold-500 bg-gold-500/10 rounded-full pointer-events-none -translate-x-1/2 -translate-y-1/2 transition-all duration-300 ease-out"
            style={{
              left: `${currentCenter.x}%`,
              top: `${currentCenter.y}%`,
              width: `${radiusKm * 6}px`,
              height: `${radiusKm * 6}px`,
            }}
          />

          {/* Drawn Bounding Area Box */}
          {drawnArea && (
            <div 
              className="absolute border-2 border-red-500 bg-red-500/15 pointer-events-none"
              style={{
                left: `${drawnArea.x}%`,
                top: `${drawnArea.y}%`,
                width: `${drawnArea.w}%`,
                height: `${drawnArea.h}%`
              }}
            >
              <div className="absolute top-0 left-0 bg-red-500 text-white text-[9px] px-1 font-bold">
                Custom Search Box
              </div>
            </div>
          )}

          {/* SVG Overlay layer for driving directions */}
          {directionsActive && selectedProperty && (
            <>
              <style>{`
                @keyframes route-flow {
                  to {
                    stroke-dashoffset: -20;
                  }
                }
                .animate-route-flow {
                  stroke-dasharray: 8 6;
                  animation: route-flow 1.5s linear infinite;
                }
              `}</style>
              <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 w-full h-full pointer-events-none z-10">
                <defs>
                  <linearGradient id="route-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#3b82f6" />
                    <stop offset="100%" stopColor="#10b981" />
                  </linearGradient>
                </defs>
                
                {/* Curved bezier route in percent coordinates */}
                <path 
                  d={`M ${directionsStart.x} ${directionsStart.y} Q ${(directionsStart.x + directionsEnd.x)/2 + 5} ${(directionsStart.y + directionsEnd.y)/2 - 8} ${directionsEnd.x} ${directionsEnd.y}`}
                  fill="none"
                  stroke="url(#route-gradient)"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                  className="opacity-90"
                />
                {/* Animated dash line overlay */}
                <path 
                  d={`M ${directionsStart.x} ${directionsStart.y} Q ${(directionsStart.x + directionsEnd.x)/2 + 5} ${(directionsStart.y + directionsEnd.y)/2 - 8} ${directionsEnd.x} ${directionsEnd.y}`}
                  fill="none"
                  stroke="#ffffff"
                  strokeWidth="0.4"
                  strokeLinecap="round"
                  className="animate-route-flow opacity-95"
                />
              </svg>
            </>
          )}

          {/* User Marker Overlay */}
          {userLocation && (
            <div 
              id="user-location-ping"
              className="absolute -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none"
              style={{ left: `${userLocation.x}%`, top: `${userLocation.y}%` }}
            >
              <div className="w-5 h-5 bg-blue-500 border-2 border-white rounded-full flex items-center justify-center shadow-lg relative animate-bounce">
                <Navigation className="w-2.5 h-2.5 text-white transform rotate-45" />
                <span className="absolute inset-0 rounded-full border border-blue-400 animate-ping opacity-75"></span>
              </div>
            </div>
          )}

          {/* Live Overlay of Active Amenities Markers */}
          {mockAmenities.map(amenity => {
            const isVisible = showAmenities.includes(amenity.type);
            if (!isVisible) return null;
            
            const Icon = amenity.type === 'school' ? School : 
                          amenity.type === 'hospital' ? Landmark : 
                          amenity.type === 'shopping' ? ShoppingBag : 
                          amenity.type === 'police' ? Shield : Coffee;

            return (
              <div 
                key={amenity.id}
                className="absolute -translate-x-1/2 -translate-y-1/2 z-10 group"
                style={{ left: `${amenity.x}%`, top: `${amenity.y}%` }}
              >
                <div className="bg-white hover:bg-emerald-950 hover:text-white text-emerald-900 border border-gray-200 p-1.5 rounded-lg shadow-md flex items-center gap-1 cursor-help transition-all transform hover:scale-110">
                  <Icon className="w-3.5 h-3.5 text-gold-500" />
                  <span className="max-w-0 overflow-hidden group-hover:max-w-[150px] transition-all duration-300 text-[10px] font-semibold whitespace-nowrap px-0 group-hover:px-1">
                    {amenity.name}
                  </span>
                </div>
              </div>
            );
          })}

          {/* Live Property Pins on Map */}
          {properties.map(p => {
            const calculated = getPropertyCoordinates(p);
            
            let displayX = calculated.x;
            let displayY = calculated.y;
            
            if (!calculated.isCustom) {
              // Adjust offset positions slightly so markers do not perfectly overlap if in same town
              const isFirstInTown = properties.findIndex(prop => prop.town === p.town) === properties.indexOf(p);
              displayX = isFirstInTown ? calculated.x : calculated.x + (properties.indexOf(p) * 2.5 - 4);
              displayY = isFirstInTown ? calculated.y : calculated.y + (properties.indexOf(p) * 1.5 - 2);
            }

            const isSelected = selectedProperty?.id === p.id;

            return (
              <div 
                key={p.id}
                className="absolute -translate-x-1/2 -translate-y-full z-20 group"
                style={{ left: `${displayX}%`, top: `${displayY}%` }}
              >
                {/* Google Map Style Mini-Toggle Popup Card (Hover or Touch) */}
                {(hoveredProperty?.id === p.id || isSelected) && (
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-60 bg-white rounded-xl border border-gray-100 shadow-2xl overflow-hidden z-40 pointer-events-auto animate-in fade-in zoom-in-95 duration-200">
                    <div className="relative h-20 bg-gray-100">
                      <img src={p.images[0]} alt={p.title} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <span className="absolute bottom-1 left-2 text-[8px] uppercase tracking-wider font-extrabold text-white bg-emerald-900/90 px-1.5 py-0.5 rounded">
                        {p.propertyType}
                      </span>
                      <span className="absolute bottom-1 right-2 text-[9px] font-black text-gold-400">
                        KES {p.price.toLocaleString()}{p.type === 'rent' ? '/mo' : ''}
                      </span>
                    </div>
                    <div className="p-2 text-left">
                      <h5 className="font-display font-extrabold text-[10px] text-emerald-950 truncate">{p.title}</h5>
                      <p className="text-[8px] text-gray-500 truncate flex items-center gap-0.5 mt-0.5">
                        <MapPin className="w-2.5 h-2.5 text-gold-500 shrink-0" /> {p.estate}, {p.town}
                      </p>
                      <div className="flex justify-between items-center mt-2 pt-1 border-t border-gray-100 text-[8px] font-semibold text-gray-400">
                        <span>📏 {p.size}</span>
                        <span className="text-emerald-950 font-extrabold uppercase text-[7px] tracking-wider bg-gold-500 px-1 rounded">
                          {p.type === 'rent' ? 'To Let' : 'For Sale'}
                        </span>
                      </div>
                    </div>
                    {/* Tiny arrow pointing down to pin */}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 w-2 h-2 bg-white border-r border-b border-gray-100 rotate-45" />
                  </div>
                )}

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectProperty(p);
                  }}
                  onMouseEnter={() => setHoveredProperty(p)}
                  onMouseLeave={() => setHoveredProperty(null)}
                  onTouchStart={(e) => {
                    e.stopPropagation();
                    setHoveredProperty(hoveredProperty?.id === p.id ? null : p);
                  }}
                  className={`flex items-center gap-1 p-1 rounded-lg border shadow-lg transform hover:scale-105 active:scale-95 transition-all ${isSelected ? 'bg-gold-500 border-emerald-950 text-emerald-950 scale-110 z-30 font-bold' : 'bg-emerald-900 border-gold-500 text-white'}`}
                >
                  <MapPin className="w-4 h-4 text-white" />
                  <span className="text-[10px] px-1 font-semibold">
                    KES {p.price >= 1000000 ? `${(p.price / 1000000).toFixed(1)}M` : `${p.price.toLocaleString()}`}
                  </span>
                  
                  {p.isAiVerified && (
                    <span className="bg-emerald-950 text-gold-400 text-[8px] px-1 rounded-sm flex items-center gap-0.5">
                      <Sparkles className="w-2 h-2 text-gold-400" /> AI
                    </span>
                  )}
                </button>
              </div>
            );
          })}
        </>
      )}

          {/* Floating Google Maps Style Interactive Layer Controls */}
          <div className="absolute right-4 bottom-20 flex flex-col gap-2 z-30 pointer-events-auto">
            {/* Compass Indicator */}
            <button 
              type="button"
              className="w-9 h-9 rounded-lg bg-white border border-gray-200/80 hover:bg-gray-50 flex items-center justify-center text-emerald-950 font-bold text-sm shadow-md transition-all cursor-pointer"
              title="Compass Nord orientation"
              onClick={(e) => {
                e.stopPropagation();
                triggerRefresh();
              }}
            >
              <Navigation className="w-4 h-4 text-emerald-900 transform rotate-12" />
            </button>

            {/* Zoom Group */}
            <div className="flex flex-col bg-white rounded-lg shadow-md border border-gray-200/80 overflow-hidden">
              {/* Zoom In button (decreases radius state to focus) */}
              <button 
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setRadiusKm(prev => Math.max(5, prev - 5));
                }}
                className="w-9 h-9 hover:bg-gray-50 flex items-center justify-center text-emerald-950 font-black text-base transition-all cursor-pointer border-b border-gray-100"
                title="Zoom In (Decrease Area Radius)"
              >
                +
              </button>
              {/* Zoom Out button (increases radius state to broaden) */}
              <button 
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setRadiusKm(prev => Math.min(50, prev + 5));
                }}
                className="w-9 h-9 hover:bg-gray-50 flex items-center justify-center text-emerald-950 font-black text-base transition-all cursor-pointer"
                title="Zoom Out (Increase Area Radius)"
              >
                −
              </button>
            </div>
          </div>

          {/* Traffic Legend & Scale Indicator overlay */}
          <div className="absolute left-4 bottom-12 z-30 pointer-events-none flex flex-col gap-1 bg-white/90 backdrop-blur-sm p-2 rounded-lg border border-gray-200 shadow-sm min-w-[110px]">
            {/* Scale Bar */}
            <div className="flex flex-col">
              <div className="flex justify-between text-[7px] text-gray-500 font-bold mb-0.5">
                <span>0 km</span>
                <span>{radiusKm} km</span>
              </div>
              <div className="h-[2px] bg-gray-700 w-full relative">
                <div className="absolute right-0 top-0 h-1.5 w-[1px] bg-gray-700"></div>
                <div className="absolute left-0 top-0 h-1.5 w-[1px] bg-gray-700"></div>
              </div>
            </div>

            {/* Traffic Speed */}
            <div className="flex items-center gap-1 mt-1 border-t border-gray-200/60 pt-1">
              <span className="text-[7px] font-bold text-gray-500 uppercase">Live Traffic:</span>
              <div className="flex gap-0.5">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full" title="Clear Traffic"></span>
                <span className="w-1.5 h-1.5 bg-red-600 rounded-full" title="Heavy Jams"></span>
              </div>
            </div>
          </div>

          {/* Interactive Floating Detail Popup card on Map */}
          {selectedProperty && (
            <div className="absolute bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 bg-white rounded-xl border border-gray-100 shadow-2xl overflow-hidden z-30 animate-in slide-in-from-bottom duration-300">
              <div className="relative h-28">
                <img 
                  src={selectedProperty.images[0]} 
                  alt={selectedProperty.title}
                  className="w-full h-full object-cover"
                />
                <button 
                  onClick={() => onSelectProperty(null as any)}
                  className="absolute top-2 right-2 w-6 h-6 bg-emerald-900/80 text-white rounded-full flex items-center justify-center text-xs hover:bg-emerald-900 font-bold"
                >
                  ×
                </button>
                <span className="absolute bottom-2 left-2 bg-emerald-900 text-white text-[9px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-sm">
                  {selectedProperty.propertyType}
                </span>
                <span className="absolute bottom-2 right-2 bg-gold-500 text-emerald-950 text-[10px] font-bold px-2 py-0.5 rounded-sm shadow">
                  KES {selectedProperty.price.toLocaleString()}{selectedProperty.type === 'rent' ? '/mo' : ''}
                </span>
              </div>
              <div className="p-3">
                <h4 className="font-display font-bold text-xs text-emerald-900 line-clamp-1 mb-1">{selectedProperty.title}</h4>
                <p className="text-[10px] text-gray-500 flex items-center gap-1 mb-2">
                  <MapPin className="w-3 h-3 text-gold-500" /> {selectedProperty.estate}, {selectedProperty.town}
                </p>
                
                {/* Specs */}
                <div className="flex gap-3 text-[10px] text-gray-600 mb-3 border-t border-b border-gray-100 py-1.5">
                  {selectedProperty.bedrooms > 0 && <span>🛏️ {selectedProperty.bedrooms} Beds</span>}
                  {selectedProperty.bathrooms > 0 && <span>🚿 {selectedProperty.bathrooms} Baths</span>}
                  <span>📐 {selectedProperty.size}</span>
                </div>

                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 shrink-0">
                    <img 
                      src={selectedProperty.agent.photo} 
                      alt={selectedProperty.agent.name}
                      className="w-6 h-6 rounded-full object-cover border border-emerald-900"
                    />
                    <div className="text-[9px]">
                      <p className="font-bold text-gray-800 leading-none">{selectedProperty.agent.name}</p>
                      <p className="text-gray-400">Agent</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-1">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleGetDirections();
                      }}
                      className={`p-1.5 rounded-md text-[10px] flex items-center gap-1 font-bold shadow-sm transition-all ${directionsActive ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-gold-500 hover:bg-gold-600 text-emerald-950'}`}
                    >
                      <Navigation className="w-3 h-3 transform rotate-45 shrink-0" />
                      {directionsActive ? 'Stop' : 'Directions'}
                    </button>

                    <a 
                      href={`tel:${selectedProperty.agent.phone}`}
                      className="p-1.5 bg-emerald-900 hover:bg-emerald-950 text-white rounded-md text-[10px] flex items-center gap-1 font-semibold shrink-0"
                    >
                      <Phone className="w-3 h-3 shrink-0" /> Call
                    </a>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
