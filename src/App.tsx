import React, { useState, useEffect } from 'react';
import { DatabaseProvider } from './context/DatabaseContext';
import { Sidebar, NavTabId } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { GlobalSearchModal } from './components/layout/GlobalSearchModal';
import { NotificationsDrawer } from './components/layout/NotificationsDrawer';
import { FloatingQuickActions } from './components/layout/FloatingQuickActions';
import { ActiveTimerBanner } from './components/tasks/ActiveTimerBanner';
import { OfflineStatusBanner } from './components/layout/OfflineStatusBanner';

// Modals / Wizards
import { NewProjectWizard } from './components/wizards/NewProjectWizard';
import { NewClientModal } from './components/wizards/NewClientModal';
import { NewLeadModal } from './components/wizards/NewLeadModal';
import { NewProposalModal } from './components/wizards/NewProposalModal';
import { NewTransactionModal } from './components/wizards/NewTransactionModal';
import { NewContractModal } from './components/wizards/NewContractModal';
import { NewTaskModal } from './components/wizards/NewTaskModal';
import { NewRecurringModal } from './components/wizards/NewRecurringModal';

// Views
import { DashboardView } from './views/DashboardView';
import { LeadsView } from './views/LeadsView';
import { ClientsView } from './views/ClientsView';
import { ProjectsView } from './views/ProjectsView';
import { TasksView } from './views/TasksView';
import { ProposalsView } from './views/ProposalsView';
import { ContractsView } from './views/ContractsView';
import { FinancialView } from './views/FinancialView';
import { RecurringView } from './views/RecurringView';
import { FilesView } from './views/FilesView';
import { CalendarView } from './views/CalendarView';
import { ReportsView } from './views/ReportsView';
import { ClientPortalStandaloneView } from './views/ClientPortalStandaloneView';
import { AiAssistantView } from './views/AiAssistantView';
import { SettingsView } from './views/SettingsView';

