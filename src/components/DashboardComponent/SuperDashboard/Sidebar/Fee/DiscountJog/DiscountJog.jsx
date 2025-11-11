import { useEffect, useState } from 'react';
import { FaArrowLeft, FaEdit, FaMoneyBillWave, FaPercentage, FaPlus, FaTrash } from 'react-icons/fa';
import Swal from 'sweetalert2';
import axiosInstance from '../../../../../../hooks/axiosInstance/axiosInstance';
import Loader from '../../../../../sharedItems/Loader/Loader';
import AddNewDiscountJog from './AddNewDiscountJog/AddNewDiscountJog';

const DiscountJog = ({ onBack }) => {
    const [discounts, setDiscounts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingDiscount, setEditingDiscount] = useState(null);

    useEffect(() => {
        if (!showAddForm) {
            fetchDiscounts();
        }
    }, [showAddForm]);

    const fetchDiscounts = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get('/discounts');
            
            if (response.data.success) {
                setDiscounts(response.data.data || []);
            }
        } catch (error) {
            console.error('Error fetching discounts:', error);
            showSweetAlert('error', 'ডিসকাউন্ট লোড করতে সমস্যা হয়েছে');
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

    const handleEdit = (discount) => {
        setEditingDiscount(discount);
        setShowAddForm(true);
    };

    const handleDelete = async (discountId) => {
        const result = await Swal.fire({
            title: 'আপনি কি নিশ্চিত?',
            text: "এই ডিসকাউন্ট ডিলিট হয়ে যাবে!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'হ্যাঁ, ডিলিট করুন!',
            cancelButtonText: 'বাতিল করুন'
        });

        if (result.isConfirmed) {
            try {
                const response = await axiosInstance.delete(`/discounts/${discountId}`);
                if (response.data.success) {
                    showSweetAlert('success', 'ডিসকাউন্ট সফলভাবে ডিলিট হয়েছে');
                    fetchDiscounts();
                }
            } catch (error) {
                console.error('Error deleting discount:', error);
                showSweetAlert('error', 'ডিসকাউন্ট ডিলিট করতে সমস্যা হয়েছে');
            }
        }
    };

    const handleToggleStatus = async (discountId, currentStatus) => {
        try {
            const response = await axiosInstance.patch(`/discounts/${discountId}/toggle-status`);
            if (response.data.success) {
                showSweetAlert('success', response.data.message);
                fetchDiscounts();
            }
        } catch (error) {
            console.error('Error toggling discount status:', error);
            showSweetAlert('error', 'স্ট্যাটাস পরিবর্তন করতে সমস্যা হয়েছে');
        }
    };

    const handleAddNew = () => {
        setEditingDiscount(null);
        setShowAddForm(true);
    };

    const handleBackToList = () => {
        setShowAddForm(false);
        setEditingDiscount(null);
    };

    const getDiscountDisplay = (discount) => {
        if (discount.discountAmount > 0) {
            return `৳${discount.discountAmount}`;
        } else if (discount.discountPercentage > 0) {
            return `${discount.discountPercentage}%`;
        }
        return 'N/A';
    };

    if (showAddForm) {
        return (
            <AddNewDiscountJog 
                discount={editingDiscount}
                onBack={handleBackToList}
                onSuccess={() => {
                    setShowAddForm(false);
                    setEditingDiscount(null);
                    fetchDiscounts();
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
                            ডিসকাউন্ট ব্যবস্থাপনা
                        </h1>
                    </div>
                    <button
                        onClick={handleAddNew}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                    >
                        <FaPlus className="text-sm" />
                        ডিসকাউন্ট বরাদ্দ করুন
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="p-4 sm:p-6 lg:p-8">
                <div className="max-w-full mx-auto">
                    {loading ? (
                        <div className="flex justify-center items-center py-12">
                            <Loader />
                            <p className="text-gray-600 ml-3">ডিসকাউন্ট লোড হচ্ছে...</p>
                        </div>
                    ) : discounts.length === 0 ? (
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 text-center">
                            <div className="text-4xl text-gray-400 mb-3">🎁</div>
                            <h3 className="text-lg font-semibold text-gray-800 mb-2">
                                কোন ডিসকাউন্ট পাওয়া যায়নি
                            </h3>
                            <p className="text-gray-600 text-sm mb-4">
                                নতুন ডিসকাউন্ট বরাদ্দ করুন
                            </p>
                            <button
                                onClick={handleAddNew}
                                className="inline-flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                            >
                                <FaPlus className="text-sm" />
                                ডিসকাউন্ট বরাদ্দ করুন
                            </button>
                        </div>
                    ) : (
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                            {/* Table Header */}
                            <div className="px-6 py-4 border-b border-gray-200">
                                <h2 className="text-lg font-semibold text-gray-800">
                                    ডিসকাউন্ট তালিকা ({discounts.length}টি)
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
                                                ডিসকাউন্ট
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
                                        {discounts.map((discount) => (
                                            <tr key={discount._id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <span className="inline-flex px-3 py-1 text-xs font-semibold bg-blue-100 text-blue-800 rounded-full">
                                                        {discount.sessionName}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="inline-flex px-3 py-1 text-xs font-semibold bg-indigo-100 text-indigo-800 rounded-full">
                                                        {discount.className}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                                                        discount.batchName 
                                                            ? 'bg-purple-100 text-purple-800' 
                                                            : 'bg-gray-100 text-gray-600'
                                                    }`}>
                                                        {discount.batchName || 'সকল ব্যাচ'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <FaMoneyBillWave className="text-gray-400 text-sm" />
                                                        <div>
                                                            <p className="font-medium text-sm text-gray-800">
                                                                {discount.feeTypeName}
                                                            </p>
                                                            <p className="text-xs text-gray-600">
                                                                {discount.discountTypeName}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <FaPercentage className="text-green-500 text-sm" />
                                                        <span className="font-semibold text-green-700">
                                                            {getDiscountDisplay(discount)}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span
                                                        onClick={() => handleToggleStatus(discount._id, discount.isActive)}
                                                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full cursor-pointer ${
                                                            discount.isActive 
                                                                ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                                                                : 'bg-red-100 text-red-800 hover:bg-red-200'
                                                        }`}
                                                    >
                                                        {discount.isActive ? 'Active' : 'Inactive'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={() => handleEdit(discount)}
                                                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                            title="এডিট করুন"
                                                        >
                                                            <FaEdit className="text-sm" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(discount._id)}
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

export default DiscountJog;