import React, { useState, useEffect } from 'react';
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
  FaHistory,
  FaPhone,
  FaEnvelope,
  FaCalendarDay,
  FaHome,
  FaInfoCircle,
  FaFileAlt,
  FaShieldAlt,
  FaLink
} from 'react-icons/fa';
import { ImInfo } from 'react-icons/im';
import { MdClass, MdManageHistory, MdReport, MdRoom } from 'react-icons/md';
import { PiSeat } from 'react-icons/pi';
import { CgFormatBold, CgChevronDown, CgClose } from 'react-icons/cg';
import { Book,  Notebook, Section } from 'lucide-react';
import { SiSession } from 'react-icons/si';
import { BsPatchCheck } from 'react-icons/bs';
import { GiTeacher } from 'react-icons/gi';
import { RiOutletLine } from 'react-icons/ri';
import { GoReport } from 'react-icons/go';

// ====================================
// এখানে শুধু মেনু যোগ করুন - খুবই সহজ!
// ====================================
const MENU_ITEMS = [
  // সিম্পল মেনু (সাবমেনু ছাড়া)
    {
    id: 'home',
    label: 'হোম পৃষ্ঠা',
    icon: FaHome,
    color: 'blue',
    submenu: [
      { id: 'institute-info', label: 'প্রতিষ্ঠানের তথ্য হালনাগাদ', icon: FaInfoCircle },
      { id: 'update-images', label: 'Update Images', icon: FaImages },
      { id: 'history', label: 'ইতিহাস', icon: FaHistory },
      { id: 'annual-reports', label: 'Annual Reports', icon: FaFileAlt },
      { id: 'contact', label: 'যোগাযোগ', icon: FaPhone },
      { id: 'social-links', label: 'সামাজিক লিংকসমূহ', icon: FaLink },
      { id: 'privacy-policy', label: 'প্রাইভেসি পলিসি', icon: FaShieldAlt },
    ]
  },
  {
    id: 'class',
    label: "ক্লাস",
    icon: MdClass,
    color: "blue",
    submenu: [
      { id: "session", label: "সেশন", icon: SiSession},
      { id: "class-id", label: "ক্লাস", icon: MdClass},
      { id: "section", label: "সেকশন", icon: Section},
      { id: "batch", label: "ব্যাচ", icon: BsPatchCheck},
      { id: "patthokrom", label: "পাঠ্যক্রম", icon: Book},
      { id: "class-wise-teacher", label: "ক্লাসভিত্তিক শিক্ষক যোগ", icon: GiTeacher},
      { id: "divide-pattokrom", label: "পাঠ্যক্রম বণ্টন", icon: Book},
      { id: "class-routine", label: "ক্লাস রুটিন", icon: RiOutletLine},
      { id: "plus-new-report", label: "+New Report", icon: GoReport},
      { id: "class-report-list", label: "Class Report List", icon: MdReport},
    ]
  },
  { id: 'announcement', label: 'Announcement', icon: FaBullhorn },
  { id: 'notice', label: 'Notice', icon: FaBullhorn },
  { id: 'routine', label: 'Routine', icon: FaCalendarDay },
  { id: 'school-history', label: 'School History', icon: FaSchool },
  { id: 'speech', label: 'Speech', icon: FaQuoteRight },

  // সাবমেনু সহ মেনু


  {
    id: 'student',
    label: 'Manage Student',
    icon: FaUserGraduate,
    color: 'green',
    submenu: [
      { id: 'students', label: 'Students', icon: FaUserGraduate },
      { id: 'total-seats', label: 'Total Seat', icon: PiSeat },
      { id: 'class-rooms', label: 'Class Rooms', icon: MdRoom },
      { id: 'admission-info', label: 'Admission Info', icon: ImInfo },
      { id: 'admission-form', label: 'Admission Form', icon: CgFormatBold },
    ]
  },

  {
    id: 'teachers',
    label: 'Management',
    icon: FaChalkboardTeacher,
    color: 'purple',
    submenu: [
      { id: 'teacher-list', label: 'Teacher List', icon: FaChalkboardTeacher },
      { id: 'workers-list', label: 'Workers List', icon: FaUserFriends },
      { id: 'headmasters-list', label: 'Headmasters List', icon: FaUserTie },
      { id: 'off-days', label: 'Off Days', icon: FaCalendarAlt },
      { id: 'circular', label: 'Circular', icon: FaBell },
    ]
  },

  {
    id: 'gallery',
    label: 'Gallery',
    icon: FaImages,
    color: 'orange',
    submenu: [
      { id: 'photo-gallery', label: 'Photo Gallery', icon: FaImages },
      { id: 'video-gallery', label: 'Video Gallery', icon: FaVideo },
    ]
  },

  {
    id: 'history',
    label: 'History',
    icon: FaHistory,
    color: 'red',
    submenu: [
      { id: 'upazilla-history', label: 'Upazilla History', icon: FaHistory },
      { id: 'zilla-history', label: 'Zilla History', icon: FaHistory },
    ]
  },

  {
    id: 'contact',
    label: 'যোগাযোগ',
    icon: FaPhone,
    color: 'indigo',
    submenu: [
      { id: 'contact-info', label: 'যোগাযোগ তথ্য', icon: FaEnvelope },
      { id: 'social-links-sub', label: 'সোশ্যাল মিডিয়া', icon: FaBullhorn },
    ]
  },

  // আরও সিম্পল মেনু
  { id: 'blogs', label: 'Blogs', icon: Notebook },
  { id: 'managing', label: 'Committee', icon: MdManageHistory },
  { id: 'settings', label: 'Settings', icon: FaCog }
];

