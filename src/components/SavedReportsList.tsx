'use client';

import React from 'react';
import { SavedReport } from '@/hooks/useReportHistory';
import { Clock, Trash2, ExternalLink, Globe } from 'lucide-react';

interface SavedReportsListProps {
  reports: SavedReport[];
  activeReportId: string | null;
  onLoad: (id: string) => void;
  onDelete: (id: string) => void;
}

export const SavedReportsList = ({ reports, activeReportId, onLoad, onDelete }: SavedReportsListProps) => {
  const formatDate = (ts: number) => {
    const d = new Date(ts);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHrs = Math.floor(diffMs / 3600000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHrs < 24) return `${diffHrs}h ago`;
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-lg shadow-slate-100">
      <h3 className="mb-4 text-xs font-black uppercase tracking-[0.2em] text-slate-400">
        Saved Reports ({reports.length})
      </h3>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {reports.map(report => (
          <div
            key={report.id}
            className={`group relative flex flex-col gap-2 rounded-xl border p-4 transition-all cursor-pointer hover:shadow-md ${
              activeReportId === report.id
                ? 'border-indigo-300 bg-indigo-50/50 shadow-md shadow-indigo-100'
                : 'border-slate-200 bg-slate-50/50 hover:border-slate-300'
            }`}
            onClick={() => onLoad(report.id)}
          >
            <div className="flex items-start justify-between">
              <div className="min-w-0 flex-1">
                <h4 className="text-sm font-black text-slate-900 truncate">{report.companyName}</h4>
                <div className="flex items-center gap-1 mt-0.5">
                  <Globe className="h-2.5 w-2.5 text-slate-400" />
                  <p className="text-[10px] font-bold text-slate-400 truncate">{report.website}</p>
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(report.id);
                }}
                className="rounded-lg p-1.5 text-slate-300 opacity-0 transition-all group-hover:opacity-100 hover:bg-rose-50 hover:text-rose-500"
                title="Delete report"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
            <div className="flex items-center gap-1.5 mt-auto">
              <Clock className="h-2.5 w-2.5 text-slate-300" />
              <span className="text-[10px] font-bold text-slate-400">{formatDate(report.timestamp)}</span>
              {activeReportId === report.id && (
                <span className="ml-auto text-[9px] font-black uppercase tracking-wider text-indigo-600 bg-indigo-100 px-2 py-0.5 rounded-full">Active</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
