import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Plus,
  Trash2,
  Edit3,
  Bookmark,
  Check,
  Search,
  MessageSquare,
  FileText,
  ShieldAlert,
  Rocket,
  TrendingUp,
  Tag,
  Copy,
} from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Input, Select } from '../ui/Input';

export interface PromptPreset {
  id: string;
  title: string;
  description: string;
  category: 'propostas' | 'cobranca' | 'escopo' | 'tecnico' | 'contratos' | 'vendas' | 'geral';
  prompt: string;
  isCustom?: boolean;
  createdAt?: string;
}

export const defaultPromptPresets: PromptPreset[] = [
  {
    id: 'preset_followup_proposal',
    title: 'Follow-up de Proposta Comercial',
    description: 'Mensagem consultiva e persuasiva para retomar contato após envio de orçamento.',
    category: 'propostas',
    prompt:
      'Escreva uma mensagem de WhatsApp para follow-up de uma proposta de desenvolvimento de website enviada há 3 dias. Seja consultivo, pergunte se restou alguma dúvida sobre o escopo ou etapas de investimento, e mostre disponibilidade para um call rápido de 10 minutos.',
  },
  {
    id: 'preset_cobranca_educada',
    title: 'Lembrete Amigável de Cobrança',
    description: 'Cobrança elegante e profissional para boletos/faturas vencidas sem desgastar o relacionamento.',
    category: 'cobranca',
    prompt:
      'Redija uma mensagem de WhatsApp muito gentil e profissional lembrando o cliente de que a parcela de desenvolvimento web venceu recentemente. Inclua instruções de PIX e peça o envio do comprovante.',
  },
  {
    id: 'preset_scope_creep',
    title: 'Negociar Fora de Escopo (Scope Creep)',
    description: 'Como responder a pedidos de alterações extras cobrando o adicional sem atritos.',
    category: 'escopo',
    prompt:
      'O cliente solicitou novas funcionalidades e integrações que não estavam previstas no escopo contratado. Escreva um e-mail/mensagem educada explicando que teremos prazer em implementar, mas que isso requer um aditivo de escopo e horas adicionais com orçamento complementar.',
  },
  {
    id: 'preset_golive_checklist',
    title: 'Checklist de Lançamento (Go-Live)',
    description: 'Checklist de homologação técnica antes de apontar DNS e entregar o projeto.',
    category: 'tecnico',
    prompt:
      'Gere um checklist operacional detalhado de Go-Live para entrega de um website (verificação de SSL, responsividade mobile, tags de conversão do Google e Meta Pixel, formulários de contato, página 404 customizada, performance no PageSpeed e backup final).',
  },
  {
    id: 'preset_mrr_upsell',
    title: 'Oferta de Manutenção Mensal (MRR)',
    description: 'Script para converter cliente de projeto pontual em contrato de suporte recorrente.',
    category: 'vendas',
    prompt:
      'Escreva um e-mail de fechamento pós-entrega de website oferecendo o Plano de Suporte e Manutenção Recorrente (atualizações de segurança, backups diários, suporte a alterações rápidas e monitoramento 24/7). Apresente os riscos de deixar o site sem suporte técnico.',
  },
  {
    id: 'preset_briefing_discovery',
    title: 'Roteiro de Briefing Estratégico',
    description: 'Perguntas-chave para extrair metas de negócio, público-alvo e referências visuais.',
    category: 'propostas',
    prompt:
      'Crie um roteiro conciso de briefing com 10 perguntas essenciais para uma reunião de discovery com um novo cliente que deseja um site institucional ou loja virtual.',
  },
  {
    id: 'preset_onboarding_welcome',
    title: 'Email de Boas-Vindas & Onboarding',
    description: 'Alinhamento inicial de cronograma e coleta de materiais pós-fechamento de contrato.',
    category: 'geral',
    prompt:
      'Escreva um e-mail de boas-vindas para um cliente que acabou de assinar o contrato de desenvolvimento. Explique como funciona nossa esteira de trabalho (Briefing -> Wireframes -> Design Figma -> Programação -> Homologação) e solicite os acessos iniciais de domínio e logotipo.',
  },
];

const PRESETS_STORAGE_KEY = 'studioos_prompt_presets_v1';

interface PromptPresetsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPreset: (promptText: string) => void;
}

