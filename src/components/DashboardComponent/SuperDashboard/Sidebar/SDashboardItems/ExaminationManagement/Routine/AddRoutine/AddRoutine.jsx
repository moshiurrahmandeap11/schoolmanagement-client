import { useEffect, useState } from 'react';
import { FaArrowLeft, FaSave, FaUpload } from 'react-icons/fa';
import Swal from 'sweetalert2';
import axiosInstance from '../../../../../../../../hooks/axiosInstance/axiosInstance';
import MainButton from '../../../../../../../sharedItems/Mainbutton/Mainbutton';


const AddRoutine = ({ routine, onBack, onSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [classes, setClasses] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [sessions, setSessions] = useState([]);
    const [formData, setFormData] = useState({
        classId: '',
        subjectId: '',
        sessionId: '',
        date: '',
        startTime: '',
        endTime: '',
        attachment: null
    });
    const [filePreview, setFilePreview] = useState(null);

    useEffect(() => {
        fetchDropdownData();
        if (routine) {
            setFormData({
                classId: routine.classId || '',
                subjectId: routine.subjectId || '',
                sessionId: routine.sessionId || '',
                date: routine.date ? new Date(routine.date).toISOString().split('T')[0] : '',
                startTime: routine.startTime || '',
                endTime: routine.endTime || '',
                attachment: null
            });
            if (routine.attachment) {
                setFilePreview(routine.attachment);
            }
        }
    }, [routine]);

    const fetchDropdownData = async () => {
        try {
            const [classesRes, subjectsRes, sessionsRes] = await Promise.all([
                axiosInstance.get('/class'),
                axiosInstance.get('/subjects'),
                axiosInstance.get('/sessions')
            ]);

            if (classesRes.data.success) setClasses(classesRes.data.data || []);
            if (subjectsRes.data.success) setSubjects(subjectsRes.data.data || []);
            if (sessionsRes.data.success) setSessions(sessionsRes.data.data || []);
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

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData(prev => ({
                ...prev,
                attachment: file
            }));
            
            // Create preview for image files
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    setFilePreview(e.target.result);
                };
                reader.readAsDataURL(file);
            } else {
                setFilePreview(null);
            }
        }
    };

    const removeFile = () => {
        setFormData(prev => ({
            ...prev,
            attachment: null
        }));
        setFilePreview(null);
    };

    const validateForm = () => {
        if (!formData.classId) {
            showSweetAlert('warning', 'ক্লাস নির্বাচন করুন');
            return false;
        }

        if (!formData.subjectId) {
            showSweetAlert('warning', 'বিষয় নির্বাচন করুন');
            return false;
        }

        if (!formData.sessionId) {
            showSweetAlert('warning', 'সেশন নির্বাচন করুন');
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

        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) return;

        try {
            setLoading(true);
            
            const submitData = new FormData();
            submitData.append('classId', formData.classId);
            submitData.append('subjectId', formData.subjectId);
            submitData.append('sessionId', formData.sessionId);
            submitData.append('date', formData.date);
            submitData.append('startTime', formData.startTime);
            submitData.append('endTime', formData.endTime);
            
            if (formData.attachment) {
                submitData.append('attachment', formData.attachment);
            }

            let response;
            if (routine) {
                response = await axiosInstance.put(`/exam-routine/${routine._id}`, submitData, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                });
            } else {
                response = await axiosInstance.post('/exam-routine', submitData, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                });
            }

            if (response.data.success) {
                showSweetAlert('success', 
                    routine ? 'পরীক্ষার রুটিন সফলভাবে আপডেট হয়েছে' : 'পরীক্ষার রুটিন সফলভাবে তৈরি হয়েছে'
                );
                onSuccess();
            }
        } catch (error) {
            console.error('Error saving exam routine:', error);
            showSweetAlert('error', 
                routine ? 'পরীক্ষার রুটিন আপডেট করতে সমস্যা হয়েছে' : 'পরীক্ষার রুটিন তৈরি করতে সমস্যা হয়েছে'
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
                        {routine ? 'পরীক্ষার রুটিন এডিট করুন' : 'নতুন পরীক্ষার রুটিন তৈরি করুন'}
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
                                {/* ক্লাস */}
                                <div>
                                    <label className="block text-gray-700 font-medium mb-2 text-sm">
                                        ক্লাস *
                                    </label>
                                    <select
                                        name="classId"
                                        value={formData.classId}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9] transition-colors"
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

                                {/* বিষয় */}
                                <div>
                                    <label className="block text-gray-700 font-medium mb-2 text-sm">
                                        বিষয় *
                                    </label>
                                    <select
                                        name="subjectId"
                                        value={formData.subjectId}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9] transition-colors"
                                        required
                                    >
                                        <option value="">বিষয় নির্বাচন করুন</option>
                                        {subjects.map(subject => (
                                            <option key={subject._id} value={subject._id}>
                                                {subject.name}
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
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9] transition-colors"
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
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9] transition-colors"
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
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9] transition-colors"
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
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9] transition-colors"
                                        required
                                    />
                                </div>
                            </div>

                            {/* File Upload */}
                            <div className="mb-8">
                                <label className="block text-gray-700 font-medium mb-2 text-sm">
                                    সংযোজন (ঐচ্ছিক)
                                </label>
                                
                                {filePreview ? (
                                    <div className="border-2 border-dashed border-green-300 rounded-lg p-4 bg-green-50">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm text-green-700 font-medium">
                                                ফাইল নির্বাচন করা হয়েছে
                                            </span>
                                            <button
                                                type="button"
                                                onClick={removeFile}
                                                className="text-red-600 hover:text-red-800 text-sm"
                                            >
                                                সরান
                                            </button>
                                        </div>
                                        {formData.attachment?.type?.startsWith('image/') ? (
                                            <img 
                                                src={filePreview} 
                                                alt="Preview" 
                                                className="max-h-32 mx-auto rounded"
                                            />
                                        ) : (
                                            <div className="text-center py-4">
                                                <FaUpload className="text-3xl text-gray-400 mx-auto mb-2" />
                                                <p className="text-sm text-gray-600">
                                                    {formData.attachment?.name || 'ফাইল'}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                                        <input
                                            type="file"
                                            onChange={handleFileChange}
                                            className="hidden"
                                            id="attachment"
                                            accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt"
                                        />
                                        <label htmlFor="attachment" className="cursor-pointer">
                                            <FaUpload className="text-3xl text-gray-400 mx-auto mb-2" />
                                            <p className="text-sm text-gray-600 mb-1">
                                                ফাইল আপলোড করুন (ছবি, PDF, DOC, Excel)
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                সর্বোচ্চ 10MB
                                            </p>
                                        </label>
                                    </div>
                                )}
                            </div>

                            {/* Submit Buttons */}
                            <div className="flex gap-4">
                                <MainButton
                                    type="submit"
                                    disabled={loading}
                                    className='flex-1 flex items-center justify-center rounded-md'
                                >
                                    <FaSave className="text-sm" />
                                    {loading ? 'সেভ হচ্ছে...' : (routine ? 'আপডেট করুন' : 'সেভ করুন')}
                                </MainButton>
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

export default AddRoutine;