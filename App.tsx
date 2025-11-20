
import React, { useState, useMemo } from 'react';
import { generateData, SEGMENTS_ORDERED, CONTEXTS_ORDERED } from './utils/dataGenerator';
import { Scene } from './components/Scene';
import { UIOverlay } from './components/UIOverlay';
import { DataPoint, JobCategory, JourneyStage, ImpactLevel } from './types';
import { Layers, Smartphone, Briefcase, Filter, Route, TrendingUp } from 'lucide-react';

const App: React.FC = () => {
  const data = useMemo(() => generateData(5000), []);
  
  const [selectedId, setSelectedId] = useState<string | null>(null);
  
  // Axis Filter States
  const [activeSegmentIndex, setActiveSegmentIndex] = useState<number | null>(null); // Z
  const [activeContextIndex, setActiveContextIndex] = useState<number | null>(null); // Y
  const [activeJobCategory, setActiveJobCategory] = useState<JobCategory | null>(null); // X
  
  // Stage Filter State (Multi-select)
  const [selectedStages, setSelectedStages] = useState<JourneyStage[]>([]);
  
  // Impact Filter State (Multi-select)
  const [selectedImpactLevels, setSelectedImpactLevels] = useState<ImpactLevel[]>([]);

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
    setSelectedStages([]);
    setSelectedImpactLevels([]);
  }

  const toggleStage = (stage: JourneyStage) => {
    setSelectedStages(prev => {
      if (prev.includes(stage)) {
        return prev.filter(s => s !== stage);
      } else {
        return [...prev, stage];
      }
    });
  };

  const toggleImpactLevel = (level: ImpactLevel) => {
    setSelectedImpactLevels(prev => {
      if (prev.includes(level)) {
        return prev.filter(l => l !== level);
      } else {
        return [...prev, level];
      }
    });
  };

  const hasActiveFilters = activeSegmentIndex !== null || activeContextIndex !== null || activeJobCategory !== null || selectedStages.length > 0 || selectedImpactLevels.length > 0;

  // Helper for job filter styling
  const getJobButtonStyle = (cat: JobCategory, isActive: boolean) => {
    return isActive 
      ? `bg-slate-600 text-white shadow-lg` 
      : 'text-slate-400 hover:bg-white/5 hover:text-slate-200';
  };

  // Color Map for Legend
  const STAGE_COLORS: Record<JourneyStage, string> = {
    [JourneyStage.AWARENESS]: '#a855f7',
    [JourneyStage.CONSIDERATION]: '#3b82f6',
    [JourneyStage.PURCHASE]: '#22c55e',
    [JourneyStage.ONBOARDING]: '#facc15',
    [JourneyStage.ACTIVE_USE]: '#ef4444',
    [JourneyStage.RETENTION]: '#ec4899',
    [JourneyStage.ADVOCACY]: '#22d3ee',
  };

  const IMPACT_COLORS: Record<ImpactLevel, string> = {
    [ImpactLevel.VERY_HIGH]: '#dc2626', // Red 600
    [ImpactLevel.HIGH]: '#ea580c',      // Orange 600
    [ImpactLevel.MEDIUM]: '#ca8a04',    // Yellow 600
    [ImpactLevel.LOW]: '#3b82f6',       // Blue 500
    [ImpactLevel.MICRO]: '#64748b',     // Slate 500
  };

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
          selectedStages={selectedStages}
          selectedImpactLevels={selectedImpactLevels}
          onNodeSelect={handleNodeSelect} 
        />
      </div>

      {/* Header */}
      <div className="absolute top-4 left-4 z-10 pointer-events-none">
        <h1 className="text-2xl font-bold text-white tracking-tight drop-shadow-md">
          Пространство Ценности
        </h1>
        <p className="text-slate-400 text-xs max-w-xs mt-1 drop-shadow-md">
          Интерактивная карта проблем (Jobs/Context/Segment).
          <br />
          <span className="opacity-70">Цвет сигнала = Стадия пользователя.</span>
        </p>
      </div>

      {/* Combined Filter Sidebar */}
      <div className="absolute top-24 left-4 z-10 w-64 flex flex-col gap-3 max-h-[80vh]">
        
        {/* SCROLLABLE CONTAINER FOR ALL LISTS */}
        <div className="flex flex-col gap-3 overflow-y-auto custom-scrollbar pr-1 pb-2">
            
            {/* X-AXIS: Jobs */}
            <div className="bg-slate-900/90 backdrop-blur border border-white/10 rounded-lg p-3 shadow-xl">
              <div className="flex items-center gap-2 mb-2 text-slate-300">
                <Briefcase size={14} className="text-slate-400" />
                <span className="text-xs font-bold uppercase">Customer Jobs (Ось X)</span>
              </div>
              <div className="space-y-1">
                {Object.values(JobCategory).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveJobCategory(activeJobCategory === cat ? null : cat)}
                    className={`w-full text-left px-2 py-1.5 rounded text-[10px] transition-all flex items-center justify-between ${getJobButtonStyle(cat, activeJobCategory === cat)}`}
                  >
                    <span className="truncate">{cat}</span>
                    {activeJobCategory === cat && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
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
                        ? 'bg-blue-600 text-white shadow-lg' 
                        : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
                    }`}
                >
                    <span className="truncate">{segment}</span>
                    {activeSegmentIndex === index && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
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
                        ? 'bg-purple-600 text-white shadow-lg' 
                        : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
                    }`}
                >
                    <span className="truncate">{context}</span>
                    {activeContextIndex === index && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
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

      {/* Right-side Filters (Impact + Stage) */}
      <div className="absolute bottom-6 right-6 z-10 flex flex-col gap-3">
        
        {/* Impact Level Filter */}
        <div className="bg-slate-900/90 backdrop-blur border border-white/10 rounded-lg p-3 shadow-xl max-w-[200px]">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
               <TrendingUp size={10} />
               Влияние на бизнес
            </h3>
            {selectedImpactLevels.length > 0 && (
              <span className="text-[9px] text-slate-500">Фильтр активен</span>
            )}
          </div>
          <div className="grid grid-cols-1 gap-1">
            {Object.values(ImpactLevel).map((level) => {
              const isSelected = selectedImpactLevels.includes(level);
              const isAnySelected = selectedImpactLevels.length > 0;
              const opacity = isAnySelected && !isSelected ? 'opacity-40 grayscale' : 'opacity-100';
              
              return (
                <button
                  key={level}
                  onClick={() => toggleImpactLevel(level)}
                  className={`flex items-center gap-2 w-full text-left p-1 rounded hover:bg-white/5 transition-all ${opacity} ${isSelected ? 'bg-white/5 ring-1 ring-white/10' : ''}`}
                >
                  <span 
                    className="w-1.5 h-4 rounded-sm shadow-[0_0_5px] flex-shrink-0"
                    style={{ backgroundColor: IMPACT_COLORS[level], boxShadow: `0 0 5px ${IMPACT_COLORS[level]}` }}
                  />
                  <span className={`text-[10px] transition-colors ${isSelected ? 'text-white font-medium' : 'text-slate-300'}`}>
                    {level}
                  </span>
                  {isSelected && <span className="ml-auto w-1 h-1 rounded-full bg-white"></span>}
                </button>
              );
            })}
          </div>
        </div>

        {/* Stage Filter */}
        <div className="bg-slate-900/90 backdrop-blur border border-white/10 rounded-lg p-3 shadow-xl max-w-[200px]">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Route size={10} />
              Стадия пути (CJM)
            </h3>
            {selectedStages.length > 0 && (
              <span className="text-[9px] text-slate-500">Фильтр активен</span>
            )}
          </div>
          
          <div className="grid grid-cols-1 gap-1">
            {Object.values(JourneyStage).map((stage) => {
              const isSelected = selectedStages.includes(stage);
              const isAnySelected = selectedStages.length > 0;
              const opacity = isAnySelected && !isSelected ? 'opacity-40 grayscale' : 'opacity-100';
              
              return (
                <button
                  key={stage}
                  onClick={() => toggleStage(stage)}
                  className={`flex items-center gap-2 w-full text-left p-1 rounded hover:bg-white/5 transition-all ${opacity} ${isSelected ? 'bg-white/5 ring-1 ring-white/10' : ''}`}
                >
                  <span 
                    className="w-2.5 h-2.5 rounded-full shadow-[0_0_5px] flex-shrink-0"
                    style={{ backgroundColor: STAGE_COLORS[stage], boxShadow: `0 0 5px ${STAGE_COLORS[stage]}` }}
                  />
                  <span className={`text-[10px] transition-colors ${isSelected ? 'text-white font-medium' : 'text-slate-300'}`}>
                    {stage}
                  </span>
                  {isSelected && <span className="ml-auto w-1 h-1 rounded-full bg-white"></span>}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* UI Overlay */}
      <UIOverlay 
        selectedData={selectedData} 
        allData={data}
        onClose={handleCloseUI} 
        onSelect={handleNodeSelect}
        
        // Pass active states
        activeSegmentIndex={activeSegmentIndex}
        activeContextIndex={activeContextIndex}
        activeJobCategory={activeJobCategory}
        
        // Pass setters
        onSetSegmentFilter={setActiveSegmentIndex}
        onSetContextFilter={setActiveContextIndex}
        onSetJobFilter={setActiveJobCategory}
      />
    </div>
  );
};

export default App;
