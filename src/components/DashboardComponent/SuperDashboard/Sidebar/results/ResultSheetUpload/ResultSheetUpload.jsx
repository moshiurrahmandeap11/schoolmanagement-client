import { useEffect, useState } from 'react';
import axiosInstance, { baseImageURL } from '../../../../../../hooks/axiosInstance/axiosInstance';
import AddNewSheet from './AddNewSheet/AddNewSheet';


const ResultSheetUpload = () => {
    const [resultSheets, setResultSheets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingSheet, setEditingSheet] = useState(null);

    // Fetch result sheets
    const fetchResultSheets = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get('/result-sheet');
            if (response.data && response.data.success) {
                setResultSheets(response.data.data || []);
            }
        } catch (err) {
            setError('ফলাফল শিট লোড করতে সমস্যা হয়েছে');
            console.error('Error fetching result sheets:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchResultSheets();
    }, []);

    // Handle edit
    const handleEdit = (sheet) => {
        setEditingSheet(sheet);
        setShowAddForm(true);
    };

    // Handle delete
    const handleDelete = async (id) => {
        if (!window.confirm('আপনি কি নিশ্চিত যে আপনি এই ফলাফল শিট ডিলিট করতে চান?')) {
            return;
        }

        try {
            const response = await axiosInstance.delete(`/result-sheet/${id}`);
            if (response.data && response.data.success) {
                alert('ফলাফল শিট সফলভাবে ডিলিট হয়েছে');
                fetchResultSheets(); // Refresh list
            } else {
                alert(response.data?.message || 'ডিলিট করতে সমস্যা হয়েছে');
            }
        } catch (err) {
            alert(err.response?.data?.message || 'ডিলিট করতে সমস্যা হয়েছে');
            console.error('Error deleting result sheet:', err);
        }
    };

    // Handle status toggle
    const handleStatusToggle = async (id) => {
        try {
            const response = await axiosInstance.patch(`/result-sheet/${id}/toggle-status`);
            if (response.data && response.data.success) {
                fetchResultSheets(); // Refresh list
            } else {
                alert(response.data?.message || 'স্ট্যাটাস পরিবর্তন করতে সমস্যা হয়েছে');
            }
        } catch (err) {
            alert(err.response?.data?.message || 'স্ট্যাটাস পরিবর্তন করতে সমস্যা হয়েছে');
            console.error('Error toggling status:', err);
        }
    };

    // Handle close form
    const handleCloseForm = () => {
        setShowAddForm(false);
        setEditingSheet(null);
        fetchResultSheets(); // Refresh list
    };

    if (showAddForm) {
        return (
            <AddNewSheet 
                resultSheet={editingSheet} 
                onClose={handleCloseForm} 
            />
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-full mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">ফলাফল শিট আপলোড</h1>
                            <p className="text-gray-600 mt-2">আপনার সকল ফলাফল শিট পরিচালনা করুন</p>
                        </div>
                        <button
                            onClick={() => setShowAddForm(true)}
                            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200 flex items-center space-x-2"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
                            </svg>
                            <span>নতুন ফলাফল শিট</span>
                        </button>
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                        {error}
                    </div>
                )}

                {/* Loading State */}
                {loading ? (
                    <div className="flex justify-center items-center py-12">
                        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                        <span className="ml-3 text-gray-600">ফলাফল শিট লোড হচ্ছে...</span>
                    </div>
                ) : (
                    /* Result Sheets Table */
                    <div className="bg-white rounded-lg shadow overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            ক্লাস
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            সেশন
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            পরীক্ষার টার্ম
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            ফলাফল সীট
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            অবস্থান
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            একশন
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {resultSheets.length === 0 ? (
                                        <tr>
                                            <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                                                <svg className="w-12 h-12 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                                                </svg>
                                                <p className="mt-4 text-lg font-medium">কোন ফলাফল শিট পাওয়া যায়নি</p>
                                                <p className="mt-2">নতুন ফলাফল শিট আপলোড করুন</p>
                                            </td>
                                        </tr>
                                    ) : (
                                        resultSheets.map((sheet) => (
                                            <tr key={sheet._id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-medium text-gray-900">{sheet.className}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900">{sheet.session}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900">{sheet.examTerm}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center space-x-2">
                                                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                                                        </svg>
                                                        <a 
                                                            href={`${baseImageURL}${sheet.resultSheet}`} 
                                                            target="_blank" 
                                                            rel="noopener noreferrer"
                                                            className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
                                                        >
                                                            {sheet.resultSheetOriginalName || 'ফলাফল শিট'}
                                                        </a>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span 
                                                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                            sheet.status === 'published' 
                                                                ? 'bg-green-100 text-green-800' 
                                                                : 'bg-yellow-100 text-yellow-800'
                                                        } cursor-pointer`}
                                                        onClick={() => handleStatusToggle(sheet._id)}
                                                        title="স্ট্যাটাস পরিবর্তন করতে ক্লিক করুন"
                                                    >
                                                        {sheet.status === 'published' ? 'প্রকাশিত' : 'খসড়া'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <div className="flex justify-end space-x-2">
                                                        <button
                                                            onClick={() => handleEdit(sheet)}
                                                            className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 transition-colors duration-200 flex items-center space-x-1"
                                                        >
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                                                            </svg>
                                                            <span>এডিট</span>
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(sheet._id)}
                                                            className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1 transition-colors duration-200 flex items-center space-x-1"
                                                        >
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                                                            </svg>
                                                            <span>ডিলিট</span>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ResultSheetUpload;