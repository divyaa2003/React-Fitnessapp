import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const fitnessDropdownRef = useRef(null);
  const wellnessDropdownRef = useRef(null);
  
  // Close mobile menu and dropdowns when route changes
  useEffect(() => {
    setIsMenuOpen(false);
    setActiveDropdown(null);
  }, [location.pathname]);
  
  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      const clickedOutsideFitness = fitnessDropdownRef.current && !fitnessDropdownRef.current.contains(event.target);
      const clickedOutsideWellness = wellnessDropdownRef.current && !wellnessDropdownRef.current.contains(event.target);
      
      if ((activeDropdown === 'fitness' && clickedOutsideFitness) || 
          (activeDropdown === 'wellness' && clickedOutsideWellness)) {
        setActiveDropdown(null);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [activeDropdown]);
  
  // Toggle dropdown menu
  const toggleDropdown = (dropdown) => {
    setActiveDropdown(activeDropdown === dropdown ? null : dropdown);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  // Helper function to determine if a link is active
  const isActive = (path) => {
    return location.pathname === path ? 'border-b-2 border-blue-400' : '';
  };

  return (
    <nav className="bg-slate-900 shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0" onClick={closeMenu}>
              <h1 className="text-xl font-bold text-white">Fit<span className="text-blue-400">Sync</span></h1>
            </Link>
          </div>
          
          <div className="hidden md:block">
            <div className="ml-10 flex items-center space-x-1">
              <Link 
                to="/" 
                className={`text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium ${isActive('/')}`}
              >
                <i className="fas fa-home mr-1"></i> Home
              </Link>
              
              {/* Main Features */}
              <div className="relative px-1" ref={fitnessDropdownRef}>
                <button 
                  onClick={() => toggleDropdown('fitness')} 
                  className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium flex items-center"
                >
                  <i className="fas fa-dumbbell mr-1"></i> Fitness <i className={`fas fa-chevron-${activeDropdown === 'fitness' ? 'up' : 'down'} ml-1 text-xs`}></i>
                </button>
                {activeDropdown === 'fitness' && (
                  <div className="absolute left-0 mt-2 w-48 bg-slate-800 rounded-md shadow-lg py-1 z-10">
                    <Link to="/dashboard" className="block px-4 py-2 text-sm text-gray-300 hover:bg-slate-700">
                      <i className="fas fa-tachometer-alt mr-2"></i> Dashboard
                    </Link>
                    <Link to="/progress" className="block px-4 py-2 text-sm text-gray-300 hover:bg-slate-700">
                      <i className="fas fa-chart-line mr-2"></i> Progress Tracker
                    </Link>
                    <Link to="/achievements" className="block px-4 py-2 text-sm text-gray-300 hover:bg-slate-700">
                      <i className="fas fa-trophy mr-2"></i> Achievements
                    </Link>
                  </div>
                )}
              </div>
              
              {/* Wellness Features */}
              <div className="relative px-1" ref={wellnessDropdownRef}>
                <button 
                  onClick={() => toggleDropdown('wellness')} 
                  className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium flex items-center"
                >
                  <i className="fas fa-heartbeat mr-1"></i> Wellness <i className={`fas fa-chevron-${activeDropdown === 'wellness' ? 'up' : 'down'} ml-1 text-xs`}></i>
                </button>
                {activeDropdown === 'wellness' && (
                  <div className="absolute left-0 mt-2 w-48 bg-slate-800 rounded-md shadow-lg py-1 z-10">
                    <Link to="/nutrition" className="block px-4 py-2 text-sm text-gray-300 hover:bg-slate-700">
                      <i className="fas fa-apple-alt mr-2"></i> Nutrition Tracker
                    </Link>
                    <Link to="/wellness" className="block px-4 py-2 text-sm text-gray-300 hover:bg-slate-700">
                      <i className="fas fa-brain mr-2"></i> Mental Wellness
                    </Link>
                  </div>
                )}
              </div>
              
              {/* Profile Link */}
              <Link to="/profile" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                <i className="fas fa-user-circle mr-1"></i> Profile
              </Link>
            </div>
          </div>
          
          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none"
            >
              <span className="sr-only">Open main menu</span>
              <i className={`fas ${isMenuOpen ? 'fa-times' : 'fa-bars'}`}></i>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="md:hidden"
        >
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link 
              to="/" 
              className="text-gray-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium"
              onClick={closeMenu}
            >
              <i className="fas fa-home mr-2"></i> Home
            </Link>
            
            {/* Fitness Section */}
            <div className="border-t border-slate-700 pt-2 mt-2">
              <p className="px-3 py-1 text-xs text-slate-500 uppercase font-semibold">Fitness</p>
              <Link 
                to="/dashboard" 
                className="text-gray-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium"
                onClick={closeMenu}
              >
                <i className="fas fa-tachometer-alt mr-2"></i> Dashboard
              </Link>
              <Link 
                to="/progress" 
                className="text-gray-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium"
                onClick={closeMenu}
              >
                <i className="fas fa-chart-line mr-2"></i> Progress Tracker
              </Link>
              <Link 
                to="/achievements" 
                className="text-gray-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium"
                onClick={closeMenu}
              >
                <i className="fas fa-trophy mr-2"></i> Achievements
              </Link>
            </div>
            
            {/* Wellness Section */}
            <div className="border-t border-slate-700 pt-2 mt-2">
              <p className="px-3 py-1 text-xs text-slate-500 uppercase font-semibold">Wellness</p>
              <Link 
                to="/nutrition" 
                className="text-gray-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium"
                onClick={closeMenu}
              >
                <i className="fas fa-apple-alt mr-2"></i> Nutrition Tracker
              </Link>
              <Link 
                to="/wellness" 
                className="text-gray-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium"
                onClick={closeMenu}
              >
                <i className="fas fa-brain mr-2"></i> Mental Wellness
              </Link>
            </div>
            
            {/* Profile Link */}
            <div className="border-t border-slate-700 pt-2 mt-2">
              <Link 
                to="/profile" 
                className="text-gray-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium"
                onClick={closeMenu}
              >
                <i className="fas fa-id-card mr-2"></i> Profile
              </Link>
            </div>
          </div>
        </motion.div>
      )}
    </nav>
  );
}
