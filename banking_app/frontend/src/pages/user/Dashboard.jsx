import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../hooks/useAuth';
import StatCard from '../../components/common/StatCard';
import Badge from '../../components/common/Badge';

const UserDashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/user/dashboard')
      .then(res => setData(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center mt-20"><div className="animate-spin h-10 w-10 border-b-2 border-blue-600 rounded-full"></div></div>;

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Good day, {user?.full_name?.split(' ')[0]}! 👋</h1>
        <p className="text-gray-500 mt-1">Here's an overview of your banking activity</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard
          title="Total Balance"
          value={`$${data?.total_balance?.toLocaleString('en-US', { minimumFractionDigits: 2 }) || '0.00'}`}
          icon="💰"
          color="green"
          subtitle="Across all active accounts"
        />
        <StatCard title="My Accounts" value={data?.total_accounts || 0} icon="💳" color="blue" />
        <StatCard title="Pending Transactions" value={data?.pending_transactions || 0} icon="⏳" color="yellow" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h2>
          <div className="space-y-3">
            {[
              { to: '/accounts', icon: '💳', label: 'Open New Account', desc: 'Start a savings or checking account' },
              { to: '/transactions', icon: '💸', label: 'New Transaction', desc: 'Deposit, withdraw, or transfer' },
              { to: '/signature', icon: '✍️', label: 'Manage Signature', desc: 'Draw or upload your signature' },
              { to: '/profile', icon: '👤', label: 'Edit Profile', desc: 'Update your personal info' },
            ].map(item => (
              <Link key={item.to} to={item.to}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-blue-50 transition-colors border border-transparent hover:border-blue-100">
                <span className="text-2xl">{item.icon}</span>
                <div>
                  <div className="font-medium text-gray-800 text-sm">{item.label}</div>
                  <div className="text-xs text-gray-500">{item.desc}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white rounded-xl shadow-sm border p-6 lg:col-span-2">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Recent Transactions</h2>
            <Link to="/transactions" className="text-blue-600 text-sm hover:underline">View All →</Link>
          </div>
          {data?.recent_transactions?.length === 0 ? (
            <div className="text-center text-gray-400 py-8">
              <div className="text-4xl mb-2">📋</div>
              <p>No transactions yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {data?.recent_transactions?.map(txn => (
                <div key={txn.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">
                      {txn.transaction_type === 'deposit' ? '⬇️' : txn.transaction_type === 'withdrawal' ? '⬆️' : '↔️'}
                    </span>
                    <div>
                      <div className="font-medium text-sm text-gray-800 capitalize">{txn.transaction_type}</div>
                      <div className="text-xs text-gray-500">{new Date(txn.created_at).toLocaleDateString()}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-gray-800">${Number(txn.amount).toFixed(2)}</div>
                    <Badge status={txn.status} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
