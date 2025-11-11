import { useEffect, useState } from 'react';
import { FaArrowLeft, FaEdit, FaExclamationTriangle, FaMoneyBillWave, FaPlus, FaTrash } from 'react-icons/fa';
import Swal from 'sweetalert2';
import axiosInstance from '../../../../../../hooks/axiosInstance/axiosInstance';
import Loader from '../../../../../sharedItems/Loader/Loader';
import AddAssignFines from './AddAssignFines/AddAssignFines';

const AssignFines = ({ onBack }) => {
    const [fines, setFines] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingFine, setEditingFine] = useState(null);

    useEffect(() => {
        if (!showAddForm) {
            fetchFines();
        }
    }, [showAddForm]);

    const fetchFines = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get('/assign-fines');
            
            if (response.data.success) {
                setFines(response.data.data || []);
            }
        } catch (error) {
            console.error('Error fetching fines:', error);
            showSweetAlert('error', 'জরিমানা লোড করতে সমস্যা হয়েছে');
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

    const handleEdit = (fine) => {
        setEditingFine(fine);
        setShowAddForm(true);
    };

    const handleDelete = async (fineId) => {
        const result = await Swal.fire({
            title: 'আপনি কি নিশ্চিত?',
            text: "এই জরিমানা ডিলিট হয়ে যাবে!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'হ্যাঁ, ডিলিট করুন!',
            cancelButtonText: 'বাতিল করুন'
        });

        if (result.isConfirmed) {
            try {
                const response = await axiosInstance.delete(`/assign-fines/${fineId}`);
                if (response.data.success) {
                    showSweetAlert('success', 'জরিমানা সফলভাবে ডিলিট হয়েছে');
                    fetchFines();
                }
            } catch (error) {
                console.error('Error deleting fine:', error);
                showSweetAlert('error', 'জরিমানা ডিলিট করতে সমস্যা হয়েছে');
            }
        }
    };

    const handleToggleStatus = async (fineId, currentStatus) => {
        try {
            const response = await axiosInstance.patch(`/assign-fines/${fineId}/toggle-status`);
            if (response.data.success) {
                showSweetAlert('success', response.data.message);
                fetchFines();
            }
        } catch (error) {
            console.error('Error toggling fine status:', error);
            showSweetAlert('error', 'স্ট্যাটাস পরিবর্তন করতে সমস্যা হয়েছে');
        }
    };

    const handleAddNew = () => {
        setEditingFine(null);
        setShowAddForm(true);
    };

    const handleBackToList = () => {
        setShowAddForm(false);
        setEditingFine(null);
    };

    if (showAddForm) {
        return (
            <AddAssignFines 
                fine={editingFine}
                onBack={handleBackToList}
                onSuccess={() => {
                    setShowAddForm(false);
                    setEditingFine(null);
                    fetchFines();
                }}
            />
        );
    }

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
                            জরিমানা ব্যবস্থাপনা
                        </h1>
                    </div>
                    <button
                        onClick={handleAddNew}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                    >
                        <FaPlus className="text-sm" />
                        Assign Fine
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="p-4 sm:p-6 lg:p-8">
                <div className="max-w-full mx-auto">
                    {loading ? (
                        <div className="flex justify-center items-center py-12">
                            <Loader />
                            <p className="text-gray-600 ml-3">জরিমানা লোড হচ্ছে...</p>
                        </div>
                    ) : fines.length === 0 ? (
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 text-center">
                            <div className="text-4xl text-gray-400 mb-3">⚖️</div>
                            <h3 className="text-lg font-semibold text-gray-800 mb-2">
                                কোন জরিমানা পাওয়া যায়নি
                            </h3>
                            <p className="text-gray-600 text-sm mb-4">
                                নতুন জরিমানা বরাদ্দ করুন
                            </p>
                            <button
                                onClick={handleAddNew}
                                className="inline-flex items-center gap-2 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                            >
                                <FaPlus className="text-sm" />
                                Assign Fine
                            </button>
                        </div>
                    ) : (
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                            {/* Table Header */}
                            <div className="px-6 py-4 border-b border-gray-200">
                                <h2 className="text-lg font-semibold text-gray-800">
                                    জরিমানা তালিকা ({fines.length}টি)
                                </h2>
                            </div>

                            {/* Table */}
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50 border-b border-gray-200">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                সেশন
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                ক্লাস
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                ব্যাচ
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                ফি টাইপ
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                জরিমানা
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                স্ট্যাটাস
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                এডিট / ডিলিট
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {fines.map((fine) => (
                                            <tr key={fine._id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <span className="inline-flex px-3 py-1 text-xs font-semibold bg-blue-100 text-blue-800 rounded-full">
                                                        {fine.sessionName}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="inline-flex px-3 py-1 text-xs font-semibold bg-indigo-100 text-indigo-800 rounded-full">
                                                        {fine.className}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                                                        fine.batchName 
                                                            ? 'bg-purple-100 text-purple-800' 
                                                            : 'bg-gray-100 text-gray-600'
                                                    }`}>
                                                        {fine.batchName || 'সকল ব্যাচ'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <FaMoneyBillWave className="text-gray-400 text-sm" />
                                                        <div>
                                                            <p className="font-medium text-sm text-gray-800">
                                                                {fine.feeTypeName}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <FaExclamationTriangle className="text-red-500 text-sm" />
                                                        <div>
                                                            <p className="font-medium text-sm text-gray-800">
                                                                {fine.fineTypeName}
                                                            </p>
                                                            <p className="text-xs font-semibold text-red-600">
                                                                ৳{fine.fineAmount}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span
                                                        onClick={() => handleToggleStatus(fine._id, fine.isActive)}
                                                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full cursor-pointer ${
                                                            fine.isActive 
                                                                ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                                                                : 'bg-red-100 text-red-800 hover:bg-red-200'
                                                        }`}
                                                    >
                                                        {fine.isActive ? 'Active' : 'Inactive'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={() => handleEdit(fine)}
                                                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                            title="এডিট করুন"
                                                        >
                                                            <FaEdit className="text-sm" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(fine._id)}
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
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AssignFines;