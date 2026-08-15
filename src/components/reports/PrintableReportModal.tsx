import React, { useState } from 'react';
import {
  Printer,
  X,
  FileText,
  DollarSign,
  FolderKanban,
  CheckCircle2,
  Calendar,
  Building2,
  TrendingUp,
  Download,
  Filter,
} from 'lucide-react';
import { useDatabase } from '../../context/DatabaseContext';
import { Button } from '../ui/Button';

interface PrintableReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultType?: 'financial' | 'projects' | 'executive';
}

export const PrintableReportModal: React.FC<PrintableReportModalProps> = ({
  isOpen,
  onClose,
  defaultType = 'financial',
}) => {
  const {
    user,
    settings,
    projects,
    clients,
    tasks,
    leads,
    proposals,
    transactions,
    installments,
    recurringServices,
  } = useDatabase();

  const [reportType, setReportType] = useState<'financial' | 'projects' | 'executive'>(defaultType);
  const [period, setPeriod] = useState<'30' | '90' | '365' | 'all'>('30');

  if (!isOpen) return null;

  const now = new Date();
  const currentDateFormatted = now.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  // Filter transactions by period
  const filteredTransactions = transactions.filter((t) => {
    if (period === 'all') return true;
    const tDate = new Date(t.date);
    const daysDiff = (now.getTime() - tDate.getTime()) / (1000 * 3600 * 24);
    const limitDays = period === '30' ? 30 : period === '90' ? 90 : 365;
    return daysDiff <= limitDays;
  });

  const totalInflows = filteredTransactions
    .filter((t) => t.type === 'entrada' && t.status === 'pago')
    .reduce((acc, t) => acc + t.value, 0);

  const totalExpenses = filteredTransactions
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

  const activeProjects = projects.filter((p) => p.status !== 'entregue' && p.status !== 'cancelado');
  const deliveredProjects = projects.filter((p) => p.status === 'entregue');
  const completedTasks = tasks.filter((t) => t.status === 'concluido');

  // Pending installments
  const pendingInstallments = installments.filter((i) => i.status === 'pendente');
  const overdueInstallments = installments.filter((i) => i.status === 'vencido');
  const totalPendingReceivable = pendingInstallments.reduce((acc, i) => acc + i.value, 0);
  const totalOverdueReceivable = overdueInstallments.reduce((acc, i) => acc + i.value, 0);

  const handlePrint = () => {
    window.print();
  };

  const periodLabel =
    period === '30'
      ? 'Últimos 30 Dias (Mensal)'
      : period === '90'
      ? 'Último Trimestre (90 Dias)'
      : period === '365'
      ? 'Ano Corrente'
      : 'Histórico Geral Consolidado';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 print:p-0 print:bg-white print:static">
      {/* Modal Container */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden print:border-none print:shadow-none print:max-h-none print:w-full print:rounded-none">
        {/* Modal Controls Topbar (Hidden on Print) */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 bg-slate-50 dark:bg-slate-850 print:hidden">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white leading-tight">
                Exportar Relatório Executivo (PDF)
              </h2>
              <p className="text-xs text-slate-500">
                Selecione o tipo de relatório e configure o período para impressão ou download em PDF.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="primary"
              size="sm"
              onClick={handlePrint}
              leftIcon={<Printer className="w-4 h-4" />}
            >
              Imprimir / Salvar PDF
            </Button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filter Controls (Hidden on Print) */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-wrap items-center justify-between gap-3 text-xs print:hidden">
          {/* Report Type Tabs */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            <button
              onClick={() => setReportType('financial')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                reportType === 'financial'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              DRE & Resumo Financeiro
            </button>
            <button
              onClick={() => setReportType('projects')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                reportType === 'projects'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Progresso de Projetos
            </button>
            <button
              onClick={() => setReportType('executive')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                reportType === 'executive'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Visão Executiva Geral
            </button>
          </div>

          {/* Period Selector */}
          <div className="flex items-center gap-1">
            <span className="text-slate-400 font-medium mr-1">Período:</span>
            {[
              { id: '30', label: '30 Dias' },
              { id: '90', label: 'Trimestre' },
              { id: '365', label: 'Ano' },
              { id: 'all', label: 'Tudo' },
            ].map((p) => (
              <button
                key={p.id}
                onClick={() => setPeriod(p.id as any)}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                  period === p.id
                    ? 'bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800'
                    : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* PRINTABLE DOCUMENT BODY */}
        <div
          id="printable-report-area"
          className="flex-1 overflow-y-auto p-6 sm:p-10 bg-white text-slate-900 space-y-6 print:p-0 print:overflow-visible print:text-black font-sans"
        >
          {/* Header Letterhead */}
          <div className="border-b-2 border-slate-900 pb-5 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-black text-sm">
                  OS
                </div>
                <span className="text-lg font-black tracking-tight text-slate-900">
                  {settings.tradeName || user.companyName || 'STUDIO DIGITAL'}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                {settings.companyName || user.name} • CNPJ/CPF: {settings.document || user.document || '00.000.000/0001-00'}
              </p>
              <p className="text-xs text-slate-500">
                {settings.email || user.email} • {settings.whatsapp || settings.phone || '(11) 99999-0000'}
              </p>
            </div>

            <div className="text-left sm:text-right">
              <span className="inline-block uppercase tracking-wider text-[10px] font-extrabold bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200 mb-1">
                Relatório Oficial de Gestão
              </span>
              <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 uppercase tracking-tight">
                {reportType === 'financial'
                  ? 'Demonstrativo Financeiro & DRE'
                  : reportType === 'projects'
                  ? 'Relatório de Status de Projetos'
                  : 'Relatório Executivo Consolidado'}
              </h1>
              <p className="text-xs text-slate-500">
                <strong>Período:</strong> {periodLabel} • <strong>Emissão:</strong> {currentDateFormatted}
              </p>
            </div>
          </div>

          {/* REPORT VARIANT 1: FINANCIAL / DRE */}
          {(reportType === 'financial' || reportType === 'executive') && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-1 border-b border-slate-200">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-emerald-600" />
                  1. Indicadores Financeiros & Resultado Líquido
                </h3>
              </div>

              {/* KPI Badge Strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase block">
                    Receita Bruta Paga
                  </span>
                  <span className="text-base font-extrabold text-emerald-600 block mt-0.5">
                    R$ {totalInflows.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase block">
                    Despesas Operacionais
                  </span>
                  <span className="text-base font-extrabold text-rose-600 block mt-0.5">
                    R$ {totalExpenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase block">
                    Lucro Líquido Real
                  </span>
                  <span
                    className={`text-base font-extrabold block mt-0.5 ${
                      netProfit >= 0 ? 'text-indigo-600' : 'text-rose-600'
                    }`}
                  >
                    R$ {netProfit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase block">
                    MRR Recorrente Ativo
                  </span>
                  <span className="text-base font-extrabold text-amber-600 block mt-0.5">
                    R$ {mrr.toLocaleString('pt-BR')}/mês
                  </span>
                </div>
              </div>

              {/* DRE Breakdown Table */}
              <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
                <table className="w-full text-left">
                  <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3">Estrutura DRE / Conta</th>
                      <th className="py-2.5 px-3 text-right">Valor Total (R$)</th>
                      <th className="py-2.5 px-3 text-right">% Receita</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr className="font-semibold bg-emerald-50/40">
                      <td className="py-2 px-3 text-emerald-800">(+) Receitas com Projetos e Serviços</td>
                      <td className="py-2 px-3 text-right text-emerald-700 font-bold">
                        R$ {totalInflows.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-2 px-3 text-right text-slate-500">100.0%</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 text-slate-700 pl-6">
                        (-) Softwares, Servidores & Ferramentas
                      </td>
                      <td className="py-2 px-3 text-right text-rose-600">
                        - R${' '}
                        {filteredTransactions
                          .filter(
                            (t) =>
                              t.type === 'saida' &&
                              (t.category === 'Ferramentas' ||
                                t.category === 'Hospedagem & Servidores' ||
                                t.category === 'Softwares & Assinaturas')
                          )
                          .reduce((acc, t) => acc + t.value, 0)
                          .toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-2 px-3 text-right text-slate-400">
                        {totalInflows > 0
                          ? (
                              (filteredTransactions
                                .filter(
                                  (t) =>
                                    t.type === 'saida' &&
                                    (t.category === 'Ferramentas' ||
                                      t.category === 'Hospedagem & Servidores' ||
                                      t.category === 'Softwares & Assinaturas')
                                )
                                .reduce((acc, t) => acc + t.value, 0) /
                                totalInflows) *
                              100
                            ).toFixed(1) + '%'
                          : '-'}
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 text-slate-700 pl-6">
                        (-) Parceiros, Freelancers & Terceirização
                      </td>
                      <td className="py-2 px-3 text-right text-rose-600">
                        - R${' '}
                        {filteredTransactions
                          .filter((t) => t.type === 'saida' && t.category === 'Freelancer & Terceirizados')
                          .reduce((acc, t) => acc + t.value, 0)
                          .toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-2 px-3 text-right text-slate-400">
                        {totalInflows > 0
                          ? (
                              (filteredTransactions
                                .filter((t) => t.type === 'saida' && t.category === 'Freelancer & Terceirizados')
                                .reduce((acc, t) => acc + t.value, 0) /
                                totalInflows) *
                              100
                            ).toFixed(1) + '%'
                          : '-'}
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 text-slate-700 pl-6">
                        (-) Marketing, Tráfego Pago & Impostos
                      </td>
                      <td className="py-2 px-3 text-right text-rose-600">
                        - R${' '}
                        {filteredTransactions
                          .filter(
                            (t) =>
                              t.type === 'saida' &&
                              (t.category === 'Marketing & Tráfego' || t.category === 'Impostos & Contador')
                          )
                          .reduce((acc, t) => acc + t.value, 0)
                          .toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-2 px-3 text-right text-slate-400">
                        {totalInflows > 0
                          ? (
                              (filteredTransactions
                                .filter(
                                  (t) =>
                                    t.type === 'saida' &&
                                    (t.category === 'Marketing & Tráfego' || t.category === 'Impostos & Contador')
                                )
                                .reduce((acc, t) => acc + t.value, 0) /
                                totalInflows) *
                              100
                            ).toFixed(1) + '%'
                          : '-'}
                      </td>
                    </tr>
                    <tr className="font-extrabold bg-slate-100/80">
                      <td className="py-2.5 px-3 text-slate-900">(=) LUCRO LÍQUIDO OPERACIONAL</td>
                      <td className="py-2.5 px-3 text-right text-indigo-700 text-sm">
                        R$ {netProfit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-2.5 px-3 text-right text-indigo-700 font-bold">{profitMargin}%</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Receivables Projection */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-indigo-50/50 rounded-xl border border-indigo-100">
                  <span className="font-bold text-indigo-900 block mb-1">
                    Previsão de Recebíveis Pendentes
                  </span>
                  <p className="text-slate-600">
                    Total a receber em parcelas cadastradas:{' '}
                    <strong className="text-indigo-700">
                      R$ {totalPendingReceivable.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </strong>{' '}
                    ({pendingInstallments.length} parcelas)
                  </p>
                </div>

                <div className="p-3 bg-rose-50/50 rounded-xl border border-rose-100">
                  <span className="font-bold text-rose-900 block mb-1">Faturas em Atraso</span>
                  <p className="text-slate-600">
                    Total em aberto vencido:{' '}
                    <strong className="text-rose-700">
                      R$ {totalOverdueReceivable.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </strong>{' '}
                    ({overdueInstallments.length} faturas)
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* REPORT VARIANT 2: PROJECTS PROGRESS */}
          {(reportType === 'projects' || reportType === 'executive') && (
            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between pb-1 border-b border-slate-200">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
                  <FolderKanban className="w-4 h-4 text-indigo-600" />
                  {reportType === 'executive' ? '2.' : '1.'} Progresso Operacional de Projetos
                </h3>
                <span className="text-xs text-slate-500">
                  {activeProjects.length} ativos • {deliveredProjects.length} entregues
                </span>
              </div>

              {/* Projects Table */}
              <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
                <table className="w-full text-left">
                  <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3">Projeto / Escopo</th>
                      <th className="py-2.5 px-3">Cliente</th>
                      <th className="py-2.5 px-3">Etapa Atual</th>
                      <th className="py-2.5 px-3">Progresso</th>
                      <th className="py-2.5 px-3">Prazo</th>
                      <th className="py-2.5 px-3 text-right">Valor Contratado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {projects.map((proj) => {
                      const projTasks = tasks.filter((t) => t.projectId === proj.id);
                      const doneTasks = projTasks.filter((t) => t.status === 'concluido').length;
                      const isOverdue = new Date(proj.deadline) < now && proj.status !== 'entregue';

                      return (
                        <tr key={proj.id} className="hover:bg-slate-50">
                          <td className="py-2.5 px-3">
                            <span className="font-bold text-slate-900 block">{proj.name}</span>
                            <span className="text-[11px] text-slate-500">{proj.type}</span>
                          </td>
                          <td className="py-2.5 px-3 text-slate-700 font-medium">{proj.clientName}</td>
                          <td className="py-2.5 px-3">
                            <span className="inline-block px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-bold uppercase">
                              {proj.status.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="py-2.5 px-3">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-slate-700">{proj.progress}%</span>
                              <span className="text-[10px] text-slate-400">
                                ({doneTasks}/{projTasks.length})
                              </span>
                            </div>
                          </td>
                          <td className="py-2.5 px-3">
                            <span className={isOverdue ? 'text-rose-600 font-bold' : 'text-slate-600'}>
                              {new Date(proj.deadline).toLocaleDateString('pt-BR')}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-right font-bold text-slate-900">
                            R$ {proj.value.toLocaleString('pt-BR')}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Summary / Notes & Sign-off */}
          <div className="pt-6 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
            <div>
              <span className="font-bold text-slate-700 uppercase tracking-wider block mb-1">
                Notas & Parecer Executivo
              </span>
              <p className="text-slate-500 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">
                Relatório gerado automaticamente pelo StudioOS para acompanhamento de resultados,
                auditoria financeira, controle de escopo e prestação de contas executiva.
              </p>
            </div>

            <div className="flex flex-col justify-end items-end text-right">
              <div className="w-48 border-b border-slate-400 mb-1" />
              <span className="font-bold text-slate-900">{user.name}</span>
              <span className="text-[11px] text-slate-500">
                {settings.tradeName || 'Diretor de Projetos & Design'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
