// Componente raíz de la aplicación pública: envuelve todo con el AuthProvider y las rutas.
import { GoogleOAuthProvider } from '@react-oauth/google';
import { useEffect } from 'react';
import { AppRoutes } from './routes/AppRoutes';
import { AuthProvider } from './context/AuthContext';
import './styles/App.scss';

const clientGGId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const clientFBId = import.meta.env.VITE_FACEBOOK_APP_ID;
const clientAPId = import.meta.env.VITE_APPLE_CLIENT_ID;

function App() {
  useEffect(() => {
    // Inicialización de Facebook SDK
    if ((window as any).FB) {
      (window as any).FB.init({
        appId      : clientFBId,
        cookie     : true,
        xfbml      : true,
        version    : 'v18.0'
      });
    }
    
    // Inicialización de Apple (AppleID.auth.init)
    if ((window as any).AppleID) {
        (window as any).AppleID.auth.init({
            clientId : 'com.jerezsur.client',
            scope : 'name email',
            redirectURI : clientAPId,
            usePopup : true
        });
    }
  }, []);

  return (
    <GoogleOAuthProvider clientId={clientGGId}>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}

export default App;