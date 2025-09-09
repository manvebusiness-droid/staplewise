import React, { useState } from 'react';
import { Search, Trash2, Package, Eye, X, MapPin, User, Calendar } from 'lucide-react';
import { ProductService } from '../../lib/supabaseServices';

interface AdminProductsProps {
  products: any[];
  loading: boolean;
  onProductUpdate: () => void;
}

const AdminProducts: React.FC<AdminProductsProps> = ({
  products,
  loading,
  onProductUpdate
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [showProductDetails, setShowProductDetails] = useState(false);

  const categories = [
    { value: 'cashews', label: 'Cashews' },
    { value: 'cloves', label: 'Cloves' },
    { value: 'chillies', label: 'Chillies' },
    { value: 'star-anise', label: 'Star Anise' },
    { value: 'pepper', label: 'Pepper' },
    { value: 'cinnamon', label: 'Cinnamon' }
  ];

  const sortOptions = [
    { value: 'created_at', label: 'Date Added' },
    { value: 'name', label: 'Product Name' },
    { value: 'price_per_kg', label: 'Price per KG' },
    { value: 'stock', label: 'Stock' },
    { value: 'grade', label: 'Grade' },
    { value: 'location', label: 'Location' }
  ];

  const handleDeleteProduct = async (productId: string, productName: string) => {
    if (window.confirm(`Are you sure you want to delete "${productName}"? This action cannot be undone and will affect any related orders.`)) {
      try {
        console.log('🔄 Admin deleting product:', productId);
        await ProductService.deleteProduct(productId);
        await onProductUpdate();
        console.log('✅ Product deleted successfully');
        alert('Product deleted successfully!');
      } catch (error) {
        console.error('Error deleting product:', error);
        alert('Failed to delete product: ' + (error instanceof Error ? error.message : 'Unknown error'));
      }
    }
  };

  const handleViewProduct = (product: any) => {
    setSelectedProduct(product);
    setShowProductDetails(true);
  };

  // Filter and sort products
  const filteredAndSortedProducts = products
    .filter(product => {
      const searchMatch = !searchTerm || 
        product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.grade?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.specifications?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.users?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.users?.company_name?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const categoryMatch = !categoryFilter || product.category === categoryFilter;
      
      return searchMatch && categoryMatch;
    })
    .sort((a, b) => {
      let aValue = a[sortBy] || '';
      let bValue = b[sortBy] || '';
      
      // Handle nested seller name sorting
      if (sortBy === 'seller_name') {
        aValue = a.users?.name || a.users?.company_name || '';
        bValue = b.users?.name || b.users?.company_name || '';
      }
      
      // Handle numeric sorting for price and stock
      if (sortBy === 'price_per_kg' || sortBy === 'stock') {
        const aNum = parseFloat(aValue) || 0;
        const bNum = parseFloat(bValue) || 0;
        return sortOrder === 'asc' ? aNum - bNum : bNum - aNum;
      }
      
      // Handle date sorting
      if (sortBy === 'created_at') {
        const aDate = new Date(aValue).getTime();
        const bDate = new Date(bValue).getTime();
        return sortOrder === 'asc' ? aDate - bDate : bDate - aDate;
      }
      
      // Handle string sorting
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  return (
    <div className="bg-white rounded-lg shadow-soft p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 sm:mb-6 space-y-3 sm:space-y-0">
        <div>
          <h3 className="text-base sm:text-lg font-semibold text-primary">Listed Products</h3>
          <p className="text-xs sm:text-sm text-gray-600">Manage all products listed by sellers</p>
        </div>
        <div className="text-xs sm:text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full text-center">
          {products.length} Total Products
        </div>
      </div>

      {/* Search, Filter, and Sort Controls */}
      <div className="mb-4 sm:mb-6 bg-gray-50 rounded-lg p-3 sm:p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {/* Search */}
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Search Products</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search by name, SKU, grade..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
              />
            </div>
          </div>

          {/* Category Filter */}
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
          </div>

          {/* Sort By */}
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
            >
              {sortOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Sort Order */}
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Sort Order</label>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="w-full px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
            >
              <option value="desc">Newest First</option>
              <option value="asc">Oldest First</option>
            </select>
          </div>
        </div>

        {/* Filter Summary */}
        <div className="mt-3 sm:mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between text-xs sm:text-sm text-gray-600 space-y-2 sm:space-y-0">
          <div>
            Showing {filteredAndSortedProducts.length} of {products.length} products
            {searchTerm && ` matching "${searchTerm}"`}
            {categoryFilter && ` in ${categories.find(c => c.value === categoryFilter)?.label}`}
          </div>
          {(searchTerm || categoryFilter) && (
            <button
              onClick={() => {
                setSearchTerm('');
                setCategoryFilter('');
              }}
              className="text-primary hover:text-accent transition-colors text-xs sm:text-sm"
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Products Table */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[800px]">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
              <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SKU</th>
              <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
              <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Grade</th>
              <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
              <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Seller</th>
              <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
              <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={8} className="py-6 sm:py-8 text-center">
                  <div className="animate-spin rounded-full h-5 w-5 sm:h-6 sm:w-6 border-b-2 border-primary mx-auto"></div>
                  <p className="text-gray-600 mt-2">Loading products...</p>
                </td>
              </tr>
            ) : filteredAndSortedProducts.length > 0 ? (
              filteredAndSortedProducts.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <img
                        src={product.image && !product.image.startsWith('blob:') ? product.image : 'https://images.pexels.com/photos/4198019/pexels-photo-4198019.jpeg?auto=compress&cs=tinysrgb&w=400'}
                        alt={product.name}
                        className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg object-cover mr-2 sm:mr-3"
                      />
                      <div>
                        <p className="text-xs sm:text-sm font-medium text-gray-900">{product.name}</p>
                        <p className="text-xs text-gray-500 hidden sm:block">Added {new Date(product.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                    <span className="bg-primary/10 text-primary px-1 sm:px-2 py-1 rounded text-xs font-mono">
                      {product.sku || 'Generating...'}
                    </span>
                  </td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                    <span className="bg-gray-100 text-gray-800 px-1 sm:px-2 py-1 rounded-full text-xs font-medium capitalize">
                      {product.category}
                    </span>
                  </td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                    <span className="bg-accent/10 text-accent px-1 sm:px-2 py-1 rounded-full text-xs font-medium">
                      {product.grade}
                    </span>
                  </td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                    <div>
                      <p className="text-xs sm:text-sm font-medium text-gray-900">₹{product.price_per_kg}</p>
                      <p className="text-xs text-gray-500">per kg</p>
                    </div>
                  </td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                    <div>
                      <p className="text-xs sm:text-sm font-medium text-gray-900">{product.users?.name || 'Unknown'}</p>
                      <p className="text-xs text-gray-500 hidden sm:block">{product.users?.company_name || 'No company'}</p>
                    </div>
                  </td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <MapPin className="w-3 h-3 mr-1 text-gray-400" />
                      <span className="text-xs sm:text-sm text-gray-900">{product.location}</span>
                    </div>
                  </td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleViewProduct(product)}
                        className="text-blue-600 hover:text-blue-800 p-1 border border-blue-300 rounded hover:bg-blue-50 transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(product.id, product.name)}
                        className="text-red-600 hover:text-red-800 p-1 border border-red-300 rounded hover:bg-red-50 transition-colors"
                        title="Delete Product"
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
                  {searchTerm || categoryFilter ? 'No products found matching your criteria' : 'No products listed yet'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Product Details Modal */}
      {showProductDetails && selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold font-playfair text-primary">Product Details</h2>
                <button
                  onClick={() => setShowProductDetails(false)}
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Product Image */}
                <div>
                  <img
                    src={selectedProduct.image && !selectedProduct.image.startsWith('blob:') ? selectedProduct.image : 'https://images.pexels.com/photos/4198019/pexels-photo-4198019.jpeg?auto=compress&cs=tinysrgb&w=400'}
                    alt={selectedProduct.name}
                    className="w-full h-64 object-cover rounded-lg"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = 'https://images.pexels.com/photos/4198019/pexels-photo-4198019.jpeg?auto=compress&cs=tinysrgb&w=400';
                    }}
                  />
                </div>
                
                {/* Basic Product Info */}
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xl font-bold text-primary">{selectedProduct.name}</h3>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="bg-accent/10 text-accent px-2 py-1 rounded-full text-sm font-medium">
                        {selectedProduct.grade}
                      </span>
                      {selectedProduct.sku && (
                        <span className="bg-primary/10 text-primary px-2 py-1 rounded text-sm font-mono">
                          SKU: {selectedProduct.sku}
                        </span>
                      )}
                      <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-sm font-medium capitalize">
                        {selectedProduct.category}
                      </span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Price per KG</p>
                      <p className="text-2xl font-bold text-primary">₹{selectedProduct.price_per_kg}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Available Stock</p>
                      <p className="text-xl font-bold text-gray-900">{selectedProduct.stock} kg</p>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-600">Minimum Order</p>
                    <p className="text-lg font-semibold text-gray-900">{selectedProduct.minimum_order_quantity} kg</p>
                  </div>
                  
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                    <span className="text-lg text-gray-900">{selectedProduct.location}</span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Delivery Time</p>
                    <p className="text-lg text-gray-900">{selectedProduct.delivery_time}</p>
                  </div>
                </div>
              </div>

              {/* Seller Information */}
              <div className="border-t pt-6 mb-6">
                <h4 className="text-lg font-semibold text-primary mb-4 flex items-center">
                  <User className="w-5 h-5 mr-2" />
                  Seller Information
                </h4>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Seller Name</p>
                      <p className="font-medium text-gray-900">{selectedProduct.users?.name || 'Unknown'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Company Name</p>
                      <p className="font-medium text-gray-900">{selectedProduct.users?.company_name || 'Not specified'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Email</p>
                      <p className="font-medium text-gray-900">{selectedProduct.users?.email || 'Not available'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Phone</p>
                      <p className="font-medium text-gray-900">{selectedProduct.users?.phone || 'Not available'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Product Specifications */}
              <div className="border-t pt-6 mb-6">
                <h4 className="text-lg font-semibold text-primary mb-3">Specifications</h4>
                <p className="text-gray-700 leading-relaxed">{selectedProduct.specifications}</p>
              </div>

              {/* Grade Description */}
              {selectedProduct.grade_description && (
                <div className="border-t pt-6 mb-6">
                  <h4 className="text-lg font-semibold text-primary mb-3">Grade Description</h4>
                  <p className="text-gray-700 leading-relaxed">{selectedProduct.grade_description}</p>
                </div>
              )}

              {/* Quality Assurance */}
              {selectedProduct.quality_assurance && selectedProduct.quality_assurance.length > 0 && (
                <div className="border-t pt-6 mb-6">
                  <h4 className="text-lg font-semibold text-primary mb-3">Quality Assurance</h4>
                  <ul className="space-y-2">
                    {selectedProduct.quality_assurance.map((point: string, index: number) => (
                      <li key={index} className="flex items-start space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-sm text-gray-700">{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Packaging & Delivery */}
              {selectedProduct.packaging_delivery && selectedProduct.packaging_delivery.length > 0 && (
                <div className="border-t pt-6 mb-6">
                  <h4 className="text-lg font-semibold text-primary mb-3">Packaging & Delivery</h4>
                  <ul className="space-y-2">
                    {selectedProduct.packaging_delivery.map((point: string, index: number) => (
                      <li key={index} className="flex items-start space-x-2">
                        <Package className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-700">{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Product Timeline */}
              <div className="border-t pt-6">
                <h4 className="text-lg font-semibold text-primary mb-3 flex items-center">
                  <Calendar className="w-5 h-5 mr-2" />
                  Product Timeline
                </h4>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Date Listed</p>
                      <p className="font-medium text-gray-900">
                        {new Date(selectedProduct.created_at).toLocaleDateString('en-IN', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                    {selectedProduct.updated_at && selectedProduct.updated_at !== selectedProduct.created_at && (
                      <div>
                        <p className="text-sm text-gray-600">Last Updated</p>
                        <p className="font-medium text-gray-900">
                          {new Date(selectedProduct.updated_at).toLocaleDateString('en-IN', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                    )}
                    <div>
                      <p className="text-sm text-gray-600">Product Status</p>
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                        selectedProduct.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {selectedProduct.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex justify-between items-center mt-8 pt-6 border-t">
                <button
                  onClick={() => handleDeleteProduct(selectedProduct.id, selectedProduct.name)}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Product
                </button>
                <button
                  onClick={() => setShowProductDetails(false)}
                  className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Summary Stats */}
      <div className="mt-4 sm:mt-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {categories.map(category => {
          const categoryProducts = products.filter(p => p.category === category.value);
          return (
            <div key={category.value} className="bg-gray-50 p-3 sm:p-4 rounded-lg text-center">
              <p className="text-xs sm:text-sm text-gray-600">{category.label}</p>
              <p className="text-lg sm:text-2xl font-bold text-primary">{categoryProducts.length}</p>
              <p className="text-xs text-gray-500">products listed</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AdminProducts;