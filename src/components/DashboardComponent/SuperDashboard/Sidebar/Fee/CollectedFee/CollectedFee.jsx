import { useEffect, useState } from 'react';
import { FaArrowLeft, FaCalendarAlt, FaIdCard, FaMoneyBillWave, FaPhone, FaPrint, FaSearch, FaUser } from 'react-icons/fa';
import Swal from 'sweetalert2';
import axiosInstance from '../../../../../../hooks/axiosInstance/axiosInstance';

const CollectedFee = ({ onBack }) => {
    const [searchData, setSearchData] = useState({
        month: '',
        year: new Date().getFullYear(),
        feeTypeId: '',
        classId: '',
        sessionId: '',
        memberId: '',
        collectedBy: ''
    });
    const [loading, setLoading] = useState(false);
    const [searching, setSearching] = useState(false);
    
    // Dropdown data
    const [classes, setClasses] = useState([]);
    const [sessions, setSessions] = useState([]);
    const [feeTypes, setFeeTypes] = useState([]);
    const [users, setUsers] = useState([]);
    
    // Summary data
    const [summary, setSummary] = useState({
        paidStudents: 0,
        totalCollection: 0
    });
    
    // Search results
    const [collectedFees, setCollectedFees] = useState([]);

    // Months array
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

    // Years array (last 5 years)
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

    useEffect(() => {
        fetchDropdownData();
        fetchCollectedFeeData();
    }, []);

    const fetchDropdownData = async () => {
        try {
            // Fetch classes
            const classesResponse = await axiosInstance.get('/class');
            if (classesResponse.data.success) {
                setClasses(classesResponse.data.data || []);
            }

            // Fetch sessions
            const sessionsResponse = await axiosInstance.get('/sessions');
            if (sessionsResponse.data.success) {
                setSessions(sessionsResponse.data.data || []);
            }

            // Fetch fee types
            const feeTypesResponse = await axiosInstance.get('/fee-types');
            if (feeTypesResponse.data.success) {
                setFeeTypes(feeTypesResponse.data.data || []);
            }

            // Fetch users (for member and collected by)
            const usersResponse = await axiosInstance.get('/users');
            if (usersResponse.data.success) {
                setUsers(usersResponse.data.data || []);
            }
        } catch (error) {
            console.error('Error fetching dropdown data:', error);
            showSweetAlert('error', 'ডেটা লোড করতে সমস্যা হয়েছে');
        }
    };

    const fetchCollectedFeeData = async (filters = {}) => {
        try {
            setLoading(true);
            
            // Build query parameters
            const params = new URLSearchParams();
            
            if (filters.month) params.append('month', filters.month);
            if (filters.year) params.append('year', filters.year);
            if (filters.feeTypeId) params.append('feeTypeId', filters.feeTypeId);
            if (filters.classId) params.append('classId', filters.classId);
            if (filters.sessionId) params.append('sessionId', filters.sessionId);
            if (filters.memberId) params.append('memberId', filters.memberId);
            if (filters.collectedBy) params.append('collectedBy', filters.collectedBy);

            // Fetch collected fees from API
            const response = await axiosInstance.get(`/fee-payments?${params.toString()}`);
            
            if (response.data.success) {
                const feeData = response.data.data || [];
                setCollectedFees(feeData);
                calculateSummary(feeData);
            } else {
                setCollectedFees([]);
                setSummary({ paidStudents: 0, totalCollection: 0 });
            }
        } catch (error) {
            console.error('Error fetching collected fee data:', error);
            showSweetAlert('error', 'সংগৃহীত ফি ডেটা লোড করতে সমস্যা হয়েছে');
            setCollectedFees([]);
            setSummary({ paidStudents: 0, totalCollection: 0 });
        } finally {
            setLoading(false);
        }
    };

    const calculateSummary = (feeData) => {
        const paidStudents = new Set(feeData.map(fee => fee.studentId)).size;
        const totalCollection = feeData.reduce((sum, fee) => sum + (fee.amount || 0), 0);

        setSummary({
            paidStudents,
            totalCollection
        });
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
        setSearchData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        setSearching(true);
        
        try {
            await fetchCollectedFeeData(searchData);
            
            if (collectedFees.length === 0) {
                showSweetAlert('info', 'কোন সংগৃহীত ফি পাওয়া যায়নি');
            } else {
                showSweetAlert('success', `${collectedFees.length} টি সংগৃহীত ফি পাওয়া গেছে`);
            }
        } catch (error) {
            console.error('Error searching collected fees:', error);
            showSweetAlert('error', 'সংগৃহীত ফি খুঁজে পেতে সমস্যা হয়েছে');
        } finally {
            setSearching(false);
        }
    };

    const handlePrintFeeList = () => {
        if (collectedFees.length === 0) {
            showSweetAlert('warning', 'প্রিন্ট করার জন্য কোন ডেটা নেই');
            return;
        }
        
        // Create printable content
        const printContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>সংগৃহীত ফি রিপোর্ট</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; }
                    .header { text-align: center; margin-bottom: 30px; }
                    .header h1 { color: #2c5aa0; margin: 0; }
                    .summary { margin-bottom: 20px; padding: 15px; background: #f8f9fa; border-radius: 5px; }
                    .summary-item { display: inline-block; margin-right: 30px; }
                    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                    th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
                    th { background-color: #f8f9fa; }
                    .total-row { background-color: #e9ecef; font-weight: bold; }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>সংগৃহীত ফি রিপোর্ট</h1>
                    <p>প্রস্তুতকের তারিখ: ${new Date().toLocaleDateString('bn-BD')}</p>
                </div>
                
                <div class="summary">
                    <div class="summary-item">
                        <strong>Paid Students:</strong> ${summary.paidStudents}
                    </div>
                    <div class="summary-item">
                        <strong>Total Collection:</strong> ৳${formatCurrency(summary.totalCollection)}
                    </div>
                </div>
                
                <table>
                    <thead>
                        <tr>
                            <th>আইডি</th>
                            <th>নাম</th>
                            <th>ক্লাস</th>
                            <th>ব্যাচ</th>
                            <th>প্যারেন্ট মোবাইল</th>
                            <th>ফি</th>
                            <th>Fee Types</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${collectedFees.map(fee => `
                            <tr>
                                <td>${fee.student?.studentId || fee.studentId || 'N/A'}</td>
                                <td>${fee.student?.name || fee.studentName || 'N/A'}</td>
                                <td>${fee.student?.class?.name || fee.className || 'N/A'}</td>
                                <td>${fee.student?.batch?.name || fee.batchName || 'N/A'}</td>
                                <td>${fee.student?.guardianMobile || fee.student?.mobile || 'N/A'}</td>
                                <td>৳${formatCurrency(fee.amount)}</td>
                                <td>${fee.feeType?.name || fee.feeTypeName || 'N/A'}</td>
                            </tr>
                        `).join('')}
                        <tr class="total-row">
                            <td colspan="5" style="text-align: right;"><strong>মোট:</strong></td>
                            <td><strong>৳${formatCurrency(summary.totalCollection)}</strong></td>
                            <td></td>
                        </tr>
                    </tbody>
                </table>
            </body>
            </html>
        `;

        const printWindow = window.open('', '_blank');
        printWindow.document.write(printContent);
        printWindow.document.close();
        printWindow.print();
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('bn-BD', {
            minimumFractionDigits: 2
        }).format(amount || 0);
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('bn-BD');
    };

    // Reset filters
    const handleReset = () => {
        setSearchData({
            month: '',
            year: new Date().getFullYear(),
            feeTypeId: '',
            classId: '',
            sessionId: '',
            memberId: '',
            collectedBy: ''
        });
        fetchCollectedFeeData();
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
                            সংগৃহীত বেতন
                        </h1>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="p-4 sm:p-6 lg:p-8">
                <div className="max-w-full mx-auto">
                    {/* Summary Section */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                        {/* Main Title */}
                        <div className="md:col-span-3">
                            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
                                <h2 className="text-2xl font-bold text-blue-800 text-center">
                                    সংগৃহীত বেতন রিপোর্ট
                                </h2>
                            </div>
                        </div>

                        {/* Paid Students */}
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Paid Student</p>
                                    <p className="text-2xl font-bold text-gray-800">{summary.paidStudents}</p>
                                </div>
                                <div className="p-3 bg-green-100 rounded-lg">
                                    <FaUser className="text-green-600 text-xl" />
                                </div>
                            </div>
                            <p className="text-sm text-green-600 mt-2">
                                শিক্ষার্থী ফি পরিশোধ করেছেন
                            </p>
                        </div>

                        {/* Total Collection */}
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Total Collection</p>
                                    <p className="text-2xl font-bold text-gray-800">৳{formatCurrency(summary.totalCollection)}</p>
                                </div>
                                <div className="p-3 bg-purple-100 rounded-lg">
                                    <FaMoneyBillWave className="text-purple-600 text-xl" />
                                </div>
                            </div>
                            <p className="text-sm text-purple-600 mt-2">
                                মোট সংগৃহীত অর্থ
                            </p>
                        </div>

                        {/* Collection Rate */}
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Average Collection</p>
                                    <p className="text-2xl font-bold text-gray-800">
                                        ৳{formatCurrency(summary.paidStudents > 0 ? summary.totalCollection / summary.paidStudents : 0)}
                                    </p>
                                </div>
                                <div className="p-3 bg-orange-100 rounded-lg">
                                    <FaCalendarAlt className="text-orange-600 text-xl" />
                                </div>
                            </div>
                            <p className="text-sm text-orange-600 mt-2">
                                প্রতি শিক্ষার্থীর গড়
                            </p>
                        </div>
                    </div>

                    {/* Search Section */}
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 mb-6">
                        <h2 className="text-lg font-semibold text-gray-800 mb-4">
                            ফিল্টার প্রয়োগ করুন
                        </h2>
                        
                        <form onSubmit={handleSearch} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {/* Month */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        মাস
                                    </label>
                                    <select
                                        name="month"
                                        value={searchData.month}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                        disabled={searching}
                                    >
                                        <option value="">সকল মাস</option>
                                        {months.map((month) => (
                                            <option key={month.value} value={month.value}>
                                                {month.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Year */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        বছর
                                    </label>
                                    <select
                                        name="year"
                                        value={searchData.year}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                        disabled={searching}
                                    >
                                        {years.map((year) => (
                                            <option key={year} value={year}>
                                                {year}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Fee Types */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Fee Types
                                    </label>
                                    <select
                                        name="feeTypeId"
                                        value={searchData.feeTypeId}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                        disabled={searching}
                                    >
                                        <option value="">সকল ফি টাইপ</option>
                                        {feeTypes.map((feeType) => (
                                            <option key={feeType._id} value={feeType._id}>
                                                {feeType.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                {/* Class */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        ক্লাস
                                    </label>
                                    <select
                                        name="classId"
                                        value={searchData.classId}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                        disabled={searching}
                                    >
                                        <option value="">সকল ক্লাস</option>
                                        {classes.map((classItem) => (
                                            <option key={classItem._id} value={classItem._id}>
                                                {classItem.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Session */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        সেশন
                                    </label>
                                    <select
                                        name="sessionId"
                                        value={searchData.sessionId}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                        disabled={searching}
                                    >
                                        <option value="">সকল সেশন</option>
                                        {sessions.map((session) => (
                                            <option key={session._id} value={session._id}>
                                                {session.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* সদস্য */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        সদস্য
                                    </label>
                                    <select
                                        name="memberId"
                                        value={searchData.memberId}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                        disabled={searching}
                                    >
                                        <option value="">সকল সদস্য</option>
                                        {users.map((user) => (
                                            <option key={user._id} value={user._id}>
                                                {user.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Collected By */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Collected By
                                    </label>
                                    <select
                                        name="collectedBy"
                                        value={searchData.collectedBy}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                        disabled={searching}
                                    >
                                        <option value="">সকল সংগ্রহকারী</option>
                                        {users.map((user) => (
                                            <option key={user._id} value={user._id}>
                                                {user.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-4">
                                <div className="flex gap-3">
                                    <button
                                        type="button"
                                        onClick={handleReset}
                                        className="inline-flex items-center gap-2 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors font-medium"
                                    >
                                        রিসেট
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handlePrintFeeList}
                                        disabled={collectedFees.length === 0}
                                        className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <FaPrint className="text-sm" />
                                        Print Fee List
                                    </button>
                                </div>

                                <button
                                    type="submit"
                                    disabled={searching}
                                    className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {searching ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                            অনুসন্ধান হচ্ছে...
                                        </>
                                    ) : (
                                        <>
                                            <FaSearch className="text-sm" />
                                            অনুসন্ধান
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Results Section */}
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                            <h2 className="text-lg font-semibold text-gray-800">
                                সংগৃহীত ফির তালিকা ({collectedFees.length} টি)
                            </h2>
                            <div className="text-sm text-gray-600">
                                মোট সংগ্রহ: ৳{formatCurrency(summary.totalCollection)}
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            আইডি
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            নাম
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            ক্লাস
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            ব্যাচ
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            প্যারেন্ট মোবাইল
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            ফি
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Fee Type
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            তারিখ
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {collectedFees.map((fee) => (
                                        <tr key={fee._id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <FaIdCard className="text-gray-400 text-sm" />
                                                    <span className="font-medium text-gray-800">
                                                        {fee.student?.studentId || fee.studentId || 'N/A'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <FaUser className="text-gray-400 text-sm" />
                                                    <span className="font-medium text-gray-800">
                                                        {fee.student?.name || fee.studentName || 'N/A'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="inline-flex px-2 py-1 text-xs font-semibold bg-blue-100 text-blue-800 rounded-full">
                                                    {fee.student?.class?.name || fee.className || 'N/A'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-sm text-gray-800">
                                                    {fee.student?.batch?.name || fee.batchName || 'N/A'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <FaPhone className="text-gray-400 text-sm" />
                                                    <span className="text-sm text-gray-800">
                                                        {fee.student?.guardianMobile || fee.student?.mobile || 'N/A'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="font-semibold text-green-600">
                                                    ৳{formatCurrency(fee.amount)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="inline-flex px-2 py-1 text-xs font-semibold bg-gray-100 text-gray-800 rounded-full">
                                                    {fee.feeType?.name || fee.feeTypeName || 'N/A'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <FaCalendarAlt className="text-gray-400 text-sm" />
                                                    <span className="text-sm text-gray-800">
                                                        {formatDate(fee.paymentDate || fee.createdAt)}
                                                    </span>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* No Results Message */}
                        {collectedFees.length === 0 && !loading && (
                            <div className="text-center py-12">
                                <div className="text-4xl text-gray-400 mb-3">💰</div>
                                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                                    কোন সংগৃহীত ফি পাওয়া যায়নি
                                </h3>
                                <p className="text-gray-600 text-sm">
                                    অনুসন্ধান ক্রাইটেরিয়া পরিবর্তন করে আবার চেষ্টা করুন
                                </p>
                            </div>
                        )}

                        {/* Loading State */}
                        {loading && (
                            <div className="text-center py-12">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                                <p className="text-gray-600 mt-3">ডেটা লোড হচ্ছে...</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CollectedFee;