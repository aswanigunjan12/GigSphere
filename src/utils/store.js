// ============================================================
// GigSphere – Central In-Memory Store
// All data lives in localStorage (no database required)
// ============================================================

import { getData, setData } from './storage';

// ─── Platform commission rate ────────────────────────────────
const COMMISSION_RATE = 0.10; // 10%

// Platform earnings accumulator key in localStorage
const PLATFORM_EARNINGS_KEY = 'gs_platform_earnings';

// ============================================================
// RECOMMENDATION ENGINE
// Scoring: +2 per matching skill, +1 same location,
//          +1 matching availability, deduped, top 5
// Fallback: latest open gigs if no skill match
// ============================================================

/**
 * recommendGigs(user, allGigs)
 * @param {object} user  – logged-in student (from AuthContext)
 * @param {Array}  allGigs – full gigs array from localStorage
 * @returns {Array} – up to 5 scored gig objects, sorted desc
 */
export function recommendGigs(user, allGigs) {
  // Only open gigs are eligible
  const openGigs = allGigs.filter((g) => g.status === 'open');

  if (!user || openGigs.length === 0) return openGigs.slice(0, 5);

  const userSkills    = (user.skills || []).map((s) => s.toLowerCase());
  const userLocation  = (user.location || '').toLowerCase();
  const userAvail     = (user.availability || '').toLowerCase();

  // Score every open gig
  const scored = openGigs.map((gig) => {
    let score = 0;

    // +2 for each required skill the student has
    const gigSkills = (gig.skills || []).map((s) => s.toLowerCase());
    gigSkills.forEach((gs) => {
      if (userSkills.some((us) => us.includes(gs) || gs.includes(us))) score += 2;
    });

    // +1 if same location or gig is Remote
    const gigLoc = (gig.location || '').toLowerCase();
    if (gigLoc === 'remote' || (userLocation && gigLoc === userLocation)) score += 1;

    // +1 if the student's availability overlaps with the gig timing
    const gigTiming = (gig.timing || gig.duration || '').toLowerCase();
    if (userAvail && gigTiming && userAvail.includes(gigTiming.split(' ')[0])) score += 1;

    return { ...gig, matchScore: score };
  });

  // Sort by score descending
  scored.sort((a, b) => b.matchScore - a.matchScore);

  // Fallback: if highest score is 0, return latest gigs instead
  if (scored[0]?.matchScore === 0) {
    return [...openGigs]
      .sort((a, b) => new Date(b.postedAt) - new Date(a.postedAt))
      .slice(0, 5)
      .map((g) => ({ ...g, matchScore: null, fallback: true }));
  }

  // Deduplicate by id (safety) and return top 5
  const seen = new Set();
  return scored
    .filter((g) => !seen.has(g.id) && seen.add(g.id))
    .slice(0, 5);
}

// ============================================================
// COMMISSION / PAYMENT SYSTEM
// Platform takes 10% of gig price on every payment
// ============================================================

/**
 * parsePrice(payString)
 * Extracts numeric value from strings like "₹1500/day", "₹200/hr"
 */
function parsePrice(payString) {
  if (!payString) return 0;
  const match = payString.match(/[\d,]+/);
  return match ? parseInt(match[0].replace(/,/g, ''), 10) : 0;
}

/**
 * getPlatformEarnings()
 * Returns the accumulated platform commission from localStorage
 */
export function getPlatformEarnings() {
  return parseInt(localStorage.getItem(PLATFORM_EARNINGS_KEY) || '0', 10);
}

/**
 * addPlatformEarning(amount)
 * Adds commission to the running platform total
 */
function addPlatformEarning(amount) {
  const current = getPlatformEarnings();
  localStorage.setItem(PLATFORM_EARNINGS_KEY, String(current + amount));
  return current + amount;
}

/**
 * calcCommission(payString)
 * Returns breakdown object for a given pay string
 * { gigPrice, commission, studentEarning, commissionRate }
 */
export function calcCommission(payString) {
  const gigPrice      = parsePrice(payString);
  const commission    = Math.round(gigPrice * COMMISSION_RATE);
  const studentEarning = gigPrice - commission;
  return { gigPrice, commission, studentEarning, commissionRate: COMMISSION_RATE * 100 };
}

/**
 * handlePayment(paymentId)
 * Full payment flow:
 *   1. Calculate 10% commission
 *   2. Add commission to platformEarnings
 *   3. Mark payment as completed (with breakdown metadata)
 *   4. Mark the associated gig as completed
 * Returns { success, gigPrice, commission, studentEarning, platformEarnings }
 */
export function handlePayment(paymentId) {
  const allPayments = getData('payments') || [];
  const allGigs     = getData('gigs')     || [];

  // Find the payment record
  const payIdx = allPayments.findIndex((p) => p.id === paymentId);
  if (payIdx === -1) return { success: false, error: 'Payment not found' };

  const payment = allPayments[payIdx];
  if (payment.status === 'completed')
    return { success: false, error: 'Already paid' };

  // Find the related gig to read price
  const gig = allGigs.find((g) => g.id === payment.gigId);
  const payString = gig?.pay || '';
  const { gigPrice, commission, studentEarning } = calcCommission(payString);

  // 1. Update platformEarnings
  const newPlatformEarnings = addPlatformEarning(commission);

  // 2. Mark payment completed and store breakdown
  allPayments[payIdx] = {
    ...payment,
    status:          'completed',
    paidAt:          new Date().toISOString(),
    gigPrice,
    commission,
    studentEarning,
    // amount in payments = studentEarning (what student receives)
    amount:          studentEarning,
  };
  setData('payments', allPayments);

  // 3. Mark gig as completed
  if (gig) {
    const gigIdx = allGigs.findIndex((g) => g.id === payment.gigId);
    if (gigIdx !== -1) {
      allGigs[gigIdx].status = 'completed';
      setData('gigs', allGigs);
    }
  }

  return {
    success:          true,
    gigPrice,
    commission,
    studentEarning,
    platformEarnings: newPlatformEarnings,
  };
}
