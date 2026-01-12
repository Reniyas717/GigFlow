import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
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
    const location = useLocation();

    const menuItems = [
        { icon: <LayoutDashboard size={20} />, label: 'Dashboard', path: '/dashboard' },
        { icon: <Briefcase size={20} />, label: 'Browse Gigs', path: '/browse' },
        { icon: <FolderOpen size={20} />, label: 'My Gigs', path: '/my-gigs' },
        { icon: <PlusCircle size={20} />, label: 'Create Gig', path: '/create-gig' },
        { icon: <FileText size={20} />, label: 'My Bids', path: '/my-bids' },
        { icon: <User size={20} />, label: 'Profile', path: '/profile' }
    ];

    const isActive = (path) => location.pathname === path;

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
                            <span className="font-medium whitespace-nowrap">{item.label}</span>
                        )}
                    </Link>
                ))}
            </nav>
        </aside>
    );
}
