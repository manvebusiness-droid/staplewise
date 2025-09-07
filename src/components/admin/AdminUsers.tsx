import React, { useState } from 'react';
import { Search, Download } from 'lucide-react';
import * as XLSX from 'xlsx';

interface AdminUsersProps {
  users: any[];
  loading: boolean;
}

const AdminUsers: React.FC<AdminUsersProps> = ({ users, loading }) => {
  const [userSearchTerm, setUserSearchTerm] = useState('');

  const handleExportUsers = () => {
    const exportData = users.map(user => ({
      'Name': user.name,
      'Email': user.email,
      'Phone': user.phone,
      'Role': user.role,
      'Company Name': user.company_name || '-',
      'GST Number': user.gst || user.company_details?.gstin || '-',
      'Status': user.is_active ? 'Active' : 'Inactive',
      'Created Date': new Date(user.created_at).toLocaleDateString()
    }));
    
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Users');
    XLSX.writeFile(workbook, 'Users_Directory_Report.xlsx');
  };

  const filteredUsers = users.filter(user =>
    user.name?.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
    user.company_name?.toLowerCase().includes(userSearchTerm.toLowerCase())
  );

  return (
    <div className="bg-white rounded-lg shadow-soft p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 sm:mb-6 space-y-3 sm:space-y-0">
        <h3 className="text-base sm:text-lg font-semibold text-primary">All Users Data</h3>
        <div className="flex space-x-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search users..."
              value={userSearchTerm}
              onChange={(e) => setUserSearchTerm(e.target.value)}
              className="w-full sm:w-auto pl-10 pr-4 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
            />
          </div>
          <button 
            className="p-2 border rounded-lg hover:bg-gray-50 flex-shrink-0"
            onClick={handleExportUsers}
            title="Export to Excel"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[700px]">
          <thead>
            <tr className="border-b">
              <th className="text-left py-2 sm:py-3 px-2 sm:px-4 text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="text-left py-2 sm:py-3 px-2 sm:px-4 text-xs font-medium text-gray-500 uppercase">Email</th>
              <th className="text-left py-2 sm:py-3 px-2 sm:px-4 text-xs font-medium text-gray-500 uppercase">Phone</th>
              <th className="text-left py-2 sm:py-3 px-2 sm:px-4 text-xs font-medium text-gray-500 uppercase">Role</th>
              <th className="text-left py-2 sm:py-3 px-2 sm:px-4 text-xs font-medium text-gray-500 uppercase">Company</th>
              <th className="text-left py-2 sm:py-3 px-2 sm:px-4 text-xs font-medium text-gray-500 uppercase">GST</th>
              <th className="text-left py-2 sm:py-3 px-2 sm:px-4 text-xs font-medium text-gray-500 uppercase">Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="py-6 sm:py-8 text-center">
                  <div className="animate-spin rounded-full h-5 w-5 sm:h-6 sm:w-6 border-b-2 border-primary mx-auto"></div>
                  <p className="text-gray-600 mt-2">Loading users...</p>
                </td>
              </tr>
            ) : filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <tr key={user.id} className="border-b hover:bg-gray-50">
                  <td className="py-2 sm:py-3 px-2 sm:px-4">
                    <div>
                      <p className="text-xs sm:text-sm font-medium">{user.name}</p>
                    </div>
                  </td>
                  <td className="py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm">{user.email}</td>
                  <td className="py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm">{user.phone}</td>
                  <td className="py-2 sm:py-3 px-2 sm:px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      user.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' :
                      user.role === 'SALES' ? 'bg-blue-100 text-blue-800' :
                      user.role === 'BUYER' ? 'bg-green-100 text-green-800' :
                      user.role === 'SELLER' ? 'bg-orange-100 text-orange-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm">{user.company_name || '-'}</td>
                  <td className="py-2 sm:py-3 px-2 sm:px-4">
                    {(user.gst || user.company_details?.gstin) ? (
                      <span className="font-mono text-xs bg-gray-100 px-1 sm:px-2 py-1 rounded">
                        {user.gst || user.company_details?.gstin}
                      </span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="py-2 sm:py-3 px-2 sm:px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {user.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="py-6 sm:py-8 text-center text-gray-500 text-sm">
                  No users found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Summary Stats */}
      <div className="mt-4 sm:mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-purple-50 p-3 sm:p-4 rounded-lg text-center">
          <p className="text-xs sm:text-sm text-purple-600">Total Admins</p>
          <p className="text-lg sm:text-2xl font-bold text-purple-800">
            {users.filter(user => user.role === 'ADMIN').length}
          </p>
        </div>
        <div className="bg-blue-50 p-3 sm:p-4 rounded-lg text-center">
          <p className="text-xs sm:text-sm text-blue-600">Total Sales Staff</p>
          <p className="text-lg sm:text-2xl font-bold text-blue-800">
            {users.filter(user => user.role === 'SALES').length}
          </p>
        </div>
        <div className="bg-green-50 p-3 sm:p-4 rounded-lg text-center">
          <p className="text-xs sm:text-sm text-green-600">Total Buyers</p>
          <p className="text-lg sm:text-2xl font-bold text-green-800">
            {users.filter(user => user.role === 'BUYER').length}
          </p>
        </div>
        <div className="bg-orange-50 p-3 sm:p-4 rounded-lg text-center">
          <p className="text-xs sm:text-sm text-orange-600">Total Sellers</p>
          <p className="text-lg sm:text-2xl font-bold text-orange-800">
            {users.filter(user => user.role === 'SELLER').length}
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminUsers;