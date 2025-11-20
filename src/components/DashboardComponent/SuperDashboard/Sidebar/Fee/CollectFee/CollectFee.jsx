import { useEffect, useState } from 'react';
import { FaArrowLeft, FaCalendarAlt, FaIdCard, FaMoneyBillWave, FaSearch, FaUser } from 'react-icons/fa';
import Swal from 'sweetalert2';
import axiosInstance from '../../../../../../hooks/axiosInstance/axiosInstance';
import MainButton from '../../../../../sharedItems/Mainbutton/Mainbutton';

const CollectFee = ({ onBack }) => {
    const [searchData, setSearchData] = useState({
        studentId: '',
        classId: '',
        className: '',
        sessionId: '',
        sessionName: ''
    });
    const [loading, setLoading] = useState(false);
    const [searching, setSearching] = useState(false);
    const [errors, setErrors] = useState({});
    
    // Dropdown data
    const [classes, setClasses] = useState([]);
    const [sessions, setSessions] = useState([]);
    
    // Search results
    const [studentInfo, setStudentInfo] = useState(null);
    const [feeDetails, setFeeDetails] = useState([]);
    const [paymentHistory, setPaymentHistory] = useState([]);
    const [studentsList, setStudentsList] = useState([]);

    useEffect(() => {
        fetchDropdownData();
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
        } catch (error) {
            console.error('Error fetching dropdown data:', error);
            showSweetAlert('error', 'ডেটা লোড করতে সমস্যা হয়েছে');
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setSearchData(prev => ({
            ...prev,
            [name]: value
        }));
        
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }

        // Update names when IDs change
        if (name === 'classId') {
            const selectedClass = classes.find(c => c._id === value);
            setSearchData(prev => ({
                ...prev,
                className: selectedClass ? selectedClass.name : ''
            }));
        }

        if (name === 'sessionId') {
            const selectedSession = sessions.find(s => s._id === value);
            setSearchData(prev => ({
                ...prev,
                sessionName: selectedSession ? selectedSession.name : ''
            }));
        }
    };

    const validateSearch = () => {
        const newErrors = {};
        
        if (!searchData.studentId && !searchData.classId && !searchData.sessionId) {
            newErrors.studentId = 'অনুগ্রহ করে শিক্ষার্থীর আইডি অথবা ক্লাস এবং সেশন নির্বাচন করুন';
        }

        if (searchData.classId && !searchData.sessionId) {
            newErrors.sessionId = 'ক্লাস নির্বাচন করলে সেশনও নির্বাচন করুন';
        }

        if (searchData.sessionId && !searchData.classId) {
            newErrors.classId = 'সেশন নির্বাচন করলে ক্লাসও নির্বাচন করুন';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
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

    const handleSearch = async (e) => {
        e.preventDefault();
        
        if (!validateSearch()) {
            return;
        }

        setSearching(true);
        try {
            let queryParams = {};
            
            if (searchData.studentId) {
                // Search by student ID
                queryParams.search = searchData.studentId;
            } else if (searchData.classId && searchData.sessionId) {
                // Search by class and session
                queryParams.classId = searchData.classId;
                queryParams.sessionId = searchData.sessionId;
            }

            const response = await axiosInstance.get('/students', { params: queryParams });

            if (response.data.success && response.data.data.length > 0) {
                const students = response.data.data;
                
                if (searchData.studentId) {
                    // If searching by student ID, show single student
                    const student = students[0];
                    setStudentInfo({
                        _id: student._id,
                        studentId: student.studentId,
                        name: student.name,
                        className: student.class?.name || 'N/A',
                        sessionName: student.session?.name || 'N/A',
                        classRoll: student.classRoll,
                        mobile: student.mobile,
                        fatherName: student.fatherName
                    });
                    
                    // Generate mock fee details based on student data
                    const mockFeeDetails = generateMockFeeDetails(student);
                    setFeeDetails(mockFeeDetails);
                    
                    // Generate mock payment history
                    const mockPaymentHistory = generateMockPaymentHistory(student);
                    setPaymentHistory(mockPaymentHistory);
                    
                    setStudentsList([]); // Clear students list for single student view
                } else {
                    // If searching by class and session, show list of students
                    setStudentsList(students);
                    setStudentInfo(null);
                    setFeeDetails([]);
                    setPaymentHistory([]);
                }
                
                showSweetAlert('success', 'শিক্ষার্থীর তথ্য পাওয়া গেছে');
            } else {
                setStudentInfo(null);
                setFeeDetails([]);
                setPaymentHistory([]);
                setStudentsList([]);
                showSweetAlert('info', 'কোন শিক্ষার্থী পাওয়া যায়নি');
            }
        } catch (error) {
            console.error('Error searching student:', error);
            const errorMessage = error.response?.data?.message || 'শিক্ষার্থী খুঁজে পেতে সমস্যা হয়েছে';
            showSweetAlert('error', errorMessage);
            setStudentInfo(null);
            setFeeDetails([]);
            setPaymentHistory([]);
            setStudentsList([]);
        } finally {
            setSearching(false);
        }
    };

    // Generate mock fee details based on student data
    const generateMockFeeDetails = (student) => {
        const feeTypes = [
            {
                feeTypeId: '1',
                feeTypeName: 'Admission Fee',
                totalAmount: student.admissionFee || 0,
                paidAmount: Math.min(student.paidFees || 0, student.admissionFee || 0),
                dueAmount: Math.max((student.admissionFee || 0) - (student.paidFees || 0), 0),
                dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                isOverdue: false
            },
            {
                feeTypeId: '2',
                feeTypeName: 'Monthly Fee',
                totalAmount: student.monthlyFee || 0,
                paidAmount: Math.min(student.paidFees || 0, student.monthlyFee || 0),
                dueAmount: Math.max((student.monthlyFee || 0) - (student.paidFees || 0), 0),
                dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
                isOverdue: false
            },
            {
                feeTypeId: '3',
                feeTypeName: 'Session Fee',
                totalAmount: student.sessionFee || 0,
                paidAmount: Math.min(student.paidFees || 0, student.sessionFee || 0),
                dueAmount: Math.max((student.sessionFee || 0) - (student.paidFees || 0), 0),
                dueDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
                isOverdue: false
            }
        ];

        return feeTypes.filter(fee => fee.totalAmount > 0);
    };

    // Generate mock payment history
    const generateMockPaymentHistory = (student) => {
        return [
            {
                paymentDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
                feeTypeName: 'Admission Fee',
                amount: 1000,
                paymentMethod: 'Cash',
                referenceNo: `REF-${Date.now() - 7}`
            },
            {
                paymentDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
                feeTypeName: 'Monthly Fee',
                amount: 500,
                paymentMethod: 'Bank',
                referenceNo: `REF-${Date.now() - 14}`
            }
        ];
    };

    const handleCollectFee = async (feeType) => {
        try {
            const result = await Swal.fire({
                title: 'ফি সংগ্রহ নিশ্চিত করুন',
                text: `আপনি কি ${feeType.feeTypeName} এর ফি সংগ্রহ করতে চান?`,
                icon: 'question',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'হ্যাঁ, সংগ্রহ করুন',
                cancelButtonText: 'বাতিল করুন'
            });

            if (result.isConfirmed) {
                setLoading(true);
                
                // Simulate fee collection API call
                const response = await axiosInstance.post('/collect-fee/collect', {
                    studentId: studentInfo._id,
                    feeTypeId: feeType.feeTypeId,
                    amount: feeType.dueAmount
                });

                if (response.data.success) {
                    showSweetAlert('success', 'ফি সফলভাবে সংগ্রহ হয়েছে');
                    // Refresh data
                    handleSearch(e);
                }
            }
        } catch (error) {
            console.error('Error collecting fee:', error);
            showSweetAlert('error', 'ফি সংগ্রহ করতে সমস্যা হয়েছে');
        } finally {
            setLoading(false);
        }
    };

    const handleStudentSelect = (student) => {
        setStudentInfo({
            _id: student._id,
            studentId: student.studentId,
            name: student.name,
            className: student.class?.name || 'N/A',
            sessionName: student.session?.name || 'N/A',
            classRoll: student.classRoll,
            mobile: student.mobile,
            fatherName: student.fatherName
        });
        
        // Generate mock fee details based on selected student
        const mockFeeDetails = generateMockFeeDetails(student);
        setFeeDetails(mockFeeDetails);
        
        // Generate mock payment history
        const mockPaymentHistory = generateMockPaymentHistory(student);
        setPaymentHistory(mockPaymentHistory);
        
        setStudentsList([]); // Clear students list
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('bn-BD');
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('bn-BD', {
            minimumFractionDigits: 2
        }).format(amount);
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
                            ফি সংগ্রহ
                        </h1>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="p-4 sm:p-6 lg:p-8">
                <div className="max-w-full mx-auto">
                    {/* Search Section */}
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 mb-6">
                        <h2 className="text-lg font-semibold text-gray-800 mb-4">
                            শিক্ষার্থী খুঁজুন
                        </h2>
                        
                        <form onSubmit={handleSearch} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {/* Student ID */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        শিক্ষার্থীর আইডি
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            name="studentId"
                                            value={searchData.studentId}
                                            onChange={handleChange}
                                            placeholder="স্টুডেন্ট আইডি লিখুন"
                                            className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9] focus:border-transparent transition-all"
                                            disabled={searching}
                                        />
                                        <FaIdCard className="absolute left-3 top-3.5 text-gray-400" />
                                    </div>
                                </div>

                                {/* Class */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        ক্লাস
                                    </label>
                                    <select
                                        name="classId"
                                        value={searchData.classId}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9] focus:border-transparent transition-all"
                                        disabled={searching}
                                    >
                                        <option value="">ক্লাস নির্বাচন করুন</option>
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
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9] focus:border-transparent transition-all"
                                        disabled={searching}
                                    >
                                        <option value="">সেশন নির্বাচন করুন</option>
                                        {sessions.map((session) => (
                                            <option key={session._id} value={session._id}>
                                                {session.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {errors.studentId && (
                                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                                    <p className="text-red-600 text-sm">{errors.studentId}</p>
                                </div>
                            )}

                            <div className="flex justify-end">
                                <MainButton
                                    type="submit"
                                    disabled={searching}
                                >
                                    {searching ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                            অনুসন্ধান হচ্ছে...
                                        </>
                                    ) : (
                                        <>
                                            <FaSearch className="text-sm mr-2" />
                                            অনুসন্ধান
                                        </>
                                    )}
                                </MainButton>
                            </div>
                        </form>
                    </div>

                    {/* Students List Section (when searching by class/session) */}
                    {studentsList.length > 0 && (
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden mb-6">
                            <div className="px-6 py-4 border-b border-gray-200">
                                <h2 className="text-lg font-semibold text-gray-800">
                                    শিক্ষার্থী তালিকা ({studentsList.length} জন)
                                </h2>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50 border-b border-gray-200">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                শিক্ষার্থী আইডি
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                নাম
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                ক্লাস রোল
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                মোবাইল
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                কর্ম
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {studentsList.map((student) => (
                                            <tr key={student._id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <FaIdCard className="text-gray-400 text-sm" />
                                                        <span className="font-medium text-gray-800">
                                                            {student.studentId}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="font-medium text-gray-800">
                                                        {student.name}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="text-sm text-gray-600">
                                                        {student.classRoll}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="text-sm text-gray-600">
                                                        {student.mobile || 'N/A'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <button
                                                        onClick={() => handleStudentSelect(student)}
                                                        className="inline-flex items-center gap-1 px-3 py-2 text-xs font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                                    >
                                                        <FaMoneyBillWave className="text-xs" />
                                                        ফি দেখুন
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Results Section */}
                    {studentInfo && (
                        <div className="space-y-6">
                            {/* Student Information */}
                            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                                <h2 className="text-lg font-semibold text-gray-800 mb-4">
                                    শিক্ষার্থীর তথ্য
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                    <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                                        <FaUser className="text-blue-600 text-lg" />
                                        <div>
                                            <p className="text-sm text-gray-600">নাম</p>
                                            <p className="font-semibold text-gray-800">{studentInfo.name}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                                        <FaIdCard className="text-green-600 text-lg" />
                                        <div>
                                            <p className="text-sm text-gray-600">আইডি</p>
                                            <p className="font-semibold text-gray-800">{studentInfo.studentId}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                                        <FaUser className="text-purple-600 text-lg" />
                                        <div>
                                            <p className="text-sm text-gray-600">ক্লাস</p>
                                            <p className="font-semibold text-gray-800">{studentInfo.className}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
                                        <FaCalendarAlt className="text-orange-600 text-lg" />
                                        <div>
                                            <p className="text-sm text-gray-600">সেশন</p>
                                            <p className="font-semibold text-gray-800">{studentInfo.sessionName}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Fee Details */}
                            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                                <div className="px-6 py-4 border-b border-gray-200">
                                    <h2 className="text-lg font-semibold text-gray-800">
                                        ফি বিবরণ
                                    </h2>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-gray-50 border-b border-gray-200">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    ফি টাইপ
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    মোট ফি
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    জমা হয়েছে
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    বকেয়া
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    মেয়াদ
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    কর্ম
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200">
                                            {feeDetails.map((fee, index) => (
                                                <tr key={index} className="hover:bg-gray-50 transition-colors">
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-2">
                                                            <FaMoneyBillWave className="text-gray-400 text-sm" />
                                                            <span className="font-medium text-gray-800">
                                                                {fee.feeTypeName}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className="font-semibold text-gray-800">
                                                            ৳{formatCurrency(fee.totalAmount)}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className="text-green-600 font-semibold">
                                                            ৳{formatCurrency(fee.paidAmount)}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className={`font-semibold ${
                                                            fee.dueAmount > 0 ? 'text-red-600' : 'text-green-600'
                                                        }`}>
                                                            ৳{formatCurrency(fee.dueAmount)}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                                            fee.isOverdue ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                                                        }`}>
                                                            {fee.dueDate ? formatDate(fee.dueDate) : 'N/A'}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <button
                                                            onClick={() => handleCollectFee(fee)}
                                                            disabled={fee.dueAmount <= 0 || loading}
                                                            className={`inline-flex items-center gap-1 px-3 py-2 text-xs font-medium rounded-lg transition-colors ${
                                                                fee.dueAmount > 0 
                                                                    ? 'bg-blue-600 text-white hover:bg-blue-700' 
                                                                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                                            }`}
                                                        >
                                                            <FaMoneyBillWave className="text-xs" />
                                                            সংগ্রহ করুন
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Payment History */}
                            {paymentHistory.length > 0 && (
                                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                                    <div className="px-6 py-4 border-b border-gray-200">
                                        <h2 className="text-lg font-semibold text-gray-800">
                                            পেমেন্ট হিস্ট্রি
                                        </h2>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead className="bg-gray-50 border-b border-gray-200">
                                                <tr>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        তারিখ
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        ফি টাইপ
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        পরিমাণ
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        পেমেন্ট মেথড
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        রেফারেন্স
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-200">
                                                {paymentHistory.map((payment, index) => (
                                                    <tr key={index} className="hover:bg-gray-50 transition-colors">
                                                        <td className="px-6 py-4">
                                                            <div className="flex items-center gap-2">
                                                                <FaCalendarAlt className="text-gray-400 text-sm" />
                                                                <span className="text-sm text-gray-800">
                                                                    {formatDate(payment.paymentDate)}
                                                                </span>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <span className="text-sm font-medium text-gray-800">
                                                                {payment.feeTypeName}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <span className="font-semibold text-green-600">
                                                                ৳{formatCurrency(payment.amount)}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <span className="inline-flex px-2 py-1 text-xs font-semibold bg-blue-100 text-blue-800 rounded-full">
                                                                {payment.paymentMethod}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <span className="text-sm text-gray-600 font-mono">
                                                                {payment.referenceNo}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {/* No Fee Details Message */}
                            {feeDetails.length === 0 && (
                                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 text-center">
                                    <div className="text-4xl text-gray-400 mb-3">💰</div>
                                    <h3 className="text-lg font-semibold text-gray-800 mb-2">
                                        কোন ফি বিবরণ পাওয়া যায়নি
                                    </h3>
                                    <p className="text-gray-600 text-sm">
                                        এই শিক্ষার্থীর জন্য কোন ফি বরাদ্দ করা হয়নি
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* No Results Message */}
                    {!studentInfo && !studentsList.length && !searching && (
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 text-center">
                            <div className="text-4xl text-gray-400 mb-3">👨‍🎓</div>
                            <h3 className="text-lg font-semibold text-gray-800 mb-2">
                                শিক্ষার্থী খুঁজুন
                            </h3>
                            <p className="text-gray-600 text-sm">
                                অনুগ্রহ করে শিক্ষার্থীর আইডি অথবা ক্লাস এবং সেশন নির্বাচন করুন
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CollectFee;