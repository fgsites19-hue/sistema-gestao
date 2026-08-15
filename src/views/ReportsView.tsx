import React, { useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  Users,
  FolderKanban,
  CheckSquare,
  Repeat,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  PieChart,
  Percent,
  Download,
  Filter,
  Printer,
  FileText,
} from 'lucide-react';
import { useDatabase } from '../context/DatabaseContext';
import { Card } from '../components/ui/Card';
import { StatCard } from '../components/ui/StatCard';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { PrintableReportModal } from '../components/reports/PrintableReportModal';
import { CsvExportModal } from '../components/reports/CsvExportModal';
import { ProjectEfficiencyD3Chart } from '../components/reports/ProjectEfficiencyD3Chart';

interface ReportsViewProps {
  onNavigateTab: (tab: any, entityId?: string) => void;
}

export const ReportsView: React.FC<ReportsViewProps> = ({ onNavigateTab }) => {
  const {
    projects,
    tasks,
    allTimeLogs,
    clients,
    leads,
    transactions,
    installments,
    recurringServices,
  } = useDatabase();

  const [period, setPeriod] = useState<'30' | '90' | '365' | 'all'>('all');
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isCsvModalOpen, setIsCsvModalOpen] = useState(false);
  const [exportReportType, setExportReportType] = useState<'financial' | 'projects' | 'executive'>('financial');

  // Calculations
  const totalInflows = transactions
    .filter((t) => t.type === 'entrada' && t.status === 'pago')
    .reduce((acc, t) => acc + t.value, 0);

  const totalExpenses = transactions
    .filter((t) => t.type === 'saida' && t.status === 'pago')
    .reduce((acc, t) => acc + t.value, 0);

  const netProfit = totalInflows - totalExpenses;
  const profitMargin = totalInflows > 0 ? ((netProfit / totalInflows) * 100).toFixed(1) : '0';

  // MRR
  const mrr = recurringServices
    .filter((r) => r.status === 'ativo')
    .reduce((acc, r) => {
      if (r.billingCycle === 'mensal') return acc + r.value;
      if (r.billingCycle === 'trimestral') return acc + r.value / 3;
      if (r.billingCycle === 'semestral') return acc + r.value / 6;
      if (r.billingCycle === 'anual') return acc + r.value / 12;
      return acc + r.value;
    }, 0);
  const arr = mrr * 12;

  // Pipeline conversion
  const totalLeads = leads.length;
  const wonLeads = leads.filter((l) => l.status === 'ganho').length;
  const conversionRate = totalLeads > 0 ? ((wonLeads / totalLeads) * 100).toFixed(1) : '0';

  // Average Project Ticket
  const totalProjectsValue = projects.reduce((acc, p) => acc + p.value, 0);
  const avgTicket = projects.length > 0 ? totalProjectsValue / projects.length : 0;

  // Revenue by Project Type
  const revenueByType: Record<string, number> = {};
  projects.forEach((p) => {
    revenueByType[p.type] = (revenueByType[p.type] || 0) + p.value;
  });

  const sortedTypes = Object.entries(revenueByType).sort((a, b) => b[1] - a[1]);

  // Lead Sources Breakdown
  const leadSourcesCount: Record<string, { total: number; won: number }> = {};
  leads.forEach((l) => {
    if (!leadSourcesCount[l.source]) {
      leadSourcesCount[l.source] = { total: 0, won: 0 };
    }
    leadSourcesCount[l.source].total += 1;
    if (l.status === 'ganho') {
      leadSourcesCount[l.source].won += 1;
    }
  });

  // Top Clients by LTV (Total invested)
  const clientLTV: Record<string, { name: string; company: string; total: number; projectsCount: number }> = {};
  projects.forEach((p) => {
    if (!clientLTV[p.clientId]) {
      clientLTV[p.clientId] = {
        name: p.clientName,
        company: clients.find((c) => c.id === p.clientId)?.company || '',
        total: 0,
        projectsCount: 0,
      };
    }
    clientLTV[p.clientId].total += p.value;
    clientLTV[p.clientId].projectsCount += 1;
  });

  const topClients = Object.values(clientLTV).sort((a, b) => b.total - a.total);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <BarChart3 className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            Relatórios & Inteligência do Negócio
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Métricas financeiras consolidadas, DRE executiva, funil de vendas e retorno por tipo de serviço.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Period selector */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
            <button
              onClick={() => setPeriod('30')}
              className={`px-2.5 py-1 text-xs rounded-md font-medium transition-colors ${
                period === '30'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              30 dias
            </button>
            <button
              onClick={() => setPeriod('90')}
              className={`px-2.5 py-1 text-xs rounded-md font-medium transition-colors ${
                period === '90'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Trimestre
            </button>
            <button
              onClick={() => setPeriod('all')}
              className={`px-2.5 py-1 text-xs rounded-md font-medium transition-colors ${
                period === 'all'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Geral / Tudo
            </button>
          </div>

          {/* CSV Spreadsheet Export Button */}
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setIsCsvModalOpen(true)}
            leftIcon={<Download className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />}
            className="shadow-xs"
          >
            Exportar CSV
          </Button>

          {/* PDF Export Button */}
          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              setExportReportType('executive');
              setIsExportModalOpen(true);
            }}
            leftIcon={<Printer className="w-4 h-4" />}
            className="shadow-sm"
          >
            Exportar PDF
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <StatCard
          title="Faturamento Bruto"
          value={`R$ ${totalInflows.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
          subtitle="Receitas liquidadas"
          icon={<DollarSign className="w-5 h-5" />}
          variant="emerald"
        />

        <StatCard
          title="Lucro Líquido Real"
          value={`R$ ${netProfit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
          subtitle={`Margem líquida: ${profitMargin}%`}
          icon={<TrendingUp className="w-5 h-5" />}
          variant="indigo"
        />

        <StatCard
          title="MRR / ARR Recorrente"
          value={`R$ ${mrr.toLocaleString('pt-BR')}/mês`}
          subtitle={`ARR: R$ ${arr.toLocaleString('pt-BR')}/ano`}
          icon={<Repeat className="w-5 h-5" />}
          variant="amber"
        />

        <StatCard
          title="Conversão de Leads"
          value={`${conversionRate}%`}
          subtitle={`${wonLeads} clientes de ${totalLeads} oportunidades`}
          icon={<Percent className="w-5 h-5" />}
          variant="purple"
        />
      </div>

      {/* DRE Simplificada do Web Designer */}
      <Card padding="md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-indigo-600" />
              Demonstrativo de Resultado do Exercício (DRE Operacional)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Visão clara da saúde financeira da sua operação de desenvolvimento e serviços digitais.
            </p>
          </div>

          <Button
            size="sm"
            variant="secondary"
            onClick={() => {
              setExportReportType('financial');
              setIsExportModalOpen(true);
            }}
            leftIcon={<Printer className="w-3.5 h-3.5 text-indigo-600" />}
            className="text-xs self-start sm:self-auto"
          >
            Imprimir DRE
          </Button>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs sm:text-sm">
          <div className="py-2.5 flex items-center justify-between font-semibold text-slate-800 dark:text-slate-200">
            <span>(+) Receita Bruta com Projetos e Serviços</span>
            <span className="text-emerald-600 dark:text-emerald-400">
              R$ {totalInflows.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </div>

          <div className="py-2.5 flex items-center justify-between text-slate-600 dark:text-slate-400 pl-4">
            <span>(-) Custos com Ferramentas, Hospedagens & Assinaturas</span>
            <span className="text-rose-500">
              - R${' '}
              {transactions
                .filter(
                  (t) =>
                    t.type === 'saida' &&
                    (t.category === 'Ferramentas' ||
                      t.category === 'Hospedagem & Servidores' ||
                      t.category === 'Softwares & Assinaturas')
                )
                .reduce((acc, t) => acc + t.value, 0)
                .toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </div>

          <div className="py-2.5 flex items-center justify-between text-slate-600 dark:text-slate-400 pl-4">
            <span>(-) Freelancers & Terceirizados</span>
            <span className="text-rose-500">
              - R${' '}
              {transactions
                .filter((t) => t.type === 'saida' && t.category === 'Freelancer & Terceirizados')
                .reduce((acc, t) => acc + t.value, 0)
                .toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </div>

          <div className="py-2.5 flex items-center justify-between text-slate-600 dark:text-slate-400 pl-4">
            <span>(-) Marketing, Tráfego e Impostos</span>
            <span className="text-rose-500">
              - R${' '}
              {transactions
                .filter(
                  (t) =>
                    t.type === 'saida' &&
                    (t.category === 'Marketing & Tráfego' || t.category === 'Impostos & Contador')
                )
                .reduce((acc, t) => acc + t.value, 0)
                .toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </div>

          <div className="py-3 flex items-center justify-between font-bold text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800/40 px-3 rounded-lg mt-1">
            <span>(=) RESULTADO LÍQUIDO FINAL</span>
            <span
              className={`text-base font-extrabold ${
                netProfit >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500'
              }`}
            >
              R$ {netProfit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      </Card>

      {/* D3.js Project Efficiency & Time Logged vs Estimated Chart */}
      <ProjectEfficiencyD3Chart
        projects={projects}
        tasks={tasks}
        timeLogs={allTimeLogs}
        onSelectProject={(projId) => onNavigateTab('projetos', projId)}
      />

      {/* Grid: Revenue by Category & Lead Sources */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue by Project Type */}
        <Card padding="md">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-1 flex items-center gap-2">
            <PieChart className="w-4 h-4 text-indigo-600" />
            Faturamento por Categoria de Serviço
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
            Qual tipo de projeto gera maior faturamento total no seu portfólio.
          </p>

          <div className="space-y-3">
            {sortedTypes.map(([typeName, val]) => {
              const pct = totalProjectsValue > 0 ? (val / totalProjectsValue) * 100 : 0;
              return (
                <div key={typeName} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-medium">
                    <span className="text-slate-800 dark:text-slate-200">{typeName}</span>
                    <span className="text-slate-900 dark:text-white font-bold">
                      R$ {val.toLocaleString('pt-BR')} ({pct.toFixed(0)}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-indigo-600 h-full rounded-full transition-all duration-300"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Lead Conversion Funnel by Source */}
        <Card padding="md">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-1 flex items-center gap-2">
            <Users className="w-4 h-4 text-emerald-600" />
            Origem de Clientes & Taxa de Conversão
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
            De onde vêm os leads mais qualificados que fecham contrato.
          </p>

          <div className="space-y-3">
            {Object.entries(leadSourcesCount).map(([source, data]) => {
              const convRate = data.total > 0 ? (data.won / data.total) * 100 : 0;
              return (
                <div
                  key={source}
                  className="p-2.5 rounded-lg border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850/50 flex items-center justify-between gap-3 text-xs"
                >
                  <div>
                    <span className="font-semibold text-slate-900 dark:text-white">{source}</span>
                    <p className="text-[11px] text-slate-400">
                      {data.total} oportunidades • {data.won} contratos fechados
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">
                      {convRate.toFixed(0)}% conversão
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Top 5 Clients by Lifetime Value (LTV) */}
      <Card padding="md">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-1 flex items-center gap-2">
          <FolderKanban className="w-4 h-4 text-purple-600" />
          Top Clientes por Faturamento Histórico (LTV)
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
          Clientes que mais investiram em desenvolvimento, upgrades e contratos com sua agência.
        </p>

        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {topClients.slice(0, 5).map((cl, idx) => (
            <div key={idx} className="py-3 flex items-center justify-between gap-3 text-xs sm:text-sm">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-bold flex items-center justify-center text-xs">
                  {idx + 1}
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900 dark:text-white">{cl.name}</h4>
                  <p className="text-xs text-slate-400">
                    {cl.company} • {cl.projectsCount} projeto(s) realizados
                  </p>
                </div>
              </div>

              <div className="text-right">
                <span className="font-bold text-slate-900 dark:text-white">
                  R$ {cl.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
                <span className="block text-[11px] text-emerald-600">Cliente VIP</span>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Printable Report PDF Modal */}
      <PrintableReportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        defaultType={exportReportType}
      />

      {/* CSV Spreadsheet Export Modal */}
      <CsvExportModal
        isOpen={isCsvModalOpen}
        onClose={() => setIsCsvModalOpen(false)}
      />
    </div>
  );
};
