import { useEffect, useState } from 'react';
import { FaArrowLeft, FaEdit, FaFileDownload, FaFilter, FaTrash } from 'react-icons/fa';
import Swal from 'sweetalert2';
import axiosInstance from '../../../../../../../hooks/axiosInstance/axiosInstance';
import Loader from '../../../../../../sharedItems/Loader/Loader';


const Transactions = ({ onBack }) => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showFilters, setShowFilters] = useState(false);
    
    // Summary states
    const [totalIncome, setTotalIncome] = useState(0);
    const [totalExpense, setTotalExpense] = useState(0);
    const [balance, setBalance] = useState(0);
    
    // Filter states
    const [filters, setFilters] = useState({
        incomeSource: 'all',
        expenseHead: 'all',
        month: 'all',
        year: 'all',
        fromDate: '',
        toDate: '',
        accountId: 'all',
        userId: 'all'
    });

    // Dropdown data
    const [incomeSources, setIncomeSources] = useState([]);
    const [expenseHeads, setExpenseHeads] = useState([]);
    const [bankAccounts, setBankAccounts] = useState([]);
    const [users, setUsers] = useState([]);

    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 5 }, (_, i) => (currentYear - i).toString());

    useEffect(() => {
        fetchTransactions();
        fetchDropdownData();
    }, []);

    const fetchTransactions = async (filterParams = {}) => {
        try {
            setLoading(true);
            const params = new URLSearchParams();
            
            Object.entries({ ...filters, ...filterParams }).forEach(([key, value]) => {
                if (value && value !== 'all') {
                    params.append(key, value);
                }
            });

            // Fetch incomes
            const incomesResponse = await axiosInstance.get(`/incomes?${params}`);
            // Fetch expenses
            const expensesResponse = await axiosInstance.get(`/expenses?${params}`);

            let allTransactions = [];
            let incomeTotal = 0;
            let expenseTotal = 0;

            // Process incomes
            if (incomesResponse.data.success) {
                const incomes = incomesResponse.data.data || [];
                incomeTotal = incomesResponse.data.totalIncome || 0;
                
                incomes.forEach(income => {
                    allTransactions.push({
                        ...income,
                        type: 'income',
                        amount: income.amount,
                        expenseAmount: 0,
                        transactionType: 'আয়'
                    });
                });
            }

            // Process expenses
            if (expensesResponse.data.success) {
                const expenses = expensesResponse.data.data || [];
                expenseTotal = expensesResponse.data.totalExpense || 0;
                
                expenses.forEach(expense => {
                    allTransactions.push({
                        ...expense,
                        type: 'expense',
                        amount: 0,
                        expenseAmount: expense.totalAmount,
                        transactionType: 'ব্যায়'
                    });
                });
            }

            // Sort by date (newest first)
            allTransactions.sort((a, b) => new Date(b.date) - new Date(a.date));

            setTransactions(allTransactions);
            setTotalIncome(incomeTotal);
            setTotalExpense(expenseTotal);
            setBalance(incomeTotal - expenseTotal);

        } catch (error) {
            console.error('Error fetching transactions:', error);
            showSweetAlert('error', 'লেনদেনের তথ্য লোড করতে সমস্যা হয়েছে');
        } finally {
            setLoading(false);
        }
    };

    const fetchDropdownData = async () => {
        try {
            // Fetch income sources
            const sourcesResponse = await axiosInstance.get('/income-sources');
            if (sourcesResponse.data.success) {
                setIncomeSources(sourcesResponse.data.data);
            }

            // Fetch expense heads
            const headsResponse = await axiosInstance.get('/expense-heads');
            if (headsResponse.data.success) {
                setExpenseHeads(headsResponse.data.data);
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

    const handleDelete = async (transactionId, type) => {
        const result = await Swal.fire({
            title: 'আপনি কি নিশ্চিত?',
            text: "এই লেনদেনের তথ্য ডিলিট হয়ে যাবে!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'হ্যাঁ, ডিলিট করুন!',
            cancelButtonText: 'বাতিল করুন'
        });

        if (result.isConfirmed) {
            try {
                const endpoint = type === 'income' ? '/incomes' : '/expenses';
                const response = await axiosInstance.delete(`${endpoint}/${transactionId}`);
                
                if (response.data.success) {
                    showSweetAlert('success', 'লেনদেনের তথ্য সফলভাবে ডিলিট হয়েছে');
                    fetchTransactions();
                }
            } catch (error) {
                console.error('Error deleting transaction:', error);
                showSweetAlert('error', 'লেনদেনের তথ্য ডিলিট করতে সমস্যা হয়েছে');
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
        fetchTransactions();
    };

    const handleClearFilters = () => {
        setFilters({
            incomeSource: 'all',
            expenseHead: 'all',
            month: 'all',
            year: 'all',
            fromDate: '',
            toDate: '',
            accountId: 'all',
            userId: 'all'
        });
        fetchTransactions({
            incomeSource: 'all',
            expenseHead: 'all',
            month: 'all',
            year: 'all',
            fromDate: '',
            toDate: '',
            accountId: 'all',
            userId: 'all'
        });
    };

    const getAccountName = (accountId) => {
        const account = bankAccounts.find(acc => acc._id === accountId);
        return account ? account.name : 'N/A';
    };

    const getIncomeSourceName = (sourceId) => {
        const source = incomeSources.find(src => src._id === sourceId);
        return source ? source.name : 'N/A';
    };

    const getExpenseHeadName = (headId) => {
        const head = expenseHeads.find(hd => hd._id === headId);
        return head ? head.name : 'N/A';
    };

    const getUserName = (userId) => {
        const user = users.find(u => u._id === userId);
        return user ? user.name : 'N/A';
    };

    const downloadVoucher = (voucherUrl) => {
        if (voucherUrl) {
            window.open(voucherUrl, '_blank');
        }
    };

    const formatAmount = (amount) => {
        return `৳${(amount || 0).toLocaleString()}`;
    };

    const getDescription = (transaction) => {
        if (transaction.type === 'income') {
            return transaction.description || getIncomeSourceName(transaction.incomeSourceId);
        } else {
            return transaction.description || (transaction.expenseItems && transaction.expenseItems.length > 0 
                ? getExpenseHeadName(transaction.expenseItems[0].expenseItemId)
                : 'N/A'
            );
        }
    };

    const getVoucherUrl = (transaction) => {
        return transaction.type === 'income' ? transaction.receipt : transaction.voucher;
    };

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
                            লেনদেন ব্যবস্থাপনা
                        </h1>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className="inline-flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                        >
                            <FaFilter className="text-sm" />
                            Toggle Filters
                        </button>
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 px-4 sm:px-6 pb-4">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-green-800">Total Income</p>
                                <p className="text-2xl font-bold text-green-600">
                                    ৳{totalIncome.toLocaleString()}
                                </p>
                            </div>
                            <div className="p-2 bg-green-100 rounded-lg">
                                <span className="text-green-600 text-sm font-semibold">↑</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-red-800">Total Expense</p>
                                <p className="text-2xl font-bold text-red-600">
                                    ৳{totalExpense.toLocaleString()}
                                </p>
                            </div>
                            <div className="p-2 bg-red-100 rounded-lg">
                                <span className="text-red-600 text-sm font-semibold">↓</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-blue-800">Balance</p>
                                <p className={`text-2xl font-bold ${
                                    balance >= 0 ? 'text-blue-600' : 'text-orange-600'
                                }`}>
                                    ৳{balance.toLocaleString()}
                                </p>
                            </div>
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <span className="text-blue-600 text-sm font-semibold">⚖️</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters Section */}
            {showFilters && (
                <div className="bg-white border-b border-gray-200 p-4 sm:p-6">
                    <div className="max-w-7xl mx-auto">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">ফিল্টারস</h3>
                        
                        {/* First Row */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                            {/* আয়ের উৎস */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    আয়ের উৎস
                                </label>
                                <select
                                    name="incomeSource"
                                    value={filters.incomeSource}
                                    onChange={handleFilterChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="all">সব উৎস</option>
                                    {incomeSources.map(source => (
                                        <option key={source._id} value={source._id}>
                                            {source.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* ব্যায়ের খাত */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    ব্যায়ের খাত
                                </label>
                                <select
                                    name="expenseHead"
                                    value={filters.expenseHead}
                                    onChange={handleFilterChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="all">সব খাত</option>
                                    {expenseHeads.map(head => (
                                        <option key={head._id} value={head._id}>
                                            {head.name}
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
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="all">সব বছর</option>
                                    {years.map(year => (
                                        <option key={year} value={year}>
                                            {year}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Second Row */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                            {/* থেকে */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    থেকে
                                </label>
                                <input
                                    type="date"
                                    name="fromDate"
                                    value={filters.fromDate}
                                    onChange={handleFilterChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            {/* পর্যন্ত */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    পর্যন্ত
                                </label>
                                <input
                                    type="date"
                                    name="toDate"
                                    value={filters.toDate}
                                    onChange={handleFilterChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
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
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="all">সব একাউন্ট</option>
                                    {bankAccounts.map(account => (
                                        <option key={account._id} value={account._id}>
                                            {account.name}
                                        </option>
                                    ))}
                                </select>
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
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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

                        {/* Buttons */}
                        <div className="flex items-center gap-3">
                            <button
                                onClick={handleApplyFilters}
                                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
                            >
                                Apply Filters
                            </button>
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
                            <p className="text-gray-600 ml-3">লেনদেনের তথ্য লোড হচ্ছে...</p>
                        </div>
                    ) : transactions.length === 0 ? (
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 text-center">
                            <div className="text-4xl text-gray-400 mb-3">💸</div>
                            <h3 className="text-lg font-semibold text-gray-800 mb-2">
                                কোন লেনদেনের তথ্য পাওয়া যায়নি
                            </h3>
                            <p className="text-gray-600 text-sm mb-4">
                                ফিল্টার পরিবর্তন করুন বা নতুন লেনদেন যোগ করুন
                            </p>
                        </div>
                    ) : (
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                            {/* Table Header */}
                            <div className="px-6 py-4 border-b border-gray-200">
                                <h2 className="text-lg font-semibold text-gray-800">
                                    লেনদেনের তালিকা ({transactions.length}টি)
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
                                                আয়/ব্যায়
                                            </th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                আয়
                                            </th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                ব্যায়
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                বিবরণ
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                ইতিহাস
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Voucher
                                            </th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                ব্যালেন্স
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                এডিট / ডিলিট
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {transactions.map((transaction, index) => {
                                            // Calculate running balance
                                            const runningBalance = transactions
                                                .slice(0, index + 1)
                                                .reduce((sum, t) => sum + (t.amount - t.expenseAmount), 0);

                                            return (
                                                <tr key={`${transaction.type}-${transaction._id}`} className="hover:bg-gray-50 transition-colors">
                                                    <td className="px-6 py-4">
                                                        <span className="text-sm text-gray-800">
                                                            {getAccountName(transaction.accountId)}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className="text-sm text-gray-600">
                                                            {new Date(transaction.date).toLocaleDateString('bn-BD')}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                                            transaction.type === 'income' 
                                                                ? 'bg-green-100 text-green-800'
                                                                : 'bg-red-100 text-red-800'
                                                        }`}>
                                                            {transaction.transactionType}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        {transaction.type === 'income' && (
                                                            <span className="font-semibold text-green-600 text-sm">
                                                                {formatAmount(transaction.amount)}
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        {transaction.type === 'expense' && (
                                                            <span className="font-semibold text-red-600 text-sm">
                                                                {formatAmount(transaction.expenseAmount)}
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="text-sm text-gray-600 max-w-xs">
                                                            {getDescription(transaction)}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className="text-sm text-gray-600">
                                                            {new Date(transaction.createdAt).toLocaleDateString('bn-BD')}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        {getVoucherUrl(transaction) ? (
                                                            <button
                                                                onClick={() => downloadVoucher(getVoucherUrl(transaction))}
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
                                                    <td className="px-6 py-4 text-right">
                                                        <span className={`font-semibold text-sm ${
                                                            runningBalance >= 0 
                                                                ? 'text-green-600' 
                                                                : 'text-red-600'
                                                        }`}>
                                                            {formatAmount(runningBalance)}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-2">
                                                            <button
                                                                onClick={() => {/* Edit functionality */}}
                                                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                                title="এডিট করুন"
                                                            >
                                                                <FaEdit className="text-sm" />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDelete(transaction._id, transaction.type)}
                                                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                                title="ডিলিট করুন"
                                                            >
                                                                <FaTrash className="text-sm" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
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

export default Transactions;