import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import api from '../../utils/api';
import { useToast, ToastContainer } from '../../components/Toast';
import { User, Mail, Calendar, Briefcase, CheckCircle, IndianRupee, Award, TrendingUp } from 'lucide-react';

export default function ProfilePage() {
    const { user } = useSelector((state) => state.auth);
    const dispatch = useDispatch();
    const { toasts, addToast, removeToast } = useToast();
    
    const [stats, setStats] = useState({
        totalBids: 0,
        hiredBids: 0,
        completedProjects: 0,
        totalEarnings: 0,
        createdGigs: 0,
        completedGigsAsOwner: 0
    });
    const [loading, setLoading] = useState(true);
    const [completedProjects, setCompletedProjects] = useState([]);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const userId = user._id || user.id;

                // Fetch user's bids
                const bidsResponse = await api.get('/bids/my-bids');
                const bids = bidsResponse.data;
                
                const hiredBids = bids.filter(bid => bid.status === 'hired');
                
                // Fetch all gigs to get completed projects
                const gigsResponse = await api.get('/gigs/all');
                const allGigs = gigsResponse.data;
                
                // Gigs created by user
                const createdGigs = allGigs.filter(gig => {
                    const ownerId = gig.ownerId?._id || gig.ownerId;
                    return ownerId === userId;
                });
                
                // Completed gigs created by user
                const completedGigsAsOwner = createdGigs.filter(gig => gig.status === 'completed');
                
                // Projects user was hired on that are now completed
                const completedAsFreelancer = hiredBids.filter(bid => {
                    const gig = allGigs.find(g => g._id === (bid.gigId?._id || bid.gigId));
                    return gig?.status === 'completed';
                }).map(bid => {
                    const gig = allGigs.find(g => g._id === (bid.gigId?._id || bid.gigId));
                    return { ...gig, myBid: bid };
                });

                // Calculate total earnings from completed projects
                const totalEarnings = completedAsFreelancer.reduce((sum, project) => {
                    return sum + (project.myBid?.price || 0);
                }, 0);

                setStats({
                    totalBids: bids.length,
                    hiredBids: hiredBids.length,
                    completedProjects: completedAsFreelancer.length,
                    totalEarnings,
                    createdGigs: createdGigs.length,
                    completedGigsAsOwner: completedGigsAsOwner.length
                });

                setCompletedProjects(completedAsFreelancer);
            } catch (error) {
                console.error('Failed to fetch stats:', error);
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            fetchStats();
        }
    }, [user]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto mb-4"></div>
                    <p className="text-gray-600 dark:text-gray-400">Loading profile...</p>
                </div>
            </div>
        );
    }

    return (
        <>
            <ToastContainer toasts={toasts} removeToast={removeToast} />
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Profile Header */}
                <div className="glass rounded-2xl p-8 border border-gray-200 dark:border-gray-700 mb-8">
                    <div className="flex items-center gap-6">
                        <div className="w-24 h-24 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white text-4xl font-bold shadow-lg">
                            {user?.name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                                {user?.name || 'User'}
                            </h1>
                            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                                <Mail size={18} />
                                <span>{user?.email}</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-500 dark:text-gray-500 mt-1">
                                <Calendar size={16} />
                                <span>Joined {new Date(user?.createdAt || Date.now()).toLocaleDateString()}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    <div className="glass rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Bids</p>
                                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{stats.totalBids}</p>
                            </div>
                            <div className="p-3 bg-indigo-600 dark:bg-indigo-500/20 rounded-lg">
                                <Briefcase className="w-6 h-6 text-white dark:text-indigo-400" />
                            </div>
                        </div>
                    </div>

                    <div className="glass rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Times Hired</p>
                                <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-2">{stats.hiredBids}</p>
                            </div>
                            <div className="p-3 bg-green-600 dark:bg-green-500/20 rounded-lg">
                                <CheckCircle className="w-6 h-6 text-white dark:text-green-400" />
                            </div>
                        </div>
                    </div>

                    <div className="glass rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Completed Projects</p>
                                <p className="text-3xl font-bold text-purple-600 dark:text-purple-400 mt-2">{stats.completedProjects}</p>
                            </div>
                            <div className="p-3 bg-purple-600 dark:bg-purple-500/20 rounded-lg">
                                <Award className="w-6 h-6 text-white dark:text-purple-400" />
                            </div>
                        </div>
                    </div>

                    <div className="glass rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Earnings</p>
                                <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-2">₹{stats.totalEarnings}</p>
                            </div>
                            <div className="p-3 bg-green-600 dark:bg-green-500/20 rounded-lg">
                                <IndianRupee className="w-6 h-6 text-white dark:text-green-400" />
                            </div>
                        </div>
                    </div>

                    <div className="glass rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Gigs Created</p>
                                <p className="text-3xl font-bold text-purple-600 dark:text-blue-400 mt-2">{stats.createdGigs}</p>
                            </div>
                            <div className="p-3 bg-purple-600 dark:bg-blue-500/20 rounded-lg">
                                <TrendingUp className="w-6 h-6 text-white dark:text-blue-400" />
                            </div>
                        </div>
                    </div>

                    <div className="glass rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Gigs Completed (Owner)</p>
                                <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400 mt-2">{stats.completedGigsAsOwner}</p>
                            </div>
                            <div className="p-3 bg-emerald-600 dark:bg-emerald-500/20 rounded-lg">
                                <CheckCircle className="w-6 h-6 text-white dark:text-emerald-400" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Completed Projects Section */}
                {completedProjects.length > 0 && (
                    <div className="glass rounded-2xl p-8 border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-3 mb-6">
                            <Award className="w-6 h-6 text-purple-500" />
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                Completed Projects
                            </h2>
                            <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-400 rounded-full text-sm font-semibold">
                                {completedProjects.length}
                            </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {completedProjects.map((project) => (
                                <div
                                    key={project._id}
                                    className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl border border-purple-200 dark:border-purple-700"
                                >
                                    <div className="flex items-start justify-between mb-2">
                                        <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-1">
                                            {project.title}
                                        </h3>
                                        <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 text-xs rounded-full flex items-center gap-1">
                                            <CheckCircle size={12} />
                                            Completed
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                                        {project.description}
                                    </p>
                                    <div className="flex items-center justify-between">
                                        <span className="text-green-600 dark:text-green-400 font-bold">
                                            Earned: ₹{project.myBid?.price}
                                        </span>
                                        <span className="text-xs text-gray-500 dark:text-gray-400">
                                            {project.completedAt && new Date(project.completedAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Empty State for Completed Projects */}
                {completedProjects.length === 0 && (
                    <div className="glass rounded-2xl p-8 border border-gray-200 dark:border-gray-700 text-center">
                        <Award className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                            No completed projects yet
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400">
                            Complete gigs to build your portfolio and track your earnings
                        </p>
                    </div>
                )}
            </div>
        </>
    );
}
