import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

export default function Navbar({ onMenuClick }) {
  const [search, setSearch] = useState('');
  const [showLogin, setShowLogin] = useState(false);
  const [username, setUsername] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { user, login, logout } = useAuth();
  const navigate = useNavigate();
  const menuRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/?search=${encodeURIComponent(search.trim())}`);
    } else {
      navigate('/');
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!username.trim()) return;
    await login(username.trim());
    setShowLogin(false);
    setUsername('');
  };

  return (
    <header className="navbar">
      <div className="navbar-left">
        <button className="menu-btn" onClick={onMenuClick} aria-label="Toggle sidebar">
          <span className="hamburger">
            <span></span><span></span><span></span>
          </span>
        </button>
        <a href="/" className="logo">
          <svg viewBox="0 0 90 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="logo-svg">
            <rect x="0" y="0" width="28" height="20" rx="4" fill="#FF0000"/>
            <polygon points="11,5 22,10 11,15" fill="white"/>
            <text x="32" y="15" fontFamily="Inter,sans-serif" fontWeight="700" fontSize="14" fill="#f1f1f1">ViewTube</text>
          </svg>
        </a>
      </div>

      <div className="navbar-center">
        <form onSubmit={handleSearch} className="search-form">
          <input
            type="text"
            className="search-input"
            placeholder="Search"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <button type="submit" className="search-btn" aria-label="Search">
            <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
              <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
            </svg>
          </button>
        </form>
      </div>

      <div className="navbar-right">
        <a href="/upload" className="upload-btn">
          <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
            <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/>
          </svg>
          <span>Upload</span>
        </a>

        {user ? (
          <div className="user-menu-wrap" ref={menuRef}>
            <button className="avatar-btn" onClick={() => setShowUserMenu(p => !p)}>
              <img src={user.avatar} alt={user.username} className="avatar-img" />
            </button>
            {showUserMenu && (
              <div className="user-dropdown">
                <div className="user-dropdown-header">
                  <img src={user.avatar} alt={user.username} className="avatar-img-lg" />
                  <span className="user-dropdown-name">{user.username}</span>
                </div>
                <a
                  href={`/channel/${encodeURIComponent(user.username)}`}
                  className="user-dropdown-item"
                  onClick={() => setShowUserMenu(false)}
                >
                  My Channel
                </a>
                <button className="user-dropdown-item logout" onClick={() => { logout(); setShowUserMenu(false); }}>
                  Sign Out
                </button>
              </div>
            )}
          </div>
        ) : (
          <button className="sign-in-btn" onClick={() => setShowLogin(true)}>
            <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
            </svg>
            Sign In
          </button>
        )}
      </div>

      {showLogin && (
        <div className="modal-overlay" onClick={() => setShowLogin(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2 className="modal-title">Sign In</h2>
            <p className="modal-sub">Enter a username to continue</p>
            <form onSubmit={handleLogin} className="modal-form">
              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={e => setUsername(e.target.value)}
                className="modal-input"
                autoFocus
              />
              <button type="submit" className="modal-btn">Continue</button>
            </form>
            <button className="modal-close" onClick={() => setShowLogin(false)}>✕</button>
          </div>
        </div>
      )}
    </header>
  );
}
