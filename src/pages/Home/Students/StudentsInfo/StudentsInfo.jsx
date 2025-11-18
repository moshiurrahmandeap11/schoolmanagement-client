import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import Loader from '../../../../components/sharedItems/Loader/Loader';
import MainButton from '../../../../components/sharedItems/Mainbutton/Mainbutton';
import axiosInstance from '../../../../hooks/axiosInstance/axiosInstance';

const StudentsInfo = () => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedClass, setSelectedClass] = useState('all');
    const navigate = useNavigate();

    const imageUrl = axiosInstance.defaults.baseURL;

    useEffect(() => {
        fetchStudents();
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

    // Group students by class
    const studentsByClass = students.reduce((acc, student) => {
        const className =
            typeof student.class === 'object'
                ? student.class.name
                : student.class;

        if (!acc[className]) {
            acc[className] = [];
        }
        acc[className].push(student);
        return acc;
    }, {});

    // Sort class names numerically
    const sortedClasses = Object.keys(studentsByClass).sort((a, b) => {
        const numA = parseInt(a.replace(/\D/g, ''));
        const numB = parseInt(b.replace(/\D/g, ''));
        return numA - numB;
    });

    // Filter classes for display
    const displayClasses =
        selectedClass === 'all'
            ? sortedClasses
            : sortedClasses.filter((cls) => cls === selectedClass);

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
            <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
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
                        <h2 className="text-xl font-semibold text-gray-900">
                            শ্রেণী নির্বাচন করুন
                        </h2>

                        <div className="flex flex-wrap gap-2">
                            <MainButton
                                onClick={() => setSelectedClass('all')}
                                className={`px-4 py-2 rounded-md transition-colors ${
                                    selectedClass === 'all'
                                        ? 'bg-[#1e90c9] text-white'
                                        : 'bg-gray-200 text-black hover:bg-gray-300'
                                }`}
                            >
                                সকল শ্রেণী
                            </MainButton>

                            {sortedClasses.map((cls) => (
                                <MainButton
                                    key={cls}
                                    onClick={() => setSelectedClass(cls)}
                                    className={`px-4 py-2 rounded-md transition-colors ${
                                        selectedClass === cls
                                            ? 'bg-[#1e90c9] text-white'
                                            : 'bg-gray-200 text-black hover:bg-gray-300'
                                    }`}
                                >
                                    {cls}
                                </MainButton>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Students Grid by Class */}
                <div className="space-y-8">
                    {displayClasses.length > 0 ? (
                        displayClasses.map((className) => (
                            <div
                                key={className}
                                className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
                            >
                                {/* Class Header */}
                                <div className="bg-gradient-to-r from-[#1e90c9] to-[#1e90c9]/90 px-6 py-4">
                                    <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                                        {className} শ্রেণী
                                        <span className="text-blue-200 text-lg ml-2">
                                            (মোট: {studentsByClass[className].length} জন)
                                        </span>
                                    </h2>
                                </div>

                                {/* Student Cards */}
                                <div className="p-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                        {studentsByClass[className]
                                            .sort((a, b) => a.roll - b.roll)
                                            .map((student) => (
                                                <div
                                                    key={student._id}
                                                    className="bg-gray-50 border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                                                >
                                                    <div className="flex items-start gap-4">
                                                        {student.photo ? (
                                                            <img
                                                                src={`${imageUrl}${student.photo}`}
                                                                alt={student.name}
                                                                className="w-16 h-16 rounded-full object-cover border-2 border-blue-200"
                                                            />
                                                        ) : (
                                                            <div className="w-16 h-16 rounded-full bg-blue-100 border-2 border-blue-200 flex items-center justify-center">
                                                                <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                                                                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                                </svg>
                                                            </div>
                                                        )}

                                                        <div>
                                                            <h3 className="font-semibold text-gray-900 text-lg">
                                                                {student.name}
                                                            </h3>
                                                            <p className="text-sm text-gray-600">
                                                                <span className="font-medium">রোল:</span> {student.classRoll}
                                                            </p>
                                                            <p className="text-sm text-gray-600">
                                                                <span className="font-medium">সেকশন:</span>{' '}
                                                                {student.section?.name}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-20 bg-white rounded-lg shadow-sm border">
                            <h3 className="text-xl font-semibold text-gray-700">
                                কোনো ছাত্র-ছাত্রী পাওয়া যায়নি
                            </h3>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default StudentsInfo;
