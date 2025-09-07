import React, { useState } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { Building, Package, ShoppingCart, LogOut, Menu, X, TrendingUp } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import CompanyDetails from './CompanyDetails';
import Orders from './Orders';
import ListProduct from './ListProduct';
import ProductPerformance from './ProductPerformance';

const SellerPortal: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigation = [
    { name: 'Dashboard', href: '/seller', icon: Building },
    { name: 'Orders', href: '/seller/orders', icon: ShoppingCart },
    { name: 'List Product', href: '/seller/list-product', icon: Package },
    { name: 'Product Performance', href: '/seller/product-performance', icon: TrendingUp }
  ];

  const isActive = (href: string) => {
    if (href === '/seller') {
      return location.pathname === '/seller';
    }
    return location.pathname.startsWith(href);
  };

  const getCurrentPageTitle = () => {
    const currentPath = location.pathname;
    if (currentPath === '/seller') return 'Dashboard';
    if (currentPath === '/seller/orders') return 'Orders';
    if (currentPath === '/seller/list-product') return 'List Product';
    if (currentPath === '/seller/product-performance') return 'Product Performance';
    if (currentPath === '/seller/product-performance') return 'Product Performance';
    return 'Dashboard';
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="flex">
        {/* Desktop Sidebar */}
        <div className="hidden lg:flex lg:flex-shrink-0 lg:h-screen lg:sticky lg:top-0">
          <div className="flex flex-col w-64 h-full">
            <div className="flex flex-col flex-grow bg-white border-r border-gray-200 pt-5 pb-4 overflow-y-auto h-full">
              <div className="flex items-center flex-shrink-0 px-6">
                <Link to="/" className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">SW</span>
                  </div>
                  <span className="text-xl font-bold text-primary font-playfair">StapleWise</span>
                </Link>
              </div>
              
              <div className="flex-grow flex flex-col mt-8">
                <nav className="flex-1 px-4 space-y-1">
                  {navigation.map((item) => (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                        isActive(item.href)
                          ? 'bg-primary text-white'
                          : 'text-gray-600 hover:text-primary hover:bg-gray-50'
                      }`}
                    >
                      <item.icon className="mr-3 h-5 w-5" />
                      {item.name}
                    </Link>
                  ))}
                </nav>
                
                <div className="px-4 pt-4 border-t border-gray-200">
                  <div className="mb-4 px-3 py-2 bg-secondary/30 rounded-lg">
                    <p className="text-sm font-medium text-primary">{user?.name}</p>
                    <p className="text-xs text-gray-600">{user?.email}</p>
                  </div>
                  <button
                    onClick={logout}
                    className="group flex items-center w-full px-3 py-2 text-sm font-medium text-red-600 rounded-md hover:bg-red-50"
                  >
                    <LogOut className="mr-3 h-5 w-5" />
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-auto min-h-screen">
          {/* Mobile Header */}
          <div className="lg:hidden bg-white shadow-sm sticky top-0 z-30">
            <div className="px-4 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Link to="/" className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold text-sm">SW</span>
                    </div>
                  </Link>
                  <div className="ml-2">
                    <h1 className="text-lg font-bold font-playfair text-primary">{getCurrentPageTitle()}</h1>
                    <p className="text-xs text-gray-500">{user?.name}</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="p-2 rounded-lg text-gray-600 hover:text-primary hover:bg-gray-100 transition-colors"
                >
                  {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
              </div>

              {/* Mobile Navigation Menu */}
              {isMobileMenuOpen && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <nav className="space-y-1">
                    {navigation.map((item) => (
                      <Link
                        key={item.name}
                        to={item.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                          isActive(item.href)
                            ? 'bg-primary text-white shadow-sm'
                            : 'text-gray-700 hover:text-primary hover:bg-primary/5'
                        }`}
                      >
                        <item.icon className="mr-3 h-5 w-5" />
                        {item.name}
                      </Link>
                    ))}
                    
                    {/* User Info & Logout */}
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="px-4 py-3 bg-secondary/20 rounded-lg mb-3">
                        <p className="text-sm font-medium text-primary">{user?.name}</p>
                        <p className="text-xs text-gray-600">{user?.email}</p>
                        <p className="text-xs text-gray-500">Role: {user?.role}</p>
                      </div>
                      <button
                        onClick={() => {
                          logout();
                          setIsMobileMenuOpen(false);
                        }}
                        className="flex items-center w-full px-4 py-3 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <LogOut className="mr-3 h-5 w-5" />
                        Logout
                      </button>
                    </div>
                  </nav>
                </div>
              )}
            </div>
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Routes>
              <Route path="/" element={<CompanyDetails />} />
              <Route path="/orders" element={<Orders />} />
              <Route path="/list-product" element={<ListProduct />} />
              <Route path="/product-performance" element={<ProductPerformance />} />
              <Route path="/product-performance" element={<ProductPerformance />} />
            </Routes>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellerPortal;