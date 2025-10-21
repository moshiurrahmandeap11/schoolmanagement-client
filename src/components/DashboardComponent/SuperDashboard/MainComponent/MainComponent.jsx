import React from 'react';
import Settings from '../Sidebar/Settings/Settings';
import RecentlyAdmin from '../Sidebar/RecentlyAdmin/RecentlyAdmin';
import SchoolHistory from '../Sidebar/SchoolHistory/SchoolHistory';
import SpeechAdmin from '../Sidebar/SpeechAdmin/SpeechAdmin';

const MainComponent = ({ activeMenu }) => {
  const renderContent = () => {
    switch (activeMenu) {
      case 'dashboard':
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">ড্যাশবোর্ড ওভারভিউ</h1>
              <p className="text-gray-600 mt-2">এখানে আপনার সামগ্রিক স্ট্যাটাস এবং সারাংশ দেখানো হচ্ছে।</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">👥</span>
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm">মোট ব্যবহারকারী</p>
                    <p className="text-2xl font-bold text-gray-800">১,২৩৪</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">🔄</span>
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm">সক্রিয় সেশন</p>
                    <p className="text-2xl font-bold text-gray-800">৫৬</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">💰</span>
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm">আজকের আয়</p>
                    <p className="text-2xl font-bold text-gray-800">৳১২,৫০০</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      
      case 'announcement':
        return (
          <RecentlyAdmin></RecentlyAdmin>
        );
      
      case 'school-history':
        return (
          <SchoolHistory></SchoolHistory>
        );
      
      case "speech":
        return <SpeechAdmin></SpeechAdmin>
      
      case 'settings':
        return (
            <Settings></Settings>
        );
      
      case 'profile':
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">ব্যবহারকারী প্রোফাইল</h1>
              <p className="text-gray-600 mt-2">আপনার প্রোফাইল তথ্য দেখুন এবং এডিট করুন।</p>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-8">
                <div className="flex items-center gap-6 mb-6">
                  <div className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-2xl font-bold">A</span>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800">আপনার নাম</h2>
                    <p className="text-gray-600">অ্যাডমিন ব্যবহারকারী</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">পুরো নাম</label>
                      <p className="text-gray-800">আপনার পুরো নাম</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">ইমেইল</label>
                      <p className="text-gray-800">your@email.com</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">ভূমিকা</label>
                      <p className="text-gray-800">অ্যাডমিন</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">সদস্য sejak</label>
                      <p className="text-gray-800">১ জানুয়ারি, ২০২৪</p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 flex gap-4">
                  <button className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                    প্রোফাইল এডিট করুন
                  </button>
                  <button className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                    পাসওয়ার্ড পরিবর্তন
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      
      default:
        return (
          <div className="text-center py-12">
            <h1 className="text-3xl font-bold text-gray-800 mb-4">সুপার ড্যাশবোর্ডে স্বাগতম</h1>
            <p className="text-gray-600 text-lg">বাম পাশের মেনু থেকে কোনো অপশন সিলেক্ট করুন</p>
          </div>
        );
    }
  };

  return (
    <div className="flex-1 p-6 lg:p-8 bg-gray-50 min-h-screen">
      {renderContent()}
    </div>
  );
};

export default MainComponent;