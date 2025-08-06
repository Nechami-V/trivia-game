import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { 
  Home, 
  GamepadIcon, 
  Users, 
  BarChart3, 
  Settings, 
  LogOut,
  User,
  Bell,
  Search,
  Menu,
  X
} from 'lucide-react';
import './AdminHeader.css';

const AdminHeader = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, admin } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = React.useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { path: '/admin', label: 'דשבורד', icon: Home },
    { path: '/admin/games', label: 'משחקים', icon: GamepadIcon },
    { path: '/admin/users', label: 'משתמשים', icon: Users },
    { path: '/admin/analytics', label: 'סטטיסטיקות', icon: BarChart3 },
    { path: '/admin/settings', label: 'הגדרות', icon: Settings }
  ];

  const isActiveRoute = (path) => {
    if (path === '/admin') {
      return location.pathname === '/admin';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <header className="admin-header">
      <div className="header-container">
        {/* Logo & Brand */}
        <div className="header-brand">
          <Link to="/admin" className="brand-link">
            <div className="brand-icon">🎮</div>
            <div className="brand-text">
              <h1 className="brand-title">פלטפורמת טריוויה</h1>
              <span className="brand-subtitle">פאנל ניהול</span>
            </div>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="desktop-nav">
          <ul className="nav-list">
            {navItems.map((item) => {
              const IconComponent = item.icon;
              return (
                <li key={item.path}>
                  <Link 
                    to={item.path}
                    className={`nav-link ${isActiveRoute(item.path) ? 'active' : ''}`}
                  >
                    <IconComponent size={18} />
                    <span>{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Header Actions */}
        <div className="header-actions">
          {/* Search */}
          <div className="search-box">
            <Search size={16} />
            <input 
              type="text" 
              placeholder="חיפוש כללי..."
              className="search-input"
            />
          </div>

          {/* Notifications */}
          <button className="action-btn notification-btn">
            <Bell size={18} />
            <span className="notification-badge">3</span>
          </button>

          {/* Profile Menu */}
          <div className="profile-menu">
            <button 
              className="profile-btn"
              onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
            >
              <div className="profile-avatar">
                {admin?.name?.charAt(0).toUpperCase() || 'A'}
              </div>
              <div className="profile-info">
                <span className="profile-name">{admin?.name || 'מנהל'}</span>
                <span className="profile-role">מנהל מערכת</span>
              </div>
            </button>

            {isProfileMenuOpen && (
              <div className="profile-dropdown">
                <div className="dropdown-header">
                  <div className="user-info">
                    <div className="user-avatar">
                      {admin?.name?.charAt(0).toUpperCase() || 'A'}
                    </div>
                    <div>
                      <div className="user-name">{admin?.name || 'מנהל'}</div>
                      <div className="user-email">{admin?.email || 'admin@example.com'}</div>
                    </div>
                  </div>
                </div>
                <div className="dropdown-divider"></div>
                <ul className="dropdown-menu">
                  <li>
                    <Link to="/admin/profile" className="dropdown-link">
                      <User size={16} />
                      פרופיל אישי
                    </Link>
                  </li>
                  <li>
                    <Link to="/admin/settings" className="dropdown-link">
                      <Settings size={16} />
                      הגדרות
                    </Link>
                  </li>
                  <li>
                    <button onClick={handleLogout} className="dropdown-link logout-btn">
                      <LogOut size={16} />
                      התנתקות
                    </button>
                  </li>
                </ul>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button 
            className="mobile-menu-toggle"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <div className="mobile-nav">
          <ul className="mobile-nav-list">
            {navItems.map((item) => {
              const IconComponent = item.icon;
              return (
                <li key={item.path}>
                  <Link 
                    to={item.path}
                    className={`mobile-nav-link ${isActiveRoute(item.path) ? 'active' : ''}`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <IconComponent size={20} />
                    <span>{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
          
          <div className="mobile-nav-footer">
            <button onClick={handleLogout} className="mobile-logout-btn">
              <LogOut size={18} />
              התנתקות
            </button>
          </div>
        </div>
      )}

      {/* Overlay for closing menus */}
      {(isProfileMenuOpen || isMobileMenuOpen) && (
        <div 
          className="menu-overlay"
          onClick={() => {
            setIsProfileMenuOpen(false);
            setIsMobileMenuOpen(false);
          }}
        />
      )}
    </header>
  );
};

export default AdminHeader;
