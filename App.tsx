
import React, { useState, useMemo } from 'react';
import { generateData } from './utils/dataGenerator';
import { Scene } from './components/Scene';
import { UIOverlay } from './components/UIOverlay';
import { DataPoint } from './types';
import { Info } from 'lucide-react';

const App: React.FC = () => {
  // Memoize data so it doesn't regenerate on re-renders
  const data = useMemo(() => generateData(500), []);
  
  const [selectedId, setSelectedId] = useState<string | null>(null);

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
      
      {/* 3D Canvas Container */}
      <div className="absolute inset-0 z-0">
        <Scene 
          data={data} 
          selectedId={selectedId} 
          onNodeSelect={handleNodeSelect} 
        />
      </div>

      {/* Main HUD / Header */}
      <div className="absolute top-4 left-4 z-10 pointer-events-none">
        <h1 className="text-2xl font-bold text-white tracking-tight drop-shadow-md">
          Пространство Ценности Продукта
        </h1>
        <p className="text-slate-400 text-sm max-w-md mt-1 drop-shadow-md">
          Визуализация векторов проблема-контекст-пользователь. <br/>
          <span className="text-xs opacity-75">Нажмите на узел сигнала для анализа.</span>
        </p>
      </div>

      {/* Legend */}
      <div className="absolute bottom-6 left-6 z-10 pointer-events-none bg-slate-900/80 backdrop-blur-sm p-4 rounded-lg border border-white/10">
        <h3 className="text-xs font-bold text-slate-400 uppercase mb-3">Джобы</h3>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)]"></span>
            <span className="text-xs text-slate-200">Обновить гардероб к новому сезону</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]"></span>
            <span className="text-xs text-slate-200">Быстро найти замену износившейся вещи</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></span>
            <span className="text-xs text-slate-200">Найти вещь на мою нестандартную фигуру</span>
          </div>
        </div>
      </div>

      {/* Floating Detail Card */}
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