// ====================================
// মূল কম্পোনেন্ট
// ====================================
const Sidebar = ({ activeMenu, setActiveMenu, isSidebarOpen, setIsSidebarOpen }) => {
  const [openSubmenus, setOpenSubmenus] = useState({});

  const handleMenuClick = (menuId) => {
    setActiveMenu(menuId);
    if (window.innerWidth < 1024) {
      setIsSidebarOpen(false);
    }
  };

  const toggleSubmenu = (menuId) => {
    setOpenSubmenus(prev => ({
      ...prev,
      [menuId]: !prev[menuId]
    }));
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (window.innerWidth < 1024 && isSidebarOpen) {
        const sidebar = document.getElementById('sidebar');
        const mobileToggle = document.querySelector('[data-mobile-toggle]');
        if (sidebar && !sidebar.contains(event.target) && !mobileToggle?.contains(event.target)) {
          setIsSidebarOpen(false);
        }
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isSidebarOpen, setIsSidebarOpen]);

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape' && isSidebarOpen) {
        setIsSidebarOpen(false);
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isSidebarOpen, setIsSidebarOpen]);

  // সিম্পল মেনু আইটেম
  const MenuItem = ({ item, isSubmenuItem = false }) => {
    const Icon = item.icon;
    const isActive = activeMenu === item.id;
    
    return (
      <button
        onClick={() => handleMenuClick(item.id)}
        className={`
          w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200
          text-left hover:scale-[1.02] active:scale-[0.98]
          ${isActive 
            ? 'bg-blue-50 text-blue-600 border-r-2 border-blue-600' 
            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'
          }
          ${isSubmenuItem ? 'text-sm pl-12' : ''}
        `}
      >
        <Icon className={`text-xl ${isActive ? 'text-blue-600' : 'text-gray-500'}`} />
        <span className="font-medium flex-1">{item.label}</span>
      </button>
    );
  };

  // সাবমেনু সহ মেনু আইটেম
  const MenuWithSubmenu = ({ item }) => {
    const Icon = item.icon;
    const isOpen = openSubmenus[item.id];
    const hasActiveItem = item.submenu?.some(sub => sub.id === activeMenu);
    const colorClass = item.color || 'blue';

    return (
      <div className="mt-2">
        <button
          onClick={() => toggleSubmenu(item.id)}
          className={`
            w-full flex items-center justify-between gap-3 px-4 py-3 rounded-lg transition-all duration-200
            ${hasActiveItem
              ? `bg-${colorClass}-50 text-${colorClass}-600` 
              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'
            }
          `}
        >
          <div className="flex items-center gap-3">
            <Icon className={`text-xl ${hasActiveItem ? `text-${colorClass}-600` : 'text-gray-500'}`} />
            <span className="font-medium">{item.label}</span>
          </div>
          <CgChevronDown className={`text-lg transition-transform duration-200 ${isOpen ? 'rotate-0' : '-rotate-90'}`} />
        </button>

        {isOpen && (
          <div className="mt-1 space-y-1 animate-fadeIn">
            {item.submenu.map((subItem) => (
              <MenuItem key={subItem.id} item={subItem} isSubmenuItem={true} />
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden animate-fadeIn"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
      
      <aside 
        id="sidebar"
        className={`
          fixed lg:sticky top-16 left-0 h-[calc(100vh-4rem)] w-64 bg-white shadow-xl lg:shadow-lg 
          transform transition-transform duration-300 ease-in-out flex flex-col border-r border-gray-200
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} z-40
        `}
      >
        <div className="lg:hidden flex justify-between items-center p-4 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-800">মেনু</h2>
          <button onClick={() => setIsSidebarOpen(false)} className="p-2 rounded-lg hover:bg-gray-100">
            <CgClose className="text-xl text-gray-600" />
          </button>
        </div>

        <div className="hidden lg:flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800">সুপার ড্যাশবোর্ড</h2>
        </div>
        
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {MENU_ITEMS.map((item) => (
            item.submenu ? (
              <MenuWithSubmenu key={item.id} item={item} />
            ) : (
              <MenuItem key={item.id} item={item} />
            )
          ))}
        </nav>
      </aside>

      <style jsx>{`
        .bg-blue-50 { background-color: #eff6ff; }
        .text-blue-600 { color: #2563eb; }
        .border-blue-600 { border-color: #2563eb; }
        .bg-green-50 { background-color: #f0fdf4; }
        .text-green-600 { color: #16a34a; }
        .bg-purple-50 { background-color: #faf5ff; }
        .text-purple-600 { color: #9333ea; }
        .bg-orange-50 { background-color: #fff7ed; }
        .text-orange-600 { color: #ea580c; }
        .bg-red-50 { background-color: #fef2f2; }
        .text-red-600 { color: #dc2626; }
        .bg-indigo-50 { background-color: #eef2ff; }
        .text-indigo-600 { color: #4f46e5; }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn { animation: fadeIn 0.2s ease-out; }
      `}</style>
    </>
  );
};

export default Sidebar;