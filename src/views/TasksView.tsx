import React, { useState } from 'react';
import {
  CheckSquare,
  Plus,
  Search,
  Trash2,
  Calendar,
  LayoutGrid,
  List,
  GripVertical,
  Archive,
  CheckCircle2,
  X,
  Layers,
  ChevronDown,
} from 'lucide-react';
import { useDatabase } from '../context/DatabaseContext';
import { Task, TaskStatus } from '../types';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Input, Select } from '../components/ui/Input';
import { EmptyState } from '../components/ui/EmptyState';
import { TaskTimer } from '../components/tasks/TaskTimerWidget';

interface TasksViewProps {
  onOpenNewTaskModal: () => void;
  onNavigateTab: (tab: any, entityId?: string) => void;
}

export const TasksView: React.FC<TasksViewProps> = ({
  onOpenNewTaskModal,
}) => {
  const {
    tasks,
    projects,
    updateTaskStatus,
    deleteTask,
    bulkArchiveTasks,
    bulkDeleteTasks,
    bulkUpdateTasksStatus,
  } = useDatabase();

  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState<string>('todos');
  const [selectedPriority, setSelectedPriority] = useState<string>('todos');
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<TaskStatus | null>(null);

  // Bulk Selection State
  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([]);
  const [bulkStatusTarget, setBulkStatusTarget] = useState<TaskStatus | ''>('');
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  const columns: { id: TaskStatus; label: string; color: string; badgeColor: string }[] = [
    { id: 'a_fazer', label: 'A Fazer', color: 'border-slate-400', badgeColor: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300' },
    { id: 'em_andamento', label: 'Em Andamento', color: 'border-blue-500', badgeColor: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300' },
    { id: 'em_revisao', label: 'Em Revisão', color: 'border-amber-500', badgeColor: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' },
    { id: 'concluido', label: 'Concluído', color: 'border-emerald-500', badgeColor: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' },
  ];

  const filteredTasks = tasks.filter((t) => {
    const matchesSearch =
      t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.projectName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesProject = selectedProjectId === 'todos' || t.projectId === selectedProjectId;
    const matchesPriority = selectedPriority === 'todos' || t.priority === selectedPriority;
    return matchesSearch && matchesProject && matchesPriority;
  });

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    setDraggedTaskId(taskId);
    e.dataTransfer.setData('text/plain', taskId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, colId: TaskStatus) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverColumn !== colId) {
      setDragOverColumn(colId);
    }
  };

  const handleDragLeave = () => {
    setDragOverColumn(null);
  };

  const handleDrop = (e: React.DragEvent, colId: TaskStatus) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain') || draggedTaskId;
    if (taskId) {
      updateTaskStatus(taskId, colId);
    }
    setDraggedTaskId(null);
    setDragOverColumn(null);
  };

  // Bulk Selection Helpers
  const toggleTaskSelection = (taskId: string) => {
    setSelectedTaskIds((prev) =>
      prev.includes(taskId) ? prev.filter((id) => id !== taskId) : [...prev, taskId]
    );
  };

  const toggleSelectAll = () => {
    if (selectedTaskIds.length === filteredTasks.length) {
      setSelectedTaskIds([]);
    } else {
      setSelectedTaskIds(filteredTasks.map((t) => t.id));
    }
  };

  const showFeedback = (msg: string) => {
    setActionFeedback(msg);
    setTimeout(() => setActionFeedback(null), 3500);
  };

  const handleBulkStatusChange = (newStatus: TaskStatus) => {
    if (!newStatus || selectedTaskIds.length === 0) return;
    const count = selectedTaskIds.length;
    bulkUpdateTasksStatus(selectedTaskIds, newStatus);
    showFeedback(`${count} tarefas atualizadas para o status "${newStatus.replace('_', ' ')}"!`);
    setSelectedTaskIds([]);
    setBulkStatusTarget('');
  };

  const handleBulkArchive = () => {
    if (selectedTaskIds.length === 0) return;
    const count = selectedTaskIds.length;
    bulkArchiveTasks(selectedTaskIds);
    showFeedback(`${count} tarefas movidas para o arquivo (concluídas)!`);
    setSelectedTaskIds([]);
  };

  const handleBulkDelete = () => {
    if (selectedTaskIds.length === 0) return;
    const count = selectedTaskIds.length;
    if (window.confirm(`Tem certeza que deseja excluir ${count} tarefa(s) selecionada(s)?`)) {
      bulkDeleteTasks(selectedTaskIds);
      showFeedback(`${count} tarefas excluídas permanentemente.`);
      setSelectedTaskIds([]);
    }
  };

  return (
    <div className="space-y-6 relative pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            Gestão de Tarefas & Kanban Operacional
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Organize os afazeres da semana, etapas de design, código, aprovação e controle de horas.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-lg border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setViewMode('kanban')}
              className={`p-1.5 rounded-md text-xs font-medium transition-all ${
                viewMode === 'kanban'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
              title="Visualização Kanban"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-md text-xs font-medium transition-all ${
                viewMode === 'list'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
              title="Visualização em Lista"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          <Button
            variant="primary"
            size="sm"
            onClick={onOpenNewTaskModal}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Nova Tarefa
          </Button>
        </div>
      </div>

      {/* Action Feedback Banner */}
      {actionFeedback && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl flex items-center gap-2 text-xs font-semibold text-emerald-800 dark:text-emerald-300">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{actionFeedback}</span>
        </div>
      )}

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center">
        <div className="flex-1 w-full">
          <Input
            placeholder="Pesquisar tarefas por título ou projeto..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            leftIcon={<Search className="w-4 h-4" />}
          />
        </div>

        <Select
          value={selectedProjectId}
          onChange={(e) => setSelectedProjectId(e.target.value)}
          className="w-full sm:w-56"
        >
          <option value="todos">Todos os Projetos</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </Select>

        <Select
          value={selectedPriority}
          onChange={(e) => setSelectedPriority(e.target.value)}
          className="w-full sm:w-40"
        >
          <option value="todos">Todas as Prioridades</option>
          <option value="urgente">Urgente</option>
          <option value="alta">Alta</option>
          <option value="media">Média</option>
          <option value="baixa">Baixa</option>
        </Select>

        {filteredTasks.length > 0 && (
          <button
            onClick={toggleSelectAll}
            className="text-xs text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 px-2 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg whitespace-nowrap bg-white dark:bg-slate-800"
          >
            {selectedTaskIds.length === filteredTasks.length ? 'Desmarcar Todos' : 'Selecionar Todos'}
          </button>
        )}
      </div>

      {/* Empty State or View */}
      {filteredTasks.length === 0 ? (
        <Card padding="lg" className="border-dashed">
          <EmptyState
            variant="tasks"
            title={tasks.length === 0 ? 'Nenhuma tarefa cadastrada' : 'Nenhuma tarefa encontrada'}
            description={
              tasks.length === 0
                ? 'Organize sua rotina diária de desenvolvimento criando tarefas vinculadas a projetos com prazos, prioridades e cronômetro de horas.'
                : 'Não encontramos nenhuma tarefa com os filtros e termos de busca selecionados.'
            }
            actionText="Criar Nova Tarefa"
            onAction={onOpenNewTaskModal}
          />
        </Card>
      ) : viewMode === 'kanban' ? (
        /* KANBAN VIEW with DRAG AND DROP & BULK CHECKBOXES */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {columns.map((col) => {
            const colTasks = filteredTasks.filter((t) => t.status === col.id);
            const isTarget = dragOverColumn === col.id;

            return (
              <div
                key={col.id}
                onDragOver={(e) => handleDragOver(e, col.id)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, col.id)}
                className={`rounded-2xl p-3.5 flex flex-col border transition-all min-h-[450px] ${
                  isTarget
                    ? 'bg-indigo-50/70 dark:bg-indigo-950/40 border-indigo-400 dark:border-indigo-600 ring-2 ring-indigo-400/30'
                    : 'bg-slate-100/70 dark:bg-slate-900/60 border-slate-200/80 dark:border-slate-800'
                }`}
              >
                {/* Column Header */}
                <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-slate-200/80 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-2.5 h-2.5 rounded-full ${
                        col.id === 'a_fazer'
                          ? 'bg-slate-400'
                          : col.id === 'em_andamento'
                          ? 'bg-blue-500'
                          : col.id === 'em_revisao'
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                      }`}
                    />
                    <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                      {col.label}
                    </h3>
                  </div>
                  <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${col.badgeColor}`}>
                    {colTasks.length}
                  </span>
                </div>

                {/* Task Cards */}
                <div className="space-y-3 flex-1">
                  {colTasks.map((task) => {
                    const isSelected = selectedTaskIds.includes(task.id);
                    return (
                      <div
                        key={task.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, task.id)}
                        className={`p-3 bg-white dark:bg-slate-850 rounded-xl border transition-all space-y-2.5 cursor-grab active:cursor-grabbing ${
                          isSelected
                            ? 'border-indigo-500 ring-2 ring-indigo-500/30 bg-indigo-50/30 dark:bg-indigo-950/30'
                            : 'border-slate-200/90 dark:border-slate-750 shadow-2xs hover:shadow-md'
                        } ${task.isTimerRunning ? 'ring-2 ring-rose-500/40 border-rose-300 dark:border-rose-800' : ''} ${
                          draggedTaskId === task.id ? 'opacity-40 scale-95' : ''
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-start gap-2 flex-1">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleTaskSelection(task.id)}
                              className="mt-0.5 w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer shrink-0"
                            />
                            <div className="flex items-start gap-1 flex-1">
                              <GripVertical className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600 mt-0.5 shrink-0" />
                              <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                                {task.title}
                              </h4>
                            </div>
                          </div>
                          <Badge status={task.priority} size="sm" />
                        </div>

                        <p className="text-[11px] font-medium text-indigo-600 dark:text-indigo-400 truncate pl-6">
                          📁 {task.projectName}
                        </p>

                        {task.description && (
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 pl-6">
                            {task.description}
                          </p>
                        )}

                        {/* Integrated Task Timer Widget */}
                        <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                          <TaskTimer task={task} />
                        </div>

                        <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                          <span className="flex items-center gap-1 text-[10px]">
                            <Calendar className="w-3 h-3 text-slate-400" />
                            {new Date(task.deadline).toLocaleDateString('pt-BR')}
                          </span>

                          <div className="flex items-center gap-1">
                            <select
                              value={task.status}
                              onChange={(e) => updateTaskStatus(task.id, e.target.value as TaskStatus)}
                              className="text-[10px] bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded py-0.5 px-1 text-slate-600 dark:text-slate-300"
                            >
                              <option value="a_fazer">A Fazer</option>
                              <option value="em_andamento">Em Andamento</option>
                              <option value="em_revisao">Em Revisão</option>
                              <option value="concluido">Concluído</option>
                            </select>

                            <button
                              onClick={() => deleteTask(task.id)}
                              className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                              title="Excluir tarefa"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {colTasks.length === 0 && (
                    <div className="h-28 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl flex items-center justify-center text-[11px] text-slate-400">
                      Arraste tarefas para cá
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* LIST VIEW with BULK CHECKBOXES */
        <Card padding="none" className="overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold uppercase">
              <tr>
                <th className="py-3 px-4 w-8">
                  <input
                    type="checkbox"
                    checked={filteredTasks.length > 0 && selectedTaskIds.length === filteredTasks.length}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                  />
                </th>
                <th className="py-3 px-4">Tarefa</th>
                <th className="py-3 px-4">Projeto</th>
                <th className="py-3 px-4">Cronômetro / Tempo</th>
                <th className="py-3 px-4">Prazo</th>
                <th className="py-3 px-4">Prioridade</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredTasks.map((task) => {
                const isSelected = selectedTaskIds.includes(task.id);
                return (
                  <tr
                    key={task.id}
                    className={`hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors ${
                      isSelected
                        ? 'bg-indigo-50/40 dark:bg-indigo-950/30'
                        : task.isTimerRunning
                        ? 'bg-rose-50/40 dark:bg-rose-950/20'
                        : ''
                    }`}
                  >
                    <td className="py-3 px-4">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleTaskSelection(task.id)}
                        className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                      />
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">
                      {task.title}
                    </td>
                    <td className="py-3 px-4 text-indigo-600 dark:text-indigo-400 font-medium">
                      {task.projectName}
                    </td>
                    <td className="py-3 px-4">
                      <TaskTimer task={task} compact />
                    </td>
                    <td className="py-3 px-4 text-slate-500 dark:text-slate-400">
                      {new Date(task.deadline).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="py-3 px-4">
                      <Badge status={task.priority} size="sm" />
                    </td>
                    <td className="py-3 px-4">
                      <select
                        value={task.status}
                        onChange={(e) => updateTaskStatus(task.id, e.target.value as TaskStatus)}
                        className="text-xs bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded py-1 px-2 text-slate-700 dark:text-slate-200"
                      >
                        <option value="a_fazer">A Fazer</option>
                        <option value="em_andamento">Em Andamento</option>
                        <option value="em_revisao">Em Revisão</option>
                        <option value="concluido">Concluído</option>
                      </select>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => deleteTask(task.id)}
                        className="p-1 text-slate-400 hover:text-rose-600"
                        title="Excluir tarefa"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>
      )}

      {/* FLOATING HIDDEN TOOLBAR FOR BATCH ACTIONS */}
      {selectedTaskIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white rounded-2xl shadow-2xl border border-slate-750 p-2.5 sm:px-4 sm:py-3 flex items-center gap-3 backdrop-blur-md animate-fadeIn">
          <div className="flex items-center gap-2 pr-2 border-r border-slate-700">
            <span className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center">
              {selectedTaskIds.length}
            </span>
            <span className="text-xs font-semibold whitespace-nowrap hidden sm:inline">
              {selectedTaskIds.length === 1 ? 'tarefa selecionada' : 'tarefas selecionadas'}
            </span>
          </div>

          {/* Bulk Status Select */}
          <div className="flex items-center gap-1.5">
            <select
              value={bulkStatusTarget}
              onChange={(e) => handleBulkStatusChange(e.target.value as TaskStatus)}
              className="text-xs bg-slate-800 border border-slate-700 text-white rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="">Alterar Status...</option>
              <option value="a_fazer">Mover para: A Fazer</option>
              <option value="em_andamento">Mover para: Em Andamento</option>
              <option value="em_revisao">Mover para: Em Revisão</option>
              <option value="concluido">Mover para: Concluído</option>
            </select>
          </div>

          {/* Move to Archive */}
          <Button
            size="sm"
            variant="outline"
            onClick={handleBulkArchive}
            leftIcon={<Archive className="w-3.5 h-3.5" />}
            className="text-xs bg-slate-800 text-white hover:bg-slate-700 border-slate-700 whitespace-nowrap"
          >
            Mover para Arquivo
          </Button>

          {/* Delete Selected */}
          <Button
            size="sm"
            variant="danger"
            onClick={handleBulkDelete}
            leftIcon={<Trash2 className="w-3.5 h-3.5" />}
            className="text-xs whitespace-nowrap"
          >
            Excluir
          </Button>

          {/* Clear Selection */}
          <button
            onClick={() => setSelectedTaskIds([])}
            className="p-1 text-slate-400 hover:text-white rounded-md transition-colors ml-1"
            title="Desmarcar todas"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
