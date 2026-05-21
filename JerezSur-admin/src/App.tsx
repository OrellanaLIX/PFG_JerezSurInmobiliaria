import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import ScrollToTop from './components/layout/ScrollToTop';
import Header from './components/layout/Header';
import DashboardResumen from './pages/DashboardResume';
import { AuthProvider } from './context/AuthContext';

function App() {

  return (
    <Router>
      <AuthProvider>
        <ScrollToTop />
        <Header />
        <Routes>
          <Route path="/dashboard" element={<DashboardResumen />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;