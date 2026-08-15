import React from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input, Select, Textarea } from '../ui/Input';
import { DraftIndicator } from '../ui/DraftIndicator';
import { useDatabase } from '../../context/DatabaseContext';
import { useFormDraft } from '../../hooks/useFormDraft';
import { LeadStatus } from '../../types';

interface NewLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NewLeadModal: React.FC<NewLeadModalProps> = ({ isOpen, onClose }) => {
  const { addLead, triggerCelebration } = useDatabase();

  const initialDraftValues = {
    name: '',
    company: '',
    email: '',
    whatsapp: '',
    source: 'Instagram',
    estimatedValue: 3000,
    serviceOfInterest: 'Landing Page',
    status: 'novo' as LeadStatus,
    notes: '',
  };

  const {
    formData,
    updateField,
    clearDraft,
    hasSavedDraft,
  } = useFormDraft('draft_new_lead_modal', initialDraftValues, isOpen);

  const {
    name,
    company,
    email,
    whatsapp,
    source,
    estimatedValue,
    serviceOfInterest,
    status,
    notes,
  } = formData;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    addLead({
      name,
      company: company || name,
      email,
      whatsapp,
      source,
      estimatedValue: Number(estimatedValue),
      serviceOfInterest,
      status,
      notes,
    });

    triggerCelebration();
    clearDraft();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Novo Lead / Oportunidade (CRM)"
      subtitle="Cadastre um potencial cliente para acompanhar pelo funil comercial."
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-3.5 py-2">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Nome do Lead"
            placeholder="Ex: Dra. Larissa Nunes"
            value={name}
            onChange={(e) => updateField('name', e.target.value)}
            required
          />
          <Input
            label="Empresa / Negócio"
            placeholder="Ex: Clínica Larissa Nunes"
            value={company}
            onChange={(e) => updateField('company', e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="WhatsApp"
            placeholder="(11) 99999-8888"
            value={whatsapp}
            onChange={(e) => updateField('whatsapp', e.target.value)}
          />
          <Input
            label="E-mail"
            type="email"
            placeholder="contato@empresa.com"
            value={email}
            onChange={(e) => updateField('email', e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Select
            label="Origem do Lead"
            value={source}
            onChange={(e) => updateField('source', e.target.value)}
          >
            <option value="Instagram">Instagram Direct / Bio</option>
            <option value="Indicação">Indicação de Cliente</option>
            <option value="Google / SEO">Google / Busca Orgânica</option>
            <option value="Tráfego Pago">Anúncios (Meta / Google Ads)</option>
            <option value="Prospecção Ativa">Prospecção Ativa (Outbound)</option>
            <option value="WhatsApp">WhatsApp</option>
          </Select>

          <Select
            label="Serviço de Interesse"
            value={serviceOfInterest}
            onChange={(e) => updateField('serviceOfInterest', e.target.value)}
          >
            <option value="Site institucional">Site institucional</option>
            <option value="Landing Page">Landing Page</option>
            <option value="E-commerce">E-commerce</option>
            <option value="Redesign de Site">Redesign de Site</option>
            <option value="Manutenção de Site">Manutenção & Hospedagem</option>
            <option value="SEO">SEO & Posicionamento</option>
          </Select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Valor Estimado da Proposta (R$)"
            type="number"
            value={estimatedValue}
            onChange={(e) => updateField('estimatedValue', Number(e.target.value))}
          />
          <Select
            label="Etapa Inicial do Funil"
            value={status}
            onChange={(e) => updateField('status', e.target.value as LeadStatus)}
          >
            <option value="novo">Novo Lead</option>
            <option value="contato_realizado">Contato Realizado</option>
            <option value="reuniao_agendada">Reunião Agendada</option>
            <option value="proposta_enviada">Proposta Enviada</option>
            <option value="negociacao">Em Negociação</option>
          </Select>
        </div>

        <Textarea
          label="Anotações sobre a Demanda"
          placeholder="O que o cliente precisa? Qual o prazo desejado? Alguma referência de site enviada?"
          value={notes}
          onChange={(e) => updateField('notes', e.target.value)}
          rows={2}
        />

        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
          <DraftIndicator hasDraft={hasSavedDraft} onClearDraft={clearDraft} />
          <div className="flex items-center gap-2">
            <Button type="button" variant="outline" size="sm" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Salvar Lead no CRM
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
};
