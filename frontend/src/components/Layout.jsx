import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useContext, useState, useEffect } from 'react';
import AuthContext from '../context/AuthContext';
import { Search, LogOut, LayoutDashboard, Package, Menu, X, Plus, ChevronDown } from 'lucide-react';
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

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="bg-white shadow-sm sticky top-0 z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
                <span className="text-white font-bold text-xl">B</span>
              </div>
              <span className="text-xl font-bold text-gray-900 hidden sm:block">BidKart</span>
            </Link>

            <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-xl mx-6">
              <div className="relative w-full">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search items, brands, categories..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-2.5 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-gray-50 hover:bg-white transition-colors"
                />
              </div>
            </form>

            <nav className="hidden md:flex items-center space-x-2">
              <div className="relative">
                <button
                  onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                  className="flex items-center text-gray-600 hover:text-gray-900 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Categories
                  <ChevronDown className="w-4 h-4 ml-1" />
                </button>
                {showCategoryDropdown && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowCategoryDropdown(false)} />
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50 animate-scale-in">
                      {categories.map((cat, index) => (
                        <Link
                          key={cat.cat_id}
                          to={`/categories/${cat.cat_id}`}
                          className="flex items-center px-4 py-2.5 text-gray-700 hover:bg-gray-50 transition-colors"
                          onClick={() => setShowCategoryDropdown(false)}
                          style={{ animationDelay: `${index * 30}ms` }}
                        >
                          <span className="w-2 h-2 bg-primary-500 rounded-full mr-3"></span>
                          {cat.cat_name}
                        </Link>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {user ? (
                <>
                  {user.is_admin && (
                    <Link to="/item/create" className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors" title="Create Listing">
                      <Plus className="w-5 h-5" />
                    </Link>
                  )}
                  <Link to="/shipments" className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors" title="Shipments">
                    <Package className="w-5 h-5" />
                  </Link>
                  <Link to="/dashboard" className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors" title="Dashboard">
                    <LayoutDashboard className="w-5 h-5" />
                  </Link>
                  <div className="flex items-center ml-2 pl-4 border-l border-gray-200">
                    <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center text-white font-semibold text-sm mr-3">
                      {getInitials(user.name)}
                    </div>
                    <span className="text-sm font-medium text-gray-700 mr-3 hidden lg:block">{user.name}</span>
                    <button onClick={handleLogout} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Logout">
                      <LogOut className="w-5 h-5" />
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <Link to="/login" className="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium transition-colors">
                    Login
                  </Link>
                  <Link to="/register" className="btn-primary">
                    Register
                  </Link>
                </>
              )}
            </nav>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          <form onSubmit={handleSearch} className="md:hidden pb-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500 bg-gray-50"
              />
            </div>
          </form>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 animate-slide-down">
            <div className="px-4 py-4 space-y-2">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Categories</p>
              {categories.slice(0, 6).map(cat => (
                <Link
                  key={cat.cat_id}
                  to={`/categories/${cat.cat_id}`}
                  className="flex items-center py-2.5 px-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span className="w-2 h-2 bg-primary-500 rounded-full mr-3"></span>
                  {cat.cat_name}
                </Link>
              ))}
              
              {user ? (
                <div className="pt-4 border-t border-gray-100 mt-4 space-y-2">
                  <Link to="/dashboard" className="flex items-center py-2.5 px-3 text-gray-700 hover:bg-gray-50 rounded-lg" onClick={() => setMobileMenuOpen(false)}>
                    <LayoutDashboard className="w-5 h-5 mr-3" />
                    Dashboard
                  </Link>
                  <Link to="/shipments" className="flex items-center py-2.5 px-3 text-gray-700 hover:bg-gray-50 rounded-lg" onClick={() => setMobileMenuOpen(false)}>
                    <Package className="w-5 h-5 mr-3" />
                    Shipments
                  </Link>
                  <Link to="/alerts" className="flex items-center py-2.5 px-3 text-gray-700 hover:bg-gray-50 rounded-lg" onClick={() => setMobileMenuOpen(false)}>
                    <span className="w-5 h-5 mr-3 flex items-center justify-center text-gray-400">🔔</span>
                    Alerts
                  </Link>
                  <button onClick={handleLogout} className="flex items-center w-full py-2.5 px-3 text-red-600 hover:bg-red-50 rounded-lg">
                    <LogOut className="w-5 h-5 mr-3" />
                    Logout
                  </button>
                </div>
              ) : (
                <div className="pt-4 border-t border-gray-100 mt-4 space-y-2">
                  <Link to="/login" className="block py-2.5 px-3 text-center text-gray-700 hover:bg-gray-50 rounded-lg" onClick={() => setMobileMenuOpen(false)}>Login</Link>
                  <Link to="/register" className="block py-2.5 px-3 text-center bg-primary-600 text-white rounded-lg hover:bg-primary-700" onClick={() => setMobileMenuOpen(false)}>Register</Link>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto px-4 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">B</span>
                </div>
                <span className="font-bold text-gray-900">BidKart</span>
              </div>
              <p className="text-gray-600 text-sm leading-relaxed">Your trusted electronic marketplace for auctions and purchases.</p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Categories</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/categories/1" className="text-gray-600 hover:text-primary-600 transition-colors">Electronics</Link></li>
                <li><Link to="/categories/2" className="text-gray-600 hover:text-primary-600 transition-colors">Fashion</Link></li>
                <li><Link to="/categories/3" className="text-gray-600 hover:text-primary-600 transition-colors">Home & Garden</Link></li>
                <li><Link to="/categories/4" className="text-gray-600 hover:text-primary-600 transition-colors">Sports</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><span className="hover:text-primary-600 cursor-pointer transition-colors">Help Center</span></li>
                <li><span className="hover:text-primary-600 cursor-pointer transition-colors">Safety Tips</span></li>
                <li><span className="hover:text-primary-600 cursor-pointer transition-colors">Contact Us</span></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><span className="hover:text-primary-600 cursor-pointer transition-colors">Terms of Service</span></li>
                <li><span className="hover:text-primary-600 cursor-pointer transition-colors">Privacy Policy</span></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-200 mt-8 pt-8 flex flex-col md:flex-row items-center justify-between text-sm text-gray-500">
            <p>© 2024 BidKart. All rights reserved.</p>
            <p className="mt-2 md:mt-0">Built with ❤️ for auction enthusiasts</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
