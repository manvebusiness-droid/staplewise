import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Edit, Save, X, Package, BarChart3, Calendar } from 'lucide-react';
import { ProductService } from '../../lib/supabaseServices';
import { useAuth } from '../../contexts/AuthContext';

const ProductPerformance: React.FC = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPriceId, setEditingPriceId] = useState<string | null>(null);
  const [newPrice, setNewPrice] = useState<string>('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const productsData = await ProductService.getProductsBySeller(user.id);
      setProducts(productsData);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditPrice = (product: any) => {
    setEditingPriceId(product.id);
    setNewPrice(product.price_per_kg.toString());
  };

  const handleSavePrice = async (productId: string) => {
    if (!newPrice || parseFloat(newPrice) <= 0) {
      alert('Please enter a valid price');
      return;
    }

    try {
      setUpdating(true);
      await ProductService.updateProduct(productId, {
        price_per_kg: parseFloat(newPrice)
      });
      
      // Refresh products to get updated data
      await fetchProducts();
      
      setEditingPriceId(null);
      setNewPrice('');
      alert('Price updated successfully!');
    } catch (error) {
      console.error('Error updating price:', error);
      alert('Failed to update price. Please try again.');
    } finally {
      setUpdating(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingPriceId(null);
    setNewPrice('');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-600 mb-2">No Products Listed</h3>
        <p className="text-gray-500 mb-6">Add products to see performance analytics</p>
        <button
          onClick={() => window.location.href = '/seller/list-product'}
          className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-accent transition-colors"
        >
          Add Your First Product
        </button>
      </div>
    );
  }

  // Calculate stats
  const totalProducts = products.length;
  const avgPrice = Math.round(products.reduce((sum, p) => sum + p.price_per_kg, 0) / products.length);
  const categories = new Set(products.map(p => p.category)).size;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-playfair text-primary">Product Performance</h1>
        <p className="text-gray-600 mt-2">Analyze your product performance and manage pricing</p>
      </div>

      {/* Performance Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-soft p-6">
          <div className="flex items-center">
            <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
              <Package className="w-6 h-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Total Products</p>
              <p className="text-2xl font-bold text-gray-900">{totalProducts}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-soft p-6">
          <div className="flex items-center">
            <div className="p-2 rounded-lg bg-green-100 text-green-600">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Avg Price</p>
              <p className="text-2xl font-bold text-gray-900">₹{avgPrice}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-soft p-6">
          <div className="flex items-center">
            <div className="p-2 rounded-lg bg-purple-100 text-purple-600">
              <BarChart3 className="w-6 h-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Categories</p>
              <p className="text-2xl font-bold text-gray-900">{categories}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Price Management Section */}
      <div className="bg-white rounded-2xl shadow-soft p-6">
        <h3 className="text-xl font-bold font-playfair text-primary mb-6">Price Management</h3>
        <p className="text-gray-600 mb-6">Click on any product to edit its price. Price changes are tracked automatically.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((product) => (
            <div key={product.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center mb-3">
                <img
                  src={product.image && !product.image.startsWith('blob:') ? product.image : 'https://images.pexels.com/photos/4198019/pexels-photo-4198019.jpeg?auto=compress&cs=tinysrgb&w=400'}
                  alt={product.name}
                  className="w-12 h-12 rounded-lg object-cover mr-3"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = 'https://images.pexels.com/photos/4198019/pexels-photo-4198019.jpeg?auto=compress&cs=tinysrgb&w=400';
                  }}
                />
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{product.name}</h4>
                  <p className="text-sm text-gray-500">{product.grade}</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                {editingPriceId === product.id ? (
                  <div className="flex items-center space-x-2 flex-1">
                    <div className="flex-1">
                      <input
                        type="number"
                        value={newPrice}
                        onChange={(e) => setNewPrice(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                        placeholder="Enter new price"
                        min="0"
                        step="0.01"
                      />
                    </div>
                    <button
                      onClick={() => handleSavePrice(product.id)}
                      disabled={updating}
                      className="bg-green-600 text-white p-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                      title="Save Price"
                    >
                      <Save className="w-4 h-4" />
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="bg-gray-500 text-white p-2 rounded-lg hover:bg-gray-600 transition-colors"
                      title="Cancel"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <>
                    <div>
                      <p className="text-2xl font-bold text-primary">₹{product.price_per_kg}</p>
                      <p className="text-sm text-gray-500">per kg</p>
                    </div>
                    <button
                      onClick={() => handleEditPrice(product)}
                      className="bg-primary text-white p-2 rounded-lg hover:bg-accent transition-colors"
                      title="Edit Price"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductPerformance;