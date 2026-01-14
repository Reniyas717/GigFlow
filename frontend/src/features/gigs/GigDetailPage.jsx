import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import api from '../../utils/api';
import { useToast, ToastContainer } from '../../components/Toast';
import { IndianRupee, Calendar, User, Tag, ArrowLeft, Send, CheckCircle, Clock, XCircle } from 'lucide-react';

export default function GigDetailPage() {
    const { gigId } = useParams();
    const navigate = useNavigate();
    const { user } = useSelector((state) => state.auth);
    const { toasts, addToast, removeToast } = useToast();
    
    const [gig, setGig] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showBidModal, setShowBidModal] = useState(false);
    const [bidMessage, setBidMessage] = useState('');
    const [bidPrice, setBidPrice] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [userBid, setUserBid] = useState(null);
    const [checkingBid, setCheckingBid] = useState(true);

    useEffect(() => {
        const fetchGig = async () => {
            try {
                const response = await api.get(`/gigs/${gigId}`);
                setGig(response.data);
                // Don't set initial price - let user enter their own
            } catch (error) {
                console.error('Failed to fetch gig:', error);
                addToast('Failed to load gig details', 'error');
            } finally {
                setLoading(false);
            }
        };

        fetchGig();
    }, [gigId, addToast]);

    useEffect(() => {
        const checkUserBid = async () => {
            if (!user || !gigId) return;
            
            try {
                const response = await api.get('/bids/my-bids');
                const existingBid = response.data.find(bid => {
                    const bidGigId = bid.gigId?._id || bid.gigId;
                    return bidGigId === gigId;
                });
                setUserBid(existingBid || null);
            } catch (error) {
                console.error('Failed to check user bid:', error);
            } finally {
                setCheckingBid(false);
            }
        };

        checkUserBid();
    }, [user, gigId]);

    // Open modal and set initial price
    const openBidModal = () => {
        setBidPrice(gig?.budget?.toString() || '');
        setBidMessage('');
        setShowBidModal(true);
    };

    const handleSubmitBid = async (e) => {
        e.preventDefault();
        
        const priceNum = Number(bidPrice);
        if (isNaN(priceNum) || priceNum <= 0) {
            addToast('Please enter a valid amount', 'error');
            return;
        }

        setSubmitting(true);

        try {
            const response = await api.post('/bids/submit', {
                gigId,
                message: bidMessage,
                price: priceNum
            });
            addToast('Bid submitted successfully!', 'success');
            setShowBidModal(false);
            setBidMessage('');
            setBidPrice('');
            setUserBid(response.data.bid);
        } catch (error) {
            addToast(error.response?.data?.message || 'Failed to submit bid', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const handleAcceptCounter = async (bidId) => {
        try {
            await api.post(`/bids/${bidId}/accept-counter`);
            addToast('Counter offer accepted!', 'success');
            const response = await api.get('/bids/my-bids');
            const updatedBid = response.data.find(bid => {
                const bidGigId = bid.gigId?._id || bid.gigId;
                return bidGigId === gigId;
            });
            setUserBid(updatedBid);
        } catch (error) {
            addToast(error.response?.data?.message || 'Failed to accept counter offer', 'error');
        }
    };

    const userId = user?._id || user?.id;
    const isOwner = gig?.ownerId?._id === userId || gig?.ownerId === userId;
    const canBid = !isOwner && !userBid && gig?.status === 'open';

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto mb-4"></div>
                    <p className="text-gray-600 dark:text-gray-400">Loading gig details...</p>
                </div>
            </div>
        );
    }

    if (!gig) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Gig not found</h2>
                    <button
                        onClick={() => navigate('/browse')}
                        className="text-indigo-500 hover:text-indigo-600"
                    >
                        Back to Browse
                    </button>
                </div>
            </div>
        );
    }

    return (
        <>
            <ToastContainer toasts={toasts} removeToast={removeToast} />
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Back Button */}
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-indigo-500 dark:hover:text-indigo-400 mb-6 transition-colors"
                >
                    <ArrowLeft size={20} />
                    Back
                </button>

                {/* Gig Details Card */}
                <div className="glass rounded-2xl p-8 border border-gray-200 dark:border-gray-700 mb-8">
                    <div className="flex items-start justify-between mb-6">
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                            {gig.title}
                        </h1>
                        <span className={`px-4 py-2 text-sm font-semibold rounded-full ${
                            gig.status === 'open'
                                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                : gig.status === 'assigned'
                                    ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400'
                                    : gig.status === 'completed'
                                        ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400'
                                        : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                        }`}>
                            {gig.status}
                        </span>
                    </div>

                    <div className="flex flex-wrap gap-6 mb-6">
                        <div className="flex items-center gap-2">
                            <IndianRupee className="w-5 h-5 text-green-600 dark:text-green-400" />
                            <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                                {gig.budget?.toLocaleString('en-IN')}
                            </span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                            <User size={18} />
                            <span>{gig.ownerId?.name || 'Unknown'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                            <Calendar size={18} />
                            <span>{new Date(gig.createdAt).toLocaleDateString('en-IN')}</span>
                        </div>
                    </div>

                    <div className="mb-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Description</h3>
                        <p className="text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                            {gig.description}
                        </p>
                    </div>

                    {gig.skills && gig.skills.length > 0 && (
                        <div className="mb-6">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Required Skills</h3>
                            <div className="flex flex-wrap gap-2">
                                {gig.skills.map((skill, index) => (
                                    <span
                                        key={index}
                                        className="flex items-center gap-1 px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-400 rounded-full text-sm"
                                    >
                                        <Tag size={14} />
                                        {skill}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="text-sm text-gray-500 dark:text-gray-400">
                        Positions: {gig.positionsFilled || 0} / {gig.positionsAvailable || 1} filled
                    </div>
                </div>

                {/* Bid Section */}
                <div className="glass rounded-2xl p-8 border border-gray-200 dark:border-gray-700">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Submit Your Bid</h2>
                    
                    {checkingBid ? (
                        <div className="text-center py-4">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-500 mx-auto"></div>
                        </div>
                    ) : canBid ? (
                        <button
                            onClick={openBidModal}
                            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
                        >
                            <Send size={20} />
                            Submit Your Bid
                        </button>
                    ) : userBid ? (
                        <div className="glass rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                            <div className="text-center mb-4">
                                <p className="text-gray-600 dark:text-gray-400 mb-3">
                                    You have already submitted a bid for this gig
                                </p>
                                <div className={`inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold ${
                                    userBid.status === 'pending' 
                                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' 
                                        : userBid.status === 'hired' 
                                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
                                            : userBid.status === 'rejected' 
                                                ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' 
                                                : userBid.status === 'countered' 
                                                    ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400' 
                                                    : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                                }`}>
                                    {userBid.status === 'pending' && <Clock size={16} />}
                                    {userBid.status === 'hired' && <CheckCircle size={16} />}
                                    {userBid.status === 'rejected' && <XCircle size={16} />}
                                    {userBid.status === 'countered' && <IndianRupee size={16} />}
                                    Status: {userBid.status.charAt(0).toUpperCase() + userBid.status.slice(1)}
                                </div>
                            </div>
                            
                            <div className="text-center mb-4">
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    Your bid amount: 
                                    <span className="text-green-600 dark:text-green-400 font-bold text-lg ml-2">
                                        ₹{userBid.price?.toLocaleString('en-IN')}
                                    </span>
                                </p>
                            </div>

                            {/* Counter Offer Section */}
                            {userBid.status === 'countered' && userBid.counterOffer && (
                                <div className="mt-6 p-5 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl border border-purple-200 dark:border-purple-700">
                                    <div className="flex items-center gap-2 mb-3">
                                        <IndianRupee className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                                        <h4 className="font-semibold text-purple-800 dark:text-purple-300">
                                            Counter Offer Received!
                                        </h4>
                                    </div>
                                    <div className="mb-3">
                                        <p className="text-purple-700 dark:text-purple-300">
                                            New proposed amount: 
                                            <span className="font-bold text-xl ml-2">₹{userBid.counterOffer.price?.toLocaleString('en-IN')}</span>
                                        </p>
                                    </div>
                                    {userBid.counterOffer.message && (
                                        <p className="text-purple-600 dark:text-purple-400 text-sm mb-4 italic">
                                            "{userBid.counterOffer.message}"
                                        </p>
                                    )}
                                    <button
                                        onClick={() => handleAcceptCounter(userBid._id)}
                                        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
                                    >
                                        <CheckCircle size={18} />
                                        Accept Counter Offer
                                    </button>
                                </div>
                            )}

                            {userBid.status === 'hired' && (
                                <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-700 text-center">
                                    <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400 mx-auto mb-2" />
                                    <p className="text-green-700 dark:text-green-300 font-semibold">
                                        Congratulations! You've been hired for this gig!
                                    </p>
                                </div>
                            )}

                            {userBid.status === 'rejected' && (
                                <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-700 text-center">
                                    <XCircle className="w-8 h-8 text-red-600 dark:text-red-400 mx-auto mb-2" />
                                    <p className="text-red-700 dark:text-red-300">
                                        Your bid was not selected for this gig.
                                    </p>
                                </div>
                            )}
                        </div>
                    ) : isOwner ? (
                        <div className="text-center py-4">
                            <p className="text-gray-600 dark:text-gray-400">
                                This is your gig. You cannot bid on your own gig.
                            </p>
                        </div>
                    ) : (
                        <div className="text-center py-4">
                            <p className="text-gray-600 dark:text-gray-400">
                                This gig is no longer accepting bids.
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Bid Modal - FIXED */}
            {showBidModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="glass rounded-2xl max-w-md w-full border border-gray-200 dark:border-gray-700">
                        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Submit Your Bid</h2>
                            <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">for "{gig.title}"</p>
                            <p className="text-indigo-600 dark:text-indigo-400 text-sm mt-2 flex items-center gap-1">
                                <IndianRupee size={14} />
                                Client's Budget: ₹{gig.budget?.toLocaleString('en-IN')}
                            </p>
                        </div>
                        <form onSubmit={handleSubmitBid} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Your Amount (₹)
                                </label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 font-medium">
                                        ₹
                                    </span>
                                    <input
                                        type="text"
                                        inputMode="numeric"
                                        pattern="[0-9]*"
                                        value={bidPrice}
                                        onChange={(e) => {
                                            // Only allow numbers
                                            const value = e.target.value.replace(/[^0-9]/g, '');
                                            setBidPrice(value);
                                        }}
                                        className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-lg font-semibold"
                                        placeholder="Enter your amount"
                                        autoFocus
                                    />
                                </div>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                                    You can bid higher or lower than the budget
                                </p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Message to Client
                                </label>
                                <textarea
                                    value={bidMessage}
                                    onChange={(e) => setBidMessage(e.target.value)}
                                    rows={4}
                                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                    placeholder="Explain why you're the best fit for this gig..."
                                    required
                                />
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowBidModal(false)}
                                    className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-700 transition-all font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting || !bidPrice}
                                    className="flex-1 px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl transition-all font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {submitting ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                            Submitting...
                                        </>
                                    ) : (
                                        <>
                                            <Send size={18} />
                                            Submit Bid
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
