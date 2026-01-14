<div align="center">

# GigFlow — Freelance Marketplace Platform

[![Platform](https://img.shields.io/badge/Gig%20Platform-Online-6c5ce7?style=for-the-badge&logo=github&logoColor=white)](https://github.com/Reniyas717/GigFlow)
[![Project](https://img.shields.io/badge/Internship%20Project-2026-4ecdc4?style=for-the-badge&logo=briefcase&logoColor=white)]()

</div>

## Technology Stack

<div align="center">

![React](https://img.shields.io/badge/React-19.x-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-5.x-646cff?style=for-the-badge&logo=vite&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&logo=node.js&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Database-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![Socket.io](https://img.shields.io/badge/Socket.io-Realtime-010101?style=for-the-badge&logo=socket.io&logoColor=white)
![Redux](https://img.shields.io/badge/Redux-Toolkit-764ABC?style=for-the-badge&logo=redux&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind-CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)

</div>

## Overview

GigFlow is a modern freelance marketplace platform that connects clients with skilled freelancers through an intelligent bidding system. Built as a full-stack application for an internship assignment, it provides a seamless user experience for posting gigs, submitting competitive bids, and managing projects in real-time. The platform is split into two main parts:

```
GigFlow/
├── backend/    # Node.js + Express API, MongoDB models, Socket.io real-time features
└── frontend/   # React + Vite client dashboard with Redux state management
```

### Key Features

- 🔐 **Secure Authentication** — JWT-based authentication with cookie management
- 📝 **Gig Management** — Create, browse, and manage gig postings
- 💰 **Smart Bidding System** — Submit and track bids on available gigs
- ⚡ **Real-time Updates** — Socket.io powered live notifications and updates
- 👤 **User Profiles** — Comprehensive user profiles with role-based access
- 🎨 **Modern UI** — Beautiful, responsive interface with Tailwind CSS
- 🌓 **Theme Support** — Light/Dark mode with smooth transitions
- 📊 **Dashboard Analytics** — Track your gigs and bids in dedicated dashboards

## Quick Start

### Prerequisites

- Node.js 18.x or higher
- MongoDB Atlas account or local MongoDB installation
- Git

### Backend

1. Install dependencies:

```bash
cd backend
npm install
```

2. Create a `.env` file in `backend/` with the following variables:

```env
# MongoDB Connection
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/gigflow?retryWrites=true&w=majority

# Server Configuration
PORT=5000
NODE_ENV=development

# JWT Secret (generate a secure random string)
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173
```

3. Start the backend server (development):

```bash
npm run dev
```

The server will start on `http://localhost:5000` (or the port specified in your `.env` file).

Entry point: `backend/server.js`

### Frontend Environment

The frontend uses Vite env variables (prefixed with `VITE_`). Create `frontend/.env` with the following keys:

```env
# API Configuration
VITE_API_URL=http://localhost:5000

# WebSocket URL (for Socket.io)
VITE_SOCKET_URL=http://localhost:5000

# Application Configuration
VITE_APP_NAME=GigFlow
VITE_APP_DESCRIPTION=Freelance Marketplace Platform
```

Keep the `VITE_` prefix — Vite will expose these to the client at build time.

### Frontend (Dashboard)

1. Install & run:

```bash
cd frontend
npm install
npm run dev
```

2. Open `http://localhost:5173` (default Vite port) to view the application.

The frontend will automatically connect to the backend API specified in your `.env` file.

## Project Structure (Notable Files)

### Backend Structure

```
backend/
├── server.js                  # Main entry point, Express setup
├── config/
│   └── db.js                 # MongoDB connection configuration
├── models/
│   ├── User.js               # User schema (clients & freelancers)
│   ├── Gig.js                # Gig posting schema
│   └── Bid.js                # Bid submission schema
├── controllers/
│   ├── authController.js     # Authentication logic (register, login, logout)
│   ├── gigController.js      # Gig CRUD operations
│   └── bidController.js      # Bid management
├── routes/
│   ├── authRoutes.js         # Auth endpoints
│   ├── gigRoutes.js          # Gig endpoints
│   └── bidRoutes.js          # Bid endpoints
├── middleware/
│   └── auth.js               # JWT verification middleware
└── socket/
    └── socketServer.js       # Socket.io real-time configuration
```

### Frontend Structure

```
frontend/
├── src/
│   ├── main.jsx              # Application entry point
│   ├── App.jsx               # Main app component with routing
│   ├── app/
│   │   └── store.js          # Redux store configuration
│   ├── features/
│   │   ├── auth/
│   │   │   ├── authSlice.js        # Auth state management
│   │   │   ├── LoginPage.jsx       # Login interface
│   │   │   ├── RegisterPage.jsx    # Registration interface
│   │   │   └── ProfilePage.jsx     # User profile management
│   │   ├── gigs/
│   │   │   ├── gigSlice.js         # Gig state management
│   │   │   ├── GigFeed.jsx         # Browse all gigs
│   │   │   ├── CreateGigPage.jsx   # Create new gig
│   │   │   ├── GigDetailPage.jsx   # View gig details & bids
│   │   │   └── MyGigsPage.jsx      # User's posted gigs
│   │   ├── bids/
│   │   │   ├── bidSlice.js         # Bid state management
│   │   │   ├── MyBidsPage.jsx      # User's submitted bids
│   │   │   └── ClientDashboard.jsx # Client bid management
│   │   └── landing/
│   │       └── LandingPage.jsx     # Homepage
│   ├── components/
│   │   ├── Layout.jsx        # Main layout wrapper
│   │   ├── Navbar.jsx        # Navigation bar
│   │   ├── Sidebar.jsx       # Sidebar navigation
│   │   ├── Toast.jsx         # Notification component
│   │   ├── ProtectedRoute.jsx # Route protection
│   │   └── LightRays.jsx     # Background animation effect
│   ├── context/
│   │   ├── SocketContext.jsx # Socket.io context provider
│   │   └── ThemeContext.jsx  # Theme management
│   └── utils/
│       └── api.js            # Axios configuration
├── index.html
├── vite.config.js            # Vite configuration
└── package.json
```

## API Examples

Common endpoints (inspect `backend/routes/` for complete list):

### Authentication
```
POST /api/auth/register    # Register new user
POST /api/auth/login       # Login user
POST /api/auth/logout      # Logout user
GET  /api/auth/me          # Get current user
```

### Gigs
```
GET    /api/gigs           # Get all gigs
GET    /api/gigs/:id       # Get specific gig
POST   /api/gigs           # Create new gig (auth required)
PUT    /api/gigs/:id       # Update gig (auth required)
DELETE /api/gigs/:id       # Delete gig (auth required)
GET    /api/gigs/user/me   # Get current user's gigs
```

### Bids
```
GET    /api/bids/gig/:gigId     # Get all bids for a gig
POST   /api/bids                # Submit a bid (auth required)
GET    /api/bids/user/me        # Get current user's bids
PUT    /api/bids/:id/accept     # Accept a bid (auth required)
PUT    /api/bids/:id/reject     # Reject a bid (auth required)
DELETE /api/bids/:id            # Delete bid (auth required)
```

## Features Breakdown

### For Clients
- Post freelance gig opportunities with detailed requirements and budgets
- Review and compare bids from multiple talented freelancers
- Accept or reject bids with real-time notifications
- Track active projects and their status
- Manage posted gigs from a centralized dashboard

### For Freelancers
- Browse available gigs with search and filter options
- Submit competitive bids with custom proposals
- Track bid status and receive instant updates
- View bid history and success rate
- Manage profile and portfolio

### Real-time Features (Socket.io)
- Instant bid notifications
- Live gig updates
- Real-time status changes
- Connected user tracking

## Development

### Running Tests

```bash
# Backend tests (if configured)
cd backend
npm test

# Frontend tests (if configured)
cd frontend
npm test
```

### Building for Production

```bash
# Frontend production build
cd frontend
npm run build

# Preview production build
npm run preview
```

### Environment-specific Configuration

For production deployment, ensure you:
1. Set `NODE_ENV=production` in backend
2. Update `FRONTEND_URL` to your production domain
3. Use strong `JWT_SECRET` (minimum 32 characters)
4. Enable MongoDB connection pooling
5. Configure proper CORS origins
6. Build frontend with `npm run build`

## Contributors & Team

Project created and maintained by:

- Reniyas717 — [GitHub Profile](https://github.com/Reniyas717)

## License

This project was created as part of an internship assignment and is intended for educational and portfolio purposes.

---

<div align="center">

**Built with ♥ for connecting talent with opportunity**

[![GitHub](https://img.shields.io/badge/GitHub-GigFlow-181717?style=for-the-badge&logo=github)](https://github.com/Reniyas717/GigFlow)

</div>