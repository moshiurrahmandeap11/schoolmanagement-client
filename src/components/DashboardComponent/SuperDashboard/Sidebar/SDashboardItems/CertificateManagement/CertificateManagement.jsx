// src/pages/certificate/CertificateManagement.jsx
import { useState } from 'react';
import {
  FaArrowLeft,
  FaArrowRight,
  FaBuilding,
  FaCertificate,
  FaPrint,
  FaSitemap
} from 'react-icons/fa';

// সাব-কম্পোনেন্ট ইমপোর্ট
import CertificateCategory from './CertificateCategory/CertificateCategory';
import CreateCertificate from './CreateCertificate/CreateCertificate';
import InstantStudentForm from './InstantStudentForm/InstantStudentForm';
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
      color: 'text-[#1e90c9]',
      bg: 'bg-blue-50',
      border: 'border-[#1e90c9]',
      gradient: 'from-blue-50 to-blue-100'
    },
    {
      id: 'certificate',
      title: 'সার্টিফিকেট তৈরি',
      subtitle: 'কাস্টম ডিজাইনের সার্টিফিকেট তৈরি ও প্রিন্ট করুন',
      icon: <FaCertificate className="text-3xl" />,
      color: 'text-[#1e90c9]',
      bg: 'bg-blue-50',
      border: 'border-[#1e90c9]',
      gradient: 'from-blue-50 to-cyan-100'
    },
    {
      id: 'category',
      title: 'ফর্ম ক্যাটাগরি',
      subtitle: 'নতুন ক্যাটাগরি তৈরি করুন এবং তালিকা দেখুন',
      icon: <FaSitemap className="text-3xl" />,
      color: 'text-[#1e90c9]',
      bg: 'bg-blue-50',
      border: 'border-[#1e90c9]',
      gradient: 'from-blue-50 to-indigo-100'
    },
    {
      id: 'institute',
      title: 'ইনস্টিটিউট ফর্ম',
      subtitle: 'ইনস্টিটিউটের ফর্ম তৈরি করুন এবং তালিকা দেখুন',
      icon: <FaBuilding className="text-3xl" />,
      color: 'text-[#1e90c9]',
      bg: 'bg-blue-50',
      border: 'border-[#1e90c9]',
      gradient: 'from-blue-50 to-sky-100'
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
      <div className="min-h-screen ">
        {/* Sticky Header */}
        <div className=" bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-lg">
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
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Hero Header */}
        <div className="text-center mb-16">
          <h1 className="text-3xl sm:text-4xl font-extrabold  mb-6">
            সার্টিফিকেট ম্যানেজমেন্ট
          </h1>
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
                <div className={`absolute inset-0 bg-linear-to-br ${item.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
                
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
                <p className="text-gray-600 text-sm leading-relaxed grow">
                  {item.subtitle}
                </p>

                {/* Bottom Arrow */}
                <div className="mt-8 flex justify-end">
                  <FaArrowRight className="text-gray-400 text-2xl group-hover:text-[#1e90c9] group-hover:translate-x-3 transition-all duration-500" />
                </div>

                {/* Hover Glow Effect */}
                <div className="absolute -inset-1 bg-linear-to-r from-transparent via-blue-50 to-transparent opacity-0 group-hover:opacity-30 blur-xl transition-opacity duration-700 -z-10" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CertificateManagement;