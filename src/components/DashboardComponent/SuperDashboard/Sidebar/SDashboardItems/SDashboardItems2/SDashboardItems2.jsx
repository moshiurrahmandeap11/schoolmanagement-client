import React from 'react';
import { 
  FaCalendarAlt, 
  FaMoneyBillWave, 
  FaMoneyCheckAlt, 
  FaWallet, 
  FaCreditCard 
} from 'react-icons/fa';

const SDashboardItems2 = () => {
  // Get today's date in Bengali format
  const getTodayDate = () => {
    const today = new Date();
    const options = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      weekday: 'long'
    };
    return today.toLocaleDateString('bn-BD', options);
  };

  const cards = [
    {
      id: 1,
      title: 'TODAY INCOME',
      amount: '0',
      icon: <FaMoneyBillWave className="text-3xl" />,
      color: 'text-[#1e90c9]',
      bgColor: 'bg-blue-50',
      borderColor: 'border-[#1e90c9]'
    },
    {
      id: 2,
      title: 'TODAY EXPENSE',
      amount: '0',
      icon: <FaMoneyCheckAlt className="text-3xl" />,
      color: 'text-[#1e90c9]',
      bgColor: 'bg-blue-50',
      borderColor: 'border-[#1e90c9]'
    },
    {
      id: 3,
      title: 'TODAY BALANCE',
      amount: '0',
      icon: <FaWallet className="text-3xl" />,
      color: 'text-[#1e90c9]',
      bgColor: 'bg-blue-50',
      borderColor: 'border-[#1e90c9]'
    },
    {
      id: 4,
      title: 'PAYMENT GATEWAY BALANCE',
      amount: '0',
      icon: <FaCreditCard className="text-3xl" />,
      color: 'text-[#1e90c9]',
      bgColor: 'bg-blue-50',
      borderColor: 'border-[#1e90c9]'
    }
  ];

  return (
    <div className="p-4 lg:p-6">
      {/* Date Section */}
      <div className="mb-8">
        <div className="flex items-center gap-3 bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
          <div className="p-3 bg-blue-100 rounded-xl">
            <FaCalendarAlt className="text-3xl text-[#1e90c9]" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              {getTodayDate()}
            </h2>
            <p className="text-gray-600 text-sm mt-1">আজকের তারিখ</p>
          </div>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card) => (
          <div
            key={card.id}
            className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
          >
            {/* Icon and Title */}
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-xl ${card.bgColor}`}>
                <div className={card.color}>
                  {card.icon}
                </div>
              </div>
              <div className="text-right">
                <h3 className="text-lg font-semibold text-gray-800">
                  {card.title}
                </h3>
              </div>
            </div>

            {/* Amount */}
            <div className="mt-4">
              <p className="text-3xl font-bold text-gray-900">
                ৳{card.amount}
              </p>
              <div className={`w-16 h-1 ${card.bgColor} rounded-full mt-2`}></div>
            </div>

            {/* Bottom Border */}
            <div className={`mt-4 border-t-2 ${card.borderColor} pt-3`}>
              <p className="text-sm text-gray-500">
                {card.title === 'TODAY INCOME' && 'আজকের মোট আয়'}
                {card.title === 'TODAY EXPENSE' && 'আজকের মোট খরচ'}
                {card.title === 'TODAY BALANCE' && 'আজকের ব্যালেন্স'}
                {card.title === 'PAYMENT GATEWAY BALANCE' && 'পেমেন্ট গেটওয়ে ব্যালেন্স'}
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
          .grid-cols-4 {
            grid-template-columns: repeat(2, 1fr);
          }
        }
      `}</style>
    </div>
  );
};

export default SDashboardItems2;