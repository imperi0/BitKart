import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AlertCircle, DollarSign, Clock, Tag, Image, ChevronRight, Check } from 'lucide-react';

const durationPresets = [
  { label: '1 Day', hours: 24 },
  { label: '3 Days', hours: 72 },
  { label: '7 Days', hours: 168 },
  { label: '14 Days', hours: 336 },
];

export default function CreateListing() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    title: '', description: '', image_url: '', base_price: '',
    auction_start_time: '', auction_end_time: '', cat_id: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState('');
  const [step, setStep] = useState(1);

  useEffect(() => {
    fetchCategories();
    const now = new Date();
    setFormData(prev => ({
      ...prev,
      auction_start_time: now.toISOString().slice(0, 16)
    }));
  }, []);

  useEffect(() => {
    if (formData.image_url) {
      setImagePreview(formData.image_url);
    }
  }, [formData.image_url]);

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

  const handleDurationPreset = (hours) => {
    const start = new Date();
    const end = new Date(start.getTime() + hours * 60 * 60 * 1000);
    setFormData(prev => ({
      ...prev,
      auction_start_time: start.toISOString().slice(0, 16),
      auction_end_time: end.toISOString().slice(0, 16)
    }));
  };

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
      setStep(1);
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
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Create New Listing</h1>
        <p className="text-gray-600">Fill in the details to start your auction</p>
      </div>

      <div className="mb-8">
        <div className="flex items-center justify-between">
          {['Details', 'Pricing', 'Review'].map((label, index) => (
            <div key={label} className="flex items-center">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full font-semibold transition-all ${
                step > index + 1 ? 'bg-green-500 text-white' :
                step === index + 1 ? 'bg-primary-600 text-white' :
                'bg-gray-200 text-gray-500'
              }`}>
                {step > index + 1 ? <Check className="w-5 h-5" /> : index + 1}
              </div>
              <span className={`ml-3 font-medium hidden sm:block ${
                step >= index + 1 ? 'text-gray-900' : 'text-gray-400'
              }`}>{label}</span>
              {index < 2 && (
                <div className={`w-12 sm:w-20 h-1 mx-4 rounded ${
                  step > index + 1 ? 'bg-green-500' : 'bg-gray-200'
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="card p-8">
        {errors.general && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center text-red-700 animate-scale-in">
            <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0" />
            {errors.general}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Title *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className={`input-field text-lg ${errors.title ? 'border-red-500 ring-2 ring-red-200' : ''}`}
              placeholder="What are you selling?"
            />
            {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Category *</label>
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
            <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="input-field h-32 resize-none"
              placeholder="Describe your item in detail..."
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Image URL</label>
            <div className="flex gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Image className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="url"
                    value={formData.image_url}
                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                    className="input-field pl-10"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
              </div>
              {imagePreview && (
                <div className="w-20 h-20 rounded-xl overflow-hidden border-2 border-gray-200 flex-shrink-0">
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}
            </div>
            {imagePreview && (
              <p className="text-xs text-green-600 mt-2 flex items-center">
                <Check className="w-3 h-3 mr-1" />
                Image preview loaded
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Starting Price *</label>
            <div className="relative">
              <DollarSign className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={formData.base_price}
                onChange={(e) => setFormData({ ...formData, base_price: e.target.value })}
                className={`input-field pl-12 text-lg font-semibold ${errors.base_price ? 'border-red-500' : ''}`}
                placeholder="0.00"
              />
            </div>
            {errors.base_price && <p className="text-red-500 text-sm mt-1">{errors.base_price}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Auction Duration</label>
            <div className="flex flex-wrap gap-2 mb-4">
              {durationPresets.map(preset => (
                <button
                  key={preset.hours}
                  type="button"
                  onClick={() => handleDurationPreset(preset.hours)}
                  className="px-4 py-2 bg-gray-100 hover:bg-primary-100 hover:text-primary-700 rounded-lg text-sm font-medium transition-colors"
                >
                  {preset.label}
                </button>
              ))}
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Start Time</label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="datetime-local"
                    value={formData.auction_start_time}
                    onChange={(e) => setFormData({ ...formData, auction_start_time: e.target.value })}
                    className={`input-field pl-10 ${errors.auction_start_time ? 'border-red-500' : ''}`}
                  />
                </div>
                {errors.auction_start_time && <p className="text-red-500 text-xs mt-1">{errors.auction_start_time}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">End Time</label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="datetime-local"
                    value={formData.auction_end_time}
                    onChange={(e) => setFormData({ ...formData, auction_end_time: e.target.value })}
                    className={`input-field pl-10 ${errors.auction_end_time ? 'border-red-500' : ''}`}
                  />
                </div>
                {errors.auction_end_time && <p className="text-red-500 text-xs mt-1">{errors.auction_end_time}</p>}
              </div>
            </div>
          </div>

          <div className="pt-4">
            <button 
              type="submit" 
              disabled={loading} 
              className="btn-primary w-full py-4 text-lg font-semibold flex items-center justify-center"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating Listing...
                </>
              ) : (
                <>
                  Create Listing
                  <ChevronRight className="w-5 h-5 ml-2" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
