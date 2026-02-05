import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { InventoryItem, DeployedItem, Deployment } from '../types';
import { PlusIcon, TrashIcon } from './IconComponents';
// FIX: Add YardInventory type import for correct casting.
import { YardInventoryData, YardInventory } from '../utils/inventoryCalculators';
import { getCurrentLocation } from '../services/geolocationService';
// FIX: Update import for ValidationRule type to import it from its source file.
import { useValidation } from '../hooks/useValidation';
import { ValidationRule } from '../utils/validation';

interface DeploymentFormProps {
    inventory: InventoryItem[];
    yardInventory: YardInventoryData;
    onSave: (deployment: Omit<Deployment, 'totalDays' | 'synced'>) => void;
    onCancel: () => void;
    existingDeployment?: Deployment | null;
}

const MAX_DEPLOYMENT_ITEMS = 500; // Client-side DoS protection

// Validation rules for form fields
const formValidationRules: Record<string, ValidationRule[]> = {
    pmId: [{ type: 'required' }, { type: 'maxLength', value: 20 }],
    chargeOut: [{ type: 'required' }, { type: 'maxLength', value: 100 }, { type: 'noSpecialChars' }],
    event: [{ type: 'required' }, { type: 'maxLength', value: 150 }, { type: 'noSpecialChars' }],
    street: [{ type: 'maxLength', value: 100 }, { type: 'noSpecialChars' }],
    avenue: [{ type: 'maxLength', value: 100 }, { type: 'noSpecialChars' }],
};

const LocationFetcher: React.FC<{onLocationFetch: (street: string, avenue: string) => void}> = ({ onLocationFetch }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleFetchLocation = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const { street, avenue } = await getCurrentLocation();
            onLocationFetch(street, avenue);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setLoading(false);
        }
    }, [onLocationFetch]);

    return (
        <div className="md:col-span-2">
            <button type="button" onClick={handleFetchLocation} disabled={loading} className="w-full text-sm text-brand-blue-light hover:underline disabled:opacity-50 disabled:cursor-wait">
                {loading ? 'Fetching Location...' : 'Or use my current location'}
            </button>
            {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
        </div>
    );
}

const getOffsetDate = (dateString: string, offsetDays: number): string => {
    if (!dateString) return '';
    const [year, month, day] = dateString.split('-').map(Number);
    // Month is 0-indexed in JS Date constructor
    const date = new Date(year, month - 1, day);
    date.setDate(date.getDate() + offsetDays);
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
};

