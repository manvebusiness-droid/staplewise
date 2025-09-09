import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Users, 
  ShoppingCart, 
  MessageCircle, 
  TrendingUp, 
  Download,
  Package
} from 'lucide-react';
import { 
  QueryService, 
  OrderService, 
  UserService,
  ProductService
} from '../../lib/supabaseServices';

// Import split components
import AdminOverview from '../../components/admin/AdminOverview';
import AdminOrders from '../../components/admin/AdminOrders';
import AdminQueries from '../../components/admin/AdminQueries';
import AdminUsers from '../../components/admin/AdminUsers';
import AdminEmployees from '../../components/admin/AdminEmployees';
import AdminReports from '../../components/admin/AdminReports';
import AdminProducts from '../../components/admin/AdminProducts';

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalOrders: 0,
    totalQueries: 0,
    totalRevenue: 0
  });
  
  // Data states
  const [queries, setQueries] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [sellers, setSellers] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      console.log('🔄 AdminDashboard: Loading dashboard data...');
      const [queriesData, ordersData, usersData, sellersData, employeesData, productsData] = await Promise.all([
        QueryService.getAllQueries(),
        OrderService.getAllOrders(),
        UserService.getAllUsers(),
        UserService.getUsersByRole('SELLER'),
        UserService.getUsersByRole('SALES'),
        ProductService.getAllProducts()
      ]);

      setQueries(queriesData);
      setOrders(ordersData);
      setUsers(usersData);
      setSellers(sellersData);
      setEmployees(employeesData);
      setProducts(productsData);
      console.log('✅ AdminDashboard: Data loaded, orders count:', ordersData.length);

      // Calculate stats
      const totalRevenue = ordersData.reduce((sum: number, order: any) => sum + (order.total_amount || 0), 0);
      setStats({
        totalUsers: usersData.length,
        totalOrders: ordersData.length,
        totalQueries: queriesData.length,
        totalRevenue
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewOrder = (order: any) => {
    console.log('View order:', order);
  };

  const handleEditOrder = (order: any) => {
    console.log('Edit order:', order);
  };

  const handleDeleteOrder = async (orderId: string) => {
    if (window.confirm('Are you sure you want to delete this order?')) {
      try {
        console.log('🔄 AdminDashboard: Starting delete for order:', orderId);
        console.log('🔄 Admin deleting order:', orderId);
        await OrderService.deleteOrder(orderId);
        console.log('✅ AdminDashboard: Order deleted, refreshing data...');
        await loadDashboardData(); // Refresh all data
        console.log('✅ AdminDashboard: Data refreshed');
        alert('Order deleted successfully!');
      } catch (error) {
        console.error('Error deleting order:', error);
        alert('Failed to delete order: ' + (error instanceof Error ? error.message : 'Unknown error'));
      }
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, status: string) => {
    try {
      console.log('🔄 Updating order status:', orderId, 'to', status);
      await OrderService.updateOrderStatus(orderId, status);
      await loadDashboardData();
      console.log('✅ Order status updated successfully');
    } catch (error) {
      console.error('Error updating order status:', error);
      alert('Failed to update order status');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-primary">Admin Dashboard</h1>
          <p className="text-gray-600 mt-1 sm:mt-2 text-sm sm:text-base">Manage your business operations</p>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-lg shadow-soft mb-6 sm:mb-8 overflow-hidden">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex overflow-x-auto lg:overflow-x-visible px-4 sm:px-6 scrollbar-hide">
              {[
                { id: 'overview', name: 'Overview', icon: TrendingUp },
                { id: 'queries', name: 'Product Queries', icon: MessageCircle },
                { id: 'orders', name: 'Orders', icon: ShoppingCart },
                { id: 'products', name: 'Listed Products', icon: Package },
                { id: 'employees', name: 'Sales Employees', icon: Users },
                { id: 'users', name: 'All Users', icon: Users },
                { id: 'reports', name: 'Reports', icon: Download }
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-3 sm:py-4 px-2 sm:px-3 lg:px-4 xl:px-6 border-b-2 font-medium text-xs sm:text-sm lg:text-base flex items-center space-x-1 sm:space-x-2 whitespace-nowrap flex-shrink-0 lg:flex-shrink ${
                      activeTab === tab.id
                        ? 'border-primary text-primary'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="hidden sm:inline lg:inline">{tab.name}</span>
                    <span className="sm:hidden lg:hidden">{tab.name.split(' ')[0]}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <AdminOverview
            stats={stats}
            orders={orders}
            loading={loading}
            onDeleteOrder={handleDeleteOrder}
            onUpdateOrderStatus={handleUpdateOrderStatus}
          />
        )}

        {activeTab === 'orders' && (
          <AdminOrders
            orders={orders}
            sellers={sellers}
            loading={loading}
            onOrderUpdate={loadDashboardData}
            onViewOrder={handleViewOrder}
            onEditOrder={handleEditOrder}
            onDeleteOrder={handleDeleteOrder}
            onUpdateOrderStatus={handleUpdateOrderStatus}
          />
        )}

        {activeTab === 'queries' && (
          <AdminQueries
            queries={queries}
            employees={employees}
            loading={loading}
            onQueryUpdate={loadDashboardData}
          />
        )}

        {activeTab === 'products' && (
          <AdminProducts
            products={products}
            loading={loading}
            onProductUpdate={loadDashboardData}
          />
        )}

        {activeTab === 'users' && (
          <AdminUsers
            users={users}
            loading={loading}
          />
        )}

        {activeTab === 'employees' && (
          <AdminEmployees
            employees={employees}
            loading={loading}
            onEmployeeUpdate={loadDashboardData}
          />
        )}

        {activeTab === 'reports' && (
          <AdminReports
            queries={queries}
            users={users}
            orders={orders}
            employees={employees}
          />
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;