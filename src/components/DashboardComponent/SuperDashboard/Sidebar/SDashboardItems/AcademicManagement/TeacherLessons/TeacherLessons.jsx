import { useEffect, useState } from 'react';
import { FaArrowLeft, FaDownload, FaEdit, FaPlus, FaSearch, FaTrash } from 'react-icons/fa';
import Swal from 'sweetalert2';
import axiosInstance from '../../../../../../../hooks/axiosInstance/axiosInstance';
import Loader from '../../../../../../sharedItems/Loader/Loader';
import AddNewTeacherLessons from './AddNewTeacherLessons/AddNewTeacherLessons';
import EditTeacherLesson from './EditTeacherLesson/EditTeacherLesson';

const TeacherLessons = ({ onBack }) => {
    const [activeComponent, setActiveComponent] = useState('list');
    const [loading, setLoading] = useState(true);
    const [lessons, setLessons] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [editingLesson, setEditingLesson] = useState(null);

    useEffect(() => {
        if (activeComponent === 'list') {
            fetchLessons();
        }
    }, [activeComponent]);

    const fetchLessons = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get('/teacher-lessons');
            
            if (response.data.success) {
                setLessons(response.data.data || []);
            } else {
                showSweetAlert('error', response.data.message || 'লেসন প্ল্যান লোড করতে সমস্যা হয়েছে');
            }
        } catch (error) {
            console.error('Error fetching lessons:', error);
            showSweetAlert('error', 'লেসন প্ল্যান লোড করতে সমস্যা হয়েছে');
        } finally {
            setLoading(false);
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

    const handleDelete = async (lessonId, lessonTitle) => {
        const result = await Swal.fire({
            title: 'নিশ্চিত?',
            text: `আপনি কি "${lessonTitle}" লেসন প্ল্যানটি মুছে ফেলতে চান?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'হ্যাঁ, মুছুন',
            cancelButtonText: 'না',
            reverseButtons: true
        });

        if (result.isConfirmed) {
            try {
                setLoading(true);
                const response = await axiosInstance.delete(`/teacher-lessons/${lessonId}`);

                if (response.data.success) {
                    showSweetAlert('success', 'লেসন প্ল্যান সফলভাবে মুছে ফেলা হয়েছে!');
                    fetchLessons();
                } else {
                    showSweetAlert('error', response.data.message || 'লেসন প্ল্যান মুছতে সমস্যা হয়েছে');
                }
            } catch (error) {
                console.error('Error deleting lesson:', error);
                showSweetAlert('error', 'লেসন প্ল্যান মুছতে সমস্যা হয়েছে');
            } finally {
                setLoading(false);
            }
        }
    };

    const handleDownload = async (lesson) => {
        try {
            // Increment download count
            await axiosInstance.patch(`/teacher-lessons/${lesson._id}/download`);
            
            // Create download link
            const link = lesson.filePath.startsWith('http') 
                ? lesson.filePath 
                : `${window.location.origin}${lesson.filePath}`;
            
            // Create a temporary anchor element for download
            const a = document.createElement('a');
            a.href = link;
            a.download = lesson.fileName || 'lesson-plan';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            
            showSweetAlert('success', 'লেসন প্ল্যান ডাউনলোড শুরু হয়েছে');
        } catch (error) {
            console.error('Error downloading lesson:', error);
            showSweetAlert('error', 'লেসন প্ল্যান ডাউনলোড করতে সমস্যা হয়েছে');
        }
    };

    const handleEdit = (lesson) => {
        setEditingLesson(lesson);
        setActiveComponent('edit');
    };

    const handleBackToList = () => {
        setActiveComponent('list');
        setEditingLesson(null);
    };

    const filteredLessons = lessons.filter(lesson =>
        lesson.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (lesson.description && lesson.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (lesson.teacher && lesson.teacher.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (lesson.class && lesson.class.name.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const formatFileSize = (bytes) => {
        if (!bytes || bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const getFileIcon = (fileName) => {
        if (!fileName) return '📄';
        const ext = fileName.split('.').pop().toLowerCase();
        switch (ext) {
            case 'pdf': return '📕';
            case 'doc': case 'docx': return '📘';
            case 'xls': case 'xlsx': return '📗';
            case 'ppt': case 'pptx': return '📙';
            case 'txt': return '📝';
            default: return '📄';
        }
    };

    if (activeComponent === 'new') {
        return <AddNewTeacherLessons onBack={handleBackToList} onSuccess={fetchLessons} />;
    }

    if (activeComponent === 'edit' && editingLesson) {
        return <EditTeacherLesson 
            lesson={editingLesson} 
            onBack={handleBackToList} 
            onSuccess={fetchLessons} 
        />;
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm">
                <div className="flex items-center justify-between p-4 sm:p-6">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={onBack}
                            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                            <FaArrowLeft className="text-xl text-gray-600" />
                        </button>
                        <h1 className="text-2xl font-bold text-gray-800">
                            শিক্ষক লেসন প্ল্যান
                        </h1>
                    </div>
                    
                    <button
                        onClick={() => setActiveComponent('new')}
                        className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium flex items-center gap-2"
                    >
                        <FaPlus className="text-sm" />
                        নতুন লেসন প্ল্যান
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="p-4 sm:p-6 lg:p-8">
                <div className="max-w-full mx-auto">
                    {/* Search Section */}
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 mb-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            <div className="relative">
                                <label className="block text-gray-700 font-medium mb-2 text-sm">
                                    লেসন প্ল্যান খুঁজুন
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                                        placeholder="শিরোনাম, বিবরণ, শিক্ষক বা ক্লাস দ্বারা খুঁজুন..."
                                    />
                                    <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                </div>
                            </div>
                            
                            <div className="flex items-end justify-between">
                                <div className="text-sm text-gray-600">
                                    মোট লেসন প্ল্যান: {filteredLessons.length}
                                </div>
                                {searchTerm && (
                                    <button
                                        onClick={() => setSearchTerm('')}
                                        className="px-3 py-1 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
                                    >
                                        Clear Search
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Lessons Table */}
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-200">
                        {/* Loading State */}
                        {loading && (
                            <div className="p-8 text-center">
                                <Loader />
                                <p className="text-gray-600 mt-2 text-sm">লেসন প্ল্যান লোড হচ্ছে...</p>
                            </div>
                        )}

                        {/* Empty State */}
                        {!loading && filteredLessons.length === 0 && (
                            <div className="p-8 text-center">
                                <div className="text-4xl mb-3">📚</div>
                                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                                    {lessons.length === 0 ? 'কোন লেসন প্ল্যান পাওয়া যায়নি' : 'ফিল্টারে কোন লেসন প্ল্যান পাওয়া যায়নি'}
                                </h3>
                                <p className="text-gray-600 mb-4 text-sm">
                                    {lessons.length === 0 
                                        ? 'আপনার প্রথম লেসন প্ল্যান তৈরি করুন।' 
                                        : 'অন্যান্য ফিল্টার চেষ্টা করুন।'
                                    }
                                </p>
                                <button
                                    onClick={() => setActiveComponent('new')}
                                    className="px-5 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
                                >
                                    লেসন প্ল্যান তৈরি করুন
                                </button>
                            </div>
                        )}

                        {/* Lessons Table */}
                        {!loading && filteredLessons.length > 0 && (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50 border-b border-gray-200">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">শিরোনাম</th>
                                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">বিবরণ</th>
                                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">শিক্ষক</th>
                                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">ক্লাস</th>
                                            <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">ডাউনলোড</th>
                                            <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">হালনাগাদ</th>
                                            <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">মুছুন</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {filteredLessons.map((lesson) => (
                                            <tr key={lesson._id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-4 py-3">
                                                    <div className="flex items-start gap-3 max-w-xs">
                                                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                                                            <span className="text-blue-600 text-lg">
                                                                {getFileIcon(lesson.fileName)}
                                                            </span>
                                                        </div>
                                                        <div className="min-w-0 flex-1">
                                                            <p className="font-medium text-gray-800 text-sm">
                                                                {lesson.title}
                                                            </p>
                                                            <div className="flex flex-wrap gap-2 mt-1">
                                                                <span className="text-xs text-gray-500">
                                                                    {lesson.fileName}
                                                                </span>
                                                                <span className="text-xs text-gray-400">
                                                                    {formatFileSize(lesson.fileSize)}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="max-w-xs">
                                                        <p className="text-gray-600 text-sm line-clamp-2">
                                                            {lesson.description ? 
                                                                lesson.description.replace(/<[^>]*>/g, '').substring(0, 100) : 
                                                                'কোন বিবরণ নেই'
                                                            }
                                                            {lesson.description && lesson.description.length > 100 ? '...' : ''}
                                                        </p>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                        {lesson.teacher?.name || 'N/A'}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                        {lesson.class?.name || 'N/A'}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex flex-col items-center gap-1">
                                                        <button
                                                            onClick={() => handleDownload(lesson)}
                                                            className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 transition-colors text-xs flex items-center gap-1"
                                                            title="ডাউনলোড করুন"
                                                        >
                                                            <FaDownload className="text-xs" />
                                                            ডাউনলোড
                                                        </button>
                                                        <span className="text-xs text-gray-500">
                                                            {lesson.downloads || 0} বার
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex justify-center">
                                                        <button
                                                            onClick={() => handleEdit(lesson)}
                                                            className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors text-xs flex items-center gap-1"
                                                            title="হালনাগাদ করুন"
                                                        >
                                                            <FaEdit className="text-xs" />
                                                            হালনাগাদ
                                                        </button>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex justify-center">
                                                        <button
                                                            onClick={() => handleDelete(lesson._id, lesson.title)}
                                                            className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors text-xs flex items-center gap-1"
                                                            title="মুছুন"
                                                        >
                                                            <FaTrash className="text-xs" />
                                                            মুছুন
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    {/* Pagination or Summary */}
                    {!loading && filteredLessons.length > 0 && (
                        <div className="mt-4 flex flex-col sm:flex-row justify-between items-center gap-4">
                            <div className="text-sm text-gray-600">
                                দেখানো হচ্ছে {filteredLessons.length} টি লেসন প্ল্যান
                                {searchTerm && (
                                    <span className="ml-2 text-blue-600">
                                        (খুঁজেছেন: "{searchTerm}")
                                    </span>
                                )}
                            </div>
                            
                            <div className="flex gap-2">
                                <button 
                                    className="px-3 py-1 border border-gray-300 rounded text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50"
                                    disabled
                                >
                                    পূর্ববর্তী
                                </button>
                                <button 
                                    className="px-3 py-1 border border-gray-300 rounded text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50"
                                    disabled
                                >
                                    পরবর্তী
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TeacherLessons;