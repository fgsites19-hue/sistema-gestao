import React, { useState } from 'react';
import {
  Users,
  Plus,
  Search,
  Filter,
  Phone,
  Mail,
  ArrowRight,
  TrendingUp,
  MessageCircle,
  MoreVertical,
  CheckCircle2,
  Trash2,
  Calendar,
  LayoutGrid,
  List,
} from 'lucide-react';
import { useDatabase } from '../context/DatabaseContext';
import { Lead, LeadStatus } from '../types';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Input } from '../components/ui/Input';
import { EmptyState } from '../components/ui/EmptyState';

interface LeadsViewProps {
  onOpenNewLeadModal: () => void;
  onNavigateTab: (tab: any, entityId?: string) => void;
}

export const LeadsView: React.FC<LeadsViewProps> = ({
  onOpenNewLeadModal,
  onNavigateTab,
}) => {
  const { leads, updateLeadStatus, deleteLead, convertLeadToClient } = useDatabase();

  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('todos');

  const columns: { id: LeadStatus; label: string; color: string }[] = [
    { id: 'novo', label: 'Novo Lead', color: 'border-sky-500 text-sky-600' },
    { id: 'contato_realizado', label: 'Contato Feito', color: 'border-indigo-500 text-indigo-600' },
    { id: 'reuniao_agendada', label: 'Reunião Agendada', color: 'border-purple-500 text-purple-600' },
    { id: 'proposta_enviada', label: 'Proposta Enviada', color: 'border-amber-500 text-amber-600' },
    { id: 'negociacao', label: 'Em Negociação', color: 'border-orange-500 text-orange-600' },
    { id: 'ganho', label: 'Ganho (Convertido)', color: 'border-emerald-500 text-emerald-600' },
  ];

  const filteredLeads = leads.filter((lead) => {
    const matchesSearch =
      lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.serviceOfInterest.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'todos' || lead.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const totalPipelineValue = leads
    .filter((l) => l.status !== 'perdido')
    .reduce((acc, l) => acc + (l.estimatedValue || 0), 0);

  return (
    <div className="space-y-6">
      {/* Top Header & Metrics Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-600" />
            CRM de Vendas & Gestão de Leads
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Acompanhe o funil de potenciais clientes desde o primeiro contato até o fechamento.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-lg border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setViewMode('kanban')}
              className={`p-1.5 rounded-md text-xs font-medium transition-all ${
                viewMode === 'kanban'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
              title="Visualização em Kanban"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-md text-xs font-medium transition-all ${
                viewMode === 'list'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
              title="Visualização em Lista"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          <Button
            variant="primary"
            size="sm"
            onClick={onOpenNewLeadModal}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Novo Lead
          </Button>
        </div>
      </div>

      {/* Pipeline Highlights Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Card padding="sm" className="bg-gradient-to-br from-indigo-50/50 to-white dark:from-indigo-950/20 dark:to-slate-900">
          <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Total em Pipeline
          </p>
          <p className="text-xl font-bold text-indigo-950 dark:text-indigo-200 mt-0.5">
            R$ {totalPipelineValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
          <span className="text-[11px] text-slate-500">{leads.length} oportunidades ativas</span>
        </Card>

        <Card padding="sm" className="bg-gradient-to-br from-amber-50/50 to-white dark:from-amber-950/20 dark:to-slate-900">
          <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Em Negociação / Proposta
          </p>
          <p className="text-xl font-bold text-amber-900 dark:text-amber-300 mt-0.5">
            {leads.filter((l) => l.status === 'proposta_enviada' || l.status === 'negociacao').length} leads
          </p>
          <span className="text-[11px] text-slate-500">Aguardando decisão comercial</span>
        </Card>

        <Card padding="sm" className="bg-gradient-to-br from-emerald-50/50 to-white dark:from-emerald-950/20 dark:to-slate-900">
          <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Leads Convertidos (Ganhos)
          </p>
          <p className="text-xl font-bold text-emerald-900 dark:text-emerald-300 mt-0.5">
            {leads.filter((l) => l.status === 'ganho').length} clientes
          </p>
          <span className="text-[11px] text-slate-500">Taxa de conversão: {Math.round((leads.filter((l) => l.status === 'ganho').length / (leads.length || 1)) * 100)}%</span>
        </Card>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <Input
            placeholder="Filtrar leads por nome, empresa ou serviço..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            leftIcon={<Search className="w-4 h-4" />}
          />
        </div>
      </div>

      {/* Empty State or View */}
      {filteredLeads.length === 0 ? (
        <Card padding="lg" className="border-dashed">
          <EmptyState
            variant="leads"
            title={leads.length === 0 ? 'Nenhum lead no funil de vendas' : 'Nenhum lead encontrado'}
            description={
              leads.length === 0
                ? 'Cadastre novos potenciais clientes (Instagram, Google, Indicação, etc.) para acompanhar reuniões, propostas e taxas de conversão.'
                : 'Não encontramos nenhum lead com os termos de busca informados.'
            }
            actionText="Adicionar Lead"
            onAction={onOpenNewLeadModal}
          />
        </Card>
      ) : viewMode === 'kanban' ? (
        /* KANBAN VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5 overflow-x-auto pb-4">
          {columns.map((column) => {
            const columnLeads = filteredLeads.filter((l) => l.status === column.id);
            const columnTotal = columnLeads.reduce((acc, l) => acc + (l.estimatedValue || 0), 0);

            return (
              <div
                key={column.id}
                className="bg-slate-100/70 dark:bg-slate-900/60 rounded-xl p-3 flex flex-col min-w-[240px] border border-slate-200/80 dark:border-slate-800"
              >
                {/* Column Header */}
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${column.id === 'ganho' ? 'bg-emerald-500' : 'bg-indigo-500'}`} />
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                      {column.label}
                    </span>
                  </div>
                  <span className="text-[11px] font-semibold text-slate-500 bg-white dark:bg-slate-800 px-1.5 py-0.2 rounded">
                    {columnLeads.length}
                  </span>
                </div>

                <div className="text-[10px] text-slate-400 mb-2 font-medium">
                  R$ {columnTotal.toLocaleString('pt-BR')}
                </div>

                {/* Column Cards */}
                <div className="space-y-2.5 flex-1">
                  {columnLeads.map((lead) => (
                    <div
                      key={lead.id}
                      className="p-3 bg-white dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-750 shadow-2xs hover:shadow-md transition-all space-y-2 group"
                    >
                      <div className="flex items-start justify-between gap-1">
                        <div>
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                            {lead.name}
                          </h4>
                          <p className="text-[11px] text-slate-500 truncate">{lead.company}</p>
                        </div>
                        <Badge size="sm" status={lead.status} />
                      </div>

                      <div className="text-[11px] text-slate-600 dark:text-slate-300">
                        <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                          {lead.serviceOfInterest}
                        </span>
                        {lead.estimatedValue > 0 && (
                          <span className="block font-bold text-slate-900 dark:text-white mt-0.5">
                            R$ {lead.estimatedValue.toLocaleString('pt-BR')}
                          </span>
                        )}
                      </div>

                      {lead.notes && (
                        <p className="text-[10px] text-slate-400 italic line-clamp-2 bg-slate-50 dark:bg-slate-900/50 p-1.5 rounded">
                          "{lead.notes}"
                        </p>
                      )}

                      {/* Contact and conversion actions */}
                      <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-1">
                        <div className="flex items-center gap-1">
                          {lead.whatsapp && (
                            <a
                              href={`https://wa.me/55${lead.whatsapp.replace(/\D/g, '')}`}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1 rounded text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/50"
                              title="Abrir WhatsApp"
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                            </a>
                          )}
                          {lead.email && (
                            <a
                              href={`mailto:${lead.email}`}
                              className="p-1 rounded text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                              title="Enviar E-mail"
                            >
                              <Mail className="w-3.5 h-3.5" />
                            </a>
                          )}
                        </div>

                        {/* 1-Click Convert to Client Button */}
                        {lead.status !== 'ganho' && (
                          <button
                            onClick={() => convertLeadToClient(lead.id)}
                            className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 px-2 py-1 rounded transition-colors flex items-center gap-1"
                            title="Converter este lead em cliente oficial"
                          >
                            <CheckCircle2 className="w-3 h-3" />
                            Converter
                          </button>
                        )}
                      </div>

                      {/* Move status drop */}
                      <div className="pt-1">
                        <select
                          value={lead.status}
                          onChange={(e) => updateLeadStatus(lead.id, e.target.value as LeadStatus)}
                          className="w-full text-[10px] bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded py-1 px-1.5 text-slate-600 dark:text-slate-300"
                        >
                          <option value="novo">Novo Lead</option>
                          <option value="contato_realizado">Contato Feito</option>
                          <option value="reuniao_agendada">Reunião Agendada</option>
                          <option value="proposta_enviada">Proposta Enviada</option>
                          <option value="negociacao">Em Negociação</option>
                          <option value="ganho">Ganho (Convertido)</option>
                          <option value="perdido">Perdido</option>
                        </select>
                      </div>
                    </div>
                  ))}

                  {columnLeads.length === 0 && (
                    <div className="h-24 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl flex items-center justify-center text-[11px] text-slate-400">
                      Nenhum lead
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* TABLE VIEW */
        <Card padding="none" className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Lead / Contato</th>
                  <th className="py-3 px-4">Empresa</th>
                  <th className="py-3 px-4">Serviço de Interesse</th>
                  <th className="py-3 px-4">Valor Estimado</th>
                  <th className="py-3 px-4">Origem</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredLeads.map((lead) => (
                  <tr
                    key={lead.id}
                    className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="py-3 px-4">
                      <p className="font-semibold text-slate-900 dark:text-white">{lead.name}</p>
                      <p className="text-[11px] text-slate-400">{lead.whatsapp || lead.email}</p>
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-300">{lead.company}</td>
                    <td className="py-3 px-4 font-medium text-indigo-600 dark:text-indigo-400">
                      {lead.serviceOfInterest}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                      R$ {lead.estimatedValue.toLocaleString('pt-BR')}
                    </td>
                    <td className="py-3 px-4 text-slate-500">{lead.source}</td>
                    <td className="py-3 px-4">
                      <Badge status={lead.status} size="sm" />
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {lead.status !== 'ganho' && (
                          <Button
                            size="sm"
                            variant="emerald"
                            onClick={() => convertLeadToClient(lead.id)}
                            className="text-[10px] py-1 px-2"
                          >
                            Converter
                          </Button>
                        )}
                        <button
                          onClick={() => deleteLead(lead.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded"
                          title="Excluir lead"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
};
