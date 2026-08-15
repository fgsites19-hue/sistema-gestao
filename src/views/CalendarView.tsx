import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  Building2,
  FolderKanban,
  CheckSquare,
  DollarSign,
  AlertCircle,
  Video,
  GripVertical,
  CheckCircle2,
  Filter,
} from 'lucide-react';
import { useDatabase } from '../context/DatabaseContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { Input, Select } from '../components/ui/Input';
import { CalendarEvent, EventType } from '../types';

interface CalendarViewProps {
  onNavigateTab: (tab: any, entityId?: string) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({ onNavigateTab }) => {
  const {
    events,
    projects,
    installments,
    tasks,
    clients,
    addEvent,
    updateEvent,
    deleteEvent,
    updateProject,
    updateTask,
    updateInstallment,
    logActivity,
  } = useDatabase();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [filterType, setFilterType] = useState<string>('todos');
  const [isNewEventModalOpen, setIsNewEventModalOpen] = useState(false);

  // Drag and Drop state
  const [draggedItem, setDraggedItem] = useState<{
    id: string;
    source: 'custom' | 'project' | 'installment' | 'task';
    originalId: string;
    title: string;
    date: string;
  } | null>(null);
  const [dragOverDate, setDragOverDate] = useState<string | null>(null);
  const [dropFeedback, setDropFeedback] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<EventType>('reuniao');
  const [eventDate, setEventDate] = useState(new Date().toISOString().split('T')[0]);
  const [eventTime, setEventTime] = useState('14:00');
  const [clientId, setClientId] = useState('');
  const [projectId, setProjectId] = useState('');

  // Month navigation
  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  // Combine manual calendar events + auto-generated project deadlines + task deadlines + installment due dates
  const allEvents: Array<{
    id: string;
    title: string;
    date: string;
    time?: string;
    type: string;
    clientName?: string;
    projectName?: string;
    source: 'custom' | 'project' | 'installment' | 'task';
    originalId: string;
  }> = [
    // Custom events
    ...events.map((e) => ({
      id: e.id,
      title: e.title,
      date: e.date,
      time: e.time,
      type: e.type,
      clientName: e.clientName,
      projectName: e.projectName,
      source: 'custom' as const,
      originalId: e.id,
    })),
    // Project deadlines
    ...projects.map((p) => ({
      id: `proj_dead_${p.id}`,
      title: `Entrega: ${p.name}`,
      date: p.deadline,
      time: '18:00',
      type: 'entrega',
      clientName: p.clientName,
      projectName: p.name,
      source: 'project' as const,
      originalId: p.id,
    })),
    // Installment dues
    ...installments
      .filter((i) => i.status !== 'pago')
      .map((i) => ({
        id: `inst_due_${i.id}`,
        title: `Vencimento: R$ ${i.value.toLocaleString('pt-BR')} (${i.installmentNumber}/${i.totalInstallments})`,
        date: i.dueDate,
        time: '10:00',
        type: 'pagamento',
        clientName: i.clientName,
        projectName: i.projectName,
        source: 'installment' as const,
        originalId: i.id,
      })),
    // High-priority task deadlines
    ...tasks
      .filter((t) => t.status !== 'concluido' && t.deadline)
      .map((t) => ({
        id: `task_dead_${t.id}`,
        title: `Tarefa: ${t.title}`,
        date: t.deadline,
        time: '17:00',
        type: 'tarefa',
        clientName: t.clientName,
        projectName: t.projectName,
        source: 'task' as const,
        originalId: t.id,
      })),
  ];

  const filteredEvents = allEvents.filter((ev) => {
    if (filterType === 'todos') return true;
    return ev.type === filterType;
  });

  // Drag and Drop Handlers
  const handleDragStart = (
    e: React.DragEvent,
    item: {
      id: string;
      source: 'custom' | 'project' | 'installment' | 'task';
      originalId: string;
      title: string;
      date: string;
    }
  ) => {
    setDraggedItem(item);
    e.dataTransfer.setData('text/plain', JSON.stringify(item));
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
    setDragOverDate(null);
  };

  const handleDayDragOver = (e: React.DragEvent, dateKey: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverDate !== dateKey) {
      setDragOverDate(dateKey);
    }
  };

  const handleDayDragLeave = (dateKey: string) => {
    if (dragOverDate === dateKey) {
      setDragOverDate(null);
    }
  };

  const handleDayDrop = (e: React.DragEvent, targetDateKey: string) => {
    e.preventDefault();
    setDragOverDate(null);

    let item = draggedItem;
    if (!item) {
      try {
        const raw = e.dataTransfer.getData('text/plain');
        if (raw) item = JSON.parse(raw);
      } catch (err) {
        console.error(err);
      }
    }

    if (!item || item.date === targetDateKey) {
      setDraggedItem(null);
      return;
    }

    const formattedTarget = new Date(targetDateKey + 'T12:00:00').toLocaleDateString('pt-BR');

    if (item.source === 'project') {
      updateProject(item.originalId, { deadline: targetDateKey });
      logActivity(
        `Reagendou prazo do projeto para ${formattedTarget}`,
        'projeto',
        item.originalId,
        `Data alterada de ${item.date} para ${targetDateKey} via arrastar e soltar no calendário.`
      );
      setDropFeedback(`Prazo do projeto atualizado para ${formattedTarget}!`);
    } else if (item.source === 'task') {
      updateTask(item.originalId, { deadline: targetDateKey });
      logActivity(
        `Reagendou prazo da tarefa para ${formattedTarget}`,
        'tarefa',
        item.originalId,
        `Data alterada de ${item.date} para ${targetDateKey} via arrastar e soltar no calendário.`
      );
      setDropFeedback(`Prazo da tarefa atualizado para ${formattedTarget}!`);
    } else if (item.source === 'custom') {
      updateEvent(item.originalId, { date: targetDateKey });
      logActivity(
        `Reagendou compromisso "${item.title}" para ${formattedTarget}`,
        'evento',
        item.originalId
      );
      setDropFeedback(`Compromisso reagendado para ${formattedTarget}!`);
    } else if (item.source === 'installment') {
      updateInstallment(item.originalId, { dueDate: targetDateKey });
      logActivity(
        `Reagendou vencimento de cobrança para ${formattedTarget}`,
        'financeiro',
        item.originalId
      );
      setDropFeedback(`Vencimento da fatura reagendado para ${formattedTarget}!`);
    }

    setSelectedDate(targetDateKey);
    setDraggedItem(null);

    setTimeout(() => {
      setDropFeedback(null);
    }, 4000);
  };

  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !eventDate) return;

    const selectedClient = clients.find((c) => c.id === clientId);
    const selectedProj = projects.find((p) => p.id === projectId);

    addEvent({
      title,
      description,
      type,
      date: eventDate,
      time: eventTime,
      clientId: clientId || undefined,
      clientName: selectedClient?.name,
      projectId: projectId || undefined,
      projectName: selectedProj?.name,
    });

    setTitle('');
    setDescription('');
    setClientId('');
    setProjectId('');
    setIsNewEventModalOpen(false);
  };

  const getEventBadgeColor = (eventType: string) => {
    switch (eventType) {
      case 'entrega':
        return 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800';
      case 'reuniao':
        return 'bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 border-purple-300 dark:border-purple-800';
      case 'pagamento':
        return 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800';
      case 'revisao':
        return 'bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border-blue-300 dark:border-blue-800';
      case 'tarefa':
        return 'bg-sky-100 dark:bg-sky-950/60 text-sky-800 dark:text-sky-300 border-sky-300 dark:border-sky-800';
      default:
        return 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700';
    }
  };

  const monthNames = [
    'Janeiro',
    'Fevereiro',
    'Março',
    'Abril',
    'Maio',
    'Junho',
    'Julho',
    'Agosto',
    'Setembro',
    'Outubro',
    'Novembro',
    'Dezembro',
  ];

  const selectedDateEvents = filteredEvents.filter((ev) => ev.date === selectedDate);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-indigo-600" />
            Agenda Geral & Cronograma Interativo
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Visualização sincronizada de prazos de projetos, tarefas, faturas e compromissos. Arraste qualquer item para reagendar instantaneamente.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="primary"
            onClick={() => {
              setEventDate(selectedDate);
              setIsNewEventModalOpen(true);
            }}
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Novo Evento
          </Button>
        </div>
      </div>

      {/* Dynamic Feedback Banner */}
      {dropFeedback && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl flex items-center gap-2 text-xs font-semibold text-emerald-800 dark:text-emerald-300 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{dropFeedback}</span>
        </div>
      )}

      {/* Main Grid: Calendar on Left, Selected Date details on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar Month Grid (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <Card padding="md">
            {/* Calendar Controls */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 mb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  {monthNames[currentMonth]} {currentYear}
                </h3>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setCurrentDate(new Date());
                    setSelectedDate(new Date().toISOString().split('T')[0]);
                  }}
                  className="text-xs h-7 px-2.5"
                >
                  Hoje
                </Button>
              </div>

              {/* Filters & Month Steppers */}
              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg">
                  <button
                    onClick={() => setFilterType('todos')}
                    className={`px-2 py-1 text-xs rounded-md font-medium transition-colors ${
                      filterType === 'todos'
                        ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Todos
                  </button>
                  <button
                    onClick={() => setFilterType('entrega')}
                    className={`px-2 py-1 text-xs rounded-md font-medium transition-colors ${
                      filterType === 'entrega'
                        ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-2xs'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Entregas
                  </button>
                  <button
                    onClick={() => setFilterType('tarefa')}
                    className={`px-2 py-1 text-xs rounded-md font-medium transition-colors ${
                      filterType === 'tarefa'
                        ? 'bg-white dark:bg-slate-700 text-sky-600 dark:text-sky-400 shadow-2xs'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Tarefas
                  </button>
                  <button
                    onClick={() => setFilterType('reuniao')}
                    className={`px-2 py-1 text-xs rounded-md font-medium transition-colors ${
                      filterType === 'reuniao'
                        ? 'bg-white dark:bg-slate-700 text-purple-600 dark:text-purple-400 shadow-2xs'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Reuniões
                  </button>
                  <button
                    onClick={() => setFilterType('pagamento')}
                    className={`px-2 py-1 text-xs rounded-md font-medium transition-colors ${
                      filterType === 'pagamento'
                        ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-2xs'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Faturas
                  </button>
                </div>

                <div className="flex items-center gap-1 border-l border-slate-200 dark:border-slate-800 pl-2">
                  <button
                    onClick={prevMonth}
                    className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                    title="Mês anterior"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={nextMonth}
                    className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                    title="Próximo mês"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Days of Week Header */}
            <div className="grid grid-cols-7 gap-1 text-center mb-2">
              {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((day, idx) => (
                <div key={idx} className="text-xs font-semibold text-slate-400 py-1 uppercase tracking-wider">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Grid Cells */}
            <div className="grid grid-cols-7 gap-1.5">
              {/* Empty padding days */}
              {Array.from({ length: firstDayIndex }).map((_, index) => (
                <div key={`empty-${index}`} className="h-20 sm:h-24 rounded-lg bg-slate-50/40 dark:bg-slate-900/40 opacity-40" />
              ))}

              {/* Month days */}
              {Array.from({ length: daysInMonth }).map((_, index) => {
                const dayNumber = index + 1;
                const formattedMonth = String(currentMonth + 1).padStart(2, '0');
                const formattedDay = String(dayNumber).padStart(2, '0');
                const dateKey = `${currentYear}-${formattedMonth}-${formattedDay}`;

                const dayEvents = filteredEvents.filter((ev) => ev.date === dateKey);
                const isToday = dateKey === new Date().toISOString().split('T')[0];
                const isSelected = dateKey === selectedDate;
                const isDragOver = dragOverDate === dateKey;

                return (
                  <div
                    key={dateKey}
                    onClick={() => setSelectedDate(dateKey)}
                    onDragOver={(e) => handleDayDragOver(e, dateKey)}
                    onDragLeave={() => handleDayDragLeave(dateKey)}
                    onDrop={(e) => handleDayDrop(e, dateKey)}
                    className={`h-20 sm:h-24 p-1.5 rounded-xl border flex flex-col justify-between cursor-pointer transition-all ${
                      isDragOver
                        ? 'border-dashed border-2 border-indigo-600 bg-indigo-100/60 dark:bg-indigo-900/40 ring-4 ring-indigo-500/20 scale-[1.02] shadow-md z-10'
                        : isSelected
                        ? 'border-indigo-600 ring-2 ring-indigo-500/20 bg-indigo-50/30 dark:bg-indigo-950/20'
                        : isToday
                        ? 'border-indigo-300 dark:border-indigo-800 bg-white dark:bg-slate-900'
                        : 'border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full ${
                          isToday
                            ? 'bg-indigo-600 text-white'
                            : isSelected
                            ? 'text-indigo-600 dark:text-indigo-400 font-extrabold'
                            : 'text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {dayNumber}
                      </span>
                      {dayEvents.length > 0 && (
                        <span className="text-[10px] font-semibold text-slate-400">
                          {dayEvents.length}
                        </span>
                      )}
                    </div>

                    {/* Micro event pills - draggable */}
                    <div className="space-y-0.5 overflow-hidden">
                      {dayEvents.slice(0, 2).map((ev) => (
                        <div
                          key={ev.id}
                          draggable
                          onDragStart={(e) => {
                            e.stopPropagation();
                            handleDragStart(e, ev);
                          }}
                          onDragEnd={handleDragEnd}
                          title={`${ev.title} (Arraste para mover)`}
                          className={`text-[10px] truncate px-1 py-0.5 rounded border cursor-grab active:cursor-grabbing hover:brightness-95 transition-transform flex items-center gap-0.5 ${getEventBadgeColor(
                            ev.type
                          )}`}
                        >
                          <GripVertical className="w-2.5 h-2.5 opacity-40 shrink-0" />
                          <span className="truncate">{ev.title}</span>
                        </div>
                      ))}
                      {dayEvents.length > 2 && (
                        <div className="text-[9px] text-slate-400 font-medium pl-1">
                          +{dayEvents.length - 2} mais
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Helper indicator */}
            <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
              <span className="flex items-center gap-1.5">
                <GripVertical className="w-3.5 h-3.5 text-indigo-500" />
                Arraste qualquer compromisso ou prazo entre os dias para reagendar instantaneamente.
              </span>
              <span>Total: {allEvents.length} compromissos sincronizados</span>
            </div>
          </Card>
        </div>

        {/* Selected Date Agenda Details */}
        <div className="space-y-4">
          <Card padding="md">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Agenda Selecionada
                </p>
                <h3 className="text-base font-bold text-slate-900 dark:text-white capitalize">
                  {new Date(selectedDate + 'T12:00:00').toLocaleDateString('pt-BR', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </h3>
              </div>
              <Badge status={selectedDateEvents.length > 0 ? 'em_andamento' : 'rascunho'}>
                {selectedDateEvents.length} eventos
              </Badge>
            </div>

            {selectedDateEvents.length === 0 ? (
              <div className="text-center py-10 text-slate-400 text-xs">
                <CalendarIcon className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                Nenhum compromisso, entrega ou cobrança agendada para esta data.
                <div className="mt-4">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setEventDate(selectedDate);
                      setIsNewEventModalOpen(true);
                    }}
                  >
                    Agendar para este dia
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {selectedDateEvents.map((ev) => (
                  <div
                    key={ev.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, ev)}
                    onDragEnd={handleDragEnd}
                    className="p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850/50 space-y-2 cursor-grab active:cursor-grabbing hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <GripVertical className="w-3 h-3 text-slate-400" />
                          <span
                            className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded border ${getEventBadgeColor(
                              ev.type
                            )}`}
                          >
                            {ev.type}
                          </span>
                          {ev.time && (
                            <span className="text-xs text-slate-500 flex items-center gap-1">
                              <Clock className="w-3 h-3 text-slate-400" />
                              {ev.time}
                            </span>
                          )}
                        </div>
                        <h4 className="text-sm font-semibold text-slate-900 dark:text-white mt-1">
                          {ev.title}
                        </h4>
                      </div>

                      {ev.source === 'custom' && (
                        <button
                          onClick={() => deleteEvent(ev.originalId)}
                          className="text-xs text-rose-500 hover:text-rose-700 p-1"
                          title="Excluir evento"
                        >
                          Excluir
                        </button>
                      )}
                    </div>

                    {(ev.clientName || ev.projectName) && (
                      <div className="text-xs text-slate-500 dark:text-slate-400 flex flex-col gap-0.5 pt-1 border-t border-slate-200/50 dark:border-slate-800/50">
                        {ev.clientName && (
                          <span className="flex items-center gap-1 truncate">
                            <Building2 className="w-3 h-3 text-slate-400 shrink-0" />
                            {ev.clientName}
                          </span>
                        )}
                        {ev.projectName && (
                          <span className="flex items-center gap-1 truncate">
                            <FolderKanban className="w-3 h-3 text-indigo-400 shrink-0" />
                            {ev.projectName}
                          </span>
                        )}
                      </div>
                    )}

                    {ev.source === 'project' && (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => onNavigateTab('projetos', ev.originalId)}
                        className="w-full text-xs py-1"
                      >
                        Abrir Projeto
                      </Button>
                    )}

                    {ev.source === 'task' && (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => onNavigateTab('tarefas', ev.originalId)}
                        className="w-full text-xs py-1"
                      >
                        Ver Tarefas
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* New Event Modal */}
      <Modal
        isOpen={isNewEventModalOpen}
        onClose={() => setIsNewEventModalOpen(false)}
        title="Novo Compromisso / Evento"
        size="md"
      >
        <form onSubmit={handleCreateEvent} className="space-y-4">
          <Input
            label="Título do Evento *"
            placeholder="Ex: Call de alinhamento com cliente, Apresentação de Layout"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Tipo de Evento"
              value={type}
              onChange={(e) => setType(e.target.value as EventType)}
              options={[
                { value: 'reuniao', label: 'Reunião / Call' },
                { value: 'entrega', label: 'Prazo / Entrega' },
                { value: 'revisao', label: 'Revisão com Cliente' },
                { value: 'pagamento', label: 'Lembrete de Cobrança' },
                { value: 'outro', label: 'Outro' },
              ]}
            />

            <Input
              label="Data *"
              type="date"
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Horário"
              type="time"
              value={eventTime}
              onChange={(e) => setEventTime(e.target.value)}
            />

            <Select
              label="Vincular ao Cliente (Opcional)"
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              options={[
                { value: '', label: 'Nenhum' },
                ...clients.map((c) => ({ value: c.id, label: `${c.name} (${c.company})` })),
              ]}
            />
          </div>

          <Select
            label="Vincular ao Projeto (Opcional)"
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
            options={[
              { value: '', label: 'Nenhum' },
              ...projects.map((p) => ({ value: p.id, label: `${p.name} - ${p.clientName}` })),
            ]}
          />

          <Input
            label="Descrição / Pauta (Opcional)"
            placeholder="Link do Google Meet, pontos a debater..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsNewEventModalOpen(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" variant="primary">
              Salvar Evento
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
