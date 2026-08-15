import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input, Select, Textarea } from '../ui/Input';
import { DraftIndicator } from '../ui/DraftIndicator';
import { useDatabase } from '../../context/DatabaseContext';
import { useFormDraft } from '../../hooks/useFormDraft';
import { ProjectType, Priority } from '../../types';
import { Check, ArrowRight, ArrowLeft, FolderKanban, Sparkles, CheckCircle2 } from 'lucide-react';

interface NewProjectWizardProps {
  isOpen: boolean;
  onClose: () => void;
  defaultClientId?: string;
}

export const NewProjectWizard: React.FC<NewProjectWizardProps> = ({
  isOpen,
  onClose,
  defaultClientId,
}) => {
  const { clients, projectTemplates, addProject, triggerCelebration } = useDatabase();

  const [currentStep, setCurrentStep] = useState(1);

  const initialDraftValues = {
    clientId: defaultClientId || (clients[0]?.id ?? ''),
    name: '',
    type: 'Site institucional' as ProjectType,
    value: 3500,
    startDate: new Date().toISOString().split('T')[0],
    deadline: new Date(Date.now() + 20 * 86400000).toISOString().split('T')[0],
    priority: 'alta' as Priority,
    description: '',
    installmentsCount: 2,
    initialPayment: 1500,
    selectedTemplateId: 'tmpl_site_institucional',
    createContract: true,
  };

  const {
    formData,
    updateField,
    clearDraft,
    hasSavedDraft,
  } = useFormDraft('draft_new_project_wizard', initialDraftValues, isOpen);

  const {
    clientId,
    name,
    type,
    value,
    startDate,
    deadline,
    priority,
    description,
    installmentsCount,
    initialPayment,
    selectedTemplateId,
    createContract,
  } = formData;

  const selectedClient = clients.find((c) => c.id === clientId) || clients[0];

  const handleFinish = () => {
    if (!name.trim()) {
      alert('Por favor informe o nome do projeto.');
      return;
    }

    addProject(
      {
        clientId: selectedClient?.id || '',
        clientName: selectedClient?.name || 'Cliente',
        name,
        type,
        value: Number(value),
        startDate,
        deadline,
        status: 'briefing',
        priority,
        description,
        progress: 10,
      },
      {
        templateId: selectedTemplateId || undefined,
        installmentsCount: Number(installmentsCount),
        initialPayment: Number(initialPayment),
        createContract,
      }
    );

    triggerCelebration();
    clearDraft();
    setCurrentStep(1);
    onClose();
  };

  const steps = [
    { number: 1, title: 'Cliente' },
    { number: 2, title: 'Tipo de Projeto' },
    { number: 3, title: 'Valor' },
    { number: 4, title: 'Cronograma' },
    { number: 5, title: 'Pagamento' },
    { number: 6, title: 'Tarefas' },
    { number: 7, title: 'Contrato' },
    { number: 8, title: 'Conclusão' },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Assistente de Criação de Novo Projeto"
      subtitle={`Etapa ${currentStep} de ${steps.length}: ${steps[currentStep - 1].title}`}
      maxWidth="2xl"
      footer={
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentStep((prev) => Math.max(1, prev - 1))}
              disabled={currentStep === 1}
              leftIcon={<ArrowLeft className="w-4 h-4" />}
            >
              Voltar
            </Button>
            <DraftIndicator hasDraft={hasSavedDraft} onClearDraft={clearDraft} />
          </div>

          <div className="flex items-center gap-2">
            {currentStep < steps.length ? (
              <Button
                variant="primary"
                size="sm"
                onClick={() => setCurrentStep((prev) => Math.min(steps.length, prev + 1))}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Próximo
              </Button>
            ) : (
              <Button
                variant="emerald"
                size="sm"
                onClick={handleFinish}
                leftIcon={<CheckCircle2 className="w-4 h-4" />}
              >
                Criar Projeto Completo
              </Button>
            )}
          </div>
        </div>
      }
    >
      {/* Wizard Progress Bar */}
      <div className="mb-6">
        <div className="grid grid-cols-8 gap-1 mb-2">
          {steps.map((step) => {
            const isDone = currentStep > step.number;
            const isCurrent = currentStep === step.number;
            return (
              <div
                key={step.number}
                className={`h-1.5 rounded-full transition-all ${
                  isDone
                    ? 'bg-emerald-500'
                    : isCurrent
                    ? 'bg-indigo-600'
                    : 'bg-slate-200 dark:bg-slate-800'
                }`}
              />
            );
          })}
        </div>
        <div className="flex items-center justify-between text-[11px] text-slate-400">
          <span>Passo {currentStep}: {steps[currentStep - 1].title}</span>
          <span>{Math.round((currentStep / steps.length) * 100)}% concluído</span>
        </div>
      </div>

      {/* STEP 1: CLIENTE */}
      {currentStep === 1 && (
        <div className="space-y-4 py-2">
          <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 rounded-xl border border-indigo-100 dark:border-indigo-900 text-xs text-indigo-900 dark:text-indigo-300">
            Selecione o cliente para o qual este projeto será desenvolvido. Todos os contratos, tarefas e lançamentos financeiros ficarão vinculados a ele.
          </div>

          <Select
            label="Cliente do Projeto"
            value={clientId}
            onChange={(e) => updateField('clientId', e.target.value)}
            required
          >
            {clients.map((cli) => (
              <option key={cli.id} value={cli.id}>
                {cli.name} — {cli.company} ({cli.document || 'Sem documento'})
              </option>
            ))}
          </Select>

          <Input
            label="Nome / Título do Projeto"
            placeholder="Ex: Novo Portal Institucional & SEO"
            value={name}
            onChange={(e) => updateField('name', e.target.value)}
            required
            helperText="Um título claro para identificação no dashboard e faturas."
          />
        </div>
      )}

      {/* STEP 2: TIPO DE PROJETO */}
      {currentStep === 2 && (
        <div className="space-y-4 py-2">
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
            Selecione a Categoria Principal do Projeto
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {[
              { id: 'Site institucional', desc: 'Sites corporativos, médicos, jurídicos e portfólios' },
              { id: 'Landing Page', desc: 'Páginas de alta conversão para anúncios e tráfego' },
              { id: 'E-commerce', desc: 'Lojas virtuais na Nuvemshop, Shopify ou WooCommerce' },
              { id: 'Sistema', desc: 'Painéis administrativos, portais e dashboards sob medida' },
              { id: 'Automação', desc: 'Integrações de formulários, Webhooks e CRM' },
              { id: 'Manutenção', desc: 'Suporte mensal, segurança e pequenas alterações' },
              { id: 'SEO', desc: 'Otimização para mecanismos de busca e Google' },
              { id: 'Tráfego pago', desc: 'Gestão de campanhas no Meta Ads e Google Ads' },
            ].map((item) => (
              <div
                key={item.id}
                onClick={() => updateField('type', item.id as ProjectType)}
                className={`p-3 rounded-xl border cursor-pointer transition-all ${
                  type === item.id
                    ? 'border-indigo-600 bg-indigo-50/60 dark:bg-indigo-950/40 text-indigo-950 dark:text-indigo-200'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-xs text-slate-900 dark:text-white">
                    {item.id}
                  </span>
                  {type === item.id && <Check className="w-4 h-4 text-indigo-600" />}
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">{item.desc}</p>
              </div>
            ))}
          </div>

          <Textarea
            label="Breve Descrição do Escopo"
            placeholder="Ex: Reformulação total das páginas Home, Sobre, Procedimentos e Blog..."
            value={description}
            onChange={(e) => updateField('description', e.target.value)}
          />
        </div>
      )}

      {/* STEP 3: VALOR */}
      {currentStep === 3 && (
        <div className="space-y-4 py-2">
          <Input
            label="Valor Total do Projeto (R$)"
            type="number"
            value={value}
            onChange={(e) => updateField('value', Number(e.target.value))}
            required
            helperText="Valor acordado com o cliente para a entrega completa do escopo."
          />

          <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Simulação de Receita
            </p>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900 dark:text-white">
                R$ {value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Nas próximas etapas você poderá configurar a entrada e o parcelamento automático.
            </p>
          </div>
        </div>
      )}

      {/* STEP 4: CRONOGRAMA */}
      {currentStep === 4 && (
        <div className="space-y-4 py-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

          <Select
            label="Nível de Prioridade"
            value={priority}
            onChange={(e) => updateField('priority', e.target.value as Priority)}
          >
            <option value="baixa">Baixa</option>
            <option value="media">Média</option>
            <option value="alta">Alta</option>
            <option value="urgente">Urgente</option>
          </Select>
        </div>
      )}

      {/* STEP 5: PAGAMENTO & PARCELAMENTO */}
      {currentStep === 5 && (
        <div className="space-y-4 py-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Valor da Entrada (R$)"
              type="number"
              value={initialPayment}
              onChange={(e) => updateField('initialPayment', Number(e.target.value))}
            />
            <Select
              label="Número Total de Parcelas"
              value={installmentsCount}
              onChange={(e) => updateField('installmentsCount', Number(e.target.value))}
            >
              <option value="1">1x (À vista na entrega / início)</option>
              <option value="2">2x (Entrada + 1x restante)</option>
              <option value="3">3x (Entrada + 2x restantes)</option>
              <option value="4">4x (Entrada + 3x restantes)</option>
              <option value="5">5x (Entrada + 4x restantes)</option>
            </Select>
          </div>

          {/* Installment breakdown card */}
          <div className="p-3 bg-indigo-50/50 dark:bg-indigo-950/30 rounded-xl border border-indigo-100 dark:border-indigo-900 text-xs">
            <p className="font-semibold text-indigo-950 dark:text-indigo-200 mb-1">
              Plano de Cobrança Gerado:
            </p>
            <ul className="space-y-1 text-slate-600 dark:text-slate-300">
              <li>• Parcela 1 (Entrada): <strong>R$ {initialPayment.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong> (Vencimento imediato)</li>
              {installmentsCount > 1 && (
                <li>
                  • {installmentsCount - 1}x parcelas restantes de:{' '}
                  <strong>
                    R${' '}
                    {(
                      Math.max(0, value - initialPayment) / (installmentsCount - (initialPayment > 0 ? 1 : 0))
                    ).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </strong>
                </li>
              )}
            </ul>
          </div>
        </div>
      )}

      {/* STEP 6: TEMPLATE DE TAREFAS */}
      {currentStep === 6 && (
        <div className="space-y-4 py-2">
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
            Selecione um Template de Tarefas Padrão
          </label>
          <div className="space-y-2.5">
            {projectTemplates.map((tmpl) => (
              <div
                key={tmpl.id}
                onClick={() => updateField('selectedTemplateId', tmpl.id)}
                className={`p-3 rounded-xl border cursor-pointer transition-all ${
                  selectedTemplateId === tmpl.id
                    ? 'border-indigo-600 bg-indigo-50/60 dark:bg-indigo-950/40'
                    : 'border-slate-200 dark:border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-xs text-slate-900 dark:text-white">
                    {tmpl.name} ({tmpl.tasks.length} tarefas inclusas)
                  </span>
                  {selectedTemplateId === tmpl.id && <Check className="w-4 h-4 text-indigo-600" />}
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  {tmpl.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* STEP 7: CONTRATO */}
      {currentStep === 7 && (
        <div className="space-y-4 py-2">
          <div className="flex items-start gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
            <input
              type="checkbox"
              id="createContractCheck"
              checked={createContract}
              onChange={(e) => updateField('createContract', e.target.checked)}
              className="mt-1 w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
            />
            <label htmlFor="createContractCheck" className="text-xs cursor-pointer">
              <span className="font-semibold text-slate-900 dark:text-white block">
                Gerar Contrato de Prestação de Serviços Automaticamente
              </span>
              <span className="text-slate-500 dark:text-slate-400">
                O sistema preencherá as cláusulas com os dados de {selectedClient?.name}, valor de R${' '}
                {value.toLocaleString('pt-BR')} e prazos definidos.
              </span>
            </label>
          </div>
        </div>
      )}

      {/* STEP 8: REVISÃO & CONCLUSÃO */}
      {currentStep === 8 && (
        <div className="space-y-3 py-2">
          <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl border border-emerald-200 dark:border-emerald-900 text-xs">
            <h4 className="font-bold text-emerald-900 dark:text-emerald-300 text-sm mb-2 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              Resumo da Criação do Projeto
            </h4>
            <div className="grid grid-cols-2 gap-2 text-slate-700 dark:text-slate-300">
              <div><strong>Projeto:</strong> {name || 'Projeto Web'}</div>
              <div><strong>Cliente:</strong> {selectedClient?.name}</div>
              <div><strong>Tipo:</strong> {type}</div>
              <div><strong>Valor:</strong> R$ {value.toLocaleString('pt-BR')}</div>
              <div><strong>Prazo:</strong> {startDate} até {deadline}</div>
              <div><strong>Parcelas:</strong> {installmentsCount}x</div>
              <div><strong>Tarefas Padrão:</strong> {selectedTemplateId ? 'Sim' : 'Não'}</div>
              <div><strong>Gerar Contrato:</strong> {createContract ? 'Sim' : 'Não'}</div>
            </div>
          </div>
          <p className="text-xs text-slate-500 text-center">
            Clique em "Criar Projeto Completo" para inicializar os módulos operacionais e financeiros.
          </p>
        </div>
      )}
    </Modal>
  );
};
