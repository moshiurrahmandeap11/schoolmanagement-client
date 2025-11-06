// src/pages/certificate/CertificateManagement.jsx
import React, { useState } from 'react';
import { 
  FaPrint, 
  FaCertificate, 
  FaFileAlt, 
  FaUniversity,
  FaArrowLeft,
  FaArrowRight,
  FaUserGraduate,
  FaEdit,
  FaSitemap,
  FaBuilding
} from 'react-icons/fa';

// সাব-কম্পোনেন্ট ইমপোর্ট
import InstantStudentForm from './InstantStudentForm/InstantStudentForm';
import CreateCertificate from './CreateCertificate/CreateCertificate';
import CertificateCategory from './CertificateCategory/CertificateCategory';
import InstituteFormList from './InstituteFormList/InstituteFormList';

const CertificateManagement = () => {
  const [activeSection, setActiveSection] = useState('main');

  const handleBack = () => setActiveSection('main');

  const menuItems = [
    {
      id: 'instant',
      title: 'ইনস্ট্যান্ট ফর্ম',
      subtitle: 'নতুন ছাত্রের ফর্ম পূরণ করে তৎক্ষণাৎ প্রিন্ট করুন',
      icon: <FaPrint className="text-3xl" />,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      gradient: 'from-blue-500 to-blue-600'
    },
    {
      id: 'certificate',
      title: 'সার্টিফিকেট তৈরি',
      subtitle: 'কাস্টম ডিজাইনের সার্টিফিকেট তৈরি ও প্রিন্ট করুন',
      icon: <FaCertificate className="text-3xl" />,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      gradient: 'from-blue-500 to-cyan-600'
    },
    {
      id: 'category',
      title: 'ফর্ম ক্যাটাগরি',
      subtitle: 'নতুন ক্যাটাগরি তৈরি করুন এবং তালিকা দেখুন',
      icon: <FaSitemap className="text-3xl" />,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      gradient: 'from-blue-500 to-indigo-600'
    },
    {
      id: 'institute',
      title: 'ইনস্টিটিউট ফর্ম',
      subtitle: 'ইনস্টিটিউটের ফর্ম তৈরি করুন এবং তালিকা দেখুন',
      icon: <FaBuilding className="text-3xl" />,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      gradient: 'from-blue-500 to-sky-600'
    },
  ];

  // যদি কোনো সেকশন সিলেক্ট করা থাকে
  if (activeSection !== 'main') {
    const selected = menuItems.find(item => item.id === activeSection);
    const Component = {
      instant: InstantStudentForm,
      certificate: CreateCertificate,
      category: CertificateCategory,
      institute: InstituteFormList,
    }[activeSection];

    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        {/* Sticky Header */}
        <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-lg">
          <div className="flex items-center gap-4 px-6 py-5">
            <button
              onClick={handleBack}
              className="p-3 rounded-xl hover:bg-gray-100 transition-all duration-200 group"
            >
              <FaArrowLeft className="text-2xl text-gray-600 group-hover:text-gray-800" />
            </button>
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 ${selected.bg} ${selected.border} border-4 rounded-full flex items-center justify-center`}>
                <div className={selected.color}>{selected.icon}</div>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800">
                  {selected.title}
                </h1>
                <p className="text-sm text-gray-500">{selected.subtitle}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 lg:p-10">
          <Component onBack={handleBack} />
        </div>
      </div>
    );
  }

  // মেইন ড্যাশবোর্ড
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-sky-50 to-indigo-50">
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Hero Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl sm:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-sky-600 to-indigo-700 mb-6">
            সার্টিফিকেট ম্যানেজমেন্ট
          </h1>
          <p className="text-xl text-gray-700 max-w-3xl mx-auto font-medium">
            আধুনিক, সহজ ও সুন্দর উপায়ে ছাত্র-ছাত্রীদের সার্টিফিকেট তৈরি, প্রিন্ট ও ব্যবস্থাপনা করুন
          </p>
        </div>

        {/* Elegant Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {menuItems.map((item) => (
            <div
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className="group cursor-pointer transition-all duration-500 hover:-translate-y-3"
            >
              <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-lg border-2 border-transparent hover:border-blue-200 hover:shadow-2xl transition-all duration-500 p-8 h-full flex flex-col relative overflow-hidden">
                
                {/* Gradient Overlay */}
                <div className={`absolute inset-0 bg-gradient-to-br ${item.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
                
                {/* Icon Circle */}
                <div className={`w-20 h-20 ${item.bg} ${item.border} border-4 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500 shadow-lg`}>
                  <div className={`${item.color} group-hover:scale-125 transition-transform duration-500`}>
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

                {/* Bottom Arrow */}
                <div className="mt-8 flex justify-end">
                  <FaArrowRight className="text-gray-400 text-2xl group-hover:text-blue-600 group-hover:translate-x-3 transition-all duration-500" />
                </div>

                {/* Hover Glow Effect */}
                <div className="absolute -inset-1 bg-gradient-to-r from-transparent via-blue-50 to-transparent opacity-0 group-hover:opacity-30 blur-xl transition-opacity duration-700 -z-10" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CertificateManagement;