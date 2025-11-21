import { useEffect, useState } from 'react';
import { FaArrowLeft, FaEdit, FaPlus, FaTrash } from 'react-icons/fa';
import Swal from 'sweetalert2';
import axiosInstance from '../../../../../../hooks/axiosInstance/axiosInstance';
import Loader from '../../../../../sharedItems/Loader/Loader';
import MainButton from '../../../../../sharedItems/Mainbutton/Mainbutton';
import AddNewExpenseCategory from './AddNewExpenseCategory/AddNewExpenseCategory';


const ExpenseCategory = ({ onBack }) => {
    const [expenseCategories, setExpenseCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);

    useEffect(() => {
        if (!showAddForm) {
            fetchExpenseCategories();
        }
    }, [showAddForm]);

    const fetchExpenseCategories = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get('/expense-category');
            
            if (response.data.success) {
                setExpenseCategories(response.data.data || []);
            }
        } catch (error) {
            console.error('Error fetching expense categories:', error);
            showSweetAlert('error', 'খরচের ক্যাটাগরি লোড করতে সমস্যা হয়েছে');
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

    const handleEdit = (category) => {
        setEditingCategory(category);
        setShowAddForm(true);
    };

    const handleDelete = async (categoryId) => {
        const result = await Swal.fire({
            title: 'আপনি কি নিশ্চিত?',
            text: "এই খরচের ক্যাটাগরিটি ডিলিট হয়ে যাবে!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'হ্যাঁ, ডিলিট করুন!',
            cancelButtonText: 'বাতিল করুন'
        });

        if (result.isConfirmed) {
            try {
                const response = await axiosInstance.delete(`/expense-category/${categoryId}`);
                if (response.data.success) {
                    showSweetAlert('success', 'খরচের ক্যাটাগরি সফলভাবে ডিলিট হয়েছে');
                    fetchExpenseCategories();
                }
            } catch (error) {
                console.error('Error deleting expense category:', error);
                showSweetAlert('error', 'খরচের ক্যাটাগরি ডিলিট করতে সমস্যা হয়েছে');
            }
        }
    };

    const handleToggleStatus = async (categoryId, currentStatus) => {
        try {
            const response = await axiosInstance.patch(`/expense-category/${categoryId}/toggle-status`);
            if (response.data.success) {
                showSweetAlert('success', response.data.message);
                fetchExpenseCategories();
            }
        } catch (error) {
            console.error('Error toggling expense category status:', error);
            showSweetAlert('error', 'স্ট্যাটাস পরিবর্তন করতে সমস্যা হয়েছে');
        }
    };

    const handleAddNew = () => {
        setEditingCategory(null);
        setShowAddForm(true);
    };

    const handleBackToList = () => {
        setShowAddForm(false);
        setEditingCategory(null);
    };

    if (showAddForm) {
        return (
            <AddNewExpenseCategory 
                category={editingCategory}
                onBack={handleBackToList}
                onSuccess={() => {
                    setShowAddForm(false);
                    setEditingCategory(null);
                    fetchExpenseCategories();
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
                            খরচের ক্যাটাগরি ব্যবস্থাপনা
                        </h1>
                    </div>
                    <MainButton
                        onClick={handleAddNew}
                    >
                        <FaPlus className="text-sm mr-2" />
                        Add Expense Category
                    </MainButton>
                </div>
            </div>

            {/* Main Content */}
            <div className="p-4 sm:p-6 lg:p-8">
                <div className="max-w-full mx-auto">
                    {loading ? (
                        <div className="flex justify-center items-center py-12">
                            <Loader />
                            <p className="text-gray-600 ml-3">খরচের ক্যাটাগরি লোড হচ্ছে...</p>
                        </div>
                    ) : expenseCategories.length === 0 ? (
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 text-center">
                            <div className="text-4xl text-gray-400 mb-3">📊</div>
                            <h3 className="text-lg font-semibold text-gray-800 mb-2">
                                কোন খরচের ক্যাটাগরি পাওয়া যায়নি
                            </h3>
                            <p className="text-gray-600 text-sm mb-4">
                                নতুন খরচের ক্যাটাগরি তৈরি করুন
                            </p>
                            <MainButton
                                onClick={handleAddNew}
                            >
                                <FaPlus className="text-sm mr-2" />
                                নতুন খরচের ক্যাটাগরি তৈরি করুন
                            </MainButton>
                        </div>
                    ) : (
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                            {/* Table Header */}
                            <div className="px-6 py-4 border-b border-gray-200">
                                <h2 className="text-lg font-semibold text-gray-800">
                                    খরচের ক্যাটাগরি তালিকা ({expenseCategories.length}টি)
                                </h2>
                            </div>

                            {/* Table */}
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50 border-b border-gray-200">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                SL Number
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                নাম
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
                                        {expenseCategories.map((category, index) => (
                                            <tr key={category._id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <span className="text-gray-600 text-sm font-medium">
                                                        {index + 1}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div>
                                                        <p className="font-medium text-gray-800 text-sm">
                                                            {category.name}
                                                        </p>
                                                        <p className="text-xs text-gray-500">
                                                            তৈরি: {new Date(category.createdAt).toLocaleDateString('bn-BD')}
                                                        </p>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span
                                                        onClick={() => handleToggleStatus(category._id, category.isActive)}
                                                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full cursor-pointer ${
                                                            category.isActive 
                                                                ? 'bg-[#1e90c9] text-white hover:bg-green-200' 
                                                                : 'bg-red-100 text-red-800 hover:bg-red-200'
                                                        }`}
                                                    >
                                                        {category.isActive ? 'Active' : 'Inactive'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={() => handleEdit(category)}
                                                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                            title="এডিট করুন"
                                                        >
                                                            <FaEdit className="text-sm" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(category._id)}
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

export default ExpenseCategory;