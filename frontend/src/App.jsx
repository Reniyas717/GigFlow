import { Routes, Route } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useEffect } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { SocketProvider } from './context/SocketContext';
import { loadUser } from './features/auth/authSlice';
import Navbar from './components/Navbar';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import LandingPage from './features/landing/LandingPage';
import RegisterPage from './features/auth/RegisterPage';
import LoginPage from './features/auth/LoginPage';
import ProfilePage from './features/auth/ProfilePage';
import GigFeed from './features/gigs/GigFeed';
import CreateGigPage from './features/gigs/CreateGigPage';
import GigDetailPage from './features/gigs/GigDetailPage';
import MyGigsPage from './features/gigs/MyGigsPage';
import ClientDashboard from './features/bids/ClientDashboard';
import MyBidsPage from './features/bids/MyBidsPage';

function App() {
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.auth);

  // Load user on app mount to maintain auth across refreshes
  useEffect(() => {
    dispatch(loadUser());
  }, [dispatch]);

  return (
    <ThemeProvider>
      <SocketProvider>
        <div className="min-h-screen">
          <Routes>
            {/* Public Routes - No Navbar */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/login" element={<LoginPage />} />

            {/* Protected Routes - With Navbar and Sidebar */}
            <Route
              path="/browse"
              element={
                <ProtectedRoute>
                  <>
                    <Navbar />
                    <Layout>
                      <GigFeed />
                    </Layout>
                  </>
                </ProtectedRoute>
              }
            />
            <Route
              path="/gigs/:gigId"
              element={
                <ProtectedRoute>
                  <>
                    <Navbar />
                    <Layout>
                      <GigDetailPage />
                    </Layout>
                  </>
                </ProtectedRoute>
              }
            />
            <Route
              path="/create-gig"
              element={
                <ProtectedRoute>
                  <>
                    <Navbar />
                    <Layout>
                      <CreateGigPage />
                    </Layout>
                  </>
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <>
                    <Navbar />
                    <Layout>
                      <ClientDashboard />
                    </Layout>
                  </>
                </ProtectedRoute>
              }
            />
            <Route
              path="/my-gigs"
              element={
                <ProtectedRoute>
                  <>
                    <Navbar />
                    <Layout>
                      <MyGigsPage />
                    </Layout>
                  </>
                </ProtectedRoute>
              }
            />
            <Route
              path="/my-bids"
              element={
                <ProtectedRoute>
                  <>
                    <Navbar />
                    <Layout>
                      <MyBidsPage />
                    </Layout>
                  </>
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <>
                    <Navbar />
                    <Layout>
                      <ProfilePage />
                    </Layout>
                  </>
                </ProtectedRoute>
              }
            />
          </Routes>
        </div>
      </SocketProvider>
    </ThemeProvider>
  );
}

export default App;

