'use client';

import { useState, useEffect, useCallback } from 'react';
import { OutreachResult, BrandData } from '@/app/actions';

export interface SavedReport {
  id: string;
  timestamp: number;
  companyName: string;
  website: string;
  formData: BrandData;
  result: OutreachResult;
}

const STORAGE_KEY = 'aeo-saved-reports';

const INITIAL_REPORTS: SavedReport[] = [
  {
    id: "report_welcome_gudhgram",
    timestamp: 1711370000000,
    companyName: "Gudhgram",
    website: "gudhgram.com",
    formData: {
      companyName: "Gudhgram",
      website: "gudhgram.com",
      products: "Coworking Space, Managed Offices, Private Cabins",
      category: "Real Estate / Coworking",
      targetAudience: "Startups, Freelancers, SMEs in Gurgaon",
      competitors: "Awfis, Innov8, WeWork, 91Springboard"
    },
    result: {
      brandSummary: "Premium coworking space network in Gurgaon specializing in Lander-focused business hubs.",
      queries: "best coworking near Cyber City, managed offices Gurgaon, affordable private office DLF Phase 3",
      rankingAudit: "Gudhgram is currently outranked by aggregators for all primary Gurgaon intent queries.",
      revenueImpact: "₹4,50,000 monthly slippage",
      report: `### 🔍 AI RANKING AUDIT: GUDHGRAM\n\nDirect queries for **'Coworking space near Cyber City'** and **'Managed offices Gurgaon'** currently prioritize aggregator sites (Innov8, Awfis, WeWork) and map results over direct brand citations for Gudhgram. This lack of 'AI Trusted' status in Gemini and Perplexity results means potential leads are being diverted to larger competitors before they even see your site.\n\n### 💡 REVENUE AT STAKE\n\n**Estimated monthly revenue gap: ₹4,50,000 — based on ~1,200 monthly AI-driven queries in the Gurgaon sector with a 15% conversion rate and ₹25,000 AOV.**\n\n### 🚀 STRATEGIC QUICK WINS\n\n1. **UVP Dominance**: Leverage the 'Lander' location focus. AI engines prioritize hyper-local authority signals.\n2. **Grounding Optimization**: Update your Meta descriptions to include direct answers to 'What is the best coworking price in Gurgaon?' to trigger AI snippets.\n3. **Content Authority**: Create a 'Gurgaon Startup Guide' to establish Gudhgram as an ecosystem lead, forcing AI models to cite your domain as a primary source.`,
      connectionMsg: "Hi! Noticed Gudhgram's 'Lander' location is missing from top AI coworking recommendations in Gurgaon. I've prepared a report showing how to reclaim ₹4.5L+ in monthly revenue by optimizing for AI citations. Would you like to see the audit?",
      followUpMsg: "Following up on the Gurgaon AEO audit for Gudhgram. Are you free for a 10-min call tomorrow?"
    }
  }
];

export function useReportHistory() {
  const [reports, setReports] = useState<SavedReport[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setReports(parsed);
        } else {
          // If empty array, still seed with initial reports
          setReports(INITIAL_REPORTS);
        }
      } else {
        // If null (never visited), seed
        setReports(INITIAL_REPORTS);
      }
    } catch (err) {
      console.error('Failed to load saved reports:', err);
      setReports(INITIAL_REPORTS);
    }
    setIsLoaded(true);
  }, []);

  // Save to localStorage whenever reports change
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(reports));
      } catch (err) {
        console.error('Failed to save reports:', err);
      }
    }
  }, [reports, isLoaded]);

  const saveReport = useCallback((formData: BrandData, result: OutreachResult) => {
    const newReport: SavedReport = {
      id: `report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      companyName: formData.companyName,
      website: formData.website,
      formData,
      result,
    };
    setReports(prev => [newReport, ...prev]);
    return newReport;
  }, []);

  const deleteReport = useCallback((id: string) => {
    setReports(prev => prev.filter(r => r.id !== id));
  }, []);

  const loadReport = useCallback((id: string) => {
    return reports.find(r => r.id === id) || null;
  }, [reports]);

  return { reports, isLoaded, saveReport, deleteReport, loadReport };
}

/**
 * Strips markdown syntax from text for clean sharing
 */
export function stripMarkdown(text: string): string {
  if (!text) return '';
  return text
    // Remove headers (### Header)
    .replace(/^#{1,6}\s+/gm, '')
    // Remove bold (**text**)
    .replace(/\*\*(.*?)\*\*/g, '$1')
    // Remove bold (__text__)
    .replace(/__(.*?)__/g, '$1')
    // Remove remaining single asterisks used for italic (simple approach)
    .replace(/\*(.*?)\*/g, '$1')
    // Remove emoji at start of lines  
    .replace(/^[\u{1F50D}\u{26A1}\u{1F4CA}\u{1F680}\u{2705}\u{274C}]\s*/gmu, '')
    // Clean up extra whitespace
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/**
 * Downloads text as a .txt file
 */
export function downloadAsTextFile(content: string, filename: string) {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
