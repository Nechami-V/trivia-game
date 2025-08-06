import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { admin, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  
  console.log('Layout - מנהל נוכחי:', admin?.name || 'לא זמין');
  console.log('Layout - נתיב נוכחי:', location.pathname);

  const navigationItems = [
    {
      name: 'דשבורד',
      href: '/dashboard',
      icon: '📊',
      description: 'סקירה כללית וסטטיסטיקות'
    },
    {
      name: 'משחקים',
      href: '/games',
      icon: '🎮',
      description: 'ניהול משחקי טריוויה'
    },
    {
      name: 'שאלות',
      href: '/questions',
      icon: '❓',
      description: 'ניהול שאלות טריוויה'
    },
    {
      name: 'משתמשים',
      href: '/users',
      icon: '👥',
      description: 'ניהול משתמשים'
    },
    {
      name: 'אנליטיקה',
      href: '/analytics',
      icon: '📈',
      description: 'דוחות ואנליטיקה'
    }
  ];

  const handleLogout = () => {
    console.log('Layout - מתחיל תהליך התנתקות');
    logout();
    navigate('/login');
  };

  const isCurrentPath = (path) => {
    return location.pathname === path;
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5', display: 'flex' }}>
      {/* Sidebar */}
      <div 
        className="sidebar"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '250px',
          height: '100vh',
          backgroundColor: 'white',
          boxShadow: '2px 0 5px rgba(0,0,0,0.1)',
          transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.3s ease',
          zIndex: 1000
        }}
      >
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          height: '60px', 
          padding: '0 20px',
          borderBottom: '1px solid #eee'
        }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{
              width: '32px',
              height: '32px',
              backgroundColor: '#007bff',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <span style={{ color: 'white', fontWeight: 'bold', fontSize: '18px' }}>ט</span>
            </div>
            <span style={{ marginRight: '10px', fontSize: '20px', fontWeight: 'bold', color: '#333' }}>
              ניהול טריוויה
            </span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            style={{ 
              background: 'none', 
              border: 'none', 
              fontSize: '20px', 
              cursor: 'pointer',
              color: '#666'
            }}
          >
            ×
          </button>
        </div>

        <nav style={{ padding: '20px 0' }}>
          <div style={{ padding: '0 20px', marginBottom: '15px' }}>
            <p style={{ 
              fontSize: '12px', 
              fontWeight: 'bold', 
              color: '#888', 
              textTransform: 'uppercase',
              margin: 0
            }}>
              ניווט
            </p>
          </div>
          <div>
            {navigationItems.map((item) => {
              const isActive = isCurrentPath(item.href);
              
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '10px 20px',
                    textDecoration: 'none',
                    color: isActive ? '#007bff' : '#666',
                    backgroundColor: isActive ? '#f0f8ff' : 'transparent',
                    borderRight: isActive ? '3px solid #007bff' : 'none',
                    transition: 'all 0.2s'
                  }}
                  onClick={() => setSidebarOpen(false)}
                >
                  <span style={{ marginLeft: '12px', fontSize: '18px' }}>
                    {item.icon}
                  </span>
                  <div>
                    <div style={{ fontWeight: isActive ? 'bold' : 'normal' }}>
                      {item.name}
                    </div>
                    <div style={{ fontSize: '12px', color: '#999' }}>
                      {item.description}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Admin Info & Logout */}
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          padding: '15px',
          borderTop: '1px solid #eee',
          backgroundColor: 'white'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              backgroundColor: '#ddd',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#666' }}>
                {admin?.username?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div style={{ marginRight: '12px' }}>
              <p style={{ margin: 0, fontSize: '14px', fontWeight: 'bold', color: '#333' }}>
                {admin?.username}
              </p>
              <p style={{ margin: 0, fontSize: '12px', color: '#888' }}>
                {admin?.role}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              padding: '8px 12px',
              fontSize: '14px',
              color: '#dc3545',
              backgroundColor: 'transparent',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              transition: 'background-color 0.2s'
            }}
          >
            <span style={{ marginLeft: '8px' }}>🚪</span>
            יציאה
          </button>
        </div>
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            zIndex: 999
          }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', marginRight: '250px' }}>
        {/* Header */}
        <header style={{
          backgroundColor: 'white',
          borderBottom: '1px solid #eee',
          height: '60px'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            height: '100%',
            padding: '0 20px'
          }}>
            <button
              onClick={() => setSidebarOpen(true)}
              style={{
                display: 'none', // Will show on mobile with media queries
                background: 'none',
                border: 'none',
                fontSize: '18px',
                cursor: 'pointer',
                color: '#666'
              }}
            >
              ☰
            </button>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <div style={{ fontSize: '14px', color: '#666' }}>
                התחברות אחרונה: {admin?.lastLogin ? new Date(admin.lastLogin).toLocaleString('he-IL') : 'לא זמין'}
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main style={{ flex: 1, overflow: 'auto' }}>
          <div style={{ padding: '20px' }}>
            {children}
          </div>
        </main>
      </div>

      <style jsx>{`
        @media (max-width: 768px) {
          .sidebar {
            position: fixed !important;
            z-index: 1000;
          }
          
          .main-content {
            margin-right: 0 !important;
          }
          
          .mobile-menu-btn {
            display: block !important;
          }
        }
      `}</style>
    </div>
  );
};

export default Layout;
