
import React, { useState, useMemo } from 'react';
import { generateData, SEGMENTS_ORDERED, CONTEXTS_ORDERED } from './utils/dataGenerator';
import { Scene } from './components/Scene';
import { UIOverlay } from './components/UIOverlay';
import { DataPoint, JobCategory } from './types';
import { Layers, Smartphone, Briefcase, Filter } from 'lucide-react';

const App: React.FC = () => {
  const data = useMemo(() => generateData(600), []);
  
  const [selectedId, setSelectedId] = useState<string | null>(null);
  
  // Filter States
  const [activeSegmentIndex, setActiveSegmentIndex] = useState<number | null>(null); // Z
  const [activeContextIndex, setActiveContextIndex] = useState<number | null>(null); // Y
  const [activeJobCategory, setActiveJobCategory] = useState<JobCategory | null>(null); // X

  const handleNodeSelect = (node: DataPoint) => {
    setSelectedId(node.id);
  };

  const handleCloseUI = () => {
    setSelectedId(null);
  };

  const selectedData = useMemo(
    () => data.find((d) => d.id === selectedId) || null,
    [data, selectedId]
  );

  const resetFilters = () => {
    setActiveSegmentIndex(null);
    setActiveContextIndex(null);
    setActiveJobCategory(null);
  }

  const hasActiveFilters = activeSegmentIndex !== null || activeContextIndex !== null || activeJobCategory !== null;

  return (
    <div className="relative w-full h-screen bg-slate-950 overflow-hidden font-sans">
      
      {/* 3D Canvas */}
      <div className="absolute inset-0 z-0">
        <Scene 
          data={data} 
          selectedId={selectedId} 
          activeSegmentIndex={activeSegmentIndex}
          activeContextIndex={activeContextIndex}
          activeJobCategory={activeJobCategory}
          onNodeSelect={handleNodeSelect} 
        />
      </div>

      {/* Header */}
      <div className="absolute top-4 left-4 z-10 pointer-events-none">
        <h1 className="text-2xl font-bold text-white tracking-tight drop-shadow-md">
          Пространство Ценности
        </h1>
        <p className="text-slate-400 text-xs max-w-xs mt-1 drop-shadow-md">
          Интерактивная карта проблемных зон (Jobs) в контексте пользовательских сегментов.
        </p>
      </div>

      {/* Combined Filter Sidebar */}
      <div className="absolute top-24 left-4 z-10 w-64 flex flex-col gap-3 max-h-[80vh]">
        
        {/* SCROLLABLE CONTAINER FOR ALL LISTS */}
        <div className="flex flex-col gap-3 overflow-y-auto custom-scrollbar pr-1 pb-2">
            
            {/* X-AXIS: Jobs */}
            <div className="bg-slate-900/90 backdrop-blur border border-white/10 rounded-lg p-3 shadow-xl">
              <div className="flex items-center gap-2 mb-2 text-slate-300">
                <Briefcase size={14} className="text-orange-400" />
                <span className="text-xs font-bold uppercase">Customer Jobs (Ось X)</span>
              </div>
              <div className="space-y-1">
                {Object.values(JobCategory).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveJobCategory(activeJobCategory === cat ? null : cat)}
                    className={`w-full text-left px-2 py-1.5 rounded text-[10px] transition-all flex items-center justify-between ${
                      activeJobCategory === cat 
                        ? 'bg-orange-600 text-white' 
                        : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
                    }`}
                  >
                    <span className="truncate">{cat}</span>
                    {activeJobCategory === cat && <div className="w-1 h-1 rounded-full bg-white" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Z-AXIS: Segments */}
            <div className="bg-slate-900/90 backdrop-blur border border-white/10 rounded-lg p-3 shadow-xl">
            <div className="flex items-center gap-2 mb-2 text-slate-300">
                <Layers size={14} className="text-blue-400" />
                <span className="text-xs font-bold uppercase">Сегменты (Ось Z)</span>
            </div>
            <div className="space-y-0.5">
                {SEGMENTS_ORDERED.map((segment, index) => (
                <button
                    key={index}
                    onClick={() => setActiveSegmentIndex(activeSegmentIndex === index ? null : index)}
                    className={`w-full text-left px-2 py-1.5 rounded text-[10px] transition-all flex items-center justify-between ${
                    activeSegmentIndex === index 
                        ? 'bg-blue-600 text-white' 
                        : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
                    }`}
                >
                    <span className="truncate">{segment}</span>
                    {activeSegmentIndex === index && <div className="w-1 h-1 rounded-full bg-white" />}
                </button>
                ))}
            </div>
            </div>

            {/* Y-AXIS: Contexts */}
            <div className="bg-slate-900/90 backdrop-blur border border-white/10 rounded-lg p-3 shadow-xl">
            <div className="flex items-center gap-2 mb-2 text-slate-300">
                <Smartphone size={14} className="text-purple-400" />
                <span className="text-xs font-bold uppercase">Контексты (Ось Y)</span>
            </div>
            <div className="space-y-0.5">
                {CONTEXTS_ORDERED.map((context, index) => (
                <button
                    key={index}
                    onClick={() => setActiveContextIndex(activeContextIndex === index ? null : index)}
                    className={`w-full text-left px-2 py-1.5 rounded text-[10px] transition-all flex items-center justify-between ${
                    activeContextIndex === index 
                        ? 'bg-purple-600 text-white' 
                        : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
                    }`}
                >
                    <span className="truncate">{context}</span>
                    {activeContextIndex === index && <div className="w-1 h-1 rounded-full bg-white" />}
                </button>
                ))}
            </div>
            </div>
        </div>

        {/* RESET BUTTON */}
        {hasActiveFilters && (
            <button 
                onClick={resetFilters}
                className="bg-slate-900/90 backdrop-blur border border-red-900/30 text-red-400 hover:text-white hover:bg-red-900/50 p-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-xl flex-shrink-0"
            >
                <Filter size={12} />
                Сбросить фильтры
            </button>
        )}
      </div>

      {/* UI Overlay */}
      <UIOverlay 
        selectedData={selectedData} 
        allData={data}
        onClose={handleCloseUI} 
        onSelect={handleNodeSelect}
      />
    </div>
  );
};

export default App;
