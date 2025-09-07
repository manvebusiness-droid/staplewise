import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Filter, MapPin, Package, Truck, Star, ShoppingCart } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { ProductService } from '../lib/supabaseServices';
import FloatingPopup from '../components/common/FloatingPopup';
import OAuthLoginModal from '../components/common/OAuthLoginModal';

const Products: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    grade: '',
    location: '',
    priceRange: '',
    search: ''
  });
  const [showBuyForm, setShowBuyForm] = useState(false);
  const [showSellForm, setShowSellForm] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string>('');

  useEffect(() => {
    fetchProducts();
  }, [filters]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const productsData = await ProductService.getAllProducts(filters);
      setProducts(productsData);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const clearFilters = () => {
    setFilters({
      grade: '',
      location: '',
      priceRange: '',
      search: ''
    });
  };

  const handleBuyClick = (productId: string) => {
    if (!user) {
      setShowLoginModal(true);
      return;
    }
    setSelectedProductId(productId);
    setShowBuyForm(true);
  };

  const uniqueGrades = [...new Set(products.map(p => p.grade))].sort();
  const uniqueLocations = [...new Set(products.map(p => p.location))].sort();

  return (
    <div className="min-h-screen py-8 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-40 h-40 bg-primary/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-60 left-10 w-32 h-32 bg-accent/10 rounded-full blur-2xl animate-bounce"></div>
        <div className="absolute bottom-40 right-1/4 w-24 h-24 bg-secondary/40 rounded-full blur-xl animate-float"></div>
        <div className="absolute top-1/2 left-1/3 w-16 h-16 border border-primary/20 rounded-full animate-spin-slow"></div>
        <div className="absolute bottom-20 left-20 w-20 h-20 bg-accent/5 transform rotate-45 animate-pulse"></div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12 relative z-10">
          <h1 className="text-4xl md:text-6xl font-bold font-playfair text-primary mb-6 animate-fade-in-up relative">
            Premium Cashew Products
            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-gradient-to-r from-primary to-accent rounded-full animate-expand-width"></div>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto animate-fade-in-up delay-300">
            Discover our extensive collection of premium cashew kernels from verified suppliers across India
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-soft p-4 sm:p-6 mb-8 animate-slide-up">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold font-playfair text-primary flex items-center">
              <Filter className="w-5 h-5 mr-2" />
              Filter Products
            </h2>
            <button
              onClick={clearFilters}
              className="text-sm text-gray-600 hover:text-primary transition-colors"
            >
              Clear All
            </button>
          </div>
          
          {/* Desktop Filters */}
          <div className="hidden lg:grid lg:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  name="search"
                  value={filters.search}
                  onChange={handleFilterChange}
                  placeholder="Search products..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Grade</label>
              <select
                name="grade"
                value={filters.grade}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
              >
                <option value="">All Grades</option>
                {uniqueGrades.map(grade => (
                  <option key={grade} value={grade}>{grade}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
              <select
                name="location"
                value={filters.location}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
              >
                <option value="">All Locations</option>
                {uniqueLocations.map(location => (
                  <option key={location} value={location}>{location}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Price Range</label>
              <select
                name="priceRange"
                value={filters.priceRange}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
              >
                <option value="">All Prices</option>
                <option value="0-500">₹0 - ₹500</option>
                <option value="500-800">₹500 - ₹800</option>
                <option value="800-1000">₹800 - ₹1000</option>
                <option value="1000">₹1000+</option>
              </select>
            </div>

          </div>

          {/* Mobile/Tablet Filters Dropdown */}
          <div className="lg:hidden">
            <details className="group">
              <summary className="flex items-center justify-between w-full px-4 py-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                <span className="font-medium text-gray-700">Filter Options</span>
                <Filter className="w-5 h-5 text-gray-500 group-open:rotate-180 transition-transform duration-200" />
              </summary>
              
              <div className="mt-4 space-y-4 p-4 bg-gray-50 rounded-lg">
                {/* Search */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      name="search"
                      value={filters.search}
                      onChange={handleFilterChange}
                      placeholder="Search products..."
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                    />
                  </div>
                </div>

                {/* Grade */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Grade</label>
                  <select
                    name="grade"
                    value={filters.grade}
                    onChange={handleFilterChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                  >
                    <option value="">All Grades</option>
                    {uniqueGrades.map(grade => (
                      <option key={grade} value={grade}>{grade}</option>
                    ))}
                  </select>
                </div>

                {/* Location */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                  <select
                    name="location"
                    value={filters.location}
                    onChange={handleFilterChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                  >
                    <option value="">All Locations</option>
                    {uniqueLocations.map(location => (
                      <option key={location} value={location}>{location}</option>
                    ))}
                  </select>
                </div>

                {/* Price Range */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Price Range</label>
                  <select
                    name="priceRange"
                    value={filters.priceRange}
                    onChange={handleFilterChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                  >
                    <option value="">All Prices</option>
                    <option value="0-500">₹0 - ₹500</option>
                    <option value="500-800">₹500 - ₹800</option>
                    <option value="800-1000">₹800 - ₹1000</option>
                    <option value="1000">₹1000+</option>
                  </select>
                </div>

              </div>
            </details>
          </div>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Loading products...</p>
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map((product) => (
              <div key={product.id} className="bg-white rounded-2xl shadow-soft overflow-hidden hover:shadow-soft-lg transition-all duration-300 transform hover:-translate-y-2 group">
                <div className="relative overflow-hidden">
                  <img
                    src={product.image && !product.image.startsWith('blob:') ? product.image : 'https://images.pexels.com/photos/4198019/pexels-photo-4198019.jpeg?auto=compress&cs=tinysrgb&w=400'}
                    alt={product.name}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = 'https://images.pexels.com/photos/4198019/pexels-photo-4198019.jpeg?auto=compress&cs=tinysrgb&w=400';
                    }}
                  />
                  <div className="absolute top-4 left-4">
                    <span className="bg-primary text-white px-3 py-1 rounded-full text-sm font-medium">
                      {product.grade}
                    </span>
                  </div>
                  {product.sku && (
                    <div className="absolute top-4 right-4">
                      <span className="bg-white/90 text-primary px-2 py-1 rounded text-xs font-mono">
                        {product.sku}
                      </span>
                    </div>
                  )}
                </div>
                
                <div className="p-6">
                  <h3 className="text-xl font-bold font-playfair text-primary mb-2 group-hover:text-accent transition-colors">
                    {product.name}
                  </h3>
                  
                  <div className="flex items-center text-gray-600 mb-3">
                    <MapPin className="w-4 h-4 mr-1" />
                    <span className="text-sm">{product.location}</span>
                  </div>
                  
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {product.specifications}
                  </p>
                  
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-2xl font-bold text-primary">₹{product.price_per_kg}</p>
                      <p className="text-sm text-gray-500">per kg</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Min Order: {product.minimum_order_quantity} kg</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center text-gray-600 mb-4">
                    <Truck className="w-4 h-4 mr-1" />
                    <span className="text-sm">{product.delivery_time}</span>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Link
                      to={`/products/${product.id}`}
                      className="flex-1 bg-secondary text-primary px-4 py-2 rounded-lg text-center font-medium hover:bg-secondary/80 transition-colors"
                    >
                      View Details
                    </Link>
                    <button
                      onClick={() => handleBuyClick(product.id)}
                      className="flex-1 bg-primary text-white px-4 py-2 rounded-lg font-medium hover:bg-accent transition-colors flex items-center justify-center"
                    >
                      <ShoppingCart className="w-4 h-4 mr-1" />
                      Buy Now
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No Products Found</h3>
            <p className="text-gray-500">Try adjusting your filters to see more products</p>
          </div>
        )}

        {/* Call to Action */}
        <div className="text-center mt-12">
          <div className="bg-primary rounded-2xl p-8 text-white relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-secondary via-accent to-secondary"></div>
            <div className="absolute -top-4 -right-4 w-16 h-16 bg-secondary/20 rounded-full animate-pulse"></div>
            <div className="absolute -bottom-2 -left-2 w-12 h-12 bg-accent/20 rounded-full animate-bounce"></div>
            
            <h2 className="text-3xl font-bold font-playfair mb-4 relative z-10">
              Can't Find What You're Looking For?
            </h2>
            <p className="text-xl mb-6 text-gray-100 relative z-10">
              Submit a custom query and we'll help you find the perfect cashew products
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center relative z-10">
              <button
                onClick={() => {
                  if (!user) {
                    setShowLoginModal(true);
                  } else {
                    setShowBuyForm(true);
                  }
                }}
                className="bg-secondary text-primary px-8 py-3 rounded-xl font-semibold text-lg hover:bg-secondary/90 transition-colors"
              >
                Submit Buy Query
              </button>
              <button
                onClick={() => {
                  if (!user) {
                    setShowLoginModal(true);
                  } else {
                    setShowSellForm(true);
                  }
                }}
                className="border-2 border-secondary text-secondary px-8 py-3 rounded-xl font-semibold text-lg hover:bg-secondary hover:text-primary transition-colors"
              >
                Submit Sell Query
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Popups */}
      {showBuyForm && (
        <FloatingPopup
          type="buy"
          productId={selectedProductId}
          onClose={() => {
            setShowBuyForm(false);
            setSelectedProductId('');
          }}
        />
      )}
      {showSellForm && (
        <FloatingPopup
          type="sell"
          onClose={() => setShowSellForm(false)}
        />
      )}

      {/* OAuth Login Modal */}
      {showLoginModal && (
        <OAuthLoginModal
          onClose={() => setShowLoginModal(false)}
          onSuccess={() => {
            setShowLoginModal(false);
            setShowBuyForm(true);
          }}
          title="Sign in to Continue"
          subtitle="Please sign in to submit product queries"
        />
      )}
    </div>
  );
};

export default Products;