
import { TotalInventoryItem } from '../types';
import { YardInventoryData } from '../utils/inventoryCalculators';

const escapeCsvCell = (cell: string | number) => {
    const cellStr = String(cell);
    if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')) {
        return `"${cellStr.replace(/"/g, '""')}"`;
    }
    return cellStr;
};

const triggerDownload = (csvContent: string, filename: string) => {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.href) {
        URL.revokeObjectURL(link.href);
    }
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

export const exportYardInventoryToCSV = (data: YardInventoryData) => {
    const headers = ['Yard', 'Item', 'Initial Stock', 'Deployed', 'Remaining'];
    const rows: (string | number)[][] = [];

    for (const yard in data) {
        if (Object.prototype.hasOwnProperty.call(data, yard)) {
            const items = data[yard];
            items.forEach(itemData => {
                rows.push([
                    yard,
                    itemData.item,
                    itemData.initial,
                    itemData.deployed,
                    itemData.remaining
                ]);
            });
        }
    }

    let csvContent = headers.join(',') + '\n';
    csvContent += rows.map(row => row.map(escapeCsvCell).join(',')).join('\n');
    const today = new Date().toISOString().split('T')[0];
    triggerDownload(csvContent, `yard_inventory_${today}.csv`);
};

export const exportTotalInventoryToCSV = (data: TotalInventoryItem[]) => {
    const headers = ['Item', 'Total Initial Stock', 'Total Deployed', 'Total Remaining'];
    const rows = data.map(item => [
        item.item,
        item.initial,
        item.deployed,
        item.remaining
    ]);

    let csvContent = headers.join(',') + '\n';
    csvContent += rows.map(row => row.map(escapeCsvCell).join(',')).join('\n');
    const today = new Date().toISOString().split('T')[0];
    triggerDownload(csvContent, `total_inventory_${today}.csv`);
};
