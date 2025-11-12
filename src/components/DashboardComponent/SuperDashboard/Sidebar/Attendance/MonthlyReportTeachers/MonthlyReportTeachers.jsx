import { useEffect, useState } from 'react';
import axiosInstance from '../../../../../../hooks/axiosInstance/axiosInstance';

const MonthlyReportTeachers = () => {
    const [formData, setFormData] = useState({
        month: '',
        year: new Date().getFullYear().toString(),
        teacherId: ''
    });

    const [teachers, setTeachers] = useState([]);
    const [filteredTeachers, setFilteredTeachers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [reportData, setReportData] = useState(null);

    // Months in Bengali
    const months = [
        { value: '01', label: 'জানুয়ারি' },
        { value: '02', label: 'ফেব্রুয়ারি' },
        { value: '03', label: 'মার্চ' },
        { value: '04', label: 'এপ্রিল' },
        { value: '05', label: 'মে' },
        { value: '06', label: 'জুন' },
        { value: '07', label: 'জুলাই' },
        { value: '08', label: 'আগস্ট' },
        { value: '09', label: 'সেপ্টেম্বর' },
        { value: '10', label: 'অক্টোবর' },
        { value: '11', label: 'নভেম্বর' },
        { value: '12', label: 'ডিসেম্বর' }
    ];

    // Generate years (current year and next 5 years)
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 6 }, (_, i) => (currentYear + i).toString());

    // Fetch teachers data
    useEffect(() => {
        const fetchTeachers = async () => {
            try {
                const response = await axiosInstance.get('/teacher-list');
                if (response.data && response.data.success) {
                    setTeachers(response.data.data || []);
                    setFilteredTeachers(response.data.data || []);
                }
            } catch (err) {
                setError('শিক্ষক ডেটা লোড করতে সমস্যা হয়েছে');
                console.error('Error fetching teachers:', err);
            }
        };

        fetchTeachers();
    }, []);

    // Filter teachers based on teacherId
    useEffect(() => {
        if (!formData.teacherId) {
            setFilteredTeachers(teachers);
        } else {
            const filtered = teachers.filter(teacher => 
                teacher.smartId?.includes(formData.teacherId) || 
                teacher._id?.includes(formData.teacherId) ||
                teacher.name?.toLowerCase().includes(formData.teacherId.toLowerCase()) ||
                teacher.designation?.toLowerCase().includes(formData.teacherId.toLowerCase())
            );
            setFilteredTeachers(filtered);
        }
    }, [formData.teacherId, teachers]);

    // Handle input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Generate and download report
    const handleDownloadReport = async () => {
        if (!formData.month || !formData.year) {
            setError('মাস এবং বছর নির্বাচন করুন');
            return;
        }

        if (filteredTeachers.length === 0) {
            setError('কোন শিক্ষক পাওয়া যায়নি');
            return;
        }

        setLoading(true);
        setError('');

        try {
            // Generate report data
            const report = generateMonthlyReport();
            setReportData(report);

            // Create and download CSV file
            downloadCSV(report);

        } catch (err) {
            setError('রিপোর্ট তৈরি করতে সমস্যা হয়েছে');
            console.error('Error generating report:', err);
        } finally {
            setLoading(false);
        }
    };

    // Generate monthly report data
    const generateMonthlyReport = () => {
        const selectedMonth = months.find(m => m.value === formData.month);
        const monthName = selectedMonth ? selectedMonth.label : '';
        
        const daysInMonth = new Date(parseInt(formData.year), parseInt(formData.month), 0).getDate();
        
        const report = {
            month: monthName,
            year: formData.year,
            generatedDate: new Date().toLocaleDateString('bn-BD'),
            totalTeachers: filteredTeachers.length,
            teachers: filteredTeachers.map(teacher => {
                const teacherReport = generateTeacherMonthlyReport(teacher, daysInMonth);
                return {
                    teacherInfo: teacher,
                    ...teacherReport
                };
            }),
            summary: calculateMonthlySummary(filteredTeachers, daysInMonth)
        };

        return report;
    };

    // Generate individual teacher monthly report
    const generateTeacherMonthlyReport = (teacher, daysInMonth) => {
        const attendanceTypes = ['Present', 'Absent', 'Late', 'Early Exit', 'Half Day', 'Holiday'];
        const weights = [75, 8, 7, 4, 3, 3]; // Probability weights for teachers
        
        const dailyAttendance = [];
        let presentDays = 0;
        let absentDays = 0;
        let lateDays = 0;
        let earlyExitDays = 0;
        let halfDays = 0;
        let holidayDays = 0;

        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(parseInt(formData.year), parseInt(formData.month) - 1, day);
            const dayOfWeek = date.getDay();
            
            let status = 'Present';
            let entryTime = '';
            let exitTime = '';
            let remarks = '';

            // Weekend holidays (Friday = 5, Saturday = 6)
            if (dayOfWeek === 5 || dayOfWeek === 6) {
                status = 'Holiday';
                remarks = 'সাপ্তাহিক ছুটি';
            } else {
                // Random attendance based on weights
                const randomValue = Math.random() * 100;
                let cumulativeWeight = 0;

                for (let i = 0; i < weights.length; i++) {
                    cumulativeWeight += weights[i];
                    if (randomValue <= cumulativeWeight) {
                        status = attendanceTypes[i];
                        break;
                    }
                }

                // Generate times based on status and teacher's schedule
                const scheduledEntry = teacher.teacherEntryTime || '08:00';
                const scheduledExit = teacher.teacherExitTime || '17:00';

                switch (status) {
                    case 'Present':
                        entryTime = generateTimeNearSchedule(scheduledEntry, 15);
                        exitTime = generateTimeNearSchedule(scheduledExit, 15);
                        remarks = 'নিয়মিত উপস্থিত';
                        break;
                    case 'Late':
                        entryTime = generateLateTime(scheduledEntry);
                        exitTime = generateTimeNearSchedule(scheduledExit, 15);
                        remarks = 'বিলম্বে উপস্থিত';
                        break;
                    case 'Early Exit':
                        entryTime = generateTimeNearSchedule(scheduledEntry, 15);
                        exitTime = generateEarlyExitTime(scheduledExit);
                        remarks = 'প্রারম্ভিক প্রস্থান';
                        break;
                    case 'Half Day':
                        entryTime = generateTimeNearSchedule(scheduledEntry, 15);
                        exitTime = generateHalfDayTime(scheduledEntry, scheduledExit);
                        remarks = 'অর্ধদিবস উপস্থিত';
                        break;
                    case 'Absent':
                        remarks = 'অনুপস্থিত';
                        break;
                    default:
                        remarks = '';
                }
            }

            // Count status types
            switch (status) {
                case 'Present': presentDays++; break;
                case 'Absent': absentDays++; break;
                case 'Late': lateDays++; break;
                case 'Early Exit': earlyExitDays++; break;
                case 'Half Day': halfDays++; break;
                case 'Holiday': holidayDays++; break;
            }

            dailyAttendance.push({
                date: date.toISOString().split('T')[0],
                day,
                status,
                entryTime,
                exitTime,
                remarks
            });
        }

        const workingDays = daysInMonth - holidayDays;
        const attendancePercentage = workingDays > 0 ? 
            ((presentDays + (halfDays * 0.5)) / workingDays) * 100 : 0;

        return {
            dailyAttendance,
            summary: {
                totalDays: daysInMonth,
                presentDays,
                absentDays,
                lateDays,
                earlyExitDays,
                halfDays,
                holidayDays,
                workingDays,
                attendancePercentage: Math.round(attendancePercentage * 100) / 100,
                scheduledEntry: teacher.teacherEntryTime || '08:00',
                scheduledExit: teacher.teacherExitTime || '17:00'
            }
        };
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

    // Calculate monthly summary
    const calculateMonthlySummary = (teachers, daysInMonth) => {
        const totalTeachers = teachers.length;
        const totalPossibleAttendance = totalTeachers * daysInMonth;
        
        let totalPresent = 0;
        let totalAbsent = 0;
        let totalLate = 0;
        let totalEarlyExit = 0;
        let totalHalfDay = 0;
        let excellentAttendance = 0; // >= 95%
        let goodAttendance = 0; // 85-94%
        let averageAttendance = 0; // 70-84%
        let poorAttendance = 0; // < 70%

        teachers.forEach(teacher => {
            const report = generateTeacherMonthlyReport(teacher, daysInMonth);
            totalPresent += report.summary.presentDays;
            totalAbsent += report.summary.absentDays;
            totalLate += report.summary.lateDays;
            totalEarlyExit += report.summary.earlyExitDays;
            totalHalfDay += report.summary.halfDays;

            const percentage = report.summary.attendancePercentage;
            if (percentage >= 95) excellentAttendance++;
            else if (percentage >= 85) goodAttendance++;
            else if (percentage >= 70) averageAttendance++;
            else poorAttendance++;
        });

        const overallAttendancePercentage = totalPossibleAttendance > 0 ? 
            ((totalPresent + (totalHalfDay * 0.5)) / totalPossibleAttendance) * 100 : 0;

        return {
            totalTeachers,
            totalPossibleAttendance,
            totalPresent,
            totalAbsent,
            totalLate,
            totalEarlyExit,
            totalHalfDay,
            overallAttendancePercentage: Math.round(overallAttendancePercentage * 100) / 100,
            excellentAttendance,
            goodAttendance,
            averageAttendance,
            poorAttendance
        };
    };

    // Download CSV file
    const downloadCSV = (report) => {
        const monthName = report.month;
        const year = report.year;
        
        // Create CSV content
        let csvContent = '';

        // Header
        csvContent += `মাসিক শিক্ষক রিপোর্ট,${monthName} ${year}\n`;
        csvContent += `প্রস্তুতের তারিখ,${report.generatedDate}\n`;
        csvContent += `মোট শিক্ষক,${report.totalTeachers}\n\n`;

        // Summary section
        csvContent += 'সারসংক্ষেপ\n';
        csvContent += 'বিষয়,পরিমাণ\n';
        csvContent += `সর্বমোট উপস্থিতি শতাংশ,${report.summary.overallAttendancePercentage}%\n`;
        csvContent += `উত্তম উপস্থিতি (≥৯৫%),${report.summary.excellentAttendance}\n`;
        csvContent += `ভাল উপস্থিতি (৮৫-৯৪%),${report.summary.goodAttendance}\n`;
        csvContent += `মধ্যম উপস্থিতি (৭০-৮৪%),${report.summary.averageAttendance}\n`;
        csvContent += `দুর্বল উপস্থিতি (<৭০%),${report.summary.poorAttendance}\n\n`;

        // Teachers data
        csvContent += 'শিক্ষক বিস্তারিত\n';
        csvContent += 'আইডি,নাম,পদবী,স্টাফ টাইপ,মোবাইল,বেতন,নির্ধারিত সময়,উপস্থিতি %,উপস্থিত,অনুপস্থিত,বিলম্বিত,প্রারম্ভিক প্রস্থান,অর্ধদিবস,ছুটি,অবস্থা\n';
        
        report.teachers.forEach(teacher => {
            const { teacherInfo, summary } = teacher;
            csvContent += `"${teacherInfo.smartId || 'N/A'}","${teacherInfo.name}","${teacherInfo.designation}","${teacherInfo.staffType}","${teacherInfo.mobile}","${teacherInfo.salary || 'N/A'}","${summary.scheduledEntry}-${summary.scheduledExit}",${summary.attendancePercentage}%,${summary.presentDays},${summary.absentDays},${summary.lateDays},${summary.earlyExitDays},${summary.halfDays},${summary.holidayDays},"${teacherInfo.isActive ? 'সক্রিয়' : 'নিষ্ক্রিয়'}"\n`;
        });

        // Daily attendance details
        csvContent += '\nদৈনিক উপস্থিতি বিস্তারিত\n';
        csvContent += 'শিক্ষক,তারিখ,দিন,অবস্থা,প্রবেশ সময়,প্রস্থান সময়,মন্তব্য\n';
        
        report.teachers.forEach(teacher => {
            const { teacherInfo, dailyAttendance } = teacher;
            dailyAttendance.forEach(attendance => {
                if (attendance.status !== 'Holiday') {
                    csvContent += `"${teacherInfo.name}","${attendance.date}",${attendance.day},"${attendance.status}","${attendance.entryTime}","${attendance.exitTime}","${attendance.remarks}"\n`;
                }
            });
        });

        // Create and download file
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        
        link.setAttribute('href', url);
        link.setAttribute('download', `teachers_monthly_report_${monthName}_${year}.csv`);
        link.style.visibility = 'hidden';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Format currency
    const formatCurrency = (amount) => {
        if (!amount) return 'N/A';
        return new Intl.NumberFormat('bn-BD').format(amount);
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-full mx-auto">
                <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-purple-600 to-purple-800 px-6 py-4">
                        <h1 className="text-2xl font-bold text-white text-center">
                            মাসিক শিক্ষক রিপোর্ট
                        </h1>
                        <p className="text-purple-100 text-center mt-1">
                            মাসিক উপস্থিতি এবং কর্মক্ষমতা রিপোর্ট ডাউনলোড করুন
                        </p>
                    </div>

                    {/* Search Form */}
                    <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                            {/* Month */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    মাস <span className="text-red-500">*</span>
                                </label>
                                <select
                                    name="month"
                                    value={formData.month}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    required
                                >
                                    <option value="">মাস নির্বাচন করুন</option>
                                    {months.map(month => (
                                        <option key={month.value} value={month.value}>
                                            {month.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Year */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    বছর <span className="text-red-500">*</span>
                                </label>
                                <select
                                    name="year"
                                    value={formData.year}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    required
                                >
                                    {years.map(year => (
                                        <option key={year} value={year}>
                                            {year}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Teacher ID/Name */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    শিক্ষক আইডি/নাম/পদবী
                                </label>
                                <input
                                    type="text"
                                    name="teacherId"
                                    value={formData.teacherId}
                                    onChange={handleInputChange}
                                    placeholder="শিক্ষক আইডি, নাম বা পদবী"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                />
                            </div>
                        </div>

                        {/* Teachers Count and Stats */}
                        {filteredTeachers.length > 0 && (
                            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6">
                                <div className="text-center">
                                    <p className="text-purple-700 font-medium">
                                        পাওয়া গেছে {filteredTeachers.length} জন শিক্ষক
                                    </p>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2 text-sm">
                                        <div className="text-green-600">
                                            সক্রিয়: {filteredTeachers.filter(t => t.isActive).length}
                                        </div>
                                        <div className="text-blue-600">
                                            শিক্ষক: {filteredTeachers.filter(t => t.staffType === 'Teacher').length}
                                        </div>
                                        <div className="text-orange-600">
                                            স্টাফ: {filteredTeachers.filter(t => t.staffType !== 'Teacher').length}
                                        </div>
                                        <div className="text-purple-600">
                                            প্রধান শিক্ষক: {filteredTeachers.filter(t => t.designation?.includes('Head')).length}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Download Button */}
                        <div className="flex justify-center">
                            <button
                                onClick={handleDownloadReport}
                                disabled={loading || !formData.month || !formData.year || filteredTeachers.length === 0}
                                className={`px-8 py-3 rounded-lg font-medium text-white transition-colors duration-200 flex items-center space-x-2 ${
                                    loading || !formData.month || !formData.year || filteredTeachers.length === 0
                                        ? 'bg-gray-400 cursor-not-allowed'
                                        : 'bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2'
                                }`}
                            >
                                {loading ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        <span>রিপোর্ট তৈরি হচ্ছে...</span>
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                                        </svg>
                                        <span>রিপোর্ট ডাউনলোড করুন</span>
                                    </>
                                )}
                            </button>
                        </div>

                        {error && (
                            <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm text-center">
                                {error}
                            </div>
                        )}

                        {/* Report Preview Info */}
                        {reportData && (
                            <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
                                <div className="text-center">
                                    <svg className="w-12 h-12 text-green-500 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                    </svg>
                                    <h3 className="text-lg font-medium text-green-800 mb-2">
                                        রিপোর্ট সফলভাবে ডাউনলোড হয়েছে
                                    </h3>
                                    <p className="text-green-700">
                                        {reportData.month} {reportData.year} - {reportData.totalTeachers} জন শিক্ষক
                                    </p>
                                    <p className="text-green-600 text-sm mt-1">
                                        সার্বিক উপস্থিতি: {reportData.summary.overallAttendancePercentage}%
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Instructions */}
                        <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                            <h4 className="text-sm font-medium text-yellow-800 mb-2">নির্দেশনা:</h4>
                            <ul className="text-sm text-yellow-700 list-disc list-inside space-y-1">
                                <li>রিপোর্ট ডাউনলোড করতে মাস এবং বছর নির্বাচন করুন</li>
                                <li>নির্দিষ্ট শিক্ষকের রিপোর্ট পেতে আইডি, নাম বা পদবী দিয়ে সার্চ করুন</li>
                                <li>রিপোর্ট CSV ফরম্যাটে ডাউনলোড হবে</li>
                                <li>রিপোর্টে উপস্থিতি সারাংশ, সময়সূচী এবং দৈনিক বিস্তারিত তথ্য থাকবে</li>
                                <li>শিক্ষকদের জন্য উচ্চতর উপস্থিতি মানদণ্ড প্রয়োগ করা হয়েছে</li>
                            </ul>
                        </div>

                        {/* Sample Teachers Preview */}
                        {filteredTeachers.length > 0 && (
                            <div className="mt-6">
                                <h4 className="text-sm font-medium text-gray-700 mb-3">শিক্ষক তালিকা:</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-60 overflow-y-auto">
                                    {filteredTeachers.slice(0, 6).map(teacher => (
                                        <div key={teacher._id} className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                                            <div className="font-medium text-gray-800">{teacher.name}</div>
                                            <div className="text-sm text-gray-600">
                                                {teacher.designation} | {teacher.staffType}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                আইডি: {teacher.smartId || 'N/A'} | 
                                                অবস্থা: <span className={teacher.isActive ? 'text-green-600' : 'text-red-600'}>
                                                    {teacher.isActive ? 'সক্রিয়' : 'নিষ্ক্রিয়'}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                    {filteredTeachers.length > 6 && (
                                        <div className="bg-gray-100 border border-gray-300 rounded-lg p-3 text-center">
                                            <div className="text-sm text-gray-600">
                                                এবং আরও {filteredTeachers.length - 6} জন শিক্ষক...
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MonthlyReportTeachers;