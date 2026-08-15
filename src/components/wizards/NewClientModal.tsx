import React from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input, Select, Textarea } from '../ui/Input';
import { DraftIndicator } from '../ui/DraftIndicator';
import { useDatabase } from '../../context/DatabaseContext';
import { useFormDraft } from '../../hooks/useFormDraft';
import { ClientType } from '../../types';

interface NewClientModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NewClientModal: React.FC<NewClientModalProps> = ({ isOpen, onClose }) => {
  const { addClient, triggerCelebration } = useDatabase();

  const initialDraftValues = {
    name: '',
    company: '',
    email: '',
    phone: '',
    whatsapp: '',
    document: '',
    clientType: 'PJ' as ClientType,
    city: '',
    state: '',
    website: '',
    instagram: '',
    notes: '',
  };

  const {
    formData,
    updateField,
    clearDraft,
    hasSavedDraft,
  } = useFormDraft('draft_new_client_modal', initialDraftValues, isOpen);

  const {
    name,
    company,
    email,
    phone,
    whatsapp,
    document,
    clientType,
    city,
    state,
    website,
    instagram,
    notes,
  } = formData;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    addClient({
      name,
      company: company || name,
      email,
      phone: phone || whatsapp,
      whatsapp: whatsapp || phone,
      document,
      clientType,
      city,
      state,
      website,
      instagram,
      notes,
      status: 'ativo',
    });

    triggerCelebration();
    clearDraft();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Cadastrar Novo Cliente"
      subtitle="Adicione os dados cadastrais do cliente para vincular projetos, contratos e faturas."
      maxWidth="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4 py-2">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Nome do Responsável / Contato"
            placeholder="Ex: Roberto Alcantara"
            value={name}
            onChange={(e) => updateField('name', e.target.value)}
            required
          />
          <Input
            label="Nome da Empresa / Razão Social"
            placeholder="Ex: Alcantara Engenharia & Construções"
            value={company}
            onChange={(e) => updateField('company', e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Select
            label="Tipo de Pessoa"
            value={clientType}
            onChange={(e) => updateField('clientType', e.target.value as ClientType)}
          >
            <option value="PJ">Pessoa Jurídica (PJ / CNPJ)</option>
            <option value="PF">Pessoa Física (PF / CPF)</option>
          </Select>
          <Input
            label={clientType === 'PJ' ? 'CNPJ' : 'CPF'}
            placeholder={clientType === 'PJ' ? '00.000.000/0001-00' : '000.000.000-00'}
            value={document}
            onChange={(e) => updateField('document', e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="E-mail Principal"
            type="email"
            placeholder="contato@empresa.com.br"
            value={email}
            onChange={(e) => updateField('email', e.target.value)}
            required
          />
          <Input
            label="WhatsApp para Contato"
            placeholder="(11) 98888-7777"
            value={whatsapp}
            onChange={(e) => updateField('whatsapp', e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Site Atual (se houver)"
            placeholder="https://meusite.com.br"
            value={website}
            onChange={(e) => updateField('website', e.target.value)}
          />
          <Input
            label="Instagram"
            placeholder="@empresa"
            value={instagram}
            onChange={(e) => updateField('instagram', e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Cidade"
            placeholder="São Paulo"
            value={city}
            onChange={(e) => updateField('city', e.target.value)}
          />
          <Input
            label="Estado (UF)"
            placeholder="SP"
            value={state}
            onChange={(e) => updateField('state', e.target.value)}
          />
        </div>

        <Textarea
          label="Observações Internas"
          placeholder="Anotações sobre preferências do cliente, nicho, horário de atendimento..."
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
              Salvar Cliente
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
};
