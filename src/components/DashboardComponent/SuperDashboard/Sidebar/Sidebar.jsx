import React from 'react';
import { FaBullhorn, FaCog, FaQuoteRight, FaSchool, FaTachometerAlt, FaUserGraduate } from 'react-icons/fa';
import { PiSeat } from 'react-icons/pi';

const Sidebar = ({ activeMenu, setActiveMenu, isSidebarOpen, setIsSidebarOpen }) => {
const menuItems = [
  { id: 'dashboard', label: 'ড্যাশবোর্ড', icon: <FaTachometerAlt /> },
  { id: 'announcement', label: 'Announcement', icon: <FaBullhorn /> },
  { id: 'school-history', label: 'School History', icon: <FaSchool /> },
  { id: 'speech', label: 'Speech', icon: <FaQuoteRight /> },
  { id: 'students', label: 'Students', icon: <FaUserGraduate /> },
  { id: "total-seats", label: "Total Seat", icon: <PiSeat></PiSeat>},
  { id: 'settings', label: 'Settings', icon: <FaCog /> },
];

  return (
    <>
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-50
        w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out
        flex flex-col h-screen
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800">সুপার ড্যাশবোর্ড</h2>
          <button 
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            onClick={() => setIsSidebarOpen(false)}
          >
            <span className="text-lg">✕</span>
          </button>
        </div>
        
        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              className={`
                w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200
                ${activeMenu === item.id 
                  ? 'bg-blue-50 text-blue-600 border-r-2 border-blue-600' 
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'
                }
              `}
              onClick={() => setActiveMenu(item.id)}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold">A</span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-800">অ্যাডমিন</p>
              <p className="text-xs text-gray-500">admin@example.com</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;