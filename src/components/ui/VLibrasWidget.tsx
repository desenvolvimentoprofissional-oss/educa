import { useEffect, useRef } from 'react';

declare global {
  interface Window {
    VLibras?: {
      Widget: new (url: string) => unknown;
    };
  }
}

const VLIBRAS_SCRIPT_SRC = 'https://vlibras.gov.br/app/vlibras-plugin.js';
const VLIBRAS_SRI_HASH = 'sha384-SCil2fuOCOLYO4bxpOW27F/feaFLCHDhc5HDDad0feHUHd0Q6+Wye9e/8Lq09Vqj';

export function VLibrasWidget() {
  const initializedRef = useRef(false);

  useEffect(() => {
    if (initializedRef.current) return;

    let isMounted = true;
    let idleCallbackId: number | null = null;
    let initTimeoutId: ReturnType<typeof setTimeout> | null = null;
    let retryTimeoutId: ReturnType<typeof setTimeout> | null = null;

    const instantiateWidget = () => {
      if (!isMounted || initializedRef.current) return;
      if (window.VLibras) {
        try {
          new window.VLibras.Widget('https://vlibras.gov.br/app');
          initializedRef.current = true;
        } catch (err) {
          console.error('[VLibras] Erro ao instanciar o widget:', err);
        }
      }
    };

    const createVerifiedScript = (id: string, allowRetry: boolean): HTMLScriptElement => {
      const el = document.createElement('script');
      el.id = id;
      el.src = VLIBRAS_SCRIPT_SRC;
      el.async = true;
      el.crossOrigin = 'anonymous';
      el.integrity = VLIBRAS_SRI_HASH;
      el.onload = instantiateWidget;
      el.onerror = () => {
        el.remove();
        if (!isMounted) return;
        if (allowRetry) {
          retryTimeoutId = setTimeout(() => {
            if (!isMounted || initializedRef.current) return;
            if (!document.getElementById(id)) {
              document.body.appendChild(createVerifiedScript(id, false));
            }
          }, 1500);
        } else {
          console.warn('[AppSec] Falha ao validar integridade SRI ou rede do script VLibras.');
        }
      };
      return el;
    };

    const initVLibras = () => {
      if (!isMounted || initializedRef.current) return;
      const scriptId = 'vlibras-plugin-script';
      const existingScript = document.getElementById(scriptId) as HTMLScriptElement | null;

      if (!existingScript) {
        document.body.appendChild(createVerifiedScript(scriptId, true));
      } else if (window.VLibras) {
        instantiateWidget();
      } else {
        existingScript.addEventListener('load', instantiateWidget, { once: true });
      }
    };

    const onReady = () => {
      if (!isMounted) return;
      if ('requestIdleCallback' in window) {
        idleCallbackId = window.requestIdleCallback(() => initVLibras(), { timeout: 4000 });
      } else {
        initTimeoutId = setTimeout(initVLibras, 2500);
      }
    };

    const events = ['mousedown', 'keydown', 'touchstart', 'scroll'];
    const onUserInteraction = () => {
      initVLibras();
      events.forEach((e) => window.removeEventListener(e, onUserInteraction));
    };
    events.forEach((e) => window.addEventListener(e, onUserInteraction, { once: true, passive: true }));

    if (document.readyState === 'complete') {
      onReady();
    } else {
      window.addEventListener('load', onReady, { once: true });
    }

    return () => {
      isMounted = false;
      window.removeEventListener('load', onReady);
      events.forEach((e) => window.removeEventListener(e, onUserInteraction));
      if (idleCallbackId !== null && 'cancelIdleCallback' in window) {
        window.cancelIdleCallback(idleCallbackId);
      }
      if (initTimeoutId !== null) {
        clearTimeout(initTimeoutId);
      }
      if (retryTimeoutId !== null) {
        clearTimeout(retryTimeoutId);
      }
    };
  }, []);

  return (
    <div {...({ vw: 'true' } as React.HTMLAttributes<HTMLDivElement>)} className="enabled">
      <div {...({ 'vw-access-button': 'true' } as React.HTMLAttributes<HTMLDivElement>)} className="active" />
      <div {...({ 'vw-plugin-wrapper': 'true' } as React.HTMLAttributes<HTMLDivElement>)}>
        <div className="vw-plugin-top-wrapper" />
      </div>
    </div>
  );
}


