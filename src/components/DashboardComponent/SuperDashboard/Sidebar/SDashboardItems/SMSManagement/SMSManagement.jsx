import { useState } from 'react';
import {
    FaArrowLeft,
    FaChartBar,
    FaList,
    FaPaperPlane,
    FaShoppingCart,
    FaSms
} from 'react-icons/fa';

// Import all the SMS components (you'll need to create these)
import { default as AllSMS, default as SMSReport } from '../../sms/MessageForAdmin/MessageForAdmin';
import SendSMS from '../../sms/SendInstantMessage/SendInstantMessage';
import BuySMS from '../../sms/SmsBalance/BusSms/BuySms';

const SMSManagement = () => {
    const [activeTab, setActiveTab] = useState('dashboard');

    const handleBack = () => {
        setActiveTab('dashboard');
    };

    // SMS management options
    const smsOptions = [
        {
            id: 'buy-sms',
            title: 'Buy SMS',
            subtitle: 'Buy bulk SMS',
            icon: FaShoppingCart,
            color: 'blue',
            description: 'বাল্ক এসএমএস ক্রয় করুন',
            component: BuySMS
        },
        {
            id: 'all-sms',
            title: 'All SMS',
            subtitle: 'Create SMS list to sent later',
            icon: FaList,
            color: 'green',
            description: 'পরবর্তীতে পাঠানোর জন্য এসএমএস লিস্ট তৈরি করুন',
            component: AllSMS
        },
        {
            id: 'send-sms',
            title: 'এসএমএস পাঠান',
            subtitle: 'Send SMS to parents, teachers and others',
            icon: FaPaperPlane,
            color: 'purple',
            description: 'প্যারেন্টস, শিক্ষক এবং অন্যান্যদের এসএমএস পাঠান',
            component: SendSMS
        },
        {
            id: 'sms-report',
            title: 'এসএমএস রিপোর্ট',
            subtitle: 'Sent SMS list',
            icon: FaChartBar,
            color: 'orange',
            description: 'পাঠানো এসএমএসের তালিকা এবং রিপোর্ট দেখুন',
            component: SMSReport
        }
    ];

    // Color classes mapping
    const colorClasses = {
        blue: {
            bg: 'bg-blue-100',
            hoverBg: 'hover:bg-blue-200',
            text: 'text-[#1e90c9]',
            border: 'border-[#1e90c9]',
            icon: 'text-[#1e90c9]'
        },
        green: {
            bg: 'bg-blue-100',
            hoverBg: 'hover:bg-blue-200',
            text: 'text-[#1e90c9]',
            border: 'border-[#1e90c9]',
            icon: 'text-[#1e90c9]'
        },
        purple: {
            bg: 'bg-blue-100',
            hoverBg: 'hover:bg-blue-200',
            text: 'text-[#1e90c9]',
            border: 'border-[#1e90c9]',
            icon: 'text-[#1e90c9]'
        },
        orange: {
            bg: 'bg-blue-100',
            hoverBg: 'hover:bg-blue-200',
            text: 'text-[#1e90c9]',
            border: 'border-[#1e90c9]',
            icon: 'text-[#1e90c9]'
        }
    };

    // Get the active component
    const ActiveComponent = smsOptions.find(opt => opt.id === activeTab)?.component;

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header with Back Button (only when inside a tab) */}
            {activeTab !== 'dashboard' && (
                <div className="sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm">
                    <div className="flex items-center gap-4 p-4 sm:p-6">
                        <button
                            onClick={handleBack}
                            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                            <FaArrowLeft className="text-xl text-gray-600" />
                        </button>
                        <h1 className="text-2xl font-bold text-gray-800">
                            {smsOptions.find(opt => opt.id === activeTab)?.title || 'এসএমএস ব্যবস্থাপনা'}
                        </h1>
                    </div>
                </div>
            )}

            {/* Main Content */}
            <div className="p-4 sm:p-6 lg:p-8">
                {activeTab === 'dashboard' ? (
                    <div className="max-w-full mx-auto">
                        <div className="text-center mb-10">
                            <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-3">
                                এসএমএস ব্যবস্থাপনা
                            </h1>
                            <p className="text-gray-600 text-lg">
                                আপনার প্রতিষ্ঠানের সকল এসএমএস সম্পর্কিত কার্যক্রম নিয়ন্ত্রণ করুন
                            </p>
                        </div>

                        {/* SMS Options Grid - Responsive */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-6 max-w-6xl mx-auto">
                            {smsOptions.map((option) => {
                                const colorClass = colorClasses[option.color];
                                const IconComponent = option.icon;
                                
                                return (
                                    <div
                                        key={option.id}
                                        onClick={() => setActiveTab(option.id)}
                                        className={`bg-white rounded-2xl shadow-lg border border-gray-200 p-6 cursor-pointer transition-all duration-300 hover:shadow-2xl ${colorClass.border} hover:border-2 hover:-translate-y-2 group`}
                                    >
                                        <div className="text-center">
                                            {/* Icon */}
                                            <div className={`w-16 h-16 mx-auto mb-4 ${colorClass.bg} rounded-full flex items-center justify-center group-hover:${colorClass.hoverBg} transition-colors`}>
                                                <IconComponent className={`text-2xl ${colorClass.icon}`} />
                                            </div>
                                            
                                            {/* Title */}
                                            <h3 className="text-xl font-bold text-gray-800 mb-2">
                                                {option.title}
                                            </h3>
                                            
                                            {/* Subtitle */}
                                            <p className="text-sm text-gray-500 mb-3 font-medium">
                                                {option.subtitle}
                                            </p>
                                            
                                            {/* Description */}
                                            <p className="text-gray-600 text-sm leading-relaxed">
                                                {option.description}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ) : (
                    // Render the active component with onBack prop
                    ActiveComponent ? (
                        <ActiveComponent onBack={handleBack} />
                    ) : (
                        <div className="max-w-4xl mx-auto">
                            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
                                <div className="text-center mb-8">
                                    <div className="w-20 h-20 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
                                        {(() => {
                                            const option = smsOptions.find(opt => opt.id === activeTab);
                                            const IconComponent = option?.icon || FaSms;
                                            const colorClass = colorClasses[option?.color || 'blue'];
                                            return <IconComponent className={`text-3xl ${colorClass.icon}`} />;
                                        })()}
                                    </div>
                                    <h2 className="text-3xl font-bold text-gray-800 mb-2">
                                        {smsOptions.find(opt => opt.id === activeTab)?.title}
                                    </h2>
                                    <p className="text-gray-600 text-lg">
                                        {smsOptions.find(opt => opt.id === activeTab)?.subtitle}
                                    </p>
                                </div>
                                
                                {/* Placeholder if component not found */}
                                <div className="text-center py-12">
                                    <p className="text-gray-500 text-lg">
                                        Component not found for {smsOptions.find(opt => opt.id === activeTab)?.title}
                                    </p>
                                    <button
                                        onClick={handleBack}
                                        className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                                    >
                                        ড্যাশবোর্ডে ফিরে যান
                                    </button>
                                </div>
                            </div>
                        </div>
                    )
                )}
            </div>
        </div>
    );
};

export default SMSManagement;