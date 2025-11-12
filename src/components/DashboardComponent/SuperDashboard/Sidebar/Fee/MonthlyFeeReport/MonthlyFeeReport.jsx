import { useEffect, useState } from 'react';
import { FaCalendarAlt, FaDownload, FaFilePdf, FaMoneyBillWave, FaUsers } from 'react-icons/fa';
import Swal from 'sweetalert2';
import axiosInstance from '../../../../../../hooks/axiosInstance/axiosInstance';

const MonthlyFeeReport = ({ onBack }) => {
    const [filters, setFilters] = useState({
        classId: '',
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear()
    });
    const [loading, setLoading] = useState(false);
    const [generating, setGenerating] = useState(false);
    
    const [classes, setClasses] = useState([]);
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
            // API call to get monthly fee report
            const response = await axiosInstance.get('/reports/monthly-fee', {
                params: {
                    classId: filters.classId,
                    month: filters.month,
                    year: filters.year
                }
            });

            if (response.data.success) {
                setReportData(response.data.data);
                showSweetAlert('success', 'রিপোর্ট তৈরি হয়েছে');
            } else {
                setReportData(null);
                showSweetAlert('info', 'এই সময়ের জন্য কোন ডেটা পাওয়া যায়নি');
            }
        } catch (error) {
            console.error('Error generating report:', error);
            showSweetAlert('error', 'রিপোর্ট তৈরি করতে সমস্যা হয়েছে');
            setReportData(null);
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadPDF = async () => {
        if (!reportData) {
            showSweetAlert('warning', 'প্রথমে একটি রিপোর্ট তৈরি করুন');
            return;
        }

        setGenerating(true);
        try {
            // API call to generate PDF
            const response = await axiosInstance.post('/reports/monthly-fee/pdf', {
                classId: filters.classId,
                month: filters.month,
                year: filters.year,
                reportData: reportData
            }, {
                responseType: 'blob'
            });

            // Create download link
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.download = `monthly-fee-report-${reportData.className}-${reportData.month}-${reportData.year}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
            
            showSweetAlert('success', 'PDF ডাউনলোড হয়েছে');
        } catch (error) {
            console.error('Error downloading PDF:', error);
            showSweetAlert('error', 'PDF ডাউনলোড করতে সমস্যা হয়েছে');
        } finally {
            setGenerating(false);
        }
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
                                        className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
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
                                        className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
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
                                        className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
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
                            <button
                                onClick={handleGenerateReport}
                                disabled={loading || !filters.classId}
                                className="inline-flex items-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                        রিপোর্ট তৈরি হচ্ছে...
                                    </>
                                ) : (
                                    <>
                                        <FaFilePdf className="text-sm" />
                                        রিপোর্ট তৈরি করুন
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Report Summary */}
                    {reportData && (
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 mb-8">
                            <h3 className="text-lg font-semibold text-gray-800 mb-6">
                                রিপোর্ট সারাংশ
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
                                <div className="border border-gray-200 rounded-xl overflow-hidden">
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
                                                        সংগ্রহকৃত অর্থ
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        গড় প্রতি শিক্ষার্থী
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
                                                            <span className="font-semibold text-green-600">
                                                                ৳{formatCurrency(fee.amount)}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <span className="text-sm text-gray-600">
                                                                ৳{formatCurrency(fee.amount / fee.studentCount)}
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
                                                    <td className="px-6 py-4 font-semibold text-green-600">
                                                        ৳{formatCurrency(reportData.totalCollected)}
                                                    </td>
                                                    <td className="px-6 py-4 font-semibold text-gray-800">
                                                        ৳{formatCurrency(reportData.totalCollected / reportData.totalStudents)}
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
                                <button
                                    onClick={handleDownloadPDF}
                                    disabled={generating || !reportData.feeDetails || reportData.feeDetails.length === 0}
                                    className="inline-flex items-center gap-3 px-8 py-4 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {generating ? (
                                        <>
                                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                            PDF তৈরি হচ্ছে...
                                        </>
                                    ) : (
                                        <>
                                            <FaDownload className="text-lg" />
                                            Download PDF
                                        </>
                                    )}
                                </button>
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