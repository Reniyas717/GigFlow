import { Routes, Route } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/Navbar';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import LandingPage from './features/landing/LandingPage';
import RegisterPage from './features/auth/RegisterPage';
import LoginPage from './features/auth/LoginPage';
import GigFeed from './features/gigs/GigFeed';
import CreateGigPage from './features/gigs/CreateGigPage';
import GigDetailPage from './features/gigs/GigDetailPage';
import ClientDashboard from './features/bids/ClientDashboard';

function App() {
  const { isAuthenticated } = useSelector((state) => state.auth);

  return (
    <ThemeProvider>
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
        </Routes>
      </div>
    </ThemeProvider>
  );
}

export default App;

