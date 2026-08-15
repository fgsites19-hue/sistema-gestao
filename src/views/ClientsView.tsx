import React, { useState } from 'react';
import {
  Building2,
  Plus,
  Search,
  Mail,
  Phone,
  MessageCircle,
  ExternalLink,
  FolderKanban,
  FileSignature,
  DollarSign,
  Repeat,
  Trash2,
  Edit2,
  ArrowRight,
  ArrowLeft,
  Calendar,
  FileText,
  FileSpreadsheet,
  FolderArchive,
  Clock,
  Instagram,
  Globe,
} from 'lucide-react';
import { useDatabase } from '../context/DatabaseContext';
import { Client } from '../types';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Input } from '../components/ui/Input';
import { Tabs } from '../components/ui/Tabs';
import { EmptyState } from '../components/ui/EmptyState';
import { EntityActivityTimeline } from '../components/activity/EntityActivityTimeline';

interface ClientsViewProps {
  onOpenNewClientModal: () => void;
  onOpenNewProjectWizard: (clientId?: string) => void;
  onNavigateTab: (tab: any, entityId?: string) => void;
  selectedClientId?: string | null;
  onSelectClient: (id: string | null) => void;
}

export const ClientsView: React.FC<ClientsViewProps> = ({
  onOpenNewClientModal,
  onOpenNewProjectWizard,
  onNavigateTab,
  selectedClientId,
  onSelectClient,
}) => {
  const {
    clients,
    projects,
    contracts,
    proposals,
    installments,
    transactions,
    recurringServices,
    files,
    activityLogs,
    deleteClient,
  } = useDatabase();

  const [searchTerm, setSearchTerm] = useState('');
  const [detailTab, setDetailTab] = useState<'overview' | 'projects' | 'finance' | 'contracts' | 'proposals' | 'recurring' | 'files' | 'timeline'>('overview');

  const selectedClient = clients.find((c) => c.id === selectedClientId);

  const filteredClients = clients.filter((client) => {
    const term = searchTerm.toLowerCase();
    return (
      client.name.toLowerCase().includes(term) ||
      client.company.toLowerCase().includes(term) ||
      client.email.toLowerCase().includes(term) ||
      client.document.includes(term)
    );
  });

  // Client 360 stats for detail view
  const clientProjects = projects.filter((p) => p.clientId === selectedClientId);
  const clientContracts = contracts.filter((c) => c.clientId === selectedClientId);
  const clientProposals = proposals.filter((p) => p.clientId === selectedClientId);
  const clientInstallments = installments.filter((i) => i.clientId === selectedClientId);
  const clientTransactions = transactions.filter((t) => t.clientId === selectedClientId);
  const clientRecurring = recurringServices.filter((r) => r.clientId === selectedClientId);
  const clientFiles = files.filter((f) => f.clientId === selectedClientId);
  const clientLogs = activityLogs.filter((a) => a.entityId === selectedClientId);

  const totalSpentByClient = clientTransactions
    .filter((t) => t.type === 'entrada' && t.status === 'pago')
    .reduce((acc, t) => acc + t.value, 0);

  const totalPendingFromClient = clientInstallments
    .filter((i) => i.status !== 'pago')
    .reduce((acc, i) => acc + i.value, 0);

  // If a client is selected, render the 360° Client Detail View
  if (selectedClient) {
    return (
      <div className="space-y-6">
        {/* Detail Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onSelectClient(null)}
              leftIcon={<ArrowLeft className="w-4 h-4" />}
            >
              Voltar aos Clientes
            </Button>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  {selectedClient.name}
                </h2>
                <Badge status={selectedClient.status} size="sm" />
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  {selectedClient.clientType}
                </span>
              </div>
              <p className="text-xs text-slate-500">{selectedClient.company} • CNPJ/CPF: {selectedClient.document}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="primary"
              size="sm"
              onClick={() => onOpenNewProjectWizard(selectedClient.id)}
              leftIcon={<Plus className="w-4 h-4" />}
            >
              Novo Projeto p/ este Cliente
            </Button>
          </div>
        </div>

        {/* 360 Client Summary Header Card */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <Card padding="sm">
            <p className="text-[11px] font-semibold text-slate-500 uppercase">Total Pago (LTV)</p>
            <p className="text-lg font-bold text-emerald-600 mt-0.5">
              R$ {totalSpentByClient.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
            <span className="text-[11px] text-slate-400">{clientTransactions.length} pagamentos realizados</span>
          </Card>

          <Card padding="sm">
            <p className="text-[11px] font-semibold text-slate-500 uppercase">A Receber</p>
            <p className="text-lg font-bold text-indigo-600 mt-0.5">
              R$ {totalPendingFromClient.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
            <span className="text-[11px] text-slate-400">{clientInstallments.filter((i) => i.status !== 'pago').length} faturas em aberto</span>
          </Card>

          <Card padding="sm">
            <p className="text-[11px] font-semibold text-slate-500 uppercase">Projetos</p>
            <p className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
              {clientProjects.length}
            </p>
            <span className="text-[11px] text-slate-400">{clientProjects.filter((p) => p.status === 'entregue').length} entregues</span>
          </Card>

          <Card padding="sm">
            <p className="text-[11px] font-semibold text-slate-500 uppercase">Recorrência (MRR)</p>
            <p className="text-lg font-bold text-amber-600 mt-0.5">
              R$ {clientRecurring.filter((r) => r.status === 'ativo').reduce((a, r) => a + r.value, 0).toLocaleString('pt-BR')}/mês
            </p>
            <span className="text-[11px] text-slate-400">{clientRecurring.length} planos contratados</span>
          </Card>
        </div>

        {/* 360 Detail Tabs */}
        <Tabs
          activeTab={detailTab}
          onChange={(id) => setDetailTab(id as any)}
          tabs={[
            { id: 'overview', label: 'Visão Geral & Contato' },
            { id: 'projects', label: 'Projetos', count: clientProjects.length },
            { id: 'finance', label: 'Financeiro & Faturas', count: clientInstallments.length },
            { id: 'contracts', label: 'Contratos', count: clientContracts.length },
            { id: 'proposals', label: 'Propostas', count: clientProposals.length },
            { id: 'recurring', label: 'Recorrências', count: clientRecurring.length },
            { id: 'files', label: 'Arquivos', count: clientFiles.length },
            { id: 'timeline', label: 'Histórico & Logs' },
          ]}
        />

        {/* Tab 1: Overview */}
        {detailTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card padding="md" className="lg:col-span-2 space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Dados Cadastrais & Contato
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-slate-400 block mb-0.5">Nome do Contato:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedClient.name}</span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">Empresa / Razão Social:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedClient.company}</span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">E-mail:</span>
                  <a href={`mailto:${selectedClient.email}`} className="text-indigo-600 hover:underline font-medium">
                    {selectedClient.email}
                  </a>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">WhatsApp / Telefone:</span>
                  <a
                    href={`https://wa.me/55${(selectedClient.whatsapp || selectedClient.phone || '').replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-emerald-600 hover:underline font-medium flex items-center gap-1"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    {selectedClient.whatsapp || selectedClient.phone || 'Não informado'}
                  </a>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">Localização:</span>
                  <span className="font-medium text-slate-800 dark:text-slate-200">
                    {selectedClient.city ? `${selectedClient.city} - ${selectedClient.state}` : 'Não cadastrado'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">Site Oficial:</span>
                  {selectedClient.website ? (
                    <a
                      href={selectedClient.website}
                      target="_blank"
                      rel="noreferrer"
                      className="text-indigo-600 hover:underline font-medium flex items-center gap-1"
                    >
                      <Globe className="w-3.5 h-3.5" />
                      {selectedClient.website}
                    </a>
                  ) : (
                    <span className="text-slate-400">Sem site</span>
                  )}
                </div>
              </div>

              {selectedClient.notes && (
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                  <span className="text-slate-400 text-xs block mb-1">Observações Internas:</span>
                  <p className="text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-lg leading-relaxed">
                    {selectedClient.notes}
                  </p>
                </div>
              )}
            </Card>

            {/* Quick Activity Timeline */}
            <Card padding="md">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-3">
                Histórico de Ações
              </h3>
              <div className="space-y-3 text-xs">
                {clientLogs.length === 0 ? (
                  <p className="text-slate-400 text-xs py-4 text-center">Nenhum evento registrado ainda.</p>
                ) : (
                  clientLogs.map((log) => (
                    <div key={log.id} className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-slate-700 dark:text-slate-300 font-medium leading-tight">
                          {log.action}
                        </p>
                        <span className="text-[10px] text-slate-400">{new Date(log.createdAt).toLocaleDateString('pt-BR')}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </div>
        )}

        {/* Tab 2: Projects */}
        {detailTab === 'projects' && (
          <div className="space-y-3">
            {clientProjects.length === 0 ? (
              <EmptyState
                icon={<FolderKanban className="w-8 h-8" />}
                title="Nenhum projeto cadastrado"
                description="Inicie um projeto de website, landing page ou sistema para este cliente."
                actionText="Criar Novo Projeto"
                onAction={() => onOpenNewProjectWizard(selectedClient.id)}
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {clientProjects.map((p) => (
                  <Card key={p.id} padding="md" hover onClick={() => onNavigateTab('projetos', p.id)}>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h4 className="font-semibold text-sm text-slate-900 dark:text-white">{p.name}</h4>
                      <Badge status={p.status} size="sm" />
                    </div>
                    <p className="text-xs text-slate-500">
                      Tipo: {p.type} • Valor: <strong>R$ {p.value.toLocaleString('pt-BR')}</strong>
                    </p>
                    <div className="mt-3">
                      <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                        <span>Progresso</span>
                        <span>{p.progress}%</span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-indigo-600 h-full rounded-full" style={{ width: `${p.progress}%` }} />
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Finance */}
        {detailTab === 'finance' && (
          <Card padding="none" className="overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold uppercase">
                <tr>
                  <th className="py-3 px-4">Projeto / Descrição</th>
                  <th className="py-3 px-4">Parcela</th>
                  <th className="py-3 px-4">Valor</th>
                  <th className="py-3 px-4">Vencimento</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {clientInstallments.map((inst) => (
                  <tr key={inst.id}>
                    <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">{inst.projectName}</td>
                    <td className="py-3 px-4 text-slate-500">{inst.installmentNumber}/{inst.totalInstallments}</td>
                    <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">R$ {inst.value.toLocaleString('pt-BR')}</td>
                    <td className="py-3 px-4 text-slate-500">{new Date(inst.dueDate).toLocaleDateString('pt-BR')}</td>
                    <td className="py-3 px-4"><Badge status={inst.status} size="sm" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        )}

        {/* Tab 4: Contracts */}
        {detailTab === 'contracts' && (
          <div className="space-y-3">
            {clientContracts.length === 0 ? (
              <EmptyState
                icon={<FileSignature className="w-8 h-8" />}
                title="Nenhum contrato ativo"
                description="Gere um contrato de prestação de serviços com assinatura eletrônica."
              />
            ) : (
              clientContracts.map((c) => (
                <Card key={c.id} padding="md" className="flex items-center justify-between gap-4">
                  <div>
                    <h4 className="font-semibold text-sm text-slate-900 dark:text-white">{c.title}</h4>
                    <p className="text-xs text-slate-500">Valor: R$ {c.value.toLocaleString('pt-BR')} • Prazo: {c.deadline}</p>
                  </div>
                  <Badge status={c.status} size="sm" />
                </Card>
              ))
            )}
          </div>
        )}

        {/* Tab 5: Recurring */}
        {detailTab === 'recurring' && (
          <div className="space-y-3">
            {clientRecurring.length === 0 ? (
              <EmptyState
                icon={<Repeat className="w-8 h-8" />}
                title="Sem serviços recorrentes"
                description="Ofereça planos de manutenção mensal, hospedagem ou SEO contínuo."
              />
            ) : (
              clientRecurring.map((r) => (
                <Card key={r.id} padding="md" className="flex items-center justify-between gap-4">
                  <div>
                    <h4 className="font-semibold text-sm text-slate-900 dark:text-white">{r.serviceName}</h4>
                    <p className="text-xs text-slate-500">
                      R$ {r.value.toLocaleString('pt-BR')}/{r.billingCycle} • Vencimento todo dia {r.dueDateDay}
                    </p>
                  </div>
                  <Badge status={r.status} size="sm" />
                </Card>
              ))
            )}
          </div>
        )}

        {/* Tab 6: Files */}
        {detailTab === 'files' && (
          <div className="space-y-3">
            {clientFiles.length === 0 ? (
              <EmptyState
                variant="files"
                title="Nenhum arquivo vinculado ao cliente"
                description="Arquivos anexados aos projetos deste cliente aparecerão aqui automaticamente."
              />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {clientFiles.map((file) => (
                  <Card key={file.id} padding="sm" className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-semibold text-xs text-slate-900 dark:text-white truncate">{file.name}</p>
                      <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                        {file.category}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400">
                      {file.size} • {file.projectName || 'Geral'}
                    </p>
                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                      <a
                        href={file.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs font-semibold text-indigo-600 hover:underline"
                      >
                        Abrir Arquivo
                      </a>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 7: Timeline & Activity History */}
        {detailTab === 'timeline' && (
          <EntityActivityTimeline
            entityType="cliente"
            entityId={selectedClient.id}
            entityName={selectedClient.name}
          />
        )}
      </div>
    );
  }

  // DEFAULT LIST OF CLIENTS
  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Building2 className="w-5 h-5 text-indigo-600" />
            Gestão de Clientes & Carteira
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Visualize o histórico de projetos, faturas, contratos e serviços de cada cliente.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={onOpenNewClientModal}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          Novo Cliente
        </Button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <Input
            placeholder="Pesquisar por nome, empresa, e-mail ou documento..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            leftIcon={<Search className="w-4 h-4" />}
          />
        </div>
      </div>

      {/* Clients Cards Grid or Empty State */}
      {filteredClients.length === 0 ? (
        <Card padding="lg" className="border-dashed">
          <EmptyState
            variant="clients"
            title={clients.length === 0 ? 'Nenhum cliente cadastrado' : 'Nenhum cliente encontrado'}
            description={
              clients.length === 0
                ? 'Cadastre seus clientes com visão 360° para centralizar projetos, faturas, contratos, briefing e arquivos em um único lugar.'
                : 'Não encontramos nenhum cliente correspondente aos termos de busca.'
            }
            actionText="Novo Cliente"
            onAction={onOpenNewClientModal}
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredClients.map((client) => {
            const clientProjs = projects.filter((p) => p.clientId === client.id);
            const activeCount = clientProjs.filter((p) => p.status !== 'entregue' && p.status !== 'cancelado').length;

            return (
              <Card
                key={client.id}
                padding="md"
                hover
                onClick={() => onSelectClient(client.id)}
                className="cursor-pointer space-y-3 group"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-indigo-600 transition-colors truncate">
                      {client.name}
                    </h3>
                    <p className="text-xs text-slate-500 truncate">{client.company}</p>
                  </div>
                  <Badge status={client.status} size="sm" />
                </div>

                <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                  <div className="flex items-center gap-2 truncate">
                    <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{client.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{client.whatsapp || client.phone || 'Sem telefone'}</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium">
                    {clientProjs.length} projeto(s) ({activeCount} em andamento)
                  </span>
                  <span className="font-semibold text-indigo-600 dark:text-indigo-400 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                    Ver 360° <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
