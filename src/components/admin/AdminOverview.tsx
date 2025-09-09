import React from 'react';
import { Users, ShoppingCart, MessageCircle, TrendingUp, Trash2 } from 'lucide-react';

interface AdminOverviewProps {
  stats: {
    totalUsers: number;
    totalOrders: number;
    totalQueries: number;
    totalRevenue: number;
  };
  orders: any[];
  loading: boolean;
  onDeleteOrder: (orderId: string) => void;
  onUpdateOrderStatus: (orderId: string, status: string) => void;
}

const AdminOverview: React.FC<AdminOverviewProps> = ({
  stats,
  orders,
  loading,
  onDeleteOrder,
  onUpdateOrderStatus
}) => {
  return (
    <div className="space-y-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white rounded-lg shadow-soft p-4 sm:p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Users className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
            </div>
            <div className="ml-3 sm:ml-5 w-0 flex-1">
              <dl>
                <dt className="text-xs sm:text-sm font-medium text-gray-500 truncate">Total Users</dt>
                <dd className="text-base sm:text-lg font-medium text-gray-900">{stats.totalUsers}</dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-soft p-4 sm:p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ShoppingCart className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" />
            </div>
            <div className="ml-3 sm:ml-5 w-0 flex-1">
              <dl>
                <dt className="text-xs sm:text-sm font-medium text-gray-500 truncate">Total Orders</dt>
                <dd className="text-base sm:text-lg font-medium text-gray-900">{stats.totalOrders}</dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-soft p-4 sm:p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <MessageCircle className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-600" />
            </div>
            <div className="ml-3 sm:ml-5 w-0 flex-1">
              <dl>
                <dt className="text-xs sm:text-sm font-medium text-gray-500 truncate">Total Queries</dt>
                <dd className="text-base sm:text-lg font-medium text-gray-900">{stats.totalQueries}</dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-soft p-4 sm:p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <TrendingUp className="h-6 w-6 sm:h-8 sm:w-8 text-purple-600" />
            </div>
            <div className="ml-3 sm:ml-5 w-0 flex-1">
              <dl>
                <dt className="text-xs sm:text-sm font-medium text-gray-500 truncate">Total Revenue</dt>
                <dd className="text-base sm:text-lg font-medium text-gray-900">₹{stats.totalRevenue.toLocaleString()}</dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-lg shadow-soft p-4 sm:p-6">
        <h3 className="text-base sm:text-lg font-semibold text-primary mb-4">Recent Orders</h3>
        {loading ? (
          <div className="text-center py-6 sm:py-8">
            <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-primary mx-auto"></div>
            <p className="text-gray-600 mt-2">Loading orders...</p>
          </div>
        ) : orders.length > 0 ? (
          <div className="space-y-3 sm:space-y-4">
            {orders.slice(0, 5).map(order => (
              <div key={order.id} className="border border-gray-200 rounded-lg p-3 sm:p-4 hover:shadow-md transition-shadow">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start space-y-3 sm:space-y-0">
                  <div className="flex-1">
                    <h4 className="text-sm sm:text-base font-semibold text-primary">Order #{order.order_number || order.id}</h4>
                    <p className="text-xs sm:text-sm text-gray-600">
                      Product: {order.product_name || 'N/A'}
                    </p>
                    <p className="text-xs sm:text-sm text-gray-600">
                      Quantity: {order.quantity} kg
                    </p>
                    <p className="text-xs sm:text-sm text-gray-600">
                      Price per KG: ₹{order.price_per_kg ? order.price_per_kg.toLocaleString() : '0'}
                    </p>
                    <p className="text-xs sm:text-sm text-gray-600">
                      Total: ₹{order.total_amount ? order.total_amount.toLocaleString() : '0'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(order.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex flex-col sm:items-end space-y-2">
                    <div className="flex items-center space-x-1 sm:space-x-2">
                      <select
                        value={order.status}
                        onChange={(e) => onUpdateOrderStatus(order.id, e.target.value)}
                        className="px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-primary w-full sm:w-auto"
                      >
                        <option value="PENDING">Order Placed</option>
                        <option value="PROCESSING">In Process</option>
                        <option value="DELIVERED">Delivered</option>
                        <option value="CANCELLED">Cancelled</option>
                      </select>
                    </div>
                    <div className="flex items-center space-x-1 sm:space-x-2">
                      <button
                        onClick={() => onDeleteOrder(order.id)}
                        className="px-2 py-1 text-xs border border-red-300 text-red-600 rounded hover:bg-red-50 transition-colors flex items-center flex-1 sm:flex-initial justify-center"
                      >
                        <Trash2 className="w-3 h-3 mr-1" />
                        Delete
                      </button>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium text-center ${
                      order.status === 'PROCESSING' ? 'bg-yellow-100 text-yellow-800' :
                      order.status === 'DELIVERED' ? 'bg-green-100 text-green-800' :
                      order.status === 'PENDING' ? 'bg-blue-100 text-blue-800' :
                      order.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-6 sm:py-8 text-sm sm:text-base">No orders found</p>
        )}
      </div>
    </div>
  );
};

export default AdminOverview;