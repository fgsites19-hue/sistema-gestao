import React from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input, Select, Textarea } from '../ui/Input';
import { DraftIndicator } from '../ui/DraftIndicator';
import { useDatabase } from '../../context/DatabaseContext';
import { useFormDraft } from '../../hooks/useFormDraft';
import { TaskStatus, Priority } from '../../types';

interface NewTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultProjectId?: string;
}

export const NewTaskModal: React.FC<NewTaskModalProps> = ({
  isOpen,
  onClose,
  defaultProjectId,
}) => {
  const { projects, addTask, triggerCelebration } = useDatabase();

  const initialDraftValues = {
    projectId: defaultProjectId || projects[0]?.id || '',
    title: '',
    description: '',
    priority: 'media' as Priority,
    status: 'a_fazer' as TaskStatus,
    deadline: new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0],
    estimatedHours: 4,
  };

  const {
    formData,
    updateField,
    clearDraft,
    hasSavedDraft,
  } = useFormDraft('draft_new_task_modal', initialDraftValues, isOpen);

  const {
    projectId,
    title,
    description,
    priority,
    status,
    deadline,
    estimatedHours,
  } = formData;

  const selectedProject = projects.find((p) => p.id === projectId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    addTask({
      projectId,
      projectName: selectedProject?.name || 'Projeto Geral',
      clientId: selectedProject?.clientId || '',
      clientName: selectedProject?.clientName || 'Cliente',
      title,
      description,
      priority,
      status,
      deadline,
      estimatedHours: Number(estimatedHours),
    });

    clearDraft();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Nova Tarefa Operacional"
      subtitle="Defina o escopo da tarefa, projeto associado, prioridade e data limite."
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-3.5 py-2">
        <Select
          label="Projeto Vinculado"
          value={projectId}
          onChange={(e) => updateField('projectId', e.target.value)}
          required
        >
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name} ({p.clientName})
            </option>
          ))}
        </Select>

        <Input
          label="Título da Tarefa"
          placeholder="Ex: Desenvolver versão Mobile da página de Checkout"
          value={title}
          onChange={(e) => updateField('title', e.target.value)}
          required
        />

        <div className="grid grid-cols-2 gap-3">
          <Select
            label="Prioridade"
            value={priority}
            onChange={(e) => updateField('priority', e.target.value as Priority)}
          >
            <option value="baixa">Baixa</option>
            <option value="media">Média</option>
            <option value="alta">Alta</option>
            <option value="urgente">Urgente</option>
          </Select>

          <Select
            label="Status Inicial"
            value={status}
            onChange={(e) => updateField('status', e.target.value as TaskStatus)}
          >
            <option value="a_fazer">A Fazer</option>
            <option value="em_andamento">Em Andamento</option>
            <option value="em_revisao">Em Revisão</option>
            <option value="concluido">Concluído</option>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Data Limite (Prazo)"
            type="date"
            value={deadline}
            onChange={(e) => updateField('deadline', e.target.value)}
            required
          />
          <Input
            label="Horas Estimadas"
            type="number"
            value={estimatedHours}
            onChange={(e) => updateField('estimatedHours', Number(e.target.value))}
          />
        </div>

        <Textarea
          label="Detalhes / Checklist da Tarefa"
          placeholder="Descreva os requisitos técnicos, links úteis ou passos para validação..."
          value={description}
          onChange={(e) => updateField('description', e.target.value)}
          rows={3}
        />

        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
          <DraftIndicator hasDraft={hasSavedDraft} onClearDraft={clearDraft} />
          <div className="flex items-center gap-2">
            <Button type="button" variant="outline" size="sm" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Criar Tarefa
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
};
