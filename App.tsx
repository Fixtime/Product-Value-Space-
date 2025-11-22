
import React, { useState, useMemo } from 'react';
import { generateData, SEGMENTS_ORDERED, CONTEXTS_ORDERED } from './utils/dataGenerator';
import { generateProductData, generateClusterHypotheses } from './utils/gemini';
import { Scene } from './components/Scene';
import { UIOverlay } from './components/UIOverlay';
import { ProductInput } from './components/ProductInput';
import { FilterBlock } from './components/FilterBlock';
import { ClusterOverlay } from './components/ClusterOverlay';
import { DataPoint, JobCategory, JourneyStage, ImpactLevel, ClusterDetailsData } from './types';
import { Layers, Smartphone, Briefcase, Filter, Route, TrendingUp, Activity, Zap, Box, ChevronRight, Loader2, Maximize2, Search } from 'lucide-react';

const App: React.FC = () => {
  const [data, setData] = useState<DataPoint[]>(() => generateData(2000));
  const [productName, setProductName] = useState<string>("Product Value Space");
  const [isGenerating, setIsGenerating] = useState(false);
  
  const [selectedId, setSelectedId] = useState<string | null>(null);
  
  // Calculate selectedData based on selectedId
  const selectedData = useMemo(() => {
    return selectedId ? data.find(p => p.id === selectedId) || null : null;
  }, [data, selectedId]);
  
  // Axis Filter States
  const [activeSegmentIndex, setActiveSegmentIndex] = useState<number | null>(null); // Z
  const [activeContextIndex, setActiveContextIndex] = useState<number | null>(null); // Y
  const [activeJobCategory, setActiveJobCategory] = useState<string | null>(null); // X (String now)
  const [activeClusterName, setActiveClusterName] = useState<string | null>(null); // Cluster Filter
  
  // Stage Filter State (Multi-select)
  const [selectedStages, setSelectedStages] = useState<JourneyStage[]>([]);
  
  // Impact Filter State (Multi-select)
  const [selectedImpactLevels, setSelectedImpactLevels] = useState<ImpactLevel[]>([]);

  // Pulsar Filter State
  const [showPulsars, setShowPulsars] = useState<boolean>(false);

  // Cluster Details State
  const [openClusterDetails, setOpenClusterDetails] = useState<ClusterDetailsData | null>(null);
  const [isLoadingCluster, setIsLoadingCluster] = useState<string | null>(null);

  // Handler for Gemini Generation
  const handleGenerate = async (description: string) => {
    setIsGenerating(true);
    try {
      const config = await generateProductData(description);
      const newData = generateData(2000, config);
      setData(newData);
      setProductName(config.productName);
      
      // Reset all filters
      resetFilters();
    } catch (error) {
      console.error("Generation failed:", error);
      alert("Ошибка генерации данных. Попробуйте еще раз.");
    } finally {
      setIsGenerating(false);
    }
  };

  // --- AGGREGATION & SORTING LOGIC ---
  const { sortedJobs, sortedSegments, sortedContexts, sortedClusters, impactLevelCounts, totalImpactSum } = useMemo(() => {
    const jobImpact: Record<string, number> = {};
    const segImpact: Record<string, number> = {};
    const ctxImpact: Record<string, number> = {};
    const clusterImpact: Record<string, number> = {};
    const impactCounts: Record<string, number> = {};
    let totalImpact = 0;

    // Aggregate Impact Scores
    data.forEach(d => {
      const score = d.impactScore;
      totalImpact += score;
      jobImpact[d.jobCategory] = (jobImpact[d.jobCategory] || 0) + score;
      segImpact[d.segment] = (segImpact[d.segment] || 0) + score;
      ctxImpact[d.context] = (ctxImpact[d.context] || 0) + score;
      clusterImpact[d.clusterName] = (clusterImpact[d.clusterName] || 0) + score;
      impactCounts[d.impactLevel] = (impactCounts[d.impactLevel] || 0) + 1;
    });

    // Helper to process list
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
      sortedJobs: processList(Array.from(new Set(data.map(d => d.jobCategory))), jobImpact, (c: string) => c),
      sortedSegments: processList(SEGMENTS_ORDERED, segImpact, (s) => s),
      sortedContexts: processList(CONTEXTS_ORDERED, ctxImpact, (c) => c),
      sortedClusters: processList(Array.from(new Set(data.map(d => d.clusterName))), clusterImpact, (c: string) => c),
      impactLevelCounts: impactCounts,
      totalImpactSum: totalImpact
    };
  }, [data]);

  const handleNodeSelect = (node: DataPoint) => {
    setSelectedId(node.id);
  };

  const handleCloseUI = () => {
    setSelectedId(null);
  };

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

  const handleOpenClusterDetails = async (clusterName: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setIsLoadingCluster(clusterName);
    
    // 1. Aggregate Data for this cluster
    const clusterSignals = data.filter(d => d.clusterName === clusterName);
    const pulsar = clusterSignals.find(d => d.isRootCause) || null;
    const clusterImpact = clusterSignals.reduce((sum, d) => sum + d.impactScore, 0);
    
    // Top Segments
    const segs: Record<string, number> = {};
    clusterSignals.forEach(d => segs[d.segment] = (segs[d.segment] || 0) + d.impactScore);
    const topSegments = Object.entries(segs)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 3)
        .map(([name, impact]) => ({ name, impact }));

    // Top Contexts
    const ctxs: Record<string, number> = {};
    clusterSignals.forEach(d => ctxs[d.context] = (ctxs[d.context] || 0) + d.impactScore);
    const topContexts = Object.entries(ctxs)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 3)
        .map(([name, impact]) => ({ name, impact }));

    // Top Jobs
    const jobs: Record<string, number> = {};
    clusterSignals.forEach(d => jobs[d.jobCategory] = (jobs[d.jobCategory] || 0) + d.impactScore);
    const topJobs = Object.entries(jobs)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 3)
        .map(([name, impact]) => ({ name, impact }));

    // Top 7 Signals (Changed from 3)
    const topSignals = clusterSignals
        .filter(d => !d.isRootCause)
        .sort((a, b) => b.impactScore - a.impactScore)
        .slice(0, 7);

    // 2. Generate Hypotheses via Gemini
    let hypotheses = { quickWins: [], balanced: [], revolutionary: [] };
    try {
        hypotheses = await generateClusterHypotheses(clusterName, productName);
    } catch (e) {
        console.error("Failed to generate hypotheses", e);
        // Fallback empty
    }

    setOpenClusterDetails({
        clusterName,
        totalImpact: clusterImpact,
        relativeImpactPercent: totalImpactSum > 0 ? (clusterImpact / totalImpactSum) * 100 : 0,
        topSegments,
        topContexts,
        topJobs,
        pulsarSignal: pulsar,
        topSignals,
        hypotheses
    });
    setIsLoadingCluster(null);
  };

  const hasActiveFilters = activeSegmentIndex !== null || activeContextIndex !== null || activeJobCategory !== null || activeClusterName !== null || selectedStages.length > 0 || selectedImpactLevels.length > 0 || showPulsars;

  const getFilterButtonStyle = (isActive: boolean) => {
    return isActive 
      ? `bg-slate-600 text-white shadow-lg border-slate-500` 
      : 'text-slate-400 hover:bg-white/5 hover:text-slate-200 border-transparent';
  };

  const IMPACT_COLORS: Record<ImpactLevel, string> = {
    [ImpactLevel.VERY_HIGH]: '#dc2626', 
    [ImpactLevel.HIGH]: '#ea580c',      
    [ImpactLevel.MEDIUM]: '#ca8a04',    
    [ImpactLevel.LOW]: '#3b82f6',       
    [ImpactLevel.MICRO]: '#64748b',     
  };

  const FilterItemRow = ({ label, score, percent, isActive, rank }: { label: string, score: number, percent: number, isActive: boolean, rank: number }) => {
    const isTop3 = rank < 3;
    const impactColor = isTop3 ? 'text-red-400' : 'text-slate-500';
    const barColor = isTop3 ? 'bg-gradient-to-r from-red-500 to-orange-500' : 'bg-slate-600';
    
    return (
      <div className="w-full overflow-hidden">
        <div className="flex items-center justify-between mb-1">
          <span className={`truncate text-[10px] font-medium ${isActive ? 'text-white' : ''} ${isTop3 && !isActive ? 'text-slate-200' : ''}`}>
            {label}
          </span>
          {isActive && <div className="w-1.5 h-1.5 rounded-full bg-white flex-shrink-0 ml-2" />}
        </div>
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

  const ActiveIndicator = () => <div className="w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_5px_rgba(255,255,255,0.5)]" />;

  return (
    <div className="relative w-full h-screen bg-slate-950 overflow-hidden font-sans">
      
      <ProductInput onGenerate={handleGenerate} isGenerating={isGenerating} />

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
          {productName}
        </h1>
      </div>

      {/* LEFT Sidebar */}
      <div className="absolute top-24 left-4 z-10 w-64 flex flex-col gap-3 max-h-[80vh] mt-8">
        <div className="flex flex-col gap-3 overflow-y-auto custom-scrollbar pr-1 pb-2">
            
            <FilterBlock title="Customer Jobs (Ось X)" icon={<Briefcase size={14} className="text-slate-400" />} headerExtra={activeJobCategory !== null ? <ActiveIndicator /> : null}>
              {sortedJobs.map((item, index) => (
                <button
                  key={item.value}
                  onClick={() => setActiveJobCategory(activeJobCategory === item.value ? null : item.value)}
                  className={`w-full text-left px-2 py-2 rounded border transition-all ${getFilterButtonStyle(activeJobCategory === item.value)}`}
                >
                  <FilterItemRow label={item.value} score={item.score} percent={item.percent} isActive={activeJobCategory === item.value} rank={index} />
                </button>
              ))}
            </FilterBlock>

            <FilterBlock title="Сегменты (Ось Z)" icon={<Layers size={14} className="text-blue-400" />} headerExtra={activeSegmentIndex !== null ? <ActiveIndicator /> : null}>
                {sortedSegments.map((item, index) => (
                <button
                    key={item.value}
                    onClick={() => setActiveSegmentIndex(activeSegmentIndex === item.originalIndex ? null : item.originalIndex)}
                    className={`w-full text-left px-2 py-2 rounded border transition-all ${getFilterButtonStyle(activeSegmentIndex === item.originalIndex)}`}
                >
                    <FilterItemRow label={item.value} score={item.score} percent={item.percent} isActive={activeSegmentIndex === item.originalIndex} rank={index} />
                </button>
                ))}
            </FilterBlock>

            <FilterBlock title="Контексты (Ось Y)" icon={<Smartphone size={14} className="text-purple-400" />} headerExtra={activeContextIndex !== null ? <ActiveIndicator /> : null}>
                {sortedContexts.map((item, index) => (
                <button
                    key={item.value}
                    onClick={() => setActiveContextIndex(activeContextIndex === item.originalIndex ? null : item.originalIndex)}
                    className={`w-full text-left px-2 py-2 rounded border transition-all ${getFilterButtonStyle(activeContextIndex === item.originalIndex)}`}
                >
                    <FilterItemRow label={item.value} score={item.score} percent={item.percent} isActive={activeContextIndex === item.originalIndex} rank={index} />
                </button>
                ))}
            </FilterBlock>
        </div>

        {hasActiveFilters && (
            <button onClick={resetFilters} className="bg-slate-900/90 backdrop-blur border border-red-900/30 text-red-400 hover:text-white hover:bg-red-900/50 p-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-xl flex-shrink-0">
                <Filter size={12} /> Сбросить фильтры
            </button>
        )}
      </div>

      {/* RIGHT Sidebar */}
      <div className="absolute top-24 right-4 z-10 w-64 flex flex-col gap-3 max-h-[80vh] mt-8">
        <div className="flex flex-col gap-3 overflow-y-auto custom-scrollbar pr-1 pb-2">
            
            {/* Problem Clusters with War Room CTA */}
            <FilterBlock title="Кластеры проблем" icon={<Box size={14} className="text-yellow-400" />} headerExtra={activeClusterName !== null ? <ActiveIndicator /> : null}>
                {sortedClusters.map((item, index) => {
                  const isActive = activeClusterName === item.value;
                  
                  return (
                    <div key={item.value} className={`flex flex-col rounded border overflow-hidden transition-all duration-300 ${isActive ? 'border-indigo-500 bg-slate-800 shadow-lg scale-105 z-10' : 'border-transparent hover:bg-white/5'}`}>
                      
                      {/* Main Filter Toggle Area */}
                      <button
                        onClick={() => setActiveClusterName(isActive ? null : item.value)}
                        className="flex-grow min-w-0 text-left px-2 py-2 focus:outline-none"
                      >
                        <FilterItemRow label={item.value} score={item.score} percent={item.percent} isActive={isActive} rank={index} />
                      </button>
                      
                      {/* EXPANDED CTA: War Room Entry */}
                      {isActive && (
                        <div className="px-2 pb-2 pt-1 animate-fade-in">
                          <button 
                            onClick={(e) => handleOpenClusterDetails(item.value, e)}
                            className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold py-2 rounded shadow-md transition-all"
                          >
                            {isLoadingCluster === item.value ? (
                                <Loader2 size={14} className="animate-spin" />
                            ) : (
                                <Search size={14} />
                            )}
                            Открыть глубокий анализ
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
            </FilterBlock>

            {/* Pulsar Filter */}
            <div className="bg-slate-900/90 backdrop-blur border border-white/10 rounded-lg p-3 shadow-xl">
              <button onClick={() => setShowPulsars(!showPulsars)} className={`w-full flex items-center justify-between group transition-all ${showPulsars ? 'text-yellow-400' : 'text-slate-400 hover:text-slate-200'}`}>
                <div className="flex items-center gap-2">
                    <div className={`p-1.5 rounded-md ${showPulsars ? 'bg-yellow-500/20' : 'bg-white/5 group-hover:bg-white/10'}`}>
                        <Zap size={14} />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider">Пульсары</span>
                </div>
                {showPulsars && <span className="text-[9px] bg-yellow-500 text-black px-1.5 py-0.5 rounded font-bold">ВКЛ</span>}
              </button>
            </div>

            {/* Impact Level Filter */}
            <FilterBlock title="Влияние на бизнес" icon={<TrendingUp size={14} />} headerExtra={selectedImpactLevels.length > 0 ? <ActiveIndicator /> : null}>
                <div className="grid grid-cols-1 gap-1">
                    {Object.values(ImpactLevel).map((level) => {
                    const isSelected = selectedImpactLevels.includes(level);
                    const count = impactLevelCounts[level] || 0;
                    const opacity = isSelected || selectedImpactLevels.length === 0 ? 'opacity-100' : 'opacity-40 grayscale';
                    
                    return (
                        <button key={level} onClick={() => toggleImpactLevel(level)} className={`flex items-center gap-2 w-full text-left p-1 rounded hover:bg-white/5 transition-all ${opacity} ${isSelected ? 'bg-white/5 ring-1 ring-white/10' : ''}`}>
                        <span className="w-1.5 h-4 rounded-sm shadow-[0_0_5px] flex-shrink-0" style={{ backgroundColor: IMPACT_COLORS[level], boxShadow: `0 0 5px ${IMPACT_COLORS[level]}` }} />
                        <span className={`text-[10px] transition-colors flex-grow ${isSelected ? 'text-white font-medium' : 'text-slate-300'}`}>
                            {level}
                        </span>
                        <span className="text-[9px] text-slate-500 font-mono">({count})</span>
                        {isSelected && <span className="ml-auto w-1 h-1 rounded-full bg-white"></span>}
                        </button>
                    );
                    })}
                </div>
            </FilterBlock>

            {/* Stage Filter */}
            <FilterBlock title="Стадия пути (CJM)" icon={<Route size={14} />} headerExtra={selectedStages.length > 0 ? <ActiveIndicator /> : null}>
              <div className="grid grid-cols-1 gap-1">
                {Object.values(JourneyStage).map((stage) => {
                  const isSelected = selectedStages.includes(stage);
                  const opacity = isSelected || selectedStages.length === 0 ? 'opacity-100' : 'opacity-40 grayscale';
                  return (
                    <button key={stage} onClick={() => toggleStage(stage)} className={`flex items-center gap-2 w-full text-left p-1 rounded hover:bg-white/5 transition-all ${opacity} ${isSelected ? 'bg-white/5 ring-1 ring-white/10' : ''}`}>
                      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${isSelected ? 'bg-white' : 'bg-slate-600'}`} />
                      <span className={`text-[10px] transition-colors ${isSelected ? 'text-white font-medium' : 'text-slate-300'}`}>
                        {stage}
                      </span>
                      {isSelected && <span className="ml-auto w-1 h-1 rounded-full bg-white"></span>}
                    </button>
                  );
                })}
              </div>
            </FilterBlock>
        </div>
      </div>

      {/* UI Overlay (Signal Details) */}
      <UIOverlay 
        selectedData={selectedData} 
        allData={data}
        onClose={handleCloseUI} 
        onSelect={handleNodeSelect}
        activeSegmentIndex={activeSegmentIndex}
        activeContextIndex={activeContextIndex}
        activeJobCategory={activeJobCategory}
        activeClusterName={activeClusterName}
        onSetSegmentFilter={setActiveSegmentIndex}
        onSetContextFilter={setActiveContextIndex}
        onSetJobFilter={setActiveJobCategory}
        onSetClusterFilter={setActiveClusterName}
      />

      {/* Cluster Details Overlay */}
      {openClusterDetails && (
        <ClusterOverlay 
            details={openClusterDetails} 
            productName={productName}
            onClose={() => setOpenClusterDetails(null)} 
        />
      )}
    </div>
  );
};

export default App;
