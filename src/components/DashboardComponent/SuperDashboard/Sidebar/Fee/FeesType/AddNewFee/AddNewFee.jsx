import { useEffect, useState } from 'react';
import { FaArrowLeft, FaCalendarAlt, FaMoneyBillWave, FaSave } from 'react-icons/fa';
import Swal from 'sweetalert2';
import axiosInstance from '../../../../../../../hooks/axiosInstance/axiosInstance';
import RichTextEditor from '../../../../../../sharedItems/RichTextEditor/RichTextEditor';

const AddNewFee = ({ feeType, onBack, onSuccess }) => {
    const [formData, setFormData] = useState({
        name: '',
        amount: '',
        isMonthly: false,
        feeApplicable: 'all_students',
        feeEndsDate: '',
        description: '',
        sessionId: '',
        sessionName: '',
        classId: '',
        className: ''
    });
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    
    // Dropdown data
    const [classes, setClasses] = useState([]);
    const [sessions, setSessions] = useState([]);

    useEffect(() => {
        fetchDropdownData();
        if (feeType) {
            setFormData({
                name: feeType.name || '',
                amount: feeType.amount || '',
                isMonthly: feeType.isMonthly || false,
                feeApplicable: feeType.feeApplicable || 'all_students',
                feeEndsDate: feeType.feeEndsDate ? feeType.feeEndsDate.split('T')[0] : '',
                description: feeType.description || '',
                sessionId: feeType.sessionId || '',
                sessionName: feeType.sessionName || '',
                classId: feeType.classId || '',
                className: feeType.className || ''
            });
        }
    }, [feeType]);

    const fetchDropdownData = async () => {
        try {
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
        
        if (!formData.name.trim()) {
            newErrors.name = 'ফি টাইপের নাম প্রয়োজন';
        }
        
        if (formData.name.trim().length < 2) {
            newErrors.name = 'ফি টাইপের নাম কমপক্ষে ২ অক্ষরের হতে হবে';
        }

        if (!formData.amount || formData.amount < 0) {
            newErrors.amount = 'পরিমাণ প্রয়োজন এবং অবশ্যই ধনাত্মক হতে হবে';
        }

        if (!formData.sessionId) {
            newErrors.sessionId = 'সেশন নির্বাচন করুন';
        }

        if (!formData.classId) {
            newErrors.classId = 'ক্লাস নির্বাচন করুন';
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
                amount: parseFloat(formData.amount),
                isMonthly: formData.isMonthly,
                feeApplicable: formData.feeApplicable,
                feeEndsDate: formData.feeEndsDate || null,
                description: formData.description,
                sessionId: formData.sessionId,
                sessionName: formData.sessionName,
                classId: formData.classId,
                className: formData.className
            };

            if (feeType) {
                // Update existing fee type
                response = await axiosInstance.put(`/fee-types/${feeType._id}`, submitData);
            } else {
                // Create new fee type
                response = await axiosInstance.post('/fee-types', submitData);
            }

            if (response.data.success) {
                showSweetAlert('success', response.data.message);
                onSuccess();
            } else {
                setErrors({ submit: response.data.message });
            }
        } catch (error) {
            console.error('Error saving fee type:', error);
            const errorMessage = error.response?.data?.message || 'ফি টাইপ সংরক্ষণ করতে সমস্যা হয়েছে';
            setErrors({ submit: errorMessage });
            showSweetAlert('error', errorMessage);
        } finally {
            setLoading(false);
        }
    };

    // Fee applicable options
    const feeApplicableOptions = [
        { value: 'all_students', label: 'সব শিক্ষার্থীর জন্য' },
        { value: 'new_students', label: 'শুধু নতুন শিক্ষার্থীর জন্য' },
        { value: 'specific_students', label: 'নির্দিষ্ট শিক্ষার্থীর জন্য' }
    ];

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
                            {feeType ? 'ফি টাইপ এডিট করুন' : 'নতুন ফি টাইপ যোগ করুন'}
                        </h1>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="p-4 sm:p-6 lg:p-8">
                <div className="max-w-full mx-auto">
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 sm:p-8">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="bg-teal-50 p-4 rounded-lg mb-6">
                                <h3 className="text-lg font-semibold text-teal-800 mb-2">
                                    ফি টাইপের তথ্য:
                                </h3>
                                <p className="text-sm text-teal-600">
                                    ফি টাইপের বিস্তারিত তথ্য প্রদান করুন
                                </p>
                            </div>

                            {/* Basic Information */}
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
                                        onChange={handleChange}
                                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all ${
                                            errors.name ? 'border-red-500 bg-red-50' : 'border-gray-300'
                                        }`}
                                        placeholder="ফি টাইপের নাম লিখুন"
                                        disabled={loading}
                                    />
                                    {errors.name && (
                                        <p className="mt-2 text-sm text-red-600">{errors.name}</p>
                                    )}
                                </div>

                                {/* Amount */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Amount *
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            name="amount"
                                            value={formData.amount}
                                            onChange={handleChange}
                                            min="0"
                                            step="0.01"
                                            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all ${
                                                errors.amount ? 'border-red-500 bg-red-50' : 'border-gray-300'
                                            }`}
                                            placeholder="0.00"
                                            disabled={loading}
                                        />
                                        <FaMoneyBillWave className="absolute right-3 top-3.5 text-gray-400" />
                                    </div>
                                    {errors.amount && (
                                        <p className="mt-2 text-sm text-red-600">{errors.amount}</p>
                                    )}
                                </div>
                            </div>

                            {/* Checkboxes */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        name="isMonthly"
                                        checked={formData.isMonthly}
                                        onChange={handleChange}
                                        className="w-4 h-4 text-teal-600 bg-gray-100 border-gray-300 rounded focus:ring-teal-500"
                                        disabled={loading}
                                    />
                                    <label className="ml-2 text-sm font-medium text-gray-700">
                                        Monthly
                                    </label>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Fee applicable
                                    </label>
                                    <select
                                        name="feeApplicable"
                                        value={formData.feeApplicable}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                                        disabled={loading}
                                    >
                                        {feeApplicableOptions.map((option) => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Date and Dropdowns */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {/* Fee ends date */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Fee ends date
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="date"
                                            name="feeEndsDate"
                                            value={formData.feeEndsDate}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                                            disabled={loading}
                                        />
                                        <FaCalendarAlt className="absolute right-3 top-3.5 text-gray-400" />
                                    </div>
                                </div>

                                {/* Session */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        সেশন *
                                    </label>
                                    <select
                                        name="sessionId"
                                        value={formData.sessionId}
                                        onChange={handleChange}
                                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all ${
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

                                {/* Class */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        ক্লাস নির্বাচন করুন *
                                    </label>
                                    <select
                                        name="classId"
                                        value={formData.classId}
                                        onChange={handleChange}
                                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all ${
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

                            {/* Description */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Description
                                </label>
                                <RichTextEditor
                                    value={formData.description}
                                    onChange={handleDescriptionChange}
                                    placeholder="ফি টাইপের বিস্তারিত বিবরণ লিখুন..."
                                    height="200px"
                                />
                            </div>

                            {/* Summary */}
                            {(formData.name || formData.amount) && (
                                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                                    <h4 className="text-sm font-medium text-blue-800 mb-2">
                                        সারাংশ:
                                    </h4>
                                    <div className="text-sm text-blue-700 space-y-1">
                                        <p>ফি টাইপ: <strong>{formData.name}</strong></p>
                                        <p>পরিমাণ: <strong>৳{formData.amount}</strong></p>
                                        <p>টাইপ: <strong>{formData.isMonthly ? 'মাসিক' : 'এককালীন'}</strong></p>
                                        <p>প্রযোজ্য: <strong>
                                            {feeApplicableOptions.find(opt => opt.value === formData.feeApplicable)?.label}
                                        </strong></p>
                                        {formData.className && (
                                            <p>ক্লাস: <strong>{formData.className}</strong></p>
                                        )}
                                        {formData.sessionName && (
                                            <p>সেশন: <strong>{formData.sessionName}</strong></p>
                                        )}
                                        {formData.feeEndsDate && (
                                            <p>শেষ তারিখ: <strong>{new Date(formData.feeEndsDate).toLocaleDateString('bn-BD')}</strong></p>
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
                                    className="inline-flex items-center gap-2 px-8 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                            {feeType ? 'আপডেট হচ্ছে...' : 'সংরক্ষণ হচ্ছে...'}
                                        </>
                                    ) : (
                                        <>
                                            <FaSave className="text-sm" />
                                            {feeType ? 'আপডেট করুন' : 'সংরক্ষণ করুন'}
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>

                        {/* Help Text */}
                        <div className="mt-6 p-4 bg-teal-50 rounded-lg border border-teal-200">
                            <h3 className="text-sm font-medium text-teal-800 mb-1">
                                ফি টাইপ সম্পর্কে:
                            </h3>
                            <ul className="text-xs text-teal-600 space-y-1">
                                <li>• <strong>মাসিক:</strong> চেক করলে এই ফি প্রতি মাসে প্রযোজ্য হবে</li>
                                <li>• <strong>Fee applicable:</strong> ফি কোন শিক্ষার্থীদের জন্য প্রযোজ্য</li>
                                <li>• <strong>Fee ends date:</strong> ফি সংগ্রহ করার শেষ তারিখ</li>
                                <li>• <strong>সেশন এবং ক্লাস:</strong> ফি কোন সেশন এবং ক্লাসের জন্য প্রযোজ্য</li>
                                <li>• ফি টাইপ তৈরি করার পর এডিট ও ডিলিট করা যাবে</li>
                                <li>• নিষ্ক্রিয় ফি টাইপ নতুন ফি সংগ্রহের জন্য ব্যবহার করা যাবে না</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddNewFee;