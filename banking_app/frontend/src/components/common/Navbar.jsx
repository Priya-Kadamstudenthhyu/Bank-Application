import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const userLinks = [
    { to: '/dashboard', label: '🏠 Dashboard' },
    { to: '/accounts', label: '💳 Accounts' },
    { to: '/transactions', label: '💸 Transactions' },
    { to: '/profile', label: '👤 Profile' },
    { to: '/signature', label: '✍️ Signature' },
  ];

  const adminLinks = [
    { to: '/admin', label: '📊 Dashboard' },
    { to: '/admin/users', label: '👥 Users' },
    { to: '/admin/accounts', label: '💳 Accounts' },
    { to: '/admin/transactions', label: '💸 Transactions' },
  ];

  const links = user?.role === 'admin' ? adminLinks : userLinks;

  return (
    <nav className="bg-gradient-to-r from-blue-800 to-blue-600 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <Link to={user?.role === 'admin' ? '/admin' : '/dashboard'} className="font-bold text-xl">
              🏦 SmartBank
            </Link>
            <div className="hidden md:flex gap-1">
              {links.map(link => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    location.pathname === link.to
                      ? 'bg-white text-blue-800'
                      : 'hover:bg-blue-700'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="hidden md:block text-sm opacity-80">
              {user?.full_name}
              <span className="ml-2 text-xs bg-blue-500 px-2 py-0.5 rounded-full uppercase">
                {user?.role}
              </span>
            </span>
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 px-4 py-1.5 rounded-md text-sm font-medium transition-colors"
            >
              Logout
            </button>
            <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden">
              ☰
            </button>
          </div>
        </div>
        {mobileOpen && (
          <div className="md:hidden pb-4 space-y-1">
            {links.map(link => (
              <Link
                key={link.to}
                to={link.to}
                className="block px-3 py-2 rounded-md text-sm hover:bg-blue-700"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