export const PromptPresetsModal: React.FC<PromptPresetsModalProps> = ({
  isOpen,
  onClose,
  onSelectPreset,
}) => {
  const [presets, setPresets] = useState<PromptPreset[]>(() => {
    try {
      const stored = localStorage.getItem(PRESETS_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return [...defaultPromptPresets, ...parsed.filter((p: PromptPreset) => p.isCustom)];
      }
    } catch (e) {
      console.warn('Failed to load presets:', e);
    }
    return defaultPromptPresets;
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('todos');
  const [isCreating, setIsCreating] = useState(false);
  const [editingPresetId, setEditingPresetId] = useState<string | null>(null);

  // Form state
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formCategory, setFormCategory] = useState<PromptPreset['category']>('propostas');
  const [formPrompt, setFormPrompt] = useState('');

  // Persist custom presets
  const saveCustomPresets = (newPresetList: PromptPreset[]) => {
    setPresets(newPresetList);
    try {
      const customOnly = newPresetList.filter((p) => p.isCustom);
      localStorage.setItem(PRESETS_STORAGE_KEY, JSON.stringify(customOnly));
    } catch (e) {
      console.error('Error saving custom presets:', e);
    }
  };

  const handleSavePreset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formPrompt.trim()) return;

    if (editingPresetId) {
      const updated = presets.map((p) =>
        p.id === editingPresetId
          ? {
              ...p,
              title: formTitle.trim(),
              description: formDescription.trim(),
              category: formCategory,
              prompt: formPrompt.trim(),
            }
          : p
      );
      saveCustomPresets(updated);
      setEditingPresetId(null);
    } else {
      const newPreset: PromptPreset = {
        id: 'preset_custom_' + Date.now(),
        title: formTitle.trim(),
        description: formDescription.trim(),
        category: formCategory,
        prompt: formPrompt.trim(),
        isCustom: true,
        createdAt: new Date().toISOString(),
      };
      saveCustomPresets([newPreset, ...presets]);
    }

    setIsCreating(false);
    setFormTitle('');
    setFormDescription('');
    setFormPrompt('');
  };

  const handleDeletePreset = (id: string) => {
    const updated = presets.filter((p) => p.id !== id);
    saveCustomPresets(updated);
  };

  const handleStartEdit = (preset: PromptPreset) => {
    setEditingPresetId(preset.id);
    setFormTitle(preset.title);
    setFormDescription(preset.description);
    setFormCategory(preset.category);
    setFormPrompt(preset.prompt);
    setIsCreating(true);
  };

  const filteredPresets = presets.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.prompt.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'todos' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Modelos & Presets de Prompts para IA"
      description="Utilize templates estratégicos de mensagens, follow-ups, escopos e contratos para acelerar suas consultas ao Gemini."
      maxWidth="max-w-3xl"
    >
      <div className="space-y-4">
        {/* Top Controls */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-1">
            <div className="flex-1">
              <Input
                placeholder="Pesquisar presets por título ou palavra-chave..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                leftIcon={<Search className="w-4 h-4" />}
              />
            </div>
            <Select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-40"
            >
              <option value="todos">Todas Categorias</option>
              <option value="propostas">Propostas</option>
              <option value="cobranca">Cobrança</option>
              <option value="escopo">Escopo</option>
              <option value="vendas">Vendas / MRR</option>
              <option value="tecnico">Técnico</option>
              <option value="geral">Geral</option>
            </Select>
          </div>

          <Button
            size="sm"
            variant={isCreating ? 'secondary' : 'primary'}
            onClick={() => {
              if (isCreating) {
                setIsCreating(false);
                setEditingPresetId(null);
              } else {
                setEditingPresetId(null);
                setFormTitle('');
                setFormDescription('');
                setFormPrompt('');
                setIsCreating(true);
              }
            }}
            leftIcon={<Plus className="w-4 h-4" />}
            className="shrink-0"
          >
            {isCreating ? 'Ver Presets Salvos' : 'Criar Novo Preset'}
          </Button>
        </div>

        {/* Create / Edit Form */}
        {isCreating ? (
          <Card padding="md" className="space-y-4 bg-slate-50/60 dark:bg-slate-850/60 border-indigo-200 dark:border-indigo-900/60 animate-in fade-in">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                {editingPresetId ? 'Editar Preset de Prompt' : 'Novo Modelo de Prompt Personalizado'}
              </h3>
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="text-xs text-slate-400 hover:text-slate-600"
              >
                Cancelar
              </button>
            </div>

            <form onSubmit={handleSavePreset} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  label="Título do Preset *"
                  placeholder="Ex: Follow-up de Proposta (3 dias)"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  required
                />

                <Select
                  label="Categoria"
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value as any)}
                >
                  <option value="propostas">Propostas & Orçamentos</option>
                  <option value="cobranca">Cobrança & Financeiro</option>
                  <option value="escopo">Escopo & Scope Creep</option>
                  <option value="vendas">Vendas & Recorrência</option>
                  <option value="tecnico">Técnico & Homologação</option>
                  <option value="geral">Geral & Onboarding</option>
                </Select>
              </div>

              <Input
                label="Descrição Breve"
                placeholder="Ex: Mensagem consultiva no WhatsApp sem soar agressivo..."
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
              />

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Texto do Prompt / Instrução para a IA *
                </label>
                <textarea
                  rows={4}
                  value={formPrompt}
                  onChange={(e) => setFormPrompt(e.target.value)}
                  placeholder="Digite aqui o comando ou estrutura que a IA deve executar..."
                  required
                  className="w-full p-3 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => setIsCreating(false)}
                >
                  Voltar
                </Button>
                <Button type="submit" size="sm" variant="primary">
                  {editingPresetId ? 'Atualizar Preset' : 'Salvar Prompt Preset'}
                </Button>
              </div>
            </form>
          </Card>
        ) : (
          /* List of Presets */
          <div className="max-h-96 overflow-y-auto space-y-2.5 pr-1">
            {filteredPresets.length === 0 ? (
              <div className="text-center py-8 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                <Bookmark className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs text-slate-500">Nenhum preset encontrado com os filtros atuais.</p>
              </div>
            ) : (
              filteredPresets.map((preset) => (
                <div
                  key={preset.id}
                  className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all flex flex-col justify-between gap-3 group"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900 dark:text-white">
                          {preset.title}
                        </span>
                        <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                          {preset.category}
                        </span>
                        {preset.isCustom && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 font-semibold border border-amber-300 dark:border-amber-800">
                            Custom
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {preset.description}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {preset.isCustom && (
                        <>
                          <button
                            type="button"
                            onClick={() => handleStartEdit(preset)}
                            className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            title="Editar preset"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeletePreset(preset.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            title="Excluir preset"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}

                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() => {
                          onSelectPreset(preset.prompt);
                          onClose();
                        }}
                        className="text-xs py-1.5 px-3 shadow-xs"
                      >
                        Usar Prompt
                      </Button>
                    </div>
                  </div>

                  <div className="p-2 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-100 dark:border-slate-800/80 text-[11px] text-slate-600 dark:text-slate-300 font-mono line-clamp-2">
                    {preset.prompt}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </Modal>
  );
};
