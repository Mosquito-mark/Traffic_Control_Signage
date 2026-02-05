
import React, { useMemo, useRef, useState } from 'react';
import { Deployment, InventoryItem } from '../types';
import { BoxIcon, InventoryIcon } from './IconComponents';
import StatCard from './StatCard';
import InventoryCalendar from './InventoryCalendar';

interface DashboardProps {
  deployments: Deployment[];
  inventory: InventoryItem[];
  onSelectDeployment: (id: string) => void;
  onShowTotalInventory: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ deployments, inventory, onSelectDeployment, onShowTotalInventory }) => {
  const deploymentsSectionRef = useRef<HTMLDivElement>(null);
  const [showOnlyActive, setShowOnlyActive] = useState(false);

  // Helper to parse date strings as local time without timezone issues
  const parseDateString = (dateString: string): Date => {
    const [year, month, day] = dateString.split('-').map(num => parseInt(num, 10));
    return new Date(year, month - 1, day);
  };
  
  const { currentlyActiveDeployments, currentlyActiveCount } = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize to the start of the current day

    const active = deployments.filter(d => {
      const startDate = parseDateString(d.deploymentDate);
      const endDate = parseDateString(d.completionDate);
      return today >= startDate && today <= endDate;
    });
    return { currentlyActiveDeployments: active, currentlyActiveCount: active.length };
  }, [deployments]);
  
  const filteredDeployments = useMemo(() => {
    return showOnlyActive ? currentlyActiveDeployments : deployments;
  }, [showOnlyActive, currentlyActiveDeployments, deployments]);

  const handleViewActiveDeployments = () => {
    setShowOnlyActive(true);
    deploymentsSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  const handleShowAllDeployments = () => {
    setShowOnlyActive(false);
  };

  const totalItemsDeployed = useMemo(() => {
    return deployments
      .flatMap(d => d.items)
      .reduce((sum, item) => sum + item.quantity, 0);
  }, [deployments]);

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <StatCard 
              icon={<InventoryIcon className="h-6 w-6"/>} 
              title="Active / Total Deployments" 
              value={`${currentlyActiveCount} / ${deployments.length}`} 
              buttonText="View Active"
              onButtonClick={handleViewActiveDeployments}
          />
          <StatCard 
              icon={<BoxIcon className="h-6 w-6"/>} 
              title="Total Items Deployed" 
              value={totalItemsDeployed.toLocaleString()} 
              buttonText="View Details"
              onButtonClick={onShowTotalInventory}
          />
      </div>

      <div ref={deploymentsSectionRef} className="bg-white dark:bg-gray-800 p-6 md:p-8 rounded-lg shadow-lg animate-fade-in scroll-mt-24">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-6">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">Deployment Details</h2>
              <p className="text-gray-500 dark:text-gray-400 mt-1">
                Showing {filteredDeployments.length} {showOnlyActive ? 'active' : 'total'} deployments.
              </p>
            </div>
            {showOnlyActive && (
              <button
                onClick={handleShowAllDeployments}
                className="text-sm font-semibold text-brand-blue-light hover:text-brand-blue dark:hover:text-blue-400 transition-colors duration-200 self-start sm:self-center"
              >
                &larr; Show All Deployments
              </button>
            )}
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">PM #</th>
                <th scope="col" className="relative px-4 sm:px-6 py-3">
                  <span className="sr-only">View Invoice</span>
                </th>
                <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Event / Project</th>
                <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Deployment Date</th>
                <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Completion Date</th>
                <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Days</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredDeployments.map((deployment) => (
                <tr key={deployment.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200">
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">{deployment.id}</td>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-left text-sm font-medium">
                    <button
                      onClick={() => onSelectDeployment(deployment.id)}
                      className="text-brand-blue-light hover:text-brand-blue font-semibold transition-colors duration-200 dark:hover:text-blue-400"
                    >
                      View Invoice
                    </button>
                  </td>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{deployment.event}</td>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{new Date(deployment.deploymentDate).toLocaleDateString()}</td>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{new Date(deployment.completionDate).toLocaleDateString()}</td>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{deployment.totalDays}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 md:p-8 rounded-lg shadow-lg animate-fade-in">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">Inventory Health Calendar</h2>
        <InventoryCalendar deployments={deployments} inventory={inventory} />
      </div>

    </div>
  );
};

export default Dashboard;
