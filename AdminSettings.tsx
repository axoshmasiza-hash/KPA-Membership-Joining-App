import React, { ChangeEvent, useState } from 'react';

interface AdminSettingsProps {
  onLogoUpload: (file: File) => void;
  currentLogo: string;
}

export const AdminSettings: React.FC<AdminSettingsProps> = ({ onLogoUpload, currentLogo }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };
  
  const handleUploadClick = () => {
    if (selectedFile) {
      onLogoUpload(selectedFile);
    } else {
      alert("Please select a file first.");
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Organization Settings</h2>
      
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200">Update Logo</h3>
        <div className="flex items-center space-x-6">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Current Logo:</p>
            <img src={currentLogo} alt="Current KPA Logo" className="h-24 w-auto bg-gray-200 dark:bg-gray-700 p-2 rounded-md" />
          </div>
          <div className="flex-1">
            <label htmlFor="logo-upload" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Choose a new logo image
            </label>
            <div className="mt-1 flex items-center space-x-2">
              <input 
                id="logo-upload" 
                name="logo-upload" 
                type="file" 
                accept="image/*"
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-500 dark:text-gray-400
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-full file:border-0
                  file:text-sm file:font-semibold
                  file:bg-red-50 file:text-red-700
                  dark:file:bg-red-900/50 dark:file:text-red-300
                  hover:file:bg-red-100"
              />
              <button 
                onClick={handleUploadClick}
                disabled={!selectedFile}
                className="px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:bg-red-300 dark:disabled:bg-red-800"
              >
                Upload
              </button>
            </div>
             {selectedFile && <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Selected: {selectedFile.name}</p>}
          </div>
        </div>
      </div>
    </div>
  );
};
