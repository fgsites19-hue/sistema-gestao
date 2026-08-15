import React from 'react';
import {
  DollarSign,
  FolderKanban,
  CheckSquare,
  AlertTriangle,
  TrendingUp,
  Repeat,
  Sparkles,
  ArrowRight,
  Clock,
  CheckCircle2,
  Calendar,
  Plus,
  Building2,
  FileText,
  Users,
  Target,
  Layers,
} from 'lucide-react';
import { useDatabase } from '../context/DatabaseContext';
import { StatCard } from '../components/ui/StatCard';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';

interface DashboardViewProps {
  onNavigateTab: (tab: any, entityId?: string) => void;
  onOpenNewProject: () => void;
  onOpenNewTransaction: () => void;
  onOpenNewLead: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onNavigateTab,
  onOpenNewProject,
  onOpenNewTransaction,
  onOpenNewLead,
}) => {
  const {
    user,
    projects,
    tasks,
    leads,
    proposals,
    installments,
    transactions,
    recurringServices,
    updateTaskStatus,
    markInstallmentPaid,
    activityLogs,
  } = useDatabase();

  // Metrics Calculations
  const activeProjects = projects.filter((p) => p.status !== 'entregue' && p.status !== 'cancelado');
  const overdueProjects = activeProjects.filter((p) => new Date(p.deadline) < new Date());

  // Proposals metrics
  const pendingProposals = proposals.filter(
    (p) => p.status === 'enviada' || p.status === 'em_revisao' || p.status === 'rascunho'
  );
  const pendingProposalsValue = pendingProposals.reduce((acc, p) => acc + p.totalValue, 0);

  // Leads metrics
  const totalLeads = leads.length;
  const wonLeads = leads.filter((l) => l.status === 'ganho').length;

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  // Inflows received
  const receivedThisMonth = transactions
    .filter((t) => {
      if (t.type !== 'entrada' || t.status !== 'pago') return false;
      const d = new Date(t.date);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    })
    .reduce((acc, t) => acc + t.value, 0);

  // Outflows (Expenses)
  const expensesThisMonth = transactions
    .filter((t) => {
      if (t.type !== 'saida' || t.status !== 'pago') return false;
      const d = new Date(t.date);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    })
    .reduce((acc, t) => acc + t.value, 0);

  // Installments to receive this month
  const toReceiveThisMonth = installments
    .filter((i) => i.status === 'pendente')
    .reduce((acc, i) => acc + i.value, 0);

  // Overdue Installments
  const overdueInstallments = installments.filter((i) => i.status === 'vencido');
  const overdueTotalValue = overdueInstallments.reduce((acc, i) => acc + i.value, 0);

  // MRR (Monthly Recurring Revenue)
  const mrr = recurringServices
    .filter((r) => r.status === 'ativo')
    .reduce((acc, r) => {
      if (r.billingCycle === 'mensal') return acc + r.value;
      if (r.billingCycle === 'trimestral') return acc + r.value / 3;
      if (r.billingCycle === 'semestral') return acc + r.value / 6;
      if (r.billingCycle === 'anual') return acc + r.value / 12;
      return acc + r.value;
    }, 0);

  const estimatedNetProfit = receivedThisMonth - expensesThisMonth;

  // Actionable "Meu Dia" items
  const pendingTasks = tasks.filter((t) => t.status !== 'concluido');
  const highPriorityTasks = pendingTasks.filter((t) => t.priority === 'alta' || t.priority === 'urgente');

  return (
    <div className="space-y-6">
      {/* Top Welcome & "MEU DIA" Action Card */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-5 sm:p-6 shadow-xl border border-indigo-900/40 relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-500/10 via-transparent to-transparent pointer-events-none" />

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400 bg-indigo-500/20 px-2 py-0.5 rounded border border-indigo-500/30">
                Painel do Dia
              </span>
              <span className="text-xs text-slate-400">
                {new Date().toLocaleDateString('pt-BR', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                })}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Olá, {user.name.split(' ')[0]} 👋
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
              Você tem <strong>{activeProjects.length} projetos em andamento</strong>,{' '}
              <strong>{pendingTasks.length} tarefas pendentes</strong> e{' '}
              <strong className={overdueInstallments.length > 0 ? 'text-rose-400' : 'text-emerald-400'}>
                {overdueInstallments.length > 0
                  ? `${overdueInstallments.length} faturas em atraso`
                  : 'nenhuma fatura atrasada'}
              </strong>
              .
            </p>
          </div>

          {/* Quick Action Shortcuts */}
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              size="sm"
              variant="secondary"
              onClick={onOpenNewProject}
              leftIcon={<Plus className="w-3.5 h-3.5 text-indigo-400" />}
              className="bg-slate-800/90 border border-slate-700 hover:bg-slate-700 text-xs"
            >
              Novo Projeto
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={onOpenNewTransaction}
              leftIcon={<DollarSign className="w-3.5 h-3.5 text-emerald-400" />}
              className="bg-slate-800/90 border border-slate-700 hover:bg-slate-700 text-xs"
            >
              Lançamento
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => onNavigateTab('ia')}
              leftIcon={<Sparkles className="w-3.5 h-3.5 text-amber-400" />}
              className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs border-0"
            >
              Assistente IA
            </Button>
          </div>
        </div>

        {/* Actionable items badge bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3 mt-4 pt-4 border-t border-indigo-900/50">
          <div
            onClick={() => onNavigateTab('tarefas')}
            className="flex items-center gap-2.5 p-2 rounded-lg bg-white/5 hover:bg-white/10 cursor-pointer transition-colors"
          >
            <CheckSquare className="w-4 h-4 text-indigo-400 shrink-0" />
            <span className="text-xs text-slate-200">
              <strong>{highPriorityTasks.length} tarefas</strong> com alta prioridade
            </span>
          </div>

          <div
            onClick={() => onNavigateTab('financeiro')}
            className="flex items-center gap-2.5 p-2 rounded-lg bg-white/5 hover:bg-white/10 cursor-pointer transition-colors"
          >
            <AlertTriangle className={`w-4 h-4 shrink-0 ${overdueInstallments.length > 0 ? 'text-rose-400' : 'text-emerald-400'}`} />
            <span className="text-xs text-slate-200">
              <strong>R$ {overdueTotalValue.toLocaleString('pt-BR')}</strong> a receber em atraso
            </span>
          </div>

          <div
            onClick={() => onNavigateTab('leads')}
            className="flex items-center gap-2.5 p-2 rounded-lg bg-white/5 hover:bg-white/10 cursor-pointer transition-colors"
          >
            <TrendingUp className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="text-xs text-slate-200">
              <strong>{leads.filter((l) => l.status === 'proposta_enviada' || l.status === 'negociacao').length} propostas</strong> aguardando resposta
            </span>
          </div>
        </div>
      </div>

      {/* CORE SUMMARY ROW: KEY OPERATIONAL & COMMERCIAL METRICS */}
      <div className="bg-slate-50 dark:bg-slate-850/70 p-3.5 sm:p-4 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-2xs">
        <div className="flex items-center justify-between mb-3 px-1">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Resumo Operacional & Comercial
            </h2>
          </div>
          <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium hidden sm:inline">
            Visão consolidada em tempo real
          </span>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {/* 1. Monthly Recurring Revenue */}
          <div
            onClick={() => onNavigateTab('recorrencias')}
            className="p-3.5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700/80 hover:border-amber-400/60 dark:hover:border-amber-500/50 hover:shadow-xs transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-tight">
                Monthly Recurring Revenue
              </span>
              <div className="w-7 h-7 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Repeat className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">
              R$ {mrr.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              <span className="text-[11px] font-medium text-slate-400 ml-1">/mês</span>
            </div>
            <div className="text-[11px] text-amber-600 dark:text-amber-400 font-medium mt-0.5 truncate">
              {recurringServices.filter((r) => r.status === 'ativo').length} contratos recorrentes
            </div>
          </div>

          {/* 2. Active Projects */}
          <div
            onClick={() => onNavigateTab('projetos')}
            className="p-3.5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700/80 hover:border-indigo-400/60 dark:hover:border-indigo-500/50 hover:shadow-xs transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-tight">
                Active Projects
              </span>
              <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                <FolderKanban className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">
              {activeProjects.length}
              <span className="text-[11px] font-medium text-slate-400 ml-1">em produção</span>
            </div>
            <div className="text-[11px] text-indigo-600 dark:text-indigo-400 font-medium mt-0.5 truncate">
              {overdueProjects.length > 0
                ? `${overdueProjects.length} projeto(s) em atraso`
                : '100% no prazo acordado'}
            </div>
          </div>

          {/* 3. Pending Proposals */}
          <div
            onClick={() => onNavigateTab('propostas')}
            className="p-3.5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700/80 hover:border-purple-400/60 dark:hover:border-purple-500/50 hover:shadow-xs transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-tight">
                Pending Proposals
              </span>
              <div className="w-7 h-7 rounded-lg bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                <FileText className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">
              {pendingProposals.length}
              <span className="text-[11px] font-medium text-slate-400 ml-1">em aberto</span>
            </div>
            <div className="text-[11px] text-purple-600 dark:text-purple-400 font-medium mt-0.5 truncate">
              R$ {pendingProposalsValue.toLocaleString('pt-BR')} no pipeline
            </div>
          </div>

          {/* 4. Total Leads */}
          <div
            onClick={() => onNavigateTab('leads')}
            className="p-3.5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700/80 hover:border-emerald-400/60 dark:hover:border-emerald-500/50 hover:shadow-xs transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-tight">
                Total Leads
              </span>
              <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Users className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">
              {totalLeads}
              <span className="text-[11px] font-medium text-slate-400 ml-1">captados</span>
            </div>
            <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-0.5 truncate">
              {wonLeads} convertidos em clientes
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <StatCard
          title="Recebido no Mês"
          value={`R$ ${receivedThisMonth.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
          subtitle="Entradas liquidadas"
          trend={{ value: '+18%', isPositive: true }}
          icon={<DollarSign className="w-5 h-5" />}
          variant="emerald"
          onClick={() => onNavigateTab('financeiro')}
        />

        <StatCard
          title="A Receber (Previsão)"
          value={`R$ ${toReceiveThisMonth.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
          subtitle="Parcelas pendentes"
          icon={<Clock className="w-5 h-5" />}
          variant="indigo"
          onClick={() => onNavigateTab('financeiro')}
        />

        <StatCard
          title="MRR Recorrente"
          value={`R$ ${mrr.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}/mês`}
          subtitle={`${recurringServices.filter((r) => r.status === 'ativo').length} planos ativos`}
          icon={<Repeat className="w-5 h-5" />}
          variant="amber"
          onClick={() => onNavigateTab('recorrencias')}
        />

        <StatCard
          title="Lucro Líquido Est."
          value={`R$ ${estimatedNetProfit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
          subtitle={`Despesas: R$ ${expensesThisMonth.toLocaleString('pt-BR')}`}
          icon={<TrendingUp className="w-5 h-5" />}
          variant={estimatedNetProfit >= 0 ? 'emerald' : 'rose'}
          onClick={() => onNavigateTab('financeiro')}
        />
      </div>

      {/* Main Grid: Active Projects & Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 spans): Active Projects */}
        <div className="lg:col-span-2 space-y-6">
          <Card padding="md">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm sm:text-base font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                  <FolderKanban className="w-4 h-4 text-indigo-600" />
                  Projetos em Andamento ({activeProjects.length})
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Acompanhe a etapa atual, percentual de progresso e prazo de entrega.
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onNavigateTab('projetos')}
                rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                className="text-xs"
              >
                Ver todos
              </Button>
            </div>

            <div className="space-y-3">
              {activeProjects.slice(0, 4).map((project) => {
                const isOverdue = new Date(project.deadline) < new Date();
                return (
                  <div
                    key={project.id}
                    onClick={() => onNavigateTab('projetos', project.id)}
                    className="p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 hover:border-indigo-200 dark:hover:border-indigo-900 bg-slate-50/50 dark:bg-slate-850/50 hover:bg-indigo-50/30 transition-all cursor-pointer group"
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white group-hover:text-indigo-600 transition-colors truncate">
                            {project.name}
                          </h4>
                          <Badge status={project.status} size="sm" />
                          <Badge status={project.priority} size="sm" />
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          Cliente: <strong className="text-slate-700 dark:text-slate-300">{project.clientName}</strong> • R$ {project.value.toLocaleString('pt-BR')}
                        </p>
                      </div>

                      <div className="text-right shrink-0">
                        <span
                          className={`text-xs font-semibold ${
                            isOverdue ? 'text-rose-600 dark:text-rose-400' : 'text-slate-500 dark:text-slate-400'
                          }`}
                        >
                          Prazo: {new Date(project.deadline).toLocaleDateString('pt-BR')}
                        </span>
                        {isOverdue && (
                          <span className="block text-[10px] text-rose-500 font-bold uppercase">
                            Atrasado
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div className="space-y-1 mt-2">
                      <div className="flex items-center justify-between text-[11px] text-slate-500">
                        <span>Progresso</span>
                        <span className="font-semibold text-slate-700 dark:text-slate-300">
                          {project.progress}%
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-indigo-600 h-full rounded-full transition-all duration-300"
                          style={{ width: `${project.progress}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Contas a Receber / Faturas Próximas */}
          <Card padding="md">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm sm:text-base font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-emerald-600" />
                  Próximos Recebimentos & Faturas
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Parcelas pendentes de projetos e serviços com vencimento próximo.
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onNavigateTab('financeiro')}
                rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                className="text-xs"
              >
                Financeiro
              </Button>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {installments.slice(0, 4).map((inst) => (
                <div
                  key={inst.id}
                  className="py-3 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-900 dark:text-white truncate">
                      {inst.projectName} ({inst.installmentNumber}/{inst.totalInstallments})
                    </p>
                    <p className="text-slate-500 dark:text-slate-400 text-[11px]">
                      Cliente: {inst.clientName} • Vence: {new Date(inst.dueDate).toLocaleDateString('pt-BR')}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="font-bold text-slate-900 dark:text-white">
                      R$ {inst.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                    <Badge status={inst.status} size="sm" />

                    {inst.status !== 'pago' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => markInstallmentPaid(inst.id)}
                        className="text-[11px] py-1 px-2 text-emerald-600 border-emerald-200 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
                      >
                        Baixar
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right Column: Pending Tasks & Recent Activity */}
        <div className="space-y-6">
          {/* Quick Tasks Widget */}
          <Card padding="md">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-indigo-600" />
                Tarefas Prioritárias
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onNavigateTab('tarefas')}
                className="text-xs p-1 h-auto"
              >
                Ver Kanban
              </Button>
            </div>

            <div className="space-y-2.5">
              {pendingTasks.slice(0, 5).map((task) => (
                <div
                  key={task.id}
                  className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-start gap-2.5 hover:shadow-2xs transition-all"
                >
                  <input
                    type="checkbox"
                    checked={task.status === 'concluido'}
                    onChange={() =>
                      updateTaskStatus(task.id, task.status === 'concluido' ? 'a_fazer' : 'concluido')
                    }
                    className="mt-0.5 w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                  />
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-xs font-medium ${
                        task.status === 'concluido'
                          ? 'line-through text-slate-400'
                          : 'text-slate-800 dark:text-slate-200'
                      } truncate`}
                    >
                      {task.title}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] text-slate-400 truncate">
                        {task.projectName}
                      </span>
                      <Badge status={task.priority} size="sm" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Recent Activity Timeline */}
          <Card padding="md">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-400" />
              Atividades Recentes
            </h3>

            <div className="space-y-3">
              {activityLogs.slice(0, 6).map((log) => (
                <div key={log.id} className="flex items-start gap-2.5 text-xs">
                  <div className="w-2 h-2 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-slate-700 dark:text-slate-300 font-medium leading-snug">
                      {log.action}
                    </p>
                    <span className="text-[10px] text-slate-400">
                      {new Date(log.createdAt).toLocaleTimeString('pt-BR', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
