import React, { useState } from 'react';
import { 
  FaHandHoldingHeart, 
  FaPlus, 
  FaUsers, 
  FaMoneyBillWave, 
  FaProjectDiagram, 
  FaArrowLeft,
  FaArrowRight 
} from 'react-icons/fa';

// সাব-কম্পোনেন্ট ইমপোর্ট
import InstantDonation from './InstantDonation/InstantDonation';
import DonorCategory from './DonorCategory/DonorCategory';
import DonorList from './DonorList/DonorList';
import DonationAccount from './DonationAccount/DonationAccount';
import ReceiveDonation from './ReceiveDonation/ReceiveDonation';
import DonationProject from './DonationProject/DonationProject';

const DonationManagement = () => {
  const [activeSection, setActiveSection] = useState('main');

  const handleBack = () => setActiveSection('main');

  const menuItems = [
    {
      id: 'instant',
      title: 'ইনস্ট্যান্ট দান',
      subtitle: 'তাৎক্ষণিক দান সংগ্রহ করুন',
      icon: <FaHandHoldingHeart />,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
      border: 'border-purple-200'
    },
    {
      id: 'category',
      title: 'দাতা ক্যাটাগরি',
      subtitle: 'নতুন ক্যাটাগরি তৈরি ও তালিকা',
      icon: <FaPlus />,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      border: 'border-blue-200'
    },
    {
      id: 'donor-list',
      title: 'দাতা তালিকা',
      subtitle: 'নতুন দাতা যোগ করুন ও তালিকা দেখুন',
      icon: <FaUsers />,
      color: 'text-green-600',
      bg: 'bg-green-50',
      border: 'border-green-200'
    },
    {
      id: 'account',
      title: 'দানের অ্যাকাউন্ট',
      subtitle: 'অ্যাকাউন্ট তালিকা, আপডেট, ডিলিট',
      icon: <FaMoneyBillWave />,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
      border: 'border-amber-200'
    },
    {
      id: 'receive',
      title: 'দান গ্রহণ',
      subtitle: 'নতুন দান গ্রহণ ও তালিকা',
      icon: <FaHandHoldingHeart />,
      color: 'text-rose-600',
      bg: 'bg-rose-50',
      border: 'border-rose-200'
    },
    {
      id: 'project',
      title: 'দান প্রজেক্ট',
      subtitle: 'নতুন প্রজেক্ট তৈরি ও তালিকা',
      icon: <FaProjectDiagram />,
      color: 'text-indigo-600',
      bg: 'bg-indigo-50',
      border: 'border-indigo-200'
    },
  ];

  if (activeSection !== 'main') {
    const selected = menuItems.find(item => item.id === activeSection);
    const Component = {
      instant: InstantDonation,
      category: DonorCategory,
      'donor-list': DonorList,
      account: DonationAccount,
      receive: ReceiveDonation,
      project: DonationProject,
    }[activeSection];

    return (
      <div className="min-h-screen bg-gray-50">
        <div className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
          <div className="flex items-center gap-4 px-6 py-4">
            <button
              onClick={handleBack}
              className="p-3 rounded-xl hover:bg-gray-100 transition-all duration-200"
            >
              <FaArrowLeft className="text-xl text-gray-600" />
            </button>
            <h1 className="text-2xl font-bold text-gray-800">
              {selected?.title}
            </h1>
          </div>
        </div>
        <div className="p-6 lg:p-8">
          <Component />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            দান ব্যবস্থাপনা
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            আপনার প্রতিষ্ঠানের সকল দান কার্যক্রম এক জায়গায় সহজে নিয়ন্ত্রণ করুন
          </p>
        </div>

        {/* Minimal & Elegant Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {menuItems.map((item) => (
            <div
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className="group cursor-pointer transition-all duration-300"
            >
              <div className="bg-white rounded-3xl shadow-sm border-2 border-transparent hover:border-gray-300 hover:shadow-xl transition-all duration-300 p-8 h-full flex flex-col">
                {/* Icon Circle */}
                <div className={`w-16 h-16 ${item.bg} ${item.border} border-4 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <div className={item.color}>
                    {item.icon}
                  </div>
                </div>

                {/* Content */}
                <h3 className="text-2xl font-bold text-gray-800 mb-3 group-hover:text-gray-900 transition-colors">
                  {item.title}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed flex-grow">
                  {item.subtitle}
                </p>

                {/* Arrow */}
                <div className="mt-6 flex justify-end">
                  <FaArrowRight className="text-gray-400 text-xl group-hover:text-gray-700 group-hover:translate-x-2 transition-all duration-300" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DonationManagement;