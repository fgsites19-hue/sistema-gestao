import React, { useState } from 'react';
import {
  Clock,
  CheckCircle2,
  FileText,
  DollarSign,
  FolderKanban,
  User,
  Plus,
  Filter,
  MessageSquare,
  Sparkles,
  Layers,
  ArrowRight,
  Send,
  Eye,
  Activity,
} from 'lucide-react';
import { useDatabase } from '../../context/DatabaseContext';
import { ActivityLog, EntityType } from '../../types';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';

interface EntityActivityTimelineProps {
  entityType: 'projeto' | 'cliente';
  entityId: string;
  entityName: string;
  showAddNote?: boolean;
}

export const EntityActivityTimeline: React.FC<EntityActivityTimelineProps> = ({
  entityType,
  entityId,
  entityName,
  showAddNote = true,
}) => {
  const { activityLogs, logActivity, tasks, installments, files, allTimeLogs, user } = useDatabase();
  const [filterType, setFilterType] = useState<string>('todos');
  const [newNote, setNewNote] = useState('');
  const [isSubmittingNote, setIsSubmittingNote] = useState(false);

  // Collect direct entity logs
  const directLogs = activityLogs.filter(
    (log) => log.entityId === entityId || (log.details && log.details.includes(entityId))
  );

  // Also synthesize related events if needed (like tasks completed for this project/client, files uploaded, etc.)
  const synthesizedEvents: ActivityLog[] = [];

  if (entityType === 'projeto') {
    // Task completions
    tasks
      .filter((t) => t.projectId === entityId && t.status === 'concluido' && t.completedAt)
      .forEach((t) => {
        if (!directLogs.some((l) => l.action.includes(t.title) && l.action.includes('Concluiu'))) {
          synthesizedEvents.push({
            id: 'synth_task_' + t.id,
            userId: user.id,
            userName: user.name,
            action: `Concluiu a entrega / tarefa: "${t.title}"`,
            entityType: 'tarefa',
            entityId,
            details: `Etapa finalizada com sucesso`,
            createdAt: t.completedAt || t.createdAt,
          });
        }
      });

    // File attachments
    files
      .filter((f) => f.projectId === entityId)
      .forEach((f) => {
        if (!directLogs.some((l) => l.entityId === f.id || l.action.includes(f.name))) {
          synthesizedEvents.push({
            id: 'synth_file_' + f.id,
            userId: user.id,
            userName: f.uploadedBy || user.name,
            action: `Anexou o arquivo "${f.name}" (${f.category})`,
            entityType: 'arquivo',
            entityId,
            details: `Tamanho: ${f.size}`,
            createdAt: f.createdAt,
          });
        }
      });

    // Time tracking logs
    allTimeLogs
      .filter((tl) => tl.projectId === entityId)
      .forEach((tl) => {
        synthesizedEvents.push({
          id: 'synth_timelog_' + tl.id,
          userId: user.id,
          userName: tl.loggedBy || user.name,
          action: `Registrou ${Math.round(tl.durationSeconds / 60)} min de trabalho em "${tl.taskTitle}"`,
          entityType: 'tarefa',
          entityId,
          details: tl.notes || `Valor gerado: R$ ${tl.costValue.toLocaleString('pt-BR')}`,
          createdAt: tl.createdAt,
        });
      });
  } else if (entityType === 'cliente') {
    // Files for this client
    files
      .filter((f) => f.clientId === entityId)
      .forEach((f) => {
        if (!directLogs.some((l) => l.entityId === f.id || l.action.includes(f.name))) {
          synthesizedEvents.push({
            id: 'synth_file_' + f.id,
            userId: user.id,
            userName: f.uploadedBy || user.name,
            action: `Adicionou o arquivo "${f.name}" à pasta do cliente`,
            entityType: 'arquivo',
            entityId,
            details: `Tamanho: ${f.size}`,
            createdAt: f.createdAt,
          });
        }
      });
  }

  // Combine and sort descending
  const combinedLogs = [...directLogs, ...synthesizedEvents].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const filteredLogs = combinedLogs.filter((log) => {
    if (filterType === 'todos') return true;
    if (filterType === 'portal') return log.entityType === 'portal' || log.action.toLowerCase().includes('portal') || log.action.toLowerCase().includes('cliente acessou');
    if (filterType === 'tarefas') return log.entityType === 'tarefa' || log.action.toLowerCase().includes('tarefa');
    if (filterType === 'financeiro') return log.entityType === 'financeiro' || log.action.toLowerCase().includes('parcela') || log.action.toLowerCase().includes('recebimento');
    if (filterType === 'arquivos') return log.entityType === 'arquivo' || log.action.toLowerCase().includes('arquivo');
    if (filterType === 'notas') return log.action.toLowerCase().includes('nota') || log.action.toLowerCase().includes('alinhamento') || log.action.toLowerCase().includes('reunião');
    return true;
  });

  const handleAddNoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;

    setIsSubmittingNote(true);
    logActivity(`Anotação de Alinhamento: ${newNote.trim()}`, entityType, entityId, `Registrado por ${user.name}`);
    setNewNote('');
    setIsSubmittingNote(false);
  };

  const getLogIcon = (log: ActivityLog) => {
    const text = log.action.toLowerCase();
    if (log.entityType === 'portal' || text.includes('portal') || text.includes('acessou') || text.includes('visualizou')) {
      return <Eye className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />;
    }
    if (text.includes('concluiu') || text.includes('entregou') || text.includes('finalizou')) {
      return <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />;
    }
    if (text.includes('financeiro') || text.includes('pago') || text.includes('parcela') || text.includes('recebeu')) {
      return <DollarSign className="w-4 h-4 text-emerald-500" />;
    }
    if (text.includes('arquivo') || text.includes('upload')) {
      return <FileText className="w-4 h-4 text-indigo-500" />;
    }
    if (text.includes('tarefa') || text.includes('trabalho')) {
      return <Layers className="w-4 h-4 text-sky-500" />;
    }
    if (text.includes('anotação') || text.includes('alinhamento') || text.includes('reunião')) {
      return <MessageSquare className="w-4 h-4 text-amber-500" />;
    }
    return <Clock className="w-4 h-4 text-slate-400" />;
  };

  return (
    <div className="space-y-4">
      {/* Top Header & Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Clock className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            Histórico & Registro de Atividades ({filteredLogs.length})
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Linha do tempo cronológica com alterações de status, acessos ao portal do cliente, entregas e notas de alinhamento.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {[
            { id: 'todos', label: 'Todos' },
            { id: 'portal', label: 'Portal / Engajamento' },
            { id: 'tarefas', label: 'Tarefas' },
            { id: 'financeiro', label: 'Financeiro' },
            { id: 'arquivos', label: 'Arquivos' },
            { id: 'notas', label: 'Notas' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setFilterType(item.id)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                filterType === item.id
                  ? 'bg-indigo-600 text-white shadow-2xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Add Quick Activity Note */}
      {showAddNote && (
        <Card padding="sm" className="bg-slate-50/70 dark:bg-slate-850/70 border-dashed">
          <form onSubmit={handleAddNoteSubmit} className="space-y-2">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-indigo-600" />
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Registrar Nota de Alinhamento ou Atualização Manual
              </label>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder={`Ex: Reunião de briefing realizada via Google Meet, cliente aprovou wireframe...`}
                className="flex-1 px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-900 dark:text-white"
              />
              <Button
                type="submit"
                size="sm"
                variant="primary"
                disabled={!newNote.trim() || isSubmittingNote}
                leftIcon={<Send className="w-3.5 h-3.5" />}
                className="text-xs"
              >
                Salvar Nota
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Timeline List */}
      {filteredLogs.length === 0 ? (
        <div className="text-center py-8 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
          <Clock className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
          <p className="text-xs font-medium text-slate-600 dark:text-slate-300">
            Nenhum registro encontrado no histórico
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">
            As alterações de status, acessos ao portal e tarefas concluídas aparecerão aqui automaticamente.
          </p>
        </div>
      ) : (
        <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
          {filteredLogs.map((log) => {
            const dateObj = new Date(log.createdAt);
            const formattedDate = dateObj.toLocaleDateString('pt-BR', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
            });
            const formattedTime = dateObj.toLocaleTimeString('pt-BR', {
              hour: '2-digit',
              minute: '2-digit',
            });

            const isPortal = log.entityType === 'portal' || log.action.toLowerCase().includes('portal');

            return (
              <div key={log.id} className="relative group">
                {/* Timeline Dot */}
                <div
                  className={`absolute -left-6 top-1 w-5 h-5 rounded-full bg-white dark:bg-slate-900 border-2 flex items-center justify-center shadow-xs ${
                    isPortal ? 'border-purple-500 dark:border-purple-400' : 'border-indigo-500 dark:border-indigo-400'
                  }`}
                >
                  <div
                    className={`w-1.5 h-1.5 rounded-full ${
                      isPortal ? 'bg-purple-600 dark:bg-purple-400' : 'bg-indigo-600 dark:bg-indigo-400'
                    }`}
                  />
                </div>

                {/* Event Card */}
                <div
                  className={`p-3 rounded-xl border transition-all space-y-1.5 shadow-2xs ${
                    isPortal
                      ? 'bg-purple-50/40 dark:bg-purple-950/20 border-purple-200/70 dark:border-purple-900/50 hover:border-purple-300'
                      : 'bg-white dark:bg-slate-850 border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div
                        className={`p-1 rounded-md shrink-0 ${
                          isPortal ? 'bg-purple-100 dark:bg-purple-900/60' : 'bg-slate-100 dark:bg-slate-800'
                        }`}
                      >
                        {getLogIcon(log)}
                      </div>
                      <span className="text-xs font-bold text-slate-900 dark:text-white">
                        {log.action}
                      </span>
                    </div>

                    <span className="text-[10px] text-slate-400 font-medium whitespace-nowrap">
                      {formattedDate} às {formattedTime}
                    </span>
                  </div>

                  {log.details && (
                    <p className="text-xs text-slate-600 dark:text-slate-300 pl-7 leading-relaxed bg-white/70 dark:bg-slate-900/60 p-2 rounded-lg mt-1 border border-slate-100 dark:border-slate-800">
                      {log.details}
                    </p>
                  )}

                  <div className="flex items-center justify-between text-[10px] text-slate-400 pl-7 pt-0.5">
                    <span>
                      Registrado por <strong className="text-slate-600 dark:text-slate-300">{log.userName || user.name}</strong>
                    </span>
                    <span
                      className={`uppercase text-[9px] font-semibold tracking-wider px-1.5 py-0.5 rounded ${
                        isPortal
                          ? 'bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                      }`}
                    >
                      {log.entityType}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
