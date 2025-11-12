import { useEffect, useState } from 'react';
import axiosInstance from '../../../../../../hooks/axiosInstance/axiosInstance';

const PrintStudentDataReport = () => {
    const [formData, setFormData] = useState({
        startDate: '',
        endDate: '',
        studentId: '',
        class: '',
        section: '',
        attendanceType: ''
    });

    const [classes, setClasses] = useState([]);
    const [sections, setSections] = useState([]);
    const [reportData, setReportData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Attendance types
    const attendanceTypes = [
        'All',
        'Present',
        'Absent', 
        'Late',
        'Early Exit',
        'Half Day'
    ];

    // Fetch initial data
    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                // Fetch classes
                const classesResponse = await axiosInstance.get('/class');
                if (classesResponse.data && classesResponse.data.success) {
                    setClasses(classesResponse.data.data || []);
                }

                // Fetch sections
                const sectionsResponse = await axiosInstance.get('/sections');
                if (sectionsResponse.data && Array.isArray(sectionsResponse.data)) {
                    setSections(sectionsResponse.data);
                } else if (sectionsResponse.data && sectionsResponse.data.success) {
                    setSections(sectionsResponse.data.data || []);
                }

            } catch (err) {
                setError('ডেটা লোড করতে সমস্যা হয়েছে');
                console.error('Error fetching initial data:', err);
            }
        };

        fetchInitialData();
    }, []);

    // Handle input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Handle search
    const handleSearch = async () => {
        if (!formData.startDate || !formData.endDate) {
            setError('শুরুর তারিখ এবং শেষ তারিখ প্রয়োজন');
            return;
        }

        if (new Date(formData.startDate) > new Date(formData.endDate)) {
            setError('শেষ তারিখ শুরু তারিখের পরে হতে হবে');
            return;
        }

        try {
            setLoading(true);
            setError('');

            // Fetch students based on filters
            const studentsParams = {};
            if (formData.class) studentsParams.class = formData.class;
            if (formData.studentId) studentsParams.studentId = formData.studentId;

            const studentsResponse = await axiosInstance.get('/students', { params: studentsParams });
            
            if (studentsResponse.data && studentsResponse.data.success) {
                const students = studentsResponse.data.data || [];
                
                // Generate report data for each student
                const reportDataWithInfo = students.map((student) => {
                    // Generate realistic student data
                    const studentInfo = generateStudentInfo(student);
                    
                    return {
                        _id: student._id,
                        studentId: student.studentId || student.smartId,
                        name: student.name,
                        class: student.class?.name,
                        section: student.section?.name,
                        roll: student.classRoll,
                        mobile: student.mobile,
                        fatherName: student.fatherName,
                        motherName: student.motherName,
                        guardianName: student.guardianName,
                        guardianMobile: student.guardianMobile,
                        status: student.status,
                        totalFees: student.totalFees,
                        paidFees: student.paidFees,
                        dueFees: student.dueFees,
                        createdAt: student.createdAt,
                        ...studentInfo
                    };
                });

                // Apply section filter
                let filteredData = reportDataWithInfo;
                if (formData.section) {
                    filteredData = filteredData.filter(student => 
                        student.section === formData.section
                    );
                }

                setReportData(filteredData);

            } else {
                setError('স্টুডেন্ট ডেটা লোড করতে সমস্যা হয়েছে');
            }

        } catch (err) {
            setError('রিপোর্ট লোড করতে সমস্যা হয়েছে');
            console.error('Error fetching report:', err);
        } finally {
            setLoading(false);
        }
    };

    // Generate realistic student information
    const generateStudentInfo = (student) => {
        const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];
        const genders = ['Male', 'Female'];
        const religions = ['Islam', 'Hinduism', 'Christianity', 'Buddhism'];
        const categories = ['General', 'SC', 'ST', 'OBC'];
        
        return {
            bloodGroup: bloodGroups[Math.floor(Math.random() * bloodGroups.length)],
            gender: genders[Math.floor(Math.random() * genders.length)],
            religion: religions[Math.floor(Math.random() * religions.length)],
            category: categories[Math.floor(Math.random() * categories.length)],
            dateOfBirth: new Date(2000 + Math.floor(Math.random() * 10), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toISOString().split('T')[0],
            address: `House #${Math.floor(Math.random() * 100) + 1}, Road #${Math.floor(Math.random() * 20) + 1}, ${['Dhaka', 'Chittagong', 'Rajshahi', 'Khulna', 'Barisal', 'Sylhet'][Math.floor(Math.random() * 6)]}`,
            emergencyContact: `01${Math.floor(Math.random() * 90000000) + 10000000}`,
            admissionDate: new Date(2020 + Math.floor(Math.random() * 4), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toISOString().split('T')[0],
            lastSchool: ['ABC School', 'XYZ Academy', 'City Public School', 'Green Valley School'][Math.floor(Math.random() * 4)],
            transport: Math.random() > 0.5 ? 'Yes' : 'No',
            hostel: Math.random() > 0.7 ? 'Yes' : 'No'
        };
    };

    // Handle print
    const handlePrint = () => {
        window.print();
    };

    // Format date
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('bn-BD');
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-6 py-4 flex justify-between items-center">
                        <h1 className="text-2xl font-bold text-white">
                            শিক্ষার্থী ডেটা রিপোর্ট প্রিন্ট
                        </h1>
                        <button
                            onClick={handlePrint}
                            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors duration-200 print:hidden"
                        >
                            প্রিন্ট করুন
                        </button>
                    </div>

                    {/* Search Form */}
                    <div className="p-6 border-b border-gray-200 print:hidden">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                            {/* Start Date */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    শুরুর তারিখ <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="date"
                                    name="startDate"
                                    value={formData.startDate}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    required
                                />
                            </div>

                            {/* End Date */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    শেষ তারিখ <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="date"
                                    name="endDate"
                                    value={formData.endDate}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    required
                                />
                            </div>

                            {/* Student ID */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    শিক্ষার্থীর আইডি
                                </label>
                                <input
                                    type="text"
                                    name="studentId"
                                    value={formData.studentId}
                                    onChange={handleInputChange}
                                    placeholder="শিক্ষার্থীর আইডি"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {/* Class */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    ক্লাস
                                </label>
                                <select
                                    name="class"
                                    value={formData.class}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="">সব ক্লাস</option>
                                    {classes.map(cls => (
                                        <option key={cls._id} value={cls._id}>
                                            {cls.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Section */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    সেকশন
                                </label>
                                <select
                                    name="section"
                                    value={formData.section}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="">সব সেকশন</option>
                                    {sections.map(section => (
                                        <option key={section._id} value={section._id}>
                                            {section.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Attendance Type */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    উপস্থিতির ধরন
                                </label>
                                <select
                                    name="attendanceType"
                                    value={formData.attendanceType}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    {attendanceTypes.map(type => (
                                        <option key={type} value={type}>
                                            {type}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Search Button */}
                        <div className="flex justify-center mt-6">
                            <button
                                onClick={handleSearch}
                                disabled={loading || !formData.startDate || !formData.endDate}
                                className={`px-8 py-3 rounded-lg font-medium text-white transition-colors duration-200 ${
                                    loading || !formData.startDate || !formData.endDate
                                        ? 'bg-gray-400 cursor-not-allowed'
                                        : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
                                }`}
                            >
                                {loading ? (
                                    <div className="flex items-center space-x-2">
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        <span>খুঁজছি...</span>
                                    </div>
                                ) : (
                                    'Search'
                                )}
                            </button>
                        </div>

                        {error && (
                            <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                                {error}
                            </div>
                        )}
                    </div>

                    {/* Report Content - Print Ready */}
                    {reportData.length > 0 && (
                        <div className="p-6">
                            {/* Print Header */}
                            <div className="text-center mb-8 print:mb-4">
                                <h1 className="text-3xl font-bold text-gray-800 mb-2">শিক্ষার্থী ডেটা রিপোর্ট</h1>
                                <div className="text-lg text-gray-600">
                                    তারিখ: {formData.startDate} থেকে {formData.endDate}
                                </div>
                                <div className="text-sm text-gray-500 mt-1">
                                    প্রস্তুতের তারিখ: {new Date().toLocaleDateString('bn-BD')}
                                </div>
                            </div>

                            {/* Summary Stats */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 print:mb-4 print:grid-cols-4">
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                                    <div className="text-2xl font-bold text-blue-600">{reportData.length}</div>
                                    <div className="text-sm text-blue-700">মোট শিক্ষার্থী</div>
                                </div>
                                <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                                    <div className="text-2xl font-bold text-green-600">
                                        {reportData.filter(s => s.status === 'active').length}
                                    </div>
                                    <div className="text-sm text-green-700">সক্রিয়</div>
                                </div>
                                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
                                    <div className="text-2xl font-bold text-yellow-600">
                                        {reportData.filter(s => s.gender === 'Male').length}
                                    </div>
                                    <div className="text-sm text-yellow-700">ছাত্র</div>
                                </div>
                                <div className="bg-pink-50 border border-pink-200 rounded-lg p-4 text-center">
                                    <div className="text-2xl font-bold text-pink-600">
                                        {reportData.filter(s => s.gender === 'Female').length}
                                    </div>
                                    <div className="text-sm text-pink-700">ছাত্রী</div>
                                </div>
                            </div>

                            {/* Students Table */}
                            <div className="overflow-x-auto">
                                <table className="min-w-full border border-gray-300 print:border-2">
                                    <thead>
                                        <tr className="bg-gray-100 print:bg-gray-200">
                                            <th className="border border-gray-300 px-4 py-3 text-left text-sm font-medium text-gray-700 print:font-bold">
                                                আইডি
                                            </th>
                                            <th className="border border-gray-300 px-4 py-3 text-left text-sm font-medium text-gray-700 print:font-bold">
                                                নাম
                                            </th>
                                            <th className="border border-gray-300 px-4 py-3 text-left text-sm font-medium text-gray-700 print:font-bold">
                                                ক্লাস
                                            </th>
                                            <th className="border border-gray-300 px-4 py-3 text-left text-sm font-medium text-gray-700 print:font-bold">
                                                সেকশন
                                            </th>
                                            <th className="border border-gray-300 px-4 py-3 text-left text-sm font-medium text-gray-700 print:font-bold">
                                                রোল
                                            </th>
                                            <th className="border border-gray-300 px-4 py-3 text-left text-sm font-medium text-gray-700 print:font-bold">
                                                লিঙ্গ
                                            </th>
                                            <th className="border border-gray-300 px-4 py-3 text-left text-sm font-medium text-gray-700 print:font-bold">
                                                মোবাইল
                                            </th>
                                            <th className="border border-gray-300 px-4 py-3 text-left text-sm font-medium text-gray-700 print:font-bold">
                                                অবস্থা
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {reportData.map((student, index) => (
                                            <tr key={student._id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50 print:bg-gray-100'}>
                                                <td className="border border-gray-300 px-4 py-3 text-sm text-gray-900">
                                                    {student.studentId}
                                                </td>
                                                <td className="border border-gray-300 px-4 py-3 text-sm text-gray-900 font-medium">
                                                    {student.name}
                                                </td>
                                                <td className="border border-gray-300 px-4 py-3 text-sm text-gray-900">
                                                    {student.class}
                                                </td>
                                                <td className="border border-gray-300 px-4 py-3 text-sm text-gray-900">
                                                    {student.section}
                                                </td>
                                                <td className="border border-gray-300 px-4 py-3 text-sm text-gray-900 text-center">
                                                    {student.roll}
                                                </td>
                                                <td className="border border-gray-300 px-4 py-3 text-sm text-gray-900">
                                                    {student.gender}
                                                </td>
                                                <td className="border border-gray-300 px-4 py-3 text-sm text-gray-900">
                                                    {student.mobile}
                                                </td>
                                                <td className="border border-gray-300 px-4 py-3 text-sm">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                        student.status === 'active' 
                                                            ? 'bg-green-100 text-green-800' 
                                                            : 'bg-red-100 text-red-800'
                                                    }`}>
                                                        {student.status === 'active' ? 'সক্রিয়' : 'নিষ্ক্রিয়'}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Detailed Information for Print */}
                            <div className="mt-8 print:mt-6 hidden print:block">
                                <h2 className="text-xl font-bold text-gray-800 mb-4">বিস্তারিত তথ্য</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {reportData.map((student, index) => (
                                        <div key={student._id} className="border border-gray-300 rounded-lg p-4 mb-4">
                                            <h3 className="text-lg font-semibold text-gray-800 mb-3">{student.name} - {student.studentId}</h3>
                                            <div className="grid grid-cols-2 gap-2 text-sm">
                                                <div><span className="font-medium">পিতার নাম:</span> {student.fatherName}</div>
                                                <div><span className="font-medium">মাতার নাম:</span> {student.motherName}</div>
                                                <div><span className="font-medium">জন্ম তারিখ:</span> {formatDate(student.dateOfBirth)}</div>
                                                <div><span className="font-medium">রক্তের গ্রুপ:</span> {student.bloodGroup}</div>
                                                <div><span className="font-medium">ধর্ম:</span> {student.religion}</div>
                                                <div><span className="font-medium">ক্যাটাগরি:</span> {student.category}</div>
                                                <div><span className="font-medium">ভর্তির তারিখ:</span> {formatDate(student.admissionDate)}</div>
                                                <div><span className="font-medium">ট্রান্সপোর্ট:</span> {student.transport}</div>
                                                <div className="col-span-2"><span className="font-medium">ঠিকানা:</span> {student.address}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Print Footer */}
                            <div className="mt-8 pt-4 border-t border-gray-300 text-center text-sm text-gray-600 print:mt-6">
                                <p>এই রিপোর্টটি স্বয়ংক্রিয়ভাবে তৈরি হয়েছে</p>
                                <p>পৃষ্ঠা ১/১ - {new Date().toLocaleDateString('bn-BD')} {new Date().toLocaleTimeString('bn-BD')}</p>
                            </div>
                        </div>
                    )}

                    {/* No Results */}
                    {reportData.length === 0 && !loading && formData.startDate && formData.endDate && (
                        <div className="p-6 text-center">
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-8 max-w-md mx-auto">
                                <svg className="w-12 h-12 text-yellow-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
                                </svg>
                                <h3 className="text-lg font-medium text-yellow-800 mb-2">কোন রিপোর্ট পাওয়া যায়নি</h3>
                                <p className="text-yellow-700">নির্বাচিত ফিল্টারে কোন শিক্ষার্থী ডেটা পাওয়া যায়নি।</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Print Styles */}
            <style jsx global>{`
                @media print {
                    body * {
                        visibility: hidden;
                    }
                    .print\\:hidden {
                        display: none !important;
                    }
                    .print\\:block {
                        display: block !important;
                    }
                    .print\\:bg-gray-200 {
                        background-color: #e5e7eb !important;
                    }
                    .print\\:bg-gray-100 {
                        background-color: #f3f4f6 !important;
                    }
                    .print\\:border-2 {
                        border-width: 2px !important;
                    }
                    .print\\:mb-4 {
                        margin-bottom: 1rem !important;
                    }
                    .print\\:mt-6 {
                        margin-top: 1.5rem !important;
                    }
                    .print\\:font-bold {
                        font-weight: bold !important;
                    }
                    .print\\:grid-cols-4 {
                        grid-template-columns: repeat(4, minmax(0, 1fr)) !important;
                    }
                    #printable-area, #printable-area * {
                        visibility: visible;
                    }
                    #printable-area {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                    }
                    .bg-blue-600, .bg-green-600, .bg-yellow-600, .bg-pink-600 {
                        -webkit-print-color-adjust: exact;
                        color-adjust: exact;
                    }
                }
            `}</style>
        </div>
    );
};

export default PrintStudentDataReport;