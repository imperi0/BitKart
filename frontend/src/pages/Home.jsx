import { Link } from 'react-router-dom';
import { useEffect, useState, useContext } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Clock, Gavel, DollarSign, TrendingUp, Laptop, Shirt, Home as HomeIcon, Dumbbell, BookOpen, Car, Smartphone, Camera, Headphones, Gem, UtensilsCrossed, Flower2, Bike, Sofa, ChevronRight, Zap, Search, X } from 'lucide-react';
import axios from 'axios';
import ItemCard from '../components/ItemCard';
import AuthContext from '../context/AuthContext';

const categoryIcons = {
  'Electronics': Laptop,
  'Smartphones': Smartphone,
  'Laptops': Laptop,
  'Cameras': Camera,
  'Audio': Headphones,
  'Fashion': Shirt,
  "Men's Clothing": Shirt,
  "Women's Clothing": Shirt,
  'Shoes': ShoeIcon,
  'Jewelry': Gem,
  'Home & Garden': HomeIcon,
  'Living Room': Sofa,
  'Kitchen': UtensilsCrossed,
  'Garden Tools': Flower2,
  'Sports': Dumbbell,
  'Fitness': Dumbbell,
  'Team Sports': Dumbbell,
  'Books': BookOpen,
  'Fiction': BookOpen,
  'Non-Fiction': BookOpen,
  'Vehicles': Car,
  'Cars': Car,
  'Motorcycles': Bike,
};

function ShoeIcon(props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={props.size || 24} height={props.size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M3 15c0 1.1.9 2 2 2h14a2 2 0 0 0 2-2v-1a2 2 0 0 0-2-2H9.6a2 2 0 0 0-1.8-1l-2.4-1.2a1.5 1.5 0 0 0-1.4.2L3 12V15Z"/>
      <path d="M3.85 12.8 5 13c.7.4 1.5.6 2.3.6h1.5"/>
      <path d="M4.4 9.5 3 10.5"/>
      <path d="M5.7 6.3 6.5 7c.8.9 1.9 1.5 3.1 1.8l.5.1"/>
      <path d="M10 6l3-2 2 2-2 2.5"/>
      <path d="M15 7l1.5-1.5"/>
      <path d="M18 5l2 1"/>
    </svg>
  );
}

function getCategoryIcon(catName, size = 22) {
  const IconComponent = categoryIcons[catName];
  if (IconComponent) {
    return <IconComponent size={size} />;
  }
  return <BookOpen size={size} />;
}

function getCategoryColor(catName) {
  const colors = {
    'Electronics': 'from-blue-500 to-blue-600',
    'Smartphones': 'from-blue-400 to-blue-500',
    'Laptops': 'from-blue-500 to-blue-700',
    'Cameras': 'from-amber-500 to-amber-600',
    'Audio': 'from-purple-500 to-purple-600',
    'Fashion': 'from-pink-500 to-pink-600',
    "Men's Clothing": 'from-pink-400 to-pink-500',
    "Women's Clothing": 'from-rose-500 to-rose-600',
    'Shoes': 'from-orange-500 to-orange-600',
    'Jewelry': 'from-yellow-500 to-yellow-600',
    'Home & Garden': 'from-green-500 to-green-600',
    'Living Room': 'from-green-400 to-green-500',
    'Kitchen': 'from-teal-500 to-teal-600',
    'Garden Tools': 'from-emerald-500 to-emerald-600',
    'Sports': 'from-red-500 to-red-600',
    'Fitness': 'from-red-500 to-red-700',
    'Team Sports': 'from-orange-500 to-orange-600',
    'Books': 'from-amber-700 to-amber-800',
    'Fiction': 'from-indigo-500 to-indigo-600',
    'Non-Fiction': 'from-slate-600 to-slate-700',
    'Vehicles': 'from-gray-600 to-gray-700',
    'Cars': 'from-gray-500 to-gray-700',
    'Motorcycles': 'from-gray-700 to-gray-900',
  };
  return colors[catName] || 'from-gray-500 to-gray-600';
}

