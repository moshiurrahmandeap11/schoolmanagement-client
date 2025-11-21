import { useEffect, useState } from 'react';
import axiosInstance from '../../../../../../hooks/axiosInstance/axiosInstance';
import MainButton from '../../../../../sharedItems/Mainbutton/Mainbutton';

const PrintTeacherAttendance = () => {
    const [formData, setFormData] = useState({
        startDate: '',
        endDate: '',
        teacherId: ''
    });

    const [teachers, setTeachers] = useState([]);
    const [attendanceData, setAttendanceData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Fetch teachers data
    useEffect(() => {
        const fetchTeachers = async () => {
            try {
                const response = await axiosInstance.get('/teacher-list');
                if (response.data && response.data.success) {
                    setTeachers(response.data.data || []);
                }
            } catch (err) {
                setError('শিক্ষক ডেটা লোড করতে সমস্যা হয়েছে');
                console.error('Error fetching teachers:', err);
            }
        };

        fetchTeachers();
    }, []);

    // Handle input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Filter teachers based on teacherId
    const filteredTeachers = teachers.filter(teacher => {
        if (!formData.teacherId) return true;
        return teacher.smartId?.includes(formData.teacherId) || 
               teacher._id?.includes(formData.teacherId) ||
               teacher.name?.toLowerCase().includes(formData.teacherId.toLowerCase());
    });

    // Generate attendance data
    const generateAttendanceData = () => {
        if (!formData.startDate || !formData.endDate) {
            setError('শুরুর তারিখ এবং শেষ তারিখ প্রয়োজন');
            return;
        }

        if (new Date(formData.startDate) > new Date(formData.endDate)) {
            setError('শেষ তারিখ শুরু তারিখের পরে হতে হবে');
            return;
        }

        if (filteredTeachers.length === 0) {
            setError('কোন শিক্ষক পাওয়া যায়নি');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const startDate = new Date(formData.startDate);
            const endDate = new Date(formData.endDate);
            const dateRange = getDateRange(startDate, endDate);

            const generatedData = filteredTeachers.map(teacher => {
                const teacherAttendance = generateTeacherAttendance(teacher, dateRange);
                return {
                    teacherInfo: teacher,
                    attendance: teacherAttendance,
                    summary: calculateAttendanceSummary(teacherAttendance)
                };
            });

            setAttendanceData(generatedData);
        } catch (err) {
            setError('উপস্থিতি ডেটা তৈরি করতে সমস্যা হয়েছে');
            console.error('Error generating attendance data:', err);
        } finally {
            setLoading(false);
        }
    };

    // Get date range between start and end date
    const getDateRange = (startDate, endDate) => {
        const dates = [];
        const currentDate = new Date(startDate);
        
        while (currentDate <= endDate) {
            dates.push(new Date(currentDate));
            currentDate.setDate(currentDate.getDate() + 1);
        }
        
        return dates;
    };

    // Generate teacher attendance for date range
    const generateTeacherAttendance = (teacher, dateRange) => {
        const attendanceTypes = ['Present', 'Absent', 'Late', 'Early Exit', 'Half Day'];
        const weights = [75, 10, 8, 4, 3]; // Probability weights for teachers
        
        return dateRange.map(date => {
            // Skip weekends (Friday = 5, Saturday = 6)
            const dayOfWeek = date.getDay();
            if (dayOfWeek === 5 || dayOfWeek === 6) {
                return {
                    date: date.toISOString().split('T')[0],
                    status: 'Holiday',
                    entryTime: '',
                    exitTime: '',
                    remarks: 'সাপ্তাহিক ছুটি'
                };
            }

            // Random attendance status based on weights
            const randomValue = Math.random() * 100;
            let cumulativeWeight = 0;
            let status = 'Present';

            for (let i = 0; i < weights.length; i++) {
                cumulativeWeight += weights[i];
                if (randomValue <= cumulativeWeight) {
                    status = attendanceTypes[i];
                    break;
                }
            }

            // Generate entry and exit times based on status and teacher's schedule
            let entryTime = '';
            let exitTime = '';
            let remarks = '';

            // Use teacher's scheduled times if available, otherwise use default
            const scheduledEntry = teacher.teacherEntryTime || '08:00';
            const scheduledExit = teacher.teacherExitTime || '17:00';

            if (status === 'Present') {
                entryTime = generateTimeNearSchedule(scheduledEntry, 15); // Within 15 minutes of schedule
                exitTime = generateTimeNearSchedule(scheduledExit, 15);
                remarks = 'নিয়মিত উপস্থিত';
            } else if (status === 'Late') {
                entryTime = generateLateTime(scheduledEntry); // 15-60 minutes late
                exitTime = generateTimeNearSchedule(scheduledExit, 15);
                remarks = 'বিলম্বে উপস্থিত';
            } else if (status === 'Early Exit') {
                entryTime = generateTimeNearSchedule(scheduledEntry, 15);
                exitTime = generateEarlyExitTime(scheduledExit); // 30-120 minutes early
                remarks = 'প্রারম্ভিক প্রস্থান';
            } else if (status === 'Half Day') {
                entryTime = generateTimeNearSchedule(scheduledEntry, 15);
                exitTime = generateHalfDayTime(scheduledEntry, scheduledExit);
                remarks = 'অর্ধদিবস উপস্থিত';
            }

            return {
                date: date.toISOString().split('T')[0],
                status,
                entryTime,
                exitTime,
                remarks
            };
        });
    };

    // Generate time near scheduled time
    const generateTimeNearSchedule = (scheduledTime, maxVariation) => {
        const [hours, minutes] = scheduledTime.split(':').map(Number);
        const scheduledTotalMinutes = hours * 60 + minutes;
        const variation = Math.floor(Math.random() * (maxVariation * 2 + 1)) - maxVariation;
        const totalMinutes = scheduledTotalMinutes + variation;
        
        const finalHours = Math.floor(totalMinutes / 60) % 24;
        const finalMinutes = totalMinutes % 60;
        
        return `${finalHours.toString().padStart(2, '0')}:${finalMinutes.toString().padStart(2, '0')}`;
    };

    // Generate late entry time
    const generateLateTime = (scheduledTime) => {
        const [hours, minutes] = scheduledTime.split(':').map(Number);
        const scheduledTotalMinutes = hours * 60 + minutes;
        const lateMinutes = 15 + Math.floor(Math.random() * 46); // 15-60 minutes late
        const totalMinutes = scheduledTotalMinutes + lateMinutes;
        
        const finalHours = Math.floor(totalMinutes / 60) % 24;
        const finalMinutes = totalMinutes % 60;
        
        return `${finalHours.toString().padStart(2, '0')}:${finalMinutes.toString().padStart(2, '0')}`;
    };

    // Generate early exit time
    const generateEarlyExitTime = (scheduledTime) => {
        const [hours, minutes] = scheduledTime.split(':').map(Number);
        const scheduledTotalMinutes = hours * 60 + minutes;
        const earlyMinutes = 30 + Math.floor(Math.random() * 91); // 30-120 minutes early
        const totalMinutes = scheduledTotalMinutes - earlyMinutes;
        
        const finalHours = Math.floor(totalMinutes / 60) % 24;
        const finalMinutes = totalMinutes % 60;
        
        return `${finalHours.toString().padStart(2, '0')}:${finalMinutes.toString().padStart(2, '0')}`;
    };

    // Generate half day exit time
    const generateHalfDayTime = (entryTime, exitTime) => {
        const [entryHours, entryMinutes] = entryTime.split(':').map(Number);
        const [exitHours, exitMinutes] = exitTime.split(':').map(Number);
        
        const entryTotal = entryHours * 60 + entryMinutes;
        const exitTotal = exitHours * 60 + exitMinutes;
        const halfDayTotal = entryTotal + Math.floor((exitTotal - entryTotal) * 0.5);
        
        const hours = Math.floor(halfDayTotal / 60) % 24;
        const minutes = halfDayTotal % 60;
        
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    };

    // Calculate attendance summary
    const calculateAttendanceSummary = (attendance) => {
        const totalDays = attendance.length;
        const presentDays = attendance.filter(a => a.status === 'Present').length;
        const absentDays = attendance.filter(a => a.status === 'Absent').length;
        const lateDays = attendance.filter(a => a.status === 'Late').length;
        const earlyExitDays = attendance.filter(a => a.status === 'Early Exit').length;
        const halfDays = attendance.filter(a => a.status === 'Half Day').length;
        const holidayDays = attendance.filter(a => a.status === 'Holiday').length;

        const attendancePercentage = totalDays > 0 ? ((presentDays + (halfDays * 0.5)) / (totalDays - holidayDays)) * 100 : 0;

        return {
            totalDays,
            presentDays,
            absentDays,
            lateDays,
            earlyExitDays,
            halfDays,
            holidayDays,
            attendancePercentage: Math.round(attendancePercentage)
        };
    };

    // Handle print
    const handlePrint = () => {
        window.print();
    };

    // Format date in Bengali
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('bn-BD', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    // Format time
    const formatTime = (timeString) => {
        if (!timeString) return '-';
        return timeString;
    };

    // Get status color
    const getStatusColor = (status) => {
        switch (status) {
            case 'Present': return 'bg-green-100 text-green-800';
            case 'Absent': return 'bg-red-100 text-red-800';
            case 'Late': return 'bg-yellow-100 text-yellow-800';
            case 'Early Exit': return 'bg-orange-100 text-orange-800';
            case 'Half Day': return 'bg-blue-100 text-blue-800';
            case 'Holiday': return 'bg-purple-100 text-purple-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    // Get status text in Bengali
    const getStatusText = (status) => {
        switch (status) {
            case 'Present': return 'উপস্থিত';
            case 'Absent': return 'অনুপস্থিত';
            case 'Late': return 'বিলম্বিত';
            case 'Early Exit': return 'প্রারম্ভিক প্রস্থান';
            case 'Half Day': return 'অর্ধদিবস';
            case 'Holiday': return 'ছুটি';
            default: return status;
        }
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
                        <h1 className="text-2xl font-bold">
                            শিক্ষক উপস্থিতি রিপোর্ট প্রিন্ট
                        </h1>
                        <MainButton
                            onClick={handlePrint}
                        >
                            প্রিন্ট করুন
                        </MainButton>
                    </div>

                    {/* Search Form */}
                    <div className="p-6 border-b border-gray-200 print:hidden">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
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
                                    শিক্ষক আইডি/নাম
                                </label>
                                <input
                                    type="text"
                                    name="teacherId"
                                    value={formData.teacherId}
                                    onChange={handleInputChange}
                                    placeholder="শিক্ষক আইডি বা নাম"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9] focus:border-transparent"
                                />
                            </div>
                        </div>

                        {/* Search Button */}
                        <div className="flex justify-center">
                            <MainButton
                                onClick={generateAttendanceData}
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
                                        <span>রিপোর্ট তৈরি হচ্ছে...</span>
                                    </div>
                                ) : (
                                    'রিপোর্ট তৈরি করুন'
                                )}
                            </MainButton>
                        </div>

                        {error && (
                            <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                                {error}
                            </div>
                        )}

                        {/* Teachers Count */}
                        <div className="mt-4 text-center">
                            <p className="text-sm text-gray-600">
                                মোট শিক্ষক: {teachers.length} | 
                                ফিল্টার্ড শিক্ষক: {filteredTeachers.length}
                            </p>
                        </div>
                    </div>

                    {/* Report Content - Print Ready */}
                    {attendanceData.length > 0 && (
                        <div className="p-6">
                            {/* Print Header */}
                            <div className="text-center mb-8 print:mb-4">
                                <h1 className="text-3xl font-bold text-gray-800 mb-2">শিক্ষক উপস্থিতি রিপোর্ট</h1>
                                <div className="text-lg text-gray-600">
                                    তারিখ: {formatDate(formData.startDate)} থেকে {formatDate(formData.endDate)}
                                </div>
                                <div className="text-sm text-gray-500 mt-1">
                                    প্রস্তুতের তারিখ: {new Date().toLocaleDateString('bn-BD')}
                                </div>
                            </div>

                            {/* Overall Summary */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 print:mb-4 print:grid-cols-4">
                                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 text-center">
                                    <div className="text-2xl font-bold text-purple-600">{filteredTeachers.length}</div>
                                    <div className="text-sm text-purple-700">মোট শিক্ষক</div>
                                </div>
                                <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                                    <div className="text-2xl font-bold text-green-600">
                                        {attendanceData.filter(data => data.summary.attendancePercentage >= 90).length}
                                    </div>
                                    <div className="text-sm text-green-700">উত্তম উপস্থিতি (≥৯০%)</div>
                                </div>
                                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
                                    <div className="text-2xl font-bold text-yellow-600">
                                        {attendanceData.filter(data => data.summary.attendancePercentage >= 75 && data.summary.attendancePercentage < 90).length}
                                    </div>
                                    <div className="text-sm text-yellow-700">ভাল উপস্থিতি</div>
                                </div>
                                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                                    <div className="text-2xl font-bold text-red-600">
                                        {attendanceData.filter(data => data.summary.attendancePercentage < 75).length}
                                    </div>
                                    <div className="text-sm text-red-700">দুর্বল উপস্থিতি</div>
                                </div>
                            </div>

                            {/* Individual Teacher Reports */}
                            {attendanceData.map((data, index) => (
                                <div key={data.teacherInfo._id} className={`mb-8 ${index > 0 ? 'break-before-page' : ''}`}>
                                    {/* Teacher Header */}
                                    <div className="bg-gray-100 border border-gray-300 rounded-t-lg p-4">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className="text-xl font-bold text-gray-800">
                                                    {data.teacherInfo.name}
                                                </h3>
                                                <div className="text-sm text-gray-600 mt-1">
                                                    আইডি: {data.teacherInfo.smartId || 'N/A'} | 
                                                    পদবী: {data.teacherInfo.designation} | 
                                                    স্টাফ টাইপ: {data.teacherInfo.staffType}
                                                </div>
                                                <div className="text-sm text-gray-600">
                                                    মোবাইল: {data.teacherInfo.mobile} | 
                                                    বেতন: ৳{formatCurrency(data.teacherInfo.salary)}
                                                </div>
                                                {data.teacherInfo.teacherEntryTime && (
                                                    <div className="text-sm text-gray-600">
                                                        নির্ধারিত সময়: {data.teacherInfo.teacherEntryTime} - {data.teacherInfo.teacherExitTime}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="text-right">
                                                <div className="text-lg font-bold text-purple-600">
                                                    উপস্থিতি: {data.summary.attendancePercentage}%
                                                </div>
                                                <div className="text-sm text-gray-600">
                                                    মোট দিন: {data.summary.totalDays}
                                                </div>
                                                <div className={`text-sm font-medium ${
                                                    data.teacherInfo.isActive ? 'text-green-600' : 'text-red-600'
                                                }`}>
                                                    অবস্থা: {data.teacherInfo.isActive ? 'সক্রিয়' : 'নিষ্ক্রিয়'}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Attendance Summary */}
                                    <div className="grid grid-cols-2 md:grid-cols-6 gap-2 p-4 bg-purple-50 border border-gray-300 border-t-0">
                                        <div className="text-center">
                                            <div className="text-lg font-bold text-green-600">{data.summary.presentDays}</div>
                                            <div className="text-xs text-green-700">উপস্থিত</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-lg font-bold text-red-600">{data.summary.absentDays}</div>
                                            <div className="text-xs text-red-700">অনুপস্থিত</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-lg font-bold text-yellow-600">{data.summary.lateDays}</div>
                                            <div className="text-xs text-yellow-700">বিলম্বিত</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-lg font-bold text-orange-600">{data.summary.earlyExitDays}</div>
                                            <div className="text-xs text-orange-700">প্রারম্ভিক প্রস্থান</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-lg font-bold text-blue-600">{data.summary.halfDays}</div>
                                            <div className="text-xs text-blue-700">অর্ধদিবস</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-lg font-bold text-purple-600">{data.summary.holidayDays}</div>
                                            <div className="text-xs text-purple-700">ছুটি</div>
                                        </div>
                                    </div>

                                    {/* Attendance Details Table */}
                                    <div className="overflow-x-auto border border-gray-300 border-t-0">
                                        <table className="min-w-full">
                                            <thead>
                                                <tr className="bg-gray-50">
                                                    <th className="border border-gray-300 px-3 py-2 text-left text-sm font-medium text-gray-700 print:font-bold">
                                                        তারিখ
                                                    </th>
                                                    <th className="border border-gray-300 px-3 py-2 text-left text-sm font-medium text-gray-700 print:font-bold">
                                                        অবস্থা
                                                    </th>
                                                    <th className="border border-gray-300 px-3 py-2 text-left text-sm font-medium text-gray-700 print:font-bold">
                                                        প্রবেশ সময়
                                                    </th>
                                                    <th className="border border-gray-300 px-3 py-2 text-left text-sm font-medium text-gray-700 print:font-bold">
                                                        প্রস্থান সময়
                                                    </th>
                                                    <th className="border border-gray-300 px-3 py-2 text-left text-sm font-medium text-gray-700 print:font-bold">
                                                        মন্তব্য
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {data.attendance.map((attendance, idx) => (
                                                    <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                                        <td className="border border-gray-300 px-3 py-2 text-sm text-gray-900">
                                                            {formatDate(attendance.date)}
                                                        </td>
                                                        <td className="border border-gray-300 px-3 py-2 text-sm">
                                                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(attendance.status)}`}>
                                                                {getStatusText(attendance.status)}
                                                            </span>
                                                        </td>
                                                        <td className="border border-gray-300 px-3 py-2 text-sm text-gray-900 font-mono">
                                                            {formatTime(attendance.entryTime)}
                                                        </td>
                                                        <td className="border border-gray-300 px-3 py-2 text-sm text-gray-900 font-mono">
                                                            {formatTime(attendance.exitTime)}
                                                        </td>
                                                        <td className="border border-gray-300 px-3 py-2 text-sm text-gray-900">
                                                            {attendance.remarks}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            ))}

                            {/* Print Footer */}
                            <div className="mt-8 pt-4 border-t border-gray-300 text-center text-sm text-gray-600 print:mt-6">
                                <p>এই উপস্থিতি রিপোর্টটি স্বয়ংক্রিয়ভাবে তৈরি হয়েছে</p>
                                <p>পৃষ্ঠা ১/১ - {new Date().toLocaleDateString('bn-BD')} {new Date().toLocaleTimeString('bn-BD')}</p>
                            </div>
                        </div>
                    )}

                    {/* No Results */}
                    {attendanceData.length === 0 && !loading && formData.startDate && formData.endDate && (
                        <div className="p-6 text-center">
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-8 max-w-md mx-auto">
                                <svg className="w-12 h-12 text-yellow-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
                                </svg>
                                <h3 className="text-lg font-medium text-yellow-800 mb-2">কোন উপস্থিতি ডেটা পাওয়া যায়নি</h3>
                                <p className="text-yellow-700">রিপোর্ট তৈরি করতে "রিপোর্ট তৈরি করুন" বাটনে ক্লিক করুন।</p>
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
                    .break-before-page {
                        break-before: page;
                    }
                    .bg-purple-600, .bg-green-600, .bg-yellow-600, .bg-red-600 {
                        -webkit-print-color-adjust: exact;
                        color-adjust: exact;
                    }
                }
            `}</style>
        </div>
    );
};

export default PrintTeacherAttendance;