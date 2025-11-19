import { useEffect, useState } from 'react';
import { FaArrowLeft, FaCalendarAlt, FaDownload, FaFilter, FaPlus, FaSearch, FaTrash } from 'react-icons/fa';
import Swal from 'sweetalert2';
import axiosInstance from '../../../../../../../hooks/axiosInstance/axiosInstance';
import Loader from '../../../../../../sharedItems/Loader/Loader';
import MainButton from '../../../../../../sharedItems/Mainbutton/Mainbutton';
import ClassReport from '../ClassReport/ClassReport';

const ClassReportList = () => {
    const [loading, setLoading] = useState(false);
    const [reports, setReports] = useState([]);
    const [classes, setClasses] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [filters, setFilters] = useState({
        classId: '',
        subjectId: '',
        studentId: '',
        studentName: '',
        fromDate: '',
        toDate: ''
    });
    const [showCreateForm, setShowCreateForm] = useState(false); // নতুন state যোগ করুন

    // Get current Bangladesh time
    const getBangladeshTime = () => {
        const now = new Date();
        const options = {
            timeZone: 'Asia/Dhaka',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true
        };
        return now.toLocaleString('en-BD', options);
    };

    useEffect(() => {
        fetchDropdownData();
        fetchReports();
    }, []);

    const fetchDropdownData = async () => {
        try {
            const [classesRes, subjectsRes] = await Promise.all([
                axiosInstance.get('/class'),
                axiosInstance.get('/subjects')
            ]);

            if (classesRes.data.success) setClasses(classesRes.data.data || []);
            if (subjectsRes.data.success) setSubjects(subjectsRes.data.data || []);
        } catch (error) {
            console.error('Error fetching dropdown data:', error);
            showSweetAlert('error', 'ডেটা লোড করতে সমস্যা হয়েছে');
        }
    };

    const fetchReports = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams();
            
            if (filters.classId) params.append('classId', filters.classId);
            if (filters.subjectId) params.append('subjectId', filters.subjectId);
            if (filters.studentId) params.append('studentId', filters.studentId);
            if (filters.studentName) params.append('studentName', filters.studentName);
            if (filters.fromDate) params.append('startDate', filters.fromDate);
            if (filters.toDate) params.append('endDate', filters.toDate);

            const response = await axiosInstance.get(`/class-report?${params}`);
            
            if (response.data.success) {
                setReports(response.data.data || []);
            }
        } catch (error) {
            console.error('Error fetching reports:', error);
            showSweetAlert('error', 'রিপোর্ট লোড করতে সমস্যা হয়েছে');
        } finally {
            setLoading(false);
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

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleApplyFilter = () => {
        fetchReports();
    };

    const handleClearFilter = () => {
        setFilters({
            classId: '',
            subjectId: '',
            studentId: '',
            studentName: '',
            fromDate: '',
            toDate: ''
        });
        fetchReports();
    };

    const handleDeleteReport = async (reportId) => {
        const result = await Swal.fire({
            title: 'আপনি কি নিশ্চিত?',
            text: "এই রিপোর্টটি ডিলিট হয়ে যাবে!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'হ্যাঁ, ডিলিট করুন!',
            cancelButtonText: 'বাতিল করুন'
        });

        if (result.isConfirmed) {
            try {
                const response = await axiosInstance.delete(`/class-report/${reportId}`);
                if (response.data.success) {
                    showSweetAlert('success', 'রিপোর্ট সফলভাবে ডিলিট হয়েছে');
                    fetchReports();
                }
            } catch (error) {
                console.error('Error deleting report:', error);
                showSweetAlert('error', 'রিপোর্ট ডিলিট করতে সমস্যা হয়েছে');
            }
        }
    };

    const handleDownload = async (report) => {
        const result = await Swal.fire({
            title: 'ডাউনলোড অপশন',
            text: 'আপনি কী ফরম্যাটে ডাউনলোড করতে চান?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Excel ডাউনলোড',
            cancelButtonText: 'PDF ডাউনলোড',
            showDenyButton: true,
            denyButtonText: 'উভয় ডাউনলোড',
            reverseButtons: true
        });

        if (result.isConfirmed) {
            downloadSingleExcel(report);
        } else if (result.isDenied) {
            downloadSingleExcel(report);
            setTimeout(() => downloadSinglePDF(report), 1000);
        } else if (result.dismiss === Swal.DismissReason.cancel) {
            downloadSinglePDF(report);
        }
    };

    const downloadSingleExcel = (report) => {
        const params = new URLSearchParams();
        params.append('reportId', report._id);
        
        window.open(`${axiosInstance.defaults.baseURL}/class-report/export/excel?${params}`, '_blank');
    };

    const downloadSinglePDF = (report) => {
        const params = new URLSearchParams();
        params.append('reportId', report._id);
        
        window.open(`${axiosInstance.defaults.baseURL}/class-report/export/pdf?${params}`, '_blank');
    };

    const downloadBulkExcel = () => {
        const params = new URLSearchParams();
        if (filters.classId) params.append('classId', filters.classId);
        if (filters.fromDate) params.append('startDate', filters.fromDate);
        if (filters.toDate) params.append('endDate', filters.toDate);
        
        window.open(`${axiosInstance.defaults.baseURL}/class-report/export/excel?${params}`, '_blank');
    };

    const downloadBulkPDF = () => {
        const params = new URLSearchParams();
        if (filters.classId) params.append('classId', filters.classId);
        if (filters.fromDate) params.append('startDate', filters.fromDate);
        if (filters.toDate) params.append('endDate', filters.toDate);
        
        window.open(`${axiosInstance.defaults.baseURL}/class-report/export/pdf?${params}`, '_blank');
    };

    const handleBulkDownload = async () => {
        if (reports.length === 0) {
            showSweetAlert('warning', 'ডাউনলোড করার জন্য কোন রিপোর্ট নেই');
            return;
        }

        const result = await Swal.fire({
            title: 'বাল্ক ডাউনলোড',
            text: `আপনি ${reports.length}টি রিপোর্ট কী ফরম্যাটে ডাউনলোড করতে চান?`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Excel ডাউনলোড',
            cancelButtonText: 'PDF ডাউনলোড',
            showDenyButton: true,
            denyButtonText: 'উভয় ডাউনলোড',
            reverseButtons: true
        });

        if (result.isConfirmed) {
            downloadBulkExcel();
        } else if (result.isDenied) {
            downloadBulkExcel();
            setTimeout(() => downloadBulkPDF(), 1000);
        } else if (result.dismiss === Swal.DismissReason.cancel) {
            downloadBulkPDF();
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-BD', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
    };

    // যদি showCreateForm true হয়, তাহলে ClassReport কম্পোনেন্ট রেন্ডার করুন
    if (showCreateForm) {
        return (
            <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
                <div className="max-w-full mx-auto">
                    {/* Back Button */}
                    <div className="mb-6">
                        <button
                            onClick={() => setShowCreateForm(false)}
                            className="inline-flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                        >
                            <FaArrowLeft className="text-sm" />
                            রিপোর্ট লিস্টে ফিরে যান
                        </button>
                    </div>
                    
                    {/* ClassReport Component */}
                    <ClassReport />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
            <div className="max-w-full mx-auto">
                
                {/* Header Section */}
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6 gap-4">
                    <div className="flex-1">
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
                            ক্লাস রিপোর্ট লিস্ট
                        </h1>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <FaCalendarAlt className="text-blue-500" />
                            <span>{getBangladeshTime()}</span>
                        </div>
                    </div>
                    
                    {/* নতুন রিপোর্ট বাটন - Link এর পরিবর্তে onClick ব্যবহার করুন */}
                    <MainButton
                        onClick={() => setShowCreateForm(true)}
                    >
                        <FaPlus className="text-sm mr-2" />
                        নতুন রিপোর্ট
                    </MainButton>
                </div>

                {/* Filter Section */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 mb-6">
                    
                    {/* First Row - Filters */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-4">
                        
                        {/* Class */}
                        <div className="lg:col-span-2">
                            <label className="block text-gray-700 font-medium mb-2 text-sm">
                                ক্লাস
                            </label>
                            <select
                                name="classId"
                                value={filters.classId}
                                onChange={handleFilterChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9] transition-colors"
                            >
                                <option value="">সকল ক্লাস</option>
                                {classes.map(classItem => (
                                    <option key={classItem._id} value={classItem._id}>
                                        {classItem.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Subject */}
                        <div className="lg:col-span-2">
                            <label className="block text-gray-700 font-medium mb-2 text-sm">
                                বিষয়
                            </label>
                            <select
                                name="subjectId"
                                value={filters.subjectId}
                                onChange={handleFilterChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9] transition-colors"
                            >
                                <option value="">সকল বিষয়</option>
                                {subjects.map(subject => (
                                    <option key={subject._id} value={subject._id}>
                                        {subject.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Search by ID */}
                        <div>
                            <label className="block text-gray-700 font-medium mb-2 text-sm">
                                আইডি দ্বারা খুঁজুন
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    name="studentId"
                                    value={filters.studentId}
                                    onChange={handleFilterChange}
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9] focus:border-transparent transition-colors"
                                    placeholder="শিক্ষার্থী আইডি"
                                />
                                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            </div>
                        </div>

                        {/* Search by Name */}
                        <div>
                            <label className="block text-gray-700 font-medium mb-2 text-sm">
                                নাম দ্বারা খুঁজুন
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    name="studentName"
                                    value={filters.studentName}
                                    onChange={handleFilterChange}
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9] focus:border-transparent transition-colors"
                                    placeholder="শিক্ষার্থীর নাম"
                                />
                                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            </div>
                        </div>

                        {/* From Date */}
                        <div>
                            <label className="block text-gray-700 font-medium mb-2 text-sm">
                                থেকে তারিখ
                            </label>
                            <input
                                type="date"
                                name="fromDate"
                                value={filters.fromDate}
                                onChange={handleFilterChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9] transition-colors"
                            />
                        </div>

                        {/* To Date */}
                        <div>
                            <label className="block text-gray-700 font-medium mb-2 text-sm">
                                পর্যন্ত তারিখ
                            </label>
                            <input
                                type="date"
                                name="toDate"
                                value={filters.toDate}
                                onChange={handleFilterChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9] transition-colors"
                            />
                        </div>
                    </div>

                    {/* Filter Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4">
                        <MainButton
                            onClick={handleApplyFilter}
                            className='rounded-md'
                        >
                            <FaFilter className="text-sm mr-2" />
                            ফিল্টার করুন
                        </MainButton>
                        <button
                            onClick={handleClearFilter}
                            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            ফিল্টার সরান
                        </button>
                        
                        {/* Bulk Download Button */}
                        <MainButton
                            onClick={handleBulkDownload}
                            disabled={reports.length === 0}
                            className="rounded-md"
                        >
                            <FaDownload className="text-sm mr-2" />
                            সব রিপোর্ট ডাউনলোড ({reports.length})
                        </MainButton>
                    </div>
                </div>

                {/* Reports Table */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200">
                    {loading ? (
                        <div className="p-8 text-center">
                            <Loader />
                            <p className="text-gray-600 mt-2 text-sm">রিপোর্ট লোড হচ্ছে...</p>
                        </div>
                    ) : reports.length === 0 ? (
                        <div className="p-8 text-center">
                            <div className="text-4xl text-gray-400 mb-3">📊</div>
                            <h3 className="text-lg font-semibold text-gray-800 mb-2">
                                কোন রিপোর্ট পাওয়া যায়নি
                            </h3>
                            <p className="text-gray-600 text-sm mb-4">
                                অনুগ্রহ করে ফিল্টার প্রয়োগ করুন অথবা নতুন রিপোর্ট তৈরি করুন
                            </p>
                            <button
                                onClick={() => setShowCreateForm(true)}
                                className="inline-flex items-center gap-2 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
                            >
                                <FaPlus className="text-sm" />
                                নতুন রিপোর্ট তৈরি করুন
                            </button>
                        </div>
                    ) : (
                        <>
                            <div className="p-4 border-b border-gray-200">
                                <h2 className="text-lg font-semibold text-gray-800">
                                    রিপোর্ট লিস্ট ({reports.length}টি রিপোর্ট)
                                </h2>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50 border-b border-gray-200">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                শ্রেণি
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                তারিখ
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                অ্যাকশন
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {reports.map((report) => (
                                            <tr key={report._id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-4 py-3">
                                                    <div>
                                                        <p className="font-medium text-gray-800 text-sm">
                                                            {report.className}
                                                        </p>
                                                        <p className="text-xs text-gray-500">
                                                            {report.studentName} - {report.studentId}
                                                        </p>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className="text-gray-600 text-sm">
                                                        {formatDate(report.date)}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={() => handleDownload(report)}
                                                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                                            title="ডাউনলোড করুন"
                                                        >
                                                            <FaDownload className="text-sm" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteReport(report._id)}
                                                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                            title="ডিলিট করুন"
                                                        >
                                                            <FaTrash className="text-sm" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination can be added here if needed */}
                            <div className="p-4 border-t border-gray-200">
                                <div className="flex justify-between items-center">
                                    <div className="text-sm text-gray-600">
                                        মোট {reports.length}টি রিপোর্ট
                                    </div>
                                    {/* Add pagination buttons here if needed */}
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ClassReportList;