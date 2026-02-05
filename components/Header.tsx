
import React, { useState, useEffect, useRef } from 'react';
// FIX: Update icon import path to the consolidated IconComponents.tsx file.
import { EdmontonLogo, InventoryIcon, TotalInventoryIcon, HomeIcon, MenuIcon, CloseIcon, SunIcon, MoonIcon, SparklesIcon, InfoIcon } from './IconComponents';
import { View } from '../App';
import { useTheme } from '../contexts/ThemeContext';
import OfflineIndicator from './OfflineIndicator';
import Button from './ui/Button';

interface HeaderProps {
  onNavigate: (view: View) => void;
  isOnline: boolean;
  pendingSyncCount: number;
}

const Header: React.FC<HeaderProps> = ({ onNavigate, isOnline, pendingSyncCount }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);
  
  const handleNavClick = (view: View) => {
    onNavigate(view);
    setIsMenuOpen(false);
  };

  const handleThemeClick = () => {
    toggleTheme();
    setIsMenuOpen(false);
  };

  const menuItemClasses = "flex items-center w-full text-left px-4 py-2 text-sm rounded-md transition-colors duration-150 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700";

  return (
    <header className="bg-brand-blue-dark shadow-md print:hidden sticky top-0 z-20 text-white">
      <OfflineIndicator isOnline={isOnline} pendingSyncCount={pendingSyncCount} />
      <div className="container mx-auto px-4 md:px-8 py-4 flex items-center justify-between">
        <button onClick={() => handleNavClick('dashboard')} className="flex items-center space-x-4">
          <EdmontonLogo className="h-8 sm:h-10" />
          <h1 className="text-lg sm:text-xl md:text-2xl font-bold tracking-tight hidden sm:block">
            Traffic Control Signage Inventory
          </h1>
        </button>
        <div className="flex items-center space-x-2 md:space-x-4">
            <Button onClick={() => onNavigate('new_deployment')} >
              + Add New Drop-Off
            </Button>
            <div className="relative">
              <button
                onClick={() => setIsMenuOpen(prev => !prev)}
                className="p-2 rounded-md text-gray-200 hover:text-white hover:bg-brand-blue focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                aria-label="Open navigation menu"
                aria-expanded={isMenuOpen}
                aria-controls="navigation-menu"
              >
                {isMenuOpen ? <CloseIcon className="h-6 w-6" /> : <MenuIcon className="h-6 w-6" />}
              </button>

              {isMenuOpen && (
                <div
                  ref={menuRef}
                  id="navigation-menu"
                  className="absolute right-0 mt-2 w-56 origin-top-right rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 dark:ring-gray-700 focus:outline-none z-50 animate-fade-in-fast"
                  role="menu"
                  aria-orientation="vertical"
                >
                  <div className="p-2" role="none">
                    <button onClick={() => handleNavClick('dashboard')} className={menuItemClasses} role="menuitem">
                      <HomeIcon className="mr-3 h-5 w-5" />
                      Dashboard
                    </button>
                    <button onClick={() => handleNavClick('total_inventory')} className={menuItemClasses} role="menuitem">
                      <TotalInventoryIcon className="mr-3 h-5 w-5" />
                      Total Inventory
                    </button>
                    <button onClick={() => handleNavClick('yard_inventory')} className={menuItemClasses} role="menuitem">
                      <InventoryIcon className="mr-3 h-5 w-5" />
                      Yard Inventory
                    </button>
                     <button onClick={() => handleNavClick('gemini_chat')} className={menuItemClasses} role="menuitem">
                      <SparklesIcon className="mr-3 h-5 w-5" />
                      Ask Gemini
                    </button>
                    <button onClick={() => handleNavClick('about')} className={menuItemClasses} role="menuitem">
                      <InfoIcon className="mr-3 h-5 w-5" />
                      About This App
                    </button>
                    <div className="my-1 px-2" role="separator">
                        <hr className="border-gray-200 dark:border-gray-600" />
                    </div>
                    <button onClick={handleThemeClick} className={menuItemClasses} role="menuitem">
                       {theme === 'light' ? (
                        <>
                          <MoonIcon className="mr-3 h-5 w-5" />
                          <span>Switch to Dark</span>
                        </>
                      ) : (
                        <>
                          <SunIcon className="mr-3 h-5 w-5" />
                          <span>Switch to Light</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
