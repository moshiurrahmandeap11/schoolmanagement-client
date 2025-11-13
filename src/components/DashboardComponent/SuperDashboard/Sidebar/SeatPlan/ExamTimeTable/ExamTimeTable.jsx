import { useEffect, useState } from 'react';

import axiosInstance from '../../../../../../hooks/axiosInstance/axiosInstance';
import AddNewExamTime from './AddNewExamTime/AddNewExamTime';


const ExamTimeTable = () => {
    const [examTimetables, setExamTimetables] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingTimetable, setEditingTimetable] = useState(null);

    // Fetch exam timetables
    const fetchExamTimetables = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get('/exam-timetable');
            if (response.data && response.data.success) {
                setExamTimetables(response.data.data || []);
            }
        } catch (err) {
            setError('পরীক্ষার সময়সূচী লোড করতে সমস্যা হয়েছে');
            console.error('Error fetching exam timetables:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchExamTimetables();
    }, []);

    // Handle edit
    const handleEdit = (timetable) => {
        setEditingTimetable(timetable);
        setShowAddForm(true);
    };

    // Handle delete
    const handleDelete = async (id) => {
        if (!window.confirm('আপনি কি নিশ্চিত যে আপনি এই পরীক্ষার সময়সূচী ডিলিট করতে চান?')) {
            return;
        }

        try {
            const response = await axiosInstance.delete(`/exam-timetable/${id}`);
            if (response.data && response.data.success) {
                alert('পরীক্ষার সময়সূচী সফলভাবে ডিলিট হয়েছে');
                fetchExamTimetables(); // Refresh list
            } else {
                alert(response.data?.message || 'ডিলিট করতে সমস্যা হয়েছে');
            }
        } catch (err) {
            alert(err.response?.data?.message || 'ডিলিট করতে সমস্যা হয়েছে');
            console.error('Error deleting exam timetable:', err);
        }
    };

    // Handle status toggle
    const handleStatusToggle = async (id) => {
        try {
            const response = await axiosInstance.patch(`/exam-timetable/${id}/toggle-status`);
            if (response.data && response.data.success) {
                fetchExamTimetables(); // Refresh list
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
        setEditingTimetable(null);
        fetchExamTimetables(); // Refresh list
    };

    if (showAddForm) {
        return (
            <AddNewExamTime 
                examTimetable={editingTimetable} 
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
                            <h1 className="text-3xl font-bold text-gray-900">পরীক্ষার সময়সূচী ম্যানেজমেন্ট</h1>
                            <p className="text-gray-600 mt-2">আপনার সকল পরীক্ষার সময়সূচী পরিচালনা করুন</p>
                        </div>
                        <button
                            onClick={() => setShowAddForm(true)}
                            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200 flex items-center space-x-2"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
                            </svg>
                            <span>নতুন পরীক্ষার সময়কাল</span>
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
                        <span className="ml-3 text-gray-600">পরীক্ষার সময়সূচী লোড হচ্ছে...</span>
                    </div>
                ) : (
                    /* Exam Timetables Table */
                    <div className="bg-white rounded-lg shadow overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            সময়কাল
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            অবস্থান
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            তৈরি হয়েছে
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            একশন
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {examTimetables.length === 0 ? (
                                        <tr>
                                            <td colSpan="4" className="px-6 py-8 text-center text-gray-500">
                                                <svg className="w-12 h-12 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                                </svg>
                                                <p className="mt-4 text-lg font-medium">কোন পরীক্ষার সময়সূচী পাওয়া যায়নি</p>
                                                <p className="mt-2">নতুন পরীক্ষার সময়সূচী তৈরি করুন</p>
                                            </td>
                                        </tr>
                                    ) : (
                                        examTimetables.map((timetable) => (
                                            <tr key={timetable._id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-medium text-gray-900">{timetable.duration}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span 
                                                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                            timetable.status === 'active' 
                                                                ? 'bg-green-100 text-green-800' 
                                                                : 'bg-red-100 text-red-800'
                                                        } cursor-pointer`}
                                                        onClick={() => handleStatusToggle(timetable._id)}
                                                        title="স্ট্যাটাস পরিবর্তন করতে ক্লিক করুন"
                                                    >
                                                        {timetable.status === 'active' ? 'সক্রিয়' : 'নিষ্ক্রিয়'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-500">
                                                        {new Date(timetable.createdAt).toLocaleDateString('bn-BD')}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <div className="flex justify-end space-x-2">
                                                        <button
                                                            onClick={() => handleEdit(timetable)}
                                                            className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 transition-colors duration-200 flex items-center space-x-1"
                                                        >
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                                                            </svg>
                                                            <span>এডিট</span>
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(timetable._id)}
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

export default ExamTimeTable;