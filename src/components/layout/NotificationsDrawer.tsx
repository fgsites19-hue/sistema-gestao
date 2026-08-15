import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, CheckCircle2, AlertTriangle, Bell, DollarSign, FolderKanban, FileSignature, CheckSquare, Sparkles } from 'lucide-react';
import { useDatabase } from '../../context/DatabaseContext';
import { Button } from '../ui/Button';

interface NotificationsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateTab: (tab: any, entityId?: string) => void;
}

export const NotificationsDrawer: React.FC<NotificationsDrawerProps> = ({
  isOpen,
  onClose,
  onNavigateTab,
}) => {
  const { notifications, markNotificationAsRead, markAllNotificationsAsRead } = useDatabase();

  const getIcon = (type: string) => {
    switch (type) {
      case 'financeiro':
        return <DollarSign className="w-4 h-4 text-emerald-500" />;
      case 'projeto':
        return <FolderKanban className="w-4 h-4 text-indigo-500" />;
      case 'contrato':
        return <FileSignature className="w-4 h-4 text-amber-500" />;
      case 'tarefa':
        return <CheckSquare className="w-4 h-4 text-blue-500" />;
      default:
        return <Sparkles className="w-4 h-4 text-purple-500" />;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 bottom-0 z-50 w-full max-w-sm bg-white dark:bg-slate-900 shadow-2xl border-l border-slate-200 dark:border-slate-800 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                  <Bell className="w-4 h-4" />
                </div>
                <h3 className="font-semibold text-slate-900 dark:text-white text-sm">
                  Notificações do Sistema
                </h3>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Actions Toolbar */}
            <div className="flex items-center justify-between px-4 py-2 bg-slate-50 dark:bg-slate-850 border-b border-slate-100 dark:border-slate-800 text-xs">
              <span className="text-slate-500 font-medium">
                {notifications.filter((n) => !n.isRead).length} não lidas
              </span>
              <button
                onClick={markAllNotificationsAsRead}
                className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
              >
                Marcar todas como lidas
              </button>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
              {notifications.length === 0 ? (
                <div className="text-center py-12 px-4">
                  <CheckCircle2 className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                    Tudo em dia!
                  </p>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                    Nenhuma notificação recente pendente.
                  </p>
                </div>
              ) : (
                notifications.map((notif) => (
                  <div
                    key={notif.id}
                    onClick={() => {
                      markNotificationAsRead(notif.id);
                      if (notif.linkTab) {
                        onNavigateTab(notif.linkTab, notif.entityId);
                        onClose();
                      }
                    }}
                    className={`p-4 cursor-pointer transition-colors duration-150 flex gap-3 ${
                      notif.isRead
                        ? 'hover:bg-slate-50 dark:hover:bg-slate-800/40 opacity-75'
                        : 'bg-indigo-50/40 dark:bg-indigo-950/20 hover:bg-indigo-50/70'
                    }`}
                  >
                    <div className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shrink-0 h-fit">
                      {getIcon(notif.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                          {notif.title}
                        </p>
                        {!notif.isRead && (
                          <span className="w-2 h-2 rounded-full bg-indigo-600 shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-snug">
                        {notif.message}
                      </p>
                      <span className="text-[10px] text-slate-400 mt-1 block">
                        {new Date(notif.createdAt).toLocaleDateString('pt-BR', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
