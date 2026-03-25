import React from 'react';
import { TrendingDown } from 'lucide-react';

interface RevenueImpactCardProps {
  revenueImpact: string;
}

export const RevenueImpactCard = ({ revenueImpact }: RevenueImpactCardProps) => {
  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 shadow-sm transition-all hover:shadow-md">
      <div className="mb-3 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100">
          <TrendingDown className="h-6 w-6 text-amber-700" />
        </div>
        <h3 className="text-lg font-bold text-amber-900">
          Monthly Revenue Leakage
        </h3>
      </div>
      <p className="text-sm leading-relaxed text-amber-800">
        {revenueImpact}
      </p>
    </div>
  );
};