export default function Home() {
  const { user } = useContext(AuthContext);
  const [searchParams] = useSearchParams();
  const [featuredItems, setFeaturedItems] = useState([]);
  const [endingSoon, setEndingSoon] = useState([]);
  const [allItems, setAllItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const searchQuery = searchParams.get('search') || '';

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [featured, ending, cats, all] = await Promise.all([
        axios.get('/api/items/featured'),
        axios.get('/api/items/ending-soon'),
        axios.get('/api/categories'),
        axios.get('/api/items')
      ]);
      setFeaturedItems(featured.data.items || []);
      setEndingSoon(ending.data.items || []);
      setAllItems(all.data.items || []);
      setCategories(cats.data.categories.filter(c => !c.parent_cat_id));
    } catch (err) {
      console.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const getFilteredItems = () => {
    if (!searchQuery) return [];
    const query = searchQuery.toLowerCase();
    return allItems.filter(item => 
      item.title?.toLowerCase().includes(query) ||
      item.description?.toLowerCase().includes(query) ||
      item.cat_name?.toLowerCase().includes(query)
    );
  };

  const filteredItems = getFilteredItems();

  return (
    <div>
      <section className="relative bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-72 h-72 bg-white rounded-full -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full translate-x-1/3 translate-y-1/3"></div>
          <div className="absolute top-1/2 left-1/3 w-48 h-48 bg-white rounded-full"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 py-20 relative">
          <div className="max-w-2xl">
            <div className="inline-flex items-center px-4 py-1.5 bg-white/10 rounded-full text-sm font-medium mb-6 backdrop-blur-sm">
              <span className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>
              Live Auctions Happening Now
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              Find Your Next 
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-amber-400">Treasure</span>
            </h1>
            <p className="text-lg text-primary-100 mb-8 leading-relaxed">
              Join thousands of buyers and sellers in the most trusted auction platform. Discover amazing deals on electronics, fashion, home goods, and more.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to={user ? "/dashboard" : "/register"} className="inline-flex items-center bg-white text-primary-600 px-6 py-3 rounded-xl font-semibold hover:bg-gray-100 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5">
                {user ? "Go to Dashboard" : "Start Bidding"}
                <ChevronRight className="w-5 h-5 ml-2" />
              </Link>
              <Link to="/categories" className="inline-flex items-center border-2 border-white/30 text-white px-6 py-3 rounded-xl font-semibold hover:bg-white/10 transition-all backdrop-blur-sm">
                Browse Categories
              </Link>
            </div>
          </div>
        </div>
      </section>

      {searchQuery && (
        <section className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center mr-4">
                <Search className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Search Results for "{searchQuery}"</h2>
                <p className="text-gray-600">{filteredItems.length} {filteredItems.length === 1 ? 'item' : 'items'} found</p>
              </div>
            </div>
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
          ) : filteredItems.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredItems.map(item => (
                <ItemCard key={item.item_id} item={item} />
              ))}
            </div>
          ) : (
            <div className="card p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No items found</h3>
              <p className="text-gray-500 mb-4">Try searching with different keywords</p>
              <Link to="/" className="btn-primary inline-flex items-center">
                Back to Home
              </Link>
            </div>
          )}
        </section>
      )}

      {!searchQuery && (
        <>
          <section className="max-w-7xl mx-auto px-4 py-12">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                <svg className="w-6 h-6 mr-3 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
                Browse by Category
              </h2>
              <Link to="/categories" className="text-primary-600 hover:text-primary-700 font-medium flex items-center transition-colors">
                View All <ChevronRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {categories.map((cat, index) => (
                <Link
                  key={cat.cat_id}
                  to={`/categories/${cat.cat_id}`}
                  className="group flex flex-col items-center p-4 bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 hover:border-primary-200 hover:-translate-y-1"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${getCategoryColor(cat.cat_name)} flex items-center justify-center text-white mb-3 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg`}>
                    {getCategoryIcon(cat.cat_name)}
                  </div>
                  <span className="text-sm font-semibold text-gray-700 text-center group-hover:text-primary-600 transition-colors">
                    {cat.cat_name}
                  </span>
                </Link>
              ))}
            </div>
          </section>

          {endingSoon.length > 0 && (
            <section className="bg-gradient-to-br from-amber-50 to-orange-50 py-12">
              <div className="max-w-7xl mx-auto px-4">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center mr-4 shadow-lg">
                      <Clock className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">Ending Soon</h2>
                      <p className="text-gray-600">Don't miss out on these auctions!</p>
                    </div>
                  </div>
                  <Link to="/categories" className="hidden sm:flex items-center text-amber-600 hover:text-amber-700 font-medium transition-colors">
                    View All <ChevronRight className="w-4 h-4 ml-1" />
                  </Link>
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
                <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center mr-4 shadow-lg">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Featured Auctions</h2>
                  <p className="text-gray-600">Handpicked items just for you</p>
                </div>
              </div>
              <Link to="/categories" className="hidden sm:flex items-center text-primary-600 hover:text-primary-700 font-medium transition-colors">
                View All <ChevronRight className="w-4 h-4 ml-1" />
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
            ) : featuredItems.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {featuredItems.map(item => (
                  <ItemCard key={item.item_id} item={item} />
                ))}
              </div>
            ) : (
              <div className="card p-12 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Gavel className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Featured Items Yet</h3>
                <p className="text-gray-500 mb-4">Check back soon for featured auctions</p>
                <Link to="/categories" className="btn-primary inline-flex items-center">
                  Browse Categories <ChevronRight className="w-4 h-4 ml-2" />
                </Link>
              </div>
            )}
          </section>

          <section className="bg-gradient-to-br from-gray-900 to-gray-800 py-16 text-white">
            <div className="max-w-7xl mx-auto px-4">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold mb-4">How It Works</h2>
                <p className="text-gray-400 max-w-2xl mx-auto">Get started with BidKart in three simple steps</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="text-center group">
                  <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:shadow-xl group-hover:scale-105 transition-all">
                    <span className="text-3xl font-bold">1</span>
                  </div>
                  <div className="w-16 h-16 bg-gray-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold mb-3">Create an Account</h3>
                  <p className="text-gray-400 leading-relaxed">Sign up for free and start exploring thousands of auctions</p>
                </div>
                <div className="text-center group">
                  <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:shadow-xl group-hover:scale-105 transition-all">
                    <span className="text-3xl font-bold">2</span>
                  </div>
                  <div className="w-16 h-16 bg-gray-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Gavel className="w-8 h-8 text-primary-400" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">Place Your Bids</h3>
                  <p className="text-gray-400 leading-relaxed">Find items you love and place competitive bids</p>
                </div>
                <div className="text-center group">
                  <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:shadow-xl group-hover:scale-105 transition-all">
                    <span className="text-3xl font-bold">3</span>
                  </div>
                  <div className="w-16 h-16 bg-gray-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold mb-3">Win & Enjoy</h3>
                  <p className="text-gray-400 leading-relaxed">Win auctions and get your items delivered</p>
                </div>
              </div>
            </div>
          </section>

          <section className="bg-gray-100 py-12">
            <div className="max-w-7xl mx-auto px-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="bg-white rounded-xl p-6 text-center shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Gavel className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2 text-gray-900">Secure Bidding</h3>
                  <p className="text-gray-600 text-sm">All bids are secured with our advanced protection system</p>
                </div>
                <div className="bg-white rounded-xl p-6 text-center shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <DollarSign className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2 text-gray-900">Easy Payments</h3>
                  <p className="text-gray-600 text-sm">Secure wallet system for seamless transactions</p>
                </div>
                <div className="bg-white rounded-xl p-6 text-center shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-amber-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Clock className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2 text-gray-900">24/7 Support</h3>
                  <p className="text-gray-600 text-sm">Our team is always here to help you</p>
                </div>
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
