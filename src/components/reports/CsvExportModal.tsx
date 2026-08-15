import React, { useState } from 'react';
import {
  Download,
  FileSpreadsheet,
  CheckCircle2,
  Calendar,
  Layers,
  DollarSign,
  Clock,
  FolderKanban,
  Table,
  Filter,
  Check,
} from 'lucide-react';
import { useDatabase } from '../../context/DatabaseContext';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';

interface CsvExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CsvExportModal: React.FC<CsvExportModalProps> = ({ isOpen, onClose }) => {
  const {
    transactions,
    installments,
    projects,
    activityLogs,
    allTimeLogs,
    clients,
    leads,
  } = useDatabase();

  const [selectedDataset, setSelectedDataset] = useState<
    'financial' | 'installments' | 'projects' | 'activity' | 'timelogs' | 'all'
  >('financial');
  const [delimiter, setDelimiter] = useState<';' | ','>(';');
  const [period, setPeriod] = useState<'30' | '90' | '365' | 'all'>('all');
  const [isExporting, setIsExporting] = useState(false);
  const [exportedSuccess, setExportedSuccess] = useState(false);

  // Helper for CSV trigger
  const triggerCsvDownload = (filename: string, rows: (string | number)[][], customDelimiter: string = delimiter) => {
    const content = rows
      .map((row) =>
        row
          .map((cell) => {
            if (cell === null || cell === undefined) return '""';
            const str = String(cell).replace(/"/g, '""');
            return `"${str}"`;
          })
          .join(customDelimiter)
      )
      .join('\r\n');

    // UTF-8 BOM header \uFEFF ensures Portuguese special chars (ç, ã, é) open perfectly in Excel
    const blob = new Blob(['\uFEFF' + content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExport = () => {
    setIsExporting(true);
    const dateStamp = new Date().toISOString().split('T')[0];

    if (selectedDataset === 'financial' || selectedDataset === 'all') {
      const header = [
        'ID Transação',
        'Data',
        'Tipo (Entrada/Saída)',
        'Categoria',
        'Descrição',
        'Cliente',
        'Projeto',
        'Valor (R$)',
        'Vencimento',
        'Data Pagamento',
        'Status',
        'Forma de Pagamento',
        'Observações',
      ];
      const rows = transactions.map((t) => [
        t.id,
        t.date,
        t.type.toUpperCase(),
        t.category,
        t.description,
        t.clientName || 'N/A',
        t.projectName || 'N/A',
        t.value.toFixed(2).replace('.', ','),
        t.dueDate || 'N/A',
        t.paymentDate || 'N/A',
        t.status.toUpperCase(),
        t.paymentMethod.toUpperCase(),
        t.notes || '',
      ]);
      triggerCsvDownload(`studioos_financeiro_${dateStamp}.csv`, [header, ...rows]);
    }

    if (selectedDataset === 'installments' || selectedDataset === 'all') {
      const header = [
        'ID Parcela',
        'Projeto',
        'Cliente',
        'Número Parcela',
        'Total Parcelas',
        'Valor (R$)',
        'Data Vencimento',
        'Data Pagamento',
        'Forma de Pagamento',
        'Status',
      ];
      const rows = installments.map((i) => [
        i.id,
        i.projectName,
        i.clientName,
        i.installmentNumber,
        i.totalInstallments,
        i.value.toFixed(2).replace('.', ','),
        i.dueDate,
        i.paymentDate || 'Pendente',
        i.paymentMethod.toUpperCase(),
        i.status.toUpperCase(),
      ]);
      triggerCsvDownload(`studioos_faturas_parcelas_${dateStamp}.csv`, [header, ...rows]);
    }

    if (selectedDataset === 'projects' || selectedDataset === 'all') {
      const header = [
        'ID Projeto',
        'Nome do Projeto',
        'Cliente',
        'Tipo / Categoria',
        'Status',
        'Prioridade',
        'Progresso (%)',
        'Valor Total (R$)',
        'Data Início',
        'Prazo de Entrega',
        'Data Realizada de Entrega',
        'Link Homologação',
      ];
      const rows = projects.map((p) => [
        p.id,
        p.name,
        p.clientName,
        p.type,
        p.status.toUpperCase(),
        p.priority.toUpperCase(),
        p.progress,
        p.value.toFixed(2).replace('.', ','),
        p.startDate,
        p.deadline,
        p.deliveryDate || 'Em aberto',
        p.stagingUrl || '',
      ]);
      triggerCsvDownload(`studioos_projetos_${dateStamp}.csv`, [header, ...rows]);
    }

    if (selectedDataset === 'activity' || selectedDataset === 'all') {
      const header = [
        'ID Log',
        'Data & Hora',
        'Usuário',
        'Tipo de Entidade',
        'ID Entidade',
        'Ação Executada',
        'Detalhes',
      ];
      const rows = activityLogs.map((a) => [
        a.id,
        a.createdAt,
        a.userName,
        a.entityType.toUpperCase(),
        a.entityId || 'N/A',
        a.action,
        a.details || '',
      ]);
      triggerCsvDownload(`studioos_historico_atividades_${dateStamp}.csv`, [header, ...rows]);
    }

    if (selectedDataset === 'timelogs' || selectedDataset === 'all') {
      const header = [
        'ID TimeLog',
        'Data',
        'Tarefa',
        'Projeto',
        'Duração (Minutos)',
        'Duração (Horas)',
        'Taxa Horária (R$)',
        'Valor Cobrável (R$)',
        'Profissional',
        'Notas',
      ];
      const rows = allTimeLogs.map((tl) => [
        tl.id,
        tl.createdAt.split('T')[0],
        tl.taskTitle,
        tl.projectName || 'Geral',
        Math.round(tl.durationSeconds / 60),
        (tl.durationSeconds / 3600).toFixed(2).replace('.', ','),
        tl.hourlyRate.toFixed(2).replace('.', ','),
        tl.costValue.toFixed(2).replace('.', ','),
        tl.loggedBy,
        tl.notes || '',
      ]);
      triggerCsvDownload(`studioos_apontamento_horas_${dateStamp}.csv`, [header, ...rows]);
    }

    setIsExporting(false);
    setExportedSuccess(true);
    setTimeout(() => {
      setExportedSuccess(false);
      onClose();
    }, 1800);
  };

  const datasetOptions = [
    {
      id: 'financial',
      title: 'Lançamentos Financeiros (DRE / Extrato)',
      description: 'Todas as receitas, despesas, categorias, formas de pagamento e status.',
      count: `${transactions.length} registros`,
      icon: <DollarSign className="w-5 h-5 text-emerald-600" />,
    },
    {
      id: 'installments',
      title: 'Faturas & Parcelas a Receber',
      description: 'Controle de contas a receber com vencimentos, parcelas e baixas.',
      count: `${installments.length} parcelas`,
      icon: <FileSpreadsheet className="w-5 h-5 text-indigo-600" />,
    },
    {
      id: 'projects',
      title: 'Projetos & Status Operacional',
      description: 'Metadados de projetos, prazos, progresso %, clientes e valores.',
      count: `${projects.length} projetos`,
      icon: <FolderKanban className="w-5 h-5 text-purple-600" />,
    },
    {
      id: 'activity',
      title: 'Histórico & Logs de Atividades',
      description: 'Auditoria cronológica de todas as ações e alterações no sistema.',
      count: `${activityLogs.length} eventos`,
      icon: <Clock className="w-5 h-5 text-amber-600" />,
    },
    {
      id: 'timelogs',
      title: 'Apontamento de Horas & Produtividade',
      description: 'Registro de horas trabalhadas por tarefa e valores cobráveis.',
      count: `${allTimeLogs.length} registros`,
      icon: <Clock className="w-5 h-5 text-sky-600" />,
    },
    {
      id: 'all',
      title: 'Pacote Completo (Todos os Relatórios)',
      description: 'Exporta todos os conjuntos de dados em arquivos CSV estruturados.',
      count: 'Tudo consolidado',
      icon: <Layers className="w-5 h-5 text-rose-600" />,
    },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Exportar Dados em Planilhas CSV"
      description="Gere arquivos CSV compatíveis com Excel, Google Sheets, ContaAzul, QuickBooks e outros softwares de contabilidade."
      maxWidth="max-w-2xl"
    >
      <div className="space-y-5">
        {/* Dataset Selection */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
            1. Selecione o Conjunto de Dados
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {datasetOptions.map((opt) => {
              const isSelected = selectedDataset === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setSelectedDataset(opt.id as any)}
                  className={`p-3 rounded-xl border text-left transition-all flex items-start gap-3 ${
                    isSelected
                      ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/30 ring-2 ring-indigo-500/20'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900'
                  }`}
                >
                  <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 shrink-0 mt-0.5">
                    {opt.icon}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {opt.title}
                      </h4>
                      {isSelected && <Check className="w-4 h-4 text-indigo-600 shrink-0" />}
                    </div>
                    <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5 leading-tight">
                      {opt.description}
                    </p>
                    <span className="text-[10px] font-semibold text-slate-400 block mt-1">
                      {opt.count}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Export Options */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-3.5 bg-slate-50 dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Separador / Delimitador:
            </label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setDelimiter(';')}
                className={`px-3 py-1.5 rounded-lg font-medium border text-xs ${
                  delimiter === ';'
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600'
                }`}
              >
                Ponto e vírgula (;) • Excel BR
              </button>
              <button
                type="button"
                onClick={() => setDelimiter(',')}
                className={`px-3 py-1.5 rounded-lg font-medium border text-xs ${
                  delimiter === ','
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600'
                }`}
              >
                Vírgula (,) • Universal
              </button>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Codificação do Arquivo:
            </label>
            <p className="text-[11px] text-slate-500 mt-1">
              <strong>UTF-8 com BOM automático</strong> (garante que acentuação e caracteres em português abram sem erros no Microsoft Excel e Numbers).
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancelar
          </Button>

          <Button
            variant="emerald"
            size="sm"
            onClick={handleExport}
            disabled={isExporting}
            leftIcon={exportedSuccess ? <CheckCircle2 className="w-4 h-4" /> : <Download className="w-4 h-4" />}
            className="font-bold shadow-sm"
          >
            {exportedSuccess ? 'Arquivo(s) Gerado(s) com Sucesso!' : 'Baixar Arquivo CSV'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
