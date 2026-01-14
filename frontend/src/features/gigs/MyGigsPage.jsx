import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import { useSocket } from '../../context/SocketContext';
import { useToast, ToastContainer } from '../../components/Toast';
import { Briefcase, Eye, Calendar, TrendingUp, CheckCircle, Users, Shield, Trash2, AlertTriangle, X } from 'lucide-react';

export default function MyGigsPage() {
    const [myGigs, setMyGigs] = useState([]);
    const [adminGigs, setAdminGigs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedGig, setSelectedGig] = useState(null);
    const [hiredFreelancers, setHiredFreelancers] = useState([]);
    const [showAdminModal, setShowAdminModal] = useState(false);
    const [loadingHired, setLoadingHired] = useState(false);
    const { user } = useSelector((state) => state.auth);
    const socket = useSocket();
    const { toasts, addToast, removeToast } = useToast();

    // Delete confirmation modal state
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [gigToDelete, setGigToDelete] = useState(null);
    const [deleteWarning, setDeleteWarning] = useState(null);

    useEffect(() => {
        const fetchGigs = async () => {
            try {
                const response = await api.get('/gigs/all');
                const userId = user._id || user.id;

                const owned = response.data.filter(gig => {
                    const ownerId = gig.ownerId?._id || gig.ownerId;
                    return ownerId === userId;
                });

                const adminOf = response.data.filter(gig => {
                    const ownerId = gig.ownerId?._id || gig.ownerId;
                    const isOwner = ownerId === userId;
                    const isAdmin = gig.admins && gig.admins.some(adminId => {
                        const id = adminId._id || adminId;
                        return id === userId;
                    });
                    return !isOwner && isAdmin;
                });

                setMyGigs(owned);
                setAdminGigs(adminOf);
            } catch (error) {
                console.error('Failed to fetch gigs:', error);
                addToast('Failed to fetch gigs', 'error');
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            fetchGigs();
        }
    }, [user, addToast]);

    useEffect(() => {
        if (socket && user) {
            socket.on('bid:submitted', () => {
                addToast('New bid received!', 'info');
            });

            return () => {
                socket.off('bid:submitted');
            };
        }
    }, [socket, user, addToast]);

    const fetchHiredFreelancers = async (gigId) => {
        setLoadingHired(true);
        try {
            const response = await api.get(`/bids/gig/${gigId}`);
            const hired = response.data.filter(bid => bid.status === 'hired');
            setHiredFreelancers(hired);
        } catch (error) {
            console.error('Failed to fetch hired freelancers:', error);
        } finally {
            setLoadingHired(false);
        }
    };

    const handleManageTeam = async (gig) => {
        setSelectedGig(gig);
        await fetchHiredFreelancers(gig._id);
        setShowAdminModal(true);
    };

    const handleAssignAdmin = async (freelancerId) => {
        try {
            await api.post(`/gigs/${selectedGig._id}/assign-admin`, { viserId: freelancerId });
            addToast('Admin assigned successfully', 'success');
            // Refresh gig data
            const response = await api.get('/gigs/all');
            const userId = user._id || user.id;
            const owned = response.data.filter(gig => {
                const ownerId = gig.ownerId?._id || gig.ownerId;
                return ownerId === userId;
            });
            setMyGigs(owned);
            setSelectedGig(owned.find(g => g._id === selectedGig._id));
        } catch (error) {
            addToast(error.response?.data?.message || 'Failed to assign admin', 'error');
        }
    };

    const handleRemoveAdmin = async (freelancerId) => {
        try {
            await api.post(`/gigs/${selectedGig._id}/remove-admin`, { viserId: freelancerId });
            addToast('Admin removed successfully', 'success');
            // Refresh gig data
            const response = await api.get('/gigs/all');
            const userId = user._id || user.id;
            const owned = response.data.filter(gig => {
                const ownerId = gig.ownerId?._id || gig.ownerId;
                return ownerId === userId;
            });
            setMyGigs(owned);
            setSelectedGig(owned.find(g => g._id === selectedGig._id));
        } catch (error) {
            addToast(error.response?.data?.message || 'Failed to remove admin', 'error');
        }
    };

    const handleMarkComplete = async (gigId) => {
        try {
            await api.post(`/gigs/${gigId}/complete`);
            addToast('Gig marked as complete!', 'success');
            setMyGigs(prevGigs =>
                prevGigs.map(g =>
                    g._id === gigId ? { ...g, status: 'completed' } : g
                )
            );
        } catch (error) {
            addToast(error.response?.data?.message || 'Failed to mark complete', 'error');
        }
    };

    // Open delete confirmation modal
    const openDeleteModal = (gig) => {
        setGigToDelete(gig);
        setDeleteWarning(null);
        setShowDeleteModal(true);
    };

    // Handle delete with confirmation
    const handleDeleteGig = async (forceDelete = false) => {
        if (!gigToDelete) return;

        try {
            const response = await api.delete(`/gigs/${gigToDelete._id}`, {
                data: { forceDelete }
            });
            
            addToast('Gig deleted successfully', 'success');
            setMyGigs(prevGigs => prevGigs.filter(g => g._id !== gigToDelete._id));
            setShowDeleteModal(false);
            setGigToDelete(null);
            setDeleteWarning(null);
        } catch (error) {
            if (error.response?.data?.requiresConfirmation) {
                setDeleteWarning(error.response.data.message);
            } else {
                addToast(error.response?.data?.message || 'Failed to delete gig', 'error');
            }
        }
    };

    const renderGigCard = (gig, isAdmin = false) => (
        <div
            key={gig._id}
            className="glass rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:border-indigo-500 dark:hover:border-indigo-400 transition-all transform hover:scale-[1.02]"
        >
            <div className="flex items-start justify-between mb-3">
                <h3 className="font-bold text-lg text-gray-900 dark:text-white line-clamp-2">
                    {gig.title}
                </h3>
                <div className="flex flex-col gap-2 items-end">
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                        gig.status === 'completed'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                            : gig.status === 'assigned'
                                ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400'
                                : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                    }`}>
                        {gig.status}
                    </span>
                    {isAdmin && (
                        <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-400 text-xs rounded-full flex items-center gap-1">
                            <Shield size={12} />
                            Admin
                        </span>
                    )}
                </div>
            </div>

            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                {gig.description}
            </p>

            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <span className="text-xl font-bold text-green-600 dark:text-green-400">
                        ₹{gig.budget?.toLocaleString('en-IN')}
                    </span>
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                    <Calendar size={14} />
                    {new Date(gig.createdAt).toLocaleDateString('en-IN')}
                </div>
            </div>

            <div className="flex gap-2 mb-3">
                <Link
                    to="/dashboard"
                    state={{ selectedGigId: gig._id }}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-slate-800 to-indigo-500 hover:from-slate-900 hover:to-indigo-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all"
                >
                    <Eye size={16} />
                    View Bids
                </Link>
                {!isAdmin && (
                    <button
                        onClick={() => handleManageTeam(gig)}
                        className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all"
                        title="Manage Team"
                    >
                        <Users size={16} />
                    </button>
                )}
            </div>

            {/* Owner Actions */}
            {!isAdmin && gig.status !== 'completed' && (
                <div className="flex gap-2">
                    <button
                        onClick={() => handleMarkComplete(gig._id)}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white text-sm font-semibold rounded-xl transition-all"
                    >
                        <CheckCircle size={14} />
                        Mark Complete
                    </button>
                    <button
                        onClick={() => openDeleteModal(gig)}
                        className="px-4 py-2.5 bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white text-sm font-semibold rounded-xl transition-all"
                        title="Delete Gig"
                    >
                        <Trash2 size={14} />
                    </button>
                </div>
            )}

            {gig.status === 'completed' && (
                <div className="flex gap-2">
                    <div className="flex-1 text-center py-2.5 bg-green-100 dark:bg-green-900/20 rounded-xl">
                        <span className="text-green-600 dark:text-green-400 text-sm font-semibold flex items-center justify-center gap-2">
                            <CheckCircle size={14} />
                            Completed
                        </span>
                    </div>
                    <button
                        onClick={() => openDeleteModal(gig)}
                        className="px-4 py-2.5 bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white text-sm font-semibold rounded-xl transition-all"
                        title="Delete Gig"
                    >
                        <Trash2 size={14} />
                    </button>
                </div>
            )}
        </div>
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto mb-4"></div>
                    <p className="text-gray-600 dark:text-gray-400">Loading your gigs...</p>
                </div>
            </div>
        );
    }

    return (
        <>
            <ToastContainer toasts={toasts} removeToast={removeToast} />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                        My Gigs
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Manage gigs you've created or administer
                    </p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="glass rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">My Gigs</p>
                                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{myGigs.length}</p>
                            </div>
                            <div className="p-3 bg-indigo-600 dark:bg-indigo-500/20 rounded-lg">
                                <Briefcase className="w-6 h-6 text-white dark:text-indigo-400" />
                            </div>
                        </div>
                    </div>
                    <div className="glass rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Admin Roles</p>
                                <p className="text-3xl font-bold text-purple-600 dark:text-purple-400 mt-2">{adminGigs.length}</p>
                            </div>
                            <div className="p-3 bg-purple-600 dark:bg-purple-500/20 rounded-lg">
                                <Shield className="w-6 h-6 text-white dark:text-purple-400" />
                            </div>
                        </div>
                    </div>
                    <div className="glass rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active</p>
                                <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-2">
                                    {myGigs.filter(g => g.status === 'open' || g.status === 'assigned').length}
                                </p>
                            </div>
                            <div className="p-3 bg-green-600 dark:bg-green-500/20 rounded-lg">
                                <TrendingUp className="w-6 h-6 text-white dark:text-green-400" />
                            </div>
                        </div>
                    </div>
                </div>

                {myGigs.length === 0 && adminGigs.length === 0 ? (
                    <div className="glass rounded-2xl p-12 text-center border border-gray-200 dark:border-gray-700">
                        <Briefcase className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                            No gigs yet
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                            Create your first gig to start receiving bids
                        </p>
                        <Link
                            to="/create-gig"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-slate-800 to-indigo-500 hover:from-slate-900 hover:to-indigo-600 text-white font-semibold rounded-lg shadow-lg"
                        >
                            Create Gig
                        </Link>
                    </div>
                ) : (
                    <>
                        {/* My Gigs */}
                        {myGigs.length > 0 && (
                            <div className="mb-12">
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                                    Gigs I Created
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {myGigs.map((gig) => renderGigCard(gig, false))}
                                </div>
                            </div>
                        )}

                        {/* Admin Gigs */}
                        {adminGigs.length > 0 && (
                            <div>
                                <div className="flex items-center gap-3 mb-6">
                                    <Shield className="w-6 h-6 text-purple-500" />
                                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                        Gigs I Administer
                                    </h2>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {adminGigs.map((gig) => renderGigCard(gig, true))}
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Admin Modal */}
            {showAdminModal && selectedGig && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="glass rounded-2xl max-w-lg w-full border border-gray-200 dark:border-gray-700 max-h-[80vh] overflow-hidden">
                        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Manage Team</h2>
                                <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">{selectedGig.title}</p>
                            </div>
                            <button
                                onClick={() => setShowAdminModal(false)}
                                className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                            >
                                <X size={20} className="text-gray-500" />
                            </button>
                        </div>
                        <div className="p-6 overflow-y-auto max-h-[60vh]">
                            {loadingHired ? (
                                <div className="text-center py-8">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500 mx-auto"></div>
                                </div>
                            ) : hiredFreelancers.length === 0 ? (
                                <p className="text-gray-600 dark:text-gray-400 text-center py-8">
                                    No hired freelancers yet
                                </p>
                            ) : (
                                <div className="space-y-4">
                                    {hiredFreelancers.map((bid) => {
                                        const isAdmin = selectedGig.admins?.some(id => {
                                            const adminId = id._id || id;
                                            const freelancerId = bid.freelancerId._id || bid.freelancerId;
                                            return adminId === freelancerId;
                                        });

                                        return (
                                            <div
                                                key={bid._id}
                                                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                                                        {bid.freelancerId?.name?.charAt(0) || '?'}
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-gray-900 dark:text-white">
                                                            {bid.freelancerId?.name}
                                                        </p>
                                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                                            ₹{bid.price?.toLocaleString('en-IN')}
                                                        </p>
                                                    </div>
                                                </div>
                                                {isAdmin ? (
                                                    <button
                                                        onClick={() => handleRemoveAdmin(bid.freelancerId._id)}
                                                        className="px-4 py-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors text-sm font-medium"
                                                    >
                                                        Remove Admin
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={() => handleAssignAdmin(bid.freelancerId._id)}
                                                        className="px-4 py-2 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors text-sm font-medium"
                                                    >
                                                        Make Admin
                                                    </button>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteModal && gigToDelete && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="glass rounded-2xl max-w-md w-full border border-gray-200 dark:border-gray-700">
                        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-full">
                                    <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
                                </div>
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Delete Gig</h2>
                            </div>
                        </div>
                        <div className="p-6">
                            <p className="text-gray-600 dark:text-gray-400 mb-4">
                                Are you sure you want to delete "<span className="font-semibold text-gray-900 dark:text-white">{gigToDelete.title}</span>"?
                            </p>
                            
                            {deleteWarning && (
                                <div className="mb-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-xl">
                                    <div className="flex items-start gap-3">
                                        <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                                        <div>
                                            <p className="text-yellow-800 dark:text-yellow-300 font-medium">Warning</p>
                                            <p className="text-yellow-700 dark:text-yellow-400 text-sm mt-1">{deleteWarning}</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                This action cannot be undone. All bids associated with this gig will also be deleted.
                            </p>
                        </div>
                        <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex gap-3">
                            <button
                                onClick={() => {
                                    setShowDeleteModal(false);
                                    setGigToDelete(null);
                                    setDeleteWarning(null);
                                }}
                                className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-700 transition-all font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => handleDeleteGig(deleteWarning ? true : false)}
                                className="flex-1 px-4 py-3 bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white rounded-xl transition-all font-semibold flex items-center justify-center gap-2"
                            >
                                <Trash2 size={18} />
                                {deleteWarning ? 'Delete Anyway' : 'Delete'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
