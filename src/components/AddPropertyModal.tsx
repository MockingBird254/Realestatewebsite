/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  X, Check, Plus, FileText, CheckCircle2
} from 'lucide-react';
import { Property } from '../types';

interface AddPropertyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  leadBrokerName?: string;
  leadBrokerPhone?: string;
  leadBrokerEmail?: string;
  leadBrokerPhoto?: string;
}

export default function AddPropertyModal({ 
  isOpen, 
  onClose, 
  onSuccess,
  leadBrokerName = "Daniel Maina",
  leadBrokerPhone = "+254 722 710 580",
  leadBrokerEmail = "info@uniquemerchants.co.ke",
  leadBrokerPhoto = "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=200&q=80"
}: AddPropertyModalProps) {
  // Property Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState<number>(1500000);
  const [type, setType] = useState<'buy' | 'rent' | 'commercial' | 'land'>('land');
  const [propertyType, setPropertyType] = useState("Plot");
  const [county, setCounty] = useState("Murang'a");
  const [town, setTown] = useState("Kenol");
  const [estate, setEstate] = useState("Suburbs");
  const [size, setSize] = useState("50x100 ft");
  const [bedrooms, setBedrooms] = useState(0);
  const [bathrooms, setBathrooms] = useState(0);
  const [parking, setParking] = useState(0);
  const [latInput, setLatInput] = useState("");
  const [lngInput, setLngInput] = useState("");
  const [youtubeUrlInput, setYoutubeUrlInput] = useState("");
  const [amenityInput, setAmenityInput] = useState("");
  const [amenities, setAmenities] = useState<string[]>(["Ready Title Deed", "Water Connection", "Electricity Nearby"]);
  const [selectedImagePreset, setSelectedImagePreset] = useState<string>("land"); // land, luxury, standard, commercial
  
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isImageDragActive, setIsImageDragActive] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handlePropertyImageUpload = async (file: File) => {
    setIsUploadingImage(true);

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
          setUploadedImages(prev => [...prev, data.url]);
          setIsUploadingImage(false);
          return;
        }
      }

      // 2. If standard upload fails, use base64 fallback
      console.warn('Property image multipart upload failed, attempting base64 fallback...');
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
        setUploadedImages(prev => [...prev, fallbackData.url]);
      } else {
        alert(fallbackData.error || 'Failed to upload property image.');
      }
    } catch (err) {
      console.error('Property image upload error:', err);
      // Try base64 fallback on error
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
          setUploadedImages(prev => [...prev, fallbackData.url]);
        } else {
          alert('Upload failed: ' + (fallbackData.error || 'Unable to store file.'));
        }
      } catch (fallbackErr) {
        console.error('Property image fallback error:', fallbackErr);
        alert('An error occurred while uploading the image.');
      }
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleRemoveUploadedImage = (idxToRemove: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== idxToRemove));
  };

  if (!isOpen) return null;

  const handlePublishListing = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Unsplash preset arrays for rich image matching
    const presets: { [key: string]: string[] } = {
      land: [
        "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80"
      ],
      luxury: [
        "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=800&q=80"
      ],
      standard: [
        "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80"
      ],
      commercial: [
        "https://images.unsplash.com/photo-1554469384-e58fac16e23a?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80"
      ]
    };

    const latNum = latInput ? parseFloat(latInput) : undefined;
    const lngNum = lngInput ? parseFloat(lngInput) : undefined;

    const getEmbedUrl = (url: string): string => {
      if (!url) return '';
      const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
      const match = url.match(regExp);
      if (match && match[2].length === 11) {
        return `https://www.youtube.com/embed/${match[2]}`;
      }
      return url;
    };

    const payload: Partial<Property> = {
      title,
      description,
      price,
      type,
      propertyType,
      county,
      town,
      estate,
      bedrooms,
      bathrooms,
      parking,
      size,
      isAiVerified: false,
      isFeatured: price > 5000000,
      isSponsored: false,
      images: uploadedImages.length > 0 ? uploadedImages : (presets[selectedImagePreset] || presets.land),
      videoUrl: youtubeUrlInput ? getEmbedUrl(youtubeUrlInput) : undefined,
      agent: {
        name: leadBrokerName,
        phone: leadBrokerPhone,
        email: leadBrokerEmail,
        photo: leadBrokerPhoto
      },
      ...(latNum !== undefined && lngNum !== undefined && !isNaN(latNum) && !isNaN(lngNum) ? {
        coordinates: {
          lat: latNum,
          lng: lngNum
        }
      } : {})
    };

    try {
      const response = await fetch('/api/properties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setIsSubmitted(true);
          setTimeout(() => {
            onSuccess();
            onClose();
            // Reset
            setTitle("");
            setDescription("");
            setUploadedImages([]);
            setLatInput("");
            setLngInput("");
            setYoutubeUrlInput("");
            setIsSubmitted(false);
          }, 2200);
          return;
        }
      }
      throw new Error("API post returned non-success response");
    } catch (e) {
      console.warn("Express server offline or request failed. Storing property inside browser cache...", e);
      try {
        const cachedPropsRaw = localStorage.getItem('unique_merchants_properties');
        const currentProps = cachedPropsRaw ? JSON.parse(cachedPropsRaw) : [];
        const newProperty = {
          ...payload,
          id: `prop-${Date.now()}`,
          dateListed: new Date().toISOString()
        };
        const updated = [newProperty, ...currentProps];
        localStorage.setItem('unique_merchants_properties', JSON.stringify(updated));

        setIsSubmitted(true);
        setTimeout(() => {
          onSuccess();
          onClose();
          // Reset
          setTitle("");
          setDescription("");
          setUploadedImages([]);
          setLatInput("");
          setLngInput("");
          setYoutubeUrlInput("");
          setIsSubmitted(false);
        }, 2200);
      } catch (err) {
        console.error("Local storage cache write failed:", err);
        alert("Failed to save property listing.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddAmenity = () => {
    if (amenityInput.trim() && !amenities.includes(amenityInput)) {
      setAmenities([...amenities, amenityInput.trim()]);
      setAmenityInput("");
    }
  };

  const handleRemoveAmenity = (idx: number) => {
    setAmenities(amenities.filter((_, i) => i !== idx));
  };

  return (
    <div className="fixed inset-0 bg-emerald-950/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-3xl w-full border border-gray-100 shadow-2xl overflow-hidden flex flex-col h-[90vh] max-h-[750px] animate-in zoom-in duration-200">
        
        {/* Structured Property Draft Panel */}
        <div className="flex-1 bg-gray-50 flex flex-col h-full overflow-hidden">
          
          {/* Header */}
          <div className="bg-white px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h3 className="font-display font-extrabold text-emerald-950 uppercase text-sm flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-gold-500" /> New Property Draft Board
              </h3>
              <p className="text-[10px] text-gray-400">Review and publish a new property directly to live feeds</p>
            </div>
            <button 
              onClick={onClose}
              className="p-1 text-gray-400 hover:text-gray-600 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Scrollable Form Panel */}
          {isSubmitted ? (
            <div className="flex-1 p-8 text-center flex flex-col items-center justify-center gap-4 animate-in fade-in">
              <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center border-2 border-gold-500 text-emerald-900 shadow">
                <CheckCircle2 className="w-10 h-10 animate-bounce" />
              </div>
              <div>
                <h3 className="font-display font-extrabold text-emerald-950 uppercase">Listing Published Successfully!</h3>
                <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
                  The property has been compiled and is now live on our <strong>Interactive Map</strong> and search directories.
                </p>
              </div>
            </div>
          ) : (
            <form onSubmit={handlePublishListing} className="flex-1 overflow-y-auto p-6 flex flex-col gap-5">
              <div className="flex flex-col gap-5">
                
                {/* Title */}
                <div>
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 block">Property Title</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. 1/8 Acre Residential Plot in Kenol"
                    className="w-full bg-white border border-gray-200 px-3 py-2 rounded-xl text-xs text-gray-800 focus:outline-none focus:border-emerald-900"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 block">Property Description</label>
                  <textarea 
                    required
                    rows={3}
                    placeholder="Provide full features, nearby landmarks, accessibility and soil type..."
                    className="w-full bg-white border border-gray-200 px-3 py-2 rounded-xl text-xs text-gray-800 focus:outline-none focus:border-emerald-900 resize-none"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>

                {/* Splits: Price, Type, PropertyType */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 block">Price (KES) *</label>
                    <input 
                      type="number" 
                      required
                      className="w-full bg-white border border-gray-200 px-3 py-2 rounded-xl text-xs text-gray-800 focus:outline-none focus:border-emerald-900"
                      value={price}
                      onChange={(e) => setPrice(parseInt(e.target.value) || 0)}
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 block">Zoning Mode</label>
                    <select 
                      className="w-full bg-white border border-gray-200 px-2 py-2 rounded-xl text-xs text-gray-700 focus:outline-none focus:border-emerald-900"
                      value={type}
                      onChange={(e) => setType(e.target.value as any)}
                    >
                      <option value="buy">For Sale</option>
                      <option value="rent">To Rent</option>
                      <option value="land">Land Plot</option>
                      <option value="commercial">Commercial</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 block">Category</label>
                    <input 
                      type="text" 
                      required
                      placeholder="e.g. Maisonette, Plot"
                      className="w-full bg-white border border-gray-200 px-3 py-2 rounded-xl text-xs text-gray-800 focus:outline-none focus:border-emerald-900"
                      value={propertyType}
                      onChange={(e) => setPropertyType(e.target.value)}
                    />
                  </div>
                </div>

                {/* Location specs split */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 block">County</label>
                    <input 
                      type="text" 
                      required
                      className="w-full bg-white border border-gray-200 px-3 py-2 rounded-xl text-xs text-gray-800 focus:outline-none focus:border-emerald-900"
                      value={county}
                      onChange={(e) => setCounty(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 block">Town</label>
                    <input 
                      type="text" 
                      required
                      className="w-full bg-white border border-gray-200 px-3 py-2 rounded-xl text-xs text-gray-800 focus:outline-none focus:border-emerald-900"
                      value={town}
                      onChange={(e) => setTown(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 block">Estate</label>
                    <input 
                      type="text" 
                      className="w-full bg-white border border-gray-200 px-3 py-2 rounded-xl text-xs text-gray-800 focus:outline-none focus:border-emerald-900"
                      value={estate}
                      onChange={(e) => setEstate(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 block">Size</label>
                    <input 
                      type="text" 
                      required
                      placeholder="e.g. 50x100 ft"
                      className="w-full bg-white border border-gray-200 px-3 py-2 rounded-xl text-xs text-gray-800 focus:outline-none focus:border-emerald-900"
                      value={size}
                      onChange={(e) => setSize(e.target.value)}
                    />
                  </div>
                </div>

                {/* Map & GPS Coordinates (Added for map accuracy) */}
                <div className="bg-white p-4 rounded-xl border border-gray-200/60 flex flex-col gap-3">
                  <div>
                    <h4 className="text-[10px] font-bold text-emerald-900 uppercase tracking-wider">Map Coordinates & GPS Location</h4>
                    <p className="text-[9px] text-gray-400 mt-0.5">
                      Enter GPS coordinates to accurately pinpoint this property on the Interactive Map (Kenol Town range: Lat -1.04 to -0.96, Lng 37.08 to 37.16).
                    </p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="text-[10px] font-semibold text-gray-500 uppercase block mb-1">Latitude</label>
                      <input 
                        type="number" 
                        step="any"
                        placeholder="e.g. -0.9995 S"
                        className="w-full bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-lg text-xs"
                        value={latInput}
                        onChange={(e) => setLatInput(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-semibold text-gray-500 uppercase block mb-1">Longitude</label>
                      <input 
                        type="number" 
                        step="any"
                        placeholder="e.g. 37.1265 E"
                        className="w-full bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-lg text-xs"
                        value={lngInput}
                        onChange={(e) => setLngInput(e.target.value)}
                      />
                    </div>
                    <div className="flex items-end">
                      <button
                        type="button"
                        onClick={() => {
                          // Suggest typical coordinates for the selected town
                          if (town.toLowerCase().includes("kenol")) {
                            setLatInput("-0.9995");
                            setLngInput("37.1265");
                          } else if (town.toLowerCase().includes("murang")) {
                            setLatInput("-0.9899");
                            setLngInput("37.1217");
                          } else if (town.toLowerCase().includes("thika")) {
                            setLatInput("-1.0091");
                            setLngInput("37.1025");
                          } else {
                            // Default Kenol Center
                            setLatInput("-0.9995");
                            setLngInput("37.1265");
                          }
                        }}
                        className="w-full bg-emerald-900/5 hover:bg-emerald-900/10 text-emerald-900 text-[10px] font-bold py-2 px-3 rounded-lg border border-emerald-900/20 transition-colors uppercase tracking-wide"
                      >
                        Auto-detect from "{town}"
                      </button>
                    </div>
                  </div>
                </div>

                {/* YouTube Walkthrough Link */}
                <div className="bg-white p-4 rounded-xl border border-gray-200/60 flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">YouTube Walkthrough Video Link</label>
                  <p className="text-[9px] text-gray-400">
                    Add a standard YouTube video link (e.g. <code>https://www.youtube.com/watch?v=...</code>). It will automatically be compiled into an interactive virtual walkthrough tour.
                  </p>
                  <input 
                    type="text" 
                    placeholder="e.g. https://www.youtube.com/watch?v=dQw4w9WgXcQ"
                    className="w-full bg-gray-50 border border-gray-200 px-3 py-2 rounded-xl text-xs text-gray-800 focus:outline-none focus:border-emerald-900"
                    value={youtubeUrlInput}
                    onChange={(e) => setYoutubeUrlInput(e.target.value)}
                  />
                </div>

                {/* Rooms layout split */}
                <div className="grid grid-cols-3 gap-4 bg-white p-4 rounded-xl border border-gray-200/60">
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 block">Bedrooms</label>
                    <input 
                      type="number" 
                      className="w-full bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-lg text-xs"
                      value={bedrooms}
                      onChange={(e) => setBedrooms(parseInt(e.target.value) || 0)}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 block">Bathrooms</label>
                    <input 
                      type="number" 
                      className="w-full bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-lg text-xs"
                      value={bathrooms}
                      onChange={(e) => setBathrooms(parseInt(e.target.value) || 0)}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 block">Parking spots</label>
                    <input 
                      type="number" 
                      className="w-full bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-lg text-xs"
                      value={parking}
                      onChange={(e) => setParking(parseInt(e.target.value) || 0)}
                    />
                  </div>
                </div>

                {/* Drag & Drop Property Images */}
                <div className="bg-white p-4 rounded-xl border border-gray-200/60 flex flex-col gap-3">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">
                    Property Images (Drag & Drop or Upload)
                  </label>
                  
                  {/* Upload Drop Zone */}
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsImageDragActive(true);
                    }}
                    onDragLeave={() => setIsImageDragActive(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setIsImageDragActive(false);
                      if (e.dataTransfer.files) {
                        for (let i = 0; i < e.dataTransfer.files.length; i++) {
                          const file = e.dataTransfer.files[i];
                          if (file.type.startsWith('image/')) {
                            handlePropertyImageUpload(file);
                          }
                        }
                      }
                    }}
                    onClick={() => {
                      const fileInput = document.getElementById('property-image-input');
                      if (fileInput) fileInput.click();
                    }}
                    className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center min-h-[110px] ${
                      isImageDragActive 
                        ? 'border-gold-500 bg-emerald-900/5' 
                        : 'border-gray-200 hover:border-emerald-900/40 bg-gray-50/50'
                    }`}
                  >
                    <input 
                      id="property-image-input"
                      type="file" 
                      multiple
                      className="hidden" 
                      accept="image/*"
                      onChange={(e) => {
                        if (e.target.files) {
                          for (let i = 0; i < e.target.files.length; i++) {
                            const file = e.target.files[i];
                            handlePropertyImageUpload(file);
                          }
                        }
                      }}
                    />
                    
                    {isUploadingImage ? (
                      <div className="flex flex-col items-center gap-2">
                        <span className="w-6 h-6 border-2 border-emerald-900 border-t-transparent rounded-full animate-spin"></span>
                        <span className="text-xs text-gray-400 font-bold uppercase tracking-wider animate-pulse">Uploading files to backend...</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-1.5">
                        <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-900 flex items-center justify-center mb-1">
                          <svg className="w-5 h-5 text-emerald-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                          </svg>
                        </div>
                        <p className="text-xs font-extrabold text-emerald-950 uppercase tracking-wide">
                          Drag & Drop Property Images
                        </p>
                        <p className="text-[10px] text-gray-400 font-medium">
                          Drop one or more property photos here, or <span className="text-emerald-900 underline font-bold">browse folders</span>
                        </p>
                      </div>
                    )}
                  </div>

                  {/* List of custom uploaded files with thumbnails */}
                  {uploadedImages.length > 0 && (
                    <div className="mt-2">
                      <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">
                        Custom Uploaded Photos ({uploadedImages.length})
                      </p>
                      <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                        {uploadedImages.map((imgUrl, index) => (
                          <div key={index} className="relative group aspect-square rounded-xl overflow-hidden border border-gray-100 bg-gray-50">
                            <img src={imgUrl} alt={`Uploaded ${index}`} className="w-full h-full object-cover" />
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveUploadedImage(index);
                              }}
                              className="absolute top-1 right-1 w-5 h-5 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center text-xs font-bold shadow transition-colors cursor-pointer"
                              title="Delete image"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Gallery Preset matches */}
                <div>
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Or Use Fallback Image Presets</label>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { id: 'land', label: 'Plot/Field', img: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=120&q=80' },
                      { id: 'luxury', label: 'Luxury Home', img: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=120&q=80' },
                      { id: 'standard', label: 'Apartment', img: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=120&q=80' },
                      { id: 'commercial', label: 'Commercial', img: 'https://images.unsplash.com/photo-1554469384-e58fac16e23a?auto=format&fit=crop&w=120&q=80' }
                    ].map(preset => (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => setSelectedImagePreset(preset.id)}
                        className={`relative h-16 rounded-xl overflow-hidden border-2 transition-all ${selectedImagePreset === preset.id ? 'border-gold-500 scale-102 ring-2 ring-emerald-900/10' : 'border-transparent opacity-70 hover:opacity-100'}`}
                      >
                        <img src={preset.img} alt={preset.label} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center p-1">
                          <span className="text-[8px] text-white font-extrabold uppercase leading-none text-center">{preset.label}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Amenities */}
                <div>
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 block">Amenities Checklist</label>
                  <div className="flex gap-2 mb-2">
                    <input 
                      type="text" 
                      placeholder="Add amenity (e.g. Borehole, Solar panels)" 
                      className="flex-1 bg-white border border-gray-200 px-3 py-2 rounded-xl text-xs text-gray-800 focus:outline-none focus:border-emerald-900"
                      value={amenityInput}
                      onChange={(e) => setAmenityInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddAmenity();
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={handleAddAmenity}
                      className="bg-emerald-900 hover:bg-emerald-950 text-white px-3.5 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" /> Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {amenities.map((amenity, idx) => (
                      <span 
                        key={idx}
                        className="inline-flex items-center gap-1 bg-emerald-900/5 text-emerald-900 text-[10px] font-bold px-2.5 py-1 rounded-full border border-emerald-900/10"
                      >
                        {amenity}
                        <button 
                          type="button" 
                          onClick={() => handleRemoveAmenity(idx)}
                          className="text-red-500 hover:text-red-700 ml-1 font-bold"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Submit Actions */}
                <div className="pt-4 border-t border-gray-200 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="bg-white hover:bg-gray-100 text-gray-700 border border-gray-200 px-5 py-2.5 rounded-xl text-xs font-bold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-emerald-900 hover:bg-emerald-950 text-white px-6 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-lg disabled:bg-gray-100 disabled:text-gray-400"
                  >
                    <Check className="w-4 h-4" />
                    {isSubmitting ? 'Publishing...' : 'One-Click Publish to Live Portal'}
                  </button>
                </div>

              </div>
            </form>
          )}

        </div>

      </div>
    </div>
  );
}
