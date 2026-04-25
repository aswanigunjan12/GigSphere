import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getData, setData } from '../utils/storage';
import { handlePayment, calcCommission, getPlatformEarnings } from '../utils/store';
import './PaymentsPage.css';

// ─── Success toast after payment ──────────────────────────
function PaySuccessToast({ result, onClose }) {
  if (!result) return null;
  return (
    <div className="pay-toast animate-fade-in-up">
      <div className="pay-toast-icon">🎉</div>
      <div className="pay-toast-body">
        <h3>Payment Successful!</h3>
        <div className="pay-toast-breakdown">
          <div className="ptb-row">
            <span>Gig Price</span>
            <span>₹{result.gigPrice.toLocaleString()}</span>
          </div>
          <div className="ptb-row ptb-fee">
            <span>Platform Fee (10%)</span>
            <span>−₹{result.commission.toLocaleString()}</span>
          </div>
          <div className="ptb-row ptb-earn">
            <span>Student Receives</span>
            <span>₹{result.studentEarning.toLocaleString()}</span>
          </div>
          <div className="ptb-divider" />
          <div className="ptb-row ptb-platform">
            <span>Platform Total Earnings</span>
            <span>₹{result.platformEarnings.toLocaleString()}</span>
          </div>
        </div>
        <button className="btn btn-sm btn-primary" style={{ marginTop: 12 }} onClick={onClose}>Done ✓</button>
      </div>
    </div>
  );
}

