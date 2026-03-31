import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import { Clock, User, Gavel, Star, AlertCircle, ChevronLeft } from 'lucide-react';

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

  useEffect(() => {
    fetchItem();
  }, [id]);

  const fetchItem = async () => {
    try {
      const res = await axios.get(`/api/items/${id}`);
      setItem(res.data.item);
      setBidAmount(parseFloat(res.data.item.current_price) + 1);
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
      setSuccess(res.data.message);
      fetchItem();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to place bid');
    } finally {
      setBidding(false);
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

  const timeLeft = getTimeLeft(item.auction_end_time);
  const isEnded = new Date(item.auction_end_time) < new Date();

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <button onClick={() => navigate(-1)} className="flex items-center text-gray-600 hover:text-gray-900 mb-6">
        <ChevronLeft className="w-5 h-5 mr-1" />
        Back
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="card overflow-hidden">
          {item.image_url ? (
            <img src={item.image_url} alt={item.title} className="w-full h-96 object-cover" />
          ) : (
            <div className="w-full h-96 bg-gray-100 flex items-center justify-center">
              <span className="text-6xl">📦</span>
            </div>
          )}
        </div>

        <div>
          <div className="mb-4">
            <span className="text-sm text-primary-600 font-medium">{item.cat_name}</span>
            <h1 className="text-3xl font-bold text-gray-900 mt-1">{item.title}</h1>
          </div>

          <div className="card p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-gray-500">Current Bid</p>
                <p className="text-3xl font-bold text-primary-600">${item.current_price}</p>
              </div>
              <div className={`text-right px-4 py-2 rounded-lg ${isEnded ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                <p className="text-sm font-medium">{isEnded ? 'Auction Ended' : 'Time Left'}</p>
                <p className="text-lg font-bold">{isEnded ? item.status.toUpperCase() : timeLeft}</p>
              </div>
            </div>

            <div className="flex items-center text-sm text-gray-600 mb-4">
              <Gavel className="w-4 h-4 mr-2" />
              <span>{item.bids?.length || 0} bids</span>
              <span className="mx-2">•</span>
              <span>Started at ${item.base_price}</span>
            </div>

            {!isEnded && item.status === 'active' && (
              <form onSubmit={handleBid} className="space-y-4">
                <div className="flex gap-4">
                  <input
                    type="number"
                    step="0.01"
                    min={parseFloat(item.current_price) + 1}
                    value={bidAmount}
                    onChange={(e) => setBidAmount(e.target.value)}
                    className="input-field flex-1"
                    placeholder="Enter bid amount"
                  />
                  <button type="submit" disabled={bidding} className="btn-primary px-8">
                    {bidding ? 'Placing...' : 'Place Bid'}
                  </button>
                </div>
              </form>
            )}

            {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center text-red-700">
                <AlertCircle className="w-5 h-5 mr-2" />
                {error}
              </div>
            )}

            {success && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700">
                {success}
              </div>
            )}
          </div>

          <div className="card p-6 mb-6">
            <h3 className="font-semibold text-gray-900 mb-4">Description</h3>
            <p className="text-gray-600 whitespace-pre-wrap">{item.description || 'No description provided.'}</p>
          </div>

          <div className="card p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Seller Information</h3>
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mr-4">
                <User className="w-6 h-6 text-gray-500" />
              </div>
              <div>
                <p className="font-medium text-gray-900">{item.seller_name}</p>
                <p className="text-sm text-gray-500">{item.seller_address || 'Location not specified'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {item.bids?.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Bid History</h2>
          <div className="card overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bidder</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {item.bids.slice(0, 10).map((bid) => (
                  <tr key={bid.bid_id} className={bid.is_winning ? 'bg-green-50' : ''}>
                    <td className="px-6 py-4">{bid.bidder_name}</td>
                    <td className="px-6 py-4 font-medium">${bid.bid_amount}</td>
                    <td className="px-6 py-4 text-gray-500">{new Date(bid.bid_time).toLocaleString()}</td>
                    <td className="px-6 py-4">
                      {bid.is_winning ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Winning
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
      )}

      {item.reviews?.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Reviews</h2>
          <div className="space-y-4">
            {item.reviews.map((review) => (
              <div key={review.review_id} className="card p-6">
                <div className="flex items-center mb-2">
                  <div className="flex text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'fill-current' : 'text-gray-300'}`} />
                    ))}
                  </div>
                  <span className="ml-2 text-sm text-gray-500">{review.reviewer_name}</span>
                  <span className="ml-auto text-sm text-gray-400">{new Date(review.review_date).toLocaleDateString()}</span>
                </div>
                {review.comment && <p className="text-gray-600">{review.comment}</p>}
              </div>
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

  if (diff <= 0) return 'Ended';

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}
