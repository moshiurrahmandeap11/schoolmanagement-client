import { useEffect, useState } from 'react';
import { FaArrowLeft, FaCalendarAlt, FaListAlt, FaMobile, FaPaperPlane, FaSearch, FaSms } from 'react-icons/fa';
import Swal from 'sweetalert2';
import axiosInstance from '../../../../../hooks/axiosInstance/axiosInstance';


const DueFeeSms = ({ onBack }) => {
    const [searchData, setSearchData] = useState({
        startDate: '',
        endDate: '',
        mobile: '',
        classId: ''
    });
    const [loading, setLoading] = useState(false);
    const [searching, setSearching] = useState(false);
    
    const [classes, setClasses] = useState([]);
    const [smsData, setSmsData] = useState([]);
    const [totalSms, setTotalSms] = useState(0);

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
        setSearchData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        
        if (!searchData.startDate || !searchData.endDate) {
            showSweetAlert('warning', 'শুরুর তারিখ এবং শেষ তারিখ নির্বাচন করুন');
            return;
        }

        setSearching(true);
        try {
            const response = await axiosInstance.get('/send-sms', {
                params: {
                    startDate: searchData.startDate,
                    endDate: searchData.endDate,
                    mobile: searchData.mobile,
                    classId: searchData.classId
                }
            });

            if (response.data.success) {
                setSmsData(response.data.data || []);
                calculateTotalSms(response.data.data || []);
                
                if (response.data.data.length === 0) {
                    showSweetAlert('info', 'কোন এসএমএস ডেটা পাওয়া যায়নি');
                } else {
                    showSweetAlert('success', `${response.data.data.length} টি এসএমএস পাওয়া গেছে`);
                }
            }
        } catch (error) {
            console.error('Error searching SMS data:', error);
            showSweetAlert('error', 'এসএমএস ডেটা খুঁজে পেতে সমস্যা হয়েছে');
            setSmsData([]);
            setTotalSms(0);
        } finally {
            setSearching(false);
        }
    };

    const calculateTotalSms = (data) => {
        const total = data.reduce((sum, item) => sum + (item.count || 1), 0);
        setTotalSms(total);
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('bn-BD');
    };

    const formatDateTime = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleString('bn-BD');
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
                            বকেয়া ফি এসএমএস
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
                            এসএমএস খুঁজুন
                        </h2>
                        
                        <form onSubmit={handleSearch} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                {/* Start Date */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        শুরুর তারিখ *
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
                                        শেষ তারিখ *
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

                                {/* Mobile */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        মোবাইল:
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            name="mobile"
                                            value={searchData.mobile}
                                            onChange={handleChange}
                                            placeholder="মোবাইল নম্বর"
                                            className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                            disabled={searching}
                                        />
                                        <FaMobile className="absolute left-3 top-3.5 text-gray-400" />
                                    </div>
                                </div>

                                {/* Class */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        ক্লাস
                                    </label>
                                    <div className="relative">
                                        <select
                                            name="classId"
                                            value={searchData.classId}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                            disabled={searching}
                                        >
                                            <option value="">সকল ক্লাস</option>
                                            {classes.map((classItem) => (
                                                <option key={classItem._id} value={classItem._id}>
                                                    {classItem.name}
                                                </option>
                                            ))}
                                        </select>
                                        <FaListAlt className="absolute left-3 top-3.5 text-gray-400" />
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end">
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

                    {/* SMS Summary */}
                    {smsData.length > 0 && (
                        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-2xl shadow-lg p-6 mb-6">
                            <div className="flex items-center justify-between text-white">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-green-400 bg-opacity-20 rounded-xl">
                                        <FaPaperPlane className="text-2xl" />
                                    </div>
                                    <div>
                                        <p className="text-green-100 text-sm font-medium">মোট এসএমএস প্রেরণ:</p>
                                        <p className="text-3xl font-bold">{totalSms}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-green-100 text-sm">মোট রেকর্ড</p>
                                    <p className="text-xl font-semibold">{smsData.length} টি</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Results Section */}
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h2 className="text-lg font-semibold text-gray-800">
                                এসএমএস তালিকা ({smsData.length} টি)
                            </h2>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            মোবাইল:
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            এস এম এস
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Count
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            তারিখ
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {smsData.map((sms, index) => (
                                        <tr key={index} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <FaMobile className="text-gray-400 text-sm" />
                                                    <span className="font-medium text-gray-800">
                                                        {sms.mobile || 'N/A'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <FaSms className="text-gray-400 text-sm" />
                                                    <span className="text-sm text-gray-800 max-w-md truncate">
                                                        {sms.message || 'N/A'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="inline-flex items-center px-2 py-1 text-xs font-semibold bg-blue-100 text-blue-800 rounded-full">
                                                    {sms.count || 1}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <FaCalendarAlt className="text-gray-400 text-sm" />
                                                    <span className="text-sm text-gray-800">
                                                        {formatDateTime(sms.date || sms.createdAt)}
                                                    </span>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* No Results Message */}
                        {smsData.length === 0 && !searching && (
                            <div className="text-center py-12">
                                <div className="text-4xl text-gray-400 mb-3">📱</div>
                                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                                    কোন এসএমএস পাওয়া যায়নি
                                </h3>
                                <p className="text-gray-600 text-sm">
                                    অনুসন্ধান ক্রাইটেরিয়া পরিবর্তন করে আবার চেষ্টা করুন
                                </p>
                            </div>
                        )}

                        {/* Loading State */}
                        {searching && (
                            <div className="text-center py-12">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                                <p className="text-gray-600">এসএমএস ডেটা লোড হচ্ছে...</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DueFeeSms;