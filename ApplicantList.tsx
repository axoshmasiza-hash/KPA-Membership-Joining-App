import React, { useState, useMemo } from 'react';
import type { Applicant } from '../types';
import { ApplicationStatus } from '../types';
import { Modal } from './Modal';
import { UserIcon } from './icons/UserIcon';
import { PrintIcon } from './icons/PrintIcon';
import { WhatsappIcon } from './icons/WhatsappIcon';
import { EmailIcon } from './icons/EmailIcon';
import { SmsIcon } from './icons/SmsIcon';

interface ApplicantListProps {
  applicants: Applicant[];
  updateApplicant: (applicant: Applicant) => void;
  deleteApplicants: (ids: string[]) => void;
}

const statusColors: { [key in ApplicationStatus]: string } = {
  [ApplicationStatus.Pending]: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  [ApplicationStatus.Approved]: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  [ApplicationStatus.Rejected]: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
  [ApplicationStatus.Draft]: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
};

const isExpiringSoon = (expiryDate?: string): boolean => {
    if (!expiryDate) return false;
    const thirtyDays = 30 * 24 * 60 * 60 * 1000;
    const expiry = new Date(expiryDate).getTime();
    const now = new Date().getTime();
    return expiry - now < thirtyDays && expiry > now;
};


export const ApplicantList: React.FC<ApplicantListProps> = ({ applicants, updateApplicant, deleteApplicants }) => {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState<ApplicationStatus | 'all' | 'Draft'>('all');
  const [showRejectModal, setShowRejectModal] = useState<Applicant | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [editingExpiryId, setEditingExpiryId] = useState<string | null>(null);
  const [newExpiryDate, setNewExpiryDate] = useState('');


  const filteredApplicants = useMemo(() => {
    if (filter === 'all') {
      return applicants.filter(app => app.status !== ApplicationStatus.Draft);
    }
    return applicants.filter(app => app.status === filter);
  }, [applicants, filter]);

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(new Set(filteredApplicants.map(a => a.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSelectOne = (id: string) => {
    const newSelectedIds = new Set(selectedIds);
    if (newSelectedIds.has(id)) {
      newSelectedIds.delete(id);
    } else {
      newSelectedIds.add(id);
    }
    setSelectedIds(newSelectedIds);
  };
  
  const handleBulkDelete = () => {
    if(selectedIds.size === 0) return;
    if (window.confirm(`Are you sure you want to delete ${selectedIds.size} selected applicant(s)?`)) {
        deleteApplicants(Array.from(selectedIds));
        setSelectedIds(new Set());
    }
  };

  const handlePrintSelected = () => {
    const selectedApplicants = applicants.filter(a => selectedIds.has(a.id));
    if (selectedApplicants.length === 0) {
        alert("Please select applicants to print.");
        return;
    };

    const printWindow = window.open('', '_blank');
    if (printWindow) {
        printWindow.document.write('<html><head><title>KPA Applicant Data</title>');
        printWindow.document.write('<style>body { font-family: sans-serif; } table { width: 100%; border-collapse: collapse; } th, td { border: 1px solid #ddd; padding: 8px; text-align: left; } thead { background-color: #f2f2f2; } @media print { .no-print { display: none; } }</style>');
        printWindow.document.write('</head><body>');
        printWindow.document.write(`<h1>KPA Applicant Data (${selectedApplicants.length})</h1><p>Generated on: ${new Date().toLocaleString()}</p>`);
        printWindow.document.write('<table><thead><tr><th>Name</th><th>ID Number</th><th>Email</th><th>Phone</th><th>Status</th><th>Expiry Date</th></tr></thead><tbody>');
        
        selectedApplicants.forEach(app => {
            printWindow.document.write(`<tr>
                <td>${app.fullName}</td>
                <td>${app.idNumber}</td>
                <td>${app.email}</td>
                <td>${app.phone}</td>
                <td>${app.status}</td>
                <td>${app.expiryDate ? new Date(app.expiryDate).toLocaleDateString() : 'N/A'}</td>
            </tr>`);
        });

        printWindow.document.write('</tbody></table>');
        printWindow.document.write('<br/><button class="no-print" onclick="window.print()">Print</button>');
        printWindow.document.write('</body></html>');
        printWindow.document.close();
    }
  };

  const handleApprove = (applicant: Applicant) => {
    updateApplicant({ ...applicant, status: ApplicationStatus.Approved, rejectionReason: '' });
  };
  
  const handleReject = (applicant: Applicant) => {
    setShowRejectModal(applicant);
  };
  
  const submitRejection = () => {
      if(showRejectModal && rejectionReason.trim()){
          updateApplicant({ ...showRejectModal, status: ApplicationStatus.Rejected, rejectionReason });
          setShowRejectModal(null);
          setRejectionReason('');
      } else {
          alert('Please provide a reason for rejection.');
      }
  };
  
  const getReminderMessage = (applicant: Applicant) => {
      const expiry = applicant.expiryDate ? new Date(applicant.expiryDate).toLocaleDateString() : 'soon';
      return encodeURIComponent(`Hi ${applicant.fullName}, this is a friendly reminder that your KPA membership is expiring on ${expiry}. Please contact us to renew your membership. Thank you!`);
  };

  const handleExpiryEditStart = (applicant: Applicant) => {
    setEditingExpiryId(applicant.id);
    setNewExpiryDate(applicant.expiryDate ? new Date(applicant.expiryDate).toISOString().split('T')[0] : '');
  };

  const handleExpiryEditSave = () => {
    if (editingExpiryId) {
        const applicantToUpdate = applicants.find(a => a.id === editingExpiryId);
        if (applicantToUpdate && newExpiryDate) {
            const dateInUTC = new Date(`${newExpiryDate}T12:00:00Z`);
            updateApplicant({ ...applicantToUpdate, expiryDate: dateInUTC.toISOString() });
        }
        setEditingExpiryId(null);
    }
  };

  const handleExpiryEditCancel = () => {
    setEditingExpiryId(null);
  };

  return (
    <>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="p-4 border-b dark:border-gray-700 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center space-x-4">
                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200">
                    {filteredApplicants.length} Applicant(s)
                </h3>
                <select value={filter} onChange={e => setFilter(e.target.value as any)} className="rounded-md dark:bg-gray-700 dark:border-gray-600 focus:ring-red-500 focus:border-red-500 text-sm">
                    <option value="all">All Submitted</option>
                    <option value={ApplicationStatus.Pending}>Pending</option>
                    <option value={ApplicationStatus.Approved}>Approved</option>
                    <option value={ApplicationStatus.Rejected}>Rejected</option>
                </select>
            </div>
            <div className="flex items-center space-x-2">
                <button
                    onClick={handlePrintSelected}
                    disabled={selectedIds.size === 0}
                    className="flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 dark:disabled:bg-gray-600"
                >
                    <PrintIcon className="h-4 w-4 mr-2" />
                    Print ({selectedIds.size})
                </button>
                <button
                    onClick={handleBulkDelete}
                    disabled={selectedIds.size === 0}
                    className="px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:bg-gray-400 dark:disabled:bg-gray-600"
                >
                    Delete ({selectedIds.size})
                </button>
            </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th scope="col" className="p-4">
                  <input type="checkbox" className="h-4 w-4 rounded border-gray-300 text-red-600 focus:ring-red-500" onChange={handleSelectAll} checked={selectedIds.size > 0 && selectedIds.size === filteredApplicants.length} />
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Applicant</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Location</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Membership Expiry</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Documents</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredApplicants.map((applicant) => (
                <tr key={applicant.id} className={selectedIds.has(applicant.id) ? 'bg-gray-100 dark:bg-gray-900' : ''}>
                  <td className="p-4">
                    <input type="checkbox" className="h-4 w-4 rounded border-gray-300 text-red-600 focus:ring-red-500" checked={selectedIds.has(applicant.id)} onChange={() => handleSelectOne(applicant.id)} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                            {applicant.idPhoto ? (
                                <a href={applicant.idPhoto.dataUrl} target="_blank" rel="noopener noreferrer" title="View full ID photo">
                                    <img className="h-10 w-10 rounded-full object-cover" src={applicant.idPhoto.dataUrl} alt="ID" />
                                </a>
                            ) : (
                                <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                                    <UserIcon className="h-6 w-6 text-gray-400" />
                                </div>
                            )}
                        </div>
                        <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">{applicant.fullName}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">{applicant.email}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">{applicant.idNumber}</div>
                        </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 dark:text-white whitespace-nowrap">{applicant.province}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">{applicant.municipality}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors[applicant.status]}`}>
                            {applicant.status}
                        </span>
                    </div>
                     {applicant.status === ApplicationStatus.Rejected && applicant.rejectionReason && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 italic w-36 whitespace-normal">{applicant.rejectionReason}</p>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {applicant.status === ApplicationStatus.Approved ? (
                        editingExpiryId === applicant.id ? (
                            <input
                                type="date"
                                value={newExpiryDate}
                                onChange={(e) => setNewExpiryDate(e.target.value)}
                                onBlur={handleExpiryEditSave}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        handleExpiryEditSave();
                                    }
                                    if (e.key === 'Escape') handleExpiryEditCancel();
                                }}
                                autoFocus
                                className="w-40 px-2 py-1 border rounded-md dark:bg-gray-700 dark:border-gray-600 focus:ring-red-500 focus:border-red-500"
                            />
                        ) : (
                            <div onClick={() => handleExpiryEditStart(applicant)} className="cursor-pointer group flex items-center space-x-2">
                                {applicant.expiryDate ? (
                                    <p className={`group-hover:text-red-500 ${isExpiringSoon(applicant.expiryDate) ? 'text-yellow-500 font-bold' : 'text-gray-500 dark:text-gray-400'}`}>
                                        {new Date(applicant.expiryDate).toLocaleDateString()}
                                    </p>
                                ) : (
                                    <p className="text-gray-400 italic group-hover:text-red-500">Set Date</p>
                                )}
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L14.732 6.732z" /></svg>
                            </div>
                        )
                    ) : (
                        <p className="text-gray-400">N/A</p>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {applicant.paymentProof ? <a href={applicant.paymentProof.dataUrl} target="_blank" rel="noopener noreferrer" className="text-red-600 hover:text-red-800">View Proof</a> : 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {applicant.status === ApplicationStatus.Pending && (
                       <div className="flex space-x-2">
                            <button onClick={() => handleApprove(applicant)} className="text-green-600 hover:text-green-900">Approve</button>
                            <button onClick={() => handleReject(applicant)} className="text-red-600 hover:text-red-900">Reject</button>
                       </div>
                    )}
                    {applicant.status === ApplicationStatus.Approved && isExpiringSoon(applicant.expiryDate) && (
                        <div className="flex items-center space-x-2">
                            <a href={`https://wa.me/${applicant.phone}?text=${getReminderMessage(applicant)}`} target="_blank" rel="noopener noreferrer" title="Send WhatsApp Reminder">
                                <WhatsappIcon className="h-5 w-5 text-green-500 hover:text-green-700" />
                            </a>
                            <a href={`mailto:${applicant.email}?subject=KPA Membership Renewal&body=${getReminderMessage(applicant)}`} title="Send Email Reminder">
                                <EmailIcon className="h-5 w-5 text-blue-500 hover:text-blue-700" />
                            </a>
                            <a href={`sms:${applicant.phone}?body=${getReminderMessage(applicant)}`} title="Send SMS Reminder">
                                <SmsIcon className="h-5 w-5 text-purple-500 hover:text-purple-700" />
                            </a>
                        </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      <Modal isOpen={!!showRejectModal} onClose={() => setShowRejectModal(null)} title="Reason for Rejection">
          <div className="space-y-4">
            <p>Please provide a reason for rejecting the application for <span className="font-bold">{showRejectModal?.fullName}</span>.</p>
            <textarea 
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={4}
                className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 focus:ring-red-500 focus:border-red-500"
                placeholder="e.g., Incomplete information, payment not verified, etc."
            />
            <div className="flex justify-end space-x-2">
                <button onClick={() => setShowRejectModal(null)} className="px-4 py-2 text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-600 hover:bg-gray-200 dark:hover:bg-gray-500">Cancel</button>
                <button onClick={submitRejection} className="px-4 py-2 text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700">Submit Rejection</button>
            </div>
          </div>
      </Modal>
    </>
  );
};