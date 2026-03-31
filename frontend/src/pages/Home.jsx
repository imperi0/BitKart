import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Clock, Gavel, DollarSign, TrendingUp } from 'lucide-react';
import axios from 'axios';
import ItemCard from '../components/ItemCard';

export default function Home() {
  const [featuredItems, setFeaturedItems] = useState([]);
  const [endingSoon, setEndingSoon] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [featured, ending, cats] = await Promise.all([
        axios.get('/api/items/featured'),
        axios.get('/api/items/ending-soon'),
        axios.get('/api/categories')
      ]);
      setFeaturedItems(featured.data.items);
      setEndingSoon(ending.data.items);
      setCategories(cats.data.categories.filter(c => !c.parent_cat_id));
    } catch (err) {
      console.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <section className="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Find Your Next Treasure</h1>
            <p className="text-lg text-primary-100 mb-8">
              Join thousands of buyers and sellers in the most trusted auction platform.
            </p>
            <Link to="/register" className="inline-block bg-white text-primary-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition">
              Start Bidding
            </Link>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Categories</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map(cat => (
            <Link
              key={cat.cat_id}
              to={`/categories/${cat.cat_id}`}
              className="card p-4 text-center hover:shadow-md transition"
            >
              <div className="w-12 h-12 bg-primary-50 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-primary-600 text-xl">📦</span>
              </div>
              <span className="text-sm font-medium text-gray-700">{cat.cat_name}</span>
            </Link>
          ))}
        </div>
      </section>

      {endingSoon.length > 0 && (
        <section className="bg-amber-50 py-12">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center mb-6">
              <Clock className="w-6 h-6 text-amber-600 mr-2" />
              <h2 className="text-2xl font-bold text-gray-900">Ending Soon</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {endingSoon.map(item => (
                <ItemCard key={item.item_id} item={item} />
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <TrendingUp className="w-6 h-6 text-primary-600 mr-2" />
            <h2 className="text-2xl font-bold text-gray-900">Featured Auctions</h2>
          </div>
          <Link to="/categories" className="text-primary-600 hover:text-primary-700 font-medium">
            View All →
          </Link>
        </div>
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="card animate-pulse">
                <div className="bg-gray-200 h-48"></div>
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredItems.map(item => (
              <ItemCard key={item.item_id} item={item} />
            ))}
          </div>
        )}
      </section>

      <section className="bg-gray-100 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Gavel className="w-8 h-8 text-primary-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Secure Bidding</h3>
              <p className="text-gray-600">All bids are secured with our advanced protection system.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <DollarSign className="w-8 h-8 text-primary-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Easy Payments</h3>
              <p className="text-gray-600">Secure wallet system for seamless transactions.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-primary-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">24/7 Support</h3>
              <p className="text-gray-600">Our team is always here to help you.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
