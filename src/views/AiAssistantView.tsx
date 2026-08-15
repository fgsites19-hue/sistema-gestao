import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Send,
  Bot,
  User,
  Copy,
  Check,
  RotateCcw,
  FileText,
  MessageSquare,
  ShieldAlert,
  Rocket,
  CheckSquare,
  TrendingUp,
  Loader2,
  Bookmark,
  Plus,
} from 'lucide-react';
import { useDatabase } from '../context/DatabaseContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { PromptPresetsModal, defaultPromptPresets, PromptPreset } from '../components/ai/PromptPresetsModal';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export const AiAssistantView: React.FC = () => {
  const {
    user,
    projects,
    leads,
    clients,
    installments,
    transactions,
    recurringServices,
    tasks,
  } = useDatabase();

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `Olá, ${user.name.split(' ')[0]}! Sou o **Assistente IA do StudioOS**, especializado em gestão, vendas e estratégias para Web Designers e Agências Digitais.

Tenho acesso em tempo real aos seus dados de faturamento, projetos, leads e cobranças. Posso ajudar você a:

* 📄 **Criar escopos e textos persuasivos para propostas**
* 💬 **Redigir mensagens de follow-up e cobrança no WhatsApp**
* 🛡️ **Responder a pedidos fora do escopo (scope creep)**
* 🚀 **Checklists de homologação e lançamento de websites**
* 📊 **Analisar a saúde financeira e previsibilidade de caixa**

Como posso te ajudar hoje?`,
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [inputPrompt, setInputPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isPresetsModalOpen, setIsPresetsModalOpen] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Quick action templates
  const quickPrompts = [
    {
      icon: <FileText className="w-4 h-4 text-indigo-500" />,
      label: 'Gerar Proposta Comercial',
      prompt:
        'Crie uma estrutura de proposta comercial persuasiva para um cliente de Landing Page de alta conversão para uma clínica médica. Inclua etapas, escopo, diferenciais e valor de R$ 3.500 em 2x.',
    },
    {
      icon: <MessageSquare className="w-4 h-4 text-emerald-500" />,
      label: 'Cobrança Elegante via WhatsApp',
      prompt:
        'Escreva uma mensagem de WhatsApp muito profissional, simpática e objetiva lembrando um cliente sobre uma fatura de desenvolvimento web que venceu há 3 dias.',
    },
    {
      icon: <ShieldAlert className="w-4 h-4 text-amber-500" />,
      label: 'Negar Fora de Escopo (Scope Creep)',
      prompt:
        'O cliente pediu funcionalidades adicionais de integração complexa que não estavam no contrato inicial. Escreva uma resposta educada explicando que é um adicional e apresentando uma estimativa extra.',
    },
    {
      icon: <Rocket className="w-4 h-4 text-purple-500" />,
      label: 'Checklist de Go-Live de Website',
      prompt:
        'Gere um checklist técnico e de design completo antes de colocar um site WordPress / Nuvemshop no ar (SSL, SEO básico, responsividade, links quebrados, formulários, favicon e Google Analytics).',
    },
    {
      icon: <TrendingUp className="w-4 h-4 text-sky-500" />,
      label: 'Oferta de Manutenção Recorrente',
      prompt:
        'Escreva um roteiro para oferecer um plano de manutenção mensal (R$ 490/mês) a um cliente que acabou de ter seu site entregue.',
    },
  ];

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputPrompt).trim();
    if (!query || isLoading) return;

    const userMessage: Message = {
      id: 'msg_' + Date.now(),
      role: 'user',
      content: query,
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputPrompt('');
    setIsLoading(true);

    // Prepare contextual data from database
    const contextData = {
      user: { name: user.name, company: user.companyName },
      activeProjectsCount: projects.filter((p) => p.status !== 'entregue' && p.status !== 'cancelado').length,
      projectsSummary: projects.map((p) => ({
        name: p.name,
        client: p.clientName,
        status: p.status,
        value: p.value,
        deadline: p.deadline,
      })),
      overdueInvoices: installments
        .filter((i) => i.status === 'vencido')
        .map((i) => ({
          client: i.clientName,
          project: i.projectName,
          value: i.value,
          dueDate: i.dueDate,
        })),
      pendingTasksCount: tasks.filter((t) => t.status !== 'concluido').length,
      mrr: recurringServices.filter((r) => r.status === 'ativo').reduce((acc, r) => acc + r.value, 0),
      totalClients: clients.length,
      leadsPipeline: leads.map((l) => ({ name: l.name, status: l.status, value: l.estimatedValue })),
    };

    try {
      const response = await fetch('/api/ai/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: query,
          contextData,
          conversationHistory: messages.slice(-8).map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      const data = await response.json();
      const replyContent =
        data.reply ||
        'Desculpe, não obtive uma resposta válida no momento. Tente novamente em instantes.';

      const assistantMessage: Message = {
        id: 'msg_ai_' + Date.now(),
        role: 'assistant',
        content: replyContent,
        timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error calling AI assistant:', error);
      const fallbackMessage: Message = {
        id: 'msg_ai_err_' + Date.now(),
        role: 'assistant',
        content:
          'Não foi possível conectar ao servidor de IA no momento. Verifique sua conexão e tente novamente.',
        timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, fallbackMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClearHistory = () => {
    setMessages([
      {
        id: 'welcome_reset',
        role: 'assistant',
        content: `Histórico reiniciado! Em que posso ajudar você agora, ${user.name.split(' ')[0]}?`,
        timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  return (
    <div className="space-y-4 max-w-5xl mx-auto h-[calc(100vh-8rem)] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between shrink-0 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-500/20">
            <Sparkles className="w-5 h-5 text-amber-300" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              Assistente IA StudioOS
              <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                Gemini 3.7 Flash
              </span>
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Copiloto inteligente para estratégias de vendas, escopos, contratos e rotinas de agência.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => setIsPresetsModalOpen(true)}
            leftIcon={<Bookmark className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />}
            className="text-xs"
          >
            Prompt Presets
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={handleClearHistory}
            leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
            className="text-xs"
          >
            Limpar Conversa
          </Button>
        </div>
      </div>

      {/* Quick Prompt Cards */}
      <div className="flex items-center justify-between gap-2 shrink-0">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 flex-1">
          {quickPrompts.map((qp, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(qp.prompt)}
              className="p-2.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-indigo-500 hover:shadow-xs text-left transition-all group flex flex-col justify-between"
            >
              <div className="mb-1">{qp.icon}</div>
              <span className="text-[11px] font-semibold text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 leading-tight">
                {qp.label}
              </span>
            </button>
          ))}
        </div>

        <button
          onClick={() => setIsPresetsModalOpen(true)}
          className="hidden lg:flex flex-col items-center justify-center p-2.5 rounded-xl border border-dashed border-indigo-300 dark:border-indigo-800 bg-indigo-50/40 dark:bg-indigo-950/20 hover:bg-indigo-50 text-indigo-600 dark:text-indigo-400 text-xs font-semibold shrink-0 h-full gap-1 transition-all"
          title="Ver todos os templates salvos"
        >
          <Plus className="w-4 h-4" />
          <span className="text-[10px]">Mais Presets</span>
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-4">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              {!isUser && (
                <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white shrink-0 shadow-xs">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-2xl rounded-2xl p-4 text-xs sm:text-sm shadow-2xs relative group ${
                  isUser
                    ? 'bg-indigo-600 text-white rounded-tr-none'
                    : 'bg-white dark:bg-slate-850 text-slate-800 dark:text-slate-200 border border-slate-200/80 dark:border-slate-800 rounded-tl-none'
                }`}
              >
                <div className="whitespace-pre-wrap leading-relaxed space-y-2">
                  {msg.content}
                </div>

                <div className="flex items-center justify-between gap-2 mt-2 pt-2 border-t border-white/10 dark:border-slate-800 text-[10px] text-slate-400">
                  <span>{msg.timestamp}</span>

                  {!isUser && (
                    <button
                      onClick={() => copyToClipboard(msg.content, msg.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400"
                    >
                      {copiedId === msg.id ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-500" />
                          <span className="text-emerald-500">Copiado!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copiar texto</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>

              {isUser && (
                <div className="w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center shrink-0 text-xs font-bold">
                  {user.name.slice(0, 2).toUpperCase()}
                </div>
              )}
            </div>
          );
        })}

        {isLoading && (
          <div className="flex gap-3 items-center text-slate-400 text-xs">
            <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white shrink-0 animate-pulse">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="flex items-center gap-2 p-3 bg-white dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
              <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
              <span>Analisando o contexto e gerando resposta...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="flex items-center gap-2 shrink-0"
      >
        <input
          type="text"
          value={inputPrompt}
          onChange={(e) => setInputPrompt(e.target.value)}
          placeholder="Pergunte sobre seus projetos, peça para redigir uma proposta, criar um escopo..."
          className="flex-1 px-4 py-3 text-xs sm:text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 text-slate-900 dark:text-white placeholder-slate-400 shadow-2xs"
          disabled={isLoading}
        />

        <Button
          type="submit"
          variant="primary"
          disabled={!inputPrompt.trim() || isLoading}
          className="px-4 py-3 shrink-0"
        >
          <Send className="w-4 h-4" />
        </Button>
      </form>

      {/* Prompt Presets Modal */}
      <PromptPresetsModal
        isOpen={isPresetsModalOpen}
        onClose={() => setIsPresetsModalOpen(false)}
        onSelectPreset={(prompt) => {
          setInputPrompt(prompt);
        }}
      />
    </div>
  );
};
