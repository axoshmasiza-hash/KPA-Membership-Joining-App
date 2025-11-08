
import React, { useMemo } from 'react';
import type { Applicant } from '../types';
import { ApplicationStatus } from '../types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface AdminDashboardProps {
  applicants: Applicant[];
}

const StatCard: React.FC<{ title: string; value: number; icon: React.ReactNode }> = ({ title, value, icon }) => (
  <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-5 flex items-center space-x-4">
    <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300">
      {icon}
    </div>
    <div>
      <p className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">{title}</p>
      <p className="mt-1 text-3xl font-semibold text-gray-900 dark:text-white">{value}</p>
    </div>
  </div>
);

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ applicants }) => {
  const stats = useMemo(() => {
    const nonDraftApplicants = applicants.filter(a => a.status !== ApplicationStatus.Draft);
    return {
      total: nonDraftApplicants.length,
      pending: nonDraftApplicants.filter(a => a.status === ApplicationStatus.Pending).length,
      approved: nonDraftApplicants.filter(a => a.status === ApplicationStatus.Approved).length,
      rejected: nonDraftApplicants.filter(a => a.status === ApplicationStatus.Rejected).length,
    };
  }, [applicants]);

  const chartData = useMemo(() => {
    const nonDraftApplicants = applicants.filter(a => a.status !== ApplicationStatus.Draft);
    const submissionsByDate: { [key: string]: number } = {};
    
    nonDraftApplicants.forEach(app => {
        const date = new Date(app.submissionDate).toLocaleDateString('en-CA'); // YYYY-MM-DD
        submissionsByDate[date] = (submissionsByDate[date] || 0) + 1;
    });

    const sortedDates = Object.keys(submissionsByDate).sort();
    let cumulativeTotal = 0;
    return sortedDates.map(date => {
        cumulativeTotal += submissionsByDate[date];
        return {
            date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric'}),
            new: submissionsByDate[date],
            total: cumulativeTotal,
        };
    });

  }, [applicants]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Applicants" value={stats.total} icon={<svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.653-.124-1.282-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.653.124-1.282.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>} />
        <StatCard title="Pending Review" value={stats.pending} icon={<svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} />
        <StatCard title="Approved Members" value={stats.approved} icon={<svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} />
        <StatCard title="Rejected Applicants" value={stats.rejected} icon={<svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} />
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-5">
        <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
          Membership Growth
        </h3>
        <div className="mt-4 h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 5, right: 20, left: -10, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
              <XAxis dataKey="date" stroke="rgb(156 163 175)" />
              <YAxis allowDecimals={false} stroke="rgb(156 163 175)" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(31, 41, 55, 0.8)',
                  borderColor: 'rgb(75, 85, 99)',
                  color: '#fff',
                }}
              />
              <Legend />
              <Line type="monotone" dataKey="new" name="New Applicants" stroke="#8884d8" activeDot={{ r: 8 }} />
              <Line type="monotone" dataKey="total" name="Total Members" stroke="#82ca9d" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
