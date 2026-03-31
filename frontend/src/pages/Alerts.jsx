import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Bell, Plus, Trash2, AlertCircle, Check } from 'lucide-react';

export default function Alerts() {
  const [alerts, setAlerts] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ cat_id: '', keyword: '', min_price: '', max_price: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [alertsRes, notifRes, catsRes] = await Promise.all([
        axios.get('/api/alerts'),
        axios.get('/api/alerts/notifications'),
        axios.get('/api/categories')
      ]);
      setAlerts(alertsRes.data.alerts);
      setNotifications(notifRes.data.notifications);
      setCategories(catsRes.data.categories);
    } catch (err) {
      console.error('Failed to fetch alerts');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAlert = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/alerts', {
        cat_id: formData.cat_id,
        keyword: formData.keyword || null,
        min_price: formData.min_price || null,
        max_price: formData.max_price || null
      });
      setFormData({ cat_id: '', keyword: '', min_price: '', max_price: '' });
      setShowForm(false);
      fetchData();
    } catch (err) {
      console.error('Failed to create alert');
    }
  };

  const handleDeleteAlert = async (id) => {
    try {
      await axios.delete(`/api/alerts/${id}`);
      fetchData();
    } catch (err) {
      console.error('Failed to delete alert');
    }
  };

  const handleToggleAlert = async (id, isActive) => {
    try {
      await axios.put(`/api/alerts/${id}`, { is_active: !isActive });
      fetchData();
    } catch (err) {
      console.error('Failed to update alert');
    }
  };

  const handleMarkRead = async (id) => {
    try {
      await axios.put(`/api/alerts/notifications/${id}/read`);
      fetchData();
    } catch (err) {
      console.error('Failed to mark notification as read');
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Alerts & Notifications</h1>
          <p className="text-gray-600">Get notified when items matching your interests are listed</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary flex items-center">
          <Plus className="w-5 h-5 mr-2" />
          New Alert
        </button>
      </div>

      {showForm && (
        <div className="card p-6 mb-8">
          <h3 className="font-semibold text-gray-900 mb-4">Create New Alert</h3>
          <form onSubmit={handleCreateAlert} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                <select
                  value={formData.cat_id}
                  onChange={(e) => setFormData({ ...formData, cat_id: e.target.value })}
                  className="input-field"
                  required
                >
                  <option value="">Select category</option>
                  {categories.map(cat => (
                    <option key={cat.cat_id} value={cat.cat_id}>{cat.cat_name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Keyword (optional)</label>
                <input
                  type="text"
                  value={formData.keyword}
                  onChange={(e) => setFormData({ ...formData, keyword: e.target.value })}
                  className="input-field"
                  placeholder="e.g., iPhone, laptop"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Min Price ($)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.min_price}
                  onChange={(e) => setFormData({ ...formData, min_price: e.target.value })}
                  className="input-field"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Max Price ($)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.max_price}
                  onChange={(e) => setFormData({ ...formData, max_price: e.target.value })}
                  className="input-field"
                  placeholder="1000.00"
                />
              </div>
            </div>
            <div className="flex gap-4">
              <button type="submit" className="btn-primary">Create Alert</button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Bell className="w-5 h-5 mr-2" />
            My Alerts ({alerts.length})
          </h2>
          
          {alerts.length > 0 ? (
            <div className="space-y-4">
              {alerts.map(alert => (
                <div key={alert.alert_id} className="card p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900">{alert.cat_name}</span>
                        {alert.is_active ? (
                          <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">Active</span>
                        ) : (
                          <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">Paused</span>
                        )}
                      </div>
                      {alert.keyword && <p className="text-sm text-gray-500 mt-1">Keyword: {alert.keyword}</p>}
                      <p className="text-sm text-gray-500">
                        Price: {alert.min_price ? `$${alert.min_price}` : 'Any'} - {alert.max_price ? `$${alert.max_price}` : 'Any'}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggleAlert(alert.alert_id, alert.is_active)}
                        className={`p-2 rounded-lg ${alert.is_active ? 'text-gray-400 hover:bg-gray-100' : 'text-green-600 hover:bg-green-50'}`}
                        title={alert.is_active ? 'Pause alert' : 'Resume alert'}
                      >
                        {alert.is_active ? <AlertCircle className="w-5 h-5" /> : <Check className="w-5 h-5" />}
                      </button>
                      <button
                        onClick={() => handleDeleteAlert(alert.alert_id)}
                        className="p-2 text-red-400 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="card p-8 text-center">
              <p className="text-gray-500">No alerts created yet</p>
              <button onClick={() => setShowForm(true)} className="text-primary-600 hover:underline mt-2">
                Create your first alert
              </button>
            </div>
          )}
        </div>

        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <AlertCircle className="w-5 h-5 mr-2" />
            Notifications ({notifications.length})
          </h2>
          
          {notifications.length > 0 ? (
            <div className="space-y-4">
              {notifications.map(notif => (
                <div key={notif.notification_id} className={`card p-4 ${notif.is_read ? 'opacity-60' : ''}`}>
                  <div className="flex items-start gap-4">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">
                        New item in {notif.cat_name}
                      </p>
                      <Link to={`/item/${notif.item_id}`} className="text-primary-600 hover:underline">
                        {notif.item_title} - ${notif.current_price}
                      </Link>
                      <p className="text-sm text-gray-500 mt-1">
                        {new Date(notif.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    {!notif.is_read && (
                      <button
                        onClick={() => handleMarkRead(notif.notification_id)}
                        className="text-sm text-primary-600 hover:underline"
                      >
                        Mark read
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="card p-8 text-center">
              <p className="text-gray-500">No notifications yet</p>
              <p className="text-sm text-gray-400 mt-1">We'll notify you when matching items are listed</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
