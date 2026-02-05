
import React from 'react';

interface StatCardProps {
    icon: React.ReactNode;
    title: string;
    value: string | number;
    buttonText?: string;
    onButtonClick?: () => void;
}

const StatCard: React.FC<StatCardProps> = ({ icon, title, value, buttonText, onButtonClick }) => (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow flex flex-col justify-between h-full">
        <div className="flex items-center">
            <div className="bg-brand-blue text-white rounded-full p-3 flex-shrink-0">
                {icon}
            </div>
            <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{value}</p>
            </div>
        </div>
        {buttonText && onButtonClick && (
            <div className="mt-4 text-right">
                <button
                    onClick={onButtonClick}
                    className="text-sm font-semibold text-brand-blue-light hover:text-brand-blue dark:hover:text-blue-400 transition-colors duration-200"
                >
                    {buttonText} &rarr;
                </button>
            </div>
        )}
    </div>
);

export default StatCard;
