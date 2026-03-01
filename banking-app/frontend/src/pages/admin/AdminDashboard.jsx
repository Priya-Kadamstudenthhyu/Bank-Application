import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import StatCard from '../../components/common/StatCard';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

const COLORS = ['#f59e0b', '#10b981', '#ef4444'];

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/dashboard')
      .then(res => setData(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center mt-20"><div className="animate-spin h-10 w-10 border-b-2 border-blue-600 rounded-full"></div></div>;

  const pieData = [
    { name: 'Pending', value: data?.pending_transactions || 0 },
    { name: 'Approved', value: data?.approved_transactions || 0 },
    { name: 'Rejected', value: data?.rejected_transactions || 0 },
  ];

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
        <p className="text-gray-500 mt-1">System overview and analytics</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        <StatCard title="Total Users" value={data?.total_users || 0} icon="👥" color="blue" />
        <StatCard title="Active Users" value={data?.active_users || 0} icon="✅" color="green" />
        <StatCard title="Accounts" value={data?.total_accounts || 0} icon="💳" color="purple" />
        <StatCard title="Pending" value={data?.pending_transactions || 0} icon="⏳" color="yellow" />
        <StatCard title="Approved" value={data?.approved_transactions || 0} icon="✔️" color="green" />
        <StatCard title="Rejected" value={data?.rejected_transactions || 0} icon="❌" color="red" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Bar Chart */}
        <div className="bg-white rounded-xl shadow-sm border p-6 lg:col-span-2">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Monthly Transaction Volume</h2>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={data?.monthly_data || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Transactions" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Transaction Status</h2>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label>
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Legend />
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Quick Admin Links */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
        {[
          { href: '/admin/users', icon: '👥', label: 'Manage Users', color: 'blue' },
          { href: '/admin/accounts', icon: '💳', label: 'Review Accounts', color: 'purple' },
          { href: '/admin/transactions', icon: '⏳', label: 'Pending Approvals', color: 'yellow' },
          { href: '/admin/transactions', icon: '📊', label: 'All Transactions', color: 'green' },
        ].map(item => (
          <a key={item.label} href={item.href}
            className={`bg-white border rounded-xl p-4 hover:shadow-md transition-shadow text-center`}>
            <div className="text-3xl mb-2">{item.icon}</div>
            <div className="font-medium text-gray-700 text-sm">{item.label}</div>
          </a>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard;
