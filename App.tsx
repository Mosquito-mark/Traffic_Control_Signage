
import React, { useState, useMemo, Suspense, lazy, useCallback } from 'react';
import { Deployment } from './types';
import { useInventoryData } from './hooks/useInventoryData';
import { calculateTotalDays } from './utils/deploymentUtils';
import Dashboard from './components/Dashboard';
import Header from './components/Header';
// FIX: Update icon import path to the consolidated IconComponents.tsx file.
import { LoadingIcon } from './components/IconComponents';
import ErrorBoundary from './components/ErrorBoundary';

// Lazy load view components for code splitting and improved performance
const InvoiceView = lazy(() => import('./components/InvoiceView'));
const DeploymentForm = lazy(() => import('./components/DeploymentForm'));
const YardInventoryDashboard = lazy(() => import('./components/YardInventoryDashboard'));
const TotalInventoryDashboard = lazy(() => import('./components/TotalInventoryDashboard'));
const GeminiChatView = lazy(() => import('./components/GeminiChatView'));
const AboutView = lazy(() => import('./components/AboutView'));

export type View = 'dashboard' | 'invoice' | 'new_deployment' | 'yard_inventory' | 'total_inventory' | 'gemini_chat' | 'edit_deployment' | 'about';

const App: React.FC = () => {
  const { 
    deployments,
    deploymentsMap,
    inventory, 
    addDeployment, 
    updateDeployment, 
    yardInventory, 
    totalInventory,
    isOnline,
    pendingSyncCount 
  } = useInventoryData();
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [selectedDeploymentId, setSelectedDeploymentId] = useState<string | null>(null);

  const selectedDeployment = useMemo(() => {
    return selectedDeploymentId ? deploymentsMap.get(selectedDeploymentId) ?? null : null;
  }, [selectedDeploymentId, deploymentsMap]);

  const handleNavigate = useCallback((view: View) => {
    if (view === 'dashboard') {
        setSelectedDeploymentId(null);
    }
    setCurrentView(view);
  }, []);

  const handleSelectDeployment = useCallback((id: string) => {
    setSelectedDeploymentId(id);
    setCurrentView('invoice');
  }, []);

  const handleSaveDeployment = useCallback(async (newDeploymentData: Omit<Deployment, 'totalDays' | 'synced'>) => {
    const totalDays = calculateTotalDays(newDeploymentData.deploymentDate, newDeploymentData.completionDate);
    await addDeployment({ ...newDeploymentData, totalDays });
    handleNavigate('dashboard');
  }, [addDeployment, handleNavigate]);

  const handleUpdateDeployment = useCallback(async (updatedDeploymentData: Omit<Deployment, 'totalDays' | 'synced'>) => {
    const totalDays = calculateTotalDays(updatedDeploymentData.deploymentDate, updatedDeploymentData.completionDate);
    await updateDeployment({ ...updatedDeploymentData, totalDays });
    handleNavigate('invoice');
  }, [updateDeployment, handleNavigate]);
  
  const handleShowEditDeploymentForm = useCallback((id: string) => {
    setSelectedDeploymentId(id);
    setCurrentView('edit_deployment');
  }, []);

  const renderCurrentView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard deployments={deployments} inventory={inventory} onSelectDeployment={handleSelectDeployment} onShowTotalInventory={() => handleNavigate('total_inventory')} />;
      case 'invoice':
        return selectedDeployment ? <InvoiceView deployment={selectedDeployment} inventory={inventory} onBack={() => handleNavigate('dashboard')} onEdit={handleShowEditDeploymentForm} /> : null;
      case 'new_deployment':
        return <DeploymentForm inventory={inventory} yardInventory={yardInventory} onSave={handleSaveDeployment} onCancel={() => handleNavigate('dashboard')} />;
      case 'edit_deployment':
        return selectedDeployment ? <DeploymentForm inventory={inventory} yardInventory={yardInventory} onSave={handleUpdateDeployment} onCancel={() => handleNavigate('invoice')} existingDeployment={selectedDeployment} /> : null;
      case 'yard_inventory':
        return <YardInventoryDashboard inventoryData={yardInventory} onBack={() => handleNavigate('dashboard')} />;
      case 'total_inventory':
        return <TotalInventoryDashboard inventoryData={totalInventory} onBack={() => handleNavigate('dashboard')} />;
      case 'gemini_chat':
        return <GeminiChatView onBack={() => handleNavigate('dashboard')} />;
      case 'about':
        return <AboutView onBack={() => handleNavigate('dashboard')} />;
      default:
        return <Dashboard deployments={deployments} inventory={inventory} onSelectDeployment={handleSelectDeployment} onShowTotalInventory={() => handleNavigate('total_inventory')} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
      <Header 
        onNavigate={handleNavigate}
        isOnline={isOnline}
        pendingSyncCount={pendingSyncCount}
      />
      <main className="container mx-auto p-4 md:p-8">
        <ErrorBoundary>
          <Suspense fallback={
            <div className="flex justify-center items-center h-64">
              <LoadingIcon className="h-8 w-8 animate-spin text-brand-blue" />
            </div>
          }>
            {renderCurrentView()}
          </Suspense>
        </ErrorBoundary>
      </main>
      <footer className="text-center p-4 text-sm text-gray-500 dark:text-gray-400 print:hidden">
        <p>&copy; 2024 City of Edmonton. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default App;
