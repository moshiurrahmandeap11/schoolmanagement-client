import { useEffect, useState } from 'react';
import axiosInstance from '../../../../../../hooks/axiosInstance/axiosInstance';
import MainButton from '../../../../../sharedItems/Mainbutton/Mainbutton';
import AddNewHoliday from './AddNewHoliday/AddNewHoliday';


const Holiday = () => {
    const [holidays, setHolidays] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingHoliday, setEditingHoliday] = useState(null);

    // Fetch holidays
    const fetchHolidays = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get('/holidays');
            if (response.data && response.data.success) {
                setHolidays(response.data.data || []);
            } else {
                setError('হলিডে ডেটা লোড করতে সমস্যা হয়েছে');
            }
        } catch (err) {
            setError('হলিডে ডেটা লোড করতে সমস্যা হয়েছে');
            console.error('Error fetching holidays:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHolidays();
    }, []);

    // Handle delete holiday
    const handleDeleteHoliday = async (id) => {
        if (!window.confirm('আপনি কি এই ছুটি ডিলিট করতে চান?')) {
            return;
        }

        try {
            const response = await axiosInstance.delete(`/holidays/${id}`);
            if (response.data && response.data.success) {
                fetchHolidays(); // Refresh list
            } else {
                setError('ছুটি ডিলিট করতে সমস্যা হয়েছে');
            }
        } catch (err) {
            setError('ছুটি ডিলিট করতে সমস্যা হয়েছে');
            console.error('Error deleting holiday:', err);
        }
    };

    // Handle edit holiday
    const handleEditHoliday = (holiday) => {
        setEditingHoliday(holiday);
        setShowAddForm(true);
    };

    // Handle form close
    const handleFormClose = () => {
        setShowAddForm(false);
        setEditingHoliday(null);
        fetchHolidays(); // Refresh list
    };

    // Format date in Bengali
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('bn-BD', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    // Format date range
    const formatDateRange = (fromDate, toDate) => {
        const from = new Date(fromDate);
        const to = new Date(toDate);
        
        if (from.toDateString() === to.toDateString()) {
            return formatDate(fromDate);
        } else {
            return `${formatDate(fromDate)} - ${formatDate(toDate)}`;
        }
    };

    if (showAddForm) {
        return (
            <AddNewHoliday 
                holiday={editingHoliday}
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
                                ছুটির তালিকা
                            </h1>
                        </div>
                        <MainButton
                            onClick={() => setShowAddForm(true)}
                        >
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
                            </svg>
                            <span>নতুন ছুটি</span>
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
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                            </div>
                        ) : holidays.length === 0 ? (
                            <div className="text-center py-12">
                                <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                                </svg>
                                <h3 className="text-lg font-medium text-gray-900 mb-2">কোন ছুটি নেই</h3>
                                <p className="text-gray-500 mb-4">এখনও কোন ছুটি যোগ করা হয়নি</p>
                                <MainButton
                                    onClick={() => setShowAddForm(true)}
                                >
                                    প্রথম ছুটি যোগ করুন
                                </MainButton>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                নাম
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                সেশন
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                তারিখসমূহ
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                মোট দিন
                                            </th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                কাজ
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {holidays.map((holiday) => (
                                            <tr key={holiday._id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {holiday.name}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900">
                                                        {holiday.session?.name}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-sm text-gray-900 space-y-1">
                                                        {holiday.dates.map((dateRange, index) => (
                                                            <div key={index} className="flex items-center space-x-2">
                                                                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                                                    {formatDateRange(dateRange.fromDate, dateRange.toDate)}
                                                                </span>
                                                                {dateRange.isFullDay && (
                                                                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                                                                        সম্পূর্ণ দিন
                                                                    </span>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900">
                                                        {holiday.dates.reduce((total, dateRange) => {
                                                            const from = new Date(dateRange.fromDate);
                                                            const to = new Date(dateRange.toDate);
                                                            const diffTime = Math.abs(to - from);
                                                            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
                                                            return total + diffDays;
                                                        }, 0)} দিন
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <button
                                                        onClick={() => handleEditHoliday(holiday)}
                                                        className="text-blue-600 hover:text-blue-900 mr-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded"
                                                    >
                                                        এডিট
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteHoliday(holiday._id)}
                                                        className="text-red-600 hover:text-red-900 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 rounded"
                                                    >
                                                        ডিলিট
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* Summary */}
                        {holidays.length > 0 && (
                            <div className="mt-6 bg-gray-50 border border-gray-200 rounded-lg p-4">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-blue-600">{holidays.length}</div>
                                        <div className="text-gray-600">মোট ছুটি</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-green-600">
                                            {holidays.reduce((total, holiday) => {
                                                return total + holiday.dates.reduce((days, dateRange) => {
                                                    const from = new Date(dateRange.fromDate);
                                                    const to = new Date(dateRange.toDate);
                                                    const diffTime = Math.abs(to - from);
                                                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
                                                    return days + diffDays;
                                                }, 0);
                                            }, 0)}
                                        </div>
                                        <div className="text-gray-600">মোট ছুটির দিন</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-purple-600">
                                            {new Set(holidays.map(h => h.session?._id)).size}
                                        </div>
                                        <div className="text-gray-600">সেশন</div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Holiday;