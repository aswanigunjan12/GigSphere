import { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getData, setData } from '../utils/storage';
import { generateCoverLetter, improveCoverLetter } from '../utils/coverLetterAI';
import './GigDetail.css';

export default function GigDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [gig, setGig] = useState(null);
  const [applied, setApplied] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [showForm, setShowForm] = useState(false);

  // AI Cover Letter state
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiUsed, setAiUsed] = useState(false);
  const [matchedSkills, setMatchedSkills] = useState([]);
  const [matchStrength, setMatchStrength] = useState(0);

  useEffect(() => {
    const gigs = getData('gigs') || [];
    setGig(gigs.find(g => g.id === id));
    const apps = getData('applications') || [];
    setApplied(apps.some(a => a.gigId === id && a.studentId === user?.id));
  }, [id, user?.id]);

  // Generate AI cover letter
  const handleGenerate = useCallback(async () => {
    if (!gig || !user) return;
    setAiGenerating(true);
    // Simulate AI processing delay for UX polish
    await new Promise(r => setTimeout(r, 1200 + Math.random() * 800));
    const result = generateCoverLetter(user, gig);
    setCoverLetter(result.letter);
    setMatchedSkills(result.matchedSkills);
    setMatchStrength(result.matchStrength);
    setAiUsed(true);
    setAiGenerating(false);
  }, [gig, user]);

  // Improve existing draft
  const handleImprove = useCallback(async () => {
    if (!gig || !user) return;
    setAiGenerating(true);
    await new Promise(r => setTimeout(r, 900 + Math.random() * 600));
    const result = improveCoverLetter(coverLetter, user, gig);
    setCoverLetter(result.letter);
    setMatchedSkills(result.matchedSkills);
    setMatchStrength(result.matchStrength);
    setAiUsed(true);
    setAiGenerating(false);
  }, [gig, user, coverLetter]);

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
      coverLetter,
      aiOptimized: aiUsed,
    });
    setData('applications', apps);
    setApplied(true);
    setShowForm(false);
  };

  if (!gig) return <div className="container" style={{ padding: '60px 0', textAlign: 'center' }}><p>Gig not found</p></div>;

  // Resolve business: prefer embedded businessName, fall back to users lookup
  const gsUsers  = getData('users') || [];
  const appUsers = JSON.parse(localStorage.getItem('gigsphere_users') || '[]');
  const allDetailUsers = [...gsUsers, ...appUsers];
  const business = allDetailUsers.find(u => String(u.id) === String(gig.businessId));
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
                    {aiUsed && <span className="ai-optimized-badge">🤖 AI Optimized Application</span>}
                    <p>You'll be notified when the business responds.</p>
                    <Link to="/dashboard" className="btn btn-outline-white btn-sm" style={{ marginTop: 12 }}>View Dashboard</Link>
                  </div>
                ) : showForm ? (
                  <div className="ai-apply-form">
                    <div className="ai-apply-header">
                      <h3>Apply for this Gig</h3>
                      {aiUsed && <span className="ai-optimized-badge">🤖 AI Optimized</span>}
                    </div>

                    {/* AI Generate / Regenerate buttons */}
                    <div className="ai-btn-row">
                      <button
                        onClick={handleGenerate}
                        className="ai-generate-btn"
                        disabled={aiGenerating}
                      >
                        {aiGenerating ? (
                          <><span className="ai-spinner" /> Generating…</>
                        ) : aiUsed ? (
                          <>🔄 Regenerate</>
                        ) : (
                          <>✨ Generate AI Cover Letter</>
                        )}
                      </button>
                      {aiUsed && coverLetter && !aiGenerating && (
                        <button onClick={handleImprove} className="ai-improve-btn" disabled={aiGenerating}>
                          🚀 Improve Draft
                        </button>
                      )}
                    </div>

                    {/* AI loading skeleton */}
                    {aiGenerating && (
                      <div className="ai-loading-state animate-fade-in">
                        <div className="ai-loading-shimmer" />
                        <div className="ai-loading-shimmer ai-loading-shimmer--short" />
                        <div className="ai-loading-shimmer" />
                        <p className="ai-loading-text">Generating personalized cover letter…</p>
                      </div>
                    )}

                    {/* Cover letter textarea */}
                    {!aiGenerating && (
                      <textarea
                        className="form-input ai-cover-textarea"
                        rows="8"
                        placeholder="Write your cover letter or use AI to generate one…"
                        value={coverLetter}
                        onChange={(e) => { setCoverLetter(e.target.value); if (!aiUsed && e.target.value) setAiUsed(false); }}
                      />
                    )}

                    {/* Matched skills + strength */}
                    {aiUsed && matchedSkills.length > 0 && !aiGenerating && (
                      <div className="ai-match-panel animate-fade-in">
                        <div className="ai-match-skills">
                          <span className="ai-match-label">Skills Matched:</span>
                          {matchedSkills.map(s => (
                            <span key={s} className="ai-match-skill-tag">{s}</span>
                          ))}
                        </div>
                        <div className="ai-match-strength">
                          <span className="ai-match-label">Match Strength</span>
                          <div className="ai-strength-bar">
                            <div
                              className="ai-strength-fill"
                              style={{ width: `${matchStrength}%` }}
                            />
                          </div>
                          <span className="ai-strength-pct">{matchStrength}%</span>
                        </div>
                      </div>
                    )}

                    {/* Boost hint */}
                    {!aiUsed && !aiGenerating && (
                      <p className="ai-boost-hint">
                        💡 Using AI cover letter increases match strength by up to 40%
                      </p>
                    )}

                    {/* Submit / Cancel */}
                    <div className="ai-apply-actions">
                      <button onClick={handleApply} className="btn btn-primary btn-sm" disabled={!coverLetter.trim() || aiGenerating}>
                        {aiUsed ? '🚀 Submit AI Application' : 'Submit Application'}
                      </button>
                      <button onClick={() => { setShowForm(false); setCoverLetter(''); setAiUsed(false); }} className="btn btn-outline-white btn-sm">
                        Cancel
                      </button>
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
