import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage';
import StudentDashboard from './pages/StudentDashboard';
import BusinessDashboard from './pages/BusinessDashboard';
import BrowseGigsPage from './pages/BrowseGigsPage';
import GigDetailPage from './pages/GigDetailPage';
import PostGigPage from './pages/PostGigPage';
import ChatPage from './pages/ChatPage';
import PaymentsPage from './pages/PaymentsPage';
import ReviewsPage from './pages/ReviewsPage';
import ProfilePage from './pages/ProfilePage';

function DashboardRouter() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  return user.role === 'student' ? <StudentDashboard /> : <BusinessDashboard />;
}

function AppRoutes() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/dashboard" element={<ProtectedRoute><DashboardRouter /></ProtectedRoute>} />
        <Route path="/gigs" element={<ProtectedRoute><BrowseGigsPage /></ProtectedRoute>} />
        <Route path="/gigs/:id" element={<ProtectedRoute><GigDetailPage /></ProtectedRoute>} />
        <Route path="/post-gig" element={<ProtectedRoute allowedRole="business"><PostGigPage /></ProtectedRoute>} />
        <Route path="/chat/:applicationId" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
        <Route path="/payments" element={<ProtectedRoute><PaymentsPage /></ProtectedRoute>} />
        <Route path="/reviews/:gigId" element={<ProtectedRoute><ReviewsPage /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
