import React from 'react';
import { Download } from 'lucide-react';
import * as XLSX from 'xlsx';

interface AdminReportsProps {
  queries: any[];
  users: any[];
  orders: any[];
  employees: any[];
}

const AdminReports: React.FC<AdminReportsProps> = ({ queries, users, orders, employees }) => {
  const handleExportQueries = () => {
    const exportData = queries.map(query => ({
      'Query ID': query.id,
      'Type': query.type,
      'Company Name': query.company_name,
      'Email': query.email,
      'Phone': query.phone,
      'Pincode': query.pincode,
      'Quantity (kg)': query.quantity,
      'Product SKU': query.product_sku || '-',
      'Product Category': query.product_category || '-',
      'GST Number': query.gst || '-',
      'Status': query.status,
      'Assigned To': query.assigned_to ? employees.find(emp => emp.id === query.assigned_to)?.name || 'Unknown' : 'Not Assigned',
      'Created Date': new Date(query.created_at).toLocaleDateString(),
      'Updated Date': query.updated_at ? new Date(query.updated_at).toLocaleDateString() : '-'
    }));
    
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Queries');
    XLSX.writeFile(workbook, 'Product_Queries_Report.xlsx');
  };

  const handleExportUsers = () => {
    const exportData = users.map(user => ({
      'Name': user.name,
      'Email': user.email,
      'Phone': user.phone,
      'Role': user.role,
      'Company Name': user.company_name || '-',
      'GST Number': user.gst || user.company_details?.gstin || '-',
      'Status': user.is_active ? 'Active' : 'Inactive',
      'Created Date': new Date(user.created_at).toLocaleDateString(),
      'Updated Date': user.updated_at ? new Date(user.updated_at).toLocaleDateString() : '-'
    }));
    
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Users');
    XLSX.writeFile(workbook, 'Users_Directory_Report.xlsx');
  };

  const handleExportOrders = () => {
    const exportData = orders.map(order => ({
      'Order ID': order.id,
      'Order Number': order.order_number || order.id,
      'Product Name': order.product_name || '-',
      'Product SKU': order.product_sku || '-',
      'Category': order.product_category || '-',
      'Grade': order.product_grade || '-',
      'Quantity (kg)': order.quantity || 0,
      'Price per KG (₹)': order.price_per_kg || 0,
      'Total Amount (₹)': order.total_amount || 0,
      'Seller Name': order.seller_name || '-',
      'Seller Email': order.seller_email || '-',
      'Seller Phone': order.seller_phone || '-',
      'Seller Company': order.seller_company || '-',
      'Buyer Name': order.buyer_name || '-',
      'Buyer Email': order.buyer_email || '-',
      'Buyer Company': order.buyer_company || '-',
      'Delivery Address': order.delivery_address || '-',
      'Status': order.status,
      'Payment Status': order.payment_status || '-',
      'Order Notes': order.order_notes || '-',
      'Created Date': new Date(order.created_at).toLocaleDateString()
    }));
    
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Orders');
    XLSX.writeFile(workbook, 'Orders_Report.xlsx');
  };

  const handleExportEmployees = () => {
    const exportData = employees.map(employee => ({
      'Employee ID': employee.id,
      'Name': employee.name,
      'Email': employee.email,
      'Phone': employee.phone,
      'Role': employee.role,
      'Company Name': employee.company_name || '-',
      'Status': employee.is_active ? 'Active' : 'Inactive',
      'Date Joined': new Date(employee.created_at).toLocaleDateString(),
      'Updated Date': employee.updated_at ? new Date(employee.updated_at).toLocaleDateString() : '-'
    }));
    
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Employees');
    XLSX.writeFile(workbook, 'Sales_Employees_Report.xlsx');
  };

  return (
    <div className="bg-white rounded-lg shadow-soft p-4 sm:p-6">
      <h3 className="text-base sm:text-lg font-semibold text-primary mb-4 sm:mb-6">Reports & Export</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="p-3 sm:p-4 border rounded-lg hover:shadow-md transition-shadow">
          <h4 className="font-medium mb-2 text-sm sm:text-base">Query Reports</h4>
          <p className="text-gray-600 text-xs sm:text-sm mb-3 sm:mb-4">Export all product queries with detailed information</p>
          <button 
            onClick={handleExportQueries}
            className="bg-primary text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-accent transition-colors flex items-center w-full justify-center text-xs sm:text-sm"
          >
            <Download className="w-4 h-4 mr-2" />
            Export Excel
          </button>
        </div>
        
        <div className="p-3 sm:p-4 border rounded-lg hover:shadow-md transition-shadow">
          <h4 className="font-medium mb-2 text-sm sm:text-base">User Directory</h4>
          <p className="text-gray-600 text-xs sm:text-sm mb-3 sm:mb-4">Export user information and contact details</p>
          <button 
            onClick={handleExportUsers}
            className="bg-primary text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-accent transition-colors flex items-center w-full justify-center text-xs sm:text-sm"
          >
            <Download className="w-4 h-4 mr-2" />
            Export Excel
          </button>
        </div>
        
        <div className="p-3 sm:p-4 border rounded-lg hover:shadow-md transition-shadow">
          <h4 className="font-medium mb-2 text-sm sm:text-base">Orders Report</h4>
          <p className="text-gray-600 text-xs sm:text-sm mb-3 sm:mb-4">Export all orders with complete details</p>
          <button 
            onClick={handleExportOrders}
            className="bg-primary text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-accent transition-colors flex items-center w-full justify-center text-xs sm:text-sm"
          >
            <Download className="w-4 h-4 mr-2" />
            Export Excel
          </button>
        </div>
        
        <div className="p-3 sm:p-4 border rounded-lg hover:shadow-md transition-shadow">
          <h4 className="font-medium mb-2 text-sm sm:text-base">Employee Report</h4>
          <p className="text-gray-600 text-xs sm:text-sm mb-3 sm:mb-4">Export sales employee data and performance</p>
          <button 
            onClick={handleExportEmployees}
            className="bg-primary text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-accent transition-colors flex items-center w-full justify-center text-xs sm:text-sm"
          >
            <Download className="w-4 h-4 mr-2" />
            Export Excel
          </button>
        </div>
      </div>

      {/* Report Summary */}
      <div className="mt-6 sm:mt-8 bg-gray-50 rounded-lg p-4 sm:p-6">
        <h4 className="font-semibold text-gray-900 mb-3 sm:mb-4 text-sm sm:text-base">Report Summary</h4>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <div className="text-center">
            <p className="text-lg sm:text-2xl font-bold text-blue-600">{queries.length}</p>
            <p className="text-xs sm:text-sm text-gray-600">Total Queries</p>
          </div>
          <div className="text-center">
            <p className="text-lg sm:text-2xl font-bold text-green-600">{users.length}</p>
            <p className="text-xs sm:text-sm text-gray-600">Total Users</p>
          </div>
          <div className="text-center">
            <p className="text-lg sm:text-2xl font-bold text-orange-600">{orders.length}</p>
            <p className="text-xs sm:text-sm text-gray-600">Total Orders</p>
          </div>
          <div className="text-center">
            <p className="text-lg sm:text-2xl font-bold text-purple-600">{employees.length}</p>
            <p className="text-xs sm:text-sm text-gray-600">Sales Employees</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminReports;