
import React, { useState, useMemo } from 'react';
import { generateData, SEGMENTS_ORDERED, CONTEXTS_ORDERED } from './utils/dataGenerator';
import { Scene } from './components/Scene';
import { UIOverlay } from './components/UIOverlay';
import { DataPoint, JobCategory, JourneyStage, ImpactLevel } from './types';
import { Layers, Smartphone, Briefcase, Filter, Route, TrendingUp, Activity, Zap } from 'lucide-react';

const App: React.FC = () => {
  const data = useMemo(() => generateData(5000), []);
  
  const [selectedId, setSelectedId] = useState<string | null>(null);
  
  // Axis Filter States
  const [activeSegmentIndex, setActiveSegmentIndex] = useState<number | null>(null); // Z
  const [activeContextIndex, setActiveContextIndex] = useState<number | null>(null); // Y
  const [activeJobCategory, setActiveJobCategory] = useState<JobCategory | null>(null); // X
  const [activeClusterName, setActiveClusterName] = useState<string | null>(null); // Cluster Filter
  
  // Stage Filter State (Multi-select)
  const [selectedStages, setSelectedStages] = useState<JourneyStage[]>([]);
  
  // Impact Filter State (Multi-select)
  const [selectedImpactLevels, setSelectedImpactLevels] = useState<ImpactLevel[]>([]);

  // Pulsar Filter State
  const [showPulsars, setShowPulsars] = useState<boolean>(false);

  // --- AGGREGATION & SORTING LOGIC ---
  const { sortedJobs, sortedSegments, sortedContexts } = useMemo(() => {
    const jobImpact: Record<string, number> = {};
    const segImpact: Record<string, number> = {};
    const ctxImpact: Record<string, number> = {};

    // Aggregate Impact Scores
    data.forEach(d => {
      jobImpact[d.jobCategory] = (jobImpact[d.jobCategory] || 0) + d.impactScore;
      segImpact[d.segment] = (segImpact[d.segment] || 0) + d.impactScore;
      ctxImpact[d.context] = (ctxImpact[d.context] || 0) + d.impactScore;
    });

    // Helper to process list
    // Returns sorted items with score and original index
    const processList = <T,>(items: T[], impactMap: Record<string, number>, getValue: (i: T) => string) => {
      const maxVal = Math.max(...Object.values(impactMap));
      
      return items.map((item, index) => {
        const val = getValue(item);
        const score = impactMap[val] || 0;
        return {
          item,
          originalIndex: index, // Keep original index for filter logic
          value: val,
          score,
          percent: maxVal > 0 ? (score / maxVal) * 100 : 0
        };
      }).sort((a, b) => b.score - a.score); // Descending Sort (Highest Impact First)
    };

    return {
      sortedJobs: processList(Object.values(JobCategory), jobImpact, (c) => c),
      sortedSegments: processList(SEGMENTS_ORDERED, segImpact, (s) => s),
      sortedContexts: processList(CONTEXTS_ORDERED, ctxImpact, (c) => c),
    };
  }, [data]);

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
    setActiveClusterName(null);
    setSelectedStages([]);
    setSelectedImpactLevels([]);
    setShowPulsars(false);
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

  const hasActiveFilters = activeSegmentIndex !== null || activeContextIndex !== null || activeJobCategory !== null || activeClusterName !== null || selectedStages.length > 0 || selectedImpactLevels.length > 0 || showPulsars;

  // Helper for job filter styling
  const getFilterButtonStyle = (isActive: boolean) => {
    return isActive 
      ? `bg-slate-600 text-white shadow-lg border-slate-500` 
      : 'text-slate-400 hover:bg-white/5 hover:text-slate-200 border-transparent';
  };

  const IMPACT_COLORS: Record<ImpactLevel, string> = {
    [ImpactLevel.VERY_HIGH]: '#dc2626', // Red 600
    [ImpactLevel.HIGH]: '#ea580c',      // Orange 600
    [ImpactLevel.MEDIUM]: '#ca8a04',    // Yellow 600
    [ImpactLevel.LOW]: '#3b82f6',       // Blue 500
    [ImpactLevel.MICRO]: '#64748b',     // Slate 500
  };

  // Component to render the item in the list
  const FilterItemRow = ({ label, score, percent, isActive, rank }: { label: string, score: number, percent: number, isActive: boolean, rank: number }) => {
    const isTop3 = rank < 3;
    const impactColor = isTop3 ? 'text-red-400' : 'text-slate-500';
    const barColor = isTop3 ? 'bg-gradient-to-r from-red-500 to-orange-500' : 'bg-slate-600';
    
    return (
      <div className="w-full">
        <div className="flex items-center justify-between mb-1">
          <span className={`truncate text-[10px] font-medium ${isActive ? 'text-white' : ''} ${isTop3 && !isActive ? 'text-slate-200' : ''}`}>
            {label}
          </span>
          {isActive && <div className="w-1.5 h-1.5 rounded-full bg-white flex-shrink-0 ml-2" />}
        </div>
        
        {/* Minimalistic Business Impact Label */}
        <div className="flex items-center gap-1.5" title="Влияние на бизнес">
           <div className="flex-grow h-0.5 bg-slate-800 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full ${barColor}`} 
                style={{ width: `${percent}%` }} 
              />
           </div>
           <div className={`flex items-center gap-0.5 text-[8px] font-mono ${isActive ? 'text-slate-300' : impactColor}`}>
              {isTop3 && <Activity size={8} />}
              <span>{Math.round(score)}</span>
           </div>
        </div>
      </div>
    );
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
          activeClusterName={activeClusterName}
          selectedStages={selectedStages}
          selectedImpactLevels={selectedImpactLevels}
          showPulsars={showPulsars}
          onNodeSelect={handleNodeSelect} 
        />
      </div>

      {/* Header */}
      <div className="absolute top-4 left-4 z-10 pointer-events-none">
        <h1 className="text-2xl font-bold text-white tracking-tight drop-shadow-md">
          Product Value Space
        </h1>
      </div>

      {/* Combined Filter Sidebar */}
      <div className="absolute top-24 left-4 z-10 w-64 flex flex-col gap-3 max-h-[80vh] mt-8">
        
        {/* SCROLLABLE CONTAINER FOR ALL LISTS */}
        <div className="flex flex-col gap-3 overflow-y-auto custom-scrollbar pr-1 pb-2">
            
            {/* X-AXIS: Jobs */}
            <div className="bg-slate-900/90 backdrop-blur border border-white/10 rounded-lg p-3 shadow-xl">
              <div className="flex items-center gap-2 mb-3 text-slate-300 border-b border-white/5 pb-2">
                <Briefcase size={14} className="text-slate-400" />
                <span className="text-xs font-bold uppercase">Customer Jobs (Ось X)</span>
              </div>
              <div className="space-y-1">
                {sortedJobs.map((item, index) => (
                  <button
                    key={item.value}
                    onClick={() => setActiveJobCategory(activeJobCategory === item.value ? null : item.value as JobCategory)}
                    className={`w-full text-left px-2 py-2 rounded border transition-all ${getFilterButtonStyle(activeJobCategory === item.value)}`}
                  >
                    <FilterItemRow 
                      label={item.value} 
                      score={item.score} 
                      percent={item.percent} 
                      isActive={activeJobCategory === item.value}
                      rank={index}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Z-AXIS: Segments */}
            <div className="bg-slate-900/90 backdrop-blur border border-white/10 rounded-lg p-3 shadow-xl">
            <div className="flex items-center gap-2 mb-3 text-slate-300 border-b border-white/5 pb-2">
                <Layers size={14} className="text-blue-400" />
                <span className="text-xs font-bold uppercase">Сегменты (Ось Z)</span>
            </div>
            <div className="space-y-1">
                {sortedSegments.map((item, index) => (
                <button
                    key={item.value}
                    onClick={() => setActiveSegmentIndex(activeSegmentIndex === item.originalIndex ? null : item.originalIndex)}
                    className={`w-full text-left px-2 py-2 rounded border transition-all ${getFilterButtonStyle(activeSegmentIndex === item.originalIndex)}`}
                >
                    <FilterItemRow 
                      label={item.value} 
                      score={item.score} 
                      percent={item.percent} 
                      isActive={activeSegmentIndex === item.originalIndex}
                      rank={index}
                    />
                </button>
                ))}
            </div>
            </div>

            {/* Y-AXIS: Contexts */}
            <div className="bg-slate-900/90 backdrop-blur border border-white/10 rounded-lg p-3 shadow-xl">
            <div className="flex items-center gap-2 mb-3 text-slate-300 border-b border-white/5 pb-2">
                <Smartphone size={14} className="text-purple-400" />
                <span className="text-xs font-bold uppercase">Контексты (Ось Y)</span>
            </div>
            <div className="space-y-1">
                {sortedContexts.map((item, index) => (
                <button
                    key={item.value}
                    onClick={() => setActiveContextIndex(activeContextIndex === item.originalIndex ? null : item.originalIndex)}
                    className={`w-full text-left px-2 py-2 rounded border transition-all ${getFilterButtonStyle(activeContextIndex === item.originalIndex)}`}
                >
                    <FilterItemRow 
                      label={item.value} 
                      score={item.score} 
                      percent={item.percent} 
                      isActive={activeContextIndex === item.originalIndex}
                      rank={index}
                    />
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

      {/* Right-side Filters (Impact + Stage + Pulsar) */}
      <div className="absolute bottom-6 right-6 z-10 flex flex-col gap-3">
        
        {/* Pulsar Filter */}
        <div className="bg-slate-900/90 backdrop-blur border border-white/10 rounded-lg p-3 shadow-xl max-w-[200px]">
          <button
            onClick={() => setShowPulsars(!showPulsars)}
            className={`w-full flex items-center justify-between group transition-all ${showPulsars ? 'text-yellow-400' : 'text-slate-400 hover:text-slate-200'}`}
          >
            <div className="flex items-center gap-2">
                <div className={`p-1.5 rounded-md ${showPulsars ? 'bg-yellow-500/20' : 'bg-white/5 group-hover:bg-white/10'}`}>
                    <Zap size={14} />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider">Пульсары</span>
            </div>
            {showPulsars && (
                <span className="text-[9px] bg-yellow-500 text-black px-1.5 py-0.5 rounded font-bold">ВКЛ</span>
            )}
          </button>
        </div>

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

        {/* Stage Filter (Color cues removed) */}
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
                  <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${isSelected ? 'bg-white' : 'bg-slate-600'}`} />
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
        activeClusterName={activeClusterName}
        
        // Pass setters
        onSetSegmentFilter={setActiveSegmentIndex}
        onSetContextFilter={setActiveContextIndex}
        onSetJobFilter={setActiveJobCategory}
        onSetClusterFilter={setActiveClusterName}
      />
    </div>
  );
};

export default App;
