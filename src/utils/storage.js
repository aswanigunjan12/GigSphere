// ============================================
// GigSphere – localStorage Helpers
// ============================================

import { mockUsers, mockGigs, mockApplications, mockMessages, mockPayments, mockReviews } from '../data/mockData';

const KEYS = {
  users: 'gs_users',
  gigs: 'gs_gigs',
  applications: 'gs_applications',
  messages: 'gs_messages',
  payments: 'gs_payments',
  reviews: 'gs_reviews',
  session: 'gs_session',
};

const DATA_VERSION = 'v3'; // bump this when mock data schema changes

export function initData() {
  const currentVersion = localStorage.getItem('gs_data_version');

  // Always seed users if missing
  if (!localStorage.getItem(KEYS.users)) {
    localStorage.setItem(KEYS.users, JSON.stringify(mockUsers));
  }

  // Re-seed gigs + applications on version bump so businessName / userName are added
  if (currentVersion !== DATA_VERSION) {
    // Merge: keep any user-posted gigs (id starts with 'g' + many digits = timestamp)
    const existingGigs = JSON.parse(localStorage.getItem(KEYS.gigs) || '[]');
    const userPostedGigs = existingGigs.filter(g => g.id.length > 5); // timestamp IDs are long
    // Backfill businessName on user-posted gigs that are missing it
    const backfilledUserGigs = userPostedGigs.map(g => {
      if (!g.businessName) {
        const allUsers = JSON.parse(localStorage.getItem('gigsphere_users') || '[]');
        const biz = allUsers.find(u => String(u.id) === String(g.businessId));
        return { ...g, businessName: biz?.name || 'Unknown Business' };
      }
      return g;
    });
    localStorage.setItem(KEYS.gigs, JSON.stringify([...mockGigs, ...backfilledUserGigs]));

    // Merge: keep any user-submitted applications (id is long timestamp)
    const existingApps = JSON.parse(localStorage.getItem(KEYS.applications) || '[]');
    const userApps = existingApps.filter(a => a.id.length > 5);
    // Backfill userName on user-submitted apps missing it
    const backfilledUserApps = userApps.map(a => {
      if (!a.userName) {
        const gsUsers = JSON.parse(localStorage.getItem(KEYS.users) || '[]');
        const appUsers = JSON.parse(localStorage.getItem('gigsphere_users') || '[]');
        const student = [...gsUsers, ...appUsers].find(u => String(u.id) === String(a.studentId));
        return { ...a, userName: student?.name || 'Unknown Applicant' };
      }
      return a;
    });
    localStorage.setItem(KEYS.applications, JSON.stringify([...mockApplications, ...backfilledUserApps]));

    // Merge: keep user-created messages (id is long timestamp)
    const existingMsgs = JSON.parse(localStorage.getItem(KEYS.messages) || '[]');
    const userMsgs = existingMsgs.filter(m => m.id.length > 5);
    localStorage.setItem(KEYS.messages, JSON.stringify([...mockMessages, ...userMsgs]));

    // Merge: keep user-created payments (id is long timestamp)
    const existingPayments = JSON.parse(localStorage.getItem(KEYS.payments) || '[]');
    const userPayments = existingPayments.filter(p => p.id.length > 5);
    localStorage.setItem(KEYS.payments, JSON.stringify([...mockPayments, ...userPayments]));

    // Merge: keep user-created reviews (id is long timestamp) + backfill reviewerName
    const existingReviews = JSON.parse(localStorage.getItem(KEYS.reviews) || '[]');
    const userReviews = existingReviews.filter(r => r.id.length > 5).map(r => {
      if (!r.reviewerName) {
        const gsUsers = JSON.parse(localStorage.getItem(KEYS.users) || '[]');
        const appUsers = JSON.parse(localStorage.getItem('gigsphere_users') || '[]');
        const reviewer = [...gsUsers, ...appUsers].find(u => String(u.id) === String(r.reviewerId));
        return { ...r, reviewerName: reviewer?.name || 'Anonymous' };
      }
      return r;
    });
    localStorage.setItem(KEYS.reviews, JSON.stringify([...mockReviews, ...userReviews]));

    localStorage.setItem('gs_data_version', DATA_VERSION);
  } else {
    // Even on normal load (no version bump), seed any missing keys
    if (!localStorage.getItem(KEYS.messages)) {
      localStorage.setItem(KEYS.messages, JSON.stringify(mockMessages));
    }
    if (!localStorage.getItem(KEYS.payments)) {
      localStorage.setItem(KEYS.payments, JSON.stringify(mockPayments));
    }
    if (!localStorage.getItem(KEYS.reviews)) {
      localStorage.setItem(KEYS.reviews, JSON.stringify(mockReviews));
    }
  }
}

export function getData(key) {
  const raw = localStorage.getItem(KEYS[key] || key);
  return raw ? JSON.parse(raw) : [];
}

export function setData(key, value) {
  localStorage.setItem(KEYS[key] || key, JSON.stringify(value));
}

export function getSession() {
  const raw = localStorage.getItem(KEYS.session);
  return raw ? JSON.parse(raw) : null;
}

export function setSession(user) {
  localStorage.setItem(KEYS.session, JSON.stringify(user));
}

export function clearSession() {
  localStorage.removeItem(KEYS.session);
}
