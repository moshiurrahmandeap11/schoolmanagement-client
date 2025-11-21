import { useEffect, useState } from 'react';
import axiosInstance from '../../../../../../hooks/axiosInstance/axiosInstance';
import MainButton from '../../../../../sharedItems/Mainbutton/Mainbutton';
import AddNewExamGroup from './AddNewExamGroup/AddNewExamGroup';


const ExamGroup = () => {
    const [examGroups, setExamGroups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingExamGroup, setEditingExamGroup] = useState(null);

    // Fetch exam groups
    const fetchExamGroups = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get('/exam-group');
            if (response.data && response.data.success) {
                setExamGroups(response.data.data || []);
            } else {
                setError('এক্সাম গ্রুপ ডেটা লোড করতে সমস্যা হয়েছে');
            }
        } catch (err) {
            setError('এক্সাম গ্রুপ ডেটা লোড করতে সমস্যা হয়েছে');
            console.error('Error fetching exam groups:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchExamGroups();
    }, []);

    // Handle delete exam group
    const handleDeleteExamGroup = async (id) => {
        if (!window.confirm('আপনি কি এই এক্সাম গ্রুপ ডিলিট করতে চান?')) {
            return;
        }

        try {
            const response = await axiosInstance.delete(`/exam-group/${id}`);
            if (response.data && response.data.success) {
                fetchExamGroups(); // Refresh list
            } else {
                setError('এক্সাম গ্রুপ ডিলিট করতে সমস্যা হয়েছে');
            }
        } catch (err) {
            setError('এক্সাম গ্রুপ ডিলিট করতে সমস্যা হয়েছে');
            console.error('Error deleting exam group:', err);
        }
    };

    // Handle edit exam group
    const handleEditExamGroup = (examGroup) => {
        setEditingExamGroup(examGroup);
        setShowAddForm(true);
    };

    // Handle form close
    const handleFormClose = () => {
        setShowAddForm(false);
        setEditingExamGroup(null);
        fetchExamGroups(); // Refresh list
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
            <AddNewExamGroup 
                examGroup={editingExamGroup}
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
                                এক্সাম গ্রুপ ব্যবস্থাপনা
                            </h1>
                        </div>
                        <MainButton
                            onClick={() => setShowAddForm(true)}
                        >
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
                            </svg>
                            <span>নতুন এক্সাম গ্রুপ</span>
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
                        ) : examGroups.length === 0 ? (
                            <div className="text-center py-12">
                                <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                                </svg>
                                <h3 className="text-lg font-medium text-gray-900 mb-2">কোন এক্সাম গ্রুপ নেই</h3>
                                <p className="text-gray-500 mb-4">এখনও কোন এক্সাম গ্রুপ যোগ করা হয়নি</p>
                                <MainButton
                                    onClick={() => setShowAddForm(true)}
                                >
                                    প্রথম এক্সাম গ্রুপ যোগ করুন
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
                                                মেইন এক্সাম
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                সাব এক্সামসমূহ
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                তৈরি করার তারিখ
                                            </th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                কাজ
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {examGroups.map((examGroup) => (
                                            <tr key={examGroup._id} className="hover:bg-gray-50 transition-colors duration-150">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-semibold text-gray-900">
                                                        {examGroup.name}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm  bg-blue-100 text-blue-800 px-2 py-1 rounded-full inline-block">
                                                        {examGroup.mainExam}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-sm text-gray-900 space-y-1">
                                                        {examGroup.subExams && examGroup.subExams.length > 0 ? (
                                                            examGroup.subExams.map((subExam, idx) => (
                                                                <span 
                                                                    key={idx}
                                                                    className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full mr-1 mb-1"
                                                                >
                                                                    {subExam}
                                                                </span>
                                                            ))
                                                        ) : (
                                                            <span className="text-gray-400 text-sm">কোন সাব এক্সাম নেই</span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-500">
                                                        {formatDate(examGroup.createdAt)}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <button
                                                        onClick={() => handleEditExamGroup(examGroup)}
                                                        className="text-blue-600 hover:text-blue-900 mr-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded px-3 py-1 transition-colors duration-200"
                                                    >
                                                        এডিট
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteExamGroup(examGroup._id)}
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
                        )}

                        {/* Summary */}
                        {examGroups.length > 0 && (
                            <div className="mt-6 bg-gray-50 border border-gray-200 rounded-lg p-4">
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-[#1e90c9]">{examGroups.length}</div>
                                        <div className="text-gray-600">মোট এক্সাম গ্রুপ</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-[#1e90c9]">
                                            {new Set(examGroups.flatMap(eg => eg.subExams || [])).size}
                                        </div>
                                        <div className="text-gray-600">ইউনিক সাব এক্সাম</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-[#1e90c9]">
                                            {new Set(examGroups.map(eg => eg.mainExam)).size}
                                        </div>
                                        <div className="text-gray-600">ইউনিক মেইন এক্সাম</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-[#1e90c9]">
                                            {examGroups.reduce((total, eg) => total + (eg.subExams?.length || 0), 0)}
                                        </div>
                                        <div className="text-gray-600">মোট সাব এক্সাম</div>
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

export default ExamGroup;