const DeploymentForm: React.FC<DeploymentFormProps> = ({ inventory, yardInventory, onSave, onCancel, existingDeployment = null }) => {
    const isEditMode = !!existingDeployment;

    const [items, setItems] = useState<DeployedItem[]>([]);
    const [currentItemName, setCurrentItemName] = useState('');
    const [currentItemYard, setCurrentItemYard] = useState('');
    const [currentItemQuantity, setCurrentItemQuantity] = useState('');
    
    const [dateErrors, setDateErrors] = useState<{ dropOff?: string; pickUp?: string; completion?: string }>({});

    // Use the validation hook
    const { values, errors, setValues, validate, validateAll } = useValidation({
      initialValues: {
        pmId: '',
        event: '',
        chargeOut: '',
        deploymentDate: '',
        completionDate: '',
        dropOffDate: '',
        pickUpDate: '',
        street: '',
        avenue: '',
      },
      rules: formValidationRules
    });
    
    useEffect(() => {
        if (isEditMode && existingDeployment) {
            setValues({
                pmId: existingDeployment.id,
                event: existingDeployment.event,
                chargeOut: existingDeployment.chargeOut,
                deploymentDate: existingDeployment.deploymentDate,
                completionDate: existingDeployment.completionDate,
                dropOffDate: existingDeployment.dropOffDate || '',
                pickUpDate: existingDeployment.pickUpDate || '',
                street: existingDeployment.location?.street || '',
                avenue: existingDeployment.location?.avenue || '',
            });
            setItems(existingDeployment.items || []);
        }
    }, [isEditMode, existingDeployment, setValues]);

    const { allItems, allYards } = useMemo(() => {
        const items = [...new Set(inventory.map(i => i.item))].sort((a, b) => a.localeCompare(b));
        // FIX: Add explicit type annotations for sort callback parameters to resolve 'unknown' type error.
        const yards = Object.keys(yardInventory).sort((a: string, b: string) => a.localeCompare(b));
        return { allItems: items, allYards: yards };
    }, [inventory, yardInventory]);
    
    useEffect(() => {
        if (!currentItemYard && allYards.length > 0) {
            setCurrentItemYard(allYards[0]);
        }
    }, [allYards, currentItemYard]);

    // Centralized date validation logic
    useEffect(() => {
        const errors: { dropOff?: string; pickUp?: string; completion?: string } = {};
        const { deploymentDate, completionDate, dropOffDate, pickUpDate } = values;

        if (deploymentDate && completionDate) {
            const deploymentTime = new Date(deploymentDate).getTime();
            const completionTime = new Date(completionDate).getTime();
            if (completionTime < deploymentTime) {
                errors.completion = 'Completion date cannot be before the deployment date.';
            }
        }

        if (dropOffDate && deploymentDate) {
            const dropOffTime = new Date(dropOffDate).getTime();
            const deploymentTime = new Date(deploymentDate).getTime();
            if (dropOffTime >= deploymentTime) {
                errors.dropOff = 'Drop off date must be before the deployment date.';
            }
        }

        if (pickUpDate && completionDate) {
            const pickUpTime = new Date(pickUpDate).getTime();
            const completionTime = new Date(completionDate).getTime();
            if (pickUpTime <= completionTime) {
                errors.pickUp = 'Pick up date must be after the completion date.';
            }
        }

        setDateErrors(errors);
    }, [values.deploymentDate, values.completionDate, values.dropOffDate, values.pickUpDate]);

    useEffect(() => {
        if (currentItemName) {
            let bestYard = '';
            let maxStock = -1;
            Object.entries(yardInventory).forEach(([yard, items]) => {
                // FIX: Cast `items` to `YardInventory[]` to allow calling `.find()`.
                const itemInfo = (items as YardInventory[]).find(item => item.item === currentItemName);
                if (itemInfo && itemInfo.remaining > maxStock) {
                    maxStock = itemInfo.remaining;
                    bestYard = yard;
                }
            });
            if (bestYard) setCurrentItemYard(bestYard);
        }
    }, [currentItemName, yardInventory]);

    const availableStock = useMemo(() => {
        if (!currentItemName || !currentItemYard) return undefined;
        // FIX: Cast the result of the property access to `YardInventory[]` to allow calling `.find()`.
        const stockInfo = (yardInventory[currentItemYard] as YardInventory[])?.find(item => item.item === currentItemName);
        return stockInfo ? stockInfo.remaining : 0;
    }, [currentItemName, currentItemYard, yardInventory]);


    const handleAddItem = useCallback(() => {
        if (!currentItemName || !currentItemQuantity || !currentItemYard || items.length >= MAX_DEPLOYMENT_ITEMS) return;
        const newItem: DeployedItem = {
            item: currentItemName,
            yard: currentItemYard,
            quantity: parseInt(currentItemQuantity, 10),
        };
        setItems(prev => [...prev, newItem]);
        setCurrentItemName('');
        setCurrentItemQuantity('');
    }, [currentItemName, currentItemQuantity, currentItemYard, items.length]);

    const handleRemoveItem = useCallback((indexToRemove: number) => {
        setItems(prev => prev.filter((_, index) => index !== indexToRemove));
    }, []);
    
    const handleLocationFetch = useCallback((fetchedStreet: string, fetchedAvenue: string) => {
        setValues(prev => ({ ...prev, street: fetchedStreet, avenue: fetchedAvenue }));
    }, [setValues]);

    const isFormValid = useMemo(() => {
        const noInputErrors = Object.values(errors).every(e => !e);
        return values.pmId && values.event && values.chargeOut && values.deploymentDate && values.completionDate && items.length > 0 && Object.keys(dateErrors).length === 0 && noInputErrors;
    }, [values, items.length, dateErrors, errors]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const isValid = validateAll();
        if (!isValid || !isFormValid) return;

        onSave({
            id: values.pmId,
            event: values.event,
            chargeOut: values.chargeOut,
            deploymentDate: values.deploymentDate,
            completionDate: values.completionDate,
            dropOffDate: values.dropOffDate,
            pickUpDate: values.pickUpDate,
            location: values.street && values.avenue ? { street: values.street, avenue: values.avenue } : undefined,
            items,
        });
    }

    const inputClasses = "mt-1 block w-full rounded-md border bg-gray-50 border-gray-300 text-gray-900 shadow-sm focus:border-brand-blue focus:ring-brand-blue sm:text-sm dark:bg-gray-700 dark:border-gray-500 dark:text-gray-200 dark:focus:border-brand-blue-light dark:focus:ring-brand-blue-light disabled:bg-gray-200 dark:disabled:bg-gray-600 disabled:opacity-70";
    const dateInputClasses = `${inputClasses} [color-scheme:light] dark:[color-scheme:dark]`;
    const highlightBoxClasses = "p-3 bg-blue-50 dark:bg-gray-700/50 rounded-lg border border-blue-200 dark:border-gray-600";
    const greenHighlightBoxClasses = "p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-600";
    const errorHighlightClasses = 'border-red-500 bg-red-50 dark:border-red-600 dark:bg-red-900/20 focus:border-red-500 focus:ring-red-500';

    return (
        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 p-6 md:p-8 rounded-lg shadow-lg animate-fade-in space-y-6" noValidate>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">{isEditMode ? 'Edit Drop-Off' : 'New Drop-Off'}</h2>

            <div className="space-y-6">
                <h3 className="text-xl font-semibold border-b border-gray-200 dark:border-gray-700 pb-2 text-gray-800 dark:text-gray-200">Deployment Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                    <div>
                        <label htmlFor="pmId" className="block text-sm font-medium text-gray-700 dark:text-gray-300">PM #</label>
                        <input type="text" id="pmId" name="pmId" value={values.pmId} onChange={validate} required placeholder="e.g., PM-1004" className={`${inputClasses} ${errors.pmId ? errorHighlightClasses : ''}`} disabled={isEditMode} />
                        {errors.pmId && <p className="text-xs text-red-500 mt-1">{errors.pmId}</p>}
                    </div>
                    <div>
                        <label htmlFor="chargeOut" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Charged To (Client)</label>
                        <input type="text" id="chargeOut" name="chargeOut" value={values.chargeOut} onChange={validate} required className={`${inputClasses} ${errors.chargeOut ? errorHighlightClasses : ''}`} />
                        {errors.chargeOut && <p className="text-xs text-red-500 mt-1">{errors.chargeOut}</p>}
                    </div>
                    <div className="md:col-span-2">
                        <label htmlFor="event" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Event / Project</label>
                        <input type="text" id="event" name="event" value={values.event} onChange={validate} required className={`${inputClasses} ${errors.event ? errorHighlightClasses : ''}`} />
                        {errors.event && <p className="text-xs text-red-500 mt-1">{errors.event}</p>}
                    </div>
                    <div>
                        <label htmlFor="street" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Street</label>
                        <input type="text" id="street" name="street" placeholder="e.g. 104 St NW" value={values.street} onChange={validate} className={`${inputClasses} ${errors.street ? errorHighlightClasses : ''}`} />
                         {errors.street && <p className="text-xs text-red-500 mt-1">{errors.street}</p>}
                     </div>
                     <div>
                        <label htmlFor="avenue" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Avenue</label>
                        <input type="text" id="avenue" name="avenue" placeholder="e.g. Jasper Ave" value={values.avenue} onChange={validate} className={`${inputClasses} ${errors.avenue ? errorHighlightClasses : ''}`} />
                         {errors.avenue && <p className="text-xs text-red-500 mt-1">{errors.avenue}</p>}
                     </div>
                     <LocationFetcher onLocationFetch={handleLocationFetch} />
                    <div className="md:col-span-2 bg-gray-50 dark:bg-gray-700/50 p-5 rounded-lg">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className={highlightBoxClasses}>
                                <label htmlFor="dropOffDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Drop Off Date</label>
                                <input type="date" id="dropOffDate" name="dropOffDate" value={values.dropOffDate} onChange={validate} max={values.deploymentDate ? getOffsetDate(values.deploymentDate, -1) : ''} className={`${dateInputClasses} ${dateErrors.dropOff ? errorHighlightClasses : ''}`} />
                                {dateErrors.dropOff && <p className="text-xs text-red-500 mt-1">{dateErrors.dropOff}</p>}
                            </div>
                            <div className={greenHighlightBoxClasses}>
                                <label htmlFor="deploymentDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Deployment Date</label>
                                <input type="date" id="deploymentDate" name="deploymentDate" value={values.deploymentDate} onChange={validate} required className={`${dateInputClasses} ${(dateErrors.dropOff || dateErrors.completion) ? errorHighlightClasses : ''}`} />
                            </div>
                            <div className={greenHighlightBoxClasses}>
                                <label htmlFor="completionDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Completion Date</label>
                                <input type="date" id="completionDate" name="completionDate" value={values.completionDate} onChange={validate} min={values.deploymentDate} required className={`${dateInputClasses} ${(dateErrors.pickUp || dateErrors.completion) ? errorHighlightClasses : ''}`} />
                                {dateErrors.completion && <p className="text-xs text-red-500 mt-1">{dateErrors.completion}</p>}
                            </div>
                             <div className={highlightBoxClasses}>
                                <label htmlFor="pickUpDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Pick Up Date</label>
                                <input type="date" id="pickUpDate" name="pickUpDate" value={values.pickUpDate} onChange={validate} min={values.completionDate ? getOffsetDate(values.completionDate, 1) : ''} className={`${dateInputClasses} ${dateErrors.pickUp ? errorHighlightClasses : ''}`} />
                                {dateErrors.pickUp && <p className="text-xs text-red-500 mt-1">{dateErrors.pickUp}</p>}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                <h3 className="text-xl font-semibold border-b border-gray-200 dark:border-gray-700 pb-2 text-gray-800 dark:text-gray-200">Add Deployed Items</h3>
                <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-end p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                     <div className="md:col-span-3">
                        <label htmlFor="itemName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Item</label>
                        <select id="itemName" value={currentItemName} onChange={e => setCurrentItemName(e.target.value)} className={inputClasses}>
                            <option value="">Select item...</option>
                            {allItems.map(item => <option key={item} value={item}>{item}</option>)}
                        </select>
                     </div>
                     <div className="md:col-span-2">
                        <label htmlFor="itemYard" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Yard</label>
                        <select id="itemYard" value={currentItemYard} onChange={e => setCurrentItemYard(e.target.value)} className={inputClasses}>
                            {allYards.map(yard => <option key={yard} value={yard}>{yard}</option>)}
                        </select>
                     </div>
                     <div className="md:col-span-1">
                        <label htmlFor="itemQuantity" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Qty</label>
                        <input 
                            type="number" 
                            id="itemQuantity" 
                            value={currentItemQuantity} 
                            onChange={e => setCurrentItemQuantity(e.target.value)} 
                            min="1"
                            max={availableStock}
                            placeholder={availableStock !== undefined ? `Avail: ${availableStock}` : '...'}
                            className={inputClasses}
                        />
                     </div>
                     <div className="md:col-span-6">
                        <button type="button" onClick={handleAddItem} disabled={!currentItemName || !currentItemQuantity || items.length >= MAX_DEPLOYMENT_ITEMS} className="w-full h-10 inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-brand-blue hover:bg-brand-blue-dark focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-700 focus:ring-brand-blue-light disabled:bg-gray-400 dark:disabled:bg-gray-500">
                             <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
                             {items.length >= MAX_DEPLOYMENT_ITEMS ? `Item Limit Reached (${MAX_DEPLOYMENT_ITEMS})` : 'Add Item to Deployment'}
                        </button>
                     </div>
                </div>
            </div>

            {items.length > 0 && (
                <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">Items for this Deployment ({items.length}/{MAX_DEPLOYMENT_ITEMS})</h3>
                     <div className="overflow-x-auto border border-gray-200 dark:border-gray-700 rounded-lg">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                           <thead className="bg-gray-50 dark:bg-gray-700">
                             <tr>
                               <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Item</th>
                               <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Yard</th>
                               <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Qty</th>
                               <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Action</th>
                             </tr>
                           </thead>
                           <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                             {items.map((item, index) => (
                                 <tr key={index}>
                                     <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-800 dark:text-gray-200">{item.item}</td>
                                     <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{item.yard}</td>
                                     <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 text-center">{item.quantity}</td>
                                     <td className="px-4 py-2 whitespace-nowrap text-sm text-right">
                                         <button type="button" onClick={() => handleRemoveItem(index)} className="text-red-600 hover:text-red-800 dark:text-red-500 dark:hover:text-red-400">
                                             <TrashIcon className="h-5 w-5"/>
                                         </button>
                                     </td>
                                 </tr>
                             ))}
                           </tbody>
                        </table>
                     </div>
                </div>
            )}

            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700">
                <button type="button" onClick={onCancel} className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-blue dark:bg-gray-600 dark:border-gray-500 dark:text-gray-200 dark:hover:bg-gray-500 dark:focus:ring-offset-gray-800 dark:focus:ring-brand-blue-light">Cancel</button>
                <button type="submit" disabled={!isFormValid} className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-brand-green hover:bg-brand-green-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-green dark:focus:ring-offset-gray-800 disabled:bg-gray-400 dark:disabled:bg-gray-500">
                    {isEditMode ? 'Update Deployment' : 'Save Deployment'}
                </button>
            </div>
        </form>
    );
};

export default DeploymentForm;
