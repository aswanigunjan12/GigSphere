import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getData } from '../utils/storage';
import './HomePage.css';

export default function HomePage() {
  const { user } = useAuth();
  const gigs = getData('gigs') || [];

  const categories = [
    { icon: '🎨', label: 'Creative', desc: 'Design, Photography, Content' },
    { icon: '💻', label: 'Tech', desc: 'Development, IT Support' },
    { icon: '🔧', label: 'Skilled Trades', desc: 'Delivery, Repair, Labour' },
    { icon: '📋', label: 'Admin', desc: 'Data Entry, Assistance' },
  ];

  const steps = [
    { num: '01', icon: '📝', title: 'Sign Up', desc: 'Create your free account as a student or business' },
    { num: '02', icon: '🔍', title: 'Find or Post', desc: 'Browse gigs or post opportunities' },
    { num: '03', icon: '🤝', title: 'Connect', desc: 'Chat, collaborate, and get the job done' },
    { num: '04', icon: '💰', title: 'Get Paid', desc: 'Secure payments after work completion' },
  ];

  const testimonials = [
    { name: 'Priya Verma', rating: 5, text: 'GigSphere helped me find flexible work around my classes. Totally easy!', avatar: '👩‍🎓', tag: 'Entry-Level' },
    { name: 'Ankit Singh', rating: 5, text: 'Perfect for students. Got my first gig the same day I signed up.', avatar: '📸', tag: 'Creative Skills' },
    { name: 'Arit Kinan', rating: 5, text: 'Great platform for finding reliable student talent for our events!', avatar: '🏢', tag: 'Fresh Minds' },
  ];

  return (
    <div className="hp">
      {/* Hero Section */}
      <section className="hp-hero">
        <div className="hp-hero-bg">
          <div className="hp-polygon hp-polygon-1"></div>
          <div className="hp-polygon hp-polygon-2"></div>
          <div className="hp-polygon hp-polygon-3"></div>
          <div className="hp-wave"></div>
        </div>

        <div className="container hp-hero-content">
          <div className="hp-hero-text">
            <h1 className="hp-hero-title">
              <span className="hp-title-work">Work.</span>
              <span className="hp-title-connect">Connect.</span>
              <span className="hp-title-earn">Earn.</span>
            </h1>
            <p className="hp-hero-subtitle">Connecting Students to Local Part-Time Gigs</p>
            <p className="hp-hero-desc">
              Find flexible, short-term jobs that match your skills and schedule with GIGSPHERE.
            </p>
            <div className="hp-hero-actions">
              <Link to={user ? '/gigs' : '/signup'} className="btn btn-gold btn-lg">Find Gigs</Link>
              <Link to={user ? '/post-gig' : '/signup'} className="btn btn-outline btn-lg">Post a Job →</Link>
            </div>
          </div>
          <div className="hp-hero-image">
            <img src="/hero-robot.png" alt="GigSphere - Connecting Talent" className="hp-hero-illustration" />
          </div>
        </div>
      </section>

      {/* Search Bar */}
      <section className="hp-search-section">
        <div className="container">
          <div className="hp-search-bar">
            <span className="hp-search-icon">🔍</span>
            <input type="text" placeholder="Find gigs near you..." className="hp-search-input" readOnly />
            <Link to={user ? '/gigs' : '/login'} className="btn btn-gold">Search</Link>
          </div>
        </div>
      </section>

      {/* Featured Gigs */}
      <section className="hp-gigs-section">
        <div className="container">
          <div className="hp-section-header">
            <h2 className="hp-section-title">Explore Part-Time Gigs Near You</h2>
            <p className="hp-section-desc">Discover short-term jobs that match your skills as Freelance.</p>
            <span className="hp-gig-count">💛 {gigs.length * 12073}</span>
          </div>

          <div className="hp-gigs-grid">
            {gigs.filter(g => g.status === 'open').slice(0, 3).map(gig => (
              <div key={gig.id} className="hp-gig-card">
                <div className="hp-gig-card-img">
                  <span className="hp-gig-card-emoji">
                    {gig.category === 'tech' ? '💻' : gig.category === 'creative' ? '🎨' : gig.category === 'admin' ? '📋' : '🔧'}
                  </span>
                  {gig.urgent && <span className="hp-gig-urgent">Urgent</span>}
                </div>
                <div className="hp-gig-card-body">
                  <div className="hp-gig-card-top">
                    <h3 className="hp-gig-card-title">{gig.title}</h3>
                    <span className="hp-gig-card-pay">{gig.pay}</span>
                  </div>
                  <p className="hp-gig-card-location">📍 {gig.location}</p>
                  <p className="hp-gig-card-duration">⏱ {gig.duration} | {gig.category}</p>
                  <Link to={user ? `/gigs/${gig.id}` : '/login'} className="hp-gig-apply">
                    📋 Apply Now →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="hp-categories">
        <div className="container">
          <h2 className="hp-section-title" style={{ textAlign: 'center' }}>Browse by Category</h2>
          <div className="hp-cat-grid">
            {categories.map(cat => (
              <Link to={user ? '/gigs' : '/signup'} key={cat.label} className="hp-cat-pod">
                <div className="hp-cat-icon">{cat.icon}</div>
                <span className="hp-cat-label">{cat.label}</span>
                <span className="hp-cat-desc">{cat.desc}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="hp-testimonials">
        <div className="container">
          <h2 className="hp-section-title" style={{ textAlign: 'center' }}>Businesses Trust GigSphere For Talent</h2>
          <div className="hp-test-grid">
            {testimonials.map((t, i) => (
              <div key={i} className="hp-test-card">
                <div className="hp-test-header">
                  <span className="hp-test-avatar">{t.avatar}</span>
                  <div>
                    <h4 className="hp-test-name">{t.name}</h4>
                    <div className="hp-test-stars">{'★'.repeat(t.rating)}</div>
                  </div>
                </div>
                <p className="hp-test-text">{t.text}</p>
                <span className="hp-test-tag">{t.tag}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="hp-how">
        <div className="container">
          <h2 className="hp-section-title" style={{ textAlign: 'center' }}>How It Works</h2>
          <div className="hp-steps">
            {steps.map((step, i) => (
              <div key={i} className="hp-step">
                <div className="hp-step-icon">{step.icon}</div>
                <h3 className="hp-step-title">{step.title}</h3>
                <p className="hp-step-desc">{step.desc}</p>
                {i < steps.length - 1 && <div className="hp-step-arrow">→</div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="hp-cta">
        <div className="container hp-cta-content">
          <h2>Ready to get started?</h2>
          <p>Join thousands of students and businesses on GigSphere today.</p>
          <div className="hp-cta-actions">
            <Link to="/signup" className="btn btn-gold btn-lg">Sign Up Free</Link>
            <Link to="/login" className="btn btn-outline btn-lg">Log In</Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="hp-footer">
        <div className="container hp-footer-inner">
          <div className="hp-footer-brand">
            <img src="/logo.png" alt="GigSphere" style={{ width: 36, height: 36, borderRadius: '50%', mixBlendMode: 'multiply' }} />
            <span>Gig<span style={{ color: 'var(--teal)' }}>Sphere</span></span>
          </div>
          <div className="hp-footer-links">
            <a href="#">About</a>
            <a href="#">Contact</a>
            <a href="#">Privacy</a>
            <a href="#">Terms</a>
          </div>
          <p className="hp-footer-copy">© 2026 GigSphere. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
