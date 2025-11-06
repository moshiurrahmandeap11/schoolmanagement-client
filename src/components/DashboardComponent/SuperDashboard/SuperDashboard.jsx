// SuperDashboard.jsx
import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar/Sidebar';
import MainComponent from './MainComponent/MainComponent';
import Header from './Header/Header';

const SuperDashboard = () => {
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // SDashboardItems থেকে ক্লিক হ্যান্ডলার
  const handleDashboardItemClick = (item) => {
    setActiveMenu(item.id); // এখানে id সেট করা হচ্ছে
    if (window.innerWidth < 1024) {
      setIsSidebarOpen(false);
    }
  };

  const handleMenuChange = (menuId) => {
    setActiveMenu(menuId);
    if (window.innerWidth < 1024) {
      setIsSidebarOpen(false);
    }
  };

  const handleHeaderMenuClick = (menuId) => {
    setActiveMenu(menuId);
    setIsSidebarOpen(false);
  };

  const handleToggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsSidebarOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        onMenuClick={handleHeaderMenuClick}
        activeMenu={activeMenu}
        setActiveMenu={setActiveMenu}
        onToggleSidebar={handleToggleSidebar}
      />

      <div className="flex pt-16">
        <Sidebar 
          activeMenu={activeMenu}
          setActiveMenu={handleMenuChange}
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
        />
        
        <MainComponent 
          activeMenu={activeMenu}
          onDashboardItemClick={handleDashboardItemClick} // প্রপ পাস করা হলো
        />
      </div>
    </div>
  );
};

export default SuperDashboard;