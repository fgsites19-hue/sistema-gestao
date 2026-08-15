import React, { useState, useEffect } from 'react';
import { WifiOff, Wifi, HardDrive, RefreshCw, CheckCircle2 } from 'lucide-react';

export const OfflineStatusBanner: React.FC = () => {
  const [isOnline, setIsOnline] = useState<boolean>(() => {
    return typeof navigator !== 'undefined' && typeof navigator.onLine === 'boolean' ? navigator.onLine : true;
  });
  const [showReconnectedToast, setShowReconnectedToast] = useState(false);
  const [cachedItemsCount, setCachedItemsCount] = useState<number>(0);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowReconnectedToast(true);
      setTimeout(() => setShowReconnectedToast(false), 4000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowReconnectedToast(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Calculate approximate cached records in localStorage
    try {
      let count = 0;
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('studioos_db_v1_')) {
          count++;
        }
      }
      setCachedItemsCount(count);
    } catch {}

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (showReconnectedToast) {
    return (
      <div className="bg-emerald-600 text-white px-4 py-2 text-xs font-semibold flex items-center justify-between shadow-md transition-all animate-in slide-in-from-top duration-300">
        <div className="flex items-center gap-2 max-w-7xl mx-auto w-full">
          <Wifi className="w-4 h-4 text-emerald-200 animate-pulse" />
          <span>Conexão Restabelecida • Todos os dados locais estão sincronizados e prontos.</span>
          <span className="ml-auto text-[11px] bg-emerald-700/80 px-2 py-0.5 rounded-full flex items-center gap-1 font-normal">
            <CheckCircle2 className="w-3.5 h-3.5" /> Sincronizado
          </span>
        </div>
      </div>
    );
  }

  if (!isOnline) {
    return (
      <div className="bg-gradient-to-r from-amber-600 to-orange-600 text-white px-4 py-2.5 text-xs font-medium shadow-md">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="p-1 rounded-md bg-amber-800/60 shrink-0">
              <WifiOff className="w-4 h-4 text-amber-200 animate-pulse" />
            </div>
            <div>
              <strong className="font-bold">Modo Offline Ativo (Service Worker):</strong>{' '}
              Sua conexão caiu, mas você pode continuar visualizando e gerenciando projetos, tarefas e relatórios normalmente através do cache local.
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[11px] bg-black/20 px-2.5 py-1 rounded-full font-mono flex items-center gap-1.5 border border-white/10">
              <HardDrive className="w-3 h-3 text-amber-200" />
              Armazenamento Local Ativo
            </span>
          </div>
        </div>
      </div>
    );
  }

  return null;
};
