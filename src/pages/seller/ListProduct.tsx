import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Package, Eye, X, Save, Upload, TrendingUp, Star, MapPin, Shield } from 'lucide-react';
import { ProductService } from '../../lib/supabaseServices';
import { useAuth } from '../../contexts/AuthContext';
import ImageUpload from '../../components/common/ImageUpload';
import ProductPriceChart from '../../components/seller/ProductPriceChart';
import { cashewGrades } from '../../data/mockData';

const ListProduct: React.FC = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [showProductDetails, setShowProductDetails] = useState(false);
  const [saving, setSaving] = useState(false);
  const [productForm, setProductForm] = useState({
    name: '',
    category: 'cashews',
    grade: '',
    grade_description: '',
    quality_assurance: ['', '', '', '', ''],
    packaging_delivery: ['', '', '', '', ''],
    price_per_kg: '',
    minimum_order_quantity: '',
    location: '',
    image: '',
    specifications: '',
    delivery_time: ''
  });

  // Comprehensive grade options
  const categoryGrades = {
    cashews: ['W180', 'W210', 'W240', 'W320', 'W400', 'A180', 'A210', 'A240', 'A320', 'A400', 'JK0', 'K00', 'LWP', 'S00 (JH)', 'SK0', 'SSW(WW320)', 'SSW1(W300)', 'SWP', 'BB0', 'BB1', 'BB2', 'DP0', 'DP1', 'DP2'],
    cloves: ['Whole Cloves', 'Ground Cloves', 'Clove Buds', 'Premium Grade', 'Standard Grade', 'Commercial Grade'],
    chillies: ['Kashmiri Red', 'Guntur Red', 'Byadgi Red', 'Teja Red', 'Green Chilli', 'Dried Red', 'Powder Grade', 'Whole Dried'],
    'star-anise': ['Whole Star', 'Broken Star', 'Ground Star', 'Premium Grade', 'Standard Grade', 'Commercial Grade'],
    pepper: ['Black Pepper Whole', 'White Pepper Whole', 'Black Pepper Powder', 'White Pepper Powder', 'Green Pepper', 'Pink Pepper'],
    cinnamon: ['Ceylon Cinnamon', 'Cassia Cinnamon', 'Cinnamon Sticks', 'Cinnamon Powder', 'Broken Cinnamon', 'Quillings']
  };

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      setSaving(true);
      
      // Filter out empty quality assurance and packaging delivery points
      const filteredQualityAssurance = productForm.quality_assurance.filter(point => point.trim() !== '');
      const filteredPackagingDelivery = productForm.packaging_delivery.filter(point => point.trim() !== '');
      
      const productData = {
        seller_id: user.id,
        name: productForm.name,
        category: productForm.category,
        grade: productForm.grade,
        grade_description: productForm.grade_description,
        quality_assurance: filteredQualityAssurance,
        packaging_delivery: filteredPackagingDelivery,
        price_per_kg: parseFloat(productForm.price_per_kg),
        minimum_order_quantity: parseInt(productForm.minimum_order_quantity),
        location: productForm.location,
        image: productForm.image,
        specifications: productForm.specifications,
        delivery_time: productForm.delivery_time
      };

      if (editingProduct) {
        await ProductService.updateProduct(editingProduct.id, productData);
        alert('Product updated successfully!');
      } else {
        await ProductService.createProduct(productData);
        alert('Product added successfully!');
      }

      await fetchProducts();
      resetForm();
    } catch (error) {
      console.error('Error saving product:', error);
      alert('Failed to save product. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setProductForm({
      name: '',
      category: 'cashews',
      grade: '',
      grade_description: '',
      quality_assurance: ['', '', '', '', ''],
      packaging_delivery: ['', '', '', '', ''],
      price_per_kg: '',
      minimum_order_quantity: '',
      location: '',
      image: '',
      specifications: '',
      delivery_time: ''
    });
    setShowAddForm(false);
    setEditingProduct(null);
  };

  const handleEdit = (product: any) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name || '',
      category: product.category || 'cashews',
      grade: product.grade || '',
      grade_description: product.grade_description || '',
      quality_assurance: [
        ...(product.quality_assurance || []),
        ...Array(5 - (product.quality_assurance?.length || 0)).fill('')
      ].slice(0, 5),
      packaging_delivery: [
        ...(product.packaging_delivery || []),
        ...Array(5 - (product.packaging_delivery?.length || 0)).fill('')
      ].slice(0, 5),
      price_per_kg: product.price_per_kg?.toString() || '',
      minimum_order_quantity: product.minimum_order_quantity?.toString() || '',
      location: product.location || '',
      image: product.image || '',
      specifications: product.specifications || '',
      delivery_time: product.delivery_time || ''
    });
    setShowAddForm(true);
  };

  const handleDelete = async (productId: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await ProductService.deleteProduct(productId);
        await fetchProducts();
        alert('Product deleted successfully!');
      } catch (error) {
        console.error('Error deleting product:', error);
        alert('Failed to delete product. Please try again.');
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProductForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleArrayInputChange = (arrayName: 'quality_assurance' | 'packaging_delivery', index: number, value: string) => {
    setProductForm(prev => ({
      ...prev,
      [arrayName]: prev[arrayName].map((item, i) => i === index ? value : item)
    }));
  };

  const handleImageUpload = (imageUrls: string[]) => {
    if (imageUrls.length > 0) {
      // Ensure we're using actual uploaded URLs, not blob URLs
      const validImageUrl = imageUrls[0];
      if (validImageUrl && !validImageUrl.startsWith('blob:')) {
      setProductForm(prev => ({
        ...prev,
          image: validImageUrl // Use first image as primary
      }));
      }
    }
  };

  const handleImageDelete = (imageUrl: string) => {
    setProductForm(prev => ({
      ...prev,
      image: prev.image === imageUrl ? '' : prev.image
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold font-playfair text-primary">My Products</h1>
          <p className="text-gray-600 mt-2">Manage your product listings and inventory</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-primary text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg hover:bg-accent transition-colors flex items-center justify-center text-sm sm:text-base font-medium whitespace-nowrap"
          >
            <Plus className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Add Product</span>
            <span className="sm:hidden">Add</span>
          </button>
        </div>
      </div>

      {/* Add/Edit Product Form */}
      {showAddForm && (
        <div className="bg-white rounded-2xl shadow-soft p-6 sm:p-8 mb-8">
          <h2 className="text-2xl font-bold font-playfair text-primary mb-6">
            {editingProduct ? 'Edit Product' : 'Add New Product'}
          </h2>

          {/* Platform Fee Notice */}
          <div className="mb-6 rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-yellow-800">
            <p className="text-sm sm:text-base">
              <span className="font-semibold">Notice:</span> Kindly include a 2% platform fee in your listing price. This helps us negotiate better deals with buyers and support smooth transactions for you.
            </p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={productForm.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                  placeholder="e.g., Premium W320 Cashew Kernels"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                <select
                  name="category"
                  value={productForm.category}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                >
                  <option value="cashews">Cashews</option>
                  <option value="cloves">Cloves</option>
                  <option value="chillies">Chillies</option>
                  <option value="star-anise">Star Anise</option>
                  <option value="pepper">Pepper</option>
                  <option value="cinnamon">Cinnamon</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Grade *
                </label>
                <select
                  name="grade"
                  value={productForm.grade}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                >
                  <option value="">Select Grade</option>
                  {categoryGrades[productForm.category as keyof typeof categoryGrades]?.map((grade: string) => (
                    <option key={grade} value={grade}>{grade}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location *
                </label>
                <input
                  type="text"
                  name="location"
                  value={productForm.location}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                  placeholder="e.g., Mangalore, Karnataka"
                />
              </div>
            </div>

            {/* Grade Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Grade Description *
              </label>
              <textarea
                name="grade_description"
                value={productForm.grade_description}
                onChange={handleInputChange}
                required
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                placeholder="Detailed description about the grade specifications, quality, and characteristics..."
              />
            </div>

            {/* Quality Assurance Points */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quality Assurance Points (Up to 5)
              </label>
              <div className="space-y-2">
                {productForm.quality_assurance.map((point, index) => (
                  <input
                    key={index}
                    type="text"
                    value={point}
                    onChange={(e) => handleArrayInputChange('quality_assurance', index, e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                    placeholder={`Quality assurance point ${index + 1}`}
                  />
                ))}
              </div>
            </div>

            {/* Packaging & Delivery Points */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Packaging & Delivery Points (Up to 5)
              </label>
              <div className="space-y-2">
                {productForm.packaging_delivery.map((point, index) => (
                  <input
                    key={index}
                    type="text"
                    value={point}
                    onChange={(e) => handleArrayInputChange('packaging_delivery', index, e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                    placeholder={`Packaging & delivery point ${index + 1}`}
                  />
                ))}
              </div>
            </div>

            {/* Pricing and Inventory */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price per KG (₹) *
                </label>
                <input
                  type="number"
                  name="price_per_kg"
                  value={productForm.price_per_kg}
                  onChange={handleInputChange}
                  required
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                  placeholder="e.g., 850"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Minimum Order (kg) *
                </label>
                <input
                  type="number"
                  name="minimum_order_quantity"
                  value={productForm.minimum_order_quantity}
                  onChange={handleInputChange}
                  required
                  min="1"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                  placeholder="e.g., 100"
                />
              </div>
            </div>

            {/* Specifications and Delivery */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Specifications *
                </label>
                <textarea
                  name="specifications"
                  value={productForm.specifications}
                  onChange={handleInputChange}
                  required
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                  placeholder="Brief product specifications..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Delivery Time *
                </label>
                <input
                  type="text"
                  name="delivery_time"
                  value={productForm.delivery_time}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                  placeholder="e.g., 3-5 business days"
                />
              </div>
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product Images *
              </label>
              <ImageUpload
                onUpload={handleImageUpload}
                onDelete={handleImageDelete}
                maxImages={1}
                existingImages={[productForm.image].filter(Boolean)}
                userId={user.id}
                disabled={saving}
              />
            </div>

            {/* Form Actions */}
            <div className="flex justify-end space-x-4 pt-6 border-t">
              <button
                type="button"
                onClick={resetForm}
                className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving || !productForm.image}
                className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-accent transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="w-4 h-4 mr-2" />
                {saving ? 'Saving...' : (editingProduct ? 'Update Product' : 'Add Product')}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Products List */}
      <div className="bg-white rounded-2xl shadow-soft overflow-hidden mb-8">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg sm:text-xl font-bold font-playfair text-primary">Your Products ({products.length})</h2>
        </div>
        
        {/* Desktop Table View */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SKU</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Grade</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <img
                        src={product.image && !product.image.startsWith('blob:') ? product.image : 'https://images.pexels.com/photos/4198019/pexels-photo-4198019.jpeg?auto=compress&cs=tinysrgb&w=400'}
                        alt={product.name}
                        className="w-12 h-12 rounded-lg object-cover mr-4"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = 'https://images.pexels.com/photos/4198019/pexels-photo-4198019.jpeg?auto=compress&cs=tinysrgb&w=400';
                        }}
                      />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{product.name}</p>
                        <p className="text-sm text-gray-500">{product.category}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="bg-primary/10 text-primary px-2 py-1 rounded text-xs font-mono">
                      {product.sku || 'Generating...'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="bg-accent/10 text-accent px-2 py-1 rounded-full text-xs font-medium">
                      {product.grade}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <p className="text-sm font-medium text-gray-900">₹{product.price_per_kg}</p>
                    <p className="text-sm text-gray-500">per kg</p>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <p className="text-sm text-gray-900">{product.location}</p>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          setSelectedProduct(product);
                          setShowProductDetails(true);
                        }}
                        className="text-blue-600 hover:text-blue-800 p-1 border border-blue-300 rounded hover:bg-blue-50 transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleEdit(product)}
                        className="text-green-600 hover:text-green-800 p-1 border border-green-300 rounded hover:bg-green-50 transition-colors"
                        title="Edit Product"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="text-red-600 hover:text-red-800 p-1 border border-red-300 rounded hover:bg-red-50 transition-colors"
                        title="Delete Product"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile/Tablet Card View */}
        <div className="lg:hidden">
          <div className="divide-y divide-gray-200">
            {products.map((product) => (
              <div key={product.id} className="p-4 sm:p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start space-x-4">
                  {/* Product Image */}
                  <div className="flex-shrink-0">
                    <img
                      src={product.image && !product.image.startsWith('blob:') ? product.image : 'https://images.pexels.com/photos/4198019/pexels-photo-4198019.jpeg?auto=compress&cs=tinysrgb&w=400'}
                      alt={product.name}
                      className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = 'https://images.pexels.com/photos/4198019/pexels-photo-4198019.jpeg?auto=compress&cs=tinysrgb&w=400';
                      }}
                    />
                  </div>
                  
                  {/* Product Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm sm:text-base font-medium text-gray-900 truncate">
                          {product.name}
                        </h3>
                        <p className="text-xs sm:text-sm text-gray-500 capitalize">
                          {product.category}
                        </p>
                      </div>
                      
                      {/* Action Buttons */}
                      <div className="flex space-x-1 ml-4">
                        <button
                          onClick={() => {
                            setSelectedProduct(product);
                            setShowProductDetails(true);
                          }}
                          className="text-blue-600 hover:text-blue-800 p-2 border border-blue-300 rounded-lg hover:bg-blue-50 transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEdit(product)}
                          className="text-green-600 hover:text-green-800 p-2 border border-green-300 rounded-lg hover:bg-green-50 transition-colors"
                          title="Edit Product"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="text-red-600 hover:text-red-800 p-2 border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
                          title="Delete Product"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    
                    {/* Product Details Grid */}
                    <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                      <div>
                        <p className="text-xs text-gray-500">SKU</p>
                        <span className="bg-primary/10 text-primary px-2 py-1 rounded text-xs font-mono">
                          {product.sku || 'Generating...'}
                        </span>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Grade</p>
                        <span className="bg-accent/10 text-accent px-2 py-1 rounded-full text-xs font-medium">
                          {product.grade}
                        </span>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Price</p>
                        <div>
                          <p className="text-sm font-medium text-gray-900">₹{product.price_per_kg}</p>
                          <p className="text-xs text-gray-500">per kg</p>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Location</p>
                        <p className="text-sm text-gray-900 truncate">{product.location}</p>
                      </div>
                    </div>
                    
                    {/* Additional Info on Mobile */}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {products.length === 0 && (
          <div className="text-center py-8 sm:py-12 px-4">
            <Package className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-lg sm:text-xl text-gray-500 mb-2">No products listed yet</p>
            <p className="text-sm sm:text-base text-gray-400 mb-6">Add your first product to start selling</p>
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-primary text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg hover:bg-accent transition-colors inline-flex items-center text-sm sm:text-base"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Product
            </button>
          </div>
        )}
      </div>

      {/* Product Statistics Dashboard */}
      {products.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-soft p-6">
            <div className="flex items-center">
              <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
                <Package className="w-6 h-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Total Products</p>
                <p className="text-2xl font-bold text-gray-900">{products.length}</p>
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
                <p className="text-2xl font-bold text-gray-900">
                  ₹{Math.round(products.reduce((sum, p) => sum + p.price_per_kg, 0) / products.length)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-soft p-6">
            <div className="flex items-center">
              <div className="p-2 rounded-lg bg-orange-100 text-orange-600">
                <MapPin className="w-6 h-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Categories</p>
                <p className="text-2xl font-bold text-gray-900">
                  {new Set(products.map(p => p.category)).size}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Product Details Modal */}
      {showProductDetails && selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold font-playfair text-primary">Product Details</h2>
                <button
                  onClick={() => setShowProductDetails(false)}
                  className="text-gray-500 hover:text-gray-700 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <img
                    src={selectedProduct.image && !selectedProduct.image.startsWith('blob:') ? selectedProduct.image : 'https://images.pexels.com/photos/4198019/pexels-photo-4198019.jpeg?auto=compress&cs=tinysrgb&w=400'}
                    alt={selectedProduct.name}
                    className="w-full h-64 object-cover rounded-lg"
                  />
                </div>
                
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
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Price per KG</p>
                      <p className="text-2xl font-bold text-primary">₹{selectedProduct.price_per_kg}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Stock</p>
                      <p className="text-xl font-bold text-gray-900">{selectedProduct.stock} kg</p>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-600">Minimum Order</p>
                    <p className="text-lg font-semibold text-gray-900">{selectedProduct.minimum_order_quantity} kg</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-600">Location</p>
                    <p className="text-lg text-gray-900">{selectedProduct.location}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-600">Delivery Time</p>
                    <p className="text-lg text-gray-900">{selectedProduct.delivery_time}</p>
                  </div>
                </div>
              </div>

              {/* Grade Description */}
              {selectedProduct.grade_description && (
                <div className="mt-6">
                  <h4 className="text-lg font-semibold text-primary mb-2">Grade Description</h4>
                  <p className="text-gray-700 leading-relaxed">{selectedProduct.grade_description}</p>
                </div>
              )}

              {/* Quality Assurance */}
              {selectedProduct.quality_assurance && selectedProduct.quality_assurance.length > 0 && (
                <div className="mt-6">
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
                <div className="mt-6">
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

              {/* Product Specifications */}
              <div className="mt-6">
                <h4 className="text-lg font-semibold text-primary mb-3">Product Specifications</h4>
                <p className="text-gray-700 leading-relaxed">{selectedProduct.specifications}</p>
              </div>

              {/* Product Performance Metrics */}
              <div className="mt-6">
                <h4 className="text-lg font-semibold text-primary mb-4">Product Metrics</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg text-center">
                    <p className="text-sm text-blue-600">Current Price</p>
                    <p className="text-xl font-bold text-blue-800">₹{selectedProduct.price_per_kg}</p>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg text-center">
                    <p className="text-sm text-purple-600">Min Order</p>
                    <p className="text-xl font-bold text-purple-800">{selectedProduct.minimum_order_quantity} kg</p>
                  </div>
                  <div className="bg-orange-50 p-4 rounded-lg text-center">
                    <p className="text-sm text-orange-600">Category</p>
                    <p className="text-lg font-bold text-orange-800 capitalize">{selectedProduct.category}</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-8 pt-6 border-t flex flex-col sm:flex-row gap-3 sm:gap-4">
                <button
                  onClick={() => handleEdit(selectedProduct)}
                  className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-accent transition-colors flex items-center justify-center"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Product
                </button>
                <button
                  onClick={() => {
                    setShowProductDetails(false);
                    handleDelete(selectedProduct.id);
                  }}
                  className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Product
                </button>
                <button
                  onClick={() => setShowProductDetails(false)}
                  className="bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition-colors"
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

export default ListProduct;
