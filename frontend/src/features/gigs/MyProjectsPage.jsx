import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import { useSocket } from '../../context/SocketContext';
import { useToast, ToastContainer } from '../../components/Toast';
import { Briefcase, IndianRupee, Eye, Calendar, CheckCircle, Shield, Users } from 'lucide-react';

export default function MyProjectsPage() {
    const [hiredProjects, setHiredProjects] = useState([]);
    const [adminProjects, setAdminProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useSelector((state) => state.auth);
    const socket = useSocket();
    const { toasts, addToast, removeToast } = useToast();

    useEffect(() => {
        const fetchMyProjects = async () => {
            try {
                const userId = user._id || user.id;
                
                // Get all my bids that are hired
                const bidsResponse = await api.get('/bids/my-bids');
                const hiredBids = bidsResponse.data.filter(bid => bid.status === 'hired');
                
                // Get all gigs
                const gigsResponse = await api.get('/gigs/all');
                
                // Get gig details for each hired bid
                const hiredWithDetails = hiredBids.map(bid => {
                    const gig = gigsResponse.data.find(g => g._id === bid.gigId._id || g._id === bid.gigId);
                    return gig ? { ...gig, myBid: bid, role: 'hired' } : null;
                }).filter(p => p !== null);
                
                // Get gigs where user is an admin (but not owner and not already hired)
                const adminGigs = gigsResponse.data.filter(gig => {
                    if (!gig.ownerId) return false;
                    const ownerId = gig.ownerId._id || gig.ownerId;
                    const isOwner = ownerId === userId;
                    const isAdmin = gig.admins && gig.admins.some(adminId => {
                        const id = adminId._id || adminId;
                        return id === userId;
                    });
                    const isAlreadyHired = hiredWithDetails.some(p => p._id === gig._id);
                    return !isOwner && isAdmin && !isAlreadyHired;
                }).map(gig => ({ ...gig, role: 'admin' }));
                
                setHiredProjects(hiredWithDetails);
                setAdminProjects(adminGigs);
            } catch (error) {
                console.error('Failed to fetch projects:', error);
                addToast('Failed to fetch your projects', 'error');
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            fetchMyProjects();
        }
    }, [user, addToast]);

    useEffect(() => {
        if (socket && user) {
            const userId = user._id || user.id;
            
            socket.on('bid:hired', ({ freelancerId }) => {
                if (freelancerId === userId) {
                    addToast('Congratulations! You have been hired!', 'success');
                }
            });

            socket.on('gig:adminAssigned', ({ viserId: assignedUserId }) => {
                if (assignedUserId === userId) {
                    addToast('You have been assigned as admin!', 'success');
                }
            });

            return () => {
                socket.off('bid:hired');
                socket.off('gig:adminAssigned');
            };
        }
    }, [socket, user, addToast]);

    const renderProjectCard = (project, role) => (
        <div
            key={project._id}
            className="glass rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:border-indigo-500 dark:hover:border-indigo-400 transition-all transform hover:scale-105"
        >
            <div className="flex items-start justify-between mb-3">
                <h3 className="font-bold text-lg text-gray-900 dark:text-white line-clamp-2">
                    {project.title}
                </h3>
                <div className="flex flex-col gap-2 items-end">
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full flex items-center gap-1 ${
                        project.status === 'completed'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                            : project.status === 'assigned'
                                ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400'
                                : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                    }`}>
                        {project.status}
                    </span>
                    {role === 'admin' ? (
                        <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-400 text-xs rounded-full flex items-center gap-1">
                            <Shield size={12} />
                            Admin
                        </span>
                    ) : (
                        <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 text-xs rounded-full flex items-center gap-1">
                            <CheckCircle size={12} />
                            Hired
                        </span>
                    )}
                </div>
            </div>

            <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                Client: {project.ownerId?.name || 'Unknown'}
            </p>

            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">
                {project.description}
            </p>

            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <IndianRupee className="w-4 h-4 text-green-600 dark:text-green-400" />
                    <span className="text-xl font-bold text-green-600 dark:text-green-400">
                        ${role === 'hired' ? project.myBid?.price : project.budget}
                    </span>
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                    <Calendar size={14} />
                    {new Date(project.createdAt).toLocaleDateString()}
                </div>
            </div>

            <div className="flex gap-2">
                <Link
                    to={`/gigs/${project._id}`}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-slate-800 to-indigo-500 hover:from-slate-900 hover:to-indigo-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all"
                >
                    <Eye size={16} />
                    View Details
                </Link>
                {role === 'admin' && (
                    <Link
                        to="/dashboard"
                        state={{ selectedGigId: project._id }}
                        className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all"
                        title="Manage Bids"
                    >
                        <Users size={16} />
                    </Link>
                )}
            </div>
        </div>
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto mb-4"></div>
                    <p className="text-gray-600 dark:text-gray-400">Loading your projects...</p>
                </div>
            </div>
        );
    }

    const totalProjects = hiredProjects.length + adminProjects.length;

    return (
        <>
            <ToastContainer toasts={toasts} removeToast={removeToast} />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                        Gigs I'm In
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Projects where you've been hired or assigned as admin
                    </p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="glass rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Projects</p>
                                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{totalProjects}</p>
                            </div>
                            <div className="p-3 bg-indigo-600 dark:bg-indigo-500/20 rounded-lg">
                                <Briefcase className="w-6 h-6 text-white dark:text-indigo-400" />
                            </div>
                        </div>
                    </div>
                    <div className="glass rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Hired</p>
                                <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-2">{hiredProjects.length}</p>
                            </div>
                            <div className="p-3 bg-green-600 dark:bg-green-500/20 rounded-lg">
                                <CheckCircle className="w-6 h-6 text-white dark:text-green-400" />
                            </div>
                        </div>
                    </div>
                    <div className="glass rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Admin Roles</p>
                                <p className="text-3xl font-bold text-purple-600 dark:text-purple-400 mt-2">{adminProjects.length}</p>
                            </div>
                            <div className="p-3 bg-purple-600 dark:bg-purple-500/20 rounded-lg">
                                <Shield className="w-6 h-6 text-white dark:text-purple-400" />
                            </div>
                        </div>
                    </div>
                </div>

                {totalProjects === 0 ? (
                    <div className="glass rounded-2xl p-12 text-center border border-gray-200 dark:border-gray-700">
                        <Briefcase className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                            No active projects
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                            Apply to gigs to start working on projects
                        </p>
                        <Link
                            to="/browse"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-slate-800 to-indigo-500 hover:from-slate-900 hover:to-indigo-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
                        >
                            <Briefcase size={20} />
                            Browse Gigs
                        </Link>
                    </div>
                ) : (
                    <>
                        {/* Hired Projects */}
                        {hiredProjects.length > 0 && (
                            <div className="mb-12">
                                <div className="flex items-center gap-3 mb-6">
                                    <CheckCircle className="w-6 h-6 text-green-500" />
                                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                        Projects I'm Hired On
                                    </h2>
                                    <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 rounded-full text-sm font-semibold">
                                        {hiredProjects.length}
                                    </span>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {hiredProjects.map((project) => renderProjectCard(project, 'hired'))}
                                </div>
                            </div>
                        )}

                        {/* Admin Projects */}
                        {adminProjects.length > 0 && (
                            <div>
                                <div className="flex items-center gap-3 mb-6">
                                    <Shield className="w-6 h-6 text-purple-500" />
                                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                        Projects I Administer
                                    </h2>
                                    <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-400 rounded-full text-sm font-semibold">
                                        {adminProjects.length}
                                    </span>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {adminProjects.map((project) => renderProjectCard(project, 'admin'))}
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </>
    );
}