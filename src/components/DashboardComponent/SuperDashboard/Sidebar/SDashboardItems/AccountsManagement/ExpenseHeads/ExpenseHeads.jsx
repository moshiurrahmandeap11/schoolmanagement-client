import { useEffect, useState } from 'react';
import { FaArrowLeft, FaEdit, FaPlus, FaTrash } from 'react-icons/fa';
import Swal from 'sweetalert2';
import axiosInstance from '../../../../../../../hooks/axiosInstance/axiosInstance';
import Loader from '../../../../../../sharedItems/Loader/Loader';
import MainButton from '../../../../../../sharedItems/Mainbutton/Mainbutton';
import AddNewExpenseHead from './AddNewExpenseHead/AddNewExpenseHead';


const ExpenseHeads = ({ onBack }) => {
    const [expenseHeads, setExpenseHeads] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingExpenseHead, setEditingExpenseHead] = useState(null);

    useEffect(() => {
        if (!showAddForm) {
            fetchExpenseHeads();
        }
    }, [showAddForm]);

    const fetchExpenseHeads = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get('/expense-heads');
            
            if (response.data.success) {
                setExpenseHeads(response.data.data || []);
            }
        } catch (error) {
            console.error('Error fetching expense heads:', error);
            showSweetAlert('error', 'খরচের হেড লোড করতে সমস্যা হয়েছে');
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

    const handleEdit = (expenseHead) => {
        setEditingExpenseHead(expenseHead);
        setShowAddForm(true);
    };

    const handleDelete = async (expenseHeadId) => {
        const result = await Swal.fire({
            title: 'আপনি কি নিশ্চিত?',
            text: "এই খরচের হেডটি ডিলিট হয়ে যাবে!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'হ্যাঁ, ডিলিট করুন!',
            cancelButtonText: 'বাতিল করুন'
        });

        if (result.isConfirmed) {
            try {
                const response = await axiosInstance.delete(`/expense-heads/${expenseHeadId}`);
                if (response.data.success) {
                    showSweetAlert('success', 'খরচের হেড সফলভাবে ডিলিট হয়েছে');
                    fetchExpenseHeads();
                }
            } catch (error) {
                console.error('Error deleting expense head:', error);
                showSweetAlert('error', 'খরচের হেড ডিলিট করতে সমস্যা হয়েছে');
            }
        }
    };

    const handleToggleStatus = async (expenseHeadId, currentStatus) => {
        try {
            const response = await axiosInstance.patch(`/expense-heads/${expenseHeadId}/toggle-status`);
            if (response.data.success) {
                showSweetAlert('success', response.data.message);
                fetchExpenseHeads();
            }
        } catch (error) {
            console.error('Error toggling expense head status:', error);
            showSweetAlert('error', 'স্ট্যাটাস পরিবর্তন করতে সমস্যা হয়েছে');
        }
    };

    const handleAddNew = () => {
        setEditingExpenseHead(null);
        setShowAddForm(true);
    };

    const handleBackToList = () => {
        setShowAddForm(false);
        setEditingExpenseHead(null);
    };

    if (showAddForm) {
        return (
            <AddNewExpenseHead 
                expenseHead={editingExpenseHead}
                onBack={handleBackToList}
                onSuccess={() => {
                    setShowAddForm(false);
                    setEditingExpenseHead(null);
                    fetchExpenseHeads();
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
                            খরচের হেড ব্যবস্থাপনা
                        </h1>
                    </div>
                    <MainButton
                        onClick={handleAddNew}
                    >
                        <FaPlus className="text-sm mr-2" />
                        Add Expense Field
                    </MainButton>
                </div>
            </div>

            {/* Main Content */}
            <div className="p-4 sm:p-6 lg:p-8">
                <div className="max-w-full mx-auto">
                    {loading ? (
                        <div className="flex justify-center items-center py-12">
                            <Loader />
                            <p className="text-gray-600 ml-3">খরচের হেড লোড হচ্ছে...</p>
                        </div>
                    ) : expenseHeads.length === 0 ? (
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 text-center">
                            <div className="text-4xl text-gray-400 mb-3">💰</div>
                            <h3 className="text-lg font-semibold text-gray-800 mb-2">
                                কোন খরচের হেড পাওয়া যায়নি
                            </h3>
                            <p className="text-gray-600 text-sm mb-4">
                                নতুন খরচের হেড তৈরি করুন
                            </p>
                            <button
                                onClick={handleAddNew}
                                className="inline-flex items-center gap-2 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
                            >
                                <FaPlus className="text-sm" />
                                নতুন খরচের হেড তৈরি করুন
                            </button>
                        </div>
                    ) : (
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                            {/* Table Header */}
                            <div className="px-6 py-4 border-b border-gray-200">
                                <h2 className="text-lg font-semibold text-gray-800">
                                    খরচের হেড তালিকা ({expenseHeads.length}টি)
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
                                                Expense Category
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                পরিমাণ
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                বিবরণ
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                মাসিক
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
                                        {expenseHeads.map((head) => (
                                            <tr key={head._id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div>
                                                        <p className="font-medium text-gray-800 text-sm">
                                                            {head.name}
                                                        </p>
                                                        <p className="text-xs text-gray-500">
                                                            তৈরি: {new Date(head.createdAt).toLocaleDateString('bn-BD')}
                                                        </p>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="text-gray-600 text-sm">
                                                        {head.categoryId || 'N/A'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="font-medium text-gray-800 text-sm">
                                                        ৳{head.amount?.toLocaleString()}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div 
                                                        className="text-sm text-gray-600 max-w-xs truncate"
                                                        title={head.description}
                                                    >
                                                        {head.description || 'N/A'}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                        head.isMonthly 
                                                            ? 'bg-green-100 text-green-800' 
                                                            : 'bg-gray-100 text-gray-800'
                                                    }`}>
                                                        {head.isMonthly ? 'হ্যাঁ' : 'না'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span
                                                        onClick={() => handleToggleStatus(head._id, head.isActive)}
                                                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full cursor-pointer ${
                                                            head.isActive 
                                                                ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                                                                : 'bg-red-100 text-red-800 hover:bg-red-200'
                                                        }`}
                                                    >
                                                        {head.isActive ? 'Active' : 'Inactive'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={() => handleEdit(head)}
                                                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                            title="এডিট করুন"
                                                        >
                                                            <FaEdit className="text-sm" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(head._id)}
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

export default ExpenseHeads;