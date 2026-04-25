import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import TagInput from '../components/TagInput';
import StarRating from '../components/StarRating';
import './ProfilePage.css';

// ─── Emoji avatar options ────────────────────────────────────────
const AVATAR_OPTIONS = ['🧑‍💻', '👩‍💻', '👨‍💻', '👩‍🎓', '👨‍🎓', '📸', '🎨', '🎯', '🚀', '💡', '🏢', '🎪', '⚡', '🔥', '🌟'];

// ─── Profile strength calculator ─────────────────────────────────
function calcProfileStrength(user) {
  if (!user) return { percent: 0, fields: [] };

  const checks = [
    { label: 'Name', done: !!user.name?.trim() },
    { label: 'Email', done: !!user.email?.trim() },
    { label: 'Location', done: !!user.location?.trim() },
    { label: 'Avatar', done: !!user.avatar },
    { label: 'Bio', done: !!user.bio?.trim() },
  ];

  if (user.role === 'student') {
    checks.push(
      { label: 'Skills', done: Array.isArray(user.skills) && user.skills.length > 0 },
      { label: 'Availability', done: !!user.availability?.trim() },
      { label: 'Education', done: !!user.education?.trim() },
      { label: 'Contact / Phone', done: !!user.contact?.trim() },
    );
  } else {
    checks.push(
      { label: 'Industry', done: !!user.industry?.trim() },
      { label: 'Contact / Phone', done: !!user.contact?.trim() },
    );
  }

  const done = checks.filter((c) => c.done).length;
  const percent = Math.round((done / checks.length) * 100);
  const missing = checks.filter((c) => !c.done).map((c) => c.label);
  return { percent, missing, total: checks.length, done };
}

