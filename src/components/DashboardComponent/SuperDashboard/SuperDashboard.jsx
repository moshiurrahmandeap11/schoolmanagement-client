// SuperDashboard.jsx
import { useEffect, useState } from 'react';
import Header from './Header/Header';
import MainComponent from './MainComponent/MainComponent';
import Sidebar from './Sidebar/Sidebar';

const SuperDashboard = () => {
  const [activeMenu, setActiveMenu] = useState(() => {
    return localStorage.getItem("sidebar_active_menu") || "dashboard";
  });

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleDashboardItemClick = (item) => {
    setActiveMenu(item.id);
    if (window.innerWidth < 1024) setIsSidebarOpen(false);
  };

  const handleMenuChange = (menuId) => {
    setActiveMenu(menuId);
    if (window.innerWidth < 1024) setIsSidebarOpen(false);
  };

  const handleToggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) setIsSidebarOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      // SuperDashboard.jsx (এই লাইনটা ফিক্স করো)
<Header 
  onToggleSidebar={handleToggleSidebar} 
  activeMenu={activeMenu}
  setActiveMenu={setActiveMenu}   // <-- এটা যোগ করো (খুবই জরুরি!)
/>
      <div className="flex pt-16">
        <Sidebar
          activeMenu={activeMenu}
          setActiveMenu={handleMenuChange}
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
        />
        <MainComponent activeMenu={activeMenu} onDashboardItemClick={handleDashboardItemClick} />
      </div>
    </div>
  );
};

export default SuperDashboard;