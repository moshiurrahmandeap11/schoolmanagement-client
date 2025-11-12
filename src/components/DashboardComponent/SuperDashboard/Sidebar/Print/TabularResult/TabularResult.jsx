import { useEffect, useState } from 'react';
import { FaAlignLeft, FaArrowLeft, FaDownload, FaListAlt, FaSort } from 'react-icons/fa';
import Swal from 'sweetalert2';
import axiosInstance from '../../../../../../hooks/axiosInstance/axiosInstance';

const TabularResult = ({ onBack }) => {
    const [formData, setFormData] = useState({
        examId: '',
        orderBy: 'studentId',
        headerOrientation: 'normal'
    });
    const [loading, setLoading] = useState(false);
    const [downloading, setDownloading] = useState(false);
    
    const [exams, setExams] = useState([]);

    // Order by options
    const orderByOptions = [
        { value: 'studentId', label: 'শিক্ষার্থীর আইডি' },
        { value: 'classRoll', label: 'Class Roll' },
        { value: 'gradePoint', label: 'গ্রেড পয়েন্ট' }
    ];

    // Header orientation options
    const headerOrientationOptions = [
        { value: 'normal', label: 'Normal' },
        { value: 'rotate', label: 'Rotate' }
    ];

    useEffect(() => {
        fetchExams();
    }, []);

    const fetchExams = async () => {
        try {
            const examsResponse = await axiosInstance.get('/exam-categories');
            if (examsResponse.data.success) {
                setExams(examsResponse.data.data || []);
            }
        } catch (error) {
            console.error('Error fetching exams:', error);
            showSweetAlert('error', 'পরীক্ষার ডেটা লোড করতে সমস্যা হয়েছে');
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
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // Auto download when all fields are selected
        if (name === 'headerOrientation' && formData.examId && formData.orderBy) {
            handleDownload();
        }
    };

    const handleDownload = async () => {
        if (!formData.examId) {
            showSweetAlert('warning', 'অনুগ্রহ করে একটি পরীক্ষা নির্বাচন করুন');
            return;
        }

        setDownloading(true);
        try {
            // API call to download result sheet
            const response = await axiosInstance.get('/result-sheet', {
                params: {
                    examId: formData.examId,
                    orderBy: formData.orderBy,
                    headerOrientation: formData.headerOrientation
                },
                responseType: 'blob'
            });

            // Create download link
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            
            // Generate filename based on selections
            const examName = exams.find(e => e._id === formData.examId)?.name || 'result';
            const orderByName = orderByOptions.find(o => o.value === formData.orderBy)?.label || '';
            const orientationName = headerOrientationOptions.find(h => h.value === formData.headerOrientation)?.label || '';
            
            link.download = `result-sheet-${examName}-${orderByName}-${orientationName}.xlsx`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
            
            showSweetAlert('success', 'রেজাল্ট শীট ডাউনলোড হয়েছে');
        } catch (error) {
            console.error('Error downloading result sheet:', error);
            showSweetAlert('error', 'রেজাল্ট শীট ডাউনলোড করতে সমস্যা হয়েছে');
        } finally {
            setDownloading(false);
        }
    };

    const getSelectedExamName = () => {
        return exams.find(e => e._id === formData.examId)?.name || 'N/A';
    };

    const getSelectedOrderByName = () => {
        return orderByOptions.find(o => o.value === formData.orderBy)?.label || 'N/A';
    };

    const getSelectedOrientationName = () => {
        return headerOrientationOptions.find(h => h.value === formData.headerOrientation)?.label || 'N/A';
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 shadow-sm">
                <div className="flex items-center justify-between p-4 sm:p-6">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={onBack}
                            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                            <FaArrowLeft className="text-xl text-gray-600" />
                        </button>
                        <h1 className="text-2xl font-bold text-gray-800">
                            ট্যাবুলার রেজাল্ট
                        </h1>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="p-4 sm:p-6 lg:p-8">
                <div className="max-w-full mx-auto">

                    {/* Form Section */}
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 mb-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-6">
                            রেজাল্ট শীট সেটিংস
                        </h3>
                        
                        <div className="space-y-6">
                            {/* Exam Selection */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Exam *
                                </label>
                                <div className="relative">
                                    <select
                                        name="examId"
                                        value={formData.examId}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                        disabled={downloading}
                                        required
                                    >
                                        <option value="">পরীক্ষা নির্বাচন করুন</option>
                                        {exams.map((exam) => (
                                            <option key={exam._id} value={exam._id}>
                                                {exam.name}
                                            </option>
                                        ))}
                                    </select>
                                    <FaListAlt className="absolute left-3 top-3.5 text-gray-400" />
                                </div>
                            </div>

                            {/* Order By */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Order by
                                </label>
                                <div className="relative">
                                    <select
                                        name="orderBy"
                                        value={formData.orderBy}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                        disabled={downloading}
                                    >
                                        {orderByOptions.map((option) => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                    <FaSort className="absolute left-3 top-3.5 text-gray-400" />
                                </div>
                            </div>

                            {/* Header Orientation */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Header Orientation
                                </label>
                                <div className="relative">
                                    <select
                                        name="headerOrientation"
                                        value={formData.headerOrientation}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                        disabled={downloading}
                                    >
                                        {headerOrientationOptions.map((option) => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                    <FaAlignLeft className="absolute left-3 top-3.5 text-gray-400" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Selection Summary */}
                    {(formData.examId || formData.orderBy || formData.headerOrientation) && (
                        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 mb-6">
                            <h4 className="text-md font-semibold text-blue-800 mb-4">
                                নির্বাচিত সেটিংস
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                <div>
                                    <p className="text-blue-600 font-medium">পরীক্ষা:</p>
                                    <p className="text-gray-800">{getSelectedExamName()}</p>
                                </div>
                                <div>
                                    <p className="text-blue-600 font-medium">সাজানোর ক্রম:</p>
                                    <p className="text-gray-800">{getSelectedOrderByName()}</p>
                                </div>
                                <div>
                                    <p className="text-blue-600 font-medium">হেডার ওরিয়েন্টেশন:</p>
                                    <p className="text-gray-800">{getSelectedOrientationName()}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Download Button */}
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                                    রেজাল্ট শীট ডাউনলোড
                                </h3>
                                <p className="text-sm text-gray-600">
                                    সকল ফিল্ড সিলেক্ট করলে অটোমেটিক ডাউনলোড শুরু হবে
                                </p>
                            </div>
                            
                            <button
                                onClick={handleDownload}
                                disabled={downloading || !formData.examId}
                                className="inline-flex items-center gap-3 px-8 py-4 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {downloading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                        ডাউনলোড হচ্ছে...
                                    </>
                                ) : (
                                    <>
                                        <FaDownload className="text-lg" />
                                        Download Result Sheet
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Information Card */}
                    <div className="bg-purple-50 border border-purple-200 rounded-2xl p-6 mt-6">
                        <h3 className="text-md font-semibold text-purple-800 mb-2">
                            ট্যাবুলার রেজাল্ট সম্পর্কে
                        </h3>
                        <ul className="text-sm text-purple-700 space-y-1">
                            <li>• এক্সেল ফরম্যাটে রেজাল্ট শীট ডাউনলোড করুন</li>
                            <li>• পরীক্ষা নির্বাচন করা বাধ্যতামূলক</li>
                            <li>• শিক্ষার্থীদের আইডি, রোল বা গ্রেড পয়েন্ট অনুসারে সাজান</li>
                            <li>• হেডার নরমাল বা রোটেট মোডে দেখুন</li>
                            <li>• সকল অপশন সিলেক্ট করলে অটোমেটিক ডাউনলোড শুরু হবে</li>
                        </ul>
                    </div>

                    {/* Loading State */}
                    {loading && (
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-12 text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                            <h3 className="text-lg font-semibold text-gray-800 mb-2">
                                ডেটা লোড হচ্ছে
                            </h3>
                            <p className="text-gray-600">
                                পরীক্ষার তালিকা প্রস্তুত করা হচ্ছে...
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TabularResult;