export default function PaymentsPage() {
  const { user } = useAuth();
  const [payments, setPayments]       = useState([]);
  const [refresh, setRefresh]         = useState(0);
  const [successResult, setSuccessResult] = useState(null);
  const [platformEarnings, setPlatformEarnings] = useState(0);

  useEffect(() => {
    const allPayments = getData('payments') || [];
    setPayments(allPayments.filter((p) => p.fromId === user.id || p.toId === user.id));
    setPlatformEarnings(getPlatformEarnings());
  }, [user.id, refresh]);

  // "Pay Now" handler — uses commission-aware handlePayment from store.js
  const handlePay = (paymentId) => {
    const result = handlePayment(paymentId);
    if (result.success) {
      setSuccessResult(result);
      setRefresh((r) => r + 1);
      setPlatformEarnings(result.platformEarnings);
    }
  };

  const isStudent    = user.role === 'student';
  const completed    = payments.filter((p) => p.status === 'completed');
  const pending      = payments.filter((p) => p.status === 'pending');
  const totalAmount  = completed.reduce((s, p) => s + (p.studentEarning ?? p.amount), 0);
  const totalFees    = completed.reduce((s, p) => s + (p.commission ?? 0), 0);
  const pendingAmount = pending.reduce((s, p) => s + (p.amount ?? 0), 0);

  return (
    <div className="payments-page">
      <div className="container">

        {/* Success overlay */}
        {successResult && (
          <div className="pay-overlay">
            <PaySuccessToast result={successResult} onClose={() => setSuccessResult(null)} />
          </div>
        )}

        <h1 className="page-title animate-fade-in-up">Payments</h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: 32 }}>
          {isStudent ? 'Track your earnings & fee breakdown' : 'Manage your gig payments'}
        </p>

        {/* ── Stats row ──────────────────────────────────── */}
        <div className="pay-stats">
          <div className="stat-card">
            <span className="stat-icon">💰</span>
            <span className="stat-value">₹{totalAmount.toLocaleString()}</span>
            <span className="stat-label">{isStudent ? 'You Earned' : 'Total Paid'}</span>
          </div>
          <div className="stat-card">
            <span className="stat-icon">⏳</span>
            <span className="stat-value">₹{pendingAmount.toLocaleString()}</span>
            <span className="stat-label">Pending</span>
          </div>
          <div className="stat-card">
            <span className="stat-icon">📊</span>
            <span className="stat-value">{payments.length}</span>
            <span className="stat-label">Transactions</span>
          </div>
          <div className="stat-card stat-card--platform">
            <span className="stat-icon">🏛️</span>
            <span className="stat-value">₹{platformEarnings.toLocaleString()}</span>
            <span className="stat-label">Platform Earnings</span>
          </div>
        </div>

        {/* ── Payment list ───────────────────────────────── */}
        <div className="pay-list">
          {payments.length === 0 ? (
            <div className="empty-state">
              <p className="empty-state-icon">💸</p>
              <p className="empty-state-title">No payments yet</p>
            </div>
          ) : (
            payments.map((p) => {
              const gig   = (getData('gigs')  || []).find((g) => g.id === p.gigId);
              // Resolve the other party's name from both user stores
              const gsUsers  = getData('users') || [];
              const appUsers = JSON.parse(localStorage.getItem('gigsphere_users') || '[]');
              const allUsers = [...gsUsers, ...appUsers];
              const otherId  = isStudent ? p.fromId : p.toId;
              const other    = allUsers.find((u) => String(u.id) === String(otherId));

              // Title-case helper for user-created gig titles
              const gigTitle = (gig?.title || 'Unknown Gig').replace(/\b\w/g, c => c.toUpperCase());

              // Pre-calculate commission breakdown for pending payments
              const breakdown = p.status === 'pending'
                ? calcCommission(gig?.pay || '')
                : {
                    gigPrice:       p.gigPrice       ?? p.amount,
                    commission:     p.commission     ?? 0,
                    studentEarning: p.studentEarning ?? p.amount,
                  };

              return (
                <div key={p.id} className="pay-item card">
                  <div className="pay-item-info">
                    <h3>{gigTitle}</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                      {isStudent ? `From: ${other?.name || gig?.businessName || 'Business'}` : `To: ${other?.name || 'Student'}`}
                    </p>

                    {/* Earnings breakdown table */}
                    <div className="pay-breakdown">
                      <div className="pb-row">
                        <span>Gig Price</span>
                        <span>₹{(breakdown.gigPrice || 0).toLocaleString()}</span>
                      </div>
                      <div className="pb-row pb-fee">
                        <span>Platform Fee (10%)</span>
                        <span>−₹{(breakdown.commission || 0).toLocaleString()}</span>
                      </div>
                      <div className="pb-row pb-earn">
                        <span>{isStudent ? 'You Earn' : 'Student Receives'}</span>
                        <span>₹{(breakdown.studentEarning || 0).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pay-item-right">
                    <span className="pay-amount">
                      ₹{(breakdown.studentEarning || 0).toLocaleString()}
                    </span>
                    <span className={`badge badge-${p.status === 'completed' ? 'accepted' : 'pending'}`}>
                      {p.status}
                    </span>
                    {/* Business pays — triggers full commission flow */}
                    {!isStudent && p.status === 'pending' && (
                      <button
                        onClick={() => handlePay(p.id)}
                        className="btn btn-gold btn-sm"
                      >
                        Pay Now →
                      </button>
                    )}
                    {/* Student can also rate after payment */}
                    {isStudent && p.status === 'completed' && gig && (
                      <a href={`/reviews/${gig.id}`} className="btn btn-sm btn-outline-white">
                        ⭐ Rate
                      </a>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* ── Fees summary (student only) ─────────────────── */}
        {isStudent && completed.length > 0 && (
          <div className="pay-fees-summary card">
            <h3 style={{ fontWeight: 700, marginBottom: 12 }}>Earnings Summary</h3>
            <div className="pb-row">
              <span>Gross Gig Value</span>
              <span>₹{(totalAmount + totalFees).toLocaleString()}</span>
            </div>
            <div className="pb-row pb-fee">
              <span>Total Platform Fees (10%)</span>
              <span>−₹{totalFees.toLocaleString()}</span>
            </div>
            <div className="pb-row pb-earn">
              <span>Net You Earned</span>
              <span>₹{totalAmount.toLocaleString()}</span>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
