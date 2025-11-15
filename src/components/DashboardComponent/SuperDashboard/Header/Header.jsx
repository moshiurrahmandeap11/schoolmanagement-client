import { useEffect, useState } from 'react';
import {
  FaBars,
  FaBell,
  FaBook,
  FaChevronDown,
  FaClipboardList,
  FaCodeBranch,
  FaCog,
  FaEnvelope,
  FaHome,
  FaPlus,
  FaSchool,
  FaSignOutAlt,
  FaUser,
  FaUserGraduate
} from 'react-icons/fa';
import { useNavigate } from 'react-router';
import axiosInstance from '../../../../hooks/axiosInstance/axiosInstance';
import useAuth from '../../../../hooks/useAuth/useAuth';

const Header = ({ onMenuClick, activeMenu, setActiveMenu, onToggleSidebar }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const { user, logOut } = useAuth();
  const navigate = useNavigate();

  // Branch dropdown items
  const branchItems = [
    { id: 'all-branch', label: 'All Branch' },
    { id: 'new-branch', label: 'নতুন শাখা' },
    { id: 'unselect-branch', label: 'Unselect Branch' }
  ];

  // New dropdown items with nested structure - horizontally organized
  const newItems = [
    {
      category: 'প্রতিষ্ঠান',
      icon: FaSchool,
      items: [
        { id: 'homepage-management', label: 'হোম পেজ পরিচালনা করুন' },
        { id: 'institution-message', label: 'প্রতিষ্ঠানের বার্তা' },
        { id: 'history', label: 'ইতিহাস' },
        { id: 'contact', label: 'যোগাযোগ' },
        { id: 'facilities', label: 'সুবিধা' },
        { id: 'teachers', label: 'শিক্ষক' },
        { id: 'jobs', label: 'চাকুরী' },
        { id: 'officials', label: 'কর্মকর্তা' }
      ]
    },
    {
      category: 'শিক্ষার্থী',
      icon: FaUserGraduate,
      items: [
        { id: 'classes', label: 'ক্লাস' },
        { id: 'batches', label: 'ব্যাচ' },
        { id: 'admission-info', label: 'ভর্তি তথ্য' },
        { id: 'students', label: 'শিক্ষার্থী' },
        { id: 'syllabus', label: 'সিলেবাস' },
        { id: 'class-routine', label: 'ক্লাস রুটিন' },
        { id: 'student-leave', label: 'Student Leave' }
      ]
    },
    {
      category: 'প্রকাশনা',
      icon: FaBook,
      items: [
        { id: 'notices', label: 'নোটিশ' },
        { id: 'events', label: 'ইভেন্ট' },
        { id: 'authors', label: 'লেখক' },
        { id: 'blogs', label: 'ব্লগ' }
      ]
    },
    {
      category: 'পরীক্ষা',
      icon: FaClipboardList,
      items: [
        { id: 'grading', label: 'গ্রেডিং' },
        { id: 'exams', label: 'পরীক্ষা' },
        { id: 'exam-routine', label: 'পরীক্ষার রুটিন' },
        { id: 'results', label: 'ফলাফল' },
        { id: 'result-sheet', label: 'ফলাফল সীট' }
      ]
    }
  ];

  // Dashboard click handler
  const handleDashboardClick = () => {
    setActiveMenu('dashboard');
    onMenuClick('dashboard');
    setActiveDropdown(null);
    setIsMobileMenuOpen(false);
  };

  const handleBranchItemClick = (itemId) => {
    setActiveMenu(itemId);
    onMenuClick(itemId);
    setActiveDropdown(null);
    setIsMobileMenuOpen(false);
  };

  const handleNewItemClick = (itemId) => {
    setActiveMenu(itemId);
    onMenuClick(itemId);
    setActiveDropdown(null);
    setIsMobileMenuOpen(false);
  };

  const toggleDropdown = (dropdownName) => {
    setActiveDropdown(activeDropdown === dropdownName ? null : dropdownName);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const toggleProfileDropdown = () => {
    setIsProfileDropdownOpen(!isProfileDropdownOpen);
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await axiosInstance.post('/users/logout');
      logOut();
      navigate('/auth/login');
    } catch (error) {
      console.error('Logout error:', error);
      // Fallback: Clear local storage and redirect
      localStorage.removeItem('user');
      logOut();
      navigate('/auth/login');
    }
  };

  // Handle profile click
  const handleProfileClick = () => {
    setIsProfileDropdownOpen(false);
    // Add your profile navigation logic here
    console.log('Profile clicked');
  };

  // Handle settings click
  const handleSettingsClick = () => {
    setIsProfileDropdownOpen(false);
    // Add your settings navigation logic here
    console.log('Settings clicked');
  };

  // Get user initials for avatar - FIXED
  const getUserInitials = () => {
    if (user?.fullName) {
      return user.fullName.charAt(0).toUpperCase();
    }
    if (user?.email) {
      return user.email.charAt(0).toUpperCase();
    }
    return 'U';
  };

  // Get user display name - FIXED (removed extra ?)
  const getUserDisplayName = () => {
    if (user?.fullName) {
      return user.fullName;
    }
    if (user?.displayName) {
      return user.displayName;
    }
    return 'User';
  };

  // Get user role display name
  const getUserRoleDisplay = () => {
    if (user?.role === 'admin') return 'অ্যাডমিন';
    if (user?.role === 'moderator') return 'মডারেটর';
    return 'ইউজার';
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.profile-dropdown')) {
        setIsProfileDropdownOpen(false);
      }
      if (!event.target.closest('.nav-dropdown')) {
        setActiveDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <>
      {/* Header - Fixed & Sticky */}
      <header className="fixed top-0 left-0 right-0 bg-white shadow-sm border-b border-gray-200 z-50 h-16">
        <div className="px-4 sm:px-6 lg:px-8 h-full">
          <div className="flex justify-between items-center h-full">
            {/* Left Section - Logo and Main Navigation */}
            <div className="flex items-center space-x-4">
              {/* Mobile menu button - Triggers Sidebar */}
              <button
                onClick={onToggleSidebar}
                className="lg:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
              >
                <FaBars className="text-lg" />
              </button>

              {/* Dashboard Button */}
              <button
                onClick={handleDashboardClick}
                className={`flex items-center space-x-2 px-3 lg:px-4 py-2 rounded-lg transition-all duration-200 ${
                  activeMenu === 'dashboard' 
                    ? 'bg-blue-50 text-blue-600 border border-blue-200' 
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <FaHome className="text-base lg:text-lg" />
                <span className="font-medium hidden sm:inline">Dashboard</span>
              </button>

              {/* Branch Dropdown - Desktop Only */}
              <div className="relative hidden lg:block nav-dropdown">
                <button
                  onClick={() => toggleDropdown('branch')}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                    activeDropdown === 'branch' 
                      ? 'bg-blue-50 text-blue-600 border border-blue-200' 
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <FaCodeBranch className="text-lg" />
                  <span className="font-medium">শাখা</span>
                  <FaChevronDown className={`text-sm transition-transform duration-200 ${
                    activeDropdown === 'branch' ? 'rotate-180' : ''
                  }`} />
                </button>

                {activeDropdown === 'branch' && (
                  <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50 animate-fadeIn">
                    {branchItems.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => handleBranchItemClick(item.id)}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* New Dropdown - Desktop Only - Horizontal Layout */}
              <div className="relative hidden lg:block nav-dropdown">
                <button
                  onClick={() => toggleDropdown('new')}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                    activeDropdown === 'new' 
                      ? 'bg-blue-50 text-blue-600 border border-blue-200' 
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <FaPlus className="text-lg" />
                  <span className="font-medium">নতুন</span>
                  <FaChevronDown className={`text-sm transition-transform duration-200 ${
                    activeDropdown === 'new' ? 'rotate-180' : ''
                  }`} />
                </button>

                {activeDropdown === 'new' && (
                  <div className="absolute top-full left-0 mt-2 w-max bg-white rounded-lg shadow-lg border border-gray-200 py-4 z-50 animate-fadeIn max-w-4xl">
                    <div className="flex gap-6 px-4">
                      {newItems.map((section) => {
                        const IconComponent = section.icon;
                        return (
                          <div key={section.category} className="min-w-[200px]">
                            {/* Section Header */}
                            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-200">
                              <IconComponent className="text-blue-500 text-sm" />
                              <h3 className="text-sm font-semibold text-gray-800">
                                {section.category}
                              </h3>
                            </div>
                            
                            {/* Section Items */}
                            <div className="space-y-1">
                              {section.items.map((item) => (
                                <button
                                  key={item.id}
                                  onClick={() => handleNewItemClick(item.id)}
                                  className="w-full text-left px-2 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-md transition-all duration-200 flex items-center gap-2 group"
                                >
                                  <div className="w-1.5 h-1.5 bg-blue-300 rounded-full group-hover:bg-blue-500 transition-colors"></div>
                                  <span>{item.label}</span>
                                </button>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right Section - Icons and User Info */}
            <div className="flex items-center space-x-2 lg:space-x-4">
              {/* Home Icon */}
              <button 
                onClick={() => navigate('/')}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <FaHome className="text-lg lg:text-xl" />
              </button>

              {/* Notification Icon */}
              <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors relative">
                <FaBell className="text-lg lg:text-xl" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
              </button>

              {/* Profile Section with Dropdown */}
              <div className="relative profile-dropdown">
                <button
                  onClick={toggleProfileDropdown}
                  className="flex items-center space-x-2 lg:space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-sm">
                    <span className="text-white text-sm font-bold">
                      {getUserInitials()}
                    </span>
                  </div>
                  <div className="hidden md:block text-left">
                    <p className="text-sm font-medium text-gray-800">
                      {getUserDisplayName()}
                    </p>
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      <FaEnvelope className="text-xs" />
                      {user?.email}
                    </p>
                  </div>
                  <FaChevronDown className={`text-sm transition-transform duration-200 ${
                    isProfileDropdownOpen ? 'rotate-180' : ''
                  }`} />
                </button>

                {/* Profile Dropdown Card */}
                {isProfileDropdownOpen && (
                  <div className="absolute top-full right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50 animate-fadeIn">
                    {/* User Info Section */}
                    <div className="px-4 py-3 border-b border-gray-100">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                          <span className="text-white text-sm font-bold">
                            {getUserInitials()}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-800 truncate">
                            {getUserDisplayName()}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {user?.email}
                          </p>
                          <div className="flex items-center gap-1 mt-1">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                              user?.role === 'admin' 
                                ? 'bg-red-100 text-red-800'
                                : user?.role === 'moderator'
                                ? 'bg-purple-100 text-purple-800'
                                : 'bg-green-100 text-green-800'
                            }`}>
                              {getUserRoleDisplay()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Dropdown Menu Items */}
                    <div className="py-2">
                      <button
                        onClick={handleProfileClick}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                      >
                        <FaUser className="mr-3 text-gray-400" />
                        প্রোফাইল
                      </button>
                      
                      <button
                        onClick={handleSettingsClick}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                      >
                        <FaCog className="mr-3 text-gray-400" />
                        সেটিংস
                      </button>
                    </div>

                    {/* Logout Section */}
                    <div className="border-t border-gray-100 pt-2">
                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <FaSignOutAlt className="mr-3" />
                        লগআউট
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed top-16 left-0 right-0 bg-white border-b border-gray-200 shadow-lg z-40 animate-fadeIn">
          <div className="p-4 space-y-4 max-h-[calc(100vh-4rem)] overflow-y-auto">
            {/* Branch Mobile Menu */}
            <div className="nav-dropdown">
              <button
                onClick={() => toggleDropdown('branch-mobile')}
                className="flex items-center justify-between w-full px-4 py-3 text-left bg-gray-50 rounded-lg hover:bg-blue-50 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <FaCodeBranch className="text-gray-600" />
                  <span className="font-medium text-gray-800">শাখা</span>
                </div>
                <FaChevronDown className={`text-sm transition-transform duration-200 ${
                  activeDropdown === 'branch-mobile' ? 'rotate-180' : ''
                }`} />
              </button>

              {activeDropdown === 'branch-mobile' && (
                <div className="mt-2 ml-4 space-y-2 animate-fadeIn">
                  {branchItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => handleBranchItemClick(item.id)}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors"
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* New Mobile Menu - Horizontal Grid */}
            <div className="nav-dropdown">
              <button
                onClick={() => toggleDropdown('new-mobile')}
                className="flex items-center justify-between w-full px-4 py-3 text-left bg-gray-50 rounded-lg hover:bg-blue-50 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <FaPlus className="text-gray-600" />
                  <span className="font-medium text-gray-800">নতুন</span>
                </div>
                <FaChevronDown className={`text-sm transition-transform duration-200 ${
                  activeDropdown === 'new-mobile' ? 'rotate-180' : ''
                }`} />
              </button>

              {activeDropdown === 'new-mobile' && (
                <div className="mt-2 space-y-4 animate-fadeIn">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {newItems.map((section) => {
                      const IconComponent = section.icon;
                      return (
                        <div key={section.category} className="bg-gray-50 rounded-lg p-3 hover:bg-blue-50 transition-colors">
                          <div className="flex items-center gap-2 mb-2">
                            <IconComponent className="text-blue-500 text-sm" />
                            <h3 className="text-sm font-semibold text-gray-800">
                              {section.category}
                            </h3>
                          </div>
                          <div className="space-y-1">
                            {section.items.map((item) => (
                              <button
                                key={item.id}
                                onClick={() => handleNewItemClick(item.id)}
                                className="w-full text-left px-2 py-1 text-xs text-gray-700 hover:bg-white hover:text-blue-600 rounded transition-colors"
                              >
                                {item.label}
                              </button>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Overlay for mobile menu */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
      `}</style>
    </>
  );
};

export default Header;