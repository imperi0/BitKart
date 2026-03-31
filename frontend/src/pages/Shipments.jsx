import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import { Package, Truck, CheckCircle, Clock, MapPin, ShoppingBag, Send } from 'lucide-react';

export default function Shipments() {
  const { user } = useContext(AuthContext);
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user) {
      fetchShipments();
    }
  }, [user]);

  const fetchShipments = async () => {
    try {
      console.log('Fetching shipments for user:', user?.id);
      const res = await axios.get('/api/shipments');
      console.log('Shipments API response:', res.data);
      setShipments(res.data.shipments || []);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch shipments:', err);
      console.error('Error response:', err.response?.data);
      setError(err.response?.data?.message || 'Failed to load shipments');
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

  if (loading || !user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8 text-center">
        <p className="text-red-600 mb-4">{error}</p>
        <button onClick={fetchShipments} className="btn-primary">Retry</button>
      </div>
    );
  }

  const buyerShipments = shipments.filter(s => Number(s.buyer_id) === Number(user?.id));
  const sellerShipments = shipments.filter(s => Number(s.seller_id) === Number(user?.id));
  
  console.log('User ID:', user?.id);
  console.log('Buyer shipments:', buyerShipments);
  console.log('Seller shipments:', sellerShipments);

  const ShipmentCard = ({ shipment, isBuyer }) => (
    <div className="card p-6">
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
                {isBuyer ? `From: ${shipment.seller_name || 'Unknown'}` : `To: ${shipment.buyer_name || 'Unknown'}`}
              </p>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center ${getStatusColor(shipment.status)}`}>
              {getStatusIcon(shipment.status)}
              <span className="ml-2 capitalize">{shipment.status.replace('_', ' ')}</span>
            </span>
          </div>

          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center text-sm text-gray-600">
              <MapPin className="w-4 h-4 mr-2" />
              {isBuyer ? shipment.shipping_address : shipment.buyer_address || shipment.shipping_address}
            </div>
            {shipment.courier_name && (
              <div className="flex items-center text-sm text-gray-600">
                <Truck className="w-4 h-4 mr-2" />
                {shipment.courier_name}
                {shipment.tracking_number && <span className="ml-1 text-gray-400">#{shipment.tracking_number}</span>}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">My Shipments</h1>
        <p className="text-gray-600">Track your orders and manage shipments</p>
      </div>

      {/* Items I Bought */}
      <section className="mb-10">
        <div className="flex items-center mb-4">
          <ShoppingBag className="w-6 h-6 text-primary-600 mr-2" />
          <h2 className="text-xl font-bold text-gray-900">Items I Bought</h2>
          <span className="ml-2 px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-sm">
            {buyerShipments.length}
          </span>
        </div>

        {buyerShipments.length > 0 ? (
          <div className="space-y-4">
            {buyerShipments.map(shipment => (
              <ShipmentCard key={shipment.shipment_id} shipment={shipment} isBuyer={true} />
            ))}
          </div>
        ) : (
          <div className="card p-8 text-center">
            <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No items purchased yet</p>
            <Link to="/categories" className="text-primary-600 hover:underline text-sm mt-2 inline-block">
              Browse auctions
            </Link>
          </div>
        )}
      </section>

      {/* Divider */}
      <div className="border-t border-gray-200 my-8"></div>

      {/* Items I Sold */}
      <section>
        <div className="flex items-center mb-4">
          <Send className="w-6 h-6 text-green-600 mr-2" />
          <h2 className="text-xl font-bold text-gray-900">Items I Sold</h2>
          <span className="ml-2 px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-sm">
            {sellerShipments.length}
          </span>
        </div>

        {sellerShipments.length > 0 ? (
          <div className="space-y-4">
            {sellerShipments.map(shipment => (
              <ShipmentCard key={shipment.shipment_id} shipment={shipment} isBuyer={false} />
            ))}
          </div>
        ) : (
          <div className="card p-8 text-center">
            <Send className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No items sold yet</p>
            <Link to="/item/create" className="text-primary-600 hover:underline text-sm mt-2 inline-block">
              List an item
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}
