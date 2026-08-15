import React from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input, Select, Textarea } from '../ui/Input';
import { DraftIndicator } from '../ui/DraftIndicator';
import { useDatabase } from '../../context/DatabaseContext';
import { useFormDraft } from '../../hooks/useFormDraft';
import { TransactionType, PaymentMethod, PaymentStatus } from '../../types';

interface NewTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NewTransactionModal: React.FC<NewTransactionModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { clients, projects, addTransaction, triggerCelebration } = useDatabase();

  const initialDraftValues = {
    type: 'entrada' as TransactionType,
    description: '',
    value: 1000,
    category: 'Site institucional',
    clientId: '',
    projectId: '',
    date: new Date().toISOString().split('T')[0],
    dueDate: new Date().toISOString().split('T')[0],
    paymentMethod: 'pix' as PaymentMethod,
    status: 'pago' as PaymentStatus,
    notes: '',
  };

  const {
    formData,
    updateField,
    clearDraft,
    hasSavedDraft,
  } = useFormDraft('draft_new_transaction_modal', initialDraftValues, isOpen);

  const {
    type,
    description,
    value,
    category,
    clientId,
    projectId,
    date,
    dueDate,
    paymentMethod,
    status,
    notes,
  } = formData;

  const selectedClient = clients.find((c) => c.id === clientId);
  const selectedProject = projects.find((p) => p.id === projectId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    addTransaction({
      type,
      description,
      category,
      clientId: clientId || undefined,
      clientName: selectedClient?.name,
      projectId: projectId || undefined,
      projectName: selectedProject?.name,
      value: Number(value),
      date,
      dueDate,
      paymentDate: status === 'pago' ? date : undefined,
      paymentMethod,
      status,
      notes,
    });

    if (status === 'pago' && type === 'entrada') {
      triggerCelebration();
    }
    clearDraft();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Novo Lançamento Financeiro"
      subtitle="Registre uma receita (entrada de projeto/recorrência) ou despesa operacional."
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-3.5 py-2">
        {/* Type Toggle Tabs */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
          <button
            type="button"
            onClick={() => {
              updateField('type', 'entrada');
              updateField('category', 'Site institucional');
            }}
            className={`py-2 text-xs font-semibold rounded-lg transition-all ${
              type === 'entrada'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
            }`}
          >
            + Entrada (Receita)
          </button>
          <button
            type="button"
            onClick={() => {
              updateField('type', 'saida');
              updateField('category', 'Ferramentas / SaaS');
            }}
            className={`py-2 text-xs font-semibold rounded-lg transition-all ${
              type === 'saida'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
            }`}
          >
            - Saída (Despesa / Custo)
          </button>
        </div>

        <Input
          label="Descrição do Lançamento"
          placeholder={type === 'entrada' ? 'Ex: Entrada 50% Projeto Site Dr. Roberto' : 'Ex: Assinatura Anual Figma & Hostinger'}
          value={description}
          onChange={(e) => updateField('description', e.target.value)}
          required
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Valor (R$)"
            type="number"
            value={value}
            onChange={(e) => updateField('value', Number(e.target.value))}
            required
          />

          <Select
            label="Categoria"
            value={category}
            onChange={(e) => updateField('category', e.target.value)}
          >
            {type === 'entrada' ? (
              <>
                <option value="Site institucional">Site institucional</option>
                <option value="Landing Page">Landing Page</option>
                <option value="E-commerce">E-commerce</option>
                <option value="Manutenção & Hospedagem">Manutenção & Hospedagem</option>
                <option value="SEO & Otimização">SEO & Otimização</option>
                <option value="Consultoria Web">Consultoria Web</option>
                <option value="Outras Receitas">Outras Receitas</option>
              </>
            ) : (
              <>
                <option value="Ferramentas / SaaS">Ferramentas / SaaS (Figma, Elementor, Canva...)</option>
                <option value="Hospedagem & Servidores">Hospedagem & Servidores (Hostinger, Cloud...)</option>
                <option value="Domínios & SSL">Domínios & SSL</option>
                <option value="Contabilidade & Impostos">Contabilidade & Impostos</option>
                <option value="Marketing & Anúncios">Marketing & Anúncios</option>
                <option value="Equipamentos & Hardware">Equipamentos & Hardware</option>
                <option value="Outras Despesas">Outras Despesas</option>
              </>
            )}
          </Select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Select
            label="Cliente Relacionado (Opcional)"
            value={clientId}
            onChange={(e) => updateField('clientId', e.target.value)}
          >
            <option value="">Nenhum / Despesa Geral</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.company})
              </option>
            ))}
          </Select>

          <Select
            label="Projeto Relacionado (Opcional)"
            value={projectId}
            onChange={(e) => updateField('projectId', e.target.value)}
          >
            <option value="">Nenhum</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </Select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Input
            label="Data de Vencimento"
            type="date"
            value={dueDate}
            onChange={(e) => updateField('dueDate', e.target.value)}
            required
          />

          <Select
            label="Forma de Pagamento"
            value={paymentMethod}
            onChange={(e) => updateField('paymentMethod', e.target.value as PaymentMethod)}
          >
            <option value="pix">PIX</option>
            <option value="cartao_credito">Cartão de Crédito</option>
            <option value="boleto">Boleto Bancário</option>
            <option value="transferencia">Transferência Bancária</option>
            <option value="dinheiro">Dinheiro</option>
          </Select>

          <Select
            label="Status do Lançamento"
            value={status}
            onChange={(e) => updateField('status', e.target.value as PaymentStatus)}
          >
            <option value="pago">Já Pago / Recebido</option>
            <option value="pendente">Pendente (A receber / A pagar)</option>
            <option value="vencido">Vencido / Em Atraso</option>
          </Select>
        </div>

        <Textarea
          label="Observações"
          placeholder="Código de transação, comprovante ou observação contábil..."
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
            <Button
              type="submit"
              variant={type === 'entrada' ? 'emerald' : 'danger'}
              size="sm"
            >
              Salvar Lançamento
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
};
