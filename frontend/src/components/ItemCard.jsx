import { Link } from 'react-router-dom';
import { Clock, Gavel } from 'lucide-react';

export default function ItemCard({ item }) {
  const timeLeft = getTimeLeft(item.auction_end_time);
  const isEnding = timeLeft.includes('h') && parseInt(timeLeft) < 24;

  return (
    <Link to={`/item/${item.item_id}`} className="card group">
      <div className="relative h-48 bg-gray-100 overflow-hidden">
        {item.image_url ? (
          <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <span className="text-4xl">📦</span>
          </div>
        )}
        {item.bid_count > 0 && (
          <div className="absolute top-2 right-2 bg-primary-600 text-white px-2 py-1 rounded-full text-xs flex items-center">
            <Gavel className="w-3 h-3 mr-1" />
            {item.bid_count}
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 truncate group-hover:text-primary-600 transition">
          {item.title}
        </h3>
        <p className="text-sm text-gray-500 mb-2">{item.cat_name}</p>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500">Current Bid</p>
            <p className="text-lg font-bold text-primary-600">${item.current_price}</p>
          </div>
          <div className={`text-right flex items-center ${isEnding ? 'text-red-600' : 'text-gray-600'}`}>
            <Clock className="w-4 h-4 mr-1" />
            <span className="text-sm">{timeLeft}</span>
          </div>
        </div>
      </div>
    </Link>
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
