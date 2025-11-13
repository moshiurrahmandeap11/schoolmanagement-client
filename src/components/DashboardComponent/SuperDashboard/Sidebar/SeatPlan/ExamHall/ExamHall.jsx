import { useEffect, useState } from 'react';
import axiosInstance from '../../../../../../hooks/axiosInstance/axiosInstance';
import AddNewExamHall from './AddExamHall/AddExamHall';


const ExamHall = () => {
    const [examHalls, setExamHalls] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingHall, setEditingHall] = useState(null);

    // Fetch exam halls
    const fetchExamHalls = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get('/exam-hall');
            if (response.data && response.data.success) {
                setExamHalls(response.data.data || []);
            }
        } catch (err) {
            setError('এক্সাম হল লোড করতে সমস্যা হয়েছে');
            console.error('Error fetching exam halls:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchExamHalls();
    }, []);

    // Handle edit
    const handleEdit = (hall) => {
        setEditingHall(hall);
        setShowAddForm(true);
    };

    // Handle delete
    const handleDelete = async (id) => {
        if (!window.confirm('আপনি কি নিশ্চিত যে আপনি এই এক্সাম হলটি ডিলিট করতে চান?')) {
            return;
        }

        try {
            const response = await axiosInstance.delete(`/exam-hall/${id}`);
            if (response.data && response.data.success) {
                alert('এক্সাম হল সফলভাবে ডিলিট হয়েছে');
                fetchExamHalls(); // Refresh list
            } else {
                alert(response.data?.message || 'ডিলিট করতে সমস্যা হয়েছে');
            }
        } catch (err) {
            alert(err.response?.data?.message || 'ডিলিট করতে সমস্যা হয়েছে');
            console.error('Error deleting exam hall:', err);
        }
    };

    // Handle close form
    const handleCloseForm = () => {
        setShowAddForm(false);
        setEditingHall(null);
        fetchExamHalls(); // Refresh list
    };

    if (showAddForm) {
        return (
            <AddNewExamHall 
                examHall={editingHall} 
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
                            <h1 className="text-3xl font-bold text-gray-900">এক্সাম হল ম্যানেজমেন্ট</h1>
                            <p className="text-gray-600 mt-2">আপনার সকল এক্সাম হল পরিচালনা করুন</p>
                        </div>
                        <button
                            onClick={() => setShowAddForm(true)}
                            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200 flex items-center space-x-2"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
                            </svg>
                            <span>নতুন এক্সাম হল</span>
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
                        <span className="ml-3 text-gray-600">এক্সাম হল লোড হচ্ছে...</span>
                    </div>
                ) : (
                    /* Exam Halls Table */
                    <div className="bg-white rounded-lg shadow overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            নাম
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            ছবি
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            রুম সংখ্যা
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            মোট সিট
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            একশন
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {examHalls.length === 0 ? (
                                        <tr>
                                            <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                                                <svg className="w-12 h-12 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                                                </svg>
                                                <p className="mt-4 text-lg font-medium">কোন এক্সাম হল পাওয়া যায়নি</p>
                                                <p className="mt-2">নতুন এক্সাম হল তৈরি করুন</p>
                                            </td>
                                        </tr>
                                    ) : (
                                        examHalls.map((hall) => (
                                            <tr key={hall._id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-medium text-gray-900">{hall.name}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {hall.image ? (
                                                        <img 
                                                            src={`/uploads/${hall.image}`} 
                                                            alt={hall.name}
                                                            className="w-12 h-12 object-cover rounded-lg border border-gray-200"
                                                            onError={(e) => {
                                                                e.target.style.display = 'none';
                                                                e.target.nextSibling.style.display = 'block';
                                                            }}
                                                        />
                                                    ) : (
                                                        <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                                                            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                                                            </svg>
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900">{hall.rooms?.length || 0} টি রুম</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900">
                                                        {hall.rooms?.reduce((total, room) => total + parseInt(room.seatCapacity || 0), 0)} সিট
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <div className="flex justify-end space-x-2">
                                                        <button
                                                            onClick={() => handleEdit(hall)}
                                                            className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 transition-colors duration-200 flex items-center space-x-1"
                                                        >
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                                                            </svg>
                                                            <span>এডিট</span>
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(hall._id)}
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

export default ExamHall;