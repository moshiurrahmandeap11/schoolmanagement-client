import { useEffect, useState } from 'react';
import { FaCalendarAlt, FaSave } from 'react-icons/fa';
import Swal from 'sweetalert2';
import axiosInstance from '../../../../../../hooks/axiosInstance/axiosInstance';
import Loader from '../../../../../sharedItems/Loader/Loader';

const FeeSettings = ({ onBack }) => {
    const [formData, setFormData] = useState({
        incomeSourceId: '',
        incomeSourceName: '',
        accountId: '',
        accountName: '',
        paymentTypeId: '',
        paymentTypeName: '',
        sendMessage: false,
        feeSms: '',
        lateFeeSms: '',
        sendLateFeeSms: false,
        monthlyFeeStartFrom: '',
        monthlyFeeEnd: '',
        boardingFeeStartFrom: '',
        boardingFeeEnd: ''
    });
    const [loading, setLoading] = useState(false);
    const [fetchLoading, setFetchLoading] = useState(true);
    const [errors, setErrors] = useState({});
    
    // Dropdown data
    const [incomeSources, setIncomeSources] = useState([]);
    const [accounts, setAccounts] = useState([]);
    const [paymentTypes, setPaymentTypes] = useState([]);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setFetchLoading(true);
            
            // Fetch fee settings
            const settingsResponse = await axiosInstance.get('/fee-settings');
            if (settingsResponse.data.success) {
                const settings = settingsResponse.data.data;
                if (settings) {
                    setFormData({
                        incomeSourceId: settings.incomeSourceId || '',
                        incomeSourceName: settings.incomeSourceName || '',
                        accountId: settings.accountId || '',
                        accountName: settings.accountName || '',
                        paymentTypeId: settings.paymentTypeId || '',
                        paymentTypeName: settings.paymentTypeName || '',
                        sendMessage: settings.sendMessage || false,
                        feeSms: settings.feeSms || '',
                        lateFeeSms: settings.lateFeeSms || '',
                        sendLateFeeSms: settings.sendLateFeeSms || false,
                        monthlyFeeStartFrom: settings.monthlyFeeStartFrom ? settings.monthlyFeeStartFrom.split('T')[0] : '',
                        monthlyFeeEnd: settings.monthlyFeeEnd ? settings.monthlyFeeEnd.split('T')[0] : '',
                        boardingFeeStartFrom: settings.boardingFeeStartFrom ? settings.boardingFeeStartFrom.split('T')[0] : '',
                        boardingFeeEnd: settings.boardingFeeEnd ? settings.boardingFeeEnd.split('T')[0] : ''
                    });
                }
            }

            // Fetch dropdown data
            await fetchDropdownData();
        } catch (error) {
            console.error('Error fetching data:', error);
            showSweetAlert('error', 'ডেটা লোড করতে সমস্যা হয়েছে');
        } finally {
            setFetchLoading(false);
        }
    };

    const fetchDropdownData = async () => {
        try {
            // Fetch income sources
            const incomeSourcesResponse = await axiosInstance.get('/income-sources');
            if (incomeSourcesResponse.data.success) {
                setIncomeSources(incomeSourcesResponse.data.data || []);
            }

            // Fetch bank accounts
            const accountsResponse = await axiosInstance.get('/bank-accounts');
            if (accountsResponse.data.success) {
                setAccounts(accountsResponse.data.data || []);
            }

            // Fetch payment types
            const paymentTypesResponse = await axiosInstance.get('/payment-types');
            if (paymentTypesResponse.data.success) {
                setPaymentTypes(paymentTypesResponse.data.data || []);
            }
        } catch (error) {
            console.error('Error fetching dropdown data:', error);
            showSweetAlert('error', 'ডেটা লোড করতে সমস্যা হয়েছে');
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

        // Update names when IDs change
        if (name === 'incomeSourceId') {
            const selectedIncomeSource = incomeSources.find(i => i._id === value);
            setFormData(prev => ({
                ...prev,
                incomeSourceName: selectedIncomeSource ? selectedIncomeSource.name : ''
            }));
        }

        if (name === 'accountId') {
            const selectedAccount = accounts.find(a => a._id === value);
            setFormData(prev => ({
                ...prev,
                accountName: selectedAccount ? selectedAccount.name : ''
            }));
        }

        if (name === 'paymentTypeId') {
            const selectedPaymentType = paymentTypes.find(p => p._id === value);
            setFormData(prev => ({
                ...prev,
                paymentTypeName: selectedPaymentType ? selectedPaymentType.name : ''
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {};
        
        if (!formData.incomeSourceId) {
            newErrors.incomeSourceId = 'আয়ের উৎস নির্বাচন করুন';
        }

        if (!formData.accountId) {
            newErrors.accountId = 'অ্যাকাউন্ট নির্বাচন করুন';
        }

        if (!formData.paymentTypeId) {
            newErrors.paymentTypeId = 'পেমেন্ট টাইপ নির্বাচন করুন';
        }

        if (formData.sendMessage && !formData.feeSms) {
            newErrors.feeSms = 'ফি এসএমএস টেমপ্লেট লিখুন';
        }

        if (formData.sendLateFeeSms && !formData.lateFeeSms) {
            newErrors.lateFeeSms = 'লেট ফি এসএমএস টেমপ্লেট লিখুন';
        }

        if (!formData.monthlyFeeStartFrom) {
            newErrors.monthlyFeeStartFrom = 'মাসিক ফি শুরুর তারিখ নির্বাচন করুন';
        }

        if (!formData.monthlyFeeEnd) {
            newErrors.monthlyFeeEnd = 'মাসিক ফি শেষের তারিখ নির্বাচন করুন';
        }

        if (formData.monthlyFeeEnd && formData.monthlyFeeStartFrom && 
            new Date(formData.monthlyFeeEnd) <= new Date(formData.monthlyFeeStartFrom)) {
            newErrors.monthlyFeeEnd = 'মাসিক ফি শেষের তারিখ শুরুর তারিখের পরে হতে হবে';
        }

        if (!formData.boardingFeeStartFrom) {
            newErrors.boardingFeeStartFrom = 'বোর্ডিং ফি শুরুর তারিখ নির্বাচন করুন';
        }

        if (!formData.boardingFeeEnd) {
            newErrors.boardingFeeEnd = 'বোর্ডিং ফি শেষের তারিখ নির্বাচন করুন';
        }

        if (formData.boardingFeeEnd && formData.boardingFeeStartFrom && 
            new Date(formData.boardingFeeEnd) <= new Date(formData.boardingFeeStartFrom)) {
            newErrors.boardingFeeEnd = 'বোর্ডিং ফি শেষের তারিখ শুরুর তারিখের পরে হতে হবে';
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
            const submitData = {
                incomeSourceId: formData.incomeSourceId,
                incomeSourceName: formData.incomeSourceName,
                accountId: formData.accountId,
                accountName: formData.accountName,
                paymentTypeId: formData.paymentTypeId,
                paymentTypeName: formData.paymentTypeName,
                sendMessage: formData.sendMessage,
                feeSms: formData.feeSms,
                lateFeeSms: formData.lateFeeSms,
                sendLateFeeSms: formData.sendLateFeeSms,
                monthlyFeeStartFrom: formData.monthlyFeeStartFrom,
                monthlyFeeEnd: formData.monthlyFeeEnd,
                boardingFeeStartFrom: formData.boardingFeeStartFrom,
                boardingFeeEnd: formData.boardingFeeEnd
            };

            const response = await axiosInstance.post('/fee-settings/fee-settings', submitData);

            if (response.data.success) {
                showSweetAlert('success', response.data.message);
            } else {
                setErrors({ submit: response.data.message });
            }
        } catch (error) {
            console.error('Error saving fee settings:', error);
            const errorMessage = error.response?.data?.message || 'ফি সেটিংস সংরক্ষণ করতে সমস্যা হয়েছে';
            setErrors({ submit: errorMessage });
            showSweetAlert('error', errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        return new Date(dateString).toLocaleDateString('bn-BD');
    };

    if (fetchLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex justify-center items-center">
                <div className="text-center">
                    <Loader />
                    <p className="text-gray-600 mt-3">ফি সেটিংস লোড হচ্ছে...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">


            {/* Main Content */}
            <div className="p-4 sm:p-6 lg:p-8">
                <div className="max-w-full mx-auto">
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 sm:p-8">
                        <form onSubmit={handleSubmit} className="space-y-8">
                            <div className="bg-blue-50 p-4 rounded-lg mb-6">
                                <h3 className="text-lg font-semibold text-blue-800 mb-2">
                                    ফি সেটিংস কনফিগারেশন
                                </h3>
                                <p className="text-sm text-blue-600">
                                    ফি সম্পর্কিত সকল সেটিংস এখানে কনফিগার করুন
                                </p>
                            </div>

                            {/* Basic Settings */}
                            <div className="space-y-6">
                                <h4 className="text-lg font-semibold text-gray-800 border-b pb-2">
                                    মৌলিক সেটিংস
                                </h4>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Income Source *
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
                                            <option value="">আয়ের উৎস নির্বাচন করুন</option>
                                            {incomeSources.map((source) => (
                                                <option key={source._id} value={source._id}>
                                                    {source.name}
                                                </option>
                                            ))}
                                        </select>
                                        {errors.incomeSourceId && (
                                            <p className="mt-2 text-sm text-red-600">{errors.incomeSourceId}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Account *
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
                                            <option value="">অ্যাকাউন্ট নির্বাচন করুন</option>
                                            {accounts.map((account) => (
                                                <option key={account._id} value={account._id}>
                                                    {account.name}
                                                </option>
                                            ))}
                                        </select>
                                        {errors.accountId && (
                                            <p className="mt-2 text-sm text-red-600">{errors.accountId}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Payment Type *
                                        </label>
                                        <select
                                            name="paymentTypeId"
                                            value={formData.paymentTypeId}
                                            onChange={handleChange}
                                            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                                                errors.paymentTypeId ? 'border-red-500 bg-red-50' : 'border-gray-300'
                                            }`}
                                            disabled={loading}
                                        >
                                            <option value="">পেমেন্ট টাইপ নির্বাচন করুন</option>
                                            {paymentTypes.map((type) => (
                                                <option key={type._id} value={type._id}>
                                                    {type.name}
                                                </option>
                                            ))}
                                        </select>
                                        {errors.paymentTypeId && (
                                            <p className="mt-2 text-sm text-red-600">{errors.paymentTypeId}</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* SMS Settings */}
                            <div className="space-y-6">
                                <h4 className="text-lg font-semibold text-gray-800 border-b pb-2">
                                    এসএমএস সেটিংস
                                </h4>
                                
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <input
                                            type="checkbox"
                                            name="sendMessage"
                                            checked={formData.sendMessage}
                                            onChange={handleChange}
                                            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                                            disabled={loading}
                                        />
                                        <label className="text-sm font-medium text-gray-700">
                                            Send Message
                                        </label>
                                    </div>

                                    {formData.sendMessage && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Fee SMS Template *
                                            </label>
                                            <textarea
                                                name="feeSms"
                                                value={formData.feeSms}
                                                onChange={handleChange}
                                                rows="3"
                                                placeholder="ফি এসএমএস টেমপ্লেট লিখুন..."
                                                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                                                    errors.feeSms ? 'border-red-500 bg-red-50' : 'border-gray-300'
                                                }`}
                                                disabled={loading}
                                            />
                                            {errors.feeSms && (
                                                <p className="mt-2 text-sm text-red-600">{errors.feeSms}</p>
                                            )}
                                        </div>
                                    )}

                                    <div className="flex items-center gap-3">
                                        <input
                                            type="checkbox"
                                            name="sendLateFeeSms"
                                            checked={formData.sendLateFeeSms}
                                            onChange={handleChange}
                                            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                                            disabled={loading}
                                        />
                                        <label className="text-sm font-medium text-gray-700">
                                            Send Late Fee SMS
                                        </label>
                                    </div>

                                    {formData.sendLateFeeSms && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Late Fee SMS Template *
                                            </label>
                                            <textarea
                                                name="lateFeeSms"
                                                value={formData.lateFeeSms}
                                                onChange={handleChange}
                                                rows="3"
                                                placeholder="লেট ফি এসএমএস টেমপ্লেট লিখুন..."
                                                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                                                    errors.lateFeeSms ? 'border-red-500 bg-red-50' : 'border-gray-300'
                                                }`}
                                                disabled={loading}
                                            />
                                            {errors.lateFeeSms && (
                                                <p className="mt-2 text-sm text-red-600">{errors.lateFeeSms}</p>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Date Settings */}
                            <div className="space-y-6">
                                <h4 className="text-lg font-semibold text-gray-800 border-b pb-2">
                                    তারিখ সেটিংস
                                </h4>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Monthly Fee Start From *
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="date"
                                                name="monthlyFeeStartFrom"
                                                value={formData.monthlyFeeStartFrom}
                                                onChange={handleChange}
                                                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                                                    errors.monthlyFeeStartFrom ? 'border-red-500 bg-red-50' : 'border-gray-300'
                                                }`}
                                                disabled={loading}
                                            />
                                            <FaCalendarAlt className="absolute right-3 top-3.5 text-gray-400" />
                                        </div>
                                        {errors.monthlyFeeStartFrom && (
                                            <p className="mt-2 text-sm text-red-600">{errors.monthlyFeeStartFrom}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Monthly Fee End *
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="date"
                                                name="monthlyFeeEnd"
                                                value={formData.monthlyFeeEnd}
                                                onChange={handleChange}
                                                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                                                    errors.monthlyFeeEnd ? 'border-red-500 bg-red-50' : 'border-gray-300'
                                                }`}
                                                disabled={loading}
                                            />
                                            <FaCalendarAlt className="absolute right-3 top-3.5 text-gray-400" />
                                        </div>
                                        {errors.monthlyFeeEnd && (
                                            <p className="mt-2 text-sm text-red-600">{errors.monthlyFeeEnd}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Boarding Fee Starts From *
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="date"
                                                name="boardingFeeStartFrom"
                                                value={formData.boardingFeeStartFrom}
                                                onChange={handleChange}
                                                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                                                    errors.boardingFeeStartFrom ? 'border-red-500 bg-red-50' : 'border-gray-300'
                                                }`}
                                                disabled={loading}
                                            />
                                            <FaCalendarAlt className="absolute right-3 top-3.5 text-gray-400" />
                                        </div>
                                        {errors.boardingFeeStartFrom && (
                                            <p className="mt-2 text-sm text-red-600">{errors.boardingFeeStartFrom}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Boarding Fee End *
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="date"
                                                name="boardingFeeEnd"
                                                value={formData.boardingFeeEnd}
                                                onChange={handleChange}
                                                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                                                    errors.boardingFeeEnd ? 'border-red-500 bg-red-50' : 'border-gray-300'
                                                }`}
                                                disabled={loading}
                                            />
                                            <FaCalendarAlt className="absolute right-3 top-3.5 text-gray-400" />
                                        </div>
                                        {errors.boardingFeeEnd && (
                                            <p className="mt-2 text-sm text-red-600">{errors.boardingFeeEnd}</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Summary */}
                            {(formData.incomeSourceName || formData.accountName || formData.paymentTypeName) && (
                                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                                    <h4 className="text-sm font-medium text-green-800 mb-2">
                                        সারাংশ:
                                    </h4>
                                    <div className="text-sm text-green-700 space-y-1">
                                        {formData.incomeSourceName && (
                                            <p>আয়ের উৎস: <strong>{formData.incomeSourceName}</strong></p>
                                        )}
                                        {formData.accountName && (
                                            <p>অ্যাকাউন্ট: <strong>{formData.accountName}</strong></p>
                                        )}
                                        {formData.paymentTypeName && (
                                            <p>পেমেন্ট টাইপ: <strong>{formData.paymentTypeName}</strong></p>
                                        )}
                                        {formData.monthlyFeeStartFrom && (
                                            <p>মাসিক ফি শুরু: <strong>{formatDate(formData.monthlyFeeStartFrom)}</strong></p>
                                        )}
                                        {formData.monthlyFeeEnd && (
                                            <p>মাসিক ফি শেষ: <strong>{formatDate(formData.monthlyFeeEnd)}</strong></p>
                                        )}
                                        {formData.boardingFeeStartFrom && (
                                            <p>বোর্ডিং ফি শুরু: <strong>{formatDate(formData.boardingFeeStartFrom)}</strong></p>
                                        )}
                                        {formData.boardingFeeEnd && (
                                            <p>বোর্ডিং ফি শেষ: <strong>{formatDate(formData.boardingFeeEnd)}</strong></p>
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
                                    className="inline-flex items-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                            সংরক্ষণ হচ্ছে...
                                        </>
                                    ) : (
                                        <>
                                            <FaSave className="text-sm" />
                                            সংরক্ষণ করুন
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

export default FeeSettings;