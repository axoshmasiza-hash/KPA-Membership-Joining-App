
import React from 'react';
import { LogoIcon } from './icons/LogoIcon';
import { UserIcon } from './icons/UserIcon';
import { ChartIcon } from './icons/ChartIcon';
import { Role } from '../types';

interface HeaderProps {
  view: 'applicant' | 'admin';
  setView: (view: 'applicant' | 'admin') => void;
  logoSrc: string;
  userRole: Role;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({ view, setView, logoSrc, userRole, onLogout }) => {
  return (
    <header className="bg-white dark:bg-gray-800 shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <LogoIcon src={logoSrc} className="h-12 w-auto" />
            <div className="ml-3">
              <span className="text-2xl font-bold text-gray-800 dark:text-gray-200 block">
                Komani Progress Action
              </span>
              <span className="text-sm font-medium text-red-600 dark:text-red-400">
                Eastern Cape Province
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setView('applicant')}
              className={`px-3 py-2 rounded-md text-sm font-medium flex items-center transition-colors duration-200 ${
                view === 'applicant'
                  ? 'bg-red-600 text-white'
                  // eslint-disable-next-line @typescript-eslint/indent
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              <UserIcon className="h-5 w-5 mr-2" />
              Applicant
            </button>
            <button
              onClick={() => setView('admin')}
              className={`px-3 py-2 rounded-md text-sm font-medium flex items-center transition-colors duration-200 ${
                view === 'admin'
                  ? 'bg-red-600 text-white'
                  // eslint-disable-next-line @typescript-eslint/indent
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              <ChartIcon className="h-5 w-5 mr-2" />
              Admin
            </button>
            {userRole === Role.ADMIN && view === 'admin' && (
               <button
                onClick={onLogout}
                className="px-3 py-2 rounded-md text-sm font-medium flex items-center transition-colors duration-200 bg-gray-600 text-white hover:bg-gray-700"
              >
                Logout
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
