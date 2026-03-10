import { useState } from 'react'
import { GenUIProvider } from './context/GenUIContext'
import { useAuth } from './context/AuthContext'
import { useDemo } from './context/DemoContext'
import Login from "./Login"
import CommandCenter from "./CommandCenter"
import Operations from "./Operations"
import ServiceCenter from "./ServiceCenter"
import OrderDetail from "./OrderDetail"
import AckDetail from "./AckDetail"
import Workspace from "./Workspace"
import Navbar from "./components/Navbar"
import DemoGuide from "./components/DemoGuide"
import SessionExpiryModal from "./components/SessionExpiryModal"
import DemoSidebar from "./components/demo/DemoSidebar"
import DemoSpotlight from "./components/demo/DemoSpotlight"
import DemoProcessPanel from "./components/demo/DemoProcessPanel"
import DemoStepBanner from "./components/demo/DemoStepBanner"
import DemoAIIndicator from "./components/demo/DemoAIIndicator"

// Simulations (kept for demo mode)
import ExpertHubTransactions from "./components/simulations/ExpertHubTransactions"
import EmailSimulation from "./components/simulations/EmailSimulation"
import DealerMonitorKanban from "./components/simulations/DealerMonitorKanban"

import {
  HomeIcon,
  BanknotesIcon,
  WrenchScrewdriverIcon,
} from '@heroicons/react/24/outline'

import logoLightBrand from './assets/logo-light-brand.png'
import logoDarkBrand from './assets/logo-dark-brand.png'

type ManufacturerPage = 'command-center' | 'operations' | 'service-center' | 'order-detail' | 'ack-detail' | 'workspace'

