import { useNavigate, useLocation } from 'react-router-dom';
import './Sidebar.css';

const menuItems = [
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
        <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
      </svg>
    ),
    label: 'Home',
    path: '/'
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
        <path d="M10 8v8l5-4-5-4zm9-5H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14z"/>
      </svg>
    ),
    label: 'Trending',
    path: '/?search=trending'
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
        <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
      </svg>
    ),
    label: 'Music',
    path: '/?search=music'
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
        <path d="M21 6H3c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-10 7H8v3H6v-3H3v-2h3V8h2v3h3v2zm4.5 2c-.83 0-1.5-.67-1.5-1.5v-3c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5v3c0 .83-.67 1.5-1.5 1.5zm4-1.5c0 .83-.67 1.5-1.5 1.5s-1.5-.67-1.5-1.5v-3c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5v3z"/>
      </svg>
    ),
    label: 'Gaming',
    path: '/?search=gaming'
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
        <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 14l-5-5 1.41-1.41L12 14.17l7.59-7.59L21 8l-9 9z"/>
      </svg>
    ),
    label: 'Education',
    path: '/?search=education'
  }
];

export default function Sidebar({ isOpen }) {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <aside className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
      {menuItems.map((item) => (
        <button
          key={item.label}
          className={`sidebar-item ${location.pathname + location.search === item.path ? 'active' : ''}`}
          onClick={() => navigate(item.path)}
        >
          <span className="sidebar-icon">{item.icon}</span>
          {isOpen && <span className="sidebar-label">{item.label}</span>}
        </button>
      ))}

      {isOpen && (
        <div className="sidebar-section">
          <p className="sidebar-section-title">Categories</p>
          {['Technology', 'Science', 'Sports', 'News', 'Cooking'].map(cat => (
            <button
              key={cat}
              className="sidebar-item"
              onClick={() => navigate(`/?search=${cat.toLowerCase()}`)}
            >
              <span className="sidebar-dot">•</span>
              <span className="sidebar-label">{cat}</span>
            </button>
          ))}
        </div>
      )}
    </aside>
  );
}
