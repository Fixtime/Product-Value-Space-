
import React, { useState } from 'react';
import { Sparkles, X, Loader2, Database, BarChart3, MessageSquare, Cloud } from 'lucide-react';

interface ProductInputProps {
  onGenerate: (description: string) => Promise<void>;
  isGenerating: boolean;
}

export const ProductInput: React.FC<ProductInputProps> = ({ onGenerate, isGenerating }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [description, setDescription] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;
    await onGenerate(description);
    setIsOpen(false);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="absolute top-4 right-4 z-50 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 transition-all font-medium text-sm backdrop-blur-md border border-indigo-400/30"
      >
        <Sparkles size={16} />
        Мой продукт
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg bg-slate-900 border border-white/10 rounded-xl shadow-2xl p-6 animate-fade-in relative max-h-[90vh] overflow-y-auto custom-scrollbar">
            <button 
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X size={20} />
            </button>

            <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
              <Sparkles className="text-indigo-400" size={20} />
              Сгенерировать Модель
            </h2>
            <p className="text-slate-400 text-sm mb-6">
              Опишите ваш продукт, и управляйте своим продуктом с уникальном пространстве Product Value Space.
            </p>

            <form onSubmit={handleSubmit} className="mb-8">
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Например: SaaS платформа для управления проектами удаленных команд с фокусом на асинхронную коммуникацию..."
                className="w-full h-32 bg-slate-800/50 border border-slate-700 rounded-lg p-3 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 resize-none mb-4 text-sm"
                disabled={isGenerating}
              />
              
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isGenerating || !description.trim()}
                  className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-2.5 rounded-lg font-medium flex items-center gap-2 transition-all text-sm shadow-lg shadow-indigo-900/20"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Анализ...
                    </>
                  ) : (
                    'Сгенерировать'
                  )}
                </button>
              </div>
            </form>

            <div className="border-t border-white/10 pt-6">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">
                Источники данных
              </h3>
              <div className="grid grid-cols-1 gap-2">
                <button type="button" className="flex items-center gap-3 w-full p-3 rounded-lg bg-slate-800/50 border border-slate-700/50 hover:bg-slate-800 hover:border-slate-600 transition-all group text-left">
                  <div className="p-2 rounded bg-slate-700/50 text-slate-400 group-hover:text-indigo-400 group-hover:bg-indigo-500/10 transition-colors">
                    <Database size={16} />
                  </div>
                  <span className="text-sm text-slate-300 group-hover:text-white transition-colors">Подключить свою базу данных по API</span>
                </button>
                
                <button type="button" className="flex items-center gap-3 w-full p-3 rounded-lg bg-slate-800/50 border border-slate-700/50 hover:bg-slate-800 hover:border-slate-600 transition-all group text-left">
                  <div className="p-2 rounded bg-slate-700/50 text-slate-400 group-hover:text-yellow-400 group-hover:bg-yellow-500/10 transition-colors">
                    <BarChart3 size={16} />
                  </div>
                  <span className="text-sm text-slate-300 group-hover:text-white transition-colors">Подключить Яндекс Метрику</span>
                </button>

                <button type="button" className="flex items-center gap-3 w-full p-3 rounded-lg bg-slate-800/50 border border-slate-700/50 hover:bg-slate-800 hover:border-slate-600 transition-all group text-left">
                  <div className="p-2 rounded bg-slate-700/50 text-slate-400 group-hover:text-green-400 group-hover:bg-green-500/10 transition-colors">
                    <MessageSquare size={16} />
                  </div>
                  <span className="text-sm text-slate-300 group-hover:text-white transition-colors">Подключить Zendesk</span>
                </button>

                <button type="button" className="flex items-center gap-3 w-full p-3 rounded-lg bg-slate-800/50 border border-slate-700/50 hover:bg-slate-800 hover:border-slate-600 transition-all group text-left">
                  <div className="p-2 rounded bg-slate-700/50 text-slate-400 group-hover:text-blue-400 group-hover:bg-blue-500/10 transition-colors">
                    <Cloud size={16} />
                  </div>
                  <span className="text-sm text-slate-300 group-hover:text-white transition-colors">Подключить SalesForce</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
      
      {/* Loading Overlay */}
      {isGenerating && (
        <div className="fixed inset-0 z-[60] flex flex-col items-center justify-center bg-black/80 backdrop-blur-md">
            <div className="relative">
                <div className="absolute inset-0 bg-indigo-500 blur-xl opacity-20 rounded-full animate-pulse"></div>
                <Loader2 size={48} className="text-indigo-400 animate-spin relative z-10" />
            </div>
            <h3 className="text-white font-bold text-lg mt-6">Gemini 3.0 анализирует продукт...</h3>
            <p className="text-slate-400 text-sm mt-2">Исследую пользовательские сегменты, JTBD, контексты использования. Кластеризую проблемы.</p>
        </div>
      )}
    </>
  );
};
