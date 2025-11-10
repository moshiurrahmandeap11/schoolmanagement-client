import { useEffect, useState } from 'react';
import { FaArrowLeft, FaSave } from 'react-icons/fa';
import Swal from 'sweetalert2';
import axiosInstance from '../../../../../../../../hooks/axiosInstance/axiosInstance';


const AddNewExpenseHead = ({ expenseHead, onBack, onSuccess }) => {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        amount: '',
        isMonthly: false,
        applicableFrom: '',
        endsAt: '',
        sessionId: '',
        categoryId: ''
    });
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [categories, setCategories] = useState([]);
    const [sessions, setSessions] = useState([]);

    useEffect(() => {
        if (expenseHead) {
            setFormData({
                name: expenseHead.name || '',
                description: expenseHead.description || '',
                amount: expenseHead.amount || '',
                isMonthly: expenseHead.isMonthly || false,
                applicableFrom: expenseHead.applicableFrom ? expenseHead.applicableFrom.split('T')[0] : '',
                endsAt: expenseHead.endsAt ? expenseHead.endsAt.split('T')[0] : '',
                sessionId: expenseHead.sessionId || '',
                categoryId: expenseHead.categoryId || ''
            });
        }
        fetchDropdownData();
    }, [expenseHead]);

    const fetchDropdownData = async () => {
        try {
            // Fetch categories
            const categoriesResponse = await axiosInstance.get('/expense-category');
            if (categoriesResponse.data.success) {
                setCategories(categoriesResponse.data.data);
            }

            // Fetch sessions
            const sessionsResponse = await axiosInstance.get('/sessions');
            if (sessionsResponse.data.success) {
                setSessions(sessionsResponse.data.data);
            }
        } catch (error) {
            console.error('Error fetching dropdown data:', error);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
        
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
            newErrors.name = 'খরচের হেডের নাম প্রয়োজন';
        }
        
        if (!formData.amount || formData.amount <= 0) {
            newErrors.amount = 'সঠিক পরিমাণ প্রয়োজন';
        }

        if (formData.applicableFrom && formData.endsAt) {
            const fromDate = new Date(formData.applicableFrom);
            const toDate = new Date(formData.endsAt);
            if (fromDate > toDate) {
                newErrors.endsAt = 'শেষ তারিখ শুরু তারিখের আগে হতে পারে না';
            }
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
                description: formData.description.trim(),
                amount: parseFloat(formData.amount),
                isMonthly: formData.isMonthly,
                applicableFrom: formData.applicableFrom || null,
                endsAt: formData.endsAt || null,
                sessionId: formData.sessionId || null,
                categoryId: formData.categoryId || null
            };

            if (expenseHead) {
                response = await axiosInstance.put(`/expense-heads/${expenseHead._id}`, submitData);
            } else {
                response = await axiosInstance.post('/expense-heads', submitData);
            }

            if (response.data.success) {
                showSweetAlert('success', response.data.message);
                onSuccess();
            } else {
                setErrors({ submit: response.data.message });
            }
        } catch (error) {
            console.error('Error saving expense head:', error);
            const errorMessage = error.response?.data?.message || 'খরচের হেড সংরক্ষণ করতে সমস্যা হয়েছে';
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
                            {expenseHead ? 'খরচের হেড এডিট করুন' : 'নতুন খরচের হেড যোগ করুন'}
                        </h1>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="p-4 sm:p-6 lg:p-8">
                <div className="max-w-full mx-auto">
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 sm:p-8">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Name Field */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        খরচের হেডের নাম *
                                    </label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                                            errors.name ? 'border-red-500 bg-red-50' : 'border-gray-300'
                                        }`}
                                        placeholder="খরচের হেডের নাম লিখুন"
                                        disabled={loading}
                                    />
                                    {errors.name && (
                                        <p className="mt-2 text-sm text-red-600">{errors.name}</p>
                                    )}
                                </div>

                                {/* Amount Field */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        পরিমাণ *
                                    </label>
                                    <input
                                        type="number"
                                        name="amount"
                                        value={formData.amount}
                                        onChange={handleChange}
                                        step="0.01"
                                        min="0"
                                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                                            errors.amount ? 'border-red-500 bg-red-50' : 'border-gray-300'
                                        }`}
                                        placeholder="পরিমাণ লিখুন"
                                        disabled={loading}
                                    />
                                    {errors.amount && (
                                        <p className="mt-2 text-sm text-red-600">{errors.amount}</p>
                                    )}
                                </div>

                                {/* Category Dropdown */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        খরচের ক্যাটাগরি
                                    </label>
                                    <select
                                        name="categoryId"
                                        value={formData.categoryId}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                        disabled={loading}
                                    >
                                        <option value="">ক্যাটাগরি নির্বাচন করুন</option>
                                        {categories.map(category => (
                                            <option key={category._id} value={category._id}>
                                                {category.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Session Dropdown */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        সেশন
                                    </label>
                                    <select
                                        name="sessionId"
                                        value={formData.sessionId}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                        disabled={loading}
                                    >
                                        <option value="">সেশন নির্বাচন করুন</option>
                                        {sessions.map(session => (
                                            <option key={session._id} value={session._id}>
                                                {session.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Applicable From Date */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        প্রযোজ্য তারিখ থেকে
                                    </label>
                                    <input
                                        type="date"
                                        name="applicableFrom"
                                        value={formData.applicableFrom}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                        disabled={loading}
                                    />
                                </div>

                                {/* Ends At Date */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        শেষ তারিখ
                                    </label>
                                    <input
                                        type="date"
                                        name="endsAt"
                                        value={formData.endsAt}
                                        onChange={handleChange}
                                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                                            errors.endsAt ? 'border-red-500 bg-red-50' : 'border-gray-300'
                                        }`}
                                        disabled={loading}
                                    />
                                    {errors.endsAt && (
                                        <p className="mt-2 text-sm text-red-600">{errors.endsAt}</p>
                                    )}
                                </div>
                            </div>

                            {/* Description Field */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    বিবরণ
                                </label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    rows={4}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                    placeholder="বিবরণ লিখুন"
                                    disabled={loading}
                                />
                            </div>

                            {/* Monthly Checkbox */}
                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    name="isMonthly"
                                    checked={formData.isMonthly}
                                    onChange={handleChange}
                                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                    disabled={loading}
                                />
                                <label className="ml-2 text-sm font-medium text-gray-700">
                                    মাসিক খরচ
                                </label>
                            </div>

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
                                    className="inline-flex items-center gap-2 px-8 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                            {expenseHead ? 'আপডেট হচ্ছে...' : 'সংরক্ষণ হচ্ছে...'}
                                        </>
                                    ) : (
                                        <>
                                            <FaSave className="text-sm" />
                                            {expenseHead ? 'আপডেট করুন' : 'সংরক্ষণ করুন'}
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddNewExpenseHead;