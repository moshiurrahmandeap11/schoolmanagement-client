import { useEffect, useState } from 'react';
import { FaArrowLeft, FaMoneyBillWave, FaPercentage, FaSave } from 'react-icons/fa';
import Swal from 'sweetalert2';
import axiosInstance from '../../../../../../../hooks/axiosInstance/axiosInstance';
import MainButton from '../../../../../../sharedItems/Mainbutton/Mainbutton';

const AddNewDiscountJog = ({ discount, onBack, onSuccess }) => {
    const [formData, setFormData] = useState({
        sessionId: '',
        sessionName: '',
        classId: '',
        className: '',
        batchId: '',
        batchName: '',
        feeTypeId: '',
        feeTypeName: '',
        discountTypeId: '',
        discountTypeName: '',
        discountAmount: '',
        discountPercentage: '',
        description: ''
    });
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    
    // Dropdown data
    const [sessions, setSessions] = useState([]);
    const [classes, setClasses] = useState([]);
    const [batches, setBatches] = useState([]);
    const [feeTypes, setFeeTypes] = useState([]);
    const [discountTypes, setDiscountTypes] = useState([]);

    useEffect(() => {
        fetchDropdownData();
        if (discount) {
            setFormData({
                sessionId: discount.sessionId || '',
                sessionName: discount.sessionName || '',
                classId: discount.classId || '',
                className: discount.className || '',
                batchId: discount.batchId || '',
                batchName: discount.batchName || '',
                feeTypeId: discount.feeTypeId || '',
                feeTypeName: discount.feeTypeName || '',
                discountTypeId: discount.discountTypeId || '',
                discountTypeName: discount.discountTypeName || '',
                discountAmount: discount.discountAmount || '',
                discountPercentage: discount.discountPercentage || '',
                description: discount.description || ''
            });
        }
    }, [discount]);

    const fetchDropdownData = async () => {
        try {
            // Fetch sessions
            const sessionsResponse = await axiosInstance.get('/sessions');
            if (sessionsResponse.data.success) {
                setSessions(sessionsResponse.data.data || []);
            }

            // Fetch classes
            const classesResponse = await axiosInstance.get('/class');
            if (classesResponse.data.success) {
                setClasses(classesResponse.data.data || []);
            }

            // Fetch batches
            const batchesResponse = await axiosInstance.get('/batches');
            if (batchesResponse.data.success) {
                setBatches(batchesResponse.data.data || []);
            }

            // Fetch fee types
            const feeTypesResponse = await axiosInstance.get('/fee-types');
            if (feeTypesResponse.data.success) {
                setFeeTypes(feeTypesResponse.data.data || []);
            }

            // Fetch discount types (from fine-types)
            const discountTypesResponse = await axiosInstance.get('/fine-types');
            if (discountTypesResponse.data.success) {
                setDiscountTypes(discountTypesResponse.data.data || []);
            }
        } catch (error) {
            console.error('Error fetching dropdown data:', error);
            showSweetAlert('error', 'ডেটা লোড করতে সমস্যা হয়েছে');
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }

        // Update names when IDs change
        if (name === 'sessionId') {
            const selectedSession = sessions.find(s => s._id === value);
            setFormData(prev => ({
                ...prev,
                sessionName: selectedSession ? selectedSession.name : ''
            }));
        }

        if (name === 'classId') {
            const selectedClass = classes.find(c => c._id === value);
            setFormData(prev => ({
                ...prev,
                className: selectedClass ? selectedClass.name : ''
            }));
        }

        if (name === 'batchId') {
            const selectedBatch = batches.find(b => b._id === value);
            setFormData(prev => ({
                ...prev,
                batchName: selectedBatch ? selectedBatch.name : ''
            }));
        }

        if (name === 'feeTypeId') {
            const selectedFeeType = feeTypes.find(f => f._id === value);
            setFormData(prev => ({
                ...prev,
                feeTypeName: selectedFeeType ? selectedFeeType.name : ''
            }));
        }

        if (name === 'discountTypeId') {
            const selectedDiscountType = discountTypes.find(d => d._id === value);
            setFormData(prev => ({
                ...prev,
                discountTypeName: selectedDiscountType ? selectedDiscountType.name : '',
                discountAmount: '',
                discountPercentage: ''
            }));
        }

        // Clear percentage when amount is entered and vice versa
        if (name === 'discountAmount' && value) {
            setFormData(prev => ({
                ...prev,
                discountPercentage: ''
            }));
        }

        if (name === 'discountPercentage' && value) {
            setFormData(prev => ({
                ...prev,
                discountAmount: ''
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {};
        
        if (!formData.sessionId) {
            newErrors.sessionId = 'সেশন নির্বাচন করুন';
        }

        if (!formData.classId) {
            newErrors.classId = 'ক্লাস নির্বাচন করুন';
        }

        if (!formData.feeTypeId) {
            newErrors.feeTypeId = 'ফি টাইপ নির্বাচন করুন';
        }

        if (!formData.discountTypeId) {
            newErrors.discountTypeId = 'ছাড়ের টাইপ নির্বাচন করুন';
        }

        if (!formData.discountAmount && !formData.discountPercentage) {
            newErrors.discountAmount = 'ছাড়ের পরিমাণ বা শতাংশ লিখুন';
        }

        if (formData.discountAmount && formData.discountPercentage) {
            newErrors.discountAmount = 'শুধুমাত্র একটি ছাড়ের পরিমাণ বা শতাংশ লিখুন';
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
                sessionId: formData.sessionId,
                sessionName: formData.sessionName,
                classId: formData.classId,
                className: formData.className,
                batchId: formData.batchId || null,
                batchName: formData.batchName,
                feeTypeId: formData.feeTypeId,
                feeTypeName: formData.feeTypeName,
                discountTypeId: formData.discountTypeId,
                discountTypeName: formData.discountTypeName,
                discountAmount: formData.discountAmount || 0,
                discountPercentage: formData.discountPercentage || 0,
                description: formData.description
            };

            if (discount) {
                // Update existing discount
                response = await axiosInstance.put(`/discounts/${discount._id}`, submitData);
            } else {
                // Create new discount
                response = await axiosInstance.post('/discounts/add-discount', submitData);
            }

            if (response.data.success) {
                showSweetAlert('success', response.data.message);
                onSuccess();
            } else {
                setErrors({ submit: response.data.message });
            }
        } catch (error) {
            console.error('Error saving discount:', error);
            const errorMessage = error.response?.data?.message || 'ডিসকাউন্ট সংরক্ষণ করতে সমস্যা হয়েছে';
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
                            {discount ? 'ডিসকাউন্ট এডিট করুন' : 'নতুন ডিসকাউন্ট যোগ করুন'}
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
                                <h3 className="text-lg font-semibold text-[#1e90c9] mb-2">
                                    ডিসকাউন্ট তথ্য:
                                </h3>
                            </div>

                            {/* Session and Class */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        সেশন *
                                    </label>
                                    <select
                                        name="sessionId"
                                        value={formData.sessionId}
                                        onChange={handleChange}
                                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9] focus:border-transparent transition-all ${
                                            errors.sessionId ? 'border-red-500 bg-red-50' : 'border-gray-300'
                                        }`}
                                        disabled={loading}
                                    >
                                        <option value="">সেশন নির্বাচন করুন</option>
                                        {sessions.map((session) => (
                                            <option key={session._id} value={session._id}>
                                                {session.name}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.sessionId && (
                                        <p className="mt-2 text-sm text-red-600">{errors.sessionId}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        ক্লাস *
                                    </label>
                                    <select
                                        name="classId"
                                        value={formData.classId}
                                        onChange={handleChange}
                                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9] focus:border-transparent transition-all ${
                                            errors.classId ? 'border-red-500 bg-red-50' : 'border-gray-300'
                                        }`}
                                        disabled={loading}
                                    >
                                        <option value="">ক্লাস নির্বাচন করুন</option>
                                        {classes.map((classItem) => (
                                            <option key={classItem._id} value={classItem._id}>
                                                {classItem.name}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.classId && (
                                        <p className="mt-2 text-sm text-red-600">{errors.classId}</p>
                                    )}
                                </div>
                            </div>

                            {/* Batch and Fee Type */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        ব্যাচ
                                    </label>
                                    <select
                                        name="batchId"
                                        value={formData.batchId}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9] focus:border-transparent transition-all"
                                        disabled={loading}
                                    >
                                        <option value="">সকল ব্যাচ (ঐচ্ছিক)</option>
                                        {batches.map((batch) => (
                                            <option key={batch._id} value={batch._id}>
                                                {batch.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        ফি নির্বাচন করুন *
                                    </label>
                                    <select
                                        name="feeTypeId"
                                        value={formData.feeTypeId}
                                        onChange={handleChange}
                                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9] focus:border-transparent transition-all ${
                                            errors.feeTypeId ? 'border-red-500 bg-red-50' : 'border-gray-300'
                                        }`}
                                        disabled={loading}
                                    >
                                        <option value="">ফি টাইপ নির্বাচন করুন</option>
                                        {feeTypes.map((feeType) => (
                                            <option key={feeType._id} value={feeType._id}>
                                                {feeType.name} - ৳{feeType.amount}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.feeTypeId && (
                                        <p className="mt-2 text-sm text-red-600">{errors.feeTypeId}</p>
                                    )}
                                </div>
                            </div>

                            {/* Discount Type and Amount */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        ছাড় নির্বাচন করুন *
                                    </label>
                                    <select
                                        name="discountTypeId"
                                        value={formData.discountTypeId}
                                        onChange={handleChange}
                                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9] focus:border-transparent transition-all ${
                                            errors.discountTypeId ? 'border-red-500 bg-red-50' : 'border-gray-300'
                                        }`}
                                        disabled={loading}
                                    >
                                        <option value="">ছাড়ের ধরন নির্বাচন করুন</option>
                                        {discountTypes.map((discountType) => (
                                            <option key={discountType._id} value={discountType._id}>
                                                {discountType.name}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.discountTypeId && (
                                        <p className="mt-2 text-sm text-red-600">{errors.discountTypeId}</p>
                                    )}
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            ছাড়ের পরিমাণ
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                name="discountAmount"
                                                value={formData.discountAmount}
                                                onChange={handleChange}
                                                placeholder="0.00"
                                                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9] focus:border-transparent transition-all ${
                                                    errors.discountAmount ? 'border-red-500 bg-red-50' : 'border-gray-300'
                                                }`}
                                                disabled={loading}
                                            />
                                            <FaMoneyBillWave className="absolute right-3 top-3.5 text-gray-400" />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            শতাংশ (%)
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                name="discountPercentage"
                                                value={formData.discountPercentage}
                                                onChange={handleChange}
                                                placeholder="0"
                                                min="0"
                                                max="100"
                                                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9] focus:border-transparent transition-all ${
                                                    errors.discountAmount ? 'border-red-500 bg-red-50' : 'border-gray-300'
                                                }`}
                                                disabled={loading}
                                            />
                                            <FaPercentage className="absolute right-3 top-3.5 text-gray-400" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {errors.discountAmount && (
                                <p className="text-sm text-red-600">{errors.discountAmount}</p>
                            )}

                            {/* Description */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    বিবরণ (ঐচ্ছিক)
                                </label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    rows="3"
                                    placeholder="ছাড় সম্পর্কে অতিরিক্ত তথ্য..."
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9] focus:border-transparent transition-all"
                                    disabled={loading}
                                />
                            </div>

                            {/* Summary */}
                            {(formData.sessionName || formData.className || formData.feeTypeName) && (
                                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                                    <h4 className="text-sm font-medium text-blue-800 mb-2">
                                        সারাংশ:
                                    </h4>
                                    <div className="text-sm text-blue-700 space-y-1">
                                        {formData.sessionName && (
                                            <p>সেশন: <strong>{formData.sessionName}</strong></p>
                                        )}
                                        {formData.className && (
                                            <p>ক্লাস: <strong>{formData.className}</strong></p>
                                        )}
                                        {formData.batchName && (
                                            <p>ব্যাচ: <strong>{formData.batchName}</strong></p>
                                        )}
                                        {formData.feeTypeName && (
                                            <p>ফি টাইপ: <strong>{formData.feeTypeName}</strong></p>
                                        )}
                                        {formData.discountTypeName && (
                                            <p>ছাড়ের ধরন: <strong>{formData.discountTypeName}</strong></p>
                                        )}
                                        {formData.discountAmount && (
                                            <p>ছাড়ের পরিমাণ: <strong>৳{formData.discountAmount}</strong></p>
                                        )}
                                        {formData.discountPercentage && (
                                            <p>ছাড়ের শতাংশ: <strong>{formData.discountPercentage}%</strong></p>
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
                                <MainButton
                                    type="submit"
                                    disabled={loading}
                                    className="rounded-md"
                                >
                                    {loading ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                            {discount ? 'আপডেট হচ্ছে...' : 'সংরক্ষণ হচ্ছে...'}
                                        </>
                                    ) : (
                                        <>
                                            <FaSave className="text-sm mr-2" />
                                            {discount ? 'আপডেট করুন' : 'সংরক্ষণ করুন'}
                                        </>
                                    )}
                                </MainButton>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddNewDiscountJog;