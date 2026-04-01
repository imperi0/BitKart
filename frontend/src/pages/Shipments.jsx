import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import { Package, Truck, CheckCircle, Clock, MapPin, ShoppingBag, Send, ChevronRight, MapPinOff } from 'lucide-react';

const statusSteps = [
  { key: 'pending', label: 'Order Placed', icon: Clock },
  { key: 'shipped', label: 'Shipped', icon: Package },
  { key: 'in_transit', label: 'In Transit', icon: Truck },
  { key: 'delivered', label: 'Delivered', icon: CheckCircle },
];

export default function Shipments() {
  const { user } = useContext(AuthContext);
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('bought');

  useEffect(() => {
    if (user) {
      fetchShipments();
    }
  }, [user]);

  const fetchShipments = async () => {
    try {
      const res = await axios.get('/api/shipments');
      setShipments(res.data.shipments || []);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch shipments:', err);
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
        return 'bg-green-100 text-green-700 border-green-200';
      case 'shipped':
      case 'in_transit':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'pending':
        return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'cancelled':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  const getStepStatus = (currentStatus, stepKey) => {
    const statusOrder = ['pending', 'shipped', 'in_transit', 'delivered'];
    const currentIndex = statusOrder.indexOf(currentStatus);
    const stepIndex = statusOrder.indexOf(stepKey);
    
    if (stepIndex < currentIndex) return 'completed';
    if (stepIndex === currentIndex) return 'current';
    return 'pending';
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
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <MapPinOff className="w-8 h-8 text-red-600" />
        </div>
        <p className="text-red-600 mb-4">{error}</p>
        <button onClick={fetchShipments} className="btn-primary">Retry</button>
      </div>
    );
  }

  const buyerShipments = shipments.filter(s => Number(s.buyer_id) === Number(user?.id));
  const sellerShipments = shipments.filter(s => Number(s.seller_id) === Number(user?.id));
  const displayShipments = activeTab === 'bought' ? buyerShipments : sellerShipments;

  const ShipmentCard = ({ shipment, isBuyer }) => {
    const steps = statusSteps.filter(s => s.key !== 'cancelled');
    const currentStepIndex = steps.findIndex(s => s.key === shipment.status);

    return (
      <div className="card p-6 hover:shadow-lg transition-shadow">
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="w-full lg:w-32 h-32 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden">
            {shipment.image_url ? (
              <img src={shipment.image_url} alt={shipment.item_title} className="w-full h-full object-cover" />
            ) : (
              <Package className="w-12 h-12 text-gray-400" />
            )}
          </div>

          <div className="flex-1">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
              <div>
                <Link to={`/item/${shipment.item_id}`} className="font-bold text-lg text-gray-900 hover:text-primary-600 transition-colors">
                  {shipment.item_title}
                </Link>
                <p className="text-sm text-gray-500 mt-1 flex items-center">
                  {isBuyer ? (
                    <>
                      <span className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center mr-2">
                        <Send className="w-2 h-2 text-white" />
                      </span>
                      From: {shipment.seller_name || 'Unknown Seller'}
                    </>
                  ) : (
                    <>
                      <span className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center mr-2">
                        <ShoppingBag className="w-2 h-2 text-white" />
                      </span>
                      To: {shipment.buyer_name || 'Unknown Buyer'}
                    </>
                  )}
                </p>
              </div>
              <span className={`px-4 py-2 rounded-full text-sm font-semibold border flex items-center ${getStatusColor(shipment.status)}`}>
                {getStatusIcon(shipment.status)}
                <span className="ml-2 capitalize">{shipment.status.replace('_', ' ')}</span>
              </span>
            </div>

            <div className={`flex items-center justify-between p-4 rounded-xl mb-4 ${
              shipment.status === 'delivered' ? 'bg-green-50' :
              shipment.status === 'in_transit' ? 'bg-blue-50' :
              shipment.status === 'shipped' ? 'bg-blue-50' :
              'bg-amber-50'
            }`}>
              <div className="flex items-center text-sm">
                <MapPin className="w-4 h-4 mr-2 text-gray-500" />
                <span className="text-gray-700">
                  {isBuyer ? shipment.shipping_address : (shipment.buyer_address || shipment.shipping_address)}
                </span>
              </div>
              {shipment.courier_name && (
                <div className="hidden sm:flex items-center text-sm text-gray-600">
                  <Truck className="w-4 h-4 mr-2" />
                  <span className="font-medium">{shipment.courier_name}</span>
                  {shipment.tracking_number && <span className="ml-1 text-gray-400">#{shipment.tracking_number}</span>}
                </div>
              )}
            </div>

            {shipment.status !== 'cancelled' && (
              <div className="mb-2">
                <div className="flex items-center justify-between mb-2">
                  {steps.map((step, index) => {
                    const stepStatus = getStepStatus(shipment.status, step.key);
                    return (
                      <div key={step.key} className="flex items-center flex-1">
                        <div className="flex flex-col items-center">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            stepStatus === 'completed' ? 'bg-green-500 text-white' :
                            stepStatus === 'current' ? 'bg-primary-600 text-white ring-4 ring-primary-100' :
                            'bg-gray-200 text-gray-400'
                          }`}>
                            <step.icon className="w-5 h-5" />
                          </div>
                          <span className={`text-xs mt-2 font-medium ${
                            stepStatus === 'completed' ? 'text-green-600' :
                            stepStatus === 'current' ? 'text-primary-600' :
                            'text-gray-400'
                          }`}>{step.label}</span>
                        </div>
                        {index < steps.length - 1 && (
                          <div className={`flex-1 h-1 mx-2 rounded ${
                            stepStatus === 'completed' ? 'bg-green-500' : 'bg-gray-200'
                          }`} />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {shipment.estimated_delivery && shipment.status !== 'delivered' && (
              <p className="text-sm text-gray-500 flex items-center">
                <Clock className="w-4 h-4 mr-2" />
                Estimated delivery: {new Date(shipment.estimated_delivery).toLocaleDateString()}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Shipments</h1>
        <p className="text-gray-600 mt-1">Track your orders and manage deliveries</p>
      </div>

      <div className="flex gap-4 mb-8 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('bought')}
          className={`pb-4 px-2 font-semibold transition-colors relative ${
            activeTab === 'bought' ? 'text-primary-600' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <span className="flex items-center">
            <ShoppingBag className="w-5 h-5 mr-2" />
            Items I Bought
            {buyerShipments.length > 0 && (
              <span className="ml-2 px-2 py-0.5 bg-primary-100 text-primary-700 rounded-full text-xs">
                {buyerShipments.length}
              </span>
            )}
          </span>
          {activeTab === 'bought' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600"></span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('sold')}
          className={`pb-4 px-2 font-semibold transition-colors relative ${
            activeTab === 'sold' ? 'text-primary-600' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <span className="flex items-center">
            <Send className="w-5 h-5 mr-2" />
            Items I Sold
            {sellerShipments.length > 0 && (
              <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs">
                {sellerShipments.length}
              </span>
            )}
          </span>
          {activeTab === 'sold' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600"></span>
          )}
        </button>
      </div>

      {displayShipments.length > 0 ? (
        <div className="space-y-4">
          {displayShipments.map(shipment => (
            <ShipmentCard key={shipment.shipment_id} shipment={shipment} isBuyer={activeTab === 'bought'} />
          ))}
        </div>
      ) : (
        <div className="card p-12 text-center">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            {activeTab === 'bought' ? (
              <ShoppingBag className="w-10 h-10 text-gray-400" />
            ) : (
              <Send className="w-10 h-10 text-gray-400" />
            )}
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {activeTab === 'bought' ? 'No items purchased yet' : 'No items sold yet'}
          </h3>
          <p className="text-gray-500 mb-6">
            {activeTab === 'bought' 
              ? "Win auctions to see your purchases here"
              : "List items and win auctions to see your sales here"
            }
          </p>
          <Link 
            to="/categories" 
            className="btn-primary inline-flex items-center"
          >
            {activeTab === 'bought' ? 'Browse Auctions' : 'Create Listing'}
            <ChevronRight className="w-4 h-4 ml-2" />
          </Link>
        </div>
      )}
    </div>
  );
}
