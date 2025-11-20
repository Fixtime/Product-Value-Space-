
import React, { useMemo } from 'react';
import { DataPoint } from '../types';
import { X, Activity, User, Smartphone, ArrowRight, Link, MessageSquare, Briefcase } from 'lucide-react';

interface UIOverlayProps {
  selectedData: DataPoint | null;
  allData: DataPoint[]; // We need full data to find related signals
  onClose: () => void;
  onSelect: (data: DataPoint) => void;
}

export const UIOverlay: React.FC<UIOverlayProps> = ({ selectedData, allData, onClose, onSelect }) => {
  
  // Calculate related signals (nearest neighbors in the same category)
  const relatedSignals = useMemo(() => {
    if (!selectedData || !allData) return [];
    
    return allData
      .filter(d => d.id !== selectedData.id && d.jobCategory === selectedData.jobCategory)
      .map(d => {
        // Euclidean distance
        const dx = d.position[0] - selectedData.position[0];
        const dy = d.position[1] - selectedData.position[1];
        const dz = d.position[2] - selectedData.position[2];
        const dist = Math.sqrt(dx*dx + dy*dy + dz*dz);
        return { ...d, distance: dist };
      })
      .sort((a, b) => a.distance - b.distance) // Sort by closest distance
      .slice(0, 5); // Take top 5
  }, [selectedData, allData]);

  if (!selectedData) return null;

  return (
    <div className="absolute top-4 right-4 w-96 animate-fade-in z-20 max-h-[95vh] overflow-y-auto custom-scrollbar">
      <div className="relative overflow-hidden rounded-xl border border-white/10 bg-slate-900/80 p-6 text-slate-200 shadow-2xl backdrop-blur-xl transition-all">
        
        {/* Decorative Glow */}
        <div 
          className="absolute -top-10 -right-10 h-40 w-40 rounded-full blur-3xl opacity-20 pointer-events-none"
          style={{ backgroundColor: selectedData.color }}
        />

        {/* Header */}
        <div className="mb-5 flex items-start justify-between relative z-10">
          <div className="flex items-center gap-2">
            <span 
              className="inline-block h-3 w-3 rounded-full shadow-[0_0_10px]" 
              style={{ backgroundColor: selectedData.color, boxShadow: `0 0 10px ${selectedData.color}` }} 
            />
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Сигнал {selectedData.id}
            </h2>
          </div>
          <button 
            onClick={onClose}
            className="rounded-full p-1 text-slate-400 hover:bg-white/10 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Main Description (Problem Name) */}
        <div className="mb-6 relative z-10">
          <h3 className="text-lg font-semibold text-white leading-snug">
            "{selectedData.description}"
          </h3>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 gap-3 mb-4 relative z-10">
          <div className="rounded-lg bg-white/5 p-3 border border-white/5">
            <div className="flex items-center gap-2 mb-1 text-xs text-slate-400">
              <Activity size={12} />
              <span>Влияние</span>
            </div>
            <div className="text-xl font-mono text-white font-bold">
              {selectedData.impactScore.toFixed(2)}
            </div>
          </div>

          <div className="rounded-lg bg-white/5 p-3 border border-white/5">
             <div className="flex items-center gap-2 mb-1 text-xs text-slate-400">
              <MessageSquare size={12} />
              <span>Источник</span>
            </div>
             <div className="text-xs font-medium text-white leading-tight mt-1">
               {selectedData.source}
            </div>
          </div>
        </div>

        {/* Detailed Context Blocks */}
        <div className="space-y-2 mb-6 relative z-10">
          
          {/* Segment (Z-Axis) */}
          <div className="rounded-lg bg-white/5 p-3 border border-white/5 flex items-start gap-3">
            <div className="mt-1 p-1.5 rounded bg-blue-500/20 text-blue-400">
              <User size={16} />
            </div>
            <div>
              <div className="text-xs text-slate-400 mb-0.5">Сегмент (Ось Z)</div>
              <div className="text-sm font-medium text-white">{selectedData.segment}</div>
            </div>
          </div>

          {/* Context (Y-Axis) */}
          <div className="rounded-lg bg-white/5 p-3 border border-white/5 flex items-start gap-3">
             <div className="mt-1 p-1.5 rounded bg-purple-500/20 text-purple-400">
              <Smartphone size={16} />
            </div>
            <div>
              <div className="text-xs text-slate-400 mb-0.5">Контекст (Ось Y)</div>
              <div className="text-sm font-medium text-white">{selectedData.context}</div>
            </div>
          </div>

          {/* Customer Job (X-Axis) */}
          <div className="rounded-lg bg-white/5 p-3 border border-white/5 flex items-start gap-3">
             <div className="mt-1 p-1.5 rounded bg-orange-500/20 text-orange-400">
              <Briefcase size={16} />
            </div>
            <div>
              <div className="text-xs text-slate-400 mb-0.5">Customer Job (Ось X)</div>
              <div className="text-sm font-medium text-white leading-tight">{selectedData.jobCategory}</div>
            </div>
          </div>

        </div>

        {/* Related Signals */}
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-3 text-xs font-bold uppercase text-slate-500 tracking-wider">
            <Link size={12} />
            <span>Связанные сигналы (Топ-5)</span>
          </div>
          
          <div className="space-y-2">
            {relatedSignals.map((signal) => (
              <button
                key={signal.id}
                onClick={() => onSelect(signal)}
                className="w-full text-left group p-2 rounded hover:bg-white/10 border border-transparent hover:border-white/5 transition-all flex items-center justify-between"
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <span 
                    className="w-1.5 h-1.5 rounded-full flex-shrink-0" 
                    style={{ backgroundColor: signal.color }}
                  />
                  <div className="truncate">
                    <div className="text-xs text-slate-300 truncate group-hover:text-white transition-colors">
                      {signal.description}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-slate-500 group-hover:text-slate-300 pl-2">
                  <span className="text-[10px] font-mono">{signal.impactScore.toFixed(1)}</span>
                  <ArrowRight size={10} />
                </div>
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
