import { useEffect, useState } from 'react';
import { FaCalendarAlt, FaDownload, FaFilePdf, FaMoneyBillWave, FaUsers } from 'react-icons/fa';
import Swal from 'sweetalert2';
import axiosInstance from '../../../../../../hooks/axiosInstance/axiosInstance';
import MainButton from '../../../../../sharedItems/Mainbutton/Mainbutton';

const MonthlyFeeReport = ({ onBack }) => {
    const [filters, setFilters] = useState({
        classId: '',
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear()
    });
    const [loading, setLoading] = useState(false);
    const [generating, setGenerating] = useState(false);
    
    const [classes, setClasses] = useState([]);
    const [students, setStudents] = useState([]);
    const [feeTypes, setFeeTypes] = useState([]);
    const [reportData, setReportData] = useState(null);

    const months = [
        { value: 1, label: 'জানুয়ারি' },
        { value: 2, label: 'ফেব্রুয়ারি' },
        { value: 3, label: 'মার্চ' },
        { value: 4, label: 'এপ্রিল' },
        { value: 5, label: 'মে' },
        { value: 6, label: 'জুন' },
        { value: 7, label: 'জুলাই' },
        { value: 8, label: 'আগস্ট' },
        { value: 9, label: 'সেপ্টেম্বর' },
        { value: 10, label: 'অক্টোবর' },
        { value: 11, label: 'নভেম্বর' },
        { value: 12, label: 'ডিসেম্বর' }
    ];

    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

    useEffect(() => {
        fetchDropdownData();
    }, []);

    const fetchDropdownData = async () => {
        try {
            const classesResponse = await axiosInstance.get('/class');
            if (classesResponse.data.success) {
                setClasses(classesResponse.data.data || []);
            }

            const feeTypesResponse = await axiosInstance.get('/fee-types');
            if (feeTypesResponse.data.success) {
                setFeeTypes(feeTypesResponse.data.data || []);
            }
        } catch (error) {
            console.error('Error fetching dropdown data:', error);
            showSweetAlert('error', 'ডেটা লোড করতে সমস্যা হয়েছে');
        }
    };

    const showSweetAlert = (icon, title, text = '') => {
        Swal.fire({
            icon,
            title,
            text,
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true,
        });
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleGenerateReport = async () => {
        if (!filters.classId) {
            showSweetAlert('warning', 'অনুগ্রহ করে একটি ক্লাস নির্বাচন করুন');
            return;
        }

        setLoading(true);
        try {
            // Fetch students for the selected class
            const studentsResponse = await axiosInstance.get(`/students?classId=${filters.classId}`);
            
            if (studentsResponse.data.success) {
                const studentsData = studentsResponse.data.data || [];
                setStudents(studentsData);
                
                // Generate report data from students and fee types
                const report = generateMonthlyFeeReport(studentsData, feeTypes);
                setReportData(report);
                
                if (report.totalStudents > 0) {
                    showSweetAlert('success', 'রিপোর্ট তৈরি হয়েছে');
                } else {
                    showSweetAlert('info', 'এই ক্লাসে কোন শিক্ষার্থী নেই');
                }
            } else {
                setReportData(null);
                showSweetAlert('info', 'কোন ডেটা পাওয়া যায়নি');
            }
        } catch (error) {
            console.error('Error generating report:', error);
            showSweetAlert('error', 'রিপোর্ট তৈরি করতে সমস্যা হয়েছে');
            setReportData(null);
        } finally {
            setLoading(false);
        }
    };

    const generateMonthlyFeeReport = (studentsData, feeTypesData) => {
        const selectedClass = classes.find(c => c._id === filters.classId);
        const selectedMonth = months.find(m => m.value === parseInt(filters.month));
        
        // Calculate fee details
        const feeDetails = feeTypesData.map(feeType => {
            // Filter students who should pay this fee type
            const applicableStudents = studentsData.filter(student => 
                student.class?._id === filters.classId
            );
            
            const studentCount = applicableStudents.length;
            const totalAmount = studentCount * (feeType.amount || 0);
            
            return {
                feeType: feeType.name,
                studentCount,
                amount: totalAmount,
                feePerStudent: feeType.amount || 0
            };
        });

        // Calculate totals
        const totalStudents = studentsData.length;
        const totalCollected = feeDetails.reduce((sum, fee) => sum + fee.amount, 0);

        return {
            className: selectedClass?.name || 'নির্বাচিত ক্লাস',
            month: selectedMonth?.label || filters.month,
            year: filters.year,
            totalStudents,
            totalCollected,
            feeDetails: feeDetails.filter(fee => fee.studentCount > 0),
            students: studentsData
        };
    };

    const handleDownloadPDF = () => {
        if (!reportData) {
            showSweetAlert('warning', 'প্রথমে একটি রিপোর্ট তৈরি করুন');
            return;
        }

        setGenerating(true);
        try {
            // Create printable HTML content
            const printContent = createPrintableContent();
            
            const printWindow = window.open('', '_blank');
            printWindow.document.write(printContent);
            printWindow.document.close();
            
            // Wait for content to load then print
            setTimeout(() => {
                printWindow.print();
                setGenerating(false);
            }, 500);
            
        } catch (error) {
            console.error('Error generating PDF:', error);
            showSweetAlert('error', 'PDF তৈরি করতে সমস্যা হয়েছে');
            setGenerating(false);
        }
    };

    const createPrintableContent = () => {
        const selectedMonth = months.find(m => m.value === parseInt(filters.month));
        
        return `
            <!DOCTYPE html>
            <html>
            <head>
                <title>মাসিক ফি রিপোর্ট - ${reportData.className}</title>
                <style>
                    body { 
                        font-family: 'SolaimanLipi', 'Arial', sans-serif; 
                        margin: 20px; 
                        direction: ltr;
                    }
                    .header { 
                        text-align: center; 
                        margin-bottom: 30px; 
                        border-bottom: 2px solid #333;
                        padding-bottom: 20px;
                    }
                    .header h1 { 
                        color: #2c5aa0; 
                        margin: 0; 
                        font-size: 28px;
                    }
                    .header h2 {
                        color: #666;
                        margin: 5px 0;
                        font-size: 18px;
                    }
                    .summary { 
                        margin-bottom: 20px; 
                        padding: 20px; 
                        background: #f8f9fa; 
                        border-radius: 8px;
                        display: flex;
                        justify-content: space-between;
                        flex-wrap: wrap;
                    }
                    .summary-item { 
                        margin: 10px 20px;
                    }
                    .summary-item strong {
                        color: #333;
                    }
                    table { 
                        width: 100%; 
                        border-collapse: collapse; 
                        margin-top: 20px;
                        font-size: 14px;
                    }
                    th, td { 
                        border: 1px solid #ddd; 
                        padding: 12px; 
                        text-align: left; 
                    }
                    th { 
                        background-color: #2c5aa0; 
                        color: white;
                        font-weight: bold;
                    }
                    tr:nth-child(even) {
                        background-color: #f8f9fa;
                    }
                    .total-row { 
                        background-color: #e9ecef; 
                        font-weight: bold; 
                    }
                    .student-table {
                        margin-top: 30px;
                    }
                    .student-table h3 {
                        color: #2c5aa0;
                        margin-bottom: 15px;
                    }
                    .footer {
                        margin-top: 40px;
                        text-align: center;
                        color: #666;
                        font-size: 12px;
                        border-top: 1px solid #ddd;
                        padding-top: 20px;
                    }
                    @media print {
                        body { margin: 0; }
                        .no-print { display: none; }
                    }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>মাসিক ফি রিপোর্ট</h1>
                    <h2>${reportData.className} - ${selectedMonth?.label} ${reportData.year}</h2>
                    <p>প্রস্তুতকের তারিখ: ${new Date().toLocaleDateString('bn-BD')}</p>
                </div>
                
                <div class="summary">
                    <div class="summary-item">
                        <strong>ক্লাস:</strong> ${reportData.className}
                    </div>
                    <div class="summary-item">
                        <strong>মাস:</strong> ${selectedMonth?.label} ${reportData.year}
                    </div>
                    <div class="summary-item">
                        <strong>মোট শিক্ষার্থী:</strong> ${reportData.totalStudents} জন
                    </div>
                    <div class="summary-item">
                        <strong>মোট সংগ্রহ:</strong> ৳${formatCurrency(reportData.totalCollected)}
                    </div>
                </div>
                
                <table>
                    <thead>
                        <tr>
                            <th>ফি টাইপ</th>
                            <th>শিক্ষার্থী সংখ্যা</th>
                            <th>ফি পরিমাণ (প্রতি শিক্ষার্থী)</th>
                            <th>মোট সংগ্রহ</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${reportData.feeDetails.map(fee => `
                            <tr>
                                <td>${fee.feeType}</td>
                                <td>${fee.studentCount} জন</td>
                                <td>৳${formatCurrency(fee.feePerStudent)}</td>
                                <td>৳${formatCurrency(fee.amount)}</td>
                            </tr>
                        `).join('')}
                        <tr class="total-row">
                            <td colspan="2"><strong>মোট</strong></td>
                            <td><strong>${reportData.totalStudents} জন</strong></td>
                            <td><strong>৳${formatCurrency(reportData.totalCollected)}</strong></td>
                        </tr>
                    </tbody>
                </table>

                <div class="student-table">
                    <h3>শিক্ষার্থী তালিকা</h3>
                    <table>
                        <thead>
                            <tr>
                                <th>আইডি</th>
                                <th>নাম</th>
                                <th>পিতার নাম</th>
                                <th>মোবাইল</th>
                                <th>রোল</th>
                                <th>স্ট্যাটাস</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${reportData.students.map(student => `
                                <tr>
                                    <td>${student.studentId || 'N/A'}</td>
                                    <td>${student.name || 'N/A'}</td>
                                    <td>${student.fatherName || 'N/A'}</td>
                                    <td>${student.guardianMobile || student.mobile || 'N/A'}</td>
                                    <td>${student.classRoll || 'N/A'}</td>
                                    <td>${student.status === 'active' ? 'সক্রিয়' : 'নিষ্ক্রিয়'}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>

                <div class="footer">
                    <p>রিপোর্ট তৈরি করেছেন: School Management System</p>
                    <p>তৈরির সময়: ${new Date().toLocaleString('bn-BD')}</p>
                </div>
            </body>
            </html>
        `;
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('bn-BD', {
            minimumFractionDigits: 2
        }).format(amount || 0);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Main Content */}
            <div className="p-4 sm:p-6 lg:p-8">
                <div className="max-w-full mx-auto">
                    {/* Filters Section */}
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 mb-8">
                        <h3 className="text-lg font-semibold text-gray-800 mb-6">
                            রিপোর্ট ফিল্টার
                        </h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Class */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    ক্লাস *
                                </label>
                                <div className="relative">
                                    <select
                                        name="classId"
                                        value={filters.classId}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9] focus:border-transparent transition-all"
                                        disabled={loading}
                                    >
                                        <option value="">ক্লাস নির্বাচন করুন</option>
                                        {classes.map((classItem) => (
                                            <option key={classItem._id} value={classItem._id}>
                                                {classItem.name}
                                            </option>
                                        ))}
                                    </select>
                                    <FaUsers className="absolute left-3 top-3.5 text-gray-400" />
                                </div>
                            </div>

                            {/* Month */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    মাস
                                </label>
                                <div className="relative">
                                    <select
                                        name="month"
                                        value={filters.month}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9] focus:border-transparent transition-all"
                                        disabled={loading}
                                    >
                                        {months.map((month) => (
                                            <option key={month.value} value={month.value}>
                                                {month.label}
                                            </option>
                                        ))}
                                    </select>
                                    <FaCalendarAlt className="absolute left-3 top-3.5 text-gray-400" />
                                </div>
                            </div>

                            {/* Year */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    বছর
                                </label>
                                <div className="relative">
                                    <select
                                        name="year"
                                        value={filters.year}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9] focus:border-transparent transition-all"
                                        disabled={loading}
                                    >
                                        {years.map((year) => (
                                            <option key={year} value={year}>
                                                {year}
                                            </option>
                                        ))}
                                    </select>
                                    <FaCalendarAlt className="absolute left-3 top-3.5 text-gray-400" />
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end mt-6">
                            <MainButton
                                onClick={handleGenerateReport}
                                disabled={loading || !filters.classId}
                                className="rounded-md"
                            >
                                {loading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                        রিপোর্ট তৈরি হচ্ছে...
                                    </>
                                ) : (
                                    <>
                                        <FaFilePdf className="text-sm mr-2" />
                                        রিপোর্ট তৈরি করুন
                                    </>
                                )}
                            </MainButton>
                        </div>
                    </div>

                    {/* Report Summary */}
                    {reportData && (
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 mb-8">
                            <h3 className="text-lg font-semibold text-gray-800 mb-6">
                                রিপোর্ট সারাংশ - ${reportData.className}
                            </h3>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                                {/* Class Info */}
                                <div className="bg-blue-50 rounded-xl p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-blue-100 rounded-lg">
                                            <FaUsers className="text-blue-600 text-lg" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-blue-600">ক্লাস</p>
                                            <p className="text-lg font-bold text-gray-800">{reportData.className}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Period Info */}
                                <div className="bg-green-50 rounded-xl p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-green-100 rounded-lg">
                                            <FaCalendarAlt className="text-green-600 text-lg" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-green-600">সময়কাল</p>
                                            <p className="text-lg font-bold text-gray-800">
                                                {reportData.month} {reportData.year}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Total Collected */}
                                <div className="bg-purple-50 rounded-xl p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-purple-100 rounded-lg">
                                            <FaMoneyBillWave className="text-purple-600 text-lg" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-purple-600">মোট সংগ্রহ</p>
                                            <p className="text-lg font-bold text-gray-800">
                                                ৳{formatCurrency(reportData.totalCollected)}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Detailed Report */}
                            {reportData.feeDetails && reportData.feeDetails.length > 0 ? (
                                <div className="border border-gray-200 rounded-xl overflow-hidden mb-6">
                                    <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                                        <h4 className="text-md font-semibold text-gray-800">
                                            ফি বিবরণ
                                        </h4>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead className="bg-white border-b border-gray-200">
                                                <tr>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        ফি টাইপ
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        শিক্ষার্থী সংখ্যা
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        ফি পরিমাণ
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        মোট সংগ্রহ
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-200">
                                                {reportData.feeDetails.map((fee, index) => (
                                                    <tr key={index} className="hover:bg-gray-50 transition-colors">
                                                        <td className="px-6 py-4">
                                                            <span className="font-medium text-gray-800">
                                                                {fee.feeType}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <span className="text-sm text-gray-600">
                                                                {fee.studentCount} জন
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <span className="text-sm text-gray-600">
                                                                ৳{formatCurrency(fee.feePerStudent)}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <span className="font-semibold text-green-600">
                                                                ৳{formatCurrency(fee.amount)}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                            <tfoot className="bg-gray-50 border-t border-gray-200">
                                                <tr>
                                                    <td className="px-6 py-4 font-semibold text-gray-800">
                                                        মোট
                                                    </td>
                                                    <td className="px-6 py-4 font-semibold text-gray-800">
                                                        {reportData.totalStudents} জন
                                                    </td>
                                                    <td className="px-6 py-4 font-semibold text-gray-800">
                                                        -
                                                    </td>
                                                    <td className="px-6 py-4 font-semibold text-green-600">
                                                        ৳{formatCurrency(reportData.totalCollected)}
                                                    </td>
                                                </tr>
                                            </tfoot>
                                        </table>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-8 bg-yellow-50 rounded-xl">
                                    <p className="text-yellow-700">
                                        এই সময়ের জন্য কোন ফি ডেটা পাওয়া যায়নি
                                    </p>
                                </div>
                            )}

                            {/* Download Button */}
                            <div className="flex justify-center mt-8">
                                <MainButton
                                    onClick={handleDownloadPDF}
                                    disabled={generating || !reportData.feeDetails || reportData.feeDetails.length === 0}
                                    className="rounded-md"
                                >
                                    {generating ? (
                                        <>
                                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                            PDF তৈরি হচ্ছে...
                                        </>
                                    ) : (
                                        <>
                                            <FaDownload className="text-lg mr-2" />
                                            Print Report
                                        </>
                                    )}
                                </MainButton>
                            </div>
                        </div>
                    )}

                    {/* No Data Message */}
                    {!reportData && !loading && (
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-12 text-center">
                            <div className="text-6xl text-gray-300 mb-4">📊</div>
                            <h3 className="text-xl font-semibold text-gray-800 mb-2">
                                মাসিক ফি রিপোর্ট
                            </h3>
                            <p className="text-gray-600 mb-6">
                                একটি ক্লাস নির্বাচন করে মাসিক ফি রিপোর্ট তৈরি করুন
                            </p>
                            <div className="text-sm text-gray-500">
                                রিপোর্ট তৈরি করতে উপরের ফিল্টার ব্যবহার করুন
                            </div>
                        </div>
                    )}

                    {/* Loading State */}
                    {loading && (
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-12 text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                            <h3 className="text-lg font-semibold text-gray-800 mb-2">
                                রিপোর্ট তৈরি হচ্ছে
                            </h3>
                            <p className="text-gray-600">
                                অনুগ্রহ করে কিছুক্ষণ অপেক্ষা করুন...
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MonthlyFeeReport;