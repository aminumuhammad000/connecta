import React from 'react';

interface StatusBadgeProps {
  status: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const normalized = status.toLowerCase();

  let style = 'bg-gray-100 text-gray-700 border-gray-200';
  let label = status;

  if (['active', 'completed', 'accepted', 'present'].includes(normalized)) {
    style = 'bg-emerald-50 text-emerald-700 border-emerald-200';
    label = normalized === 'active' ? 'Active' : normalized === 'completed' ? 'Completed' : normalized === 'accepted' ? 'Accepted' : 'Present';
  } else if (['pending', 'sent', 'draft', 'late'].includes(normalized)) {
    style = 'bg-amber-50 text-amber-700 border-amber-200';
    label = normalized === 'pending' ? 'Pending' : normalized === 'sent' ? 'Sent' : normalized === 'draft' ? 'Draft' : 'Late';
  } else if (['inactive', 'failed', 'terminated', 'absent', 'declined'].includes(normalized)) {
    style = 'bg-red-50 text-red-700 border-red-200';
    label = normalized === 'inactive' ? 'Inactive' : normalized === 'failed' ? 'Failed' : normalized === 'terminated' ? 'Terminated' : normalized === 'absent' ? 'Absent' : 'Declined';
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-extrabold border ${style}`}>
      {label}
    </span>
  );
};
