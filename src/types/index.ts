export type LeadStatus =
  | 'novo'
  | 'contato_realizado'
  | 'reuniao_agendada'
  | 'proposta_enviada'
  | 'negociacao'
  | 'ganho'
  | 'perdido';

export type LeadSource =
  | 'Instagram'
  | 'Google'
  | 'Indicação'
  | 'Outbound'
  | 'Networking'
  | 'Website'
  | 'WhatsApp'
  | 'Outro';

export interface Lead {
  id: string;
  name: string;
  company: string;
  whatsapp: string;
  email: string;
  instagram?: string;
  website?: string;
  source: LeadSource;
  serviceOfInterest: string;
  estimatedValue: number;
  notes?: string;
  status: LeadStatus;
  createdAt: string;
  updatedAt: string;
}

export type ClientStatus = 'ativo' | 'inativo';
export type ClientType = 'PF' | 'PJ';

export interface Client {
  id: string;
  name: string;
  company: string;
  email: string;
  phone?: string;
  whatsapp: string;
  document: string; // CPF or CNPJ
  clientType: ClientType;
  address?: string;
  instagram?: string;
  website?: string;
  notes?: string;
  status: ClientStatus;
  leadId?: string;
  createdAt: string;
  updatedAt: string;
}

export type ProjectType =
  | 'Site institucional'
  | 'Landing Page'
  | 'E-commerce'
  | 'Sistema'
  | 'Automação'
  | 'Manutenção'
  | 'SEO'
  | 'Tráfego pago'
  | 'Outro';

export type ProjectStatus =
  | 'planejamento'
  | 'briefing'
  | 'design'
  | 'desenvolvimento'
  | 'revisao'
  | 'aprovacao'
  | 'finalizacao'
  | 'entregue'
  | 'manutencao'
  | 'pausado'
  | 'cancelado';

export type Priority = 'baixa' | 'media' | 'alta' | 'urgente';

export interface ProjectMilestone {
  id: string;
  title: string;
  description?: string;
  status: 'pendente' | 'em_andamento' | 'concluido';
  targetDate: string;
  completedAt?: string;
}

export interface Project {
  id: string;
  clientId: string;
  clientName: string;
  name: string;
  type: ProjectType;
  value: number;
  startDate: string;
  deadline: string;
  deliveryDate?: string;
  status: ProjectStatus;
  priority: Priority;
  description?: string;
  notes?: string;
  progress: number; // 0 to 100
  contractId?: string;
  portalToken?: string;
  stagingUrl?: string;
  figmaUrl?: string;
  estimatedHours?: number;
  milestones?: ProjectMilestone[];
  createdAt: string;
  updatedAt: string;
}

export type TaskStatus = 'a_fazer' | 'em_andamento' | 'em_revisao' | 'concluido';

export interface TaskTimeLog {
  id: string;
  taskId: string;
  taskTitle: string;
  projectId?: string;
  projectName?: string;
  startTime: string;
  endTime?: string;
  durationSeconds: number;
  hourlyRate: number;
  costValue: number;
  notes?: string;
  loggedBy: string;
  createdAt: string;
}

export interface Task {
  id: string;
  projectId?: string;
  projectName?: string;
  clientId?: string;
  clientName?: string;
  title: string;
  description?: string;
  assignee?: string;
  priority: Priority;
  status: TaskStatus;
  deadline: string;
  completedAt?: string;
  createdAt: string;
  spentSeconds?: number;
  estimatedHours?: number;
  hourlyRate?: number;
  isTimerRunning?: boolean;
  timerStartedAt?: string;
  timeLogs?: TaskTimeLog[];
}

export interface ProposalItem {
  id: string;
  service: string;
  title?: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export type ProposalStatus =
  | 'rascunho'
  | 'enviada'
  | 'visualizada'
  | 'aceita'
  | 'recusada'
  | 'expirada';

export interface Proposal {
  id: string;
  clientId: string;
  clientName: string;
  projectId?: string;
  title: string;
  description?: string;
  items: ProposalItem[];
  subtotal: number;
  discount: number;
  finalTotal: number;
  paymentTerms: string;
  validityDate: string;
  notes?: string;
  status: ProposalStatus;
  publicToken: string;
  createdAt: string;
  updatedAt: string;
}

export type ContractStatus =
  | 'rascunho'
  | 'enviado'
  | 'aguardando_assinatura'
  | 'assinado'
  | 'cancelado';

export interface ContractTemplate {
  id: string;
  title: string;
  type: string;
  content: string;
  isDefault?: boolean;
}

export interface Contract {
  id: string;
  clientId: string;
  clientName: string;
  projectId?: string;
  projectName?: string;
  proposalId?: string;
  title: string;
  type: string;
  value: number;
  startDate: string;
  deadline: string;
  status: ContractStatus;
  content: string;
  signedAt?: string;
  signerName?: string;
  signerDocument?: string;
  createdAt: string;
  updatedAt: string;
}

export type TransactionType = 'entrada' | 'saida';
export type PaymentStatus = 'pendente' | 'pago' | 'vencido' | 'cancelado';
export type PaymentMethod =
  | 'pix'
  | 'boleto'
  | 'cartao_credito'
  | 'transferencia'
  | 'dinheiro'
  | 'outro';

export interface FinancialTransaction {
  id: string;
  type: TransactionType;
  description: string;
  category: string;
  clientId?: string;
  clientName?: string;
  projectId?: string;
  projectName?: string;
  installmentId?: string;
  value: number;
  date: string;
  dueDate: string;
  paymentDate?: string;
  paymentMethod: PaymentMethod;
  status: PaymentStatus;
  notes?: string;
  createdAt: string;
}

export type Transaction = FinancialTransaction;

export interface FinancialInstallment {
  id: string;
  projectId: string;
  projectName: string;
  clientId: string;
  clientName: string;
  installmentNumber: number;
  totalInstallments: number;
  value: number;
  dueDate: string;
  paymentDate?: string;
  paymentMethod: PaymentMethod;
  status: PaymentStatus;
  transactionId?: string;
  createdAt: string;
}

export type Installment = FinancialInstallment;

export type BillingCycle = 'mensal' | 'trimestral' | 'semestral' | 'anual';
export type RecurringStatus = 'ativo' | 'pausado' | 'cancelado';

export interface RecurringService {
  id: string;
  clientId: string;
  clientName: string;
  serviceName: string;
  category: string;
  value: number;
  billingCycle: BillingCycle;
  nextBillingDate: string;
  autoRenew: boolean;
  status: RecurringStatus;
  notes?: string;
  createdAt: string;
}

export type FileCategory =
  | 'briefing'
  | 'logo'
  | 'imagens'
  | 'design'
  | 'documentos'
  | 'documento'
  | 'referencias'
  | 'contratos'
  | 'contrato'
  | 'codigo'
  | 'outros';

export interface ProjectFile {
  id: string;
  clientId?: string;
  clientName?: string;
  projectId?: string;
  projectName?: string;
  name: string;
  type?: string;
  mimeType?: string;
  size: number | string;
  url: string;
  category: FileCategory;
  uploadedBy?: string;
  createdAt: string;
}

export type EventType =
  | 'reuniao'
  | 'entrega'
  | 'prazo_projeto'
  | 'pagamento'
  | 'tarefa'
  | 'call'
  | 'revisao'
  | 'outro';

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  type: EventType;
  date: string;
  time?: string;
  endDate?: string;
  clientId?: string;
  clientName?: string;
  projectId?: string;
  projectName?: string;
  status?: string;
  createdAt: string;
}

export type EntityType =
  | 'cliente'
  | 'projeto'
  | 'tarefa'
  | 'proposta'
  | 'contrato'
  | 'financeiro'
  | 'lead'
  | 'recorrencia'
  | 'arquivo'
  | 'configuracao'
  | 'portal'
  | 'evento';

export interface ActivityLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  entityType: EntityType;
  entityId?: string;
  details?: string;
  createdAt: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'financeiro' | 'projeto' | 'contrato' | 'tarefa' | 'lead' | 'sistema';
  isRead: boolean;
  linkTab?: string;
  entityId?: string;
  createdAt: string;
}

export interface ProjectTemplateTask {
  title: string;
  description?: string;
  priority: Priority;
  estimatedDays: number;
}

export interface ProjectTemplate {
  id: string;
  name: string;
  description: string;
  category: ProjectType;
  tasks: ProjectTemplateTask[];
}

export interface UserSettings {
  companyName: string;
  tradeName: string;
  logoUrl?: string;
  document: string; // CNPJ / CPF
  email: string;
  phone: string;
  whatsapp: string;
  address: string;
  website: string;
  instagram: string;
  defaultCurrency: string;
  paymentMethods: string[];
  inflowCategories: string[];
  outflowCategories: string[];
  theme?: 'light' | 'dark' | 'system';
  defaultHourlyRate?: number;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: 'owner' | 'admin' | 'employee' | 'freelancer' | 'client';
  avatarUrl?: string;
  companyName: string;
  document: string;
}
