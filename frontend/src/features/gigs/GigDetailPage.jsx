import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { submitBid } from '../bids/bidSlice';
import api from '../../utils/api';
import { DollarSign, User, Calendar, MessageSquare, Send, ArrowLeft, CheckCircle } from 'lucide-react';

export default function GigDetailPage() {
  const { gigId } = useParams();
  const [gig, setGig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bidForm, setBidForm] = useState({ message: '', price: '' });
  const [bidSuccess, setBidSuccess] = useState(false);

  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { loading: bidLoading, error: bidError } = useSelector((state) => state.bids);

  useEffect(() => {
    const fetchGig = async () => {
      try {
        const response = await api.get(`/gigs?_id=${gigId}`);
        if (response.data.length > 0) {
          setGig(response.data[0]);
        }
      } catch (error) {
        console.error('Failed to fetch gig');
      } finally {
        setLoading(false);
      }
    };
    fetchGig();
  }, [gigId]);

  const handleBidSubmit = async (e) => {
    e.preventDefault();
    const result = await dispatch(submitBid({
      gigId,
      message: bidForm.message,
      price: Number(bidForm.price)
    }));
    if (result.type === 'bids/submitBid/fulfilled') {
      setBidForm({ message: '', price: '' });
      setBidSuccess(true);
      setTimeout(() => setBidSuccess(false), 5000);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-700"></div>
      </div>
    );
  }

  if (!gig) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Gig not found</h2>
        <Link to="/browse" className="text-slate-700 dark:text-cyan-400 hover:underline">
          ← Back to browse
        </Link>
      </div>
    );
  }

  const isOwner = user && user.id === gig.ownerId._id;

  return (
    <div className="max-w-7xl mx-auto">
      {/* Back Button */}
      <Link
        to="/browse"
        className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6 transition-colors"
      >
        <ArrowLeft size={20} />
        Back to browse
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content - Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Gig Details Card */}
          <div className="glass rounded-2xl p-8 border border-gray-200 dark:border-slate-700">
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                <h1 className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">
                  {gig.title}
                </h1>
                <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    <span>Posted by <span className="font-semibold">{gig.ownerId.name}</span></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(gig.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
              <div className={`px-4 py-2 rounded-full font-semibold text-sm ${gig.status === 'open'
                  ? 'bg-emerald-100 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-300'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400'
                }`}>
                {gig.status === 'open' ? 'Open' : 'Assigned'}
              </div>
            </div>

            <div className="prose dark:prose-invert max-w-none">
              <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">Description</h3>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                {gig.description}
              </p>
            </div>
          </div>

          {/* Owner Message */}
          {isOwner && (
            <div className="p-6 bg-slate-50 dark:bg-blue-900/20 border-l-4 border-slate-700 rounded-lg">
              <p className="text-blue-900 dark:text-blue-300 font-medium">
                This is your gig. Go to <Link to="/dashboard" className="underline font-bold">Dashboard</Link> to view and manage bids.
              </p>
            </div>
          )}
        </div>

        {/* Sidebar - Right Column */}
        <div className="lg:col-span-1 space-y-6">
          {/* Budget Card */}
          <div className="glass rounded-2xl p-6 border border-gray-200 dark:border-slate-700">
            <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">Project Budget</h3>
            <div className="flex items-center gap-2">
              <DollarSign className="w-8 h-8 text-cyan-500 dark:text-cyan-300" />
              <span className="text-4xl font-bold text-cyan-500 dark:text-cyan-300">
                ${gig.budget}
              </span>
            </div>
          </div>

          {/* Bid Form */}
          {!isOwner && user && gig.status === 'open' && (
            <div className="glass rounded-2xl p-6 border border-gray-200 dark:border-slate-700">
              <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
                Submit Your Bid
              </h2>

              {bidSuccess && (
                <div className="mb-6 p-4 bg-cyan-50 dark:bg-cyan-900/20 border-l-4 border-cyan-500 rounded-lg flex items-center gap-2 animate-fade-in">
                  <CheckCircle className="w-5 h-5 text-cyan-500 dark:text-cyan-300" />
                  <p className="text-cyan-600 dark:text-cyan-300 font-medium">Bid submitted successfully!</p>
                </div>
              )}

              {bidError && (
                <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 rounded-lg animate-fade-in">
                  <p className="text-red-700 dark:text-red-400 font-medium">{bidError}</p>
                </div>
              )}

              <form onSubmit={handleBidSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Your Offer ($)
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <DollarSign className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="number"
                      value={bidForm.price}
                      onChange={(e) => setBidForm({ ...bidForm, price: e.target.value })}
                      min="0"
                      step="0.01"
                      className="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-700 border-2 border-gray-200 dark:border-slate-600 rounded-lg focus:outline-none focus:border-slate-700 dark:focus:border-cyan-400 text-gray-900 dark:text-white transition-all"
                      placeholder="Enter your bid amount"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Proposal Message
                  </label>
                  <div className="relative">
                    <MessageSquare className="absolute top-3 left-3 h-5 w-5 text-gray-400" />
                    <textarea
                      value={bidForm.message}
                      onChange={(e) => setBidForm({ ...bidForm, message: e.target.value })}
                      rows="5"
                      className="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-700 border-2 border-gray-200 dark:border-slate-600 rounded-lg focus:outline-none focus:border-slate-700 dark:focus:border-cyan-400 text-gray-900 dark:text-white transition-all resize-none"
                      placeholder="Explain why you're the best fit for this project..."
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={bidLoading}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-slate-800 to-cyan-500 hover:from-slate-800 hover:to-cyan-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  <Send size={20} />
                  {bidLoading ? 'Submitting...' : 'Submit Bid'}
                </button>
              </form>
            </div>
          )}

          {/* Not Logged In Message */}
          {!user && (
            <div className="p-6 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg text-center">
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Please log in to submit a bid
              </p>
              <Link
                to="/login"
                className="inline-block px-6 py-2 bg-slate-700 hover:bg-slate-800 text-white font-semibold rounded-lg transition-all"
              >
                Login
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
