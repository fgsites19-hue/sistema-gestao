import React, { useState } from 'react';
import {
  DollarSign,
  Plus,
  Search,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Calendar,
  CreditCard,
  Trash2,
  PieChart,
  Repeat,
} from 'lucide-react';
import { useDatabase } from '../context/DatabaseContext';
import { Transaction, Installment } from '../types';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Input, Select } from '../components/ui/Input';
import { Tabs } from '../components/ui/Tabs';

interface FinancialViewProps {
  onOpenNewTransactionModal: () => void;
  onNavigateTab: (tab: any, entityId?: string) => void;
}

export const FinancialView: React.FC<FinancialViewProps> = ({
  onOpenNewTransactionModal,
  onNavigateTab,
}) => {
  const {
    transactions,
    installments,
    deleteTransaction,
    markInstallmentPaid,
    recurringServices,
  } = useDatabase();

  const [activeTab, setActiveTab] = useState<'receber' | 'extrato' | 'pagar'>('receber');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('todos');

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  // Metrics
  const totalInflowsPaid = transactions
    .filter((t) => t.type === 'entrada' && t.status === 'pago')
    .reduce((acc, t) => acc + t.value, 0);

  const totalOutflowsPaid = transactions
    .filter((t) => t.type === 'saida' && t.status === 'pago')
    .reduce((acc, t) => acc + t.value, 0);

  const netBalance = totalInflowsPaid - totalOutflowsPaid;

  const totalToReceive = installments
    .filter((i) => i.status === 'pendente')
    .reduce((acc, i) => acc + i.value, 0);

  const totalOverdue = installments
    .filter((i) => i.status === 'vencido')
    .reduce((acc, i) => acc + i.value, 0);

  const mrr = recurringServices
    .filter((r) => r.status === 'ativo')
    .reduce((acc, r) => acc + r.value, 0);

  // Filtered installments
  const filteredInstallments = installments.filter((i) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      i.projectName.toLowerCase().includes(term) ||
      i.clientName.toLowerCase().includes(term);
    const matchesStatus = statusFilter === 'todos' || i.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Filtered transactions
  const filteredTransactions = transactions.filter((t) => {
    const term = searchTerm.toLowerCase();
    return (
      t.description.toLowerCase().includes(term) ||
      t.category.toLowerCase().includes(term) ||
      (t.clientName && t.clientName.toLowerCase().includes(term))
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-emerald-600" />
            Gestão Financeira & Fluxo de Caixa
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Controle de contas a receber, faturas de projetos, despesas operacionais e DRE.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={onOpenNewTransactionModal}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          Novo Lançamento
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <Card padding="sm" className="border-l-4 border-emerald-500">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-semibold text-slate-500 uppercase">Receitas Liquidadas</p>
            <ArrowUpRight className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-xl font-bold text-emerald-600 mt-0.5">
            R$ {totalInflowsPaid.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
          <span className="text-[11px] text-slate-400">Total recebido em conta</span>
        </Card>

        <Card padding="sm" className="border-l-4 border-rose-500">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-semibold text-slate-500 uppercase">Despesas Pagas</p>
            <ArrowDownRight className="w-4 h-4 text-rose-500" />
          </div>
          <p className="text-xl font-bold text-rose-600 mt-0.5">
            R$ {totalOutflowsPaid.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
          <span className="text-[11px] text-slate-400">Custos & ferramentas</span>
        </Card>

        <Card padding="sm" className="border-l-4 border-indigo-500">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-semibold text-slate-500 uppercase">A Receber (Previsão)</p>
            <Clock className="w-4 h-4 text-indigo-500" />
          </div>
          <p className="text-xl font-bold text-indigo-600 mt-0.5">
            R$ {totalToReceive.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
          <span className="text-[11px] text-slate-400">Faturas em aberto</span>
        </Card>

        <Card padding="sm" className="border-l-4 border-amber-500">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-semibold text-slate-500 uppercase">Saldo Líquido</p>
            <DollarSign className="w-4 h-4 text-amber-500" />
          </div>
          <p className={`text-xl font-bold mt-0.5 ${netBalance >= 0 ? 'text-slate-900 dark:text-white' : 'text-rose-600'}`}>
            R$ {netBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
          <span className="text-[11px] text-slate-400">Lucro operacional acumulado</span>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs
        activeTab={activeTab}
        onChange={(id) => setActiveTab(id as any)}
        tabs={[
          { id: 'receber', label: 'Contas a Receber (Faturas/Parcelas)', count: installments.length },
          { id: 'extrato', label: 'Extrato de Lançamentos & DRE', count: transactions.length },
          { id: 'pagar', label: 'Contas a Pagar & Despesas Fixas' },
        ]}
      />

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <Input
            placeholder="Pesquisar registros financeiros..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            leftIcon={<Search className="w-4 h-4" />}
          />
        </div>

        {activeTab === 'receber' && (
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full sm:w-48"
          >
            <option value="todos">Todos os Status</option>
            <option value="pendente">Pendente</option>
            <option value="pago">Pago</option>
            <option value="vencido">Vencido / Atrasado</option>
          </Select>
        )}
      </div>

      {/* TAB 1: CONTAS A RECEBER */}
      {activeTab === 'receber' && (
        <Card padding="none" className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold uppercase">
                <tr>
                  <th className="py-3 px-4">Projeto / Referência</th>
                  <th className="py-3 px-4">Cliente</th>
                  <th className="py-3 px-4">Parcela</th>
                  <th className="py-3 px-4">Valor</th>
                  <th className="py-3 px-4">Vencimento</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredInstallments.map((inst) => {
                  const isOverdue = inst.status === 'vencido' || (inst.status === 'pendente' && new Date(inst.dueDate) < new Date());
                  return (
                    <tr key={inst.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                      <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-white">
                        {inst.projectName}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300 font-medium">
                        {inst.clientName}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500">
                        {inst.installmentNumber} de {inst.totalInstallments}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                        R$ {inst.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className={`py-3.5 px-4 font-medium ${isOverdue ? 'text-rose-600' : 'text-slate-500'}`}>
                        {new Date(inst.dueDate).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="py-3.5 px-4">
                        <Badge status={inst.status} size="sm" />
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {inst.status !== 'pago' ? (
                          <Button
                            size="sm"
                            variant="emerald"
                            onClick={() => markInstallmentPaid(inst.id)}
                            className="text-[11px] py-1 px-2.5"
                          >
                            Dar Baixa (Pago)
                          </Button>
                        ) : (
                          <span className="text-[11px] font-semibold text-emerald-600">✓ Liquidado</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* TAB 2: EXTRATO COMPLETO */}
      {activeTab === 'extrato' && (
        <Card padding="none" className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold uppercase">
                <tr>
                  <th className="py-3 px-4">Data</th>
                  <th className="py-3 px-4">Descrição</th>
                  <th className="py-3 px-4">Categoria</th>
                  <th className="py-3 px-4">Forma</th>
                  <th className="py-3 px-4">Tipo</th>
                  <th className="py-3 px-4 text-right">Valor</th>
                  <th className="py-3 px-4 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredTransactions.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                    <td className="py-3 px-4 text-slate-500">{new Date(t.date).toLocaleDateString('pt-BR')}</td>
                    <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">
                      {t.description}
                      {t.clientName && <span className="block text-[10px] text-slate-400">Cliente: {t.clientName}</span>}
                    </td>
                    <td className="py-3 px-4 text-slate-500">{t.category}</td>
                    <td className="py-3 px-4 uppercase text-[10px] font-bold text-slate-600 dark:text-slate-300">
                      {t.paymentMethod}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center gap-1 font-bold text-[10px] uppercase px-2 py-0.5 rounded ${
                        t.type === 'entrada' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300' : 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
                      }`}>
                        {t.type === 'entrada' ? '+ Entrada' : '- Saída'}
                      </span>
                    </td>
                    <td className={`py-3 px-4 text-right font-bold text-sm ${t.type === 'entrada' ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {t.type === 'entrada' ? '+' : '-'} R$ {t.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => deleteTransaction(t.id)}
                        className="p-1 text-slate-400 hover:text-rose-600"
                        title="Excluir lançamento"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* TAB 3: CONTAS A PAGAR */}
      {activeTab === 'pagar' && (
        <Card padding="md" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Despesas & Ferramentas do Negócio</h3>
              <p className="text-xs text-slate-500">Custos com hospedagem VPS, plugins, licenças Figma, contabilidade e internet.</p>
            </div>
            <Button size="sm" variant="primary" onClick={onOpenNewTransactionModal}>
              Cadastrar Despesa
            </Button>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {transactions.filter((t) => t.type === 'saida').map((t) => (
              <div key={t.id} className="py-3 flex items-center justify-between text-xs">
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white">{t.description}</p>
                  <p className="text-slate-400 text-[11px]">{t.category} • Vencimento: {new Date(t.date).toLocaleDateString('pt-BR')}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-rose-600 text-sm">R$ {t.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                  <span className="text-[10px] text-slate-400">{t.status === 'pago' ? 'Pago' : 'Pendente'}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};
