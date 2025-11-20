
import React, { useState, useMemo } from 'react';
import { generateData, SEGMENTS_ORDERED } from './utils/dataGenerator';
import { Scene } from './components/Scene';
import { UIOverlay } from './components/UIOverlay';
import { DataPoint } from './types';
import { Layers } from 'lucide-react';

const App: React.FC = () => {
  const data = useMemo(() => generateData(600), []);
  
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activeSegmentIndex, setActiveSegmentIndex] = useState<number | null>(null);

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

  return (
    <div className="relative w-full h-screen bg-slate-950 overflow-hidden font-sans">
      
      {/* 3D Canvas */}
      <div className="absolute inset-0 z-0">
        <Scene 
          data={data} 
          selectedId={selectedId} 
          activeSegmentIndex={activeSegmentIndex}
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

      {/* Segment Selector (Left Sidebar) */}
      <div className="absolute top-24 left-4 z-10 w-64">
        <div className="bg-slate-900/90 backdrop-blur border border-white/10 rounded-lg p-3 shadow-2xl">
          <div className="flex items-center gap-2 mb-3 pb-2 border-b border-white/10 text-slate-300">
            <Layers size={14} />
            <span className="text-xs font-bold uppercase">Сегменты (Ось Z)</span>
          </div>
          
          <div className="space-y-1 max-h-[60vh] overflow-y-auto custom-scrollbar pr-1">
            {SEGMENTS_ORDERED.map((segment, index) => (
              <button
                key={index}
                onClick={() => setActiveSegmentIndex(activeSegmentIndex === index ? null : index)}
                className={`w-full text-left px-2 py-1.5 rounded text-xs transition-all flex items-center justify-between group ${
                  activeSegmentIndex === index 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' 
                    : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
                }`}
              >
                <span>{segment}</span>
                {activeSegmentIndex === index && <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />}
              </button>
            ))}
          </div>
          
          {activeSegmentIndex !== null && (
            <button 
                onClick={() => setActiveSegmentIndex(null)}
                className="mt-3 w-full py-1 text-[10px] text-center text-slate-500 hover:text-slate-300 uppercase tracking-wider border border-dashed border-slate-700 rounded hover:border-slate-500"
            >
                Сбросить фильтр
            </button>
          )}
        </div>
      </div>

      {/* Legend (Bottom Left) */}
      <div className="absolute bottom-6 left-6 z-10 pointer-events-none bg-slate-900/80 backdrop-blur-sm p-4 rounded-lg border border-white/10">
        <h3 className="text-xs font-bold text-slate-400 uppercase mb-3">Типы проблем</h3>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)]"></span>
            <span className="text-xs text-slate-200">Обновить гардероб</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]"></span>
            <span className="text-xs text-slate-200">Найти замену</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></span>
            <span className="text-xs text-slate-200">Нестандартная фигура</span>
          </div>
        </div>
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
