import { useEffect, useState } from 'react';
import axiosInstance from '../../../../../../hooks/axiosInstance/axiosInstance';
import AddNewMainAdmission from './AddNewMainAdmission/AddNewMainAdmission';


const MainAdmissionInfo = () => {
    const [admissionInfo, setAdmissionInfo] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingInfo, setEditingInfo] = useState(null);

    // Fetch admission info
    const fetchAdmissionInfo = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get('/main-admission-info');
            if (response.data && response.data.success) {
                setAdmissionInfo(response.data.data || []);
            } else {
                setError('ভর্তি তথ্য লোড করতে সমস্যা হয়েছে');
            }
        } catch (err) {
            setError('ভর্তি তথ্য লোড করতে সমস্যা হয়েছে');
            console.error('Error fetching admission info:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAdmissionInfo();
    }, []);

    // Handle delete admission info
    const handleDeleteInfo = async (id) => {
        if (!window.confirm('আপনি কি এই ভর্তি তথ্য ডিলিট করতে চান?')) {
            return;
        }

        try {
            const response = await axiosInstance.delete(`/main-admission-info/${id}`);
            if (response.data && response.data.success) {
                fetchAdmissionInfo(); // Refresh list
            } else {
                setError('ভর্তি তথ্য ডিলিট করতে সমস্যা হয়েছে');
            }
        } catch (err) {
            setError('ভর্তি তথ্য ডিলিট করতে সমস্যা হয়েছে');
            console.error('Error deleting admission info:', err);
        }
    };

    // Handle edit admission info
    const handleEditInfo = (info) => {
        setEditingInfo(info);
        setShowAddForm(true);
    };

    // Handle toggle status
    const handleToggleStatus = async (id) => {
        try {
            const response = await axiosInstance.patch(`/main-admission-info/${id}/toggle-status`);
            if (response.data && response.data.success) {
                fetchAdmissionInfo();
            } else {
                setError('স্ট্যাটাস পরিবর্তন করতে সমস্যা হয়েছে');
            }
        } catch (err) {
            setError('স্ট্যাটাস পরিবর্তন করতে সমস্যা হয়েছে');
            console.error('Error toggling status:', err);
        }
    };

    // Handle form close
    const handleFormClose = () => {
        setShowAddForm(false);
        setEditingInfo(null);
        fetchAdmissionInfo(); // Refresh list
    };

    // Format date in Bengali
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('bn-BD', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    // Check if admission is active
    const isActiveAdmission = (startDate, endDate) => {
        const now = new Date();
        const start = new Date(startDate);
        const end = new Date(endDate);
        return now >= start && now <= end;
    };

    // Truncate description for table view
    const truncateDescription = (description) => {
        const strippedText = description.replace(/<[^>]*>/g, '');
        return strippedText.length > 100 
            ? strippedText.substring(0, 100) + '...' 
            : strippedText;
    };

    // যদি ফর্ম শো করতে হয়
    if (showAddForm) {
        return (
            <AddNewMainAdmission 
                admissionInfo={editingInfo}
                onClose={handleFormClose}
            />
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-full mx-auto">
                <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-6 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-white">
                                ভর্তি তথ্য ব্যবস্থাপনা
                            </h1>
                            <p className="text-blue-100 text-sm mt-1">
                                সকল ভর্তি তথ্য ব্যবস্থাপনা
                            </p>
                        </div>
                        <button
                            onClick={() => setShowAddForm(true)}
                            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors duration-200 flex items-center space-x-2"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
                            </svg>
                            <span>নতুন ভর্তি তথ্য</span>
                        </button>
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
                        ) : admissionInfo.length === 0 ? (
                            <div className="text-center py-12">
                                <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                                </svg>
                                <h3 className="text-lg font-medium text-gray-900 mb-2">কোন ভর্তি তথ্য নেই</h3>
                                <p className="text-gray-500 mb-4">এখনও কোন ভর্তি তথ্য যোগ করা হয়নি</p>
                                <button
                                    onClick={() => setShowAddForm(true)}
                                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200"
                                >
                                    প্রথম ভর্তি তথ্য যোগ করুন
                                </button>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                শিরোনাম
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                ক্লাস
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                শুরুর তারিখ
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                শেষ তারিখ
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                বিবরণ
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                অবস্থান
                                            </th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                কাজ
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {admissionInfo.map((info) => (
                                            <tr key={info._id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center space-x-3">
                                                        {info.coverImage && (
                                                            <img 
                                                                src={`${axiosInstance.defaults.baseURL}${info.coverImage}`}
                                                                alt={info.title}
                                                                className="w-10 h-10 object-cover rounded-lg border border-gray-200"
                                                            />
                                                        )}
                                                        <div className="text-sm font-medium text-gray-900 max-w-xs truncate">
                                                            {info.title}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900">
                                                        {info.className}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900">
                                                        {formatDate(info.startDate)}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900">
                                                        {formatDate(info.endDate)}
                                                        {isActiveAdmission(info.startDate, info.endDate) && (
                                                            <span className="ml-2 bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                                                                সক্রিয়
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-sm text-gray-900 max-w-xs">
                                                        {truncateDescription(info.description)}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span 
                                                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium cursor-pointer ${
                                                            info.status === 'published' 
                                                                ? 'bg-green-100 text-green-800' 
                                                                : 'bg-yellow-100 text-yellow-800'
                                                        }`}
                                                        onClick={() => handleToggleStatus(info._id)}
                                                        title="স্ট্যাটাস পরিবর্তন করতে ক্লিক করুন"
                                                    >
                                                        {info.status === 'published' ? 'প্রকাশিত' : 'খসড়া'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <div className="flex justify-end space-x-3">
                                                        <button
                                                            onClick={() => handleEditInfo(info)}
                                                            className="text-blue-600 hover:text-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded px-3 py-1 bg-blue-50 hover:bg-blue-100 transition-colors duration-200"
                                                        >
                                                            এডিট
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteInfo(info._id)}
                                                            className="text-red-600 hover:text-red-900 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 rounded px-3 py-1 bg-red-50 hover:bg-red-100 transition-colors duration-200"
                                                        >
                                                            ডিলিট
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* Summary */}
                        {admissionInfo.length > 0 && (
                            <div className="mt-6 bg-gray-50 border border-gray-200 rounded-lg p-4">
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-blue-600">{admissionInfo.length}</div>
                                        <div className="text-gray-600">মোট ভর্তি তথ্য</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-green-600">
                                            {admissionInfo.filter(info => info.status === 'published').length}
                                        </div>
                                        <div className="text-gray-600">প্রকাশিত</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-yellow-600">
                                            {admissionInfo.filter(info => info.status === 'draft').length}
                                        </div>
                                        <div className="text-gray-600">খসড়া</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-purple-600">
                                            {admissionInfo.filter(info => 
                                                isActiveAdmission(info.startDate, info.endDate)
                                            ).length}
                                        </div>
                                        <div className="text-gray-600">সক্রিয় ভর্তি</div>
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

export default MainAdmissionInfo;