import React, { useState } from 'react';
import {
  Settings as SettingsIcon,
  Building2,
  User,
  CreditCard,
  Database,
  Download,
  RotateCcw,
  Check,
  Save,
  ShieldCheck,
  Sun,
  Moon,
  Laptop,
  Clock,
  Palette,
} from 'lucide-react';
import { useDatabase } from '../context/DatabaseContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { UserSettings } from '../types';

export const SettingsView: React.FC = () => {
  const {
    user,
    settings,
    theme,
    setTheme,
    updateSettings,
    updateUser,
    resetToSeedData,
    triggerCelebration,
    leads,
    clients,
    projects,
    tasks,
    proposals,
    contracts,
    transactions,
    installments,
    recurringServices,
    files,
  } = useDatabase();

  const [activeTab, setActiveTab] = useState<'empresa' | 'perfil' | 'aparencia' | 'categorias' | 'dados'>('empresa');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);

  // Form State for Company
  const [companySettings, setCompanySettings] = useState<UserSettings>({ ...settings });

  // Form State for User
  const [userName, setUserName] = useState(user.name);
  const [userEmail, setUserEmail] = useState(user.email);
  const [userAvatar, setUserAvatar] = useState(user.avatarUrl || '');

  // New category inputs
  const [newInflowCat, setNewInflowCat] = useState('');
  const [newOutflowCat, setNewOutflowCat] = useState('');

  const handleSaveCompany = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(companySettings);
    setSavedSuccess(true);
    triggerCelebration();
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    updateUser({
      name: userName,
      email: userEmail,
      avatarUrl: userAvatar,
    });
    setSavedSuccess(true);
    triggerCelebration();
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleAddInflowCat = () => {
    if (!newInflowCat.trim()) return;
    if (!companySettings.inflowCategories.includes(newInflowCat.trim())) {
      const updated = [...companySettings.inflowCategories, newInflowCat.trim()];
      setCompanySettings({ ...companySettings, inflowCategories: updated });
      updateSettings({ inflowCategories: updated });
    }
    setNewInflowCat('');
  };

  const handleRemoveInflowCat = (cat: string) => {
    const updated = companySettings.inflowCategories.filter((c) => c !== cat);
    setCompanySettings({ ...companySettings, inflowCategories: updated });
    updateSettings({ inflowCategories: updated });
  };

  const handleAddOutflowCat = () => {
    if (!newOutflowCat.trim()) return;
    if (!companySettings.outflowCategories.includes(newOutflowCat.trim())) {
      const updated = [...companySettings.outflowCategories, newOutflowCat.trim()];
      setCompanySettings({ ...companySettings, outflowCategories: updated });
      updateSettings({ outflowCategories: updated });
    }
    setNewOutflowCat('');
  };

  const handleRemoveOutflowCat = (cat: string) => {
    const updated = companySettings.outflowCategories.filter((c) => c !== cat);
    setCompanySettings({ ...companySettings, outflowCategories: updated });
    updateSettings({ outflowCategories: updated });
  };

  // Export full DB backup to JSON file
  const handleExportBackup = () => {
    const fullBackup = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      user,
      settings,
      leads,
      clients,
      projects,
      tasks,
      proposals,
      contracts,
      transactions,
      installments,
      recurringServices,
      files,
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(fullBackup, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `StudioOS_Backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <SettingsIcon className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            Configurações do Sistema
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Personalize os dados da sua agência, tema visual, categorias financeiras e backup.
          </p>
        </div>

        {savedSuccess && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-semibold animate-in fade-in">
            <Check className="w-4 h-4" />
            Alterações salvas com sucesso!
          </div>
        )}
      </div>

      {/* Tabs Bar */}
      <div className="flex items-center gap-1 border-b border-slate-200 dark:border-slate-800 overflow-x-auto pb-px">
        <button
          onClick={() => setActiveTab('empresa')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 whitespace-nowrap transition-colors ${
            activeTab === 'empresa'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Building2 className="w-4 h-4" />
          Dados da Empresa
        </button>

        <button
          onClick={() => setActiveTab('aparencia')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 whitespace-nowrap transition-colors ${
            activeTab === 'aparencia'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Palette className="w-4 h-4" />
          Tema & Aparência
        </button>

        <button
          onClick={() => setActiveTab('perfil')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 whitespace-nowrap transition-colors ${
            activeTab === 'perfil'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <User className="w-4 h-4" />
          Meu Perfil
        </button>

        <button
          onClick={() => setActiveTab('categorias')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 whitespace-nowrap transition-colors ${
            activeTab === 'categorias'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          Categorias Financeiras
        </button>

        <button
          onClick={() => setActiveTab('dados')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 whitespace-nowrap transition-colors ${
            activeTab === 'dados'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Database className="w-4 h-4" />
          Backup & Dados
        </button>
      </div>

      {/* Tab: Empresa */}
      {activeTab === 'empresa' && (
        <Card padding="md">
          <form onSubmit={handleSaveCompany} className="space-y-4">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Identificação Jurídica & Comercial
              </h3>
              <p className="text-xs text-slate-400">
                Esses dados são injetados automaticamente em contratos, recibos e propostas comerciais.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Razão Social / Nome da Empresa"
                value={companySettings.companyName}
                onChange={(e) =>
                  setCompanySettings({ ...companySettings, companyName: e.target.value })
                }
                required
              />

              <Input
                label="Nome Fantasia"
                value={companySettings.tradeName}
                onChange={(e) =>
                  setCompanySettings({ ...companySettings, tradeName: e.target.value })
                }
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="CNPJ ou CPF do Emissor"
                value={companySettings.document}
                onChange={(e) =>
                  setCompanySettings({ ...companySettings, document: e.target.value })
                }
              />

              <Input
                label="E-mail Comercial"
                type="email"
                value={companySettings.email}
                onChange={(e) =>
                  setCompanySettings({ ...companySettings, email: e.target.value })
                }
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="WhatsApp Comercial"
                value={companySettings.whatsapp}
                onChange={(e) =>
                  setCompanySettings({ ...companySettings, whatsapp: e.target.value })
                }
              />

              <Input
                label="Website / Domínio"
                value={companySettings.website}
                onChange={(e) =>
                  setCompanySettings({ ...companySettings, website: e.target.value })
                }
              />
            </div>

            <Input
              label="Endereço Completo (Sede / Home Office)"
              value={companySettings.address}
              onChange={(e) =>
                setCompanySettings({ ...companySettings, address: e.target.value })
              }
            />

            <div className="border-t border-slate-100 dark:border-slate-800 pt-4 mt-4">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-indigo-600" />
                Valor da Hora de Trabalho Operacional (R$/hora)
              </h4>
              <p className="text-xs text-slate-400 mb-3">
                Utilizado para calcular o custo estimado do tempo logado em tarefas no cronômetro e relatórios de lucratividade.
              </p>
              <div className="w-full sm:w-64">
                <Input
                  label="Taxa Horária Padrão (R$)"
                  type="number"
                  value={companySettings.defaultHourlyRate || 120}
                  onChange={(e) =>
                    setCompanySettings({
                      ...companySettings,
                      defaultHourlyRate: Number(e.target.value),
                    })
                  }
                />
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <Button type="submit" variant="primary" leftIcon={<Save className="w-4 h-4" />}>
                Salvar Dados da Empresa
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Tab: Tema & Aparência */}
      {activeTab === 'aparencia' && (
        <div className="space-y-6">
          <Card padding="md">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-3 mb-5">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Palette className="w-4 h-4 text-indigo-600" />
                Preferência de Tema da Interface
              </h3>
              <p className="text-xs text-slate-400">
                Selecione o modo de visualização ideal para sua rotina de trabalho.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Light Theme Card */}
              <button
                type="button"
                onClick={() => setTheme('light')}
                className={`p-4 rounded-xl border text-left transition-all relative ${
                  theme === 'light'
                    ? 'border-indigo-600 ring-2 ring-indigo-500/20 bg-indigo-50/40 dark:bg-indigo-950/30'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-850'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2 rounded-lg bg-amber-100 text-amber-700">
                    <Sun className="w-5 h-5" />
                  </div>
                  {theme === 'light' && (
                    <span className="flex items-center gap-1 text-[11px] font-bold text-indigo-600 dark:text-indigo-400">
                      <Check className="w-3.5 h-3.5" /> Ativo
                    </span>
                  )}
                </div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">Modo Claro</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Interface iluminada com alto contraste para ambientes de trabalho claros.
                </p>
                <div className="mt-3.5 h-6 bg-slate-100 border border-slate-200 rounded flex items-center px-2 gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-indigo-500" />
                  <div className="w-8 h-1.5 rounded bg-slate-300" />
                  <div className="w-4 h-1.5 rounded bg-slate-200 ml-auto" />
                </div>
              </button>

              {/* Dark Theme Card */}
              <button
                type="button"
                onClick={() => setTheme('dark')}
                className={`p-4 rounded-xl border text-left transition-all relative ${
                  theme === 'dark'
                    ? 'border-indigo-600 ring-2 ring-indigo-500/20 bg-indigo-50/40 dark:bg-indigo-950/30'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-850'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2 rounded-lg bg-indigo-950 text-indigo-300 border border-indigo-800">
                    <Moon className="w-5 h-5" />
                  </div>
                  {theme === 'dark' && (
                    <span className="flex items-center gap-1 text-[11px] font-bold text-indigo-600 dark:text-indigo-400">
                      <Check className="w-3.5 h-3.5" /> Ativo
                    </span>
                  )}
                </div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">Modo Escuro</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Tema escuro profissional projetado para reduzir o cansaço visual.
                </p>
                <div className="mt-3.5 h-6 bg-slate-900 border border-slate-800 rounded flex items-center px-2 gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-indigo-400" />
                  <div className="w-8 h-1.5 rounded bg-slate-700" />
                  <div className="w-4 h-1.5 rounded bg-slate-800 ml-auto" />
                </div>
              </button>

              {/* System Theme Card */}
              <button
                type="button"
                onClick={() => setTheme('system')}
                className={`p-4 rounded-xl border text-left transition-all relative ${
                  theme === 'system'
                    ? 'border-indigo-600 ring-2 ring-indigo-500/20 bg-indigo-50/40 dark:bg-indigo-950/30'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-850'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    <Laptop className="w-5 h-5" />
                  </div>
                  {theme === 'system' && (
                    <span className="flex items-center gap-1 text-[11px] font-bold text-indigo-600 dark:text-indigo-400">
                      <Check className="w-3.5 h-3.5" /> Ativo
                    </span>
                  )}
                </div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">Padrão do Sistema</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Sincroniza automaticamente com a configuração do seu sistema operacional.
                </p>
                <div className="mt-3.5 h-6 bg-linear-to-r from-slate-100 to-slate-900 border border-slate-300 dark:border-slate-700 rounded flex items-center px-2 gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-indigo-500" />
                  <div className="w-8 h-1.5 rounded bg-slate-400/80" />
                </div>
              </button>
            </div>
          </Card>
        </div>
      )}

      {/* Tab: Perfil */}
      {activeTab === 'perfil' && (
        <Card padding="md">
          <form onSubmit={handleSaveUser} className="space-y-4">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Perfil de Usuário & Acesso
              </h3>
              <p className="text-xs text-slate-400">
                Informações da conta proprietária do sistema StudioOS.
              </p>
            </div>

            <div className="flex items-center gap-4 mb-4">
              <img
                src={userAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                alt="Avatar"
                className="w-16 h-16 rounded-full object-cover border-2 border-indigo-500/30"
              />
              <div>
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/20">
                  <ShieldCheck className="w-3.5 h-3.5" /> Administrador / Owner
                </span>
                <p className="text-xs text-slate-500 mt-1">Acesso irrestrito a todas as operações.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Nome Completo *"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                required
              />

              <Input
                label="E-mail de Login *"
                type="email"
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
                required
              />
            </div>

            <Input
              label="URL da Foto de Perfil (Avatar)"
              placeholder="https://..."
              value={userAvatar}
              onChange={(e) => setUserAvatar(e.target.value)}
            />

            <div className="flex justify-end pt-4">
              <Button type="submit" variant="primary" leftIcon={<Save className="w-4 h-4" />}>
                Atualizar Meu Perfil
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Tab: Categorias */}
      {activeTab === 'categorias' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Inflow Categories */}
          <Card padding="md">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
              Categorias de Receita (Entradas)
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Tipos de serviços prestados e fontes de faturamento da agência.
            </p>

            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={newInflowCat}
                onChange={(e) => setNewInflowCat(e.target.value)}
                placeholder="Nova categoria..."
                className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
              <Button size="sm" variant="secondary" onClick={handleAddInflowCat}>
                Adicionar
              </Button>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {companySettings.inflowCategories.map((cat) => (
                <span
                  key={cat}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800"
                >
                  {cat}
                  <button
                    onClick={() => handleRemoveInflowCat(cat)}
                    className="text-slate-400 hover:text-rose-500 cursor-pointer"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </Card>

          {/* Outflow Categories */}
          <Card padding="md">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
              Categorias de Despesa (Saídas)
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Centros de custo com softwares, hospedagem, terceiros e impostos.
            </p>

            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={newOutflowCat}
                onChange={(e) => setNewOutflowCat(e.target.value)}
                placeholder="Nova categoria..."
                className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
              <Button size="sm" variant="secondary" onClick={handleAddOutflowCat}>
                Adicionar
              </Button>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {companySettings.outflowCategories.map((cat) => (
                <span
                  key={cat}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800"
                >
                  {cat}
                  <button
                    onClick={() => handleRemoveOutflowCat(cat)}
                    className="text-slate-400 hover:text-rose-500 cursor-pointer"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* Tab: Backup & Dados */}
      {activeTab === 'dados' && (
        <div className="space-y-6">
          <Card padding="md">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1 flex items-center gap-2">
              <Download className="w-4 h-4 text-indigo-600" />
              Exportar Backup Completo (JSON)
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Baixe um arquivo seguro com todos os seus clientes, contratos, projetos, tarefas e histórico financeiro.
            </p>

            <Button
              variant="primary"
              size="sm"
              onClick={handleExportBackup}
              leftIcon={<Download className="w-4 h-4" />}
            >
              Fazer Download do Backup
            </Button>
          </Card>

          <Card padding="md" className="border-rose-200 dark:border-rose-900/40">
            <h3 className="text-sm font-bold text-rose-600 dark:text-rose-400 mb-1 flex items-center gap-2">
              <RotateCcw className="w-4 h-4 text-rose-500" />
              Restaurar Dados de Demonstração
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Se desejar resetar seu ambiente e recarregar os dados de exemplo pré-configurados do StudioOS.
            </p>

            <Button
              variant="danger"
              size="sm"
              onClick={() => setIsResetDialogOpen(true)}
              leftIcon={<RotateCcw className="w-4 h-4" />}
            >
              Restaurar Base Inicial
            </Button>
          </Card>
        </div>
      )}

      {/* Reset Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isResetDialogOpen}
        onClose={() => setIsResetDialogOpen(false)}
        onConfirm={() => {
          resetToSeedData();
          setIsResetDialogOpen(false);
          triggerCelebration();
        }}
        title="Restaurar Base de Demonstração?"
        message="Esta ação substituirá os registros atuais pelos dados de demonstração iniciais (clientes, projetos e histórico de teste). Deseja continuar?"
        confirmText="Sim, Restaurar"
        type="danger"
      />
    </div>
  );
};
