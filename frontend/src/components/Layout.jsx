import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useContext, useState, useEffect } from 'react';
import AuthContext from '../context/AuthContext';
import { Search, User, LogOut, LayoutDashboard, Bell, Package, Menu, X } from 'lucide-react';
import axios from 'axios';

export default function Layout() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await axios.get('/api/categories');
      setCategories(res.data.categories.filter(c => !c.parent_cat_id));
    } catch (err) {
      console.error('Failed to fetch categories');
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">B</span>
              </div>
              <span className="text-xl font-bold text-gray-900">BidKart</span>
            </Link>

            <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-xl mx-8">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search items..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </form>

            <nav className="hidden md:flex items-center space-x-4">
              <div className="relative">
                <button
                  onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                  className="text-gray-600 hover:text-gray-900 px-3 py-2"
                >
                  Categories
                </button>
                {showCategoryDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 py-2">
                    {categories.map(cat => (
                      <Link
                        key={cat.cat_id}
                        to={`/categories/${cat.cat_id}`}
                        className="block px-4 py-2 text-gray-700 hover:bg-gray-50"
                        onClick={() => setShowCategoryDropdown(false)}
                      >
                        {cat.cat_name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {user ? (
                <>
                  <Link to="/alerts" className="text-gray-600 hover:text-gray-900 p-2">
                    <Bell className="w-5 h-5" />
                  </Link>
                  <Link to="/shipments" className="text-gray-600 hover:text-gray-900 p-2">
                    <Package className="w-5 h-5" />
                  </Link>
                  <Link to="/dashboard" className="text-gray-600 hover:text-gray-900 p-2">
                    <LayoutDashboard className="w-5 h-5" />
                  </Link>
                  <div className="flex items-center space-x-2 pl-4 border-l border-gray-200">
                    <span className="text-sm text-gray-600">{user.name}</span>
                    <button onClick={handleLogout} className="text-gray-600 hover:text-red-600">
                      <LogOut className="w-5 h-5" />
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <Link to="/login" className="btn-secondary">Login</Link>
                  <Link to="/register" className="btn-primary">Register</Link>
                </>
              )}
            </nav>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t">
              <form onSubmit={handleSearch} className="mb-4">
                <input
                  type="text"
                  placeholder="Search items..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg"
                />
              </form>
              <div className="space-y-2">
                {categories.slice(0, 5).map(cat => (
                  <Link
                    key={cat.cat_id}
                    to={`/categories/${cat.cat_id}`}
                    className="block py-2 text-gray-700"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {cat.cat_name}
                  </Link>
                ))}
                {user ? (
                  <>
                    <Link to="/dashboard" className="block py-2 text-gray-700" onClick={() => setMobileMenuOpen(false)}>Dashboard</Link>
                    <Link to="/alerts" className="block py-2 text-gray-700" onClick={() => setMobileMenuOpen(false)}>Alerts</Link>
                    <button onClick={handleLogout} className="block py-2 text-red-600 w-full text-left">Logout</button>
                  </>
                ) : (
                  <>
                    <Link to="/login" className="block py-2 text-gray-700" onClick={() => setMobileMenuOpen(false)}>Login</Link>
                    <Link to="/register" className="block py-2 text-primary-600 font-medium" onClick={() => setMobileMenuOpen(false)}>Register</Link>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-bold text-gray-900 mb-4">BidKart</h3>
              <p className="text-gray-600 text-sm">Your trusted electronic marketplace for auctions and purchases.</p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Categories</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><Link to="/categories/1">Electronics</Link></li>
                <li><Link to="/categories/2">Fashion</Link></li>
                <li><Link to="/categories/3">Home & Garden</Link></li>
                <li><Link to="/categories/4">Sports</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>Help Center</li>
                <li>Safety Tips</li>
                <li>Contact Us</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>Terms of Service</li>
                <li>Privacy Policy</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-200 mt-8 pt-8 text-center text-sm text-gray-600">
            &copy; 2024 BidKart. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
