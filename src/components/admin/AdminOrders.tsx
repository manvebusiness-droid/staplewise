import React, { useState } from 'react';
import { Plus, Search, Download, X, Eye, Edit, Trash2 } from 'lucide-react';
import * as XLSX from 'xlsx';
import { OrderService } from '../../lib/supabaseServices';
import { useAuth } from '../../contexts/AuthContext';

interface AdminOrdersProps {
  orders: any[];
  sellers: any[];
  loading: boolean;
  onOrderUpdate: () => void;
  onViewOrder: (order: any) => void;
  onEditOrder: (order: any) => void;
  onDeleteOrder: (orderId: string) => void;
  onUpdateOrderStatus: (orderId: string, status: string) => void;
}

const AdminOrders: React.FC<AdminOrdersProps> = ({
  orders,
  sellers,
  loading,
  onOrderUpdate,
  onViewOrder,
  onEditOrder,
  onDeleteOrder,
  onUpdateOrderStatus
}) => {
  const { user } = useAuth();
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [editingOrder, setEditingOrder] = useState<any>(null);
  const [orderForm, setOrderForm] = useState({
    sellerId: '',
    sellerName: '',
    sellerEmail: '',
    sellerPhone: '',
    productName: '',
    category: '',
    grade: '',
    quantity: '',
    pricePerKg: '',
    deliveryAddress: '',
    notes: ''
  });
  const [showAllOrders, setShowAllOrders] = useState(false);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [orderSearchTerm, setOrderSearchTerm] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('');
  const [orderSortBy, setOrderSortBy] = useState('created_at');
  const [orderSortOrder, setOrderSortOrder] = useState('desc');

  // Category grades mapping
  const categoryGrades = {
    'CASHEWS': ['W180', 'W210', 'W240', 'W320', 'W400', 'A180', 'A210', 'A240', 'A320', 'A400', 'LWP', 'SWP', 'BB0', 'BB1', 'BB2'],
    'CLOVES': ['Whole Cloves', 'Ground Cloves', 'Clove Buds', 'Premium Grade', 'Standard Grade'],
    'CHILLIES': ['Kashmiri Red', 'Guntur Red', 'Byadgi Red', 'Teja Red', 'Green Chilli', 'Dried Red'],
    'STAR_ANISE': ['Whole Star', 'Broken Star', 'Ground Star', 'Premium Grade', 'Standard Grade'],
    'PEPPER': ['Black Pepper Whole', 'White Pepper Whole', 'Black Pepper Powder', 'White Pepper Powder'],
    'CINNAMON': ['Ceylon Cinnamon', 'Cassia Cinnamon', 'Cinnamon Sticks', 'Cinnamon Powder']
  };

  const handleOrderInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name === 'sellerId') {
      const selectedSeller = sellers.find(seller => seller.id === value);
      if (selectedSeller) {
        setOrderForm(prev => ({
          ...prev,
          sellerId: value,
          sellerName: selectedSeller.name || '',
          sellerEmail: selectedSeller.email || '',
          sellerPhone: selectedSeller.phone || ''
        }));
      } else {
        setOrderForm(prev => ({
          ...prev,
          sellerId: value,
          sellerName: '',
          sellerEmail: '',
          sellerPhone: ''
        }));
      }
    } else {
      setOrderForm(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      console.log('🔄 AdminOrders: Starting order submission...');
      
      // Generate unique order number
      const orderNumber = `ORD-${Date.now()}`;
      
      // Validate required fields
      if (!orderForm.sellerId || !orderForm.productName || !orderForm.quantity || !orderForm.pricePerKg) {
        alert('Please fill in all required fields');
        return;
      }
      
      const orderData = {
        order_number: orderNumber,
        buyer_id: user?.id, // Logged-in admin as buyer
        seller_id: orderForm.sellerId,
        product_name: orderForm.productName,
        product_category: orderForm.category,
        product_grade: orderForm.grade,
        quantity: parseInt(orderForm.quantity),
        price_per_kg: parseFloat(orderForm.pricePerKg),
        total_amount: parseInt(orderForm.quantity) * parseFloat(orderForm.pricePerKg),
        delivery_address: orderForm.deliveryAddress,
        order_notes: orderForm.notes,
        status: 'PENDING',
        payment_status: 'PENDING'
      };

      console.log('📝 Order data prepared:', orderData);
      if (editingOrder) {
        console.log('🔄 Updating existing order:', editingOrder.id);
        await OrderService.updateOrder(editingOrder.id, orderData);
        alert('Order updated successfully!');
      } else {
        console.log('🔄 Creating new order...');
        const newOrder = await OrderService.createOrder(orderData);
        console.log('✅ Order created:', newOrder);
        alert('Order placed successfully!');
      }

      console.log('🔄 Refreshing dashboard data...');
      onOrderUpdate();
      console.log('✅ Dashboard data refresh triggered');
      
      setShowOrderForm(false);
      setEditingOrder(null);
      setOrderForm({
        sellerId: '',
        sellerName: '',
        sellerEmail: '',
        sellerPhone: '',
        productName: '',
        category: '',
        grade: '',
        quantity: '',
        pricePerKg: '',
        deliveryAddress: '',
        notes: ''
      });
    } catch (error) {
      console.error('Error saving order:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      alert(`Failed to save order: ${errorMessage}`);
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    if (window.confirm('Are you sure you want to delete this order?')) {
      try {
        console.log('🔄 AdminOrders: Starting delete for order:', orderId);
        
        // Check if order exists in current state
        const orderExists = orders.find(order => order.id === orderId);
        if (!orderExists) {
          console.log('⚠️ Order not found in current state:', orderId);
          alert('Order not found in current data. Refreshing...');
          await onOrderUpdate();
          return;
        }
        
        console.log('✅ Order found in state, proceeding with deletion...');
        
        await OrderService.deleteOrder(orderId);
        console.log('✅ AdminOrders: Order deleted, refreshing data...');
        
        // Force immediate UI update
        await onOrderUpdate();
        console.log('✅ AdminOrders: Data refreshed');
        
        // Verify the order is gone from state
        setTimeout(() => {
          const stillExists = orders.find(order => order.id === orderId);
          if (stillExists) {
            console.log('⚠️ Order still exists in state after deletion, forcing page refresh');
            window.location.reload();
          } else {
            console.log('✅ Order successfully removed from UI');
          }
        }, 1000);
        
        alert('Order deleted successfully!');
      } catch (error) {
        console.error('Error deleting order:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error('❌ Full error details:', error);
        alert(`Failed to delete order: ${errorMessage}`);
      }
    }
  };

  const handleEditOrderClick = (order: any) => {
    setEditingOrder(order);
    setOrderForm({
      sellerId: order.seller_id || '',
      sellerName: order.seller_name || '',
      sellerEmail: order.seller_email || '',
      sellerPhone: order.seller_phone || '',
      productName: order.product_name || '',
      category: order.product_category || '',
      grade: order.product_grade || '',
      quantity: order.quantity?.toString() || '',
      pricePerKg: order.price_per_kg?.toString() || '',
      deliveryAddress: order.delivery_address || '',
      notes: order.order_notes || ''
    });
    setShowOrderForm(true);
  };

  const handleViewOrderDetails = (order: any) => {
    setSelectedOrder(order);
    setShowOrderDetails(true);
  };

  // Filter and sort orders
  const filteredAndSortedOrders = orders
    .filter(order => {
      const searchMatch = !orderSearchTerm || 
        order.order_number?.toLowerCase().includes(orderSearchTerm.toLowerCase()) ||
        order.product_name?.toLowerCase().includes(orderSearchTerm.toLowerCase()) ||
        order.seller_name?.toLowerCase().includes(orderSearchTerm.toLowerCase());
      
      const statusMatch = !orderStatusFilter || order.status === orderStatusFilter;
      
      return searchMatch && statusMatch;
    })
    .sort((a, b) => {
      const aValue = a[orderSortBy] || '';
      const bValue = b[orderSortBy] || '';
      
      if (orderSortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  const handleExportOrders = () => {
    const exportData = orders.map(order => ({
      'Order Number': order.order_number || order.id,
      'Product Name': order.product_name || 'N/A',
      'Category': order.product_category || 'N/A',
      'Grade': order.product_grade || 'N/A',
      'Quantity (kg)': order.quantity || 0,
      'Price per KG': order.price_per_kg || 0,
      'Total Amount': order.total_amount || 0,
      'Seller Name': order.seller_name || 'N/A',
      'Seller Email': order.seller_email || 'N/A',
      'Status': order.status || 'N/A',
      'Created Date': new Date(order.created_at).toLocaleDateString(),
      'Delivery Address': order.delivery_address || 'N/A',
      'Notes': order.order_notes || 'N/A'
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Orders');
    XLSX.writeFile(wb, `orders_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  return (
    <div className="space-y-8">
      {/* Place Order Form */}
      <div className="bg-white rounded-lg shadow-soft p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 sm:mb-6 space-y-2 sm:space-y-0">
          <h3 className="text-base sm:text-lg font-semibold text-primary">
            {editingOrder ? 'Edit Order' : 'Place New Order'}
          </h3>
          <button
            onClick={() => setShowOrderForm(true)}
            className="bg-primary text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-accent transition-colors flex items-center text-sm sm:text-base w-full sm:w-auto justify-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Order
          </button>
        </div>

        {showOrderForm && (
          <div className="mb-4 sm:mb-6 p-4 sm:p-6 border border-gray-200 rounded-lg bg-gray-50">
            <h4 className="font-medium mb-3 sm:mb-4 text-primary text-sm sm:text-base">Create New Order</h4>
            <form onSubmit={handleOrderSubmit} className="space-y-3 sm:space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {/* Seller Selection */}
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                    Select Seller *
                  </label>
                  <select
                    name="sellerId"
                    value={orderForm.sellerId}
                    onChange={handleOrderInputChange}
                    required
                    disabled={loading}
                    className="w-full px-2 sm:px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary disabled:bg-gray-100"
                  >
                    <option value="">
                      {loading ? 'Loading sellers...' : 'Choose Seller...'}
                    </option>
                    {sellers.map(seller => (
                      <option key={seller.id} value={seller.id}>
                        {seller.company_name || seller.name} - {seller.city || 'Location not specified'}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Seller Information (Auto-filled) */}
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                    Seller Name {orderForm.sellerName && <span className="text-green-600">✓</span>}
                  </label>
                  <input
                    type="text"
                    value={orderForm.sellerName}
                    readOnly
                    className="w-full px-2 sm:px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                    placeholder="Select seller above to auto-fill"
                  />
                </div>

                {/* Seller Email (Auto-filled) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Seller Email {orderForm.sellerEmail && <span className="text-green-600">✓</span>}
                  </label>
                  <input
                    type="email"
                    value={orderForm.sellerEmail}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                    placeholder="Select seller above to auto-fill"
                  />
                </div>

                {/* Seller Phone (Auto-filled) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Seller Phone {orderForm.sellerPhone && <span className="text-green-600">✓</span>}
                  </label>
                  <input
                    type="tel"
                    value={orderForm.sellerPhone}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                    placeholder="Select seller above to auto-fill"
                  />
                </div>

                {/* Product Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    name="productName"
                    value={orderForm.productName}
                    onChange={handleOrderInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                    placeholder="e.g., Premium Cashew Kernels"
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category *
                  </label>
                  <select
                    name="category"
                    value={orderForm.category}
                    onChange={handleOrderInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                  >
                    <option value="">Select Category</option>
                    <option value="CASHEWS">Cashews</option>
                    <option value="CLOVES">Cloves</option>
                    <option value="CHILLIES">Chillies</option>
                    <option value="STAR_ANISE">Star Anise</option>
                    <option value="PEPPER">Pepper</option>
                    <option value="CINNAMON">Cinnamon</option>
                    <option value="OTHER_SPICES">Other Spices</option>
                  </select>
                </div>

                {/* Grade */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Grade *
                  </label>
                  <select
                    name="grade"
                    value={orderForm.grade}
                    onChange={handleOrderInputChange}
                    required
                    disabled={!orderForm.category}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary disabled:bg-gray-100"
                  >
                    <option value="">
                      {!orderForm.category ? 'Select category first' : 'Select Grade'}
                    </option>
                    {orderForm.category && categoryGrades[orderForm.category as keyof typeof categoryGrades]?.map((grade: string) => (
                      <option key={grade} value={grade}>{grade}</option>
                    ))}
                  </select>
                </div>

                {/* Quantity */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Quantity (kg) *
                  </label>
                  <input
                    type="number"
                    name="quantity"
                    value={orderForm.quantity}
                    onChange={handleOrderInputChange}
                    required
                    min="1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                    placeholder="e.g., 25"
                  />
                </div>

                {/* Price per KG */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Price per KG (₹) *
                  </label>
                  <input
                    type="number"
                    name="pricePerKg"
                    value={orderForm.pricePerKg}
                    onChange={handleOrderInputChange}
                    required
                    min="0"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                    placeholder="e.g., 85"
                  />
                </div>

                {/* Delivery Address */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Delivery Address *
                  </label>
                  <textarea
                    name="deliveryAddress"
                    value={orderForm.deliveryAddress}
                    onChange={handleOrderInputChange}
                    required
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                    placeholder="Complete delivery address with pincode"
                  />
                </div>

                {/* Notes */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Order Notes (Optional)
                  </label>
                  <textarea
                    name="notes"
                    value={orderForm.notes}
                    onChange={handleOrderInputChange}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                    placeholder="Any special instructions or notes"
                  />
                </div>
              </div>

              {/* Total Calculation */}
              {orderForm.quantity && orderForm.pricePerKg && (
                <div className="bg-primary/10 p-3 sm:p-4 rounded-lg">
                  <p className="text-base sm:text-lg font-semibold text-primary">
                    Total Amount: ₹{(parseInt(orderForm.quantity || '0') * parseFloat(orderForm.pricePerKg || '0')).toLocaleString()}
                  </p>
                </div>
              )}

              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 pt-3 sm:pt-4">
                <button
                  type="submit"
                  className="bg-primary text-white px-4 sm:px-6 py-2 rounded-lg hover:bg-accent transition-colors text-sm sm:text-base"
                >
                  {editingOrder ? 'Update Order' : 'Place Order'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowOrderForm(false);
                    setEditingOrder(null);
                    setOrderForm({
                      sellerId: '',
                      sellerName: '',
                      sellerEmail: '',
                      sellerPhone: '',
                      productName: '',
                      category: '',
                      grade: '',
                      quantity: '',
                      pricePerKg: '',
                      deliveryAddress: '',
                      notes: ''
                    });
                  }}
                  className="bg-gray-500 text-white px-4 sm:px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors text-sm sm:text-base"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-lg shadow-soft p-4 sm:p-6">
        <h3 className="text-base sm:text-lg font-semibold text-primary mb-3 sm:mb-4">Recent Orders</h3>
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
                        onClick={() => handleViewOrderDetails(order)}
                        className="px-2 py-1 text-xs border border-blue-300 text-blue-600 rounded hover:bg-blue-50 transition-colors flex items-center flex-1 sm:flex-initial justify-center"
                      >
                        <Eye className="w-3 h-3 mr-1" />
                        View
                      </button>
                      <button
                        onClick={() => handleEditOrderClick(order)}
                        className="px-2 py-1 text-xs border border-green-300 text-green-600 rounded hover:bg-green-50 transition-colors flex items-center flex-1 sm:flex-initial justify-center"
                      >
                        <Edit className="w-3 h-3 mr-1" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteOrder(order.id)}
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
        
        {/* View All Orders Button */}
        <div className="mt-4 sm:mt-6 text-center">
          <button
            onClick={() => setShowAllOrders(true)}
            className="bg-primary text-white px-4 sm:px-6 py-2 rounded-lg hover:bg-accent transition-colors text-sm sm:text-base"
          >
            View All Orders
          </button>
        </div>
      </div>

      {/* All Orders Modal */}
      {showAllOrders && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden mx-4">
            <div className="p-4 sm:p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-lg sm:text-2xl font-bold text-primary">All Orders</h2>
                <div className="flex space-x-1 sm:space-x-2">
                  <button
                    onClick={handleExportOrders}
                    className="bg-primary text-white px-2 sm:px-4 py-2 rounded-lg hover:bg-accent transition-colors flex items-center text-xs sm:text-sm"
                    title="Export to Excel"
                  >
                    <Download className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" />
                    <span className="hidden sm:inline">Export Excel</span>
                  </button>
                  <button
                    onClick={() => setShowAllOrders(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>
            </div>

            {/* Search, Filter, and Sort Controls */}
            <div className="p-4 sm:p-6 border-b border-gray-200 bg-gray-50">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                {/* Search */}
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Search</label>
                  <input
                    type="text"
                    placeholder="Search orders..."
                    value={orderSearchTerm}
                    onChange={(e) => setOrderSearchTerm(e.target.value)}
                    className="w-full px-2 sm:px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                  />
                </div>

                {/* Status Filter */}
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={orderStatusFilter}
                    onChange={(e) => setOrderStatusFilter(e.target.value)}
                    className="w-full px-2 sm:px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                  >
                    <option value="">All Status</option>
                    <option value="PENDING">Order Placed</option>
                    <option value="PROCESSING">In Process</option>
                    <option value="DELIVERED">Delivered</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                </div>

                {/* Sort By */}
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Sort By</label>
                  <select
                    value={orderSortBy}
                    onChange={(e) => setOrderSortBy(e.target.value)}
                    className="w-full px-2 sm:px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                  >
                    <option value="created_at">Date Created</option>
                    <option value="product_name">Product Name</option>
                    <option value="seller_name">Seller</option>
                    <option value="quantity">Quantity</option>
                    <option value="total_amount">Total Amount</option>
                    <option value="status">Status</option>
                  </select>
                </div>

                {/* Sort Order */}
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Sort Order</label>
                  <select
                    value={orderSortOrder}
                    onChange={(e) => setOrderSortOrder(e.target.value)}
                    className="w-full px-2 sm:px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                  >
                    <option value="desc">Newest First</option>
                    <option value="asc">Oldest First</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Orders Table */}
            <div className="overflow-x-auto overflow-y-auto max-h-[60vh]">
              <table className="w-full min-w-[800px]">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order</th>
                    <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                    <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Seller</th>
                    <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                    <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price & Total</th>
                    <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredAndSortedOrders.map(order => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm font-medium text-primary">
                        #{order.order_number || order.id}
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900">
                        <div>
                          <div>{order.product_name || 'N/A'}</div>
                          <div className="text-xs text-gray-500">{order.product_grade} - {order.product_category}</div>
                        </div>
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900">
                        <div>
                          <div>{order.seller_name || 'N/A'}</div>
                          <div className="text-xs text-gray-500 hidden sm:block">{order.seller_company || 'N/A'}</div>
                        </div>
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900">
                        {order.quantity} kg
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900">
                        <div>
                          <div>₹{order.price_per_kg ? order.price_per_kg.toLocaleString() : '0'}/kg</div>
                          <div className="text-xs text-gray-500 hidden sm:block">Total: ₹{order.total_amount ? order.total_amount.toLocaleString() : '0'}</div>
                        </div>
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                        <select
                          value={order.status}
                          onChange={(e) => onUpdateOrderStatus(order.id, e.target.value)}
                          className="px-1 sm:px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-primary w-full sm:w-auto"
                        >
                          <option value="PENDING">Order Placed</option>
                          <option value="PROCESSING">In Process</option>
                          <option value="DELIVERED">Delivered</option>
                          <option value="CANCELLED">Cancelled</option>
                        </select>
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900">
                        {new Date(order.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm font-medium">
                        <div className="flex space-x-1">
                          <button
                            onClick={() => handleViewOrderDetails(order)}
                            className="px-1 sm:px-2 py-1 text-xs border border-blue-300 text-blue-600 rounded hover:bg-blue-50 transition-colors"
                          >
                            <span className="hidden sm:inline">View</span>
                            <span className="sm:hidden">V</span>
                          </button>
                          <button
                            onClick={() => handleEditOrderClick(order)}
                            className="px-1 sm:px-2 py-1 text-xs border border-green-300 text-green-600 rounded hover:bg-green-50 transition-colors"
                          >
                            <span className="hidden sm:inline">Edit</span>
                            <span className="sm:hidden">E</span>
                          </button>
                          <button
                            onClick={() => handleDeleteOrder(order.id)}
                            className="px-1 sm:px-2 py-1 text-xs border border-red-300 text-red-600 rounded hover:bg-red-50 transition-colors"
                          >
                            <span className="hidden sm:inline">Delete</span>
                            <span className="sm:hidden">D</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {filteredAndSortedOrders.length === 0 && (
                <div className="text-center py-6 sm:py-8">
                  <p className="text-gray-500">No orders found matching your criteria.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Order Details Modal */}
      {showOrderDetails && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-primary">
                  Order Details - #{selectedOrder.order_number || selectedOrder.id}
                </h2>
                <button
                  onClick={() => setShowOrderDetails(false)}
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Seller Information</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600">Name</p>
                    <p className="font-medium text-gray-900">{selectedOrder.seller_name || 'Unknown'}</p>
                    <p className="text-sm text-gray-600 mt-2">Email</p>
                    <p className="font-medium text-gray-900">{selectedOrder.seller_email || 'N/A'}</p>
                    <p className="text-sm text-gray-600 mt-2">Phone</p>
                    <p className="font-medium text-gray-900">{selectedOrder.seller_phone || 'N/A'}</p>
                    <p className="text-sm text-gray-600 mt-2">Company</p>
                    <p className="font-medium text-gray-900">{selectedOrder.seller_company || 'N/A'}</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Order Information</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600">Order Date</p>
                    <p className="font-medium text-gray-900">{new Date(selectedOrder.created_at).toLocaleDateString()}</p>
                    <p className="text-sm text-gray-600 mt-2">Status</p>
                    <p className="font-medium text-gray-900">{selectedOrder.status}</p>
                    <p className="text-sm text-gray-600 mt-2">Payment Status</p>
                    <p className="font-medium text-gray-900">{selectedOrder.payment_status || 'Pending'}</p>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Product Details</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Product</p>
                      <p className="font-medium text-gray-900">{selectedOrder.product_name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Category</p>
                      <p className="font-medium text-gray-900">{selectedOrder.product_category}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Grade</p>
                      <p className="font-medium text-gray-900">{selectedOrder.product_grade}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Quantity</p>
                      <p className="font-medium text-gray-900">{selectedOrder.quantity} kg</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Price per KG</p>
                      <p className="font-medium text-gray-900">₹{selectedOrder.price_per_kg?.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Total Amount</p>
                      <p className="font-medium text-gray-900">₹{selectedOrder.total_amount?.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              </div>

              {selectedOrder.delivery_address && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Delivery Address</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-900">{selectedOrder.delivery_address}</p>
                  </div>
                </div>
              )}

              {selectedOrder.order_notes && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Order Notes</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-900">{selectedOrder.order_notes}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;