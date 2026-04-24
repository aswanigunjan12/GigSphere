import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getData, setData } from '../utils/storage';
import './Dashboard.css';

export default function BusinessDashboard() {
  const { user } = useAuth();
  const [gigs, setGigs] = useState([]);
  const [apps, setApps] = useState([]);
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    setGigs((getData('gigs') || []).filter(g => g.businessId === user.id));
    setApps((getData('applications') || []).filter(a => a.businessId === user.id));
  }, [user.id, refresh]);

  const handleAccept = (appId) => {
    const allApps = getData('applications');
    const idx = allApps.findIndex(a => a.id === appId);
    if (idx !== -1) {
      allApps[idx].status = 'accepted';
      // Also set gig to in-progress
      const allGigs = getData('gigs');
      const gIdx = allGigs.findIndex(g => g.id === allApps[idx].gigId);
      if (gIdx !== -1) allGigs[gIdx].status = 'in-progress';
      setData('applications', allApps);
      setData('gigs', allGigs);
      setRefresh(r => r + 1);
    }
  };

  const handleReject = (appId) => {
    const allApps = getData('applications');
    const idx = allApps.findIndex(a => a.id === appId);
    if (idx !== -1) {
      allApps[idx].status = 'rejected';
      setData('applications', allApps);
      setRefresh(r => r + 1);
    }
  };

  const handleMarkComplete = (appId) => {
    const allApps = getData('applications');
    const idx = allApps.findIndex(a => a.id === appId);
    if (idx !== -1) {
      allApps[idx].status = 'completed';
      setData('applications', allApps);
      // Create payment record
      const app = allApps[idx];
      const gig = (getData('gigs') || []).find(g => g.id === app.gigId);
      const payments = getData('payments') || [];
      const payAmount = parseInt(gig?.pay?.replace(/[^\d]/g, '') || '0');
      payments.push({
        id: 'p' + Date.now(), applicationId: app.id, gigId: app.gigId,
        fromId: user.id, toId: app.studentId, amount: payAmount,
        status: 'pending', paidAt: null
      });
      setData('payments', payments);
      // Update gig status
      const allGigs = getData('gigs');
      const gIdx = allGigs.findIndex(g => g.id === app.gigId);
      if (gIdx !== -1) allGigs[gIdx].status = 'completed';
      setData('gigs', allGigs);
      setRefresh(r => r + 1);
    }
  };

  const totalApplicants = apps.length;
  const activeGigs = gigs.filter(g => g.status !== 'completed').length;

  return (
    <div className="dashboard-page">
      <div className="container">
        <div className="dash-welcome animate-fade-in-up">
          <div>
            <h1>Welcome, {user.name}! 🏢</h1>
            <p>Manage your gigs and find talent</p>
          </div>
          <Link to="/post-gig" className="btn btn-primary">+ Post New Gig</Link>
        </div>

        <div className="dash-stats">
          <div className="stat-card"><span className="stat-icon">📌</span><span className="stat-value">{gigs.length}</span><span className="stat-label">Posted Gigs</span></div>
          <div className="stat-card"><span className="stat-icon">🔥</span><span className="stat-value">{activeGigs}</span><span className="stat-label">Active</span></div>
          <div className="stat-card"><span className="stat-icon">👥</span><span className="stat-value">{totalApplicants}</span><span className="stat-label">Applicants</span></div>
          <div className="stat-card"><span className="stat-icon">⭐</span><span className="stat-value">{user.rating || '—'}</span><span className="stat-label">Rating</span></div>
        </div>

        <div className="dash-section">
          <h2 className="dash-section-title">My Posted Gigs</h2>
          {gigs.length === 0 ? (
            <div className="empty-state"><p className="empty-state-title">No gigs posted yet</p><Link to="/post-gig" className="btn btn-primary">Post your first gig</Link></div>
          ) : (
            gigs.map(gig => {
              const gigApps = apps.filter(a => a.gigId === gig.id);
              return (
                <div key={gig.id} className="dash-gig-block card" style={{ marginBottom: 16 }}>
                  <div className="dash-gig-header">
                    <div>
                      <Link to={`/gigs/${gig.id}`} className="dash-app-title">{gig.title}</Link>
                      <span className="dash-app-pay" style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 2 }}>
                        🏢 {gig.businessName || user.name || 'Unknown Business'}
                      </span>
                      <span className="dash-app-pay">{gig.pay} · {gig.location}</span>
                    </div>
                    <span className={`badge badge-${gig.status === 'open' ? 'accepted' : gig.status === 'in-progress' ? 'pending' : 'completed'}`}>{gig.status}</span>
                  </div>
                  {gigApps.length > 0 && (
                    <div className="dash-applicants">
                      <h4 className="dash-applicants-title">Applicants ({gigApps.length})</h4>
                      {gigApps.map(app => {
                        // 1) Use embedded userName if available
                        // 2) Fallback: search both user stores with String comparison
                        const gsUsers = getData('users') || [];
                        const appUsers = JSON.parse(localStorage.getItem('gigsphere_users') || '[]');
                        const allUsers = [...gsUsers, ...appUsers];
                        const student = allUsers.find(u => String(u.id) === String(app.studentId));
                        const displayName = app.userName || student?.name || 'Unknown Applicant';
                        const displayAvatar = student?.avatar || '👤';
                        const displaySkills = student?.skills?.slice(0, 3).join(', ') || 'Skills not listed';
                        const payment = (getData('payments') || []).find(p => p.applicationId === app.id);
                        return (
                          <div key={app.id} className="dash-applicant-row">
                            <div className="dash-applicant-info">
                              <span className="dash-applicant-avatar">{displayAvatar}</span>
                              <div>
                                <span className="dash-applicant-name">{displayName}</span>
                                <span className="dash-applicant-skills">{displaySkills}</span>
                              </div>
                            </div>
                            <div className="dash-applicant-actions">
                              <span className={`badge badge-${app.status}`}>{app.status}</span>
                              {app.status === 'pending' && (
                                <>
                                  <button onClick={() => handleAccept(app.id)} className="btn btn-sm btn-primary">Accept</button>
                                  <button onClick={() => handleReject(app.id)} className="btn btn-sm" style={{ background: 'rgba(239,68,68,0.08)', color: 'var(--red)' }}>Reject</button>
                                </>
                              )}
                              {app.status === 'accepted' && (
                                <>
                                  <Link to={`/chat/${app.id}`} className="btn btn-sm btn-outline-white">💬 Chat</Link>
                                  <button onClick={() => handleMarkComplete(app.id)} className="btn btn-sm btn-primary">✅ Mark Complete</button>
                                </>
                              )}
                              {app.status === 'completed' && (
                                <>
                                  <Link to="/payments" className="btn btn-sm btn-gold">💰 Pay</Link>
                                  {payment?.status === 'completed' && (
                                    <Link to={`/reviews/${gig.id}`} className="btn btn-sm btn-outline-white">⭐ Review</Link>
                                  )}
                                </>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
