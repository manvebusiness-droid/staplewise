import React, { useState } from 'react';
import { Plus, Search, Download, Edit, Trash2, X, Save } from 'lucide-react';
import * as XLSX from 'xlsx';
import { UserService } from '../../lib/supabaseServices';

interface AdminEmployeesProps {
  employees: any[];
  loading: boolean;
  onEmployeeUpdate: () => void;
}

const AdminEmployees: React.FC<AdminEmployeesProps> = ({
  employees,
  loading,
  onEmployeeUpdate
}) => {
  const [showEmployeeForm, setShowEmployeeForm] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<any>(null);
  const [employeeForm, setEmployeeForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: ''
  });
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    phone: ''
  });
  const [employeeSearchTerm, setEmployeeSearchTerm] = useState('');

  const handleEmployeeInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmployeeForm(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleEmployeeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await UserService.createSalesEmployee(employeeForm);
      alert('Sales employee created successfully!');
      onEmployeeUpdate();
      setShowEmployeeForm(false);
      setEmployeeForm({
        name: '',
        email: '',
        phone: '',
        password: ''
      });
    } catch (error) {
      console.error('Error creating employee:', error);
      alert('Failed to create employee: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  const handleEditEmployee = (employee: any) => {
    setEditingEmployee(employee);
    setEditForm({
      name: employee.name,
      email: employee.email,
      phone: employee.phone
    });
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingEmployee) return;
    
    try {
      await UserService.updateUser(editingEmployee.id, editForm);
      alert('Employee updated successfully!');
      onEmployeeUpdate();
      setEditingEmployee(null);
      setEditForm({ name: '', email: '', phone: '' });
    } catch (error) {
      console.error('Error updating employee:', error);
      alert('Failed to update employee: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  const handleDeleteEmployee = async (employeeId: string, employeeName: string) => {
    if (window.confirm(`Are you sure you want to delete employee "${employeeName}"? This action cannot be undone.`)) {
      try {
        await UserService.deleteUser(employeeId);
        alert('Employee deleted successfully!');
        onEmployeeUpdate();
      } catch (error) {
        console.error('Error deleting employee:', error);
        alert('Failed to delete employee: ' + (error instanceof Error ? error.message : 'Unknown error'));
      }
    }
  };

  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditForm(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
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
      'Date Joined': new Date(employee.created_at).toLocaleDateString()
    }));
    
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Employees');
    XLSX.writeFile(workbook, 'Sales_Employees_Report.xlsx');
  };

  const filteredEmployees = employees.filter(employee =>
    employee.name?.toLowerCase().includes(employeeSearchTerm.toLowerCase()) ||
    employee.email?.toLowerCase().includes(employeeSearchTerm.toLowerCase())
  );

  return (
    <div className="bg-white rounded-lg shadow-soft p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 sm:mb-6 space-y-3 sm:space-y-0">
        <h3 className="text-base sm:text-lg font-semibold text-primary">Sales Employees</h3>
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search employees..."
              value={employeeSearchTerm}
              onChange={(e) => setEmployeeSearchTerm(e.target.value)}
              className="w-full sm:w-48 lg:w-auto pl-10 pr-4 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
            />
          </div>
          <div className="flex space-x-2">
            <button 
              onClick={handleExportEmployees}
              className="p-2 border rounded-lg hover:bg-gray-50 flex-shrink-0"
              title="Export to Excel"
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              onClick={() => setShowEmployeeForm(true)}
              className="bg-primary text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-accent transition-colors flex items-center text-sm whitespace-nowrap"
            >
              <Plus className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Add Employee</span>
              <span className="sm:hidden">Add</span>
            </button>
          </div>
        </div>
      </div>

      {/* Add Employee Form */}
      {showEmployeeForm && (
        <div className="mb-4 sm:mb-6 p-3 sm:p-4 lg:p-6 border border-gray-200 rounded-lg bg-gray-50">
          <h4 className="font-medium mb-3 sm:mb-4 text-primary text-sm sm:text-base">Add Sales Employee</h4>
          <form onSubmit={handleEmployeeSubmit} className="space-y-3 sm:space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={employeeForm.name}
                  onChange={handleEmployeeInputChange}
                  required
                  className="w-full px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                  placeholder="Enter employee name"
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={employeeForm.email}
                  onChange={handleEmployeeInputChange}
                  required
                  className="w-full px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                  placeholder="Enter email address"
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                  Phone *
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={employeeForm.phone}
                  onChange={handleEmployeeInputChange}
                  required
                  className="w-full px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                  placeholder="+91 98765 43210"
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                  Password *
                </label>
                <input
                  type="password"
                  name="password"
                  value={employeeForm.password}
                  onChange={handleEmployeeInputChange}
                  required
                  className="w-full px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                  placeholder="Enter password for employee"
                />
              </div>
            </div>
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
              <button
                type="submit"
                className="bg-primary text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg hover:bg-accent transition-colors text-xs sm:text-sm font-medium"
              >
                Add Employee
              </button>
              <button
                type="button"
                onClick={() => setShowEmployeeForm(false)}
                className="bg-gray-500 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg hover:bg-gray-600 transition-colors text-xs sm:text-sm font-medium"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Edit Employee Form */}
      {editingEmployee && (
        <div className="mb-4 sm:mb-6 p-3 sm:p-4 lg:p-6 border border-gray-200 rounded-lg bg-blue-50">
          <div className="flex justify-between items-center mb-3 sm:mb-4">
            <h4 className="font-medium text-primary text-sm sm:text-base">Edit Employee: {editingEmployee.name}</h4>
            <button
              onClick={() => setEditingEmployee(null)}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <form onSubmit={handleEditSubmit} className="space-y-3 sm:space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={editForm.name}
                  onChange={handleEditInputChange}
                  required
                  className="w-full px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                  placeholder="Enter employee name"
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={editForm.email}
                  onChange={handleEditInputChange}
                  required
                  className="w-full px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                  placeholder="Enter email address"
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                  Phone *
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={editForm.phone}
                  onChange={handleEditInputChange}
                  required
                  className="w-full px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                  placeholder="+91 98765 43210"
                />
              </div>
            </div>
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
              <button
                type="submit"
                className="bg-primary text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg hover:bg-accent transition-colors flex items-center justify-center text-xs sm:text-sm font-medium"
              >
                <Save className="w-4 h-4 mr-2" />
                Update Employee
              </button>
              <button
                type="button"
                onClick={() => setEditingEmployee(null)}
                className="bg-gray-500 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg hover:bg-gray-600 transition-colors text-xs sm:text-sm font-medium"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
      
      {/* Employees Table */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[700px]">
          <thead className="bg-gray-50">
            <tr className="border-b">
              <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">Phone</th>
              <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
              <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">Company</th>
              <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="py-8 text-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
                  <p className="text-gray-600 mt-2">Loading employees...</p>
                </td>
              </tr>
            ) : filteredEmployees.length > 0 ? (
              filteredEmployees.map((employee) => (
                <tr key={employee.id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4 whitespace-nowrap">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{employee.name}</p>
                      <p className="text-xs text-gray-500 sm:hidden">{employee.phone}</p>
                    </div>
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <div>
                      <p className="text-sm text-gray-900">{employee.email}</p>
                      <p className="text-xs text-gray-500 lg:hidden">{employee.company_name || '-'}</p>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm hidden sm:table-cell">{employee.phone}</td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 whitespace-nowrap">
                      {employee.role}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm hidden lg:table-cell">{employee.company_name || '-'}</td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                      employee.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {employee.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEditEmployee(employee)}
                        className="text-green-600 hover:text-green-800 p-1 border border-green-300 rounded hover:bg-green-50 transition-colors"
                        title="Edit Employee"
                      >
                        <Edit className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => handleDeleteEmployee(employee.id, employee.name)}
                        className="text-red-600 hover:text-red-800 p-1 border border-red-300 rounded hover:bg-red-50 transition-colors"
                        title="Delete Employee"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="py-8 text-center text-gray-500">
                  No employees found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminEmployees;