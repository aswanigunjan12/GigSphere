import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './AuthPages.css';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    const result = login(email, password);
    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.error || 'Login failed. Please try again.');
    }
  };

  const quickLogin = (em) => {
    const result = login(em, 'password123');
    if (result.success) navigate('/dashboard');
    else setError(result.error || 'Quick login failed.');
  };

  return (
    <div className="auth-page">
      <div className="auth-card animate-fade-in-up">
        <h1 className="auth-title">Welcome Back</h1>
        <p className="auth-subtitle">Log in to your GigSphere account</p>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="form-input" placeholder="you@example.com" />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="form-input" placeholder="Enter your password" />
          </div>
          <button type="submit" className="btn btn-primary btn-lg auth-submit">Log In</button>
        </form>

        <div className="quick-login">
          <p className="quick-login-title">Quick Demo Login</p>
          <div className="quick-login-btns">
            <button onClick={() => quickLogin('alex@example.com')} className="btn btn-sm btn-outline-white">🧑‍💻 Student (Alex)</button>
            <button onClick={() => quickLogin('techstart@example.com')} className="btn btn-sm btn-outline-white">🏢 Business (TechStart)</button>
          </div>
        </div>

        <p className="auth-footer-text">Don't have an account? <Link to="/signup" className="auth-link">Sign Up</Link></p>
      </div>
    </div>
  );
}
