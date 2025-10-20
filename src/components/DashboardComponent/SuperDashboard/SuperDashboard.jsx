import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar/Sidebar';
import MainComponent from './MainComponent/MainComponent';


const SuperDashboard = () => {
  // localStorage থেকে activeMenu লোড করুন, না থাকলে default 'dashboard'
  const [activeMenu, setActiveMenu] = useState(() => {
    const savedMenu = localStorage.getItem('superDashboardActiveMenu');
    return savedMenu || 'dashboard';
  });
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // activeMenu পরিবর্তন হলে localStorage-এ save করুন
  useEffect(() => {
    localStorage.setItem('superDashboardActiveMenu', activeMenu);
  }, [activeMenu]);

  // মেনু পরিবর্তনের ফাংশন
  const handleMenuChange = (menuId) => {
    setActiveMenu(menuId);
    setIsSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 lg:hidden">
        <div className="flex items-center justify-between p-4">
          <button 
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            onClick={() => setIsSidebarOpen(true)}
          >
            <span className="text-2xl">☰</span>
          </button>
          <h1 className="text-xl font-bold text-gray-800">সুপার ড্যাশবোর্ড</h1>
          <div className="w-10"></div> {/* For balance */}
        </div>
      </header>

      {/* Main Container */}
      <div className="flex">
        {/* Sidebar */}
        <Sidebar 
          activeMenu={activeMenu}
          setActiveMenu={handleMenuChange}
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
        />
        
        {/* Main Content */}
        <MainComponent activeMenu={activeMenu} />
      </div>
    </div>
  );
};

export default SuperDashboard;