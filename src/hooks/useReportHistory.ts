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

export function useReportHistory() {
  const [reports, setReports] = useState<SavedReport[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setReports(parsed);
        }
      }
    } catch (err) {
      console.error('Failed to load saved reports:', err);
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
