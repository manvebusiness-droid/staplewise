import React, { useState, useEffect } from 'react';
import { Eye, Edit, Save, X, Package, Truck, Calendar, User } from 'lucide-react';
import { OrderService } from '../../lib/supabaseServices';
import { useAuth } from '../../contexts/AuthContext';

const Orders: React.FC = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [editingOrderId, setEditingOrderId] = useState<string | null>(null);
  const [editStatus, setEditStatus] = useState<string>('');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const ordersData = await OrderService.getOrdersBySeller(user.id);
      setOrders(ordersData);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    try {
      await OrderService.updateOrderStatus(orderId, newStatus);
      await fetchOrders(); // Refresh orders
      setEditingOrderId(null);
      alert('Order status updated successfully!');
    } catch (error) {
      console.error('Error updating order status:', error);
      alert('Failed to update order status');
    }
  };

  const startEditing = (orderId: string, currentStatus: string) => {
    setEditingOrderId(orderId);
    setEditStatus(currentStatus);
  };

  const cancelEditing = () => {
    setEditingOrderId(null);
    setEditStatus('');
  };

  // Calculate stats from orders
  const stats = {
    totalOrders: orders.length,
    totalQuantity: orders.reduce((sum, order) => sum + (order.quantity || 0), 0),
    totalRevenue: orders.reduce((sum, order) => sum + (order.total_amount || 0), 0)
  };

  const orderStatuses = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-playfair text-primary">Orders</h1>
        <p className="text-gray-600 mt-2">Manage your incoming orders and track deliveries</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-soft p-6">
          <div className="flex items-center">
            <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
              <Package className="w-6 h-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Total Orders</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalOrders}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-soft p-6">
          <div className="flex items-center">
            <div className="p-2 rounded-lg bg-green-100 text-green-600">
              <Truck className="w-6 h-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Total Quantity</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalQuantity} kg</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-soft p-6">
          <div className="flex items-center">
            <div className="p-2 rounded-lg bg-purple-100 text-purple-600">
              <Calendar className="w-6 h-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">₹{stats.totalRevenue.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl shadow-soft overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-bold font-playfair text-primary">Your Orders ({orders.length})</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Buyer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{order.order_number}</p>
                      <p className="text-sm text-gray-500">{new Date(order.created_at).toLocaleDateString()}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {order.products?.image && (
                        <img
                          src={order.products.image && !order.products.image.startsWith('blob:') ? order.products.image : 'https://images.pexels.com/photos/4198019/pexels-photo-4198019.jpeg?auto=compress&cs=tinysrgb&w=400'}
                          alt={order.product_name}
                          className="w-10 h-10 rounded-lg object-cover mr-3"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = 'https://images.pexels.com/photos/4198019/pexels-photo-4198019.jpeg?auto=compress&cs=tinysrgb&w=400';
                          }}
                        />
                      )}
                      <div>
                        <p className="text-sm font-medium text-gray-900">{order.product_name}</p>
                        <p className="text-sm text-gray-500">{order.product_grade}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{order.buyer_name}</p>
                      <p className="text-sm text-gray-500">{order.buyer_company}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <p className="text-sm text-gray-900">{order.quantity} kg</p>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <p className="text-sm font-medium text-gray-900">₹{order.total_amount?.toLocaleString()}</p>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {editingOrderId === order.id ? (
                      <div className="flex items-center space-x-2">
                        <select
                          value={editStatus}
                          onChange={(e) => setEditStatus(e.target.value)}
                          className="text-sm border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-primary focus:border-primary"
                        >
                          {orderStatuses.map(status => (
                            <option key={status} value={status}>{status}</option>
                          ))}
                        </select>
                        <button
                          onClick={() => handleStatusUpdate(order.id, editStatus)}
                          className="text-green-600 hover:text-green-800 p-1 border border-green-300 rounded hover:bg-green-50 transition-colors"
                          title="Save"
                        >
                          <Save className="w-3 h-3" />
                        </button>
                        <button
                          onClick={cancelEditing}
                          className="text-gray-600 hover:text-gray-800 p-1 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                          title="Cancel"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        order.status === 'DELIVERED' ? 'bg-green-100 text-green-800' :
                        order.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                        order.status === 'SHIPPED' ? 'bg-blue-100 text-blue-800' :
                        order.status === 'PROCESSING' ? 'bg-yellow-100 text-yellow-800' :
                        order.status === 'CONFIRMED' ? 'bg-purple-100 text-purple-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {order.status}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          setSelectedOrder(order);
                          setShowOrderDetails(true);
                        }}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium px-2 py-1 border border-blue-300 rounded hover:bg-blue-50 transition-colors"
                      >
                        <Eye className="w-3 h-3 inline mr-1" />
                        View
                      </button>
                      {editingOrderId !== order.id && (
                        <button
                          onClick={() => startEditing(order.id, order.status)}
                          className="text-green-600 hover:text-green-800 text-sm font-medium px-2 py-1 border border-green-300 rounded hover:bg-green-50 transition-colors"
                        >
                          <Edit className="w-3 h-3 inline mr-1" />
                          Edit Status
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {orders.length === 0 && (
          <div className="text-center py-12">
            <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-xl text-gray-500 mb-2">No orders yet</p>
            <p className="text-gray-400">Orders placed by customers will appear here</p>
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      {showOrderDetails && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold font-playfair text-primary">Order Details</h2>
                <button
                  onClick={() => setShowOrderDetails(false)}
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Order Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Order Number</label>
                    <p className="mt-1 text-sm text-gray-900 font-mono">{selectedOrder.order_number}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Order Date</label>
                    <p className="mt-1 text-sm text-gray-900">{new Date(selectedOrder.created_at).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Status</label>
                    <span className={`mt-1 inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                      selectedOrder.status === 'DELIVERED' ? 'bg-green-100 text-green-800' :
                      selectedOrder.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                      selectedOrder.status === 'SHIPPED' ? 'bg-blue-100 text-blue-800' :
                      selectedOrder.status === 'PROCESSING' ? 'bg-yellow-100 text-yellow-800' :
                      selectedOrder.status === 'CONFIRMED' ? 'bg-purple-100 text-purple-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {selectedOrder.status}
                    </span>
                  </div>
                </div>

                {/* Product Information */}
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold text-primary mb-4 flex items-center">
                    <Package className="w-5 h-5 mr-2" />
                    Product Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Product Name</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedOrder.product_name}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Grade</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedOrder.product_grade}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Quantity</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedOrder.quantity} kg</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Price per KG</label>
                      <p className="mt-1 text-sm text-gray-900">₹{selectedOrder.price_per_kg}</p>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700">Total Amount</label>
                      <p className="mt-1 text-lg font-bold text-primary">₹{selectedOrder.total_amount?.toLocaleString()}</p>
                    </div>
                  </div>
                </div>

                {/* Buyer Information */}
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold text-primary mb-4 flex items-center">
                    <User className="w-5 h-5 mr-2" />
                    Buyer Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Buyer Name</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedOrder.buyer_name}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Company</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedOrder.buyer_company}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Email</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedOrder.buyer_email}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Phone</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedOrder.buyer_phone}</p>
                    </div>
                  </div>
                </div>

                {/* Delivery Information */}
                {selectedOrder.delivery_address && (
                  <div className="border-t pt-6">
                    <h3 className="text-lg font-semibold text-primary mb-4 flex items-center">
                      <Truck className="w-5 h-5 mr-2" />
                      Delivery Information
                    </h3>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Delivery Address</label>
                      <p className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">{selectedOrder.delivery_address}</p>
                    </div>
                  </div>
                )}

                {/* Order Notes */}
                {selectedOrder.order_notes && (
                  <div className="border-t pt-6">
                    <h3 className="text-lg font-semibold text-primary mb-4">Order Notes</h3>
                    <p className="text-sm text-gray-900 whitespace-pre-wrap">{selectedOrder.order_notes}</p>
                  </div>
                )}
              </div>

              <div className="flex justify-end mt-8 pt-6 border-t">
                <button
                  onClick={() => setShowOrderDetails(false)}
                  className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;