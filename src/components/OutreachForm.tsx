import React, { useState, useEffect } from 'react';
import { Loader2, Send, Zap, Settings, ChevronDown, ChevronUp, Key, Globe, Sparkles, ShieldCheck, Trash2 } from 'lucide-react';
import { BrandData, saveApiKeyAction, clearApiKeyAction, hasSavedKeyAction } from '@/app/actions';

interface OutreachFormProps {
  formData: BrandData;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  generateOutreach: () => void;
  loading: boolean;
}

export const OutreachForm = ({ formData, handleInputChange, generateOutreach, loading }: OutreachFormProps) => {
  const [showSettings, setShowSettings] = useState(false);
  const [isKeySaved, setIsKeySaved] = useState(false);
  const [rememberKey, setRememberKey] = useState(false);

  useEffect(() => {
    const checkKey = async () => {
      const exists = await hasSavedKeyAction();
      setIsKeySaved(exists);
      if (exists) setRememberKey(true);
    };
    checkKey();
  }, []);

  const handleSaveToggle = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    setRememberKey(checked);
    
    if (!checked && isKeySaved) {
      await clearApiKeyAction();
      setIsKeySaved(false);
    } else if (checked && formData.customGeminiKey) {
      await saveApiKeyAction(formData.customGeminiKey);
      setIsKeySaved(true);
    }
  };

  const clearSavedKey = async () => {
    await clearApiKeyAction();
    setIsKeySaved(false);
    setRememberKey(false);
  };

  const isFormValid = formData.companyName && formData.website && formData.products && formData.category;

  return (
    <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-2xl shadow-indigo-100 transition-all hover:shadow-indigo-200">
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-xl shadow-indigo-200">
            <Sparkles className="h-6 w-6" />
          </div>
          <div className="min-w-0">
            <h2 className="text-xl font-black text-slate-900 tracking-tight leading-none mb-1">Brand Intelligence</h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">AEO Visibility Input</p>
          </div>
        </div>
        <button
          onClick={() => setShowSettings(!showSettings)}
          className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-black transition-all ${
            showSettings ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
          }`}
        >
          <Settings className="h-4 w-4" />
          {showSettings ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
      </div>
      
      <div className="space-y-6">
        {/* API Settings Collapsible */}
        {showSettings && (
          <div className="mb-6 space-y-4 rounded-2xl border border-indigo-100 bg-indigo-50/50 p-5 animate-in slide-in-from-top-4 duration-300">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400">
              <Key className="h-3 w-3" />
              API Settings
            </div>
            <div className="space-y-4">
              <div className="relative">
                <input
                  type="password"
                  name="customGeminiKey"
                  value={formData.customGeminiKey || ''}
                  onChange={async (e) => {
                    handleInputChange(e);
                    // If "remember" is on, update the saved cookie as they type (or better, on blur/submit)
                    // For now, let the checkbox handle the explicit save
                  }}
                  placeholder={isKeySaved ? "••••••••••••••••" : "Enter custom Gemini 2.5 API key..."}
                  className="block w-full rounded-xl border border-indigo-100 bg-white px-4 py-3 text-sm text-slate-900 shadow-inner placeholder:text-slate-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 focus:outline-none"
                />
                {isKeySaved && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 rounded-lg bg-emerald-50 px-2 py-1 border border-emerald-100">
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                    <span className="text-[10px] font-bold text-emerald-700">Saved</span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between gap-4">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <div className="relative flex items-center">
                    <input
                      type="checkbox"
                      checked={rememberKey}
                      onChange={async (e) => {
                        const checked = e.target.checked;
                        setRememberKey(checked);
                        if (checked && formData.customGeminiKey) {
                          await saveApiKeyAction(formData.customGeminiKey);
                          setIsKeySaved(true);
                        } else if (!checked) {
                          await clearApiKeyAction();
                          setIsKeySaved(false);
                        }
                      }}
                      className="peer h-4 w-4 rounded border-indigo-200 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-0"
                    />
                  </div>
                  <span className="text-[11px] font-bold text-indigo-600/70 group-hover:text-indigo-600 transition-colors">
                    Remember my key securely
                  </span>
                </label>

                {isKeySaved && (
                  <button
                    onClick={clearSavedKey}
                    className="flex items-center gap-1 text-[10px] font-bold text-rose-400 hover:text-rose-600 transition-colors"
                  >
                    <Trash2 className="h-3 w-3" />
                    Clear Saved Key
                  </button>
                )}
              </div>

              <div className="rounded-xl bg-white/50 p-3 border border-indigo-100/50">
                <p className="text-[10px] leading-relaxed text-indigo-400 font-medium">
                  <span className="font-black uppercase tracking-wider text-[9px] mr-1">Security:</span> 
                  Keys are encrypted using AES-256-GCM and stored in HttpOnly cookies. They are never exposed to the browser's JavaScript.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Model Info Banner */}
        <div className="relative overflow-hidden rounded-2xl bg-slate-900 p-5 text-white shadow-2xl shadow-slate-900/40">
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/20 shadow-inner">
                <Zap className="h-5 w-5 text-indigo-400" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-black tracking-wide">Gemini 2.5 Active</p>
                  <div className="flex items-center gap-1 rounded-full bg-emerald-400/20 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-emerald-400 border border-emerald-400/30">
                    <Globe className="h-2.5 w-2.5" />
                    Grounded
                  </div>
                </div>
                <p className="truncate text-[11px] font-bold text-slate-500">Live Search Intelligence Enabled</p>
              </div>
            </div>
          </div>
          <div className="absolute top-0 right-0 h-32 w-32 -translate-y-12 translate-x-12 rounded-full bg-indigo-500/10 blur-3xl"></div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-[10px] font-black uppercase tracking-[0.15em] text-slate-500 ml-1">Company Name *</label>
            <input
              type="text"
              name="companyName"
              value={formData.companyName}
              onChange={handleInputChange}
              className="block w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3.5 text-sm text-slate-800 placeholder:text-slate-300 transition-all focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/5 focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-2 block text-[10px] font-black uppercase tracking-[0.15em] text-slate-500 ml-1">Website *</label>
            <input
              type="text"
              name="website"
              value={formData.website}
              onChange={handleInputChange}
              className="block w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3.5 text-sm text-slate-800 placeholder:text-slate-300 transition-all focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/5 focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="mb-2 block text-[10px] font-black uppercase tracking-[0.15em] text-slate-500 ml-1">Products & Services *</label>
          <textarea
            name="products"
            value={formData.products}
            onChange={handleInputChange}
            rows={2}
            className="block w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3.5 text-sm text-slate-800 placeholder:text-slate-300 transition-all focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/5 focus:outline-none"
          />
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-[10px] font-black uppercase tracking-[0.15em] text-slate-500 ml-1">Category *</label>
            <input
              type="text"
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              className="block w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3.5 text-sm text-slate-800 placeholder:text-slate-300 transition-all focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/5 focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-2 block text-[10px] font-black uppercase tracking-[0.15em] text-slate-500 ml-1">Target Audience</label>
            <input
              type="text"
              name="targetAudience"
              value={formData.targetAudience}
              onChange={handleInputChange}
              className="block w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3.5 text-sm text-slate-800 placeholder:text-slate-300 transition-all focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/5 focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="mb-2 block text-[10px] font-black uppercase tracking-[0.15em] text-slate-500 ml-1">Potential Competitors</label>
          <input
            type="text"
            name="competitors"
            value={formData.competitors}
            onChange={handleInputChange}
            className="block w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3.5 text-sm text-slate-800 placeholder:text-slate-300 transition-all focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/5 focus:outline-none"
          />
        </div>

        <button
          onClick={generateOutreach}
          disabled={loading || !isFormValid}
          className={`group mt-4 flex w-full items-center justify-center gap-3 rounded-2xl px-6 py-5 text-sm font-black text-white shadow-2xl transition-all active:scale-95 ${
            loading 
              ? 'bg-slate-400 cursor-not-allowed shadow-none' 
              : 'bg-slate-950 border-t border-white/10 hover:bg-black shadow-indigo-100'
          }`}
        >
          {loading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Searching Real-world Insights...
            </>
          ) : (
            <>
              <Send className="h-4 w-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
              Analyze Brand Visibility
            </>
          )}
        </button>
        
        <div className="flex items-center justify-center gap-6 pt-4">
           <div className="h-[1px] flex-1 bg-slate-200"></div>
           <p className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-400">Powered by Gemini High Access</p>
           <div className="h-[1px] flex-1 bg-slate-200"></div>
        </div>
      </div>
    </div>
  );
};
