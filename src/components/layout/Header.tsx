import React, { useState } from 'react';
import {
  Search,
  Plus,
  Bell,
  Menu,
  Sparkles,
  Users,
  FolderKanban,
  FileSpreadsheet,
  DollarSign,
  UserPlus,
  RotateCcw,
  ShieldCheck,
} from 'lucide-react';
import { Button } from '../ui/Button';
import { useDatabase } from '../../context/DatabaseContext';

interface HeaderProps {
  onOpenMobileMenu: () => void;
  onOpenGlobalSearch: () => void;
  onOpenNotifications: () => void;
  onOpenNewProjectWizard: () => void;
  onOpenNewClientModal: () => void;
  onOpenNewLeadModal: () => void;
  onOpenNewTransactionModal: () => void;
  onOpenNewProposalModal: () => void;
  onNavigateTab: (tab: any) => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenMobileMenu,
  onOpenGlobalSearch,
  onOpenNotifications,
  onOpenNewProjectWizard,
  onOpenNewClientModal,
  onOpenNewLeadModal,
  onOpenNewTransactionModal,
  onOpenNewProposalModal,
  onNavigateTab,
}) => {
  const { user, notifications, resetToSeedData } = useDatabase();
  const [isQuickMenuOpen, setIsQuickMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 px-4 sm:px-6 flex items-center justify-between gap-4">
      {/* Left Area: Mobile Menu & Search Input Trigger */}
      <div className="flex items-center gap-3 flex-1 max-w-xl">
        <button
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Global Search Button */}
        <button
          onClick={onOpenGlobalSearch}
          className="flex items-center gap-2 w-full max-w-md px-3.5 py-1.5 text-xs text-slate-400 bg-slate-100/90 dark:bg-slate-800/90 hover:bg-slate-200/70 dark:hover:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 transition-all text-left group"
        >
          <Search className="w-4 h-4 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200 shrink-0" />
          <span className="flex-1 truncate">Buscar no sistema (clientes, projetos, contratos...)</span>
          <kbd className="hidden sm:inline-block text-[10px] uppercase font-semibold text-slate-400 bg-white dark:bg-slate-900 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Right Area: Actions, Notifications & Profile */}
      <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
        {/* Quick "+ Novo" Button Dropdown */}
        <div className="relative">
          <Button
            size="sm"
            variant="primary"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => setIsQuickMenuOpen(!isQuickMenuOpen)}
            className="shadow-indigo-500/20"
          >
            <span className="hidden sm:inline">Novo</span>
          </Button>

          {isQuickMenuOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setIsQuickMenuOpen(false)}
              />
              <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-100 dark:border-slate-800">
                  Criar Rapidamente
                </div>

                <button
                  onClick={() => {
                    setIsQuickMenuOpen(false);
                    onOpenNewProjectWizard();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 text-left font-medium"
                >
                  <FolderKanban className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <div>
                    <span>Novo Projeto</span>
                    <p className="text-[10px] text-slate-400 font-normal">Com wizard e parcelamento</p>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setIsQuickMenuOpen(false);
                    onOpenNewClientModal();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 text-left font-medium"
                >
                  <Users className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <div>
                    <span>Novo Cliente</span>
                    <p className="text-[10px] text-slate-400 font-normal">Pessoa Física ou Jurídica</p>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setIsQuickMenuOpen(false);
                    onOpenNewLeadModal();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 text-left font-medium"
                >
                  <UserPlus className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                  <div>
                    <span>Novo Lead CRM</span>
                    <p className="text-[10px] text-slate-400 font-normal">Oportunidade comercial</p>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setIsQuickMenuOpen(false);
                    onOpenNewProposalModal();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 text-left font-medium"
                >
                  <FileSpreadsheet className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  <div>
                    <span>Nova Proposta</span>
                    <p className="text-[10px] text-slate-400 font-normal">Com serviços e desconto</p>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setIsQuickMenuOpen(false);
                    onOpenNewTransactionModal();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 text-left font-medium"
                >
                  <DollarSign className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <div>
                    <span>Lançamento Financeiro</span>
                    <p className="text-[10px] text-slate-400 font-normal">Entrada ou saída de caixa</p>
                  </div>
                </button>
              </div>
            </>
          )}
        </div>

        {/* Notifications Icon Button */}
        <button
          onClick={onOpenNotifications}
          className="relative p-2 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title="Notificações"
        >
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-slate-900" />
          )}
        </button>

        {/* User Profile Avatar & Menu */}
        <div className="relative">
          <button
            onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
            className="flex items-center gap-2 p-1 rounded-full hover:ring-2 hover:ring-indigo-500/30 transition-all"
          >
            <img
              src={user.avatarUrl}
              alt={user.name}
              className="w-8 h-8 rounded-full object-cover border border-slate-200 dark:border-slate-700"
            />
          </button>

          {isProfileMenuOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setIsProfileMenuOpen(false)}
              />
              <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800">
                  <p className="text-xs font-semibold text-slate-900 dark:text-white">
                    {user.name}
                  </p>
                  <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
                  <span className="inline-flex items-center gap-1 mt-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded">
                    <ShieldCheck className="w-3 h-3" /> Proprietário (Owner)
                  </span>
                </div>

                <div className="py-1">
                  <button
                    onClick={() => {
                      setIsProfileMenuOpen(false);
                      onNavigateTab('ia');
                    }}
                    className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 text-left font-medium"
                  >
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <span>Assistente IA do Negócio</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsProfileMenuOpen(false);
                      onNavigateTab('configuracoes');
                    }}
                    className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 text-left font-medium"
                  >
                    <span>Configurações da Empresa</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsProfileMenuOpen(false);
                      resetToSeedData();
                    }}
                    className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 text-left"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Restaurar Dados de Exemplo</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
