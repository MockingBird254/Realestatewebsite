/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  X, Send, Sparkles, User, Mail, Phone, 
  MapPin, CheckCircle2, DollarSign, Home
} from 'lucide-react';

interface PropertyRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  leadBrokerName?: string;
}

export default function PropertyRequestModal({ isOpen, onClose, onSuccess, leadBrokerName = "Daniel Maina" }: PropertyRequestModalProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("Kenol");
  const [propertyType, setPropertyType] = useState("Maisonette");
  const [budget, setBudget] = useState("Under KES 10 Million");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone || !description) return;

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/properties/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          phone,
          location,
          propertyType,
          budget,
          description
        })
      });
      const data = await response.json();
      if (data.success) {
        setSubmitted(true);
        // Attempt automatic redirect to WhatsApp in a new tab
        const cleanPhone = "254722710580";
        const msg = `Hello Unique Merchants, I am submitting a property sourcing request:\n\n*Name*: ${name}\n*Email*: ${email || 'Not provided'}\n*Phone*: ${phone}\n*Preferred Location*: ${location}\n*Property Type*: ${propertyType}\n*Budget*: ${budget}\n*Details*: ${description}`;
        const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`;
        try {
          window.open(waUrl, '_blank');
        } catch (e) {
          console.error(e);
        }
        onSuccess(); // Refresh requests list in parent app
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-emerald-950/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-lg w-full border border-gray-100 shadow-2xl overflow-hidden animate-in zoom-in duration-200">
        
        {/* Header */}
        <div className="bg-emerald-900 text-white p-5 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-gold-500 fill-gold-500" />
            <div>
              <h3 className="font-display font-extrabold text-sm sm:text-base uppercase tracking-wider">Describe Your Dream Property</h3>
              <p className="text-[10px] text-gray-300">Submit requests directly to our Murang'a agent desks</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 hover:bg-emerald-800 rounded-lg text-gray-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success Splash */}
        {submitted ? (
          <div className="p-8 text-center flex flex-col items-center justify-center gap-4 animate-in fade-in">
            <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center border-2 border-gold-500 text-emerald-900 shadow">
              <CheckCircle2 className="w-10 h-10 animate-bounce" />
            </div>
            <div>
              <h4 className="font-display font-extrabold text-emerald-900 uppercase">Request Sourced Safely!</h4>
              <p className="text-xs text-gray-500 mt-1 max-w-xs mx-auto">
                Thank you, <strong>{name}</strong>. Our lead broker <strong>{leadBrokerName}</strong> is matching your parameters.
              </p>
              
              <div className="mt-5 p-4 bg-emerald-50 rounded-xl border border-emerald-100 flex flex-col gap-3 text-center">
                <p className="text-[11px] font-bold text-emerald-900 leading-relaxed">
                  To guarantee instant notification and start a direct dialogue with our Murang'a office, tap below to forward your parameters on WhatsApp:
                </p>
                <a
                  href={`https://wa.me/254722710580?text=${encodeURIComponent(`Hello Unique Merchants, I am submitting a property sourcing request:\n\n*Name*: ${name}\n*Email*: ${email || 'Not provided'}\n*Phone*: ${phone}\n*Preferred Location*: ${location}\n*Property Type*: ${propertyType}\n*Budget*: ${budget}\n*Details*: ${description}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-emerald-900 hover:bg-emerald-950 text-white text-xs font-bold uppercase py-3 px-4 rounded-xl flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
                >
                  <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24">
                    <path d="M12.012 2c-5.506 0-9.988 4.482-9.988 9.988 0 1.761.459 3.472 1.332 4.981L2 22l5.161-1.353c1.464.798 3.111 1.22 4.84 1.22 5.507 0 9.989-4.483 9.989-9.989A9.99 9.99 0 0012.012 2zm6.183 14.19c-.27.761-1.355 1.391-1.854 1.439-.49.049-.968.232-3.136-.667-2.613-1.083-4.281-3.754-4.412-3.929-.13-.174-1.055-1.401-1.055-2.673 0-1.272.651-1.898.88-2.147.23-.249.501-.311.667-.311h.478c.153 0 .358-.058.555.419.202.49.691 1.684.75 1.807.059.123.1.266.019.429-.082.164-.123.266-.245.41-.122.143-.257.32-.367.429-.122.122-.25.255-.108.5.142.245.632 1.042 1.355 1.684.93.829 1.713 1.085 1.956 1.208.244.123.385.102.528-.061.143-.164.61-.715.773-.959.163-.245.326-.204.544-.122.218.082 1.385.653 1.624.774.239.121.397.182.455.281.058.099.058.572-.213 1.333z" />
                  </svg>
                  Connect on WhatsApp
                </a>
              </div>

              <button
                onClick={() => {
                  setName("");
                  setEmail("");
                  setPhone("");
                  setDescription("");
                  setSubmitted(false);
                  onClose();
                }}
                className="mt-4 text-[10px] font-bold uppercase tracking-wider text-gray-400 hover:text-emerald-900 transition-colors cursor-pointer"
              >
                Close Window
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
            
            {/* Split row Name / Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 block">Your Full Name *</label>
                <div className="relative">
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. John Kamau" 
                    className="w-full bg-gray-50 border border-gray-200 px-3 py-2 pl-9 rounded-xl text-xs text-gray-800 focus:outline-none focus:border-emerald-900 focus:bg-white"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                  <User className="absolute left-3 top-2.5 w-3.5 h-3.5 text-gray-400" />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 block">Phone Number *</label>
                <div className="relative">
                  <input 
                    type="tel" 
                    required
                    placeholder="e.g. +254 712 345 678" 
                    className="w-full bg-gray-50 border border-gray-200 px-3 py-2 pl-9 rounded-xl text-xs text-gray-800 focus:outline-none focus:border-emerald-900 focus:bg-white"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                  <Phone className="absolute left-3 top-2.5 w-3.5 h-3.5 text-gray-400" />
                </div>
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 block">Email Address (Optional)</label>
              <div className="relative">
                <input 
                  type="email" 
                  placeholder="e.g. kamau@gmail.com" 
                  className="w-full bg-gray-50 border border-gray-200 px-3 py-2 pl-9 rounded-xl text-xs text-gray-800 focus:outline-none focus:border-emerald-900 focus:bg-white"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <Mail className="absolute left-3 top-2.5 w-3.5 h-3.5 text-gray-400" />
              </div>
            </div>

            {/* Preferred Location & Property Type split */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 block">Preferred Town</label>
                <select 
                  className="w-full bg-gray-50 border border-gray-200 px-2 py-2 rounded-xl text-xs text-gray-700 focus:outline-none focus:border-emerald-900"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                >
                  <option value="Kenol">Kenol</option>
                  <option value="Murang'a Town">Murang'a Town</option>
                  <option value="Makuyu">Makuyu</option>
                  <option value="Thika">Thika</option>
                  <option value="Juja">Juja</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 block">Property Type</label>
                <select 
                  className="w-full bg-gray-50 border border-gray-200 px-2 py-2 rounded-xl text-xs text-gray-700 focus:outline-none focus:border-emerald-900"
                  value={propertyType}
                  onChange={(e) => setPropertyType(e.target.value)}
                >
                  <option value="Maisonette">Maisonette</option>
                  <option value="Apartment">Apartment</option>
                  <option value="Plot">Plot (Land)</option>
                  <option value="Commercial Space">Commercial Space</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 block">Budget Bracket</label>
                <select 
                  className="w-full bg-gray-50 border border-gray-200 px-2 py-2 rounded-xl text-xs text-gray-700 focus:outline-none focus:border-emerald-900"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                >
                  <option value="Under KES 1 Million">Under KES 1M</option>
                  <option value="KES 1 Million - 5 Million">KES 1M - 5M</option>
                  <option value="KES 5 Million - 15 Million">KES 5M - 15M</option>
                  <option value="Above KES 15 Million">Above KES 15M</option>
                  <option value="Rental under KES 20K/mo">Rent &lt; KES 20K</option>
                  <option value="Rental KES 20K - 50K/mo">Rent KES 20K-50K</option>
                </select>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 block">Describe what you need in detail *</label>
              <textarea 
                required
                rows={3}
                placeholder="e.g., Looking for a flat 1/4 acre land in Kenol with red soil, 100 meters from the tarmac with a clean ready title deed. Budget is strictly within 3 million." 
                className="w-full bg-gray-50 border border-gray-200 px-3 py-2 rounded-xl text-xs text-gray-800 focus:outline-none focus:border-emerald-900 focus:bg-white resize-none"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-emerald-900 hover:bg-emerald-950 text-white py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all mt-2 cursor-pointer shadow-lg disabled:bg-gray-100 disabled:text-gray-400"
            >
              {isSubmitting ? 'Transmitting Securely...' : 'Submit Request to Broker'}
            </button>

          </form>
        )}

      </div>
    </div>
  );
}
