import React, { useState } from 'react';
import {
  Sparkles,
  Send,
  HelpCircle,
  TrendingDown,
  Droplets,
  AlertTriangle,
  ShieldCheck,
  Bot,
  User,
  ArrowRight,
} from 'lucide-react';
import { Incident, ZoneRisk } from '../../types';
import { askAIOperationsAssistant } from '../../services/aiService';

interface AIOperationsAssistantProps {
  incidents: Incident[];
  zonesRisk: ZoneRisk[];
  onSelectIncident?: (incidentId: string) => void;
}

interface Message {
  id: string;
  sender: 'USER' | 'ASSISTANT';
  text: string;
  timestamp: string;
  relevantId?: string;
}

export const AIOperationsAssistant: React.FC<AIOperationsAssistantProps> = ({
  incidents,
  zonesRisk,
  onSelectIncident,
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'm-1',
      sender: 'ASSISTANT',
      text: 'Greetings Commissioner. I am the AquaGrid Operational Intelligence Advisor. I analyze live telemetry, priority scoring, water loss rates, and field unit schedules. How can I assist municipal grid operations today?',
      timestamp: '10:30 AM',
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);

  const PRESET_QUERIES = [
    'Which incidents should we resolve first?',
    'Which zone has the highest water loss?',
    'Which infrastructure assets are at highest risk?',
    'How much water was saved this month?',
  ];

  const handleSend = async (queryText: string) => {
    if (!queryText.trim() || loading) return;

    const userMsg: Message = {
      id: `u-${Date.now()}`,
      sender: 'USER',
      text: queryText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setLoading(true);

    try {
      const activeCount = incidents.filter((i) => i.status !== 'RESOLVED' && i.status !== 'CLOSED').length;
      const criticalCount = incidents.filter((i) => i.severity === 'CRITICAL' && i.status !== 'RESOLVED').length;
      const totalSaved = incidents.reduce((acc, i) => acc + (i.waterSavedLiters || 0), 0);

      const contextData = {
        incidents: incidents.slice(0, 8).map((i) => ({
          id: i.id,
          title: i.title,
          category: i.category,
          severity: i.severity,
          status: i.status,
          priorityScore: i.priorityScore,
          zoneName: i.zoneName,
          estimatedLoss: i.estimatedWaterLossLitersPerDay,
        })),
        zones: zonesRisk.map((z) => ({
          name: z.zoneName,
          overallRisk: z.overallRiskLevel,
          temperature: z.temperatureC,
          lossEstimate: 18000,
        })),
        totalSavedLiters: totalSaved,
        activeCount,
        criticalCount,
      };

      const res = await askAIOperationsAssistant(queryText, contextData);

      const aiMsg: Message = {
        id: `ai-${Date.now()}`,
        sender: 'ASSISTANT',
        text: res.answer,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        relevantId: res.relevantIncidentIds ? res.relevantIncidentIds[0] : undefined,
      };

      setMessages((prev) => [...prev, aiMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/90 shadow-2xl flex flex-col h-[650px] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 bg-slate-950/80 p-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-950 border border-cyan-800 text-cyan-400">
            <Bot className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white">AquaGrid Operations Advisor</h3>
              <span className="rounded-md bg-cyan-950 px-1.5 py-0.5 text-[10px] font-semibold text-cyan-300 border border-cyan-800/60">
                Grounding Active
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Direct access to live hydraulic loss metrics, priority indices, and asset records
            </p>
          </div>
        </div>
      </div>

      {/* Preset Question Pills */}
      <div className="border-b border-slate-800/80 bg-slate-950/50 p-2.5 px-4 flex flex-wrap gap-2 text-xs">
        <span className="text-[11px] text-slate-500 font-semibold self-center">
          Ask Advisor:
        </span>
        {PRESET_QUERIES.map((q) => (
          <button
            key={q}
            onClick={() => handleSend(q)}
            disabled={loading}
            className="rounded-lg border border-slate-800 bg-slate-900 hover:border-cyan-600 px-2.5 py-1 text-[11px] text-slate-300 hover:text-cyan-300 transition"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((m) => {
          const isUser = m.sender === 'USER';
          return (
            <div
              key={m.id}
              className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : ''}`}
            >
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-xs font-bold ${
                  isUser
                    ? 'bg-cyan-600 text-white'
                    : 'bg-slate-800 text-cyan-400 border border-slate-700'
                }`}
              >
                {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
              </div>

              <div
                className={`max-w-xl rounded-2xl p-3.5 text-xs leading-relaxed space-y-2 ${
                  isUser
                    ? 'bg-cyan-600 text-white rounded-tr-none'
                    : 'bg-slate-950 border border-slate-800 text-slate-200 rounded-tl-none shadow-md'
                }`}
              >
                <div
                  className="whitespace-pre-line"
                  dangerouslySetInnerHTML={{
                    __html: m.text
                      .replace(/\*\*(.*?)\*\*/g, '<b>$1</b>')
                      .replace(/\n/g, '<br/>'),
                  }}
                />

                {m.relevantId && onSelectIncident && (
                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                    <span className="text-[10px] text-cyan-400">
                      Target Incident: <b>{m.relevantId}</b>
                    </span>
                    <button
                      onClick={() => onSelectIncident(m.relevantId!)}
                      className="flex items-center gap-1 rounded bg-slate-900 px-2 py-0.5 text-[10px] text-cyan-300 hover:bg-slate-800 border border-slate-800"
                    >
                      <span>Open Incident</span>
                      <ArrowRight className="h-2.5 w-2.5" />
                    </button>
                  </div>
                )}

                <div
                  className={`text-[9px] ${
                    isUser ? 'text-cyan-200' : 'text-slate-500'
                  } text-right`}
                >
                  {m.timestamp}
                </div>
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex items-center gap-2 text-xs text-cyan-400 pl-11">
            <Sparkles className="h-3.5 w-3.5 animate-spin" />
            <span>Analyzing hydraulic operational parameters...</span>
          </div>
        )}
      </div>

      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend(inputText);
        }}
        className="border-t border-slate-800 bg-slate-950 p-3 flex gap-2"
      >
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Ask operational questions (e.g., Which zone has highest water loss?)..."
          className="flex-1 rounded-xl border border-slate-800 bg-slate-900 px-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
        />
        <button
          type="submit"
          disabled={!inputText.trim() || loading}
          className="flex items-center justify-center rounded-xl bg-cyan-600 px-4 text-xs font-bold text-white hover:bg-cyan-500 transition disabled:opacity-50"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
};
