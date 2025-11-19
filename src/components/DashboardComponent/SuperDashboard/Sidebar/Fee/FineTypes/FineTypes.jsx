import { useEffect, useState } from 'react';
import { FaArrowLeft, FaEdit, FaMoneyBillWave, FaPercentage, FaPlus, FaTrash } from 'react-icons/fa';
import Swal from 'sweetalert2';
import axiosInstance from '../../../../../../hooks/axiosInstance/axiosInstance';
import Loader from '../../../../../sharedItems/Loader/Loader';
import MainButton from '../../../../../sharedItems/Mainbutton/Mainbutton';
import AddNewFine from './AddNewFine/AddNewFine';


const FineTypes = ({ onBack }) => {
    const [fineTypes, setFineTypes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingFineType, setEditingFineType] = useState(null);

    useEffect(() => {
        if (!showAddForm) {
            fetchFineTypes();
        }
    }, [showAddForm]);

    const fetchFineTypes = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get('/fine-types');
            
            if (response.data.success) {
                setFineTypes(response.data.data || []);
            }
        } catch (error) {
            console.error('Error fetching fine types:', error);
            showSweetAlert('error', 'ফাইন টাইপ লোড করতে সমস্যা হয়েছে');
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

    const handleEdit = (fineType) => {
        setEditingFineType(fineType);
        setShowAddForm(true);
    };

    const handleDelete = async (fineTypeId) => {
        const result = await Swal.fire({
            title: 'আপনি কি নিশ্চিত?',
            text: "এই ফাইন টাইপ ডিলিট হয়ে যাবে!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'হ্যাঁ, ডিলিট করুন!',
            cancelButtonText: 'বাতিল করুন'
        });

        if (result.isConfirmed) {
            try {
                const response = await axiosInstance.delete(`/fine-types/${fineTypeId}`);
                if (response.data.success) {
                    showSweetAlert('success', 'ফাইন টাইপ সফলভাবে ডিলিট হয়েছে');
                    fetchFineTypes();
                }
            } catch (error) {
                console.error('Error deleting fine type:', error);
                showSweetAlert('error', 'ফাইন টাইপ ডিলিট করতে সমস্যা হয়েছে');
            }
        }
    };

    const handleToggleStatus = async (fineTypeId, currentStatus) => {
        try {
            const response = await axiosInstance.patch(`/fine-types/${fineTypeId}/toggle-status`);
            if (response.data.success) {
                showSweetAlert('success', response.data.message);
                fetchFineTypes();
            }
        } catch (error) {
            console.error('Error toggling fine type status:', error);
            showSweetAlert('error', 'স্ট্যাটাস পরিবর্তন করতে সমস্যা হয়েছে');
        }
    };

    const handleAddNew = () => {
        setEditingFineType(null);
        setShowAddForm(true);
    };

    const handleBackToList = () => {
        setShowAddForm(false);
        setEditingFineType(null);
    };

    if (showAddForm) {
        return (
            <AddNewFine 
                fineType={editingFineType}
                onBack={handleBackToList}
                onSuccess={() => {
                    setShowAddForm(false);
                    setEditingFineType(null);
                    fetchFineTypes();
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
                            ফাইন টাইপ ব্যবস্থাপনা
                        </h1>
                    </div>
                    <MainButton
                        onClick={handleAddNew}
                    >
                        <FaPlus className="text-sm mr-2" />
                        নতুন ফাইন টাইপ
                    </MainButton>
                </div>
            </div>

            {/* Main Content */}
            <div className="p-4 sm:p-6 lg:p-8">
                <div className="max-w-full mx-auto">
                    {loading ? (
                        <div className="flex justify-center items-center py-12">
                            <Loader />
                            <p className="text-gray-600 ml-3">ফাইন টাইপ লোড হচ্ছে...</p>
                        </div>
                    ) : fineTypes.length === 0 ? (
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 text-center">
                            <div className="text-4xl text-gray-400 mb-3">💰</div>
                            <h3 className="text-lg font-semibold text-gray-800 mb-2">
                                কোন ফাইন টাইপ পাওয়া যায়নি
                            </h3>
                            <p className="text-gray-600 text-sm mb-4">
                                নতুন ফাইন টাইপ তৈরি করুন
                            </p>
                            <button
                                onClick={handleAddNew}
                                className="inline-flex items-center gap-2 px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium"
                            >
                                <FaPlus className="text-sm" />
                                নতুন ফাইন টাইপ তৈরি করুন
                            </button>
                        </div>
                    ) : (
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                            {/* Table Header */}
                            <div className="px-6 py-4 border-b border-gray-200">
                                <h2 className="text-lg font-semibold text-gray-800">
                                    ফাইন টাইপ তালিকা ({fineTypes.length}টি)
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
                                                দিনের পর দিন
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                জরিমানার পরিমাণ
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                শতকরা পরিমাণ
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
                                        {fineTypes.map((fineType) => (
                                            <tr key={fineType._id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div>
                                                        <p className="font-medium text-gray-800 text-sm">
                                                            {fineType.name}
                                                        </p>
                                                        <p className="text-xs text-gray-500">
                                                            {fineType.isAbsenceFine && (
                                                                <span className="text-red-600">অনুপস্থিত জরিমানা</span>
                                                            )}
                                                            {fineType.fixedDate && (
                                                                <span> | নির্ধারিত তারিখ: {new Date(fineType.fixedDate).toLocaleDateString('bn-BD')}</span>
                                                            )}
                                                        </p>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${
                                                        fineType.isParcel 
                                                            ? 'bg-purple-100 text-purple-800' 
                                                            : 'bg-gray-100 text-gray-800'
                                                    }`}>
                                                        {fineType.isParcel ? 'শতকরা' : 'নির্দিষ্ট'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <FaMoneyBillWave className="text-gray-400 text-sm" />
                                                        <span className="text-sm text-gray-800 font-semibold">
                                                            {fineType.isParcel ? 'N/A' : `৳${fineType.fineAmount}`}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <FaPercentage className="text-gray-400 text-sm" />
                                                        <span className="text-sm text-gray-800 font-semibold">
                                                            {fineType.isParcel ? `${fineType.percentage}%` : 'N/A'}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span
                                                        onClick={() => handleToggleStatus(fineType._id, fineType.isActive)}
                                                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full cursor-pointer ${
                                                            fineType.isActive 
                                                                ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                                                                : 'bg-red-100 text-red-800 hover:bg-red-200'
                                                        }`}
                                                    >
                                                        {fineType.isActive ? 'Active' : 'Inactive'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={() => handleEdit(fineType)}
                                                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                            title="এডিট করুন"
                                                        >
                                                            <FaEdit className="text-sm" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(fineType._id)}
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

export default FineTypes;