import React, { useState } from 'react';
import {
  FileSignature,
  Plus,
  Search,
  CheckCircle2,
  Printer,
  Copy,
  Trash2,
  FileText,
  Clock,
  ShieldCheck,
  Download,
  Eye,
} from 'lucide-react';
import { useDatabase } from '../context/DatabaseContext';
import { Contract } from '../types';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';

interface ContractsViewProps {
  onOpenNewContractModal: () => void;
  onNavigateTab: (tab: any, entityId?: string) => void;
  selectedContractId?: string | null;
  onSelectContract: (id: string | null) => void;
}

export const ContractsView: React.FC<ContractsViewProps> = ({
  onOpenNewContractModal,
  onNavigateTab,
  selectedContractId,
  onSelectContract,
}) => {
  const { contracts, deleteContract, signContract, settings } = useDatabase();

  const [searchTerm, setSearchTerm] = useState('');
  const [activeContractModal, setActiveContractModal] = useState<Contract | null>(null);
  const [signingName, setSigningName] = useState('');
  const [signingDoc, setSigningDoc] = useState('');
  const [isSigningOpen, setIsSigningOpen] = useState(false);

  const filteredContracts = contracts.filter((c) => {
    const term = searchTerm.toLowerCase();
    return (
      c.title.toLowerCase().includes(term) ||
      c.clientName.toLowerCase().includes(term) ||
      (c.projectName && c.projectName.toLowerCase().includes(term))
    );
  });

  const handleOpenContract = (c: Contract) => {
    setActiveContractModal(c);
  };

  const handleSign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeContractModal || !signingName.trim()) return;

    signContract(activeContractModal.id, signingName, signingDoc || 'Assinado via Certificado StudioOS');
    setIsSigningOpen(false);
    setActiveContractModal((prev) =>
      prev
        ? {
            ...prev,
            status: 'assinado',
            signerName: signingName,
            signerDocument: signingDoc,
            signedAt: new Date().toISOString(),
          }
        : null
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FileSignature className="w-5 h-5 text-indigo-600" />
            Contratos de Prestação de Serviços
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Documentos jurídicos com cláusulas de entrega, escopo, direitos autorais e assinatura eletrônica.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={onOpenNewContractModal}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          Novo Contrato
        </Button>
      </div>

      {/* Metrics Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Card padding="sm">
          <p className="text-[11px] font-semibold text-slate-500 uppercase">Contratos Assinados</p>
          <p className="text-xl font-bold text-emerald-600 mt-0.5">
            {contracts.filter((c) => c.status === 'assinado').length} documentos
          </p>
          <span className="text-[11px] text-slate-400">Com validade jurídica</span>
        </Card>

        <Card padding="sm">
          <p className="text-[11px] font-semibold text-slate-500 uppercase">Aguardando Assinatura</p>
          <p className="text-xl font-bold text-amber-600 mt-0.5">
            {contracts.filter((c) => c.status === 'aguardando_assinatura').length} contratos
          </p>
          <span className="text-[11px] text-slate-400">Enviados aos clientes</span>
        </Card>

        <Card padding="sm">
          <p className="text-[11px] font-semibold text-slate-500 uppercase">Valor Total Contratado</p>
          <p className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">
            R$ {contracts.reduce((a, c) => a + c.value, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
          <span className="text-[11px] text-slate-400">Total em garantias</span>
        </Card>
      </div>

      {/* Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <Input
            placeholder="Pesquisar contratos por título, cliente ou projeto..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            leftIcon={<Search className="w-4 h-4" />}
          />
        </div>
      </div>

      {/* Contracts List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredContracts.map((c) => (
          <Card
            key={c.id}
            padding="md"
            hover
            className="space-y-3 cursor-pointer group"
            onClick={() => handleOpenContract(c)}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h3 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-indigo-600 transition-colors truncate">
                  {c.title}
                </h3>
                <p className="text-xs text-slate-500 truncate">
                  Cliente: <strong>{c.clientName}</strong>
                </p>
              </div>
              <Badge status={c.status} size="sm" />
            </div>

            <div className="space-y-1 text-xs text-slate-500">
              <p>Valor Global: <strong>R$ {c.value.toLocaleString('pt-BR')}</strong></p>
              <p>Prazo: {c.startDate} até {c.deadline}</p>
              {c.status === 'assinado' && c.signedAt && (
                <p className="text-emerald-600 font-semibold text-[11px] flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> Assinado em {new Date(c.signedAt).toLocaleDateString('pt-BR')} por {c.signerName}
                </p>
              )}
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                Ver Contrato & Assinar
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteContract(c.id);
                }}
                className="p-1.5 text-slate-400 hover:text-rose-600 rounded"
                title="Excluir contrato"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </Card>
        ))}
      </div>

      {/* CONTRACT VIEWER & ELECTRONIC SIGNATURE MODAL */}
      {activeContractModal && (
        <Modal
          isOpen={!!activeContractModal}
          onClose={() => setActiveContractModal(null)}
          title={`Documento Contratual — ${activeContractModal.title}`}
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
                  Imprimir / Salvar PDF
                </Button>
              </div>

              <div className="flex items-center gap-2">
                {activeContractModal.status !== 'assinado' ? (
                  <Button
                    variant="emerald"
                    size="sm"
                    onClick={() => {
                      setSigningName(activeContractModal.clientName);
                      setIsSigningOpen(true);
                    }}
                    leftIcon={<FileSignature className="w-4 h-4" />}
                  >
                    Simular Assinatura Eletrônica
                  </Button>
                ) : (
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-3 py-1.5 rounded-lg border border-emerald-200 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4" />
                    Contrato Assinado com Validade Jurídica
                  </span>
                )}
              </div>
            </div>
          }
        >
          {/* Printable Document Box */}
          <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-6 text-slate-900 dark:text-slate-100">
            {/* Header */}
            <div className="text-center border-b border-slate-200 dark:border-slate-800 pb-4">
              <h3 className="text-base font-bold uppercase tracking-wider">{activeContractModal.title}</h3>
              <p className="text-xs text-slate-500 mt-1">
                Contrato registrado sob ID #{activeContractModal.id} • {settings.companyName}
              </p>
            </div>

            {/* Contract Body */}
            <div className="bg-slate-50 dark:bg-slate-850 p-6 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-serif leading-relaxed whitespace-pre-wrap max-h-[500px] overflow-y-auto">
              {activeContractModal.content}
            </div>

            {/* Signatures Stamp Area */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-400 block mb-1">CONTRATADA (Prestador):</span>
                <p className="font-bold">{settings.companyName}</p>
                <p className="text-slate-500">CNPJ: {settings.document}</p>
                <span className="inline-block mt-2 text-[10px] text-emerald-600 font-semibold bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded">
                  ✓ Assinado Digitalmente pelo Provedor
                </span>
              </div>

              <div>
                <span className="text-slate-400 block mb-1">CONTRATANTE (Cliente):</span>
                <p className="font-bold">{activeContractModal.clientName}</p>
                {activeContractModal.status === 'assinado' ? (
                  <div className="mt-1 space-y-0.5">
                    <p className="text-slate-600 dark:text-slate-300 font-medium">
                      Signatário: {activeContractModal.signerName}
                    </p>
                    <p className="text-slate-500 text-[11px]">
                      Doc: {activeContractModal.signerDocument || 'Verificado'}
                    </p>
                    <span className="inline-block mt-1 text-[10px] text-emerald-600 font-semibold bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded">
                      ✓ Assinado Eletronicamente em {new Date(activeContractModal.signedAt || '').toLocaleString('pt-BR')}
                    </span>
                  </div>
                ) : (
                  <span className="inline-block mt-2 text-[10px] text-amber-600 font-semibold bg-amber-50 dark:bg-amber-950 px-2 py-0.5 rounded">
                    ⏳ Aguardando assinatura do cliente
                  </span>
                )}
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* ELECTRONIC SIGNATURE SIMULATOR MODAL */}
      {isSigningOpen && (
        <Modal
          isOpen={isSigningOpen}
          onClose={() => setIsSigningOpen(false)}
          title="Assinatura Eletrônica do Contrato"
          subtitle="Preencha os dados de validação para assinar o documento."
          maxWidth="sm"
        >
          <form onSubmit={handleSign} className="space-y-4 py-2">
            <Input
              label="Nome Completo do Signatário"
              value={signingName}
              onChange={(e) => setSigningName(e.target.value)}
              required
            />
            <Input
              label="CPF ou CNPJ do Signatário"
              placeholder="000.000.000-00"
              value={signingDoc}
              onChange={(e) => setSigningDoc(e.target.value)}
            />

            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl text-xs text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
              Ao assinar, o sistema carimbará o contrato com registro de data/hora (timestamp) e IP autenticado.
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsSigningOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" variant="emerald" size="sm" leftIcon={<CheckCircle2 className="w-4 h-4" />}>
                Assinar Documento
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
