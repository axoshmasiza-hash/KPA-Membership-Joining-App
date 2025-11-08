import React, { useState, FormEvent } from 'react';
import { LogoIcon } from './icons/LogoIcon';

interface LoginProps {
    logoSrc: string;
    onLogin: (username: string, password: string) => boolean;
    onRequestPasswordReset: (username: string) => Promise<boolean>;
    onResetPassword: (token: string, newPassword: string) => Promise<boolean>;
}

export const Login: React.FC<LoginProps> = ({ logoSrc, onLogin, onRequestPasswordReset, onResetPassword }) => {
    const [mode, setMode] = useState<'login' | 'requestReset' | 'resetPassword'>('login');

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [token, setToken] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    const handleLoginSubmit = (e: FormEvent) => {
        e.preventDefault();
        setError('');
        const success = onLogin(username, password);
        if (!success) {
            setError('Incorrect username or password. Please try again.');
        }
    };

    const handleRequestResetSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError('');
        setMessage('');
        const success = await onRequestPasswordReset(username);
        if (success) {
            setMessage('If the username exists, a reset token has been sent.');
            setMode('resetPassword');
        } else {
            setError('Could not initiate password reset for that username.');
        }
    };

    const handleResetPasswordSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            setError('New passwords do not match.');
            return;
        }
        setError('');
        setMessage('');
        const success = await onResetPassword(token, newPassword);
        if (success) {
            setMessage('Password reset successfully. Please log in with your new password.');
            setMode('login');
            // Clear fields
            setUsername('');
            setPassword('');
            setToken('');
            setNewPassword('');
            setConfirmPassword('');
        } else {
            setError('Invalid or expired token. Please try again.');
        }
    };

    const renderForm = () => {
        switch (mode) {
            case 'requestReset':
                return (
                    <>
                        <h2 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-white">Reset Password</h2>
                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                            Enter your username to receive a reset token.
                        </p>
                        <form className="mt-8 space-y-6" onSubmit={handleRequestResetSubmit}>
                            <div>
                                <label htmlFor="username-input" className="sr-only">Username</label>
                                <input
                                    id="username-input" name="username" type="text" autoComplete="username" required
                                    value={username} onChange={(e) => setUsername(e.target.value)}
                                    className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 text-gray-900 dark:text-white dark:bg-gray-700 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                                    placeholder="Username"
                                />
                            </div>
                             <div>
                                <button type="submit" className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">
                                    Request Reset Token
                                </button>
                            </div>
                        </form>
                         <p className="mt-4 text-center text-sm">
                            <button onClick={() => { setMode('login'); setError(''); setMessage('');}} className="font-medium text-red-600 hover:text-red-500">
                                Back to Login
                            </button>
                        </p>
                    </>
                );
            case 'resetPassword':
                return (
                    <>
                        <h2 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-white">Set New Password</h2>
                         <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                            Enter the token from the alert and your new password.
                        </p>
                        <form className="mt-8 space-y-4" onSubmit={handleResetPasswordSubmit}>
                            <input type="text" placeholder="Reset Token" required value={token} onChange={e => setToken(e.target.value)}
                                   className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 text-gray-900 dark:text-white dark:bg-gray-700 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"/>
                            <input type="password" placeholder="New Password" required value={newPassword} onChange={e => setNewPassword(e.target.value)}
                                   className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 text-gray-900 dark:text-white dark:bg-gray-700 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"/>
                            <input type="password" placeholder="Confirm New Password" required value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                                   className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 text-gray-900 dark:text-white dark:bg-gray-700 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"/>
                            <button type="submit" className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">
                                Set New Password
                            </button>
                        </form>
                         <p className="mt-4 text-center text-sm">
                            <button onClick={() => { setMode('login'); setError(''); setMessage(''); }} className="font-medium text-red-600 hover:text-red-500">
                                Back to Login
                            </button>
                        </p>
                    </>
                );
            case 'login':
            default:
                return (
                    <>
                        <h2 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-white">Administrator Login</h2>
                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                            Please enter your credentials to access the admin panel.
                        </p>
                        <form className="mt-8 space-y-6" onSubmit={handleLoginSubmit}>
                            <div className="rounded-md shadow-sm -space-y-px">
                                <input id="username-input" name="username" type="text" autoComplete="username" required value={username} onChange={(e) => setUsername(e.target.value)}
                                    className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 text-gray-900 dark:text-white dark:bg-gray-700 rounded-t-md focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                                    placeholder="Username" />
                                <input id="password-input" name="password" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)}
                                    className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 text-gray-900 dark:text-white dark:bg-gray-700 rounded-b-md focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                                    placeholder="Password" />
                            </div>
                             <div className="flex items-center justify-end">
                                <div className="text-sm">
                                    <button type="button" onClick={() => { setMode('requestReset'); setError(''); setMessage(''); }} className="font-medium text-red-600 hover:text-red-500">
                                        Forgot your password?
                                    </button>
                                </div>
                            </div>
                            <div>
                                <button type="submit" className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">
                                    Sign in
                                </button>
                            </div>
                        </form>
                    </>
                );
        }
    };

    return (
        <div className="flex items-center justify-center min-h-[calc(100vh-10rem)] bg-gray-100 dark:bg-gray-900">
            <div className="w-full max-w-md p-8 space-y-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
                <div className="text-center">
                    <LogoIcon src={logoSrc} className="mx-auto h-20 w-auto" />
                    {renderForm()}
                    {error && <p className="mt-4 text-sm text-red-500 text-center">{error}</p>}
                    {message && <p className="mt-4 text-sm text-green-500 text-center">{message}</p>}
                </div>
            </div>
        </div>
    );
};