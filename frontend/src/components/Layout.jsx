import { useState } from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

export default function Layout({ children }) {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
            <Navbar />
            <Sidebar />
            <main
                className={`transition-all duration-300 pt-16 ${sidebarCollapsed ? 'ml-20' : 'ml-64'
                    }`}
            >
                <div className="p-4 sm:p-6 lg:p-8">
                    {children}
                </div>
            </main>
        </div>
    );
}
