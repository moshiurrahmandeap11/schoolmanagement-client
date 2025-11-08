// src/pages/salary/SalaryManagement.jsx
import { useState } from 'react';
import {
  FaArrowLeft,
  FaArrowRight,
  FaEdit,
  FaListAlt,
  FaMoneyBillWave
} from 'react-icons/fa';

// সাব-কম্পোনেন্ট ইমপোর্ট (আপনার প্রয়োজন অনুযায়ী তৈরি করুন)
import TeacherListAdmin from '../../TeachersListAdmin/TeacherListAdmin';
import CreateSalaryType from './CreateSalaryType/CreateSalaryType';
import SalaryTypeList from './SalaryTypeList/SalaryTypeList';

const SalaryManagement = () => {
  const [activeSection, setActiveSection] = useState('main');

  const handleBack = () => setActiveSection('main');

  const menuItems = [
    {
      id: 'payment',
      title: 'শিক্ষকদের বেতন প্রদান',
      subtitle: 'Search by ID',
      icon: <FaMoneyBillWave className="text-3xl" />,
      color: 'text-green-600',
      bg: 'bg-green-50',
      border: 'border-green-200',
      gradient: 'from-green-500 to-green-600'
    },
    {
      id: 'type',
      title: 'বেতনের ধরণ',
      subtitle: 'Create Salary Type',
      icon: <FaEdit className="text-3xl" />,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      gradient: 'from-blue-500 to-cyan-600'
    },
    {
      id: 'list',
      title: 'বেতনের তালিকা',
      subtitle: 'Delete or Update Salary Type',
      icon: <FaListAlt className="text-3xl" />,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
      border: 'border-purple-200',
      gradient: 'from-purple-500 to-indigo-600'
    },
  ];

  // যদি কোনো সেকশন সিলেক্ট করা থাকে
  if (activeSection !== 'main') {
    const selected = menuItems.find(item => item.id === activeSection);
    const Component = {
      payment: TeacherListAdmin,
      type: CreateSalaryType,
      list: SalaryTypeList,
    }[activeSection];

    return (
      <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100">
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
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Hero Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl sm:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-green-600 via-blue-600 to-purple-700 mb-6">
            বেতন ব্যবস্থাপনা
          </h1>
          <p className="text-xl text-gray-700 max-w-3xl mx-auto font-medium">
            শিক্ষকদের বেতন প্রদান, বেতনের ধরণ তৈরি এবং বেতন তালিকা ব্যবস্থাপনা করুন
          </p>
        </div>

        {/* Elegant Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {menuItems.map((item) => (
            <div
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className="group cursor-pointer transition-all duration-500 hover:-translate-y-3"
            >
              <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-lg border-2 border-transparent hover:border-green-200 hover:shadow-2xl transition-all duration-500 p-8 h-full flex flex-col relative overflow-hidden">
                
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
                  <FaArrowRight className="text-gray-400 text-2xl group-hover:text-green-600 group-hover:translate-x-3 transition-all duration-500" />
                </div>

                {/* Hover Glow Effect */}
                <div className="absolute -inset-1 bg-gradient-to-r from-transparent via-green-50 to-transparent opacity-0 group-hover:opacity-30 blur-xl transition-opacity duration-700 -z-10" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SalaryManagement;