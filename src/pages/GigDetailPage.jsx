import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getData, setData } from '../utils/storage';
import './GigDetail.css';

export default function GigDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [gig, setGig] = useState(null);
  const [applied, setApplied] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    const gigs = getData('gigs') || [];
    setGig(gigs.find(g => g.id === id));
    const apps = getData('applications') || [];
    setApplied(apps.some(a => a.gigId === id && a.studentId === user?.id));
  }, [id, user?.id]);

  const handleApply = () => {
    const apps = getData('applications') || [];
    apps.push({
      id: 'a' + Date.now(),
      gigId: id,
      studentId: user.id,
      userName: user.name || 'Unknown',
      businessId: gig.businessId,
      status: 'pending',
      appliedAt: new Date().toISOString(),
      coverLetter
    });
    setData('applications', apps);
    setApplied(true);
    setShowForm(false);
  };

  if (!gig) return <div className="container" style={{ padding: '60px 0', textAlign: 'center' }}><p>Gig not found</p></div>;

  // Resolve business: prefer embedded businessName, fall back to users lookup
  const allUsers = getData('users') || [];
  const business = allUsers.find(u => String(u.id) === String(gig.businessId));
  const displayBusinessName = gig.businessName || business?.name || 'Unknown Business';

  return (
    <div className="gig-detail-page">
      <div className="container">
        <button onClick={() => navigate(-1)} className="back-btn">← Back</button>
        <div className="gig-detail-layout animate-fade-in-up">
          <div className="gig-detail-main card">
            <div className="gig-detail-header">
              <h1>{gig.title}</h1>
              {gig.urgent && <span className="badge badge-pending">Urgent</span>}
            </div>
            <div className="gig-detail-meta">
              <span>💰 {gig.pay}</span>
              <span>📍 {gig.location}</span>
              <span>⏱ {gig.duration}</span>
              <span className={`badge badge-${gig.status === 'open' ? 'accepted' : 'completed'}`}>{gig.status}</span>
            </div>
            <div className="gig-detail-section">
              <h3>Description</h3>
              <p>{gig.description}</p>
            </div>
            <div className="gig-detail-section">
              <h3>Skills Required</h3>
              <div className="gig-card-skills">{gig.skills.map(s => <span key={s} className="skill-tag">{s}</span>)}</div>
            </div>
            {/* Business info — always show */}
            <div className="gig-detail-section">
              <h3>Posted By</h3>
              <div className="gig-detail-business">
                <span className="gig-biz-avatar">{business?.avatar || '🏢'}</span>
                <div>
                  <strong>{displayBusinessName}</strong>
                  {business && (
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{business.industry} · {business.location}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="gig-detail-sidebar">
            <div className="card">
              {/* Business + Earnings Summary */}
              <div style={{ marginBottom: 16, paddingBottom: 16, borderBottom: '1px solid var(--border)' }}>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-light)', marginBottom: 4 }}>Posted by</p>
                <p style={{ fontWeight: 700, color: 'var(--text-dark)', fontSize: '0.95rem' }}>
                  🏢 {displayBusinessName}
                </p>
              </div>
              {/* Earnings breakdown */}
              {(() => {
                const price = parseInt((gig.pay || '').replace(/[^\d]/g, '') || '0');
                const fee = Math.round(price * 0.10);
                const earn = price - fee;
                return price > 0 ? (
                  <div style={{ marginBottom: 16, paddingBottom: 16, borderBottom: '1px solid var(--border)' }}>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-light)', marginBottom: 8 }}>Earnings Breakdown</p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: 4 }}>
                      <span style={{ color: 'var(--text-muted)' }}>Gig Price</span>
                      <span style={{ fontWeight: 600 }}>₹{price.toLocaleString()}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: 4 }}>
                      <span style={{ color: 'var(--text-muted)' }}>Platform Fee (10%)</span>
                      <span style={{ color: '#e07b39' }}>−₹{fee.toLocaleString()}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem', borderTop: '1px dashed var(--border)', paddingTop: 6, marginTop: 4 }}>
                      <span style={{ fontWeight: 700, color: 'var(--text-dark)' }}>You Earn</span>
                      <span style={{ fontWeight: 700, color: 'var(--teal)' }}>₹{earn.toLocaleString()}</span>
                    </div>
                  </div>
                ) : null;
              })()}
              {user?.role === 'student' ? (
                applied ? (
                  <div className="gig-applied-state">
                    <span style={{ fontSize: '2rem' }}>✅</span>
                    <h3>Application Submitted</h3>
                    <p>You'll be notified when the business responds.</p>
                    <Link to="/dashboard" className="btn btn-outline-white btn-sm" style={{ marginTop: 12 }}>View Dashboard</Link>
                  </div>
                ) : showForm ? (
                  <div>
                    <h3 style={{ marginBottom: 12 }}>Apply for this Gig</h3>
                    <textarea className="form-input" rows="4" placeholder="Why are you a great fit?" value={coverLetter} onChange={(e) => setCoverLetter(e.target.value)} />
                    <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                      <button onClick={handleApply} className="btn btn-primary btn-sm">Submit Application</button>
                      <button onClick={() => setShowForm(false)} className="btn btn-outline-white btn-sm">Cancel</button>
                    </div>
                  </div>
                ) : (
                  <div style={{ textAlign: 'center' }}>
                    <h3 style={{ marginBottom: 8 }}>Interested?</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: 16 }}>Apply now and start earning!</p>
                    <button onClick={() => setShowForm(true)} className="btn btn-gold btn-lg" style={{ width: '100%' }}>Apply Now</button>
                  </div>
                )
              ) : (
                <div style={{ textAlign: 'center' }}>
                  <p style={{ color: 'var(--text-muted)' }}>You're viewing as a business</p>
                  <Link to="/dashboard" className="btn btn-primary btn-sm" style={{ marginTop: 12 }}>Go to Dashboard</Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
