import React, { useState } from 'react';
import {
    FaArrowLeft,
    FaBars,
    FaBell,
    FaBlog,
    FaBus,
    FaCalendarAlt,
    FaCamera,
    FaFacebook,
    FaFileAlt,
    FaHistory,
    FaImage,
    FaInfoCircle,
    FaListOl,
    FaPhone,
    FaPlayCircle,
    FaQuoteLeft,
    FaShieldAlt,
    FaUserEdit,
    FaVideo
} from 'react-icons/fa';

// Import your actual components here (you'll need to create these)
import Blog from '../../../Sidebar/BlogsAdmin/BlogsAdmin';
import Notice from '../../../Sidebar/NoticesAdmin/NoticesAdmin';
import Gallery from '../../../Sidebar/PhotoGallaryAdmin/PhotoGallaryAdmin';
import History from '../../../Sidebar/SchoolHistory/SchoolHistory';
import HomeImage from '../../../Sidebar/Settings/Settings';
import Messages from '../../../Sidebar/SpeechAdmin/SpeechAdmin';
import Media from '../../../Sidebar/VideoGallaryAdmin/VideoGallaryAdmin';
import Authors from './Authors/Authors';
import Contact from './Contact/Contact';
import Events from './Events/Events';
import Facilities from './Facilities/Facilities';
import InstituteInfo from './InstitueInfo/InstituteInfo';
import Menu from './Menu/Menu';
import Pages from './Pages/Pages';
import Playlist from './Playlist/Playlist';
import PrivacyPolicy from './PrivacyPolicy/PrivacyPolicy';
import SocialLinks from './SocialLinks/SocialLinks';
import Video from './Video/Video';

const WebsiteAdmin = () => {
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' or specific component

  const menuItems = [
    {
      id: 'institute-info',
      title: 'Institute Info',
      subtitle: 'Add Institute basic information',
      icon: FaInfoCircle,
      color: 'blue',
      component: InstituteInfo
    },
    {
      id: 'home-image',
      title: 'Home Image',
      subtitle: 'Add home page Images',
      icon: FaImage,
      color: 'purple',
      component: HomeImage
    },
    {
      id: 'history',
      title: 'ইতিহাস',
      subtitle: 'Write about the institute history',
      icon: FaHistory,
      color: 'amber',
      component: History
    },
    {
      id: 'contact',
      title: 'যোগাযোগ',
      subtitle: 'Institute contact with number, email',
      icon: FaPhone,
      color: 'green',
      component: Contact
    },
    {
      id: 'notice',
      title: 'নোটিশ',
      subtitle: 'Create notices for each class',
      icon: FaBell,
      color: 'red',
      component: Notice
    },
    {
      id: 'events',
      title: 'ইভেন্ট',
      subtitle: 'Create upcoming events',
      icon: FaCalendarAlt,
      color: 'pink',
      component: Events
    },
    {
      id: 'gallery',
      title: 'ফটো গ্যালারি',
      subtitle: 'Image gallery',
      icon: FaCamera,
      color: 'indigo',
      component: Gallery
    },
    {
      id: 'facilities',
      title: 'সুবিধা',
      subtitle: 'Add facilities like transport, hostel etc',
      icon: FaBus,
      color: 'teal',
      component: Facilities
    },
    {
      id: 'social-links',
      title: 'সামাজিক লিংক সমূহ',
      subtitle: 'Add your social media links like facebook',
      icon: FaFacebook,
      color: 'blue',
      component: SocialLinks
    },
    {
      id: 'privacy-policy',
      title: 'গোপনীয়তা নীতি',
      subtitle: 'Privacy Policy for the website',
      icon: FaShieldAlt,
      color: 'gray',
      component: PrivacyPolicy
    },
    {
      id: 'messages',
      title: 'বানী',
      subtitle: 'Founder and Principal Messages',
      icon: FaQuoteLeft,
      color: 'yellow',
      component: Messages
    },
    {
      id: 'media',
      title: 'Media',
      subtitle: 'Create media for your youtube channel',
      icon: FaPlayCircle,
      color: 'red',
      component: Media
    },
    {
      id: 'authors',
      title: 'লেখক',
      subtitle: 'Blog Author',
      icon: FaUserEdit,
      color: 'purple',
      component: Authors
    },
    {
      id: 'blog',
      title: 'ব্লগ',
      subtitle: 'Create blog with category',
      icon: FaBlog,
      color: 'green',
      component: Blog
    },
    {
      id: 'menu',
      title: 'Menu',
      subtitle: 'Create your custom menu',
      icon: FaBars,
      color: 'blue',
      component: Menu
    },
    {
      id: 'pages',
      title: 'Page',
      subtitle: 'Create custom page with custom menu',
      icon: FaFileAlt,
      color: 'indigo',
      component: Pages
    },
    {
      id: 'playlist',
      title: 'Playlist',
      subtitle: 'Notice, Events, Blog, Contact',
      icon: FaListOl,
      color: 'orange',
      component: Playlist
    },
    {
      id: 'video',
      title: 'Video',
      subtitle: 'Notice, Events, Blog, Contact',
      icon: FaVideo,
      color: 'red',
      component: Video
    }
  ];

  const getColorClasses = (color) => {
    const colorMap = {
      blue: { bg: 'bg-blue-100', hoverBg: 'bg-blue-200', text: 'text-blue-600', border: 'border-blue-400' },
      purple: { bg: 'bg-purple-100', hoverBg: 'bg-purple-200', text: 'text-purple-600', border: 'border-purple-400' },
      amber: { bg: 'bg-amber-100', hoverBg: 'bg-amber-200', text: 'text-amber-600', border: 'border-amber-400' },
      green: { bg: 'bg-green-100', hoverBg: 'bg-green-200', text: 'text-green-600', border: 'border-green-400' },
      red: { bg: 'bg-red-100', hoverBg: 'bg-red-200', text: 'text-red-600', border: 'border-red-400' },
      pink: { bg: 'bg-pink-100', hoverBg: 'bg-pink-200', text: 'text-pink-600', border: 'border-pink-400' },
      indigo: { bg: 'bg-indigo-100', hoverBg: 'bg-indigo-200', text: 'text-indigo-600', border: 'border-indigo-400' },
      teal: { bg: 'bg-teal-100', hoverBg: 'bg-teal-200', text: 'text-teal-600', border: 'border-teal-400' },
      gray: { bg: 'bg-gray-100', hoverBg: 'bg-gray-200', text: 'text-gray-600', border: 'border-gray-400' },
      yellow: { bg: 'bg-yellow-100', hoverBg: 'bg-yellow-200', text: 'text-yellow-600', border: 'border-yellow-400' },
      orange: { bg: 'bg-orange-100', hoverBg: 'bg-orange-200', text: 'text-orange-600', border: 'border-orange-400' }
    };
    return colorMap[color] || colorMap.blue;
  };

  const handleCardClick = (itemId) => {
    setActiveTab(itemId);
  };

  const handleBack = () => {
    setActiveTab('dashboard');
  };

  // If a specific tab is selected, show its component
  if (activeTab !== 'dashboard') {
    const currentItem = menuItems.find(item => item.id === activeTab);
    const ComponentToRender = currentItem?.component;

    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header with Back Button - Branch component এর মতো */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm">
          <div className="flex items-center gap-4 p-4 sm:p-6">
            <button
              onClick={handleBack}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <FaArrowLeft className="text-xl text-gray-600" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                {currentItem?.title}
              </h1>
              <p className="text-gray-600">
                {currentItem?.subtitle}
              </p>
            </div>
          </div>
        </div>

        {/* Content Area - Branch component এর মতো */}
        <div className="p-4 sm:p-6 lg:p-8">
          {ComponentToRender ? (
            <ComponentToRender />
          ) : (
            <div className="max-w-4xl mx-auto">
              <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
                <div className="text-center py-12">
                  <div className={`w-20 h-20 mx-auto mb-5 ${getColorClasses(currentItem?.color).bg} rounded-full flex items-center justify-center`}>
                    {currentItem?.icon && React.createElement(currentItem.icon, { 
                      className: `text-3xl ${getColorClasses(currentItem?.color).text}` 
                    })}
                  </div>
                  <h2 className="text-3xl font-bold text-gray-800 mb-3">
                    {currentItem?.title} Management
                  </h2>
                  <p className="text-gray-600 text-lg mb-8">
                    {currentItem?.subtitle}
                  </p>
                  <p className="text-gray-500">
                    Component for {currentItem?.title} is under development.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Main Dashboard View - Branch component এর মতো structure
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content */}
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header Section - Branch component এর মতো */}
          <div className="text-center mb-10">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-3">
              Website Administration
            </h1>
            <p className="text-gray-600 text-lg">
              Manage all aspects of your institute website
            </p>
          </div>

          {/* Option Cards - Responsive Grid - Branch component এর মতো */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {menuItems.map((item) => {
              const colorClasses = getColorClasses(item.color);
              return (
                <div
                  key={item.id}
                  onClick={() => handleCardClick(item.id)}
                  className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 cursor-pointer transition-all duration-300 hover:shadow-2xl hover:border-blue-400 hover:-translate-y-2 group"
                >
                  <div className="text-center">
                    <div className={`w-16 h-16 mx-auto mb-4 ${colorClasses.bg} rounded-full flex items-center justify-center group-hover:${colorClasses.hoverBg} transition-colors`}>
                      {React.createElement(item.icon, { 
                        className: `text-2xl ${colorClasses.text}` 
                      })}
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">
                      {item.title}
                    </h3>
                    <p className="text-gray-600 text-sm">
                      {item.subtitle}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WebsiteAdmin;