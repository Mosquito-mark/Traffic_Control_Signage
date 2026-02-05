import React, { useMemo, useState } from 'react';
import { BackArrowIcon, ExportIcon, SearchIcon } from './IconComponents';
import { exportYardInventoryToCSV } from '../services/exportService';
import StockLevelBar from './StockLevelBar';
// FIX: Import YardInventory type for correct casting.
import { YardInventoryData, YardInventory } from '../utils/inventoryCalculators';

interface YardInventoryDashboardProps {
    inventoryData: YardInventoryData;
    onBack: () => void;
}

const YardInventoryDashboard: React.FC<YardInventoryDashboardProps> = ({ inventoryData, onBack }) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  const handleExport = () => {
    exportYardInventoryToCSV(inventoryData);
  };

  // Memoize the filtered and sorted list to prevent re-calculating on every render
  const filteredAndSortedInventoryData = useMemo(() => {
    const trimmedSearch = searchTerm.trim().toLowerCase();
    
    // If search term is empty, just sort the original data
    if (!trimmedSearch) {
        // FIX: Cast `items` to YardInventory[] to resolve iterator and method errors.
        return Object.entries(inventoryData).map(([yard, items]) => {
            const typedItems = items as YardInventory[];
            const sortedItems = [...typedItems].sort((a, b) => a.item.localeCompare(b.item));
            return [yard, sortedItems] as [string, YardInventory[]];
        });
    }

    return Object.entries(inventoryData)
      .map(([yard, items]) => {
        // FIX: Cast `items` to YardInventory[] to resolve iterator and method errors.
        const typedItems = items as YardInventory[];
        const filteredItems = typedItems.filter(item =>
          item.item.toLowerCase().includes(trimmedSearch)
        );
        const sortedItems = [...filteredItems].sort((a, b) => a.item.localeCompare(b.item));
        return [yard, sortedItems] as [string, YardInventory[]];
      })
      // Hide yards that have no matching items after filtering
      .filter(([, items]) => items.length > 0);
  }, [inventoryData, searchTerm]);

  return (
    <div className="bg-white dark:bg-gray-800 p-6 md:p-8 rounded-lg shadow-lg animate-fade-in space-y-8">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div>
                <button onClick={onBack} className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 mb-2 font-semibold">
                    <BackArrowIcon className="h-4 w-4" />
                    <span>Back to Main Dashboard</span>
                </button>
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">Yard Inventory Status</h2>
                <p className="text-gray-500 dark:text-gray-400 mt-1">Live overview of remaining stock across all yards.</p>
            </div>
            <button
                onClick={handleExport}
                className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-brand-green hover:bg-brand-green-dark focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-800 focus:ring-brand-green"
            >
                <ExportIcon className="-ml-1 mr-2 h-5 w-5" />
                Export to CSV
            </button>
        </div>

        <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <SearchIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
                type="text"
                placeholder="Search inventory items by name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-blue focus:border-brand-blue sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 dark:placeholder-gray-400 dark:focus:ring-brand-blue-light dark:focus:border-brand-blue-light"
                aria-label="Search inventory items"
            />
        </div>

        <div className="space-y-10">
            {filteredAndSortedInventoryData.length > 0 ? (
                filteredAndSortedInventoryData.map(([yard, items]) => (
                    <div key={yard}>
                        <h3 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">{yard}</h3>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead className="bg-gray-50 dark:bg-gray-700">
                                    <tr>
                                        <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-1/3">Item</th>
                                        <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-1/4">Stock Level</th>
                                        <th scope="col" className="px-4 sm:px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Initial Stock</th>
                                        <th scope="col" className="px-4 sm:px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Deployed</th>
                                        <th scope="col" className="px-4 sm:px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Remaining</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                    {items.map((itemData) => (
                                        <tr key={itemData.item}>
                                            <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">{itemData.item}</td>
                                            <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                <StockLevelBar remaining={itemData.remaining} initial={itemData.initial} />
                                            </td>
                                            <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 text-center">{itemData.initial}</td>
                                            <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 text-center">{itemData.deployed}</td>
                                            <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-800 dark:text-gray-100 text-center">{itemData.remaining}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ))
            ) : (
                <div className="text-center py-10 border-t border-dashed border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">No Results Found</h3>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">No inventory items match your search for "{searchTerm}".</p>
                </div>
            )}
        </div>
    </div>
  );
};

export default YardInventoryDashboard;
