// src/components/auth/SocialAuth.tsx
import { useEffect, useState } from 'react';

interface SocialAuthProps {
  onSocialLogin: (provider: 'google' | 'facebook' | 'apple', token: string) => void;
}

// ── Singleton para no cargar el SDK de Facebook más de una vez ───────────
let fbSdkLoaded    = false;
let fbInitialized  = false;
let fbInitPromise: Promise<void> | null = null;

/**
 * Carga e inicializa el SDK de Facebook según el patrón oficial:
 * 1. Definimos window.fbAsyncInit ANTES de inyectar el <script>
 * 2. Cuando el SDK termina de cargar, llama a fbAsyncInit automáticamente
 * 3. Dentro de fbAsyncInit hacemos FB.init() con nuestro App ID
 *
 * Esto garantiza que FB.init() se llama exactamente UNA vez y ANTES
 * de cualquier llamada a FB.login().
 */
function ensureFbSdk(appId: string): Promise<void> {
  if (fbInitialized) return Promise.resolve();
  if (fbInitPromise) return fbInitPromise;

  fbInitPromise = new Promise<void>((resolve) => {
    // Definimos fbAsyncInit antes de cargar el script
    (window as any).fbAsyncInit = () => {
      (window as any).FB.init({
        appId:   appId,
        cookie:  true,
        xfbml:   false,
        version: 'v19.0',
      });
      fbInitialized = true;
      resolve();
    };

    if (!fbSdkLoaded) {
      fbSdkLoaded = true;
      const s = document.createElement('script');
      s.src         = 'https://connect.facebook.net/es_ES/sdk.js';
      s.async       = true;
      s.crossOrigin = 'anonymous';
      document.head.appendChild(s);
    } else if ((window as any).FB) {
      // El script ya cargó pero fbAsyncInit no se ejecutó antes
      (window as any).fbAsyncInit();
    }
  });

  return fbInitPromise;
}

// ── Inicialización Apple ─────────────────────────────────────────────────
function tryInitApple(clientId: string, redirectUri: string) {
  if (!clientId || clientId === 'PENDIENTE_CONFIGURAR') return;
  const AppleID = (window as any).AppleID;
  if (!AppleID) return;
  AppleID.auth.init({ clientId, scope: 'name email', redirectURI: redirectUri, usePopup: true });
}


// ── COMPONENTE ────────────────────────────────────────────────────────────
const SocialAuth = ({ onSocialLogin }: SocialAuthProps) => {
  const [fbError, setFbError] = useState('');

  const FB_APP_ID   = import.meta.env.VITE_FACEBOOK_APP_ID   as string || '';
  const APPLE_ID    = import.meta.env.VITE_APPLE_CLIENT_ID   as string || '';
  const APPLE_REDIR = import.meta.env.VITE_APPLE_REDIRECT_URI as string || window.location.origin;

  // Pre-cargamos el SDK de Facebook nada más montar el componente
  // para que cuando el usuario pulse ya esté inicializado
  useEffect(() => {
    if (FB_APP_ID && FB_APP_ID !== 'PENDIENTE_CONFIGURAR') {
      ensureFbSdk(FB_APP_ID).catch(() => {});
    }
  }, [FB_APP_ID]);

  // Inicializamos Apple cuando su SDK esté listo
  useEffect(() => {
    if ((window as any).AppleID) {
      tryInitApple(APPLE_ID, APPLE_REDIR);
    } else {
      const el = document.querySelector('script[src*="appleid.cdn-apple.com"]');
      el?.addEventListener('load', () => tryInitApple(APPLE_ID, APPLE_REDIR), { once: true });
    }
  }, [APPLE_ID, APPLE_REDIR]);


  // ── Google ──────────────────────────────────────────────────────────
  const handleGoogleLogin = () => {
    const google = (window as any).google;
    if (!google?.accounts?.id) return;
    google.accounts.id.initialize({
      client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
      callback: (r: any) => { if (r.credential) onSocialLogin('google', r.credential); },
      auto_select: false,
    });
    const div = document.createElement('div');
    google.accounts.id.renderButton(div, { theme: 'outline', size: 'large' });
    const btn = div.querySelector('div[role=button]') as HTMLElement;
    if (btn) btn.click();
  };

  // ── Facebook ────────────────────────────────────────────────────────
  const handleFacebookLogin = async () => {
    setFbError('');

    if (!FB_APP_ID || FB_APP_ID === 'PENDIENTE_CONFIGURAR') {
      setFbError('Configura VITE_FACEBOOK_APP_ID en el archivo .env del frontend.');
      return;
    }

    try {
      await ensureFbSdk(FB_APP_ID);     // espera a que FB.init() esté hecho
      const FB = (window as any).FB;
      if (!FB) { setFbError('No se pudo cargar el SDK de Facebook.'); return; }

      FB.login((resp: any) => {
        if (resp.authResponse?.accessToken) {
          onSocialLogin('facebook', resp.authResponse.accessToken);
        } else if (resp.status === 'not_authorized') {
          setFbError('El usuario denegó el acceso a Facebook.');
        }
      }, { scope: 'public_profile,email' });

    } catch {
      setFbError('Error de conexión con Facebook. Comprueba tu red.');
    }
  };

  // ── Apple ───────────────────────────────────────────────────────────
  const handleAppleLogin = async () => {
    if (!APPLE_ID || APPLE_ID === 'PENDIENTE_CONFIGURAR') {
      alert('Configura VITE_APPLE_CLIENT_ID en el archivo .env del frontend.');
      return;
    }
    const AppleID = (window as any).AppleID;
    if (!AppleID) { alert('El SDK de Apple no está disponible.'); return; }

    try {
      const resp = await AppleID.auth.signIn();
      const payload = {
        token: resp.authorization.id_token,
        email: resp.user?.email ?? null,
        name:  resp.user?.name
               ? `${resp.user.name.firstName ?? ''} ${resp.user.name.lastName ?? ''}`.trim()
               : null,
      };
      const res = await fetch('/api/usuarios/auth/apple', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const data = await res.json();
        onSocialLogin('apple', data.token ?? '');
      } else {
        const err = await res.json().catch(() => ({}));
        alert(err?.error || 'Error al iniciar sesión con Apple.');
      }
    } catch (e: any) {
      if (e?.error !== 'popup_closed_by_user') console.error('[Apple]', e);
    }
  };

  return (
    <div className="social-auth">

      <button type="button" className="social-auth__button social-auth__button--google"
              onClick={handleGoogleLogin}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
        </svg>
        Continuar con Google
      </button>

      <button type="button" className="social-auth__button social-auth__button--facebook"
              onClick={handleFacebookLogin}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
        Continuar con Facebook
      </button>

      {fbError && (
        <p style={{
          color: '#7f1d1d', fontSize: '0.82rem', textAlign: 'center',
          margin: '-0.25rem 0 0', padding: '0.5rem 1rem',
          background: '#fef2f2', borderRadius: '6px', border: '1px solid #fca5a5',
        }}>
          {fbError}
        </p>
      )}

      <button type="button" className="social-auth__button social-auth__button--apple"
              onClick={handleAppleLogin}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
        </svg>
        Continuar con Apple
      </button>

    </div>
  );
};

export default SocialAuth;
