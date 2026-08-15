import React, { useState, useEffect, useRef } from 'react';
import {
  Plus,
  X,
  CheckSquare,
  DollarSign,
  FolderKanban,
  UserPlus,
  TrendingUp,
  FileText,
  FileCheck,
  Repeat,
  Sparkles,
} from 'lucide-react';

interface FloatingQuickActionsProps {
  onNewTask: () => void;
  onNewTransaction: () => void;
  onNewProject: () => void;
  onNewClient: () => void;
  onNewLead: () => void;
  onNewProposal: () => void;
  onNewContract: () => void;
  onNewRecurring: () => void;
  onOpenAiAssistant?: () => void;
}

export const FloatingQuickActions: React.FC<FloatingQuickActionsProps> = ({
  onNewTask,
  onNewTransaction,
  onNewProject,
  onNewClient,
  onNewLead,
  onNewProposal,
  onNewContract,
  onNewRecurring,
  onOpenAiAssistant,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close on Escape or click outside
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleAction = (actionFn: () => void) => {
    setIsOpen(false);
    actionFn();
  };

  const quickActions = [
    {
      id: 'task',
      label: 'Nova Tarefa',
      description: 'Adicionar checklist ou entrega',
      icon: CheckSquare,
      color: 'bg-indigo-500 hover:bg-indigo-600 text-white',
      badgeColor: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300',
      action: onNewTask,
      category: 'Operação',
    },
    {
      id: 'transaction',
      label: 'Novo Lançamento / Fatura',
      description: 'Registrar entrada ou saída',
      icon: DollarSign,
      color: 'bg-emerald-500 hover:bg-emerald-600 text-white',
      badgeColor: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
      action: onNewTransaction,
      category: 'Financeiro',
    },
    {
      id: 'project',
      label: 'Novo Projeto',
      description: 'Site, E-commerce, Landing page',
      icon: FolderKanban,
      color: 'bg-blue-500 hover:bg-blue-600 text-white',
      badgeColor: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
      action: onNewProject,
      category: 'Operação',
    },
    {
      id: 'client',
      label: 'Novo Cliente',
      description: 'Cadastrar PF ou PJ',
      icon: UserPlus,
      color: 'bg-violet-500 hover:bg-violet-600 text-white',
      badgeColor: 'bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300',
      action: onNewClient,
      category: 'Gestão',
    },
    {
      id: 'lead',
      label: 'Nova Oportunidade (Lead)',
      description: 'Adicionar ao funil comercial',
      icon: TrendingUp,
      color: 'bg-amber-500 hover:bg-amber-600 text-white',
      badgeColor: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
      action: onNewLead,
      category: 'Comercial',
    },
    {
      id: 'proposal',
      label: 'Nova Proposta',
      description: 'Orçamento com precificação',
      icon: FileText,
      color: 'bg-cyan-500 hover:bg-cyan-600 text-white',
      badgeColor: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-950 dark:text-cyan-300',
      action: onNewProposal,
      category: 'Comercial',
    },
    {
      id: 'contract',
      label: 'Novo Contrato',
      description: 'Gerar minuta contratual',
      icon: FileCheck,
      color: 'bg-teal-500 hover:bg-teal-600 text-white',
      badgeColor: 'bg-teal-100 text-teal-700 dark:bg-teal-950 dark:text-teal-300',
      action: onNewContract,
      category: 'Jurídico',
    },
    {
      id: 'recurring',
      label: 'Novo Plano Recorrente (MRR)',
      description: 'Manutenção ou hospedagem',
      icon: Repeat,
      color: 'bg-rose-500 hover:bg-rose-600 text-white',
      badgeColor: 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300',
      action: onNewRecurring,
      category: 'Financeiro',
    },
  ];

  return (
    <div ref={menuRef} className="fixed bottom-5 right-5 z-40 font-sans print:hidden">
      {/* Backdrop when open */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/20 dark:bg-slate-950/40 backdrop-blur-xs transition-opacity duration-200"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Expanded Menu Panel */}
      {isOpen && (
        <div
          id="quick-actions-menu"
          className="absolute bottom-16 right-0 w-80 sm:w-96 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200/90 dark:border-slate-800 p-4 mb-2 animate-in fade-in slide-in-from-bottom-5 duration-200 z-50 overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-none">
                  Ações Rápidas
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Crie novos registros de qualquer lugar
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Fechar (Esc)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Action Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[380px] overflow-y-auto pr-1">
            {quickActions.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  id={`quick-action-${item.id}`}
                  onClick={() => handleAction(item.action)}
                  className="flex items-start gap-2.5 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/70 dark:bg-slate-850/60 hover:bg-indigo-50/60 dark:hover:bg-indigo-950/40 hover:border-indigo-200 dark:hover:border-indigo-800/60 transition-all text-left group cursor-pointer"
                >
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 shadow-2xs ${item.color} transition-transform group-hover:scale-105`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 block truncate">
                      {item.label}
                    </span>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 block truncate leading-tight mt-0.5">
                      {item.description}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Footer with AI prompt shortcut if provided */}
          {onOpenAiAssistant && (
            <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <button
                id="quick-action-ai"
                onClick={() => handleAction(onOpenAiAssistant)}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-semibold shadow-sm transition-all"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Consultar Assistente IA</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Main Floating Trigger Button */}
      <button
        id="floating-quick-actions-trigger"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label="Abrir menu de ações rápidas"
        className={`group relative flex items-center justify-center w-13 h-13 sm:w-14 sm:h-14 rounded-full shadow-xl transition-all duration-300 transform active:scale-95 ${
          isOpen
            ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 rotate-90 shadow-indigo-500/25'
            : 'bg-gradient-to-tr from-indigo-600 via-indigo-600 to-violet-600 text-white hover:shadow-indigo-500/30 hover:scale-105 hover:-translate-y-0.5'
        }`}
      >
        {/* Pulse ring when closed */}
        {!isOpen && (
          <span className="absolute -inset-0.5 rounded-full bg-indigo-500/30 animate-ping pointer-events-none opacity-75" />
        )}

        {isOpen ? (
          <X className="w-6 h-6 transition-transform duration-200" />
        ) : (
          <Plus className="w-6 h-6 transition-transform duration-200 group-hover:rotate-90" />
        )}

        {/* Floating tooltip badge when not opened */}
        {!isOpen && (
          <span className="absolute right-full mr-3 px-2.5 py-1 rounded-lg bg-slate-900 dark:bg-slate-800 text-white text-xs font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity shadow-lg pointer-events-none hidden sm:block">
            + Ações Rápidas
          </span>
        )}
      </button>
    </div>
  );
};
