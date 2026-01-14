import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useSocket } from '../context/SocketContext';
import { LayoutDashboard, Briefcase, FileText, Users, PlusCircle, LogOut, ChevronLeft, ChevronRight } from 'lucide-react';
import { logout } from '../features/auth/authSlice';

export default function Sidebar() {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [unreadBids, setUnreadBids] = useState(0);
    const location = useLocation();
    const { user } = useSelector((state) => state.auth);
    const dispatch = useDispatch();
    const socket = useSocket();

    const menuItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
        { icon: Briefcase, label: 'Browse Gigs', path: '/browse' },
        { icon: PlusCircle, label: 'Create Gig', path: '/create-gig' },
        { icon: Briefcase, label: 'My Gigs', path: '/my-gigs' },
        { icon: Users, label: 'Gigs I\'m In', path: '/my-projects' },
        { icon: FileText, label: 'My Bids', path: '/my-bids' },
        {icon: Users, label: 'Profile', path: '/profile' },
    ];

    const isActive = (path) => location.pathname === path;

    // Listen for new bids and increment counter
    useEffect(() => {
        if (socket && user) {
            const handleBidSubmitted = ({ bid, gigOwnerId }) => {
                console.log('🔔 Sidebar received bid:submitted', {
                    gigOwnerId,
                    userId: user.id,
                    match: gigOwnerId === user.id,
                    bid
                });

                if (gigOwnerId === user.id) {
                    setUnreadBids(prev => {
                        const newCount = prev + 1;
                        console.log('📈 Incrementing badge:', prev, '→', newCount);
                        return newCount;
                    });
                }
            };

            socket.on('bid:submitted', handleBidSubmitted);
            return () => socket.off('bid:submitted', handleBidSubmitted);
        }
    }, [socket, user]);

    // Clear badge when visiting dashboard
    useEffect(() => {
        if (location.pathname === '/dashboard') {
            setUnreadBids(0);
        }
    }, [location.pathname]);

    const handleLogout = () => {
        dispatch(logout());
    };

    return (
        <aside
            className={`fixed left-0 top-16 h-[calc(100vh-4rem)] bg-white dark:bg-slate-800 border-r border-gray-200 dark:border-slate-700 transition-all duration-300 z-40 ${isCollapsed ? 'w-20' : 'w-64'
                }`}
        >
            <div className="flex flex-col h-full">
                {/* Menu Items */}
                <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
                    {menuItems.map((item, index) => {
                        const Icon = item.icon; // Store component in a variable with capital letter
                        const isActive = location.pathname === item.path;

                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                                    isActive
                                        ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white'
                                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700'
                                }`}
                            >
                                <Icon size={20} /> {/* Render the component with JSX */}
                                {!isCollapsed && <span className="font-medium">{item.label}</span>}
                                {/* Notification Badge for Dashboard */}
                                {item.path === '/dashboard' && unreadBids > 0 && (
                                    <span className="ml-auto px-2 py-1 text-xs bg-red-500 text-white rounded-full font-bold min-w-[20px] text-center">
                                        {unreadBids}
                                    </span>
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* Logout Button */}
                <div className="p-4 border-t border-gray-200 dark:border-slate-700">
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 w-full px-4 py-3 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    >
                        <LogOut size={20} />
                        {!isCollapsed && <span className="font-medium">Logout</span>}
                    </button>
                </div>

                {/* Collapse Toggle */}
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="absolute -right-3 top-8 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-full p-1.5 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                >
                    {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
                </button>
            </div>
        </aside>
    );
}
