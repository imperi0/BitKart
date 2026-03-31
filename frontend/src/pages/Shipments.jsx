import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Package, Truck, CheckCircle, Clock, MapPin } from 'lucide-react';

export default function Shipments() {
  const [shipments, setShipments] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchShipments();
  }, []);

  const fetchShipments = async () => {
    try {
      const res = await axios.get('/api/shipments');
      setShipments(res.data.shipments);
    } catch (err) {
      console.error('Failed to fetch shipments');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'delivered':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'shipped':
      case 'in_transit':
        return <Truck className="w-5 h-5 text-blue-600" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-amber-600" />;
      default:
        return <Package className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-100 text-green-700';
      case 'shipped':
      case 'in_transit':
        return 'bg-blue-100 text-blue-700';
      case 'pending':
        return 'bg-amber-100 text-amber-700';
      case 'cancelled':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const filteredShipments = shipments.filter(s => {
    if (filter === 'all') return true;
    if (filter === 'seller') return s.seller_name;
    if (filter === 'buyer') return s.buyer_name;
    return true;
  });

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Shipments</h1>
        <p className="text-gray-600">Track your orders and deliveries</p>
      </div>

      <div className="mb-6">
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg ${filter === 'all' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-700'}`}
          >
            All ({shipments.length})
          </button>
          <button
            onClick={() => setFilter('buyer')}
            className={`px-4 py-2 rounded-lg ${filter === 'buyer' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-700'}`}
          >
            As Buyer ({shipments.filter(s => s.buyer_name).length})
          </button>
          <button
            onClick={() => setFilter('seller')}
            className={`px-4 py-2 rounded-lg ${filter === 'seller' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-700'}`}
          >
            As Seller ({shipments.filter(s => s.seller_name).length})
          </button>
        </div>
      </div>

      {filteredShipments.length > 0 ? (
        <div className="space-y-4">
          {filteredShipments.map(shipment => (
            <div key={shipment.shipment_id} className="card p-6">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="w-full md:w-32 h-32 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  {shipment.image_url ? (
                    <img src={shipment.image_url} alt={shipment.item_title} className="w-full h-full object-cover rounded-lg" />
                  ) : (
                    <Package className="w-12 h-12 text-gray-400" />
                  )}
                </div>

                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <Link to={`/item/${shipment.item_id}`} className="font-semibold text-gray-900 hover:text-primary-600">
                        {shipment.item_title}
                      </Link>
                      <p className="text-sm text-gray-500 mt-1">
                        {filter === 'all' && (
                          <>
                            {shipment.buyer_id ? `Sold to ${shipment.buyer_name}` : `Bought from ${shipment.seller_name}`}
                          </>
                        )}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center ${getStatusColor(shipment.status)}`}>
                      {getStatusIcon(shipment.status)}
                      <span className="ml-2 capitalize">{shipment.status.replace('_', ' ')}</span>
                    </span>
                  </div>

                  <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                    {shipment.courier_name && (
                      <div className="flex items-center text-sm text-gray-600">
                        <Truck className="w-4 h-4 mr-2" />
                        {shipment.courier_name}
                        {shipment.tracking_number && <span className="ml-1 text-gray-400">#{shipment.tracking_number}</span>}
                      </div>
                    )}
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="w-4 h-4 mr-2" />
                      {shipment.shipping_address}
                    </div>
                    {shipment.estimated_delivery && (
                      <div className="flex items-center text-sm text-gray-600">
                        <Clock className="w-4 h-4 mr-2" />
                        Est. {new Date(shipment.estimated_delivery).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card p-12 text-center">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No shipments yet</h3>
          <p className="text-gray-500 mt-2">
            Shipments will appear here once items are sold and shipped.
          </p>
        </div>
      )}
    </div>
  );
}
