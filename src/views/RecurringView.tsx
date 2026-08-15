import React, { useState } from 'react';
import {
  Repeat,
  Plus,
  Search,
  CheckCircle2,
  AlertCircle,
  Calendar,
  DollarSign,
  TrendingUp,
  Trash2,
  Clock,
  ShieldCheck,
} from 'lucide-react';
import { useDatabase } from '../context/DatabaseContext';
import { RecurringService } from '../types';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Input } from '../components/ui/Input';

interface RecurringViewProps {
  onOpenNewRecurringModal: () => void;
  onNavigateTab: (tab: any, entityId?: string) => void;
}

export const RecurringView: React.FC<RecurringViewProps> = ({
  onOpenNewRecurringModal,
  onNavigateTab,
}) => {
  const { recurringServices, deleteRecurringService, updateRecurringService } = useDatabase();

  const [searchTerm, setSearchTerm] = useState('');

  const filteredRecurring = recurringServices.filter((r) => {
    const term = searchTerm.toLowerCase();
    return (
      r.serviceName.toLowerCase().includes(term) ||
      r.clientName.toLowerCase().includes(term)
    );
  });

  const activePlans = recurringServices.filter((r) => r.status === 'ativo');

  const totalMRR = activePlans.reduce((acc, r) => {
    if (r.billingCycle === 'mensal') return acc + r.value;
    if (r.billingCycle === 'trimestral') return acc + r.value / 3;
    if (r.billingCycle === 'semestral') return acc + r.value / 6;
    if (r.billingCycle === 'anual') return acc + r.value / 12;
    return acc + r.value;
  }, 0);

  const totalARR = totalMRR * 12;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Repeat className="w-5 h-5 text-indigo-600" />
            Serviços Recorrentes & Gestão de MRR
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Controle contratos contínuos de manutenção web, hospedagem, SEO, suporte e retainer mensal.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={onOpenNewRecurringModal}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          Nova Recorrência
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Card padding="sm" className="bg-gradient-to-br from-indigo-500/10 to-transparent">
          <p className="text-[11px] font-semibold text-slate-500 uppercase">MRR (Faturamento Recorrente Mensal)</p>
          <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mt-0.5">
            R$ {totalMRR.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}/mês
          </p>
          <span className="text-[11px] text-slate-400">{activePlans.length} contratos ativos</span>
        </Card>

        <Card padding="sm" className="bg-gradient-to-br from-emerald-500/10 to-transparent">
          <p className="text-[11px] font-semibold text-slate-500 uppercase">ARR (Previsão Anual de Recorrência)</p>
          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
            R$ {totalARR.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}/ano
          </p>
          <span className="text-[11px] text-slate-400">Receita previsível garantida</span>
        </Card>

        <Card padding="sm" className="bg-gradient-to-br from-amber-500/10 to-transparent">
          <p className="text-[11px] font-semibold text-slate-500 uppercase">Ticket Médio Recorrente</p>
          <p className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-0.5">
            R$ {activePlans.length > 0 ? (totalMRR / activePlans.length).toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : '0,00'}
          </p>
          <span className="text-[11px] text-slate-400">Por cliente ativo</span>
        </Card>
      </div>

      {/* Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <Input
            placeholder="Pesquisar recorrências por serviço ou cliente..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            leftIcon={<Search className="w-4 h-4" />}
          />
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredRecurring.map((r) => (
          <Card key={r.id} padding="md" className="space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h3 className="font-bold text-sm text-slate-900 dark:text-white truncate">
                  {r.serviceName}
                </h3>
                <p className="text-xs text-slate-500 truncate">
                  Cliente: <button onClick={() => onNavigateTab('clientes', r.clientId)} className="font-semibold text-indigo-600 hover:underline">{r.clientName}</button>
                </p>
              </div>
              <Badge status={r.status} size="sm" />
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Valor do Plano:</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  R$ {r.value.toLocaleString('pt-BR')} / {r.billingCycle}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Dia de Vencimento:</span>
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  Todo dia {r.dueDateDay}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Próxima Cobrança:</span>
                <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                  {new Date(r.nextBillingDate).toLocaleDateString('pt-BR')}
                </span>
              </div>
            </div>

            {r.description && (
              <p className="text-[11px] text-slate-500 line-clamp-2">
                {r.description}
              </p>
            )}

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <span className="text-[11px] uppercase font-bold text-slate-400">
                Forma: {r.paymentMethod}
              </span>
              <button
                onClick={() => deleteRecurringService(r.id)}
                className="p-1.5 text-slate-400 hover:text-rose-600 rounded"
                title="Excluir recorrência"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