function App() {
  const { user, initialLoading, signOut, showSessionWarning, refreshSession } = useAuth()
  const { isDemoActive, currentStep, isSidebarCollapsed } = useDemo()
  const [currentPage, setCurrentPage] = useState<ManufacturerPage>('command-center')
  const [isDemoGuideOpen, setIsDemoGuideOpen] = useState(false)

  const handleNavigate = (page: string) => {
    if (page === 'overview' || page === 'dashboard') {
      setCurrentPage('command-center')
    } else {
      setCurrentPage(page as ManufacturerPage)
    }
  }

  const handleLogout = async () => {
    await signOut()
    setCurrentPage('command-center')
  }

  if (initialLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <img src={logoLightBrand} alt="Strata" className="h-16 w-auto block dark:hidden" />
          <img src={logoDarkBrand} alt="Strata" className="h-16 w-auto hidden dark:block" />
          <svg className="animate-spin h-8 w-8 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <p className="text-muted-foreground text-sm">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <Login />
  }

  // --- SIMULATION CONFIGURATIONS (Demo Mode) ---
  const getSimulationConfig = () => {
    if (!isDemoActive) return { appName: undefined, companyName: undefined, customNavigation: undefined };

    const manufacturerNav = [
      { name: 'Command Center', page: 'command-center', icon: HomeIcon },
      { name: 'Operations', page: 'operations', icon: BanknotesIcon },
      { name: 'Service Center', page: 'service-center', icon: WrenchScrewdriverIcon },
    ];

    const isExpert = ['expert-hub', 'dealer-kanban', 'ack-detail', 'transactions', 'mac', 'quote-detail'].includes(currentStep.app);
    const resolvedAppName = currentStep.app === 'email-marketplace' ? 'Wells Fargo Mail'
      : isExpert ? 'Expert Hub'
      : 'Manufacturer Experience';
    const resolvedCompany = isExpert ? 'Strata Services' : 'Acme Corp';

    switch (currentStep.app) {
      case 'expert-hub':
      case 'dealer-kanban':
      case 'ack-detail':
      case 'transactions':
      case 'mac':
      case 'quote-detail':
        return {
          appName: resolvedAppName, companyName: resolvedCompany,
          customNavigation: [
            { name: 'Command Center', page: 'command-center', icon: HomeIcon },
            { name: 'Operations', page: 'operations', icon: BanknotesIcon },
            { name: 'Service Center', page: 'service-center', icon: WrenchScrewdriverIcon },
          ]
        };
      case 'email-marketplace':
        return { appName: resolvedAppName, companyName: resolvedCompany, customNavigation: manufacturerNav };
      default:
        return { appName: resolvedAppName, companyName: resolvedCompany, customNavigation: manufacturerNav };
    }
  };

  const { appName, companyName, customNavigation } = getSimulationConfig();

  // Map demo app names to manufacturer nav tabs
  const getActiveTab = () => {
    if (!isDemoActive) return currentPage;
    const appToTab: Record<string, string> = {
      'dealer-kanban': 'operations',
      'expert-hub': 'operations',
      'email-marketplace': 'command-center',
      'dashboard': 'command-center',
      'transactions': 'operations',
      'order-detail': 'operations',
      'ack-detail': 'operations',
      'mac': 'service-center',
      'quote-detail': 'operations',
      'inventory': 'operations',
    };
    return appToTab[currentStep.app] || currentPage;
  };

  // --- SIMULATION ROUTING (Demo Mode) ---
  const renderSimulation = () => {
    switch (currentStep.app) {
      case 'expert-hub':
        return (
          <ExpertHubTransactions
            onLogout={handleLogout}
            onNavigateToDetail={(id) => {
              console.log('Navigate to detail', id);
              setCurrentPage('order-detail');
            }}
            onNavigateToWorkspace={() => setCurrentPage('workspace')}
            onNavigate={(p) => handleNavigate(p)}
          />
        );
      case 'email-marketplace':
        return <EmailSimulation />;
      case 'dealer-kanban':
        return <DealerMonitorKanban onNavigate={handleNavigate} />;
      case 'dashboard':
        return <CommandCenter onLogout={handleLogout} onNavigateToDetail={() => setCurrentPage('order-detail')} onNavigateToWorkspace={() => setCurrentPage('workspace')} onNavigate={handleNavigate} />;
      case 'ack-detail':
        return <AckDetail onBack={() => setCurrentPage('operations')} onLogout={handleLogout} onNavigateToWorkspace={() => setCurrentPage('workspace')} onNavigate={handleNavigate} />;
      case 'transactions':
        return <Operations onLogout={handleLogout} onNavigateToDetail={(type: string) => setCurrentPage(type as ManufacturerPage)} onNavigateToWorkspace={() => setCurrentPage('workspace')} onNavigate={handleNavigate} />;
      case 'mac':
        return <ServiceCenter onLogout={handleLogout} onNavigateToDetail={() => setCurrentPage('order-detail')} onNavigateToWorkspace={() => setCurrentPage('workspace')} onNavigate={handleNavigate} />;
      case 'order-detail':
        return <OrderDetail onBack={() => setCurrentPage('operations')} onLogout={handleLogout} onNavigateToWorkspace={() => setCurrentPage('workspace')} onNavigate={handleNavigate} />;
      default:
        return (
          <ExpertHubTransactions
            onLogout={handleLogout}
            onNavigateToDetail={(id) => {
              console.log('Navigate to detail', id);
              setCurrentPage('order-detail');
            }}
            onNavigateToWorkspace={() => setCurrentPage('workspace')}
            onNavigate={(p) => handleNavigate(p)}
          />
        );
    }
  };

  // --- NORMAL PAGE ROUTING ---
  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'command-center':
        return <CommandCenter onLogout={handleLogout} onNavigateToDetail={() => setCurrentPage('order-detail')} onNavigateToWorkspace={() => setCurrentPage('workspace')} onNavigate={handleNavigate} />;
      case 'operations':
        return <Operations onLogout={handleLogout} onNavigateToDetail={(type: string) => setCurrentPage(type as ManufacturerPage)} onNavigateToWorkspace={() => setCurrentPage('workspace')} onNavigate={handleNavigate} />;
      case 'service-center':
        return <ServiceCenter onLogout={handleLogout} onNavigateToDetail={() => setCurrentPage('order-detail')} onNavigateToWorkspace={() => setCurrentPage('workspace')} onNavigate={handleNavigate} />;
      case 'order-detail':
        return <OrderDetail onBack={() => setCurrentPage('operations')} onLogout={handleLogout} onNavigateToWorkspace={() => setCurrentPage('workspace')} onNavigate={handleNavigate} />;
      case 'ack-detail':
        return <AckDetail onBack={() => setCurrentPage('operations')} onLogout={handleLogout} onNavigateToWorkspace={() => setCurrentPage('workspace')} onNavigate={handleNavigate} />;
      case 'workspace':
        return <Workspace onBack={() => setCurrentPage('command-center')} onLogout={handleLogout} onNavigateToWorkspace={() => setCurrentPage('workspace')} />;
      default:
        return null;
    }
  };

  return (
    <GenUIProvider onNavigate={handleNavigate}>
      <SessionExpiryModal
        isOpen={showSessionWarning}
        onExtend={refreshSession}
        onLogout={handleLogout}
      />

      {/* Demo UI Elements */}
      <DemoSidebar />
      <DemoSpotlight />
      <DemoProcessPanel onNavigate={handleNavigate} />
      <DemoStepBanner />

      {/* FIXED NAVBAR — hidden for email simulation & workspace */}
      {(isDemoActive
        ? currentStep.app !== 'email-marketplace' && !['1.8', '3.5'].includes(currentStep.id)
        : currentPage !== 'workspace'
      ) && (
        <div className="fixed top-0 left-0 right-0 z-[100]">
          <Navbar
            onLogout={handleLogout}
            onNavigateToWorkspace={() => setCurrentPage('workspace')}
            onOpenDemoGuide={() => setIsDemoGuideOpen(true)}
            activeTab={getActiveTab()}
            onNavigate={handleNavigate}
            appName={appName}
            companyName={companyName}
            customNavigation={customNavigation}
          />
        </div>
      )}

      {/* MAIN CONTENT VIEWPORT */}
      <main className={`transition-all duration-300 ${(isDemoActive ? currentStep.app !== 'email-marketplace' : currentPage !== 'workspace') ? 'pt-16' : ''} ${isDemoActive ? (isSidebarCollapsed ? 'pl-0' : 'pl-80') + ' animate-in fade-in duration-500' : ''} min-h-screen bg-background`}>
        {isDemoActive && <DemoAIIndicator />}
        {isDemoActive ? renderSimulation() : renderCurrentPage()}
      </main>

      <DemoGuide
        isOpen={isDemoGuideOpen}
        onClose={() => setIsDemoGuideOpen(false)}
        onNavigate={handleNavigate}
      />
    </GenUIProvider>
  );
}

export default App
