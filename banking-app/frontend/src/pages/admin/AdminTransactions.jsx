import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import Badge from '../../components/common/Badge';

const AdminTransactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionModal, setActionModal] = useState(null); // { txn, action }
  const [adminNote, setAdminNote] = useState('');
  const [processing, setProcessing] = useState(false);

  const fetchTransactions = (p = 1, status = '') => {
    setLoading(true);
    api.get(`/admin/transactions?page=${p}&status=${status}`)
      .then(res => {
        setTransactions(res.data.transactions);
        setTotal(res.data.total);
        setPages(res.data.pages);
        setPage(p);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchTransactions(); }, []);

  const handleFilterChange = (s) => {
    setStatusFilter(s);
    fetchTransactions(1, s);
  };

  const handleAction = async () => {
    if (!actionModal) return;
    setProcessing(true);
    try {
      await api.put(`/admin/transactions/${actionModal.txn.id}/approve`, {
        action: actionModal.action,
        admin_note: adminNote
      });
      setActionModal(null);
      setAdminNote('');
      fetchTransactions(page, statusFilter);
    } catch (err) {
      alert(err.response?.data?.error || 'Action failed');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Transactions</h1>
          <p className="text-gray-500 mt-1">{total} total transactions</p>
        </div>
        <div className="flex gap-2">
          {['', 'pending', 'approved', 'rejected'].map(s => (
            <button key={s} onClick={() => handleFilterChange(s)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium capitalize ${statusFilter === s ? 'bg-blue-600 text-white' : 'bg-white border text-gray-600 hover:bg-gray-50'}`}>
              {s || 'All'}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        {loading ? (
          <div className="p-12 text-center"><div className="animate-spin h-8 w-8 border-b-2 border-blue-600 rounded-full mx-auto"></div></div>
        ) : transactions.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <div className="text-4xl mb-2">📋</div>
            <p>No transactions found</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
              <tr>
                <th className="px-4 py-3 text-left">ID</th>
                <th className="px-4 py-3 text-left">Type</th>
                <th className="px-4 py-3 text-left">From</th>
                <th className="px-4 py-3 text-left">To</th>
                <th className="px-4 py-3 text-right">Amount</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3 text-left">Date</th>
                <th className="px-4 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {transactions.map(txn => (
                <tr key={txn.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-400">#{txn.id}</td>
                  <td className="px-4 py-3"><Badge status={txn.transaction_type} /></td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-600">{txn.from_account_number || '—'}</td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-600">{txn.to_account_number || '—'}</td>
                  <td className="px-4 py-3 text-right font-bold text-gray-800">${Number(txn.amount).toFixed(2)}</td>
                  <td className="px-4 py-3 text-center"><Badge status={txn.status} /></td>
                  <td className="px-4 py-3 text-xs text-gray-500">{new Date(txn.created_at).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-center">
                    {txn.status === 'pending' ? (
                      <div className="flex justify-center gap-2">
                        <button onClick={() => setActionModal({ txn, action: 'approve' })}
                          className="bg-green-50 text-green-700 border border-green-200 text-xs px-2 py-1 rounded hover:bg-green-100">
                          ✅ Approve
                        </button>
                        <button onClick={() => setActionModal({ txn, action: 'reject' })}
                          className="bg-red-50 text-red-700 border border-red-200 text-xs px-2 py-1 rounded hover:bg-red-100">
                          ❌ Reject
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400">{txn.admin_note ? `Note: ${txn.admin_note.slice(0, 20)}...` : 'Processed'}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {pages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          {Array.from({ length: pages }, (_, i) => i + 1).map(p => (
            <button key={p} onClick={() => fetchTransactions(p, statusFilter)}
              className={`w-8 h-8 rounded-lg text-sm ${page === p ? 'bg-blue-600 text-white' : 'bg-white border text-gray-600'}`}>{p}</button>
          ))}
        </div>
      )}

      {/* Action Modal */}
      {actionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold mb-2 capitalize">
              {actionModal.action === 'approve' ? '✅ Approve' : '❌ Reject'} Transaction
            </h2>
            <div className="bg-gray-50 rounded-lg p-4 mb-4 text-sm">
              <div className="flex justify-between mb-1">
                <span className="text-gray-500">Type:</span>
                <Badge status={actionModal.txn.transaction_type} />
              </div>
              <div className="flex justify-between mb-1">
                <span className="text-gray-500">Amount:</span>
                <span className="font-bold">${Number(actionModal.txn.amount).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Date:</span>
                <span>{new Date(actionModal.txn.created_at).toLocaleDateString()}</span>
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Admin Note (optional)</label>
              <textarea value={adminNote} onChange={e => setAdminNote(e.target.value)} rows={3}
                className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Add a note for the user..." />
            </div>
            <div className="flex gap-3">
              <button onClick={handleAction} disabled={processing}
                className={`flex-1 py-2 rounded-lg font-semibold text-white ${actionModal.action === 'approve' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'} disabled:opacity-50`}>
                {processing ? 'Processing...' : `Confirm ${actionModal.action}`}
              </button>
              <button onClick={() => { setActionModal(null); setAdminNote(''); }}
                className="flex-1 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTransactions;
