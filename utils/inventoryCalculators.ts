
import { Deployment, InventoryItem, TotalInventoryItem } from '../types';

export interface YardInventory {
    item: string;
    initial: number;
    deployed: number;
    remaining: number;
}
export type YardInventoryData = Record<string, YardInventory[]>;

export interface CriticalItem {
    item: string;
    remaining: number;
    initial: number;
}

export interface DailyInventoryStatus {
    status: 'red' | 'orange' | 'yellow' | 'ok';
    criticalItems: CriticalItem[];
}

export const calculateDailyInventoryStatus = (date: Date, inventory: InventoryItem[], deployments: Deployment[]): DailyInventoryStatus => {
    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);

    const activeDeployments = deployments.filter(d => {
        const startDate = new Date(d.deploymentDate);
        startDate.setHours(0, 0, 0, 0);
        const endDate = new Date(d.completionDate);
        endDate.setHours(0, 0, 0, 0);
        return targetDate >= startDate && targetDate <= endDate;
    });

    const dailyDeployedCounts: Record<string, number> = {};
    activeDeployments.forEach(deployment => {
        deployment.items.forEach(deployedItem => {
            const { item, quantity } = deployedItem;
            dailyDeployedCounts[item] = (dailyDeployedCounts[item] || 0) + quantity;
        });
    });

    const criticalItems: CriticalItem[] = [];
    inventory.forEach(inventoryItem => {
        const totalInitial = Object.values(inventoryItem.initialStock).reduce((sum, count) => sum + count, 0);
        if (totalInitial === 0) return;

        const totalDeployed = dailyDeployedCounts[inventoryItem.item] || 0;
        const remaining = totalInitial - totalDeployed;
        const remainingPercentage = totalInitial > 0 ? remaining / totalInitial : 0;

        // An item is "critical" if it meets any of the thresholds
        if (remaining <= 0 || remaining < 3 || remainingPercentage < 0.1) {
            criticalItems.push({
                item: inventoryItem.item,
                remaining,
                initial: totalInitial,
            });
        }
    });

    if (criticalItems.length === 0) {
        return { status: 'ok', criticalItems: [] };
    }

    // Sort by remaining amount to easily find the most critical items
    criticalItems.sort((a, b) => a.remaining - b.remaining);
    
    let overallStatus: 'red' | 'orange' | 'yellow' | 'ok' = 'ok';

    // The final status is determined by the most critical items in the list
    if (criticalItems.some(item => item.remaining <= 0)) {
        overallStatus = 'red';
    } else if (criticalItems.some(item => item.remaining < 3)) {
        overallStatus = 'orange';
    } else { // If we have items, they must be in the 'yellow' category
        overallStatus = 'yellow';
    }

    return { status: overallStatus, criticalItems };
};


export const calculateYardInventory = (inventory: InventoryItem[], deployments: Deployment[]): YardInventoryData => {
    const deployedCounts: Record<string, Record<string, number>> = {};
    deployments.forEach(deployment => {
        deployment.items.forEach(deployedItem => {
            const { yard, item, quantity } = deployedItem;
            if (!deployedCounts[yard]) deployedCounts[yard] = {};
            if (!deployedCounts[yard][item]) deployedCounts[yard][item] = 0;
            deployedCounts[yard][item] += quantity;
        });
    });
    
    const allYards = Array.from(new Set(inventory.flatMap(item => Object.keys(item.initialStock))));
    const remainingInventory: YardInventoryData = {};

    allYards.forEach(yard => {
        remainingInventory[yard] = [];
    });

    inventory.forEach(inventoryItem => {
        const initialStockInYards = inventoryItem.initialStock;
        Object.entries(initialStockInYards).forEach(([yard, initial]) => {
            if (initial > 0) {
                const deployed = deployedCounts[yard]?.[inventoryItem.item] || 0;
                const remaining = initial - deployed;
                remainingInventory[yard].push({ 
                    item: inventoryItem.item, 
                    initial, 
                    deployed, 
                    remaining 
                });
            }
        });
    });
    
    return remainingInventory;
};

export const calculateTotalInventory = (inventory: InventoryItem[], deployments: Deployment[]): TotalInventoryItem[] => {
    const totalDeployedCounts: Record<string, number> = {};
    deployments.forEach(deployment => {
        deployment.items.forEach(deployedItem => {
            const { item, quantity } = deployedItem;
            if (!totalDeployedCounts[item]) totalDeployedCounts[item] = 0;
            totalDeployedCounts[item] += quantity;
        });
    });

    return inventory.map(inventoryItem => {
        const totalInitial = Object.values(inventoryItem.initialStock).reduce((sum, count) => sum + count, 0);
        const totalDeployed = totalDeployedCounts[inventoryItem.item] || 0;
        const totalRemaining = totalInitial - totalDeployed;

        return {
            item: inventoryItem.item,
            initial: totalInitial,
            deployed: totalDeployed,
            remaining: totalRemaining,
        };
    }).filter(item => item.initial > 0);
};
