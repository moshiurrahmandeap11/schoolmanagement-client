import { useEffect, useState } from 'react';
import { FaArrowLeft, FaCalendarAlt, FaMoneyBillWave, FaSave } from 'react-icons/fa';
import Swal from 'sweetalert2';
import axiosInstance from '../../../../../../../hooks/axiosInstance/axiosInstance';

const AddNewFee = ({ fee, onBack, onSuccess }) => {
    const [formData, setFormData] = useState({
        feeTypeId: '',
        feeTypeName: '',
        feeTypeAmount: '',
        classId: '',
        className: '',
        sessionId: '',
        sessionName: '',
        feeApplicableFrom: '',
        feeEndDate: ''
    });
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    
    // Dropdown data
    const [feeTypes, setFeeTypes] = useState([]);
    const [classes, setClasses] = useState([]);
    const [sessions, setSessions] = useState([]);

    useEffect(() => {
        fetchDropdownData();
        if (fee) {
            setFormData({
                feeTypeId: fee.feeTypeId || '',
                feeTypeName: fee.feeTypeName || '',
                feeTypeAmount: fee.feeTypeAmount || '',
                classId: fee.classId || '',
                className: fee.className || '',
                sessionId: fee.sessionId || '',
                sessionName: fee.sessionName || '',
                feeApplicableFrom: fee.feeApplicableFrom ? fee.feeApplicableFrom.split('T')[0] : '',
                feeEndDate: fee.feeEndDate ? fee.feeEndDate.split('T')[0] : ''
            });
        }
    }, [fee]);

    const fetchDropdownData = async () => {
        try {
            // Fetch fee types
            const feeTypesResponse = await axiosInstance.get('/fee-types');
            if (feeTypesResponse.data.success) {
                setFeeTypes(feeTypesResponse.data.data || []);
            }

            // Fetch classes
            const classesResponse = await axiosInstance.get('/class');
            if (classesResponse.data.success) {
                setClasses(classesResponse.data.data || []);
            }

            // Fetch sessions
            const sessionsResponse = await axiosInstance.get('/sessions');
            if (sessionsResponse.data.success) {
                setSessions(sessionsResponse.data.data || []);
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

        // Update fee type details when feeTypeId changes
        if (name === 'feeTypeId') {
            const selectedFeeType = feeTypes.find(f => f._id === value);
            if (selectedFeeType) {
                setFormData(prev => ({
                    ...prev,
                    feeTypeName: selectedFeeType.name,
                    feeTypeAmount: selectedFeeType.amount
                }));
            }
        }

        // Update class name when classId changes
        if (name === 'classId') {
            const selectedClass = classes.find(c => c._id === value);
            setFormData(prev => ({
                ...prev,
                className: selectedClass ? selectedClass.name : ''
            }));
        }

        // Update session name when sessionId changes
        if (name === 'sessionId') {
            const selectedSession = sessions.find(s => s._id === value);
            setFormData(prev => ({
                ...prev,
                sessionName: selectedSession ? selectedSession.name : ''
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {};
        
        if (!formData.feeTypeId) {
            newErrors.feeTypeId = 'ফি টাইপ নির্বাচন করুন';
        }

        if (!formData.classId) {
            newErrors.classId = 'ক্লাস নির্বাচন করুন';
        }

        if (!formData.sessionId) {
            newErrors.sessionId = 'সেশন নির্বাচন করুন';
        }

        if (!formData.feeApplicableFrom) {
            newErrors.feeApplicableFrom = 'ফি প্রযোজ্য তারিখ নির্বাচন করুন';
        }

        if (formData.feeEndDate && new Date(formData.feeEndDate) < new Date(formData.feeApplicableFrom)) {
            newErrors.feeEndDate = 'শেষ তারিখ প্রযোজ্য তারিখের পরে হতে হবে';
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
                feeTypeId: formData.feeTypeId,
                feeTypeName: formData.feeTypeName,
                feeTypeAmount: formData.feeTypeAmount,
                classId: formData.classId,
                className: formData.className,
                sessionId: formData.sessionId,
                sessionName: formData.sessionName,
                feeApplicableFrom: formData.feeApplicableFrom,
                feeEndDate: formData.feeEndDate || null
            };

            if (fee) {
                // Update existing fee allocation
                response = await axiosInstance.put(`/fee/${fee._id}`, submitData);
            } else {
                // Create new fee allocation
                response = await axiosInstance.post('/fee', submitData);
            }

            if (response.data.success) {
                showSweetAlert('success', response.data.message);
                onSuccess();
            } else {
                setErrors({ submit: response.data.message });
            }
        } catch (error) {
            console.error('Error saving fee allocation:', error);
            const errorMessage = error.response?.data?.message || 'বরাদ্দ ফি সংরক্ষণ করতে সমস্যা হয়েছে';
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
                            {fee ? 'বরাদ্দ ফি এডিট করুন' : 'নতুন বরাদ্দ ফি যোগ করুন'}
                        </h1>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="p-4 sm:p-6 lg:p-8">
                <div className="max-w-full mx-auto">
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 sm:p-8">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="bg-indigo-50 p-4 rounded-lg mb-6">
                                <h3 className="text-lg font-semibold text-indigo-800 mb-2">
                                    বরাদ্দ ফির তথ্য:
                                </h3>
                                <p className="text-sm text-indigo-600">
                                    ফি টাইপ, ক্লাস এবং সেশন নির্বাচন করুন
                                </p>
                            </div>

                            {/* Select Fees */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Select Fees *
                                </label>
                                <select
                                    name="feeTypeId"
                                    value={formData.feeTypeId}
                                    onChange={handleChange}
                                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all ${
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

                            {/* Class and Session */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Select Class *
                                    </label>
                                    <select
                                        name="classId"
                                        value={formData.classId}
                                        onChange={handleChange}
                                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all ${
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

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        সেশন *
                                    </label>
                                    <select
                                        name="sessionId"
                                        value={formData.sessionId}
                                        onChange={handleChange}
                                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all ${
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
                            </div>

                            {/* Dates */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Fee Applicable From *
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="date"
                                            name="feeApplicableFrom"
                                            value={formData.feeApplicableFrom}
                                            onChange={handleChange}
                                            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all ${
                                                errors.feeApplicableFrom ? 'border-red-500 bg-red-50' : 'border-gray-300'
                                            }`}
                                            disabled={loading}
                                        />
                                        <FaCalendarAlt className="absolute right-3 top-3.5 text-gray-400" />
                                    </div>
                                    {errors.feeApplicableFrom && (
                                        <p className="mt-2 text-sm text-red-600">{errors.feeApplicableFrom}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Fee End Date
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="date"
                                            name="feeEndDate"
                                            value={formData.feeEndDate}
                                            onChange={handleChange}
                                            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all ${
                                                errors.feeEndDate ? 'border-red-500 bg-red-50' : 'border-gray-300'
                                            }`}
                                            disabled={loading}
                                        />
                                        <FaCalendarAlt className="absolute right-3 top-3.5 text-gray-400" />
                                    </div>
                                    {errors.feeEndDate && (
                                        <p className="mt-2 text-sm text-red-600">{errors.feeEndDate}</p>
                                    )}
                                </div>
                            </div>

                            {/* Summary */}
                            {(formData.feeTypeName || formData.className || formData.sessionName) && (
                                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                                    <h4 className="text-sm font-medium text-green-800 mb-2">
                                        সারাংশ:
                                    </h4>
                                    <div className="text-sm text-green-700 space-y-1">
                                        {formData.feeTypeName && (
                                            <div className="flex items-center gap-2">
                                                <FaMoneyBillWave className="text-green-600" />
                                                <span>ফি টাইপ: <strong>{formData.feeTypeName}</strong> - ৳{formData.feeTypeAmount}</span>
                                            </div>
                                        )}
                                        {formData.className && (
                                            <p>ক্লাস: <strong>{formData.className}</strong></p>
                                        )}
                                        {formData.sessionName && (
                                            <p>সেশন: <strong>{formData.sessionName}</strong></p>
                                        )}
                                        {formData.feeApplicableFrom && (
                                            <p>প্রযোজ্য তারিখ: <strong>{new Date(formData.feeApplicableFrom).toLocaleDateString('bn-BD')}</strong></p>
                                        )}
                                        {formData.feeEndDate && (
                                            <p>শেষ তারিখ: <strong>{new Date(formData.feeEndDate).toLocaleDateString('bn-BD')}</strong></p>
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
                                    className="inline-flex items-center gap-2 px-8 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                            {fee ? 'আপডেট হচ্ছে...' : 'সংরক্ষণ হচ্ছে...'}
                                        </>
                                    ) : (
                                        <>
                                            <FaSave className="text-sm" />
                                            {fee ? 'আপডেট করুন' : 'সংরক্ষণ করুন'}
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

export default AddNewFee;