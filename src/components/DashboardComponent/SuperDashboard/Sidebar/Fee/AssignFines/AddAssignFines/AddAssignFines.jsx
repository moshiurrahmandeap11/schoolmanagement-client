import { useEffect, useState } from 'react';
import { FaArrowLeft, FaMoneyBillWave, FaSave } from 'react-icons/fa';
import Swal from 'sweetalert2';
import axiosInstance from '../../../../../../../hooks/axiosInstance/axiosInstance';
import MainButton from '../../../../../../sharedItems/Mainbutton/Mainbutton';

const AddAssignFines = ({ fine, onBack, onSuccess }) => {
    const [formData, setFormData] = useState({
        sessionId: '',
        sessionName: '',
        classId: '',
        className: '',
        batchId: '',
        batchName: '',
        feeTypeId: '',
        feeTypeName: '',
        fineTypeId: '',
        fineTypeName: '',
        fineAmount: '',
        description: ''
    });
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    
    // Dropdown data
    const [sessions, setSessions] = useState([]);
    const [classes, setClasses] = useState([]);
    const [batches, setBatches] = useState([]);
    const [feeTypes, setFeeTypes] = useState([]);
    const [fineTypes, setFineTypes] = useState([]);

    useEffect(() => {
        fetchDropdownData();
        if (fine) {
            setFormData({
                sessionId: fine.sessionId || '',
                sessionName: fine.sessionName || '',
                classId: fine.classId || '',
                className: fine.className || '',
                batchId: fine.batchId || '',
                batchName: fine.batchName || '',
                feeTypeId: fine.feeTypeId || '',
                feeTypeName: fine.feeTypeName || '',
                fineTypeId: fine.fineTypeId || '',
                fineTypeName: fine.fineTypeName || '',
                fineAmount: fine.fineAmount || '',
                description: fine.description || ''
            });
        }
    }, [fine]);

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

            // Fetch fine types
            const fineTypesResponse = await axiosInstance.get('/fine-types');
            if (fineTypesResponse.data.success) {
                setFineTypes(fineTypesResponse.data.data || []);
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

        if (name === 'fineTypeId') {
            const selectedFineType = fineTypes.find(f => f._id === value);
            setFormData(prev => ({
                ...prev,
                fineTypeName: selectedFineType ? selectedFineType.name : ''
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

        if (!formData.fineTypeId) {
            newErrors.fineTypeId = 'ফাইনের টাইপ নির্বাচন করুন';
        }

        if (!formData.fineAmount || formData.fineAmount <= 0) {
            newErrors.fineAmount = 'বৈধ জরিমানার পরিমাণ লিখুন';
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
                fineTypeId: formData.fineTypeId,
                fineTypeName: formData.fineTypeName,
                fineAmount: formData.fineAmount,
                description: formData.description
            };

            if (fine) {
                // Update existing fine
                response = await axiosInstance.put(`/assign-fines/${fine._id}`, submitData);
            } else {
                // Create new fine
                response = await axiosInstance.post('/assign-fines/assign-fine', submitData);
            }

            if (response.data.success) {
                showSweetAlert('success', response.data.message);
                onSuccess();
            } else {
                setErrors({ submit: response.data.message });
            }
        } catch (error) {
            console.error('Error saving fine:', error);
            const errorMessage = error.response?.data?.message || 'জরিমানা সংরক্ষণ করতে সমস্যা হয়েছে';
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
                            {fine ? 'জরিমানা এডিট করুন' : 'নতুন জরিমানা যোগ করুন'}
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
                                    জরিমানা তথ্য:
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

                            {/* Fine Type and Amount */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        ফাইন নির্বাচন করুন *
                                    </label>
                                    <select
                                        name="fineTypeId"
                                        value={formData.fineTypeId}
                                        onChange={handleChange}
                                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9] focus:border-transparent transition-all ${
                                            errors.fineTypeId ? 'border-red-500 bg-red-50' : 'border-gray-300'
                                        }`}
                                        disabled={loading}
                                    >
                                        <option value="">ফাইনের ধরন নির্বাচন করুন</option>
                                        {fineTypes.map((fineType) => (
                                            <option key={fineType._id} value={fineType._id}>
                                                {fineType.name}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.fineTypeId && (
                                        <p className="mt-2 text-sm text-red-600">{errors.fineTypeId}</p>
                                    )}
                                </div>

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
                                            placeholder="0.00"
                                            min="0"
                                            step="0.01"
                                            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9] focus:border-transparent transition-all ${
                                                errors.fineAmount ? 'border-red-500 bg-red-50' : 'border-gray-300'
                                            }`}
                                            disabled={loading}
                                        />
                                        <FaMoneyBillWave className="absolute right-3 top-3.5 text-gray-400" />
                                    </div>
                                    {errors.fineAmount && (
                                        <p className="mt-2 text-sm text-red-600">{errors.fineAmount}</p>
                                    )}
                                </div>
                            </div>

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
                                    placeholder="জরিমানা সম্পর্কে অতিরিক্ত তথ্য..."
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9] focus:border-transparent transition-all"
                                    disabled={loading}
                                />
                            </div>

                            {/* Summary */}
                            {(formData.sessionName || formData.className || formData.feeTypeName || formData.fineTypeName) && (
                                <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                                    <h4 className="text-sm font-medium text-orange-800 mb-2">
                                        সারাংশ:
                                    </h4>
                                    <div className="text-sm text-orange-700 space-y-1">
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
                                        {formData.fineTypeName && (
                                            <p>ফাইনের ধরন: <strong>{formData.fineTypeName}</strong></p>
                                        )}
                                        {formData.fineAmount && (
                                            <p>জরিমানার পরিমাণ: <strong>৳{formData.fineAmount}</strong></p>
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
                                            {fine ? 'আপডেট হচ্ছে...' : 'সংরক্ষণ হচ্ছে...'}
                                        </>
                                    ) : (
                                        <>
                                            <FaSave className="text-sm mr-2" />
                                            {fine ? 'আপডেট করুন' : 'সংরক্ষণ করুন'}
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

export default AddAssignFines;