// ============================================
// GigSphere – AI Recommendation Service
// Calls Anthropic Claude API (via Vite proxy)
// Falls back to skill-overlap scoring on error
// ============================================

const ANTHROPIC_API_URL = '/api/anthropic/v1/messages';
const MODEL = 'claude-3-haiku-20240307';
const CACHE_KEY = 'gs_ai_recommendations';
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

// ─── Fallback: pure skill-overlap scorer ───────────────────────────────────
function computeFallbackRecommendations(student, openGigs) {
  const studentSkills = (student.skills || []).map((s) => s.toLowerCase());

  const scored = openGigs.map((gig) => {
    const gigSkills = (gig.skills || []).map((s) => s.toLowerCase());
    const matches = studentSkills.filter((sk) =>
      gigSkills.some((gs) => gs.includes(sk) || sk.includes(gs))
    );
    const locationBonus = gig.location === 'Remote' || gig.location === student.location ? 10 : 0;
    const matchScore = Math.min(
      100,
      Math.round((matches.length / Math.max(gigSkills.length, 1)) * 80 + locationBonus + 10)
    );
    const reason =
      matches.length > 0
        ? `Your ${matches.slice(0, 2).join(' & ')} skills align well with this gig's requirements.`
        : `This gig is a great opportunity to expand your skillset into ${gigSkills.slice(0, 2).join(' & ')}.`;

    return { gigId: gig.id, matchScore, reason };
  });

  return scored
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, 5);
}

// ─── Read cached result ─────────────────────────────────────────────────────
export function getCachedRecommendations(studentId) {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const cache = JSON.parse(raw);
    if (cache.studentId !== studentId) return null;
    if (Date.now() - cache.cachedAt > CACHE_TTL_MS) return null;
    return cache.recommendations;
  } catch {
    return null;
  }
}

// ─── Save to cache ──────────────────────────────────────────────────────────
function cacheRecommendations(studentId, recommendations) {
  try {
    localStorage.setItem(
      CACHE_KEY,
      JSON.stringify({ studentId, recommendations, cachedAt: Date.now() })
    );
  } catch {
    // storage full – silently skip caching
  }
}

// ─── Main entry point ───────────────────────────────────────────────────────
export async function fetchAIRecommendations(student, allGigs) {
  const openGigs = allGigs.filter((g) => g.status === 'open');
  const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;

  // ── No API key → immediate fallback ──
  if (!apiKey) {
    console.warn('[GigSphere AI] VITE_ANTHROPIC_API_KEY not set – using fallback scoring.');
    const recs = computeFallbackRecommendations(student, openGigs);
    cacheRecommendations(student.id, recs);
    return { recommendations: recs, source: 'fallback' };
  }

  // ── Build Claude prompt ──
  const gigsJson = openGigs.map((g) => ({
    id: g.id,
    title: g.title,
    skills: g.skills,
    pay: g.pay,
    location: g.location,
    category: g.category,
    description: g.description.slice(0, 120),
  }));

  const prompt = `You are a smart gig-matching assistant for a platform called GigSphere.

Student Profile:
- Name: ${student.name}
- Skills: ${(student.skills || []).join(', ') || 'General'}
- Availability: ${student.availability || 'Flexible'}
- Location: ${student.location || 'Any'}

Available Open Gigs:
${JSON.stringify(gigsJson, null, 2)}

Task: Rank the top 3 to 5 gigs most relevant for this student.

Return ONLY a valid JSON array with NO markdown, NO explanation, NO code fences. 
Use exactly this format:
[{"gigId":"g1","matchScore":88,"reason":"1–2 sentences why this suits the student."}]

Rules:
- matchScore is an integer 0-100
- Sort by matchScore descending
- Only include gigs from the list above
- Reason must be personalised, mentioning the student's actual skills`;

  try {
    const response = await fetch(ANTHROPIC_API_URL, {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 512,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!response.ok) {
      throw new Error(`Anthropic API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const text = data?.content?.[0]?.text || '';

    // Strip accidental markdown fences
    const clean = text.replace(/```json?/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(clean);

    if (!Array.isArray(parsed)) throw new Error('Response is not an array');

    // Deduplicate by gigId and clamp scores
    const seen = new Set();
    const recs = parsed
      .filter((r) => r.gigId && !seen.has(r.gigId) && seen.add(r.gigId))
      .map((r) => ({ ...r, matchScore: Math.min(100, Math.max(0, Number(r.matchScore))) }))
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 5);

    cacheRecommendations(student.id, recs);
    return { recommendations: recs, source: 'ai' };
  } catch (err) {
    console.warn('[GigSphere AI] Claude call failed, using fallback:', err.message);
    const recs = computeFallbackRecommendations(student, openGigs);
    cacheRecommendations(student.id, recs);
    return { recommendations: recs, source: 'fallback' };
  }
}
