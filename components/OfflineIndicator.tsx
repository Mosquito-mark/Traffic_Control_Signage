
import React from 'react';
import { LoadingIcon } from './IconComponents';

interface OfflineIndicatorProps {
  isOnline: boolean;
  pendingSyncCount: number;
}

const OfflineIndicator: React.FC<OfflineIndicatorProps> = ({ isOnline, pendingSyncCount }) => {
  if (isOnline && pendingSyncCount === 0) {
    return null; // Don't show anything if online and synced
  }

  let text = "You are currently offline. Changes are saved locally.";
  let bgColor = "bg-yellow-500 dark:bg-yellow-600";
  let showSpinner = false;

  if (isOnline && pendingSyncCount > 0) {
    text = `Online. Syncing ${pendingSyncCount} item(s)...`;
    bgColor = "bg-blue-500 dark:bg-blue-600";
    showSpinner = true;
  }
  
  return (
    <div className={`w-full p-2 text-center text-white text-sm ${bgColor} transition-colors duration-300`}>
      <div className="container mx-auto flex items-center justify-center">
        {showSpinner && <LoadingIcon className="h-4 w-4 mr-2 animate-spin" />}
        <span>{text}</span>
      </div>
    </div>
  );
};

export default OfflineIndicator;
