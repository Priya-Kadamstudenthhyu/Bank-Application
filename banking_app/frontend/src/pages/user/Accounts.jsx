import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import Badge from '../../components/common/Badge';

const Accounts = () => {
  const [accounts, setAccounts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [accountType, setAccountType] = useState('savings');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });

  const fetchAccounts = () => {
    api.get('/user/accounts').then(res => setAccounts(res.data.accounts));
  };

  useEffect(() => { fetchAccounts(); }, []);

  const handleOpenAccount = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/user/accounts/open', { account_type: accountType });
      setMsg({ type: 'success', text: 'Account application submitted! Awaiting admin approval.' });
      setShowForm(false);
      fetchAccounts();
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.error || 'Failed to open account' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">My Accounts</h1>
          <p className="text-gray-500 mt-1">Manage your bank accounts</p>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-semibold transition-colors">
          + Open New Account
        </button>
      </div>

      {msg.text && (
        <div className={`mb-6 p-3 rounded-lg text-sm ${msg.type === 'success' ? 'bg-green-50 border border-green-200 text-green-700' : 'bg-red-50 border border-red-200 text-red-700'}`}>
          {msg.text}
        </div>
      )}

      {showForm && (
        <div className="bg-white border rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Open a New Account</h2>
          <form onSubmit={handleOpenAccount} className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Account Type</label>
              <select value={accountType} onChange={e => setAccountType(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="savings">Savings Account</option>
                <option value="checking">Checking Account</option>
                <option value="fixed">Fixed Deposit Account</option>
              </select>
            </div>
            <button type="submit" disabled={loading}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-2.5 rounded-lg font-semibold transition-colors disabled:opacity-50">
              {loading ? 'Submitting...' : 'Submit Application'}
            </button>
            <button type="button" onClick={() => setShowForm(false)}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2.5 rounded-lg">
              Cancel
            </button>
          </form>
          <p className="text-xs text-gray-400 mt-3">
            📌 Account will be activated after admin review (usually within 1 business day)
          </p>
        </div>
      )}

      {accounts.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border p-12 text-center">
          <div className="text-5xl mb-4">💳</div>
          <p className="text-gray-500 text-lg">No accounts yet</p>
          <p className="text-gray-400 text-sm mt-1">Click "Open New Account" to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {accounts.map(acc => (
            <div key={acc.id} className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl p-6 text-white shadow-lg">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <p className="text-blue-200 text-sm uppercase font-semibold">{acc.account_type} Account</p>
                  <p className="font-mono text-lg mt-1 tracking-widest">{acc.account_number}</p>
                </div>
                <Badge status={acc.status} />
              </div>
              <div>
                <p className="text-blue-200 text-sm">Available Balance</p>
                <p className="text-3xl font-bold mt-1">
                  ${Number(acc.balance).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <p className="text-blue-300 text-xs mt-4">
                Opened {new Date(acc.created_at).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Accounts;
