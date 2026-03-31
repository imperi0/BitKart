import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import { Bell, X, Check, Package, Trophy, DollarSign, AlertTriangle, Gavel } from 'lucide-react';

export default function NotificationBell() {
    const { user } = useContext(AuthContext);
    const [showDropdown, setShowDropdown] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        if (user) {
            fetchNotifications();
            const interval = setInterval(fetchNotifications, 30000);
            return () => clearInterval(interval);
        }
    }, [user]);

    const fetchNotifications = async () => {
        try {
            const res = await axios.get('/api/notifications');
            setNotifications(res.data.notifications);
            setUnreadCount(res.data.notifications.filter(n => !n.is_read).length);
        } catch (err) {
            console.error('Failed to fetch notifications');
        }
    };

    const markAsRead = async (id, e) => {
        e.stopPropagation();
        try {
            await axios.put(`/api/notifications/${id}/read`);
            fetchNotifications();
        } catch (err) {
            console.error('Failed to mark as read');
        }
    };

    const markAllRead = async () => {
        try {
            await axios.put('/api/notifications/read-all');
            fetchNotifications();
        } catch (err) {
            console.error('Failed to mark all as read');
        }
    };

    const getIcon = (type) => {
        switch (type) {
            case 'outbid':
                return <AlertTriangle className="w-5 h-5 text-orange-500" />;
            case 'won':
                return <Trophy className="w-5 h-5 text-green-500" />;
            case 'item_sold':
                return <DollarSign className="w-5 h-5 text-blue-500" />;
            case 'auction_ended':
                return <Package className="w-5 h-5 text-gray-500" />;
            case 'new_item':
                return <Package className="w-5 h-5 text-purple-500" />;
            case 'bid_confirmed':
                return <Gavel className="w-5 h-5 text-primary-500" />;
            default:
                return <Bell className="w-5 h-5 text-gray-500" />;
        }
    };

    if (!user) return null;

    return (
        <div className="relative">
            <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="relative p-2 text-gray-600 hover:text-gray-900 transition"
            >
                <Bell className="w-6 h-6" />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {showDropdown && (
                <>
                    <div 
                        className="fixed inset-0 z-40" 
                        onClick={() => setShowDropdown(false)}
                    />
                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-96 overflow-hidden">
                        <div className="flex items-center justify-between p-4 border-b border-gray-100">
                            <h3 className="font-semibold text-gray-900">Notifications</h3>
                            {unreadCount > 0 && (
                                <button
                                    onClick={markAllRead}
                                    className="text-sm text-primary-600 hover:text-primary-700 flex items-center"
                                >
                                    <Check className="w-4 h-4 mr-1" />
                                    Mark all read
                                </button>
                            )}
                        </div>

                        <div className="overflow-y-auto max-h-72">
                            {notifications.length === 0 ? (
                                <div className="p-8 text-center text-gray-500">
                                    <Bell className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                                    <p>No notifications yet</p>
                                </div>
                            ) : (
                                notifications.slice(0, 10).map(notification => (
                                    <div
                                        key={notification.notification_id}
                                        className={`p-4 border-b border-gray-100 hover:bg-gray-50 ${
                                            !notification.is_read ? 'bg-blue-50' : ''
                                        }`}
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className="flex-shrink-0 mt-1">
                                                {getIcon(notification.type)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className={`text-sm ${!notification.is_read ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>
                                                    {notification.title}
                                                </p>
                                                <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                                                    {notification.message}
                                                </p>
                                                <p className="text-xs text-gray-400 mt-1">
                                                    {new Date(notification.created_at).toLocaleString()}
                                                </p>
                                            </div>
                                            {!notification.is_read && (
                                                <button
                                                    onClick={(e) => markAsRead(notification.notification_id, e)}
                                                    className="flex-shrink-0 p-1 text-gray-400 hover:text-primary-600"
                                                    title="Mark as read"
                                                >
                                                    <Check className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                        {notification.item_id && (
                                            <Link
                                                to={`/item/${notification.item_id}`}
                                                className="block mt-2 text-sm text-primary-600 hover:underline"
                                                onClick={() => setShowDropdown(false)}
                                            >
                                                View Item →
                                            </Link>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>

                        <div className="p-3 border-t border-gray-100">
                            <Link
                                to="/notifications"
                                className="block text-center text-sm text-primary-600 hover:text-primary-700 font-medium"
                                onClick={() => setShowDropdown(false)}
                            >
                                View All Notifications
                            </Link>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