// ─── Strength ring colour ────────────────────────────────────────
function strengthColor(pct) {
  if (pct >= 80) return '#22c55e';
  if (pct >= 50) return '#eab308';
  return '#ef4444';
}

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const savedTimerRef = useRef(null);

  // Sync form state from user
  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || '',
        email: user.email || '',
        location: user.location || '',
        bio: user.bio || '',
        skills: user.skills || [],
        availability: user.availability || '',
        education: user.education || '',
        contact: user.contact || '',
        industry: user.industry || '',
        avatar: user.avatar || '🧑‍💻',
      });
    }
  }, [user]);

  // Track unsaved changes
  useEffect(() => {
    if (!user || !editing) { setHasChanges(false); return; }
    const changed =
      form.name !== (user.name || '') ||
      form.location !== (user.location || '') ||
      form.bio !== (user.bio || '') ||
      form.availability !== (user.availability || '') ||
      form.education !== (user.education || '') ||
      form.contact !== (user.contact || '') ||
      form.industry !== (user.industry || '') ||
      form.avatar !== (user.avatar || '🧑‍💻') ||
      JSON.stringify(form.skills) !== JSON.stringify(user.skills || []);
    setHasChanges(changed);
  }, [form, user, editing]);

  // Warn on page leave with unsaved changes
  useEffect(() => {
    const handler = (e) => {
      if (hasChanges) { e.preventDefault(); e.returnValue = ''; }
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [hasChanges]);

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSave = useCallback(async () => {
    setSaving(true);
    // Simulate slight delay for UX
    await new Promise((r) => setTimeout(r, 600));
    updateUser(form);
    setSaving(false);
    setEditing(false);
    setHasChanges(false);
    setSaved(true);
    if (savedTimerRef.current) clearTimeout(savedTimerRef.current);
    savedTimerRef.current = setTimeout(() => setSaved(false), 3000);
  }, [form, updateUser]);

  const handleCancel = () => {
    if (hasChanges) {
      const confirm = window.confirm('You have unsaved changes. Discard them?');
      if (!confirm) return;
    }
    setForm({
      name: user.name || '',
      email: user.email || '',
      location: user.location || '',
      bio: user.bio || '',
      skills: user.skills || [],
      availability: user.availability || '',
      education: user.education || '',
      contact: user.contact || '',
      industry: user.industry || '',
      avatar: user.avatar || '🧑‍💻',
    });
    setEditing(false);
    setHasChanges(false);
  };

  if (!user) return null;

  const { percent, missing } = calcProfileStrength(editing ? form : user);
  const ringColor = strengthColor(percent);
  // SVG ring params
  const ringRadius = 42;
  const ringCirc = 2 * Math.PI * ringRadius;
  const ringOffset = ringCirc - (percent / 100) * ringCirc;

  return (
    <div className="profile-page">
      <div className="container">
        {/* ── Success toast ───────────────────────────────────── */}
        <div className={`profile-toast ${saved ? 'profile-toast--visible' : ''}`}>
          <span className="profile-toast-icon">✅</span>
          <span>Profile updated successfully</span>
        </div>

        <div className="profile-layout animate-fade-in-up">
          {/* ═══ Left Sidebar Card ═══ */}
          <div className="profile-card card">
            {/* Avatar */}
            <div className="profile-avatar-wrap">
              <div className="profile-avatar">{editing ? form.avatar : user.avatar}</div>
              {editing && (
                <button
                  className="profile-avatar-edit-btn"
                  onClick={() => setShowAvatarPicker((v) => !v)}
                  title="Change avatar"
                >✏️</button>
              )}
            </div>

            {/* Avatar picker */}
            {editing && showAvatarPicker && (
              <div className="profile-avatar-picker animate-fade-in">
                {AVATAR_OPTIONS.map((av) => (
                  <button
                    key={av}
                    className={`avatar-option ${form.avatar === av ? 'avatar-option--active' : ''}`}
                    onClick={() => { setForm((f) => ({ ...f, avatar: av })); setShowAvatarPicker(false); }}
                  >{av}</button>
                ))}
              </div>
            )}

            <h2 className="profile-name">{user.name}</h2>
            <span className="profile-role badge badge-accepted">{user.role}</span>
            <div className="profile-rating">
              <StarRating rating={Math.round(user.rating || 0)} readonly />
              <span>{user.rating || '—'}</span>
            </div>
            <p className="profile-location">📍 {user.location || 'Not set'}</p>

            {/* ── Profile Strength Ring ──────────────────────── */}
            <div className="profile-strength">
              <div className="profile-strength-ring">
                <svg viewBox="0 0 100 100" className="profile-ring-svg">
                  <circle cx="50" cy="50" r={ringRadius} fill="none" stroke="rgba(0,0,0,0.06)" strokeWidth="6" />
                  <circle
                    cx="50" cy="50" r={ringRadius}
                    fill="none"
                    stroke={ringColor}
                    strokeWidth="6"
                    strokeLinecap="round"
                    strokeDasharray={ringCirc}
                    strokeDashoffset={ringOffset}
                    className="profile-ring-progress"
                  />
                </svg>
                <span className="profile-ring-pct" style={{ color: ringColor }}>{percent}%</span>
              </div>
              <div className="profile-strength-text">
                <span className="profile-strength-label">Profile Strength</span>
                {missing.length > 0 ? (
                  <span className="profile-strength-hint">
                    Add {missing.slice(0, 2).join(', ')}{missing.length > 2 ? ` +${missing.length - 2} more` : ''} to improve
                  </span>
                ) : (
                  <span className="profile-strength-hint profile-strength-hint--complete">🎉 Profile complete!</span>
                )}
              </div>
            </div>
          </div>

          {/* ═══ Right Details Card ═══ */}
          <div className="profile-details card">
            <div className="profile-details-header">
              <h2>Profile Details</h2>
              {!editing && (
                <button onClick={() => setEditing(true)} className="btn btn-sm btn-outline-white profile-edit-trigger">
                  ✏️ Edit Profile
                </button>
              )}
            </div>

            {/* ── Editing Mode ─────────────────────────────────── */}
            {editing ? (
              <div className="profile-form">
                {/* Unsaved changes banner */}
                {hasChanges && (
                  <div className="profile-unsaved-banner animate-fade-in">
                    <span>⚠️</span>
                    <span>You have unsaved changes</span>
                  </div>
                )}

                {/* Name */}
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input name="name" value={form.name} onChange={handleChange} className="form-input" placeholder="Your name" />
                </div>

                {/* Email (read-only) */}
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input name="email" value={form.email} className="form-input" disabled style={{ opacity: 0.5 }} />
                  <span className="form-hint">Email cannot be changed</span>
                </div>

                {/* Bio */}
                <div className="form-group">
                  <label className="form-label">Bio</label>
                  <textarea
                    name="bio"
                    value={form.bio}
                    onChange={handleChange}
                    className="form-input"
                    rows="3"
                    placeholder="Tell us about yourself…"
                  />
                </div>

                {/* Location */}
                <div className="form-group">
                  <label className="form-label">Location</label>
                  <input name="location" value={form.location} onChange={handleChange} className="form-input" placeholder="City, Country" />
                </div>

                {/* Contact */}
                <div className="form-group">
                  <label className="form-label">Contact / Phone</label>
                  <input name="contact" value={form.contact} onChange={handleChange} className="form-input" placeholder="+91 98765 43210" />
                </div>

                {/* Student-specific fields */}
                {user.role === 'student' && (
                  <>
                    <div className="form-group">
                      <label className="form-label">Skills</label>
                      <TagInput tags={form.skills || []} onChange={(skills) => setForm((f) => ({ ...f, skills }))} />
                      <span className="form-hint">Skills affect your gig recommendations</span>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Availability</label>
                      <select name="availability" value={form.availability} onChange={handleChange} className="form-input">
                        <option value="">Select availability</option>
                        <option value="Weekdays">Weekdays</option>
                        <option value="Weekends">Weekends</option>
                        <option value="Weekends & Evenings">Weekends & Evenings</option>
                        <option value="Flexible">Flexible</option>
                        <option value="Full-time">Full-time</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Education</label>
                      <input name="education" value={form.education} onChange={handleChange} className="form-input" placeholder="e.g. B.Tech CS, RGPV" />
                    </div>
                  </>
                )}

                {/* Business-specific fields */}
                {user.role === 'business' && (
                  <div className="form-group">
                    <label className="form-label">Industry</label>
                    <input name="industry" value={form.industry} onChange={handleChange} className="form-input" placeholder="e.g. Technology" />
                  </div>
                )}

                {/* Action buttons */}
                <div className="profile-form-actions">
                  <button onClick={handleSave} className="btn btn-primary profile-save-btn" disabled={saving}>
                    {saving ? (
                      <><span className="profile-spinner" /> Saving…</>
                    ) : (
                      '💾 Save Changes'
                    )}
                  </button>
                  <button onClick={handleCancel} className="btn btn-outline-white" disabled={saving}>
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              /* ── View Mode ────────────────────────────────────── */
              <div className="profile-info-grid">
                <div className="profile-info-item">
                  <span className="profile-info-label">Email</span>
                  <span>{user.email}</span>
                </div>
                {user.bio && (
                  <div className="profile-info-item">
                    <span className="profile-info-label">Bio</span>
                    <span className="profile-info-bio">{user.bio}</span>
                  </div>
                )}
                <div className="profile-info-item">
                  <span className="profile-info-label">Location</span>
                  <span>{user.location || '—'}</span>
                </div>
                {user.contact && (
                  <div className="profile-info-item">
                    <span className="profile-info-label">Contact</span>
                    <span>{user.contact}</span>
                  </div>
                )}
                {user.role === 'student' && (
                  <>
                    <div className="profile-info-item">
                      <span className="profile-info-label">Skills</span>
                      <div className="gig-card-skills">
                        {(user.skills || []).length > 0
                          ? user.skills.map((s) => <span key={s} className="skill-tag">{s}</span>)
                          : <span className="profile-info-empty">No skills added yet</span>
                        }
                      </div>
                    </div>
                    <div className="profile-info-item">
                      <span className="profile-info-label">Availability</span>
                      <span>{user.availability || '—'}</span>
                    </div>
                    {user.education && (
                      <div className="profile-info-item">
                        <span className="profile-info-label">Education</span>
                        <span>{user.education}</span>
                      </div>
                    )}
                  </>
                )}
                {user.role === 'business' && (
                  <div className="profile-info-item">
                    <span className="profile-info-label">Industry</span>
                    <span>{user.industry || '—'}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
