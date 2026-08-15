import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  FolderKanban,
  CheckCircle2,
  Clock,
  ExternalLink,
  Download,
  Eye,
  FileText,
  Calendar,
  MessageSquare,
  ShieldCheck,
  Sparkles,
  ArrowLeft,
  Share2,
  Copy,
  Check,
  Send,
  Layers,
  HelpCircle,
  Activity,
  KeyRound,
} from 'lucide-react';
import { Project, Task, ProjectFile, ProjectMilestone } from '../../types';
import { useDatabase } from '../../context/DatabaseContext';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';

interface ClientPortalViewProps {
  project: Project;
  onExitClientMode: () => void;
}

export const ClientPortalView: React.FC<ClientPortalViewProps> = ({
  project,
  onExitClientMode,
}) => {
  const { user, settings, tasks, files, logActivity, addNotification } =
    useDatabase();
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackSent, setFeedbackSent] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const hasLoggedEntry = useRef(false);

  const projectTasks = tasks.filter((t) => t.projectId === project.id);
  const projectFiles = files.filter((f) => f.projectId === project.id);

  const completedTasks = projectTasks.filter((t) => t.status === 'concluido');
  const pendingTasks = projectTasks.filter((t) => t.status !== 'concluido');

  const projectMilestones = useMemo<ProjectMilestone[]>(() => {
    if (project.milestones && project.milestones.length > 0) {
      return project.milestones;
    }
    return [
      {
        id: 'm_1',
        title: 'Alinhamento & Briefing Estratégico',
        description: 'Definição de escopo, personas e levantamento de referências.',
        status: 'concluido',
        targetDate: project.startDate,
        completedAt: project.startDate,
      },
      {
        id: 'm_2',
        title: 'Design de Interface no Figma',
        description: 'Criação de protótipos de alta fidelidade.',
        status: project.progress >= 40 ? 'concluido' : 'em_andamento',
        targetDate: project.deadline,
      },
      {
        id: 'm_3',
        title: 'Desenvolvimento Front-end & Animações',
        description: 'Codificação dos layouts com responsividade.',
        status: project.progress >= 75 ? 'concluido' : project.progress >= 40 ? 'em_andamento' : 'pendente',
        targetDate: project.deadline,
      },
      {
        id: 'm_4',
        title: 'Homologação & Publicação Final',
        description: 'Testes finais e apontamento de domínio.',
        status: project.progress === 100 ? 'concluido' : 'pendente',
        targetDate: project.deadline,
      },
    ];
  }, [project]);

  // Track portal session access upon entry
  useEffect(() => {
    if (!hasLoggedEntry.current) {
      hasLoggedEntry.current = true;
      const now = new Date();
      const timeStr = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      const dateStr = now.toLocaleDateString('pt-BR');

      logActivity(
        `Cliente acessou o Portal do Projeto (Modo Simulação)`,
        'portal',
        project.id,
        `Sessão do cliente "${project.clientName}" registrada em ${dateStr} às ${timeStr}. Visualizou status "${project.status}" (${project.progress}% de progresso) e ${projectTasks.length} etapas.`
      );

      addNotification({
        title: 'Engajamento no Portal do Cliente',
        message: `${project.clientName} abriu o link do portal de status do projeto "${project.name}" às ${timeStr}.`,
        type: 'projeto',
        entityId: project.id,
      });
    }
  }, [project.id, project.name, project.clientName, project.status, project.progress, projectTasks.length, logActivity, addNotification]);

  const handleSendFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackText.trim()) return;

    const msg = feedbackText.trim();
    const now = new Date();
    const timeStr = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    logActivity(
      `Mensagem enviada pelo Cliente no Portal: "${msg}"`,
      'portal',
      project.id,
      `Feedback/dúvida submetido às ${timeStr} pelo cliente ${project.clientName}.`
    );

    addNotification({
      title: `Mensagem no Portal (${project.name})`,
      message: `${project.clientName} enviou: "${msg}"`,
      type: 'projeto',
      entityId: project.id,
    });

    setFeedbackSent(true);
    setFeedbackText('');
    setTimeout(() => setFeedbackSent(false), 4000);
  };

  const handleCopyPortalLink = () => {
    const token = project.portalToken || `token_${project.id}`;
    const tokenUrl = `${window.location.origin}/?token=${token}`;
    navigator.clipboard.writeText(tokenUrl);
    setCopiedLink(true);

    logActivity(
      `Gerou e copiou link seguro com token para o Portal do Cliente`,
      'portal',
      project.id,
      `Link compartilhado para ${project.clientName}: ${tokenUrl}`
    );

    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleStagingClick = () => {
    logActivity(
      `Cliente clicou no link de Homologação / Staging`,
      'portal',
      project.id,
      `URL acessada: ${project.stagingUrl}`
    );
  };

  const handleFigmaClick = () => {
    logActivity(
      `Cliente abriu o Protótipo Visual no Figma`,
      'portal',
      project.id,
      `URL acessada: ${project.figmaUrl}`
    );
  };

  const handleFileDownload = (file: ProjectFile) => {
    logActivity(
      `Cliente visualizou/baixou arquivo no Portal: "${file.name}"`,
      'portal',
      project.id,
      `Categoria: ${file.category} • Tamanho: ${file.size}`
    );
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Top Banner indicating Read-Only / Client Mock Mode */}
      <div className="p-3.5 rounded-2xl bg-indigo-900 text-white shadow-lg flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-indigo-700/80 text-amber-300 shrink-0">
            <Eye className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-200">
                Simulação / Modo Visão do Cliente (Read-Only)
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30">
                Somente Leitura
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/30 text-indigo-200 font-medium flex items-center gap-1">
                <Activity className="w-3 h-3 text-emerald-400" /> Acesso monitorado
              </span>
            </div>
            <p className="text-xs text-indigo-100 mt-0.5">
              Esta é exatamente a experiência e os dados visíveis para <strong>{project.clientName}</strong>. Campos administrativos, margens e taxas internas estão ocultos.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            size="sm"
            variant="secondary"
            onClick={handleCopyPortalLink}
            leftIcon={copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            className="text-xs bg-white/10 hover:bg-white/20 text-white border-white/20"
          >
            {copiedLink ? 'Link Copiado!' : 'Copiar Link do Cliente'}
          </Button>

          <Button
            size="sm"
            variant="primary"
            onClick={onExitClientMode}
            leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}
            className="text-xs bg-white text-indigo-950 hover:bg-indigo-50 font-bold"
          >
            Voltar ao Painel Admin
          </Button>
        </div>
      </div>

      {/* Branded Header */}
      <Card padding="lg" className="border-t-4 border-t-indigo-600 space-y-6 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white font-black text-xl flex items-center justify-center shadow-md shadow-indigo-500/20">
              {settings.tradeName ? settings.tradeName.slice(0, 2).toUpperCase() : 'SO'}
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                {settings.tradeName || settings.companyName || 'StudioOS Web Design'} • Portal do Projeto
              </span>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                {project.name}
              </h1>
              <p className="text-xs text-slate-500">
                Cliente: <strong className="text-slate-700 dark:text-slate-300">{project.clientName}</strong> • Tipo: {project.type}
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:items-end gap-1.5">
            <div className="flex items-center gap-2">
              <Badge status={project.status} size="md" />
            </div>
            <span className="text-xs text-slate-400">
              Previsão de Entrega: <strong className="text-slate-700 dark:text-slate-300">{new Date(project.deadline).toLocaleDateString('pt-BR')}</strong>
            </span>
          </div>
        </div>

        {/* Big Visual Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-slate-700 dark:text-slate-300">Progresso Geral do Projeto</span>
            <span className="text-indigo-600 dark:text-indigo-400 text-sm">{project.progress}% Concluído</span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-3 rounded-full overflow-hidden p-0.5 border border-slate-200 dark:border-slate-700">
            <div
              className="bg-gradient-to-r from-indigo-600 to-indigo-500 h-full rounded-full transition-all duration-500 shadow-sm"
              style={{ width: `${project.progress}%` }}
            />
          </div>
        </div>

        {/* Quick External Prototype / Test Links */}
        {(project.stagingUrl || project.figmaUrl) && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {project.stagingUrl && (
              <a
                href={project.stagingUrl}
                target="_blank"
                rel="noreferrer"
                onClick={handleStagingClick}
                className="p-3.5 rounded-xl border border-indigo-200 dark:border-indigo-900/60 bg-indigo-50/50 dark:bg-indigo-950/20 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-indigo-600 text-white">
                    <ExternalLink className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-indigo-600">
                      Ambiente de Homologação / Staging
                    </h4>
                    <p className="text-[11px] text-slate-500">Clique para navegar e testar o website online</p>
                  </div>
                </div>
                <ArrowLeft className="w-4 h-4 rotate-180 text-indigo-600 dark:text-indigo-400 group-hover:translate-x-0.5 transition-transform" />
              </a>
            )}

            {project.figmaUrl && (
              <a
                href={project.figmaUrl}
                target="_blank"
                rel="noreferrer"
                onClick={handleFigmaClick}
                className="p-3.5 rounded-xl border border-purple-200 dark:border-purple-900/60 bg-purple-50/50 dark:bg-purple-950/20 hover:bg-purple-50 dark:hover:bg-purple-950/40 transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-purple-600 text-white">
                    <Layers className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-purple-600">
                      Protótipo Visual no Figma
                    </h4>
                    <p className="text-[11px] text-slate-500">Visualize as telas aprovadas e o design system</p>
                  </div>
                </div>
                <ArrowLeft className="w-4 h-4 rotate-180 text-purple-600 dark:text-purple-400 group-hover:translate-x-0.5 transition-transform" />
              </a>
            )}
          </div>
        )}
      </Card>

      {/* Grid: Deliverables Checklist & Invoices */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Deliverables & Milestone Roadmap (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Public Tasks / Deliverables */}
          <Card padding="md" className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Etapas do Projeto & Entregáveis ({completedTasks.length}/{projectTasks.length})
                </h3>
                <p className="text-xs text-slate-500">
                  Acompanhe em tempo real o que já foi desenvolvido e quais as próximas etapas.
                </p>
              </div>
            </div>

            {projectTasks.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">Nenhuma etapa cadastrada no momento.</p>
            ) : (
              <div className="space-y-2.5">
                {projectTasks.map((t) => {
                  const isDone = t.status === 'concluido';
                  return (
                    <div
                      key={t.id}
                      className={`p-3 rounded-xl border transition-all flex items-start justify-between gap-3 ${
                        isDone
                          ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/60'
                          : 'bg-white dark:bg-slate-850 border-slate-200 dark:border-slate-800'
                      }`}
                    >
                      <div className="flex items-start gap-2.5">
                        <div
                          className={`mt-0.5 p-1 rounded-full shrink-0 ${
                            isDone
                              ? 'bg-emerald-600 text-white'
                              : 'bg-slate-200 dark:bg-slate-700 text-slate-400'
                          }`}
                        >
                          <Check className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <h4
                            className={`text-xs font-bold ${
                              isDone
                                ? 'line-through text-slate-500 dark:text-slate-400'
                                : 'text-slate-900 dark:text-white'
                            }`}
                          >
                            {t.title}
                          </h4>
                          {t.description && (
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                              {t.description}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                            isDone
                              ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                              : 'bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
                          }`}
                        >
                          {isDone ? 'Concluído' : 'Em Execução'}
                        </span>
                        <p className="text-[10px] text-slate-400 mt-1">
                          Prazo: {new Date(t.deadline).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>

          {/* Client Files & Deliverables Downloads */}
          <Card padding="md" className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-600" />
              Arquivos & Documentos Disponíveis para Download ({projectFiles.length})
            </h3>

            {projectFiles.length === 0 ? (
              <p className="text-xs text-slate-400 py-3 text-center">Nenhum arquivo anexado para este projeto.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {projectFiles.map((file) => (
                  <div
                    key={file.id}
                    className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-850/60 flex items-center justify-between gap-3 text-xs hover:border-indigo-400 transition-all"
                  >
                    <div className="min-w-0">
                      <p className="font-bold text-slate-900 dark:text-white truncate" title={file.name}>
                        {file.name}
                      </p>
                      <span className="text-[10px] text-slate-400">
                        {file.size} • {file.category}
                      </span>
                    </div>

                    <a
                      href={file.url}
                      target="_blank"
                      rel="noreferrer"
                      download={file.name}
                      onClick={() => handleFileDownload(file)}
                      className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 transition-colors shrink-0"
                      title="Baixar arquivo"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </a>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Right Column: Milestones & Feedback (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Project Milestones Timeline */}
          <Card padding="md" className="space-y-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-indigo-600" />
              Cronograma de Marcos
            </h3>

            <div className="space-y-2 text-xs">
              {projectMilestones.map((m) => {
                const isCompleted = m.status === 'concluido';
                const isOngoing = m.status === 'em_andamento';

                return (
                  <div
                    key={m.id}
                    className={`p-2.5 rounded-lg border flex items-center justify-between gap-2 ${
                      isCompleted
                        ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/60'
                        : isOngoing
                        ? 'bg-indigo-50/30 dark:bg-indigo-950/20 border-indigo-200 dark:border-indigo-900/50'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    <div>
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        {m.title}
                      </span>
                      <p className="text-[10px] text-slate-400">
                        Prazo: {new Date(m.targetDate).toLocaleDateString('pt-BR')}
                      </p>
                    </div>

                    <span
                      className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${
                        isCompleted
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                          : isOngoing
                          ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'
                          : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                      }`}
                    >
                      {isCompleted ? 'Concluído' : isOngoing ? 'Em Execução' : 'Pendente'}
                    </span>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Interactive Client Feedback Form */}
          <Card padding="md" className="space-y-3 bg-gradient-to-br from-indigo-50/50 to-purple-50/30 dark:from-slate-850 dark:to-indigo-950/20 border-indigo-100 dark:border-indigo-900/40">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-indigo-600" />
              Enviar Mensagem / Dúvida
            </h3>
            <p className="text-xs text-slate-500">
              O cliente pode enviar solicitações ou dúvidas diretamente por este canal.
            </p>

            <form onSubmit={handleSendFeedback} className="space-y-2">
              <textarea
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                placeholder="Escreva uma mensagem de feedback ou solicitação de ajuste..."
                rows={3}
                className="w-full p-2.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-900 dark:text-white"
              />

              <Button
                type="submit"
                size="sm"
                variant="primary"
                disabled={!feedbackText.trim()}
                leftIcon={<Send className="w-3.5 h-3.5" />}
                className="w-full text-xs"
              >
                Enviar Mensagem ao Desenvolvedor
              </Button>

              {feedbackSent && (
                <p className="text-[11px] text-emerald-600 font-semibold text-center mt-1 animate-in fade-in">
                  Mensagem registrada com sucesso no histórico do projeto!
                </p>
              )}
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
};
