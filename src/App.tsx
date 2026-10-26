import React, { useState, useEffect } from 'react';
import { Sidebar, ActiveTab } from './components/layout/Sidebar';
import { TopBar } from './components/layout/TopBar';
import { GlobalSearchModal } from './components/modals/GlobalSearchModal';
import { NotificationCenterModal } from './components/modals/NotificationCenterModal';

// Pages
import { DashboardPage } from './pages/DashboardPage';
import { PersonnelPage } from './pages/PersonnelPage';
import { InventoryPage } from './pages/InventoryPage';
import { GeoPage } from './pages/GeoPage';
import { LogisticsPage } from './pages/LogisticsPage';
import { MedicalPage } from './pages/MedicalPage';
import { MaintenancePage } from './pages/MaintenancePage';
import { TrainingPage } from './pages/TrainingPage';
import { WeatherPage } from './pages/WeatherPage';
import { SecurityPage } from './pages/SecurityPage';
import { ReportsPage } from './pages/ReportsPage';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Modals
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [notifModalOpen, setNotifModalOpen] = useState(false);

  // Global keyboard shortcuts (Ctrl+K or Cmd+K for search)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchModalOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const renderActivePage = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardPage onNavigate={setActiveTab} />;
      case 'personnel':
        return <PersonnelPage />;
      case 'inventory':
        return <InventoryPage />;
      case 'geo':
        return <GeoPage />;
      case 'logistics':
        return <LogisticsPage />;
      case 'medical':
        return <MedicalPage />;
      case 'maintenance':
        return <MaintenancePage />;
      case 'training':
        return <TrainingPage />;
      case 'weather':
        return <WeatherPage />;
      case 'security':
        return <SecurityPage />;
      case 'reports':
        return <ReportsPage />;
      default:
        return <DashboardPage onNavigate={setActiveTab} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#151A17] text-[#E8EBDD] font-sans antialiased flex flex-col selection:bg-[#414B32] selection:text-[#E8EBDD]">
      {/* Persistent Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
        mobileOpen={mobileSidebarOpen}
        setMobileOpen={setMobileSidebarOpen}
      />

      {/* Main Workspace Frame */}
      <div
        className={`flex-1 flex flex-col transition-all duration-200 ${
          sidebarCollapsed ? 'lg:pl-20' : 'lg:pl-64'
        }`}
      >
        {/* Persistent Top Navigation Bar */}
        <TopBar
          activeTab={activeTab}
          setMobileOpen={setMobileSidebarOpen}
          onOpenSearch={() => setSearchModalOpen(true)}
          onOpenNotifications={() => setNotifModalOpen(true)}
        />

        {/* Main Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {renderActivePage()}
        </main>
      </div>

      {/* Global Modals */}
      <GlobalSearchModal
        isOpen={searchModalOpen}
        onClose={() => setSearchModalOpen(false)}
        onNavigate={setActiveTab}
      />

      <NotificationCenterModal
        isOpen={notifModalOpen}
        onClose={() => setNotifModalOpen(false)}
        onNavigate={setActiveTab}
      />
    </div>
  );
};
export default App;
