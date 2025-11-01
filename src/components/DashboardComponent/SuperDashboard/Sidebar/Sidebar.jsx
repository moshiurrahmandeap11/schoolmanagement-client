import { Notebook } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { 
  CgFormatBold, 
  CgChevronDown, 
  CgChevronRight,
  CgMenu,
  CgClose 
} from 'react-icons/cg';
import { 
  FaBullhorn, 
  FaCog, 
  FaQuoteRight, 
  FaSchool, 
  FaTachometerAlt, 
  FaUserGraduate, 
  FaChalkboardTeacher,
  FaUserTie,
  FaUserFriends,
  FaCalendarAlt,
  FaBell,
  FaImages,
  FaVideo,
  FaHistory
} from 'react-icons/fa';
import { ImInfo } from 'react-icons/im';
import { MdManageHistory, MdRoom } from 'react-icons/md';
import { PiSeat } from 'react-icons/pi';

const Sidebar = ({ activeMenu, setActiveMenu }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [openSubmenus, setOpenSubmenus] = useState({
    student: false,
    teachers: false,
    gallery: false,
    history: false, // New history submenu state
  });

  // Menu configuration - History submenu added
  const menuConfig = {
    main: [
      { id: 'dashboard', label: 'ড্যাশবোর্ড', icon: FaTachometerAlt },
      { id: 'announcement', label: 'Announcement', icon: FaBullhorn },
      { id: 'school-history', label: 'School History', icon: FaSchool },
      { id: 'speech', label: 'Speech', icon: FaQuoteRight },
    ],
    student: {
      title: 'Manage Student',
      icon: FaUserGraduate,
      color: 'blue',
      items: [
        { id: 'students', label: 'Students', icon: FaUserGraduate },
        { id: 'total-seats', label: 'Total Seat', icon: PiSeat },
        { id: 'class-rooms', label: 'Class Rooms', icon: MdRoom },
        { id: 'admission-info', label: 'Admission Info', icon: ImInfo },
        { id: 'admission-form', label: 'Admission Form', icon: CgFormatBold },
      ]
    },
    teachers: {
      title: 'Management',
      icon: FaChalkboardTeacher,
      color: 'green',
      items: [
        { id: 'teacher-list', label: 'Teacher List', icon: FaChalkboardTeacher },
        { id: 'workers-list', label: 'Workers List', icon: FaUserFriends },
        { id: 'headmasters-list', label: 'Headmasters List', icon: FaUserTie },
        { id: 'off-days', label: 'Off Days', icon: FaCalendarAlt },
        { id: 'circular', label: 'Circular', icon: FaBell },
      ]
    },
    gallery: {
      title: 'Gallery',
      icon: FaImages,
      color: 'purple',
      items: [
        { id: 'photo-gallery', label: 'Photo Gallery', icon: FaImages },
        { id: 'video-gallery', label: 'Video Gallery', icon: FaVideo },
      ]
    },
    history: { // New history submenu
      title: 'History',
      icon: FaHistory,
      color: 'orange',
      items: [
        { id: 'upazilla-history', label: 'Upazilla History', icon: FaHistory },
        { id: 'zilla-history', label: 'Zilla History', icon: FaHistory },
      ]
    },
    blogs: { id: "blogs", label: "Blogs", icon: Notebook},
    managing: { id: "managing", label: "Committee", icon: MdManageHistory},
    settings: { id: 'settings', label: 'Settings', icon: FaCog }
  };

  // Close sidebar on mobile when menu is clicked
  const handleMenuClick = (menuId) => {
    setActiveMenu(menuId);
    if (window.innerWidth < 1024) {
      setIsSidebarOpen(false);
    }
  };

  // Toggle submenu
  const toggleSubmenu = (submenu) => {
    setOpenSubmenus(prev => ({
      ...prev,
      [submenu]: !prev[submenu]
    }));
  };

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (window.innerWidth < 1024 && isSidebarOpen) {
        const sidebar = document.getElementById('sidebar');
        if (sidebar && !sidebar.contains(event.target)) {
          setIsSidebarOpen(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isSidebarOpen]);

  // Close sidebar on escape key
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape' && isSidebarOpen) {
        setIsSidebarOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isSidebarOpen]);

  // Menu item component
  const MenuItem = ({ item, level = 0, isSubmenu = false }) => {
    const Icon = item.icon;
    const isActive = activeMenu === item.id;
    
    return (
      <button
        onClick={() => handleMenuClick(item.id)}
        className={`
          w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200
          text-left hover:scale-[1.02] active:scale-[0.98]
          ${isActive 
            ? `bg-${menuConfig[item.color]?.color || 'blue'}-50 text-${menuConfig[item.color]?.color || 'blue'}-600 border-r-2 border-${menuConfig[item.color]?.color || 'blue'}-600` 
            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'
          }
          ${isSubmenu ? 'text-sm pl-12' : ''}
        `}
      >
        <Icon className={`text-xl ${isActive ? `text-${menuConfig[item.color]?.color || 'blue'}-600` : 'text-gray-500'}`} />
        <span className="font-medium flex-1">{item.label}</span>
      </button>
    );
  };

  // Submenu component
  const Submenu = ({ config, submenuKey }) => {
    const { title, icon: Icon, color, items } = config;
    const isOpen = openSubmenus[submenuKey];
    const hasActiveItem = items.some(item => item.id === activeMenu);

    return (
      <div className="mt-4">
        <button
          onClick={() => toggleSubmenu(submenuKey)}
          className={`
            w-full flex items-center justify-between gap-3 px-4 py-3 rounded-lg transition-all duration-200
            ${hasActiveItem
              ? `bg-${color}-50 text-${color}-600` 
              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'
            }
          `}
        >
          <div className="flex items-center gap-3">
            <Icon className={`text-xl ${hasActiveItem ? `text-${color}-600` : 'text-gray-500'}`} />
            <span className="font-medium">{title}</span>
          </div>
          <div className={`transition-transform duration-200 ${isOpen ? 'rotate-0' : '-rotate-90'}`}>
            <CgChevronDown className="text-lg" />
          </div>
        </button>

        {isOpen && (
          <div className="mt-1 space-y-1 animate-fadeIn">
            {items.map((item) => (
              <MenuItem 
                key={item.id} 
                item={item} 
                isSubmenu={true}
              />
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-white shadow-sm z-30 p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            {isSidebarOpen ? <CgClose className="text-xl" /> : <CgMenu className="text-xl" />}
          </button>
          <h1 className="text-lg font-bold text-gray-800">সুপার ড্যাশবোর্ড</h1>
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-bold">A</span>
          </div>
        </div>
      </div>

      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden animate-fadeIn"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <div 
        id="sidebar"
        className={`
          fixed lg:static inset-y-0 left-0 z-50
          w-64 bg-white shadow-xl lg:shadow-lg transform transition-transform duration-300 ease-in-out
          flex flex-col h-screen border-r border-gray-200
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          lg:mt-0 mt-16
        `}
      >
        {/* Sidebar Header - Desktop */}
        <div className="hidden lg:flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800">সুপার ড্যাশবোর্ড</h2>
        </div>
        
        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {/* Main Menu Items */}
          {menuConfig.main.map((item) => (
            <MenuItem key={item.id} item={item} />
          ))}

          {/* Submenus */}
          <Submenu config={menuConfig.student} submenuKey="student" />
          <Submenu config={menuConfig.teachers} submenuKey="teachers" />
          <Submenu config={menuConfig.gallery} submenuKey="gallery" />
          <Submenu config={menuConfig.history} submenuKey="history" /> {/* New History Submenu */}

          {/* Blogs */}
          <div className='mt-4'>
            <MenuItem item={menuConfig.blogs} />
          </div>

          {/* Managing Committee */}
          <div className='mt-4'>
            <MenuItem item={menuConfig.managing} />
          </div>

          {/* Settings */}
          <div className="mt-4">
            <MenuItem item={menuConfig.settings} />
          </div>
        </nav>

        {/* Sidebar Footer - Desktop */}
        <div className="hidden lg:block p-4 border-t border-gray-200">
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-bold">A</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-800 truncate">অ্যাডমিন</p>
              <p className="text-xs text-gray-500 truncate">admin@example.com</p>
            </div>
          </div>
        </div>
      </div>

      {/* Custom Styles for safe color classes */}
      <style jsx>{`
        .bg-blue-50 { background-color: #eff6ff; }
        .text-blue-600 { color: #2563eb; }
        .border-blue-600 { border-color: #2563eb; }
        .bg-green-50 { background-color: #f0fdf4; }
        .text-green-600 { color: #16a34a; }
        .border-green-600 { border-color: #16a34a; }
        .bg-purple-50 { background-color: #faf5ff; }
        .text-purple-600 { color: #9333ea; }
        .border-purple-600 { border-color: #9333ea; }
        .bg-orange-50 { background-color: #fff7ed; }
        .text-orange-600 { color: #ea580c; }
        .border-orange-600 { border-color: #ea580c; }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
      `}</style>
    </>
  );
};

export default Sidebar;