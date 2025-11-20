import { useEffect, useState } from 'react';
import { FaIdCard, FaMoneyBillWave, FaPhone, FaPrint, FaSearch, FaUser } from 'react-icons/fa';
import Swal from 'sweetalert2';
import axiosInstance from '../../../../../../hooks/axiosInstance/axiosInstance';
import MainButton from '../../../../../sharedItems/Mainbutton/Mainbutton';

const StudentsBokeya = () => {
    const [searchData, setSearchData] = useState({
        studentId: '',
        month: '',
        year: new Date().getFullYear(),
        feeTypeId: '',
        feeStatus: '',
        classId: '',
        sessionId: ''
    });
    const [loading, setLoading] = useState(false);
    const [searching, setSearching] = useState(false);
    
    // Dropdown data
    const [classes, setClasses] = useState([]);
    const [sessions, setSessions] = useState([]);
    const [feeTypes, setFeeTypes] = useState([]);
    
    // Summary data
    const [summary, setSummary] = useState({
        totalDueStudents: 0,
        totalDueAmount: 0,
        totalUpcomingStudents: 0,
        totalUpcomingAmount: 0
    });
    
    // Search results
    const [students, setStudents] = useState([]);

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

    // Fee status options
    const feeStatusOptions = [
        { value: 'upcoming', label: 'Upcoming' },
        { value: 'current', label: 'Current' },
        { value: 'overdue', label: 'Overdue' },
        { value: 'paid', label: 'Paid' }
    ];

    useEffect(() => {
        fetchDropdownData();
        fetchDefaultData();
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
        } catch (error) {
            console.error('Error fetching dropdown data:', error);
            showSweetAlert('error', 'ডেটা লোড করতে সমস্যা হয়েছে');
        }
    };

    const fetchDefaultData = async () => {
        try {
            setLoading(true);
            // Fetch all students to calculate summary
            const response = await axiosInstance.get('/students');
            
            if (response.data.success) {
                const allStudents = response.data.data || [];
                calculateSummary(allStudents);
                setStudents(allStudents.slice(0, 10)); // Show first 10 students by default
            }
        } catch (error) {
            console.error('Error fetching default data:', error);
            showSweetAlert('error', 'ডেটা লোড করতে সমস্যা হয়েছে');
        } finally {
            setLoading(false);
        }
    };

    const calculateSummary = (studentsList) => {
        let totalDueStudents = 0;
        let totalDueAmount = 0;
        let totalUpcomingStudents = 0;
        let totalUpcomingAmount = 0;

        studentsList.forEach(student => {
            const dueFees = student.dueFees || 0;
            const totalFees = student.totalFees || 0;
            const paidFees = student.paidFees || 0;
            const upcomingFees = totalFees - paidFees - dueFees;

            if (dueFees > 0) {
                totalDueStudents++;
                totalDueAmount += dueFees;
            }

            if (upcomingFees > 0) {
                totalUpcomingStudents++;
                totalUpcomingAmount += upcomingFees;
            }
        });

        setSummary({
            totalDueStudents,
            totalDueAmount,
            totalUpcomingStudents,
            totalUpcomingAmount
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
            let queryParams = {};
            
            if (searchData.studentId) {
                queryParams.search = searchData.studentId;
            }
            if (searchData.classId) {
                queryParams.classId = searchData.classId;
            }
            if (searchData.sessionId) {
                queryParams.sessionId = searchData.sessionId;
            }

            const response = await axiosInstance.get('/students', { params: queryParams });

            if (response.data.success) {
                let filteredStudents = response.data.data || [];
                
                // Apply additional filters
                if (searchData.feeStatus) {
                    filteredStudents = filteredStudents.filter(student => {
                        const dueFees = student.dueFees || 0;
                        const totalFees = student.totalFees || 0;
                        const paidFees = student.paidFees || 0;
                        
                        switch (searchData.feeStatus) {
                            case 'upcoming':
                                return (totalFees - paidFees - dueFees) > 0;
                            case 'current':
                                return dueFees > 0 && dueFees <= (totalFees * 0.5);
                            case 'overdue':
                                return dueFees > (totalFees * 0.5);
                            case 'paid':
                                return dueFees === 0;
                            default:
                                return true;
                        }
                    });
                }

                setStudents(filteredStudents);
                calculateSummary(filteredStudents);
                
                if (filteredStudents.length === 0) {
                    showSweetAlert('info', 'কোন শিক্ষার্থী পাওয়া যায়নি');
                } else {
                    showSweetAlert('success', `${filteredStudents.length} জন শিক্ষার্থী পাওয়া গেছে`);
                }
            }
        } catch (error) {
            console.error('Error searching students:', error);
            showSweetAlert('error', 'শিক্ষার্থী খুঁজে পেতে সমস্যা হয়েছে');
            setStudents([]);
        } finally {
            setSearching(false);
        }
    };

    const handleCollectFee = async (student) => {
        try {
            const result = await Swal.fire({
                title: 'ফি সংগ্রহ নিশ্চিত করুন',
                text: `আপনি কি ${student.name} এর ফি সংগ্রহ করতে চান?`,
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
                    studentId: student._id,
                    amount: student.dueFees || 0
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

    const handlePrintDueFee = () => {
        showSweetAlert('info', 'প্রিন্ট ফিচার শীঘ্রই আসছে');
        // Implement print functionality here
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('bn-BD', {
            minimumFractionDigits: 2
        }).format(amount || 0);
    };

    const getFeeStatusBadge = (student) => {
        const dueFees = student.dueFees || 0;
        const totalFees = student.totalFees || 0;
        const paidFees = student.paidFees || 0;
        const upcomingFees = totalFees - paidFees - dueFees;

        if (dueFees === 0 && upcomingFees === 0) {
            return <span className="inline-flex px-2 py-1 text-xs font-semibold bg-green-100 text-green-800 rounded-full">Paid</span>;
        } else if (dueFees > 0 && dueFees <= (totalFees * 0.5)) {
            return <span className="inline-flex px-2 py-1 text-xs font-semibold bg-yellow-100 text-yellow-800 rounded-full">Current</span>;
        } else if (dueFees > (totalFees * 0.5)) {
            return <span className="inline-flex px-2 py-1 text-xs font-semibold bg-red-100 text-red-800 rounded-full">Overdue</span>;
        } else if (upcomingFees > 0) {
            return <span className="inline-flex px-2 py-1 text-xs font-semibold bg-blue-100 text-blue-800 rounded-full">Upcoming</span>;
        } else {
            return <span className="inline-flex px-2 py-1 text-xs font-semibold bg-gray-100 text-gray-800 rounded-full">Unknown</span>;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">

            {/* Main Content */}
            <div className="p-4 sm:p-6 lg:p-8">
                <div className="max-w-full mx-auto">
                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                        {/* Total Due Students */}
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Total Due Students</p>
                                    <p className="text-2xl font-bold text-gray-800">{summary.totalDueStudents}</p>
                                </div>
                                <div className="p-3 bg-blue-100 rounded-lg">
                                    <FaUser className="text-[#1e90c9] text-xl" />
                                </div>
                            </div>
                            <p className="text-sm text-red-600 mt-2">
                                ৳{formatCurrency(summary.totalDueAmount)} Total Due
                            </p>
                        </div>

                        {/* Total Due Amount */}
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Total Due Amount</p>
                                    <p className="text-2xl font-bold text-gray-800">৳{formatCurrency(summary.totalDueAmount)}</p>
                                </div>
                                <div className="p-3 bg-blue-100 rounded-lg">
                                    <FaMoneyBillWave className="text-[#1e90c9] text-xl" />
                                </div>
                            </div>
                            <p className="text-sm text-orange-600 mt-2">
                                {summary.totalDueStudents} Students
                            </p>
                        </div>

                        {/* Total Upcoming Students */}
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Total Upcoming Students</p>
                                    <p className="text-2xl font-bold text-gray-800">{summary.totalUpcomingStudents}</p>
                                </div>
                                <div className="p-3 bg-blue-100 rounded-lg">
                                    <FaUser className="text-[#1e90c9] text-xl" />
                                </div>
                            </div>
                            <p className="text-sm text-[#1e90c9] mt-2">
                                ৳{formatCurrency(summary.totalUpcomingAmount)} Total Upcoming
                            </p>
                        </div>

                        {/* Total Upcoming Amount */}
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Total Upcoming Amount</p>
                                    <p className="text-2xl font-bold text-gray-800">৳{formatCurrency(summary.totalUpcomingAmount)}</p>
                                </div>
                                <div className="p-3 bg-blue-100 rounded-lg">
                                    <FaMoneyBillWave className="text-[#1e90c9]0 text-xl" />
                                </div>
                            </div>
                            <p className="text-sm text-green-600 mt-2">
                                {summary.totalUpcomingStudents} Students
                            </p>
                        </div>
                    </div>

                    {/* Search Section */}
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 mb-6">
                        <h2 className="text-lg font-semibold text-gray-800 mb-4">
                            শিক্ষার্থী খুঁজুন
                        </h2>
                        
                        <form onSubmit={handleSearch} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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

                                {/* Month */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        মাস
                                    </label>
                                    <select
                                        name="month"
                                        value={searchData.month}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9] focus:border-transparent transition-all"
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
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9] focus:border-transparent transition-all"
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
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9] focus:border-transparent transition-all"
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

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {/* Fee Status */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Fee Status
                                    </label>
                                    <select
                                        name="feeStatus"
                                        value={searchData.feeStatus}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9] focus:border-transparent transition-all"
                                        disabled={searching}
                                    >
                                        <option value="">সকল স্ট্যাটাস</option>
                                        {feeStatusOptions.map((status) => (
                                            <option key={status.value} value={status.value}>
                                                {status.label}
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
                                        name="classId"
                                        value={searchData.classId}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9] focus:border-transparent transition-all"
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
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9] focus:border-transparent transition-all"
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
                            </div>

                            <div className="flex items-center justify-between pt-4">
                                <MainButton
                                    type="button"
                                    onClick={handlePrintDueFee}
                                    className='rounded-md'
                                >
                                    <FaPrint className="text-sm mr-2" />
                                    Print Due Fee
                                </MainButton>

                                <MainButton
                                    type="submit"
                                    disabled={searching}
                                    className="rounded-md"
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

                    {/* Results Section */}
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                            <h2 className="text-lg font-semibold text-gray-800">
                                শিক্ষার্থীদের বকেয়া বেতন ({students.length} জন)
                            </h2>
                            <div className="text-sm text-gray-600">
                                মোট বকেয়া: ৳{formatCurrency(students.reduce((sum, student) => sum + (student.dueFees || 0), 0))}
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
                                            Collect Fee
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            ক্লাস
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            প্যারেন্ট মোবাইল
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Due
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            স্ট্যাটাস
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {students.map((student) => (
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
                                                <div className="flex items-center gap-2">
                                                    <FaUser className="text-gray-400 text-sm" />
                                                    <span className="font-medium text-gray-800">
                                                        {student.name}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <button
                                                    onClick={() => handleCollectFee(student)}
                                                    disabled={!student.dueFees || student.dueFees <= 0 || loading}
                                                    className={`inline-flex items-center gap-1 px-3 py-2 text-xs font-medium rounded-lg transition-colors ${
                                                        student.dueFees > 0 
                                                            ? 'bg-[#1e90c9] text-white ' 
                                                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                                    }`}
                                                >
                                                    <FaMoneyBillWave className="text-xs" />
                                                    সংগ্রহ করুন
                                                </button>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-sm text-gray-800">
                                                    {student.class?.name || 'N/A'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <FaPhone className="text-gray-400 text-sm" />
                                                    <span className="text-sm text-gray-800">
                                                        {student.guardianMobile || student.mobile || 'N/A'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`font-semibold ${
                                                    (student.dueFees || 0) > 0 ? 'text-red-600' : 'text-green-600'
                                                }`}>
                                                    ৳{formatCurrency(student.dueFees)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                {getFeeStatusBadge(student)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* No Results Message */}
                        {students.length === 0 && !loading && (
                            <div className="text-center py-12">
                                <div className="text-4xl text-gray-400 mb-3">💰</div>
                                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                                    কোন শিক্ষার্থী পাওয়া যায়নি
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

export default StudentsBokeya;