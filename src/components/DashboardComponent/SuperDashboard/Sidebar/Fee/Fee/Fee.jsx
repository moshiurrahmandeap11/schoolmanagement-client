import { useEffect, useState } from 'react';
import { FaArrowLeft, FaCalendarAlt, FaEdit, FaMoneyBillWave, FaPlus, FaTrash } from 'react-icons/fa';
import Swal from 'sweetalert2';
import axiosInstance from '../../../../../../hooks/axiosInstance/axiosInstance';
import Loader from '../../../../../sharedItems/Loader/Loader';
import MainButton from '../../../../../sharedItems/Mainbutton/Mainbutton';
import AddNewFee from './AddNewFee/AddNewFee';

const Fee = ({ onBack }) => {
    const [fees, setFees] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingFee, setEditingFee] = useState(null);

    useEffect(() => {
        if (!showAddForm) {
            fetchFees();
        }
    }, [showAddForm]);

    const fetchFees = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get('/fee');
            
            if (response.data.success) {
                setFees(response.data.data || []);
            }
        } catch (error) {
            console.error('Error fetching fees:', error);
            showSweetAlert('error', 'বরাদ্দ ফি লোড করতে সমস্যা হয়েছে');
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

    const handleEdit = (fee) => {
        setEditingFee(fee);
        setShowAddForm(true);
    };

    const handleDelete = async (feeId) => {
        const result = await Swal.fire({
            title: 'আপনি কি নিশ্চিত?',
            text: "এই বরাদ্দ ফি ডিলিট হয়ে যাবে!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'হ্যাঁ, ডিলিট করুন!',
            cancelButtonText: 'বাতিল করুন'
        });

        if (result.isConfirmed) {
            try {
                const response = await axiosInstance.delete(`/fee/${feeId}`);
                if (response.data.success) {
                    showSweetAlert('success', 'বরাদ্দ ফি সফলভাবে ডিলিট হয়েছে');
                    fetchFees();
                }
            } catch (error) {
                console.error('Error deleting fee:', error);
                showSweetAlert('error', 'বরাদ্দ ফি ডিলিট করতে সমস্যা হয়েছে');
            }
        }
    };

    const handleToggleStatus = async (feeId, currentStatus) => {
        try {
            const response = await axiosInstance.patch(`/fee/${feeId}/toggle-status`);
            if (response.data.success) {
                showSweetAlert('success', response.data.message);
                fetchFees();
            }
        } catch (error) {
            console.error('Error toggling fee status:', error);
            showSweetAlert('error', 'স্ট্যাটাস পরিবর্তন করতে সমস্যা হয়েছে');
        }
    };

    const handleAddNew = () => {
        setEditingFee(null);
        setShowAddForm(true);
    };

    const handleBackToList = () => {
        setShowAddForm(false);
        setEditingFee(null);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('bn-BD');
    };

    if (showAddForm) {
        return (
            <AddNewFee 
                fee={editingFee}
                onBack={handleBackToList}
                onSuccess={() => {
                    setShowAddForm(false);
                    setEditingFee(null);
                    fetchFees();
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
                            বরাদ্দ ফি ব্যবস্থাপনা
                        </h1>
                    </div>
                    <MainButton
                        onClick={handleAddNew}
                    >
                        <FaPlus className="text-sm mr-2" />
                        নতুন বরাদ্দ ফি
                    </MainButton>
                </div>
            </div>

            {/* Main Content */}
            <div className="p-4 sm:p-6 lg:p-8">
                <div className="max-w-full mx-auto">
                    {loading ? (
                        <div className="flex justify-center items-center py-12">
                            <Loader />
                            <p className="text-gray-600 ml-3">বরাদ্দ ফি লোড হচ্ছে...</p>
                        </div>
                    ) : fees.length === 0 ? (
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 text-center">
                            <div className="text-4xl text-gray-400 mb-3">💰</div>
                            <h3 className="text-lg font-semibold text-gray-800 mb-2">
                                কোন বরাদ্দ ফি পাওয়া যায়নি
                            </h3>
                            <p className="text-gray-600 text-sm mb-4">
                                নতুন বরাদ্দ ফি তৈরি করুন
                            </p>
                            <MainButton
                                onClick={handleAddNew}
    
                            >
                                <FaPlus className="text-sm mr-2" />
                                নতুন বরাদ্দ ফি তৈরি করুন
                            </MainButton>
                        </div>
                    ) : (
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                            {/* Table Header */}
                            <div className="px-6 py-4 border-b border-gray-200">
                                <h2 className="text-lg font-semibold text-gray-800">
                                    বরাদ্দ ফি তালিকা ({fees.length}টি)
                                </h2>
                            </div>

                            {/* Table */}
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50 border-b border-gray-200">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                ক্লাস
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                সেশন
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                ফি
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                তারিখসমূহ
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
                                        {fees.map((fee) => (
                                            <tr key={fee._id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <span className="inline-flex px-3 py-1 text-xs font-semibold  rounded-full">
                                                        {fee.className}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="inline-flex px-3 py-1 text-xs font-semibold bg-blue-100 text-blue-800 rounded-full">
                                                        {fee.sessionName}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <FaMoneyBillWave className="text-gray-400 text-sm" />
                                                        <div>
                                                            <p className="font-medium text-sm text-gray-800">
                                                                {fee.feeTypeName}
                                                            </p>
                                                            <p className="text-xs text-gray-600">
                                                                ৳{fee.feeTypeAmount}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-sm text-gray-800">
                                                        <div className="flex items-center gap-1">
                                                            <FaCalendarAlt className="text-xs text-gray-400" />
                                                            শুরু: {formatDate(fee.feeApplicableFrom)}
                                                        </div>
                                                        {fee.feeEndDate && (
                                                            <div className="flex items-center gap-1 mt-1 text-xs text-gray-600">
                                                                <FaCalendarAlt className="text-xs text-gray-400" />
                                                                শেষ: {formatDate(fee.feeEndDate)}
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span
                                                        onClick={() => handleToggleStatus(fee._id, fee.isActive)}
                                                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full cursor-pointer ${
                                                            fee.isActive 
                                                                ? 'bg-[#1e90c9] text-white' 
                                                                : 'bg-red-100 text-red-800 hover:bg-red-200'
                                                        }`}
                                                    >
                                                        {fee.isActive ? 'Active' : 'Inactive'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={() => handleEdit(fee)}
                                                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                            title="এডিট করুন"
                                                        >
                                                            <FaEdit className="text-sm" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(fee._id)}
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

export default Fee;