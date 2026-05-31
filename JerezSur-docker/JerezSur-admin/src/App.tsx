// App.tsx o main.tsx
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; // ¡No olvides los estilos!
import { AuthProvider } from './context/AuthContext';
import { AppRoutes } from './routes/AppRoutes';

function App() {
  return (
    <AuthProvider>
      <AppRoutes />

      <ToastContainer
        position="top-right"
        autoClose={4000}
        theme="colored"
      />
    </AuthProvider>
  );
}

export default App;