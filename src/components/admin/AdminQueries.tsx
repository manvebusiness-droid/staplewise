import React, { useState } from 'react';
import { Search, Download, Eye, Edit, Trash2, UserCheck, X } from 'lucide-react';
import { QueryService } from '../../lib/supabaseServices';
import * as XLSX from 'xlsx';

interface AdminQueriesProps {
  queries: any[];
  employees: any[];
  loading: boolean;
  onQueryUpdate: () => void;
}

const AdminQueries: React.FC<AdminQueriesProps> = ({
  queries,
  employees,
  loading,
  onQueryUpdate
}) => {
  const [querySearchTerm, setQuerySearchTerm] = useState('');
  const [queryStatusFilter, setQueryStatusFilter] = useState('');
  const [selectedQuery, setSelectedQuery] = useState<any>(null);
  const [showQueryDetails, setShowQueryDetails] = useState(false);
  const [editingQueryId, setEditingQueryId] = useState<string | null>(null);
  const [assigningQueryId, setAssigningQueryId] = useState<string | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<string>('');

  const handleExportQueries = () => {
    const exportData = queries.map(query => ({
      'Query ID': query.id,
      'Type': query.type,
      'Company Name': query.company_name,
      'Email': query.email,
      'Phone': query.phone,
      'Pincode': query.pincode,
      'Quantity (kg)': query.quantity,
      'Product ID': query.product_id,
      'Product SKU': query.product_sku || 'N/A',
      'Product Category': query.product_category || 'N/A',
      'GST Number': query.gst || 'N/A',
      'Status': query.status,
      'Assigned To': query.assigned_to ? employees.find(emp => emp.id === query.assigned_to)?.name || 'Unknown' : 'Not Assigned',
      'Created Date': new Date(query.created_at).toLocaleDateString()
    }));
    
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Queries');
    XLSX.writeFile(workbook, 'Product_Queries_Report.xlsx');
  };

  const handleAssignQuery = async (queryId: string, employeeId: string) => {
    try {
      await QueryService.assignQuery(queryId, employeeId);
      await onQueryUpdate();
      setAssigningQueryId(null);
      setSelectedEmployee('');
      alert('Query assigned successfully!');
    } catch (error) {
      console.error('Error assigning query:', error);
      alert('Failed to assign query');
    }
  };

  const handleUpdateQueryStatus = async (queryId: string, status: string) => {
    try {
      await QueryService.updateQueryStatus(queryId, status);
      await onQueryUpdate();
      setEditingQueryId(null);
      alert('Query status updated successfully!');
    } catch (error) {
      console.error('Error updating query status:', error);
      alert('Failed to update query status');
    }
  };

  const handleDeleteQuery = async (queryId: string) => {
    if (window.confirm('Are you sure you want to delete this query?')) {
      try {
        await QueryService.deleteQuery(queryId);
        await onQueryUpdate();
        setSelectedQuery(null);
        setShowQueryDetails(false);
        alert('Query deleted successfully!');
      } catch (error) {
        console.error('Error deleting query:', error);
        alert('Failed to delete query');
      }
    }
  };

  const filteredQueries = queries.filter(query => {
    const searchMatch = !querySearchTerm || 
      query.company_name?.toLowerCase().includes(querySearchTerm.toLowerCase()) ||
      query.email?.toLowerCase().includes(querySearchTerm.toLowerCase()) ||
      query.product_sku?.toLowerCase().includes(querySearchTerm.toLowerCase());
    
    const statusMatch = !queryStatusFilter || query.status === queryStatusFilter;
    
    return searchMatch && statusMatch;
  });

  return (
    <div className="space-y-8">
      {/* Queries Management */}
      <div className="bg-white rounded-lg shadow-soft p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 sm:mb-6 space-y-3 sm:space-y-0">
          <h3 className="text-base sm:text-lg font-semibold text-primary">Product Queries ({queries.length})</h3>
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search queries..."
                value={querySearchTerm}
                onChange={(e) => setQuerySearchTerm(e.target.value)}
                className="w-full sm:w-auto pl-10 pr-4 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
              />
            </div>
            <select
              value={queryStatusFilter}
              onChange={(e) => setQueryStatusFilter(e.target.value)}
              className="w-full sm:w-auto px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
            >
              <option value="">All Status</option>
              <option value="PENDING">Pending</option>
              <option value="ASSIGNED">Assigned</option>
              <option value="COMPLETED">Completed</option>
              <option value="REJECTED">Rejected</option>
            </select>
            <button 
              onClick={handleExportQueries}
              className="w-full sm:w-auto bg-primary text-white px-4 py-2 rounded-lg hover:bg-accent transition-colors flex items-center justify-center text-sm"
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-2 sm:py-3 px-2 sm:px-4 text-xs font-medium text-gray-500 uppercase">Company</th>
                <th className="text-left py-2 sm:py-3 px-2 sm:px-4 text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="text-left py-2 sm:py-3 px-2 sm:px-4 text-xs font-medium text-gray-500 uppercase">Product</th>
                <th className="text-left py-2 sm:py-3 px-2 sm:px-4 text-xs font-medium text-gray-500 uppercase">Quantity</th>
                <th className="text-left py-2 sm:py-3 px-2 sm:px-4 text-xs font-medium text-gray-500 uppercase">Contact</th>
                <th className="text-left py-2 sm:py-3 px-2 sm:px-4 text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="text-left py-2 sm:py-3 px-2 sm:px-4 text-xs font-medium text-gray-500 uppercase">Assigned To</th>
                <th className="text-left py-2 sm:py-3 px-2 sm:px-4 text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-6 sm:py-8 text-center">
                    <div className="animate-spin rounded-full h-5 w-5 sm:h-6 sm:w-6 border-b-2 border-primary mx-auto"></div>
                    <p className="text-gray-600 mt-2">Loading queries...</p>
                  </td>
                </tr>
              ) : filteredQueries.length > 0 ? (
                filteredQueries.map((query) => (
                  <tr key={query.id} className="border-b hover:bg-gray-50">
                    <td className="py-2 sm:py-3 px-2 sm:px-4">
                      <div>
                        <p className="text-xs sm:text-sm font-medium">{query.company_name}</p>
                        <p className="text-xs text-gray-600">{query.pincode}</p>
                      </div>
                    </td>
                    <td className="py-2 sm:py-3 px-2 sm:px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        query.type === 'BUY' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                      }`}>
                        {query.type}
                      </span>
                    </td>
                    <td className="py-2 sm:py-3 px-2 sm:px-4">
                      <div>
                        <p className="text-xs sm:text-sm">{query.product_sku || 'N/A'}</p>
                        <p className="text-xs text-gray-500">{query.product_category || 'N/A'}</p>
                      </div>
                    </td>
                    <td className="py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm">{query.quantity} kg</td>
                    <td className="py-2 sm:py-3 px-2 sm:px-4">
                      <div>
                        <p className="text-xs sm:text-sm">{query.email}</p>
                        <p className="text-xs text-gray-600 hidden sm:block">{query.phone}</p>
                      </div>
                    </td>
                    <td className="py-2 sm:py-3 px-2 sm:px-4">
                      {editingQueryId === query.id ? (
                        <div className="flex flex-col sm:flex-row space-y-1 sm:space-y-0 sm:space-x-1">
                          <select
                            onChange={(e) => handleUpdateQueryStatus(query.id, e.target.value)}
                            className="px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-primary w-full sm:w-auto"
                            defaultValue={query.status}
                          >
                            <option value="PENDING">Pending</option>
                            <option value="ASSIGNED">Assigned</option>
                            <option value="COMPLETED">Completed</option>
                            <option value="REJECTED">Rejected</option>
                          </select>
                          <button
                            onClick={() => setEditingQueryId(null)}
                            className="px-2 py-1 text-xs border border-gray-300 text-gray-600 rounded hover:bg-gray-50 w-full sm:w-auto"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          query.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                          query.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                          query.status === 'ASSIGNED' ? 'bg-blue-100 text-blue-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {query.status}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {assigningQueryId === query.id ? (
                        <div className="flex flex-col sm:flex-row space-y-1 sm:space-y-0 sm:space-x-1">
                          <select
                            value={selectedEmployee}
                            onChange={(e) => setSelectedEmployee(e.target.value)}
                            className="px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-primary w-full sm:w-auto"
                          >
                            <option value="">Select Employee</option>
                            {employees.map(emp => (
                              <option key={emp.id} value={emp.id}>{emp.name}</option>
                            ))}
                          </select>
                          <button
                            onClick={() => handleAssignQuery(query.id, selectedEmployee)}
                            disabled={!selectedEmployee}
                            className="px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 w-full sm:w-auto"
                          >
                            Assign
                          </button>
                          <button
                            onClick={() => {
                              setAssigningQueryId(null);
                              setSelectedEmployee('');
                            }}
                            className="px-2 py-1 text-xs border border-gray-300 text-gray-600 rounded hover:bg-gray-50 w-full sm:w-auto"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs sm:text-sm text-gray-600">
                          {query.assigned_to ? 
                            employees.find(emp => emp.id === query.assigned_to)?.name || query.assigned_to_name || 'Unknown' : 
                            'Not Assigned'
                          }
                        </span>
                      )}
                    </td>
                    <td className="py-2 sm:py-3 px-2 sm:px-4">
                      <div className="flex space-x-1">
                        <button
                          onClick={() => {
                            setSelectedQuery(query);
                            setShowQueryDetails(true);
                          }}
                          className="p-1 text-xs border border-blue-300 text-blue-600 rounded hover:bg-blue-50 transition-colors"
                        >
                          <Eye className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => setEditingQueryId(query.id)}
                          className="p-1 text-xs border border-green-300 text-green-600 rounded hover:bg-green-50 transition-colors"
                        >
                          <Edit className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => setAssigningQueryId(query.id)}
                          className="p-1 text-xs border border-purple-300 text-purple-600 rounded hover:bg-purple-50 transition-colors"
                        >
                          <UserCheck className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => handleDeleteQuery(query.id)}
                          className="p-1 text-xs border border-red-300 text-red-600 rounded hover:bg-red-50 transition-colors"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="py-6 sm:py-8 text-center text-gray-500 text-sm">
                    No queries found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Query Details Modal */}
      {showQueryDetails && selectedQuery && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-primary">Query Details</h2>
                <button
                  onClick={() => setShowQueryDetails(false)}
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Query ID</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedQuery.id}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Type</label>
                    <span className={`mt-1 inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                      selectedQuery.type === 'BUY' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                    }`}>
                      {selectedQuery.type}
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Company Name</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedQuery.company_name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedQuery.email}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Phone</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedQuery.phone}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Pincode</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedQuery.pincode}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Quantity</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedQuery.quantity} kg</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Product SKU</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedQuery.product_sku || 'N/A'}</p>
                  </div>
                  {selectedQuery.gst && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">GST Number</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedQuery.gst}</p>
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Status</label>
                    <span className={`mt-1 inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                      selectedQuery.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                      selectedQuery.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                      selectedQuery.status === 'ASSIGNED' ? 'bg-blue-100 text-blue-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {selectedQuery.status}
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Created Date</label>
                    <p className="mt-1 text-sm text-gray-900">{new Date(selectedQuery.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center mt-8 pt-6 border-t">
                <button
                  onClick={() => handleDeleteQuery(selectedQuery.id)}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Query
                </button>
                <button
                  onClick={() => setShowQueryDetails(false)}
                  className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
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

export default AdminQueries;