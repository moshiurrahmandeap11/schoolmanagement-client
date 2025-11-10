import { useEffect, useState } from 'react';
import { FaArrowLeft, FaSave } from 'react-icons/fa';
import Swal from 'sweetalert2';
import axiosInstance from '../../../../../../../../hooks/axiosInstance/axiosInstance';


const AddNewAccounts = ({ onBack, editingAccount, onSuccess }) => {
    const [formData, setFormData] = useState({
        name: '',
        accountNumber: '',
        branchName: '',
        currentBalance: '',
        details: '',
        isDefault: false
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (editingAccount) {
            setFormData({
                name: editingAccount.name || '',
                accountNumber: editingAccount.accountNumber || '',
                branchName: editingAccount.branchName || '',
                currentBalance: editingAccount.currentBalance || '',
                details: editingAccount.details || '',
                isDefault: editingAccount.isDefault || false
            });
        }
    }, [editingAccount]);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validation
        if (!formData.name.trim() || !formData.accountNumber.trim()) {
            Swal.fire({
                icon: 'warning',
                title: 'অপূর্ণ তথ্য',
                text: 'নাম এবং একাউন্ট নাম্বার অবশ্যই প্রয়োজন',
                confirmButtonText: 'ঠিক আছে'
            });
            return;
        }

        setLoading(true);
        try {
            let response;
            
            if (editingAccount) {
                // Update existing account
                response = await axiosInstance.put(`/bank-accounts/${editingAccount._id}`, formData);
            } else {
                // Create new account
                response = await axiosInstance.post('/bank-accounts', formData);
            }

            if (response.data.success) {
                Swal.fire({
                    icon: 'success',
                    title: 'সফল!',
                    text: editingAccount ? 'একাউন্ট আপডেট করা হয়েছে!' : 'নতুন একাউন্ট যোগ করা হয়েছে!',
                    confirmButtonText: 'ঠিক আছে'
                });
                onSuccess();
            }
        } catch (error) {
            console.error('Error saving account:', error);
            const errorMessage = error.response?.data?.message || 'একাউন্ট সংরক্ষণ করতে সমস্যা হয়েছে!';
            Swal.fire({
                icon: 'error',
                title: 'ত্রুটি!',
                text: errorMessage,
                confirmButtonText: 'ঠিক আছে'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-full mx-auto">
            {/* Header */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 mb-6">
                <div className="flex items-center gap-4 mb-4">
                    <button
                        onClick={onBack}
                        className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                        <FaArrowLeft className="text-xl text-gray-600" />
                    </button>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">
                            {editingAccount ? 'একাউন্ট এডিট করুন' : 'নতুন একাউন্ট যোগ করুন'}
                        </h2>
                        <p className="text-gray-600">
                            {editingAccount ? 'আপনার একাউন্টের তথ্য আপডেট করুন' : 'আপনার নতুন ব্যাংক, বিকাশ বা অন্যান্য একাউন্ট যোগ করুন'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Form */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Name */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                নাম *
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                required
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                                placeholder="ব্যাংকের নাম (যেমন: DBBL, Bkash, Cash)"
                            />
                        </div>

                        {/* Account Number */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                একাউন্ট নাম্বার *
                            </label>
                            <input
                                type="text"
                                name="accountNumber"
                                value={formData.accountNumber}
                                onChange={handleInputChange}
                                required
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                                placeholder="একাউন্ট নাম্বার"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Branch Name */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                শাখা নাম
                            </label>
                            <input
                                type="text"
                                name="branchName"
                                value={formData.branchName}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                                placeholder="শাখার নাম (যদি থাকে)"
                            />
                        </div>

                        {/* Current Balance */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                বর্তমান ব্যালেন্স
                            </label>
                            <input
                                type="number"
                                name="currentBalance"
                                value={formData.currentBalance}
                                onChange={handleInputChange}
                                step="0.01"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                                placeholder="বর্তমান ব্যালেন্স"
                            />
                        </div>
                    </div>

                    {/* Details */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            বিস্তারিত
                        </label>
                        <textarea
                            name="details"
                            value={formData.details}
                            onChange={handleInputChange}
                            rows="3"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                            placeholder="অতিরিক্ত তথ্য (ঐচ্ছিক)"
                        />
                    </div>

                    {/* Is Default Checkbox */}
                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            name="isDefault"
                            checked={formData.isDefault}
                            onChange={handleInputChange}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label className="ml-2 block text-sm text-gray-700">
                            ডিফল্ট একাউন্ট হিসেবে সেট করুন
                        </label>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 pt-6">
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            <FaSave className="text-sm" />
                            {loading ? (
                                'সংরক্ষণ হচ্ছে...'
                            ) : editingAccount ? (
                                'আপডেট করুন'
                            ) : (
                                'সংরক্ষণ করুন'
                            )}
                        </button>
                        <button
                            type="button"
                            onClick={onBack}
                            className="flex-1 bg-gray-500 text-white py-3 px-6 rounded-lg hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 transition duration-200"
                        >
                            বাতিল করুন
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddNewAccounts;