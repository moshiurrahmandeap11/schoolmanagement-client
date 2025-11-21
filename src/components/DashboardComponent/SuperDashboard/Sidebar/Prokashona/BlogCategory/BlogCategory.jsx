import { useEffect, useState } from 'react';
import axiosInstance from '../../../../../../hooks/axiosInstance/axiosInstance';
import MainButton from '../../../../../sharedItems/Mainbutton/Mainbutton';
import AddBlogCategory from './AddBlogCategory/AddBlogCategory';


const BlogCategory = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);

    // Fetch categories
    const fetchCategories = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get('/blog-category');
            if (response.data && response.data.success) {
                setCategories(response.data.data || []);
            } else {
                setError('ব্লগ ক্যাটাগরি লোড করতে সমস্যা হয়েছে');
            }
        } catch (err) {
            setError('ব্লগ ক্যাটাগরি লোড করতে সমস্যা হয়েছে');
            console.error('Error fetching categories:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    // Handle delete category
    const handleDeleteCategory = async (id) => {
        if (!window.confirm('আপনি কি এই ব্লগ ক্যাটাগরি ডিলিট করতে চান?')) {
            return;
        }

        try {
            const response = await axiosInstance.delete(`/blog-category/${id}`);
            if (response.data && response.data.success) {
                fetchCategories(); // Refresh list
            } else {
                setError('ব্লগ ক্যাটাগরি ডিলিট করতে সমস্যা হয়েছে');
            }
        } catch (err) {
            setError('ব্লগ ক্যাটাগরি ডিলিট করতে সমস্যা হয়েছে');
            console.error('Error deleting category:', err);
        }
    };

    // Handle edit category
    const handleEditCategory = (category) => {
        setEditingCategory(category);
        setShowAddForm(true);
    };

    // Handle form close
    const handleFormClose = () => {
        setShowAddForm(false);
        setEditingCategory(null);
        fetchCategories(); // Refresh list
    };

    // Format date in Bengali
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('bn-BD', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    // যদি ফর্ম শো করতে হয়
    if (showAddForm) {
        return (
            <AddBlogCategory 
                category={editingCategory}
                onClose={handleFormClose}
            />
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-full mx-auto">
                <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                    {/* Header */}
                    <div className="px-6 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                            <h1 className="text-2xl font-bold ">
                                ব্লগ ক্যাটাগরি
                            </h1>
                        </div>
                        <MainButton
                            onClick={() => setShowAddForm(true)}
                        >
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
                            </svg>
                            <span>নতুন ব্লগ ক্যাটাগরি</span>
                        </MainButton>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                        {error && (
                            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                                {error}
                            </div>
                        )}

                        {loading ? (
                            <div className="flex justify-center items-center py-12">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                            </div>
                        ) : categories.length === 0 ? (
                            <div className="text-center py-12">
                                <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                                </svg>
                                <h3 className="text-lg font-medium text-gray-900 mb-2">কোন ব্লগ ক্যাটাগরি নেই</h3>
                                <p className="text-gray-500 mb-4">এখনও কোন ব্লগ ক্যাটাগরি যোগ করা হয়নি</p>
                                <button
                                    onClick={() => setShowAddForm(true)}
                                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200"
                                >
                                    প্রথম ক্যাটাগরি যোগ করুন
                                </button>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                ব্লগ ক্যাটাগরী নাম
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                স্লাগ
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                তৈরি হয়েছে
                                            </th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                কাজ
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {categories.map((category) => (
                                            <tr key={category._id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {category.name}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded inline-block">
                                                        {category.slug}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-500">
                                                        {formatDate(category.createdAt)}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <div className="flex justify-end space-x-3">
                                                        <button
                                                            onClick={() => handleEditCategory(category)}
                                                            className="text-blue-600 hover:text-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded px-3 py-1 bg-blue-50 hover:bg-blue-100 transition-colors duration-200"
                                                        >
                                                            এডিট
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteCategory(category._id)}
                                                            className="text-red-600 hover:text-red-900 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 rounded px-3 py-1 bg-red-50 hover:bg-red-100 transition-colors duration-200"
                                                        >
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

                        {/* Summary */}
                        {categories.length > 0 && (
                            <div className="mt-6 bg-gray-50 border border-gray-200 rounded-lg p-4">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-[#1e90c9]">{categories.length}</div>
                                        <div className="text-gray-600">মোট ক্যাটাগরি</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-[#1e90c9]">
                                            {new Set(categories.map(cat => cat.slug)).size}
                                        </div>
                                        <div className="text-gray-600">ইউনিক স্লাগ</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-[#1e90c9]">
                                            {Math.ceil(categories.reduce((acc, cat) => acc + cat.name.length, 0) / categories.length) || 0}
                                        </div>
                                        <div className="text-gray-600">গড় নামের দৈর্ঘ্য</div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BlogCategory;