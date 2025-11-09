import { useEffect, useState } from 'react';
import { FaArrowLeft, FaSave, FaUpload } from 'react-icons/fa';
import Swal from 'sweetalert2';
import axiosInstance from '../../../../../../../../hooks/axiosInstance/axiosInstance';
import RichTextEditor from '../../../../../../../sharedItems/RichTextEditor/RichTextEditor';

const AddNewTeacherLessons = ({ onBack, onSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [teachers, setTeachers] = useState([]);
    const [classes, setClasses] = useState([]);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        teacherId: '',
        classId: '',
        lessonFile: null
    });
    const [errors, setErrors] = useState({});

    useEffect(() => {
        fetchTeachers();
        fetchClasses();
    }, []);

    const fetchTeachers = async () => {
        try {
            const response = await axiosInstance.get('/teacher-list');
            if (response.data.success) {
                setTeachers(response.data.data || []);
            }
        } catch (error) {
            console.error('Error fetching teachers:', error);
            showSweetAlert('error', 'শিক্ষক লোড করতে সমস্যা হয়েছে');
        }
    };

    const fetchClasses = async () => {
        try {
            const response = await axiosInstance.get('/classes');
            if (response.data.success) {
                setClasses(response.data.data || []);
            }
        } catch (error) {
            console.error('Error fetching classes:', error);
            showSweetAlert('error', 'ক্লাস লোড করতে সমস্যা হয়েছে');
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
        
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Check file size (10MB limit)
            if (file.size > 10 * 1024 * 1024) {
                showSweetAlert('error', 'ফাইল সাইজ 10MB এর বেশি হতে পারবে না');
                return;
            }

            // Check file type
            const allowedTypes = ['.pdf', '.doc', '.docx', '.txt', '.ppt', '.pptx'];
            const fileExt = '.' + file.name.split('.').pop().toLowerCase();
            if (!allowedTypes.includes(fileExt)) {
                showSweetAlert('error', 'শুধুমাত্র PDF, DOC, DOCX, TXT, PPT, PPTX ফাইল আপলোড করা যাবে');
                return;
            }

            setFormData(prev => ({
                ...prev,
                lessonFile: file
            }));

            if (errors.lessonFile) {
                setErrors(prev => ({
                    ...prev,
                    lessonFile: ''
                }));
            }
        }
    };

    const handleDescriptionChange = (content) => {
        setFormData(prev => ({
            ...prev,
            description: content
        }));
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.title.trim()) {
            newErrors.title = 'শিরোনাম প্রয়োজন';
        }

        if (!formData.teacherId) {
            newErrors.teacherId = 'শিক্ষক নির্বাচন করুন';
        }

        if (!formData.classId) {
            newErrors.classId = 'ক্লাস নির্বাচন করুন';
        }

        if (!formData.lessonFile) {
            newErrors.lessonFile = 'লেসন প্ল্যান ফাইল প্রয়োজন';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }

        try {
            setLoading(true);
            
            const submitData = new FormData();
            submitData.append('title', formData.title);
            submitData.append('description', formData.description);
            submitData.append('teacherId', formData.teacherId);
            submitData.append('classId', formData.classId);
            submitData.append('lessonFile', formData.lessonFile);

            const response = await axiosInstance.post('/teacher-lessons', submitData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (response.data.success) {
                showSweetAlert('success', 'লেসন প্ল্যান সফলভাবে তৈরি হয়েছে!');
                if (onSuccess) {
                    onSuccess();
                }
                onBack();
            } else {
                showSweetAlert('error', response.data.message || 'লেসন প্ল্যান তৈরি করতে সমস্যা হয়েছে');
            }
        } catch (error) {
            console.error('Error creating lesson plan:', error);
            const errorMessage = error.response?.data?.message || 'লেসন প্ল্যান তৈরি করতে সমস্যা হয়েছে';
            showSweetAlert('error', errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm">
                <div className="flex items-center gap-4 p-4 sm:p-6">
                    <button
                        onClick={onBack}
                        className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                        <FaArrowLeft className="text-xl text-gray-600" />
                    </button>
                    <h1 className="text-2xl font-bold text-gray-800">
                        নতুন লেসন প্ল্যান তৈরি করুন
                    </h1>
                </div>
            </div>

            {/* Main Content */}
            <div className="p-4 sm:p-6 lg:p-8">
                <div className="max-w-full mx-auto">
                    <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                        <div className="grid grid-cols-1 gap-6">
                            {/* Title */}
                            <div>
                                <label className="block text-gray-700 font-medium mb-2 text-sm">
                                    লেসন প্ল্যানের শিরোনাম <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleInputChange}
                                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                                        errors.title ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                    placeholder="লেসন প্ল্যানের শিরোনাম লিখুন..."
                                />
                                {errors.title && (
                                    <p className="text-red-500 text-xs mt-1">{errors.title}</p>
                                )}
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-gray-700 font-medium mb-2 text-sm">
                                    বিস্তারিত বিবরণ
                                </label>
                                <RichTextEditor
                                    value={formData.description}
                                    onChange={handleDescriptionChange}
                                    placeholder="লেসন প্ল্যানের বিস্তারিত বিবরণ লিখুন..."
                                />
                            </div>

                            {/* Teacher and Class Selection */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Teacher Selection */}
                                <div>
                                    <label className="block text-gray-700 font-medium mb-2 text-sm">
                                        শিক্ষক নির্বাচন করুন <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        name="teacherId"
                                        value={formData.teacherId}
                                        onChange={handleInputChange}
                                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                                            errors.teacherId ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                    >
                                        <option value="">শিক্ষক নির্বাচন করুন</option>
                                        {teachers.map(teacher => (
                                            <option key={teacher._id} value={teacher._id}>
                                                {teacher.name}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.teacherId && (
                                        <p className="text-red-500 text-xs mt-1">{errors.teacherId}</p>
                                    )}
                                </div>

                                {/* Class Selection */}
                                <div>
                                    <label className="block text-gray-700 font-medium mb-2 text-sm">
                                        ক্লাস নির্বাচন করুন <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        name="classId"
                                        value={formData.classId}
                                        onChange={handleInputChange}
                                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                                            errors.classId ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                    >
                                        <option value="">ক্লাস নির্বাচন করুন</option>
                                        {classes.map(classItem => (
                                            <option key={classItem._id} value={classItem._id}>
                                                {classItem.name}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.classId && (
                                        <p className="text-red-500 text-xs mt-1">{errors.classId}</p>
                                    )}
                                </div>
                            </div>

                            {/* File Upload */}
                            <div>
                                <label className="block text-gray-700 font-medium mb-2 text-sm">
                                    লেসন প্ল্যান ফাইল আপলোড <span className="text-red-500">*</span>
                                </label>
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                                    <input
                                        type="file"
                                        onChange={handleFileChange}
                                        accept=".pdf,.doc,.docx,.txt,.ppt,.pptx"
                                        className="hidden"
                                        id="lessonFile"
                                    />
                                    <label htmlFor="lessonFile" className="cursor-pointer">
                                        <FaUpload className="mx-auto text-3xl text-gray-400 mb-3" />
                                        <p className="text-gray-600 mb-2">
                                            {formData.lessonFile 
                                                ? `Selected: ${formData.lessonFile.name}` 
                                                : 'ফাইল নির্বাচন করুন (PDF, DOC, DOCX, TXT, PPT, PPTX)'
                                            }
                                        </p>
                                        <p className="text-gray-400 text-sm">
                                            সর্বোচ্চ সাইজ: 10MB
                                        </p>
                                    </label>
                                </div>
                                {errors.lessonFile && (
                                    <p className="text-red-500 text-xs mt-1">{errors.lessonFile}</p>
                                )}
                                {formData.lessonFile && (
                                    <p className="text-green-600 text-xs mt-1">
                                        ফাইল সফলভাবে নির্বাচিত হয়েছে: {formData.lessonFile.name} 
                                        ({(formData.lessonFile.size / 1024 / 1024).toFixed(2)} MB)
                                    </p>
                                )}
                            </div>

                            {/* Submit Buttons */}
                            <div className="flex gap-4 pt-4">
                                <button
                                    type="button"
                                    onClick={onBack}
                                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                                >
                                    বাতিল করুন
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <FaSave className="text-sm" />
                                    {loading ? 'সেভ হচ্ছে...' : 'লেসন প্ল্যান সেভ করুন'}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AddNewTeacherLessons;