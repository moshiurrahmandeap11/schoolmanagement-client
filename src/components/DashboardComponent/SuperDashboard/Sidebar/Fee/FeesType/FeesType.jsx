import { useEffect, useState } from 'react';
import { FaArrowLeft, FaCalendarAlt, FaEdit, FaMoneyBillWave, FaPlus, FaTrash } from 'react-icons/fa';
import Swal from 'sweetalert2';
import axiosInstance from '../../../../../../hooks/axiosInstance/axiosInstance';
import Loader from '../../../../../sharedItems/Loader/Loader';
import MainButton from '../../../../../sharedItems/Mainbutton/Mainbutton';
import AddNewFee from './AddNewFee/AddNewFee';


const FeesType = ({ onBack }) => {
    const [feeTypes, setFeeTypes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingFeeType, setEditingFeeType] = useState(null);

    useEffect(() => {
        if (!showAddForm) {
            fetchFeeTypes();
        }
    }, [showAddForm]);

    const fetchFeeTypes = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get('/fee-types');
            
            if (response.data.success) {
                setFeeTypes(response.data.data || []);
            }
        } catch (error) {
            console.error('Error fetching fee types:', error);
            showSweetAlert('error', 'ফি টাইপ লোড করতে সমস্যা হয়েছে');
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

    const handleEdit = (feeType) => {
        setEditingFeeType(feeType);
        setShowAddForm(true);
    };

    const handleDelete = async (feeTypeId) => {
        const result = await Swal.fire({
            title: 'আপনি কি নিশ্চিত?',
            text: "এই ফি টাইপ ডিলিট হয়ে যাবে!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'হ্যাঁ, ডিলিট করুন!',
            cancelButtonText: 'বাতিল করুন'
        });

        if (result.isConfirmed) {
            try {
                const response = await axiosInstance.delete(`/fee-types/${feeTypeId}`);
                if (response.data.success) {
                    showSweetAlert('success', 'ফি টাইপ সফলভাবে ডিলিট হয়েছে');
                    fetchFeeTypes();
                }
            } catch (error) {
                console.error('Error deleting fee type:', error);
                showSweetAlert('error', 'ফি টাইপ ডিলিট করতে সমস্যা হয়েছে');
            }
        }
    };

    const handleToggleStatus = async (feeTypeId, currentStatus) => {
        try {
            const response = await axiosInstance.patch(`/fee-types/${feeTypeId}/toggle-status`);
            if (response.data.success) {
                showSweetAlert('success', response.data.message);
                fetchFeeTypes();
            }
        } catch (error) {
            console.error('Error toggling fee type status:', error);
            showSweetAlert('error', 'স্ট্যাটাস পরিবর্তন করতে সমস্যা হয়েছে');
        }
    };

    const handleAddNew = () => {
        setEditingFeeType(null);
        setShowAddForm(true);
    };

    const handleBackToList = () => {
        setShowAddForm(false);
        setEditingFeeType(null);
    };

    if (showAddForm) {
        return (
            <AddNewFee 
                feeType={editingFeeType}
                onBack={handleBackToList}
                onSuccess={() => {
                    setShowAddForm(false);
                    setEditingFeeType(null);
                    fetchFeeTypes();
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
                            ফি টাইপ ব্যবস্থাপনা
                        </h1>
                    </div>
                    <MainButton
                        onClick={handleAddNew}
                    >
                        <FaPlus className="text-sm mr-2" />
                        নতুন ফি টাইপ
                    </MainButton>
                </div>
            </div>

            {/* Main Content */}
            <div className="p-4 sm:p-6 lg:p-8">
                <div className="max-w-full mx-auto">
                    {loading ? (
                        <div className="flex justify-center items-center py-12">
                            <Loader />
                            <p className="text-gray-600 ml-3">ফি টাইপ লোড হচ্ছে...</p>
                        </div>
                    ) : feeTypes.length === 0 ? (
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 text-center">
                            <div className="text-4xl text-gray-400 mb-3">💵</div>
                            <h3 className="text-lg font-semibold text-gray-800 mb-2">
                                কোন ফি টাইপ পাওয়া যায়নি
                            </h3>
                            <p className="text-gray-600 text-sm mb-4">
                                নতুন ফি টাইপ তৈরি করুন
                            </p>
                            <button
                                onClick={handleAddNew}
                                className="inline-flex items-center gap-2 px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-medium"
                            >
                                <FaPlus className="text-sm" />
                                নতুন ফি টাইপ তৈরি করুন
                            </button>
                        </div>
                    ) : (
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                            {/* Table Header */}
                            <div className="px-6 py-4 border-b border-gray-200">
                                <h2 className="text-lg font-semibold text-gray-800">
                                    ফি টাইপ তালিকা ({feeTypes.length}টি)
                                </h2>
                            </div>

                            {/* Table */}
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50 border-b border-gray-200">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                নাম
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                ক্লাস
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                সেশন
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                পরিমাণ
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                বিবরণ
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
                                        {feeTypes.map((feeType) => (
                                            <tr key={feeType._id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div>
                                                        <p className="font-medium text-gray-800 text-sm">
                                                            {feeType.name}
                                                        </p>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            {feeType.isMonthly && (
                                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                                                    মাসিক
                                                                </span>
                                                            )}
                                                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                                                                feeType.feeApplicable === 'all_students' 
                                                                    ? 'bg-green-100 text-green-800'
                                                                    : feeType.feeApplicable === 'new_students'
                                                                    ? 'bg-yellow-100 text-yellow-800'
                                                                    : 'bg-purple-100 text-purple-800'
                                                            }`}>
                                                                {feeType.feeApplicable === 'all_students' ? 'সব শিক্ষার্থী' : 
                                                                 feeType.feeApplicable === 'new_students' ? 'নতুন শিক্ষার্থী' : 'নির্দিষ্ট শিক্ষার্থী'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="inline-flex px-2 py-1 text-xs font-semibold bg-teal-100 text-teal-800 rounded-full">
                                                        {feeType.className}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="inline-flex px-2 py-1 text-xs font-semibold bg-indigo-100 text-indigo-800 rounded-full">
                                                        {feeType.sessionName}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <FaMoneyBillWave className="text-gray-400 text-sm" />
                                                        <span className="text-sm text-gray-800 font-semibold">
                                                            ৳{feeType.amount}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div 
                                                        className="text-sm text-gray-600 max-w-xs truncate"
                                                        title={feeType.description}
                                                    >
                                                        {feeType.description || 'কোন বিবরণ নেই'}
                                                    </div>
                                                    {feeType.feeEndsDate && (
                                                        <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
                                                            <FaCalendarAlt className="text-xs" />
                                                            শেষ: {new Date(feeType.feeEndsDate).toLocaleDateString('bn-BD')}
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span
                                                        onClick={() => handleToggleStatus(feeType._id, feeType.isActive)}
                                                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full cursor-pointer ${
                                                            feeType.isActive 
                                                                ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                                                                : 'bg-red-100 text-red-800 hover:bg-red-200'
                                                        }`}
                                                    >
                                                        {feeType.isActive ? 'Active' : 'Inactive'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={() => handleEdit(feeType)}
                                                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                            title="এডিট করুন"
                                                        >
                                                            <FaEdit className="text-sm" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(feeType._id)}
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

export default FeesType;