import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMenuOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="navbar-inner container">
        <Link to="/" className="navbar-brand">
          <img src="/logo.png" alt="GigSphere" className="navbar-logo-img" />
          <span className="navbar-brand-text">
            Gig<span className="brand-highlight">Sphere</span>
          </span>
        </Link>

        <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">
          <span className={`hamburger-line ${menuOpen ? 'open' : ''}`}></span>
          <span className={`hamburger-line ${menuOpen ? 'open' : ''}`}></span>
          <span className={`hamburger-line ${menuOpen ? 'open' : ''}`}></span>
        </button>

        <div className={`navbar-links ${menuOpen ? 'active' : ''}`}>
          {!user ? (
            <>
              <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`} onClick={() => setMenuOpen(false)}>Home</Link>
              <Link to="/signup" className={`nav-link`} onClick={() => setMenuOpen(false)}>For Talent</Link>
              <Link to="/signup" className={`nav-link`} onClick={() => setMenuOpen(false)}>For Business</Link>
              <div className="nav-auth">
                <Link to="/login" className="nav-link" onClick={() => setMenuOpen(false)}>Log In</Link>
                <Link to="/signup" className="btn btn-gold btn-sm nav-signup-btn" onClick={() => setMenuOpen(false)}>Sign Up</Link>
              </div>
            </>
          ) : (
            <>
              <Link to="/dashboard" className={`nav-link ${location.pathname === '/dashboard' ? 'active' : ''}`} onClick={() => setMenuOpen(false)}>Dashboard</Link>
              <Link to="/gigs" className={`nav-link ${location.pathname.startsWith('/gigs') ? 'active' : ''}`} onClick={() => setMenuOpen(false)}>Browse Gigs</Link>
              {user.role === 'business' && (
                <Link to="/post-gig" className={`nav-link ${location.pathname === '/post-gig' ? 'active' : ''}`} onClick={() => setMenuOpen(false)}>Post a Gig</Link>
              )}
              <Link to="/payments" className={`nav-link ${location.pathname === '/payments' ? 'active' : ''}`} onClick={() => setMenuOpen(false)}>Payments</Link>
              <Link to="/profile" className={`nav-link ${location.pathname === '/profile' ? 'active' : ''}`} onClick={() => setMenuOpen(false)}>Profile</Link>
              <div className="nav-auth">
                <span className="nav-user-info">{user.avatar} {user.name}</span>
                <button onClick={handleLogout} className="btn btn-sm btn-outline-muted">Logout</button>
              </div>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
