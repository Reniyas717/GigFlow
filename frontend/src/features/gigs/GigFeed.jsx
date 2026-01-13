import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchGigs } from './gigSlice';
import { useSocket } from '../../context/SocketContext';
import { useToast, ToastContainer } from '../../components/Toast';
import { Search, Briefcase, DollarSign, User } from 'lucide-react';

export default function GigFeed() {
  const [search, setSearch] = useState('');
  const dispatch = useDispatch();
  const { gigs, loading, error } = useSelector((state) => state.gigs);
  const socket = useSocket();
  const { toasts, addToast, removeToast } = useToast();

  useEffect(() => {
    dispatch(fetchGigs());
  }, [dispatch]);

  // Listen for real-time gig creation
  useEffect(() => {
    if (socket) {
      socket.on('gig:created', (newGig) => {
        console.log('📢 New gig received:', newGig.title);
        // Refresh gigs to include the new one
        dispatch(fetchGigs());
        addToast(`New gig available: ${newGig.title}`, 'success');
      });

      return () => socket.off('gig:created');
    }
  }, [socket, dispatch, addToast]);

  const handleSearch = (e) => {
    e.preventDefault();
    dispatch(fetchGigs(search));
  };

  return (
    <>
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 text-gray-900 dark:text-white">
            Browse Open Gigs
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Find your next opportunity from {gigs.length} available projects
          </p>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="mb-8">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search gigs by title..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-32 py-4 bg-white dark:bg-slate-800 border-2 border-gray-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-slate-700 dark:focus:border-cyan-400 text-gray-900 dark:text-white text-lg transition-all shadow-sm"
            />
            <button
              type="submit"
              className="absolute right-2 top-2 px-6 py-2 bg-gradient-to-r from-slate-800 to-cyan-500 hover:from-slate-800 hover:to-cyan-600 text-white font-semibold rounded-lg transition-all transform hover:scale-105"
            >
              Search
            </button>
          </div>
        </form>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 rounded-lg animate-fade-in">
            <p className="text-red-700 dark:text-red-400 font-medium">{error}</p>
          </div>
        )}

        {/* Loading Skeletons */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="glass rounded-2xl p-6 animate-pulse">
                <div className="h-6 bg-gray-300 dark:bg-slate-600 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-gray-300 dark:bg-slate-600 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-300 dark:bg-slate-600 rounded w-5/6 mb-4"></div>
                <div className="flex justify-between items-center">
                  <div className="h-8 bg-gray-300 dark:bg-slate-600 rounded w-24"></div>
                  <div className="h-10 bg-gray-300 dark:bg-slate-600 rounded w-28"></div>
                </div>
              </div>
            ))}
          </div>
        ) : gigs.length === 0 ? (
          /* Empty State */
          <div className="text-center py-16">
            <Briefcase className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              No gigs found
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {search ? 'Try adjusting your search terms' : 'Check back later for new opportunities'}
            </p>
          </div>
        ) : (
          /* Gig Cards Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {gigs.map((gig) => (
              <div
                key={gig._id}
                className="glass rounded-2xl p-6 hover:shadow-2xl transform hover:scale-105 transition-all duration-300 border border-gray-200 dark:border-slate-700 group"
              >
                {/* Title */}
                <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white group-hover:text-slate-700 dark:group-hover:text-cyan-400 transition-colors line-clamp-2">
                  {gig.title}
                </h3>

                {/* Description */}
                <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-3 text-sm">
                  {gig.description}
                </p>

                {/* Budget */}
                <div className="flex items-center gap-2 mb-4 p-3 bg-cyan-50 dark:bg-cyan-900/20 rounded-lg">
                  <DollarSign className="w-5 h-5 text-cyan-500 dark:text-cyan-300" />
                  <span className="text-2xl font-bold text-cyan-500 dark:text-cyan-300">
                    ${gig.budget}
                  </span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">budget</span>
                </div>

                {/* Posted By */}
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-4">
                  <User className="w-4 h-4" />
                  <span>Posted by <span className="font-semibold">{gig.ownerId.name}</span></span>
                </div>

                {/* View Details Button */}
                <Link
                  to={`/gigs/${gig._id}`}
                  className="block w-full px-4 py-3 bg-gradient-to-r from-slate-800 to-cyan-500 hover:from-slate-800 hover:to-cyan-600 text-white text-center font-semibold rounded-lg transition-all transform hover:scale-105 shadow-lg"
                >
                  View Details
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
