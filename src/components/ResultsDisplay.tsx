'use client';

import React, { useState } from 'react';
import { FileText, Check, Copy, MessageSquare, PieChart, Sparkles, Printer, Search, TrendingDown, Zap, Download } from 'lucide-react';
import { OutreachResult } from '@/app/actions';
import { stripMarkdown } from '@/hooks/useReportHistory';
import { generateReportPDF, generateStrategicReportPDF, generateOutreachPDF } from '@/utils/pdfExport';
import ReactMarkdown from 'react-markdown';

interface ResultsDisplayProps {
  result: OutreachResult;
  companyName: string;
}

export const ResultsDisplay = ({ result, companyName }: ResultsDisplayProps) => {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const copyToClipboard = async (text: string, section: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedSection(section);
      setTimeout(() => setCopiedSection(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadReport = () => {
    generateReportPDF(result, companyName);
  };

  const handleDownloadOutreach = () => {
    generateOutreachPDF(result.connectionMsg, result.followUpMsg, companyName);
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-right-4 duration-700 print:m-0 print:p-0">
      <div className="flex items-center justify-between no-print">
        <h2 className="text-sm font-black uppercase tracking-widest text-slate-400">AEO Intelligence Report</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={handleDownloadReport}
            className="flex items-center gap-2 rounded-xl bg-white border border-slate-200 px-4 py-2 text-xs font-bold text-slate-700 shadow-sm transition-all hover:shadow-md hover:border-slate-300 active:scale-95"
          >
            <Download className="h-3.5 w-3.5" />
            Save Report
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-xs font-black text-white shadow-xl transition-all hover:bg-black active:scale-95"
          >
            <Printer className="h-3.5 w-3.5" />
            Export PDF
          </button>
        </div>
      </div>

      <div id="printable-report" className="flex flex-col gap-6">
        
        {/* Revenue Impact - Hero Card */}
        {result.revenueImpact && (
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-rose-600 to-rose-800 p-6 text-white shadow-2xl shadow-rose-200">
            <div className="relative z-10">
              <div className="mb-3 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur-md">
                  <TrendingDown className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-black tracking-tight">Revenue at Stake</h3>
              </div>
              <p className="text-sm font-bold leading-relaxed text-rose-100">
                {result.revenueImpact}
              </p>
            </div>
            <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/5 blur-2xl"></div>
          </div>
        )}

        {/* Brand Summary */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-lg shadow-slate-100 transition-all hover:shadow-xl print:shadow-none print:border-none">
          <h3 className="mb-4 flex items-center gap-2 text-lg font-black text-slate-900 pr-icon-title">
            <PieChart className="h-5 w-5 text-indigo-600 no-print" />
            Brand Intelligence Profile
          </h3>
          <div className="pr-markdown">
            <ReactMarkdown>{result.brandSummary}</ReactMarkdown>
          </div>
        </section>

        {/* Search Queries */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-lg shadow-slate-100 transition-all hover:shadow-xl print:shadow-none print:border-none">
          <h3 className="mb-4 flex items-center gap-2 text-lg font-black text-slate-900 pr-icon-title">
            <Sparkles className="h-5 w-5 text-indigo-600 no-print" />
            Target AI Search Queries
          </h3>
          <div className="pr-markdown">
            <ReactMarkdown>{result.queries}</ReactMarkdown>
          </div>
        </section>

        {/* AI Ranking Audit */}
        {result.rankingAudit && (
          <section className="rounded-2xl border-2 border-amber-200 bg-amber-50/50 p-6 shadow-lg shadow-amber-100 transition-all hover:shadow-xl print:shadow-none print:border-none">
            <h3 className="mb-4 flex items-center gap-2 text-lg font-black text-slate-900 pr-icon-title">
              <Search className="h-5 w-5 text-amber-600 no-print" />
              AI Ranking Audit
            </h3>
            <p className="mb-4 text-xs font-bold uppercase tracking-wider text-amber-700 bg-amber-100 px-3 py-1.5 rounded-lg w-fit">
              Live search results as of today
            </p>
            <div className="pr-markdown">
              <ReactMarkdown>{result.rankingAudit}</ReactMarkdown>
            </div>
          </section>
        )}

        {/* Intelligence Report */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-lg shadow-slate-100 transition-all hover:shadow-xl print:shadow-none print:border-none">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-lg font-black text-slate-900 pr-icon-title">
              <FileText className="h-5 w-5 text-indigo-600 no-print" />
              Strategic Intelligence Report
            </h3>
            <div className="flex items-center gap-2 no-print">
              <button
                onClick={() => {
                  generateStrategicReportPDF(result.report, companyName);
                }}
                className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-600 transition-all hover:bg-slate-100"
              >
                <Download className="h-3.5 w-3.5" />
                Download Report
              </button>
            </div>
          </div>
          <div className="pr-markdown">
            <ReactMarkdown>{result.report}</ReactMarkdown>
          </div>
        </section>

        {/* LinkedIn Messages */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-lg shadow-slate-100 transition-all hover:shadow-xl print:shadow-none print:border-none">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-lg font-black text-slate-900 pr-icon-title">
              <MessageSquare className="h-5 w-5 text-indigo-600 no-print" />
              LinkedIn Outreach Package
            </h3>
            <div className="no-print">
              <button
                onClick={handleDownloadOutreach}
                className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-600 transition-all hover:bg-slate-100"
              >
                <Download className="h-3 w-3" />
                Save Messages
              </button>
            </div>
          </div>
          
          <div className="mb-6 space-y-3 print:mb-8">
            <MessageHeader label="Connection Request" count={result.connectionMsg.length} limit={250} />
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm italic text-slate-700 print:bg-white print:border-indigo-100">
              {result.connectionMsg}
            </div>
            <div className="no-print">
              <CopyButton 
                onClick={() => copyToClipboard(result.connectionMsg, 'conn')} 
                isCopied={copiedSection === 'conn'} 
                label="Copy"
              />
            </div>
          </div>

          <div className="space-y-3">
            <MessageHeader label="Follow-up Message" count={result.followUpMsg.length} limit={500} />
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm italic text-slate-700 print:bg-white print:border-indigo-100">
              {result.followUpMsg}
            </div>
            <div className="no-print">
              <CopyButton 
                onClick={() => copyToClipboard(result.followUpMsg, 'followup')} 
                isCopied={copiedSection === 'followup'} 
                label="Copy"
              />
            </div>
          </div>
        </section>

        {/* Footer CTA */}
        <div className="rounded-2xl border border-indigo-100 bg-indigo-50/50 p-6 text-center print:bg-white">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Zap className="h-5 w-5 text-indigo-600" />
            <p className="text-sm font-black text-slate-900">This is a complimentary mini-report.</p>
          </div>
          <p className="text-xs text-slate-500 font-bold max-w-md mx-auto">
            Our full AEO audit identifies 15-20 optimization opportunities with implementation roadmaps, competitor deep-dives, and projected ROI timelines.
          </p>
        </div>
      </div>

      <p className="mt-4 text-center text-[9px] font-black text-slate-300 uppercase tracking-[0.3em] no-print">
        Powered by AEO Intelligence Engine
      </p>
    </div>
  );
};

const CopyButton = ({ onClick, isCopied, label = 'Copy' }: { onClick: () => void, isCopied: boolean, label?: string }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-all ${
      isCopied 
        ? 'border-emerald-500 bg-emerald-50 text-emerald-700' 
        : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
    }`}
  >
    {isCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
    {isCopied ? 'Copied' : label}
  </button>
);

const MessageHeader = ({ label, count, limit }: { label: string, count: number, limit: number }) => (
  <div className="flex items-center justify-between">
    <span className="text-xs font-black uppercase tracking-wider text-slate-500">{label}</span>
    <span className={`text-xs font-medium no-print ${count > limit ? 'text-rose-500' : 'text-slate-400'}`}>
      {count} / {limit} characters
    </span>
  </div>
);
