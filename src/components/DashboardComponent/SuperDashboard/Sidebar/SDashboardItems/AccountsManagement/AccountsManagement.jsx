import { useState } from 'react';
import {
    FaArrowLeft,
    FaBalanceScale,
    FaChartLine,
    FaCreditCard,
    FaExchangeAlt,
    FaHandHoldingUsd,
    FaMoneyBillWave,
    FaReceipt,
    FaUniversity
} from 'react-icons/fa';


// Import components (আপনাকে পরে এই কম্পোনেন্টগুলো তৈরি করতে হবে)
import BalanceSheet from './BalanceSheet/BalanceSheet';
import BankAccounts from './BankAccounts/BankAccounts';
import ExpenseHeads from './ExpenseHeads/ExpenseHeads';
import Expenses from './Expenses/Expenses';
import Incomes from './Incomes/Incomes';
import IncomeSources from './IncomeSources/IncomeSources';
import PaymentTypes from './PaymentTypes/PaymentTypes';
import Transactions from './Transactions/Transactions';

const AccountsManagement = () => {
    const [activeTab, setActiveTab] = useState('dashboard');

    const handleBack = () => {
        setActiveTab('dashboard');
    };

    // Accounts management options
    const accountsOptions = [
        {
            id: 'bank-accounts',
            title: 'ব্যাংক একাউন্টস',
            subtitle: 'Add your bank, bkash and other accounts',
            icon: FaUniversity,
            color: 'blue',
            description: 'ব্যাংক, বিকাশ, নগদ এবং অন্যান্য একাউন্ট ব্যবস্থাপনা',
            component: BankAccounts
        },
        {
            id: 'income-sources',
            title: 'আয়ের উৎস',
            subtitle: 'Add Institute income sources fees etc',
            icon: FaMoneyBillWave,
            color: 'green',
            description: 'প্রতিষ্ঠানের আয়ের বিভিন্ন উৎস যোগ করুন (ফি, ডোনেশন ইত্যাদি)',
            component: IncomeSources
        },
        {
            id: 'expense-heads',
            title: 'ব্যয়ের খাত',
            subtitle: 'Add Expense field like staff salary etc',
            icon: FaReceipt,
            color: 'red',
            description: 'বিভিন্ন ব্যয়ের খাত তৈরি করুন (বেতন, ইউটিলিটি, রক্ষণাবেক্ষণ ইত্যাদি)',
            component: ExpenseHeads
        },
        {
            id: 'payment-types',
            title: 'পেমেন্ট টাইপ',
            subtitle: 'Add payment type like hand cash, online etc',
            icon: FaCreditCard,
            color: 'purple',
            description: 'পেমেন্টের বিভিন্ন মাধ্যম যোগ করুন (নগদ, অনলাইন, ব্যাংক ইত্যাদি)',
            component: PaymentTypes
        },
        {
            id: 'incomes',
            title: 'আয়',
            subtitle: 'Add a new income and see the list of existing incomes',
            icon: FaChartLine,
            color: 'teal',
            description: 'নতুন আয় যোগ করুন এবং বিদ্যমান আয়ের তালিকা দেখুন',
            component: Incomes
        },
        {
            id: 'expenses',
            title: 'ব্যয়',
            subtitle: 'Add a new expense and see the current expenses',
            icon: FaHandHoldingUsd,
            color: 'orange',
            description: 'নতুন ব্যয় যোগ করুন এবং বর্তমান ব্যয়ের তালিকা দেখুন',
            component: Expenses
        },
        {
            id: 'balance-sheet',
            title: 'ব্যালেন্স শিট',
            subtitle: 'Balance sheet for income/expenses',
            icon: FaBalanceScale,
            color: 'indigo',
            description: 'আয়-ব্যয়ের সার্বিক অবস্থা এবং আর্থিক প্রতিবেদন দেখুন',
            component: BalanceSheet
        },
        {
            id: 'transactions',
            title: 'লেনদেনসমূহ',
            subtitle: 'Transactions list of incomes / expenses',
            icon: FaExchangeAlt,
            color: 'cyan',
            description: 'সকল আয়-ব্যয়ের লেনদেনের বিস্তারিত তালিকা দেখুন',
            component: Transactions
        }
    ];

    // Color classes mapping
    const colorClasses = {
        blue: {
            bg: 'bg-blue-100',
            hoverBg: 'hover:bg-blue-200',
            text: 'text-blue-600',
            border: 'border-blue-400',
            icon: 'text-blue-600'
        },
        green: {
            bg: 'bg-green-100',
            hoverBg: 'hover:bg-green-200',
            text: 'text-green-600',
            border: 'border-green-400',
            icon: 'text-green-600'
        },
        red: {
            bg: 'bg-red-100',
            hoverBg: 'hover:bg-red-200',
            text: 'text-red-600',
            border: 'border-red-400',
            icon: 'text-red-600'
        },
        purple: {
            bg: 'bg-purple-100',
            hoverBg: 'hover:bg-purple-200',
            text: 'text-purple-600',
            border: 'border-purple-400',
            icon: 'text-purple-600'
        },
        teal: {
            bg: 'bg-teal-100',
            hoverBg: 'hover:bg-teal-200',
            text: 'text-teal-600',
            border: 'border-teal-400',
            icon: 'text-teal-600'
        },
        orange: {
            bg: 'bg-orange-100',
            hoverBg: 'hover:bg-orange-200',
            text: 'text-orange-600',
            border: 'border-orange-400',
            icon: 'text-orange-600'
        },
        indigo: {
            bg: 'bg-indigo-100',
            hoverBg: 'hover:bg-indigo-200',
            text: 'text-indigo-600',
            border: 'border-indigo-400',
            icon: 'text-indigo-600'
        },
        cyan: {
            bg: 'bg-cyan-100',
            hoverBg: 'hover:bg-cyan-200',
            text: 'text-cyan-600',
            border: 'border-cyan-400',
            icon: 'text-cyan-600'
        }
    };

    // Get the active component
    const ActiveComponent = accountsOptions.find(opt => opt.id === activeTab)?.component;

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
                            {accountsOptions.find(opt => opt.id === activeTab)?.title || 'হিসাব ব্যবস্থাপনা'}
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
                                হিসাব ব্যবস্থাপনা
                            </h1>
                            <p className="text-gray-600 text-lg">
                                আপনার প্রতিষ্ঠানের সকল আর্থিক কার্যক্রম নিয়ন্ত্রণ করুন
                            </p>
                        </div>

                        {/* Accounts Options Grid - Responsive */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {accountsOptions.map((option) => {
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
                                            const option = accountsOptions.find(opt => opt.id === activeTab);
                                            const IconComponent = option?.icon || FaUniversity;
                                            const colorClass = colorClasses[option?.color || 'blue'];
                                            return <IconComponent className={`text-3xl ${colorClass.icon}`} />;
                                        })()}
                                    </div>
                                    <h2 className="text-3xl font-bold text-gray-800 mb-2">
                                        {accountsOptions.find(opt => opt.id === activeTab)?.title}
                                    </h2>
                                    <p className="text-gray-600 text-lg">
                                        {accountsOptions.find(opt => opt.id === activeTab)?.subtitle}
                                    </p>
                                </div>
                                
                                {/* Placeholder if component not found */}
                                <div className="text-center py-12">
                                    <p className="text-gray-500 text-lg">
                                        Component not found for {accountsOptions.find(opt => opt.id === activeTab)?.title}
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

export default AccountsManagement;