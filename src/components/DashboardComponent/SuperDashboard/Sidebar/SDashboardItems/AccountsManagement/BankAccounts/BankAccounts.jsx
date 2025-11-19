import { useEffect, useState } from 'react';
import { FaEdit, FaPlus, FaStar, FaTrash } from 'react-icons/fa';
import Swal from 'sweetalert2';
import axiosInstance from '../../../../../../../hooks/axiosInstance/axiosInstance';
import MainButton from '../../../../../../sharedItems/Mainbutton/Mainbutton';
import AddNewAccounts from './AddNewAccounts/AddNewAccounts';


const BankAccounts = ({ onBack }) => {
    const [accounts, setAccounts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingAccount, setEditingAccount] = useState(null);

    // Fetch all bank accounts
    const fetchAccounts = async () => {
        setLoading(true);
        try {
            const response = await axiosInstance.get('/bank-accounts');
            if (response.data.success) {
                setAccounts(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching accounts:', error);
            Swal.fire({
                icon: 'error',
                title: 'ত্রুটি!',
                text: 'ব্যাংক একাউন্টস লোড করতে সমস্যা হয়েছে!',
                confirmButtonText: 'ঠিক আছে'
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAccounts();
    }, []);

    const handleDelete = async (accountId, accountName) => {
        const result = await Swal.fire({
            title: 'আপনি কি নিশ্চিত?',
            text: `আপনি "${accountName}" একাউন্টটি ডিলিট করতে চলেছেন!`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'হ্যাঁ, ডিলিট করুন!',
            cancelButtonText: 'বাতিল করুন'
        });

        if (result.isConfirmed) {
            try {
                const response = await axiosInstance.delete(`/bank-accounts/${accountId}`);
                if (response.data.success) {
                    Swal.fire({
                        icon: 'success',
                        title: 'ডিলিট করা হয়েছে!',
                        text: 'ব্যাংক একাউন্ট সফলভাবে ডিলিট করা হয়েছে।',
                        confirmButtonText: 'ঠিক আছে'
                    });
                    fetchAccounts(); // Refresh the list
                }
            } catch (error) {
                console.error('Error deleting account:', error);
                Swal.fire({
                    icon: 'error',
                    title: 'ত্রুটি!',
                    text: 'একাউন্ট ডিলিট করতে সমস্যা হয়েছে!',
                    confirmButtonText: 'ঠিক আছে'
                });
            }
        }
    };

    const handleSetDefault = async (accountId, accountName) => {
        try {
            const response = await axiosInstance.patch(`/bank-accounts/${accountId}/set-default`);
            if (response.data.success) {
                Swal.fire({
                    icon: 'success',
                    title: 'সেট করা হয়েছে!',
                    text: `${accountName} ডিফল্ট একাউন্ট হিসেবে সেট করা হয়েছে।`,
                    confirmButtonText: 'ঠিক আছে'
                });
                fetchAccounts(); // Refresh the list
            }
        } catch (error) {
            console.error('Error setting default account:', error);
            Swal.fire({
                icon: 'error',
                title: 'ত্রুটি!',
                text: 'ডিফল্ট একাউন্ট সেট করতে সমস্যা হয়েছে!',
                confirmButtonText: 'ঠিক আছে'
            });
        }
    };

    const handleEdit = (account) => {
        setEditingAccount(account);
        setShowAddForm(true);
    };

    const handleFormClose = () => {
        setShowAddForm(false);
        setEditingAccount(null);
        fetchAccounts(); // Refresh the list
    };

    if (showAddForm) {
        return (
            <AddNewAccounts 
                onBack={handleFormClose}
                editingAccount={editingAccount}
                onSuccess={handleFormClose}
            />
        );
    }

    return (
        <div className="max-w-full mx-auto">
            {/* Header */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 mb-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">ব্যাংক একাউন্টস</h2>
                    </div>
                    <MainButton
                        onClick={() => setShowAddForm(true)}
                        
                    >
                        <FaPlus className="text-sm mr-2" />
                        Add Account
                    </MainButton>
                </div>
            </div>

            {/* Accounts Table */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                {loading ? (
                    <div className="flex justify-center items-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        <span className="ml-2 text-gray-600">লোড হচ্ছে...</span>
                    </div>
                ) : accounts.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                            <FaPlus className="text-2xl text-gray-400" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-800 mb-2">কোনো একাউন্ট নেই</h3>
                        <p className="text-gray-600 mb-4">আপনার প্রথম ব্যাংক একাউন্ট যোগ করুন</p>
                        <button
                            onClick={() => setShowAddForm(true)}
                            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition duration-200"
                        >
                            + Add Account
                        </button>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        নাম
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        একাউন্ট নাম্বার
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        শাখা
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        ব্যালেন্স
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        কর্ম
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {accounts.map((account) => (
                                    <tr key={account._id} className="hover:bg-gray-50">
                                        <td className="px-4 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <span className="text-sm font-medium text-gray-900">
                                                    {account.name}
                                                </span>
                                                {account.isDefault && (
                                                    <FaStar className="ml-2 text-yellow-500 text-sm" title="ডিফল্ট একাউন্ট" />
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {account.accountNumber}
                                        </td>
                                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {account.branchName || '-'}
                                        </td>
                                        <td className="px-4 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                                            ৳ {account.currentBalance?.toLocaleString()}
                                        </td>
                                        <td className="px-4 py-4 whitespace-nowrap text-sm">
                                            <div className="flex items-center gap-2">
                                                {!account.isDefault && (
                                                    <button
                                                        onClick={() => handleSetDefault(account._id, account.name)}
                                                        className="text-yellow-600 hover:text-yellow-800 transition duration-200"
                                                        title="ডিফল্ট সেট করুন"
                                                    >
                                                        <FaStar className="text-sm" />
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => handleEdit(account)}
                                                    className="text-blue-600 hover:text-blue-800 transition duration-200"
                                                    title="এডিট করুন"
                                                >
                                                    <FaEdit className="text-sm" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(account._id, account.name)}
                                                    className="text-red-600 hover:text-red-800 transition duration-200"
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

            {/* Summary Stats */}
            {accounts.length > 0 && (
                <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                        <p className="text-green-800 text-sm">মোট একাউন্ট</p>
                        <p className="text-2xl font-bold text-green-900">{accounts.length}</p>
                    </div>
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                        <p className="text-blue-800 text-sm">মোট ব্যালেন্স</p>
                        <p className="text-2xl font-bold text-blue-900">
                            ৳ {accounts.reduce((sum, acc) => sum + (acc.currentBalance || 0), 0).toLocaleString()}
                        </p>
                    </div>
                    <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                        <p className="text-yellow-800 text-sm">ডিফল্ট একাউন্ট</p>
                        <p className="text-2xl font-bold text-yellow-900">
                            {accounts.filter(acc => acc.isDefault).length}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BankAccounts;