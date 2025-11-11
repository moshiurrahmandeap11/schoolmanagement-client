import { useEffect, useState } from 'react';
import { FaArrowLeft, FaMoneyBillWave, FaPercentage, FaSave } from 'react-icons/fa';
import Swal from 'sweetalert2';
import axiosInstance from '../../../../../../../hooks/axiosInstance/axiosInstance';
import RichTextEditor from '../../../../../../sharedItems/RichTextEditor/RichTextEditor';

const AddDiscount = ({ discount, onBack, onSuccess }) => {
    const [formData, setFormData] = useState({
        accountId: '',
        accountName: '',
        isPercent: false,
        discountAmount: '',
        percentAmount: '',
        description: ''
    });
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    
    // Dropdown data
    const [accounts, setAccounts] = useState([]);

    useEffect(() => {
        fetchAccounts();
        if (discount) {
            setFormData({
                accountId: discount.accountId || '',
                accountName: discount.accountName || '',
                isPercent: discount.isPercent || false,
                discountAmount: discount.discountAmount || '',
                percentAmount: discount.percentAmount || '',
                description: discount.description || ''
            });
        }
    }, [discount]);

    const fetchAccounts = async () => {
        try {
            const response = await axiosInstance.get('/bank-accounts');
            if (response.data.success) {
                setAccounts(response.data.data || []);
            }
        } catch (error) {
            console.error('Error fetching accounts:', error);
            showSweetAlert('error', 'একাউন্ট লোড করতে সমস্যা হয়েছে');
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
        
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }

        // Update account name when accountId changes
        if (name === 'accountId') {
            const selectedAccount = accounts.find(a => a._id === value);
            setFormData(prev => ({
                ...prev,
                accountName: selectedAccount ? selectedAccount.accountName : ''
            }));
        }
    };

    const handleDescriptionChange = (content) => {
        setFormData(prev => ({
            ...prev,
            description: content
        }));
        
        if (errors.description) {
            setErrors(prev => ({
                ...prev,
                description: ''
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {};
        
        if (!formData.accountId) {
            newErrors.accountId = 'একাউন্ট নির্বাচন করুন';
        }

        if (!formData.isPercent && (!formData.discountAmount || formData.discountAmount < 0)) {
            newErrors.discountAmount = 'ডিসকাউন্ট পরিমাণ প্রয়োজন এবং অবশ্যই ধনাত্মক হতে হবে';
        }

        if (formData.isPercent && (!formData.percentAmount || formData.percentAmount < 0 || formData.percentAmount > 100)) {
            newErrors.percentAmount = 'শতকরা পরিমাণ ০ থেকে ১০০ এর মধ্যে হতে হবে';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }

        setLoading(true);
        try {
            let response;
            
            const submitData = {
                accountId: formData.accountId,
                accountName: formData.accountName,
                isPercent: formData.isPercent,
                discountAmount: formData.isPercent ? 0 : parseFloat(formData.discountAmount),
                percentAmount: formData.isPercent ? parseFloat(formData.percentAmount) : 0,
                description: formData.description
            };

            if (discount) {
                // Update existing discount
                response = await axiosInstance.put(`/discount/${discount._id}`, submitData);
            } else {
                // Create new discount
                response = await axiosInstance.post('/discount', submitData);
            }

            if (response.data.success) {
                showSweetAlert('success', response.data.message);
                onSuccess();
            } else {
                setErrors({ submit: response.data.message });
            }
        } catch (error) {
            console.error('Error saving discount:', error);
            const errorMessage = error.response?.data?.message || 'ছাড়ের ধরন সংরক্ষণ করতে সমস্যা হয়েছে';
            setErrors({ submit: errorMessage });
            showSweetAlert('error', errorMessage);
        } finally {
            setLoading(false);
        }
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
                            {discount ? 'ছাড়ের ধরন এডিট করুন' : 'নতুন ছাড়ের ধরন যোগ করুন'}
                        </h1>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="p-4 sm:p-6 lg:p-8">
                <div className="max-w-full mx-auto">
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 sm:p-8">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="bg-purple-50 p-4 rounded-lg mb-6">
                                <h3 className="text-lg font-semibold text-purple-800 mb-2">
                                    ছাড়ের ধরনের তথ্য:
                                </h3>
                                <p className="text-sm text-purple-600">
                                    ছাড়ের ধরনের বিস্তারিত তথ্য প্রদান করুন
                                </p>
                            </div>

                            {/* Account Selection */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    একাউন্টসমূহ *
                                </label>
                                <select
                                    name="accountId"
                                    value={formData.accountId}
                                    onChange={handleChange}
                                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all ${
                                        errors.accountId ? 'border-red-500 bg-red-50' : 'border-gray-300'
                                    }`}
                                    disabled={loading}
                                >
                                    <option value="">একাউন্ট নির্বাচন করুন</option>
                                    {accounts.map((account) => (
                                        <option key={account._id} value={account._id}>
                                            {account.accountName} - {account.accountNumber}
                                        </option>
                                    ))}
                                </select>
                                {errors.accountId && (
                                    <p className="mt-2 text-sm text-red-600">{errors.accountId}</p>
                                )}
                            </div>

                            {/* InPercent Checkbox */}
                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    name="isPercent"
                                    checked={formData.isPercent}
                                    onChange={handleChange}
                                    className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500"
                                    disabled={loading}
                                />
                                <label className="ml-2 text-sm font-medium text-gray-700">
                                    InPercent (শতকরা ভিত্তিক)
                                </label>
                            </div>

                            {/* Discount Amount or Percent Amount */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {!formData.isPercent ? (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Discount amount *
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                name="discountAmount"
                                                value={formData.discountAmount}
                                                onChange={handleChange}
                                                min="0"
                                                step="0.01"
                                                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all ${
                                                    errors.discountAmount ? 'border-red-500 bg-red-50' : 'border-gray-300'
                                                }`}
                                                placeholder="0.00"
                                                disabled={loading || formData.isPercent}
                                            />
                                            <FaMoneyBillWave className="absolute right-3 top-3.5 text-gray-400" />
                                        </div>
                                        {errors.discountAmount && (
                                            <p className="mt-2 text-sm text-red-600">{errors.discountAmount}</p>
                                        )}
                                    </div>
                                ) : (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Percent amount *
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                name="percentAmount"
                                                value={formData.percentAmount}
                                                onChange={handleChange}
                                                min="0"
                                                max="100"
                                                step="0.01"
                                                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all ${
                                                    errors.percentAmount ? 'border-red-500 bg-red-50' : 'border-gray-300'
                                                }`}
                                                placeholder="0.00"
                                                disabled={loading || !formData.isPercent}
                                            />
                                            <FaPercentage className="absolute right-3 top-3.5 text-gray-400" />
                                        </div>
                                        {errors.percentAmount && (
                                            <p className="mt-2 text-sm text-red-600">{errors.percentAmount}</p>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Description
                                </label>
                                <RichTextEditor
                                    value={formData.description}
                                    onChange={handleDescriptionChange}
                                    placeholder="ছাড়ের ধরনের বিস্তারিত বিবরণ লিখুন..."
                                    height="200px"
                                />
                            </div>

                            {/* Summary */}
                            {(formData.accountId || formData.discountAmount || formData.percentAmount) && (
                                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                                    <h4 className="text-sm font-medium text-green-800 mb-2">
                                        সারাংশ:
                                    </h4>
                                    <div className="text-sm text-green-700 space-y-1">
                                        <p>একাউন্ট: <strong>{formData.accountName}</strong></p>
                                        <p>টাইপ: <strong>{formData.isPercent ? 'শতকরা ভিত্তিক' : 'নির্দিষ্ট পরিমাণ'}</strong></p>
                                        {!formData.isPercent && formData.discountAmount && (
                                            <p>ডিসকাউন্ট পরিমাণ: <strong>৳{formData.discountAmount}</strong></p>
                                        )}
                                        {formData.isPercent && formData.percentAmount && (
                                            <p>শতকরা পরিমাণ: <strong>{formData.percentAmount}%</strong></p>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Submit Error */}
                            {errors.submit && (
                                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                    <p className="text-red-600 text-sm">{errors.submit}</p>
                                </div>
                            )}

                            {/* Buttons */}
                            <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                                <button
                                    type="button"
                                    onClick={onBack}
                                    disabled={loading}
                                    className="px-6 py-3 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    বাতিল করুন
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="inline-flex items-center gap-2 px-8 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                            {discount ? 'আপডেট হচ্ছে...' : 'সংরক্ষণ হচ্ছে...'}
                                        </>
                                    ) : (
                                        <>
                                            <FaSave className="text-sm" />
                                            {discount ? 'আপডেট করুন' : 'সংরক্ষণ করুন'}
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>

                        {/* Help Text */}
                        <div className="mt-6 p-4 bg-purple-50 rounded-lg border border-purple-200">
                            <h3 className="text-sm font-medium text-purple-800 mb-1">
                                ছাড়ের ধরন সম্পর্কে:
                            </h3>
                            <ul className="text-xs text-purple-600 space-y-1">
                                <li>• <strong>নির্দিষ্ট পরিমাণ:</strong> একটি নির্দিষ্ট টাকার পরিমাণ ছাড়</li>
                                <li>• <strong>শতকরা ভিত্তিক:</strong> মোট টাকার শতকরা হারে ছাড়</li>
                                <li>• <strong>একাউন্ট:</strong> ছাড় কোন একাউন্টের সাথে সম্পর্কিত</li>
                                <li>• ছাড়ের ধরন তৈরি করার পর এডিট ও ডিলিট করা যাবে</li>
                                <li>• নিষ্ক্রিয় ছাড়ের ধরন নতুন ছাড়ে ব্যবহার করা যাবে না</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddDiscount;