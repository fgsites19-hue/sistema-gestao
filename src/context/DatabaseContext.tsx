import React, { createContext, useContext, useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  Client,
  Lead,
  Project,
  Task,
  TaskTimeLog,
  Proposal,
  Contract,
  ContractTemplate,
  FinancialTransaction,
  FinancialInstallment,
  RecurringService,
  ProjectFile,
  CalendarEvent,
  ActivityLog,
  NotificationItem,
  ProjectTemplate,
  UserSettings,
  UserProfile,
  TaskStatus,
  LeadStatus,
  ProjectStatus,
  ContractStatus,
  ProposalStatus,
  PaymentStatus,
  PaymentMethod,
} from '../types';
import {
  initialClients,
  initialLeads,
  initialProjects,
  initialTasks,
  initialProposals,
  initialContracts,
  initialContractTemplates,
  initialInstallments,
  initialTransactions,
  initialRecurringServices,
  initialFiles,
  initialEvents,
  initialActivityLogs,
  initialNotifications,
  initialProjectTemplates,
  initialSettings,
  initialUser,
} from '../data/seedData';

interface DatabaseContextType {
  // Auth & Profile
  user: UserProfile;
  settings: UserSettings;
  updateSettings: (newSettings: Partial<UserSettings>) => void;
  updateUser: (newUser: Partial<UserProfile>) => void;

  // Theme
  theme: 'light' | 'dark' | 'system';
  setTheme: (theme: 'light' | 'dark' | 'system') => void;

  // Leads
  leads: Lead[];
  addLead: (lead: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>) => Lead;
  updateLead: (id: string, lead: Partial<Lead>) => void;
  updateLeadStatus: (id: string, status: LeadStatus) => void;
  deleteLead: (id: string) => void;
  convertLeadToClient: (leadId: string) => Client;

  // Clients
  clients: Client[];
  addClient: (client: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>) => Client;
  updateClient: (id: string, client: Partial<Client>) => void;
  deleteClient: (id: string) => void;

  // Projects
  projects: Project[];
  addProject: (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>, options?: {
    templateId?: string;
    installmentsCount?: number;
    initialPayment?: number;
    createContract?: boolean;
  }) => Project;
  updateProject: (id: string, project: Partial<Project>) => void;
  updateProjectStatus: (id: string, status: ProjectStatus) => void;
  deleteProject: (id: string) => void;

  // Tasks
  tasks: Task[];
  addTask: (task: Omit<Task, 'id' | 'createdAt'>) => Task;
  updateTask: (id: string, task: Partial<Task>) => void;
  updateTaskStatus: (id: string, status: TaskStatus) => void;
  deleteTask: (id: string) => void;
  activeTimerTask?: Task;
  startTaskTimer: (taskId: string) => void;
  stopTaskTimer: (taskId: string, notes?: string) => void;
  logTaskManualTime: (taskId: string, minutes: number, notes?: string) => void;
  allTimeLogs: TaskTimeLog[];

  // Proposals
  proposals: Proposal[];
  addProposal: (proposal: Omit<Proposal, 'id' | 'publicToken' | 'createdAt' | 'updatedAt'>) => Proposal;
  updateProposal: (id: string, proposal: Partial<Proposal>) => void;
  updateProposalStatus: (id: string, status: ProposalStatus) => void;
  deleteProposal: (id: string) => void;
  convertProposalToProject: (proposalId: string) => Project | null;

  // Contracts
  contracts: Contract[];
  contractTemplates: ContractTemplate[];
  addContract: (contract: Omit<Contract, 'id' | 'createdAt' | 'updatedAt'>) => Contract;
  updateContract: (id: string, contract: Partial<Contract>) => void;
  signContract: (id: string, signerName: string, signerDocument: string) => void;
  deleteContract: (id: string) => void;
  addContractTemplate: (tmpl: Omit<ContractTemplate, 'id'>) => void;

  // Financial
  transactions: FinancialTransaction[];
  installments: FinancialInstallment[];
  addTransaction: (transaction: Omit<FinancialTransaction, 'id' | 'createdAt'>) => FinancialTransaction;
  updateTransaction: (id: string, transaction: Partial<FinancialTransaction>) => void;
  markTransactionPaid: (id: string, paymentMethod?: PaymentMethod) => void;
  deleteTransaction: (id: string) => void;
  addInstallment: (installment: Omit<FinancialInstallment, 'id' | 'createdAt'>) => FinancialInstallment;
  updateInstallment: (id: string, installment: Partial<FinancialInstallment>) => void;
  markInstallmentPaid: (id: string, paymentMethod?: PaymentMethod) => void;
  deleteInstallment: (id: string) => void;

  // Recurring Services
  recurringServices: RecurringService[];
  addRecurringService: (service: Omit<RecurringService, 'id' | 'createdAt'>) => RecurringService;
  updateRecurringService: (id: string, service: Partial<RecurringService>) => void;
  deleteRecurringService: (id: string) => void;

  // Files
  files: ProjectFile[];
  addFile: (file: Omit<ProjectFile, 'id' | 'createdAt'>) => ProjectFile;
  updateFile: (id: string, fileData: Partial<ProjectFile>) => void;
  deleteFile: (id: string) => void;

  // Events & Calendar
  events: CalendarEvent[];
  addEvent: (event: Omit<CalendarEvent, 'id' | 'createdAt'>) => CalendarEvent;
  updateEvent: (id: string, event: Partial<CalendarEvent>) => void;
  deleteEvent: (id: string) => void;

  // Activity Logs & Notifications
  activityLogs: ActivityLog[];
  notifications: NotificationItem[];
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  addNotification: (
    title: string,
    message: string,
    type: NotificationItem['type'],
    linkTab?: string,
    entityId?: string
  ) => void;
  logActivity: (action: string, entityType: ActivityLog['entityType'], entityId?: string, details?: string) => void;

  // Bulk operations
  bulkArchiveProjects: (projectIds: string[]) => void;
  bulkDeleteProjects: (projectIds: string[]) => void;
  bulkUpdateProjectsStatus: (projectIds: string[], status: ProjectStatus) => void;
  bulkDeleteTasks: (taskIds: string[]) => void;
  bulkUpdateTasksStatus: (taskIds: string[], status: TaskStatus) => void;
  bulkArchiveTasks: (taskIds: string[]) => void;

  // Background Worker Services
  checkAndProcessRecurringInvoices: () => number;

  // Templates
  projectTemplates: ProjectTemplate[];

  // Global Utils & Reset
  resetToSeedData: () => void;
  triggerCelebration: () => void;
}

const DatabaseContext = createContext<DatabaseContextType | undefined>(undefined);

const STORAGE_PREFIX = 'studioos_db_v1_';

export const DatabaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load state from localStorage or seed
  const load = <T,>(key: string, fallback: T): T => {
    try {
      const stored = localStorage.getItem(STORAGE_PREFIX + key);
      return stored ? JSON.parse(stored) : fallback;
    } catch (e) {
      console.warn(`Error loading ${key} from storage:`, e);
      return fallback;
    }
  };

  const [user, setUser] = useState<UserProfile>(() => load('user', initialUser));
  const [settings, setSettings] = useState<UserSettings>(() => load('settings', initialSettings));
  const [theme, setThemeState] = useState<'light' | 'dark' | 'system'>(() => {
    return load<'light' | 'dark' | 'system'>('theme', 'system');
  });

  const setTheme = (newTheme: 'light' | 'dark' | 'system') => {
    setThemeState(newTheme);
    setSettings((prev) => ({ ...prev, theme: newTheme }));
  };

  useEffect(() => {
    const root = document.documentElement;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const applyTheme = () => {
      let isDark = false;
      if (theme === 'dark') {
        isDark = true;
      } else if (theme === 'light') {
        isDark = false;
      } else {
        isDark = mediaQuery.matches;
      }

      if (isDark) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    };

    applyTheme();
    try {
      localStorage.setItem(STORAGE_PREFIX + 'theme', JSON.stringify(theme));
    } catch {}

    const listener = () => {
      if (theme === 'system') {
        applyTheme();
      }
    };

    mediaQuery.addEventListener('change', listener);
    return () => mediaQuery.removeEventListener('change', listener);
  }, [theme]);
  const [leads, setLeads] = useState<Lead[]>(() => load('leads', initialLeads));
  const [clients, setClients] = useState<Client[]>(() => load('clients', initialClients));
  const [projects, setProjects] = useState<Project[]>(() => load('projects', initialProjects));
  const [tasks, setTasks] = useState<Task[]>(() => load('tasks', initialTasks));
  const [proposals, setProposals] = useState<Proposal[]>(() => load('proposals', initialProposals));
  const [contracts, setContracts] = useState<Contract[]>(() => load('contracts', initialContracts));
  const [contractTemplates, setContractTemplates] = useState<ContractTemplate[]>(() =>
    load('contract_templates', initialContractTemplates)
  );
  const [transactions, setTransactions] = useState<FinancialTransaction[]>(() =>
    load('transactions', initialTransactions)
  );
  const [installments, setInstallments] = useState<FinancialInstallment[]>(() =>
    load('installments', initialInstallments)
  );
  const [recurringServices, setRecurringServices] = useState<RecurringService[]>(() =>
    load('recurring_services', initialRecurringServices)
  );
  const [files, setFiles] = useState<ProjectFile[]>(() => load('files', initialFiles));
  const [events, setEvents] = useState<CalendarEvent[]>(() => load('events', initialEvents));
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(() =>
    load('activity_logs', initialActivityLogs)
  );
  const [notifications, setNotifications] = useState<NotificationItem[]>(() =>
    load('notifications', initialNotifications)
  );
  const [projectTemplates] = useState<ProjectTemplate[]>(() =>
    load('project_templates', initialProjectTemplates)
  );

  // Sync state changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_PREFIX + 'user', JSON.stringify(user));
      localStorage.setItem(STORAGE_PREFIX + 'settings', JSON.stringify(settings));
      localStorage.setItem(STORAGE_PREFIX + 'leads', JSON.stringify(leads));
      localStorage.setItem(STORAGE_PREFIX + 'clients', JSON.stringify(clients));
      localStorage.setItem(STORAGE_PREFIX + 'projects', JSON.stringify(projects));
      localStorage.setItem(STORAGE_PREFIX + 'tasks', JSON.stringify(tasks));
      localStorage.setItem(STORAGE_PREFIX + 'proposals', JSON.stringify(proposals));
      localStorage.setItem(STORAGE_PREFIX + 'contracts', JSON.stringify(contracts));
      localStorage.setItem(STORAGE_PREFIX + 'contract_templates', JSON.stringify(contractTemplates));
      localStorage.setItem(STORAGE_PREFIX + 'transactions', JSON.stringify(transactions));
      localStorage.setItem(STORAGE_PREFIX + 'installments', JSON.stringify(installments));
      localStorage.setItem(STORAGE_PREFIX + 'recurring_services', JSON.stringify(recurringServices));
      localStorage.setItem(STORAGE_PREFIX + 'files', JSON.stringify(files));
      localStorage.setItem(STORAGE_PREFIX + 'events', JSON.stringify(events));
      localStorage.setItem(STORAGE_PREFIX + 'activity_logs', JSON.stringify(activityLogs));
      localStorage.setItem(STORAGE_PREFIX + 'notifications', JSON.stringify(notifications));
      localStorage.setItem(STORAGE_PREFIX + 'project_templates', JSON.stringify(projectTemplates));
    } catch (e) {
      console.warn('Storage sync failed:', e);
    }
  }, [
    user,
    settings,
    leads,
    clients,
    projects,
    tasks,
    proposals,
    contracts,
    contractTemplates,
    transactions,
    installments,
    recurringServices,
    files,
    events,
    activityLogs,
    notifications,
    projectTemplates,
  ]);

  const triggerCelebration = () => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#10B981', '#6366F1', '#F59E0B', '#3B82F6'],
      });
    } catch (e) {
      console.log('Celebration triggered');
    }
  };

  const logActivity = (
    action: string,
    entityType: ActivityLog['entityType'],
    entityId?: string,
    details?: string
  ) => {
    const newLog: ActivityLog = {
      id: 'act_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      userId: user.id,
      userName: user.name,
      action,
      entityType,
      entityId,
      details,
      createdAt: new Date().toISOString(),
    };
    setActivityLogs((prev) => [newLog, ...prev]);
  };

  const addNotification = (
    title: string,
    message: string,
    type: NotificationItem['type'],
    linkTab?: string,
    entityId?: string
  ) => {
    const newNotif: NotificationItem = {
      id: 'notif_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      title,
      message,
      type,
      isRead: false,
      linkTab,
      entityId,
      createdAt: new Date().toISOString(),
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  // Reset database to seed
  const resetToSeedData = () => {
    setUser(initialUser);
    setSettings(initialSettings);
    setLeads(initialLeads);
    setClients(initialClients);
    setProjects(initialProjects);
    setTasks(initialTasks);
    setProposals(initialProposals);
    setContracts(initialContracts);
    setContractTemplates(initialContractTemplates);
    setTransactions(initialTransactions);
    setInstallments(initialInstallments);
    setRecurringServices(initialRecurringServices);
    setFiles(initialFiles);
    setEvents(initialEvents);
    setActivityLogs(initialActivityLogs);
    setNotifications(initialNotifications);
    logActivity('Restaurou a base de dados de demonstração inicial', 'configuracao');
  };

  // Profile & Settings
  const updateSettings = (newSettings: Partial<UserSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
    logActivity('Atualizou as configurações da empresa', 'configuracao');
  };

  const updateUser = (newUser: Partial<UserProfile>) => {
    setUser((prev) => ({ ...prev, ...newUser }));
    logActivity('Atualizou o perfil de usuário', 'configuracao');
  };

  // LEADS
  const addLead = (leadData: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>): Lead => {
    const now = new Date().toISOString();
    const newLead: Lead = {
      ...leadData,
      id: 'lead_' + Date.now(),
      createdAt: now,
      updatedAt: now,
    };
    setLeads((prev) => [newLead, ...prev]);
    logActivity(`Adicionou novo lead: ${newLead.name} (${newLead.company})`, 'lead', newLead.id);
    return newLead;
  };

  const updateLead = (id: string, leadData: Partial<Lead>) => {
    setLeads((prev) =>
      prev.map((l) => (l.id === id ? { ...l, ...leadData, updatedAt: new Date().toISOString() } : l))
    );
    logActivity(`Atualizou informações do lead`, 'lead', id);
  };

  const updateLeadStatus = (id: string, status: LeadStatus) => {
    setLeads((prev) =>
      prev.map((l) => (l.id === id ? { ...l, status, updatedAt: new Date().toISOString() } : l))
    );
    if (status === 'ganho') {
      triggerCelebration();
    }
  };

  const deleteLead = (id: string) => {
    const lead = leads.find((l) => l.id === id);
    setLeads((prev) => prev.filter((l) => l.id !== id));
    if (lead) {
      logActivity(`Removeu o lead: ${lead.name}`, 'lead', id);
    }
  };

  const convertLeadToClient = (leadId: string): Client => {
    const lead = leads.find((l) => l.id === leadId);
    if (!lead) throw new Error('Lead não encontrado');

    const now = new Date().toISOString();
    const newClient: Client = {
      id: 'cli_' + Date.now(),
      name: lead.name,
      company: lead.company,
      email: lead.email,
      whatsapp: lead.whatsapp,
      phone: lead.whatsapp,
      document: 'Pendente de preenchimento',
      clientType: 'PJ',
      instagram: lead.instagram,
      website: lead.website,
      notes: `Convertido do Lead CRM em ${new Date().toLocaleDateString('pt-BR')}. Notas originais: ${
        lead.notes || 'Sem observações'
      }`,
      status: 'ativo',
      leadId: lead.id,
      createdAt: now,
      updatedAt: now,
    };

    setClients((prev) => [newClient, ...prev]);
    updateLeadStatus(leadId, 'ganho');

    logActivity(`Converteu o lead ${lead.name} em Cliente Ativo`, 'cliente', newClient.id);
    addNotification(
      'Lead Convertido em Cliente',
      `${lead.name} (${lead.company}) agora é um cliente oficial!`,
      'lead',
      'clientes',
      newClient.id
    );
    triggerCelebration();
    return newClient;
  };

  // CLIENTS
  const addClient = (clientData: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>): Client => {
    const now = new Date().toISOString();
    const newClient: Client = {
      ...clientData,
      id: 'cli_' + Date.now(),
      createdAt: now,
      updatedAt: now,
    };
    setClients((prev) => [newClient, ...prev]);
    logActivity(`Cadastrou o cliente: ${newClient.name} (${newClient.company})`, 'cliente', newClient.id);
    return newClient;
  };

  const updateClient = (id: string, clientData: Partial<Client>) => {
    setClients((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...clientData, updatedAt: new Date().toISOString() } : c))
    );
    logActivity(`Atualizou os dados do cliente`, 'cliente', id);
  };

  const deleteClient = (id: string) => {
    const client = clients.find((c) => c.id === id);
    setClients((prev) => prev.filter((c) => c.id !== id));
    if (client) {
      logActivity(`Removeu o cliente: ${client.name}`, 'cliente', id);
    }
  };

  // PROJECTS
  const addProject = (
    projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>,
    options?: {
      templateId?: string;
      installmentsCount?: number;
      initialPayment?: number;
      createContract?: boolean;
    }
  ): Project => {
    const now = new Date().toISOString();
    const projectId = 'proj_' + Date.now();
    const newProject: Project = {
      ...projectData,
      id: projectId,
      createdAt: now,
      updatedAt: now,
    };

    setProjects((prev) => [newProject, ...prev]);
    logActivity(
      `Criou o projeto "${newProject.name}" para ${newProject.clientName} (R$ ${newProject.value.toLocaleString(
        'pt-BR'
      )})`,
      'projeto',
      projectId
    );

    // Apply template tasks if selected
    if (options?.templateId) {
      const tmpl = projectTemplates.find((t) => t.id === options.templateId);
      if (tmpl && tmpl.tasks.length > 0) {
        const createdTasks: Task[] = tmpl.tasks.map((t, idx) => {
          const taskDeadline = new Date(projectData.startDate || Date.now());
          taskDeadline.setDate(taskDeadline.getDate() + (t.estimatedDays || (idx + 1) * 2));
          return {
            id: 'tsk_' + Date.now() + '_' + idx,
            projectId: projectId,
            projectName: newProject.name,
            clientId: newProject.clientId,
            clientName: newProject.clientName,
            title: t.title,
            description: t.description || '',
            priority: t.priority,
            status: idx === 0 ? 'em_andamento' : 'a_fazer',
            deadline: taskDeadline.toISOString().split('T')[0],
            createdAt: now,
          };
        });
        setTasks((prev) => [...createdTasks, ...prev]);
      }
    }

    // Auto-generate financial installments
    const count = options?.installmentsCount || 1;
    const initialPay = options?.initialPayment || 0;
    const remainingVal = Math.max(0, newProject.value - initialPay);

    if (count === 1) {
      // 1 single installment
      const inst: FinancialInstallment = {
        id: 'inst_' + Date.now() + '_1',
        projectId: projectId,
        projectName: newProject.name,
        clientId: newProject.clientId,
        clientName: newProject.clientName,
        installmentNumber: 1,
        totalInstallments: 1,
        value: newProject.value,
        dueDate: newProject.startDate || new Date().toISOString().split('T')[0],
        paymentMethod: 'pix',
        status: 'pendente',
        createdAt: now,
      };
      setInstallments((prev) => [inst, ...prev]);
    } else {
      const generatedInsts: FinancialInstallment[] = [];
      let instNum = 1;
      const baseDate = new Date(newProject.startDate || Date.now());

      if (initialPay > 0) {
        generatedInsts.push({
          id: 'inst_' + Date.now() + '_0',
          projectId: projectId,
          projectName: newProject.name,
          clientId: newProject.clientId,
          clientName: newProject.clientName,
          installmentNumber: instNum++,
          totalInstallments: count,
          value: initialPay,
          dueDate: baseDate.toISOString().split('T')[0],
          paymentMethod: 'pix',
          status: 'pendente',
          createdAt: now,
        });
      }

      const regularCount = initialPay > 0 ? count - 1 : count;
      const regularVal = Math.round((remainingVal / regularCount) * 100) / 100;

      for (let i = 1; i <= regularCount; i++) {
        const d = new Date(baseDate);
        d.setMonth(d.getMonth() + i);
        generatedInsts.push({
          id: 'inst_' + Date.now() + '_' + i,
          projectId: projectId,
          projectName: newProject.name,
          clientId: newProject.clientId,
          clientName: newProject.clientName,
          installmentNumber: instNum++,
          totalInstallments: count,
          value: regularVal,
          dueDate: d.toISOString().split('T')[0],
          paymentMethod: 'pix',
          status: 'pendente',
          createdAt: now,
        });
      }
      setInstallments((prev) => [...generatedInsts, ...prev]);
    }

    // Auto create contract if option checked
    if (options?.createContract) {
      const defaultTmpl = contractTemplates.find((t) => t.isDefault) || contractTemplates[0];
      const client = clients.find((c) => c.id === newProject.clientId);
      const replacedContent = (defaultTmpl?.content || '')
        .replace(/{{empresa}}/g, settings.companyName)
        .replace(/{{empresa_cnpj}}/g, settings.document)
        .replace(/{{empresa_endereco}}/g, settings.address)
        .replace(/{{cliente_nome}}/g, newProject.clientName)
        .replace(/{{cliente_cpf_cnpj}}/g, client?.document || 'A preencher')
        .replace(/{{empresa_cliente}}/g, client?.company || newProject.clientName)
        .replace(/{{projeto}}/g, newProject.name)
        .replace(/{{valor}}/g, newProject.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 }))
        .replace(/{{data_inicio}}/g, newProject.startDate)
        .replace(/{{data_entrega}}/g, newProject.deadline)
        .replace(/{{data_atual}}/g, new Date().toLocaleDateString('pt-BR'));

      const newContract: Contract = {
        id: 'ctr_' + Date.now(),
        clientId: newProject.clientId,
        clientName: newProject.clientName,
        projectId: projectId,
        projectName: newProject.name,
        title: `Contrato de Prestação de Serviços - ${newProject.name}`,
        type: 'Desenvolvimento Web',
        value: newProject.value,
        startDate: newProject.startDate,
        deadline: newProject.deadline,
        status: 'aguardando_assinatura',
        content: replacedContent,
        createdAt: now,
        updatedAt: now,
      };

      setContracts((prev) => [newContract, ...prev]);
      newProject.contractId = newContract.id;
    }

    addNotification(
      'Novo Projeto Criado',
      `O projeto "${newProject.name}" foi registrado com sucesso.`,
      'projeto',
      'projetos',
      projectId
    );

    return newProject;
  };

  const updateProject = (id: string, projectData: Partial<Project>) => {
    setProjects((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...projectData, updatedAt: new Date().toISOString() } : p))
    );
    logActivity(`Atualizou os dados do projeto`, 'projeto', id);
  };

  const updateProjectStatus = (id: string, status: ProjectStatus) => {
    const now = new Date().toISOString();
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          const isFinished = status === 'entregue';
          return {
            ...p,
            status,
            progress: isFinished ? 100 : p.progress,
            deliveryDate: isFinished ? now.split('T')[0] : p.deliveryDate,
            updatedAt: now,
          };
        }
        return p;
      })
    );

    if (status === 'entregue') {
      triggerCelebration();
      const proj = projects.find((p) => p.id === id);
      addNotification(
        'Projeto Concluído & Entregue!',
        `Parabéns! O projeto "${proj?.name}" foi finalizado. Considere oferecer um plano de manutenção mensal ao cliente!`,
        'projeto',
        'projetos',
        id
      );
    }
  };

  const deleteProject = (id: string) => {
    const proj = projects.find((p) => p.id === id);
    setProjects((prev) => prev.filter((p) => p.id !== id));
    if (proj) {
      logActivity(`Removeu o projeto: ${proj.name}`, 'projeto', id);
    }
  };

  // TASKS
  const addTask = (taskData: Omit<Task, 'id' | 'createdAt'>): Task => {
    const newTask: Task = {
      ...taskData,
      id: 'tsk_' + Date.now(),
      createdAt: new Date().toISOString(),
    };
    setTasks((prev) => [newTask, ...prev]);
    logActivity(`Criou nova tarefa: "${newTask.title}"`, 'tarefa', newTask.id);
    return newTask;
  };

  const updateTask = (id: string, taskData: Partial<Task>) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...taskData } : t)));
  };

  const updateTaskStatus = (id: string, status: TaskStatus) => {
    const now = new Date().toISOString();
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          return {
            ...t,
            status,
            completedAt: status === 'concluido' ? now : undefined,
          };
        }
        return t;
      })
    );

    if (status === 'concluido') {
      const task = tasks.find((t) => t.id === id);
      logActivity(`Concluiu a tarefa: "${task?.title}"`, 'tarefa', id);
    }
  };

  const deleteTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  const activeTimerTask = tasks.find((t) => t.isTimerRunning);

  const startTaskTimer = (taskId: string) => {
    const now = new Date().toISOString();
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          return {
            ...t,
            isTimerRunning: true,
            timerStartedAt: now,
            status: t.status === 'a_fazer' ? 'em_andamento' : t.status,
          };
        }
        // Stop any currently running timer on other tasks
        if (t.isTimerRunning) {
          const started = t.timerStartedAt ? new Date(t.timerStartedAt).getTime() : Date.now();
          const elapsed = Math.max(1, Math.floor((Date.now() - started) / 1000));
          const rate = t.hourlyRate || settings.defaultHourlyRate || 120;
          const costVal = Number(((elapsed / 3600) * rate).toFixed(2));
          const newLog: TaskTimeLog = {
            id: 'log_' + Date.now(),
            taskId: t.id,
            taskTitle: t.title,
            projectId: t.projectId,
            projectName: t.projectName,
            startTime: t.timerStartedAt || now,
            endTime: now,
            durationSeconds: elapsed,
            hourlyRate: rate,
            costValue: costVal,
            notes: 'Sessão cronometrada anterior',
            loggedBy: user.name,
            createdAt: now,
          };
          return {
            ...t,
            isTimerRunning: false,
            timerStartedAt: undefined,
            spentSeconds: (t.spentSeconds || 0) + elapsed,
            timeLogs: [newLog, ...(t.timeLogs || [])],
          };
        }
        return t;
      })
    );
    const target = tasks.find((t) => t.id === taskId);
    logActivity(`Iniciou o cronômetro na tarefa: "${target?.title || taskId}"`, 'tarefa', taskId);
  };

  const stopTaskTimer = (taskId: string, notes?: string) => {
    const now = new Date().toISOString();
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId && t.isTimerRunning) {
          const started = t.timerStartedAt ? new Date(t.timerStartedAt).getTime() : Date.now();
          const elapsed = Math.max(1, Math.floor((Date.now() - started) / 1000));
          const rate = t.hourlyRate || settings.defaultHourlyRate || 120;
          const costVal = Number(((elapsed / 3600) * rate).toFixed(2));
          const newLog: TaskTimeLog = {
            id: 'log_' + Date.now(),
            taskId: t.id,
            taskTitle: t.title,
            projectId: t.projectId,
            projectName: t.projectName,
            startTime: t.timerStartedAt || now,
            endTime: now,
            durationSeconds: elapsed,
            hourlyRate: rate,
            costValue: costVal,
            notes: notes || 'Sessão cronometrada',
            loggedBy: user.name,
            createdAt: now,
          };
          return {
            ...t,
            isTimerRunning: false,
            timerStartedAt: undefined,
            spentSeconds: (t.spentSeconds || 0) + elapsed,
            timeLogs: [newLog, ...(t.timeLogs || [])],
          };
        }
        return t;
      })
    );
    const target = tasks.find((t) => t.id === taskId);
    logActivity(`Finalizou cronômetro na tarefa: "${target?.title || taskId}"`, 'tarefa', taskId);
  };

  const logTaskManualTime = (taskId: string, minutes: number, notes?: string) => {
    const now = new Date().toISOString();
    const durationSeconds = Math.max(60, minutes * 60);
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          const rate = t.hourlyRate || settings.defaultHourlyRate || 120;
          const costVal = Number(((durationSeconds / 3600) * rate).toFixed(2));
          const newLog: TaskTimeLog = {
            id: 'log_' + Date.now(),
            taskId: t.id,
            taskTitle: t.title,
            projectId: t.projectId,
            projectName: t.projectName,
            startTime: now,
            endTime: now,
            durationSeconds,
            hourlyRate: rate,
            costValue: costVal,
            notes: notes || 'Registro manual de horas',
            loggedBy: user.name,
            createdAt: now,
          };
          return {
            ...t,
            spentSeconds: (t.spentSeconds || 0) + durationSeconds,
            timeLogs: [newLog, ...(t.timeLogs || [])],
          };
        }
        return t;
      })
    );
    const target = tasks.find((t) => t.id === taskId);
    logActivity(`Registrou ${minutes} min de trabalho na tarefa: "${target?.title || taskId}"`, 'tarefa', taskId);
  };

  const allTimeLogs = tasks
    .flatMap((t) => t.timeLogs || [])
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  // PROPOSALS
  const addProposal = (
    proposalData: Omit<Proposal, 'id' | 'publicToken' | 'createdAt' | 'updatedAt'>
  ): Proposal => {
    const now = new Date().toISOString();
    const newProp: Proposal = {
      ...proposalData,
      id: 'prop_' + Date.now(),
      publicToken: 'token_' + Math.random().toString(36).substring(2, 10),
      createdAt: now,
      updatedAt: now,
    };
    setProposals((prev) => [newProp, ...prev]);
    logActivity(
      `Criou proposta comercial "${newProp.title}" para ${newProp.clientName} (R$ ${newProp.finalTotal.toLocaleString(
        'pt-BR'
      )})`,
      'proposta',
      newProp.id
    );
    return newProp;
  };

  const updateProposal = (id: string, proposalData: Partial<Proposal>) => {
    setProposals((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...proposalData, updatedAt: new Date().toISOString() } : p))
    );
  };

  const updateProposalStatus = (id: string, status: ProposalStatus) => {
    setProposals((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status, updatedAt: new Date().toISOString() } : p))
    );
    if (status === 'aceita') {
      triggerCelebration();
      const prop = proposals.find((p) => p.id === id);
      addNotification(
        'Proposta Aceita!',
        `A proposta "${prop?.title}" foi aprovada pelo cliente no valor de R$ ${prop?.finalTotal.toLocaleString(
          'pt-BR'
        )}!`,
        'contrato',
        'propostas',
        id
      );
    }
  };

  const deleteProposal = (id: string) => {
    setProposals((prev) => prev.filter((p) => p.id !== id));
  };

  const convertProposalToProject = (proposalId: string): Project | null => {
    const prop = proposals.find((p) => p.id === proposalId);
    if (!prop) return null;

    const newProject = addProject(
      {
        clientId: prop.clientId,
        clientName: prop.clientName,
        name: prop.title.replace(/Proposta Comercial - /i, '').trim(),
        type: 'Site institucional',
        value: prop.finalTotal,
        startDate: new Date().toISOString().split('T')[0],
        deadline: new Date(Date.now() + 25 * 86400000).toISOString().split('T')[0],
        status: 'briefing',
        priority: 'alta',
        progress: 10,
        description: prop.description,
      },
      {
        installmentsCount: 2,
        createContract: true,
      }
    );

    updateProposalStatus(proposalId, 'aceita');
    logActivity(`Converteu proposta em projeto oficial: ${newProject.name}`, 'projeto', newProject.id);
    return newProject;
  };

  // CONTRACTS
  const addContract = (contractData: Omit<Contract, 'id' | 'createdAt' | 'updatedAt'>): Contract => {
    const now = new Date().toISOString();
    const newCtr: Contract = {
      ...contractData,
      id: 'ctr_' + Date.now(),
      createdAt: now,
      updatedAt: now,
    };
    setContracts((prev) => [newCtr, ...prev]);
    logActivity(`Criou contrato "${newCtr.title}" para ${newCtr.clientName}`, 'contrato', newCtr.id);
    return newCtr;
  };

  const updateContract = (id: string, contractData: Partial<Contract>) => {
    setContracts((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...contractData, updatedAt: new Date().toISOString() } : c))
    );
  };

  const signContract = (id: string, signerName: string, signerDocument: string) => {
    const now = new Date().toISOString();
    setContracts((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          return {
            ...c,
            status: 'assinado',
            signedAt: now,
            signerName,
            signerDocument,
            updatedAt: now,
          };
        }
        return c;
      })
    );
    triggerCelebration();
    const ctr = contracts.find((c) => c.id === id);
    logActivity(`Contrato assinado eletronicamente por ${signerName}`, 'contrato', id);
    addNotification(
      'Contrato Assinado!',
      `O contrato "${ctr?.title}" foi assinado por ${signerName}.`,
      'contrato',
      'contratos',
      id
    );
  };

  const deleteContract = (id: string) => {
    setContracts((prev) => prev.filter((c) => c.id !== id));
  };

  const addContractTemplate = (tmpl: Omit<ContractTemplate, 'id'>) => {
    const newTmpl: ContractTemplate = {
      ...tmpl,
      id: 'tmpl_' + Date.now(),
    };
    setContractTemplates((prev) => [...prev, newTmpl]);
  };

  // FINANCIAL TRANSACTIONS & INSTALLMENTS
  const addTransaction = (
    transactionData: Omit<FinancialTransaction, 'id' | 'createdAt'>
  ): FinancialTransaction => {
    const newTrx: FinancialTransaction = {
      ...transactionData,
      id: 'trx_' + Date.now(),
      createdAt: new Date().toISOString(),
    };
    setTransactions((prev) => [newTrx, ...prev]);
    logActivity(
      `Registrou lançamento financeiro (${newTrx.type}): "${
        newTrx.description
      }" no valor de R$ ${newTrx.value.toLocaleString('pt-BR')}`,
      'financeiro',
      newTrx.id
    );
    return newTrx;
  };

  const updateTransaction = (id: string, transactionData: Partial<FinancialTransaction>) => {
    setTransactions((prev) => prev.map((t) => (t.id === id ? { ...t, ...transactionData } : t)));
  };

  const markTransactionPaid = (id: string, paymentMethod: PaymentMethod = 'pix') => {
    const now = new Date().toISOString();
    setTransactions((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          return {
            ...t,
            status: 'pago',
            paymentDate: now.split('T')[0],
            paymentMethod: paymentMethod || t.paymentMethod,
          };
        }
        return t;
      })
    );

    const trx = transactions.find((t) => t.id === id);
    if (trx?.installmentId) {
      setInstallments((prev) =>
        prev.map((inst) =>
          inst.id === trx.installmentId
            ? { ...inst, status: 'pago', paymentDate: now.split('T')[0], paymentMethod }
            : inst
        )
      );
    }

    if (trx?.type === 'entrada') {
      triggerCelebration();
      logActivity(
        `Registrou recebimento de R$ ${trx.value.toLocaleString('pt-BR')} (${trx.description})`,
        'financeiro',
        id
      );
    }
  };

  const deleteTransaction = (id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  };

  const addInstallment = (
    installmentData: Omit<FinancialInstallment, 'id' | 'createdAt'>
  ): FinancialInstallment => {
    const newInst: FinancialInstallment = {
      ...installmentData,
      id: 'inst_' + Date.now(),
      createdAt: new Date().toISOString(),
    };
    setInstallments((prev) => [newInst, ...prev]);
    return newInst;
  };

  const updateInstallment = (id: string, installmentData: Partial<FinancialInstallment>) => {
    setInstallments((prev) => prev.map((i) => (i.id === id ? { ...i, ...installmentData } : i)));
  };

  const markInstallmentPaid = (id: string, paymentMethod: PaymentMethod = 'pix') => {
    const now = new Date().toISOString();
    const target = installments.find((i) => i.id === id);
    if (!target) return;

    setInstallments((prev) =>
      prev.map((inst) =>
        inst.id === id
          ? {
              ...inst,
              status: 'pago',
              paymentDate: now.split('T')[0],
              paymentMethod: paymentMethod || inst.paymentMethod,
            }
          : inst
      )
    );

    // Also add or mark paid corresponding transaction
    const existingTrx = transactions.find((t) => t.installmentId === id);
    if (existingTrx) {
      updateTransaction(existingTrx.id, {
        status: 'pago',
        paymentDate: now.split('T')[0],
        paymentMethod,
      });
    } else {
      addTransaction({
        type: 'entrada',
        description: `Parcela (${target.installmentNumber}/${target.totalInstallments}) - ${target.projectName}`,
        category: 'Site institucional',
        clientId: target.clientId,
        clientName: target.clientName,
        projectId: target.projectId,
        projectName: target.projectName,
        installmentId: target.id,
        value: target.value,
        date: now.split('T')[0],
        dueDate: target.dueDate,
        paymentDate: now.split('T')[0],
        paymentMethod,
        status: 'pago',
      });
    }

    triggerCelebration();
    logActivity(
      `Recebeu parcela de R$ ${target.value.toLocaleString('pt-BR')} do cliente ${target.clientName}`,
      'financeiro',
      id
    );
  };

  const deleteInstallment = (id: string) => {
    setInstallments((prev) => prev.filter((i) => i.id !== id));
  };

  // RECURRING SERVICES
  const addRecurringService = (
    serviceData: Omit<RecurringService, 'id' | 'createdAt'>
  ): RecurringService => {
    const newRec: RecurringService = {
      ...serviceData,
      id: 'rec_' + Date.now(),
      createdAt: new Date().toISOString(),
    };
    setRecurringServices((prev) => [newRec, ...prev]);
    logActivity(
      `Adicionou contrato recorrente de ${newRec.serviceName} para ${
        newRec.clientName
      } (R$ ${newRec.value.toLocaleString('pt-BR')}/${newRec.billingCycle})`,
      'recorrencia',
      newRec.id
    );
    return newRec;
  };

  const updateRecurringService = (id: string, serviceData: Partial<RecurringService>) => {
    setRecurringServices((prev) => prev.map((r) => (r.id === id ? { ...r, ...serviceData } : r)));
  };

  const deleteRecurringService = (id: string) => {
    setRecurringServices((prev) => prev.filter((r) => r.id !== id));
  };

  // FILES
  const addFile = (fileData: Omit<ProjectFile, 'id' | 'createdAt'>): ProjectFile => {
    const newFile: ProjectFile = {
      ...fileData,
      id: 'file_' + Date.now(),
      createdAt: new Date().toISOString(),
    };
    setFiles((prev) => [newFile, ...prev]);
    logActivity(`Fez upload do arquivo: "${newFile.name}"`, 'arquivo', newFile.id);
    return newFile;
  };

  const updateFile = (id: string, fileData: Partial<ProjectFile>) => {
    setFiles((prev) =>
      prev.map((f) => (f.id === id ? { ...f, ...fileData } : f))
    );
    const target = files.find((f) => f.id === id);
    if (target && (fileData.category || fileData.projectId || fileData.projectName)) {
      logActivity(`Moveu/reorganizou o arquivo: "${target.name}"`, 'arquivo', id);
    }
  };

  const deleteFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  // EVENTS
  const addEvent = (eventData: Omit<CalendarEvent, 'id' | 'createdAt'>): CalendarEvent => {
    const newEvt: CalendarEvent = {
      ...eventData,
      id: 'evt_' + Date.now(),
      createdAt: new Date().toISOString(),
    };
    setEvents((prev) => [newEvt, ...prev]);
    return newEvt;
  };

  const updateEvent = (id: string, eventData: Partial<CalendarEvent>) => {
    setEvents((prev) => prev.map((e) => (e.id === id ? { ...e, ...eventData } : e)));
  };

  const deleteEvent = (id: string) => {
    setEvents((prev) => prev.filter((e) => e.id !== id));
  };

  // NOTIFICATIONS
  const markNotificationAsRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
  };

  const markAllNotificationsAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  // BULK OPERATIONS
  const bulkArchiveProjects = (projectIds: string[]) => {
    setProjects((prev) =>
      prev.map((p) =>
        projectIds.includes(p.id) ? { ...p, status: 'pausado' as ProjectStatus, updatedAt: new Date().toISOString() } : p
      )
    );
    logActivity(`Arquivou ${projectIds.length} projetos em lote`, 'projeto');
  };

  const bulkDeleteProjects = (projectIds: string[]) => {
    setProjects((prev) => prev.filter((p) => !projectIds.includes(p.id)));
    logActivity(`Excluiu ${projectIds.length} projetos em lote`, 'projeto');
  };

  const bulkUpdateProjectsStatus = (projectIds: string[], status: ProjectStatus) => {
    setProjects((prev) =>
      prev.map((p) => (projectIds.includes(p.id) ? { ...p, status, updatedAt: new Date().toISOString() } : p))
    );
    logActivity(`Atualizou o status de ${projectIds.length} projetos em lote para "${status}"`, 'projeto');
  };

  const bulkDeleteTasks = (taskIds: string[]) => {
    setTasks((prev) => prev.filter((t) => !taskIds.includes(t.id)));
    logActivity(`Excluiu ${taskIds.length} tarefas em lote`, 'tarefa');
  };

  const bulkUpdateTasksStatus = (taskIds: string[], status: TaskStatus) => {
    const now = new Date().toISOString();
    setTasks((prev) =>
      prev.map((t) =>
        taskIds.includes(t.id)
          ? {
              ...t,
              status,
              completedAt: status === 'concluido' ? now : undefined,
            }
          : t
      )
    );
    logActivity(`Atualizou o status de ${taskIds.length} tarefas em lote para "${status}"`, 'tarefa');
  };

  const bulkArchiveTasks = (taskIds: string[]) => {
    bulkUpdateTasksStatus(taskIds, 'concluido');
  };

  // BACKGROUND WORKER SERVICE: Automatic Recurring Invoices Generator
  const checkAndProcessRecurringInvoices = (): number => {
    const todayStr = new Date().toISOString().split('T')[0];
    let generatedCount = 0;

    setRecurringServices((prevServices) => {
      let hasUpdates = false;
      const updatedServices = prevServices.map((service) => {
        if (service.status !== 'ativo') return service;

        if (service.nextBillingDate && service.nextBillingDate <= todayStr) {
          // Check if already created for this exact due date to avoid duplicates
          const alreadyCreated = transactions.some(
            (t) =>
              t.clientId === service.clientId &&
              t.dueDate === service.nextBillingDate &&
              (t.category === 'Recorrência / Manutenção' || t.category === service.category || t.description.includes(service.serviceName))
          );

          if (!alreadyCreated) {
            hasUpdates = true;
            generatedCount++;

            // Create new transaction in FinancialView
            const newTrx: FinancialTransaction = {
              id: 'trx_rec_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
              type: 'entrada',
              description: `Fatura Recorrente: ${service.serviceName} - ${service.clientName}`,
              category: 'Recorrência / Manutenção',
              clientId: service.clientId,
              clientName: service.clientName,
              value: service.value,
              date: todayStr,
              dueDate: service.nextBillingDate,
              paymentMethod: 'pix',
              status: 'pendente',
              notes: `Gerada automaticamente pelo serviço em segundo plano de recorrências (${service.billingCycle})`,
              createdAt: new Date().toISOString(),
            };

            setTransactions((prevTrx) => [newTrx, ...prevTrx]);

            // Calculate next billing date
            const curDate = new Date(service.nextBillingDate + 'T12:00:00');
            if (service.billingCycle === 'mensal') {
              curDate.setMonth(curDate.getMonth() + 1);
            } else if (service.billingCycle === 'trimestral') {
              curDate.setMonth(curDate.getMonth() + 3);
            } else if (service.billingCycle === 'semestral') {
              curDate.setMonth(curDate.getMonth() + 6);
            } else if (service.billingCycle === 'anual') {
              curDate.setFullYear(curDate.getFullYear() + 1);
            }
            const nextDateStr = curDate.toISOString().split('T')[0];

            // Notify user via NotificationsDrawer
            addNotification(
              'Fatura Recorrente Gerada Automaticamente',
              `Fatura de R$ ${service.value.toLocaleString('pt-BR')} para ${service.clientName} (${service.serviceName}) gerada automaticamente com vencimento em ${new Date(service.nextBillingDate).toLocaleDateString('pt-BR')}.`,
              'financeiro',
              'financeiro',
              newTrx.id
            );

            // Audit log in Activity Log
            logActivity(
              `Worker em segundo plano gerou cobrança recorrente para ${service.clientName} - R$ ${service.value.toLocaleString('pt-BR')}`,
              'recorrencia',
              service.id,
              `Fatura emitida para vencimento em ${service.nextBillingDate}. Próximo ciclo agendado para ${nextDateStr}.`
            );

            return {
              ...service,
              nextBillingDate: nextDateStr,
            };
          }
        }
        return service;
      });

      return hasUpdates ? updatedServices : prevServices;
    });

    return generatedCount;
  };

  // Background Worker Lifecycle
  useEffect(() => {
    const startupTimeout = setTimeout(() => {
      checkAndProcessRecurringInvoices();
    }, 1200);

    const recurringInterval = setInterval(() => {
      checkAndProcessRecurringInvoices();
    }, 45000);

    return () => {
      clearTimeout(startupTimeout);
      clearInterval(recurringInterval);
    };
  }, []);

  return (
    <DatabaseContext.Provider
      value={{
        user,
        settings,
        updateSettings,
        updateUser,
        theme,
        setTheme,
        leads,
        addLead,
        updateLead,
        updateLeadStatus,
        deleteLead,
        convertLeadToClient,
        clients,
        addClient,
        updateClient,
        deleteClient,
        projects,
        addProject,
        updateProject,
        updateProjectStatus,
        deleteProject,
        bulkArchiveProjects,
        bulkDeleteProjects,
        bulkUpdateProjectsStatus,
        tasks,
        addTask,
        updateTask,
        updateTaskStatus,
        deleteTask,
        bulkDeleteTasks,
        bulkUpdateTasksStatus,
        bulkArchiveTasks,
        activeTimerTask,
        startTaskTimer,
        stopTaskTimer,
        logTaskManualTime,
        allTimeLogs,
        proposals,
        addProposal,
        updateProposal,
        updateProposalStatus,
        deleteProposal,
        convertProposalToProject,
        contracts,
        contractTemplates,
        addContract,
        updateContract,
        signContract,
        deleteContract,
        addContractTemplate,
        transactions,
        installments,
        addTransaction,
        updateTransaction,
        markTransactionPaid,
        deleteTransaction,
        addInstallment,
        updateInstallment,
        markInstallmentPaid,
        deleteInstallment,
        recurringServices,
        addRecurringService,
        updateRecurringService,
        deleteRecurringService,
        checkAndProcessRecurringInvoices,
        files,
        addFile,
        updateFile,
        deleteFile,
        events,
        addEvent,
        updateEvent,
        deleteEvent,
        activityLogs,
        notifications,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        addNotification,
        logActivity,
        projectTemplates,
        resetToSeedData,
        triggerCelebration,
      }}
    >
      {children}
    </DatabaseContext.Provider>
  );
};

export const useDatabase = () => {
  const context = useContext(DatabaseContext);
  if (!context) {
    throw new Error('useDatabase must be used within a DatabaseProvider');
  }
  return context;
};
