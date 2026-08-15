import React, { useState, useEffect, useMemo, useRef } from 'react';
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
  KeyRound,
  Lock,
  Search,
  CheckCircle,
  AlertCircle,
  HelpCircle,
  Activity,
} from 'lucide-react';
import { Project, Task, ProjectFile, ProjectMilestone } from '../types';
import { useDatabase } from '../context/DatabaseContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';

interface ClientPortalStandaloneViewProps {
  initialToken?: string;
  onExit?: () => void;
}

export const ClientPortalStandaloneView: React.FC<ClientPortalStandaloneViewProps> = ({
  initialToken,
  onExit,
}) => {
  const { projects, tasks, files, settings, logActivity, addNotification } = useDatabase();

  // Read token from props or URL
  const [tokenInput, setTokenInput] = useState(() => {
    if (initialToken) return initialToken;
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      return params.get('token') || params.get('portalToken') || '';
    }
    return '';
  });

  const [activeToken, setActiveToken] = useState<string>(() => {
    if (initialToken) return initialToken;
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      return params.get('token') || params.get('portalToken') || '';
    }
    return '';
  });

  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackSent, setFeedbackSent] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const hasLoggedEntry = useRef<string | null>(null);

  // Match project by token
  const matchedProject = useMemo(() => {
    if (!activeToken) return null;
    const cleanToken = activeToken.trim();

    // 1. Direct match with portalToken
    const directMatch = projects.find((p) => p.portalToken === cleanToken);
    if (directMatch) return directMatch;

    // 2. Match by prefix/subtoken (e.g. demo_proj_1 or proj_1)
    const idMatch = projects.find(
      (p) =>
        cleanToken.includes(p.id) ||
        (p.portalToken && cleanToken.includes(p.portalToken))
    );
    if (idMatch) return idMatch;

    return null;
  }, [projects, activeToken]);

  // Tasks and Files associated with the project
  const projectTasks = useMemo(() => {
    if (!matchedProject) return [];
    return tasks.filter((t) => t.projectId === matchedProject.id);
  }, [tasks, matchedProject]);

  const projectFiles = useMemo(() => {
    if (!matchedProject) return [];
    return files.filter((f) => f.projectId === matchedProject.id);
  }, [files, matchedProject]);

  // Completed vs Pending
  const completedTasks = useMemo(() => projectTasks.filter((t) => t.status === 'concluido'), [projectTasks]);
  const ongoingTasks = useMemo(() => projectTasks.filter((t) => t.status === 'em_andamento' || t.status === 'em_revisao'), [projectTasks]);
  const pendingTasks = useMemo(() => projectTasks.filter((t) => t.status === 'a_fazer'), [projectTasks]);

  // Calculated Milestones
  const projectMilestones = useMemo<ProjectMilestone[]>(() => {
    if (!matchedProject) return [];
    if (matchedProject.milestones && matchedProject.milestones.length > 0) {
      return matchedProject.milestones;
    }

    // Default roadmap based on status & tasks
    return [
      {
        id: 'm_1',
        title: 'Alinhamento & Briefing Estratégico',
        description: 'Definição de escopo, personas e levantamento de referências visuais.',
        status: 'concluido',
        targetDate: matchedProject.startDate,
        completedAt: matchedProject.startDate,
      },
      {
        id: 'm_2',
        title: 'Design de Interface (UI/UX no Figma)',
        description: 'Criação de protótipos de alta fidelidade para desktop e mobile.',
        status: matchedProject.progress >= 40 ? 'concluido' : 'em_andamento',
        targetDate: matchedProject.deadline,
      },
      {
        id: 'm_3',
        title: 'Desenvolvimento Front-end & Animações',
        description: 'Codificação dos layouts aprovados com performance e interatividade.',
        status: matchedProject.progress >= 75 ? 'concluido' : matchedProject.progress >= 40 ? 'em_andamento' : 'pendente',
        targetDate: matchedProject.deadline,
      },
      {
        id: 'm_4',
        title: 'Homologação, Revisão & Publicação Final',
        description: 'Testes de responsividade, formulários e apontamento de domínio.',
        status: matchedProject.progress === 100 ? 'concluido' : 'pendente',
        targetDate: matchedProject.deadline,
      },
    ];
  }, [matchedProject]);

  // Log client portal engagement upon token load
  useEffect(() => {
    if (matchedProject && hasLoggedEntry.current !== matchedProject.id) {
      hasLoggedEntry.current = matchedProject.id;
      const now = new Date();
      const timeStr = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      const dateStr = now.toLocaleDateString('pt-BR');

      logActivity(
        `Cliente acessou o Portal do Projeto via Token Seguro`,
        'portal',
        matchedProject.id,
        `Token autenticado: "${activeToken}". Cliente: "${matchedProject.clientName}". Visualizou ${projectTasks.length} entregáveis e ${projectMilestones.length} marcos em ${dateStr} às ${timeStr}.`
      );

      addNotification({
        title: 'Acesso ao Portal do Cliente',
        message: `${matchedProject.clientName} autenticou via token seguro e visualizou o status de "${matchedProject.name}".`,
        type: 'projeto',
        entityId: matchedProject.id,
      });
    }
  }, [matchedProject, activeToken, projectTasks.length, projectMilestones.length, logActivity, addNotification]);

  const handleValidateToken = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tokenInput.trim()) {
      setErrorMessage('Por favor, informe o token de acesso seguro do cliente.');
      return;
    }
    setErrorMessage('');
    setActiveToken(tokenInput.trim());
  };

  const handleCopyLink = () => {
    if (!matchedProject) return;
    const token = matchedProject.portalToken || `token_${matchedProject.id}`;
    const portalUrl = `${window.location.origin}/?token=${token}`;
    navigator.clipboard.writeText(portalUrl);
    setCopiedLink(true);

    logActivity(
      `Copiou link de acesso seguro ao Portal do Cliente`,
      'portal',
      matchedProject.id,
      `URL com token: ${portalUrl}`
    );

    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleSendFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackText.trim() || !matchedProject) return;

    const msg = feedbackText.trim();
    const now = new Date();
    const timeStr = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    logActivity(
      `Mensagem enviada no Portal do Cliente por "${matchedProject.clientName}"`,
      'portal',
      matchedProject.id,
      `Conteúdo: "${msg}" (enviado às ${timeStr})`
    );

    addNotification({
      title: `Mensagem no Portal (${matchedProject.name})`,
      message: `${matchedProject.clientName} enviou: "${msg}"`,
      type: 'projeto',
      entityId: matchedProject.id,
    });

    setFeedbackSent(true);
    setFeedbackText('');
    setTimeout(() => setFeedbackSent(false), 4000);
  };

  const handleDownloadFile = (file: ProjectFile) => {
    if (!matchedProject) return;
    logActivity(
      `Download de arquivo realizado no Portal pelo Cliente`,
      'portal',
      matchedProject.id,
      `Arquivo: "${file.name}" • Categoria: ${file.category}`
    );
  };

  // If no project matches the token or no token entered yet
  if (!matchedProject) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center p-4">
        <Card padding="lg" className="max-w-md w-full shadow-xl border-t-4 border-t-indigo-600 space-y-6">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto shadow-sm">
              <KeyRound className="w-7 h-7" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Portal do Cliente • Acesso Seguro
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Insira o token de segurança de leitura fornecido pelo seu desenvolvedor para acompanhar o cronograma, entregáveis e arquivos do seu projeto.
            </p>
          </div>

          <form onSubmit={handleValidateToken} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Token de Acesso (Read-Only)
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={tokenInput}
                  onChange={(e) => {
                    setTokenInput(e.target.value);
                    if (errorMessage) setErrorMessage('');
                  }}
                  placeholder="Ex: token_camila_duarte_8f92a1"
                  className="w-full pl-9 pr-3 py-2.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none text-slate-900 dark:text-white font-mono"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>
              {errorMessage && (
                <p className="text-[11px] text-rose-500 mt-1 flex items-center gap-1 font-medium">
                  <AlertCircle className="w-3.5 h-3.5" /> {errorMessage}
                </p>
              )}
            </div>

            <Button
              type="submit"
              variant="primary"
              size="md"
              className="w-full font-bold shadow-md shadow-indigo-600/20"
              leftIcon={<KeyRound className="w-4 h-4" />}
            >
              Acessar Portal do Projeto
            </Button>
          </form>

          {/* Quick Demo Tokens for testing */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block text-center">
              Ou selecione um projeto para demonstração:
            </span>
            <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
              {projects.slice(0, 4).map((p) => {
                const token = p.portalToken || `token_${p.id}`;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      setTokenInput(token);
                      setActiveToken(token);
                    }}
                    className="w-full p-2 text-left rounded-lg bg-slate-50 dark:bg-slate-850 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 border border-slate-200 dark:border-slate-800 transition-all flex items-center justify-between text-xs group"
                  >
                    <div className="truncate pr-2">
                      <span className="font-semibold text-slate-900 dark:text-white block group-hover:text-indigo-600 truncate">
                        {p.name}
                      </span>
                      <span className="text-[10px] text-slate-400">{p.clientName}</span>
                    </div>
                    <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-mono shrink-0">
                      Entrar →
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {onExit && (
            <div className="text-center pt-1">
              <button
                type="button"
                onClick={onExit}
                className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-300 font-medium"
              >
                ← Voltar ao Sistema Principal
              </button>
            </div>
          )}
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      {/* Top Banner: Read-Only Token Indicator */}
      <div className="p-3.5 rounded-2xl bg-indigo-950 text-white shadow-lg flex flex-col sm:flex-row items-center justify-between gap-3 border border-indigo-800/60">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-indigo-800 text-indigo-200 shrink-0">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-200">
                Portal do Cliente • Acesso Seguro Read-Only
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30 flex items-center gap-1">
                <CheckCircle className="w-3 h-3 text-emerald-400" /> Token Validado
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/30 text-indigo-200 font-mono">
                {activeToken.slice(0, 16)}...
              </span>
            </div>
            <p className="text-xs text-indigo-200 mt-0.5">
              Visualização restrita para <strong>{matchedProject.clientName}</strong>. Dados financeiros e CRM internos são rigorosamente protegidos.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            size="sm"
            variant="secondary"
            onClick={handleCopyLink}
            leftIcon={copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            className="text-xs bg-white/10 hover:bg-white/20 text-white border-white/20"
          >
            {copiedLink ? 'Link Copiado!' : 'Copiar Link'}
          </Button>

          {onExit && (
            <Button
              size="sm"
              variant="primary"
              onClick={onExit}
              leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}
              className="text-xs bg-white text-indigo-950 hover:bg-indigo-50 font-bold"
            >
              Sair da Visão Cliente
            </Button>
          )}
        </div>
      </div>

      {/* Branded Project Overview Card */}
      <Card padding="lg" className="border-t-4 border-t-indigo-600 space-y-6 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white font-black text-xl flex items-center justify-center shadow-md shadow-indigo-500/20">
              {settings.tradeName ? settings.tradeName.slice(0, 2).toUpperCase() : 'SO'}
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                {settings.tradeName || settings.companyName || 'StudioOS'} • Status do Projeto
              </span>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                {matchedProject.name}
              </h1>
              <p className="text-xs text-slate-500">
                Cliente: <strong className="text-slate-700 dark:text-slate-300">{matchedProject.clientName}</strong> • Categoria: {matchedProject.type}
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:items-end gap-1.5">
            <div className="flex items-center gap-2">
              <Badge status={matchedProject.status} size="md" />
            </div>
            <span className="text-xs text-slate-400">
              Previsão de Entrega: <strong className="text-slate-700 dark:text-slate-300">{new Date(matchedProject.deadline).toLocaleDateString('pt-BR')}</strong>
            </span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-slate-700 dark:text-slate-300">Progresso Geral das Entregas</span>
            <span className="text-indigo-600 dark:text-indigo-400 text-sm">{matchedProject.progress}% Concluído</span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-3 rounded-full overflow-hidden p-0.5 border border-slate-200 dark:border-slate-700">
            <div
              className="bg-gradient-to-r from-indigo-600 to-indigo-500 h-full rounded-full transition-all duration-500 shadow-sm"
              style={{ width: `${matchedProject.progress}%` }}
            />
          </div>
        </div>

        {/* Prototype & Staging Environment Links */}
        {(matchedProject.stagingUrl || matchedProject.figmaUrl) && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {matchedProject.stagingUrl && (
              <a
                href={matchedProject.stagingUrl}
                target="_blank"
                rel="noreferrer"
                className="p-3.5 rounded-xl border border-indigo-200 dark:border-indigo-900/60 bg-indigo-50/50 dark:bg-indigo-950/20 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-indigo-600 text-white shadow-xs">
                    <ExternalLink className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-indigo-600">
                      Ambiente de Homologação / Staging
                    </h4>
                    <p className="text-[11px] text-slate-500">Navegue e teste a versão atualizada do projeto online</p>
                  </div>
                </div>
                <ArrowLeft className="w-4 h-4 rotate-180 text-indigo-600 dark:text-indigo-400 group-hover:translate-x-0.5 transition-transform" />
              </a>
            )}

            {matchedProject.figmaUrl && (
              <a
                href={matchedProject.figmaUrl}
                target="_blank"
                rel="noreferrer"
                className="p-3.5 rounded-xl border border-purple-200 dark:border-purple-900/60 bg-purple-50/50 dark:bg-purple-950/20 hover:bg-purple-50 dark:hover:bg-purple-950/40 transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-purple-600 text-white shadow-xs">
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

      {/* Grid: Milestones Roadmap & Tasks Completion Status */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (8 cols): Milestones Roadmap & Task Checklist */}
        <div className="lg:col-span-8 space-y-6">
          {/* Project Milestones Timeline */}
          <Card padding="md" className="space-y-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Calendar className="w-4 h-4 text-indigo-600" />
                Marcos do Projeto & Cronograma de Entregas ({projectMilestones.length})
              </h3>
              <p className="text-xs text-slate-500">
                Acompanhe o status e a data prevista para cada uma das grandes etapas do projeto.
              </p>
            </div>

            <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
              {projectMilestones.map((m, idx) => {
                const isCompleted = m.status === 'concluido';
                const isOngoing = m.status === 'em_andamento';

                return (
                  <div key={m.id || idx} className="relative group">
                    <div
                      className={`absolute -left-[23px] top-1 w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        isCompleted
                          ? 'bg-emerald-600 border-emerald-600 text-white'
                          : isOngoing
                          ? 'bg-indigo-600 border-indigo-600 text-white ring-4 ring-indigo-100 dark:ring-indigo-950'
                          : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-400'
                      }`}
                    >
                      {isCompleted ? (
                        <Check className="w-3 h-3 stroke-[3]" />
                      ) : isOngoing ? (
                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                      ) : (
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-600" />
                      )}
                    </div>

                    <div
                      className={`p-3.5 rounded-xl border transition-all ${
                        isCompleted
                          ? 'bg-emerald-50/30 dark:bg-emerald-950/20 border-emerald-200/70 dark:border-emerald-900/40'
                          : isOngoing
                          ? 'bg-indigo-50/40 dark:bg-indigo-950/30 border-indigo-200 dark:border-indigo-900/60 shadow-xs'
                          : 'bg-slate-50/50 dark:bg-slate-850/50 border-slate-200 dark:border-slate-800'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white">{m.title}</h4>
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                              isCompleted
                                ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                                : isOngoing
                                ? 'bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                            }`}
                          >
                            {isCompleted ? 'Concluído' : isOngoing ? 'Em Execução' : 'Pendente'}
                          </span>
                          <span className="text-[11px] text-slate-400">
                            Prazo: {new Date(m.targetDate).toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                      </div>
                      {m.description && (
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                          {m.description}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Task Completion Status & Deliverables Checklist */}
          <Card padding="md" className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Status de Conclusão de Tarefas & Entregáveis ({completedTasks.length}/{projectTasks.length})
                </h3>
                <p className="text-xs text-slate-500">
                  Visão detalhada de cada item do escopo técnico acordado.
                </p>
              </div>
            </div>

            {projectTasks.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">Nenhuma tarefa pública cadastrada para este projeto.</p>
            ) : (
              <div className="space-y-2.5">
                {projectTasks.map((t) => {
                  const isDone = t.status === 'concluido';
                  const isRunning = t.status === 'em_andamento' || t.status === 'em_revisao';

                  return (
                    <div
                      key={t.id}
                      className={`p-3 rounded-xl border transition-all flex items-start justify-between gap-3 ${
                        isDone
                          ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/60'
                          : isRunning
                          ? 'bg-indigo-50/30 dark:bg-indigo-950/20 border-indigo-200 dark:border-indigo-900/50'
                          : 'bg-white dark:bg-slate-850 border-slate-200 dark:border-slate-800'
                      }`}
                    >
                      <div className="flex items-start gap-2.5">
                        <div
                          className={`mt-0.5 p-1 rounded-full shrink-0 ${
                            isDone
                              ? 'bg-emerald-600 text-white'
                              : isRunning
                              ? 'bg-indigo-600 text-white'
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
                              : isRunning
                              ? 'bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                          }`}
                        >
                          {isDone ? 'Concluído' : isRunning ? 'Em Andamento' : 'A Fazer'}
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
        </div>

        {/* Right Column (4 cols): Associated Files & Feedback Form */}
        <div className="lg:col-span-4 space-y-6">
          {/* Associated Files for Download */}
          <Card padding="md" className="space-y-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-600" />
                Arquivos & Entregáveis ({projectFiles.length})
              </h3>
              <p className="text-xs text-slate-500">
                Documentos e arquivos disponíveis para download.
              </p>
            </div>

            {projectFiles.length === 0 ? (
              <p className="text-xs text-slate-400 py-3 text-center">Nenhum arquivo anexado no momento.</p>
            ) : (
              <div className="space-y-2">
                {projectFiles.map((file) => (
                  <div
                    key={file.id}
                    className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-850/60 flex items-center justify-between gap-3 text-xs hover:border-indigo-400 transition-all"
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
                      onClick={() => handleDownloadFile(file)}
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

          {/* Feedback & Client Messaging Form */}
          <Card padding="md" className="space-y-3 bg-gradient-to-br from-indigo-50/50 to-purple-50/30 dark:from-slate-850 dark:to-indigo-950/20 border-indigo-100 dark:border-indigo-900/40">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-indigo-600" />
              Canal de Dúvidas / Feedback
            </h3>
            <p className="text-xs text-slate-500">
              Envie dúvidas, solicitações ou observações diretamente para a equipe responsável.
            </p>

            <form onSubmit={handleSendFeedback} className="space-y-2">
              <textarea
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                placeholder="Escreva sua solicitação de ajuste ou feedback..."
                rows={3}
                className="w-full p-2.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-900 dark:text-white"
              />

              <Button
                type="submit"
                size="sm"
                variant="primary"
                disabled={!feedbackText.trim()}
                leftIcon={<Send className="w-3.5 h-3.5" />}
                className="w-full text-xs font-bold"
              >
                Enviar Mensagem
              </Button>

              {feedbackSent && (
                <p className="text-[11px] text-emerald-600 font-semibold text-center mt-1 animate-in fade-in">
                  Mensagem enviada com sucesso! Nossa equipe foi notificada.
                </p>
              )}
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
};
