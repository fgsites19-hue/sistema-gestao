import React, { useState, useEffect } from 'react';
import { Play, Square, Clock, Plus, History, Check, X } from 'lucide-react';
import { useDatabase } from '../../context/DatabaseContext';
import { Task } from '../../types';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

interface TaskTimerProps {
  task: Task;
  compact?: boolean;
}

export const formatDuration = (totalSeconds: number): string => {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes.toString().padStart(2, '0')}m ${seconds.toString().padStart(2, '0')}s`;
  }
  return `${minutes.toString().padStart(2, '0')}m ${seconds.toString().padStart(2, '0')}s`;
};

export const TaskTimer: React.FC<TaskTimerProps> = ({ task, compact = false }) => {
  const { startTaskTimer, stopTaskTimer, logTaskManualTime, settings } = useDatabase();
  const [elapsed, setElapsed] = useState<number>(0);
  const [isLogsModalOpen, setIsLogsModalOpen] = useState<boolean>(false);
  const [manualHours, setManualHours] = useState<string>('');
  const [manualMinutes, setManualMinutes] = useState<string>('');
  const [manualNote, setManualNote] = useState<string>('');

  const isRunning = !!task.isTimerRunning;
  const hourlyRate = settings?.defaultHourlyRate || 120;

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isRunning && task.timerStartedAt) {
      const startTime = new Date(task.timerStartedAt).getTime();
      const updateElapsed = () => {
        const now = Date.now();
        const diffSeconds = Math.max(0, Math.floor((now - startTime) / 1000));
        setElapsed(diffSeconds);
      };

      updateElapsed();
      interval = setInterval(updateElapsed, 1000);
    } else {
      setElapsed(0);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, task.timerStartedAt]);

  const totalSeconds = (task.spentSeconds || 0) + (isRunning ? elapsed : 0);
  const estimatedCost = (totalSeconds / 3600) * hourlyRate;

  const handleToggleTimer = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isRunning) {
      stopTaskTimer(task.id, 'Sessão de trabalho finalizada');
    } else {
      startTaskTimer(task.id);
    }
  };

  const handleAddManualTime = (e: React.FormEvent) => {
    e.preventDefault();
    const h = parseFloat(manualHours) || 0;
    const m = parseFloat(manualMinutes) || 0;
    const secondsToAdd = Math.round(h * 3600 + m * 60);

    if (secondsToAdd > 0) {
      logTaskManualTime(task.id, secondsToAdd, manualNote || 'Apontamento manual de horas');
      setManualHours('');
      setManualMinutes('');
      setManualNote('');
    }
  };

  if (compact) {
    return (
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={handleToggleTimer}
          className={`flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-bold transition-all ${
            isRunning
              ? 'bg-rose-500 text-white animate-pulse shadow-xs hover:bg-rose-600'
              : 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900 border border-indigo-200 dark:border-indigo-800'
          }`}
          title={isRunning ? 'Parar cronômetro' : 'Iniciar cronômetro nesta tarefa'}
        >
          {isRunning ? (
            <>
              <Square className="w-2.5 h-2.5 fill-current" />
              <span>{formatDuration(totalSeconds)}</span>
            </>
          ) : (
            <>
              <Play className="w-2.5 h-2.5 fill-current" />
              <span>{task.spentSeconds ? formatDuration(task.spentSeconds) : '00m 00s'}</span>
            </>
          )}
        </button>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setIsLogsModalOpen(true);
          }}
          className="p-1 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400"
          title="Ver histórico de tempo e apontar horas"
        >
          <History className="w-3 h-3" />
        </button>
      </div>
    );
  }

  return (
    <>
      <div
        className={`p-2.5 rounded-xl border transition-all ${
          isRunning
            ? 'bg-rose-50/80 dark:bg-rose-950/30 border-rose-300 dark:border-rose-800 ring-2 ring-rose-500/20'
            : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700'
        }`}
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleToggleTimer}
              className={`p-2 rounded-lg font-bold text-xs flex items-center gap-1.5 transition-all ${
                isRunning
                  ? 'bg-rose-600 text-white hover:bg-rose-700 shadow-xs animate-pulse'
                  : 'bg-indigo-600 text-white hover:bg-indigo-700'
              }`}
              title={isRunning ? 'Pausar cronômetro' : 'Iniciar cronômetro'}
            >
              {isRunning ? (
                <>
                  <Square className="w-3.5 h-3.5 fill-current" />
                  <span>Pausar</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Iniciar</span>
                </>
              )}
            </button>

            <div>
              <div className="flex items-center gap-1.5">
                <Clock className={`w-3.5 h-3.5 ${isRunning ? 'text-rose-600 dark:text-rose-400 animate-spin' : 'text-slate-400'}`} />
                <span className={`text-xs font-mono font-bold ${isRunning ? 'text-rose-600 dark:text-rose-400' : 'text-slate-700 dark:text-slate-200'}`}>
                  {formatDuration(totalSeconds)}
                </span>
              </div>
              <span className="text-[10px] text-slate-400 block mt-0.5">
                R$ {estimatedCost.toFixed(2)} acumulados (@ R$ {hourlyRate}/h)
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsLogsModalOpen(true)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-700/60 transition-colors"
            title="Histórico de tempo & apontamento manual"
          >
            <History className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Time Logs & Manual Tracking Modal */}
      <Modal
        isOpen={isLogsModalOpen}
        onClose={() => setIsLogsModalOpen(false)}
        title={`Histórico de Tempo — ${task.title}`}
        subtitle={`Projeto: ${task.projectName} • Taxa: R$ ${hourlyRate}/hora`}
        maxWidth="md"
      >
        <div className="space-y-4 py-2">
          {/* Summary Box */}
          <div className="p-3.5 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-500 dark:text-slate-400">Tempo Total Dedicado</span>
              <p className="text-base font-bold text-indigo-950 dark:text-indigo-200">
                {formatDuration(totalSeconds)}
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-500 dark:text-slate-400">Custo Operacional Estimado</span>
              <p className="text-base font-bold text-emerald-600 dark:text-emerald-400">
                R$ {estimatedCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>

          {/* Manual Entry Form */}
          <form onSubmit={handleAddManualTime} className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-850 space-y-2.5">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <Plus className="w-3.5 h-3.5 text-indigo-600" />
              Lançamento Manual de Horas
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <Input
                label="Horas"
                type="number"
                min="0"
                step="1"
                placeholder="Ex: 2"
                value={manualHours}
                onChange={(e) => setManualHours(e.target.value)}
              />
              <Input
                label="Minutos"
                type="number"
                min="0"
                max="59"
                step="1"
                placeholder="Ex: 30"
                value={manualMinutes}
                onChange={(e) => setManualMinutes(e.target.value)}
              />
              <div className="col-span-2 sm:col-span-1 flex items-end">
                <Button type="submit" size="sm" variant="primary" className="w-full">
                  Registrar
                </Button>
              </div>
            </div>
            <Input
              label="Descrição / Motivo (opcional)"
              placeholder="Ex: Reunião de alinhamento com o cliente"
              value={manualNote}
              onChange={(e) => setManualNote(e.target.value)}
            />
          </form>

          {/* Logs List */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white">Sessões & Registros Gravados</h4>
            <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
              {task.timeLogs && task.timeLogs.length > 0 ? (
                task.timeLogs.map((log) => (
                  <div
                    key={log.id}
                    className="p-2.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {log.note || 'Sessão de trabalho'}
                      </span>
                      <span className="text-[10px] text-slate-400 block">
                        {new Date(log.startedAt).toLocaleDateString('pt-BR')} às{' '}
                        {new Date(log.startedAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div className="text-right font-mono font-bold text-indigo-600 dark:text-indigo-400">
                      {formatDuration(log.durationSeconds)}
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-4 text-center text-xs text-slate-400">
                  Nenhum registro de tempo individual gravado ainda.
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end pt-2 border-t border-slate-100 dark:border-slate-800">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsLogsModalOpen(false)}>
              Fechar
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};
