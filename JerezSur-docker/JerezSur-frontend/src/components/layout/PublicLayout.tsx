import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import ScrollToTop from './ScrollToTop';
import { ToastProvider } from '../ui/Toast';

export const PublicLayout = () => {
  return (
    <ToastProvider>
      <ScrollToTop />
      <Header />
      <main>
        <Outlet />
      </main>
      <Footer />
    </ToastProvider>
  );
};
