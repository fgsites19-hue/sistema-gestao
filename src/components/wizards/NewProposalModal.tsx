import React from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input, Select, Textarea } from '../ui/Input';
import { DraftIndicator } from '../ui/DraftIndicator';
import { useDatabase } from '../../context/DatabaseContext';
import { useFormDraft } from '../../hooks/useFormDraft';
import { ProposalItem } from '../../types';
import { Plus, Trash2 } from 'lucide-react';

interface NewProposalModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NewProposalModal: React.FC<NewProposalModalProps> = ({ isOpen, onClose }) => {
  const { clients, addProposal, triggerCelebration } = useDatabase();

  const initialDraftValues = {
    clientId: clients[0]?.id || '',
    title: '',
    description: '',
    validUntil: new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0],
    discount: 0,
    paymentTerms: '50% de entrada no aceite da proposta e 50% na aprovação final e publicação do site.',
    items: [
      {
        id: 'item_1',
        service: 'Design UI/UX Exclusivo & Estratégia de Conversão',
        title: 'Design UI/UX Exclusivo & Estratégia de Conversão',
        description: 'Criação de layout sob medida no Figma com foco em experiência e alta conversão',
        quantity: 1,
        unitPrice: 1800,
        total: 1800,
      },
      {
        id: 'item_2',
        service: 'Desenvolvimento Web Responsivo & Otimização de Performance',
        title: 'Desenvolvimento Web Responsivo & Otimização de Performance',
        description: 'Programação de todas as páginas com carregamento ultra rápido e integração de formulários',
        quantity: 1,
        unitPrice: 2200,
        total: 2200,
      },
    ] as ProposalItem[],
  };

  const {
    formData,
    updateField,
    clearDraft,
    hasSavedDraft,
  } = useFormDraft('draft_new_proposal_modal', initialDraftValues, isOpen);

  const {
    clientId,
    title,
    description,
    validUntil,
    discount,
    paymentTerms,
    items,
  } = formData;

  const handleAddItem = () => {
    const updatedItems = [
      ...items,
      {
        id: 'item_' + Date.now(),
        service: 'Serviço Adicional',
        title: 'Serviço Adicional',
        description: 'Descrição do serviço ou funcionalidade',
        quantity: 1,
        unitPrice: 500,
        total: 500,
      },
    ];
    updateField('items', updatedItems);
  };

  const handleUpdateItem = (index: number, field: keyof ProposalItem, val: any) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: val };
    if (field === 'title') {
      updated[index].service = val;
    }
    if (field === 'service') {
      updated[index].title = val;
    }
    if (field === 'quantity' || field === 'unitPrice') {
      const qty = field === 'quantity' ? Number(val) : updated[index].quantity;
      const price = field === 'unitPrice' ? Number(val) : updated[index].unitPrice;
      updated[index].total = qty * price;
    }
    updateField('items', updated);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length <= 1) return;
    const updated = items.filter((_, i) => i !== index);
    updateField('items', updated);
  };

  const subtotal = items.reduce((acc, it) => acc + (it.total || 0), 0);
  const finalTotal = Math.max(0, subtotal - Number(discount));

  const selectedClient = clients.find((c) => c.id === clientId) || clients[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || items.length === 0) return;

    addProposal({
      clientId: selectedClient?.id || '',
      clientName: selectedClient?.name || 'Cliente',
      title,
      description,
      items,
      subtotal,
      discount: Number(discount),
      finalTotal,
      validUntil,
      paymentTerms,
      status: 'enviada',
      viewsCount: 0,
    });

    triggerCelebration();
    clearDraft();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Nova Proposta Comercial"
      subtitle="Monte um orçamento detalhado com serviços, itens, valores e condições de pagamento."
      maxWidth="3xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4 py-2">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Select
            label="Cliente / Destinatário"
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

          <Input
            label="Validade da Proposta"
            type="date"
            value={validUntil}
            onChange={(e) => updateField('validUntil', e.target.value)}
            required
          />
        </div>

        <Input
          label="Título da Proposta"
          placeholder="Ex: Proposta Comercial - Redesign e Otimização SEO"
          value={title}
          onChange={(e) => updateField('title', e.target.value)}
          required
        />

        <Textarea
          label="Apresentação / Resumo do Projeto"
          placeholder="Apresentamos nossa proposta técnica e comercial para a criação do seu novo site..."
          value={description}
          onChange={(e) => updateField('description', e.target.value)}
          rows={2}
        />

        {/* Dynamic Items Table */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Escopo de Serviços & Itens Orçados
            </label>
            <Button
              type="button"
              variant="outline"
              size="xs"
              onClick={handleAddItem}
              leftIcon={<Plus className="w-3.5 h-3.5" />}
            >
              Adicionar Item
            </Button>
          </div>

          <div className="space-y-2.5">
            {items.map((item, idx) => (
              <div
                key={item.id || idx}
                className="p-3 bg-slate-50 dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2"
              >
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
                  <div className="sm:col-span-6">
                    <Input
                      placeholder="Nome do serviço (ex: Criação de Identidade Visual)"
                      value={item.title || item.service}
                      onChange={(e) => handleUpdateItem(idx, 'title', e.target.value)}
                      required
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <Input
                      type="number"
                      placeholder="Qtd"
                      value={item.quantity}
                      onChange={(e) => handleUpdateItem(idx, 'quantity', Number(e.target.value))}
                      required
                    />
                  </div>
                  <div className="sm:col-span-3">
                    <Input
                      type="number"
                      placeholder="Valor Unit (R$)"
                      value={item.unitPrice}
                      onChange={(e) => handleUpdateItem(idx, 'unitPrice', Number(e.target.value))}
                      required
                    />
                  </div>
                  <div className="sm:col-span-1 flex justify-end">
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(idx)}
                      disabled={items.length <= 1}
                      className="p-1.5 text-slate-400 hover:text-rose-600 disabled:opacity-30"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <Input
                  placeholder="Detalhamento do escopo deste item..."
                  value={item.description}
                  onChange={(e) => handleUpdateItem(idx, 'description', e.target.value)}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Pricing Summary */}
        <div className="p-3.5 bg-indigo-50/60 dark:bg-indigo-950/30 rounded-xl border border-indigo-100 dark:border-indigo-900/60 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="w-full sm:w-48">
            <Input
              label="Desconto Aplicado (R$)"
              type="number"
              value={discount}
              onChange={(e) => updateField('discount', Number(e.target.value))}
            />
          </div>

          <div className="text-right w-full sm:w-auto">
            <p className="text-xs text-slate-500">
              Subtotal: <strong>R$ {subtotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong>
            </p>
            <p className="text-base sm:text-lg font-bold text-indigo-950 dark:text-white mt-0.5">
              Total da Proposta: R$ {finalTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>

        <Textarea
          label="Condições de Pagamento e Observações Comerciais"
          value={paymentTerms}
          onChange={(e) => updateField('paymentTerms', e.target.value)}
          rows={2}
        />

        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
          <DraftIndicator hasDraft={hasSavedDraft} onClearDraft={clearDraft} />
          <div className="flex items-center gap-2">
            <Button type="button" variant="outline" size="sm" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Gerar e Salvar Proposta
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
};