function AppContent() {
  // Navigation State - detect URL token parameter
  const [currentTab, setCurrentTab] = useState<NavTabId>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.has('token') || params.has('portalToken')) {
        return 'portal';
      }
    }
    return 'dashboard';
  });
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [selectedProposalId, setSelectedProposalId] = useState<string | null>(null);
  const [selectedContractId, setSelectedContractId] = useState<string | null>(null);

  // Layout UI State
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isGlobalSearchOpen, setIsGlobalSearchOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  // Modal / Wizard Triggers
  const [isNewProjectOpen, setIsNewProjectOpen] = useState(false);
  const [defaultProjectClientId, setDefaultProjectClientId] = useState<string | undefined>(undefined);

  const [isNewClientOpen, setIsNewClientOpen] = useState(false);
  const [isNewLeadOpen, setIsNewLeadOpen] = useState(false);
  const [isNewProposalOpen, setIsNewProposalOpen] = useState(false);
  const [isNewTransactionOpen, setIsNewTransactionOpen] = useState(false);
  const [isNewContractOpen, setIsNewContractOpen] = useState(false);

  const [isNewTaskOpen, setIsNewTaskOpen] = useState(false);
  const [defaultTaskProjectId, setDefaultTaskProjectId] = useState<string | undefined>(undefined);

  const [isNewRecurringOpen, setIsNewRecurringOpen] = useState(false);

  // Keyboard shortcut for Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsGlobalSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Universal Navigation Handler
  const handleNavigateTab = (tab: NavTabId, entityId?: string) => {
    setCurrentTab(tab);

    if (tab === 'clientes') {
      setSelectedClientId(entityId || null);
    } else if (tab === 'projetos') {
      setSelectedProjectId(entityId || null);
    } else if (tab === 'propostas') {
      setSelectedProposalId(entityId || null);
    } else if (tab === 'contratos') {
      setSelectedContractId(entityId || null);
    }

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenProjectWizard = (clientId?: string) => {
    setDefaultProjectClientId(clientId);
    setIsNewProjectOpen(true);
  };

  const handleOpenTaskModal = (projectId?: string) => {
    setDefaultTaskProjectId(projectId);
    setIsNewTaskOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col antialiased font-sans">
      {/* Sidebar Navigation */}
      <Sidebar
        currentTab={currentTab}
        onTabChange={(tab) => {
          setCurrentTab(tab);
          // Clear sub-selection when directly changing tabs
          if (tab === 'clientes') setSelectedClientId(null);
          if (tab === 'projetos') setSelectedProjectId(null);
          if (tab === 'propostas') setSelectedProposalId(null);
          if (tab === 'contratos') setSelectedContractId(null);
        }}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed((prev) => !prev)}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div
        className={`flex-1 flex flex-col transition-all duration-200 ${
          isSidebarCollapsed ? 'lg:pl-18' : 'lg:pl-64'
        }`}
      >
        {/* Top Header */}
        <Header
          onOpenMobileMenu={() => setIsMobileSidebarOpen(true)}
          onOpenGlobalSearch={() => setIsGlobalSearchOpen(true)}
          onOpenNotifications={() => setIsNotificationsOpen(true)}
          onOpenNewProjectWizard={() => handleOpenProjectWizard()}
          onOpenNewClientModal={() => setIsNewClientOpen(true)}
          onOpenNewLeadModal={() => setIsNewLeadOpen(true)}
          onOpenNewTransactionModal={() => setIsNewTransactionOpen(true)}
          onOpenNewProposalModal={() => setIsNewProposalOpen(true)}
          onNavigateTab={handleNavigateTab}
        />

        {/* Global Active Task Timer Banner */}
        <ActiveTimerBanner onNavigateToTasks={() => handleNavigateTab('tarefas')} />

        {/* Offline Status & Connectivity Banner */}
        <OfflineStatusBanner />

        {/* View Port Router */}
        <main className="flex-1 p-4 sm:p-6 max-w-7xl w-full mx-auto">
          {currentTab === 'dashboard' && (
            <DashboardView
              onNavigateTab={handleNavigateTab}
              onOpenNewProject={() => handleOpenProjectWizard()}
              onOpenNewTransaction={() => setIsNewTransactionOpen(true)}
              onOpenNewLead={() => setIsNewLeadOpen(true)}
            />
          )}

          {currentTab === 'leads' && (
            <LeadsView
              onOpenNewLeadModal={() => setIsNewLeadOpen(true)}
              onNavigateTab={handleNavigateTab}
            />
          )}

          {currentTab === 'clientes' && (
            <ClientsView
              onOpenNewClientModal={() => setIsNewClientOpen(true)}
              onOpenNewProjectWizard={(clientId) => handleOpenProjectWizard(clientId)}
              onNavigateTab={handleNavigateTab}
              selectedClientId={selectedClientId}
              onSelectClient={(id) => setSelectedClientId(id)}
            />
          )}

          {currentTab === 'projetos' && (
            <ProjectsView
              onOpenNewProjectWizard={() => handleOpenProjectWizard()}
              onOpenNewTaskModal={(projId) => handleOpenTaskModal(projId)}
              onNavigateTab={handleNavigateTab}
              selectedProjectId={selectedProjectId}
              onSelectProject={(id) => setSelectedProjectId(id)}
            />
          )}

          {currentTab === 'tarefas' && (
            <TasksView
              onOpenNewTaskModal={() => handleOpenTaskModal()}
              onNavigateTab={handleNavigateTab}
            />
          )}

          {currentTab === 'propostas' && (
            <ProposalsView
              onOpenNewProposalModal={() => setIsNewProposalOpen(true)}
              onNavigateTab={handleNavigateTab}
              selectedProposalId={selectedProposalId}
              onSelectProposal={(id) => setSelectedProposalId(id)}
            />
          )}

          {currentTab === 'contratos' && (
            <ContractsView
              onOpenNewContractModal={() => setIsNewContractOpen(true)}
              onNavigateTab={handleNavigateTab}
              selectedContractId={selectedContractId}
              onSelectContract={(id) => setSelectedContractId(id)}
            />
          )}

          {currentTab === 'financeiro' && (
            <FinancialView
              onOpenNewTransactionModal={() => setIsNewTransactionOpen(true)}
              onNavigateTab={handleNavigateTab}
            />
          )}

          {currentTab === 'recorrencias' && (
            <RecurringView
              onOpenNewRecurringModal={() => setIsNewRecurringOpen(true)}
              onNavigateTab={handleNavigateTab}
            />
          )}

          {currentTab === 'arquivos' && (
            <FilesView onNavigateTab={handleNavigateTab} />
          )}

          {currentTab === 'calendario' && (
            <CalendarView onNavigateTab={handleNavigateTab} />
          )}

          {currentTab === 'relatorios' && (
            <ReportsView onNavigateTab={handleNavigateTab} />
          )}

          {currentTab === 'portal' && (
            <ClientPortalStandaloneView onExit={() => setCurrentTab('dashboard')} />
          )}

          {currentTab === 'ia' && <AiAssistantView />}

          {currentTab === 'configuracoes' && <SettingsView />}
        </main>
      </div>

      {/* Global Search Modal (Cmd+K) */}
      <GlobalSearchModal
        isOpen={isGlobalSearchOpen}
        onClose={() => setIsGlobalSearchOpen(false)}
        onNavigateTab={handleNavigateTab}
      />

      {/* Notifications Drawer */}
      <NotificationsDrawer
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        onNavigateTab={handleNavigateTab}
      />

      {/* Modals & Wizards */}
      <NewProjectWizard
        isOpen={isNewProjectOpen}
        onClose={() => setIsNewProjectOpen(false)}
        defaultClientId={defaultProjectClientId}
      />

      <NewClientModal
        isOpen={isNewClientOpen}
        onClose={() => setIsNewClientOpen(false)}
      />

      <NewLeadModal
        isOpen={isNewLeadOpen}
        onClose={() => setIsNewLeadOpen(false)}
      />

      <NewProposalModal
        isOpen={isNewProposalOpen}
        onClose={() => setIsNewProposalOpen(false)}
      />

      <NewTransactionModal
        isOpen={isNewTransactionOpen}
        onClose={() => setIsNewTransactionOpen(false)}
      />

      <NewContractModal
        isOpen={isNewContractOpen}
        onClose={() => setIsNewContractOpen(false)}
      />

      <NewTaskModal
        isOpen={isNewTaskOpen}
        onClose={() => setIsNewTaskOpen(false)}
        defaultProjectId={defaultTaskProjectId}
      />

      <NewRecurringModal
        isOpen={isNewRecurringOpen}
        onClose={() => setIsNewRecurringOpen(false)}
      />

      {/* Global Floating Quick Actions Button */}
      <FloatingQuickActions
        onNewTask={() => setIsNewTaskOpen(true)}
        onNewTransaction={() => setIsNewTransactionOpen(true)}
        onNewProject={() => handleOpenProjectWizard()}
        onNewClient={() => setIsNewClientOpen(true)}
        onNewLead={() => setIsNewLeadOpen(true)}
        onNewProposal={() => setIsNewProposalOpen(true)}
        onNewContract={() => setIsNewContractOpen(true)}
        onNewRecurring={() => setIsNewRecurringOpen(true)}
        onOpenAiAssistant={() => handleNavigateTab('ia')}
      />
    </div>
  );
}

export default function App() {
  return (
    <DatabaseProvider>
      <AppContent />
    </DatabaseProvider>
  );
}
