import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { User, LogOut, Menu, X, ChevronDown, MapPin, Package } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import LoginModal from './LoginModal';
import { Role } from '../../types';

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showLogin, setShowLogin] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Don't render header on seller portal pages
  if (location.pathname.startsWith('/seller')) {
    return null;
  }

  const handleCategoryClick = (categoryId: string) => {
    if (categoryId === 'cashews') {
      navigate('/products');
    } else {
      // For other categories, you can add navigation logic here
      console.log(`Navigate to ${categoryId} category`);
    }
  };

  const categories = [
    { id: 'cashews', name: 'Cashews' },
    { id: 'cloves', name: 'Cloves' },
    { id: 'chillies', name: 'Chillies' },
    { id: 'star-anise', name: 'Star Anise' },
    { id: 'pepper', name: 'Pepper' },
    { id: 'cinnamon', name: 'Cinnamon' }
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMobileMenuOpen(false);
  };

  const getDashboardRoute = () => {
    if (!user) return '/';
    console.log('🔍 getDashboardRoute - User role:', user.role, 'Type:', typeof user.role);
    
    switch (user.role) {
      case 'ADMIN':
        return '/admin';
      case 'SALES':
        return '/sales';
      case 'SELLER':
        console.log('🔗 Returning /seller route for SELLER role');
        return '/seller';
      default:
        console.log('⚠️ Unknown role, defaulting to home. Role was:', user.role);
        return '/';
    }
  };

  const isSellerPortal = location.pathname.startsWith('/seller');

  return (
    <>
      <header className="bg-white shadow-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link to="/" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">SW</span>
                </div>
                <span className="text-xl font-bold text-primary font-playfair">StapleWise</span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              {!isSellerPortal && (
                <>
                  <Link to="/" className="text-gray-700 hover:text-primary transition-colors">Home</Link>
                  
                  {/* Categories Dropdown */}
                  <div className="relative group">
                    <button className="flex items-center text-gray-700 hover:text-primary transition-colors py-2 px-3 rounded-lg hover:bg-primary/5">
                      Categories
                      <ChevronDown className="w-4 h-4 ml-1 group-hover:rotate-180 transition-transform duration-200" />
                    </button>
                    
                    {/* Dropdown Menu */}
                    <div className="absolute top-full left-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                      <div className="py-2">
                        {categories.map((category) => (
                          <div
                            key={category.id}
                            className="relative group/item"
                          >
                            <button
                              onClick={() => handleCategoryClick(category.id)}
                              className="w-full text-left px-4 py-3 text-gray-700 hover:bg-primary/5 hover:text-primary transition-colors flex items-center justify-between"
                            >
                              <div className="flex items-center">
                                <Package className="w-4 h-4 mr-3 text-gray-400" />
                                {category.name}
                              </div>
                              <ChevronDown className="w-3 h-3 text-gray-400 group-hover/item:rotate-180 transition-transform duration-200" />
                            </button>
                            
                            {/* Sub-dropdown for category details */}
                            <div className="absolute left-full top-0 ml-1 w-64 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover/item:opacity-100 group-hover/item:visible transition-all duration-200 z-50">
                              <div className="p-4">
                                <h4 className="font-semibold text-primary mb-2">{category.name}</h4>
                                <p className="text-sm text-gray-600 mb-3">
                                  {category.id === 'cashews' ? 'Premium quality cashew kernels in various grades' :
                                   category.id === 'cloves' ? 'Aromatic whole cloves for culinary use' :
                                   category.id === 'chillies' ? 'Fresh and dried chillies with varying heat levels' :
                                   category.id === 'star-anise' ? 'Star-shaped spice with sweet licorice flavor' :
                                   category.id === 'pepper' ? 'Black and white peppercorns for seasoning' :
                                   'Sweet and aromatic cinnamon bark and powder'}
                                </p>
                                <button
                                  onClick={() => handleCategoryClick(category.id)}
                                  className="text-primary hover:text-accent text-sm font-medium transition-colors"
                                >
                                  {category.id === 'cashews' ? 'Browse Products →' : 'Coming Soon'}
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <Link to="/about" className="text-gray-700 hover:text-primary transition-colors">About</Link>
                  <Link to="/contact" className="text-gray-700 hover:text-primary transition-colors">Contact</Link>
                </>
              )}
            </nav>

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center space-x-4">
              {user ? (
                <div className="relative group">
                  <button className="flex items-center space-x-1 p-2 rounded-full hover:bg-gray-100 transition-colors">
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-white" />
                    </div>
                    <ChevronDown className="w-4 h-4 text-gray-600 group-hover:rotate-180 transition-transform duration-200" />
                  </button>
                  
                  {/* Dropdown Menu */}
                  <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    <div className="py-2">
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-900">{user.name}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                        <p className="text-xs text-gray-400">Role: {user.role}</p>
                      </div>
                      {(['ADMIN', 'SALES', 'SELLER'].includes(user.role)) && (
                        <Link
                          to={getDashboardRoute()}
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary transition-colors"
                        >
                          <User className="w-4 h-4 mr-3" />
                          {user.role === 'SELLER' ? 'Seller Portal' : 'Dashboard'}
                        </Link>
                      )}
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-red-600 transition-colors text-left"
                      >
                        <LogOut className="w-4 h-4 mr-3" />
                        Logout
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setShowLogin(true)}
                  className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Login
                </button>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-gray-700 hover:text-primary transition-colors"
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-gray-200">
              <nav className="flex flex-col space-y-4">
                {!isSellerPortal && (
                  <>
                    <Link to="/" className="text-gray-700 hover:text-primary transition-colors" onClick={() => setIsMobileMenuOpen(false)}>Home</Link>
                    
                    {/* Mobile Categories Dropdown */}
                    <div className="relative">
                      <details className="group">
                        <summary className="text-gray-700 hover:text-primary transition-colors cursor-pointer list-none flex items-center justify-between py-2">
                          <span>Categories</span>
                          <ChevronDown className="w-4 h-4 group-open:rotate-180 transition-transform duration-200" />
                        </summary>
                        <div className="mt-2 ml-4 space-y-2">
                          {categories.map((category) => (
                            <button
                              key={category.id}
                              onClick={() => {
                                handleCategoryClick(category.id);
                                setIsMobileMenuOpen(false);
                              }}
                              className="block w-full text-left py-2 text-sm text-gray-600 hover:text-primary hover:bg-gray-50 transition-colors rounded-lg px-2"
                            >
                              {category.name}
                            </button>
                          ))}
                        </div>
                      </details>
                    </div>
                    
                    <Link to="/about" className="text-gray-700 hover:text-primary transition-colors" onClick={() => setIsMobileMenuOpen(false)}>About</Link>
                    <Link to="/contact" className="text-gray-700 hover:text-primary transition-colors" onClick={() => setIsMobileMenuOpen(false)}>Contact</Link>
                  </>
                )}
                
                {user ? (
                  <>
                    <div className="border-t border-gray-200 pt-4">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                          <User className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{user.name}</p>
                          <p className="text-xs text-gray-500">{user.email}</p>
                        </div>
                      </div>
                      {(['ADMIN', 'SALES', 'SELLER'].includes(user.role)) && (
                        <Link
                          to={getDashboardRoute()}
                          onClick={() => {
                            console.log('🔗 Mobile Link clicked, navigating to:', getDashboardRoute());
                            setIsMobileMenuOpen(false);
                          }}
                          className="flex items-center space-x-2 text-gray-700 hover:text-primary transition-colors mb-2"
                        >
                          <User className="w-4 h-4" />
                          <span>{user.role === 'SELLER' ? 'Seller Portal' : 'Dashboard'}</span>
                        </Link>
                      )}
                      <button
                        onClick={handleLogout}
                        className="flex items-center space-x-1 text-gray-700 hover:text-red-600 transition-colors text-left"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Logout</span>
                      </button>
                    </div>
                  </>
                ) : (
                  <button
                    onClick={() => {
                      setShowLogin(true);
                      setIsMobileMenuOpen(false);
                    }}
                    className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/90 transition-colors text-left"
                  >
                    Login
                  </button>
                )}
              </nav>
            </div>
          )}
        </div>
      </header>

      {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}
    </>
  );
};

export default Header;