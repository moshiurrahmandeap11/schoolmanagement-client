import { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import axiosInstance from '../../../../../../../hooks/axiosInstance/axiosInstance';
import Loader from '../../../../../../sharedItems/Loader/Loader';
import MainButton from '../../../../../../sharedItems/Mainbutton/Mainbutton';


const SubjectWiseAttendance = ({ onBack }) => {
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [dropdownData, setDropdownData] = useState({
        sessions: [],
        classes: [],
        subjects: []
    });

    const [formData, setFormData] = useState({
        date: '',
        sessionId: '',
        classId: '',
        subjectId: ''
    });

    // ড্রপডাউন ডেটা লোড করুন
    const loadDropdownData = async () => {
        try {
            setLoading(true);
            
            const [sessionsRes, classesRes, subjectsRes] = await Promise.all([
                axiosInstance.get('/sessions'),
                axiosInstance.get('/class'),
                axiosInstance.get('/subjects')
            ]);

            setDropdownData({
                sessions: sessionsRes.data?.data || [],
                classes: classesRes.data?.data || [],
                subjects: subjectsRes.data?.data || []
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
        const { name, value } = e.target;
        
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // ফর্ম ভ্যালিডেশন
    const validateForm = () => {
        if (!formData.date) {
            Swal.fire('Error!', 'তারিখ নির্বাচন করুন', 'error');
            return false;
        }
        if (!formData.sessionId) {
            Swal.fire('Error!', 'সেশন নির্বাচন করুন', 'error');
            return false;
        }
        if (!formData.classId) {
            Swal.fire('Error!', 'ক্লাস নির্বাচন করুন', 'error');
            return false;
        }
        if (!formData.subjectId) {
            Swal.fire('Error!', 'বিষয় নির্বাচন করুন', 'error');
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
            const response = await axiosInstance.post('/subjectwise-attendance', formData);
            
            if (response.data?.success) {
                Swal.fire('Success!', 'বিষয়ভিত্তিক হাজিরা সফলভাবে সংরক্ষণ হয়েছে', 'success');
                // ফর্ম রিসেট
                setFormData({
                    date: '',
                    sessionId: '',
                    classId: '',
                    subjectId: ''
                });
            } else {
                Swal.fire('Error!', response.data?.message || 'সমস্যা হয়েছে', 'error');
            }
        } catch (error) {
            console.error('Error saving subject wise attendance:', error);
            
            // Handle specific errors
            if (error.response?.data?.message?.includes('already exists')) {
                Swal.fire('Error!', error.response.data.message, 'error');
            } else {
                Swal.fire('Error!', 'হাজিরা সংরক্ষণ করতে সমস্যা হয়েছে', 'error');
            }
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
                    date: '',
                    sessionId: '',
                    classId: '',
                    subjectId: ''
                });
            }
        });
    };

    // আজকের তারিখ সেট করুন (default হিসেবে)
    useEffect(() => {
        const today = new Date().toISOString().split('T')[0];
        setFormData(prev => ({ ...prev, date: today }));
    }, []);

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-full mx-auto">
                <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                    {/* Header */}
                    <div className="px-6 py-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-2xl font-bold">
                                    বিষয়ভিত্তিক হাজিরা
                                </h1>
                            </div>
                            <button
                                onClick={onBack}
                                className="px-4 py-2 bg-white text-[#1e90c9] rounded-lg hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-white transition-colors duration-200 font-medium"
                            >
                                পিছনে যান
                            </button>
                        </div>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="p-6">
                        {loading ? (
                            <Loader></Loader>
                        ) : (
                            <div className="space-y-6">
                                {/* তারিখ */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        তারিখ <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="date"
                                        name="date"
                                        value={formData.date}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9] focus:border-transparent transition-colors duration-200"
                                        required
                                    />
                                </div>

                                {/* সেশন */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        সেশন <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        name="sessionId"
                                        value={formData.sessionId}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9] focus:border-transparent transition-colors duration-200"
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

                                {/* ক্লাস */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        ক্লাস <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        name="classId"
                                        value={formData.classId}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9] focus:border-transparent transition-colors duration-200"
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

                                {/* বিষয় */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        বিষয় <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        name="subjectId"
                                        value={formData.subjectId}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9] focus:border-transparent transition-colors duration-200"
                                        required
                                    >
                                        <option value="">বিষয় নির্বাচন করুন</option>
                                        {dropdownData.subjects.map(subject => (
                                            <option key={subject._id} value={subject._id}>
                                                {subject.name || subject.subjectName}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Summary Card */}
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                    <h3 className="text-lg font-semibold text-[#1e90c9] mb-3">সারসংক্ষেপ</h3>
                                    <div className="grid grid-cols-1 gap-3 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">তারিখ:</span>
                                            <span className="font-medium">
                                                {formData.date ? new Date(formData.date).toLocaleDateString('bn-BD') : 'নির্ধারণ করুন'}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">সেশন:</span>
                                            <span className="font-medium">
                                                {dropdownData.sessions.find(session => session._id === formData.sessionId)?.name || 'নির্বাচন করুন'}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">ক্লাস:</span>
                                            <span className="font-medium">
                                                {dropdownData.classes.find(cls => cls._id === formData.classId)?.name || 'নির্বাচন করুন'}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">বিষয়:</span>
                                            <span className="font-medium">
                                                {dropdownData.subjects.find(subject => subject._id === formData.subjectId)?.name || 'নির্বাচন করুন'}
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
                                    <MainButton
                                        type="submit"
                                        disabled={saving}
                                        className="rounded-md"
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
                                            'হাজিরা সংরক্ষণ করুন'
                                        )}
                                    </MainButton>
                                </div>
                            </div>
                        )}
                    </form>
                </div>
            </div>
        </div>
    );
};

export default SubjectWiseAttendance;