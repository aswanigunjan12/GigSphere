import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getData, setData } from '../utils/storage';
import GigCard from '../components/GigCard';
import RecommendedGigs from '../components/RecommendedGigs';
import './BrowseGigs.css';


export default function BrowseGigsPage() {
  const { user } = useAuth();
  const [gigs, setGigs] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [appliedGigs, setAppliedGigs] = useState([]);

  useEffect(() => {
    setGigs(getData('gigs') || []);
    const apps = getData('applications') || [];
    setAppliedGigs(apps.filter(a => a.studentId === user?.id).map(a => a.gigId));
  }, [user?.id]);

  const handleApply = (gigId) => {
    const apps = getData('applications') || [];
    apps.push({
      id: 'a' + Date.now(),
      gigId,
      studentId: user.id,
      userName: user.name || 'Unknown',
      businessId: gigs.find(g => g.id === gigId)?.businessId,
      status: 'pending',
      appliedAt: new Date().toISOString(),
      coverLetter: 'I am interested in this gig!'
    });
    setData('applications', apps);
    setAppliedGigs([...appliedGigs, gigId]);
  };

  const filtered = gigs.filter(g => {
    if (g.status !== 'open') return false;
    if (category !== 'all' && g.category !== category) return false;
    if (search) {
      const q = search.toLowerCase();
      return g.title.toLowerCase().includes(q) || g.location.toLowerCase().includes(q) ||
        g.skills.some(s => s.toLowerCase().includes(q));
    }
    return true;
  });

  return (
    <div className="browse-page">
      <div className="container">
        <div className="browse-header animate-fade-in-up">
          <h1 className="browse-title">Browse Gigs</h1>
          <p className="browse-subtitle">Find the perfect part-time opportunity</p>
        </div>

        {/* AI Recommendations – students only */}
        <RecommendedGigs
          user={user}
          appliedGigs={appliedGigs}
          onApply={handleApply}
        />

        <div className="browse-filters">
          <div className="browse-search">
            <span>🔍</span>
            <input type="text" placeholder="Search gigs, skills, locations..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <div className="browse-cats">
            {['all', 'creative', 'tech', 'skilled', 'admin'].map(c => (
              <button key={c} className={`browse-cat-btn ${category === c ? 'active' : ''}`} onClick={() => setCategory(c)}>
                {c === 'all' ? '🌐 All' : c === 'creative' ? '🎨 Creative' : c === 'tech' ? '💻 Tech' : c === 'skilled' ? '🔧 Skilled' : '📋 Admin'}
              </button>
            ))}
          </div>
        </div>

        <p className="browse-results">{filtered.length} gig{filtered.length !== 1 ? 's' : ''} found</p>

        <div className="browse-grid">
          {filtered.map(gig => (
            <GigCard key={gig.id} gig={gig} showApply={user?.role === 'student'} applied={appliedGigs.includes(gig.id)} onApply={handleApply} />
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="empty-state">
            <p className="empty-state-icon">🔍</p>
            <p className="empty-state-title">No gigs found</p>
            <p>Try adjusting your search or filters</p>
          </div>
        )}
      </div>
    </div>
  );
}
