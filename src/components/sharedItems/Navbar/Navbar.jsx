import React, { useState } from "react";
import { NavLink } from "react-router";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [openSubmenu, setOpenSubmenu] = useState(null);

  // Menu data with submenus
  const menuItems = [
    { name: "প্রচ্ছদ", path: "/" },
    {
      name: "প্রশাসন",
      submenu: [
        { name: "শিক্ষকমণ্ডলীর তালিকা", path: "/teachers" },
        { name: "কর্মকর্তা-কর্মচারীদের তালিকা", path: "/staff" },
        { name: "প্রধান শিক্ষকগণের নামের তালিকা", path: "/head-teachers" }
      ]
    },
    { name: "শিক্ষার্থীদের তথ্য", path: "/students" },
    {
      name: "ভর্তি",
      submenu: [
        { name: "ভর্তি তথ্য", path: "/admission-info" },
        { name: "ভর্তি ফরম", path: "/admission-form" }
      ]
    },
    { name: "ডাউনলোড", path: "/downloads" },
    { name: "রুটিন", path: "/routine" },
    { name: "ফলাফল", path: "/results" },
    { name: "নোটিশ", path: "/notices" },
    { name: "ব্লগ", path: "/blog" },
    {
      name: "গ্যালারী",
      submenu: [
        { name: "ফটো গ্যালারী", path: "/photo-gallery" },
        { name: "ভিডিও গ্যালারী", path: "/video-gallery" }
      ]
    },
    {
      name: "বিভিন্ন তথ্য",
      submenu: [
        { name: "কক্ষ সংখ্যা", path: "/classrooms" },
        { name: "কম্পিউটার ব্যবহার", path: "/computer-facilities" },
        { name: "ছাত্র-ছাত্রীদের আসন সংখ্যা", path: "/seats" },
        { name: "ভৌতকাঠামো", path: "/infrastructure" },
        { name: "মাল্টিমিডিয়া ক্লাসরুম", path: "/multimedia-classrooms" },
        { name: "যানবাহন সুবিধা", path: "/transport" },
        { name: "শূণ্যপদের তালিকা", path: "/vacancies" },
        { name: "ছুটির তালিকা", path: "/holidays" },
        { name: "সহপাঠ", path: "/co-curricular" },
        { name: "সার্কুলার", path: "/circulars" }
      ]
    },
    { name: "যোগাযোগ", path: "/contact" }
  ];

  const handleSubmenuToggle = (menuName) => {
    setOpenSubmenu(openSubmenu === menuName ? null : menuName);
  };

  return (
    <nav className="bg-[#016496] shadow-lg w-full">
      <div className="w-full px-2 sm:px-3 lg:px-4">
        <div className="flex justify-between items-center h-12">
          {/* Desktop Menu - Full Width */}
          <div className="hidden lg:flex lg:items-center lg:justify-between lg:w-full">
            {menuItems.map((item) => (
              <div key={item.name} className="relative group flex-1 text-center">
                {item.submenu ? (
                  <>
                    <button
                      className="flex items-center justify-center w-full text-xs font-medium text-white hover:text-yellow-400 px-1 py-1 transition-colors duration-200"
                    >
                      {item.name}
                      <svg
                        className="w-2 h-2 ml-0.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </button>
                    
                    {/* Desktop Submenu */}
                    <div className="absolute left-1/2 transform -translate-x-1/2 mt-0.5 w-48 bg-white shadow-xl rounded border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                      {item.submenu.map((subItem) => (
                        <NavLink
                          key={subItem.name}
                          to={subItem.path}
                          className={({ isActive }) =>
                            `block px-2 py-1 text-xs text-gray-800 hover:text-yellow-600 border-b border-gray-100 last:border-b-0 transition-colors duration-150 ${
                              isActive ? " text-yellow-600 font-medium" : ""
                            }`
                          }
                        >
                          {subItem.name}
                        </NavLink>
                      ))}
                    </div>
                  </>
                ) : (
                  <NavLink
                    to={item.path}
                    className={({ isActive }) =>
                      `flex items-center justify-center w-full text-xs font-medium px-1 py-1 transition-colors duration-200 ${
                        isActive
                          ? "text-white bg-[#800505] py-4 font-semibold"
                          : "text-white hover:text-yellow-400 "
                      }`
                    }
                  >
                    {item.name}
                  </NavLink>
                )}
              </div>
            ))}
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden flex justify-between items-center w-full">
            <div className="text-sm font-semibold text-white">
              মেনু
            </div>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-white hover:text-blue-200 p-1 rounded transition-colors duration-200 bg-blue-700 hover:bg-blue-600"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {isOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h16m-7 6h7"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="lg:hidden bg-[#016496] border-t border-blue-500 shadow-lg">
          <div className="px-2 py-1 space-y-0 max-h-[80vh] overflow-y-auto">
            {menuItems.map((item) => (
              <div key={item.name}>
                {item.submenu ? (
                  <>
                    <button
                      className="flex items-center justify-between w-full text-left text-xs font-medium text-white hover:text-blue-200 px-2 py-1.5 border-b border-blue-400 hover:bg-blue-700 transition-colors duration-200"
                      onClick={() => handleSubmenuToggle(item.name)}
                    >
                      {item.name}
                      <svg
                        className={`w-2 h-2 transition-transform duration-200 ${
                          openSubmenu === item.name ? "rotate-180" : ""
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </button>
                    
                    {/* Mobile Submenu */}
                    {openSubmenu === item.name && (
                      <div className="bg-blue-600 ml-2 border-l-2 border-blue-300">
                        {item.submenu.map((subItem) => (
                          <NavLink
                            key={subItem.name}
                            to={subItem.path}
                            className={({ isActive }) =>
                              `block px-3 py-1 text-xs text-white hover:bg-blue-500 hover:text-white border-b border-blue-400 last:border-b-0 transition-colors duration-150 ${
                                isActive ? "bg-blue-500 text-white font-medium" : ""
                              }`
                            }
                            onClick={() => {
                              setIsOpen(false);
                              setOpenSubmenu(null);
                            }}
                          >
                            {subItem.name}
                          </NavLink>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <NavLink
                    to={item.path}
                    className={({ isActive }) =>
                      `block text-xs font-medium px-2 py-1.5 border-b border-blue-400 transition-colors duration-200 ${
                        isActive
                          ? "text-white bg-blue-700 font-semibold"
                          : "text-white hover:text-blue-200 hover:bg-blue-700"
                      }`
                    }
                    onClick={() => setIsOpen(false)}
                  >
                    {item.name}
                  </NavLink>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;