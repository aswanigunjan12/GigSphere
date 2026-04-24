import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getData } from '../utils/storage';
import { recommendGigs, calcCommission, getPlatformEarnings } from '../utils/store';
import './Dashboard.css';

// ─── Score badge colour tier ──────────────────────────────
function scoreBadge(score) {
  if (!score && score !== 0) return null;     // fallback mode
  if (score >= 4) return { label: `${score} pts`, cls: 'score-high' };
  if (score >= 2) return { label: `${score} pts`, cls: 'score-mid' };
  return { label: `${score} pts`, cls: 'score-low' };
}

export default function StudentDashboard() {
  const { user } = useAuth();
  const [gigs, setGigs]               = useState([]);
  const [apps, setApps]               = useState([]);
  const [recommended, setRecommended] = useState([]);
  const [platformEarnings, setPlatformEarnings] = useState(0);

  useEffect(() => {
    const allGigs = getData('gigs') || [];
    const allApps = (getData('applications') || []).filter((a) => a.studentId === user.id);
    setGigs(allGigs);
    setApps(allApps);
    // Run recommendation engine with current user + all gigs
    setRecommended(recommendGigs(user, allGigs));
    setPlatformEarnings(getPlatformEarnings());
  }, [user.id]);

  const getGig     = (gigId) => gigs.find((g) => g.id === gigId);
  const payments   = (getData('payments') || []).filter((p) => p.toId === user.id);
  const completed  = payments.filter((p) => p.status === 'completed');
  const totalEarned = completed.reduce((s, p) => s + (p.studentEarning ?? p.amount), 0);
  const totalFees   = completed.reduce((s, p) => s + (p.commission ?? 0), 0);

  return (
    <div className="dashboard-page">
      <div className="container">

        {/* ── Welcome header ──────────────────────────────── */}
        <div className="dash-welcome animate-fade-in-up">
          <div>
            <h1>Welcome back, {user.name}! 👋</h1>
            <p>Here's your gig activity overview</p>
          </div>
          <Link to="/gigs" className="btn btn-primary">Browse Gigs</Link>
        </div>

        {/* ── Stat cards ──────────────────────────────────── */}
        <div className="dash-stats">
          <div className="stat-card">
            <span className="stat-icon">📋</span>
            <span className="stat-value">{apps.length}</span>
            <span className="stat-label">Applications</span>
          </div>
          <div className="stat-card">
            <span className="stat-icon">✅</span>
            <span className="stat-value">{apps.filter((a) => a.status === 'accepted').length}</span>
            <span className="stat-label">Accepted</span>
          </div>
          <div className="stat-card">
            <span className="stat-icon">💰</span>
            <span className="stat-value">₹{totalEarned.toLocaleString()}</span>
            <span className="stat-label">You Earned</span>
          </div>
          <div className="stat-card">
            <span className="stat-icon">⭐</span>
            <span className="stat-value">{user.rating || '—'}</span>
            <span className="stat-label">Rating</span>
          </div>
        </div>

        {/* ── Recommended Gigs section ─────────────────────── */}
        <div className="dash-section">
          <div className="dash-section-header">
            <h2 className="dash-section-title">Recommended for You ✨</h2>
            <span className="dash-rec-algo-badge">Skill-Match Algorithm</span>
          </div>

          {recommended.length === 0 ? (
            <div className="empty-state">
              <p className="empty-state-title">No open gigs right now</p>
              <p>Check back soon!</p>
            </div>
          ) : (
            <div className="dash-rec-grid">
              {recommended.map((gig) => {
                const badge   = scoreBadge(gig.matchScore);
                const { gigPrice, commission, studentEarning } = calcCommission(gig.pay);
                return (
                  <div key={gig.id} className="dash-rec-card card">
                    {/* Score badge + urgent */}
                    <div className="dash-rec-card-top">
                      {badge && (
                        <span className={`dash-match-badge ${badge.cls}`}>{badge.label}</span>
                      )}
                      {gig.fallback && (
                        <span className="dash-match-badge score-low">Latest</span>
                      )}
                      {gig.urgent && <span className="dash-urgent-tag">🔥 Urgent</span>}
                    </div>

                    {/* Title */}
                    <Link to={`/gigs/${gig.id}`} className="dash-rec-title">{gig.title}</Link>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-light)', margin: '2px 0 6px', fontWeight: 500 }}>
                      🏢 {gig.businessName || 'Unknown Business'}
                    </p>

                    {/* Skills */}
                    <div className="gig-card-skills" style={{ marginTop: 6 }}>
                      {(gig.skills || []).slice(0, 3).map((s) => (
                        <span key={s} className="skill-tag">{s}</span>
                      ))}
                    </div>

                    {/* Meta */}
                    <div className="dash-rec-meta-row">
                      <span className="dash-rec-pay">💰 {gig.pay}</span>
                      <span className="dash-rec-loc">📍 {gig.location}</span>
                    </div>

                    {/* Earnings breakdown preview */}
                    {gigPrice > 0 && (
                      <div className="dash-earnings-preview">
                        <div className="dep-row">
                          <span>Gig Price</span>
                          <span>₹{gigPrice.toLocaleString()}</span>
                        </div>
                        <div className="dep-row dep-fee">
                          <span>Platform Fee (10%)</span>
                          <span>−₹{commission.toLocaleString()}</span>
                        </div>
                        <div className="dep-row dep-earn">
                          <span>You Earn</span>
                          <span>₹{studentEarning.toLocaleString()}</span>
                        </div>
                      </div>
                    )}

                    <Link to={`/gigs/${gig.id}`} className="btn btn-primary btn-sm" style={{ marginTop: 12 }}>
                      View & Apply →
                    </Link>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── My Applications + Platform Earnings ──────────── */}
        <div className="dash-grid">
          <div className="dash-section">
            <h2 className="dash-section-title">My Applications</h2>
            {apps.length === 0 ? (
              <div className="empty-state">
                <p className="empty-state-title">No applications yet</p>
                <p>Browse gigs and start applying!</p>
              </div>
            ) : (
              <div className="dash-apps-list">
                {apps.map((app) => {
                  const gig     = getGig(app.gigId);
                  if (!gig) return null;
                  const payment = payments.find((p) => p.applicationId === app.id);
                  return (
                    <div key={app.id} className="dash-app-item card">
                      <div className="dash-app-info">
                        <Link to={`/gigs/${gig.id}`} className="dash-app-title">{gig.title}</Link>
                        <span className="dash-app-pay">{gig.pay} · {gig.location}</span>
                      </div>
                      <div className="dash-app-actions">
                        <span className={`badge badge-${app.status}`}>{app.status}</span>
                        {app.status === 'accepted' && (
                          <Link to={`/chat/${app.id}`} className="btn btn-sm btn-primary">💬 Chat</Link>
                        )}
                        {app.status === 'completed' && payment?.status === 'completed' && (
                          <Link to={`/reviews/${gig.id}`} className="btn btn-sm btn-outline-white">⭐ Review</Link>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Platform Earnings panel (visible to student to show transparency) */}
          <div className="dash-section">
            <h2 className="dash-section-title">Platform Earnings 📊</h2>
            <div className="platform-earnings-card card">
              <div className="pe-row pe-big">
                <span>Total Platform Earnings</span>
                <span className="pe-amount">₹{platformEarnings.toLocaleString()}</span>
              </div>
              <div className="pe-row">
                <span>Your Total Earned</span>
                <span className="pe-you">₹{totalEarned.toLocaleString()}</span>
              </div>
              <div className="pe-row pe-fee-row">
                <span>Fees Paid</span>
                <span className="pe-fee">₹{totalFees.toLocaleString()}</span>
              </div>
              <p className="pe-note">GigSphere takes 10% of each gig payment to maintain the platform.</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
