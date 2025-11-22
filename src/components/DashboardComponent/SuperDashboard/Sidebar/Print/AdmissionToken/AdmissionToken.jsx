import { useEffect, useState } from 'react';
import { FaArrowLeft, FaCalendarAlt, FaImage, FaPaperPlane, FaSave, FaSms, FaUsers } from 'react-icons/fa';
import Swal from 'sweetalert2';
import axiosInstance from '../../../../../../hooks/axiosInstance/axiosInstance';
import MainButton from '../../../../../sharedItems/Mainbutton/Mainbutton';

const AdmissionToken = ({ onBack }) => {
    const [formData, setFormData] = useState({
        classId: '',
        batchId: '',
        sectionId: '',
        sessionId: '',
        monthlyFee: '',
        sendAttendanceSms: false,
        tokenTemplateId: ''
    });
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    
    // Dropdown data
    const [classes, setClasses] = useState([]);
    const [batches, setBatches] = useState([]);
    const [sections, setSections] = useState([]);
    const [sessions, setSessions] = useState([]);
    const [tokenTemplates, setTokenTemplates] = useState([]);

    useEffect(() => {
        fetchDropdownData();
    }, []);

    const fetchDropdownData = async () => {
        try {
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

            // Fetch sections
            const sectionsResponse = await axiosInstance.get('/sections');
            if (sectionsResponse.data.success) {
                setSections(sectionsResponse.data.data || []);
            }

            // Fetch sessions
            const sessionsResponse = await axiosInstance.get('/sessions');
            if (sessionsResponse.data.success) {
                setSessions(sessionsResponse.data.data || []);
            }

            // Fetch token templates
            const tokensResponse = await axiosInstance.get('/admission-token');
            if (tokensResponse.data.success) {
                setTokenTemplates(tokensResponse.data.data || []);
            }
        } catch (error) {
            console.error('Error fetching dropdown data:', error);
            showSweetAlert('error', 'ডেটা লোড করতে সমস্যা হয়েছে');
        }
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

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.classId || !formData.sessionId) {
            showSweetAlert('warning', 'অনুগ্রহ করে ক্লাস এবং সেশন নির্বাচন করুন');
            return;
        }

        setSaving(true);
        try {
            const response = await axiosInstance.post('/admission-token', formData);

            if (response.data.success) {
                showSweetAlert('success', 'এডমিশন টোকেন সফলভাবে তৈরি হয়েছে');
                // Reset form after successful submission
                setFormData({
                    classId: '',
                    batchId: '',
                    sectionId: '',
                    sessionId: '',
                    monthlyFee: '',
                    sendAttendanceSms: false,
                    tokenTemplateId: ''
                });
            }
        } catch (error) {
            console.error('Error creating admission token:', error);
            showSweetAlert('error', 'এডমিশন টোকেন তৈরি করতে সমস্যা হয়েছে');
        } finally {
            setSaving(false);
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('bn-BD', {
            minimumFractionDigits: 2
        }).format(amount || 0);
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
                            এডমিশন টোকেন
                        </h1>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="p-4 sm:p-6 lg:p-8">
                <div className="max-w-full mx-auto">
                    {/* Form Section */}
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                        <h2 className="text-lg font-semibold text-gray-800 mb-6">
                            এডমিশন টোকেন তৈরি করুন
                        </h2>
                        
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Academic Information */}
                            <div className="space-y-4">
                                <h3 className="text-md font-semibold text-gray-700 border-b pb-2">
                                    একাডেমিক তথ্য
                                </h3>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Class */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            ক্লাস *
                                        </label>
                                        <div className="relative">
                                            <select
                                                name="classId"
                                                value={formData.classId}
                                                onChange={handleChange}
                                                className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9] focus:border-transparent transition-all"
                                                disabled={saving}
                                                required
                                            >
                                                <option value="">ক্লাস নির্বাচন করুন</option>
                                                {classes.map((classItem) => (
                                                    <option key={classItem._id} value={classItem._id}>
                                                        {classItem.name}
                                                    </option>
                                                ))}
                                            </select>
                                            <FaUsers className="absolute left-3 top-3.5 text-gray-400" />
                                        </div>
                                    </div>

                                    {/* Batch */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            ব্যাচ
                                        </label>
                                        <div className="relative">
                                            <select
                                                name="batchId"
                                                value={formData.batchId}
                                                onChange={handleChange}
                                                className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9] focus:border-transparent transition-all"
                                                disabled={saving}
                                            >
                                                <option value="">ব্যাচ নির্বাচন করুন</option>
                                                {batches.map((batch) => (
                                                    <option key={batch._id} value={batch._id}>
                                                        {batch.name}
                                                    </option>
                                                ))}
                                            </select>
                                            <FaUsers className="absolute left-3 top-3.5 text-gray-400" />
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Section */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            সেকশন
                                        </label>
                                        <div className="relative">
                                            <select
                                                name="sectionId"
                                                value={formData.sectionId}
                                                onChange={handleChange}
                                                className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9] focus:border-transparent transition-all"
                                                disabled={saving}
                                            >
                                                <option value="">সেকশন নির্বাচন করুন</option>
                                                {sections.map((section) => (
                                                    <option key={section._id} value={section._id}>
                                                        {section.name}
                                                    </option>
                                                ))}
                                            </select>
                                            <FaUsers className="absolute left-3 top-3.5 text-gray-400" />
                                        </div>
                                    </div>

                                    {/* Active Session */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Active Session *
                                        </label>
                                        <div className="relative">
                                            <select
                                                name="sessionId"
                                                value={formData.sessionId}
                                                onChange={handleChange}
                                                className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9] focus:border-transparent transition-all"
                                                disabled={saving}
                                                required
                                            >
                                                <option value="">সেশন নির্বাচন করুন</option>
                                                {sessions.map((session) => (
                                                    <option key={session._id} value={session._id}>
                                                        {session.name}
                                                    </option>
                                                ))}
                                            </select>
                                            <FaCalendarAlt className="absolute left-3 top-3.5 text-gray-400" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Fee Information */}
                            <div className="space-y-4">
                                <h3 className="text-md font-semibold text-gray-700 border-b pb-2">
                                    ফি তথ্য
                                </h3>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Monthly Fee From Madrasha / College
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            name="monthlyFee"
                                            value={formData.monthlyFee}
                                            onChange={handleChange}
                                            placeholder="মাসিক ফি লিখুন"
                                            className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9] focus:border-transparent transition-all"
                                            disabled={saving}
                                            min="0"
                                            step="0.01"
                                        />
                                        <FaPaperPlane className="absolute left-3 top-3.5 text-gray-400" />
                                    </div>
                                    {formData.monthlyFee && (
                                        <p className="text-sm text-green-600 mt-1">
                                            মাসিক ফি: ৳{formatCurrency(formData.monthlyFee)}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* SMS Settings */}
                            <div className="space-y-4">
                                <h3 className="text-md font-semibold text-gray-700 border-b pb-2">
                                    এসএমএস সেটিংস
                                </h3>
                                
                                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                                    <input
                                        type="checkbox"
                                        name="sendAttendanceSms"
                                        checked={formData.sendAttendanceSms}
                                        onChange={handleChange}
                                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-[#1e90c9]"
                                        disabled={saving}
                                        id="sendAttendanceSms"
                                    />
                                    <label htmlFor="sendAttendanceSms" className="flex items-center gap-2 text-sm font-medium text-gray-700 cursor-pointer">
                                        <FaSms className="text-green-500" />
                                        Send attendance sms
                                    </label>
                                </div>
                            </div>

                            {/* Token Template */}
                            <div className="space-y-4">
                                <h3 className="text-md font-semibold text-gray-700 border-b pb-2">
                                    টোকেন টেমপ্লেট
                                </h3>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Select Token Template
                                    </label>
                                    <div className="relative">
                                        <select
                                            name="tokenTemplateId"
                                            value={formData.tokenTemplateId}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9] focus:border-transparent transition-all"
                                            disabled={saving}
                                        >
                                            <option value="">টোকেন টেমপ্লেট নির্বাচন করুন</option>
                                            {tokenTemplates.map((template) => (
                                                <option key={template._id} value={template._id}>
                                                    {template.name}
                                                </option>
                                            ))}
                                        </select>
                                        <FaImage className="absolute left-3 top-3.5 text-gray-400" />
                                    </div>
                                </div>

                                {/* Token Template Preview */}
                                {formData.tokenTemplateId && (
                                    <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                                        <h4 className="text-sm font-medium text-gray-700 mb-3">
                                            টেমপ্লেট প্রিভিউ
                                        </h4>
                                        <div className="flex justify-center">
                                            <div className="w-48 h-32 bg-white border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                                                <FaImage className="text-3xl text-gray-400" />
                                                <span className="text-xs text-gray-500 ml-2">টেমপ্লেট ইমেজ</span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Submit Button */}
                            <div className="flex justify-end pt-6 border-t border-gray-200">
                                <MainButton
                                    type="submit"
                                    disabled={saving}
                                    className="rounded-md"
                                >
                                    {saving ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                            সংরক্ষণ হচ্ছে...
                                        </>
                                    ) : (
                                        <>
                                            <FaSave className="text-sm mr-2" />
                                            সংরক্ষণ করুন
                                        </>
                                    )}
                                </MainButton>
                            </div>
                        </form>
                    </div>

                    {/* Information Card */}
                    <div className="bg-blue-50 rounded-2xl p-6 mt-6">
                        <h3 className="text-md font-semibold text-[#1e90c9] mb-2">
                            এডমিশন টোকেন সম্পর্কে
                        </h3>
                        <ul className="text-sm text-[#1e90c9] space-y-1">
                            <li>• এডমিশন টোকেন নতুন শিক্ষার্থীদের জন্য তৈরি করুন</li>
                            <li>• ক্লাস এবং সেশন বাধ্যতামূলক</li>
                            <li>• টোকেন টেমপ্লেট নির্বাচন করা ঐচ্ছিক</li>
                            <li>• এসএমএস পাঠানো হলে শিক্ষার্থীদের নোটিফিকেশন যাবে</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdmissionToken;