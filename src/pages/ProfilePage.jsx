import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import TagInput from '../components/TagInput';
import StarRating from '../components/StarRating';
import './ProfilePage.css';

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ ...user });
  const [saved, setSaved] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSave = () => {
    updateUser(form);
    setEditing(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="profile-page">
      <div className="container">
        <div className="profile-layout animate-fade-in-up">
          <div className="profile-card card">
            <div className="profile-avatar">{user.avatar}</div>
            <h2 className="profile-name">{user.name}</h2>
            <span className="profile-role badge badge-accepted">{user.role}</span>
            <div className="profile-rating">
              <StarRating rating={Math.round(user.rating || 0)} readonly />
              <span>{user.rating || '—'}</span>
            </div>
            <p className="profile-location">📍 {user.location || 'Not set'}</p>
          </div>

          <div className="profile-details card">
            <div className="profile-details-header">
              <h2>Profile Details</h2>
              {!editing && <button onClick={() => setEditing(true)} className="btn btn-sm btn-outline-white">✏️ Edit</button>}
            </div>
            {saved && <div style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', color: 'var(--green)', padding: '8px 16px', borderRadius: 8, marginBottom: 16, fontSize: '0.9rem' }}>✅ Profile updated!</div>}

            {editing ? (
              <div className="profile-form">
                <div className="form-group">
                  <label className="form-label">Name</label>
                  <input name="name" value={form.name} onChange={handleChange} className="form-input" />
                </div>
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input name="email" value={form.email} className="form-input" disabled style={{ opacity: 0.5 }} />
                </div>
                <div className="form-group">
                  <label className="form-label">Location</label>
                  <input name="location" value={form.location || ''} onChange={handleChange} className="form-input" />
                </div>
                {user.role === 'student' && (
                  <>
                    <div className="form-group">
                      <label className="form-label">Skills</label>
                      <TagInput tags={form.skills || []} onChange={(skills) => setForm({ ...form, skills })} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Availability</label>
                      <input name="availability" value={form.availability || ''} onChange={handleChange} className="form-input" />
                    </div>
                  </>
                )}
                {user.role === 'business' && (
                  <div className="form-group">
                    <label className="form-label">Industry</label>
                    <input name="industry" value={form.industry || ''} onChange={handleChange} className="form-input" />
                  </div>
                )}
                <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
                  <button onClick={handleSave} className="btn btn-primary">Save Changes</button>
                  <button onClick={() => { setEditing(false); setForm({ ...user }); }} className="btn btn-outline-white">Cancel</button>
                </div>
              </div>
            ) : (
              <div className="profile-info-grid">
                <div className="profile-info-item"><span className="profile-info-label">Email</span><span>{user.email}</span></div>
                <div className="profile-info-item"><span className="profile-info-label">Location</span><span>{user.location || '—'}</span></div>
                {user.role === 'student' && (
                  <>
                    <div className="profile-info-item"><span className="profile-info-label">Skills</span><div className="gig-card-skills">{(user.skills || []).map(s => <span key={s} className="skill-tag">{s}</span>)}</div></div>
                    <div className="profile-info-item"><span className="profile-info-label">Availability</span><span>{user.availability || '—'}</span></div>
                  </>
                )}
                {user.role === 'business' && (
                  <div className="profile-info-item"><span className="profile-info-label">Industry</span><span>{user.industry || '—'}</span></div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
