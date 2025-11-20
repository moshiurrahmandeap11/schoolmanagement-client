import { useEffect, useState } from 'react';
import { FaArrowLeft, FaSave } from 'react-icons/fa';
import Swal from 'sweetalert2';
import axiosInstance from '../../../../../../../hooks/axiosInstance/axiosInstance';
import MainButton from '../../../../../../sharedItems/Mainbutton/Mainbutton';


const AddNewClassTeacher = ({ classTeacher, onBack, onSuccess }) => {
    const [formData, setFormData] = useState({
        teacherName: '',
        className: '',
        subjectName: ''
    });
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [teachers, setTeachers] = useState([]);
    const [classes, setClasses] = useState([]);
    const [subjects, setSubjects] = useState([]);

    useEffect(() => {
        if (classTeacher) {
            setFormData({
                teacherName: classTeacher.teacherName || '',
                className: classTeacher.className || '',
                subjectName: classTeacher.subjectName || ''
            });
        }
        fetchDropdownData();
    }, [classTeacher]);

    const fetchDropdownData = async () => {
        try {
            // Fetch teachers from teacher list
            const teachersResponse = await axiosInstance.get('/teacher-list');
            if (teachersResponse.data.success) {
                setTeachers(teachersResponse.data.data || []);
            }

            // Fetch classes
            const classesResponse = await axiosInstance.get('/class');
            if (classesResponse.data.success) {
                setClasses(classesResponse.data.data || []);
            }

            // Fetch subjects
            const subjectsResponse = await axiosInstance.get('/subjects');
            if (subjectsResponse.data.success) {
                setSubjects(subjectsResponse.data.data || []);
            }
        } catch (error) {
            console.error('Error fetching dropdown data:', error);
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
    };

    const validateForm = () => {
        const newErrors = {};
        
        if (!formData.teacherName.trim()) {
            newErrors.teacherName = 'শিক্ষকের নাম প্রয়োজন';
        }
        
        if (!formData.className.trim()) {
            newErrors.className = 'ক্লাসের নাম প্রয়োজন';
        }

        if (!formData.subjectName.trim()) {
            newErrors.subjectName = 'বিষয়ের নাম প্রয়োজন';
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
            
            if (classTeacher) {
                // Update existing class teacher
                response = await axiosInstance.put(`/class-teachers/${classTeacher._id}`, {
                    teacherName: formData.teacherName.trim(),
                    className: formData.className.trim(),
                    subjectName: formData.subjectName.trim()
                });
            } else {
                // Create new class teacher
                response = await axiosInstance.post('/class-teachers', {
                    teacherName: formData.teacherName.trim(),
                    className: formData.className.trim(),
                    subjectName: formData.subjectName.trim()
                });
            }

            if (response.data.success) {
                showSweetAlert('success', response.data.message);
                onSuccess();
            } else {
                setErrors({ submit: response.data.message });
            }
        } catch (error) {
            console.error('Error saving class teacher:', error);
            const errorMessage = error.response?.data?.message || 'শ্রেণী শিক্ষক সংরক্ষণ করতে সমস্যা হয়েছে';
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
                            {classTeacher ? 'শ্রেণী শিক্ষক এডিট করুন' : 'নতুন শ্রেণী শিক্ষক নিয়োগ করুন'}
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
                                    শ্রেণী শিক্ষক নিয়োগের তথ্য:
                                </h3>
                            </div>

                            {/* Teacher Selection */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    শিক্ষক নির্বাচন করুন *
                                </label>
                                <select
                                    name="teacherName"
                                    value={formData.teacherName}
                                    onChange={handleChange}
                                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9] focus:border-transparent transition-all ${
                                        errors.teacherName ? 'border-red-500 bg-red-50' : 'border-gray-300'
                                    }`}
                                    disabled={loading}
                                >
                                    <option value="">শিক্ষক নির্বাচন করুন</option>
                                    {teachers.map((teacher) => (
                                        <option key={teacher._id} value={teacher.name}>
                                            {teacher.name}
                                        </option>
                                    ))}
                                </select>
                                {errors.teacherName && (
                                    <p className="mt-2 text-sm text-red-600">{errors.teacherName}</p>
                                )}
                            </div>

                            {/* Class Selection */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    ক্লাস নির্বাচন করুন *
                                </label>
                                <select
                                    name="className"
                                    value={formData.className}
                                    onChange={handleChange}
                                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9] focus:border-transparent transition-all ${
                                        errors.className ? 'border-red-500 bg-red-50' : 'border-gray-300'
                                    }`}
                                    disabled={loading}
                                >
                                    <option value="">ক্লাস নির্বাচন করুন</option>
                                    {classes.map((classItem) => (
                                        <option key={classItem._id} value={classItem.name}>
                                            {classItem.name}
                                        </option>
                                    ))}
                                </select>
                                {errors.className && (
                                    <p className="mt-2 text-sm text-red-600">{errors.className}</p>
                                )}
                            </div>

                            {/* Subject Selection */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    বিষয় নির্বাচন করুন *
                                </label>
                                <select
                                    name="subjectName"
                                    value={formData.subjectName}
                                    onChange={handleChange}
                                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9] focus:border-transparent transition-all ${
                                        errors.subjectName ? 'border-red-500 bg-red-50' : 'border-gray-300'
                                    }`}
                                    disabled={loading}
                                >
                                    <option value="">বিষয় নির্বাচন করুন</option>
                                    {subjects.map((subject) => (
                                        <option key={subject._id} value={subject.name}>
                                            {subject.name}
                                        </option>
                                    ))}
                                </select>
                                {errors.subjectName && (
                                    <p className="mt-2 text-sm text-red-600">{errors.subjectName}</p>
                                )}
                            </div>

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
                                            {classTeacher ? 'আপডেট হচ্ছে...' : 'নিয়োগ হচ্ছে...'}
                                        </>
                                    ) : (
                                        <>
                                            <FaSave className="text-sm mr-2" />
                                            {classTeacher ? 'আপডেট করুন' : 'নিয়োগ করুন'}
                                        </>
                                    )}
                                </MainButton>
                            </div>
                        </form>

                        {/* Help Text */}
                        <div className="mt-6 p-4 bg-blue-50 rounded-lg ">
                            <h3 className="text-sm font-medium text-[#1e90c9] mb-1">
                                শ্রেণী শিক্ষক নিয়োগ সম্পর্কে:
                            </h3>
                            <ul className="text-xs text-[#1e90c9] space-y-1">
                                <li>• একজন শিক্ষক একটি ক্লাসের একটি বিষয়ের জন্য নিয়োগ করা যাবে</li>
                                <li>• একই ক্লাসের একই বিষয়ের জন্য একজন以上的 শিক্ষক নিয়োগ করা যাবে না</li>
                                <li>• নিয়োগ করার পর এডিট ও ডিলিট করা যাবে</li>
                                <li>• নিষ্ক্রিয় শ্রেণী শিক্ষক নতুন ভর্তিতে ব্যবহার করা যাবে না</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddNewClassTeacher;