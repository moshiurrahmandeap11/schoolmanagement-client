// Sidebar/SDashboardItems/SDashboardItems.jsx
import React from 'react';
import { 
  FaCodeBranch, FaHandHoldingHeart, FaCertificate, FaMoneyBillWave,
  FaGlobe, FaGraduationCap, FaFileAlt, FaChartBar, FaMoneyCheckAlt,
  FaPrint, FaSms, FaUserCheck, FaSitemap, FaArrowRight
} from 'react-icons/fa';

const SDashboardItems = ({ onItemClick }) => {
  const menuItems = [
    { id: 'branch-management', icon: <FaCodeBranch />, bangla: 'শাখা সমূহ', english: 'Branch List, Update, Delete' },
    { id: 'donation-management', icon: <FaHandHoldingHeart />, bangla: 'দান', english: 'Donor List, Update, Delete' },
    { id: 'certificate-management', icon: <FaCertificate />, bangla: 'সার্টিফিকেট', english: 'Create Certificate, Update, Delete' },
    { id: 'salary-bonus-management', icon: <FaMoneyBillWave />, bangla: 'বেতন - বোনাস', english: 'Teacher Salary Create , Update, Delete' },
    { id: 'website-management', icon: <FaGlobe />, bangla: 'ওয়েবসাইট', english: 'Notice , Events, Blog, Contact' },
    { id: 'academic-management', icon: <FaGraduationCap />, bangla: 'শিক্ষা-সংক্রান্ত', english: 'Class , Batch , Student, Attendance' },
    { id: 'examination-management', icon: <FaFileAlt />, bangla: 'পরীক্ষা', english: 'Grading, Exam, Result , Marksheet' },
    { id: 'accounts-management', icon: <FaChartBar />, bangla: 'হিসাব', english: 'Income, Expense, Transactions, Reports' },
    { id: 'fee-management', icon: <FaMoneyCheckAlt />, bangla: 'ফি', english: 'Fee, Discounts, Fine, Collection' },
    { id: 'print-management', icon: <FaPrint />, bangla: 'প্রিন্ট', english: 'ID Card, Admit Card, Result' },
    { id: 'sms-management', icon: <FaSms />, bangla: 'এস এম এস', english: 'Send SMS and notice' },
    { id: 'attendance-management', icon: <FaUserCheck />, bangla: 'উপস্থিতি', english: 'Manage Attendance, Send SMS' },
    { id: 'department-management', icon: <FaSitemap />, bangla: 'বিভাগ', english: 'Faculty And Department' },
  ];

  const handleItemClick = (item) => {
    if (onItemClick) {
      onItemClick(item); // পুরো item পাঠানো হচ্ছে (id সহ)
    }
  };

  return (
    <div className="p-4 bg-gray-50 min-h-screen">
      <div className="max-w-full mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {menuItems.map((item) => (
            <div
              key={item.id}
              onClick={() => handleItemClick(item)}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 cursor-pointer transition-all duration-300 hover:shadow-lg hover:border-blue-500 hover:-translate-y-1 group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="text-2xl text-blue-600 group-hover:text-blue-700">
                    {item.icon}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-1">{item.bangla}</h3>
                    <p className="text-sm text-gray-600">{item.english}</p>
                  </div>
                </div>
                <FaArrowRight className="text-gray-400 group-hover:text-blue-600" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SDashboardItems;