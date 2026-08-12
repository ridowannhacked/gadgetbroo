"use client";

import React, { useState, useEffect } from 'react';
import TiptapEditor from '@/components/admin/TiptapEditor';
import { toast } from 'sonner';

const PAGES = [
  { slug: 'privacy-policy', label: 'Privacy Policy' },
  { slug: 'terms-conditions', label: 'Terms & Conditions' },
  { slug: 'return-policy', label: 'Return Policy' },
];

export default function AdminPageEditor() {
  const [selectedSlug, setSelectedSlug] = useState('privacy-policy');
  const [language, setLanguage] = useState<'en' | 'bn'>('en');
  const [content, setContent] = useState('');
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchPage();
  }, [selectedSlug, language]);

  const fetchPage = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/pages?slug=${selectedSlug}&language=${language}`);
      const data = await res.json();
      if (res.ok && data.page) {
        setContent(data.page.content);
        setLastUpdated(new Date(data.page.updatedAt).toLocaleDateString());
      } else {
        setContent(''); // Reset if not found
        setLastUpdated(null);
      }
    } catch (error) {
      toast.error('Failed to load page content');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch('/api/pages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug: selectedSlug,
          language,
          content,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to save');
      }

      const data = await res.json();
      setLastUpdated(new Date(data.page.updatedAt).toLocaleDateString());
      toast.success('Page saved successfully!');
    } catch (error) {
      toast.error('Failed to save page');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-white mb-6">Page Editor</h1>

      <div className="bg-[#0f1219] border border-slate-800 rounded-xl p-6">
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="space-y-4">
            <select
              value={selectedSlug}
              onChange={(e) => setSelectedSlug(e.target.value)}
              className="bg-[#0a0a0a] border border-slate-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500 font-medium text-lg w-full sm:w-auto"
            >
              {PAGES.map((page) => (
                <option key={page.slug} value={page.slug}>
                  {page.label}
                </option>
              ))}
            </select>

            <div className="flex bg-[#0a0a0a] border border-slate-700 rounded-lg p-1 w-fit">
              <button
                onClick={() => setLanguage('en')}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  language === 'en' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                English
              </button>
              <button
                onClick={() => setLanguage('bn')}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  language === 'bn' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                বাংলা
              </button>
            </div>
          </div>
          
          <button
            onClick={handleSave}
            disabled={isSaving || isLoading}
            className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>

        {lastUpdated && (
          <p className="text-xs text-slate-500 mb-4 font-mono">
            Last Updated: {lastUpdated}
          </p>
        )}

        <div className="relative">
          {isLoading && (
            <div className="absolute inset-0 bg-[#0f1219]/50 backdrop-blur-[2px] z-10 flex items-center justify-center rounded-lg border border-slate-700">
              <span className="text-blue-500 font-medium animate-pulse">Loading...</span>
            </div>
          )}
          <TiptapEditor content={content} onChange={setContent} />
        </div>
      </div>
    </div>
  );
}
