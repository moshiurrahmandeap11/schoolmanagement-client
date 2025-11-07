import React from 'react';
import { 
  FaUserGraduate, 
  FaChalkboardTeacher, 
  FaSms, 
  FaPaperPlane,
  FaUserTimes,
  FaUserCheck,
  FaCalendarTimes,
  FaCalendarCheck
} from 'react-icons/fa';

const SDashboardItems3 = () => {
  const stats = [
    {
      id: 1,
      title: 'মোট শিক্ষার্থী',
      value: '0',
      icon: <FaUserGraduate className="text-2xl" />,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200'
    },
    {
      id: 2,
      title: 'Leave Request',
      value: '0',
      icon: <FaCalendarTimes className="text-2xl" />,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200'
    },
    {
      id: 3,
      title: 'মোট শিক্ষক',
      value: '0',
      icon: <FaChalkboardTeacher className="text-2xl" />,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200'
    },
    {
      id: 4,
      title: 'এস এম এস ব্যালেন্স',
      value: '0',
      icon: <FaSms className="text-2xl" />,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200'
    },
    {
      id: 5,
      title: 'এস এম এস আজ পাঠানো হয়েছে',
      value: '0',
      icon: <FaPaperPlane className="text-2xl" />,
      color: 'text-teal-600',
      bgColor: 'bg-teal-50',
      borderColor: 'border-teal-200'
    },
    {
      id: 6,
      title: 'Student Absent Today',
      value: '0',
      icon: <FaUserTimes className="text-2xl" />,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200'
    },
    {
      id: 7,
      title: 'Student Present Today',
      value: '0',
      icon: <FaUserCheck className="text-2xl" />,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200'
    },
    {
      id: 8,
      title: 'Teacher Absent Today',
      value: '0',
      icon: <FaUserTimes className="text-2xl" />,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200'
    },
    {
      id: 9,
      title: 'Teacher Present Today',
      value: '0',
      icon: <FaUserCheck className="text-2xl" />,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200'
    }
  ];

  return (
    <div className="p-4 lg:p-6">

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
        {stats.map((stat) => (
          <div
            key={stat.id}
            className="bg-white rounded-xl shadow-md border border-gray-200 p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
          >
            {/* Icon and Title Row */}
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                <div className={stat.color}>
                  {stat.icon}
                </div>
              </div>
              <div className="text-right flex-1 ml-4">
                <h3 className="text-lg font-semibold text-gray-800">
                  {stat.title}
                </h3>
              </div>
            </div>

            {/* Value */}
            <div className="mt-2">
              <p className="text-3xl font-bold text-gray-900">
                {stat.value}
              </p>
              <div className={`w-12 h-1 ${stat.bgColor} rounded-full mt-2`}></div>
            </div>

            {/* Bottom Info */}
            <div className={`mt-4 border-t ${stat.borderColor} pt-3`}>
              <p className="text-sm text-gray-500">
                {stat.title.includes('Present') && 'আজ উপস্থিত'}
                {stat.title.includes('Absent') && 'আজ অনুপস্থিত'}
                {stat.title.includes('মোট শিক্ষার্থী') && 'সকল শিক্ষার্থী'}
                {stat.title.includes('মোট শিক্ষক') && 'সকল শিক্ষক'}
                {stat.title.includes('Leave Request') && 'অনুরোধ করা লিভ'}
                {stat.title.includes('এস এম এস ব্যালেন্স') && 'এসএমএস ক্রেডিট'}
                {stat.title.includes('এস এম এস আজ পাঠানো হয়েছে') && 'আজকের এসএমএস'}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Additional Styling for Responsive Design */}
      <style jsx>{`
        @media (max-width: 640px) {
          .grid-cols-2 {
            grid-template-columns: 1fr;
          }
        }
        
        @media (min-width: 641px) and (max-width: 1024px) {
          .grid-cols-3 {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        
        @media (min-width: 1025px) and (max-width: 1280px) {
          .xl\:grid-cols-3 {
            grid-template-columns: repeat(3, 1fr);
          }
        }
      `}</style>
    </div>
  );
};

export default SDashboardItems3;