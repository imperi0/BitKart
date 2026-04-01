import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import { Clock, User, Gavel, Star, AlertCircle, ChevronLeft, Share2, Check, Copy, ExternalLink } from 'lucide-react';

export default function ItemDetail() {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [bidAmount, setBidAmount] = useState('');
  const [loading, setLoading] = useState(true);
  const [bidding, setBidding] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });
  const [showCopied, setShowCopied] = useState(false);
  const [relatedItems, setRelatedItems] = useState([]);

  useEffect(() => {
    fetchItem();
  }, [id]);

  useEffect(() => {
    if (item && item.status === 'active') {
      const timer = setInterval(() => {
        setTimeLeft(getTimeLeft(item.auction_end_time));
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [item]);

  const fetchItem = async () => {
    try {
      const res = await axios.get(`/api/items/${id}`);
      setItem(res.data.item);
      setBidAmount(parseFloat(res.data.item.current_price) + 1);
      
      if (res.data.item.cat_id) {
        const related = await axios.get(`/api/items?cat_id=${res.data.item.cat_id}&limit=4`);
        setRelatedItems(related.data.items.filter(i => i.item_id !== parseInt(id)).slice(0, 4));
      }
    } catch (err) {
      console.error('Failed to fetch item');
    } finally {
      setLoading(false);
    }
  };

  const handleBid = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (!user) {
      navigate('/login');
      return;
    }

    if (parseFloat(bidAmount) <= parseFloat(item.current_price)) {
      setError(`Bid must be higher than current price: $${item.current_price}`);
      return;
    }

    setBidding(true);
    try {
      const res = await axios.post(`/api/bids/${id}`, { amount: bidAmount });
      setSuccess('Bid placed successfully! 🎉');
      fetchItem();
      setTimeout(() => setSuccess(''), 5000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to place bid');
    } finally {
      setBidding(false);
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: item.title, url });
      } catch (err) {}
    } else {
      await navigator.clipboard.writeText(url);
      setShowCopied(true);
      setTimeout(() => setShowCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Item Not Found</h2>
          <Link to="/" className="text-primary-600 hover:underline mt-2 inline-block">Back to Home</Link>
        </div>
      </div>
    );
  }

  const isEnded = new Date(item.auction_end_time) < new Date();
  const isUrgent = timeLeft.hours === 0 && timeLeft.minutes < 5;

  const formatTimeLeft = () => {
    if (timeLeft.hours > 0) return `${timeLeft.hours}h ${timeLeft.minutes}m ${timeLeft.seconds}s`;
    if (timeLeft.minutes > 0) return `${timeLeft.minutes}m ${timeLeft.seconds}s`;
    return `${timeLeft.seconds}s`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 animate-fade-in">
      <button onClick={() => navigate(-1)} className="flex items-center text-gray-600 hover:text-gray-900 mb-6 transition-colors">
        <ChevronLeft className="w-5 h-5 mr-1" />
        Back
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="card overflow-hidden">
          <div className="relative group">
            {item.image_url ? (
              <div className="overflow-hidden">
                <img src={item.image_url} alt={item.title} className="w-full h-96 lg:h-[500px] object-cover transition-transform duration-500 group-hover:scale-110" />
              </div>
            ) : (
              <div className="w-full h-96 lg:h-[500px] bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                <span className="text-8xl opacity-30">📦</span>
              </div>
            )}
            
            {item.status === 'active' && !isEnded && (
              <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg animate-bounce-in">
                <div className="flex items-center">
                  <span className="w-3 h-3 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                  <span className="text-sm font-medium text-gray-700">Live Auction</span>
                </div>
              </div>
            )}
          </div>
        </div>

        <div>
          <div className="flex items-start justify-between mb-4">
            <div>
              <Link to={`/categories/${item.cat_id}`} className="text-sm text-primary-600 font-medium hover:underline">
                {item.cat_name}
              </Link>
              <h1 className="text-3xl font-bold text-gray-900 mt-1">{item.title}</h1>
            </div>
            <button onClick={handleShare} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              {showCopied ? <Check className="w-5 h-5 text-green-600" /> : <Share2 className="w-5 h-5 text-gray-600" />}
            </button>
          </div>

          <div className={`card p-6 mb-6 ${isUrgent && item.status === 'active' ? 'ring-2 ring-red-500 animate-pulse-soft' : ''}`}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-gray-500">Current Bid</p>
                <p className={`text-3xl font-bold ${isUrgent ? 'text-red-600' : 'text-primary-600'}`}>
                  ${item.current_price}
                </p>
              </div>
              
              <div className={`text-right px-4 py-3 rounded-xl ${
                isEnded ? 'bg-gray-100 text-gray-700' : 
                isUrgent ? 'bg-red-100 text-red-700' : 
                'bg-green-100 text-green-700'
              }`}>
                <p className="text-sm font-medium">
                  {isEnded ? 'Auction Ended' : isUrgent ? 'Ending Soon!' : 'Time Left'}
                </p>
                <p className={`text-xl font-bold ${isUrgent ? 'animate-pulse' : ''}`}>
                  {isEnded ? item.status.toUpperCase() : formatTimeLeft()}
                </p>
              </div>
            </div>

            <div className="flex items-center text-sm text-gray-600 mb-4 pb-4 border-b border-gray-100">
              <Gavel className="w-4 h-4 mr-2" />
              <span className="font-medium">{item.bids?.length || 0} bids</span>
              <span className="mx-3 text-gray-300">•</span>
              <span>Started at ${item.base_price}</span>
              {item.bid_count > 0 && (
                <>
                  <span className="mx-3 text-gray-300">•</span>
                  <span className="text-green-600 font-medium">
                    {(item.bids?.length || 0) - 1} outbid
                  </span>
                </>
              )}
            </div>

            {!isEnded && item.status === 'active' && (
              <form onSubmit={handleBid} className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex-1 relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg">$</span>
                    <input
                      type="number"
                      step="0.01"
                      min={parseFloat(item.current_price) + 1}
                      value={bidAmount}
                      onChange={(e) => setBidAmount(e.target.value)}
                      className="input-field pl-8 text-lg py-3"
                      placeholder="Enter bid amount"
                    />
                  </div>
                  <button type="submit" disabled={bidding} className="btn-primary px-8 py-3 text-lg font-semibold">
                    {bidding ? (
                      <span className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Placing...
                      </span>
                    ) : 'Place Bid'}
                  </button>
                </div>
              </form>
            )}

            {error && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center text-red-700 animate-scale-in">
                <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0" />
                {error}
              </div>
            )}

            {success && (
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 animate-bounce-in">
                <div className="flex items-center">
                  <Check className="w-5 h-5 mr-3" />
                  <span className="font-medium">{success}</span>
                </div>
              </div>
            )}
          </div>

          <div className="card p-6 mb-6">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Description
            </h3>
            <p className="text-gray-600 whitespace-pre-wrap leading-relaxed">{item.description || 'No description provided.'}</p>
          </div>

          <div className="card p-6">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
              <User className="w-5 h-5 mr-2 text-primary-600" />
              Seller Information
            </h3>
            <div className="flex items-center">
              <div className="w-14 h-14 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center mr-4 text-white font-bold text-xl">
                {item.seller_name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-semibold text-gray-900">{item.seller_name}</p>
                <p className="text-sm text-gray-500 flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {item.seller_address || 'Location not specified'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {item.bids?.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <Gavel className="w-5 h-5 mr-2 text-primary-600" />
            Bid History
          </h2>
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rank</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bidder</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {item.bids.slice(0, 10).map((bid, index) => (
                    <tr key={bid.bid_id} className={bid.is_winning ? 'bg-green-50' : 'hover:bg-gray-50'}>
                      <td className="px-6 py-4">
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                          index === 0 ? 'bg-amber-500 text-white' : 
                          index === 1 ? 'bg-gray-400 text-white' : 
                          index === 2 ? 'bg-amber-700 text-white' : 
                          'bg-gray-200 text-gray-600'
                        }`}>
                          {index + 1}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-900">
                        {bid.bidder_name}
                        {user && bid.user_id === user.id && (
                          <span className="ml-2 text-xs text-primary-600 font-medium">(You)</span>
                        )}
                      </td>
                      <td className="px-6 py-4 font-bold text-gray-900">${bid.bid_amount}</td>
                      <td className="px-6 py-4 text-gray-500">{new Date(bid.bid_time).toLocaleString()}</td>
                      <td className="px-6 py-4">
                        {bid.is_winning ? (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-green-500 text-white">
                            🏆 Winning
                          </span>
                        ) : (
                          <span className="text-gray-400 text-sm">Outbid</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {relatedItems.length > 0 && (
        <div className="mt-12">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Related Items</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {relatedItems.map(relatedItem => (
              <Link key={relatedItem.item_id} to={`/item/${relatedItem.item_id}`} className="card p-3 hover:shadow-md transition-all">
                <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden mb-3">
                  {relatedItem.image_url ? (
                    <img src={relatedItem.image_url} alt={relatedItem.title} className="w-full h-full object-cover hover:scale-105 transition-transform" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl opacity-30">📦</div>
                  )}
                </div>
                <h3 className="font-medium text-gray-900 truncate text-sm">{relatedItem.title}</h3>
                <p className="text-primary-600 font-bold mt-1">${relatedItem.current_price}</p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function getTimeLeft(endTime) {
  const end = new Date(endTime);
  const now = new Date();
  const diff = end - now;

  if (diff <= 0) return { hours: 0, minutes: 0, seconds: 0 };

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  return { hours, minutes, seconds };
}
