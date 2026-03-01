import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import Badge from '../../components/common/Badge';

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ transaction_type: 'deposit', from_account_id: '', to_account_number: '', amount: '', description: '' });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });

  const fetchAll = () => {
    api.get('/user/transactions').then(res => setTransactions(res.data.transactions));
    api.get('/user/accounts').then(res => setAccounts(res.data.accounts.filter(a => a.status === 'active')));
  };

  useEffect(() => { fetchAll(); }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/user/transactions', {
        transaction_type: form.transaction_type,
        from_account_id: form.from_account_id ? parseInt(form.from_account_id) : null,
        to_account_number: form.to_account_number || undefined,
        amount: parseFloat(form.amount),
        description: form.description
      });
      setMsg({ type: 'success', text: 'Transaction submitted for admin approval!' });
      setShowForm(false);
      setForm({ transaction_type: 'deposit', from_account_id: '', to_account_number: '', amount: '', description: '' });
      fetchAll();
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.error || 'Transaction failed' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Transactions</h1>
          <p className="text-gray-500 mt-1">Submit and track your transactions</p>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-semibold transition-colors">
          + New Transaction
        </button>
      </div>

      {msg.text && (
        <div className={`mb-6 p-3 rounded-lg text-sm ${msg.type === 'success' ? 'bg-green-50 border border-green-200 text-green-700' : 'bg-red-50 border border-red-200 text-red-700'}`}>
          {msg.text}
        </div>
      )}

      {showForm && (
        <div className="bg-white border rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">New Transaction</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Transaction Type</label>
              <select name="transaction_type" value={form.transaction_type} onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="deposit">Deposit</option>
                <option value="withdrawal">Withdrawal</option>
                <option value="transfer">Transfer</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Amount ($)</label>
              <input type="number" name="amount" value={form.amount} onChange={handleChange} required min="0.01" step="0.01"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0.00" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {form.transaction_type === 'deposit' ? 'To Account' : 'From Account'}
              </label>
              <select name="from_account_id" value={form.from_account_id} onChange={handleChange} required
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Select Account</option>
                {accounts.map(acc => (
                  <option key={acc.id} value={acc.id}>
                    {acc.account_number} ({acc.account_type}) - ${Number(acc.balance).toFixed(2)}
                  </option>
                ))}
              </select>
            </div>
            {form.transaction_type === 'transfer' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">To Account Number</label>
                <input name="to_account_number" value={form.to_account_number} onChange={handleChange} required
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="ACC123456789" />
              </div>
            )}
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description (optional)</label>
              <input name="description" value={form.description} onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Purpose of transaction" />
            </div>
            <div className="col-span-2 flex gap-3">
              <button type="submit" disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-semibold transition-colors disabled:opacity-50">
                {loading ? 'Submitting...' : 'Submit Transaction'}
              </button>
              <button type="button" onClick={() => setShowForm(false)}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2.5 rounded-lg">Cancel</button>
            </div>
          </form>
          <p className="text-xs text-gray-400 mt-3">📌 Transactions require admin approval before processing</p>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border">
        <div className="p-5 border-b">
          <h2 className="font-semibold text-gray-800">Transaction History</h2>
        </div>
        {transactions.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <div className="text-4xl mb-2">📋</div>
            <p>No transactions yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                <tr>
                  <th className="px-4 py-3 text-left">Type</th>
                  <th className="px-4 py-3 text-left">From</th>
                  <th className="px-4 py-3 text-left">To</th>
                  <th className="px-4 py-3 text-right">Amount</th>
                  <th className="px-4 py-3 text-center">Status</th>
                  <th className="px-4 py-3 text-left">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {transactions.map(txn => (
                  <tr key={txn.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span>{txn.transaction_type === 'deposit' ? '⬇️' : txn.transaction_type === 'withdrawal' ? '⬆️' : '↔️'}</span>
                        <Badge status={txn.transaction_type} />
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 font-mono">{txn.from_account_number || '—'}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 font-mono">{txn.to_account_number || '—'}</td>
                    <td className="px-4 py-3 text-right font-bold text-gray-800">${Number(txn.amount).toFixed(2)}</td>
                    <td className="px-4 py-3 text-center"><Badge status={txn.status} /></td>
                    <td className="px-4 py-3 text-sm text-gray-500">{new Date(txn.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Transactions;
