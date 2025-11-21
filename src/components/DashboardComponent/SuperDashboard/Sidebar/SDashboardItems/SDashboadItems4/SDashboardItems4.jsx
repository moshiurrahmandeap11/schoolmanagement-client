import {
  FaBook,
  FaBuilding,
  FaCamera,
  FaChartLine,
  FaIdCard,
  FaSchool,
  FaSms,
  FaTshirt,
  FaUserClock,
  FaUserGraduate
} from 'react-icons/fa';

const SDashboardItems4 = () => {
  const services = [
    {
      id: 1,
      title: 'প্রতিষ্ঠানের নাম ও লোগো সহ টি-শার্ট',
      description: 'কাস্টম ডিজাইনের টি-শার্ট',
      icon: <FaTshirt className="text-3xl" />,
      color: 'text-[#1e90c9]',
      bgColor: 'bg-blue-50',
      borderColor: 'border-[#1e90c9]'
    },
    {
      id: 2,
      title: 'হাজিরা মেশিন',
      description: 'অটোমেটেড অ্যাটেনডেন্স সিস্টেম',
      icon: <FaUserClock className="text-3xl" />,
      color: 'text-[#1e90c9]',
      bgColor: 'bg-blue-50',
      borderColor: 'border-[#1e90c9]'
    },
    {
      id: 3,
      title: 'প্রতিষ্ঠানের নাম ও লোগো সহ শিক্ষার্থীদের ইউনিফর্ম',
      description: 'কাস্টমাইজড ইউনিফর্ম ডিজাইন',
      icon: <FaUserGraduate className="text-3xl" />,
      color: 'text-[#1e90c9]',
      bgColor: 'bg-blue-50',
      borderColor: 'border-[#1e90c9]'
    },
    {
      id: 4,
      title: 'ফেইস আয়টেন্ডেন্স',
      description: 'ফেসিয়াল রিকগনিশন টেকনোলজি',
      icon: <FaCamera className="text-3xl" />,
      color: 'text-[#1e90c9]',
      bgColor: 'bg-blue-50',
      borderColor: 'border-[#1e90c9]'
    },
    {
      id: 5,
      title: 'শিক্ষা প্রতিষ্ঠান ম্যানেজ মেন্ট সিস্টেম',
      description: 'সম্পূর্ণ ম্যানেজমেন্ট সলিউশন',
      icon: <FaSchool className="text-3xl" />,
      color: 'text-[#1e90c9]',
      bgColor: 'bg-blue-50',
      borderColor: 'border-[#1e90c9]'
    },
    {
      id: 6,
      title: 'আইডি কার্ড , কভার ফিতা',
      description: 'প্রফেশনাল আইডি কার্ড ও এক্সেসরিজ',
      icon: <FaIdCard className="text-3xl" />,
      color: 'text-[#1e90c9]',
      bgColor: 'bg-blue-50',
      borderColor: 'border-[#1e90c9]'
    },
    {
      id: 7,
      title: 'অফিস ম্যানেজ মেন্ট সিস্টেম',
      description: 'অফিস অপারেশন ম্যানেজমেন্ট',
      icon: <FaBuilding className="text-3xl" />,
      color: 'text-[#1e90c9]',
      bgColor: 'bg-blue-50',
      borderColor: 'border-[#1e90c9]'
    },
    {
      id: 8,
      title: 'বাল্ক SMS সার্ভিস',
      description: 'ম্যাস কমিউনিকেশন সার্ভিস',
      icon: <FaSms className="text-3xl" />,
      color: 'text-[#1e90c9]',
      bgColor: 'bg-blue-50',
      borderColor: 'border-[#1e90c9]'
    },
    {
      id: 9,
      title: 'প্রতিষ্ঠানের নামে খাতা ও কলম',
      description: 'কাস্টম প্রিন্টেড স্টেশনারী',
      icon: <FaBook className="text-3xl" />,
      color: 'text-[#1e90c9]',
      bgColor: 'bg-blue-50',
      borderColor: 'border-[#1e90c9]'
    },
    {
      id: 10,
      title: 'বিজনেস ম্যানেজমেন্ট সিস্টেম',
      description: 'বিজনেস অপারেশন অটোমেশন',
      icon: <FaChartLine className="text-3xl" />,
      color: 'text-[#1e90c9]',
      bgColor: 'bg-blue-50',
      borderColor: 'border-[#1e90c9]'
    }
  ];

  return (
    <div className="p-4 lg:p-6">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-3">আমাদের সার্ভিসসমূহ</h2>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {services.map((service) => (
          <div
            key={service.id}
            className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 group cursor-pointer"
          >
            {/* Icon Container */}
            <div className={`p-4 rounded-2xl ${service.bgColor} border-2 ${service.borderColor} group-hover:scale-110 transition-transform duration-300 mb-5 inline-flex`}>
              <div className={service.color}>
                {service.icon}
              </div>
            </div>

            {/* Content */}
            <h3 className="text-xl font-bold text-gray-800 mb-3 group-hover:text-gray-900 transition-colors">
              {service.title}
            </h3>
            
            <p className="text-gray-600 text-sm leading-relaxed mb-4">
              {service.description}
            </p>

            {/* Bottom Border */}
            <div className={`mt-4 pt-3 border-t-2 ${service.borderColor}`}>
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500 font-medium">
                  বিস্তারিত জানুন
                </span>
                <div className={`w-8 h-8 rounded-full ${service.bgColor} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  <div className={`${service.color} text-sm font-bold`}>
                    →
                  </div>
                </div>
              </div>
            </div>

            {/* Hover Effect Background */}
            <div className={`absolute inset-0 rounded-2xl ${service.bgColor} opacity-0 group-hover:opacity-5 transition-opacity duration-300 -z-10`} />
          </div>
        ))}
      </div>

      {/* Custom Styles for Color Safety */}
      <style jsx>{`
        .bg-blue-50 { background-color: #eff6ff; }
        .text-blue-600 { color: #2563eb; }
        .border-blue-200 { border-color: #bfdbfe; }
        
        .bg-green-50 { background-color: #f0fdf4; }
        .text-green-600 { color: #16a34a; }
        .border-green-200 { border-color: #bbf7d0; }
        
        .bg-purple-50 { background-color: #faf5ff; }
        .text-purple-600 { color: #9333ea; }
        .border-purple-200 { border-color: #e9d5ff; }
        
        .bg-indigo-50 { background-color: #eef2ff; }
        .text-indigo-600 { color: #4f46e5; }
        .border-indigo-200 { border-color: #c7d2fe; }
        
        .bg-red-50 { background-color: #fef2f2; }
        .text-red-600 { color: #dc2626; }
        .border-red-200 { border-color: #fecaca; }
        
        .bg-orange-50 { background-color: #fff7ed; }
        .text-orange-600 { color: #ea580c; }
        .border-orange-200 { border-color: #fdba74; }
        
        .bg-teal-50 { background-color: #f0fdfa; }
        .text-teal-600 { color: #0d9488; }
        .border-teal-200 { border-color: #99f6e4; }
        
        .bg-pink-50 { background-color: #fdf2f8; }
        .text-pink-600 { color: #db2777; }
        .border-pink-200 { border-color: #fbcfe8; }
        
        .bg-yellow-50 { background-color: #fefce8; }
        .text-yellow-600 { color: #ca8a04; }
        .border-yellow-200 { border-color: #fef08a; }
        
        .bg-gray-50 { background-color: #f9fafb; }
        .text-gray-600 { color: #4b5563; }
        .border-gray-200 { border-color: #e5e7eb; }

        /* Responsive Grid Adjustments */
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
          .xl\:grid-cols-4 {
            grid-template-columns: repeat(3, 1fr);
          }
        }
      `}</style>
    </div>
  );
};

export default SDashboardItems4;