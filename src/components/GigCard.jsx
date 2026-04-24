import { Link } from 'react-router-dom';
import './GigCard.css';

export default function GigCard({ gig, showApply = false, onApply, applied = false }) {
  const timeAgo = (dateStr) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const hours = Math.floor(diff / 3600000);
    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    const days = Math.floor(hours / 24);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  };

  const categoryIcons = { creative: '🎨', tech: '💻', skilled: '🔧', admin: '📋' };

  return (
    <div className="gig-card card">
      <div className="gig-card-header">
        <span className="gig-category-icon">{categoryIcons[gig.category] || '📌'}</span>
        <div>
          {gig.urgent && <span className="badge badge-pending" style={{ fontSize: '0.65rem' }}>Urgent</span>}
          <span className="gig-time">{timeAgo(gig.postedAt)}</span>
        </div>
      </div>
      <Link to={`/gigs/${gig.id}`} className="gig-card-title">{gig.title}</Link>
      <p className="gig-card-business">🏢 {gig.businessName || 'Unknown Business'}</p>
      <p className="gig-card-desc">{gig.description.slice(0, 100)}...</p>
      <div className="gig-card-skills">
        {gig.skills.map(s => <span key={s} className="skill-tag">{s}</span>)}
      </div>
      <div className="gig-card-footer">
        <div className="gig-card-meta">
          <span className="gig-pay">{gig.pay}</span>
          <span className="gig-location">📍 {gig.location}</span>
        </div>
        {showApply && (
          applied
            ? <span className="badge badge-accepted">Applied</span>
            : <button className="btn btn-gold btn-sm" onClick={() => onApply?.(gig.id)}>Apply Now →</button>
        )}
        {!showApply && <Link to={`/gigs/${gig.id}`} className="btn btn-sm btn-outline-white">View Details</Link>}
      </div>
    </div>
  );
}
