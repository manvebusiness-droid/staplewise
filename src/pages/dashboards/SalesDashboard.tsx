import React, { useState } from 'react';
import { CheckCircle, Clock, XCircle, Search, X, Edit, Package, User, MapPin, Calendar, Phone, Mail, Building } from 'lucide-react';
import { QueryService, DashboardService } from '../../lib/supabaseServices';
import { useAuth } from '../../contexts/AuthContext';

const SalesDashboard: React.FC = () => {
  const { user } = useAuth();
  const [queries, setQueries] = useState<any[]>([]);
  const [stats, setStats] = useState({
    assignedQueries: 0,
    completedQueries: 0,
    pendingQueries: 0,
    recentQueries: []
  });
  const [loading, setLoading] = useState(true);
  const [selectedQuery, setSelectedQuery] = useState<any>(null);
  const [editingQueryId, setEditingQueryId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('assigned');
  const [searchTerm, setSearchTerm] = useState('');

  React.useEffect(() => {
    loadSalesData();
  }, []);

  const loadSalesData = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // Get queries assigned to this sales user
      const queriesData = await QueryService.getQueriesAssignedToUser(user.id);
      setQueries(queriesData);
      
      // Calculate stats from assigned queries
      const assignedQueries = queriesData.filter(q => q.status === 'ASSIGNED' || q.status === 'PENDING');
      const completedQueries = queriesData.filter(q => q.status === 'COMPLETED');
      const rejectedQueries = queriesData.filter(q => q.status === 'REJECTED');
      
      const statsData = {
        assignedQueries: assignedQueries.length,
        completedQueries: completedQueries.length,
        pendingQueries: rejectedQueries.length, // Using this for rejected count
        recentQueries: queriesData.slice(0, 5)
      };
      
      setStats(statsData);
    } catch (error) {
      console.error('Error loading sales data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter queries based on status from assigned queries only
  const getFilteredQueries = () => {
    let filtered = [];
    switch (statusFilter) {
      case 'assigned':
        filtered = queries.filter(q => q.status === 'ASSIGNED' || q.status === 'PENDING');
        break;
      case 'completed':
        filtered = queries.filter(q => q.status === 'COMPLETED');
        break;
      case 'rejected':
        filtered = queries.filter(q => q.status === 'REJECTED');
        break;
      default:
        filtered = queries;
    }
    
    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(query =>
        query.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        query.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        query.product_sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        query.product_category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        query.phone?.includes(searchTerm)
      );
    }
    
    return filtered;
  };

  const filteredQueries = getFilteredQueries();

  const handleUpdateStatus = async (queryId: string, status: 'COMPLETED' | 'REJECTED') => {
    try {
      await QueryService.updateQueryStatus(queryId, status);
      await loadSalesData(); // Refresh data
      setEditingQueryId(null);
      
      const statusText = status === 'COMPLETED' ? 'completed' : 'rejected';
      alert(`Query marked as ${statusText} successfully!`);
    } catch (error) {
      console.error('Error updating query status:', error);
      alert('Failed to update query status');
    }
  };

  // Delete action removed for sales dashboard per requirement

  // Update stats calculation
  const assignedQueries = queries.filter(q => q.status === 'ASSIGNED' || q.status === 'PENDING');
  const completedQueries = queries.filter(q => q.status === 'COMPLETED');
  const rejectedQueries = queries.filter(q => q.status === 'REJECTED');

  const dashboardStats = [
    { 
      label: 'Assigned to Me', 
      value: assignedQueries.length, 
      icon: Clock, 
      color: 'text-blue-600',
      filter: 'assigned'
    },
    { 
      label: 'Completed by Me', 
      value: completedQueries.length, 
      icon: CheckCircle, 
      color: 'text-green-600',
      filter: 'completed'
    },
    { 
      label: 'Rejected by Me', 
      value: rejectedQueries.length, 
      icon: XCircle, 
      color: 'text-red-600',
      filter: 'rejected'
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading sales dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold font-playfair text-primary">Sales Dashboard</h1>
          <p className="text-gray-600 mt-2">Manage queries assigned to you</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {dashboardStats.map((stat, index) => (
            <div 
              key={index} 
              className={`bg-white rounded-lg shadow-soft p-6 cursor-pointer transition-all duration-200 hover:shadow-soft-lg ${
                statusFilter === stat.filter ? 'ring-2 ring-primary bg-primary/5' : ''
              }`}
              onClick={() => setStatusFilter(stat.filter)}
            >
              <div className="flex items-center">
                <div className={`p-2 rounded-lg bg-gray-100 ${stat.color}`}>
                  <stat.icon className="w-6 h-6" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  {statusFilter === stat.filter && (
                    <p className="text-xs text-primary font-medium">Currently viewing</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Queries Table */}
        <div className="bg-white rounded-lg shadow-soft p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-primary">
              {statusFilter === 'assigned' ? 'My Assigned Queries' : 
               statusFilter === 'completed' ? 'My Completed Queries' : 
               'My Rejected Queries'}
              <span className="text-sm text-gray-500 ml-2">({filteredQueries.length})</span>
            </h3>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search my queries..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Company</th>
                  <th className="text-left py-3 px-4">Type</th>
                  <th className="text-left py-3 px-4">Product Details</th>
                  <th className="text-left py-3 px-4">Quantity</th>
                  <th className="text-left py-3 px-4">Contact</th>
                  <th className="text-left py-3 px-4">Location</th>
                  <th className="text-left py-3 px-4">Status</th>
                  <th className="text-left py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredQueries.length > 0 ? (
                  filteredQueries.map(query => (
                    <tr 
                      key={query.id} 
                      className="border-b hover:bg-gray-50 cursor-pointer"
                      onClick={() => setSelectedQuery(query)}
                    >
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium">{query.company_name}</p>
                          <p className="text-sm text-gray-600">Pincode: {query.pincode}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          query.type === 'buy' || query.type === 'BUY' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                        }`}>
                          {query.type.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {query.product_sku ? (
                              <span className="bg-primary/10 text-primary px-2 py-1 rounded text-xs font-mono mr-2">
                                {query.product_sku}
                              </span>
                            ) : (
                              <span className="text-gray-400 text-xs">No SKU</span>
                            )}
                          </p>
                          <p className="text-xs text-gray-500 capitalize">{query.product_category || 'N/A'}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4">{query.quantity} kg</td>
                      <td className="py-3 px-4">
                        <div>
                          <p className="text-sm flex items-center">
                            <Mail className="w-3 h-3 mr-1 text-gray-400" />
                            {query.email}
                          </p>
                          <p className="text-sm text-gray-600 flex items-center">
                            <Phone className="w-3 h-3 mr-1 text-gray-400" />
                            {query.phone}
                          </p>
                          {query.gst && (
                            <p className="text-xs text-gray-500 font-mono">GST: {query.gst}</p>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center">
                          <MapPin className="w-3 h-3 mr-1 text-gray-400" />
                          <span className="text-sm text-gray-900">{query.pincode}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          query.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                          query.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                          query.status === 'ASSIGNED' ? 'bg-blue-100 text-blue-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {query.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {editingQueryId === query.id ? (
                          <div className="flex space-x-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleUpdateStatus(query.id, 'COMPLETED');
                              }}
                              className="bg-green-600 text-white px-3 py-1 rounded text-xs hover:bg-green-700 transition-colors flex items-center"
                            >
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Complete
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleUpdateStatus(query.id, 'REJECTED');
                              }}
                              className="bg-red-600 text-white px-3 py-1 rounded text-xs hover:bg-red-700 transition-colors flex items-center"
                            >
                              <XCircle className="w-3 h-3 mr-1" />
                              Reject
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingQueryId(null);
                              }}
                              className="bg-gray-500 text-white px-2 py-1 rounded text-xs hover:bg-gray-600 transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <div className="flex space-x-1">
                            {(query.status === 'ASSIGNED' || query.status === 'PENDING') && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditingQueryId(query.id);
                                }}
                                className="bg-primary text-white px-3 py-1 rounded text-xs hover:bg-accent transition-colors flex items-center"
                              >
                                <Edit className="w-3 h-3 mr-1" />
                                Edit Status
                              </button>
                            )}
                            
                            {query.status === 'COMPLETED' && (
                              <span className="text-green-600 font-medium text-xs flex items-center">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Completed
                              </span>
                            )}
                            {query.status === 'REJECTED' && (
                              <span className="text-red-600 font-medium text-xs flex items-center">
                                <XCircle className="w-3 h-3 mr-1" />
                                Rejected
                              </span>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-gray-500">
                      {statusFilter === 'assigned' ? 'No queries assigned to you yet' :
                       statusFilter === 'completed' ? 'No completed queries yet' :
                       'No rejected queries yet'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Query Detail Modal */}
      {selectedQuery && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-primary font-playfair">Query Details</h2>
                <button
                  onClick={() => setSelectedQuery(null)}
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Product Information Section */}
                <div>
                  <h4 className="text-lg font-semibold text-primary mb-3 flex items-center">
                    <Package className="w-5 h-5 mr-2" />
                    Product Information
                  </h4>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Product SKU</label>
                        <p className="mt-1">
                          {selectedQuery.product_sku ? (
                            <span className="bg-primary/10 text-primary px-3 py-1 rounded text-sm font-mono">
                              {selectedQuery.product_sku}
                            </span>
                          ) : (
                            <span className="text-gray-400 text-sm">No SKU assigned</span>
                          )}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Product Category</label>
                        <p className="mt-1 text-sm text-gray-900 capitalize">
                          {selectedQuery.product_category || 'Not specified'}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Requested Quantity</label>
                        <p className="mt-1 text-sm text-gray-900 font-semibold">
                          {selectedQuery.quantity} kg
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Query Type</label>
                        <span className={`mt-1 inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                          selectedQuery.type === 'BUY' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                        }`}>
                          {selectedQuery.type.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Company Information Section */}
                <div>
                  <h4 className="text-lg font-semibold text-primary mb-3 flex items-center">
                    <Building className="w-5 h-5 mr-2" />
                    Company Information
                  </h4>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Company Name</label>
                        <p className="mt-1 text-sm text-gray-900 font-medium">{selectedQuery.company_name}</p>
                      </div>
                      {selectedQuery.gst && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700">GST Number</label>
                          <p className="mt-1 text-sm text-gray-900 font-mono">{selectedQuery.gst}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Contact Information Section */}
                <div>
                  <h4 className="text-lg font-semibold text-primary mb-3 flex items-center">
                    <User className="w-5 h-5 mr-2" />
                    Contact Information
                  </h4>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 flex items-center">
                          <Mail className="w-4 h-4 mr-1" />
                          Email Address
                        </label>
                        <p className="mt-1 text-sm text-gray-900">{selectedQuery.email}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 flex items-center">
                          <Phone className="w-4 h-4 mr-1" />
                          Phone Number
                        </label>
                        <p className="mt-1 text-sm text-gray-900">{selectedQuery.phone}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 flex items-center">
                          <MapPin className="w-4 h-4 mr-1" />
                          Location (Pincode)
                        </label>
                        <p className="mt-1 text-sm text-gray-900">{selectedQuery.pincode}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Query Status & Timeline Section */}
                <div>
                  <h4 className="text-lg font-semibold text-primary mb-3 flex items-center">
                    <Calendar className="w-5 h-5 mr-2" />
                    Query Status & Timeline
                  </h4>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Current Status</label>
                        <span className={`mt-1 inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                          selectedQuery.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                          selectedQuery.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                          selectedQuery.status === 'ASSIGNED' ? 'bg-blue-100 text-blue-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {selectedQuery.status.toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Created Date</label>
                        <p className="mt-1 text-sm text-gray-900">
                          {new Date(selectedQuery.created_at).toLocaleDateString('en-IN', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                      {selectedQuery.updated_at && selectedQuery.updated_at !== selectedQuery.created_at && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Last Updated</label>
                          <p className="mt-1 text-sm text-gray-900">
                            {new Date(selectedQuery.updated_at).toLocaleDateString('en-IN', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      )}
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Assigned To</label>
                        <p className="mt-1 text-sm text-gray-900 font-medium">You ({user?.name})</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Actions Section */}
                {(selectedQuery.status === 'ASSIGNED' || selectedQuery.status === 'PENDING') && (
                  <div>
                    <h4 className="text-lg font-semibold text-primary mb-3">Quick Actions</h4>
                    <div className="flex space-x-3">
                      <button
                        onClick={() => {
                          handleUpdateStatus(selectedQuery.id, 'COMPLETED');
                          setSelectedQuery(null);
                        }}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Mark as Completed
                      </button>
                      <button
                        onClick={() => {
                          handleUpdateStatus(selectedQuery.id, 'REJECTED');
                          setSelectedQuery(null);
                        }}
                        className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center"
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Mark as Rejected
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end items-center mt-8 pt-6 border-t">
                <button
                  onClick={() => setSelectedQuery(null)}
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

export default SalesDashboard;