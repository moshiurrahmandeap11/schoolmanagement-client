import { useEffect, useState } from 'react';
import { FaArrowLeft, FaEdit, FaPlus, FaTrash } from 'react-icons/fa';
import Swal from 'sweetalert2';
import axiosInstance from '../../../../../../../hooks/axiosInstance/axiosInstance';
import Loader from '../../../../../../sharedItems/Loader/Loader';
import MainButton from '../../../../../../sharedItems/Mainbutton/Mainbutton';
import AddGrading from './AddGrading/AddGrading';


const Grading = ({ onBack }) => {
    const [gradingSystems, setGradingSystems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingGrading, setEditingGrading] = useState(null);

    useEffect(() => {
        if (!showAddForm) {
            fetchGradingSystems();
        }
    }, [showAddForm]);

    const fetchGradingSystems = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get('/grading');
            
            if (response.data.success) {
                setGradingSystems(response.data.data || []);
            }
        } catch (error) {
            console.error('Error fetching grading systems:', error);
            showSweetAlert('error', 'গ্রেডিং সিস্টেম লোড করতে সমস্যা হয়েছে');
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

    const handleEdit = (grading) => {
        setEditingGrading(grading);
        setShowAddForm(true);
    };

    const handleDelete = async (gradingId) => {
        const result = await Swal.fire({
            title: 'আপনি কি নিশ্চিত?',
            text: "এই গ্রেডিং সিস্টেমটি ডিলিট হয়ে যাবে!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'হ্যাঁ, ডিলিট করুন!',
            cancelButtonText: 'বাতিল করুন'
        });

        if (result.isConfirmed) {
            try {
                const response = await axiosInstance.delete(`/grading/${gradingId}`);
                if (response.data.success) {
                    showSweetAlert('success', 'গ্রেডিং সিস্টেম সফলভাবে ডিলিট হয়েছে');
                    fetchGradingSystems();
                }
            } catch (error) {
                console.error('Error deleting grading system:', error);
                showSweetAlert('error', 'গ্রেডিং সিস্টেম ডিলিট করতে সমস্যা হয়েছে');
            }
        }
    };

    const handleAddNew = () => {
        setEditingGrading(null);
        setShowAddForm(true);
    };

    const handleBackToList = () => {
        setShowAddForm(false);
        setEditingGrading(null);
    };

    if (showAddForm) {
        return (
            <AddGrading 
                grading={editingGrading}
                onBack={handleBackToList}
                onSuccess={() => {
                    setShowAddForm(false);
                    setEditingGrading(null);
                    fetchGradingSystems();
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
                            গ্রেডিং ব্যবস্থাপনা
                        </h1>
                    </div>
                    <MainButton
                        onClick={handleAddNew}
                    >
                        <FaPlus className="text-sm mr-2" />
                        নতুন গ্রেডিং
                    </MainButton>
                </div>
            </div>

            {/* Main Content */}
            <div className="p-4 sm:p-6 lg:p-8">
                <div className="max-w-full mx-auto">
                    {loading ? (
                        <div className="flex justify-center items-center py-12">
                            <Loader />
                            <p className="text-gray-600 ml-3">গ্রেডিং সিস্টেম লোড হচ্ছে...</p>
                        </div>
                    ) : gradingSystems.length === 0 ? (
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 text-center">
                            <div className="text-4xl text-gray-400 mb-3">📊</div>
                            <h3 className="text-lg font-semibold text-gray-800 mb-2">
                                কোন গ্রেডিং সিস্টেম পাওয়া যায়নি
                            </h3>
                            <p className="text-gray-600 text-sm mb-4">
                                নতুন গ্রেডিং সিস্টেম তৈরি করুন
                            </p>
                            <button
                                onClick={handleAddNew}
                                className="inline-flex items-center gap-2 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
                            >
                                <FaPlus className="text-sm" />
                                নতুন গ্রেডিং তৈরি করুন
                            </button>
                        </div>
                    ) : (
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                            {/* Table Header */}
                            <div className="px-6 py-4 border-b border-gray-200">
                                <h2 className="text-lg font-semibold text-gray-800">
                                    গ্রেডিং সিস্টেম তালিকা ({gradingSystems.length}টি)
                                </h2>
                            </div>

                            {/* Table */}
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50 border-b border-gray-200">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                নাম
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                মোট নাম্বার
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                পাস মার্কস
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                বিশেষ গ্রেডিং
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                অ্যাকশন
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {gradingSystems.map((grading) => (
                                            <tr key={grading._id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div>
                                                        <p className="font-medium text-gray-800 text-sm">
                                                            {grading.name}
                                                        </p>
                                                        <p className="text-xs text-gray-500">
                                                            {grading.gradeRanges?.length || 0}টি গ্রেড
                                                        </p>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="text-gray-600 text-sm">
                                                        {grading.totalMarks}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="text-gray-600 text-sm">
                                                        {grading.passMarks}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                        grading.isSpecialGrading 
                                                            ? 'bg-green-100 text-green-800' 
                                                            : 'bg-gray-100 text-gray-800'
                                                    }`}>
                                                        {grading.isSpecialGrading ? 'হ্যাঁ' : 'না'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={() => handleEdit(grading)}
                                                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                            title="এডিট করুন"
                                                        >
                                                            <FaEdit className="text-sm" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(grading._id)}
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

export default Grading;