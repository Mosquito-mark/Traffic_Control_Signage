
import { useState, useEffect, useMemo, useCallback } from 'react';
import { Deployment, InventoryItem, TotalInventoryItem } from '../types';
import * as dbService from '../services/dbService';
import { calculateYardInventory, calculateTotalInventory } from '../utils/inventoryCalculators';
import { useOnlineStatus } from './useOnlineStatus';

export const useInventoryData = () => {
    const [inventory, setInventory] = useState<InventoryItem[]>([]);
    const [deployments, setDeployments] = useState<Deployment[]>([]);
    const [isDbInitialized, setIsDbInitialized] = useState(false);
    const isOnline = useOnlineStatus();

    const loadData = useCallback(async () => {
        // FIX: Specify generic types for getAllFromStore to ensure correct typing.
        const invData = await dbService.getAllFromStore<InventoryItem>('inventory');
        const depData = await dbService.getAllFromStore<Deployment>('deployments');
        setInventory(invData);
        setDeployments(depData);
    }, []);

    useEffect(() => {
        const init = async () => {
            await dbService.initDB();
            await loadData();
            setIsDbInitialized(true);
        };
        init();
    }, [loadData]);
    
    // Effect to handle data synchronization when coming online
    useEffect(() => {
        const syncData = async () => {
            console.log('Online, attempting to sync...');
            const unsyncedDeployments = deployments.filter(d => !d.synced);
            if (unsyncedDeployments.length === 0) {
                console.log('No data to sync.');
                return;
            }
            
            console.log(`Syncing ${unsyncedDeployments.length} deployments...`);
            // Simulate network request. Using Promise.all would parallelize but could overwhelm a server.
            // A sequential loop is safer for writes. A real-world app might use a queue with batching.
            await new Promise(resolve => setTimeout(resolve, 1500)); 

            for (const deployment of unsyncedDeployments) {
                await dbService.addOrUpdateItem('deployments', { ...deployment, synced: true });
            }
            
            console.log('Sync complete.');
            await loadData(); // Reload data to update UI
        };

        if (isOnline && isDbInitialized) {
            syncData();
        }
    }, [isOnline, isDbInitialized, deployments, loadData]);

    const addDeployment = async (deployment: Deployment) => {
        const newDeployment = { ...deployment, synced: isOnline };
        await dbService.addOrUpdateItem('deployments', newDeployment);
        setDeployments(prev => [...prev, newDeployment]);
    }

    const updateDeployment = async (updatedDeployment: Deployment) => {
        const newDeployment = { ...updatedDeployment, synced: isOnline };
        await dbService.addOrUpdateItem('deployments', newDeployment);
        setDeployments(prev => prev.map(d => d.id === newDeployment.id ? newDeployment : d));
    }

    const yardInventory = useMemo(() => 
        calculateYardInventory(inventory, deployments), 
    [inventory, deployments]);

    const totalInventory = useMemo<TotalInventoryItem[]>(() => 
        calculateTotalInventory(inventory, deployments), 
    [inventory, deployments]);
    
    const pendingSyncCount = useMemo(() => deployments.filter(d => !d.synced).length, [deployments]);

    // OPTIMIZATION: Create a Map for O(1) lookups instead of O(n) Array.find()
    const deploymentsMap = useMemo(() => 
        new Map(deployments.map(d => [d.id, d])),
    [deployments]);

    return { inventory, deployments, deploymentsMap, addDeployment, updateDeployment, yardInventory, totalInventory, isOnline, pendingSyncCount };
};
