import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, MapPin, Package, Truck, ShoppingCart, Shield, Phone, Mail, MessageCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { ProductService } from '../lib/supabaseServices';
import { supabase } from '../lib/supabase';
import FloatingPopup from '../components/common/FloatingPopup';
import OAuthLoginModal from '../components/common/OAuthLoginModal';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showBuyForm, setShowBuyForm] = useState(false);
  const [showContactPopup, setShowContactPopup] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [priceHistory, setPriceHistory] = useState<any[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<'7days' | '30days' | '6months' | '1year'>('30days');
  const [loadingPriceHistory, setLoadingPriceHistory] = useState(false);

  useEffect(() => {
    if (id) {
      fetchProduct();
      fetchPriceHistory();
    }
  }, [id]);

  useEffect(() => {
    fetchPriceHistory();
  }, [selectedPeriod, product]);

  const fetchProduct = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      const productData = await ProductService.getProductById(id);
      setProduct(productData);
    } catch (error) {
      console.error('Error fetching product:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPriceHistory = async () => {
    if (!product) return;
    
    try {
      setLoadingPriceHistory(true);
      console.log('🔄 Fetching price history for product:', product.id, 'seller:', product.seller_id);
      
      const days = selectedPeriod === '7days' ? 7 : selectedPeriod === '30days' ? 30 : selectedPeriod === '6months' ? 180 : 365;
      
      // Try to get price history from Supabase
      if (supabase) {
        const { data: priceHistoryData, error } = await supabase
          .from('product_price_history')
          .select('*')
          .eq('product_id', product.id)
          .gte('changed_at', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString())
          .order('changed_at', { ascending: true });

        if (error) {
          console.error('Error fetching price history:', error);
          throw error;
        }

        if (priceHistoryData && priceHistoryData.length > 0) {
          console.log('✅ Found price history data:', priceHistoryData.length, 'entries');
          const formattedData = priceHistoryData.map((entry: any) => ({
            date: new Date(entry.changed_at).toLocaleDateString('en-US', { 
              month: 'short', 
              day: 'numeric',
              ...(days > 30 && { year: '2-digit' })
            }),
            price: parseFloat(entry.price_per_kg),
            fullDate: entry.changed_at.split('T')[0],
            reason: entry.change_reason
          }));
          setPriceHistory(formattedData);
        } else {
          console.log('ℹ️ No price history found, showing current price only');
          setPriceHistory([{
            date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            price: product.price_per_kg,
            fullDate: new Date().toISOString().split('T')[0],
            reason: 'Current price'
          }]);
        }
      } else {
        console.log('⚠️ Supabase not configured, showing current price only');
        setPriceHistory([{
          date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          price: product.price_per_kg,
          fullDate: new Date().toISOString().split('T')[0],
          reason: 'Current price'
        }]);
      }
    } catch (error) {
      console.error('Error fetching price history:', error);
      console.log('🔄 Falling back to current price only');
      setPriceHistory([{
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        price: product?.price_per_kg || 0,
        fullDate: new Date().toISOString().split('T')[0],
        reason: 'Current price'
      }]);
    } finally {
      setLoadingPriceHistory(false);
    }
  };

  const handleBuyClick = () => {
    if (!user) {
      setShowLoginModal(true);
      return;
    }
    setShowBuyForm(true);
  };

  const handleContactSeller = () => {
    setShowContactPopup(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading product details...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-600 mb-2">Product Not Found</h2>
          <p className="text-gray-500 mb-6">The product you're looking for doesn't exist or has been removed.</p>
          <Link
            to="/products"
            className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-accent transition-colors inline-flex items-center"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <div className="mb-6 sm:mb-8">
          <Link
            to="/products"
            className="inline-flex items-center text-primary hover:text-accent transition-colors text-sm sm:text-base"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Products
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Product Image */}
          <div>
            <div className="bg-white rounded-2xl shadow-soft overflow-hidden">
              <img
                src={product.image && !product.image.startsWith('blob:') ? product.image : 'https://images.pexels.com/photos/4198019/pexels-photo-4198019.jpeg?auto=compress&cs=tinysrgb&w=400'}
                alt={product.name}
                className="w-full h-64 sm:h-80 lg:h-96 object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = 'https://images.pexels.com/photos/4198019/pexels-photo-4198019.jpeg?auto=compress&cs=tinysrgb&w=400';
                }}
              />
            </div>
          </div>

          {/* Product Information */}
          <div className="space-y-6">
            {/* Product Header */}
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold font-playfair text-primary mb-3">
                {product.name}
              </h1>
              
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <span className="bg-accent/10 text-accent px-3 py-1 rounded-full text-sm font-medium">
                  {product.grade}
                </span>
                {product.sku && (
                  <span className="bg-primary/10 text-primary px-3 py-1 rounded text-sm font-mono">
                    SKU: {product.sku}
                  </span>
                )}
              </div>
              
              <div className="flex items-center text-gray-600 mb-3">
                <MapPin className="w-4 h-4 mr-2" />
                <span>{product.location}</span>
              </div>
              
              <div className="flex items-center text-gray-600 mb-6">
                <Truck className="w-4 h-4 mr-2" />
                <span>{product.delivery_time}</span>
              </div>
            </div>

            {/* Pricing Information */}
            <div className="bg-secondary/30 rounded-xl p-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-3xl font-bold text-primary">₹{product.price_per_kg}</p>
                  <p className="text-gray-600">per kg (excl GST)</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Min Order</p>
                  <p className="text-xl font-semibold text-gray-900">{product.minimum_order_quantity} kg</p>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-600">Seller</p>
                <p className="text-lg font-semibold text-gray-900">{product.users?.company_name || product.users?.name}</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                onClick={handleBuyClick}
                className="bg-primary text-white py-3 px-6 rounded-xl font-semibold text-lg hover:bg-accent transition-colors flex items-center justify-center"
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                Enquire Now
              </button>
              <button
                onClick={handleContactSeller}
                className="bg-secondary text-primary py-3 px-6 rounded-xl font-semibold text-lg hover:bg-secondary/80 transition-colors flex items-center justify-center"
              >
                <MessageCircle className="w-5 h-5 mr-2" />
                Contact Seller
              </button>
            </div>
          </div>
        </div>

        {/* Product Specifications */}
        <div className="mt-12 bg-white rounded-2xl shadow-soft p-8">
          <h3 className="text-2xl font-bold font-playfair text-primary mb-6">Product Specifications</h3>
          <p className="text-gray-700 leading-relaxed text-lg">{product.specifications}</p>
        </div>

        {/* Grade Description */}
        {product.grade_description && (
          <div className="mt-8 bg-white rounded-2xl shadow-soft p-8">
            <h3 className="text-2xl font-bold font-playfair text-primary mb-6">Grade Description</h3>
            <p className="text-gray-700 leading-relaxed text-lg">{product.grade_description}</p>
          </div>
        )}

        {/* Quality Assurance & Packaging Delivery */}
        {((product.quality_assurance && product.quality_assurance.length > 0) || 
          (product.packaging_delivery && product.packaging_delivery.length > 0)) && (
          <div className="mt-8 bg-white rounded-2xl shadow-soft p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Quality Assurance */}
              {product.quality_assurance && product.quality_assurance.length > 0 && (
                <div>
                  <h3 className="text-xl font-bold font-playfair text-primary mb-4">Quality Assurance</h3>
                  <ul className="space-y-3">
                    {product.quality_assurance.map((point: string, index: number) => (
                      <li key={index} className="flex items-start space-x-3">
                        <Shield className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Packaging & Delivery */}
              {product.packaging_delivery && product.packaging_delivery.length > 0 && (
                <div>
                  <h3 className="text-xl font-bold font-playfair text-primary mb-4">Packaging & Delivery</h3>
                  <ul className="space-y-3">
                    {product.packaging_delivery.map((point: string, index: number) => (
                      <li key={index} className="flex items-start space-x-3">
                        <Package className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Price History Chart */}
        <div className="mt-12 bg-white rounded-2xl shadow-soft p-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
            <div>
              <h3 className="text-2xl font-bold font-playfair text-primary mb-2">Price History</h3>
              <p className="text-gray-600">Track price trends over time</p>
            </div>
            
            <div className="flex items-center space-x-2 mt-4 sm:mt-0">
              {(['7days', '30days', '6months', '1year'] as const).map((period) => (
                <button
                  key={period}
                  onClick={() => setSelectedPeriod(period)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    selectedPeriod === period
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {period === '7days' ? '7D' : period === '30days' ? '30D' : period === '6months' ? '6M' : '1Y'}
                </button>
              ))}
            </div>
          </div>

          {/* Price Chart */}
          <div className="h-64 sm:h-80 relative">
            {loadingPriceHistory && (
              <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                  <p className="text-sm text-gray-600">Loading price history...</p>
                </div>
              </div>
            )}
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={priceHistory}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="date" 
                  stroke="#6b7280"
                  fontSize={12}
                  tickLine={false}
                />
                <YAxis 
                  stroke="#6b7280"
                  fontSize={12}
                  tickLine={false}
                  tickFormatter={(value) => '₹' + value}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                  formatter={(value: any, name: any, props: any) => {
                    const reason = props.payload?.reason || 'Price update';
                    return ['₹' + value, `Price per KG (${reason})`];
                  }}
                  labelFormatter={(label) => `Date: ${label}`}
                />
                <Line 
                  type="monotone" 
                  dataKey="price"
                  stroke="#1C4A29"
                  strokeWidth={2}
                  dot={{ fill: '#1C4A29', strokeWidth: 2, r: 3 }}
                  activeDot={{ r: 5, stroke: '#1C4A29', strokeWidth: 2, fill: '#F9F4E8' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Price Statistics */}
          <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg text-center">
              <p className="text-sm text-blue-600">Current Price</p>
              <p className="text-xl font-bold text-blue-800">₹{product.price_per_kg}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg text-center">
              <p className="text-sm text-green-600">Avg Price</p>
              <p className="text-xl font-bold text-green-800">
                ₹{priceHistory.length > 0 ? Math.round(priceHistory.reduce((sum, item) => sum + item.price, 0) / priceHistory.length) : product.price_per_kg}
              </p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg text-center">
              <p className="text-sm text-purple-600">Highest</p>
              <p className="text-xl font-bold text-purple-800">
                ₹{priceHistory.length > 0 ? Math.max(...priceHistory.map(item => item.price)) : product.price_per_kg}
              </p>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg text-center">
              <p className="text-sm text-orange-600">Lowest</p>
              <p className="text-xl font-bold text-orange-800">
                ₹{priceHistory.length > 0 ? Math.min(...priceHistory.map(item => item.price)) : product.price_per_kg}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Seller Popup */}
      {showContactPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold font-playfair text-primary">Contact Us</h3>
                <button
                  onClick={() => setShowContactPopup(false)}
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                >
                  ×
                </button>
              </div>

              <div className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3">Contact Information</h4>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <Mail className="w-4 h-4 mr-2 text-gray-400" />
                      <a href="mailto:zeeshan.staplewise@gmail.com" className="text-gray-700 hover:text-primary">zeeshan.staplewise@gmail.com</a>
                    </div>
                    <div className="flex items-center">
                      <Phone className="w-4 h-4 mr-2 text-gray-400" />
                      <a href="tel:+917996191159" className="text-gray-700 hover:text-primary">+91 79961 91159</a>
                      <span className="text-gray-500 ml-2">- Zeeshan</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <a
                    href={`https://wa.me/917996191159`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center justify-center"
                  >
                    <MessageCircle className="w-5 h-5 mr-2" />
                    WhatsApp
                  </a>
                  
                  <a
                    href={`mailto:zeeshan.staplewise@gmail.com`}
                    className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center"
                  >
                    <Mail className="w-5 h-5 mr-2" />
                    Email Zeeshan
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Floating Popups */}
      {showBuyForm && (
        <FloatingPopup
          type="buy"
          productId={id}
          onClose={() => setShowBuyForm(false)}
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
          subtitle="Please sign in to place a buy order"
        />
      )}
    </div>
  );
};

export default ProductDetail;