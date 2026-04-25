// ============================================
// useGigRecommendations – React hook
// ============================================

import { useState, useEffect } from 'react';
import { getData } from '../utils/storage';
import {
  fetchAIRecommendations,
  getCachedRecommendations,
} from '../utils/gigRecommendations';

export default function useGigRecommendations(student) {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [source, setSource] = useState(null); // 'ai' | 'fallback' | 'cache'

  useEffect(() => {
    if (!student || student.role !== 'student') return;

    let cancelled = false;

    const run = async () => {
      // 1. Serve cache instantly (zero loading flash)
      const cached = getCachedRecommendations(student.id);
      if (cached) {
        setRecommendations(cached);
        setSource('cache');
        return; // skip API call while cache is fresh
      }

      // 2. Fetch fresh recommendations
      setLoading(true);
      setError(null);

      try {
        const allGigs = getData('gigs') || [];
        const result = await fetchAIRecommendations(student, allGigs);
        if (!cancelled) {
          setRecommendations(result.recommendations);
          setSource(result.source);
        }
      } catch (err) {
        if (!cancelled) {
          setError('Could not load recommendations right now.');
          console.error('[useGigRecommendations]', err);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    run();
    return () => { cancelled = true; };
  // Re-run when skills or availability change (profile edits)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [student?.id, JSON.stringify(student?.skills), student?.availability]);

  // Enrich recommendations with full gig objects
  const allGigs = getData('gigs') || [];
  const enriched = recommendations
    .map((rec) => {
      const gig = allGigs.find((g) => g.id === rec.gigId);
      return gig ? { ...rec, gig } : null;
    })
    .filter(Boolean);

  return { enriched, loading, error, source };
}
