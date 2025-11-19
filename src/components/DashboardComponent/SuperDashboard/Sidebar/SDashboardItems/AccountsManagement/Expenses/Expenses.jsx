import { useEffect, useState } from 'react';
import { FaArrowLeft, FaEdit, FaFileDownload, FaFilter, FaPlus, FaTrash } from 'react-icons/fa';
import Swal from 'sweetalert2';
import axiosInstance, { baseImageURL } from '../../../../../../../hooks/axiosInstance/axiosInstance';
import Loader from '../../../../../../sharedItems/Loader/Loader';
import MainButton from '../../../../../../sharedItems/Mainbutton/Mainbutton';
import AddExpenses from './AddExpenses/AddExpenses';


const Expenses = ({ onBack }) => {
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showAddForm, setShowAddForm] = useState(false);
    const [showFilters, setShowFilters] = useState(false);
    const [editingExpense, setEditingExpense] = useState(null);
    const [totalExpense, setTotalExpense] = useState(0);
    
    // Filter states
    const [filters, setFilters] = useState({
        expenseCategory: 'all',
        month: 'all',
        year: 'all',
        fromDate: '',
        toDate: '',
        accountId: 'all',
        userId: 'all'
    });

    // Dropdown data
    const [expenseCategories, setExpenseCategories] = useState([]);
    const [expenseItems, setExpenseItems] = useState([]);
    const [bankAccounts, setBankAccounts] = useState([]);
    const [users, setUsers] = useState([]);

    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 5 }, (_, i) => (currentYear - i).toString());

    useEffect(() => {
        fetchExpenses();
        fetchDropdownData();
    }, []);

    const fetchExpenses = async (filterParams = {}) => {
        try {
            setLoading(true);
            const params = new URLSearchParams();
            
            Object.entries({ ...filters, ...filterParams }).forEach(([key, value]) => {
                if (value && value !== 'all') {
                    params.append(key, value);
                }
            });

            const response = await axiosInstance.get(`/expenses?${params}`);
            
            if (response.data.success) {
                setExpenses(response.data.data || []);
                setTotalExpense(response.data.totalExpense || 0);
            }
        } catch (error) {
            console.error('Error fetching expenses:', error);
            showSweetAlert('error', 'খরচের তথ্য লোড করতে সমস্যা হয়েছে');
        } finally {
            setLoading(false);
        }
    };

    const fetchDropdownData = async () => {
        try {
            // Fetch expense categories
            const categoriesResponse = await axiosInstance.get('/expense-category');
            if (categoriesResponse.data.success) {
                setExpenseCategories(categoriesResponse.data.data);
            }

            // Fetch expense items/heads
            const itemsResponse = await axiosInstance.get('/expense-heads');
            if (itemsResponse.data.success) {
                setExpenseItems(itemsResponse.data.data);
            }

            // Fetch bank accounts
            const accountsResponse = await axiosInstance.get('/bank-accounts');
            if (accountsResponse.data.success) {
                setBankAccounts(accountsResponse.data.data);
            }

            // Fetch users
            const usersResponse = await axiosInstance.get('/users');
            if (usersResponse.data.success) {
                setUsers(usersResponse.data.data);
            }
        } catch (error) {
            console.error('Error fetching dropdown data:', error);
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

    const handleEdit = (expense) => {
        setEditingExpense(expense);
        setShowAddForm(true);
    };

    const handleDelete = async (expenseId) => {
        const result = await Swal.fire({
            title: 'আপনি কি নিশ্চিত?',
            text: "এই খরচের তথ্য ডিলিট হয়ে যাবে!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'হ্যাঁ, ডিলিট করুন!',
            cancelButtonText: 'বাতিল করুন'
        });

        if (result.isConfirmed) {
            try {
                const response = await axiosInstance.delete(`/expenses/${expenseId}`);
                if (response.data.success) {
                    showSweetAlert('success', 'খরচের তথ্য সফলভাবে ডিলিট হয়েছে');
                    fetchExpenses();
                }
            } catch (error) {
                console.error('Error deleting expense:', error);
                showSweetAlert('error', 'খরচের তথ্য ডিলিট করতে সমস্যা হয়েছে');
            }
        }
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleApplyFilters = () => {
        fetchExpenses();
    };

    const handleClearFilters = () => {
        setFilters({
            expenseCategory: 'all',
            month: 'all',
            year: 'all',
            fromDate: '',
            toDate: '',
            accountId: 'all',
            userId: 'all'
        });
        fetchExpenses({
            expenseCategory: 'all',
            month: 'all',
            year: 'all',
            fromDate: '',
            toDate: '',
            accountId: 'all',
            userId: 'all'
        });
    };

    const handleAddNew = () => {
        setEditingExpense(null);
        setShowAddForm(true);
    };

    const handleBackToList = () => {
        setShowAddForm(false);
        setEditingExpense(null);
    };

    const getAccountName = (accountId) => {
        const account = bankAccounts.find(acc => acc._id === accountId);
        return account ? account.name : 'N/A';
    };

    const getCategoryName = (categoryId) => {
        const category = expenseCategories.find(cat => cat._id === categoryId);
        return category ? category.name : 'N/A';
    };

    const getItemName = (itemId) => {
        const item = expenseItems.find(it => it._id === itemId);
        return item ? item.name : 'N/A';
    };

    const getUserName = (userId) => {
        const user = users.find(u => u._id === userId);
        return user ? user.name : 'N/A';
    };

    const downloadVoucher = (voucherUrl) => {
        if (voucherUrl) {
            window.open(`${baseImageURL}${voucherUrl}`, '_blank');
        }
    };

    const getExpenseItemsText = (expenseItems) => {
        if (!expenseItems || !Array.isArray(expenseItems)) return 'N/A';
        return expenseItems.map(item => getItemName(item.expenseItemId)).join(', ');
    };

    if (showAddForm) {
        return (
            <AddExpenses 
                expense={editingExpense}
                onBack={handleBackToList}
                onSuccess={() => {
                    setShowAddForm(false);
                    setEditingExpense(null);
                    fetchExpenses();
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
                        <div>
                            <h1 className="text-2xl font-bold text-gray-800">
                                খরচ ব্যবস্থাপনা
                            </h1>
                            <p className="text-red-600 font-semibold mt-1">
                                Total Expense: ৳{totalExpense.toLocaleString()}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className="inline-flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                        >
                            <FaFilter className="text-sm" />
                            Toggle Filters
                        </button>
                        <MainButton
                            onClick={handleAddNew}
                            className="rounded-md"
                        >
                            <FaPlus className="text-sm mr-2" />
                            Add Expense
                        </MainButton>
                    </div>
                </div>
            </div>

            {/* Filters Section */}
            {showFilters && (
                <div className="bg-white border-b border-gray-200 p-4 sm:p-6">
                    <div className="max-w-full mx-auto">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">ফিল্টারস</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                            {/* Expense Category */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Expense Category
                                </label>
                                <select
                                    name="expenseCategory"
                                    value={filters.expenseCategory}
                                    onChange={handleFilterChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9]"
                                >
                                    <option value="all">সব ক্যাটাগরি</option>
                                    {expenseCategories.map(category => (
                                        <option key={category._id} value={category._id}>
                                            {category.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* মাস */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    মাস
                                </label>
                                <select
                                    name="month"
                                    value={filters.month}
                                    onChange={handleFilterChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9]"
                                >
                                    <option value="all">সব মাস</option>
                                    {months.map(month => (
                                        <option key={month} value={month}>
                                            {month}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* বছর */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    বছর
                                </label>
                                <select
                                    name="year"
                                    value={filters.year}
                                    onChange={handleFilterChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9]"
                                >
                                    <option value="all">সব বছর</option>
                                    {years.map(year => (
                                        <option key={year} value={year}>
                                            {year}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* একাউন্টসমূহ */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    একাউন্টসমূহ
                                </label>
                                <select
                                    name="accountId"
                                    value={filters.accountId}
                                    onChange={handleFilterChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9]"
                                >
                                    <option value="all">সব একাউন্ট</option>
                                    {bankAccounts.map(account => (
                                        <option key={account._id} value={account._id}>
                                            {account.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
                            {/* From */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    From
                                </label>
                                <input
                                    type="date"
                                    name="fromDate"
                                    value={filters.fromDate}
                                    onChange={handleFilterChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9]"
                                />
                            </div>

                            {/* To */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    To
                                </label>
                                <input
                                    type="date"
                                    name="toDate"
                                    value={filters.toDate}
                                    onChange={handleFilterChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9]"
                                />
                            </div>

                            {/* সদস্য */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    সদস্য
                                </label>
                                <select
                                    name="userId"
                                    value={filters.userId}
                                    onChange={handleFilterChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9]"
                                >
                                    <option value="all">সব সদস্য</option>
                                    {users.map(user => (
                                        <option key={user._id} value={user._id}>
                                            {user.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <MainButton
                                onClick={handleApplyFilters}
                                className="rounded-md"
                            >
                                Apply Filters
                            </MainButton>
                            <button
                                onClick={handleClearFilters}
                                className="px-6 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                            >
                                Clear Filters
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Main Content */}
            <div className="p-4 sm:p-6 lg:p-8">
                <div className="max-w-full mx-auto">
                    {loading ? (
                        <div className="flex justify-center items-center py-12">
                            <Loader />
                            <p className="text-gray-600 ml-3">খরচের তথ্য লোড হচ্ছে...</p>
                        </div>
                    ) : expenses.length === 0 ? (
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 text-center">
                            <div className="text-4xl text-gray-400 mb-3">💸</div>
                            <h3 className="text-lg font-semibold text-gray-800 mb-2">
                                কোন খরচের তথ্য পাওয়া যায়নি
                            </h3>
                            <p className="text-gray-600 text-sm mb-4">
                                নতুন খরচের তথ্য যোগ করুন
                            </p>
                            <button
                                onClick={handleAddNew}
                                className="inline-flex items-center gap-2 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
                            >
                                <FaPlus className="text-sm" />
                                নতুন খরচ যোগ করুন
                            </button>
                        </div>
                    ) : (
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                            {/* Table Header */}
                            <div className="px-6 py-4 border-b border-gray-200">
                                <h2 className="text-lg font-semibold text-gray-800">
                                    খরচের তালিকা ({expenses.length}টি)
                                </h2>
                            </div>

                            {/* Table */}
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50 border-b border-gray-200">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                একাউন্টসমূহ
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                তারিখ
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Expense Field / Item
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                লেনদেনের ধরণ
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                বিবরণ
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                ইতিহাস
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                পরিমাণ
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Expense Items
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Voucher
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                এডিট / ডিলিট
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {expenses.map((expense) => (
                                            <tr key={expense._id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <span className="text-sm text-gray-800">
                                                        {getAccountName(expense.accountId)}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="text-sm text-gray-600">
                                                        {new Date(expense.date).toLocaleDateString('bn-BD')}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="text-sm text-gray-800">
                                                        {expense.expenseItems && expense.expenseItems.length > 0 
                                                            ? getCategoryName(expense.expenseItems[0].expenseCategoryId)
                                                            : 'N/A'
                                                        }
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                                        expense.paymentStatus === 'Cash' 
                                                            ? 'bg-green-100 text-green-800'
                                                            : 'bg-yellow-100 text-yellow-800'
                                                    }`}>
                                                        {expense.paymentStatus}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-sm text-gray-600 max-w-xs">
                                                        {expense.description || 'কোন বিবরণ নেই'}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="text-sm text-gray-600">
                                                        {new Date(expense.createdAt).toLocaleDateString('bn-BD')}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="font-semibold text-red-600 text-sm">
                                                        ৳{expense.totalAmount?.toLocaleString()}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-sm text-gray-600 max-w-xs">
                                                        {getExpenseItemsText(expense.expenseItems)}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    {expense.voucher ? (
                                                        <button
                                                            onClick={() => downloadVoucher(expense.voucher)}
                                                            className="inline-flex items-center gap-1 px-3 py-1 text-blue-600 hover:text-blue-800 transition-colors"
                                                            title="ভাউচার ডাউনলোড করুন"
                                                        >
                                                            <FaFileDownload className="text-sm" />
                                                            <span className="text-xs">Download</span>
                                                        </button>
                                                    ) : (
                                                        <span className="text-xs text-gray-500">N/A</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={() => handleEdit(expense)}
                                                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                            title="এডিট করুন"
                                                        >
                                                            <FaEdit className="text-sm" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(expense._id)}
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

export default Expenses;