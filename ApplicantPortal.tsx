import React, { useState, FormEvent } from 'react';
import type { Applicant } from '../types';
import { ApplicantForm } from './ApplicantForm';
import { LogoIcon } from './icons/LogoIcon';

interface ApplicantPortalProps {
  logoSrc: string;
  addOrUpdateApplicant: (applicant: Applicant) => void;
  deleteApplicant: (id: string) => void;
  draft: Applicant | null;
  findApplicantByIdNumber: (idNumber: string) => Applicant | undefined;
}

export const ApplicantPortal: React.FC<ApplicantPortalProps> = ({
  logoSrc,
  addOrUpdateApplicant,
  deleteApplicant,
  draft,
  findApplicantByIdNumber,
}) => {
  const [mode, setMode] = useState<'welcome' | 'form'>('welcome');
  const [activeApplicant, setActiveApplicant] = useState<Applicant | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [lookupId, setLookupId] = useState('');
  const [lookupError, setLookupError] = useState('');

  const handleStartNew = () => {
    setActiveApplicant(draft);
    setIsUpdating(false);
    setMode('form');
  };
  
  const handleLookupSubmit = (e: FormEvent) => {
    e.preventDefault();
    setLookupError('');
    const foundApplicant = findApplicantByIdNumber(lookupId);
    if (foundApplicant) {
      setActiveApplicant(foundApplicant);
      setIsUpdating(true);
      setMode('form');
    } else {
      setLookupError('No application found with that ID number. Please check the number or start a new application.');
    }
  };

  const handleFormComplete = () => {
    // Reset state and go back to welcome screen
    setActiveApplicant(null);
    setIsUpdating(false);
    setLookupId('');
    setLookupError('');
    setMode('welcome');
  };

  if (mode === 'form') {
    return (
      <ApplicantForm
        key={activeApplicant?.id || 'new-applicant-form'}
        initialData={activeApplicant}
        addOrUpdateApplicant={addOrUpdateApplicant}
        deleteApplicant={deleteApplicant}
        isUpdating={isUpdating}
        onComplete={handleFormComplete}
        onCancelUpdate={handleFormComplete} // Cancel also goes back to welcome
      />
    );
  }

  // Welcome / Lookup view
  return (
    <div className="container mx-auto max-w-2xl p-4 sm:p-6 lg:p-8">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 sm:p-8 space-y-8 text-center">
        <LogoIcon src={logoSrc} className="mx-auto h-24 w-auto" />
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">KPA Membership Portal</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-300">Welcome to the Komani Progress Action membership portal. Apply for membership or update your existing information.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-12 pt-6 border-t dark:border-gray-700">
          
          {/* New Application */}
          <div className="space-y-4 flex flex-col justify-between">
            <div>
                <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200">New Applicant?</h2>
                <p className="text-gray-600 dark:text-gray-400 mt-2">
                Click below to start a new application. {draft ? "You have a saved draft you can continue." : ""}
                </p>
            </div>
            <button
              onClick={handleStartNew}
              className="w-full sm:w-auto inline-flex justify-center py-3 px-6 border border-transparent shadow-sm text-base font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              {draft ? 'Continue Draft' : 'Start New Application'}
            </button>
          </div>
          
          {/* Update Application */}
          <div className="space-y-4 flex flex-col justify-between">
             <div>
                <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200">Existing Applicant?</h2>
                <p className="text-gray-600 dark:text-gray-400 mt-2">
                Enter your SA ID Number to find and update your application details.
                </p>
            </div>
            <form onSubmit={handleLookupSubmit} className="flex flex-col items-center space-y-4">
               <input
                type="text"
                value={lookupId}
                onChange={(e) => { setLookupId(e.target.value); setLookupError(''); }}
                placeholder="Enter your 13-digit ID Number"
                maxLength={13}
                required
                className="block w-full max-w-sm px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
               />
               {lookupError && <p className="text-sm text-red-600">{lookupError}</p>}
               <button
                  type="submit"
                  className="w-full sm:w-auto inline-flex justify-center py-2 px-5 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
               >
                 Find My Application
               </button>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
};