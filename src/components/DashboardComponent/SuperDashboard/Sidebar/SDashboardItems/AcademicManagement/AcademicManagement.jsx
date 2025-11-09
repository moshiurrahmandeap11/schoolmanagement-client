import { useState } from 'react';
import {
    FaArrowLeft,
    FaBell,
    FaCalendarAlt,
    FaChalkboardTeacher,
    FaChartBar,
    FaFileAlt,
    FaFileUpload,
    FaFolderPlus,
    FaListAlt,
    FaTasks,
    FaUserGraduate
} from 'react-icons/fa';

// Import all the components (you'll need to create these)
import Notice from '../../../Sidebar/NoticesAdmin/NoticesAdmin';
import ClassRoutine from '../../../Sidebar/RoutineAdmin/RoutineAdmin';
import AllDocument from './AllDocument/AllDocument';
import Assignments from './Assignments/Assignments';
import BulkDocument from './BulkDocument/BulkDocument';
import Category from './Category/Category';
import ClassReport from './ClassReport/ClassReport';
import ClassReportList from './ClassReportList/ClassReportList';
import NewDocument from './NewDocument/NewDocument';
import Students from './Students/Students';
import TeacherLessons from './TeacherLessons/TeacherLessons';

const AcademicManagement = () => {
    const [activeTab, setActiveTab] = useState('dashboard');

    const handleBack = () => {
        setActiveTab('dashboard');
    };

    // Academic management options
    const academicOptions = [
        {
            id: 'category',
            title: 'ক্যাটাগরী',
            subtitle: 'Create New Document Category',
            icon: FaFolderPlus,
            color: 'blue',
            description: 'ডকুমেন্ট ক্যাটাগরী তৈরি এবং ব্যবস্থাপনা',
            component: Category
        },
        {
            id: 'new-document',
            title: 'New Document',
            subtitle: 'Create New Document',
            icon: FaFileAlt,
            color: 'green',
            description: 'নতুন একক ডকুমেন্ট তৈরি করুন',
            component: NewDocument
        },
        {
            id: 'bulk-document',
            title: 'Bulk Add Document',
            subtitle: 'Create Bulk Document',
            icon: FaFileUpload,
            color: 'purple',
            description: 'একসাথে অনেকগুলো ডকুমেন্ট যোগ করুন',
            component: BulkDocument
        },
        {
            id: 'all-document',
            title: 'All Document',
            subtitle: 'See All Document',
            icon: FaListAlt,
            color: 'indigo',
            description: 'সকল ডকুমেন্ট দেখুন এবং ব্যবস্থাপনা করুন',
            component: AllDocument
        },
        {
            id: 'class-routine',
            title: 'ক্লাস রুটিন',
            subtitle: 'Institute Class Routine',
            icon: FaCalendarAlt,
            color: 'yellow',
            description: 'ক্লাস রুটিন তৈরি এবং ব্যবস্থাপনা',
            component: ClassRoutine
        },
        {
            id: 'notice',
            title: 'নোটিশ',
            subtitle: 'See Academic Notice',
            icon: FaBell,
            color: 'red',
            description: 'একাডেমিক নোটিশ দেখুন এবং ব্যবস্থাপনা করুন',
            component: Notice
        },
        {
            id: 'teacher-lessons',
            title: 'Teacher Lessons',
            subtitle: 'See All Lessons, Create, Update',
            icon: FaChalkboardTeacher,
            color: 'pink',
            description: 'শিক্ষকের পাঠ পরিকল্পনা ব্যবস্থাপনা',
            component: TeacherLessons
        },
        {
            id: 'assignments',
            title: 'Assignments',
            subtitle: 'Create New Home Work',
            icon: FaTasks,
            color: 'orange',
            description: 'হোমওয়ার্ক এবং অ্যাসাইনমেন্ট তৈরি করুন',
            component: Assignments
        },
        {
            id: 'students',
            title: 'শিক্ষার্থী',
            subtitle: 'View Students',
            icon: FaUserGraduate,
            color: 'teal',
            description: 'শিক্ষার্থীদের তথ্য দেখুন এবং ব্যবস্থাপনা করুন',
            component: Students
        },
        {
            id: 'class-report',
            title: 'Class Report',
            subtitle: 'Add Student Class Report',
            icon: FaChartBar,
            color: 'cyan',
            description: 'শিক্ষার্থীদের ক্লাস রিপোর্ট যোগ করুন',
            component: ClassReport
        },
        {
            id: 'class-report-list',
            title: 'Class Report List',
            subtitle: 'See All Class Report',
            icon: FaListAlt,
            color: 'gray',
            description: 'সকল ক্লাস রিপোর্ট দেখুন',
            component: ClassReportList
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
        purple: {
            bg: 'bg-purple-100',
            hoverBg: 'hover:bg-purple-200',
            text: 'text-purple-600',
            border: 'border-purple-400',
            icon: 'text-purple-600'
        },
        indigo: {
            bg: 'bg-indigo-100',
            hoverBg: 'hover:bg-indigo-200',
            text: 'text-indigo-600',
            border: 'border-indigo-400',
            icon: 'text-indigo-600'
        },
        yellow: {
            bg: 'bg-yellow-100',
            hoverBg: 'hover:bg-yellow-200',
            text: 'text-yellow-600',
            border: 'border-yellow-400',
            icon: 'text-yellow-600'
        },
        red: {
            bg: 'bg-red-100',
            hoverBg: 'hover:bg-red-200',
            text: 'text-red-600',
            border: 'border-red-400',
            icon: 'text-red-600'
        },
        pink: {
            bg: 'bg-pink-100',
            hoverBg: 'hover:bg-pink-200',
            text: 'text-pink-600',
            border: 'border-pink-400',
            icon: 'text-pink-600'
        },
        orange: {
            bg: 'bg-orange-100',
            hoverBg: 'hover:bg-orange-200',
            text: 'text-orange-600',
            border: 'border-orange-400',
            icon: 'text-orange-600'
        },
        teal: {
            bg: 'bg-teal-100',
            hoverBg: 'hover:bg-teal-200',
            text: 'text-teal-600',
            border: 'border-teal-400',
            icon: 'text-teal-600'
        },
        cyan: {
            bg: 'bg-cyan-100',
            hoverBg: 'hover:bg-cyan-200',
            text: 'text-cyan-600',
            border: 'border-cyan-400',
            icon: 'text-cyan-600'
        },
        gray: {
            bg: 'bg-gray-100',
            hoverBg: 'hover:bg-gray-200',
            text: 'text-gray-600',
            border: 'border-gray-400',
            icon: 'text-gray-600'
        }
    };

    // Get the active component
    const ActiveComponent = academicOptions.find(opt => opt.id === activeTab)?.component;

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
                            {academicOptions.find(opt => opt.id === activeTab)?.title || 'একাডেমিক ব্যবস্থাপনা'}
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
                                একাডেমিক ব্যবস্থাপনা
                            </h1>
                            <p className="text-gray-600 text-lg">
                                আপনার প্রতিষ্ঠানের সকল একাডেমিক কার্যক্রম নিয়ন্ত্রণ করুন
                            </p>
                        </div>

                        {/* Academic Options Grid - Responsive */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {academicOptions.map((option) => {
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
                                            const option = academicOptions.find(opt => opt.id === activeTab);
                                            const IconComponent = option?.icon || FaFolderPlus;
                                            const colorClass = colorClasses[option?.color || 'blue'];
                                            return <IconComponent className={`text-3xl ${colorClass.icon}`} />;
                                        })()}
                                    </div>
                                    <h2 className="text-3xl font-bold text-gray-800 mb-2">
                                        {academicOptions.find(opt => opt.id === activeTab)?.title}
                                    </h2>
                                    <p className="text-gray-600 text-lg">
                                        {academicOptions.find(opt => opt.id === activeTab)?.subtitle}
                                    </p>
                                </div>
                                
                                {/* Placeholder if component not found */}
                                <div className="text-center py-12">
                                    <p className="text-gray-500 text-lg">
                                        Component not found for {academicOptions.find(opt => opt.id === activeTab)?.title}
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

export default AcademicManagement;