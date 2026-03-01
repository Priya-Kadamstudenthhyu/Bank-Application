import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import Badge from '../../components/common/Badge';

const AdminAccounts = () => {
  const [accounts, setAccounts] = useState([]);
  const [total, setTotal] = useState(0);
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchAccounts = (status = '') => {
    setLoading(true);
    api.get(`/admin/accounts?status=${status}`)
      .then(res => {
        setAccounts(res.data.accounts);
        setTotal(res.data.total);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchAccounts(); }, []);

  const handleFilter = (s) => {
    setStatusFilter(s);
    fetchAccounts(s);
  };

  const activateAccount = async (id) => {
    await api.put(`/admin/accounts/${id}/activate`);
    fetchAccounts(statusFilter);
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Account Management</h1>
          <p className="text-gray-500 mt-1">{total} total accounts</p>
        </div>
        <div className="flex gap-2">
          {['', 'pending', 'active', 'frozen', 'closed'].map(s => (
            <button key={s} onClick={() => handleFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium capitalize ${statusFilter === s ? 'bg-blue-600 text-white' : 'bg-white border text-gray-600 hover:bg-gray-50'}`}>
              {s || 'All'}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        {loading ? (
          <div className="p-12 text-center"><div className="animate-spin h-8 w-8 border-b-2 border-blue-600 rounded-full mx-auto"></div></div>
        ) : accounts.length === 0 ? (
          <div className="p-12 text-center text-gray-400"><div className="text-4xl mb-2">💳</div><p>No accounts found</p></div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
              <tr>
                <th className="px-4 py-3 text-left">Account Number</th>
                <th className="px-4 py-3 text-left">Type</th>
                <th className="px-4 py-3 text-right">Balance</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3 text-left">Created</th>
                <th className="px-4 py-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {accounts.map(acc => (
                <tr key={acc.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-sm font-medium">{acc.account_number}</td>
                  <td className="px-4 py-3 text-sm capitalize text-gray-600">{acc.account_type}</td>
                  <td className="px-4 py-3 text-right font-bold text-gray-800">${Number(acc.balance).toFixed(2)}</td>
                  <td className="px-4 py-3 text-center"><Badge status={acc.status} /></td>
                  <td className="px-4 py-3 text-sm text-gray-500">{new Date(acc.created_at).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-center">
                    {acc.status === 'pending' && (
                      <button onClick={() => activateAccount(acc.id)}
                        className="bg-green-50 text-green-700 border border-green-200 text-xs px-3 py-1.5 rounded hover:bg-green-100 font-medium">
                        ✅ Activate
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AdminAccounts;
