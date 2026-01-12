import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchBidsForGig, hireBid } from './bidSlice';
import api from '../../utils/api';
import { Briefcase, DollarSign, Users, TrendingUp, Eye, CheckCircle, Clock, XCircle } from 'lucide-react';

export default function ClientDashboard() {
  const [myGigs, setMyGigs] = useState([]);
  const [selectedGig, setSelectedGig] = useState(null);
  const [loading, setLoading] = useState(true);

  const dispatch = useDispatch();
  const { bids, loading: bidLoading, error } = useSelector((state) => state.bids);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    const fetchMyGigs = async () => {
      try {
        const response = await api.get('/gigs');
        const userGigs = response.data.filter(gig => gig.ownerId._id === user.id);
        setMyGigs(userGigs);
      } catch (error) {
        console.error('Failed to fetch gigs');
      } finally {
        setLoading(false);
      }
    };
    fetchMyGigs();
  }, [user]);

  const handleViewBids = (gig) => {
    setSelectedGig(gig);
    dispatch(fetchBidsForGig(gig._id));
  };

  const handleHire = async (bidId) => {
    if (window.confirm('Are you sure you want to hire this freelancer?')) {
      const result = await dispatch(hireBid(bidId));
      if (result.type === 'bids/hireBid/fulfilled') {
        alert('Freelancer hired successfully! 🎉');
        // Refresh gigs
        const response = await api.get('/gigs');
        const userGigs = response.data.filter(gig => gig.ownerId._id === user.id);
        setMyGigs(userGigs);
        // Refresh bids
        if (selectedGig) {
          dispatch(fetchBidsForGig(selectedGig._id));
        }
      }
    }
  };

  // Calculate stats
  const stats = {
    totalGigs: myGigs.length,
    openGigs: myGigs.filter(g => g.status === 'open').length,
    closedGigs: myGigs.filter(g => g.status === 'closed').length,
    totalBudget: myGigs.reduce((sum, g) => sum + g.budget, 0),
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
          My Gigs Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage your projects and review bids from talented freelancers
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="glass rounded-xl p-6 border border-gray-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Gigs</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{stats.totalGigs}</p>
            </div>
            <div className="p-3 bg-slate-700 dark:bg-cyan-500/20 rounded-lg">
              <Briefcase className="w-6 h-6 text-white dark:text-cyan-400" />
            </div>
          </div>
        </div>

        <div className="glass rounded-xl p-6 border border-gray-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Open Gigs</p>
              <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-2">{stats.openGigs}</p>
            </div>
            <div className="p-3 bg-green-600 dark:bg-green-500/20 rounded-lg">
              <TrendingUp className="w-6 h-6 text-white dark:text-green-400" />
            </div>
          </div>
        </div>

        <div className="glass rounded-xl p-6 border border-gray-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Closed Gigs</p>
              <p className="text-3xl font-bold text-gray-600 dark:text-gray-400 mt-2">{stats.closedGigs}</p>
            </div>
            <div className="p-3 bg-gray-600 dark:bg-gray-500/20 rounded-lg">
              <CheckCircle className="w-6 h-6 text-white dark:text-gray-400" />
            </div>
          </div>
        </div>

        <div className="glass rounded-xl p-6 border border-gray-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Budget</p>
              <p className="text-3xl font-bold text-cyan-600 dark:text-cyan-400 mt-2">${stats.totalBudget}</p>
            </div>
            <div className="p-3 bg-cyan-600 dark:bg-cyan-500/20 rounded-lg">
              <DollarSign className="w-6 h-6 text-white dark:text-cyan-400" />
            </div>
          </div>
        </div>
      </div>

      {myGigs.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center border border-gray-200 dark:border-slate-700">
          <Briefcase className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            No gigs yet
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Create your first gig to start receiving bids from freelancers
          </p>
          <a
            href="/create-gig"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-slate-800 to-cyan-500 hover:from-slate-900 hover:to-cyan-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
          >
            <Briefcase size={20} />
            Create Your First Gig
          </a>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Your Gigs */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Briefcase className="w-5 h-5 text-slate-700 dark:text-cyan-400" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Your Gigs</h2>
            </div>
            <div className="space-y-4">
              {myGigs.map((gig) => (
                <div
                  key={gig._id}
                  onClick={() => handleViewBids(gig)}
                  className={`glass rounded-xl p-6 border cursor-pointer transition-all transform hover:scale-105 hover:shadow-xl ${selectedGig?._id === gig._id
                      ? 'border-cyan-500 dark:border-cyan-400 shadow-lg'
                      : 'border-gray-200 dark:border-slate-700'
                    }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-bold text-lg text-gray-900 dark:text-white">{gig.title}</h3>
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${gig.status === 'open'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                      }`}>
                      {gig.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                    {gig.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-green-600 dark:text-green-400" />
                      <span className="text-xl font-bold text-green-600 dark:text-green-400">
                        ${gig.budget}
                      </span>
                    </div>
                    <button className="flex items-center gap-1 text-sm text-cyan-600 dark:text-cyan-400 hover:underline">
                      <Eye size={16} />
                      View Bids
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bids Section */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Users className="w-5 h-5 text-slate-700 dark:text-cyan-400" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {selectedGig ? `Bids for "${selectedGig.title}"` : 'Select a gig to view bids'}
              </h2>
            </div>

            {error && (
              <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 rounded-lg">
                <p className="text-red-700 dark:text-red-400 font-medium">{error}</p>
              </div>
            )}

            {bidLoading ? (
              <div className="glass rounded-xl p-12 text-center border border-gray-200 dark:border-slate-700">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto mb-4"></div>
                <p className="text-gray-600 dark:text-gray-400">Loading bids...</p>
              </div>
            ) : selectedGig ? (
              bids.length === 0 ? (
                <div className="glass rounded-xl p-12 text-center border border-gray-200 dark:border-slate-700">
                  <Clock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    No bids yet
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Freelancers will start bidding on your gig soon
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {bids.map((bid) => (
                    <div key={bid._id} className="glass rounded-xl p-6 border border-gray-200 dark:border-slate-700">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-start gap-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-slate-700 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                            {bid.freelancerId.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-gray-900 dark:text-white">{bid.freelancerId.name}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{bid.freelancerId.email}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-600 dark:text-gray-400">Bid Amount</p>
                          <p className="text-2xl font-bold text-green-600 dark:text-green-400">${bid.price}</p>
                        </div>
                      </div>

                      <p className="text-gray-700 dark:text-gray-300 mb-4 bg-gray-50 dark:bg-slate-700/50 p-3 rounded-lg">
                        {bid.message}
                      </p>

                      <div className="flex justify-between items-center">
                        <span className={`px-3 py-1 text-xs font-semibold rounded-full flex items-center gap-1 ${bid.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                            : bid.status === 'hired'
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                              : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                          }`}>
                          {bid.status === 'pending' && <Clock size={12} />}
                          {bid.status === 'hired' && <CheckCircle size={12} />}
                          {bid.status === 'rejected' && <XCircle size={12} />}
                          {bid.status}
                        </span>
                        {bid.status === 'pending' && selectedGig.status === 'open' && (
                          <button
                            onClick={() => handleHire(bid._id)}
                            className="px-6 py-2 bg-gradient-to-r from-slate-800 to-cyan-500 hover:from-slate-900 hover:to-cyan-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
                          >
                            Hire Freelancer
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )
            ) : (
              <div className="glass rounded-xl p-12 text-center border border-gray-200 dark:border-slate-700">
                <Eye className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Select a gig
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Click on any gig to view its bids
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

