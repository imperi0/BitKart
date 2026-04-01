import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Clock, Gavel, CheckCircle, XCircle } from 'lucide-react';

export default function ItemCard({ item }) {
  const [timeLeft, setTimeLeft] = useState(getTimeLeft(item.auction_end_time));
  const isEnding = timeLeft.hours === 0 && timeLeft.minutes < 60;
  const isUrgent = timeLeft.hours === 0 && timeLeft.minutes < 5;

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(getTimeLeft(item.auction_end_time));
    }, 1000);

    return () => clearInterval(timer);
  }, [item.auction_end_time]);

  const getStatusBadge = () => {
    if (item.status === 'sold') {
      return (
        <span className="absolute top-2 left-2 bg-blue-600 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center">
          <CheckCircle className="w-3 h-3 mr-1" />
          Sold
        </span>
      );
    }
    if (item.status === 'expired') {
      return (
        <span className="absolute top-2 left-2 bg-gray-600 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center">
          <XCircle className="w-3 h-3 mr-1" />
          Expired
        </span>
      );
    }
    if (item.status === 'active') {
      return (
        <span className="absolute top-2 left-2 bg-green-600 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center">
          <span className="w-2 h-2 mr-1 bg-white rounded-full animate-pulse"></span>
          Live
        </span>
      );
    }
    return null;
  };

  const formatTimeLeft = () => {
    if (timeLeft.days > 0) return `${timeLeft.days}d ${timeLeft.hours}h`;
    if (timeLeft.hours > 0) return `${timeLeft.hours}h ${timeLeft.minutes}m`;
    if (timeLeft.minutes > 0) return `${timeLeft.minutes}m ${timeLeft.seconds}s`;
    return `${timeLeft.seconds}s`;
  };

  return (
    <Link to={`/item/${item.item_id}`} className="card group block overflow-hidden">
      <div className={`relative h-48 bg-gray-100 overflow-hidden ${isUrgent ? 'ring-2 ring-red-500 animate-pulse-soft' : ''}`}>
        {item.image_url ? (
          <img 
            src={item.image_url} 
            alt={item.title} 
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" 
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
            <span className="text-4xl opacity-30">📦</span>
          </div>
        )}
        
        {getStatusBadge()}
        
        {item.bid_count > 0 && (
          <div className="absolute top-2 right-2 bg-primary-600 text-white px-2 py-1 rounded-full text-xs flex items-center shadow-lg">
            <Gavel className="w-3 h-3 mr-1" />
            {item.bid_count}
          </div>
        )}
        
        <div className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3 ${isUrgent ? 'bg-gradient-to-t from-red-600/80 to-transparent' : ''}`}>
          <div className={`flex items-center text-sm font-medium ${isUrgent ? 'text-white' : 'text-gray-100'}`}>
            <Clock className={`w-4 h-4 mr-1 ${isUrgent ? 'animate-pulse' : ''}`} />
            <span className={isUrgent ? 'font-bold' : ''}>
              {item.status === 'active' ? formatTimeLeft() : item.status.charAt(0).toUpperCase() + item.status.slice(1)}
            </span>
          </div>
        </div>
      </div>
      
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 truncate group-hover:text-primary-600 transition-colors line-clamp-1">
          {item.title}
        </h3>
        <p className="text-sm text-gray-500 mb-3 flex items-center">
          <span className="w-2 h-2 rounded-full bg-primary-500 mr-2"></span>
          {item.cat_name}
        </p>
        
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wide">Current Bid</p>
            <p className={`text-lg font-bold ${isUrgent ? 'text-red-600' : 'text-primary-600'}`}>
              ${item.current_price}
            </p>
          </div>
          
          <div className={`text-right px-3 py-1 rounded-lg ${item.status === 'active' ? 'bg-green-50 text-green-700' : item.status === 'sold' ? 'bg-blue-50 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>
            <p className="text-xs font-medium capitalize">{item.status}</p>
          </div>
        </div>
        
        {isEnding && item.status === 'active' && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <p className="text-xs text-amber-600 font-medium flex items-center">
              <span className="w-2 h-2 bg-amber-500 rounded-full mr-2 animate-pulse"></span>
              Ending soon! Place your bid now
            </p>
          </div>
        )}
      </div>
    </Link>
  );
}

function getTimeLeft(endTime) {
  const end = new Date(endTime);
  const now = new Date();
  const diff = end - now;

  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  return { days, hours, minutes, seconds };
}
