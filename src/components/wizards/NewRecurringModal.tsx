import React from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input, Select, Textarea } from '../ui/Input';
import { DraftIndicator } from '../ui/DraftIndicator';
import { useDatabase } from '../../context/DatabaseContext';
import { useFormDraft } from '../../hooks/useFormDraft';
import { BillingCycle, PaymentMethod } from '../../types';

interface NewRecurringModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NewRecurringModal: React.FC<NewRecurringModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { clients, projects, addRecurringService, triggerCelebration } = useDatabase();

  const initialDraftValues = {
    clientId: clients[0]?.id || '',
    projectId: '',
    serviceName: 'Manutenção & Suporte Web Mensal',
    value: 350,
    billingCycle: 'mensal' as BillingCycle,
    startDate: new Date().toISOString().split('T')[0],
    dueDateDay: 10,
    paymentMethod: 'pix' as PaymentMethod,
    description: 'Incluso: atualizações de segurança, backups semanais, pequenas alterações de textos e imagens (até 2h/mês) e suporte via WhatsApp.',
  };

  const {
    formData,
    updateField,
    clearDraft,
    hasSavedDraft,
  } = useFormDraft('draft_new_recurring_modal', initialDraftValues, isOpen);

  const {
    clientId,
    projectId,
    serviceName,
    value,
    billingCycle,
    startDate,
    dueDateDay,
    paymentMethod,
    description,
  } = formData;

  const selectedClient = clients.find((c) => c.id === clientId) || clients[0];
  const selectedProject = projects.find((p) => p.id === projectId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!serviceName.trim()) return;

    const nextDate = new Date();
    nextDate.setDate(dueDateDay);
    if (nextDate < new Date()) {
      nextDate.setMonth(nextDate.getMonth() + 1);
    }

    addRecurringService({
      clientId: selectedClient?.id || '',
      clientName: selectedClient?.name || 'Cliente',
      projectId: selectedProject?.id,
      projectName: selectedProject?.name,
      serviceName,
      value: Number(value),
      billingCycle,
      startDate,
      nextBillingDate: nextDate.toISOString().split('T')[0],
      dueDateDay: Number(dueDateDay),
      status: 'ativo',
      paymentMethod,
      description,
    });

    triggerCelebration();
    clearDraft();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Nova Assinatura Recorrente (MRR)"
      subtitle="Cadastre contratos recorrentes de manutenção, hospedagem, SEO ou suporte contínuo."
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-3.5 py-2">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Select
            label="Cliente Assinante"
            value={clientId}
            onChange={(e) => updateField('clientId', e.target.value)}
            required
          >
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} — {c.company}
              </option>
            ))}
          </Select>

          <Select
            label="Projeto Vinculado (Opcional)"
            value={projectId}
            onChange={(e) => updateField('projectId', e.target.value)}
          >
            <option value="">Nenhum / Suporte Geral</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </Select>
        </div>

        <Input
          label="Nome do Serviço Recorrente"
          placeholder="Ex: Manutenção, Hospedagem & Atualizações"
          value={serviceName}
          onChange={(e) => updateField('serviceName', e.target.value)}
          required
        />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Input
            label="Valor do Plano (R$)"
            type="number"
            value={value}
            onChange={(e) => updateField('value', Number(e.target.value))}
            required
          />

          <Select
            label="Ciclo de Cobrança"
            value={billingCycle}
            onChange={(e) => updateField('billingCycle', e.target.value as BillingCycle)}
          >
            <option value="mensal">Mensal</option>
            <option value="trimestral">Trimestral</option>
            <option value="semestral">Semestral</option>
            <option value="anual">Anual</option>
          </Select>

          <Input
            label="Dia do Vencimento"
            type="number"
            min="1"
            max="31"
            value={dueDateDay}
            onChange={(e) => updateField('dueDateDay', Number(e.target.value))}
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Data de Início do Contrato"
            type="date"
            value={startDate}
            onChange={(e) => updateField('startDate', e.target.value)}
            required
          />

          <Select
            label="Forma de Cobrança Padrão"
            value={paymentMethod}
            onChange={(e) => updateField('paymentMethod', e.target.value as PaymentMethod)}
          >
            <option value="pix">PIX Automático / Chave</option>
            <option value="cartao_credito">Cartão de Crédito</option>
            <option value="boleto">Boleto Bancário</option>
            <option value="transferencia">Transferência</option>
          </Select>
        </div>

        <Textarea
          label="Escopo da Recorrência (O que está incluso)"
          value={description}
          onChange={(e) => updateField('description', e.target.value)}
          rows={2}
        />

        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
          <DraftIndicator hasDraft={hasSavedDraft} onClearDraft={clearDraft} />
          <div className="flex items-center gap-2">
            <Button type="button" variant="outline" size="sm" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Ativar Recorrência
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
};
