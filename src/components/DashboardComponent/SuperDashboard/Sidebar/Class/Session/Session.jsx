import { useEffect, useState } from 'react';
import { FaCalendarAlt, FaEdit, FaPlus, FaTrash } from 'react-icons/fa';
import Swal from 'sweetalert2';
import axiosInstance from '../../../../../../hooks/axiosInstance/axiosInstance';
import AddNewSession from './AddNewSession/AddNewSession';


const Session = () => {
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingSession, setEditingSession] = useState(null);

    useEffect(() => {
        fetchSessions();
    }, []);

    const fetchSessions = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get('/sessions');
            
            if (response.data.success) {
                setSessions(response.data.data);
            } else {
                showSweetAlert('error', 'সেশন লোড করতে সমস্যা হয়েছে');
            }
        } catch (error) {
            console.error('Error fetching sessions:', error);
            showSweetAlert('error', 'সেশন লোড করতে সমস্যা হয়েছে');
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

    const handleEdit = (session) => {
        setEditingSession(session);
        setShowAddForm(true);
    };

    const handleDelete = async (session) => {
        const result = await Swal.fire({
            title: 'আপনি কি নিশ্চিত?',
            text: `আপনি "${session.name}" সেশনটি ডিলিট করতে চান?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'হ্যাঁ, ডিলিট করুন',
            cancelButtonText: 'বাতিল করুন',
            reverseButtons: true
        });

        if (result.isConfirmed) {
            try {
                const response = await axiosInstance.delete(`/sessions/${session._id}`);
                
                if (response.data.success) {
                    showSweetAlert('success', 'সেশন সফলভাবে ডিলিট হয়েছে');
                    fetchSessions();
                } else {
                    showSweetAlert('error', response.data.message);
                }
            } catch (error) {
                console.error('Error deleting session:', error);
                const errorMessage = error.response?.data?.message || 'সেশন ডিলিট করতে সমস্যা হয়েছে';
                showSweetAlert('error', errorMessage);
            }
        }
    };

    const handleSuccess = () => {
        setShowAddForm(false);
        setEditingSession(null);
        fetchSessions();
    };

    const handleBack = () => {
        setShowAddForm(false);
        setEditingSession(null);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('bn-BD');
    };

    if (showAddForm) {
        return (
            <AddNewSession 
                onBack={handleBack}
                onSuccess={handleSuccess}
                editData={editingSession}
            />
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 sm:p-6">
                    <div className="flex items-center gap-3">
                        <FaCalendarAlt className="text-2xl text-blue-600" />
                        <h1 className="text-2xl font-bold text-gray-800">
                            সেশন ব্যবস্থাপনা
                        </h1>
                    </div>
                    <button
                        onClick={() => setShowAddForm(true)}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium flex items-center gap-2"
                    >
                        <FaPlus className="text-sm" />
                        নতুন সেশন
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="p-4 sm:p-6 lg:p-8">
                <div className="max-w-full mx-auto">


                    {/* Sessions Table */}
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-200">
                        <div className="p-6 border-b border-gray-200">
                            <h2 className="text-lg font-semibold text-gray-800">
                                সকল সেশন
                            </h2>
                        </div>

                        {loading ? (
                            <div className="p-8 text-center">
                                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                <p className="mt-2 text-gray-600">লোড হচ্ছে...</p>
                            </div>
                        ) : sessions.length === 0 ? (
                            <div className="p-8 text-center">
                                <FaCalendarAlt className="mx-auto text-4xl text-gray-400 mb-3" />
                                <p className="text-gray-600">কোন সেশন পাওয়া যায়নি</p>
                                <button
                                    onClick={() => setShowAddForm(true)}
                                    className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
                                >
                                    প্রথম সেশন তৈরি করুন
                                </button>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="bg-gray-50 border-b border-gray-200">
                                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                সেশন
                                            </th>
                                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                শুরু তারিখ
                                            </th>
                                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                শেষ তারিখ
                                            </th>
                                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                কার্যদিবস
                                            </th>
                                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                অবস্থা
                                            </th>
                                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                এডিট / ডিলিট
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {sessions.map((session) => (
                                            <tr key={session._id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <span className="text-sm font-medium text-gray-900">
                                                            {session.name}
                                                        </span>
                                                        {session.isCurrent && (
                                                            <span className="ml-2 px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                                                                বর্তমান
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                    {formatDate(session.startDate)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                    {formatDate(session.endDate)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                    {session.totalWorkingDays} দিন
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-2 py-1 text-xs rounded-full ${
                                                        session.isActive 
                                                            ? 'bg-green-100 text-green-800' 
                                                            : 'bg-red-100 text-red-800'
                                                    }`}>
                                                        {session.isActive ? 'সক্রিয়' : 'নিষ্ক্রিয়'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={() => handleEdit(session)}
                                                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                            title="এডিট করুন"
                                                        >
                                                            <FaEdit className="text-sm" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(session)}
                                                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                            title="ডিলিট করুন"
                                                        >
                                                            <FaTrash className="text-sm" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Session;