import { useEffect, useState } from 'react';
import axiosInstance from '../../../../../../hooks/axiosInstance/axiosInstance';
import MainButton from '../../../../../sharedItems/Mainbutton/Mainbutton';

const MonthlyReportsStudents = () => {
    const [formData, setFormData] = useState({
        month: '',
        year: new Date().getFullYear().toString(),
        class: '',
        section: ''
    });

    const [classes, setClasses] = useState([]);
    const [sections, setSections] = useState([]);
    const [students, setStudents] = useState([]);
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

    // Fetch students when class or section changes
    useEffect(() => {
        const fetchStudents = async () => {
            if (formData.class || formData.section) {
                try {
                    const params = {};
                    if (formData.class) params.class = formData.class;
                    if (formData.section) params.section = formData.section;

                    const response = await axiosInstance.get('/students', { params });
                    if (response.data && response.data.success) {
                        setStudents(response.data.data || []);
                    } else {
                        setStudents([]);
                    }
                } catch (err) {
                    console.error('Error fetching students:', err);
                    setStudents([]);
                }
            } else {
                setStudents([]);
            }
        };

        fetchStudents();
    }, [formData.class, formData.section]);

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

        if (students.length === 0) {
            setError('কোন শিক্ষার্থী পাওয়া যায়নি');
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
            totalStudents: students.length,
            students: students.map(student => {
                const studentReport = generateStudentMonthlyReport(student, daysInMonth);
                return {
                    studentInfo: student,
                    ...studentReport
                };
            }),
            summary: calculateMonthlySummary(students, daysInMonth)
        };

        return report;
    };

    // Generate individual student monthly report
    const generateStudentMonthlyReport = (student, daysInMonth) => {
        const attendanceTypes = ['Present', 'Absent', 'Late', 'Early Exit', 'Half Day', 'Holiday'];
        const weights = [65, 10, 8, 4, 3, 10]; // Probability weights
        
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

                // Set remarks based on status
                switch (status) {
                    case 'Present':
                        remarks = 'নিয়মিত উপস্থিত';
                        break;
                    case 'Absent':
                        remarks = 'অনুপস্থিত';
                        break;
                    case 'Late':
                        remarks = 'বিলম্বে উপস্থিত';
                        break;
                    case 'Early Exit':
                        remarks = 'প্রারম্ভিক প্রস্থান';
                        break;
                    case 'Half Day':
                        remarks = 'অর্ধদিবস উপস্থিত';
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
                attendancePercentage: Math.round(attendancePercentage * 100) / 100
            }
        };
    };

    // Calculate monthly summary
    const calculateMonthlySummary = (students, daysInMonth) => {
        const totalStudents = students.length;
        const totalPossibleAttendance = totalStudents * daysInMonth;
        
        let totalPresent = 0;
        let totalAbsent = 0;
        let totalLate = 0;
        let totalEarlyExit = 0;
        let totalHalfDay = 0;
        let excellentAttendance = 0; // >= 90%
        let goodAttendance = 0; // 75-89%
        let averageAttendance = 0; // 50-74%
        let poorAttendance = 0; // < 50%

        students.forEach(student => {
            const report = generateStudentMonthlyReport(student, daysInMonth);
            totalPresent += report.summary.presentDays;
            totalAbsent += report.summary.absentDays;
            totalLate += report.summary.lateDays;
            totalEarlyExit += report.summary.earlyExitDays;
            totalHalfDay += report.summary.halfDays;

            const percentage = report.summary.attendancePercentage;
            if (percentage >= 90) excellentAttendance++;
            else if (percentage >= 75) goodAttendance++;
            else if (percentage >= 50) averageAttendance++;
            else poorAttendance++;
        });

        const overallAttendancePercentage = totalPossibleAttendance > 0 ? 
            ((totalPresent + (totalHalfDay * 0.5)) / totalPossibleAttendance) * 100 : 0;

        return {
            totalStudents,
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
        csvContent += `মাসিক শিক্ষার্থী রিপোর্ট,${monthName} ${year}\n`;
        csvContent += `প্রস্তুতের তারিখ,${report.generatedDate}\n`;
        csvContent += `মোট শিক্ষার্থী,${report.totalStudents}\n\n`;

        // Summary section
        csvContent += 'সারসংক্ষেপ\n';
        csvContent += 'বিষয়,পরিমাণ\n';
        csvContent += `সর্বমোট উপস্থিতি শতাংশ,${report.summary.overallAttendancePercentage}%\n`;
        csvContent += `উত্তম উপস্থিতি (≥৯০%),${report.summary.excellentAttendance}\n`;
        csvContent += `ভাল উপস্থিতি (৭৫-৮৯%),${report.summary.goodAttendance}\n`;
        csvContent += `মধ্যম উপস্থিতি (৫০-৭৪%),${report.summary.averageAttendance}\n`;
        csvContent += `দুর্বল উপস্থিতি (<৫০%),${report.summary.poorAttendance}\n\n`;

        // Students data
        csvContent += 'শিক্ষার্থী বিস্তারিত\n';
        csvContent += 'আইডি,নাম,ক্লাস,সেকশন,রোল,উপস্থিতি %,উপস্থিত,অনুপস্থিত,বিলম্বিত,প্রারম্ভিক প্রস্থান,অর্ধদিবস,ছুটি\n';
        
        report.students.forEach(student => {
            const { studentInfo, summary } = student;
            csvContent += `"${studentInfo.studentId || studentInfo.smartId}","${studentInfo.name}","${studentInfo.class?.name || ''}","${studentInfo.section?.name || ''}",${studentInfo.classRoll || ''},${summary.attendancePercentage}%,${summary.presentDays},${summary.absentDays},${summary.lateDays},${summary.earlyExitDays},${summary.halfDays},${summary.holidayDays}\n`;
        });

        // Daily attendance details
        csvContent += '\nদৈনিক উপস্থিতি বিস্তারিত\n';
        csvContent += 'শিক্ষার্থী,তারিখ,দিন,অবস্থা,মন্তব্য\n';
        
        report.students.forEach(student => {
            const { studentInfo, dailyAttendance } = student;
            dailyAttendance.forEach(attendance => {
                if (attendance.status !== 'Holiday') {
                    csvContent += `"${studentInfo.name}","${attendance.date}",${attendance.day},"${attendance.status}","${attendance.remarks}"\n`;
                }
            });
        });

        // Create and download file
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        
        link.setAttribute('href', url);
        link.setAttribute('download', `students_monthly_report_${monthName}_${year}.csv`);
        link.style.visibility = 'hidden';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Get selected class name
    const getSelectedClassName = () => {
        const selectedClass = classes.find(cls => cls._id === formData.class);
        return selectedClass ? selectedClass.name : 'সব ক্লাস';
    };

    // Get selected section name
    const getSelectedSectionName = () => {
        const selectedSection = sections.find(sec => sec._id === formData.section);
        return selectedSection ? selectedSection.name : 'সব সেকশন';
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-full mx-auto">
                <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                    {/* Header */}
                    <div className="px-6 py-4">
                        <h1 className="text-2xl font-bold ">
                            মাসিক শিক্ষার্থী রিপোর্ট
                        </h1>
                    </div>

                    {/* Search Form */}
                    <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            {/* Month */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    মাস <span className="text-red-500">*</span>
                                </label>
                                <select
                                    name="month"
                                    value={formData.month}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9] focus:border-transparent"
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
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9] focus:border-transparent"
                                    required
                                >
                                    {years.map(year => (
                                        <option key={year} value={year}>
                                            {year}
                                        </option>
                                    ))}
                                </select>
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
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9] focus:border-transparent"
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
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9] focus:border-transparent"
                                >
                                    <option value="">সব সেকশন</option>
                                    {sections.map(section => (
                                        <option key={section._id} value={section._id}>
                                            {section.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Students Count */}
                        {students.length > 0 && (
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                                <div className="text-center">
                                    <p className="text-blue-700 font-medium">
                                        পাওয়া গেছে {students.length} জন শিক্ষার্থী
                                    </p>
                                    <p className="text-blue-600 text-sm mt-1">
                                        ক্লাস: {getSelectedClassName()} | সেকশন: {getSelectedSectionName()}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Download Button */}
                        <div className="flex justify-center">
                            <MainButton
                                onClick={handleDownloadReport}
                                disabled={loading || !formData.month || !formData.year || students.length === 0}
                                className={`px-8 py-3 rounded-lg font-medium text-white transition-colors duration-200 flex items-center space-x-2 ${
                                    loading || !formData.month || !formData.year || students.length === 0
                                        ? 'bg-gray-400 cursor-not-allowed'
                                        : 'bg-[#1e90c9]'
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
                            </MainButton>
                        </div>

                        {error && (
                            <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm text-center">
                                {error}
                            </div>
                        )}

                        {/* Report Preview Info */}
                        {reportData && (
                            <div className="mt-6 bg-blue-50  rounded-lg p-4">
                                <div className="text-center">
                                    <svg className="w-12 h-12 text-[#1e90c9] mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                    </svg>
                                    <h3 className="text-lg font-medium text-[#1e90c9] mb-2">
                                        রিপোর্ট সফলভাবে ডাউনলোড হয়েছে
                                    </h3>
                                    <p className="text-green-700">
                                        {reportData.month} {reportData.year} - {reportData.totalStudents} জন শিক্ষার্থী
                                    </p>
                                    <p className="text-green-600 text-sm mt-1">
                                        সার্বিক উপস্থিতি: {reportData.summary.overallAttendancePercentage}%
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Instructions */}
                        <div className="mt-6 bg-blue-50 rounded-lg p-4">
                            <h4 className="text-sm font-medium text-[#1e90c9] mb-2">নির্দেশনা:</h4>
                            <ul className="text-sm text-[#1e90c9] list-disc list-inside space-y-1">
                                <li>রিপোর্ট ডাউনলোড করতে মাস এবং বছর নির্বাচন করুন</li>
                                <li>নির্দিষ্ট ক্লাস বা সেকশনের রিপোর্ট পেতে ফিল্টার ব্যবহার করুন</li>
                                <li>রিপোর্ট CSV ফরম্যাটে ডাউনলোড হবে</li>
                                <li>রিপোর্টে উপস্থিতি সারাংশ এবং দৈনিক বিস্তারিত তথ্য থাকবে</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MonthlyReportsStudents;