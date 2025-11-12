import { useEffect, useState } from 'react';
import { FaArrowLeft, FaCalendarAlt, FaFilter, FaIdCard, FaMoneyBillWave, FaSearch, FaTrash, FaUser } from 'react-icons/fa';
import Swal from 'sweetalert2';
import axiosInstance from '../../../../../../hooks/axiosInstance/axiosInstance';

const DeletedFees = ({ onBack }) => {
    const [searchData, setSearchData] = useState({
        search1: '',
        search2: '',
        startDate: '',
        endDate: ''
    });
    const [loading, setLoading] = useState(false);
    const [searching, setSearching] = useState(false);
    
    const [deletedFees, setDeletedFees] = useState([]);

    useEffect(() => {
        fetchDeletedFees();
    }, []);

    const fetchDeletedFees = async (filters = {}) => {
        setLoading(true);
        try {
            const response = await axiosInstance.get('/deleted-fees', {
                params: filters
            });

            if (response.data.success) {
                setDeletedFees(response.data.data || []);
            } else {
                setDeletedFees([]);
                showSweetAlert('info', 'কোন ডিলিটেড ফি পাওয়া যায়নি');
            }
        } catch (error) {
            console.error('Error fetching deleted fees:', error);
            showSweetAlert('error', 'ডেটা লোড করতে সমস্যা হয়েছে');
            setDeletedFees([]);
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
            await fetchDeletedFees(searchData);
        } catch (error) {
            console.error('Error searching deleted fees:', error);
            showSweetAlert('error', 'অনুসন্ধান করতে সমস্যা হয়েছে');
        } finally {
            setSearching(false);
        }
    };

    const handleReset = () => {
        setSearchData({
            search1: '',
            search2: '',
            startDate: '',
            endDate: ''
        });
        fetchDeletedFees();
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('bn-BD');
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('bn-BD', {
            minimumFractionDigits: 2
        }).format(amount || 0);
    };

    const getDeleteReasonColor = (reason) => {
        const reasonLower = reason?.toLowerCase() || '';
        if (reasonLower.includes('ভুল')) return 'bg-red-100 text-red-800';
        if (reasonLower.includes('ক্যাঙ্কেল')) return 'bg-orange-100 text-orange-800';
        if (reasonLower.includes('পরিবর্তন')) return 'bg-blue-100 text-blue-800';
        if (reasonLower.includes('সংশোধন')) return 'bg-purple-100 text-purple-800';
        return 'bg-gray-100 text-gray-800';
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
                            ডিলিটেড ফি
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
                            অনুসন্ধান ফিল্টার
                        </h2>
                        
                        <form onSubmit={handleSearch} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                {/* Search Field 1 */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        অনুসন্ধান ১
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            name="search1"
                                            value={searchData.search1}
                                            onChange={handleChange}
                                            placeholder="শিক্ষার্থীর আইডি বা নাম"
                                            className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                            disabled={searching}
                                        />
                                        <FaSearch className="absolute left-3 top-3.5 text-gray-400" />
                                    </div>
                                </div>

                                {/* Search Field 2 */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        অনুসন্ধান ২
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            name="search2"
                                            value={searchData.search2}
                                            onChange={handleChange}
                                            placeholder="ক্লাস বা সেশন"
                                            className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                            disabled={searching}
                                        />
                                        <FaSearch className="absolute left-3 top-3.5 text-gray-400" />
                                    </div>
                                </div>

                                {/* Start Date */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        তারিখ থেকে
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="date"
                                            name="startDate"
                                            value={searchData.startDate}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                            disabled={searching}
                                        />
                                        <FaCalendarAlt className="absolute left-3 top-3.5 text-gray-400" />
                                    </div>
                                </div>

                                {/* End Date */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        তারিখ পর্যন্ত
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="date"
                                            name="endDate"
                                            value={searchData.endDate}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                            disabled={searching}
                                        />
                                        <FaCalendarAlt className="absolute left-3 top-3.5 text-gray-400" />
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-4">
                                <button
                                    type="button"
                                    onClick={handleReset}
                                    className="inline-flex items-center gap-2 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors font-medium"
                                >
                                    রিসেট
                                </button>

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
                                            <FaFilter className="text-sm" />
                                            Filter
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Results Section */}
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h2 className="text-lg font-semibold text-gray-800">
                                ডিলিটেড ফি তালিকা ({deletedFees.length} টি)
                            </h2>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            শিক্ষার্থীর আইডি
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            শিক্ষার্থীর নাম
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            তারিখ
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            নাম
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            ক্লাস
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            সেশন
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            পরিমাণ
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            সদস্য
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Delete Reason
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {deletedFees.map((fee) => (
                                        <tr key={fee._id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <FaIdCard className="text-gray-400 text-sm" />
                                                    <span className="font-medium text-gray-800">
                                                        {fee.studentId || 'N/A'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <FaUser className="text-gray-400 text-sm" />
                                                    <span className="font-medium text-gray-800">
                                                        {fee.studentName || 'N/A'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <FaCalendarAlt className="text-gray-400 text-sm" />
                                                    <span className="text-sm text-gray-800">
                                                        {formatDate(fee.deletedAt || fee.date)}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-sm text-gray-800">
                                                    {fee.feeName || fee.name || 'N/A'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="inline-flex px-2 py-1 text-xs font-semibold bg-blue-100 text-blue-800 rounded-full">
                                                    {fee.className || 'N/A'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="inline-flex px-2 py-1 text-xs font-semibold bg-green-100 text-green-800 rounded-full">
                                                    {fee.sessionName || 'N/A'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <FaMoneyBillWave className="text-red-400 text-sm" />
                                                    <span className="font-semibold text-red-600">
                                                        ৳{formatCurrency(fee.amount)}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-sm text-gray-800">
                                                    {fee.deletedBy || fee.memberName || 'N/A'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${getDeleteReasonColor(fee.deleteReason)}`}>
                                                    <FaTrash className="mr-1 text-xs" />
                                                    {fee.deleteReason || 'N/A'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* No Results Message */}
                        {deletedFees.length === 0 && !loading && (
                            <div className="text-center py-12">
                                <div className="text-4xl text-gray-400 mb-3">🗑️</div>
                                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                                    কোন ডিলিটেড ফি পাওয়া যায়নি
                                </h3>
                                <p className="text-gray-600 text-sm">
                                    অনুসন্ধান ক্রাইটেরিয়া পরিবর্তন করে আবার চেষ্টা করুন
                                </p>
                            </div>
                        )}

                        {/* Loading State */}
                        {loading && (
                            <div className="text-center py-12">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                                <p className="text-gray-600">ডেটা লোড হচ্ছে...</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DeletedFees;