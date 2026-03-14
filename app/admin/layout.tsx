'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect, createContext, useContext, useCallback } from 'react';
import React from 'react';

const AuthContext = createContext<{ authenticated: boolean; logout: () => void }>({
  authenticated: false,
  logout: () => {},
});

export function useAdminAuth() {
  return useContext(AuthContext);
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [authenticated, setAuthenticated] = useState(false);
  const [checking, setChecking] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const isLoginPage = pathname === '/admin/login';

  useEffect(() => {
    // Check auth by trying to hit an admin API
    fetch('/api/admin/bursaries', { credentials: 'include' })
      .then(r => {
        if (r.ok) setAuthenticated(true);
        else if (!isLoginPage) router.push('/admin/login');
      })
      .catch(() => { if (!isLoginPage) router.push('/admin/login'); })
      .finally(() => setChecking(false));
  }, [isLoginPage, router]);

  const logout = useCallback(async () => {
    await fetch('/api/admin/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'logout' }),
      credentials: 'include',
    });
    setAuthenticated(false);
    router.push('/admin/login');
  }, [router]);

  if (checking) {
    return (
      <html lang="en">
        <body style={{ margin: 0, fontFamily: 'system-ui, -apple-system, sans-serif', background: '#0f172a' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', color: '#94a3b8' }}>
            Loading...
          </div>
        </body>
      </html>
    );
  }

  if (isLoginPage) {
    return (
      <html lang="en">
        <head><title>Cherry Admin - Login</title></head>
        <body style={{ margin: 0, fontFamily: 'system-ui, -apple-system, sans-serif', background: '#0f172a' }}>
          <AuthContext.Provider value={{ authenticated, logout }}>
            {children}
          </AuthContext.Provider>
        </body>
      </html>
    );
  }

  if (!authenticated) return null;

  const navItems = [
    { href: '/admin', label: 'Dashboard', icon: '📊' },
    { href: '/admin/bursaries', label: 'Bursaries', icon: '🎓' },
    { href: '/admin/bursaries/new', label: 'New Bursary', icon: '➕' },
    { href: '/admin/colleges', label: 'Colleges', icon: '🏫' },
    { href: '/admin/colleges/new', label: 'New College', icon: '➕' },
  ];

  return (
    <html lang="en">
      <head><title>Cherry Admin Panel</title></head>
      <body style={{ margin: 0, fontFamily: 'system-ui, -apple-system, sans-serif', background: '#0f172a', color: '#e2e8f0' }}>
        <AuthContext.Provider value={{ authenticated, logout }}>
          <div style={{ display: 'flex', minHeight: '100vh' }}>
            {/* Sidebar */}
            <aside style={{
              width: sidebarOpen ? 240 : 60,
              background: '#1e293b',
              borderRight: '1px solid #334155',
              transition: 'width 0.2s',
              flexShrink: 0,
              display: 'flex',
              flexDirection: 'column',
            }}>
              {/* Header */}
              <div style={{
                padding: sidebarOpen ? '20px 16px' : '20px 10px',
                borderBottom: '1px solid #334155',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}>
                {sidebarOpen && (
                  <span style={{ fontSize: 18, fontWeight: 700, color: '#c084fc' }}>
                    Cherry Admin
                  </span>
                )}
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  style={{
                    background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer',
                    fontSize: 18, padding: 4,
                  }}
                >
                  {sidebarOpen ? '◀' : '▶'}
                </button>
              </div>

              {/* Nav */}
              <nav style={{ flex: 1, padding: '8px 0' }}>
                {navItems.map(item => {
                  const active = pathname === item.href;
                  return (
                    <a
                      key={item.href}
                      href={item.href}
                      onClick={(e) => { e.preventDefault(); router.push(item.href); }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                        padding: sidebarOpen ? '10px 16px' : '10px 18px',
                        textDecoration: 'none',
                        color: active ? '#c084fc' : '#94a3b8',
                        background: active ? '#334155' : 'transparent',
                        borderLeft: active ? '3px solid #c084fc' : '3px solid transparent',
                        fontSize: 14,
                        fontWeight: active ? 600 : 400,
                        transition: 'all 0.15s',
                      }}
                    >
                      <span style={{ fontSize: 18 }}>{item.icon}</span>
                      {sidebarOpen && <span>{item.label}</span>}
                    </a>
                  );
                })}
              </nav>

              {/* Logout */}
              <div style={{ padding: '12px 8px', borderTop: '1px solid #334155' }}>
                <button
                  onClick={logout}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    background: '#7f1d1d',
                    color: '#fecaca',
                    border: 'none',
                    borderRadius: 6,
                    cursor: 'pointer',
                    fontSize: 13,
                  }}
                >
                  {sidebarOpen ? 'Logout' : '🚪'}
                </button>
              </div>
            </aside>

            {/* Main Content */}
            <main style={{ flex: 1, overflow: 'auto', padding: '24px 32px' }}>
              {children}
            </main>
          </div>
        </AuthContext.Provider>
      </body>
    </html>
  );
}
