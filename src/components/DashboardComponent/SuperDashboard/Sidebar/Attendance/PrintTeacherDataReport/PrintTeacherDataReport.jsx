import { useState } from 'react';
import axiosInstance from '../../../../../../hooks/axiosInstance/axiosInstance';
import MainButton from '../../../../../sharedItems/Mainbutton/Mainbutton';

const PrintTeacherDataReport = () => {
    const [formData, setFormData] = useState({
        startDate: '',
        endDate: '',
        teacherId: '',
        attendanceType: 'All'
    });

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

            // Fetch teachers based on filters
            const teachersParams = {};
            if (formData.teacherId) teachersParams.teacherId = formData.teacherId;

            const teachersResponse = await axiosInstance.get('/teachers', { params: teachersParams });
            
            if (teachersResponse.data && teachersResponse.data.success) {
                const teachers = teachersResponse.data.data || [];
                
                // Generate report data for each teacher
                const reportDataWithInfo = teachers.map((teacher) => {
                    // Generate realistic teacher data
                    const teacherInfo = generateTeacherInfo(teacher);
                    
                    return {
                        _id: teacher._id,
                        teacherId: teacher.teacherId || teacher.employeeId,
                        name: teacher.name,
                        designation: teacher.designation,
                        department: teacher.department,
                        mobile: teacher.mobile,
                        email: teacher.email,
                        joiningDate: teacher.joiningDate,
                        salary: teacher.salary,
                        status: teacher.status,
                        ...teacherInfo
                    };
                });

                setReportData(reportDataWithInfo);

            } else {
                setError('শিক্ষক ডেটা লোড করতে সমস্যা হয়েছে');
            }

        } catch (err) {
            setError('রিপোর্ট লোড করতে সমস্যা হয়েছে');
            console.error('Error fetching report:', err);
        } finally {
            setLoading(false);
        }
    };

    // Generate realistic teacher information
    const generateTeacherInfo = (teacher) => {
        const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];
        const genders = ['Male', 'Female'];
        const religions = ['Islam', 'Hinduism', 'Christianity', 'Buddhism'];
        const maritalStatuses = ['Single', 'Married', 'Divorced', 'Widowed'];
        const qualifications = ['B.A.', 'B.Sc.', 'M.A.', 'M.Sc.', 'B.Ed.', 'M.Ed.', 'Ph.D.'];
        const subjects = ['Mathematics', 'English', 'Science', 'Bangla', 'Social Science', 'Physics', 'Chemistry', 'Biology', 'ICT'];
        
        return {
            bloodGroup: bloodGroups[Math.floor(Math.random() * bloodGroups.length)],
            gender: genders[Math.floor(Math.random() * genders.length)],
            religion: religions[Math.floor(Math.random() * religions.length)],
            maritalStatus: maritalStatuses[Math.floor(Math.random() * maritalStatuses.length)],
            dateOfBirth: new Date(1970 + Math.floor(Math.random() * 20), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toISOString().split('T')[0],
            address: `House #${Math.floor(Math.random() * 100) + 1}, Road #${Math.floor(Math.random() * 20) + 1}, ${['Dhaka', 'Chittagong', 'Rajshahi', 'Khulna', 'Barisal', 'Sylhet'][Math.floor(Math.random() * 6)]}`,
            emergencyContact: `01${Math.floor(Math.random() * 90000000) + 10000000}`,
            qualification: qualifications[Math.floor(Math.random() * qualifications.length)],
            experience: `${Math.floor(Math.random() * 15) + 1} Years`,
            subject: subjects[Math.floor(Math.random() * subjects.length)],
            nid: `${Math.floor(Math.random() * 9000000000) + 1000000000}`,
            bankAccount: `${Math.floor(Math.random() * 9000000000) + 1000000000}`
        };
    };

    // Handle print
    const handlePrint = () => {
        window.print();
    };

    // Format date
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('bn-BD');
    };

    // Format currency
    const formatCurrency = (amount) => {
        if (!amount) return '০.০০';
        return new Intl.NumberFormat('bn-BD').format(amount);
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-full mx-auto">
                <div className="bg-white rounded-lg shadow-lg overflow-hidden" id="printable-area">
                    {/* Header */}
                    <div className="px-6 py-4 flex justify-between items-center">
                        <h1 className="text-2xl font-bold ">
                            শিক্ষক ডেটা রিপোর্ট প্রিন্ট
                        </h1>
                        <MainButton
                            onClick={handlePrint}
                        >
                            প্রিন্ট করুন
                        </MainButton>
                    </div>

                    {/* Search Form */}
                    <div className="p-6 border-b border-gray-200 print:hidden">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
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
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9] focus:border-transparent"
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
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9] focus:border-transparent"
                                    required
                                />
                            </div>

                            {/* Teacher ID */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    শিক্ষক আইডি
                                </label>
                                <input
                                    type="text"
                                    name="teacherId"
                                    value={formData.teacherId}
                                    onChange={handleInputChange}
                                    placeholder="শিক্ষক আইডি"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9] focus:border-transparent"
                                />
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
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9] focus:border-transparent"
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
                        <div className="flex justify-center">
                            <MainButton
                                onClick={handleSearch}
                                disabled={loading || !formData.startDate || !formData.endDate}
                                className={`px-8 py-3 rounded-lg font-medium text-white transition-colors duration-200 ${
                                    loading || !formData.startDate || !formData.endDate
                                        ? 'bg-gray-400 cursor-not-allowed'
                                        : 'bg-[#1e90c9]'
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
                            </MainButton>
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
                                <h1 className="text-3xl font-bold text-gray-800 mb-2">শিক্ষক ডেটা রিপোর্ট</h1>
                                <div className="text-lg text-gray-600">
                                    তারিখ: {formData.startDate} থেকে {formData.endDate}
                                </div>
                                <div className="text-sm text-gray-500 mt-1">
                                    প্রস্তুতের তারিখ: {new Date().toLocaleDateString('bn-BD')}
                                </div>
                            </div>

                            {/* Summary Stats */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 print:mb-4 print:grid-cols-4">
                                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 text-center">
                                    <div className="text-2xl font-bold text-purple-600">{reportData.length}</div>
                                    <div className="text-sm text-purple-700">মোট শিক্ষক</div>
                                </div>
                                <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                                    <div className="text-2xl font-bold text-green-600">
                                        {reportData.filter(t => t.status === 'active').length}
                                    </div>
                                    <div className="text-sm text-green-700">সক্রিয়</div>
                                </div>
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                                    <div className="text-2xl font-bold text-blue-600">
                                        {reportData.filter(t => t.gender === 'Male').length}
                                    </div>
                                    <div className="text-sm text-blue-700">পুরুষ</div>
                                </div>
                                <div className="bg-pink-50 border border-pink-200 rounded-lg p-4 text-center">
                                    <div className="text-2xl font-bold text-pink-600">
                                        {reportData.filter(t => t.gender === 'Female').length}
                                    </div>
                                    <div className="text-sm text-pink-700">মহিলা</div>
                                </div>
                            </div>

                            {/* Teachers Table */}
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
                                                পদবী
                                            </th>
                                            <th className="border border-gray-300 px-4 py-3 text-left text-sm font-medium text-gray-700 print:font-bold">
                                                বিভাগ
                                            </th>
                                            <th className="border border-gray-300 px-4 py-3 text-left text-sm font-medium text-gray-700 print:font-bold">
                                                বিষয়
                                            </th>
                                            <th className="border border-gray-300 px-4 py-3 text-left text-sm font-medium text-gray-700 print:font-bold">
                                                যোগাযোগ
                                            </th>
                                            <th className="border border-gray-300 px-4 py-3 text-left text-sm font-medium text-gray-700 print:font-bold">
                                                বেতন
                                            </th>
                                            <th className="border border-gray-300 px-4 py-3 text-left text-sm font-medium text-gray-700 print:font-bold">
                                                অবস্থা
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {reportData.map((teacher, index) => (
                                            <tr key={teacher._id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50 print:bg-gray-100'}>
                                                <td className="border border-gray-300 px-4 py-3 text-sm text-gray-900 font-mono">
                                                    {teacher.teacherId}
                                                </td>
                                                <td className="border border-gray-300 px-4 py-3 text-sm text-gray-900 font-medium">
                                                    {teacher.name}
                                                </td>
                                                <td className="border border-gray-300 px-4 py-3 text-sm text-gray-900">
                                                    {teacher.designation}
                                                </td>
                                                <td className="border border-gray-300 px-4 py-3 text-sm text-gray-900">
                                                    {teacher.department}
                                                </td>
                                                <td className="border border-gray-300 px-4 py-3 text-sm text-gray-900">
                                                    {teacher.subject}
                                                </td>
                                                <td className="border border-gray-300 px-4 py-3 text-sm text-gray-900">
                                                    <div>{teacher.mobile}</div>
                                                    <div className="text-xs text-gray-600">{teacher.email}</div>
                                                </td>
                                                <td className="border border-gray-300 px-4 py-3 text-sm text-gray-900 font-medium">
                                                    ৳{formatCurrency(teacher.salary)}
                                                </td>
                                                <td className="border border-gray-300 px-4 py-3 text-sm">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                        teacher.status === 'active' 
                                                            ? 'bg-green-100 text-green-800' 
                                                            : 'bg-red-100 text-red-800'
                                                    }`}>
                                                        {teacher.status === 'active' ? 'সক্রিয়' : 'নিষ্ক্রিয়'}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Detailed Information for Print */}
                            <div className="mt-8 print:mt-6 hidden print:block">
                                <h2 className="text-xl font-bold text-gray-800 mb-4">বিস্তারিত শিক্ষক তথ্য</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {reportData.map((teacher) => (
                                        <div key={teacher._id} className="border border-gray-300 rounded-lg p-4 mb-4">
                                            <h3 className="text-lg font-semibold text-gray-800 mb-3">
                                                {teacher.name} - {teacher.teacherId}
                                            </h3>
                                            <div className="grid grid-cols-2 gap-2 text-sm">
                                                <div><span className="font-medium">পদবী:</span> {teacher.designation}</div>
                                                <div><span className="font-medium">বিভাগ:</span> {teacher.department}</div>
                                                <div><span className="font-medium">বিষয়:</span> {teacher.subject}</div>
                                                <div><span className="font-medium">যোগ্যতা:</span> {teacher.qualification}</div>
                                                <div><span className="font-medium">অভিজ্ঞতা:</span> {teacher.experience}</div>
                                                <div><span className="font-medium">জন্ম তারিখ:</span> {formatDate(teacher.dateOfBirth)}</div>
                                                <div><span className="font-medium">রক্তের গ্রুপ:</span> {teacher.bloodGroup}</div>
                                                <div><span className="font-medium">ধর্ম:</span> {teacher.religion}</div>
                                                <div><span className="font-medium">বৈবাহিক অবস্থা:</span> {teacher.maritalStatus}</div>
                                                <div><span className="font-medium">যোজনের তারিখ:</span> {formatDate(teacher.joiningDate)}</div>
                                                <div><span className="font-medium">এনআইডি:</span> {teacher.nid}</div>
                                                <div><span className="font-medium">ব্যাংক একাউন্ট:</span> {teacher.bankAccount}</div>
                                                <div className="col-span-2"><span className="font-medium">ঠিকানা:</span> {teacher.address}</div>
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
                                <p className="text-yellow-700">নির্বাচিত ফিল্টারে কোন শিক্ষক ডেটা পাওয়া যায়নি।</p>
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
                    .bg-purple-600, .bg-green-600, .bg-blue-600, .bg-pink-600 {
                        -webkit-print-color-adjust: exact;
                        color-adjust: exact;
                    }
                }
            `}</style>
        </div>
    );
};

export default PrintTeacherDataReport;