import { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import { DollarSign, Package, Gavel, TrendingUp, Plus, Bell, Clock, ArrowUpRight, ArrowDownRight, Zap, ChevronRight } from 'lucide-react';

const presetAmounts = [50, 100, 250, 500];

export default function Dashboard() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [myItems, setMyItems] = useState([]);
  const [myBids, setMyBids] = useState([]);
  const [wallet, setWallet] = useState({ balance: 0 });
  const [addFundsAmount, setAddFundsAmount] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [loadingFunds, setLoadingFunds] = useState(false);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const [dashRes, itemsRes, bidsRes, walletRes] = await Promise.all([
        axios.get('/api/dashboard'),
        axios.get('/api/items/my/items'),
        axios.get('/api/items/my/bids'),
        axios.get('/api/wallet')
      ]);
      setStats(dashRes.data.stats);
      setMyItems(itemsRes.data.items);
      setMyBids(bidsRes.data.items);
      setWallet(walletRes.data.wallet);
    } catch (err) {
      console.error('Failed to fetch dashboard');
    }
  };

  const handleAddFunds = async (amount) => {
    setLoadingFunds(true);
    try {
      await axios.post('/api/wallet/add-funds', { amount });
      fetchDashboard();
    } catch (err) {
      console.error('Failed to add funds');
    } finally {
      setLoadingFunds(false);
    }
  };

  const handleCustomAmount = async (e) => {
    e.preventDefault();
    if (!addFundsAmount || parseFloat(addFundsAmount) <= 0) return;
    await handleAddFunds(parseFloat(addFundsAmount));
    setAddFundsAmount('');
  };

  if (!stats) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome back, {user?.name?.split(' ')[0]}! 👋</h1>
          <p className="text-gray-600">Here's what's happening with your auctions</p>
        </div>
        <Link to="/item/create" className="btn-primary flex items-center shadow-lg hover:shadow-xl transition-all">
          <Plus className="w-5 h-5 mr-2" />
          New Listing
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="stat-card bg-gradient-to-br from-primary-500 to-primary-700 text-white overflow-hidden relative">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full"></div>
          <div className="absolute -right-2 -bottom-2 w-16 h-16 bg-white/10 rounded-full"></div>
          <div className="relative">
            <div className="flex items-center justify-between mb-2">
              <p className="text-primary-100 text-sm font-medium">Wallet Balance</p>
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <DollarSign className="w-5 h-5" />
              </div>
            </div>
            <p className="text-3xl font-bold mb-4">${Number(wallet.balance || 0).toFixed(2)}</p>
            <div className="flex flex-wrap gap-2">
              {presetAmounts.map(amount => (
                <button
                  key={amount}
                  onClick={() => handleAddFunds(amount)}
                  disabled={loadingFunds}
                  className="text-xs bg-white/20 hover:bg-white/30 px-3 py-1 rounded-full transition-colors disabled:opacity-50"
                >
                  +${amount}
                </button>
              ))}
            </div>
            <form onSubmit={handleCustomAmount} className="mt-3 flex gap-2">
              <input
                type="number"
                step="0.01"
                min="1"
                value={addFundsAmount}
                onChange={(e) => setAddFundsAmount(e.target.value)}
                className="w-full px-3 py-1.5 bg-white/20 rounded-lg text-white placeholder-primary-200 text-sm focus:outline-none focus:ring-2 focus:ring-white/50"
                placeholder="Custom amount"
              />
              <button type="submit" disabled={loadingFunds} className="px-3 py-1.5 bg-white text-primary-600 rounded-lg text-sm font-medium hover:bg-primary-50 transition-colors disabled:opacity-50">
                Add
              </button>
            </form>
          </div>
        </div>

        <div className="stat-card bg-gradient-to-br from-blue-500 to-blue-700 text-white overflow-hidden relative">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full"></div>
          <div className="relative">
            <div className="flex items-center justify-between mb-2">
              <p className="text-blue-100 text-sm font-medium">My Listings</p>
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <Package className="w-5 h-5" />
              </div>
            </div>
            <p className="text-3xl font-bold">{stats.total_listings}</p>
            <p className="text-blue-100 text-sm mt-2 flex items-center">
              <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
              {stats.active_listings} active
            </p>
          </div>
        </div>

        <div className="stat-card bg-gradient-to-br from-amber-500 to-amber-700 text-white overflow-hidden relative">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full"></div>
          <div className="relative">
            <div className="flex items-center justify-between mb-2">
              <p className="text-amber-100 text-sm font-medium">Total Bids</p>
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <Gavel className="w-5 h-5" />
              </div>
            </div>
            <p className="text-3xl font-bold">{stats.total_bids}</p>
            <p className="text-amber-100 text-sm mt-2 flex items-center">
              <Trophy className="w-4 h-4 mr-2" />
              {stats.items_won} won
            </p>
          </div>
        </div>

        <div className="stat-card bg-gradient-to-br from-green-500 to-green-700 text-white overflow-hidden relative">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full"></div>
          <div className="relative">
            <div className="flex items-center justify-between mb-2">
              <p className="text-green-100 text-sm font-medium">Items Sold</p>
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <TrendingUp className="w-5 h-5" />
              </div>
            </div>
            <p className="text-3xl font-bold">{stats.items_sold}</p>
            <p className="text-green-100 text-sm mt-2 flex items-center">
              <Star className="w-4 h-4 mr-2" />
              {stats.reviews_received} reviews
            </p>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <div className="flex border-b border-gray-200 bg-white rounded-t-xl">
          {['overview', 'my-items', 'my-bids'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 font-medium transition-colors relative ${
                activeTab === tab ? 'text-primary-600' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
              {activeTab === tab && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600"></span>
              )}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900 flex items-center">
                <Zap className="w-5 h-5 mr-2 text-amber-500" />
                Recent Activity
              </h3>
            </div>
            <div className="divide-y divide-gray-100">
              {stats.recentBids?.length > 0 ? stats.recentBids.slice(0, 5).map(bid => (
                <Link key={bid.bid_id} to={`/item/${bid.item_id}`} className="flex items-center p-4 hover:bg-gray-50 transition-colors">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${bid.is_winning ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'}`}>
                    {bid.is_winning ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5" />}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 truncate">{bid.item_title}</p>
                    <p className="text-sm text-gray-500">Your bid: ${bid.bid_amount}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${bid.is_winning ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                    {bid.is_winning ? 'Winning' : 'Outbid'}
                  </span>
                </Link>
              )) : (
                <div className="p-8 text-center">
                  <Gavel className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No bids yet</p>
                  <Link to="/categories" className="text-primary-600 hover:underline text-sm mt-2 inline-block">
                    Browse auctions
                  </Link>
                </div>
              )}
            </div>
          </div>

          <div className="card">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900 flex items-center">
                <Bell className="w-5 h-5 mr-2 text-primary-600" />
                Alerts & Notifications
              </h3>
              <Link to="/alerts" className="text-sm text-primary-600 hover:underline flex items-center">
                Manage <ChevronRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
            <div className="p-4 space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center mr-3">
                    <Bell className="w-5 h-5 text-primary-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Active Alerts</p>
                    <p className="text-sm text-gray-500">Get notified of new items</p>
                  </div>
                </div>
                <span className="text-2xl font-bold text-primary-600">{stats.total_alerts}</span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-amber-50 rounded-xl">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center mr-3">
                    <Clock className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Unread</p>
                    <p className="text-sm text-gray-500">Pending notifications</p>
                  </div>
                </div>
                <span className="text-2xl font-bold text-amber-600">{stats.unread_notifications}</span>
              </div>

              <Link to="/alerts" className="block w-full text-center py-3 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition-colors">
                Create New Alert
              </Link>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'my-items' && (
        <div className="card overflow-hidden">
          {myItems.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Current Bid</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bids</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ends</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {myItems.map(item => (
                    <tr key={item.item_id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden mr-3">
                            {item.image_url ? (
                              <img src={item.image_url} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-xl">📦</div>
                            )}
                          </div>
                          <Link to={`/item/${item.item_id}`} className="font-medium text-gray-900 hover:text-primary-600">
                            {item.title}
                          </Link>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-bold text-gray-900">${item.current_price}</td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-medium">
                          {item.bid_count} bids
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-500">{new Date(item.auction_end_time).toLocaleDateString()}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          item.status === 'active' ? 'bg-green-100 text-green-700' :
                          item.status === 'sold' ? 'bg-blue-100 text-blue-700' :
                          'bg-gray-100 text-gray-600'
                        }`}>
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-12 text-center">
              <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No items listed yet</h3>
              <p className="text-gray-500 mb-4">Start selling by creating your first listing</p>
              <Link to="/item/create" className="btn-primary inline-flex items-center">
                <Plus className="w-5 h-5 mr-2" />
                Create Listing
              </Link>
            </div>
          )}
        </div>
      )}

      {activeTab === 'my-bids' && (
        <div className="card overflow-hidden">
          {myBids.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Your Bid</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Current Price</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {myBids.map(item => (
                    <tr key={item.item_id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden mr-3">
                            {item.image_url ? (
                              <img src={item.image_url} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-xl">📦</div>
                            )}
                          </div>
                          <Link to={`/item/${item.item_id}`} className="font-medium text-gray-900 hover:text-primary-600">
                            {item.title}
                          </Link>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-bold text-gray-900">${item.my_highest_bid}</td>
                      <td className="px-6 py-4 text-gray-600">${item.current_price}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          item.status === 'sold' 
                            ? (item.is_winning ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600')
                            : item.status === 'expired'
                            ? 'bg-amber-100 text-amber-700'
                            : (item.is_winning ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700')
                        }`}>
                          {item.status === 'sold' ? (item.is_winning ? 'Won 🏆' : 'Lost') : 
                           item.status === 'expired' ? 'Expired' : 
                           (item.is_winning ? 'Winning' : 'Outbid')}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <Link to={`/item/${item.item_id}`} className="text-primary-600 hover:underline text-sm">
                          View →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-12 text-center">
              <Gavel className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No bids placed yet</h3>
              <p className="text-gray-500 mb-4">Start bidding on items you love</p>
              <Link to="/categories" className="btn-primary inline-flex items-center">
                Browse Auctions
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Trophy(props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={props.size || 24} height={props.size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/>
      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/>
      <path d="M4 22h16"/>
      <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/>
      <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/>
      <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/>
    </svg>
  );
}

function Star(props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={props.size || 24} height={props.size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
    </svg>
  );
}
