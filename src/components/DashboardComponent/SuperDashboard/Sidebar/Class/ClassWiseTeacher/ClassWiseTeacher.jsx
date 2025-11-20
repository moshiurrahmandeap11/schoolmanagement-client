import { useEffect, useState } from 'react';
import { FaArrowLeft, FaChalkboardTeacher, FaEdit, FaPlus, FaTrash } from 'react-icons/fa';
import Swal from 'sweetalert2';
import axiosInstance from '../../../../../../hooks/axiosInstance/axiosInstance';
import Loader from '../../../../../sharedItems/Loader/Loader';
import MainButton from '../../../../../sharedItems/Mainbutton/Mainbutton';
import AddNewClassTeacher from './AddNewClassTeacher/AddNewClassTeacher';


const ClassWiseTeacher = ({ onBack }) => {
    const [classTeachers, setClassTeachers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingClassTeacher, setEditingClassTeacher] = useState(null);

    useEffect(() => {
        if (!showAddForm) {
            fetchClassTeachers();
        }
    }, [showAddForm]);

    const fetchClassTeachers = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get('/class-teachers');
            
            if (response.data.success) {
                setClassTeachers(response.data.data || []);
            }
        } catch (error) {
            console.error('Error fetching class teachers:', error);
            showSweetAlert('error', 'শ্রেণী শিক্ষক লোড করতে সমস্যা হয়েছে');
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

    const handleEdit = (classTeacher) => {
        setEditingClassTeacher(classTeacher);
        setShowAddForm(true);
    };

    const handleDelete = async (classTeacherId) => {
        const result = await Swal.fire({
            title: 'আপনি কি নিশ্চিত?',
            text: "এই শ্রেণী শিক্ষক ডিলিট হয়ে যাবে!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'হ্যাঁ, ডিলিট করুন!',
            cancelButtonText: 'বাতিল করুন'
        });

        if (result.isConfirmed) {
            try {
                const response = await axiosInstance.delete(`/class-teachers/${classTeacherId}`);
                if (response.data.success) {
                    showSweetAlert('success', 'শ্রেণী শিক্ষক সফলভাবে ডিলিট হয়েছে');
                    fetchClassTeachers();
                }
            } catch (error) {
                console.error('Error deleting class teacher:', error);
                showSweetAlert('error', 'শ্রেণী শিক্ষক ডিলিট করতে সমস্যা হয়েছে');
            }
        }
    };

    const handleAddNew = () => {
        setEditingClassTeacher(null);
        setShowAddForm(true);
    };

    const handleBackToList = () => {
        setShowAddForm(false);
        setEditingClassTeacher(null);
    };

    if (showAddForm) {
        return (
            <AddNewClassTeacher 
                classTeacher={editingClassTeacher}
                onBack={handleBackToList}
                onSuccess={() => {
                    setShowAddForm(false);
                    setEditingClassTeacher(null);
                    fetchClassTeachers();
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
                            শ্রেণী শিক্ষক ব্যবস্থাপনা
                        </h1>
                    </div>
                    <MainButton
                        onClick={handleAddNew}
                    >
                        <FaPlus className="text-sm mr-2" />
                        শ্রেণী শিক্ষক নিয়োগ দিন
                    </MainButton>
                </div>
            </div>

            {/* Main Content */}
            <div className="p-4 sm:p-6 lg:p-8">
                <div className="max-w-full mx-auto">
                    {loading ? (
                        <div className="flex justify-center items-center py-12">
                            <Loader />
                            <p className="text-gray-600 ml-3">শ্রেণী শিক্ষক লোড হচ্ছে...</p>
                        </div>
                    ) : classTeachers.length === 0 ? (
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 text-center">
                            <div className="text-4xl text-gray-400 mb-3">👨‍🏫</div>
                            <h3 className="text-lg font-semibold text-gray-800 mb-2">
                                কোন শ্রেণী শিক্ষক পাওয়া যায়নি
                            </h3>
                            <p className="text-gray-600 text-sm mb-4">
                                নতুন শ্রেণী শিক্ষক নিয়োগ করুন
                            </p>
                            <MainButton
                                onClick={handleAddNew}
                            >
                                <FaPlus className="text-sm mr-2" />
                                শ্রেণী শিক্ষক নিয়োগ দিন
                            </MainButton>
                        </div>
                    ) : (
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                            {/* Table Header */}
                            <div className="px-6 py-4 border-b border-gray-200">
                                <h2 className="text-lg font-semibold text-gray-800">
                                    শ্রেণী শিক্ষক তালিকা ({classTeachers.length}টি)
                                </h2>
                            </div>

                            {/* Table */}
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50 border-b border-gray-200">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                শিক্ষকের নাম
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                ক্লাস
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                বিষয়
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                স্ট্যাটাস
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                এডিট / ডিলিট
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {classTeachers.map((classTeacher) => (
                                            <tr key={classTeacher._id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                                            <FaChalkboardTeacher className="text-[#1e90c9] text-sm" />
                                                        </div>
                                                        <div>
                                                            <p className="font-medium text-gray-800 text-sm">
                                                                {classTeacher.teacherName}
                                                            </p>
                                                            <p className="text-xs text-gray-500">
                                                                নিয়োগ: {new Date(classTeacher.createdAt).toLocaleDateString('bn-BD')}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="inline-flex px-3 py-1 text-xs font-semibold  rounded-full">
                                                        {classTeacher.className}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="inline-flex px-3 py-1 text-xs font-semibold  rounded-full">
                                                        {classTeacher.subjectName}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span
                                                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                                            classTeacher.isActive 
                                                                ? 'bg-[#1e90c9] text-white' 
                                                                : 'bg-red-100 text-red-800'
                                                        }`}
                                                    >
                                                        {classTeacher.isActive ? 'Active' : 'Inactive'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={() => handleEdit(classTeacher)}
                                                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                            title="এডিট করুন"
                                                        >
                                                            <FaEdit className="text-sm" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(classTeacher._id)}
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

export default ClassWiseTeacher;