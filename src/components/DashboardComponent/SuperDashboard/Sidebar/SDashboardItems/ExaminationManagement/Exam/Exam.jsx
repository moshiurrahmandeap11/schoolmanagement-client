import { useEffect, useState } from 'react';
import { FaArrowLeft, FaEdit, FaFilter, FaPlus, FaTrash } from 'react-icons/fa';
import Swal from 'sweetalert2';
import axiosInstance from '../../../../../../../hooks/axiosInstance/axiosInstance';
import Loader from '../../../../../../sharedItems/Loader/Loader';
import MainButton from '../../../../../../sharedItems/Mainbutton/Mainbutton';
import AddNewExam from './AddNewExam/AddNewExam';


const Exam = ({ onBack }) => {
    const [exams, setExams] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingExam, setEditingExam] = useState(null);
    const [showFilters, setShowFilters] = useState(false);
    const [categories, setCategories] = useState([]);
    const [classes, setClasses] = useState([]);
    const [sections, setSections] = useState([]);
    const [sessions, setSessions] = useState([]);
    const [filters, setFilters] = useState({
        categoryId: 'all',
        classId: 'all',
        sectionId: 'all',
        sessionId: 'all'
    });

    useEffect(() => {
        if (!showAddForm) {
            fetchDropdownData();
            fetchExams();
        }
    }, [showAddForm]);

    const fetchDropdownData = async () => {
        try {
            const [categoriesRes, classesRes, sectionsRes, sessionsRes] = await Promise.all([
                axiosInstance.get('/exam-categories'),
                axiosInstance.get('/class'),
                axiosInstance.get('/sections'),
                axiosInstance.get('/sessions')
            ]);

            if (categoriesRes.data.success) setCategories(categoriesRes.data.data || []);
            if (classesRes.data.success) setClasses(classesRes.data.data || []);
            if (sectionsRes.data.success) setSections(sectionsRes.data.data || []);
            if (sessionsRes.data.success) setSessions(sessionsRes.data.data || []);
        } catch (error) {
            console.error('Error fetching dropdown data:', error);
            showSweetAlert('error', 'ডেটা লোড করতে সমস্যা হয়েছে');
        }
    };

    const fetchExams = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams();
            
            if (filters.categoryId !== 'all') params.append('categoryId', filters.categoryId);
            if (filters.classId !== 'all') params.append('classId', filters.classId);
            if (filters.sectionId !== 'all') params.append('sectionId', filters.sectionId);
            if (filters.sessionId !== 'all') params.append('sessionId', filters.sessionId);

            const response = await axiosInstance.get(`/exams?${params}`);
            
            if (response.data.success) {
                setExams(response.data.data || []);
            }
        } catch (error) {
            console.error('Error fetching exams:', error);
            showSweetAlert('error', 'পরীক্ষা লোড করতে সমস্যা হয়েছে');
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

    const handleEdit = (exam) => {
        setEditingExam(exam);
        setShowAddForm(true);
    };

    const handleDelete = async (examId) => {
        const result = await Swal.fire({
            title: 'আপনি কি নিশ্চিত?',
            text: "এই পরীক্ষাটি ডিলিট হয়ে যাবে!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'হ্যাঁ, ডিলিট করুন!',
            cancelButtonText: 'বাতিল করুন'
        });

        if (result.isConfirmed) {
            try {
                const response = await axiosInstance.delete(`/exams/${examId}`);
                if (response.data.success) {
                    showSweetAlert('success', 'পরীক্ষা সফলভাবে ডিলিট হয়েছে');
                    fetchExams();
                }
            } catch (error) {
                console.error('Error deleting exam:', error);
                showSweetAlert('error', 'পরীক্ষা ডিলিট করতে সমস্যা হয়েছে');
            }
        }
    };

    const handleAddNew = () => {
        setEditingExam(null);
        setShowAddForm(true);
    };

    const handleBackToList = () => {
        setShowAddForm(false);
        setEditingExam(null);
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleApplyFilters = () => {
        fetchExams();
        setShowFilters(false);
    };

    const handleClearFilters = () => {
        setFilters({
            categoryId: 'all',
            classId: 'all',
            sectionId: 'all',
            sessionId: 'all'
        });
        fetchExams();
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-BD', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
    };

    const formatTime = (timeString) => {
        return timeString;
    };

    const getStatusBadge = (status) => {
        const statusConfig = {
            'Draft': { color: 'bg-gray-100 text-gray-800', text: 'খসড়া' },
            'Published': { color: 'bg-green-100 text-green-800', text: 'প্রকাশিত' }
        };
        
        const config = statusConfig[status] || statusConfig['Draft'];
        return (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
                {config.text}
            </span>
        );
    };

    if (showAddForm) {
        return (
            <AddNewExam 
                exam={editingExam}
                onBack={handleBackToList}
                onSuccess={() => {
                    setShowAddForm(false);
                    setEditingExam(null);
                    fetchExams();
                }}
            />
        );
    }

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
                            পরীক্ষা ব্যবস্থাপনা
                        </h1>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                        >
                            <FaFilter className="text-sm" />
                            {showFilters ? 'ফিল্টার লুকান' : 'ফিল্টার দেখান'}
                        </button>
                        <MainButton
                            onClick={handleAddNew}
                            className='rounded-md'
                        >
                            <FaPlus className="text-sm" />
                            নতুন পরীক্ষা
                        </MainButton>
                    </div>
                </div>
            </div>

            {/* Filters Section */}
            {showFilters && (
                <div className="bg-white border-b border-gray-200 p-4 sm:p-6">
                    <div className="max-w-full mx-auto">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                            {/* পরীক্ষার ধরণ */}
                            <div>
                                <label className="block text-gray-700 font-medium mb-2 text-sm">
                                    পরীক্ষার ধরণ
                                </label>
                                <select
                                    name="categoryId"
                                    value={filters.categoryId}
                                    onChange={handleFilterChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9] transition-colors"
                                >
                                    <option value="all">সকল প্রকার</option>
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
                                    ক্লাস
                                </label>
                                <select
                                    name="classId"
                                    value={filters.classId}
                                    onChange={handleFilterChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9] transition-colors"
                                >
                                    <option value="all">সকল ক্লাস</option>
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
                                    সেকশন
                                </label>
                                <select
                                    name="sectionId"
                                    value={filters.sectionId}
                                    onChange={handleFilterChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9] transition-colors"
                                >
                                    <option value="all">সকল সেকশন</option>
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
                                    সেশন
                                </label>
                                <select
                                    name="sessionId"
                                    value={filters.sessionId}
                                    onChange={handleFilterChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9] transition-colors"
                                >
                                    <option value="all">সকল সেশন</option>
                                    {sessions.map(session => (
                                        <option key={session._id} value={session._id}>
                                            {session.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Filter Buttons */}
                        <div className="flex gap-4">
                            <MainButton
                                onClick={handleApplyFilters}
                                className='rounded-md'
                            >
                                ফিল্টার প্রয়োগ করুন
                            </MainButton>
                            <button
                                onClick={handleClearFilters}
                                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                ফিল্টার সরান
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Main Content */}
            <div className="p-4 sm:p-6 lg:p-8">
                <div className="max-w-full mx-auto">
                    {loading ? (
                        <div className="flex justify-center items-center py-12">
                            <Loader />
                            <p className="text-gray-600 ml-3">পরীক্ষা লোড হচ্ছে...</p>
                        </div>
                    ) : exams.length === 0 ? (
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 text-center">
                            <div className="text-4xl text-gray-400 mb-3">📝</div>
                            <h3 className="text-lg font-semibold text-gray-800 mb-2">
                                কোন পরীক্ষা পাওয়া যায়নি
                            </h3>
                            <p className="text-gray-600 text-sm mb-4">
                                নতুন পরীক্ষা তৈরি করুন
                            </p>
                            <button
                                onClick={handleAddNew}
                                className="inline-flex items-center gap-2 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
                            >
                                <FaPlus className="text-sm" />
                                নতুন পরীক্ষা তৈরি করুন
                            </button>
                        </div>
                    ) : (
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                            {/* Table Header */}
                            <div className="px-6 py-4 border-b border-gray-200">
                                <h2 className="text-lg font-semibold text-gray-800">
                                    পরীক্ষার তালিকা ({exams.length}টি)
                                </h2>
                            </div>

                            {/* Table */}
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50 border-b border-gray-200">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                প্রকার
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                তারিখ
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                শুরুর সময়
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                শেষ সময়
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                ক্লাস
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                সেকশন
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                সেশন
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                অবস্থা
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                অ্যাকশন
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {exams.map((exam) => (
                                            <tr key={exam._id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div>
                                                        <p className="font-medium text-gray-800 text-sm">
                                                            {exam.name}
                                                        </p>
                                                        <p className="text-xs text-gray-500">
                                                            {exam.categoryName}
                                                        </p>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="text-gray-600 text-sm">
                                                        {formatDate(exam.date)}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="text-gray-600 text-sm">
                                                        {formatTime(exam.startTime)}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="text-gray-600 text-sm">
                                                        {formatTime(exam.endTime)}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="text-gray-600 text-sm">
                                                        {exam.className}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="text-gray-600 text-sm">
                                                        {exam.sectionName}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="text-gray-600 text-sm">
                                                        {exam.sessionName}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    {getStatusBadge(exam.status)}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={() => handleEdit(exam)}
                                                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                            title="এডিট করুন"
                                                        >
                                                            <FaEdit className="text-sm" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(exam._id)}
                                                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                            title="ডিলিট করুন"
                                                        >
                                                            <FaTrash className="text-sm" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Exam;