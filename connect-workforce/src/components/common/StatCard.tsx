import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  change?: string;
  subtext?: string;
  color?: string;
}

export const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, subtext, color = 'bg-primary' }) => {
  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-200/80 shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">{title}</span>
        <div className={`w-10 h-10 rounded-xl ${color} bg-opacity-10 text-primary flex items-center justify-center font-bold`}>
          <Icon className="w-5 h-5 text-primary" />
        </div>
      </div>
      <div className="mt-3">
        <div className="text-3xl font-black text-gray-900 tracking-tight">{value}</div>
        {subtext && <div className="text-xs text-gray-500 font-medium mt-1">{subtext}</div>}
      </div>
    </div>
  );
};
