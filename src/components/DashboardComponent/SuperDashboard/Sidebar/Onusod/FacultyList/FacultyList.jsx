import { useEffect, useState } from 'react';
import axiosInstance from '../../../../../../hooks/axiosInstance/axiosInstance';
import MainButton from '../../../../../sharedItems/Mainbutton/Mainbutton';
import NewFaculty from '../NewFaculty/NewFaculty';


const FacultyList = () => {
    const [faculties, setFaculties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingFaculty, setEditingFaculty] = useState(null);

    // Fetch faculties
    const fetchFaculties = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get('/faculty');
            if (response.data && response.data.success) {
                setFaculties(response.data.data || []);
            } else {
                setError('ফ্যাকাল্টি লোড করতে সমস্যা হয়েছে');
            }
        } catch (err) {
            setError('ফ্যাকাল্টি লোড করতে সমস্যা হয়েছে');
            console.error('Error fetching faculties:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFaculties();
    }, []);

    // Handle delete faculty
    const handleDeleteFaculty = async (id) => {
        if (!window.confirm('আপনি কি এই অনুষদ ডিলিট করতে চান?')) {
            return;
        }

        try {
            const response = await axiosInstance.delete(`/faculty/${id}`);
            if (response.data && response.data.success) {
                fetchFaculties(); // Refresh list
            } else {
                setError('অনুষদ ডিলিট করতে সমস্যা হয়েছে');
            }
        } catch (err) {
            setError('অনুষদ ডিলিট করতে সমস্যা হয়েছে');
            console.error('Error deleting faculty:', err);
        }
    };

    // Handle edit faculty
    const handleEditFaculty = (faculty) => {
        setEditingFaculty(faculty);
        setShowAddForm(true);
    };

    // Handle form close
    const handleFormClose = () => {
        setShowAddForm(false);
        setEditingFaculty(null);
        fetchFaculties(); // Refresh list
    };

    // Truncate description for table view
    const truncateDescription = (description) => {
        if (!description) return '';
        const strippedText = description.replace(/<[^>]*>/g, '');
        return strippedText.length > 100 
            ? strippedText.substring(0, 100) + '...' 
            : strippedText;
    };

    // Format date in Bengali
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('bn-BD', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    // যদি ফর্ম শো করতে হয়
    if (showAddForm) {
        return (
            <NewFaculty 
                faculty={editingFaculty}
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
                                অনুষদ তালিকা
                            </h1>
                        </div>
                        <MainButton
                            onClick={() => setShowAddForm(true)}
                        >
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
                            </svg>
                            <span>নতুন অনুষদ</span>
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
                        ) : faculties.length === 0 ? (
                            <div className="text-center py-12">
                                <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
                                </svg>
                                <h3 className="text-lg font-medium text-gray-900 mb-2">কোন অনুষদ নেই</h3>
                                <p className="text-gray-500 mb-4">এখনও কোন অনুষদ যোগ করা হয়নি</p>
                                <button
                                    onClick={() => setShowAddForm(true)}
                                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200"
                                >
                                    প্রথম অনুষদ যোগ করুন
                                </button>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                অনুষদের নাম
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                অনুষদের বর্ণনা
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                তৈরি হয়েছে
                                            </th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                কাজ
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {faculties.map((faculty) => (
                                            <tr key={faculty._id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {faculty.name}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-sm text-gray-900 max-w-md">
                                                        {truncateDescription(faculty.description)}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-500">
                                                        {formatDate(faculty.createdAt)}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <div className="flex justify-end space-x-3">
                                                        <button
                                                            onClick={() => handleEditFaculty(faculty)}
                                                            className="text-blue-600 hover:text-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded px-3 py-1 bg-blue-50 hover:bg-blue-100 transition-colors duration-200"
                                                        >
                                                            এডিট
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteFaculty(faculty._id)}
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
                        {faculties.length > 0 && (
                            <div className="mt-6 bg-gray-50 border border-gray-200 rounded-lg p-4">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-blue-600">{faculties.length}</div>
                                        <div className="text-gray-600">মোট অনুষদ</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-green-600">
                                            {new Set(faculties.map(f => f.name)).size}
                                        </div>
                                        <div className="text-gray-600">ইউনিক নাম</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-purple-600">
                                            {Math.ceil(faculties.reduce((acc, f) => acc + (f.description ? f.description.length : 0), 0) / faculties.length) || 0}
                                        </div>
                                        <div className="text-gray-600">গড় বর্ণনার দৈর্ঘ্য</div>
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

export default FacultyList;