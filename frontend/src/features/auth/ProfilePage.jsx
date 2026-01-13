import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { User, Mail, Shield, Edit2, Save, X } from 'lucide-react';
import { setUser } from '../auth/authSlice';
import api from '../../utils/api';

export default function ProfilePage() {
    const { user } = useSelector((state) => state.auth);
    const dispatch = useDispatch();
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [stats, setStats] = useState({
        gigsCreated: 0,
        bidsSubmitted: 0,
        projectsCompleted: 0
    });

    const handleEdit = () => {
        setIsEditing(true);
        setFormData({
            name: user.name,
            email: user.email,
        });
    };

    const handleCancel = () => {
        setIsEditing(false);
        setFormData({
            name: user.name,
            email: user.email,
        });
        setMessage({ type: '', text: '' });
    };

    const handleSave = async () => {
        setLoading(true);
        setMessage({ type: '', text: '' });

        try {
            const response = await api.put('/auth/profile', formData);
            dispatch(setUser(response.data.user));
            setIsEditing(false);
            setMessage({ type: 'success', text: 'Profile updated successfully!' });
            setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        } catch (error) {
            setMessage({
                type: 'error',
                text: error.response?.data?.message || 'Failed to update profile'
            });
        } finally {
            setLoading(false);
        }
    };

    // Fetch statistics
    useEffect(() => {
        const fetchStats = async () => {
            try {
                const [gigsRes, bidsRes] = await Promise.all([
                    api.get('/gigs/all'),  // Changed to /all to get ALL gigs
                    api.get('/bids/my-bids')
                ]);

                const userGigs = gigsRes.data.filter(g =>
                    (g.ownerId?._id && g.ownerId._id === user.id) || g.ownerId === user.id
                );
                const userBids = bidsRes.data;

                setStats({
                    gigsCreated: userGigs.length,
                    bidsSubmitted: userBids.length,
                    projectsCompleted: userGigs.filter(g => g.status === 'assigned').length
                });
            } catch (error) {
                console.error('Failed to fetch stats:', error);
            }
        };

        if (user) {
            fetchStats();
        }
    }, [user]);

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                    My Profile
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                    Manage your account information
                </p>
            </div>

            {/* Profile Card */}
            <div className="glass rounded-2xl p-8 border border-gray-200 dark:border-slate-700 mb-6">
                {/* Avatar Section */}
                <div className="flex items-center gap-6 mb-8 pb-8 border-b border-gray-200 dark:border-slate-700">
                    <div className="w-24 h-24 bg-gradient-to-br from-slate-700 to-cyan-500 rounded-full flex items-center justify-center text-white text-4xl font-bold">
                        {user?.name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                            {user?.name}
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400">{user?.email}</p>
                    </div>
                </div>

                {/* Message */}
                {message.text && (
                    <div className={`mb-6 p-4 rounded-lg border-l-4 ${message.type === 'success'
                        ? 'bg-green-50 dark:bg-green-900/20 border-green-500'
                        : 'bg-red-50 dark:bg-red-900/20 border-red-500'
                        }`}>
                        <p className={`font-medium ${message.type === 'success'
                            ? 'text-green-700 dark:text-green-400'
                            : 'text-red-700 dark:text-red-400'
                            }`}>
                            {message.text}
                        </p>
                    </div>
                )}

                {/* Profile Information */}
                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            <div className="flex items-center gap-2">
                                <User size={16} />
                                Full Name
                            </div>
                        </label>
                        {isEditing ? (
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full px-4 py-3 bg-white dark:bg-slate-700 border-2 border-gray-200 dark:border-slate-600 rounded-lg focus:outline-none focus:border-slate-700 dark:focus:border-cyan-400 text-gray-900 dark:text-white transition-all"
                            />
                        ) : (
                            <p className="text-lg text-gray-900 dark:text-white px-4 py-3 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
                                {user?.name}
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            <div className="flex items-center gap-2">
                                <Mail size={16} />
                                Email Address
                            </div>
                        </label>
                        {isEditing ? (
                            <input
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="w-full px-4 py-3 bg-white dark:bg-slate-700 border-2 border-gray-200 dark:border-slate-600 rounded-lg focus:outline-none focus:border-slate-700 dark:focus:border-cyan-400 text-gray-900 dark:text-white transition-all"
                            />
                        ) : (
                            <p className="text-lg text-gray-900 dark:text-white px-4 py-3 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
                                {user?.email}
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            <div className="flex items-center gap-2">
                                <Shield size={16} />
                                Account ID
                            </div>
                        </label>
                        <p className="text-sm text-gray-600 dark:text-gray-400 px-4 py-3 bg-gray-50 dark:bg-slate-700/50 rounded-lg font-mono">
                            {user?.id}
                        </p>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-8 flex gap-4">
                    {isEditing ? (
                        <>
                            <button
                                onClick={handleSave}
                                disabled={loading}
                                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-slate-800 to-cyan-500 hover:from-slate-900 hover:to-cyan-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                            >
                                <Save size={20} />
                                {loading ? 'Saving...' : 'Save Changes'}
                            </button>
                            <button
                                onClick={handleCancel}
                                disabled={loading}
                                className="px-6 py-3 bg-gray-200 dark:bg-slate-700 hover:bg-gray-300 dark:hover:bg-slate-600 text-gray-900 dark:text-white font-semibold rounded-lg transition-all"
                            >
                                <X size={20} className="inline mr-2" />
                                Cancel
                            </button>
                        </>
                    ) : (
                        <button
                            onClick={handleEdit}
                            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-slate-800 to-cyan-500 hover:from-slate-900 hover:to-cyan-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
                        >
                            <Edit2 size={20} />
                            Edit Profile
                        </button>
                    )}
                </div>
            </div>

            {/* Stats Card */}
            <div className="glass rounded-2xl p-8 border border-gray-200 dark:border-slate-700">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                    Account Statistics
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center">
                        <p className="text-3xl font-bold text-cyan-600 dark:text-cyan-400">{stats.gigsCreated}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Gigs Created</p>
                    </div>
                    <div className="text-center">
                        <p className="text-3xl font-bold text-green-600 dark:text-green-400">{stats.bidsSubmitted}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Bids Submitted</p>
                    </div>
                    <div className="text-center">
                        <p className="text-3xl font-bold text-slate-700 dark:text-slate-400">{stats.projectsCompleted}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Projects Completed</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
