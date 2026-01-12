import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import { MessageSquare, DollarSign, Clock, CheckCircle, XCircle, Eye, Briefcase } from 'lucide-react';

export default function MyBidsPage() {
    const [myBids, setMyBids] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // all, pending, hired, rejected
    const { user } = useSelector((state) => state.auth);

    useEffect(() => {
        const fetchMyBids = async () => {
            try {
                const response = await api.get('/bids');
                // Filter bids by current user
                const userBids = response.data.filter(bid => bid.freelancerId._id === user.id || bid.freelancerId === user.id);
                setMyBids(userBids);
            } catch (error) {
                console.error('Failed to fetch bids');
            } finally {
                setLoading(false);
            }
        };
        fetchMyBids();
    }, [user]);

    const filteredBids = filter === 'all'
        ? myBids
        : myBids.filter(bid => bid.status === filter);

    const stats = {
        total: myBids.length,
        pending: myBids.filter(b => b.status === 'pending').length,
        hired: myBids.filter(b => b.status === 'hired').length,
        rejected: myBids.filter(b => b.status === 'rejected').length,
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto mb-4"></div>
                    <p className="text-gray-600 dark:text-gray-400">Loading your bids...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                    My Bids
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                    Track all your submitted bids and their status
                </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="glass rounded-xl p-6 border border-gray-200 dark:border-slate-700">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Bids</p>
                            <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{stats.total}</p>
                        </div>
                        <div className="p-3 bg-slate-700 dark:bg-cyan-500/20 rounded-lg">
                            <MessageSquare className="w-6 h-6 text-white dark:text-cyan-400" />
                        </div>
                    </div>
                </div>

                <div className="glass rounded-xl p-6 border border-gray-200 dark:border-slate-700">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending</p>
                            <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400 mt-2">{stats.pending}</p>
                        </div>
                        <div className="p-3 bg-yellow-600 dark:bg-yellow-500/20 rounded-lg">
                            <Clock className="w-6 h-6 text-white dark:text-yellow-400" />
                        </div>
                    </div>
                </div>

                <div className="glass rounded-xl p-6 border border-gray-200 dark:border-slate-700">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Hired</p>
                            <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-2">{stats.hired}</p>
                        </div>
                        <div className="p-3 bg-green-600 dark:bg-green-500/20 rounded-lg">
                            <CheckCircle className="w-6 h-6 text-white dark:text-green-400" />
                        </div>
                    </div>
                </div>

                <div className="glass rounded-xl p-6 border border-gray-200 dark:border-slate-700">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Rejected</p>
                            <p className="text-3xl font-bold text-red-600 dark:text-red-400 mt-2">{stats.rejected}</p>
                        </div>
                        <div className="p-3 bg-red-600 dark:bg-red-500/20 rounded-lg">
                            <XCircle className="w-6 h-6 text-white dark:text-red-400" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 mb-6">
                {['all', 'pending', 'hired', 'rejected'].map((status) => (
                    <button
                        key={status}
                        onClick={() => setFilter(status)}
                        className={`px-4 py-2 rounded-lg font-semibold transition-all ${filter === status
                                ? 'bg-gradient-to-r from-slate-800 to-cyan-500 text-white shadow-lg'
                                : 'bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700'
                            }`}
                    >
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                    </button>
                ))}
            </div>

            {/* Bids List */}
            {filteredBids.length === 0 ? (
                <div className="glass rounded-2xl p-12 text-center border border-gray-200 dark:border-slate-700">
                    <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                        {filter === 'all' ? 'No bids yet' : `No ${filter} bids`}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                        {filter === 'all'
                            ? 'Start bidding on gigs to see them here'
                            : `You don't have any ${filter} bids at the moment`
                        }
                    </p>
                    <Link
                        to="/browse"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-slate-800 to-cyan-500 hover:from-slate-900 hover:to-cyan-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
                    >
                        <Briefcase size={20} />
                        Browse Gigs
                    </Link>
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredBids.map((bid) => (
                        <div key={bid._id} className="glass rounded-xl p-6 border border-gray-200 dark:border-slate-700">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex-1">
                                    <Link
                                        to={`/gigs/${bid.gigId._id}`}
                                        className="text-xl font-bold text-gray-900 dark:text-white hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors"
                                    >
                                        {bid.gigId.title}
                                    </Link>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                        Posted by {bid.gigId.ownerId.name}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Your Bid</p>
                                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">${bid.price}</p>
                                </div>
                            </div>

                            <div className="bg-gray-50 dark:bg-slate-700/50 p-4 rounded-lg mb-4">
                                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Your Proposal:</p>
                                <p className="text-gray-700 dark:text-gray-300">{bid.message}</p>
                            </div>

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
                                    {bid.status.charAt(0).toUpperCase() + bid.status.slice(1)}
                                </span>
                                <Link
                                    to={`/gigs/${bid.gigId._id}`}
                                    className="flex items-center gap-1 text-sm text-cyan-600 dark:text-cyan-400 hover:underline"
                                >
                                    <Eye size={16} />
                                    View Gig
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
