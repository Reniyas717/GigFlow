import { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import Navbar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'
import RegisterPage from './features/auth/RegisterPage'
import LoginPage from './features/auth/LoginPage'
import GigFeed from './features/gigs/GigFeed'
import CreateGigPage from './features/gigs/CreateGigPage'
import GigDetailPage from './features/gigs/GigDetailPage'
import ClientDashboard from './features/bids/ClientDashboard'
import { store } from './app/store.js'
import { BrowserRouter } from 'react-router-dom'
import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  const [count, setCount] = useState(0)
  return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/" element={<GigFeed />} />
            <Route path="/gigs/:gigId" element={<GigDetailPage />} />
            <Route
              path="/create-gig"
              element={
                <ProtectedRoute>
                  <CreateGigPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <ClientDashboard />
                </ProtectedRoute>
              }
            />
          </Routes>
        </main>
      </div>
  )
}

export default App
