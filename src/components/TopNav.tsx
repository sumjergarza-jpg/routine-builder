import { useContext } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { NavContext } from '../context/NavContext';

function IconPlay() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" stroke="none">
      <polygon points="6 3 20 12 6 21 6 3" />
    </svg>
  );
}

function IconArrowLeft() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="19" y1="12" x2="5" y2="12" />
      <polyline points="12 19 5 12 12 5" />
    </svg>
  );
}

function IconUser() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

export function TopNav() {
  const { title } = useContext(NavContext);
  const location = useLocation();
  const navigate = useNavigate();

  const isDashboard = location.pathname === '/';

  const handleBack = () => {
    // Go back if there's history; otherwise fall back to dashboard
    if (window.history.length > 2) {
      navigate(-1);
    } else {
      navigate('/');
    }
  };

  return (
    <header className="top-nav">
      {/* Left: back arrow (non-dashboard) + brand */}
      <div className="top-nav-left">
        {!isDashboard && (
          <button
            className="top-nav-back"
            onClick={handleBack}
            aria-label="Go back"
          >
            <IconArrowLeft />
          </button>
        )}
        <Link to="/" className="top-nav-brand">
          <div className="top-nav-logo">
            <IconPlay />
          </div>
          <span className="top-nav-brand-name">Align Pilates</span>
        </Link>
      </div>

      {/* Center: page title */}
      <div className="top-nav-center">
        <span className="top-nav-title">{title}</span>
      </div>

      {/* Right: profile placeholder — future account hub */}
      <div className="top-nav-right">
        <button
          className="top-nav-profile"
          aria-label="Account"
          title="Account settings (coming soon)"
        >
          <IconUser />
        </button>
      </div>
    </header>
  );
}
