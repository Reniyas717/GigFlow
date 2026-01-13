import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useSocket } from '../context/SocketContext';
import {
    LayoutDashboard,
    Briefcase,
    FolderOpen,
    PlusCircle,
    FileText,
    User,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';

export default function Sidebar() {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [unreadBids, setUnreadBids] = useState(0);
    const location = useLocation();
    const { user } = useSelector((state) => state.auth);
    const socket = useSocket();

    const menuItems = [
        { icon: <LayoutDashboard size={20} />, label: 'Dashboard', path: '/dashboard' },
        { icon: <Briefcase size={20} />, label: 'Browse Gigs', path: '/browse' },
        { icon: <FolderOpen size={20} />, label: 'My Gigs', path: '/my-gigs' },
        { icon: <PlusCircle size={20} />, label: 'Create Gig', path: '/create-gig' },
        { icon: <FileText size={20} />, label: 'My Bids', path: '/my-bids' },
        { icon: <User size={20} />, label: 'Profile', path: '/profile' }
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

    return (
        <aside
            className={`fixed left-0 top-16 h-[calc(100vh-4rem)] bg-white dark:bg-slate-800 border-r border-gray-200 dark:border-slate-700 transition-all duration-300 z-40 ${isCollapsed ? 'w-20' : 'w-64'
                }`}
        >
            {/* Toggle Button */}
            <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="absolute -right-3 top-6 w-6 h-6 bg-slate-700 hover:bg-slate-800 text-white rounded-full flex items-center justify-center shadow-lg transition-all duration-200"
            >
                {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
            </button>

            {/* Menu Items */}
            <nav className="p-4 space-y-2">
                {menuItems.map((item, index) => (
                    <Link
                        key={index}
                        to={item.path}
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${isActive(item.path)
                            ? 'bg-slate-700 text-white shadow-lg'
                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700'
                            }`}
                        title={isCollapsed ? item.label : ''}
                    >
                        <span className="flex-shrink-0">{item.icon}</span>
                        {!isCollapsed && (
                            <span className="font-medium whitespace-nowrap flex-1">{item.label}</span>
                        )}
                        {/* Notification Badge for Dashboard */}
                        {item.path === '/dashboard' && unreadBids > 0 && (
                            <span className="ml-auto px-2 py-1 text-xs bg-red-500 text-white rounded-full font-bold min-w-[20px] text-center">
                                {unreadBids}
                            </span>
                        )}
                    </Link>
                ))}
            </nav>
        </aside>
    );
}
