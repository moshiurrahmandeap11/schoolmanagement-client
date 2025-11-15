import { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import axiosInstance from '../../../../../../../hooks/axiosInstance/axiosInstance';


const AdvanceFees = ({ onBack }) => {
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [dropdownData, setDropdownData] = useState({
        classes: [],
        batches: [],
        sections: [],
        sessions: []
    });

    const [formData, setFormData] = useState({
        classId: '',
        batchId: '',
        sectionId: '',
        sessionId: '',
        monthlyFee: '',
        sendAttendanceSMS: false,
        generateFeesTo: 'january'
    });

    // মাসের ড্রপডাউন অপশন
    const months = [
        { value: 'january', label: 'জানুয়ারি' },
        { value: 'february', label: 'ফেব্রুয়ারি' },
        { value: 'march', label: 'মার্চ' },
        { value: 'april', label: 'এপ্রিল' },
        { value: 'may', label: 'মে' },
        { value: 'june', label: 'জুন' },
        { value: 'july', label: 'জুলাই' },
        { value: 'august', label: 'আগস্ট' },
        { value: 'september', label: 'সেপ্টেম্বর' },
        { value: 'october', label: 'অক্টোবর' },
        { value: 'november', label: 'নভেম্বর' },
        { value: 'december', label: 'ডিসেম্বর' }
    ];

    // ড্রপডাউন ডেটা লোড করুন
    const loadDropdownData = async () => {
        try {
            setLoading(true);
            
            const [classesRes, batchesRes, sectionsRes, sessionsRes] = await Promise.all([
                axiosInstance.get('/class'),
                axiosInstance.get('/batches'),
                axiosInstance.get('/sections'),
                axiosInstance.get('/sessions')
            ]);

            setDropdownData({
                classes: classesRes.data?.data || [],
                batches: batchesRes.data?.data || [],
                sections: sectionsRes.data?.data || [],
                sessions: sessionsRes.data?.data || []
            });

        } catch (error) {
            console.error('Error loading dropdown data:', error);
            Swal.fire('Error!', 'ডেটা লোড করতে সমস্যা হয়েছে', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadDropdownData();
    }, []);

    // ইনপুট পরিবর্তন হ্যান্ডলার
    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    // ফর্ম ভ্যালিডেশন
    const validateForm = () => {
        if (!formData.classId) {
            Swal.fire('Error!', 'ক্লাস নির্বাচন করুন', 'error');
            return false;
        }
        if (!formData.batchId) {
            Swal.fire('Error!', 'ব্যাচ নির্বাচন করুন', 'error');
            return false;
        }
        if (!formData.sectionId) {
            Swal.fire('Error!', 'সেকশন নির্বাচন করুন', 'error');
            return false;
        }
        if (!formData.sessionId) {
            Swal.fire('Error!', 'সেশন নির্বাচন করুন', 'error');
            return false;
        }
        if (!formData.monthlyFee || formData.monthlyFee <= 0) {
            Swal.fire('Error!', 'মাসিক ফি সঠিকভাবে 입력 করুন', 'error');
            return false;
        }
        return true;
    };

    // ফর্ম সাবমিশন
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) return;

        try {
            setSaving(true);
            const response = await axiosInstance.post('/advance-fees', formData);
            
            if (response.data?.success) {
                Swal.fire('Success!', 'অগ্রিম ফি সফলভাবে তৈরি হয়েছে', 'success');
                // ফর্ম রিসেট
                setFormData({
                    classId: '',
                    batchId: '',
                    sectionId: '',
                    sessionId: '',
                    monthlyFee: '',
                    sendAttendanceSMS: false,
                    generateFeesTo: 'january'
                });
            } else {
                Swal.fire('Error!', response.data?.message || 'সমস্যা হয়েছে', 'error');
            }
        } catch (error) {
            console.error('Error saving advance fees:', error);
            Swal.fire('Error!', 'অগ্রিম ফি সংরক্ষণ করতে সমস্যা হয়েছে', 'error');
        } finally {
            setSaving(false);
        }
    };

    // ফর্ম রিসেট
    const handleReset = () => {
        Swal.fire({
            title: 'নিশ্চিত করুন?',
            text: 'আপনি কি ফর্ম রিসেট করতে চান?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'হ্যাঁ',
            cancelButtonText: 'না'
        }).then((result) => {
            if (result.isConfirmed) {
                setFormData({
                    classId: '',
                    batchId: '',
                    sectionId: '',
                    sessionId: '',
                    monthlyFee: '',
                    sendAttendanceSMS: false,
                    generateFeesTo: 'january'
                });
            }
        });
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-full mx-auto">
                <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-6 py-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-2xl font-bold text-white">
                                    অগ্রিম ফি তৈরি করুন
                                </h1>
                                <p className="text-blue-100 text-sm mt-1">
                                    শিক্ষার্থীদের জন্য অগ্রিম ফি জেনারেট করুন
                                </p>
                            </div>
                            <button
                                onClick={onBack}
                                className="px-4 py-2 bg-white text-blue-600 rounded-lg hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-white transition-colors duration-200 font-medium"
                            >
                                পিছনে যান
                            </button>
                        </div>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="p-6">
                        {loading ? (
                            <div className="flex justify-center items-center py-12">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {/* Class, Batch, Section, Session */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Class */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            ক্লাস <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            name="classId"
                                            value={formData.classId}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                                            required
                                        >
                                            <option value="">ক্লাস নির্বাচন করুন</option>
                                            {dropdownData.classes.map(cls => (
                                                <option key={cls._id} value={cls._id}>
                                                    {cls.name || cls.className}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Batch */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            ব্যাচ <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            name="batchId"
                                            value={formData.batchId}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                                            required
                                        >
                                            <option value="">ব্যাচ নির্বাচন করুন</option>
                                            {dropdownData.batches.map(batch => (
                                                <option key={batch._id} value={batch._id}>
                                                    {batch.name || batch.batchName}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Section */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            সেকশন <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            name="sectionId"
                                            value={formData.sectionId}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                                            required
                                        >
                                            <option value="">সেকশন নির্বাচন করুন</option>
                                            {dropdownData.sections.map(section => (
                                                <option key={section._id} value={section._id}>
                                                    {section.name || section.sectionName}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Active Session */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Active Session <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            name="sessionId"
                                            value={formData.sessionId}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                                            required
                                        >
                                            <option value="">সেশন নির্বাচন করুন</option>
                                            {dropdownData.sessions.map(session => (
                                                <option key={session._id} value={session._id}>
                                                    {session.name || session.sessionName}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {/* Monthly Fee */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Monthly Fee from Madrasha/College <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        name="monthlyFee"
                                        value={formData.monthlyFee}
                                        onChange={handleInputChange}
                                        placeholder="মাসিক ফি লিখুন"
                                        min="0"
                                        step="0.01"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                                        required
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        মাসিক ফি এর পরিমাণ লিখুন
                                    </p>
                                </div>

                                {/* Checkbox and Generate Fees To */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Send Attendance SMS Checkbox */}
                                    <div className="flex items-center">
                                        <input
                                            type="checkbox"
                                            name="sendAttendanceSMS"
                                            checked={formData.sendAttendanceSMS}
                                            onChange={handleInputChange}
                                            className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                            id="sendAttendanceSMS"
                                        />
                                        <label htmlFor="sendAttendanceSMS" className="ml-2 block text-sm text-gray-700">
                                            Send Attendance SMS
                                        </label>
                                    </div>

                                    {/* Generate Fees To */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Generate fees to
                                        </label>
                                        <select
                                            name="generateFeesTo"
                                            value={formData.generateFeesTo}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                                        >
                                            {months.map(month => (
                                                <option key={month.value} value={month.value}>
                                                    {month.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {/* Summary Card */}
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                    <h3 className="text-lg font-semibold text-blue-800 mb-3">সারসংক্ষেপ</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <span className="text-gray-600">ক্লাস:</span>
                                            <span className="ml-2 font-medium">
                                                {dropdownData.classes.find(cls => cls._id === formData.classId)?.name || 'নির্বাচন করুন'}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="text-gray-600">ব্যাচ:</span>
                                            <span className="ml-2 font-medium">
                                                {dropdownData.batches.find(batch => batch._id === formData.batchId)?.name || 'নির্বাচন করুন'}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="text-gray-600">সেকশন:</span>
                                            <span className="ml-2 font-medium">
                                                {dropdownData.sections.find(section => section._id === formData.sectionId)?.name || 'নির্বাচন করুন'}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="text-gray-600">সেশন:</span>
                                            <span className="ml-2 font-medium">
                                                {dropdownData.sessions.find(session => session._id === formData.sessionId)?.name || 'নির্বাচন করুন'}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="text-gray-600">মাসিক ফি:</span>
                                            <span className="ml-2 font-medium">
                                                {formData.monthlyFee ? `৳ ${formData.monthlyFee}` : 'নির্ধারণ করুন'}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="text-gray-600">ফি জেনারেট হবে:</span>
                                            <span className="ml-2 font-medium">
                                                {months.find(m => m.value === formData.generateFeesTo)?.label}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Buttons */}
                                <div className="flex flex-col sm:flex-row gap-4 justify-end pt-6 border-t border-gray-200">
                                    <button
                                        type="button"
                                        onClick={handleReset}
                                        className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors duration-200 font-medium"
                                        disabled={saving}
                                    >
                                        রিসেট করুন
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={saving}
                                        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {saving ? (
                                            <span className="flex items-center justify-center">
                                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                সংরক্ষণ হচ্ছে...
                                            </span>
                                        ) : (
                                            'অগ্রিম ফি তৈরি করুন'
                                        )}
                                    </button>
                                </div>
                            </div>
                        )}
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AdvanceFees;