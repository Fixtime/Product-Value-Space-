
import React, { useState, useEffect, useRef } from 'react';
import { ClusterDetailsData, ChatMessage } from '../types';
import { chatWithCopilot } from '../utils/gemini';
import { X, Send, Lightbulb, Zap, Rocket, BrainCircuit, PieChart, Activity, ArrowRight, Box, TrendingUp, Clock, Users, MapPin, Briefcase, MessageSquare } from 'lucide-react';

interface ClusterOverlayProps {
  details: ClusterDetailsData;
  productName: string;
  onClose: () => void;
}

export const ClusterOverlay: React.FC<ClusterOverlayProps> = ({ details, productName, onClose }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', text: `Здравствуйте. Я проанализировал кластер "${details.clusterName}". \n\nГотов сгенерировать User Stories, оценить сложность внедрения гипотез или предложить A/B тест. С чего начнем?` }
  ]);
  const [input, setInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (text?: string) => {
    const msgToSend = text || input;
    if (!msgToSend.trim()) return;
    
    setMessages(prev => [...prev, { role: 'user', text: msgToSend }]);
    if (!text) setInput('');
    setIsChatLoading(true);

    const context = `
      Product: ${productName}
      Cluster: ${details.clusterName}
      Total Impact: ${details.totalImpact}
      Relative Impact: ${details.relativeImpactPercent.toFixed(1)}% of total product friction.
      Top Segments: ${details.topSegments?.map(s => `${s.name} (${s.impact})`).join(', ') || ''}
      Top Contexts: ${details.topContexts?.map(s => `${s.name} (${s.impact})`).join(', ') || ''}
      Top Jobs: ${details.topJobs?.map(s => `${s.name} (${s.impact})`).join(', ') || ''}
      Pulsar Signal: "${details.pulsarSignal?.description}" (Source: ${details.pulsarSignal?.source})
      Top 7 Signals samples:
      ${details.topSignals?.map(s => `- "${s.description}" (Impact: ${s.impactScore.toFixed(1)})`).join('\n') || ''}
      Existing Hypotheses:
      - Quick: ${details.hypotheses?.quickWins?.map(h => h.text).join(' | ') || ''}
      - Balanced: ${details.hypotheses?.balanced?.map(h => h.text).join(' | ') || ''}
      - Revolutionary: ${details.hypotheses?.revolutionary?.map(h => h.text).join(' | ') || ''}
    `;

    try {
      const reply = await chatWithCopilot(msgToSend, context);
      setMessages(prev => [...prev, { role: 'model', text: reply }]);
    } catch (e) {
      setMessages(prev => [...prev, { role: 'model', text: "Извините, связь с сервером прервана." }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const renderHypothesisSection = (title: string, icon: React.ReactNode, items: { text: string }[] | undefined, colorClass: string) => (
    <div className="mb-4 last:mb-0">
      <div className={`flex items-center gap-2 mb-2 text-xs font-bold uppercase tracking-wider ${colorClass}`}>
        {icon}
        <span>{title}</span>
      </div>
      <ul className="space-y-2">
        {items && items.length > 0 ? items.map((h, idx) => (
          <li key={idx} className="text-xs bg-slate-800/50 p-2 rounded border border-white/5 text-slate-300 leading-relaxed">
            {h.text}
          </li>
        )) : (
            <li className="text-xs text-slate-600 italic">Гипотезы не найдены</li>
        )}
      </ul>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 sm:p-6 overflow-hidden">
      <div className="w-full max-w-7xl h-[95vh] bg-slate-950 text-white rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-fade-in font-sans border border-white/10">
        
        {/* HEADER SECTION (Fixed Top) */}
        <div className="px-8 py-6 border-b border-white/10 bg-slate-900 flex-shrink-0 relative shadow-sm z-10">
          <button onClick={onClose} className="absolute top-6 right-6 p-2 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors">
            <X size={24} />
          </button>
          
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-indigo-400 uppercase tracking-wider mb-1">
                <Box size={14} />
                Product Discovery • Кластер Проблем
              </div>
              <h1 className="text-3xl font-extrabold text-white tracking-tight">{details.clusterName}</h1>
            </div>
            
            <div className="flex items-center gap-8">
              {/* Big Impact Score */}
              <div className="flex items-center gap-4">
                <div className="relative w-16 h-16 flex items-center justify-center">
                   <span className="absolute text-sm font-black text-white">{details.totalImpact.toFixed(0)}</span>
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-300 uppercase">Impact Score</div>
                  <div className="text-xs text-slate-500">Абсолютное влияние</div>
                </div>
              </div>

              {/* Relative Impact Pie Chart */}
              <div className="flex items-center gap-4 border-l border-white/10 pl-8">
                 <div className="relative w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center overflow-hidden">
                    {/* Dynamic Conic Gradient */}
                    <div 
                        className="absolute inset-0" 
                        style={{ 
                            background: `conic-gradient(#f97316 ${details.relativeImpactPercent}%, #334155 0)` 
                        }} 
                    />
                    {/* Inner circle for Donut effect */}
                    <div className="absolute inset-1.5 bg-slate-900 rounded-full"></div>
                 </div>
                 <div>
                    <div className="text-xl font-black text-white">{details.relativeImpactPercent.toFixed(1)}%</div>
                    <div className="text-xs text-slate-500 w-24 leading-tight">От всех проблем продукта</div>
                 </div>
              </div>
            </div>
          </div>

          {/* Quick Stats Row */}
          <div className="flex flex-wrap gap-6 mt-6 pt-4 border-t border-white/5">
             <div className="flex items-center gap-2 text-sm">
                <Users size={16} className="text-blue-400" />
                <span className="font-bold text-slate-400">Топ Сегмент:</span>
                <span className="text-slate-200">{details.topSegments?.[0]?.name || 'N/A'}</span>
                <span className="text-xs bg-blue-500/20 text-blue-300 px-1.5 py-0.5 rounded font-mono">{details.topSegments?.[0]?.impact.toFixed(0) || 0}</span>
             </div>
             <div className="flex items-center gap-2 text-sm">
                <MapPin size={16} className="text-purple-400" />
                <span className="font-bold text-slate-400">Топ Контекст:</span>
                <span className="text-slate-200">{details.topContexts?.[0]?.name || 'N/A'}</span>
             </div>
             <div className="flex items-center gap-2 text-sm">
                <Briefcase size={16} className="text-slate-500" />
                <span className="font-bold text-slate-400">Топ Job:</span>
                <span className="text-slate-200">{details.topJobs?.[0]?.name || 'N/A'}</span>
             </div>
          </div>
        </div>

        {/* MAIN CONTENT (Split View) */}
        <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">
            
            {/* SCROLLABLE ANALYSIS AREA (45% Width) */}
            <div className="w-full lg:w-[45%] overflow-y-auto custom-scrollbar bg-slate-950 p-8 space-y-8 border-r border-white/10">
                
                {/* 1. PULSAR & TIMELINE */}
                <div className="bg-slate-900 p-6 rounded-xl border border-white/5 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                            <Activity size={16} /> Динамика и Первопричина
                        </h3>
                        <span className="text-xs font-medium text-green-400 bg-green-500/10 px-2 py-1 rounded">+12% сигналов за неделю</span>
                    </div>
                    
                    {/* Mock Heatmap/Timeline */}
                    <div className="flex items-end gap-1 h-16 mb-6 w-full opacity-80">
                        {Array.from({ length: 60 }).map((_, i) => (
                            <div 
                                key={i} 
                                className={`flex-1 rounded-t-sm ${Math.random() > 0.8 ? 'bg-red-500/60' : 'bg-slate-700/40'}`}
                                style={{ height: `${20 + Math.random() * 80}%` }} 
                            />
                        ))}
                    </div>

                    {/* Pulsar Card */}
                    {details.pulsarSignal && (
                        <div className="flex gap-4 items-start bg-yellow-500/5 border border-yellow-500/20 p-4 rounded-lg">
                            <div className="p-2 bg-yellow-500/10 rounded-full text-yellow-500 mt-1">
                                <Zap size={20} />
                            </div>
                            <div>
                                <div className="text-xs font-bold text-yellow-500 uppercase mb-1">ПЕРВОПРИЧИНА (PULSAR SIGNAL)</div>
                                <p className="text-lg font-medium text-white leading-snug">"{details.pulsarSignal.description}"</p>
                                <div className="text-sm text-slate-500 mt-2 flex gap-4">
                                    <span>Source: {details.pulsarSignal.source}</span>
                                    <span className="font-mono">Impact: {details.pulsarSignal.impactScore.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* 2. TOP SIGNALS (Grid) */}
                <div>
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                        <MessageSquare size={16} /> Топ-7 Сигналов (80% Impact)
                    </h3>
                    <div className="grid grid-cols-1 gap-3">
                        {details.topSignals?.map((s, i) => (
                            <div key={i} className="bg-slate-900 p-4 rounded-lg border border-white/5 shadow-sm hover:border-white/10 transition-colors flex flex-col justify-between">
                                <p className="text-sm text-slate-200 font-medium mb-2 leading-relaxed">"{s.description}"</p>
                                <div className="flex justify-between items-center pt-2 border-t border-white/5 text-xs text-slate-500">
                                    <span className="truncate max-w-[60%]">{s.source}</span>
                                    <span className="font-bold text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded">{s.impactScore.toFixed(1)}</span>
                                </div>
                            </div>
                        ))}
                        <button className="bg-slate-900/50 border-2 border-dashed border-slate-800 rounded-lg p-4 flex items-center justify-center text-slate-500 hover:text-indigo-400 hover:border-indigo-500/30 hover:bg-indigo-500/5 transition-all group">
                            <div className="font-bold text-sm group-hover:translate-x-1 transition-transform flex items-center gap-1">
                                Показать все <ArrowRight size={14} />
                            </div>
                        </button>
                    </div>
                </div>

                {/* 3. HYPOTHESES (Stacked in Mobile, Grid in Large) */}
                <div className="pb-4">
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                        <Lightbulb size={16} /> Гипотезы решений (Generated by Gemini 3.0)
                    </h3>
                    <div className="space-y-6">
                        {/* Quick Wins */}
                        <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-5">
                            <div className="flex items-center gap-2 text-emerald-400 font-bold uppercase text-xs mb-4">
                                <Zap size={14} /> Быстрые победы (1-2 нед)
                            </div>
                            {renderHypothesisSection('', <></>, details.hypotheses?.quickWins, '')}
                        </div>

                        {/* Balanced */}
                        <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-5">
                            <div className="flex items-center gap-2 text-blue-400 font-bold uppercase text-xs mb-4">
                                <TrendingUp size={14} /> Сбалансированные (1-3 мес)
                            </div>
                            {renderHypothesisSection('', <></>, details.hypotheses?.balanced, '')}
                        </div>

                        {/* Revolutionary */}
                        <div className="bg-purple-500/5 border border-purple-500/20 rounded-xl p-5">
                            <div className="flex items-center gap-2 text-purple-400 font-bold uppercase text-xs mb-4">
                                <Rocket size={14} /> Инновационные (10x Impact)
                            </div>
                            {renderHypothesisSection('', <></>, details.hypotheses?.revolutionary, '')}
                        </div>
                    </div>
                </div>
            </div>

            {/* CO-PILOT (Fixed Right - 55% Width) */}
            <div className="w-full lg:w-[55%] flex flex-col bg-slate-900 relative h-full border-l border-white/10 shadow-[-10px_0_30px_rgba(0,0,0,0.3)]">
                {/* Chat Header */}
                <div className="p-4 border-b border-white/10 bg-slate-900 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-indigo-600 text-white shadow-lg shadow-indigo-900/50">
                            <BrainCircuit size={20} />
                        </div>
                        <div>
                            <h2 className="text-sm font-bold text-white">Product Co-pilot</h2>
                            <p className="text-xs text-slate-400">Мозговой штурм: {details.clusterName}</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={() => handleSend("Сгенерируй User Story для решения")} className="text-xs font-medium bg-slate-800 border border-white/5 hover:border-indigo-500/50 hover:text-indigo-400 px-3 py-1.5 rounded-md transition-all shadow-sm text-slate-300">User Story</button>
                        <button onClick={() => handleSend("Опиши задачу для Jira")} className="text-xs font-medium bg-slate-800 border border-white/5 hover:border-indigo-500/50 hover:text-indigo-400 px-3 py-1.5 rounded-md transition-all shadow-sm text-slate-300">Jira</button>
                        <button onClick={() => handleSend("Предложи дизайн A/B теста")} className="text-xs font-medium bg-slate-800 border border-white/5 hover:border-indigo-500/50 hover:text-indigo-400 px-3 py-1.5 rounded-md transition-all shadow-sm text-slate-300">A/B Тест</button>
                    </div>
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-slate-950/50">
                    {messages.map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div 
                        className={`max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed shadow-md ${
                            msg.role === 'user' 
                            ? 'bg-indigo-600 text-white rounded-tr-none' 
                            : 'bg-slate-800 text-slate-200 border border-white/10 rounded-tl-none'
                        }`}
                        >
                        {msg.text.split('\n').map((line, i) => (
                            <p key={i} className="mb-2 last:mb-0">{line}</p>
                        ))}
                        </div>
                    </div>
                    ))}
                    {isChatLoading && (
                    <div className="flex justify-start">
                        <div className="bg-slate-800 p-4 rounded-2xl rounded-tl-none border border-white/10 flex gap-1.5 items-center">
                            <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                            <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                            <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                        </div>
                    </div>
                    )}
                    <div ref={chatEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-5 bg-slate-900 border-t border-white/10 shrink-0 relative">
                    <div className="flex gap-2 absolute -top-10 left-5">
                        <button onClick={() => handleSend("@quick")} className="text-xs bg-slate-800 text-slate-300 border border-white/10 px-2 py-1 rounded shadow hover:bg-slate-700 transition">@quick</button>
                        <button onClick={() => handleSend("@balanced")} className="text-xs bg-slate-800 text-slate-300 border border-white/10 px-2 py-1 rounded shadow hover:bg-slate-700 transition">@balanced</button>
                        <button onClick={() => handleSend("@10x")} className="text-xs bg-slate-800 text-slate-300 border border-white/10 px-2 py-1 rounded shadow hover:bg-slate-700 transition">@10x</button>
                        <button onClick={() => handleSend("@calc")} className="text-xs bg-slate-800 text-slate-300 border border-white/10 px-2 py-1 rounded shadow hover:bg-slate-700 transition">@calc</button>
                    </div>
                    <div className="relative">
                        <textarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSend();
                            }
                            }}
                            placeholder="Спросите Копайлота о гипотезах, метриках или решении..."
                            className="w-full bg-slate-950 text-white placeholder-slate-500 rounded-xl pl-4 pr-14 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 border border-slate-800 resize-none custom-scrollbar shadow-inner"
                            rows={1}
                            style={{ minHeight: '3rem', maxHeight: '8rem' }}
                        />
                        <button 
                            onClick={() => handleSend()}
                            disabled={!input.trim() || isChatLoading}
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
                        >
                            <Send size={18} />
                        </button>
                    </div>
                    <div className="text-[10px] text-center text-slate-600 mt-3">
                        Co-pilot имеет полный доступ к контексту кластера и Value Space.
                    </div>
                </div>

            </div>
        </div>
      </div>
    </div>
  );
};
