import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getData, setData } from '../utils/storage';
import StarRating from '../components/StarRating';
import './ReviewsPage.css';

export default function ReviewsPage() {
  const { gigId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [canReview, setCanReview] = useState(false);
  const [alreadyReviewed, setAlreadyReviewed] = useState(false);
  const [gig, setGig] = useState(null);

  useEffect(() => {
    const allReviews = getData('reviews') || [];
    setReviews(allReviews.filter(r => r.gigId === gigId));
    setAlreadyReviewed(allReviews.some(r => r.gigId === gigId && r.reviewerId === user.id));

    const gigs = getData('gigs') || [];
    setGig(gigs.find(g => g.id === gigId));

    // Check if payment is completed for this gig
    const apps = getData('applications') || [];
    const payments = getData('payments') || [];
    const myApp = apps.find(a => a.gigId === gigId && (a.studentId === user.id || a.businessId === user.id));
    if (myApp) {
      const payment = payments.find(p => p.applicationId === myApp.id && p.status === 'completed');
      setCanReview(!!payment);
    }
  }, [gigId, user.id]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (rating === 0) return;
    const allReviews = getData('reviews') || [];
    const apps = getData('applications') || [];
    const myApp = apps.find(a => a.gigId === gigId && (a.studentId === user.id || a.businessId === user.id));
    const revieweeId = user.role === 'student' ? myApp?.businessId : myApp?.studentId;

    allReviews.push({
      id: 'r' + Date.now(), gigId, reviewerId: user.id, reviewerName: user.name, revieweeId,
      rating, comment, createdAt: new Date().toISOString()
    });
    setData('reviews', allReviews);
    setReviews(allReviews.filter(r => r.gigId === gigId));
    setAlreadyReviewed(true);
    setRating(0);
    setComment('');
  };

  const avgRating = reviews.length > 0 ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : '—';

  // Resolve all users once for reviewer name lookup
  const gsUsers = getData('users') || [];
  const appUsers = JSON.parse(localStorage.getItem('gigsphere_users') || '[]');
  const allUsers = [...gsUsers, ...appUsers];

  return (
    <div className="reviews-page">
      <div className="container">
        <button onClick={() => navigate(-1)} className="back-btn">← Back</button>
        <h1 className="page-title animate-fade-in-up">Reviews {gig ? `for "${gig.title}"` : ''}</h1>

        <div className="review-summary card">
          <div className="review-avg">
            <span className="review-avg-num">{avgRating}</span>
            <StarRating rating={Math.round(parseFloat(avgRating) || 0)} readonly size="lg" />
            <span className="review-count">{reviews.length} review{reviews.length !== 1 ? 's' : ''}</span>
          </div>
        </div>

        {canReview && !alreadyReviewed && (
          <div className="review-form card animate-fade-in-up">
            <h3>Leave a Review</h3>
            <form onSubmit={handleSubmit}>
              <div style={{ margin: '12px 0' }}>
                <StarRating rating={rating} onChange={setRating} size="lg" />
              </div>
              <textarea className="form-input" rows="3" placeholder="Share your experience..." value={comment} onChange={(e) => setComment(e.target.value)} />
              <button type="submit" className="btn btn-primary" style={{ marginTop: 12 }}>Submit Review</button>
            </form>
          </div>
        )}

        {!canReview && (
          <div className="card" style={{ textAlign: 'center', padding: 32, marginBottom: 24 }}>
            <p style={{ color: 'var(--text-muted)' }}>🔒 Reviews are unlocked after payment is completed</p>
          </div>
        )}

        <div className="review-list">
          {reviews.map(r => {
            const reviewer = allUsers.find(u => String(u.id) === String(r.reviewerId));
            const displayName = r.reviewerName || reviewer?.name || 'Anonymous';
            const displayAvatar = reviewer?.avatar || '👤';
            return (
              <div key={r.id} className="review-item card">
                <div className="review-item-header">
                  <span className="review-item-avatar">{displayAvatar}</span>
                  <div>
                    <strong>{displayName}</strong>
                    <StarRating rating={r.rating} readonly size="sm" />
                  </div>
                </div>
                <p className="review-item-text">{r.comment}</p>
                <span className="review-item-date">{new Date(r.createdAt).toLocaleDateString()}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
