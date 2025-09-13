import React, { useState } from 'react';
import { Save, Building, MapPin, Calendar, FileText } from 'lucide-react';
import { CompanyDetailsService } from '../../lib/supabaseServices';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

const CompanyDetails: React.FC = () => {
  const { user } = useAuth();
  const [companyDetails, setCompanyDetails] = useState({
    company_name: '',
    city: '',
    address_street1: '',
    address_street2: '',
    address_pincode: '',
    address_state: '',
    registrar_name: '',
    gstin: '',
    year_established: new Date().getFullYear()
  });

  const [isEditing, setIsEditing] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [locationSuggestions, setLocationSuggestions] = useState<string[]>([]);
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({});

  React.useEffect(() => {
    loadCompanyDetails();
  }, []);

  const loadCompanyDetails = async () => {
    if (!user) return;
    
    try {
      console.log('🔄 Loading company details for user:', user.id);
      setLoading(true);
      
      // Check if Supabase is configured
      if (!supabase) {
        console.log('⚠️ Supabase not configured, using mock data');
        setIsEditing(true);
        return;
      }
      
      const companyData = await CompanyDetailsService.getCompanyDetails(user.id);
      if (companyData) {
        console.log('✅ Company details found:', companyData);
        setCompanyDetails(companyData);
        setIsEditing(false);
      } else {
        console.log('ℹ️ No company details found, staying in edit mode');
        setIsEditing(true);
      }
    } catch (error: any) {
      console.error('❌ Error loading company details:', error);
      
      // Handle specific 406 error
      if (error.message?.includes('406') || error.code === '406') {
        console.log('🔧 Handling 406 error - table might not exist or have access issues');
        setIsEditing(true);
      } else {
        console.log('ℹ️ API error, staying in edit mode');
        setIsEditing(true);
      }
    } finally {
      setLoading(false);
    }
  };

  // Indian cities for validation
  const indianCities = [
    'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Ahmedabad', 'Chennai', 'Kolkata', 'Surat', 'Pune', 'Jaipur',
    'Lucknow', 'Kanpur', 'Nagpur', 'Indore', 'Thane', 'Bhopal', 'Visakhapatnam', 'Pimpri-Chinchwad', 'Patna', 'Vadodara',
    'Ghaziabad', 'Ludhiana', 'Agra', 'Nashik', 'Faridabad', 'Meerut', 'Rajkot', 'Kalyan-Dombivli', 'Vasai-Virar', 'Varanasi',
    'Srinagar', 'Aurangabad', 'Dhanbad', 'Amritsar', 'Navi Mumbai', 'Allahabad', 'Ranchi', 'Howrah', 'Coimbatore', 'Jabalpur',
    'Gwalior', 'Vijayawada', 'Jodhpur', 'Madurai', 'Raipur', 'Kota', 'Guwahati', 'Chandigarh', 'Solapur', 'Hubli-Dharwad',
    'Bareilly', 'Moradabad', 'Mysore', 'Gurgaon', 'Aligarh', 'Jalandhar', 'Tiruchirappalli', 'Bhubaneswar', 'Salem', 'Mira-Bhayandar',
    'Warangal', 'Guntur', 'Bhiwandi', 'Saharanpur', 'Gorakhpur', 'Bikaner', 'Amravati', 'Noida', 'Jamshedpur', 'Bhilai',
    'Cuttack', 'Firozabad', 'Kochi', 'Nellore', 'Bhavnagar', 'Dehradun', 'Durgapur', 'Asansol', 'Rourkela', 'Nanded',
    'Kolhapur', 'Ajmer', 'Akola', 'Gulbarga', 'Jamnagar', 'Ujjain', 'Loni', 'Siliguri', 'Jhansi', 'Ulhasnagar',
    'Jammu', 'Sangli-Miraj & Kupwad', 'Mangalore', 'Erode', 'Belgaum', 'Ambattur', 'Tirunelveli', 'Malegaon', 'Gaya', 'Jalgaon',
    'Udaipur', 'Maheshtala', 'Davanagere', 'Kozhikode', 'Kurnool', 'Rajpur Sonarpur', 'Rajahmundry', 'Bokaro', 'South Dumdum', 'Bellary',
    'Patiala', 'Gopalpur', 'Agartala', 'Bhagalpur', 'Muzaffarnagar', 'Bhatpara', 'Panihati', 'Latur', 'Dhule', 'Rohtak',
    'Korba', 'Bhilwara', 'Berhampur', 'Muzaffarpur', 'Ahmednagar', 'Mathura', 'Kollam', 'Avadi', 'Kadapa', 'Kamarhati',
    'Sambalpur', 'Bilaspur', 'Shahjahanpur', 'Satara', 'Bijapur', 'Rampur', 'Shivamogga', 'Chandrapur', 'Junagadh', 'Thrissur',
    'Alwar', 'Bardhaman', 'Kulti', 'Kakinada', 'Nizamabad', 'Parbhani', 'Tumkur', 'Khammam', 'Ozhukarai', 'Bihar Sharif',
    'Panipat', 'Darbhanga', 'Bally', 'Aizawl', 'Dewas', 'Ichalkaranji', 'Karnal', 'Bathinda', 'Jalna', 'Eluru',
    'Kirari Suleman Nagar', 'Barabanki', 'Purnia', 'Satna', 'Mau', 'Sonipat', 'Farrukhabad', 'Sagar', 'Rourkela', 'Durg'
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Clear validation error when user starts typing
    if (validationErrors[name]) {
      setValidationErrors(prev => ({ ...prev, [name]: '' }));
    }

    // Handle city input with suggestions
    if (name === 'city') {
      const suggestions = indianCities.filter(city => 
        city.toLowerCase().includes(value.toLowerCase())
      ).slice(0, 5);
      setLocationSuggestions(suggestions);
      setShowLocationSuggestions(value.length > 0 && suggestions.length > 0);
    }

    // Handle pincode validation and auto-detection
    if (name === 'address_pincode') {
      if (value.length === 6 && /^\d{6}$/.test(value)) {
        const pincode = parseInt(value);
        let detectedState = '';
        let detectedCity = '';
        
        // Comprehensive pincode to state and city mapping
        if (pincode >= 110001 && pincode <= 110096) {
          detectedState = 'Delhi';
          detectedCity = 'Delhi';
        }
        else if (pincode >= 121001 && pincode <= 136156) {
          detectedState = 'Haryana';
          if (pincode >= 122001 && pincode <= 122505) detectedCity = 'Gurgaon';
          else if (pincode >= 124001 && pincode <= 124507) detectedCity = 'Rohtak';
          else detectedCity = 'Faridabad';
        }
        else if (pincode >= 140001 && pincode <= 160104) {
          detectedState = 'Punjab';
          if (pincode >= 141001 && pincode <= 141010) detectedCity = 'Ludhiana';
          else if (pincode >= 143001 && pincode <= 143505) detectedCity = 'Amritsar';
          else detectedCity = 'Chandigarh';
        }
        else if (pincode >= 201001 && pincode <= 285223) {
          detectedState = 'Uttar Pradesh';
          if (pincode >= 201001 && pincode <= 201310) detectedCity = 'Ghaziabad';
          else if (pincode >= 208001 && pincode <= 208027) detectedCity = 'Kanpur';
          else if (pincode >= 226001 && pincode <= 226030) detectedCity = 'Lucknow';
          else detectedCity = 'Noida';
        }
        else if (pincode >= 301001 && pincode <= 345034) {
          detectedState = 'Rajasthan';
          if (pincode >= 302001 && pincode <= 302039) detectedCity = 'Jaipur';
          else if (pincode >= 313001 && pincode <= 313015) detectedCity = 'Udaipur';
          else detectedCity = 'Jodhpur';
        }
        else if (pincode >= 360001 && pincode <= 396590) {
          detectedState = 'Gujarat';
          if (pincode >= 380001 && pincode <= 382481) detectedCity = 'Ahmedabad';
          else if (pincode >= 390001 && pincode <= 391780) detectedCity = 'Vadodara';
          else detectedCity = 'Surat';
        }
        else if (pincode >= 400001 && pincode <= 445402) {
          detectedState = 'Maharashtra';
          if (pincode >= 400001 && pincode <= 400104) detectedCity = 'Mumbai';
          else if (pincode >= 411001 && pincode <= 412411) detectedCity = 'Pune';
          else if (pincode >= 431001 && pincode <= 431517) detectedCity = 'Aurangabad';
          else detectedCity = 'Nagpur';
        }
        else if (pincode >= 500001 && pincode <= 509412) {
          detectedState = 'Telangana';
          detectedCity = 'Hyderabad';
        }
        else if (pincode >= 515001 && pincode <= 524413) {
          detectedState = 'Andhra Pradesh';
          if (pincode >= 520001 && pincode <= 521139) detectedCity = 'Vijayawada';
          else detectedCity = 'Visakhapatnam';
        }
        else if (pincode >= 560001 && pincode <= 581411) {
          detectedState = 'Karnataka';
          if (pincode >= 560001 && pincode <= 560100) detectedCity = 'Bangalore';
          else if (pincode >= 575001 && pincode <= 576104) detectedCity = 'Mangalore';
          else detectedCity = 'Mysore';
        }
        else if (pincode >= 600001 && pincode <= 643253) {
          detectedState = 'Tamil Nadu';
          if (pincode >= 600001 && pincode <= 603403) detectedCity = 'Chennai';
          else if (pincode >= 641001 && pincode <= 641407) detectedCity = 'Coimbatore';
          else detectedCity = 'Madurai';
        }
        else if (pincode >= 670001 && pincode <= 695615) {
          detectedState = 'Kerala';
          if (pincode >= 682001 && pincode <= 683612) detectedCity = 'Kochi';
          else if (pincode >= 695001 && pincode <= 695615) detectedCity = 'Thiruvananthapuram';
          else detectedCity = 'Kozhikode';
        }
        else if (pincode >= 700001 && pincode <= 743711) {
          detectedState = 'West Bengal';
          detectedCity = 'Kolkata';
        }
        else if (pincode >= 751001 && pincode <= 770076) {
          detectedState = 'Odisha';
          detectedCity = 'Bhubaneswar';
        }
        else if (pincode >= 781001 && pincode <= 788931) {
          detectedState = 'Assam';
          detectedCity = 'Guwahati';
        }
        else if (pincode >= 800001 && pincode <= 855117) {
          detectedState = 'Bihar';
          detectedCity = 'Patna';
        }
        else if (pincode >= 831001 && pincode <= 835325) {
          detectedState = 'Jharkhand';
          detectedCity = 'Ranchi';
        }
        
        if (detectedState && detectedCity) {
          setCompanyDetails(prev => ({
            ...prev,
            city: detectedCity,
            address_pincode: value,
            address_state: detectedState
          }));
          return;
        }
      }
    }
    
    setCompanyDetails(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLocationSelect = (city: string) => {
    setCompanyDetails(prev => ({ ...prev, city: city }));
    setShowLocationSuggestions(false);
    setLocationSuggestions([]);
  };

  const validateForm = () => {
    const errors: {[key: string]: string} = {};
    
    // Validate city
    if (companyDetails.city && !indianCities.includes(companyDetails.city)) {
      errors.city = 'Please select a valid Indian city';
    }
    
    // Validate pincode
    if (companyDetails.address_pincode && !/^\d{6}$/.test(companyDetails.address_pincode)) {
      errors['address_pincode'] = 'Please enter a valid 6-digit pincode';
    }
    
    // Validate GSTIN
    if (companyDetails.gstin && !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(companyDetails.gstin)) {
      errors.gstin = 'Please enter a valid GSTIN format';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    if (!user) {
      alert('Please log in to save company details');
      return;
    }

    // Check if Supabase is configured
    if (!supabase) {
      alert('Database not configured. Please set up Supabase connection.');
      return;
    }

    try {
      setSaving(true);
      
      await CompanyDetailsService.createOrUpdateCompanyDetails(user.id, companyDetails);
      setIsEditing(false);
      alert('Company details saved successfully!');
    } catch (apiError: any) {
      console.error('❌ API Error saving company details:', apiError);
      
      if (apiError.message?.includes('406') || apiError.code === '406') {
        alert('Database table not accessible. Please check your Supabase configuration.');
      } else {
        alert('Failed to save company details. Please try again.');
      }
    } finally {
      setSaving(false);
    }
  };

  const indianStates = [
    'Andaman and Nicobar Islands',
    'Andhra Pradesh',
    'Arunachal Pradesh',
    'Assam',
    'Bihar',
    'Chandigarh',
    'Chhattisgarh',
    'Dadra and Nagar Haveli and Daman and Diu',
    'Delhi',
    'Goa',
    'Gujarat',
    'Haryana',
    'Himachal Pradesh',
    'Jammu and Kashmir',
    'Jharkhand',
    'Karnataka',
    'Kerala',
    'Ladakh',
    'Lakshadweep',
    'Madhya Pradesh',
    'Maharashtra',
    'Manipur',
    'Meghalaya',
    'Mizoram',
    'Nagaland',
    'Odisha',
    'Puducherry',
    'Punjab',
    'Rajasthan',
    'Sikkim',
    'Tamil Nadu',
    'Telangana',
    'Tripura',
    'Uttar Pradesh',
    'Uttarakhand',
    'West Bengal'
  ];

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
          <h1 className="text-3xl font-bold font-playfair text-primary">Company Details</h1>
          <p className="text-gray-600 mt-2">Manage your company information and registration details</p>
        </div>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-accent transition-colors"
          >
            Edit Details
          </button>
        )}
      </div>

      <div className="bg-white rounded-2xl shadow-soft p-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Company Identity */}
          <div>
            <div className="flex items-center mb-6">
              <Building className="w-5 h-5 text-primary mr-2" />
              <h2 className="text-xl font-bold font-playfair text-primary">Company Identity</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company Name *
                </label>
                <input
                  type="text"
                  name="company_name"
                  value={companyDetails.company_name}
                  onChange={handleInputChange}
                  required
                  disabled={!isEditing}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors disabled:bg-gray-100"
                  placeholder="Enter your company name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  City *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="city"
                    value={companyDetails.city}
                    onChange={handleInputChange}
                    required
                    disabled={!isEditing}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors disabled:bg-gray-100 ${
                      validationErrors.city ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Start typing city name..."
                  />
                  {validationErrors.city && (
                    <p className="text-red-500 text-sm mt-1">{validationErrors.city}</p>
                  )}
                  
                  {/* City Suggestions */}
                  {showLocationSuggestions && isEditing && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-40 overflow-y-auto">
                      {locationSuggestions.map((city, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => handleLocationSelect(city)}
                          className="w-full text-left px-4 py-2 hover:bg-gray-100 transition-colors"
                        >
                          {city}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Address */}
          <div>
            <div className="flex items-center mb-6">
              <MapPin className="w-5 h-5 text-primary mr-2" />
              <h2 className="text-xl font-bold font-playfair text-primary">Address</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Street Address 1 *
                </label>
                <input
                  type="text"
                  name="address_street1"
                  value={companyDetails.address_street1}
                  onChange={handleInputChange}
                  required
                  disabled={!isEditing}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors disabled:bg-gray-100"
                  placeholder="Building number, street name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Street Address 2
                </label>
                <input
                  type="text"
                  name="address_street2"
                  value={companyDetails.address_street2}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors disabled:bg-gray-100"
                  placeholder="Area, landmark"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pincode *
                  </label>
                  <input
                    type="text"
                    name="address_pincode"
                    value={companyDetails.address_pincode}
                    onChange={handleInputChange}
                    required
                    disabled={!isEditing}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors disabled:bg-gray-100 ${
                      validationErrors['address_pincode'] ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="6-digit pincode"
                    maxLength={6}
                  />
                  {validationErrors['address_pincode'] && (
                    <p className="text-red-500 text-sm mt-1">{validationErrors['address_pincode']}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    State *
                  </label>
                  <select
                    name="address_state"
                    value={companyDetails.address_state}
                    onChange={handleInputChange}
                    required
                    disabled={!isEditing}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors disabled:bg-gray-100"
                  >
                    <option value="">Select State</option>
                    {indianStates.map(state => (
                      <option key={state} value={state}>{state}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Registration Details */}
          <div>
            <div className="flex items-center mb-6">
              <FileText className="w-5 h-5 text-primary mr-2" />
              <h2 className="text-xl font-bold font-playfair text-primary">Registration Details</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company Registration Name *
                </label>
                <input
                  type="text"
                  name="registrar_name"
                  value={companyDetails.registrar_name}
                  onChange={handleInputChange}
                  required
                  disabled={!isEditing}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors disabled:bg-gray-100"
                  placeholder="Name of the registrar"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  GSTIN *
                </label>
                <input
                  type="text"
                  name="gstin"
                  value={companyDetails.gstin}
                  onChange={handleInputChange}
                  required
                  disabled={!isEditing}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors disabled:bg-gray-100 ${
                    validationErrors.gstin ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="15-digit GST number"
                  maxLength={15}
                />
                {validationErrors.gstin && (
                  <p className="text-red-500 text-sm mt-1">{validationErrors.gstin}</p>
                )}
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Year of Establishment *
                </label>
                <input
                  type="number"
                  name="year_established"
                  value={companyDetails.year_established}
                  onChange={handleInputChange}
                  required
                  min="1900"
                  max={new Date().getFullYear()}
                  disabled={!isEditing}
                  className="w-full md:w-1/3 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors disabled:bg-gray-100"
                />
              </div>
            </div>
          </div>

          {isEditing && (
            <div className="flex justify-end space-x-4 pt-6 border-t">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-accent transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="w-4 h-4 mr-2" />
                {saving ? 'Saving...' : 'Save Details'}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default CompanyDetails;