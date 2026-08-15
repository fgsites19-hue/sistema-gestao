// Service Worker Registration and Network Status Detector for StudioOS

export function registerServiceWorker() {
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('[SW] StudioOS Service Worker registrado com sucesso! Escopo:', registration.scope);

          registration.onupdatefound = () => {
            const installingWorker = registration.installing;
            if (installingWorker == null) return;
            installingWorker.onstatechange = () => {
              if (installingWorker.state === 'installed') {
                if (navigator.serviceWorker.controller) {
                  console.log('[SW] Novo conteúdo em cache disponível para offline.');
                } else {
                  console.log('[SW] Aplicativo pronto para navegação offline!');
                }
              }
            };
          };
        })
        .catch((error) => {
          console.warn('[SW] Falha ao registrar Service Worker (ambiente restrito ou iframe):', error);
        });
    });
  }
}

export function unregisterServiceWorker() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready
      .then((registration) => {
        registration.unregister();
      })
      .catch((error) => {
        console.error(error.message);
      });
  }
}
