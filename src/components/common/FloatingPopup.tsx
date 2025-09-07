import React, { useState, useEffect } from 'react';
import { X, MessageCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { QueryService, ProductService } from '../../lib/supabaseServices';

interface FloatingPopupProps {
  type: 'buy' | 'sell';
  productId?: string;
  onClose: () => void;
}

const FloatingPopup: React.FC<FloatingPopupProps> = ({ type, productId, onClose }) => {
  const { user } = useAuth();
  const [products, setProducts] = useState<any[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [formData, setFormData] = useState({
    selectedProductId: productId || '',
    quantity: '',
    companyName: '',
    pincode: '',
    email: '',
    phone: '+91',
    gst: ''
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoadingProducts(true);
        const productsData = await ProductService.getAllProducts();
        setProducts(productsData);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoadingProducts(false);
      }
    };

    fetchProducts();
  }, []);

  // Set productId if provided
  useEffect(() => {
    if (productId) {
      setFormData(prev => ({
        ...prev,
        selectedProductId: productId
      }));
    }
  }, [productId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if user is logged in
    if (!user) {
      alert('Please login to submit a query. Click the Login button in the header.');
      onClose();
      return;
    }
    
    try {
      setSubmitting(true);
      
      // Get selected product details
      const selectedProduct = products.find(p => p.id === formData.selectedProductId);
      
      const queryData = {
        type: type.toUpperCase() as 'BUY' | 'SELL',
        product_id: formData.selectedProductId || null,
        product_sku: selectedProduct?.sku || null,
        product_category: selectedProduct?.category || null,
        quantity: parseInt(formData.quantity),
        company_name: formData.companyName,
        pincode: formData.pincode,
        email: formData.email,
        phone: formData.phone,
        gst: formData.gst || null,
      };

      await QueryService.createQuery(queryData);
      alert(`${type.charAt(0).toUpperCase() + type.slice(1)} query submitted successfully!`);
      onClose();
    } catch (error) {
      console.error('Error submitting query:', error);
      alert('Failed to submit query. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  // Get selected product for auto-filling SKU and category
  const selectedProduct = products.find(p => p.id === formData.selectedProductId);

  return (
    <div className="fixed bottom-4 right-4 z-50 w-80 max-w-[calc(100vw-2rem)] sm:w-80 sm:max-w-none">
      {/* Mobile backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-50 z-40 sm:hidden" onClick={onClose}></div>
      
      <div className="bg-white rounded-xl shadow-2xl border border-accent/20">
        {/* Header */}
        <div className="bg-gradient-to-r from-accent to-primary text-white p-3 sm:p-4 rounded-t-xl flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5" />
            <h3 className="font-semibold text-sm sm:text-base">
              {type === 'buy' ? 'Buy Cashews' : 'Sell Cashews'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-secondary transition-colors"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-3 sm:p-4 space-y-3 max-h-[70vh] sm:max-h-96 overflow-y-auto">
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
              Select Product *
            </label>
            <select
              name="selectedProductId"
              value={formData.selectedProductId}
              onChange={handleInputChange}
              required
              disabled={loadingProducts}
              className="w-full px-2 py-2 sm:py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-accent focus:border-accent"
            >
              <option value="">
                {loadingProducts ? 'Loading products...' : 'Choose a product...'}
              </option>
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name} - {product.grade} (₹{product.price_per_kg}/kg)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
              Product SKU (Auto-filled)
            </label>
            <input
              type="text"
              value={selectedProduct?.sku || ''}
              readOnly
              className="w-full px-2 py-2 sm:py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-accent focus:border-accent bg-gray-50 font-mono"
              placeholder="Select product to see SKU"
            />
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
              Product Category (Auto-filled)
            </label>
            <input
              type="text"
              value={selectedProduct?.category || ''}
              readOnly
              className="w-full px-2 py-2 sm:py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-accent focus:border-accent bg-gray-50 capitalize"
              placeholder="Select product to see category"
            />
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
              Quantity (kg) *
            </label>
            <input
              type="number"
              name="quantity"
              value={formData.quantity}
              onChange={handleInputChange}
              required
              min="1"
              className="w-full px-2 py-2 sm:py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-accent focus:border-accent"
            />
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
              Company Name *
            </label>
            <input
              type="text"
              name="companyName"
              value={formData.companyName}
              onChange={handleInputChange}
              required
              className="w-full px-2 py-2 sm:py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-accent focus:border-accent"
            />
          </div>

          {type === 'sell' && (
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                Company GST *
              </label>
              <input
                type="text"
                name="gst"
                value={formData.gst}
                onChange={handleInputChange}
                required
                className="w-full px-2 py-2 sm:py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-accent focus:border-accent"
              />
            </div>
          )}

          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
              Pincode *
            </label>
            <input
              type="text"
              name="pincode"
              value={formData.pincode}
              onChange={handleInputChange}
              required
              className="w-full px-2 py-2 sm:py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-accent focus:border-accent"
            />
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
              Email *
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              className="w-full px-2 py-2 sm:py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-accent focus:border-accent"
            />
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
              Mobile Number *
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              required
              className="w-full px-2 py-2 sm:py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-accent focus:border-accent"
            />
          </div>

          <button
            type="submit"
            disabled={submitting || !formData.selectedProductId}
            className="w-full bg-gradient-to-r from-accent to-primary text-white py-3 sm:py-2 px-4 rounded text-sm font-medium hover:from-accent/90 hover:to-primary/90 transition-all duration-300 transform hover:scale-[1.02] mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? 'Submitting...' : `Submit ${type === 'buy' ? 'Buy' : 'Sell'} Request`}
          </button>
        </form>
      </div>
    </div>
  );
};

export default FloatingPopup;