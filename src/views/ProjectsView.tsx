import React, { useState } from 'react';
import {
  FolderKanban,
  Plus,
  Search,
  ArrowLeft,
  Calendar,
  CheckSquare,
  FileSignature,
  FolderArchive,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  Trash2,
  LayoutGrid,
  List,
  GripVertical,
  Eye,
  Archive,
  X,
} from 'lucide-react';
import { useDatabase } from '../context/DatabaseContext';
import { ProjectStatus, TaskStatus } from '../types';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Input, Select } from '../components/ui/Input';
import { Tabs } from '../components/ui/Tabs';
import { EmptyState } from '../components/ui/EmptyState';
import { TaskTimer } from '../components/tasks/TaskTimerWidget';
import { ClientPortalView } from '../components/projects/ClientPortalView';
import { EntityActivityTimeline } from '../components/activity/EntityActivityTimeline';

interface ProjectsViewProps {
  onOpenNewProjectWizard: () => void;
  onOpenNewTaskModal: (projectId?: string) => void;
  onNavigateTab: (tab: any, entityId?: string) => void;
  selectedProjectId?: string | null;
  onSelectProject: (id: string | null) => void;
}

export const ProjectsView: React.FC<ProjectsViewProps> = ({
  onOpenNewProjectWizard,
  onOpenNewTaskModal,
  onNavigateTab,
  selectedProjectId,
  onSelectProject,
}) => {
  const {
    projects,
    tasks,
    installments,
    contracts,
    files,
    activityLogs,
    updateProject,
    updateProjectStatus,
    updateTaskStatus,
    markInstallmentPaid,
    deleteProject,
    deleteTask,
    bulkArchiveProjects,
    bulkDeleteProjects,
    bulkUpdateProjectsStatus,
  } = useDatabase();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('todos');
  const [projectTab, setProjectTab] = useState<'overview' | 'tasks' | 'finance' | 'contract' | 'files' | 'timeline'>('overview');
  const [taskViewMode, setTaskViewMode] = useState<'kanban' | 'list'>('kanban');
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [dragOverCol, setDragOverCol] = useState<TaskStatus | null>(null);
  const [isClientMode, setIsClientMode] = useState(false);

  // Bulk Selection State
  const [selectedProjectIds, setSelectedProjectIds] = useState<string[]>([]);
  const [bulkStatusTarget, setBulkStatusTarget] = useState<ProjectStatus | ''>('');
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  const selectedProject = projects.find((p) => p.id === selectedProjectId);

  const kanbanColumns: { id: TaskStatus; label: string; badgeColor: string }[] = [
    { id: 'a_fazer', label: 'A Fazer', badgeColor: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300' },
    { id: 'em_andamento', label: 'Em Andamento', badgeColor: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300' },
    { id: 'em_revisao', label: 'Em Revisão', badgeColor: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' },
    { id: 'concluido', label: 'Concluído', badgeColor: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' },
  ];

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    setDraggedTaskId(taskId);
    e.dataTransfer.setData('text/plain', taskId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, colId: TaskStatus) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverCol !== colId) {
      setDragOverCol(colId);
    }
  };

  const handleDragLeave = () => {
    setDragOverCol(null);
  };

  const handleDrop = (e: React.DragEvent, colId: TaskStatus) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain') || draggedTaskId;
    if (taskId) {
      updateTaskStatus(taskId, colId);
    }
    setDraggedTaskId(null);
    setDragOverCol(null);
  };

  const filteredProjects = projects.filter((project) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      project.name.toLowerCase().includes(term) ||
      project.clientName.toLowerCase().includes(term) ||
      project.type.toLowerCase().includes(term);

    const matchesStatus =
      statusFilter === 'todos' ||
      (statusFilter === 'em_andamento'
        ? project.status !== 'entregue' && project.status !== 'cancelado'
        : project.status === statusFilter);

    return matchesSearch && matchesStatus;
  });

  // INNER PROJECT DETAIL 360° VIEW
  if (selectedProject) {
    const projectTasks = tasks.filter((t) => t.projectId === selectedProject.id);
    const projectInstallments = installments.filter((i) => i.projectId === selectedProject.id);
    const projectContract = contracts.find((c) => c.projectId === selectedProject.id || c.id === selectedProject.contractId);
    const projectFiles = files.filter((f) => f.projectId === selectedProject.id);
    const projectLogs = activityLogs.filter((l) => l.entityId === selectedProject.id);

    const totalPaid = projectInstallments
      .filter((i) => i.status === 'pago')
      .reduce((acc, i) => acc + i.value, 0);

    const totalPending = projectInstallments
      .filter((i) => i.status !== 'pago')
      .reduce((acc, i) => acc + i.value, 0);

    const completedTasksCount = projectTasks.filter((t) => t.status === 'concluido').length;

    if (isClientMode) {
      return (
        <ClientPortalView
          project={selectedProject}
          onExitClientMode={() => setIsClientMode(false)}
        />
      );
    }

    return (
      <div className="space-y-6">
        {/* Detail Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onSelectProject(null)}
              leftIcon={<ArrowLeft className="w-4 h-4" />}
            >
              Voltar aos Projetos
            </Button>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  {selectedProject.name}
                </h2>
                <Badge status={selectedProject.status} size="sm" />
                <Badge status={selectedProject.priority} size="sm" />
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Cliente: <button onClick={() => onNavigateTab('clientes', selectedProject.clientId)} className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">{selectedProject.clientName}</button> • Categoria: {selectedProject.type}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsClientMode(true)}
              leftIcon={<Eye className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />}
              className="text-xs"
            >
              Visão do Cliente (Read-Only)
            </Button>

            <Button
              variant="primary"
              size="sm"
              onClick={() => onOpenNewTaskModal(selectedProject.id)}
              leftIcon={<Plus className="w-4 h-4" />}
            >
              Nova Tarefa
            </Button>
          </div>
        </div>

        {/* Project KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <Card padding="sm">
            <p className="text-[11px] font-semibold text-slate-500 uppercase">Valor do Projeto</p>
            <p className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
              R$ {selectedProject.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
            <span className="text-[11px] text-emerald-600 font-medium">Pago: R$ {totalPaid.toLocaleString('pt-BR')}</span>
          </Card>

          <Card padding="sm">
            <p className="text-[11px] font-semibold text-slate-500 uppercase">Progresso Operacional</p>
            <p className="text-lg font-bold text-indigo-600 dark:text-indigo-400 mt-0.5">
              {selectedProject.progress}%
            </p>
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full mt-1.5 overflow-hidden">
              <div className="bg-indigo-600 h-full rounded-full" style={{ width: `${selectedProject.progress}%` }} />
            </div>
          </Card>

          <Card padding="sm">
            <p className="text-[11px] font-semibold text-slate-500 uppercase">Prazo de Entrega</p>
            <p className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
              {new Date(selectedProject.deadline).toLocaleDateString('pt-BR')}
            </p>
            <span className="text-[11px] text-slate-400">
              Início: {new Date(selectedProject.startDate).toLocaleDateString('pt-BR')}
            </span>
          </Card>

          <Card padding="sm">
            <p className="text-[11px] font-semibold text-slate-500 uppercase">Tarefas Concluídas</p>
            <p className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
              {completedTasksCount} / {projectTasks.length}
            </p>
            <span className="text-[11px] text-slate-400">
              {projectTasks.length - completedTasksCount} pendentes
            </span>
          </Card>
        </div>

        {/* Project Inner Tabs */}
        <Tabs
          activeTab={projectTab}
          onChange={(id) => setProjectTab(id as any)}
          tabs={[
            { id: 'overview', label: 'Visão Geral & Links' },
            { id: 'tasks', label: 'Quadro de Tarefas (Kanban)', count: projectTasks.length },
            { id: 'finance', label: 'Financeiro / Parcelas', count: projectInstallments.length },
            { id: 'contract', label: 'Contrato', count: projectContract ? 1 : 0 },
            { id: 'files', label: 'Arquivos & Entregáveis', count: projectFiles.length },
            { id: 'timeline', label: 'Histórico' },
          ]}
        />

        {/* TAB 1: OVERVIEW */}
        {projectTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card padding="md" className="lg:col-span-2 space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Resumo e Links Úteis
              </h3>

              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-slate-400 block mb-1">Descrição do Escopo:</span>
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/60 p-3 rounded-lg">
                    {selectedProject.description || 'Sem descrição cadastrada.'}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div>
                    <span className="text-slate-400 block mb-1">Link do Figma / Layout:</span>
                    {selectedProject.figmaUrl ? (
                      <a href={selectedProject.figmaUrl} target="_blank" rel="noreferrer" className="text-indigo-600 dark:text-indigo-400 font-medium hover:underline flex items-center gap-1">
                        <ExternalLink className="w-3.5 h-3.5" /> {selectedProject.figmaUrl}
                      </a>
                    ) : (
                      <span className="text-slate-400">Não informado</span>
                    )}
                  </div>

                  <div>
                    <span className="text-slate-400 block mb-1">Link de Homologação / Staging:</span>
                    {selectedProject.stagingUrl ? (
                      <a href={selectedProject.stagingUrl} target="_blank" rel="noreferrer" className="text-indigo-600 dark:text-indigo-400 font-medium hover:underline flex items-center gap-1">
                        <ExternalLink className="w-3.5 h-3.5" /> {selectedProject.stagingUrl}
                      </a>
                    ) : (
                      <span className="text-slate-400">Não informado</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Progress Slider updater */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Ajustar Percentual de Conclusão: <strong>{selectedProject.progress}%</strong>
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={selectedProject.progress}
                  onChange={(e) => updateProject(selectedProject.id, { progress: Number(e.target.value) })}
                  className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
              </div>
            </Card>

            <Card padding="md" className="space-y-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Ações Rápidas
              </h3>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start text-xs"
                onClick={() => updateProjectStatus(selectedProject.id, 'entregue')}
                leftIcon={<CheckCircle2 className="w-4 h-4 text-emerald-600" />}
              >
                Marcar Projeto como Entregue
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start text-xs text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                onClick={() => {
                  if (confirm('Deseja realmente excluir este projeto?')) {
                    deleteProject(selectedProject.id);
                    onSelectProject(null);
                  }
                }}
                leftIcon={<Trash2 className="w-4 h-4" />}
              >
                Excluir Projeto
              </Button>
            </Card>
          </div>
        )}

        {/* TAB 2: TASKS with KANBAN DRAG & DROP */}
        {projectTab === 'tasks' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Tarefas & Fluxo de Entregas</h3>
                <p className="text-xs text-slate-500">Arraste os cartões entre as colunas para atualizar a etapa.</p>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-lg border border-slate-200 dark:border-slate-700">
                  <button
                    onClick={() => setTaskViewMode('kanban')}
                    className={`p-1.5 rounded-md text-xs font-medium transition-all ${
                      taskViewMode === 'kanban'
                        ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-2xs'
                        : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
                    }`}
                    title="Modo Kanban"
                  >
                    <LayoutGrid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setTaskViewMode('list')}
                    className={`p-1.5 rounded-md text-xs font-medium transition-all ${
                      taskViewMode === 'list'
                        ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-2xs'
                        : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
                    }`}
                    title="Modo Lista"
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>

                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => onOpenNewTaskModal(selectedProject.id)}
                  leftIcon={<Plus className="w-3.5 h-3.5" />}
                >
                  Adicionar Tarefa
                </Button>
              </div>
            </div>

            {projectTasks.length === 0 ? (
              <EmptyState
                variant="tasks"
                title="Nenhuma tarefa criada"
                description="Cadastre as etapas de criação, design, desenvolvimento e homologação para este projeto."
                actionText="Criar Primeira Tarefa"
                onAction={() => onOpenNewTaskModal(selectedProject.id)}
              />
            ) : taskViewMode === 'kanban' ? (
              /* KANBAN BOARD */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {kanbanColumns.map((col) => {
                  const colTasks = projectTasks.filter((t) => t.status === col.id);
                  const isTarget = dragOverCol === col.id;

                  return (
                    <div
                      key={col.id}
                      onDragOver={(e) => handleDragOver(e, col.id)}
                      onDragLeave={handleDragLeave}
                      onDrop={(e) => handleDrop(e, col.id)}
                      className={`rounded-2xl p-3.5 flex flex-col border min-h-[380px] transition-all ${
                        isTarget
                          ? 'bg-indigo-50/70 dark:bg-indigo-950/40 border-indigo-400 dark:border-indigo-600 ring-2 ring-indigo-400/30'
                          : 'bg-slate-100/70 dark:bg-slate-900/60 border-slate-200/80 dark:border-slate-800'
                      }`}
                    >
                      <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-slate-200/80 dark:border-slate-800">
                        <div className="flex items-center gap-2">
                          <div className={`w-2.5 h-2.5 rounded-full ${
                            col.id === 'a_fazer' ? 'bg-slate-400' :
                            col.id === 'em_andamento' ? 'bg-blue-500' :
                            col.id === 'em_revisao' ? 'bg-amber-500' : 'bg-emerald-500'
                          }`} />
                          <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                            {col.label}
                          </h4>
                        </div>
                        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${col.badgeColor}`}>
                          {colTasks.length}
                        </span>
                      </div>

                      <div className="space-y-2.5 flex-1">
                        {colTasks.map((t) => (
                          <div
                            key={t.id}
                            draggable
                            onDragStart={(e) => handleDragStart(e, t.id)}
                            className={`p-3 bg-white dark:bg-slate-850 rounded-xl border border-slate-200/90 dark:border-slate-750 shadow-2xs hover:shadow-md transition-all space-y-2 cursor-grab active:cursor-grabbing ${
                              t.isTimerRunning ? 'ring-2 ring-rose-500/40 border-rose-300 dark:border-rose-800' : ''
                            } ${draggedTaskId === t.id ? 'opacity-40 scale-95' : ''}`}
                          >
                            <div className="flex items-start justify-between gap-1.5">
                              <div className="flex items-start gap-1.5 flex-1">
                                <GripVertical className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600 mt-0.5 shrink-0" />
                                <h5 className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                                  {t.title}
                                </h5>
                              </div>
                              <Badge status={t.priority} size="sm" />
                            </div>

                            {t.description && (
                              <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 pl-5">
                                {t.description}
                              </p>
                            )}

                            {/* Task Timer Widget */}
                            <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                              <TaskTimer task={t} />
                            </div>

                            <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3 text-slate-400" />
                                {new Date(t.deadline).toLocaleDateString('pt-BR')}
                              </span>

                              <div className="flex items-center gap-1">
                                <select
                                  value={t.status}
                                  onChange={(e) => updateTaskStatus(t.id, e.target.value as TaskStatus)}
                                  className="text-[10px] bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded py-0.5 px-1 text-slate-600 dark:text-slate-300"
                                >
                                  <option value="a_fazer">A Fazer</option>
                                  <option value="em_andamento">Em Andamento</option>
                                  <option value="em_revisao">Em Revisão</option>
                                  <option value="concluido">Concluído</option>
                                </select>

                                <button
                                  onClick={() => deleteTask(t.id)}
                                  className="p-1 text-slate-400 hover:text-rose-600"
                                  title="Excluir tarefa"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}

                        {colTasks.length === 0 && (
                          <div className="h-24 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl flex items-center justify-center text-[11px] text-slate-400">
                            Arraste para cá
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* LIST VIEW */
              <div className="space-y-2">
                {projectTasks.map((t) => (
                  <Card key={t.id} padding="sm" className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <input
                        type="checkbox"
                        checked={t.status === 'concluido'}
                        onChange={() =>
                          updateTaskStatus(t.id, t.status === 'concluido' ? 'a_fazer' : 'concluido')
                        }
                        className="w-4 h-4 rounded text-indigo-600 cursor-pointer"
                      />
                      <div className="min-w-0">
                        <p className={`text-xs font-semibold ${t.status === 'concluido' ? 'line-through text-slate-400' : 'text-slate-900 dark:text-white'}`}>
                          {t.title}
                        </p>
                        <p className="text-[11px] text-slate-400">Prazo: {new Date(t.deadline).toLocaleDateString('pt-BR')}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <TaskTimer task={t} compact />
                      <Badge status={t.priority} size="sm" />
                      <Badge status={t.status} size="sm" />
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: FINANCE */}
        {projectTab === 'finance' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Parcelas & Faturamento</h3>
                <p className="text-xs text-slate-500">Acompanhe as entradas e baixas financeiras deste projeto.</p>
              </div>
            </div>

            <Card padding="none" className="overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold uppercase">
                  <tr>
                    <th className="py-3 px-4">Parcela</th>
                    <th className="py-3 px-4">Valor</th>
                    <th className="py-3 px-4">Data Vencimento</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {projectInstallments.map((inst) => (
                    <tr key={inst.id}>
                      <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">
                        {inst.installmentNumber}ª Parcela ({inst.installmentNumber}/{inst.totalInstallments})
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                        R$ {inst.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-4 text-slate-500">
                        {new Date(inst.dueDate).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="py-3 px-4">
                        <Badge status={inst.status} size="sm" />
                      </td>
                      <td className="py-3 px-4 text-right">
                        {inst.status !== 'pago' ? (
                          <Button
                            size="sm"
                            variant="emerald"
                            onClick={() => markInstallmentPaid(inst.id)}
                            className="text-[11px] py-1 px-2.5"
                          >
                            Dar Baixa (Pago)
                          </Button>
                        ) : (
                          <span className="text-[11px] text-emerald-600 font-semibold">Liquidado</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          </div>
        )}

        {/* TAB 4: CONTRACT */}
        {projectTab === 'contract' && (
          <div className="space-y-4">
            {projectContract ? (
              <Card padding="md" className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-base text-slate-900 dark:text-white">{projectContract.title}</h4>
                    <p className="text-xs text-slate-500">Status: <Badge status={projectContract.status} size="sm" /></p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onNavigateTab('contratos', projectContract.id)}
                  >
                    Abrir Contrato Completo
                  </Button>
                </div>
                <div className="bg-slate-50 dark:bg-slate-900/80 p-4 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-mono whitespace-pre-wrap max-h-96 overflow-y-auto">
                  {projectContract.content}
                </div>
              </Card>
            ) : (
              <EmptyState
                variant="contracts"
                title="Sem contrato vinculado"
                description="Você pode gerar um contrato formal na aba de Contratos."
              />
            )}
          </div>
        )}

        {/* TAB 5: FILES */}
        {projectTab === 'files' && (
          <div className="space-y-3">
            {projectFiles.length === 0 ? (
              <EmptyState
                variant="files"
                title="Nenhum arquivo enviado"
                description="Faça upload de briefings, logos em vetor, imagens e contratos assinados."
              />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {projectFiles.map((file) => (
                  <Card key={file.id} padding="sm" className="space-y-1">
                    <p className="font-semibold text-xs text-slate-900 dark:text-white truncate">{file.name}</p>
                    <p className="text-[10px] text-slate-400">{file.size} • {file.category}</p>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 6: TIMELINE & ACTIVITY AUDIT LOG */}
        {projectTab === 'timeline' && (
          <EntityActivityTimeline
            entityType="projeto"
            entityId={selectedProject.id}
            entityName={selectedProject.name}
          />
        )}
      </div>
    );
  }

  const toggleProjectSelection = (projectId: string) => {
    setSelectedProjectIds((prev) =>
      prev.includes(projectId) ? prev.filter((id) => id !== projectId) : [...prev, projectId]
    );
  };

  const toggleSelectAllProjects = () => {
    if (selectedProjectIds.length === filteredProjects.length) {
      setSelectedProjectIds([]);
    } else {
      setSelectedProjectIds(filteredProjects.map((p) => p.id));
    }
  };

  const showFeedback = (msg: string) => {
    setActionFeedback(msg);
    setTimeout(() => setActionFeedback(null), 3500);
  };

  const handleBulkStatusChange = (newStatus: ProjectStatus) => {
    if (!newStatus || selectedProjectIds.length === 0) return;
    const count = selectedProjectIds.length;
    bulkUpdateProjectsStatus(selectedProjectIds, newStatus);
    showFeedback(`${count} projetos atualizados para o status "${newStatus}"!`);
    setSelectedProjectIds([]);
    setBulkStatusTarget('');
  };

  const handleBulkArchive = () => {
    if (selectedProjectIds.length === 0) return;
    const count = selectedProjectIds.length;
    bulkArchiveProjects(selectedProjectIds);
    showFeedback(`${count} projetos movidos para o arquivo (pausados)!`);
    setSelectedProjectIds([]);
  };

  const handleBulkDelete = () => {
    if (selectedProjectIds.length === 0) return;
    const count = selectedProjectIds.length;
    if (window.confirm(`Tem certeza que deseja excluir ${count} projeto(s) selecionado(s) e todos os seus vínculos?`)) {
      bulkDeleteProjects(selectedProjectIds);
      showFeedback(`${count} projetos excluídos permanentemente.`);
      setSelectedProjectIds([]);
    }
  };

  // DEFAULT PROJECTS LIST
  return (
    <div className="space-y-6 relative pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FolderKanban className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            Gestão Operacional de Projetos
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Acompanhe prazos, entregas, status de desenvolvimento e pagamentos vinculados.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={onOpenNewProjectWizard}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          Novo Projeto (com Wizard)
        </Button>
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
            placeholder="Pesquisar projetos por nome, cliente ou tipo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            leftIcon={<Search className="w-4 h-4" />}
          />
        </div>

        <Select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-full sm:w-56"
        >
          <option value="todos">Todos os Status</option>
          <option value="em_andamento">Em Andamento (Ativos)</option>
          <option value="planejamento">Planejamento</option>
          <option value="briefing">Briefing</option>
          <option value="design">Design / UI</option>
          <option value="desenvolvimento">Desenvolvimento</option>
          <option value="revisao">Revisão</option>
          <option value="aprovacao">Aprovação</option>
          <option value="finalizacao">Finalização</option>
          <option value="entregue">Entregue / Concluído</option>
          <option value="pausado">Pausado / Arquivado</option>
          <option value="cancelado">Cancelado</option>
        </Select>

        {filteredProjects.length > 0 && (
          <button
            onClick={toggleSelectAllProjects}
            className="text-xs text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 px-2 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg whitespace-nowrap bg-white dark:bg-slate-800"
          >
            {selectedProjectIds.length === filteredProjects.length ? 'Desmarcar Todos' : 'Selecionar Todos'}
          </button>
        )}
      </div>

      {/* Projects Grid or Empty State */}
      {filteredProjects.length === 0 ? (
        <Card padding="lg" className="border-dashed">
          <EmptyState
            variant="projects"
            title={projects.length === 0 ? 'Nenhum projeto cadastrado' : 'Nenhum projeto encontrado'}
            description={
              projects.length === 0
                ? 'Comece criando seu primeiro projeto web (Site institucional, Landing page, E-commerce, etc.) com etapas e controle financeiro integrados.'
                : 'Não encontramos nenhum projeto correspondente aos filtros de pesquisa.'
            }
            actionText="Criar Novo Projeto"
            onAction={onOpenNewProjectWizard}
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProjects.map((project) => {
            const isOverdue = new Date(project.deadline) < new Date() && project.status !== 'entregue';
            const projectTasks = tasks.filter((t) => t.projectId === project.id);
            const doneTasks = projectTasks.filter((t) => t.status === 'concluido').length;
            const isSelected = selectedProjectIds.includes(project.id);

            return (
              <Card
                key={project.id}
                padding="md"
                hover
                onClick={() => onSelectProject(project.id)}
                className={`cursor-pointer space-y-3 group transition-all ${
                  isSelected
                    ? 'border-indigo-500 ring-2 ring-indigo-500/30 bg-indigo-50/20 dark:bg-indigo-950/20'
                    : ''
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2.5 min-w-0">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onClick={(e) => e.stopPropagation()}
                      onChange={() => toggleProjectSelection(project.id)}
                      className="mt-0.5 w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer shrink-0"
                    />
                    <div className="min-w-0">
                      <h3 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate">
                        {project.name}
                      </h3>
                      <p className="text-xs text-slate-500 truncate">
                        Cliente: <strong>{project.clientName}</strong>
                      </p>
                    </div>
                  </div>
                  <Badge status={project.status} size="sm" />
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>
                    Tipo: <strong className="text-slate-700 dark:text-slate-300">{project.type}</strong>
                  </span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    R$ {project.value.toLocaleString('pt-BR')}
                  </span>
                </div>

                {/* Progress */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span>
                      Progresso ({doneTasks}/{projectTasks.length} tarefas)
                    </span>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">{project.progress}%</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-indigo-600 h-full rounded-full" style={{ width: `${project.progress}%` }} />
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                  <span className={`text-[11px] ${isOverdue ? 'text-rose-600 font-bold' : 'text-slate-400'}`}>
                    Prazo: {new Date(project.deadline).toLocaleDateString('pt-BR')}
                  </span>
                  <span className="font-semibold text-indigo-600 dark:text-indigo-400 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform text-[11px]">
                    Ver detalhes <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* FLOATING HIDDEN TOOLBAR FOR BATCH ACTIONS */}
      {selectedProjectIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white rounded-2xl shadow-2xl border border-slate-750 p-2.5 sm:px-4 sm:py-3 flex items-center gap-3 backdrop-blur-md animate-fadeIn">
          <div className="flex items-center gap-2 pr-2 border-r border-slate-700">
            <span className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center">
              {selectedProjectIds.length}
            </span>
            <span className="text-xs font-semibold whitespace-nowrap hidden sm:inline">
              {selectedProjectIds.length === 1 ? 'projeto selecionado' : 'projetos selecionados'}
            </span>
          </div>

          {/* Bulk Status Select */}
          <div className="flex items-center gap-1.5">
            <select
              value={bulkStatusTarget}
              onChange={(e) => handleBulkStatusChange(e.target.value as ProjectStatus)}
              className="text-xs bg-slate-800 border border-slate-700 text-white rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="">Alterar Status...</option>
              <option value="planejamento">Planejamento</option>
              <option value="briefing">Briefing</option>
              <option value="design">Design / UI</option>
              <option value="desenvolvimento">Desenvolvimento</option>
              <option value="revisao">Revisão</option>
              <option value="aprovacao">Aprovação</option>
              <option value="finalizacao">Finalização</option>
              <option value="entregue">Entregue</option>
              <option value="pausado">Pausado</option>
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
            onClick={() => setSelectedProjectIds([])}
            className="p-1 text-slate-400 hover:text-white rounded-md transition-colors ml-1"
            title="Desmarcar todos"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
