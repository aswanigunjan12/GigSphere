import { Link } from 'react-router-dom';
import useGigRecommendations from '../hooks/useGigRecommendations';
import './RecommendedGigs.css';

// ─── Skeleton card ──────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="rec-card rec-card--skeleton">
      <div className="rec-skeleton rec-skeleton--badge" />
      <div className="rec-skeleton rec-skeleton--title" />
      <div className="rec-skeleton rec-skeleton--text" />
      <div className="rec-skeleton rec-skeleton--text rec-skeleton--short" />
      <div className="rec-skeleton rec-skeleton--meta" />
    </div>
  );
}

// ─── Score badge colour ─────────────────────────────────────────────────────
function scoreTier(score) {
  if (score >= 80) return 'high';
  if (score >= 55) return 'mid';
  return 'low';
}

// ─── Single recommendation card ────────────────────────────────────────────
function RecCard({ rec, appliedGigs, onApply }) {
  const { gig, matchScore, reason } = rec;
  const tier = scoreTier(matchScore);
  const applied = appliedGigs.includes(gig.id);
  const categoryIcons = { creative: '🎨', tech: '💻', skilled: '🔧', admin: '📋' };

  return (
    <div className={`rec-card rec-card--${tier}`}>
      {/* Score badge */}
      <div className={`rec-score rec-score--${tier}`}>
        <span className="rec-score-number">{matchScore}</span>
        <span className="rec-score-label">match</span>
      </div>

      {/* Category + urgency */}
      <div className="rec-card-top">
        <span className="rec-category-icon">{categoryIcons[gig.category] || '📌'}</span>
        {gig.urgent && <span className="rec-urgent-badge">🔥 Urgent</span>}
      </div>

      {/* Title */}
      <Link to={`/gigs/${gig.id}`} className="rec-title">{gig.title}</Link>
      <p style={{ fontSize: '0.75rem', color: 'var(--text-light)', margin: '2px 0 4px', fontWeight: 500 }}>
        🏢 {gig.businessName || 'Unknown Business'}
      </p>

      {/* Pay + Location */}
      <div className="rec-meta">
        <span className="rec-pay">💰 {gig.pay}</span>
        <span className="rec-location">📍 {gig.location}</span>
      </div>

      {/* AI reason */}
      <div className="rec-reason">
        <span className="rec-reason-icon">🤖</span>
        <p>{reason}</p>
      </div>

      {/* Skill tags */}
      <div className="rec-skills">
        {gig.skills.slice(0, 3).map((s) => (
          <span key={s} className="rec-skill-tag">{s}</span>
        ))}
      </div>

      {/* CTA */}
      <div className="rec-actions">
        {applied ? (
          <span className="rec-applied-badge">✓ Applied</span>
        ) : (
          <button className="rec-apply-btn" onClick={() => onApply?.(gig.id)}>
            Apply Now →
          </button>
        )}
        <Link to={`/gigs/${gig.id}`} className="rec-view-btn">View</Link>
      </div>
    </div>
  );
}

// ─── Main exported component ────────────────────────────────────────────────
export default function RecommendedGigs({ user, appliedGigs = [], onApply }) {
  const { enriched, loading, error, source } = useGigRecommendations(user);

  // Only for students
  if (!user || user.role !== 'student') return null;

  // Error state
  if (error && !loading && enriched.length === 0) {
    return (
      <div className="rec-section">
        <div className="rec-header">
          <h2 className="rec-heading">Recommended for You ✨</h2>
        </div>
        <div className="rec-error">
          <span>⚠️</span> {error}
        </div>
      </div>
    );
  }

  return (
    <section className="rec-section animate-fade-in-up">
      {/* Section header */}
      <div className="rec-header">
        <div className="rec-header-left">
          <h2 className="rec-heading">Recommended for You ✨</h2>
          <p className="rec-subheading">
            {loading
              ? 'Finding your perfect gigs…'
              : source === 'ai'
              ? 'Personalised by Claude AI based on your skills'
              : source === 'cache'
              ? 'Personalised by Claude AI · Cached'
              : 'Matched by skill overlap'}
          </p>
        </div>
        {source === 'ai' && (
          <span className="rec-ai-badge">
            <span className="rec-ai-dot" />
            AI Powered
          </span>
        )}
        {source === 'cache' && (
          <span className="rec-ai-badge rec-ai-badge--cache">
            ⚡ Cached
          </span>
        )}
      </div>

      {/* Cards grid */}
      <div className="rec-grid">
        {loading
          ? [1, 2, 3].map((n) => <SkeletonCard key={n} />)
          : enriched.map((rec) => (
              <RecCard
                key={rec.gigId}
                rec={rec}
                appliedGigs={appliedGigs}
                onApply={onApply}
              />
            ))}
      </div>

      {!loading && enriched.length === 0 && (
        <div className="rec-empty">
          No recommendations yet — try updating your skills in your profile.
        </div>
      )}
    </section>
  );
}
