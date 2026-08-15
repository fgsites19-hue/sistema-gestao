import React from 'react';
import {
  LeadStatus,
  ProjectStatus,
  TaskStatus,
  ContractStatus,
  ProposalStatus,
  PaymentStatus,
  Priority,
} from '../../types';

interface BadgeProps {
  children?: React.ReactNode;
  variant?:
    | 'lead'
    | 'project'
    | 'task'
    | 'contract'
    | 'proposal'
    | 'payment'
    | 'priority'
    | 'neutral'
    | 'success'
    | 'warning'
    | 'danger'
    | 'info';
  status?:
    | LeadStatus
    | ProjectStatus
    | TaskStatus
    | ContractStatus
    | ProposalStatus
    | PaymentStatus
    | Priority
    | string;
  className?: string;
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant,
  status,
  className = '',
  size = 'md',
}) => {
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs font-medium';

  // Specific formatters for statuses
  let label = children;
  let colorClasses = 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300';

  if (status) {
    switch (status) {
      // Lead Statuses
      case 'novo':
        label = label || 'Novo Lead';
        colorClasses = 'bg-sky-50 text-sky-700 border border-sky-200 dark:bg-sky-950/50 dark:text-sky-300 dark:border-sky-800';
        break;
      case 'contato_realizado':
        label = label || 'Contato Feito';
        colorClasses = 'bg-indigo-50 text-indigo-700 border border-indigo-200 dark:bg-indigo-950/50 dark:text-indigo-300 dark:border-indigo-800';
        break;
      case 'reuniao_agendada':
        label = label || 'Reunião Agendada';
        colorClasses = 'bg-purple-50 text-purple-700 border border-purple-200 dark:bg-purple-950/50 dark:text-purple-300 dark:border-purple-800';
        break;
      case 'proposta_enviada':
        label = label || 'Proposta Enviada';
        colorClasses = 'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800';
        break;
      case 'negociacao':
        label = label || 'Em Negociação';
        colorClasses = 'bg-orange-50 text-orange-700 border border-orange-200 dark:bg-orange-950/50 dark:text-orange-300 dark:border-orange-800';
        break;
      case 'ganho':
        label = label || 'Ganho (Convertido)';
        colorClasses = 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800';
        break;
      case 'perdido':
        label = label || 'Perdido';
        colorClasses = 'bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800';
        break;

      // Project Statuses
      case 'planejamento':
        label = label || 'Planejamento';
        colorClasses = 'bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:text-slate-300';
        break;
      case 'briefing':
        label = label || 'Briefing';
        colorClasses = 'bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/50 dark:text-blue-300';
        break;
      case 'design':
        label = label || 'Design / UI';
        colorClasses = 'bg-fuchsia-50 text-fuchsia-700 border border-fuchsia-200 dark:bg-fuchsia-950/50 dark:text-fuchsia-300';
        break;
      case 'desenvolvimento':
        label = label || 'Desenvolvimento';
        colorClasses = 'bg-indigo-50 text-indigo-700 border border-indigo-200 dark:bg-indigo-950/50 dark:text-indigo-300';
        break;
      case 'revisao':
        label = label || 'Em Revisão';
        colorClasses = 'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/50 dark:text-amber-300';
        break;
      case 'aprovacao':
        label = label || 'Aprovação';
        colorClasses = 'bg-teal-50 text-teal-700 border border-teal-200 dark:bg-teal-950/50 dark:text-teal-300';
        break;
      case 'finalizacao':
        label = label || 'Finalização';
        colorClasses = 'bg-cyan-50 text-cyan-700 border border-cyan-200 dark:bg-cyan-950/50 dark:text-cyan-300';
        break;
      case 'entregue':
        label = label || 'Entregue / Concluído';
        colorClasses = 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300';
        break;
      case 'manutencao':
        label = label || 'Em Manutenção';
        colorClasses = 'bg-violet-50 text-violet-700 border border-violet-200 dark:bg-violet-950/50 dark:text-violet-300';
        break;
      case 'pausado':
        label = label || 'Pausado';
        colorClasses = 'bg-stone-100 text-stone-700 border border-stone-200 dark:bg-stone-800 dark:text-stone-300';
        break;
      case 'cancelado':
        label = label || 'Cancelado';
        colorClasses = 'bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/50 dark:text-rose-300';
        break;

      // Task Statuses
      case 'a_fazer':
        label = label || 'A Fazer';
        colorClasses = 'bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:text-slate-300';
        break;
      case 'em_andamento':
        label = label || 'Em Andamento';
        colorClasses = 'bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/50 dark:text-blue-300';
        break;
      case 'em_revisao':
        label = label || 'Em Revisão';
        colorClasses = 'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/50 dark:text-amber-300';
        break;
      case 'concluido':
        label = label || 'Concluído';
        colorClasses = 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300';
        break;

      // Priorities
      case 'baixa':
        label = label || 'Baixa';
        colorClasses = 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400';
        break;
      case 'media':
        label = label || 'Média';
        colorClasses = 'bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/40 dark:text-blue-300';
        break;
      case 'alta':
        label = label || 'Alta';
        colorClasses = 'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300';
        break;
      case 'urgente':
        label = label || 'Urgente';
        colorClasses = 'bg-rose-50 text-rose-700 border border-rose-200 font-semibold dark:bg-rose-950/50 dark:text-rose-300';
        break;

      // Payment Statuses
      case 'pago':
        label = label || 'Pago';
        colorClasses = 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300';
        break;
      case 'pendente':
        label = label || 'Pendente';
        colorClasses = 'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/50 dark:text-amber-300';
        break;
      case 'vencido':
        label = label || 'Atrasado / Vencido';
        colorClasses = 'bg-rose-100 text-rose-800 border border-rose-300 font-semibold dark:bg-rose-950 dark:text-rose-200';
        break;

      // Contract / Proposal Statuses
      case 'rascunho':
        label = label || 'Rascunho';
        colorClasses = 'bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:text-slate-300';
        break;
      case 'enviada':
      case 'enviado':
        label = label || 'Enviado';
        colorClasses = 'bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/50 dark:text-blue-300';
        break;
      case 'visualizada':
        label = label || 'Visualizada';
        colorClasses = 'bg-purple-50 text-purple-700 border border-purple-200 dark:bg-purple-950/50 dark:text-purple-300';
        break;
      case 'aguardando_assinatura':
        label = label || 'Aguardando Assinatura';
        colorClasses = 'bg-amber-50 text-amber-700 border border-amber-200 font-medium dark:bg-amber-950/50 dark:text-amber-300';
        break;
      case 'aceita':
      case 'assinado':
        label = label || 'Assinado / Aceito';
        colorClasses = 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300';
        break;
      case 'recusada':
      case 'expirada':
        label = label || (status === 'recusada' ? 'Recusada' : 'Expirada');
        colorClasses = 'bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/50 dark:text-rose-300';
        break;

      // Default
      case 'ativo':
        label = label || 'Ativo';
        colorClasses = 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300';
        break;
      case 'inativo':
        label = label || 'Inativo';
        colorClasses = 'bg-slate-100 text-slate-600 border border-slate-200 dark:bg-slate-800 dark:text-slate-400';
        break;
      default:
        label = label || status;
    }
  }

  return (
    <span
      className={`inline-flex items-center rounded-full font-medium whitespace-nowrap leading-none ${sizeClasses} ${colorClasses} ${className}`}
    >
      {label}
    </span>
  );
};
