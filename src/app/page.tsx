'use client';

import React, { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { OutreachForm } from '@/components/OutreachForm';
import { ResultsDisplay } from '@/components/ResultsDisplay';
import { SavedReportsList } from '@/components/SavedReportsList';
import { generateOutreachAction, BrandData, OutreachResult } from './actions';
import { useReportHistory } from '@/hooks/useReportHistory';
import { AlertCircle, Key, Search, History } from 'lucide-react';

export default function Home() {
  const [formData, setFormData] = useState<BrandData>({
    companyName: '',
    website: '',
    products: '',
    category: '',
    targetAudience: '',
    competitors: '',
    customGeminiKey: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<OutreachResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [activeReportId, setActiveReportId] = useState<string | null>(null);

  const { reports, isLoaded, saveReport, deleteReport, loadReport } = useReportHistory();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await generateOutreachAction(formData);
      setResult(data);
      // Auto-save the report
      const saved = saveReport(formData, data);
      setActiveReportId(saved.id);
    } catch (err: any) {
      console.error('Error generating outreach:', err);
      setError(err.message || 'Failed to generate brand intelligence. Please check your network connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleLoadReport = (id: string) => {
    const report = loadReport(id);
    if (report) {
      setFormData(report.formData);
      setResult(report.result);
      setActiveReportId(report.id);
      setShowHistory(false);
      setError(null);
    }
  };

  const handleDeleteReport = (id: string) => {
    deleteReport(id);
    if (activeReportId === id) {
      setResult(null);
      setActiveReportId(null);
    }
  };

  const isAuthError = error?.toLowerCase().includes('key') || error?.toLowerCase().includes('auth');
  const isRateLimit = error?.toLowerCase().includes('limit');

  return (
    <main className="min-h-screen bg-[#fdfdfd] py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="mx-auto max-w-7xl">
        <Header />

        {/* History Toggle — always visible */}
        {isLoaded && (
          <div className="mb-8 no-print">
            <div className="flex justify-center mb-4">
              <button
                onClick={() => setShowHistory(!showHistory)}
                className={`flex items-center gap-2 rounded-2xl px-6 py-3 text-xs font-black uppercase tracking-widest transition-all ${
                  showHistory 
                    ? 'bg-slate-900 text-white shadow-xl' 
                    : 'bg-white text-slate-500 border border-slate-200 shadow-sm hover:shadow-md hover:border-slate-300'
                }`}
              >
                <History className="h-4 w-4" />
                {showHistory ? 'Hide' : 'View'} Saved Reports {reports.length > 0 && `(${reports.length})`}
              </button>
            </div>

            {/* Saved Reports Panel */}
            {showHistory && (
              <div className="animate-in fade-in slide-in-from-top-4 duration-300">
                {reports.length > 0 ? (
                  <SavedReportsList
                    reports={reports}
                    activeReportId={activeReportId}
                    onLoad={handleLoadReport}
                    onDelete={handleDeleteReport}
                  />
                ) : (
                  <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/50 p-8 text-center">
                    <History className="h-8 w-8 text-slate-300 mx-auto mb-3" />
                    <p className="text-sm font-bold text-slate-500">No saved reports yet</p>
                    <p className="text-xs text-slate-400 mt-1">Generate your first report and it will be auto-saved here.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {error && (
          <div className={`mb-8 flex items-start gap-4 rounded-2xl border p-5 animate-in fade-in slide-in-from-top-4 duration-500 ${
            isAuthError || isRateLimit
              ? 'border-amber-200 bg-amber-50 text-amber-900 shadow-sm shadow-amber-100' 
              : 'border-rose-200 bg-rose-50 text-rose-900 shadow-sm shadow-rose-100'
          }`}>
            <div className={`mt-0.5 rounded-full p-1.5 ${isAuthError || isRateLimit ? 'bg-amber-200/50 text-amber-700' : 'bg-rose-200/50 text-rose-700'}`}>
              <AlertCircle className="h-4 w-4" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-black uppercase tracking-tight">{isRateLimit ? 'Rate Limit Exceeded' : isAuthError ? 'API Key Issue' : 'Generation Error'}</h3>
              <p className="mt-1 text-sm leading-relaxed font-medium opacity-90">{error}</p>
              {(isAuthError || isRateLimit) && (
                <div className="mt-3 flex items-center gap-2 text-xs font-bold text-amber-700 bg-amber-200/30 w-fit px-2 py-1 rounded-md">
                  <Key className="h-3 w-3" />
                  Tip: Use the &quot;API Settings&quot; in the form to provide your own Gemini key.
                </div>
              )}
            </div>
          </div>
        )}

        {loading && (
          <div className="mb-8 flex items-center justify-center gap-3 rounded-2xl border border-indigo-100 bg-indigo-50/50 p-6 animate-pulse">
            <Search className="h-5 w-5 text-indigo-600 animate-bounce" />
            <p className="text-sm font-bold text-indigo-900 uppercase tracking-widest">Gemini is searching the web for real-world brand data...</p>
          </div>
        )}

        <div className={`grid gap-12 transition-all duration-700 ${result ? 'lg:grid-cols-2' : 'max-w-3xl mx-auto'}`}>
          <div className="relative">
            <div className="sticky top-12">
              <OutreachForm 
                formData={formData} 
                handleInputChange={handleInputChange} 
                generateOutreach={handleGenerate} 
                loading={loading} 
              />
            </div>
          </div>

          {result && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-700">
              <ResultsDisplay result={result} companyName={formData.companyName} />
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
