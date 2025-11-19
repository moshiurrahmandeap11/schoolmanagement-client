import { useEffect, useState } from 'react';
import { FaEdit, FaPlus, FaTrash } from 'react-icons/fa';
import Swal from 'sweetalert2';
import axiosInstance from '../../../../../../../hooks/axiosInstance/axiosInstance';
import Loader from '../../../../../../sharedItems/Loader/Loader';
import MainButton from '../../../../../../sharedItems/Mainbutton/Mainbutton';
import AddNewDocumentCategory from './AddNewDocumentCategory/AddNewDocumentCategory';


const Category = ({ onBack }) => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('list'); // 'list' or 'new'
    const [editingCategory, setEditingCategory] = useState(null);

    // Fetch categories
    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get('/document-categories');
            
            if (response.data.success) {
                setCategories(response.data.data || []);
            } else {
                showSweetAlert('error', response.data.message || 'ক্যাটাগরী লোড করতে সমস্যা হয়েছে');
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
            showSweetAlert('error', 'ক্যাটাগরী লোড করতে সমস্যা হয়েছে: ' + error.message);
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

    const handleAddNew = () => {
        setEditingCategory(null);
        setActiveTab('new');
    };

    const handleEdit = (category) => {
        setEditingCategory(category);
        setActiveTab('new');
    };

    const handleDelete = async (categoryId) => {
        const result = await Swal.fire({
            title: 'নিশ্চিত?',
            text: "আপনি কি এই ক্যাটাগরীটি মুছে ফেলতে চান?",
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
                const response = await axiosInstance.delete(`/document-categories/${categoryId}`);

                if (response.data.success) {
                    showSweetAlert('success', 'ক্যাটাগরী সফলভাবে মুছে ফেলা হয়েছে!');
                    fetchCategories();
                } else {
                    showSweetAlert('error', response.data.message || 'ক্যাটাগরী মুছতে সমস্যা হয়েছে');
                }
            } catch (error) {
                console.error('Error deleting category:', error);
                const errorMessage = error.response?.data?.message || 'ক্যাটাগরী মুছতে সমস্যা হয়েছে';
                showSweetAlert('error', errorMessage);
            } finally {
                setLoading(false);
            }
        }
    };

    const handleBack = () => {
        setActiveTab('list');
        setEditingCategory(null);
        fetchCategories();
    };

    // If activeTab is 'new', show AddNewDocumentCategory component
    if (activeTab === 'new') {
        return (
            <AddNewDocumentCategory 
                editingCategory={editingCategory}
                onBack={handleBack}
            />
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Main Content */}
            <div className="p-4 sm:p-6 lg:p-8">
                <div className="max-w-full mx-auto">

                    {/* Header with Back Button */}
                    <div className="flex justify-between items-center mb-6">
                        <button
                            onClick={onBack}
                            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 font-medium flex items-center gap-2"
                        >
                            একাডেমিক ব্যবস্থাপনায় ফিরে যান
                        </button>
                        
                        <MainButton
                            onClick={handleAddNew}
                        >
                            <FaPlus className="text-sm" />
                            Add Document Category
                        </MainButton>
                    </div>

                    {/* Categories List */}
                    <div className="bg-white rounded-lg shadow border border-gray-200">
                        {/* Loading State */}
                        {loading && (
                            <Loader></Loader>
                        )}

                        {/* Empty State */}
                        {!loading && categories.length === 0 && (
                            <div className="p-8 text-center">
                                <div className="text-4xl mb-3">📁</div>
                                <h3 className="text-lg font-semibold text-gray-800 mb-2">কোন ক্যাটাগরী পাওয়া যায়নি</h3>
                                <p className="text-gray-600 mb-4 text-sm">আপনার প্রথম ক্যাটাগরী তৈরি করুন।</p>
                                <MainButton
                                    onClick={handleAddNew}
                                >
                                    ক্যাটাগরী তৈরি করুন
                                </MainButton>
                            </div>
                        )}

                        {/* Categories Table */}
                        {!loading && categories.length > 0 && (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50 border-b border-gray-200">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">নাম</th>
                                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">বিবরণ</th>
                                            <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {categories.map((category) => (
                                            <tr key={category._id} className="hover:bg-gray-50">
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center shrink-0">
                                                            <span className="text-[#1e90c9] font-semibold text-sm">
                                                                📁
                                                            </span>
                                                        </div>
                                                        <div>
                                                            <p className="font-medium text-gray-800 text-sm">{category.name}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <p className="text-sm text-gray-600 leading-relaxed max-w-md">
                                                        {category.description || 'কোন বিবরণ নেই'}
                                                    </p>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex gap-2 justify-center">
                                                        <button
                                                            onClick={() => handleEdit(category)}
                                                            className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors text-xs flex items-center gap-1"
                                                        >
                                                            <FaEdit className="text-xs" />
                                                            এডিট
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(category._id)}
                                                            className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors text-xs flex items-center gap-1"
                                                        >
                                                            <FaTrash className="text-xs" />
                                                            ডিলিট
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

                    {/* Summary */}
                    {categories.length > 0 && (
                        <div className="mt-4 text-sm text-gray-600">
                            মোট ক্যাটাগরী: {categories.length}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Category;