import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Bell, Plus, Trash2, AlertCircle, Check, X, Zap, Laptop, Smartphone, Shirt, Home as HomeIcon, Dumbbell, BookOpen, Car, Camera, Headphones, Gem } from 'lucide-react';

const categoryIcons = {
  1: Laptop,
  2: Shirt,
  3: HomeIcon,
  4: Dumbbell,
  5: BookOpen,
  6: Car,
};

const categoryNames = {};

export default function Alerts() {
  const [alerts, setAlerts] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ cat_id: '', keyword: '', min_price: '', max_price: '' });
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);

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
      setAlerts(alertsRes.data.alerts || []);
      setNotifications(notifRes.data.notifications || []);
      setCategories(catsRes.data.categories || []);
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
    setDeleting(id);
    try {
      await axios.delete(`/api/alerts/${id}`);
      fetchData();
    } catch (err) {
      console.error('Failed to delete alert');
    } finally {
      setDeleting(null);
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

  const getCategoryIcon = (catId) => {
    const IconComponent = categoryIcons[catId];
    return IconComponent ? <IconComponent className="w-5 h-5" /> : <Bell className="w-5 h-5" />;
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
          <h1 className="text-3xl font-bold text-gray-900">Alerts & Notifications</h1>
          <p className="text-gray-600 mt-1">Get notified when items matching your interests are listed</p>
        </div>
        <button 
          onClick={() => setShowForm(!showForm)} 
          className="btn-primary flex items-center shadow-lg hover:shadow-xl transition-all"
        >
          {showForm ? <X className="w-5 h-5 mr-2" /> : <Plus className="w-5 h-5 mr-2" />}
          {showForm ? 'Cancel' : 'New Alert'}
        </button>
      </div>

      {showForm && (
        <div className="card p-6 mb-8 animate-scale-in border-2 border-primary-100">
          <div className="flex items-center mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center mr-4">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-gray-900">Create New Alert</h3>
              <p className="text-sm text-gray-500">We'll notify you when matching items are listed</p>
            </div>
          </div>
          
          <form onSubmit={handleCreateAlert} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Category *</label>
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
                <label className="block text-sm font-semibold text-gray-700 mb-2">Keyword (optional)</label>
                <input
                  type="text"
                  value={formData.keyword}
                  onChange={(e) => setFormData({ ...formData, keyword: e.target.value })}
                  className="input-field"
                  placeholder="e.g., iPhone, laptop"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Min Price ($)</label>
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
                <label className="block text-sm font-semibold text-gray-700 mb-2">Max Price ($)</label>
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
            <div className="flex gap-4 pt-2">
              <button type="submit" className="btn-primary flex items-center">
                <Check className="w-4 h-4 mr-2" />
                Create Alert
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center mr-3">
              <Bell className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">My Alerts</h2>
            <span className="ml-auto px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-medium">
              {alerts.length}
            </span>
          </div>
          
          {alerts.length > 0 ? (
            <div className="space-y-3">
              {alerts.map(alert => (
                <div key={alert.alert_id} className="card p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start flex-1">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center mr-4 ${
                        alert.is_active ? 'bg-primary-100 text-primary-600' : 'bg-gray-100 text-gray-400'
                      }`}>
                        {getCategoryIcon(alert.cat_id)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-gray-900">{alert.cat_name}</span>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            alert.is_active 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-gray-100 text-gray-500'
                          }`}>
                            {alert.is_active ? 'Active' : 'Paused'}
                          </span>
                        </div>
                        {alert.keyword && (
                          <p className="text-sm text-gray-600 flex items-center">
                            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mr-2"></span>
                            Keyword: "{alert.keyword}"
                          </p>
                        )}
                        <p className="text-sm text-gray-500 flex items-center">
                          <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mr-2"></span>
                          Price: {alert.min_price ? `$${alert.min_price}` : 'Any'} - {alert.max_price ? `$${alert.max_price}` : 'Any'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <button
                        onClick={() => handleToggleAlert(alert.alert_id, alert.is_active)}
                        className={`p-2.5 rounded-xl transition-all ${
                          alert.is_active 
                            ? 'text-gray-400 hover:bg-amber-50 hover:text-amber-600' 
                            : 'text-green-600 hover:bg-green-50'
                        }`}
                        title={alert.is_active ? 'Pause alert' : 'Resume alert'}
                      >
                        {alert.is_active ? <AlertCircle className="w-5 h-5" /> : <Check className="w-5 h-5" />}
                      </button>
                      <button
                        onClick={() => handleDeleteAlert(alert.alert_id)}
                        disabled={deleting === alert.alert_id}
                        className="p-2.5 text-gray-400 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all disabled:opacity-50"
                      >
                        {deleting === alert.alert_id ? (
                          <div className="animate-spin w-5 h-5 border-2 border-red-200 border-t-red-600 rounded-full"></div>
                        ) : (
                          <Trash2 className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="card p-8 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Bell className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500 mb-2">No alerts created yet</p>
              <p className="text-sm text-gray-400 mb-4">Create an alert to get notified about items you love</p>
              <button onClick={() => setShowForm(true)} className="btn-primary inline-flex items-center">
                <Plus className="w-4 h-4 mr-2" />
                Create your first alert
              </button>
            </div>
          )}
        </div>

        <div>
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center mr-3">
              <AlertCircle className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Notifications</h2>
            {notifications.filter(n => !n.is_read).length > 0 && (
              <span className="ml-auto px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">
                {notifications.filter(n => !n.is_read).length} new
              </span>
            )}
          </div>
          
          {notifications.length > 0 ? (
            <div className="space-y-3">
              {notifications.slice(0, 10).map(notif => (
                <div key={notif.notification_id} className={`card p-4 transition-all ${notif.is_read ? 'opacity-60' : 'hover:shadow-md'}`}>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Zap className="w-5 h-5 text-amber-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 text-sm">
                        New item in {notif.cat_name}
                      </p>
                      <Link to={`/item/${notif.item_id}`} className="text-primary-600 hover:text-primary-700 text-sm font-medium truncate block">
                        {notif.item_title} - ${notif.current_price}
                      </Link>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(notif.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    {!notif.is_read && (
                      <button
                        onClick={() => handleMarkRead(notif.notification_id)}
                        className="text-sm text-primary-600 hover:text-primary-700 font-medium flex-shrink-0"
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
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500 mb-1">No notifications yet</p>
              <p className="text-sm text-gray-400">We'll notify you when matching items are listed</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
