import React from 'react';
import {
  LayoutDashboard,
  Users,
  Building2,
  FolderKanban,
  CheckSquare,
  FileSpreadsheet,
  FileSignature,
  DollarSign,
  Repeat,
  FolderArchive,
  CalendarDays,
  BarChart3,
  Sparkles,
  Settings,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import { useDatabase } from '../../context/DatabaseContext';

export type NavTabId =
  | 'dashboard'
  | 'leads'
  | 'clientes'
  | 'projetos'
  | 'tarefas'
  | 'propostas'
  | 'contratos'
  | 'financeiro'
  | 'recorrencias'
  | 'arquivos'
  | 'calendario'
  | 'relatorios'
  | 'portal'
  | 'ia'
  | 'configuracoes';

interface SidebarProps {
  currentTab: NavTabId;
  onTabChange: (tab: NavTabId) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onTabChange,
  isCollapsed,
  onToggleCollapse,
  isMobileOpen,
  onCloseMobile,
}) => {
  const { leads, projects, tasks, contracts, proposals, installments } = useDatabase();

  // Badges calculation
  const newLeadsCount = leads.filter((l) => l.status === 'novo' || l.status === 'contato_realizado').length;
  const activeProjectsCount = projects.filter((p) => p.status !== 'entregue' && p.status !== 'cancelado').length;
  const pendingTasksCount = tasks.filter((t) => t.status !== 'concluido').length;
  const pendingContractsCount = contracts.filter((c) => c.status === 'aguardando_assinatura').length;
  const overdueInvoicesCount = installments.filter((i) => i.status === 'vencido').length;

  const navItems: { id: NavTabId; label: string; icon: React.ReactNode; badge?: number; badgeColor?: string }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4 shrink-0" /> },
    { id: 'leads', label: 'Leads (CRM)', icon: <Users className="w-4 h-4 shrink-0" />, badge: newLeadsCount > 0 ? newLeadsCount : undefined, badgeColor: 'bg-sky-500 text-white' },
    { id: 'clientes', label: 'Clientes', icon: <Building2 className="w-4 h-4 shrink-0" /> },
    { id: 'projetos', label: 'Projetos', icon: <FolderKanban className="w-4 h-4 shrink-0" />, badge: activeProjectsCount > 0 ? activeProjectsCount : undefined, badgeColor: 'bg-indigo-500 text-white' },
    { id: 'tarefas', label: 'Tarefas', icon: <CheckSquare className="w-4 h-4 shrink-0" />, badge: pendingTasksCount > 0 ? pendingTasksCount : undefined, badgeColor: 'bg-slate-500 text-white' },
    { id: 'propostas', label: 'Propostas', icon: <FileSpreadsheet className="w-4 h-4 shrink-0" /> },
    { id: 'contratos', label: 'Contratos', icon: <FileSignature className="w-4 h-4 shrink-0" />, badge: pendingContractsCount > 0 ? pendingContractsCount : undefined, badgeColor: 'bg-amber-500 text-white' },
    { id: 'financeiro', label: 'Financeiro', icon: <DollarSign className="w-4 h-4 shrink-0" />, badge: overdueInvoicesCount > 0 ? overdueInvoicesCount : undefined, badgeColor: 'bg-rose-500 text-white' },
    { id: 'recorrencias', label: 'Recorrências', icon: <Repeat className="w-4 h-4 shrink-0" /> },
    { id: 'arquivos', label: 'Arquivos', icon: <FolderArchive className="w-4 h-4 shrink-0" /> },
    { id: 'calendario', label: 'Calendário', icon: <CalendarDays className="w-4 h-4 shrink-0" /> },
    { id: 'relatorios', label: 'Relatórios', icon: <BarChart3 className="w-4 h-4 shrink-0" /> },
    { id: 'portal', label: 'Portal do Cliente', icon: <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-400" /> },
    { id: 'ia', label: 'Assistente IA', icon: <Sparkles className="w-4 h-4 shrink-0 text-amber-500" /> },
    { id: 'configuracoes', label: 'Configurações', icon: <Settings className="w-4 h-4 shrink-0" /> },
  ];

  const handleSelect = (tab: NavTabId) => {
    onTabChange(tab);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-xs lg:hidden"
        />
      )}

      <aside
        className={`fixed top-0 left-0 bottom-0 z-40 flex flex-col bg-slate-900 text-slate-200 border-r border-slate-800 transition-all duration-200 ${
          isCollapsed ? 'w-18' : 'w-64'
        } ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-slate-800 shrink-0">
          <div
            onClick={() => handleSelect('dashboard')}
            className="flex items-center gap-2.5 cursor-pointer select-none"
          >
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold tracking-wider text-sm shadow-md shadow-indigo-600/30">
              S
            </div>
            {!isCollapsed && (
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-white text-base tracking-tight">StudioOS</span>
                  <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded-sm bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                    Pro
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 leading-none">Web Design ERP</p>
              </div>
            )}
          </div>

          <button
            onClick={onToggleCollapse}
            className="hidden lg:flex p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title={isCollapsed ? 'Expandir menu' : 'Recolher menu'}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto py-3 px-2.5 space-y-0.5 no-scrollbar">
          {navItems.map((item) => {
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleSelect(item.id)}
                title={isCollapsed ? item.label : undefined}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors duration-150 ${
                  isActive
                    ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/80'
                } ${isCollapsed ? 'justify-center px-2' : 'justify-between'}`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  {item.icon}
                  {!isCollapsed && <span className="truncate">{item.label}</span>}
                </div>

                {!isCollapsed && item.badge !== undefined && (
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                      item.badgeColor || 'bg-slate-700 text-slate-200'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}

                {isCollapsed && item.badge !== undefined && (
                  <span
                    className={`absolute top-1.5 right-1.5 w-2 h-2 rounded-full ${
                      item.badgeColor || 'bg-indigo-500'
                    }`}
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Bottom User / Agency pill */}
        {!isCollapsed && (
          <div className="p-3 border-t border-slate-800 shrink-0 bg-slate-900/60">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-semibold text-slate-200 shrink-0">
                  FS
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-medium text-white truncate">Felipe Santos</p>
                  <p className="text-[10px] text-slate-400 truncate">StudioOS Agency</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </aside>
    </>
  );
};
