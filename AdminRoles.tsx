import React, { useMemo } from 'react';
import type { Applicant } from '../types';
import { ApplicationStatus, MembershipRole } from '../types';

interface AdminRolesProps {
  applicants: Applicant[];
  updateApplicant: (applicant: Applicant) => void;
}

export const AdminRoles: React.FC<AdminRolesProps> = ({ applicants, updateApplicant }) => {
  const approvedMembers = useMemo(() => {
    return applicants.filter(a => a.status === ApplicationStatus.Approved);
  }, [applicants]);

  const handleRoleChange = (applicant: Applicant, newRole: MembershipRole) => {
    updateApplicant({ ...applicant, membershipRole: newRole });
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
      <div className="p-4 border-b dark:border-gray-700">
        <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
          Manage Member Roles
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Assign roles to approved members. Total members: {approvedMembers.length}
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Member</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Contact</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Membership Expiry</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Assigned Role</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {approvedMembers.map((member) => (
              <tr key={member.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">{member.fullName}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{member.idNumber}</div>
                </td>
                 <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">{member.email}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">{member.phone}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                  {member.expiryDate ? new Date(member.expiryDate).toLocaleDateString() : 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <select
                    value={member.membershipRole}
                    onChange={(e) => handleRoleChange(member, e.target.value as MembershipRole)}
                    className="rounded-md dark:bg-gray-700 dark:border-gray-600 focus:ring-red-500 focus:border-red-500 text-sm"
                  >
                    {Object.values(MembershipRole)
                      .filter(role => role !== MembershipRole.NONE)
                      .map(role => (
                        <option key={role} value={role}>{role}</option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {approvedMembers.length === 0 && (
            <p className="text-center py-8 text-gray-500 dark:text-gray-400">No approved members found.</p>
        )}
      </div>
    </div>
  );
};
