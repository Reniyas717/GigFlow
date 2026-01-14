import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import api from '../../utils/api';
import { useSocket } from '../../context/SocketContext';
import { useToast, ToastContainer } from '../../components/Toast';
import { Briefcase, IndianRupee, User, Clock, CheckCircle, XCircle, MessageSquare, Send } from 'lucide-react';

export default function ClientDashboard() {
    const [gigs, setGigs] = useState([]);
    const [selectedGig, setSelectedGig] = useState(null);
    const [bids, setBids] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingBids, setLoadingBids] = useState(false);
    const { user } = useSelector((state) => state.auth);
    const socket = useSocket();
    const location = useLocation();
    const { toasts, addToast, removeToast } = useToast();

    // Counter offer state
    const [showCounterModal, setShowCounterModal] = useState(false);
    const [counterBidId, setCounterBidId] = useState(null);
    const [counterPrice, setCounterPrice] = useState('');
    const [counterMessage, setCounterMessage] = useState('');

    useEffect(() => {
        const fetchGigs = async () => {
            try {
                const response = await api.get('/gigs/all');
                const userId = user._id || user.id;
                
                // Filter gigs where user is owner OR admin
                const userGigs = response.data.filter(gig => {
                    if (!gig.ownerId) return false;
                    const ownerId = gig.ownerId._id || gig.ownerId;
                    const isOwner = ownerId === userId;
                    const isAdmin = gig.admins && gig.admins.some(adminId => {
                        const id = adminId._id || adminId;
                        return id === userId;
                    });
                    return isOwner || isAdmin;
                });
                
                setGigs(userGigs);

                // Handle selectedGigId from navigation state
                if (location.state?.selectedGigId) {
                    const preselectedGig = userGigs.find(g => g._id === location.state.selectedGigId);
                    if (preselectedGig) {
                        setSelectedGig(preselectedGig);
                    }
                } else if (userGigs.length > 0) {
                    setSelectedGig(userGigs[0]);
                }
            } catch (error) {
                console.error('Failed to fetch gigs:', error);
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            fetchGigs();
        }
    }, [user, location.state]);

    useEffect(() => {
        const fetchBids = async () => {
            if (!selectedGig) return;
            
            setLoadingBids(true);
            try {
                const response = await api.get(`/bids/gig/${selectedGig._id}`);
                setBids(response.data);
            } catch (error) {
                console.error('Failed to fetch bids:', error);
            } finally {
                setLoadingBids(false);
            }
        };

        fetchBids();
    }, [selectedGig]);

    useEffect(() => {
        if (socket && selectedGig) {
            socket.on('bid:submitted', ({ gigId }) => {
                if (gigId === selectedGig._id) {
                    // Refresh bids
                    api.get(`/bids/gig/${selectedGig._id}`).then(response => {
                        setBids(response.data);
                    });
                }
            });

            return () => {
                socket.off('bid:submitted');
            };
        }
    }, [socket, selectedGig]);

    const handleHire = async (bidId) => {
        try {
            await api.post(`/bids/${bidId}/hire`);
            addToast('Freelancer hired successfully!', 'success');
            // Refresh bids
            const response = await api.get(`/bids/gig/${selectedGig._id}`);
            setBids(response.data);
        } catch (error) {
            addToast(error.response?.data?.message || 'Failed to hire', 'error');
        }
    };

    const handleReject = async (bidId) => {
        try {
            await api.post(`/bids/${bidId}/reject`);
            addToast('Bid rejected', 'info');
            // Refresh bids
            const response = await api.get(`/bids/gig/${selectedGig._id}`);
            setBids(response.data);
        } catch (error) {
            addToast(error.response?.data?.message || 'Failed to reject', 'error');
        }
    };

    const handleOpenCounter = (bid) => {
        setCounterBidId(bid._id);
        setCounterPrice(bid.price);
        setCounterMessage('');
        setShowCounterModal(true);
    };

    const handleSendCounter = async () => {
        try {
            await api.post(`/bids/${counterBidId}/counter-offer`, {
                price: Number(counterPrice),
                message: counterMessage
            });
            addToast('Counter offer sent successfully', 'success');
            setShowCounterModal(false);
            // Refresh bids
            const response = await api.get(`/bids/gig/${selectedGig._id}`);
            setBids(response.data);
        } catch (error) {
            addToast(error.response?.data?.message || 'Failed to send counter offer', 'error');
        }
    };

    const getStatusBadge = (status) => {
        const styles = {
            pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
            hired: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
            rejected: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
            countered: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400'
        };
        const icons = {
            pending: <Clock size={14} />,
            hired: <CheckCircle size={14} />,
            rejected: <XCircle size={14} />,
            countered: <IndianRupee size={14} />
        };
        return (
            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${styles[status] || styles.pending}`}>
                {icons[status]}
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
        );
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto mb-4"></div>
                    <p className="text-gray-600 dark:text-gray-400">Loading dashboard...</p>
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
                        Dashboard
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Manage bids for your gigs
                    </p>
                </div>

                {gigs.length === 0 ? (
                    <div className="glass rounded-2xl p-12 text-center border border-gray-200 dark:border-slate-700">
                        <Briefcase className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                            No gigs to manage
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400">
                            Create a gig to start receiving bids
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Gigs List */}
                        <div className="lg:col-span-1">
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Your Gigs</h2>
                            <div className="space-y-3">
                                {gigs.map((gig) => (
                                    <button
                                        key={gig._id}
                                        onClick={() => setSelectedGig(gig)}
                                        className={`w-full text-left p-4 rounded-xl border transition-all ${
                                            selectedGig?._id === gig._id
                                                ? 'border-cyan-500 bg-cyan-50 dark:bg-cyan-900/20'
                                                : 'border-gray-200 dark:border-slate-700 hover:border-cyan-300 dark:hover:border-cyan-700'
                                        }`}
                                    >
                                        <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-1">
                                            {gig.title}
                                        </h3>
                                        <div className="flex items-center justify-between mt-2">
                                            <span className="text-green-600 dark:text-green-400 font-medium">
                                                ₹{gig.budget}
                                            </span>
                                            <span className={`px-2 py-1 text-xs rounded-full ${
                                                gig.status === 'open'
                                                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                                    : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                                            }`}>
                                                {gig.status}
                                            </span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Bids List */}
                        <div className="lg:col-span-2">
                            {selectedGig ? (
                                <>
                                    <div className="flex items-center justify-between mb-4">
                                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                                            Bids for "{selectedGig.title}"
                                        </h2>
                                        <span className="px-3 py-1 bg-cyan-100 dark:bg-cyan-900/30 text-cyan-800 dark:text-cyan-400 rounded-full text-sm font-semibold">
                                            {bids.length} bids
                                        </span>
                                    </div>

                                    {loadingBids ? (
                                        <div className="text-center py-12">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500 mx-auto mb-4"></div>
                                            <p className="text-gray-600 dark:text-gray-400">Loading bids...</p>
                                        </div>
                                    ) : bids.length === 0 ? (
                                        <div className="glass rounded-xl p-8 text-center border border-gray-200 dark:border-slate-700">
                                            <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                            <p className="text-gray-600 dark:text-gray-400">No bids yet for this gig</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {bids.map((bid) => (
                                                <div
                                                    key={bid._id}
                                                    className="glass rounded-xl p-6 border border-gray-200 dark:border-slate-700 hover:border-cyan-500 dark:hover:border-cyan-400 transition-all"
                                                >
                                                    <div className="flex items-start justify-between mb-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                                                                {bid.freelancerId?.name?.charAt(0) || '?'}
                                                            </div>
                                                            <div>
                                                                <h3 className="font-semibold text-gray-900 dark:text-white">
                                                                    {bid.freelancerId?.name || 'Unknown'}
                                                                </h3>
                                                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                                                    {bid.freelancerId?.email}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        {getStatusBadge(bid.status)}
                                                    </div>

                                                    <div className="mb-4">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <IndianRupee className="w-5 h-5 text-green-600 dark:text-green-400" />
                                                            <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                                                                ₹{bid.price}
                                                            </span>
                                                        </div>
                                                        <p className="text-gray-600 dark:text-gray-400">
                                                            {bid.message}
                                                        </p>
                                                    </div>

                                                    {/* Counter offer info */}
                                                    {bid.status === 'countered' && bid.counterOffer && (
                                                        <div className="mb-4 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl border border-purple-200 dark:border-purple-700">
                                                            <p className="text-purple-800 dark:text-purple-300 font-semibold">
                                                                Counter offer sent: ₹{bid.counterOffer.price}
                                                            </p>
                                                            {bid.counterOffer.message && (
                                                                <p className="text-purple-600 dark:text-purple-400 text-sm mt-1">
                                                                    "{bid.counterOffer.message}"
                                                                </p>
                                                            )}
                                                            <p className="text-purple-500 dark:text-purple-500 text-xs mt-2">
                                                                Waiting for freelancer response...
                                                            </p>
                                                        </div>
                                                    )}

                                                    {/* Action Buttons */}
                                                    {bid.status === 'pending' && (
                                                        <div className="flex gap-3">
                                                            <button
                                                                onClick={() => handleHire(bid._id)}
                                                                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all"
                                                            >
                                                                <CheckCircle size={18} />
                                                                Hire
                                                            </button>
                                                            <button
                                                                onClick={() => handleOpenCounter(bid)}
                                                                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all"
                                                            >
                                                                <IndianRupee size={18} />
                                                                Counter
                                                            </button>
                                                            <button
                                                                onClick={() => handleReject(bid._id)}
                                                                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all"
                                                            >
                                                                <XCircle size={18} />
                                                                Reject
                                                            </button>
                                                        </div>
                                                    )}

                                                    {bid.status === 'hired' && (
                                                        <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-700 text-center">
                                                            <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400 mx-auto mb-2" />
                                                            <p className="text-green-700 dark:text-green-300 font-semibold">
                                                                Hired for this gig
                                                            </p>
                                                        </div>
                                                    )}

                                                    {bid.status === 'rejected' && (
                                                        <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-700 text-center">
                                                            <XCircle className="w-6 h-6 text-red-600 dark:text-red-400 mx-auto mb-2" />
                                                            <p className="text-red-700 dark:text-red-300">
                                                                Bid rejected
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="glass rounded-xl p-8 text-center border border-gray-200 dark:border-slate-700">
                                    <p className="text-gray-600 dark:text-gray-400">Select a gig to view bids</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Counter Offer Modal */}
            {showCounterModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="glass rounded-2xl max-w-md w-full border border-gray-200 dark:border-slate-700">
                        <div className="p-6 border-b border-gray-200 dark:border-slate-700">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Send Counter Offer</h2>
                            <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">Propose a new price to the freelancer</p>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                     Counter Price (₹)
                                </label>
                                <input
                                    type="number"
                                    value={counterPrice}
                                    onChange={(e) => setCounterPrice(e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Message (optional)
                                </label>
                                <textarea
                                    value={counterMessage}
                                    onChange={(e) => setCounterMessage(e.target.value)}
                                    rows={3}
                                    className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                                    placeholder="Explain your counter offer..."
                                />
                            </div>
                        </div>
                        <div className="p-6 border-t border-gray-200 dark:border-slate-700 flex gap-3">
                            <button
                                onClick={() => setShowCounterModal(false)}
                                className="flex-1 px-4 py-3 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-700 transition-all font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSendCounter}
                                className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl transition-all font-semibold flex items-center justify-center gap-2"
                            >
                                <Send size={18} />
                                Send Counter
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

