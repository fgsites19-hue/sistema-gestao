import React, { useState, useEffect } from 'react';
import { Play, Square, Clock, ArrowUpRight } from 'lucide-react';
import { useDatabase } from '../../context/DatabaseContext';
import { formatDuration } from './TaskTimerWidget';

interface ActiveTimerBannerProps {
  onNavigateTab?: (tab: any, entityId?: string) => void;
}

export const ActiveTimerBanner: React.FC<ActiveTimerBannerProps> = ({ onNavigateTab }) => {
  const { tasks, stopTaskTimer, settings } = useDatabase();
  const [elapsed, setElapsed] = useState<number>(0);

  const activeTask = tasks.find((t) => t.isTimerRunning);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (activeTask && activeTask.timerStartedAt) {
      const startTime = new Date(activeTask.timerStartedAt).getTime();
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
  }, [activeTask?.id, activeTask?.timerStartedAt]);

  if (!activeTask) return null;

  const totalCurrentSeconds = (activeTask.spentSeconds || 0) + elapsed;
  const hourlyRate = settings?.defaultHourlyRate || 120;
  const currentCost = (totalCurrentSeconds / 3600) * hourlyRate;

  return (
    <div className="bg-rose-600 text-white px-4 py-2 rounded-xl shadow-lg border border-rose-500/50 flex flex-wrap items-center justify-between gap-3 animate-in slide-in-from-top duration-300">
      <div className="flex items-center gap-3">
        <span className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
        </span>

        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-rose-100" />
          <span className="text-xs font-semibold text-rose-100">Cronômetro Ativo:</span>
          <span className="text-xs font-bold text-white max-w-[200px] sm:max-w-xs truncate">
            {activeTask.title}
          </span>
          <span className="text-[11px] text-rose-200 hidden md:inline">
            ({activeTask.projectName})
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3 ml-auto">
        <div className="text-right font-mono font-bold text-sm tracking-wide bg-rose-700/60 px-2.5 py-1 rounded-lg border border-rose-400/30">
          {formatDuration(totalCurrentSeconds)}
        </div>

        <span className="text-xs text-rose-100 hidden sm:inline">
          ~ R$ {currentCost.toFixed(2)}
        </span>

        <button
          onClick={() => stopTaskTimer(activeTask.id, 'Sessão finalizada pelo banner')}
          className="flex items-center gap-1.5 px-3 py-1 bg-white text-rose-700 hover:bg-rose-50 rounded-lg text-xs font-bold transition-all shadow-xs"
        >
          <Square className="w-3 h-3 fill-current" />
          Parar
        </button>

        {onNavigateTab && (
          <button
            onClick={() => onNavigateTab('tarefas')}
            className="p-1 text-rose-200 hover:text-white"
            title="Ir para o Kanban de tarefas"
          >
            <ArrowUpRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};
