import React, { useState, useEffect, useCallback } from 'react';
import type { Applicant, User } from './types';
import { ApplicationStatus, Role, MembershipRole } from './types';
import { Header } from './components/Header';
import { AdminDashboard } from './components/AdminDashboard';
import { ApplicantList } from './components/ApplicantList';
import { Chatbot } from './components/Chatbot';
import { UsersIcon } from './components/icons/UsersIcon';
import { ChartIcon } from './components/icons/ChartIcon';
import { Login } from './components/Login';
import { DEFAULT_KPA_LOGO_BASE64, DEFAULT_ADMIN_USERNAME, DEFAULT_ADMIN_PASSWORD } from './constants';
import { AdminSettings } from './components/AdminSettings';
import { AdminRoles } from './components/AdminRoles';
import { CogIcon } from './components/icons/CogIcon';
import { RoleIcon } from './components/icons/RoleIcon';
import { ApplicantPortal } from './components/ApplicantPortal';


const LOCAL_STORAGE_KEY_APPLICANTS = 'kpa-applicants';
const LOCAL_STORAGE_KEY_LOGO = 'kpa-logo';
const LOCAL_STORAGE_KEY_ADMIN = 'kpa-admin-user';

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

const App: React.FC = () => {
  const [view, setView] = useState<'applicant' | 'admin'>('applicant');
  const [adminSubView, setAdminSubView] = useState<'dashboard' | 'list' | 'roles' | 'settings'>('dashboard');
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [adminUser, setAdminUser] = useState<User | null>(null);
  const [logoSrc, setLogoSrc] = useState<string>(DEFAULT_KPA_LOGO_BASE64);

  useEffect(() => {
    // Load data from local storage
    try {
      const storedApplicants = localStorage.getItem(LOCAL_STORAGE_KEY_APPLICANTS);
      if (storedApplicants) {
        const parsedApplicants: Applicant[] = JSON.parse(storedApplicants);
        setApplicants(parsedApplicants);
      }

      const storedLogo = localStorage.getItem(LOCAL_STORAGE_KEY_LOGO);
      if (storedLogo) setLogoSrc(storedLogo);

      const storedAdmin = localStorage.getItem(LOCAL_STORAGE_KEY_ADMIN);
      if (storedAdmin) {
        setAdminUser(JSON.parse(storedAdmin));
      } else {
        const defaultAdmin: User = { 
          id: 'admin-user', 
          role: Role.ADMIN, 
          username: DEFAULT_ADMIN_USERNAME, 
          password: DEFAULT_ADMIN_PASSWORD 
        };
        setAdminUser(defaultAdmin);
        localStorage.setItem(LOCAL_STORAGE_KEY_ADMIN, JSON.stringify(defaultAdmin));
      }
    } catch (error) {
      console.error("Failed to load data from localStorage", error);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY_APPLICANTS, JSON.stringify(applicants));
    } catch (error) {
      console.error("Failed to save applicants to localStorage", error);
    }
  }, [applicants]);

  useEffect(() => {
    try {
        if(adminUser) {
            localStorage.setItem(LOCAL_STORAGE_KEY_ADMIN, JSON.stringify(adminUser));
        }
    } catch (error) {
        console.error("Failed to save admin user to localStorage", error);
    }
  }, [adminUser]);

  const addOrUpdateApplicant = useCallback((applicant: Applicant) => {
    setApplicants(prev => {
      const existingIndex = prev.findIndex(a => a.id === applicant.id);
      if (existingIndex > -1) {
        const updated = [...prev];
        const oldApplicant = prev[existingIndex];
        
        // If status changes to Approved for the first time, set dates and role
        if (applicant.status === ApplicationStatus.Approved && oldApplicant.status !== ApplicationStatus.Approved) {
            const now = new Date();
            applicant.approvedDate = now.toISOString();
            const expiry = new Date(now);
            expiry.setFullYear(expiry.getFullYear() + 1);
            applicant.expiryDate = expiry.toISOString();
            applicant.membershipRole = MembershipRole.MEMBER;
        }

        updated[existingIndex] = applicant;
        return updated;
      }
      return [...prev, applicant];
    });
  }, []);

  const deleteApplicant = useCallback((id: string) => {
    setApplicants(prev => prev.filter(a => a.id !== id));
  }, []);
  
  const findApplicantByIdNumber = useCallback((idNumber: string): Applicant | undefined => {
    return applicants.find(app => app.idNumber === idNumber && app.status !== ApplicationStatus.Draft);
  }, [applicants]);

  const deleteApplicants = useCallback((ids: string[]) => {
    setApplicants(prev => prev.filter(a => !ids.includes(a.id)));
  }, []);

  const handleLogin = (username: string, password: string): boolean => {
      if (adminUser && username.toLowerCase() === adminUser.username.toLowerCase() && password === adminUser.password) {
          setCurrentUser(adminUser);
          return true;
      }
      return false;
  }

  const handleLogout = () => {
      setCurrentUser(null);
      setView('applicant');
  }

  const handleRequestPasswordReset = async (username: string): Promise<boolean> => {
    if (adminUser && username.toLowerCase() === adminUser.username.toLowerCase()) {
        const randomBytes = crypto.getRandomValues(new Uint8Array(4));
        const token = Array.from(randomBytes).map(byte => byte.toString(16).padStart(2, '0')).join('');
        const expires = Date.now() + 15 * 60 * 1000;
        setAdminUser(prev => prev ? {...prev, passwordResetToken: token, passwordResetExpires: expires} : null);
        console.log(`Password reset token for ${username}: ${token}`);
        alert(`A password reset token has been sent to the administrator's email.\n\nFor this demo, the token is: ${token}`);
        return true;
    }
    return false;
  };

  const handlePasswordReset = async (token: string, newPassword: string): Promise<boolean> => {
    if (
      adminUser && 
      adminUser.passwordResetToken === token && 
      adminUser.passwordResetExpires && 
      Date.now() < adminUser.passwordResetExpires
    ) {
        setAdminUser(prev => prev ? {
            ...prev, 
            password: newPassword, 
            passwordResetToken: undefined, 
            passwordResetExpires: undefined
        } : null);
        alert("Password has been reset successfully. You can now log in with your new password.");
        return true;
    }
    return false;
  };
  
  const handleLogoUpload = async (file: File) => {
      try {
          const base64 = await fileToBase64(file);
          setLogoSrc(base64);
          localStorage.setItem(LOCAL_STORAGE_KEY_LOGO, base64);
          alert('Logo updated successfully!');
      } catch (error) {
          console.error("Error uploading logo:", error);
          alert('Failed to upload logo.');
      }
  };


  const AdminView = () => (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <div className="flex justify-center mb-6">
        <div className="inline-flex rounded-md shadow-sm" role="group">
          <button
            type="button"
            onClick={() => setAdminSubView('dashboard')}
            className={`py-2 px-4 text-sm font-medium border transition-colors ${
              adminSubView === 'dashboard'
                ? 'bg-red-600 text-white border-red-600 z-10 rounded-l-lg'
                // eslint-disable-next-line @typescript-eslint/indent
                : 'text-gray-900 bg-white border-gray-200 hover:bg-gray-100 hover:text-red-700 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:text-white dark:hover:bg-gray-600 rounded-l-lg'
            }`}
          >
             <ChartIcon className="inline-block h-5 w-5 mr-2" />
            Dashboard
          </button>
          <button
            type="button"
            onClick={() => setAdminSubView('list')}
            className={`py-2 px-4 text-sm font-medium border-t border-b transition-colors ${
              adminSubView === 'list'
                ? 'bg-red-600 text-white border-red-600 z-10'
                // eslint-disable-next-line @typescript-eslint/indent
                : 'text-gray-900 bg-white border-gray-200 hover:bg-gray-100 hover:text-red-700 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:text-white dark:hover:bg-gray-600'
            }`}
          >
            <UsersIcon className="inline-block h-5 w-5 mr-2" />
            Applicant List
          </button>
          <button
            type="button"
            onClick={() => setAdminSubView('roles')}
            className={`py-2 px-4 text-sm font-medium border-t border-b transition-colors ${
              adminSubView === 'roles'
                ? 'bg-red-600 text-white border-red-600 z-10'
                // eslint-disable-next-line @typescript-eslint/indent
                : 'text-gray-900 bg-white border-gray-200 hover:bg-gray-100 hover:text-red-700 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:text-white dark:hover:bg-gray-600'
            }`}
          >
            <RoleIcon className="inline-block h-5 w-5 mr-2" />
            Roles
          </button>
           <button
            type="button"
            onClick={() => setAdminSubView('settings')}
            className={`py-2 px-4 text-sm font-medium border transition-colors ${
              adminSubView === 'settings'
                ? 'bg-red-600 text-white border-red-600 z-10 rounded-r-lg'
                // eslint-disable-next-line @typescript-eslint/indent
                : 'text-gray-900 bg-white border-gray-200 hover:bg-gray-100 hover:text-red-700 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:text-white dark:hover:bg-gray-600 rounded-r-lg'
            }`}
          >
            <CogIcon className="inline-block h-5 w-5 mr-2" />
            Settings
          </button>
        </div>
      </div>
      {adminSubView === 'dashboard' && <AdminDashboard applicants={applicants} />}
      {adminSubView === 'list' && <ApplicantList applicants={applicants} updateApplicant={addOrUpdateApplicant} deleteApplicants={deleteApplicants} />}
      {adminSubView === 'roles' && <AdminRoles applicants={applicants} updateApplicant={addOrUpdateApplicant} />}
      {adminSubView === 'settings' && <AdminSettings onLogoUpload={handleLogoUpload} currentLogo={logoSrc} />}
    </div>
  );

  const renderContent = () => {
    if (view === 'admin') {
      if (currentUser?.role === Role.ADMIN) {
        return <AdminView />;
      }
      return <Login 
        logoSrc={logoSrc}
        onLogin={handleLogin} 
        onRequestPasswordReset={handleRequestPasswordReset}
        onResetPassword={handlePasswordReset}
        />;
    }
    
    const draft = applicants.find(a => a.status === ApplicationStatus.Draft) || null;
    return (
      <ApplicantPortal
        logoSrc={logoSrc}
        addOrUpdateApplicant={addOrUpdateApplicant}
        deleteApplicant={deleteApplicant}
        draft={draft}
        findApplicantByIdNumber={findApplicantByIdNumber}
      />
    );
  };

  return (
    <div className="min-h-screen bg-green-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-sans">
      <Header 
        view={view} 
        setView={setView} 
        logoSrc={logoSrc} 
        userRole={currentUser?.role || Role.USER}
        onLogout={handleLogout}
        />
      <main>
        {renderContent()}
      </main>
      <Chatbot />
    </div>
  );
};

export default App;
