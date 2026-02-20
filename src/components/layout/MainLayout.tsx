import { Outlet } from 'react-router-dom';
import { Header } from '../common/Header';
import { BottomNav } from '../common/BottomNav';

export const MainLayout = () => {
  return (
    <div className="min-h-screen bg-sand-50">
      <Header />
      <main className="pb-16 md:pb-0">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
};
