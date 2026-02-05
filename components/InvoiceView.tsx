
import React, { useMemo } from 'react';
import { Deployment, InventoryItem } from '../types';
import { useGeminiQuery } from '../hooks/useGeminiQuery';
// FIX: Update icon import path to the consolidated IconComponents.tsx file.
import { BackArrowIcon, SparklesIcon, LoadingIcon, MapPinIcon, PrintIcon, EditIcon } from './IconComponents';
import { formatCurrency, formatDate } from '../utils/formatters';
import Button from './ui/Button';

interface InvoiceViewProps {
  deployment: Deployment;
  inventory: InventoryItem[];
  onBack: () => void;
  onEdit: (id: string) => void;
}

const InvoiceView: React.FC<InvoiceViewProps> = ({ deployment, inventory, onBack, onEdit }) => {
  const { summary, isLoading, error, generateSummary } = useGeminiQuery();

  const itemCostMap = useMemo(() => {
    return new Map<string, number>(inventory.map(item => [item.item, item.cost]));
  }, [inventory]);

  const invoiceDetails = useMemo(() => {
    const lineItems = deployment.items.map(item => {
      const unitCost = itemCostMap.get(item.item) || 0;
      const totalCost = unitCost * item.quantity * deployment.totalDays;
      return { ...item, unitCost, totalCost };
    });
    const grandTotal = lineItems.reduce((sum, item) => sum + item.totalCost, 0);
    return { lineItems, grandTotal };
  }, [deployment, itemCostMap]);

  const handleGenerateSummary = () => {
    generateSummary({ type: 'invoice', deployment, invoiceDetails });
  };
  
  const handlePrint = () => window.print();

  return (
    <div className="bg-white dark:bg-gray-800 p-6 md:p-8 rounded-lg shadow-lg animate-fade-in">
      <div className="flex justify-between items-center mb-6 print:hidden">
        <button onClick={onBack} className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 font-semibold">
            <BackArrowIcon className="h-4 w-4" />
            <span>Back to Dashboard</span>
        </button>
        <div className="flex items-center space-x-2">
            <Button variant="secondary" onClick={() => onEdit(deployment.id)}>
                <EditIcon className="-ml-1 mr-2 h-5 w-5" />
                <span>Edit</span>
            </Button>
            <Button variant="secondary" onClick={handlePrint}>
                <PrintIcon className="-ml-1 mr-2 h-5 w-5" />
                <span>Print Invoice</span>
            </Button>
        </div>
      </div>

      <div className="border-b border-gray-200 dark:border-gray-700 pb-6 mb-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">{deployment.event}</h2>
        <p className="text-lg text-gray-500 dark:text-gray-400">Invoice for PM #{deployment.id}</p>
        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
                <p className="font-semibold text-gray-500 dark:text-gray-400">Charged To:</p>
                <p className="text-gray-700 dark:text-gray-200">{deployment.chargeOut}</p>
            </div>
            <div>
                <p className="font-semibold text-gray-500 dark:text-gray-400">Total Days:</p>
                <p className="text-gray-700 dark:text-gray-200">{deployment.totalDays}</p>
            </div>
             {deployment.location && (
                <div className="col-span-2">
                    <p className="font-semibold text-gray-500 dark:text-gray-400">Location:</p>
                     <a 
                      href={`https://www.google.com/maps?q=${encodeURIComponent(deployment.location.street)}+and+${encodeURIComponent(deployment.location.avenue)}`} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-brand-blue hover:text-brand-blue-dark dark:text-brand-blue-light dark:hover:text-blue-400 underline inline-flex items-center"
                    >
                      <MapPinIcon className="h-4 w-4 mr-1" />
                      {deployment.location.street} & {deployment.location.avenue}
                    </a>
                </div>
            )}
             <div>
                <p className="font-semibold text-gray-500 dark:text-gray-400">Deployment:</p>
                <p className="text-gray-700 dark:text-gray-200">{formatDate(deployment.deploymentDate)}</p>
            </div>
            <div>
                <p className="font-semibold text-gray-500 dark:text-gray-400">Completion:</p>
                <p className="text-gray-700 dark:text-gray-200">{formatDate(deployment.completionDate)}</p>
            </div>
            {deployment.dropOffDate && (
                <div>
                    <p className="font-semibold text-gray-500 dark:text-gray-400">Drop Off Date:</p>
                    <p className="text-gray-700 dark:text-gray-200">{formatDate(deployment.dropOffDate)}</p>
                </div>
            )}
            {deployment.pickUpDate && (
                 <div>
                    <p className="font-semibold text-gray-500 dark:text-gray-400">Pick Up Date:</p>
                    <p className="text-gray-700 dark:text-gray-200">{formatDate(deployment.pickUpDate)}</p>
                </div>
            )}
        </div>
      </div>

      <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Itemized Charges</h3>
      <div className="overflow-x-auto mb-6">
         <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Item</th>
              <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Yard</th>
              <th scope="col" className="px-4 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Quantity</th>
              <th scope="col" className="px-4 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Unit Cost/Day</th>
              <th scope="col" className="px-4 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Line Total</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {invoiceDetails.lineItems.map((item, index) => (
              <tr key={index}>
                <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-200">{item.item}</td>
                <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{item.yard}</td>
                <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 text-right">{item.quantity}</td>
                <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 text-right">{formatCurrency(item.unitCost)}</td>
                <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-800 dark:text-gray-200 text-right">{formatCurrency(item.totalCost)}</td>
              </tr>
            ))}
          </tbody>
           <tfoot>
            <tr>
              <td colSpan={4} className="px-4 sm:px-6 py-4 text-right text-sm font-bold text-gray-700 dark:text-gray-200 uppercase">Grand Total</td>
              <td className="px-4 sm:px-6 py-4 text-right text-base sm:text-lg font-bold text-gray-900 dark:text-gray-100">{formatCurrency(invoiceDetails.grandTotal)}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div className="bg-gray-50 dark:bg-gray-900 p-6 rounded-lg print:hidden">
          <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">AI-Powered Summary</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Generate a concise summary of this invoice for reporting purposes.</p>
          <Button onClick={handleGenerateSummary} disabled={isLoading}>
            {isLoading ? <LoadingIcon className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" /> : <SparklesIcon className="-ml-1 mr-2 h-5 w-5" />}
            {isLoading ? 'Generating...' : 'Generate Summary'}
          </Button>
          
          {error && <div className="mt-4 text-sm text-red-500 bg-red-100 dark:bg-red-900/20 dark:text-red-400 p-3 rounded-md">{error}</div>}
          
          {summary && (
              <div className="mt-4 p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md prose prose-sm max-w-none prose-gray dark:prose-invert">
                  <p>{summary}</p>
              </div>
          )}
      </div>

    </div>
  );
};

export default InvoiceView;
