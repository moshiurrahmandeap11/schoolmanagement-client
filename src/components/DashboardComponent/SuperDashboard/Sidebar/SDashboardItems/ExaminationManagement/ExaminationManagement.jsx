import { useState } from 'react';
import {
    FaArrowLeft,
    FaBook,
    FaCalendarAlt,
    FaChartBar,
    FaEdit,
    FaFileExcel,
    FaFilePdf,
    FaGraduationCap,
    FaSms
} from 'react-icons/fa';

import Exam from './Exam/Exam';
import ExcelMarks from './ExcelMarks/ExcelMarks';
import Grading from './Grading/Grading';
import Marksheet from './Marksheet/Marksheet';
import Result from './Result/Result';
import ResultSMS from './ResultSMS/ResultSMS';
import Routine from './Routine/Routine';
import SubjectMarks from './SubjectMarks/SubjectMarks';

const ExaminationManagement = () => {
    const [activeTab, setActiveTab] = useState('list');

    const handleBack = () => {
        setActiveTab('list');
    };

    // Examination options with component references
    const examOptions = [
        {
            id: 'grading',
            title: 'গ্রেডিং',
            subtitle: 'Add custom grading system',
            icon: FaChartBar,
            color: 'purple',
            description: 'কাস্টম গ্রেডিং সিস্টেম তৈরি করুন এবং ম্যানেজ করুন',
            component: Grading // Grading component assign করা হয়েছে
        },
        {
            id: 'routine',
            title: 'রুটিন',
            subtitle: 'Add exam Routine',
            icon: FaCalendarAlt,
            color: 'blue',
            description: 'পরীক্ষার রুটিন তৈরি করুন এবং প্রকাশ করুন',
            component: Routine // Routine component assign করা হয়েছে
        },
        {
            id: 'exam',
            title: 'পরীক্ষা',
            subtitle: 'Create new exams',
            icon: FaEdit,
            color: 'green',
            description: 'নতুন পরীক্ষা তৈরি করুন এবং সেটআপ করুন',
            component: Exam // Exam component assign করা হয়েছে
        },
        {
            id: 'result',
            title: 'ফলাফল',
            subtitle: 'Exam result for class and batches',
            icon: FaGraduationCap,
            color: 'orange',
            description: 'ক্লাস এবং ব্যাচ অনুযায়ী ফলাফল দেখুন',
            component: Result // Result component assign করা হয়েছে
        },
        {
            id: 'marks',
            title: 'Subjectwise Marks',
            subtitle: 'Add exam marks subject wise',
            icon: FaBook,
            color: 'red',
            description: 'বিষয়ভিত্তিক পরীক্ষার মার্কস এন্ট্রি করুন',
            component: SubjectMarks // SubjectMarks component assign করা হয়েছে
        },
        {
            id: 'excel',
            title: 'Excel Marks',
            subtitle: 'Add exam marks with excel',
            icon: FaFileExcel,
            color: 'emerald',
            description: 'এক্সেল ফাইলের মাধ্যমে মার্কস ইমপোর্ট করুন',
            component: ExcelMarks // ExcelMarks component assign করা হয়েছে
        },
        {
            id: 'marksheet',
            title: 'Marksheets',
            subtitle: 'Marksheets for class and batches',
            icon: FaFilePdf,
            color: 'pink',
            description: 'ক্লাস এবং ব্যাচের মার্কশিট তৈরি করুন',
            component: Marksheet // Marksheet component assign করা হয়েছে
        },
        {
            id: 'sms',
            title: 'Result SMS',
            subtitle: 'Send result sms',
            icon: FaSms,
            color: 'teal',
            description: 'ফলাফল এসএমএস পাঠান শিক্ষার্থীদের',
            component: ResultSMS // ResultSMS component assign করা হয়েছে
        }
    ];

    // Color classes mapping
    const colorClasses = {
        purple: {
            bg: 'bg-purple-100',
            hoverBg: 'hover:bg-purple-200',
            text: 'text-purple-600',
            border: 'border-purple-400',
            icon: 'text-purple-600'
        },
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
        orange: {
            bg: 'bg-orange-100',
            hoverBg: 'hover:bg-orange-200',
            text: 'text-orange-600',
            border: 'border-orange-400',
            icon: 'text-orange-600'
        },
        red: {
            bg: 'bg-red-100',
            hoverBg: 'hover:bg-red-200',
            text: 'text-red-600',
            border: 'border-red-400',
            icon: 'text-red-600'
        },
        emerald: {
            bg: 'bg-emerald-100',
            hoverBg: 'hover:bg-emerald-200',
            text: 'text-emerald-600',
            border: 'border-emerald-400',
            icon: 'text-emerald-600'
        },
        pink: {
            bg: 'bg-pink-100',
            hoverBg: 'hover:bg-pink-200',
            text: 'text-pink-600',
            border: 'border-pink-400',
            icon: 'text-pink-600'
        },
        teal: {
            bg: 'bg-teal-100',
            hoverBg: 'hover:bg-teal-200',
            text: 'text-teal-600',
            border: 'border-teal-400',
            icon: 'text-teal-600'
        }
    };

    // Get the active component
    const ActiveComponent = examOptions.find(opt => opt.id === activeTab)?.component;

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header with Back Button (only when inside a tab) */}
            {activeTab !== 'list' && (
                <div className="sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm">
                    <div className="flex items-center gap-4 p-4 sm:p-6">
                        <button
                            onClick={handleBack}
                            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                            <FaArrowLeft className="text-xl text-gray-600" />
                        </button>
                        <h1 className="text-2xl font-bold text-gray-800">
                            {examOptions.find(opt => opt.id === activeTab)?.title || 'পরীক্ষা ব্যবস্থাপনা'}
                        </h1>
                    </div>
                </div>
            )}

            {/* Main Content */}
            <div className="p-4 sm:p-6 lg:p-8">
                {activeTab === 'list' ? (
                    <div className="max-w-7xl mx-auto">
                        <div className="text-center mb-10">
                            <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-3">
                                পরীক্ষা ব্যবস্থাপনা
                            </h1>
                            <p className="text-gray-600 text-lg">
                                আপনার প্রতিষ্ঠানের সকল পরীক্ষা সম্পর্কিত কার্যক্রম নিয়ন্ত্রণ করুন
                            </p>
                        </div>

                        {/* Examination Options Grid - Responsive */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {examOptions.map((option) => {
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
                    // Render the active component
                    ActiveComponent ? (
                        <ActiveComponent onBack={handleBack} />
                    ) : (
                        <div className="max-w-4xl mx-auto">
                            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
                                <div className="text-center mb-8">
                                    <div className="w-20 h-20 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
                                        {(() => {
                                            const option = examOptions.find(opt => opt.id === activeTab);
                                            const IconComponent = option?.icon || FaChartBar;
                                            const colorClass = colorClasses[option?.color || 'blue'];
                                            return <IconComponent className={`text-3xl ${colorClass.icon}`} />;
                                        })()}
                                    </div>
                                    <h2 className="text-3xl font-bold text-gray-800 mb-2">
                                        {examOptions.find(opt => opt.id === activeTab)?.title}
                                    </h2>
                                    <p className="text-gray-600 text-lg">
                                        {examOptions.find(opt => opt.id === activeTab)?.subtitle}
                                    </p>
                                </div>
                                
                                {/* Development Placeholder */}
                                <div className="text-center py-12">
                                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
                                        <h3 className="text-lg font-semibold text-yellow-800 mb-2">
                                            🚧 Development in Progress
                                        </h3>
                                        <p className="text-yellow-700">
                                            এই ফিচারটি বর্তমানে ডেভেলপমেন্ট পর্যায়ে রয়েছে। শীঘ্রই এটি উপলব্ধ হবে।
                                        </p>
                                    </div>
                                    <button
                                        onClick={handleBack}
                                        className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
                                    >
                                        মূল মেনুতে ফিরে যান
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

export default ExaminationManagement;