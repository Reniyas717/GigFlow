import { useEffect, useState } from 'react';
import { CheckCircle, Info, AlertTriangle, X } from 'lucide-react';

export default function Toast({ message, type = 'info', onClose, duration = 5000 }) {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsVisible(false);
            setTimeout(onClose, 300); // Wait for fade out animation
        }, duration);

        return () => clearTimeout(timer);
    }, [duration, onClose]);

    const handleClose = () => {
        setIsVisible(false);
        setTimeout(onClose, 300);
    };

    const icons = {
        success: <CheckCircle className="w-5 h-5" />,
        info: <Info className="w-5 h-5" />,
        warning: <AlertTriangle className="w-5 h-5" />
    };

    const styles = {
        success: 'bg-green-50 dark:bg-green-900/20 border-green-500 text-green-700 dark:text-green-400',
        info: 'bg-cyan-50 dark:bg-cyan-900/20 border-cyan-500 text-cyan-700 dark:text-cyan-400',
        warning: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-500 text-yellow-700 dark:text-yellow-400'
    };

    return (
        <div
            className={`fixed top-20 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-lg border-l-4 shadow-lg transition-all duration-300 ${styles[type]
                } ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}`}
            style={{ minWidth: '300px', maxWidth: '400px' }}
        >
            <div className="flex-shrink-0">{icons[type]}</div>
            <p className="flex-1 font-medium">{message}</p>
            <button
                onClick={handleClose}
                className="flex-shrink-0 hover:opacity-70 transition-opacity"
            >
                <X className="w-4 h-4" />
            </button>
        </div>
    );
}

// Toast Container Component
export function ToastContainer({ toasts, removeToast }) {
    return (
        <div className="fixed top-20 right-4 z-50 space-y-2">
            {toasts.map((toast) => (
                <Toast
                    key={toast.id}
                    message={toast.message}
                    type={toast.type}
                    onClose={() => removeToast(toast.id)}
                    duration={toast.duration}
                />
            ))}
        </div>
    );
}

// Custom hook for managing toasts
export function useToast() {
    const [toasts, setToasts] = useState([]);

    const addToast = (message, type = 'info', duration = 5000) => {
        const id = Date.now();
        setToasts((prev) => [...prev, { id, message, type, duration }]);
    };

    const removeToast = (id) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    };

    return { toasts, addToast, removeToast };
}
