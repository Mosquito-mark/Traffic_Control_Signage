
import React from 'react';

interface StockLevelBarProps {
    remaining: number;
    initial: number;
}

const StockLevelBar: React.FC<StockLevelBarProps> = ({ remaining, initial }) => {
    const percentage = initial > 0 ? (remaining / initial) * 100 : 0;
    
    let barColor = 'bg-brand-green';
    if (percentage <= 20) {
        barColor = 'bg-brand-red';
    } else if (percentage <= 50) {
        barColor = 'bg-brand-yellow';
    }

    return (
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
            <div className={`${barColor} h-2.5 rounded-full`} style={{ width: `${percentage}%` }}></div>
        </div>
    );
};

export default StockLevelBar;
