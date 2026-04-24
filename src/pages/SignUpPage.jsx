import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import TagInput from '../components/TagInput';
import './AuthPages.css';

export default function SignUpPage() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [role, setRole] = useState('student');
  const [form, setForm] = useState({ name: '', email: '', password: '', skills: [], availability: '', location: '', industry: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    if (!form.name || !form.email || !form.password) {
      setError('Please fill in all required fields');
      return;
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    const userData = { ...form, role, avatar: role === 'student' ? '🧑\u200d💻' : '🏢' };
    const result = signup(userData);
    if (result.success) {
      setSuccess(true);
      setTimeout(() => navigate('/dashboard'), 1200);
    } else {
      setError(result.error || 'Signup failed. Please try again.');
    }
  };

  if (success) {
    return (
      <div className="auth-page">
        <div className="auth-card animate-fade-in-up">
          <div className="auth-success">
            <span className="auth-success-icon">✅</span>
            <h2>Account Created!</h2>
            <p>Taking you to your dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-card animate-fade-in-up">
        <h1 className="auth-title">Join GigSphere</h1>
        <p className="auth-subtitle">Create your account and start connecting</p>

        <div className="role-toggle">
          <button className={`role-btn ${role === 'student' ? 'active' : ''}`} onClick={() => setRole('student')}>🧑‍💻 Student</button>
          <button className={`role-btn ${role === 'business' ? 'active' : ''}`} onClick={() => setRole('business')}>🏢 Business</button>
        </div>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">{role === 'student' ? 'Full Name' : 'Business Name'}</label>
            <input name="name" value={form.name} onChange={handleChange} className="form-input" placeholder={role === 'student' ? 'Alex Rivera' : 'TechStart Inc.'} />
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input name="email" type="email" value={form.email} onChange={handleChange} className="form-input" placeholder="you@example.com" />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input name="password" type="password" value={form.password} onChange={handleChange} className="form-input" placeholder="Min 6 characters" />
          </div>

          {role === 'student' && (
            <>
              <div className="form-group">
                <label className="form-label">Skills</label>
                <TagInput tags={form.skills} onChange={(skills) => setForm({ ...form, skills })} />
              </div>
              <div className="form-group">
                <label className="form-label">Availability</label>
                <select name="availability" value={form.availability} onChange={handleChange} className="form-input">
                  <option value="">Select availability</option>
                  <option value="Weekends">Weekends</option>
                  <option value="Evenings">Evenings</option>
                  <option value="Weekends & Evenings">Weekends & Evenings</option>
                  <option value="Flexible">Flexible</option>
                </select>
              </div>
            </>
          )}

          {role === 'business' && (
            <div className="form-group">
              <label className="form-label">Industry</label>
              <select name="industry" value={form.industry} onChange={handleChange} className="form-input">
                <option value="">Select industry</option>
                <option value="Technology">Technology</option>
                <option value="Events & Hospitality">Events & Hospitality</option>
                <option value="Retail">Retail</option>
                <option value="Food & Beverage">Food & Beverage</option>
                <option value="Education">Education</option>
                <option value="Other">Other</option>
              </select>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Location</label>
            <input name="location" value={form.location} onChange={handleChange} className="form-input" placeholder="Bhopal, India" />
          </div>

          <button type="submit" className="btn btn-primary btn-lg auth-submit">Create Account</button>
        </form>

        <p className="auth-footer-text">Already have an account? <Link to="/login" className="auth-link">Log In</Link></p>
      </div>
    </div>
  );
}
