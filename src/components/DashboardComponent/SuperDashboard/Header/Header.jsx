import { useEffect, useState } from 'react';
import {
  FaBars,
  FaBook,
  FaChevronDown,
  FaClipboardList,
  FaCodeBranch,
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

const Header = ({ onToggleSidebar, activeMenu, setActiveMenu }) => {
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

  // New dropdown items
  const newItems = [
    {
      category: 'প্রতিষ্ঠান',
      icon: FaSchool,
      items: [
        { id: 'homepage-management', label: 'হোম পেজ পরিচালনা করুন' },
        { id: 'institution-message', label: 'প্রতিষ্ঠানের বার্তা' },
        { id: 'historys', label: 'ইতিহাস' },
        { id: 'contacts', label: 'যোগাযোগ' },
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
        { id: 'classess', label: 'ক্লাস' },
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

  // Handlers
  const handleDashboardClick = () => {
    setActiveMenu('dashboard');
    setActiveDropdown(null);
    setIsMobileMenuOpen(false);
  };

  const handleBranchItemClick = (itemId) => {
    setActiveMenu(itemId);
    setActiveDropdown(null);
    setIsMobileMenuOpen(false);
  };

  const handleNewItemClick = (itemId) => {
    setActiveMenu(itemId);
    setActiveDropdown(null);
    setIsMobileMenuOpen(false);
  };

  const toggleDropdown = (name) => {
    setActiveDropdown(activeDropdown === name ? null : name);
  };

  const toggleProfileDropdown = () => {
    setIsProfileDropdownOpen(!isProfileDropdownOpen);
  };

  const handleLogout = async () => {
    try {
      await axiosInstance.post('/users/logout');
      logOut();
      navigate('/auth/login');
    } catch  {
      localStorage.removeItem('user');
      logOut();
      navigate('/auth/login');
    }
  };

  const handleProfileClick = () => {
    setIsProfileDropdownOpen(false);
    navigate("/super/dashboard/profile");
  };

  const getUserInitials = () => (user?.fullName?.[0] || user?.email?.[0] || 'U').toUpperCase();
  const getUserDisplayName = () => user?.fullName || user?.displayName || 'User';
  const getUserRoleDisplay = () => {
    if (user?.role === 'admin') return 'অ্যাডমিন';
    if (user?.role === 'moderator') return 'মডারেটর';
    return 'ইউজার';
  };

  // Click outside close
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.profile-dropdown')) setIsProfileDropdownOpen(false);
      if (!e.target.closest('.nav-dropdown')) setActiveDropdown(null);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 bg-white shadow-sm border-b border-gray-200 z-70 h-16">
        <div className="px-4 sm:px-6 lg:px-8 h-full">
          <div className="flex justify-between items-center h-full">

            {/* Left Side */}
            <div className="flex items-center space-x-4">
              <button onClick={onToggleSidebar} className="lg:hidden p-2 rounded-md text-gray-600 hover:bg-gray-100">
                <FaBars className="text-lg" />
              </button>

              {/* Dashboard */}
              <button
                onClick={handleDashboardClick}
                className={`flex items-center space-x-2 px-3 lg:px-4 py-2 rounded-lg transition-all border ${
                  activeMenu === 'dashboard'
                    ? 'bg-[#1e90c9] text-white border-blue-200'
                    : 'text-gray-700 hover:bg-gray-50 border-transparent'
                }`}
              >
                <FaHome className="text-lg" />
                <span className="font-medium hidden sm:inline">Dashboard</span>
              </button>

              {/* শাখা Dropdown */}
              <div className="relative hidden lg:block nav-dropdown">
                <button
                  onClick={() => toggleDropdown('branch')}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all border ${
                    activeDropdown === 'branch' ? 'bg-[#1e90c9] text-white border-blue-200' : 'text-gray-700 hover:bg-gray-50 border-transparent'
                  }`}
                >
                  <FaCodeBranch className="text-lg" />
                  <span className="font-medium">শাখা</span>
                  <FaChevronDown className={`text-sm transition-transform ${activeDropdown === 'branch' ? 'rotate-180' : ''}`} />
                </button>

                {activeDropdown === 'branch' && (
                  <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-80 animate-fadeIn">
                    {branchItems.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => handleBranchItemClick(item.id)}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600"
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* নতুন Dropdown */}
              <div className="relative hidden lg:block nav-dropdown">
                <button
                  onClick={() => toggleDropdown('new')}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all border ${
                    activeDropdown === 'new' ? 'bg-[#1e90c9] text-white border-blue-200' : 'text-gray-700 hover:bg-gray-50 border-transparent'
                  }`}
                >
                  <FaPlus className="text-lg" />
                  <span className="font-medium">নতুন</span>
                  <FaChevronDown className={`text-sm transition-transform ${activeDropdown === 'new' ? 'rotate-180' : ''}`} />
                </button>

                {activeDropdown === 'new' && (
                  <div className="absolute top-full left-0 mt-2 w-max bg-white rounded-lg shadow-lg border border-gray-200 py-4 z-80 animate-fadeIn max-w-4xl">
                    <div className="flex gap-6 px-4">
                      {newItems.map((section) => {
                        const Icon = section.icon;
                        return (
                          <div key={section.category} className="min-w-[200px]">
                            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-200">
                              <Icon className="text-blue-500 text-sm" />
                              <h3 className="text-sm font-semibold text-gray-800">{section.category}</h3>
                            </div>
                            <div className="space-y-1">
                              {section.items.map((item) => (
                                <button
                                  key={item.id}
                                  onClick={() => handleNewItemClick(item.id)}
                                  className="w-full text-left px-2 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-md flex items-center gap-2 group"
                                >
                                  <div className="w-1.5 h-1.5 bg-blue-300 rounded-full group-hover:bg-blue-500"></div>
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

            {/* Right Side */}
            <div className="flex items-center space-x-4">

              <button onClick={() => navigate('/')} className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                <FaHome className="text-xl" />
              </button>

              {/* Profile Dropdown */}
              <div className="relative profile-dropdown">
                <button
                  onClick={toggleProfileDropdown}
                  className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50"
                >
                  <div className="w-8 h-8 bg-[#1e90c9] rounded-full flex items-center justify-center shadow-sm">
                    <span className="text-white text-sm font-bold">{getUserInitials()}</span>
                  </div>
                  <div className="hidden md:block text-left">
                    <p className="text-sm font-medium text-gray-800">{getUserDisplayName()}</p>
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      <FaEnvelope className="text-xs" /> {user?.email}
                    </p>
                  </div>
                  <FaChevronDown className={`text-sm transition-transform ${isProfileDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {isProfileDropdownOpen && (
                  <div className="absolute top-full right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-80 animate-fadeIn">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-[#1e90c9] rounded-full flex items-center justify-center">
                          <span className="text-white font-bold">{getUserInitials()}</span>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-800 truncate">{getUserDisplayName()}</p>
                          <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                          <span className={`mt-1 inline-block px-2 py-0.5 rounded text-xs font-medium ${
                            user?.role === 'admin' ? 'bg-red-100 text-red-800' :
                            user?.role === 'moderator' ? 'bg-purple-100 text-purple-800' :
                            'bg-[#1e90c9] text-white'
                          }`}>
                            {getUserRoleDisplay()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="py-2">
                      <button onClick={handleProfileClick} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 flex items-center">
                        <FaUser className="mr-3" /> প্রোফাইল
                      </button>
                    </div>
                    <div className="border-t pt-2">
                      <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center">
                        <FaSignOutAlt className="mr-3" /> লগআউট
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
        <>
          <div className="lg:hidden fixed top-16 left-0 right-0 bg-white border-b border-gray-200 shadow-lg z-65 animate-fadeIn">
            <div className="p-4 space-y-4 max-h-[calc(100vh-4rem)] overflow-y-auto">
              {/* Mobile শাখা & নতুন মেনু তোমার আগের মতোই রাখতে পারো */}
              {/* (এখানে তোমার আগের মোবাইল মেনু কোড রাখো) */}
            </div>
          </div>
          <div className="fixed inset-0 bg-black/50 z-60 lg:hidden" onClick={() => setIsMobileMenuOpen(false)} />
        </>
      )}

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn { animation: fadeIn 0.2s ease-out; }
      `}</style>
    </>
  );
};

export default Header;