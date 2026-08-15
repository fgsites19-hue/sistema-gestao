import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Users, FolderKanban, FileSpreadsheet, FileSignature, DollarSign, FolderArchive, ArrowRight, X } from 'lucide-react';
import { useDatabase } from '../../context/DatabaseContext';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (tab: any, entityId?: string) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  onNavigate,
}) => {
  const [query, setQuery] = useState('');
  const { clients, projects, leads, proposals, contracts, transactions, files } = useDatabase();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        // toggle modal
      }
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!isOpen) return null;

  const normalizedQuery = query.toLowerCase().trim();

  // Search Results
  const matchedClients = normalizedQuery
    ? clients.filter(
        (c) =>
          c.name.toLowerCase().includes(normalizedQuery) ||
          c.company.toLowerCase().includes(normalizedQuery) ||
          c.email.toLowerCase().includes(normalizedQuery) ||
          c.document.includes(normalizedQuery)
      )
    : [];

  const matchedProjects = normalizedQuery
    ? projects.filter(
        (p) =>
          p.name.toLowerCase().includes(normalizedQuery) ||
          p.clientName.toLowerCase().includes(normalizedQuery) ||
          p.type.toLowerCase().includes(normalizedQuery)
      )
    : [];

  const matchedLeads = normalizedQuery
    ? leads.filter(
        (l) =>
          l.name.toLowerCase().includes(normalizedQuery) ||
          l.company.toLowerCase().includes(normalizedQuery) ||
          l.serviceOfInterest.toLowerCase().includes(normalizedQuery)
      )
    : [];

  const matchedProposals = normalizedQuery
    ? proposals.filter(
        (pr) =>
          pr.title.toLowerCase().includes(normalizedQuery) ||
          pr.clientName.toLowerCase().includes(normalizedQuery)
      )
    : [];

  const matchedContracts = normalizedQuery
    ? contracts.filter(
        (ct) =>
          ct.title.toLowerCase().includes(normalizedQuery) ||
          ct.clientName.toLowerCase().includes(normalizedQuery)
      )
    : [];

  const matchedTransactions = normalizedQuery
    ? transactions.filter(
        (tr) =>
          tr.description.toLowerCase().includes(normalizedQuery) ||
          tr.clientName?.toLowerCase().includes(normalizedQuery) ||
          tr.category.toLowerCase().includes(normalizedQuery)
      )
    : [];

  const matchedFiles = normalizedQuery
    ? files.filter(
        (f) =>
          f.name.toLowerCase().includes(normalizedQuery) ||
          f.clientName.toLowerCase().includes(normalizedQuery)
      )
    : [];

  const totalMatches =
    matchedClients.length +
    matchedProjects.length +
    matchedLeads.length +
    matchedProposals.length +
    matchedContracts.length +
    matchedTransactions.length +
    matchedFiles.length;

  const handleSelect = (tab: string, entityId?: string) => {
    onNavigate(tab, entityId);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 sm:p-6 pt-16 sm:pt-24">
      {/* Backdrop */}
      <div onClick={onClose} className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs" />

      {/* Dialog */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: -10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: -10 }}
        className="relative w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[80vh]"
      >
        {/* Search Input Box */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-100 dark:border-slate-800 gap-3">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Pesquisar clientes, projetos, propostas, contratos, financeiro..."
            autoFocus
            className="flex-1 bg-transparent text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 text-slate-400 hover:text-slate-600 rounded-md"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-block text-[10px] uppercase font-semibold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700">
            ESC
          </kbd>
        </div>

        {/* Results Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {!query && (
            <div className="text-center py-10 text-slate-400 text-xs">
              Digite o nome de um cliente, projeto, proposta ou termo financeiro para busca instantânea.
            </div>
          )}

          {query && totalMatches === 0 && (
            <div className="text-center py-10 text-slate-400 text-xs">
              Nenhum resultado encontrado para <span className="font-semibold text-slate-600 dark:text-slate-300">"{query}"</span>.
            </div>
          )}

          {/* Clientes */}
          {matchedClients.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                <Users className="w-3.5 h-3.5 text-indigo-500" />
                <span>Clientes ({matchedClients.length})</span>
              </div>
              <div className="space-y-1">
                {matchedClients.map((client) => (
                  <div
                    key={client.id}
                    onClick={() => handleSelect('clientes', client.id)}
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer group transition-colors"
                  >
                    <div>
                      <p className="text-sm font-medium text-slate-900 dark:text-white group-hover:text-indigo-600">
                        {client.name}
                      </p>
                      <p className="text-xs text-slate-400">{client.company} • {client.email}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-600" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Projetos */}
          {matchedProjects.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                <FolderKanban className="w-3.5 h-3.5 text-emerald-500" />
                <span>Projetos ({matchedProjects.length})</span>
              </div>
              <div className="space-y-1">
                {matchedProjects.map((project) => (
                  <div
                    key={project.id}
                    onClick={() => handleSelect('projetos', project.id)}
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer group transition-colors"
                  >
                    <div>
                      <p className="text-sm font-medium text-slate-900 dark:text-white group-hover:text-indigo-600">
                        {project.name}
                      </p>
                      <p className="text-xs text-slate-400">
                        Cliente: {project.clientName} • R$ {project.value.toLocaleString('pt-BR')} • {project.status}
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-600" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Propostas */}
          {matchedProposals.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                <FileSpreadsheet className="w-3.5 h-3.5 text-purple-500" />
                <span>Propostas ({matchedProposals.length})</span>
              </div>
              <div className="space-y-1">
                {matchedProposals.map((prop) => (
                  <div
                    key={prop.id}
                    onClick={() => handleSelect('propostas', prop.id)}
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer group transition-colors"
                  >
                    <div>
                      <p className="text-sm font-medium text-slate-900 dark:text-white group-hover:text-indigo-600">
                        {prop.title}
                      </p>
                      <p className="text-xs text-slate-400">
                        Cliente: {prop.clientName} • R$ {prop.finalTotal.toLocaleString('pt-BR')}
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-600" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Contratos */}
          {matchedContracts.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                <FileSignature className="w-3.5 h-3.5 text-amber-500" />
                <span>Contratos ({matchedContracts.length})</span>
              </div>
              <div className="space-y-1">
                {matchedContracts.map((contract) => (
                  <div
                    key={contract.id}
                    onClick={() => handleSelect('contratos', contract.id)}
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer group transition-colors"
                  >
                    <div>
                      <p className="text-sm font-medium text-slate-900 dark:text-white group-hover:text-indigo-600">
                        {contract.title}
                      </p>
                      <p className="text-xs text-slate-400">
                        Cliente: {contract.clientName} • R$ {contract.value.toLocaleString('pt-BR')}
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-600" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
