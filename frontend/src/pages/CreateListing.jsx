import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AlertCircle, DollarSign, Clock, Tag } from 'lucide-react';

export default function CreateListing() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    title: '', description: '', image_url: '', base_price: '',
    auction_start_time: '', auction_end_time: '', cat_id: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCategories();
    const now = new Date();
    setFormData(prev => ({
      ...prev,
      auction_start_time: now.toISOString().slice(0, 16)
    }));
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await axios.get('/api/categories/tree');
      setCategories(res.data.categories);
    } catch (err) {
      console.error('Failed to fetch categories');
    }
  };

  const flattenCategories = (cats, depth = 0) => {
    let result = [];
    cats.forEach(cat => {
      result.push({ ...cat, depth });
      if (cat.children?.length) {
        result = result.concat(flattenCategories(cat.children, depth + 1));
      }
    });
    return result;
  };

  const flatCategories = flattenCategories(categories);

  const validate = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.base_price || parseFloat(formData.base_price) <= 0) {
      newErrors.base_price = 'Base price must be greater than 0';
    }
    if (!formData.auction_start_time) newErrors.auction_start_time = 'Start time is required';
    if (!formData.auction_end_time) newErrors.auction_end_time = 'End time is required';
    if (formData.auction_start_time && formData.auction_end_time) {
      if (new Date(formData.auction_end_time) <= new Date(formData.auction_start_time)) {
        newErrors.auction_end_time = 'End time must be after start time';
      }
    }
    if (!formData.cat_id) newErrors.cat_id = 'Category is required';
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post('/api/items', formData);
      navigate(`/item/${res.data.item_id}`);
    } catch (err) {
      setErrors({ general: err.response?.data?.message || 'Failed to create listing' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Create New Listing</h1>

      <div className="card p-6">
        {errors.general && (
          <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center text-red-700">
            <AlertCircle className="w-5 h-5 mr-2" />
            {errors.general}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className={`input-field ${errors.title ? 'border-red-500' : ''}`}
              placeholder="What are you selling?"
            />
            {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              value={formData.cat_id}
              onChange={(e) => setFormData({ ...formData, cat_id: e.target.value })}
              className={`input-field ${errors.cat_id ? 'border-red-500' : ''}`}
            >
              <option value="">Select a category</option>
              {flatCategories.map(cat => (
                <option key={cat.cat_id} value={cat.cat_id}>
                  {'  '.repeat(cat.depth)}{cat.cat_name}
                </option>
              ))}
            </select>
            {errors.cat_id && <p className="text-red-500 text-sm mt-1">{errors.cat_id}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="input-field h-32"
              placeholder="Describe your item..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Image URL (Optional)</label>
            <input
              type="url"
              value={formData.image_url}
              onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
              className="input-field"
              placeholder="https://example.com/image.jpg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Starting Price ($)</label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={formData.base_price}
                onChange={(e) => setFormData({ ...formData, base_price: e.target.value })}
                className={`input-field pl-10 ${errors.base_price ? 'border-red-500' : ''}`}
                placeholder="0.00"
              />
            </div>
            {errors.base_price && <p className="text-red-500 text-sm mt-1">{errors.base_price}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Auction Start</label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="datetime-local"
                  value={formData.auction_start_time}
                  onChange={(e) => setFormData({ ...formData, auction_start_time: e.target.value })}
                  className={`input-field pl-10 ${errors.auction_start_time ? 'border-red-500' : ''}`}
                />
              </div>
              {errors.auction_start_time && <p className="text-red-500 text-sm mt-1">{errors.auction_start_time}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Auction End</label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="datetime-local"
                  value={formData.auction_end_time}
                  onChange={(e) => setFormData({ ...formData, auction_end_time: e.target.value })}
                  className={`input-field pl-10 ${errors.auction_end_time ? 'border-red-500' : ''}`}
                />
              </div>
              {errors.auction_end_time && <p className="text-red-500 text-sm mt-1">{errors.auction_end_time}</p>}
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full py-3">
            {loading ? 'Creating Listing...' : 'Create Listing'}
          </button>
        </form>
      </div>
    </div>
  );
}
