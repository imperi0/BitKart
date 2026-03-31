import { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import { DollarSign, Package, Gavel, TrendingUp, Plus, Bell, Clock } from 'lucide-react';

export default function Dashboard() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [myItems, setMyItems] = useState([]);
  const [myBids, setMyBids] = useState([]);
  const [wallet, setWallet] = useState({ balance: 0 });
  const [addFundsAmount, setAddFundsAmount] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

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

  const handleAddFunds = async (e) => {
    e.preventDefault();
    if (!addFundsAmount || parseFloat(addFundsAmount) <= 0) return;
    
    try {
      await axios.post('/api/wallet/add-funds', { amount: addFundsAmount });
      fetchDashboard();
      setAddFundsAmount('');
    } catch (err) {
      console.error('Failed to add funds');
    }
  };

  if (!stats) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome, {user?.name}</h1>
          <p className="text-gray-600">Manage your auctions and bids</p>
        </div>
        <Link to="/item/create" className="btn-primary flex items-center">
          <Plus className="w-5 h-5 mr-2" />
          New Listing
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Wallet Balance</p>
              <p className="text-2xl font-bold text-primary-600">${Number(wallet.balance || 0).toFixed(2)}</p>
            </div>
            <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-primary-600" />
            </div>
          </div>
          <form onSubmit={handleAddFunds} className="mt-4 flex gap-2">
            <input
              type="number"
              step="0.01"
              min="1"
              value={addFundsAmount}
              onChange={(e) => setAddFundsAmount(e.target.value)}
              className="input-field text-sm flex-1"
              placeholder="Amount"
            />
            <button type="submit" className="btn-secondary text-sm">Add</button>
          </form>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">My Listings</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total_listings}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Package className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-2">{stats.active_listings} active</p>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Bids</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total_bids}</p>
            </div>
            <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
              <Gavel className="w-6 h-6 text-amber-600" />
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-2">{stats.items_won} won</p>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Items Sold</p>
              <p className="text-2xl font-bold text-gray-900">{stats.items_sold}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-2">{stats.reviews_received} reviews</p>
        </div>
      </div>

      <div className="mb-6">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 font-medium ${activeTab === 'overview' ? 'text-primary-600 border-b-2 border-primary-600' : 'text-gray-500'}`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('my-items')}
            className={`px-4 py-2 font-medium ${activeTab === 'my-items' ? 'text-primary-600 border-b-2 border-primary-600' : 'text-gray-500'}`}
          >
            My Items ({myItems.length})
          </button>
          <button
            onClick={() => setActiveTab('my-bids')}
            className={`px-4 py-2 font-medium ${activeTab === 'my-bids' ? 'text-primary-600 border-b-2 border-primary-600' : 'text-gray-500'}`}
          >
            My Bids ({myBids.length})
          </button>
        </div>
      </div>

      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="card">
            <div className="p-4 border-b border-gray-100">
              <h3 className="font-semibold text-gray-900">Recent Bids</h3>
            </div>
            <div className="divide-y divide-gray-100">
              {stats.recentBids?.length > 0 ? stats.recentBids.map(bid => (
                <Link key={bid.bid_id} to={`/item/${bid.item_id}`} className="flex items-center p-4 hover:bg-gray-50">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{bid.item_title}</p>
                    <p className="text-sm text-gray-500">Your bid: ${bid.bid_amount}</p>
                  </div>
                  <span className={`text-sm px-2 py-1 rounded ${bid.is_winning ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                    {bid.is_winning ? 'Winning' : 'Outbid'}
                  </span>
                </Link>
              )) : (
                <p className="p-4 text-gray-500 text-center">No bids yet</p>
              )}
            </div>
          </div>

          <div className="card">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Alerts</h3>
              <Link to="/alerts" className="text-sm text-primary-600">Manage</Link>
            </div>
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <Bell className="w-5 h-5 text-gray-400 mr-2" />
                  <span className="text-gray-600">Active Alerts</span>
                </div>
                <span className="font-semibold">{stats.total_alerts}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Clock className="w-5 h-5 text-gray-400 mr-2" />
                  <span className="text-gray-600">Unread Notifications</span>
                </div>
                <span className="font-semibold">{stats.unread_notifications}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'my-items' && (
        <div className="card overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Current Bid</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bids</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ends</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {myItems.length > 0 ? myItems.map(item => (
                <tr key={item.item_id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <Link to={`/item/${item.item_id}`} className="font-medium text-gray-900 hover:text-primary-600">
                      {item.title}
                    </Link>
                  </td>
                  <td className="px-6 py-4 font-medium">${item.current_price}</td>
                  <td className="px-6 py-4">{item.bid_count}</td>
                  <td className="px-6 py-4 text-gray-500">{new Date(item.auction_end_time).toLocaleDateString()}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      item.status === 'active' ? 'bg-green-100 text-green-700' :
                      item.status === 'sold' ? 'bg-blue-100 text-blue-700' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {item.status}
                    </span>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                    No items listed yet
                    <Link to="/item/create" className="text-primary-600 hover:underline ml-2">Create one</Link>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'my-bids' && (
        <div className="card overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Your Highest Bid</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Current Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {myBids.length > 0 ? myBids.map(item => (
                <tr key={item.item_id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <Link to={`/item/${item.item_id}`} className="font-medium text-gray-900 hover:text-primary-600">
                      {item.title}
                    </Link>
                  </td>
                  <td className="px-6 py-4 font-medium">${item.my_highest_bid}</td>
                  <td className="px-6 py-4">${item.current_price}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      item.is_winning ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {item.is_winning ? 'Winning' : 'Outbid'}
                    </span>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="4" className="px-6 py-8 text-center text-gray-500">No bids placed yet</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
