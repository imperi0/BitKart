import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Bell, Check, Trash2, Trophy, AlertTriangle, DollarSign, Package, Gavel, Filter } from 'lucide-react';

export default function Notifications() {
    const [notifications, setNotifications] = useState([]);
    const [filter, setFilter] = useState('all');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, []);

    const fetchNotifications = async () => {
        try {
            const res = await axios.get('/api/notifications');
            setNotifications(res.data.notifications);
        } catch (err) {
            console.error('Failed to fetch notifications');
        } finally {
            setLoading(false);
        }
    };

    const markAsRead = async (id) => {
        try {
            await axios.put(`/api/notifications/${id}/read`);
            setNotifications(notifications.map(n => 
                n.notification_id === id ? { ...n, is_read: true } : n
            ));
        } catch (err) {
            console.error('Failed to mark as read');
        }
    };

    const markAllRead = async () => {
        try {
            await axios.put('/api/notifications/read-all');
            setNotifications(notifications.map(n => ({ ...n, is_read: true })));
        } catch (err) {
            console.error('Failed to mark all as read');
        }
    };

    const deleteNotification = async (id) => {
        try {
            await axios.delete(`/api/notifications/${id}`);
            setNotifications(notifications.filter(n => n.notification_id !== id));
        } catch (err) {
            console.error('Failed to delete');
        }
    };

    const clearAll = async () => {
        try {
            await axios.delete('/api/notifications/clear-all');
            setNotifications([]);
        } catch (err) {
            console.error('Failed to clear all');
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

    const getBadgeColor = (type) => {
        switch (type) {
            case 'outbid': return 'bg-orange-100 text-orange-700';
            case 'won': return 'bg-green-100 text-green-700';
            case 'item_sold': return 'bg-blue-100 text-blue-700';
            case 'auction_ended': return 'bg-gray-100 text-gray-700';
            case 'new_item': return 'bg-purple-100 text-purple-700';
            case 'bid_confirmed': return 'bg-primary-100 text-primary-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    const filterOptions = [
        { value: 'all', label: 'All' },
        { value: 'unread', label: 'Unread' },
        { value: 'outbid', label: 'Outbid' },
        { value: 'won', label: 'Won' },
        { value: 'item_sold', label: 'Sold' },
        { value: 'new_item', label: 'New Items' },
    ];

    const filteredNotifications = notifications.filter(n => {
        if (filter === 'all') return true;
        if (filter === 'unread') return !n.is_read;
        return n.type === filter;
    });

    const unreadCount = notifications.filter(n => !n.is_read).length;

    if (loading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto px-4 py-8">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
                    <p className="text-gray-600">
                        {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up!'}
                    </p>
                </div>
                <div className="flex gap-2">
                    {unreadCount > 0 && (
                        <button
                            onClick={markAllRead}
                            className="btn-secondary flex items-center"
                        >
                            <Check className="w-4 h-4 mr-2" />
                            Mark All Read
                        </button>
                    )}
                    {notifications.length > 0 && (
                        <button
                            onClick={clearAll}
                            className="btn-secondary flex items-center text-red-600 hover:bg-red-50"
                        >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Clear All
                        </button>
                    )}
                </div>
            </div>

            <div className="flex gap-2 mb-6 flex-wrap">
                {filterOptions.map(option => (
                    <button
                        key={option.value}
                        onClick={() => setFilter(option.value)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                            filter === option.value
                                ? 'bg-primary-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                    >
                        {option.label}
                    </button>
                ))}
            </div>

            {filteredNotifications.length === 0 ? (
                <div className="card p-12 text-center">
                    <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900">No notifications</h3>
                    <p className="text-gray-500 mt-2">
                        {filter === 'all' 
                            ? "You're all caught up!" 
                            : "No notifications match this filter."}
                    </p>
                </div>
            ) : (
                <div className="space-y-3">
                    {filteredNotifications.map(notification => (
                        <div
                            key={notification.notification_id}
                            className={`card p-4 transition ${
                                !notification.is_read 
                                    ? 'border-l-4 border-l-primary-500 bg-blue-50/50' 
                                    : 'hover:shadow-md'
                            }`}
                        >
                            <div className="flex items-start gap-4">
                                <div className="flex-shrink-0 mt-1">
                                    {getIcon(notification.type)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${getBadgeColor(notification.type)}`}>
                                            {notification.type.replace('_', ' ')}
                                        </span>
                                        {!notification.is_read && (
                                            <span className="w-2 h-2 bg-primary-500 rounded-full"></span>
                                        )}
                                    </div>
                                    <p className="font-medium text-gray-900 mt-1">
                                        {notification.title}
                                    </p>
                                    <p className="text-sm text-gray-600 mt-1">
                                        {notification.message}
                                    </p>
                                    <p className="text-xs text-gray-400 mt-2">
                                        {new Date(notification.created_at).toLocaleString()}
                                    </p>
                                </div>
                                <div className="flex flex-col gap-2">
                                    {!notification.is_read && (
                                        <button
                                            onClick={() => markAsRead(notification.notification_id)}
                                            className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg"
                                            title="Mark as read"
                                        >
                                            <Check className="w-4 h-4" />
                                        </button>
                                    )}
                                    <button
                                        onClick={() => deleteNotification(notification.notification_id)}
                                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                                        title="Delete"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                            {notification.item_id && (
                                <Link
                                    to={`/item/${notification.item_id}`}
                                    className="block mt-3 text-sm text-primary-600 hover:text-primary-700 font-medium"
                                >
                                    View Item →
                                </Link>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
