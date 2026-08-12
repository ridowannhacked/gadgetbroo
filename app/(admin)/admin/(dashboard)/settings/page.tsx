"use client";

import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { MediaPickerDialog } from '@/components/admin/media/MediaPickerDialog';

export default function SettingsPage() {
  const [bannerUrl, setBannerUrl] = useState<string | null>(null);
  const [faviconUrl, setFaviconUrl] = useState<string | null>(null);
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactAddress, setContactAddress] = useState('');
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  // Media Picker State
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerTarget, setPickerTarget] = useState<'banner' | 'favicon' | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/settings');
      const data = await res.json();
      if (res.ok && data.settings) {
        setBannerUrl(data.settings.bannerUrl);
        setFaviconUrl(data.settings.faviconUrl);
        setContactEmail(data.settings.contactEmail);
        setContactPhone(data.settings.contactPhone);
        setContactAddress(data.settings.contactAddress);
      }
    } catch (error) {
      toast.error('Failed to load settings');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!contactEmail || !contactPhone || !contactAddress) {
      toast.error('Please fill out all required contact fields');
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bannerUrl,
          faviconUrl,
          contactEmail,
          contactPhone,
          contactAddress,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        if (errorData?.details) {
          // Extract the first validation error message to show in toast
          const firstErrorField = Object.values(errorData.details)[0] as string[];
          throw new Error(firstErrorField?.[0] || 'Validation failed');
        }
        throw new Error(errorData?.error || 'Failed to save');
      }

      const data = await res.json();
      toast.success('Settings saved successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  const handleMediaSelect = (selected: any) => {
    if (Array.isArray(selected)) return; // Only accept single selection
    if (pickerTarget === 'banner') {
      setBannerUrl(selected.url);
    } else if (pickerTarget === 'favicon') {
      setFaviconUrl(selected.url);
    }
    setPickerOpen(false);
  };

  const openPicker = (target: 'banner' | 'favicon') => {
    setPickerTarget(target);
    setPickerOpen(true);
  };

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[500px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl">
      <h1 className="text-2xl font-bold text-white mb-6">Settings</h1>

      <div className="bg-[#0f1219] border border-slate-800 rounded-xl p-6">
        
        {/* Banner Section */}
        <div className="mb-8 border-b border-slate-800 pb-8">
          <h2 className="text-lg font-semibold text-white mb-4">Banner Logo</h2>
          <p className="text-sm text-slate-400 mb-4">
            Recommended: wide image (e.g., 1280x300px). PNG or SVG with transparent background works best. If removed, the storefront will display text.
          </p>
          
          <div className="flex flex-col sm:flex-row items-start gap-4">
            <div className="w-full sm:w-64 h-24 bg-[#0a0a0a] border border-slate-700 rounded-lg flex items-center justify-center overflow-hidden relative group">
              {bannerUrl ? (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={bannerUrl} alt="Banner" className="w-full h-full object-contain p-2" />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <button onClick={() => setBannerUrl(null)} className="p-2 bg-red-600 rounded-full text-white hover:bg-red-500 transition">
                      <X size={16} />
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center text-slate-500">
                  <ImageIcon size={24} className="mb-2" />
                  <span className="text-xs">No Banner</span>
                </div>
              )}
            </div>
            
            <button
              onClick={() => openPicker('banner')}
              className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white rounded-lg transition text-sm"
            >
              <Upload size={16} />
              Upload Image
            </button>
          </div>
        </div>

        {/* Favicon Section */}
        <div className="mb-8 border-b border-slate-800 pb-8">
          <h2 className="text-lg font-semibold text-white mb-4">Favicon (Small Logo)</h2>
          <p className="text-sm text-slate-400 mb-4">
            Recommended: square image (e.g., 512x512px). Displayed on mobile views and small spaces. If removed, the storefront will display "GB".
          </p>
          
          <div className="flex flex-col sm:flex-row items-start gap-4">
            <div className="w-24 h-24 bg-[#0a0a0a] border border-slate-700 rounded-lg flex items-center justify-center overflow-hidden relative group">
              {faviconUrl ? (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={faviconUrl} alt="Favicon" className="w-full h-full object-contain p-2" />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <button onClick={() => setFaviconUrl(null)} className="p-2 bg-red-600 rounded-full text-white hover:bg-red-500 transition">
                      <X size={16} />
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center text-slate-500">
                  <ImageIcon size={24} className="mb-2" />
                  <span className="text-xs">No Favicon</span>
                </div>
              )}
            </div>
            
            <button
              onClick={() => openPicker('favicon')}
              className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white rounded-lg transition text-sm"
            >
              <Upload size={16} />
              Upload Image
            </button>
          </div>
        </div>

        {/* Contact Info Section */}
        <div className="space-y-6 mb-8">
          <h2 className="text-lg font-semibold text-white">Contact Information</h2>
          
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">Contact Email *</label>
            <input
              type="email"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              className="w-full bg-[#0a0a0a] border border-slate-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
              placeholder="e.g. contact@gadgetbroo.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">Contact Phone *</label>
            <input
              type="text"
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
              className="w-full bg-[#0a0a0a] border border-slate-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
              placeholder="e.g. +8801881835612"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">Contact Address *</label>
            <textarea
              value={contactAddress}
              onChange={(e) => setContactAddress(e.target.value)}
              rows={3}
              className="w-full bg-[#0a0a0a] border border-slate-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
              placeholder="Full physical address"
              required
            />
          </div>
        </div>

        <div>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-lg font-medium transition-colors disabled:opacity-50"
          >
            {isSaving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>

      </div>

      <MediaPickerDialog
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        onSelect={handleMediaSelect}
        multiple={false}
        allowedTypes="image"
      />
    </div>
  );
}
