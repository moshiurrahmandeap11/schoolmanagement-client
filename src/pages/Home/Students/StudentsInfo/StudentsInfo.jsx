import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import axiosInstance from '../../../../hooks/axiosInstance/axiosInstance';
import Loader from '../../../../components/sharedItems/Loader/Loader';

const StudentsInfo = () => {
    const [students, setStudents] = useState([]);
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedClass, setSelectedClass] = useState('all');
    const navigate = useNavigate();

    useEffect(() => {
        fetchStudents();
        fetchClasses();
    }, []);

    const fetchStudents = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get('/students');
            if (response.data.success) {
                setStudents(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching students:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchClasses = async () => {
        try {
            const response = await axiosInstance.get('/classes');
            if (response.data.success) {
                setClasses(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching classes:', error);
        }
    };

    // Group students by class
    const studentsByClass = students.reduce((acc, student) => {
        const className = student.class;
        if (!acc[className]) {
            acc[className] = [];
        }
        acc[className].push(student);
        return acc;
    }, {});

    // Sort classes numerically
    const sortedClasses = Object.keys(studentsByClass).sort((a, b) => {
        const numA = parseInt(a.replace(/\D/g, ''));
        const numB = parseInt(b.replace(/\D/g, ''));
        return numA - numB;
    });

    // Filter classes based on selection
    const displayClasses = selectedClass === 'all' 
        ? sortedClasses 
        : sortedClasses.filter(cls => cls === selectedClass);

    const imageUrl = axiosInstance.defaults.baseURL;

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <Loader />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        ছাত্র-ছাত্রীদের তথ্য
                    </h1>
                    <p className="text-gray-600">
                        শ্রেণীভিত্তিক সকল ছাত্র-ছাত্রীর তালিকা
                    </p>
                </div>

                {/* Class Filter */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                        <h2 className="text-xl font-semibold text-gray-900">শ্রেণী নির্বাচন করুন</h2>
                        
                        <div className="flex flex-wrap gap-2">
                            <button
                                onClick={() => setSelectedClass('all')}
                                className={`px-4 py-2 rounded-md transition-colors ${
                                    selectedClass === 'all'
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                }`}
                            >
                                সকল শ্রেণী
                            </button>
                            
                            {classes.map(cls => (
                                <button
                                    key={cls._id}
                                    onClick={() => setSelectedClass(cls.name)}
                                    className={`px-4 py-2 rounded-md transition-colors ${
                                        selectedClass === cls.name
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                    }`}
                                >
                                    {cls.name}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Students by Class */}
                <div className="space-y-8">
                    {displayClasses.length > 0 ? (
                        displayClasses.map(className => (
                            <div key={className} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                                {/* Class Header */}
                                <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
                                    <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l9-5-9-5-9 5 9 5zm0 0v8" />
                                        </svg>
                                        {className} শ্রেণী
                                        <span className="text-blue-200 text-lg ml-2">
                                            (মোট ছাত্র-ছাত্রী: {studentsByClass[className].length} জন)
                                        </span>
                                    </h2>
                                </div>

                                {/* Students Grid */}
                                <div className="p-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                        {studentsByClass[className]
                                            .sort((a, b) => a.roll - b.roll)
                                            .map(student => (
                                                <div 
                                                    key={student._id}
                                                    className="bg-gray-50 border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200"
                                                >
                                                    {/* Student Photo and Basic Info */}
                                                    <div className="flex items-start gap-4">
                                                        <div className="flex-shrink-0">
                                                            {student.photo ? (
                                                                <img
                                                                    src={`${imageUrl}${student.photo}`}
                                                                    alt={student.name}
                                                                    className="w-16 h-16 rounded-full object-cover border-2 border-blue-200"
                                                                />
                                                            ) : (
                                                                <div className="w-16 h-16 rounded-full bg-blue-100 border-2 border-blue-200 flex items-center justify-center">
                                                                    <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                                    </svg>
                                                                </div>
                                                            )}
                                                        </div>
                                                        
                                                        <div className="flex-1 min-w-0">
                                                            <h3 className="font-semibold text-gray-900 text-lg truncate">
                                                                {student.name}
                                                            </h3>
                                                            <div className="space-y-1 mt-2">
                                                                <p className="text-sm text-gray-600">
                                                                    <span className="font-medium">রোল:</span> {student.roll}
                                                                </p>
                                                                <p className="text-sm text-gray-600">
                                                                    <span className="font-medium">সেকশন:</span> {student.section}
                                                                </p>
                                                                {student.fathersName && (
                                                                    <p className="text-sm text-gray-600">
                                                                        <span className="font-medium">পিতা:</span> {student.fathersName}
                                                                    </p>
                                                                )}
                                                                {student.phoneNumber && (
                                                                    <p className="text-sm text-gray-600">
                                                                        <span className="font-medium">ফোন:</span> {student.phoneNumber}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Additional Info (on hover/focus) */}
                                                    <div className="mt-4 pt-4 border-t border-gray-200">
                                                        <div className="grid grid-cols-2 gap-2 text-xs text-gray-500">
                                                            {student.mothersName && (
                                                                <div>
                                                                    <span className="font-medium">মাতা:</span> {student.mothersName}
                                                                </div>
                                                            )}
                                                            {student.fathersPhone && (
                                                                <div>
                                                                    <span className="font-medium">পিতার ফোন:</span> {student.fathersPhone}
                                                                </div>
                                                            )}
                                                            {student.mothersPhone && (
                                                                <div>
                                                                    <span className="font-medium">মাতার ফোন:</span> {student.mothersPhone}
                                                                </div>
                                                            )}
                                                            {student.location && (
                                                                <div className="col-span-2">
                                                                    <span className="font-medium">ঠিকানা:</span> {student.location}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        }
                                    </div>

                                    {/* Class Summary */}
                                    <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                                            <div>
                                                <p className="text-2xl font-bold text-blue-600">{studentsByClass[className].length}</p>
                                                <p className="text-sm text-blue-700">মোট ছাত্র-ছাত্রী</p>
                                            </div>
                                            <div>
                                                <p className="text-2xl font-bold text-green-600">
                                                    {studentsByClass[className].filter(s => s.status === 'active').length}
                                                </p>
                                                <p className="text-sm text-green-700">সক্রিয়</p>
                                            </div>
                                            <div>
                                                <p className="text-2xl font-bold text-purple-600">
                                                    {new Set(studentsByClass[className].map(s => s.section)).size}
                                                </p>
                                                <p className="text-sm text-purple-700">সেকশন</p>
                                            </div>
                                            <div>
                                                <p className="text-2xl font-bold text-orange-600">
                                                    {Math.max(...studentsByClass[className].map(s => s.roll))}
                                                </p>
                                                <p className="text-sm text-orange-700">সর্বোচ্চ রোল</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        /* Empty State */
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                            <div className="text-gray-400 mb-4">
                                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                {selectedClass === 'all' ? 'কোনো ছাত্র-ছাত্রী পাওয়া যায়নি' : `${selectedClass} শ্রেণীতে কোনো ছাত্র-ছাত্রী নেই`}
                            </h3>
                            <p className="text-gray-600 mb-6">
                                {selectedClass === 'all' 
                                    ? 'এখনো কোনো ছাত্র-ছাত্রী যোগ করা হয়নি' 
                                    : 'এই শ্রেণীতে এখনো কোনো ছাত্র-ছাত্রী যোগ করা হয়নি'
                                }
                            </p>
                            <button
                                onClick={() => navigate('/admin/students')}
                                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                            >
                                ছাত্র-ছাত্রী যোগ করুন
                            </button>
                        </div>
                    )}
                </div>

                {/* Total Summary */}
                {displayClasses.length > 0 && (
                    <div className="mt-8 bg-gradient-to-r from-green-600 to-green-700 rounded-lg shadow-sm p-6 text-white">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                            <div>
                                <p className="text-3xl font-bold">{Object.keys(studentsByClass).length}</p>
                                <p className="text-green-100">মোট শ্রেণী</p>
                            </div>
                            <div>
                                <p className="text-3xl font-bold">{students.length}</p>
                                <p className="text-green-100">মোট ছাত্র-ছাত্রী</p>
                            </div>
                            <div>
                                <p className="text-3xl font-bold">
                                    {new Set(students.map(s => s.section)).size}
                                </p>
                                <p className="text-green-100">মোট সেকশন</p>
                            </div>
                            <div>
                                <p className="text-3xl font-bold">
                                    {classes.length}
                                </p>
                                <p className="text-green-100">নিবন্ধিত শ্রেণী</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StudentsInfo;