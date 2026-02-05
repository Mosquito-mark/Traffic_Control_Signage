
import React, { useState, useEffect, useMemo } from 'react';
import { Deployment, InventoryItem } from '../types';
import { calculateDailyInventoryStatus, DailyInventoryStatus } from '../utils/inventoryCalculators';
import { ChevronLeftIcon, ChevronRightIcon } from './IconComponents';

interface InventoryCalendarProps {
    deployments: Deployment[];
    inventory: InventoryItem[];
}

const MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const InventoryCalendar: React.FC<InventoryCalendarProps> = ({ deployments, inventory }) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [dailyStatuses, setDailyStatuses] = useState<Map<string, DailyInventoryStatus>>(new Map());

    const { year, month } = useMemo(() => ({
        year: currentDate.getFullYear(),
        month: currentDate.getMonth(),
    }), [currentDate]);

    useEffect(() => {
        const statuses = new Map<string, DailyInventoryStatus>();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day);
            const status = calculateDailyInventoryStatus(date, inventory, deployments);
            if (status.status !== 'ok') {
                const dateKey = date.toISOString().split('T')[0];
                statuses.set(dateKey, status);
            }
        }
        setDailyStatuses(statuses);
    }, [year, month, inventory, deployments]);
    
    const changeMonth = (delta: number) => {
        setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + delta, 1));
    };

    const calendarGrid = useMemo(() => {
        const firstDayOfMonth = new Date(year, month, 1).getDay();
        const totalDaysInMonth = new Date(year, month + 1, 0).getDate();
        
        const grid = [];
        // Add blank days for the start of the month
        for (let i = 0; i < firstDayOfMonth; i++) {
            grid.push(null);
        }
        // Add days of the month
        for (let day = 1; day <= totalDaysInMonth; day++) {
            grid.push(new Date(year, month, day));
        }
        return grid;
    }, [year, month]);
    
    const getStatusColorClasses = (status: 'red' | 'orange' | 'yellow' | 'ok' | undefined): string => {
        if(!status) return '';
        switch(status) {
            case 'red': return 'bg-red-200 dark:bg-red-800/50 text-red-900 dark:text-red-200 border-red-300 dark:border-red-700';
            case 'orange': return 'bg-orange-200 dark:bg-orange-800/50 text-orange-900 dark:text-orange-200 border-orange-300 dark:border-orange-700';
            case 'yellow': return 'bg-yellow-200 dark:bg-yellow-800/50 text-yellow-900 dark:text-yellow-200 border-yellow-300 dark:border-yellow-700';
            default: return 'bg-white dark:bg-gray-700/50 border-gray-200 dark:border-gray-600';
        }
    }

    return (
        <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
            <div className="flex items-center justify-between mb-4">
                <button onClick={() => changeMonth(-1)} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700" aria-label="Previous month">
                    <ChevronLeftIcon className="h-5 w-5"/>
                </button>
                <h3 className="text-lg font-semibold text-center">{MONTH_NAMES[month]} {year}</h3>
                <button onClick={() => changeMonth(1)} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700" aria-label="Next month">
                    <ChevronRightIcon className="h-5 w-5"/>
                </button>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center text-sm">
                {DAY_NAMES.map(day => <div key={day} className="font-medium text-gray-500 dark:text-gray-400 py-2">{day}</div>)}
                
                {calendarGrid.map((date, index) => {
                    if (!date) return <div key={`blank-${index}`} className="border rounded-md border-transparent"></div>;
                    
                    const dateKey = date.toISOString().split('T')[0];
                    const dayStatus = dailyStatuses.get(dateKey);
                    
                    const colorClasses = dayStatus ? getStatusColorClasses(dayStatus.status) : 'bg-white dark:bg-gray-700/50 border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600';

                    return (
                        <div key={dateKey} className={`group relative h-16 rounded-md border p-2 transition-colors duration-150 ${colorClasses}`}>
                            <time dateTime={dateKey}>{date.getDate()}</time>
                            {dayStatus && (
                                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-72 z-10 p-3 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-600 hidden group-hover:block">
                                    <h4 className="font-bold text-base text-left mb-2 text-gray-900 dark:text-gray-100">Low Stock on {MONTH_NAMES[month]} {date.getDate()}</h4>
                                    <ul className="space-y-1 text-left">
                                        {dayStatus.criticalItems.map(item => {
                                            let itemStatus: 'red' | 'orange' | 'yellow' = 'yellow';
                                            if (item.remaining <= 0) itemStatus = 'red';
                                            else if (item.remaining < 3) itemStatus = 'orange';
                                            else if (item.initial > 0 && (item.remaining / item.initial < 0.1)) itemStatus = 'yellow';

                                            const itemStatusText = { red: 'Out', orange: 'Critical', yellow: 'Caution' }[itemStatus];
                                            const itemColorClasses = getStatusColorClasses(itemStatus);

                                            return (
                                                <li key={item.item} className="flex justify-between items-center text-xs">
                                                    <span className="font-medium text-gray-700 dark:text-gray-300 truncate pr-2">{item.item}</span>
                                                    <span className={`flex-shrink-0 font-bold px-2 py-0.5 rounded-full text-xs ${itemColorClasses}`}>
                                                        {itemStatusText}: {item.remaining}/{item.initial}
                                                    </span>
                                                </li>
                                            );
                                        })}
                                    </ul>
                                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-8 border-l-transparent border-r-8 border-r-transparent border-b-8 border-b-white dark:border-b-gray-800"></div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
             <div className="mt-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs">
                <div className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-full bg-yellow-200 dark:bg-yellow-800/50 border border-yellow-300 dark:border-yellow-700"></span>Caution (&lt;10%)</div>
                <div className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-full bg-orange-200 dark:bg-orange-800/50 border border-orange-300 dark:border-orange-700"></span>Critical (&lt;3 units)</div>
                <div className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-full bg-red-200 dark:bg-red-800/50 border border-red-300 dark:border-red-700"></span>Out of Stock</div>
            </div>
        </div>
    );
};

export default InventoryCalendar;
