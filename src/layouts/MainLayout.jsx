import { Outlet } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';
import Footer from './Footer';
import { useAuth } from '../context/AuthContext';

export function MainLayout() {
  const { token } = useAuth();

  return (
    <div className="layout-container" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header />

      <div style={{ display: 'flex', flex: 1 }}>
        {token && <Sidebar />}
        <main style={{ flex: 1, padding: '20px', minWidth: 0 }}>
          <Outlet />
        </main>
      </div>

      <Footer />
    </div>

  );

}
export default MainLayout;