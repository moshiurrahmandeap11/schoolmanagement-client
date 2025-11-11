import { useEffect, useState } from 'react';
import { FaArrowLeft, FaMoneyBillWave, FaPercentage, FaSave } from 'react-icons/fa';
import Swal from 'sweetalert2';
import axiosInstance from '../../../../../../../hooks/axiosInstance/axiosInstance';

const AddNewFine = ({ fineType, onBack, onSuccess }) => {
    const [formData, setFormData] = useState({
        name: '',
        isParcel: false,
        fineAmount: '',
        percentage: '',
        isAbsenceFine: false,
        fixedDate: ''
    });
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (fineType) {
            setFormData({
                name: fineType.name || '',
                isParcel: fineType.isParcel || false,
                fineAmount: fineType.fineAmount || '',
                percentage: fineType.percentage || '',
                isAbsenceFine: fineType.isAbsenceFine || false,
                fixedDate: fineType.fixedDate ? fineType.fixedDate.split('T')[0] : ''
            });
        }
    }, [fineType]);

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
    };

    const validateForm = () => {
        const newErrors = {};
        
        if (!formData.name.trim()) {
            newErrors.name = 'ফাইন ধরণের নাম প্রয়োজন';
        }
        
        if (formData.name.trim().length < 2) {
            newErrors.name = 'ফাইন ধরণের নাম কমপক্ষে ২ অক্ষরের হতে হবে';
        }

        if (!formData.isParcel && (!formData.fineAmount || formData.fineAmount < 0)) {
            newErrors.fineAmount = 'জরিমানার পরিমাণ প্রয়োজন এবং অবশ্যই ধনাত্মক হতে হবে';
        }

        if (formData.isParcel && (!formData.percentage || formData.percentage < 0 || formData.percentage > 100)) {
            newErrors.percentage = 'শতকরা পরিমাণ ০ থেকে ১০০ এর মধ্যে হতে হবে';
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
                name: formData.name.trim(),
                isParcel: formData.isParcel,
                fineAmount: formData.isParcel ? 0 : parseFloat(formData.fineAmount),
                percentage: formData.isParcel ? parseFloat(formData.percentage) : 0,
                isAbsenceFine: formData.isAbsenceFine,
                fixedDate: formData.fixedDate || null
            };

            if (fineType) {
                // Update existing fine type
                response = await axiosInstance.put(`/fine-types/${fineType._id}`, submitData);
            } else {
                // Create new fine type
                response = await axiosInstance.post('/fine-types', submitData);
            }

            if (response.data.success) {
                showSweetAlert('success', response.data.message);
                onSuccess();
            } else {
                setErrors({ submit: response.data.message });
            }
        } catch (error) {
            console.error('Error saving fine type:', error);
            const errorMessage = error.response?.data?.message || 'ফাইন টাইপ সংরক্ষণ করতে সমস্যা হয়েছে';
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
                            {fineType ? 'ফাইন টাইপ এডিট করুন' : 'নতুন ফাইন টাইপ যোগ করুন'}
                        </h1>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="p-4 sm:p-6 lg:p-8">
                <div className="max-w-full mx-auto">
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 sm:p-8">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="bg-orange-50 p-4 rounded-lg mb-6">
                                <h3 className="text-lg font-semibold text-orange-800 mb-2">
                                    ফাইন টাইপের তথ্য:
                                </h3>
                                <p className="text-sm text-orange-600">
                                    ফাইন টাইপের বিস্তারিত তথ্য প্রদান করুন
                                </p>
                            </div>

                            {/* Fine Type Name */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    ফাইন ধরণ *
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all ${
                                        errors.name ? 'border-red-500 bg-red-50' : 'border-gray-300'
                                    }`}
                                    placeholder="ফাইন ধরণের নাম লিখুন (যেমন: লেট ফাইন, অ্যাবসেন্স ফাইন)"
                                    disabled={loading}
                                />
                                {errors.name && (
                                    <p className="mt-2 text-sm text-red-600">{errors.name}</p>
                                )}
                            </div>

                            {/* In Percel Checkbox */}
                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    name="isParcel"
                                    checked={formData.isParcel}
                                    onChange={handleChange}
                                    className="w-4 h-4 text-orange-600 bg-gray-100 border-gray-300 rounded focus:ring-orange-500"
                                    disabled={loading}
                                />
                                <label className="ml-2 text-sm font-medium text-gray-700">
                                    In Percel (শতকরা ভিত্তিক)
                                </label>
                            </div>

                            {/* Fine Amount or Percentage */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {!formData.isParcel ? (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            জরিমানার পরিমাণ *
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                name="fineAmount"
                                                value={formData.fineAmount}
                                                onChange={handleChange}
                                                min="0"
                                                step="0.01"
                                                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all ${
                                                    errors.fineAmount ? 'border-red-500 bg-red-50' : 'border-gray-300'
                                                }`}
                                                placeholder="0.00"
                                                disabled={loading || formData.isParcel}
                                            />
                                            <FaMoneyBillWave className="absolute right-3 top-3.5 text-gray-400" />
                                        </div>
                                        {errors.fineAmount && (
                                            <p className="mt-2 text-sm text-red-600">{errors.fineAmount}</p>
                                        )}
                                    </div>
                                ) : (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            শতকরা পরিমাণ *
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                name="percentage"
                                                value={formData.percentage}
                                                onChange={handleChange}
                                                min="0"
                                                max="100"
                                                step="0.01"
                                                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all ${
                                                    errors.percentage ? 'border-red-500 bg-red-50' : 'border-gray-300'
                                                }`}
                                                placeholder="0.00"
                                                disabled={loading || !formData.isParcel}
                                            />
                                            <FaPercentage className="absolute right-3 top-3.5 text-gray-400" />
                                        </div>
                                        {errors.percentage && (
                                            <p className="mt-2 text-sm text-red-600">{errors.percentage}</p>
                                        )}
                                    </div>
                                )}

                                {/* Fixed Date */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        নির্ধারিত তারিখ যোগ করুন
                                    </label>
                                    <input
                                        type="date"
                                        name="fixedDate"
                                        value={formData.fixedDate}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                                        disabled={loading}
                                    />
                                </div>
                            </div>

                            {/* Absence Fine Checkbox */}
                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    name="isAbsenceFine"
                                    checked={formData.isAbsenceFine}
                                    onChange={handleChange}
                                    className="w-4 h-4 text-orange-600 bg-gray-100 border-gray-300 rounded focus:ring-orange-500"
                                    disabled={loading}
                                />
                                <label className="ml-2 text-sm font-medium text-gray-700">
                                    অনুপস্থিত জরিমানা
                                </label>
                            </div>

                            {/* Summary */}
                            {(formData.name || formData.fineAmount || formData.percentage) && (
                                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                                    <h4 className="text-sm font-medium text-green-800 mb-2">
                                        সারাংশ:
                                    </h4>
                                    <div className="text-sm text-green-700 space-y-1">
                                        <p>ফাইন ধরণ: <strong>{formData.name}</strong></p>
                                        <p>টাইপ: <strong>{formData.isParcel ? 'শতকরা ভিত্তিক' : 'নির্দিষ্ট পরিমাণ'}</strong></p>
                                        {!formData.isParcel && formData.fineAmount && (
                                            <p>জরিমানার পরিমাণ: <strong>৳{formData.fineAmount}</strong></p>
                                        )}
                                        {formData.isParcel && formData.percentage && (
                                            <p>শতকরা পরিমাণ: <strong>{formData.percentage}%</strong></p>
                                        )}
                                        {formData.isAbsenceFine && (
                                            <p className="text-red-600">⚠️ এটি একটি অনুপস্থিত জরিমানা</p>
                                        )}
                                        {formData.fixedDate && (
                                            <p>নির্ধারিত তারিখ: <strong>{new Date(formData.fixedDate).toLocaleDateString('bn-BD')}</strong></p>
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
                                    className="inline-flex items-center gap-2 px-8 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                            {fineType ? 'আপডেট হচ্ছে...' : 'সংরক্ষণ হচ্ছে...'}
                                        </>
                                    ) : (
                                        <>
                                            <FaSave className="text-sm" />
                                            {fineType ? 'আপডেট করুন' : 'সংরক্ষণ করুন'}
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>

                        {/* Help Text */}
                        <div className="mt-6 p-4 bg-orange-50 rounded-lg border border-orange-200">
                            <h3 className="text-sm font-medium text-orange-800 mb-1">
                                ফাইন টাইপ সম্পর্কে:
                            </h3>
                            <ul className="text-xs text-orange-600 space-y-1">
                                <li>• <strong>নির্দিষ্ট পরিমাণ:</strong> একটি নির্দিষ্ট টাকার পরিমাণ জরিমানা</li>
                                <li>• <strong>শতকরা ভিত্তিক:</strong> মোট ফির শতকরা হারে জরিমানা</li>
                                <li>• <strong>অনুপস্থিত জরিমানা:</strong> অনুপস্থিতির জন্য বিশেষ জরিমানা</li>
                                <li>• <strong>নির্ধারিত তারিখ:</strong> নির্দিষ্ট তারিখে জরিমানা প্রযোজ্য হবে</li>
                                <li>• ফাইন টাইপ তৈরি করার পর এডিট ও ডিলিট করা যাবে</li>
                                <li>• নিষ্ক্রিয় ফাইন টাইপ নতুন জরিমানায় ব্যবহার করা যাবে না</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddNewFine;