import { useEffect, useState } from 'react';
import axiosInstance from '../../../../../../hooks/axiosInstance/axiosInstance';
import MainButton from '../../../../../sharedItems/Mainbutton/Mainbutton';
import AddNewLeaveType from './AddNewLeaveType/AddNewLeaveType';


const HolidayType = () => {
    const [holidayTypes, setHolidayTypes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingHolidayType, setEditingHolidayType] = useState(null);

    // Fetch holiday types
    const fetchHolidayTypes = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get('/holiday-type');
            if (response.data && response.data.success) {
                setHolidayTypes(response.data.data || []);
            } else {
                setError('ছুটির ধরন ডেটা লোড করতে সমস্যা হয়েছে');
            }
        } catch (err) {
            setError('ছুটির ধরন ডেটা লোড করতে সমস্যা হয়েছে');
            console.error('Error fetching holiday types:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHolidayTypes();
    }, []);

    // Handle delete holiday type
    const handleDeleteHolidayType = async (id) => {
        if (!window.confirm('আপনি কি এই ছুটির ধরন ডিলিট করতে চান?')) {
            return;
        }

        try {
            const response = await axiosInstance.delete(`/holiday-type/${id}`);
            if (response.data && response.data.success) {
                fetchHolidayTypes(); // Refresh list
            } else {
                setError('ছুটির ধরন ডিলিট করতে সমস্যা হয়েছে');
            }
        } catch (err) {
            setError('ছুটির ধরন ডিলিট করতে সমস্যা হয়েছে');
            console.error('Error deleting holiday type:', err);
        }
    };

    // Handle edit holiday type
    const handleEditHolidayType = (holidayType) => {
        setEditingHolidayType(holidayType);
        setShowAddForm(true);
    };

    // Handle form close
    const handleFormClose = () => {
        setShowAddForm(false);
        setEditingHolidayType(null);
        fetchHolidayTypes(); // Refresh list
    };

    // Format date in Bengali
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('bn-BD', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    if (showAddForm) {
        return (
            <AddNewLeaveType 
                holidayType={editingHolidayType}
                onClose={handleFormClose}
            />
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-full mx-auto">
                <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                    {/* Header */}
                    <div className="px-6 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                            <h1 className="text-2xl font-bold ">
                                ছুটির ধরন ব্যবস্থাপনা
                            </h1>
                        </div>
                        <MainButton
                            onClick={() => setShowAddForm(true)}
                        >
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
                            </svg>
                            <span>নতুন ছুটির ধরন</span>
                        </MainButton>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                        {error && (
                            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                                {error}
                            </div>
                        )}

                        {loading ? (
                            <div className="flex justify-center items-center py-12">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1e90c9]"></div>
                            </div>
                        ) : holidayTypes.length === 0 ? (
                            <div className="text-center py-12">
                                <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                </svg>
                                <h3 className="text-lg font-medium text-gray-900 mb-2">কোন ছুটির ধরন নেই</h3>
                                <p className="text-gray-500 mb-4">এখনও কোন ছুটির ধরন যোগ করা হয়নি</p>
                                <MainButton
                                    onClick={() => setShowAddForm(true)}
                                >
                                    প্রথম ছুটির ধরন যোগ করুন
                                </MainButton>
                            </div>
                        ) : (
                            <>
                                {/* Summary Cards */}
                                <div className="grid grid-cols-1 md:grid-rows-1 md:grid-cols-3 gap-4 mb-6">
                                    <div className="bg-blue-50 rounded-lg p-4 text-center">
                                        <div className="text-2xl font-bold text-[#1e90c9]">{holidayTypes.length}</div>
                                        <div className="text-sm text-[#1e90c9]">মোট ছুটির ধরন</div>
                                    </div>
                                    <div className="bg-blue-50 rounded-lg p-4 text-center">
                                        <div className="text-2xl font-bold text-[#1e90c9]">
                                            {holidayTypes.filter(ht => ht.name.includes('বার্ষিক')).length}
                                        </div>
                                        <div className="text-sm text-[#1e90c9]">বার্ষিক ছুটি</div>
                                    </div>
                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                                        <div className="text-2xl font-bold text-[#1e90c9]">
                                            {holidayTypes.filter(ht => !ht.name.includes('বার্ষিক')).length}
                                        </div>
                                        <div className="text-sm text-[#1e90c9]">অন্যান্য ছুটি</div>
                                    </div>
                                </div>

                                {/* Holiday Types Table */}
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    #
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    ছুটির ধরনের নাম
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    তৈরি করার তারিখ
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    সর্বশেষ আপডেট
                                                </th>
                                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    কাজ
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {holidayTypes.map((holidayType, index) => (
                                                <tr key={holidayType._id} className="hover:bg-gray-50 transition-colors duration-150">
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {index + 1}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm font-semibold text-gray-900">
                                                            {holidayType.name}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm text-gray-500">
                                                            {formatDate(holidayType.createdAt)}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm text-gray-500">
                                                            {formatDate(holidayType.updatedAt)}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                        <button
                                                            onClick={() => handleEditHolidayType(holidayType)}
                                                            className="text-blue-600 hover:text-blue-900 mr-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded px-3 py-1 transition-colors duration-200"
                                                        >
                                                            এডিট
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteHolidayType(holidayType._id)}
                                                            className="text-red-600 hover:text-red-900 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 rounded px-3 py-1 transition-colors duration-200"
                                                        >
                                                            ডিলিট
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Quick Stats */}
                                <div className="mt-6 bg-gray-50 border border-gray-200 rounded-lg p-4">
                                    <h4 className="text-sm font-medium text-gray-700 mb-3">দ্রুত পরিসংখ্যান:</h4>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                                        <div className="text-center">
                                            <div className="font-semibold text-purple-600">
                                                {holidayTypes.filter(ht => ht.name.includes('সরকারি')).length}
                                            </div>
                                            <div className="text-gray-600">সরকারি ছুটি</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="font-semibold text-green-600">
                                                {holidayTypes.filter(ht => ht.name.includes('ধর্মীয়')).length}
                                            </div>
                                            <div className="text-gray-600">ধর্মীয় ছুটি</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="font-semibold text-blue-600">
                                                {holidayTypes.filter(ht => ht.name.includes('জাতীয়')).length}
                                            </div>
                                            <div className="text-gray-600">জাতীয় ছুটি</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="font-semibold text-orange-600">
                                                {holidayTypes.filter(ht => ht.name.includes('বিশেষ')).length}
                                            </div>
                                            <div className="text-gray-600">বিশেষ ছুটি</div>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HolidayType;