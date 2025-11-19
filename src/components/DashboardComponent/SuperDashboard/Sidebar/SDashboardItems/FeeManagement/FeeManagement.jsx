import { useState } from 'react';
import {
    FaArrowLeft,
    FaCog,
    FaCreditCard,
    FaExclamationTriangle,
    FaFileInvoiceDollar,
    FaMoneyBillWave,
    FaPercentage,
    FaTags,
    FaUserShield
} from 'react-icons/fa';

// Import all the fee components (you'll need to create these)
import CollectFee from '../../../Sidebar/Fee/CollectFee/CollectFee';
import FeeTypes from '../../../Sidebar/Fee/FeesType/FeesType';
import AssignFines from '../../Fee/AssignFines/AssignFines';
import Discounts from '../../Fee/Discount/Discount';
import AssignDiscounts from '../../Fee/DiscountJog/DiscountJog';
import FeeSettings from '../../Fee/FeeSettings/FeeSettings';
import FineTypes from '../../Fee/FineTypes/FineTypes';
import AdvanceFees from './AdvanceFees/AdvanceFees';

const FeeManagement = () => {
    const [activeTab, setActiveTab] = useState('dashboard');

    const handleBack = () => {
        setActiveTab('dashboard');
    };

    // Fee management options
    const feeOptions = [
        {
            id: 'fee-types',
            title: 'ফি টাইপস',
            subtitle: 'Create Fee Type',
            icon: FaCreditCard,
            color: 'blue',
            description: 'ফি টাইপ তৈরি এবং ব্যবস্থাপনা করুন',
            component: FeeTypes
        },
        {
            id: 'advance-fees',
            title: 'Advance Fees',
            subtitle: 'Create Advance Fees',
            icon: FaMoneyBillWave,
            color: 'green',
            description: 'অগ্রিম ফি তৈরি এবং ব্যবস্থাপনা করুন',
            component: AdvanceFees
        },
        {
            id: 'collect-fee',
            title: 'Collect Fee',
            subtitle: 'Collect fee from students',
            icon: FaFileInvoiceDollar,
            color: 'purple',
            description: 'শিক্ষার্থীদের কাছ থেকে ফি সংগ্রহ করুন',
            component: CollectFee
        },
        {
            id: 'fine-types',
            title: 'জরিমানার ধরন',
            subtitle: 'Create Fine Types',
            icon: FaExclamationTriangle,
            color: 'red',
            description: 'জরিমানার বিভিন্ন ধরন তৈরি করুন',
            component: FineTypes
        },
        {
            id: 'discounts',
            title: 'ডিসকাউন্ট',
            subtitle: 'Add discounts',
            icon: FaPercentage,
            color: 'indigo',
            description: 'বিভিন্ন ধরনের ডিসকাউন্ট যোগ করুন',
            component: Discounts
        },
        {
            id: 'assign-discounts',
            title: 'ডিসকাউন্ট বরাদ্দ',
            subtitle: 'Assign Discounts for students',
            icon: FaTags,
            color: 'yellow',
            description: 'শিক্ষার্থীদের জন্য ডিসকাউন্ট বরাদ্দ করুন',
            component: AssignDiscounts
        },
        {
            id: 'assign-fines',
            title: 'Assign Fines',
            subtitle: 'Assign fine for student',
            icon: FaUserShield,
            color: 'orange',
            description: 'শিক্ষার্থীদের জন্য জরিমানা নির্ধারণ করুন',
            component: AssignFines
        },
        {
            id: 'fee-settings',
            title: 'Fee Settings',
            subtitle: 'Connect Fee with accounting',
            icon: FaCog,
            color: 'gray',
            description: 'ফি এবং অ্যাকাউন্টিং সিস্টেম সংযুক্ত করুন',
            component: FeeSettings
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
        indigo: {
            bg: 'bg-blue-100',
            hoverBg: 'hover:bg-blue-200',
            text: 'text-[#1e90c9]',
            border: 'border-[#1e90c9]',
            icon: 'text-[#1e90c9]'
        },
        yellow: {
            bg: 'bg-blue-100',
            hoverBg: 'hover:bg-blue-200',
            text: 'text-[#1e90c9]',
            border: 'border-[#1e90c9]',
            icon: 'text-[#1e90c9]'
        },
        red: {
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
        },
        gray: {
            bg: 'bg-blue-100',
            hoverBg: 'hover:bg-blue-200',
            text: 'text-[#1e90c9]',
            border: 'border-[#1e90c9]',
            icon: 'text-[#1e90c9]'
        }
    };

    // Get the active component
    const ActiveComponent = feeOptions.find(opt => opt.id === activeTab)?.component;

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
                            {feeOptions.find(opt => opt.id === activeTab)?.title || 'ফি ব্যবস্থাপনা'}
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
                                ফি ব্যবস্থাপনা
                            </h1>
                            <p className="text-gray-600 text-lg">
                                আপনার প্রতিষ্ঠানের সকল ফি সম্পর্কিত কার্যক্রম নিয়ন্ত্রণ করুন
                            </p>
                        </div>

                        {/* Fee Options Grid - Responsive */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {feeOptions.map((option) => {
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
                                            const option = feeOptions.find(opt => opt.id === activeTab);
                                            const IconComponent = option?.icon || FaCreditCard;
                                            const colorClass = colorClasses[option?.color || 'blue'];
                                            return <IconComponent className={`text-3xl ${colorClass.icon}`} />;
                                        })()}
                                    </div>
                                    <h2 className="text-3xl font-bold text-gray-800 mb-2">
                                        {feeOptions.find(opt => opt.id === activeTab)?.title}
                                    </h2>
                                    <p className="text-gray-600 text-lg">
                                        {feeOptions.find(opt => opt.id === activeTab)?.subtitle}
                                    </p>
                                </div>
                                
                                {/* Placeholder if component not found */}
                                <div className="text-center py-12">
                                    <p className="text-gray-500 text-lg">
                                        Component not found for {feeOptions.find(opt => opt.id === activeTab)?.title}
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

export default FeeManagement;