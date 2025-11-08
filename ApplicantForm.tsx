import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import type { Applicant } from '../types';
import { ApplicationStatus, MembershipRole } from '../types';
import { PROVINCES, WHATSAPP_SHARE_URL } from '../constants';
import { WhatsappIcon } from './icons/WhatsappIcon';
import { validateAndParseSAID } from '../helpers/idHelper';

interface ApplicantFormProps {
  addOrUpdateApplicant: (applicant: Applicant) => void;
  deleteApplicant: (id: string) => void;
  initialData: Applicant | null;
  isUpdating: boolean;
  onComplete: () => void;
  onCancelUpdate?: () => void;
}

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

const initialFormData = {
    id: `draft-${Date.now()}`,
    fullName: '',
    idNumber: '',
    dateOfBirth: '',
    address: '',
    email: '',
    phone: '',
    province: '',
    municipality: '',
    idPhoto: null,
    paymentProof: null,
    membershipRole: MembershipRole.NONE,
};

export const ApplicantForm: React.FC<ApplicantFormProps> = ({ 
    addOrUpdateApplicant, 
    deleteApplicant, 
    initialData,
    isUpdating,
    onComplete,
    onCancelUpdate,
}) => {
  const [formData, setFormData] = useState<Omit<Applicant, 'status' | 'submissionDate'>>(initialFormData);
  const [municipalities, setMunicipalities] = useState<string[]>([]);
  const [fileName, setFileName] = useState<string | null>(null);
  const [idPhotoFileName, setIdPhotoFileName] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string>('');
  const [phoneError, setPhoneError] = useState<string>('');
  const [idError, setIdError] = useState<string>('');

  useEffect(() => {
    if (initialData) {
      setFormData({ ...initialData });
      const selectedProvince = PROVINCES.find(p => p.name === initialData.province);
      if (selectedProvince) {
        setMunicipalities(selectedProvince.municipalities);
      }
      setFileName(initialData.paymentProof?.name || null);
      setIdPhotoFileName(initialData.idPhoto?.name || null);
    } else {
        setFormData(initialFormData);
    }
  }, [initialData]);
  
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      setEmailError('Email is required.');
      return false;
    }
    if (!emailRegex.test(email)) {
      setEmailError('Please enter a valid email address (e.g., user@domain.com).');
      return false;
    }
    setEmailError('');
    return true;
  };

  const validatePhone = (phone: string): boolean => {
    const phoneRegex = /^\d{10,15}$/;
    if (!phone) {
      setPhoneError('Phone number is required.');
      return false;
    }
    if (!phoneRegex.test(phone)) {
      setPhoneError('Please enter a valid phone number (10-15 digits, no spaces or symbols).');
      return false;
    }
    setPhoneError('');
    return true;
  };

  const handleIdNumberChange = (value: string) => {
    setFormData(prev => ({ ...prev, idNumber: value, dateOfBirth: '' }));
    setIdError('');

    if (value.length === 13) {
      const { dateOfBirth, error } = validateAndParseSAID(value);
      if (error) {
        setIdError(error);
      } else {
        setFormData(prev => ({ ...prev, dateOfBirth }));
      }
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name === 'idNumber') {
        handleIdNumberChange(value);
        return;
    }

    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (name === 'province') {
      const selectedProvince = PROVINCES.find(p => p.name === value);
      setMunicipalities(selectedProvince ? selectedProvince.municipalities : []);
      setFormData(prev => ({ ...prev, municipality: '' }));
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === 'email') {
      validateEmail(value);
    }
    if (name === 'phone') {
      validatePhone(value);
    }
  };
  
  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFileName(file.name);
      const dataUrl = await fileToBase64(file);
      setFormData(prev => ({ ...prev, paymentProof: { name: file.name, dataUrl } }));
    }
  };

   const handleIdPhotoChange = async (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setIdPhotoFileName(file.name);
      const dataUrl = await fileToBase64(file);
      setFormData(prev => ({ ...prev, idPhoto: { name: file.name, dataUrl } }));
    }
  };

  const handleSaveDraft = () => {
    const applicant: Applicant = {
      ...formData,
      status: ApplicationStatus.Draft,
      submissionDate: new Date().toISOString(),
    };
    addOrUpdateApplicant(applicant);
    alert('Draft saved successfully!');
    onComplete();
  };

  const handleDeleteDraft = () => {
    if (window.confirm('Are you sure you want to delete this draft?')) {
        deleteApplicant(formData.id);
        onComplete();
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    // Trigger validation for all fields on submit, in case a field was never blurred
    const isEmailValid = validateEmail(formData.email);
    const isPhoneValid = validatePhone(formData.phone);
    
    if (!formData.idNumber) {
        setIdError('ID Number is required.');
    } else if (idError) {
        // If there's already an ID error from handleChange, don't proceed
        return;
    }

    if (!isEmailValid || !isPhoneValid || idError) {
        return;
    }
    if(!formData.idPhoto){
        alert("Please upload an ID Photo.");
        return;
    }
    if(!formData.paymentProof){
        alert("Please upload proof of payment.");
        return;
    }
     const applicant: Applicant = {
      ...formData,
      // If it's a new submission from a draft, create a new ID. Otherwise, keep the existing ID.
      id: !isUpdating && formData.id.startsWith('draft-') ? `app-${Date.now()}` : formData.id,
      // If it's a new submission, set status to Pending. If it's an update, keep the existing status.
      status: isUpdating ? (formData as Applicant).status : ApplicationStatus.Pending,
      // If it's a new submission, set the date. If it's an update, keep the existing date.
      submissionDate: isUpdating ? (formData as Applicant).submissionDate : new Date().toISOString(),
    };
    addOrUpdateApplicant(applicant);
    alert(isUpdating ? 'Your information has been updated successfully!' : 'Application submitted successfully! You will be notified of the outcome.');
    
    onComplete();
  };
  
  return (
    <div className="container mx-auto max-w-2xl p-4 sm:p-6 lg:p-8">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 sm:p-8 space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {isUpdating ? 'Update Your Information' : 'Join KPA'}
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-300">
            {isUpdating ? 'Please review and update your details below.' : 'Become a member of Komani Progress Action and help shape the future.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Full Name</label>
              <input type="text" name="fullName" id="fullName" value={formData.fullName} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"/>
            </div>
             <div>
              <label htmlFor="idNumber" className="block text-sm font-medium text-gray-700 dark:text-gray-300">SA ID Number</label>
              <input type="text" name="idNumber" id="idNumber" value={formData.idNumber} onChange={handleChange} required maxLength={13} disabled={isUpdating} className={`mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 ${idError ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} ${isUpdating ? 'disabled:bg-gray-200 dark:disabled:bg-gray-600' : ''}`}/>
              {idError && <p className="mt-1 text-sm text-red-600">{idError}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div>
                <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Date of Birth</label>
                <input type="text" name="dateOfBirth" id="dateOfBirth" value={formData.dateOfBirth} readOnly className="mt-1 block w-full px-3 py-2 bg-gray-100 dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-md shadow-sm"/>
            </div>
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Phone Number</label>
              <input type="tel" name="phone" id="phone" value={formData.phone} onChange={handleChange} onBlur={handleBlur} required className={`mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 ${phoneError ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`} />
               {phoneError && <p className="mt-1 text-sm text-red-600">{phoneError}</p>}
            </div>
          </div>
          
           <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email Address</label>
              <input type="email" name="email" id="email" value={formData.email} onChange={handleChange} onBlur={handleBlur} required className={`mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 ${emailError ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`} />
              {emailError && <p className="mt-1 text-sm text-red-600">{emailError}</p>}
            </div>

          <div>
            <label htmlFor="address" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Address</label>
            <textarea name="address" id="address" value={formData.address} onChange={handleChange} required rows={3} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="province" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Province</label>
                <select name="province" id="province" value={formData.province} onChange={handleChange} required className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:outline-none focus:ring-red-500 focus:border-red-500 rounded-md">
                  <option value="">Select Province</option>
                  {PROVINCES.map(p => <option key={p.name} value={p.name}>{p.name}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="municipality" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Local Municipality</label>
                <select name="municipality" id="municipality" value={formData.municipality} onChange={handleChange} required disabled={municipalities.length === 0} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 disabled:bg-gray-200 dark:disabled:bg-gray-600 focus:outline-none focus:ring-red-500 focus:border-red-500 rounded-md">
                  <option value="">Select Municipality</option>
                  {municipalities.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">ID Photo</label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-md">
                <div className="space-y-1 text-center">
                    <svg className="mx-auto h-12 w-12 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.5 0l-1.41-1.41m1.41 1.41L1 16.5m1.5 3.75l1.41-1.41m-1.41 1.41l1.41 1.41M19.5 8.25l-2.25 0h0M19.5 12h-2.25m2.25 3.75h-2.25M17.25 12a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                    </svg>
                    <div className="flex text-sm text-gray-600 dark:text-gray-400">
                    <label htmlFor="id-photo-upload" className="relative cursor-pointer bg-white dark:bg-gray-700 rounded-md font-medium text-red-600 hover:text-red-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-red-500">
                        <span>Upload ID photo</span>
                        <input id="id-photo-upload" name="id-photo-upload" type="file" className="sr-only" onChange={handleIdPhotoChange} accept="image/*"/>
                    </label>
                    </div>
                    {idPhotoFileName && <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 truncate max-w-[150px]">{idPhotoFileName}</p>}
                </div>
                </div>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Proof of Payment</label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-md">
                <div className="space-y-1 text-center">
                    <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true"><path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    <div className="flex text-sm text-gray-600 dark:text-gray-400">
                    <label htmlFor="file-upload" className="relative cursor-pointer bg-white dark:bg-gray-700 rounded-md font-medium text-red-600 hover:text-red-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-red-500">
                        <span>Upload a file</span>
                        <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} accept="image/*,.pdf"/>
                    </label>
                    </div>
                    {fileName && <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 truncate max-w-[150px]">{fileName}</p>}
                </div>
                </div>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row sm:justify-between items-center space-y-4 sm:space-y-0 sm:space-x-4 pt-4">
              <div className="flex space-x-2">
                 {isUpdating ? (
                    <button type="button" onClick={onCancelUpdate} className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">
                        Cancel
                    </button>
                 ) : (
                    <>
                        <button type="button" onClick={handleSaveDraft} className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">
                            Save Draft
                        </button>
                        {initialData?.status === ApplicationStatus.Draft && (
                            <button type="button" onClick={handleDeleteDraft} className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500">
                                Delete Draft
                            </button>
                        )}
                    </>
                 )}
              </div>
             <button type="submit" className="w-full sm:w-auto inline-flex justify-center py-3 px-6 border border-transparent shadow-sm text-base font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">
                {isUpdating ? 'Update Information' : 'Submit Application'}
            </button>
          </div>
        </form>

        <div className="text-center pt-4 border-t dark:border-gray-700">
            <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200">Share with Friends</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Help our party grow by sharing the application link.</p>
            <a 
              href={WHATSAPP_SHARE_URL} 
              target="_blank" 
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              <WhatsappIcon className="h-5 w-5 mr-2" />
              Share on WhatsApp
            </a>
        </div>
      </div>
    </div>
  );
};