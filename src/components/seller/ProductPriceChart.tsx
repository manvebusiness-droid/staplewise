import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, Calendar, BarChart3 } from 'lucide-react';
import { ProductService } from '../../lib/supabaseServices';

interface ProductPriceChartProps {
  products: any[];
  sellerId: string;
}

const ProductPriceChart: React.FC<ProductPriceChartProps> = ({ products, sellerId }) => {
  const [priceHistoryData, setPriceHistoryData] = useState<any[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<'7days' | '30days' | '6months' | '1year'>('30days');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadRealPriceHistoryData();
  }, [products, selectedPeriod, sellerId]);

  const loadRealPriceHistoryData = async () => {
    if (products.length === 0) return;

    setLoading(true);

    try {
      // Get real price history from database
      let days = 30;
      
      switch (selectedPeriod) {
        case '7days':
          days = 7;
          break;
        case '30days':
          days = 30;
          break;
        case '6months':
          days = 180;
          break;
        case '1year':
          days = 365;
          break;
      }

      // Get price history for all products
      const priceHistoryMap = await ProductService.getAllProductsPriceHistory(sellerId, days);
      
      // If no real data exists, show current prices only
      if (Object.keys(priceHistoryMap).length === 0 || 
          Object.values(priceHistoryMap).every(history => history.length === 0)) {
        
        // Show current prices as single data point
        const currentData = [{
          date: formatDateForChart(new Date(), selectedPeriod),
          fullDate: new Date().toISOString().split('T')[0]
        }];
        
        products.forEach((product) => {
          currentData[0][`${product.grade}_price`] = product.price_per_kg;
        });
        
        setPriceHistoryData(currentData);
        setLoading(false);
        return;
      }
      
      // Process real price history data
      const dateMap = new Map();
      
      // Collect all unique dates from all products
      Object.values(priceHistoryMap).forEach((history: any[]) => {
        history.forEach((entry) => {
          const dateKey = entry.date;
          if (!dateMap.has(dateKey)) {
            dateMap.set(dateKey, {
              date: formatDateForChart(new Date(dateKey), selectedPeriod),
              fullDate: dateKey
            });
          }
        });
      });
      
      // Fill in price data for each product
      products.forEach((product) => {
        const productHistory = priceHistoryMap[product.id] || [];
        
        dateMap.forEach((dataPoint, dateKey) => {
          // Find price for this date
          const priceEntry = productHistory.find(entry => entry.date === dateKey);
          if (priceEntry) {
            dataPoint[`${product.grade}_price`] = priceEntry.price;
          } else {
            // Use current price if no historical data for this date
            dataPoint[`${product.grade}_price`] = product.price_per_kg;
          }
        });
      });
      
      // Convert map to array and sort by date
      const sortedData = Array.from(dateMap.values()).sort((a, b) => 
        new Date(a.fullDate).getTime() - new Date(b.fullDate).getTime()
      );
      
      setPriceHistoryData(sortedData);
    } catch (error) {
      console.error('Error loading real price history:', error);
      
      // Fallback: show current prices only
      const fallbackData = [{
        date: formatDateForChart(new Date(), selectedPeriod),
        fullDate: new Date().toISOString().split('T')[0]
      }];
      
      products.forEach((product) => {
        fallbackData[0][`${product.grade}_price`] = product.price_per_kg;
      });
      
      setPriceHistoryData(fallbackData);
    } finally {
      setLoading(false);
    }
  };

  const formatDateForChart = (date: Date, period: string) => {
    if (period === '7days' || period === '30days') {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    }
  };

  const getProductColors = () => {
    const colors = ['#1C4A29', '#2D5F3F', '#16A34A', '#059669', '#0D9488', '#0891B2', '#0284C7'];
    return colors;
  };

  const calculatePriceChange = (product: any) => {
    if (priceHistoryData.length < 2) return { change: 0, percent: 0, isPositive: true };
    
    const oldestPrice = priceHistoryData[0]?.[`${product.grade}_price`] || product.price_per_kg;
    const currentPrice = product.price_per_kg;
    const change = currentPrice - oldestPrice;
    const percent = ((change / oldestPrice) * 100);
    
    return {
      change: Math.abs(change),
      percent: Math.abs(percent).toFixed(1),
      isPositive: change >= 0
    };
  };

  if (products.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-soft p-6 mt-8">
        <div className="text-center py-12">
          <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-xl text-gray-500 mb-2">No Products Listed</p>
          <p className="text-sm text-gray-500">Add products to see price history and trends</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-soft p-6 mt-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold font-playfair text-primary mb-2">Price History Overview</h3>
          <p className="text-sm text-gray-600">
            {priceHistoryData.length > 1 ? 'Real price history based on your updates' : 'Current prices (update prices to see history)'}
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          {(['7days', '30days', '6months', '1year'] as const).map((period) => (
            <button
              key={period}
              onClick={() => setSelectedPeriod(period)}
              disabled={loading}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                selectedPeriod === period
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {period === '7days' ? '7D' : period === '30days' ? '30D' : period === '6months' ? '6M' : '1Y'}
            </button>
          ))}
          <span className="ml-3 text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
            {priceHistoryData.length > 1 ? 'Real Data' : 'Current Prices'}
          </span>
        </div>
      </div>

      {loading ? (
        <div className="h-80 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Loading price history...</p>
          </div>
        </div>
      ) : priceHistoryData.length > 0 ? (
        <>
          {/* Price Trend Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-6">
            {products.slice(0, 5).map((product, index) => {
              const priceChange = calculatePriceChange(product);
              const colors = getProductColors();
              
              return (
                <div key={product.id} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: colors[index] }}
                    ></div>
                    {priceHistoryData.length > 1 ? (
                      <div className={`flex items-center text-sm ${priceChange.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                        {priceChange.isPositive ? (
                          <TrendingUp className="w-4 h-4 mr-1" />
                        ) : (
                          <TrendingDown className="w-4 h-4 mr-1" />
                        )}
                        {priceChange.percent}%
                      </div>
                    ) : (
                      <div className="text-sm text-gray-500">
                        Current
                      </div>
                    )}
                  </div>
                  <p className="text-sm font-medium text-gray-900 mb-1">{product.grade}</p>
                  <p className="text-lg font-bold text-primary">₹{product.price_per_kg}</p>
                  <p className="text-xs text-gray-500">per kg</p>
                </div>
              );
            })}
          </div>

          {/* Price History Chart */}
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={priceHistoryData}>
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
                  formatter={(value: any, name: any) => [
                    '₹' + value,
                    name.replace('_price', '').toUpperCase()
                  ]}
                  labelFormatter={(label) => 'Date: ' + label}
                />
                
                {/* Render lines for each product */}
                {products.slice(0, 5).map((product, index) => {
                  const colors = getProductColors();
                  return (
                    <Line 
                      key={product.id}
                      type="monotone" 
                      dataKey={`${product.grade}_price`}
                      stroke={colors[index]}
                      strokeWidth={2}
                      dot={{ fill: colors[index], strokeWidth: 2, r: 3 }}
                      activeDot={{ r: 5, stroke: colors[index], strokeWidth: 2, fill: '#F9F4E8' }}
                    />
                  );
                })}
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Chart Legend */}
          <div className="mt-6 bg-gray-50 rounded-lg p-4">
            <div className="flex flex-wrap items-center justify-between text-sm">
              <div className="flex flex-wrap items-center space-x-6">
                {products.slice(0, 5).map((product, index) => {
                  const colors = getProductColors();
                  return (
                    <div key={product.id} className="flex items-center">
                      <div 
                        className="w-3 h-3 rounded-full mr-2" 
                        style={{ backgroundColor: colors[index] }}
                      ></div>
                      <span className="text-gray-600">{product.grade} - ₹{product.price_per_kg}/kg</span>
                    </div>
                  );
                })}
              </div>
              <div className="text-gray-500 mt-2 md:mt-0">
                <BarChart3 className="w-4 h-4 inline mr-1" />
                {priceHistoryData.length > 1 ? 'Real price trends' : 'Current prices'} over {selectedPeriod.replace('days', ' days').replace('months', ' months').replace('year', ' year')}
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="h-80 flex items-center justify-center">
          <div className="text-center">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-2">No price history available</p>
            <p className="text-sm text-gray-500">Update product prices to see price trends over time</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductPriceChart;