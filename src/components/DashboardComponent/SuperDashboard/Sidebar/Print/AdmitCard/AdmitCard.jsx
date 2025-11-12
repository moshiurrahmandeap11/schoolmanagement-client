import { useEffect, useState } from 'react';
import { FaArrowLeft, FaCalendarAlt, FaFileAlt, FaPaperPlane, FaSave, FaSms, FaUsers } from 'react-icons/fa';
import Swal from 'sweetalert2';
import axiosInstance from '../../../../../../hooks/axiosInstance/axiosInstance';

const AdmitCard = ({ onBack }) => {
    const [formData, setFormData] = useState({
        classId: '',
        batchId: '',
        sectionId: '',
        sessionId: '',
        monthlyFee: '',
        sendAttendanceSms: false,
        examId: ''
    });
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    
    // Dropdown data
    const [classes, setClasses] = useState([]);
    const [batches, setBatches] = useState([]);
    const [sections, setSections] = useState([]);
    const [sessions, setSessions] = useState([]);
    const [exams, setExams] = useState([]);

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

            // Fetch exam categories
            const examsResponse = await axiosInstance.get('/exam-categories');
            if (examsResponse.data.success) {
                setExams(examsResponse.data.data || []);
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
        
        if (!formData.classId || !formData.sessionId || !formData.examId) {
            showSweetAlert('warning', 'অনুগ্রহ করে ক্লাস, সেশন এবং পরীক্ষা নির্বাচন করুন');
            return;
        }

        setSaving(true);
        try {
            const response = await axiosInstance.post('/admit-card', formData);

            if (response.data.success) {
                showSweetAlert('success', 'এডমিট কার্ড সফলভাবে তৈরি হয়েছে');
                // Reset form after successful submission
                setFormData({
                    classId: '',
                    batchId: '',
                    sectionId: '',
                    sessionId: '',
                    monthlyFee: '',
                    sendAttendanceSms: false,
                    examId: ''
                });
            }
        } catch (error) {
            console.error('Error creating admit card:', error);
            showSweetAlert('error', 'এডমিট কার্ড তৈরি করতে সমস্যা হয়েছে');
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
                            এডমিট কার্ড
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
                            এডমিট কার্ড তৈরি করুন
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
                                                className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
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
                                                className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
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
                                                className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
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
                                                className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
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
                                            className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
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
                                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                                        disabled={saving}
                                        id="sendAttendanceSms"
                                    />
                                    <label htmlFor="sendAttendanceSms" className="flex items-center gap-2 text-sm font-medium text-gray-700 cursor-pointer">
                                        <FaSms className="text-green-500" />
                                        Send attendance sms
                                    </label>
                                </div>
                            </div>

                            {/* Exam Information */}
                            <div className="space-y-4">
                                <h3 className="text-md font-semibold text-gray-700 border-b pb-2">
                                    পরীক্ষার তথ্য
                                </h3>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Exam *
                                    </label>
                                    <div className="relative">
                                        <select
                                            name="examId"
                                            value={formData.examId}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                            disabled={saving}
                                            required
                                        >
                                            <option value="">পরীক্ষা নির্বাচন করুন</option>
                                            {exams.map((exam) => (
                                                <option key={exam._id} value={exam._id}>
                                                    {exam.name}
                                                </option>
                                            ))}
                                        </select>
                                        <FaFileAlt className="absolute left-3 top-3.5 text-gray-400" />
                                    </div>
                                </div>

                                {/* Exam Details Preview */}
                                {formData.examId && (
                                    <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                                        <h4 className="text-sm font-medium text-blue-800 mb-2">
                                            নির্বাচিত পরীক্ষা
                                        </h4>
                                        <div className="text-sm text-blue-700">
                                            <p>পরীক্ষার নাম: {exams.find(e => e._id === formData.examId)?.name}</p>
                                            <p>পরীক্ষার ধরন: {exams.find(e => e._id === formData.examId)?.type || 'N/A'}</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Submit Button */}
                            <div className="flex justify-end pt-6 border-t border-gray-200">
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="inline-flex items-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {saving ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                            সংরক্ষণ হচ্ছে...
                                        </>
                                    ) : (
                                        <>
                                            <FaSave className="text-sm" />
                                            এডমিট কার্ড তৈরি করুন
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Information Card */}
                    <div className="bg-green-50 border border-green-200 rounded-2xl p-6 mt-6">
                        <h3 className="text-md font-semibold text-green-800 mb-2">
                            এডমিট কার্ড সম্পর্কে
                        </h3>
                        <ul className="text-sm text-green-700 space-y-1">
                            <li>• এডমিট কার্ড পরীক্ষার্থীদের জন্য তৈরি করুন</li>
                            <li>• ক্লাস, সেশন এবং পরীক্ষা বাধ্যতামূলক</li>
                            <li>• মাসিক ফি ঐচ্ছিক ফিল্ড</li>
                            <li>• এসএমএস পাঠানো হলে শিক্ষার্থীদের নোটিফিকেশন যাবে</li>
                            <li>• এডমিট কার্ডে পরীক্ষার সময়সূচী ও স্থান থাকবে</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdmitCard;