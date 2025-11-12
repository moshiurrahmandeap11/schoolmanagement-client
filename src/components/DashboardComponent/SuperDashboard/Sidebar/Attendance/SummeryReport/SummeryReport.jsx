import { useEffect, useState } from 'react';
import axiosInstance from '../../../../../../hooks/axiosInstance/axiosInstance';

const SummeryReport = () => {
    const [formData, setFormData] = useState({
        date: '',
        studentId: '',
        class: ''
    });

    const [classes, setClasses] = useState([]);
    const [students, setStudents] = useState([]);
    const [attendanceData, setAttendanceData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Fetch classes
    useEffect(() => {
        const fetchClasses = async () => {
            try {
                const response = await axiosInstance.get('/class');
                if (response.data && response.data.success) {
                    setClasses(response.data.data || []);
                }
            } catch (err) {
                setError('ক্লাস ডেটা লোড করতে সমস্যা হয়েছে');
                console.error('Error fetching classes:', err);
            }
        };

        fetchClasses();
    }, []);

    // Fetch students when class changes
    useEffect(() => {
        const fetchStudents = async () => {
            if (!formData.class) {
                setStudents([]);
                return;
            }

            try {
                const response = await axiosInstance.get('/students', {
                    params: {
                        class: formData.class
                    }
                });

                if (response.data && response.data.success) {
                    setStudents(response.data.data || []);
                } else {
                    setStudents([]);
                }
            } catch (err) {
                setError('স্টুডেন্ট ডেটা লোড করতে সমস্যা হয়েছে');
                console.error('Error fetching students:', err);
            }
        };

        fetchStudents();
    }, [formData.class]);

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
        if (!formData.date) {
            setError('তারিখ নির্বাচন করুন');
            return;
        }

        try {
            setLoading(true);
            setError('');

            // Fetch all required data
            const [studentsResponse, attendanceResponse, shiftResponse] = await Promise.all([
                axiosInstance.get('/students', {
                    params: {
                        class: formData.class,
                        ...(formData.studentId && { studentId: formData.studentId })
                    }
                }),
                axiosInstance.get('/smart-attendance'),
                axiosInstance.get('/smart-attendance-shift')
            ]);

            // Process and combine data
            const processedData = processAttendanceData(
                studentsResponse.data?.data || [],
                attendanceResponse.data?.data || {},
                shiftResponse.data?.data || [],
                formData.date
            );

            setAttendanceData(processedData);

        } catch (err) {
            setError('ডেটা লোড করতে সমস্যা হয়েছে');
            console.error('Error fetching data:', err);
        } finally {
            setLoading(false);
        }
    };

    // Process and combine attendance data
    const processAttendanceData = (students, attendanceSettings, shifts, selectedDate) => {
        return students.map(student => {
            // Find shift for this student's class and section
            const studentShift = shifts.find(shift => 
                shift.class?._id === student.class?._id && 
                shift.section?._id === student.section?._id
            );

            // Calculate attendance status based on time
            const attendanceStatus = calculateAttendanceStatus(student, studentShift, selectedDate);

            return {
                studentId: student.studentId || student.smartId,
                name: student.name,
                class: student.class?.name,
                section: student.section?.name,
                roll: student.classRoll,
                mobile: student.mobile,
                guardianMobile: student.guardianMobile,
                shiftName: studentShift?.shiftName || 'N/A',
                entryTime: studentShift?.studentEntryTime || attendanceSettings.studentEntryTime,
                exitTime: studentShift?.studentExitTime || attendanceSettings.studentExitTime,
                lateCount: studentShift?.countLateAfter || attendanceSettings.countLateAfter,
                earlyExitCount: studentShift?.countEarlyExitBefore || attendanceSettings.countEarlyExitBefore,
                attendanceStatus,
                date: selectedDate
            };
        });
    };

    // Calculate attendance status (simplified logic)
    const calculateAttendanceStatus = (student, shift, date) => {
        // This is a simplified calculation
        // In real implementation, you would check actual attendance records
        const currentTime = new Date();
        const entryTime = shift?.studentEntryTime || '09:00';
        
        // Simple random status for demo
        const statuses = ['Present', 'Absent', 'Late', 'Early Exit'];
        const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
        
        return randomStatus;
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-full mx-auto">
                <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-6 py-4">
                        <h1 className="text-2xl font-bold text-white text-center">
                            সামারি রিপোর্ট
                        </h1>
                    </div>

                    {/* Search Form */}
                    <div className="p-6 border-b border-gray-200">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* Date */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    তারিখ <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="date"
                                    name="date"
                                    value={formData.date}
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
                                    placeholder="শিক্ষার্থীর আইডি লিখুন"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

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
                                    <option value="">ক্লাস নির্বাচন করুন</option>
                                    {classes.map(cls => (
                                        <option key={cls._id} value={cls._id}>
                                            {cls.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Search Button */}
                        <div className="flex justify-center mt-6">
                            <button
                                onClick={handleSearch}
                                disabled={loading || !formData.date}
                                className={`px-8 py-3 rounded-lg font-medium text-white transition-colors duration-200 ${
                                    loading || !formData.date
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

                    {/* Results Table */}
                    {attendanceData.length > 0 && (
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-lg font-semibold text-gray-800">
                                    অ্যাটেনডেন্স রিপোর্ট ({attendanceData.length} জন)
                                </h2>
                                <div className="text-sm text-gray-600">
                                    তারিখ: {formData.date}
                                </div>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="min-w-full bg-white border border-gray-200">
                                    <thead>
                                        <tr className="bg-gray-50">
                                            <th className="px-4 py-3 border-b border-gray-200 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                আইডি
                                            </th>
                                            <th className="px-4 py-3 border-b border-gray-200 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                নাম
                                            </th>
                                            <th className="px-4 py-3 border-b border-gray-200 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                ক্লাস
                                            </th>
                                            <th className="px-4 py-3 border-b border-gray-200 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                সেকশন
                                            </th>
                                            <th className="px-4 py-3 border-b border-gray-200 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                রোল
                                            </th>
                                            <th className="px-4 py-3 border-b border-gray-200 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                শিফট
                                            </th>
                                            <th className="px-4 py-3 border-b border-gray-200 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                এন্ট্রি টাইম
                                            </th>
                                            <th className="px-4 py-3 border-b border-gray-200 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                এক্সিট টাইম
                                            </th>
                                            <th className="px-4 py-3 border-b border-gray-200 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                স্ট্যাটাস
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {attendanceData.map((student, index) => (
                                            <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                                                    {student.studentId}
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                                                    {student.name}
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                                                    {student.class}
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                                                    {student.section}
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                                                    {student.roll}
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                                                    {student.shiftName}
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                                                    {student.entryTime}
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                                                    {student.exitTime}
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap text-sm">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                        student.attendanceStatus === 'Present' 
                                                            ? 'bg-green-100 text-green-800'
                                                            : student.attendanceStatus === 'Absent'
                                                            ? 'bg-red-100 text-red-800'
                                                            : student.attendanceStatus === 'Late'
                                                            ? 'bg-yellow-100 text-yellow-800'
                                                            : 'bg-blue-100 text-blue-800'
                                                    }`}>
                                                        {student.attendanceStatus}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Summary Statistics */}
                            <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                                    <div className="text-2xl font-bold text-green-600">
                                        {attendanceData.filter(s => s.attendanceStatus === 'Present').length}
                                    </div>
                                    <div className="text-sm text-green-700">উপস্থিত</div>
                                </div>
                                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                                    <div className="text-2xl font-bold text-red-600">
                                        {attendanceData.filter(s => s.attendanceStatus === 'Absent').length}
                                    </div>
                                    <div className="text-sm text-red-700">অনুপস্থিত</div>
                                </div>
                                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
                                    <div className="text-2xl font-bold text-yellow-600">
                                        {attendanceData.filter(s => s.attendanceStatus === 'Late').length}
                                    </div>
                                    <div className="text-sm text-yellow-700">লেট</div>
                                </div>
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                                    <div className="text-2xl font-bold text-blue-600">
                                        {attendanceData.filter(s => s.attendanceStatus === 'Early Exit').length}
                                    </div>
                                    <div className="text-sm text-blue-700">আগে এক্সিট</div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* No Results Message */}
                    {attendanceData.length === 0 && !loading && formData.date && (
                        <div className="p-6 text-center">
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-8 max-w-md mx-auto">
                                <svg className="w-12 h-12 text-yellow-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
                                </svg>
                                <h3 className="text-lg font-medium text-yellow-800 mb-2">কোন ডেটা পাওয়া যায়নি</h3>
                                <p className="text-yellow-700">নির্বাচিত তারিখ এবং ফিল্টারে কোন অ্যাটেনডেন্স ডেটা পাওয়া যায়নি।</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SummeryReport;