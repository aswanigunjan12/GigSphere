import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getData, setData } from '../utils/storage';
import TagInput from '../components/TagInput';
import './PostGig.css';

export default function PostGigPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ title: '', description: '', skills: [], pay: '', duration: '', location: '', category: 'tech', urgent: false });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title || !form.description || !form.pay) {
      setError('Please fill in all required fields'); return;
    }
    const gigs = getData('gigs') || [];
    gigs.push({
      id: 'g' + Date.now(),
      businessId: user.id,
      businessName: user.name || 'Unknown Business',
      ...form,
      status: 'open',
      postedAt: new Date().toISOString()
    });
    setData('gigs', gigs);
    setSuccess(true);
    setTimeout(() => navigate('/dashboard'), 2000);
  };

  if (success) {
    return (
      <div className="post-gig-page"><div className="container"><div className="post-gig-container">
        <div className="card" style={{ textAlign: 'center', padding: '48px' }}>
          <span style={{ fontSize: '3rem' }}>🎉</span>
          <h2 style={{ marginTop: 16 }}>Gig Posted Successfully!</h2>
          <p style={{ color: 'var(--text-muted)' }}>Redirecting to dashboard...</p>
        </div>
      </div></div></div>
    );
  }

  return (
    <div className="post-gig-page">
      <div className="container">
        <div className="post-gig-container animate-fade-in-up">
          <h1 className="post-gig-title">Post a New Gig</h1>
          <p style={{ color: 'var(--text-muted)', marginBottom: 24 }}>Find the right talent for your project</p>
          {error && <div className="auth-error">{error}</div>}
          <form onSubmit={handleSubmit} className="card">
            <div className="form-group">
              <label className="form-label">Gig Title *</label>
              <input name="title" value={form.title} onChange={handleChange} className="form-input" placeholder="e.g. React Frontend Developer" />
            </div>
            <div className="form-group">
              <label className="form-label">Description *</label>
              <textarea name="description" value={form.description} onChange={handleChange} className="form-input" rows="4" placeholder="Describe the role and responsibilities..." />
            </div>
            <div className="form-group">
              <label className="form-label">Skills Required</label>
              <TagInput tags={form.skills} onChange={(skills) => setForm({ ...form, skills })} />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Pay *</label>
                <input name="pay" value={form.pay} onChange={handleChange} className="form-input" placeholder="₹500/day" />
              </div>
              <div className="form-group">
                <label className="form-label">Duration</label>
                <input name="duration" value={form.duration} onChange={handleChange} className="form-input" placeholder="1 week" />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Location</label>
                <input name="location" value={form.location} onChange={handleChange} className="form-input" placeholder="Bhopal" />
              </div>
              <div className="form-group">
                <label className="form-label">Category</label>
                <select name="category" value={form.category} onChange={handleChange} className="form-input">
                  <option value="creative">Creative</option>
                  <option value="tech">Tech</option>
                  <option value="skilled">Skilled Trades</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>
            {/* Urgent toggle */}
            <div className="urgent-toggle-group">
              <div className="urgent-toggle-info">
                <span className="urgent-toggle-icon">🔥</span>
                <div>
                  <p className="urgent-toggle-label">Mark as Urgent</p>
                  <p className="urgent-toggle-desc">Urgent gigs get a highlighted badge and appear at the top of search results</p>
                </div>
              </div>
              <button
                type="button"
                className={`urgent-toggle-btn ${form.urgent ? 'urgent-toggle-btn--on' : ''}`}
                onClick={() => setForm({ ...form, urgent: !form.urgent })}
                aria-pressed={form.urgent}
              >
                <span className="urgent-toggle-knob" />
              </button>
            </div>

            <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%', marginTop: 16 }}>Post Gig</button>
          </form>
        </div>
      </div>
    </div>
  );
}
