import React from 'react';

const Badge = ({ status }) => {
  const styles = {
    pending: 'bg-yellow-100 text-yellow-800',
    approved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
    active: 'bg-green-100 text-green-800',
    frozen: 'bg-blue-100 text-blue-800',
    closed: 'bg-gray-100 text-gray-800',
    true: 'bg-green-100 text-green-800',
    false: 'bg-red-100 text-red-800',
    admin: 'bg-purple-100 text-purple-800',
    user: 'bg-blue-100 text-blue-800',
    deposit: 'bg-green-100 text-green-800',
    withdrawal: 'bg-red-100 text-red-800',
    transfer: 'bg-blue-100 text-blue-800',
  };

  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${styles[status] || 'bg-gray-100 text-gray-700'}`}>
      {status}
    </span>
  );
};

export default Badge;
