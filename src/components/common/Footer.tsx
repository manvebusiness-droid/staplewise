import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-primary text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                <span className="text-primary font-bold text-sm">SW</span>
              </div>
              <span className="text-xl font-bold font-playfair">StapleWise</span>
            </div>
            <p className="text-gray-200 mb-4 max-w-md">
              Empowering B2B cashew procurement across India through transparency, 
              compliance, and technology-driven solutions.
            </p>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4" />
                <a href="mailto:zahid.staplewise@gmail.com" className="text-gray-200 hover:text-white">zahid.staplewise@gmail.com</a>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4 opacity-0" />
                <a href="mailto:zeeshan.staplewise@gmail.com" className="text-gray-200 hover:text-white">zeeshan.staplewise@gmail.com</a>
              </div>
              <div className="flex items-center space-x-2 mt-2">
                <Phone className="w-4 h-4" />
                <a href="tel:+917996191159" className="text-gray-200 hover:text-white">+91 79961 91159 (Zeeshan)</a>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4 opacity-0" />
                <a href="tel:+919606156335" className="text-gray-200 hover:text-white">+91 96061 56335 (Zahid)</a>
              </div>
              <div className="flex items-center space-x-2 mt-2">
                <MapPin className="w-4 h-4" />
                <span className="text-gray-200">6th Main, Venketapura, Teacher's Colony, Jakkasandra, 1st Block Koramangala, Koramangala, Bengaluru</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4 font-playfair">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link to="/" className="text-gray-200 hover:text-white transition-colors">Home</Link></li>
              <li><Link to="/products" className="text-gray-200 hover:text-white transition-colors">Products</Link></li>
              <li><Link to="/about" className="text-gray-200 hover:text-white transition-colors">About Us</Link></li>
              <li><Link to="/contact" className="text-gray-200 hover:text-white transition-colors">Contact</Link></li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-lg font-semibold mb-4 font-playfair">Services</h3>
            <ul className="space-y-2">
              <li><span className="text-gray-200">B2B Procurement</span></li>
              <li><span className="text-gray-200">Quality Assurance</span></li>
              <li><span className="text-gray-200">Logistics Support</span></li>
              <li><span className="text-gray-200">Compliance Management</span></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-primary/20 mt-8 pt-8 text-center">
          <p className="text-gray-200">
            © 2024 StapleWise. All rights reserved. | Empowering cashew procurement across India.
          </p>
          <p className="text-gray-300 mt-2 text-sm">
            Powered by{' '}
            <a
              href="https://manve.co"
              target="_blank"
              rel="noreferrer"
              className="underline underline-offset-4 hover:text-white"
            >
              Manve
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;