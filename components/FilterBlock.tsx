import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface FilterBlockProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
  headerExtra?: React.ReactNode;
}

export const FilterBlock: React.FC<FilterBlockProps> = ({ title, icon, children, defaultOpen = true, headerExtra }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="bg-slate-900/90 backdrop-blur border border-white/10 rounded-lg shadow-xl flex flex-col transition-all">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-3 text-left group flex-shrink-0"
      >
        <div className="flex items-center gap-2 text-slate-300 group-hover:text-white transition-colors">
          {icon}
          <span className="text-xs font-bold uppercase">{title}</span>
        </div>
        <div className="flex items-center gap-2">
            {headerExtra}
            <ChevronDown 
                size={14} 
                className={`text-slate-500 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} 
            />
        </div>
      </button>
      
      {isOpen && (
        <div className="px-3 pb-3 space-y-1 border-t border-white/5 pt-2 animate-fade-in">
          {children}
        </div>
      )}
    </div>
  );
};