import { useEffect, useState } from 'react';
import { FaArrowLeft, FaSave } from 'react-icons/fa';
import Swal from 'sweetalert2';
import axiosInstance from '../../../../../../../../hooks/axiosInstance/axiosInstance';
import RichTextEditor from '../../../../../../../sharedItems/RichTextEditor/RichTextEditor';


const AddNewExam = ({ exam, onBack, onSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState([]);
    const [classes, setClasses] = useState([]);
    const [sections, setSections] = useState([]);
    const [sessions, setSessions] = useState([]);
    const [gradingSystems, setGradingSystems] = useState([]);
    const [formData, setFormData] = useState({
        name: '',
        categoryId: '',
        classId: '',
        sectionId: '',
        sessionId: '',
        gradingId: '',
        year: new Date().getFullYear(),
        date: '',
        startTime: '',
        endTime: '',
        note: '',
        status: 'Draft',
        combinedPercentage: ''
    });

    useEffect(() => {
        fetchDropdownData();
        if (exam) {
            setFormData({
                name: exam.name || '',
                categoryId: exam.categoryId || '',
                classId: exam.classId || '',
                sectionId: exam.sectionId || '',
                sessionId: exam.sessionId || '',
                gradingId: exam.gradingId || '',
                year: exam.year || new Date().getFullYear(),
                date: exam.date ? new Date(exam.date).toISOString().split('T')[0] : '',
                startTime: exam.startTime || '',
                endTime: exam.endTime || '',
                note: exam.note || '',
                status: exam.status || 'Draft',
                combinedPercentage: exam.combinedPercentage?.toString() || ''
            });
        }
    }, [exam]);

    const fetchDropdownData = async () => {
        try {
            const [categoriesRes, classesRes, sectionsRes, sessionsRes, gradingRes] = await Promise.all([
                axiosInstance.get('/exam-categories'),
                axiosInstance.get('/classes'),
                axiosInstance.get('/sections'),
                axiosInstance.get('/sessions'),
                axiosInstance.get('/grading')
            ]);

            if (categoriesRes.data.success) setCategories(categoriesRes.data.data || []);
            if (classesRes.data.success) setClasses(classesRes.data.data || []);
            if (sectionsRes.data.success) setSections(sectionsRes.data.data || []);
            if (sessionsRes.data.success) setSessions(sessionsRes.data.data || []);
            if (gradingRes.data.success) setGradingSystems(gradingRes.data.data || []);
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

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleNoteChange = (content) => {
        setFormData(prev => ({
            ...prev,
            note: content
        }));
    };

    const validateForm = () => {
        if (!formData.name.trim()) {
            showSweetAlert('warning', 'পরীক্ষার নাম প্রয়োজন');
            return false;
        }

        if (!formData.categoryId) {
            showSweetAlert('warning', 'পরীক্ষার ধরণ নির্বাচন করুন');
            return false;
        }

        if (!formData.classId) {
            showSweetAlert('warning', 'ক্লাস নির্বাচন করুন');
            return false;
        }

        if (!formData.sectionId) {
            showSweetAlert('warning', 'সেকশন নির্বাচন করুন');
            return false;
        }

        if (!formData.sessionId) {
            showSweetAlert('warning', 'সেশন নির্বাচন করুন');
            return false;
        }

        if (!formData.gradingId) {
            showSweetAlert('warning', 'গ্রেডিং সিস্টেম নির্বাচন করুন');
            return false;
        }

        if (!formData.year || formData.year < 2000 || formData.year > 2100) {
            showSweetAlert('warning', 'সঠিক বছর দিন');
            return false;
        }

        if (!formData.date) {
            showSweetAlert('warning', 'তারিখ নির্বাচন করুন');
            return false;
        }

        if (!formData.startTime) {
            showSweetAlert('warning', 'শুরুর সময় নির্বাচন করুন');
            return false;
        }

        if (!formData.endTime) {
            showSweetAlert('warning', 'শেষের সময় নির্বাচন করুন');
            return false;
        }

        if (formData.startTime >= formData.endTime) {
            showSweetAlert('warning', 'শেষের সময় শুরুর সময়ের পরে হতে হবে');
            return false;
        }

        if (formData.combinedPercentage && (parseFloat(formData.combinedPercentage) < 0 || parseFloat(formData.combinedPercentage) > 100)) {
            showSweetAlert('warning', 'কম্বাইন্ড পার্সেন্টেজ ০ থেকে ১০০ এর মধ্যে হতে হবে');
            return false;
        }

        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) return;

        try {
            setLoading(true);
            
            const submitData = {
                ...formData,
                year: parseInt(formData.year),
                combinedPercentage: formData.combinedPercentage ? parseFloat(formData.combinedPercentage) : 0
            };

            let response;
            if (exam) {
                response = await axiosInstance.put(`/exams/${exam._id}`, submitData);
            } else {
                response = await axiosInstance.post('/exams', submitData);
            }

            if (response.data.success) {
                showSweetAlert('success', 
                    exam ? 'পরীক্ষা সফলভাবে আপডেট হয়েছে' : 'পরীক্ষা সফলভাবে তৈরি হয়েছে'
                );
                onSuccess();
            }
        } catch (error) {
            console.error('Error saving exam:', error);
            showSweetAlert('error', 
                exam ? 'পরীক্ষা আপডেট করতে সমস্যা হয়েছে' : 'পরীক্ষা তৈরি করতে সমস্যা হয়েছে'
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 shadow-sm">
                <div className="flex items-center gap-4 p-4 sm:p-6">
                    <button
                        onClick={onBack}
                        className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                        <FaArrowLeft className="text-xl text-gray-600" />
                    </button>
                    <h1 className="text-2xl font-bold text-gray-800">
                        {exam ? 'পরীক্ষা এডিট করুন' : 'নতুন পরীক্ষা তৈরি করুন'}
                    </h1>
                </div>
            </div>

            {/* Main Content */}
            <div className="p-4 sm:p-6 lg:p-8">
                <div className="max-w-full mx-auto">
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                        <form onSubmit={handleSubmit}>
                            {/* Basic Information */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                {/* Name */}
                                <div className="md:col-span-2">
                                    <label className="block text-gray-700 font-medium mb-2 text-sm">
                                        নাম *
                                    </label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                                        placeholder="পরীক্ষার নাম"
                                        required
                                    />
                                </div>

                                {/* Exam Category */}
                                <div>
                                    <label className="block text-gray-700 font-medium mb-2 text-sm">
                                        পরীক্ষার ধরণ *
                                    </label>
                                    <select
                                        name="categoryId"
                                        value={formData.categoryId}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                                        required
                                    >
                                        <option value="">পরীক্ষার ধরণ নির্বাচন করুন</option>
                                        {categories.map(category => (
                                            <option key={category._id} value={category._id}>
                                                {category.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* ক্লাস */}
                                <div>
                                    <label className="block text-gray-700 font-medium mb-2 text-sm">
                                        ক্লাস *
                                    </label>
                                    <select
                                        name="classId"
                                        value={formData.classId}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                                        required
                                    >
                                        <option value="">ক্লাস নির্বাচন করুন</option>
                                        {classes.map(classItem => (
                                            <option key={classItem._id} value={classItem._id}>
                                                {classItem.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* সেকশন */}
                                <div>
                                    <label className="block text-gray-700 font-medium mb-2 text-sm">
                                        সেকশন *
                                    </label>
                                    <select
                                        name="sectionId"
                                        value={formData.sectionId}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                                        required
                                    >
                                        <option value="">সেকশন নির্বাচন করুন</option>
                                        {sections.map(section => (
                                            <option key={section._id} value={section._id}>
                                                {section.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* সেশন */}
                                <div>
                                    <label className="block text-gray-700 font-medium mb-2 text-sm">
                                        সেশন *
                                    </label>
                                    <select
                                        name="sessionId"
                                        value={formData.sessionId}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                                        required
                                    >
                                        <option value="">সেশন নির্বাচন করুন</option>
                                        {sessions.map(session => (
                                            <option key={session._id} value={session._id}>
                                                {session.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* গ্রেডিং */}
                                <div>
                                    <label className="block text-gray-700 font-medium mb-2 text-sm">
                                        গ্রেডিং সিস্টেম *
                                    </label>
                                    <select
                                        name="gradingId"
                                        value={formData.gradingId}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                                        required
                                    >
                                        <option value="">গ্রেডিং সিস্টেম নির্বাচন করুন</option>
                                        {gradingSystems.map(grading => (
                                            <option key={grading._id} value={grading._id}>
                                                {grading.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* বছর */}
                                <div>
                                    <label className="block text-gray-700 font-medium mb-2 text-sm">
                                        বছর *
                                    </label>
                                    <input
                                        type="number"
                                        name="year"
                                        value={formData.year}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                                        min="2000"
                                        max="2100"
                                        required
                                    />
                                </div>

                                {/* তারিখ */}
                                <div>
                                    <label className="block text-gray-700 font-medium mb-2 text-sm">
                                        তারিখ *
                                    </label>
                                    <input
                                        type="date"
                                        name="date"
                                        value={formData.date}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                                        required
                                    />
                                </div>

                                {/* Start Time */}
                                <div>
                                    <label className="block text-gray-700 font-medium mb-2 text-sm">
                                        শুরুর সময় *
                                    </label>
                                    <input
                                        type="time"
                                        name="startTime"
                                        value={formData.startTime}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                                        required
                                    />
                                </div>

                                {/* End Time */}
                                <div>
                                    <label className="block text-gray-700 font-medium mb-2 text-sm">
                                        শেষের সময় *
                                    </label>
                                    <input
                                        type="time"
                                        name="endTime"
                                        value={formData.endTime}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                                        required
                                    />
                                </div>

                                {/* Combined Percentage */}
                                <div>
                                    <label className="block text-gray-700 font-medium mb-2 text-sm">
                                        কম্বাইন্ড পার্সেন্টেজ
                                    </label>
                                    <input
                                        type="number"
                                        name="combinedPercentage"
                                        value={formData.combinedPercentage}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                                        placeholder="0-100"
                                        min="0"
                                        max="100"
                                        step="0.1"
                                    />
                                </div>

                                {/* Status */}
                                <div>
                                    <label className="block text-gray-700 font-medium mb-2 text-sm">
                                        অবস্থান *
                                    </label>
                                    <select
                                        name="status"
                                        value={formData.status}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                                        required
                                    >
                                        <option value="Draft">খসড়া</option>
                                        <option value="Published">প্রকাশিত</option>
                                    </select>
                                </div>
                            </div>

                            {/* Rich Text Editor for Note */}
                            <div className="mb-8">
                                <label className="block text-gray-700 font-medium mb-2 text-sm">
                                    নোট
                                </label>
                                <RichTextEditor
                                    value={formData.note}
                                    onChange={handleNoteChange}
                                    placeholder="পরীক্ষা সম্পর্কিত নোট লিখুন..."
                                />
                            </div>

                            {/* Submit Buttons */}
                            <div className="flex gap-4">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <FaSave className="text-sm" />
                                    {loading ? 'সেভ হচ্ছে...' : (exam ? 'আপডেট করুন' : 'সেভ করুন')}
                                </button>
                                <button
                                    type="button"
                                    onClick={onBack}
                                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    বাতিল করুন
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddNewExam;