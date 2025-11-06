import React, { useState } from 'react';
import { FaPlus, FaListUl, FaArrowLeft } from 'react-icons/fa';
import NewBranch from './NewBranch/NewBranch';
import AllBranches from './AllBranch/AllBranch';

const Branch = () => {
  const [activeTab, setActiveTab] = useState('list'); // 'new' or 'list'

  const handleBack = () => {
    setActiveTab('list');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Back Button (only when inside a tab) */}
      {activeTab !== 'list' && (
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm">
          <div className="flex items-center gap-4 p-4 sm:p-6">
            <button
              onClick={handleBack}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <FaArrowLeft className="text-xl text-gray-600" />
            </button>
            <h1 className="text-2xl font-bold text-gray-800">
              {activeTab === 'new' ? 'নতুন শাখা তৈরি করুন' : 'সকল শাখা'}
            </h1>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="p-4 sm:p-6 lg:p-8">
        {activeTab === 'list' ? (
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-10">
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-3">
                শাখা ব্যবস্থাপনা
              </h1>
              <p className="text-gray-600 text-lg">
                আপনার প্রতিষ্ঠানের সকল শাখা নিয়ন্ত্রণ করুন
              </p>
            </div>

            {/* Option Cards - Responsive Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {/* নতুন শাখা */}
              <div
                onClick={() => setActiveTab('new')}
                className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 cursor-pointer transition-all duration-300 hover:shadow-2xl hover:border-blue-400 hover:-translate-y-2 group"
              >
                <div className="text-center">
                  <div className="w-20 h-20 mx-auto mb-5 bg-blue-100 rounded-full flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                    <FaPlus className="text-3xl text-blue-600 group-hover:text-blue-700" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">
                    নতুন শাখা
                  </h3>
                  <p className="text-gray-600">
                    নতুন শাখা তৈরি করুন এবং তথ্য যোগ করুন
                  </p>
                </div>
              </div>

              {/* সকল শাখা */}
              <div
                onClick={() => setActiveTab('all')}
                className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 cursor-pointer transition-all duration-300 hover:shadow-2xl hover:border-green-400 hover:-translate-y-2 group"
              >
                <div className="text-center">
                  <div className="w-20 h-20 mx-auto mb-5 bg-green-100 rounded-full flex items-center justify-center group-hover:bg-green-200 transition-colors">
                    <FaListUl className="text-3xl text-green-600 group-hover:text-green-700" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">
                    সকল শাখা
                  </h3>
                  <p className="text-gray-600">
                    শাখার তালিকা দেখুন, এডিট করুন, ডিলিট করুন
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : activeTab === 'new' ? (
          <NewBranch />
        ) : (
          <AllBranches />
        )}
      </div>
    </div>
  );
};

export default Branch;