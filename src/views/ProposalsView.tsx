import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Plus,
  Search,
  Eye,
  CheckCircle2,
  Trash2,
  Share2,
  Printer,
  Copy,
  ArrowRight,
  FolderKanban,
  FileText,
  DollarSign,
  X,
} from 'lucide-react';
import { useDatabase } from '../context/DatabaseContext';
import { Proposal, ProposalStatus } from '../types';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Input, Select } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';

interface ProposalsViewProps {
  onOpenNewProposalModal: () => void;
  onNavigateTab: (tab: any, entityId?: string) => void;
  selectedProposalId?: string | null;
  onSelectProposal: (id: string | null) => void;
}

export const ProposalsView: React.FC<ProposalsViewProps> = ({
  onOpenNewProposalModal,
  onNavigateTab,
  selectedProposalId,
  onSelectProposal,
}) => {
  const {
    proposals,
    updateProposalStatus,
    deleteProposal,
    convertProposalToProject,
    settings,
  } = useDatabase();

  const [searchTerm, setSearchTerm] = useState('');
  const [activeProposalModal, setActiveProposalModal] = useState<Proposal | null>(null);

  const filteredProposals = proposals.filter((p) => {
    const term = searchTerm.toLowerCase();
    return (
      p.title.toLowerCase().includes(term) ||
      p.clientName.toLowerCase().includes(term)
    );
  });

  const totalValueSent = proposals.reduce((acc, p) => acc + p.finalTotal, 0);
  const acceptedValue = proposals
    .filter((p) => p.status === 'aceita')
    .reduce((acc, p) => acc + p.finalTotal, 0);

  const handleOpenProposal = (prop: Proposal) => {
    setActiveProposalModal(prop);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-indigo-600" />
            Propostas Comerciais & Orçamentos
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Crie propostas visuais com escopo, tabelas de preço, cálculo de descontos e link para aceite online.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={onOpenNewProposalModal}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          Nova Proposta
        </Button>
      </div>

      {/* Metrics Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Card padding="sm">
          <p className="text-[11px] font-semibold text-slate-500 uppercase">Total Ofertado</p>
          <p className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">
            R$ {totalValueSent.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
          <span className="text-[11px] text-slate-400">{proposals.length} propostas emitidas</span>
        </Card>

        <Card padding="sm">
          <p className="text-[11px] font-semibold text-slate-500 uppercase">Volume Aprovado (Aceito)</p>
          <p className="text-xl font-bold text-emerald-600 mt-0.5">
            R$ {acceptedValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
          <span className="text-[11px] text-slate-400">
            {proposals.filter((p) => p.status === 'aceita').length} propostas fechadas
          </span>
        </Card>

        <Card padding="sm">
          <p className="text-[11px] font-semibold text-slate-500 uppercase">Aguardando Resposta</p>
          <p className="text-xl font-bold text-amber-600 mt-0.5">
            {proposals.filter((p) => p.status === 'enviada' || p.status === 'visualizada').length} propostas
          </p>
          <span className="text-[11px] text-slate-400">No radar de fechamento</span>
        </Card>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <Input
            placeholder="Pesquisar propostas por título ou cliente..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            leftIcon={<Search className="w-4 h-4" />}
          />
        </div>
      </div>

      {/* Proposals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredProposals.map((prop) => (
          <Card
            key={prop.id}
            padding="md"
            hover
            className="space-y-3 cursor-pointer group"
            onClick={() => handleOpenProposal(prop)}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h3 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-indigo-600 transition-colors truncate">
                  {prop.title}
                </h3>
                <p className="text-xs text-slate-500 truncate">
                  Cliente: <strong>{prop.clientName}</strong>
                </p>
              </div>
              <Badge status={prop.status} size="sm" />
            </div>

            <div className="space-y-1 text-xs">
              <div className="flex items-center justify-between text-slate-500">
                <span>Itens inclusos:</span>
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  {prop.items.length} serviço(s)
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-500">
                <span>Validade até:</span>
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  {new Date(prop.validUntil).toLocaleDateString('pt-BR')}
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 block">Total da Proposta</span>
                <span className="text-base font-bold text-indigo-950 dark:text-white">
                  R$ {prop.finalTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>

              <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                {prop.status !== 'aceita' && (
                  <Button
                    size="sm"
                    variant="emerald"
                    onClick={() => {
                      const newProj = convertProposalToProject(prop.id);
                      if (newProj) {
                        onNavigateTab('projetos', newProj.id);
                      }
                    }}
                    className="text-[10px] py-1 px-2.5"
                    title="Converter em Projeto Oficial"
                  >
                    Aceitar & Criar Projeto
                  </Button>
                )}
                <button
                  onClick={() => deleteProposal(prop.id)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 rounded"
                  title="Excluir proposta"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* PROPOSAL VISUAL VIEWER & PRINT PREVIEW MODAL */}
      {activeProposalModal && (
        <Modal
          isOpen={!!activeProposalModal}
          onClose={() => setActiveProposalModal(null)}
          title={`Proposta Comercial — ${activeProposalModal.title}`}
          maxWidth="4xl"
          footer={
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.print()}
                  leftIcon={<Printer className="w-4 h-4" />}
                >
                  Imprimir / PDF
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.origin + '/proposta/' + activeProposalModal.publicToken);
                    alert('Link público da proposta copiado para a área de transferência!');
                  }}
                  leftIcon={<Copy className="w-4 h-4" />}
                >
                  Copiar Link do Cliente
                </Button>
              </div>

              <div className="flex items-center gap-2">
                {activeProposalModal.status !== 'aceita' ? (
                  <Button
                    variant="emerald"
                    size="sm"
                    onClick={() => {
                      const newProj = convertProposalToProject(activeProposalModal.id);
                      setActiveProposalModal(null);
                      if (newProj) {
                        onNavigateTab('projetos', newProj.id);
                      }
                    }}
                    leftIcon={<CheckCircle2 className="w-4 h-4" />}
                  >
                    Aprovar & Gerar Projeto e Contrato
                  </Button>
                ) : (
                  <Badge status="aceita" size="md" />
                )}
              </div>
            </div>
          }
        >
          {/* Printable Proposal Document */}
          <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-6 text-slate-900 dark:text-slate-100">
            {/* Header / Brand */}
            <div className="flex items-start justify-between border-b border-slate-200 dark:border-slate-800 pb-6">
              <div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white font-bold flex items-center justify-center text-sm">
                    S
                  </div>
                  <h3 className="font-bold text-lg">{settings.companyName}</h3>
                </div>
                <p className="text-xs text-slate-500 mt-1">{settings.email} • {settings.phone}</p>
                <p className="text-xs text-slate-500">CNPJ: {settings.document}</p>
              </div>

              <div className="text-right">
                <span className="text-xs uppercase font-bold text-indigo-600 tracking-wider">
                  Proposta Comercial
                </span>
                <h4 className="text-base font-bold mt-1"># {activeProposalModal.id}</h4>
                <p className="text-xs text-slate-500">
                  Data: {new Date(activeProposalModal.createdAt).toLocaleDateString('pt-BR')}
                </p>
                <p className="text-xs text-slate-500">
                  Validade: {new Date(activeProposalModal.validUntil).toLocaleDateString('pt-BR')}
                </p>
              </div>
            </div>

            {/* Client Info */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Destinatário / Cliente
              </span>
              <p className="text-sm font-bold text-slate-900 dark:text-white">
                {activeProposalModal.clientName}
              </p>
            </div>

            {/* Overview / Scope */}
            {activeProposalModal.description && (
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Apresentação da Solução
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-850 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800">
                  {activeProposalModal.description}
                </p>
              </div>
            )}

            {/* Items Table */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Escopo de Serviços e Investimento
              </h4>
              <table className="w-full text-left text-xs border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 font-semibold uppercase">
                  <tr>
                    <th className="py-2.5 px-3">Item / Serviço</th>
                    <th className="py-2.5 px-3 text-center">Qtd.</th>
                    <th className="py-2.5 px-3 text-right">Valor Unitário</th>
                    <th className="py-2.5 px-3 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {activeProposalModal.items.map((item, idx) => (
                    <tr key={idx}>
                      <td className="py-3 px-3">
                        <p className="font-semibold text-slate-900 dark:text-white">{item.title}</p>
                        {item.description && (
                          <p className="text-[11px] text-slate-500 mt-0.5">{item.description}</p>
                        )}
                      </td>
                      <td className="py-3 px-3 text-center">{item.quantity}</td>
                      <td className="py-3 px-3 text-right">R$ {item.unitPrice.toLocaleString('pt-BR')}</td>
                      <td className="py-3 px-3 text-right font-semibold">
                        R$ {item.total.toLocaleString('pt-BR')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Total Calculation */}
            <div className="flex justify-end">
              <div className="w-72 space-y-1.5 text-xs text-right">
                <div className="flex justify-between text-slate-500">
                  <span>Subtotal:</span>
                  <span>R$ {activeProposalModal.subtotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
                {activeProposalModal.discount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-semibold">
                    <span>Desconto Comercial:</span>
                    <span>- R$ {activeProposalModal.discount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  </div>
                )}
                <div className="flex justify-between pt-2 border-t border-slate-200 dark:border-slate-800 text-sm font-bold text-slate-900 dark:text-white">
                  <span>Investimento Final:</span>
                  <span className="text-indigo-600 dark:text-indigo-400">
                    R$ {activeProposalModal.finalTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>

            {/* Terms of Payment */}
            {activeProposalModal.paymentTerms && (
              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl text-xs space-y-1 border border-slate-200 dark:border-slate-800">
                <span className="font-bold text-slate-700 dark:text-slate-300 block">
                  Condições de Pagamento:
                </span>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  {activeProposalModal.paymentTerms}
                </p>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};
