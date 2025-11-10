import { useEffect, useState } from 'react';
import { FaArrowLeft, FaSave, FaUpload } from 'react-icons/fa';
import Swal from 'sweetalert2';
import axiosInstance from '../../../../../../../../hooks/axiosInstance/axiosInstance';


const AddIncomes = ({ income, onBack, onSuccess }) => {
    const [formData, setFormData] = useState({
        accountId: '',
        date: new Date().toISOString().split('T')[0],
        amount: '',
        incomeSourceId: '',
        paymentTypeId: '',
        description: '',
        note: '',
        receipt: null
    });
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    
    // Dropdown data
    const [bankAccounts, setBankAccounts] = useState([]);
    const [incomeSources, setIncomeSources] = useState([]);
    const [paymentTypes, setPaymentTypes] = useState([]);
    const [filePreview, setFilePreview] = useState(null);

    useEffect(() => {
        if (income) {
            setFormData({
                accountId: income.accountId || '',
                date: income.date ? new Date(income.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
                amount: income.amount || '',
                incomeSourceId: income.incomeSourceId || '',
                paymentTypeId: income.paymentTypeId || '',
                description: income.description || '',
                note: income.note || '',
                receipt: null
            });
            if (income.receipt) {
                setFilePreview(income.receipt);
            }
        }
        fetchDropdownData();
    }, [income]);

    const fetchDropdownData = async () => {
        try {
            // Fetch bank accounts
            const accountsResponse = await axiosInstance.get('/bank-accounts');
            if (accountsResponse.data.success) {
                setBankAccounts(accountsResponse.data.data);
            }

            // Fetch income sources
            const sourcesResponse = await axiosInstance.get('/income-sources');
            if (sourcesResponse.data.success) {
                setIncomeSources(sourcesResponse.data.data);
            }

            // Fetch payment types
            const paymentResponse = await axiosInstance.get('/payment-types');
            if (paymentResponse.data.success) {
                setPaymentTypes(paymentResponse.data.data);
            }
        } catch (error) {
            console.error('Error fetching dropdown data:', error);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData(prev => ({
                ...prev,
                receipt: file
            }));
            
            // Create preview for images
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    setFilePreview(e.target.result);
                };
                reader.readAsDataURL(file);
            } else {
                setFilePreview(null);
            }
        }
    };

    const validateForm = () => {
        const newErrors = {};
        
        if (!formData.accountId) {
            newErrors.accountId = 'একাউন্ট নির্বাচন করুন';
        }
        
        if (!formData.date) {
            newErrors.date = 'তারিখ প্রয়োজন';
        }
        
        if (!formData.amount || formData.amount <= 0) {
            newErrors.amount = 'সঠিক পরিমাণ প্রয়োজন';
        }
        
        if (!formData.incomeSourceId) {
            newErrors.incomeSourceId = 'আয়ের উৎস নির্বাচন করুন';
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
            const submitData = new FormData();
            
            submitData.append('accountId', formData.accountId);
            submitData.append('date', formData.date);
            submitData.append('amount', formData.amount);
            submitData.append('incomeSourceId', formData.incomeSourceId);
            submitData.append('paymentTypeId', formData.paymentTypeId);
            submitData.append('description', formData.description);
            submitData.append('note', formData.note);
            
            if (formData.receipt) {
                submitData.append('receipt', formData.receipt);
            }

            let response;
            
            if (income) {
                response = await axiosInstance.put(`/incomes/${income._id}`, submitData, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                });
            } else {
                response = await axiosInstance.post('/incomes', submitData, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                });
            }

            if (response.data.success) {
                showSweetAlert('success', response.data.message);
                onSuccess();
            } else {
                setErrors({ submit: response.data.message });
            }
        } catch (error) {
            console.error('Error saving income:', error);
            const errorMessage = error.response?.data?.message || 'আয় সংরক্ষণ করতে সমস্যা হয়েছে';
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
                            {income ? 'আয় এডিট করুন' : 'নতুন আয় যোগ করুন'}
                        </h1>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="p-4 sm:p-6 lg:p-8">
                <div className="max-w-full mx-auto">
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 sm:p-8">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="bg-blue-50 p-4 rounded-lg mb-6">
                                <h3 className="text-lg font-semibold text-blue-800 mb-2">Income Details:</h3>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* একাউন্টসমূহ */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        একাউন্টসমূহ *
                                    </label>
                                    <select
                                        name="accountId"
                                        value={formData.accountId}
                                        onChange={handleChange}
                                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                                            errors.accountId ? 'border-red-500 bg-red-50' : 'border-gray-300'
                                        }`}
                                        disabled={loading}
                                    >
                                        <option value="">একাউন্ট নির্বাচন করুন</option>
                                        {bankAccounts.map(account => (
                                            <option key={account._id} value={account._id}>
                                                {account.name}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.accountId && (
                                        <p className="mt-2 text-sm text-red-600">{errors.accountId}</p>
                                    )}
                                </div>

                                {/* তারিখ */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        তারিখ *
                                    </label>
                                    <input
                                        type="date"
                                        name="date"
                                        value={formData.date}
                                        onChange={handleChange}
                                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                                            errors.date ? 'border-red-500 bg-red-50' : 'border-gray-300'
                                        }`}
                                        disabled={loading}
                                    />
                                    {errors.date && (
                                        <p className="mt-2 text-sm text-red-600">{errors.date}</p>
                                    )}
                                </div>

                                {/* পরিমাণ */}
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

                                {/* আয়ের উৎস */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        আয়ের উৎস *
                                    </label>
                                    <select
                                        name="incomeSourceId"
                                        value={formData.incomeSourceId}
                                        onChange={handleChange}
                                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                                            errors.incomeSourceId ? 'border-red-500 bg-red-50' : 'border-gray-300'
                                        }`}
                                        disabled={loading}
                                    >
                                        <option value="">আয়ের উৎস নির্বাচন করুন</option>
                                        {incomeSources.map(source => (
                                            <option key={source._id} value={source._id}>
                                                {source.name}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.incomeSourceId && (
                                        <p className="mt-2 text-sm text-red-600">{errors.incomeSourceId}</p>
                                    )}
                                </div>

                                {/* Payment Type */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Payment Type
                                    </label>
                                    <select
                                        name="paymentTypeId"
                                        value={formData.paymentTypeId}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                        disabled={loading}
                                    >
                                        <option value="">পেমেন্ট টাইপ নির্বাচন করুন</option>
                                        {paymentTypes.map(type => (
                                            <option key={type._id} value={type._id}>
                                                {type.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Cash Receipt */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Cash Receipt
                                    </label>
                                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                                        <input
                                            type="file"
                                            onChange={handleFileChange}
                                            className="hidden"
                                            id="receipt-upload"
                                            accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
                                        />
                                        <label
                                            htmlFor="receipt-upload"
                                            className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                                        >
                                            <FaUpload className="text-sm" />
                                            {formData.receipt ? 'ফাইল পরিবর্তন করুন' : 'ফাইল আপলোড করুন'}
                                        </label>
                                        {formData.receipt && (
                                            <p className="text-sm text-green-600 mt-2">
                                                {formData.receipt.name}
                                            </p>
                                        )}
                                        {filePreview && formData.receipt?.type?.startsWith('image/') && (
                                            <div className="mt-2">
                                                <img 
                                                    src={filePreview} 
                                                    alt="Preview" 
                                                    className="max-h-32 mx-auto rounded"
                                                />
                                            </div>
                                        )}
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">
                                        ছবি, PDF, ডকুমেন্ট (সর্বোচ্চ ১০MB)
                                    </p>
                                </div>
                            </div>

                            {/* বিবরণ */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    বিবরণ
                                </label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    rows={3}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                    placeholder="আয়ের বিবরণ লিখুন"
                                    disabled={loading}
                                />
                            </div>

                            {/* নোট */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    নোট
                                </label>
                                <textarea
                                    name="note"
                                    value={formData.note}
                                    onChange={handleChange}
                                    rows={2}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                    placeholder="অতিরিক্ত নোট লিখুন"
                                    disabled={loading}
                                />
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
                                            {income ? 'আপডেট হচ্ছে...' : 'সংরক্ষণ হচ্ছে...'}
                                        </>
                                    ) : (
                                        <>
                                            <FaSave className="text-sm" />
                                            {income ? 'আপডেট করুন' : 'আরও যোগ করুন'}
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

export default AddIncomes;