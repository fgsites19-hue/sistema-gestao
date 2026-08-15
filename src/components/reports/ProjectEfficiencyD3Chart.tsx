import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as d3 from 'd3';
import { Project, Task, TaskTimeLog } from '../../types';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import {
  Clock,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  BarChart3,
  Filter,
  Info,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
} from 'lucide-react';

interface ProjectEfficiencyD3ChartProps {
  projects: Project[];
  tasks: Task[];
  timeLogs?: TaskTimeLog[];
  onSelectProject?: (projectId: string) => void;
}

interface ProjectTimeMetric {
  projectId: string;
  projectName: string;
  clientName: string;
  status: string;
  estimatedHours: number;
  loggedHours: number;
  varianceHours: number; // logged - estimated
  efficiencyPercent: number; // (logged / estimated) * 100
  isExceeded: boolean;
  tasksCount: number;
  completedTasksCount: number;
}

export const ProjectEfficiencyD3Chart: React.FC<ProjectEfficiencyD3ChartProps> = ({
  projects,
  tasks,
  timeLogs = [],
  onSelectProject,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'exceeded'>('all');
  const [sortBy, setSortBy] = useState<'gap' | 'logged' | 'estimated'>('gap');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [tooltipData, setTooltipData] = useState<{
    visible: boolean;
    x: number;
    y: number;
    metric: ProjectTimeMetric | null;
  }>({
    visible: false,
    x: 0,
    y: 0,
    metric: null,
  });

  // Calculate metrics per project
  const projectMetrics = useMemo<ProjectTimeMetric[]>(() => {
    return projects.map((p) => {
      const projectTasks = tasks.filter((t) => t.projectId === p.id);
      
      // Sum estimated hours from tasks or project fallback
      let taskEstimated = projectTasks.reduce((acc, t) => acc + (t.estimatedHours || 0), 0);
      const estimatedHours = taskEstimated > 0 ? taskEstimated : (p.estimatedHours || 30);

      // Sum spent seconds from tasks and timeLogs
      let totalSpentSeconds = projectTasks.reduce((acc, t) => acc + (t.spentSeconds || 0), 0);
      
      // Also add time logs if logged separately
      const projectLogs = timeLogs.filter((l) => l.projectId === p.id);
      const logSeconds = projectLogs.reduce((acc, l) => acc + (l.durationSeconds || 0), 0);
      
      const effectiveSeconds = Math.max(totalSpentSeconds, logSeconds);
      const loggedHours = Number((effectiveSeconds / 3600).toFixed(1));

      const varianceHours = Number((loggedHours - estimatedHours).toFixed(1));
      const efficiencyPercent = estimatedHours > 0 ? Math.round((loggedHours / estimatedHours) * 100) : 100;
      const isExceeded = loggedHours > estimatedHours;
      const completedTasksCount = projectTasks.filter((t) => t.status === 'concluido').length;

      return {
        projectId: p.id,
        projectName: p.name,
        clientName: p.clientName,
        status: p.status,
        estimatedHours,
        loggedHours,
        varianceHours,
        efficiencyPercent,
        isExceeded,
        tasksCount: projectTasks.length,
        completedTasksCount,
      };
    });
  }, [projects, tasks, timeLogs]);

  // Filter and sort metrics
  const displayedMetrics = useMemo(() => {
    let list = [...projectMetrics];

    if (filterStatus === 'active') {
      list = list.filter((m) => m.status !== 'entregue' && m.status !== 'cancelado');
    } else if (filterStatus === 'exceeded') {
      list = list.filter((m) => m.isExceeded);
    }

    if (sortBy === 'gap') {
      list.sort((a, b) => b.varianceHours - a.varianceHours);
    } else if (sortBy === 'logged') {
      list.sort((a, b) => b.loggedHours - a.loggedHours);
    } else if (sortBy === 'estimated') {
      list.sort((a, b) => b.estimatedHours - a.estimatedHours);
    }

    return list;
  }, [projectMetrics, filterStatus, sortBy]);

  // High-level summary metrics
  const totalEstimated = useMemo(() => projectMetrics.reduce((acc, m) => acc + m.estimatedHours, 0), [projectMetrics]);
  const totalLogged = useMemo(() => projectMetrics.reduce((acc, m) => acc + m.loggedHours, 0), [projectMetrics]);
  const exceededCount = useMemo(() => projectMetrics.filter((m) => m.isExceeded).length, [projectMetrics]);
  const efficientCount = useMemo(() => projectMetrics.filter((m) => !m.isExceeded).length, [projectMetrics]);
  const overallAccuracy = useMemo(() => {
    if (totalEstimated === 0) return 100;
    const diff = Math.abs(totalLogged - totalEstimated);
    return Math.max(0, Math.round(100 - (diff / totalEstimated) * 100));
  }, [totalEstimated, totalLogged]);

  // D3 Chart Rendering Effect
  useEffect(() => {
    if (!svgRef.current || !containerRef.current || displayedMetrics.length === 0) return;

    const containerWidth = containerRef.current.clientWidth || 700;
    const margin = { top: 30, right: 30, bottom: 65, left: 55 };
    const width = Math.max(containerWidth, 500);
    const height = 360;
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    svg.attr('viewBox', `0 0 ${width} ${height}`).attr('width', '100%').attr('height', height);

    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    // X0 Scale (per project group)
    const x0 = d3
      .scaleBand()
      .domain(displayedMetrics.map((d) => d.projectId))
      .rangeRound([0, innerWidth])
      .paddingInner(0.25);

    // X1 Scale (for sub-bars: estimated vs logged)
    const subkeys = ['estimatedHours', 'loggedHours'];
    const x1 = d3.scaleBand().domain(subkeys).rangeRound([0, x0.bandwidth()]).padding(0.12);

    // Y Scale
    const maxVal = d3.max(displayedMetrics, (d: ProjectTimeMetric) => Math.max(d.estimatedHours, d.loggedHours)) || 40;
    const y = d3
      .scaleLinear()
      .domain([0, Math.ceil(maxVal * 1.15)])
      .nice()
      .rangeRound([innerHeight, 0]);

    // Grid lines (horizontal)
    g.append('g')
      .attr('class', 'grid-lines')
      .call(
        d3
          .axisLeft(y)
          .ticks(5)
          .tickSize(-innerWidth)
          .tickFormat(() => '')
      )
      .selectAll('line')
      .attr('stroke', 'currentColor')
      .attr('stroke-opacity', 0.08);

    g.select('.grid-lines path').remove();

    // X Axis
    const xAxis = g
      .append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(
        d3.axisBottom(x0).tickFormat((id) => {
          const item = displayedMetrics.find((m) => m.projectId === id);
          if (!item) return '';
          return item.projectName.length > 16 ? item.projectName.slice(0, 15) + '…' : item.projectName;
        })
      );

    xAxis
      .selectAll('text')
      .attr('transform', 'rotate(-18)')
      .style('text-anchor', 'end')
      .attr('dx', '-0.5em')
      .attr('dy', '0.8em')
      .attr('class', 'text-[11px] font-medium fill-slate-600 dark:fill-slate-400')
      .style('font-family', 'inherit');

    xAxis.select('path').attr('stroke', '#94a3b8').attr('stroke-opacity', 0.3);

    // Y Axis
    const yAxis = g.append('g').call(
      d3
        .axisLeft(y)
        .ticks(5)
        .tickFormat((d) => `${d}h`)
    );

    yAxis
      .selectAll('text')
      .attr('class', 'text-[11px] font-medium fill-slate-500 dark:fill-slate-400')
      .style('font-family', 'inherit');

    yAxis.select('path').attr('stroke', '#94a3b8').attr('stroke-opacity', 0.3);

    // Project Groups
    const projectGroups = g
      .selectAll<SVGGElement, ProjectTimeMetric>('.project-group')
      .data(displayedMetrics)
      .enter()
      .append('g')
      .attr('class', 'project-group cursor-pointer')
      .attr('transform', (d: ProjectTimeMetric) => `translate(${x0(d.projectId)},0)`)
      .on('click', (_: any, d: ProjectTimeMetric) => {
        setSelectedProjectId(d.projectId);
        if (onSelectProject) onSelectProject(d.projectId);
      });

    // Sub-bar 1: Horas Estimadas (Indigo / Slate)
    projectGroups
      .append('rect')
      .attr('class', 'bar-estimated transition-all duration-300')
      .attr('x', () => x1('estimatedHours') || 0)
      .attr('y', innerHeight)
      .attr('width', x1.bandwidth())
      .attr('height', 0)
      .attr('rx', 4)
      .attr('fill', '#6366f1') // indigo-500
      .attr('fill-opacity', 0.75)
      .on('mouseenter', (event: any, d: ProjectTimeMetric) => {
        const [xPos, yPos] = d3.pointer(event, containerRef.current);
        setTooltipData({
          visible: true,
          x: xPos,
          y: yPos,
          metric: d,
        });
      })
      .on('mouseleave', () => {
        setTooltipData((prev) => ({ ...prev, visible: false }));
      })
      .transition()
      .duration(750)
      .ease(d3.easeCubicOut)
      .attr('y', (d: any) => y(d.estimatedHours))
      .attr('height', (d: any) => innerHeight - y(d.estimatedHours));

    // Sub-bar 2: Horas Realizadas / Logged
    projectGroups
      .append('rect')
      .attr('class', 'bar-logged transition-all duration-300')
      .attr('x', () => x1('loggedHours') || 0)
      .attr('y', innerHeight)
      .attr('width', x1.bandwidth())
      .attr('rx', 4)
      .attr('fill', (d: ProjectTimeMetric) => (d.isExceeded ? '#f43f5e' : '#10b981')) // rose-500 if exceeded, emerald-500 if ok
      .on('mouseenter', (event: any, d: ProjectTimeMetric) => {
        const [xPos, yPos] = d3.pointer(event, containerRef.current);
        setTooltipData({
          visible: true,
          x: xPos,
          y: yPos,
          metric: d,
        });
      })
      .on('mouseleave', () => {
        setTooltipData((prev) => ({ ...prev, visible: false }));
      })
      .transition()
      .duration(750)
      .delay(100)
      .ease(d3.easeCubicOut)
      .attr('y', (d: any) => y(d.loggedHours))
      .attr('height', (d: any) => innerHeight - y(d.loggedHours));

    // Badge / label on top of exceeded bars
    projectGroups
      .filter((d: ProjectTimeMetric) => d.isExceeded)
      .append('text')
      .attr('x', () => (x1('loggedHours') || 0) + x1.bandwidth() / 2)
      .attr('y', (d: ProjectTimeMetric) => y(d.loggedHours) - 6)
      .attr('text-anchor', 'middle')
      .attr('class', 'text-[10px] font-bold fill-rose-600 dark:fill-rose-400')
      .text((d: ProjectTimeMetric) => `+${d.varianceHours}h`)
      .style('opacity', 0)
      .transition()
      .delay(600)
      .duration(300)
      .style('opacity', 1);
  }, [displayedMetrics, onSelectProject]);

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <Card padding="md" className="space-y-4 shadow-sm border border-slate-200 dark:border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                <BarChart3 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Eficiência Operacional: Horas Realizadas vs Estimadas (D3.js)
              </h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Identifique gargalos operacionais e desvios de tempo entre o orçamento inicial e o tempo real executado pela equipe.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Filter */}
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg text-xs font-medium">
              <button
                type="button"
                onClick={() => setFilterStatus('all')}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  filterStatus === 'all'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-bold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                Todos ({projectMetrics.length})
              </button>
              <button
                type="button"
                onClick={() => setFilterStatus('active')}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  filterStatus === 'active'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-bold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                Em Andamento
              </button>
              <button
                type="button"
                onClick={() => setFilterStatus('exceeded')}
                className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1 ${
                  filterStatus === 'exceeded'
                    ? 'bg-rose-500 text-white shadow-xs font-bold'
                    : 'text-rose-600 dark:text-rose-400 hover:text-rose-700'
                }`}
              >
                <AlertTriangle className="w-3 h-3" />
                Estouro ({exceededCount})
              </button>
            </div>

            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="text-xs bg-slate-100 dark:bg-slate-800 border-none rounded-lg px-2.5 py-1.5 text-slate-700 dark:text-slate-300 font-medium focus:ring-1 focus:ring-indigo-500"
            >
              <option value="gap">Ordenar: Maior Desvio (Gargalo)</option>
              <option value="logged">Ordenar: Mais Horas Gastas</option>
              <option value="estimated">Ordenar: Maior Estimativa</option>
            </select>
          </div>
        </div>

        {/* 4 Summary Mini KPIs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-850/60 border border-slate-200/70 dark:border-slate-800">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block">
              Total Horas Estimadas
            </span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-lg font-bold text-indigo-600 dark:text-indigo-400">{totalEstimated}h</span>
              <span className="text-[10px] text-slate-400 font-medium">planejadas</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-850/60 border border-slate-200/70 dark:border-slate-800">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block">
              Total Horas Realizadas
            </span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-lg font-bold text-slate-900 dark:text-white">{totalLogged}h</span>
              <span className="text-[10px] text-slate-400 font-medium">cronometradas</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-900/40">
            <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 block">
              Dentro do Orçamento
            </span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{efficientCount}</span>
              <span className="text-[10px] text-emerald-600/80 font-medium">projetos saudáveis</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200/60 dark:border-rose-900/40">
            <span className="text-[11px] font-semibold text-rose-700 dark:text-rose-300 block">
              Gargalos / Estouro
            </span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-lg font-bold text-rose-600 dark:text-rose-400">{exceededCount}</span>
              <span className="text-[10px] text-rose-600/80 font-medium">risco de margem</span>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1 text-xs">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-indigo-500 inline-block" />
              <span className="text-slate-600 dark:text-slate-300 font-medium">Horas Estimadas (Orçadas)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-emerald-500 inline-block" />
              <span className="text-slate-600 dark:text-slate-300 font-medium">Horas Realizadas (No Orçamento)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-rose-500 inline-block" />
              <span className="text-slate-600 dark:text-slate-300 font-medium">Horas Realizadas (Estouro de Tempo)</span>
            </div>
          </div>

          <span className="text-[11px] text-slate-400">
            Passe o mouse nas barras para ver detalhes completos de cada projeto
          </span>
        </div>

        {/* SVG Container with Tooltip */}
        <div ref={containerRef} className="relative w-full overflow-x-auto pt-2 pb-2">
          {displayedMetrics.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400">
              Nenhum projeto encontrado para o filtro selecionado.
            </div>
          ) : (
            <svg ref={svgRef} className="w-full select-none" />
          )}

          {/* D3 Floating Tooltip */}
          {tooltipData.visible && tooltipData.metric && (
            <div
              className="absolute z-30 pointer-events-none p-3 rounded-xl bg-slate-900/95 text-white shadow-xl border border-slate-700/80 text-xs w-64 backdrop-blur-xs transition-all duration-75"
              style={{
                left: Math.min(tooltipData.x + 12, (containerRef.current?.clientWidth || 500) - 270),
                top: Math.max(10, tooltipData.y - 120),
              }}
            >
              <div className="font-bold text-sm text-indigo-300 truncate">
                {tooltipData.metric.projectName}
              </div>
              <div className="text-[11px] text-slate-400 truncate mb-2">
                Cliente: {tooltipData.metric.clientName}
              </div>

              <div className="space-y-1 py-1.5 border-t border-slate-800 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-slate-400">Tempo Estimado:</span>
                  <span className="font-bold text-indigo-300">{tooltipData.metric.estimatedHours}h</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Tempo Realizado:</span>
                  <span
                    className={`font-bold ${
                      tooltipData.metric.isExceeded ? 'text-rose-400' : 'text-emerald-400'
                    }`}
                  >
                    {tooltipData.metric.loggedHours}h
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Desvio / Gap:</span>
                  <span
                    className={`font-bold ${
                      tooltipData.metric.isExceeded ? 'text-rose-400' : 'text-emerald-400'
                    }`}
                  >
                    {tooltipData.metric.varianceHours > 0 ? `+${tooltipData.metric.varianceHours}h` : `${tooltipData.metric.varianceHours}h`} ({tooltipData.metric.efficiencyPercent}%)
                  </span>
                </div>
                <div className="flex justify-between pt-1 text-[10px] text-slate-400">
                  <span>Tarefas:</span>
                  <span>{tooltipData.metric.completedTasksCount}/{tooltipData.metric.tasksCount} concluídas</span>
                </div>
              </div>

              <div className="mt-2 pt-1.5 border-t border-slate-800 flex items-center justify-between text-[10px]">
                <span
                  className={`px-1.5 py-0.5 rounded font-bold uppercase ${
                    tooltipData.metric.isExceeded
                      ? 'bg-rose-950/80 text-rose-300 border border-rose-800/60'
                      : 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/60'
                  }`}
                >
                  {tooltipData.metric.isExceeded ? 'Gargalo Detectado' : 'Dentro do Orçado'}
                </span>
                <span className="text-slate-400">Status: {tooltipData.metric.status}</span>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Actionable Efficiency Breakdown & Bottlenecks List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Bottleneck Alerts */}
        <Card padding="md" className="space-y-3 border-l-4 border-l-rose-500">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                Projetos com Gargalo de Tempo ({exceededCount})
              </h4>
              <p className="text-[11px] text-slate-500">Horas trabalhadas ultrapassaram o tempo orçado</p>
            </div>
          </div>

          {exceededCount === 0 ? (
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-850 text-center text-xs text-slate-500">
              Nenhum projeto ultrapassou o orçamento de horas. Excelente precisão de estimativas!
            </div>
          ) : (
            <div className="space-y-2 text-xs">
              {projectMetrics
                .filter((m) => m.isExceeded)
                .map((m) => (
                  <div
                    key={m.projectId}
                    className="p-2.5 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/40 dark:bg-rose-950/20 flex items-center justify-between gap-3"
                  >
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white">{m.projectName}</p>
                      <p className="text-[11px] text-slate-500">
                        {m.clientName} • Orçado: {m.estimatedHours}h • Gasto: <strong className="text-rose-600">{m.loggedHours}h</strong>
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-xs font-bold text-rose-600 dark:text-rose-400 block">
                        +{m.varianceHours}h ({m.efficiencyPercent}%)
                      </span>
                      <span className="text-[10px] text-slate-400">Desvio acima</span>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </Card>

        {/* High Efficiency Projects */}
        <Card padding="md" className="space-y-3 border-l-4 border-l-emerald-500">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                Projetos de Alta Eficiência & Margem ({efficientCount})
              </h4>
              <p className="text-[11px] text-slate-500">Tempo de execução controlado dentro da estimativa orçada</p>
            </div>
          </div>

          <div className="space-y-2 text-xs">
            {projectMetrics
              .filter((m) => !m.isExceeded)
              .slice(0, 3)
              .map((m) => (
                <div
                  key={m.projectId}
                  className="p-2.5 rounded-xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/40 dark:bg-emerald-950/20 flex items-center justify-between gap-3"
                >
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white">{m.projectName}</p>
                    <p className="text-[11px] text-slate-500">
                      {m.clientName} • {m.loggedHours}h gastas de {m.estimatedHours}h previstas
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 block">
                      {m.efficiencyPercent}% utilizado
                    </span>
                    <span className="text-[10px] text-emerald-600/70 font-medium">Margem Saudável</span>
                  </div>
                </div>
              ))}
          </div>
        </Card>
      </div>
    </div>
  );
};
