import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import { useSocket } from '../../context/SocketContext';
import { useToast, ToastContainer } from '../../components/Toast';
import { Briefcase, DollarSign, Eye, Calendar, TrendingUp, CheckCircle } from 'lucide-react';

export default function MyGigsPage() {
    const [myGigs, setMyGigs] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useSelector((state) => state.auth);
    const socket = useSocket();
    const { toasts, addToast, removeToast } = useToast();

    useEffect(() => {
        const fetchMyGigs = async () => {
            try {
                const response = await api.get('/gigs/all');
                // Filter gigs created by current user
                const userGigs = response.data.filter(gig => {
                    if (!gig.ownerId) return false;
                    const ownerId = gig.ownerId._id || gig.ownerId;
                    return ownerId === user.id;
                });
                setMyGigs(userGigs);
            } catch (error) {
                console.error('Failed to fetch gigs:', error);
            } finally {
                setLoading(false);
            }
        };
        if (user) {
            fetchMyGigs();
        }
    }, [user]);

    // Listen for real-time bid submissions and hires
    useEffect(() => {
        if (socket && user) {
            socket.on('bid:submitted', ({ gigOwnerId }) => {
                if (gigOwnerId === user.id) {
                    // Refresh gigs to update bid count
                    const fetchGigs = async () => {
                        const response = await api.get('/gigs');
                        const userGigs = response.data.filter(gig => gig.ownerId._id === user.id);
                        setMyGigs(userGigs);
                    };
                    fetchGigs();
                    addToast('New bid received!', 'info');
                }
            });

            socket.on('bid:hired', ({ gigOwnerId }) => {
                if (gigOwnerId === user.id) {
                    // Refresh gigs to update status
                    const fetchGigs = async () => {
                        const response = await api.get('/gigs');
                        const userGigs = response.data.filter(gig => gig.ownerId._id === user.id);
                        setMyGigs(userGigs);
                    };
                    fetchGigs();
                }
            });

            return () => {
                socket.off('bid:submitted');
                socket.off('bid:hired');
            };
        }
    }, [socket, user, addToast]);

    const stats = {
        totalGigs: myGigs.length,
        openGigs: myGigs.filter(g => g.status === 'open').length,
        assignedGigs: myGigs.filter(g => g.status === 'assigned').length,
        totalBudget: myGigs.reduce((sum, g) => sum + g.budget, 0),
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto mb-4"></div>
                    <p className="text-gray-600 dark:text-gray-400">Loading your gigs...</p>
                </div>
            </div>
        );
    }

    return (
        <>
            <ToastContainer toasts={toasts} removeToast={removeToast} />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                        My Gigs
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Manage all the gigs you've created
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
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Open</p>
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
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Assigned</p>
                                <p className="text-3xl font-bold text-cyan-600 dark:text-cyan-400 mt-2">{stats.assignedGigs}</p>
                            </div>
                            <div className="p-3 bg-cyan-600 dark:bg-cyan-500/20 rounded-lg">
                                <CheckCircle className="w-6 h-6 text-white dark:text-cyan-400" />
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

                {/* Gigs List */}
                {myGigs.length === 0 ? (
                    <div className="glass rounded-2xl p-12 text-center border border-gray-200 dark:border-slate-700">
                        <Briefcase className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                            No gigs yet
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                            Create your first gig to start receiving bids
                        </p>
                        <Link
                            to="/create-gig"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-slate-800 to-cyan-500 hover:from-slate-900 hover:to-cyan-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
                        >
                            <Briefcase size={20} />
                            Create Your First Gig
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {myGigs.map((gig) => (
                            <div
                                key={gig._id}
                                className="glass rounded-xl p-6 border border-gray-200 dark:border-slate-700 hover:border-cyan-500 dark:hover:border-cyan-400 transition-all transform hover:scale-105"
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <h3 className="font-bold text-lg text-gray-900 dark:text-white line-clamp-2">
                                        {gig.title}
                                    </h3>
                                    <span className={`px-3 py-1 text-xs font-semibold rounded-full whitespace-nowrap ${gig.status === 'open'
                                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                        : gig.status === 'assigned'
                                            ? 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-400'
                                            : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                                        }`}>
                                        {gig.status}
                                    </span>
                                </div>

                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">
                                    {gig.description}
                                </p>

                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-2">
                                        <DollarSign className="w-4 h-4 text-green-600 dark:text-green-400" />
                                        <span className="text-xl font-bold text-green-600 dark:text-green-400">
                                            ${gig.budget}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                                        <Calendar size={14} />
                                        {new Date(gig.createdAt).toLocaleDateString()}
                                    </div>
                                </div>

                                <Link
                                    to="/dashboard"
                                    state={{ selectedGigId: gig._id }}
                                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-slate-800 to-cyan-500 hover:from-slate-900 hover:to-cyan-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all"
                                >
                                    <Eye size={16} />
                                    View Bids
                                </Link>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}
