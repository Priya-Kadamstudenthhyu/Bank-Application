import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../api/axios';
import Badge from '../../components/common/Badge';

const AdminUserDetail = () => {
  const { userId } = useParams();
  const [user, setUser] = useState(null);
  const [signature, setSignature] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get(`/admin/users/${userId}`),
      api.get(`/admin/users/${userId}/signature`)
    ]).then(([userRes, sigRes]) => {
      setUser(userRes.data.user);
      setSignature(sigRes.data.signature);
    }).finally(() => setLoading(false));
  }, [userId]);

  const toggleStatus = async () => {
    await api.put(`/admin/users/${userId}/toggle-status`);
    const res = await api.get(`/admin/users/${userId}`);
    setUser(res.data.user);
  };

  if (loading) return <div className="flex justify-center mt-20"><div className="animate-spin h-10 w-10 border-b-2 border-blue-600 rounded-full"></div></div>;
  if (!user) return <div className="text-center mt-20 text-gray-500">User not found</div>;

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="flex items-center gap-4 mb-8">
        <Link to="/admin/users" className="text-blue-600 hover:underline text-sm">← Back to Users</Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User Info */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex flex-col items-center text-center mb-6">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-3xl font-bold mb-3">
              {user.full_name?.[0]?.toUpperCase()}
            </div>
            <h2 className="text-xl font-bold text-gray-800">{user.full_name}</h2>
            <p className="text-gray-500 text-sm mt-1">{user.email}</p>
            <div className="mt-2 flex gap-2">
              <Badge status={user.is_active ? 'active' : 'closed'} />
              <Badge status={user.role} />
            </div>
          </div>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Phone</span>
              <span className="font-medium">{user.phone || '—'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Address</span>
              <span className="font-medium text-right max-w-32">{user.address || '—'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Member Since</span>
              <span className="font-medium">{new Date(user.created_at).toLocaleDateString()}</span>
            </div>
          </div>
          <button onClick={toggleStatus}
            className={`w-full mt-6 py-2 rounded-lg text-sm font-semibold ${user.is_active ? 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200' : 'bg-green-50 text-green-600 hover:bg-green-100 border border-green-200'}`}>
            {user.is_active ? '🚫 Block User' : '✅ Activate User'}
          </button>
        </div>

        <div className="lg:col-span-2 space-y-6">
          {/* Accounts */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h3 className="font-semibold text-gray-800 mb-4">Bank Accounts ({user.accounts?.length})</h3>
            {user.accounts?.length === 0 ? (
              <p className="text-gray-400 text-sm">No accounts opened</p>
            ) : (
              <div className="space-y-3">
                {user.accounts.map(acc => (
                  <div key={acc.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-mono text-sm font-medium">{acc.account_number}</p>
                      <p className="text-xs text-gray-500 capitalize">{acc.account_type}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-800">${Number(acc.balance).toFixed(2)}</p>
                      <Badge status={acc.status} />
                    </div>
                    {acc.status === 'pending' && (
                      <button
                        onClick={() => api.put(`/admin/accounts/${acc.id}/activate`).then(() => window.location.reload())}
                        className="ml-3 text-xs bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700">
                        Activate
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Digital Signature */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h3 className="font-semibold text-gray-800 mb-4">Digital Signature</h3>
            {signature ? (
              <div>
                <img src={signature.signature_data} alt="User Signature" className="border rounded-lg max-w-xs" />
                <p className="text-xs text-gray-400 mt-2">
                  Type: {signature.signature_type} | Saved: {new Date(signature.created_at).toLocaleDateString()}
                </p>
              </div>
            ) : (
              <p className="text-gray-400 text-sm">No signature uploaded</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminUserDetail;
