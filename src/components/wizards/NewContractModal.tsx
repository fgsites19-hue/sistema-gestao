import React from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input, Select } from '../ui/Input';
import { DraftIndicator } from '../ui/DraftIndicator';
import { useDatabase } from '../../context/DatabaseContext';
import { useFormDraft } from '../../hooks/useFormDraft';

interface NewContractModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NewContractModal: React.FC<NewContractModalProps> = ({ isOpen, onClose }) => {
  const { clients, projects, settings, contractTemplates, addContract, triggerCelebration } = useDatabase();

  const initialDraftValues = {
    clientId: clients[0]?.id || '',
    projectId: projects[0]?.id || '',
    title: 'Contrato de Prestação de Serviços Digitais',
    type: 'Desenvolvimento Web',
    value: 3500,
    startDate: new Date().toISOString().split('T')[0],
    deadline: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
    selectedTemplateId: contractTemplates[0]?.id || '',
  };

  const {
    formData,
    updateField,
    clearDraft,
    hasSavedDraft,
  } = useFormDraft('draft_new_contract_modal', initialDraftValues, isOpen);

  const {
    clientId,
    projectId,
    title,
    type,
    value,
    startDate,
    deadline,
    selectedTemplateId,
  } = formData;

  const selectedClient = clients.find((c) => c.id === clientId) || clients[0];
  const selectedProject = projects.find((p) => p.id === projectId);
  const chosenTmpl = contractTemplates.find((t) => t.id === selectedTemplateId) || contractTemplates[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const generatedContent = (chosenTmpl?.content || '')
      .replace(/{{empresa}}/g, settings.companyName)
      .replace(/{{empresa_cnpj}}/g, settings.document)
      .replace(/{{empresa_endereco}}/g, settings.address)
      .replace(/{{cliente_nome}}/g, selectedClient?.name || '')
      .replace(/{{cliente_cpf_cnpj}}/g, selectedClient?.document || 'A preencher')
      .replace(/{{empresa_cliente}}/g, selectedClient?.company || selectedClient?.name || '')
      .replace(/{{projeto}}/g, selectedProject?.name || title)
      .replace(/{{valor}}/g, value.toLocaleString('pt-BR', { minimumFractionDigits: 2 }))
      .replace(/{{data_inicio}}/g, startDate)
      .replace(/{{data_entrega}}/g, deadline)
      .replace(/{{data_atual}}/g, new Date().toLocaleDateString('pt-BR'));

    addContract({
      clientId: selectedClient?.id || '',
      clientName: selectedClient?.name || 'Cliente',
      projectId: selectedProject?.id,
      projectName: selectedProject?.name,
      title,
      type,
      value: Number(value),
      startDate,
      deadline,
      status: 'aguardando_assinatura',
      content: generatedContent,
    });

    triggerCelebration();
    clearDraft();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Novo Contrato de Serviços"
      subtitle="Gere um documento contratual completo com cláusulas jurídicas e tags dinâmicas."
      maxWidth="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-3.5 py-2">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Select
            label="Cliente Contratante"
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
            <option value="">Nenhum / Contrato Avulso</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </Select>
        </div>

        <Input
          label="Título do Contrato"
          value={title}
          onChange={(e) => updateField('title', e.target.value)}
          required
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Select
            label="Modelo de Contrato Base"
            value={selectedTemplateId}
            onChange={(e) => updateField('selectedTemplateId', e.target.value)}
          >
            {contractTemplates.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </Select>

          <Input
            label="Valor Global do Contrato (R$)"
            type="number"
            value={value}
            onChange={(e) => updateField('value', Number(e.target.value))}
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Data de Início"
            type="date"
            value={startDate}
            onChange={(e) => updateField('startDate', e.target.value)}
            required
          />
          <Input
            label="Prazo Final de Entrega"
            type="date"
            value={deadline}
            onChange={(e) => updateField('deadline', e.target.value)}
            required
          />
        </div>

        <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 text-xs text-slate-500">
          O contrato gerado substituirá automaticamente as tags <code>{"{{cliente_nome}}"}</code>,{' '}
          <code>{"{{valor}}"}</code>, <code>{"{{data_entrega}}"}</code> e demais termos legais.
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
          <DraftIndicator hasDraft={hasSavedDraft} onClearDraft={clearDraft} />
          <div className="flex items-center gap-2">
            <Button type="button" variant="outline" size="sm" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Gerar Contrato
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
};
