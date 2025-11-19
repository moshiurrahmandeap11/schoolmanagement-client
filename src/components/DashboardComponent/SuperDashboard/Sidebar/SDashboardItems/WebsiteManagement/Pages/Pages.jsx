import { useEffect, useState } from 'react';
import { FaEdit, FaPlus, FaTrash } from 'react-icons/fa';
import Swal from 'sweetalert2';
import axiosInstance from '../../../../../../../hooks/axiosInstance/axiosInstance';
import Loader from '../../../../../../sharedItems/Loader/Loader';
import MainButton from '../../../../../../sharedItems/Mainbutton/Mainbutton';
import AddNewPage from './AddNewPage/AddNewPage';


const Pages = () => {
    const [pages, setPages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('list'); // 'list' or 'new'
    const [editingPage, setEditingPage] = useState(null);

    // Fetch pages
    useEffect(() => {
        fetchPages();
    }, []);

    const fetchPages = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get('/pages');
            
            if (response.data.success) {
                setPages(response.data.data || []);
            } else {
                showSweetAlert('error', response.data.message || 'পৃষ্ঠা লোড করতে সমস্যা হয়েছে');
            }
        } catch (error) {
            console.error('Error fetching pages:', error);
            showSweetAlert('error', 'পৃষ্ঠা লোড করতে সমস্যা হয়েছে: ' + error.message);
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
        setEditingPage(null);
        setActiveTab('new');
    };

    const handleEdit = (page) => {
        setEditingPage(page);
        setActiveTab('new');
    };

    const handleDelete = async (pageId) => {
        const result = await Swal.fire({
            title: 'নিশ্চিত?',
            text: "আপনি কি এই পৃষ্ঠাটি মুছে ফেলতে চান?",
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
                const response = await axiosInstance.delete(`/pages/${pageId}`);

                if (response.data.success) {
                    showSweetAlert('success', 'পৃষ্ঠা সফলভাবে মুছে ফেলা হয়েছে!');
                    fetchPages();
                } else {
                    showSweetAlert('error', response.data.message || 'পৃষ্ঠা মুছতে সমস্যা হয়েছে');
                }
            } catch (error) {
                console.error('Error deleting page:', error);
                const errorMessage = error.response?.data?.message || 'পৃষ্ঠা মুছতে সমস্যা হয়েছে';
                showSweetAlert('error', errorMessage);
            } finally {
                setLoading(false);
            }
        }
    };

    const handleBack = () => {
        setActiveTab('list');
        setEditingPage(null);
        fetchPages();
    };

    // Truncate content for table view
    const truncateContent = (content, length = 100) => {
        if (!content) return 'কোন কন্টেন্ট নেই';
        const cleanContent = content.replace(/<[^>]*>/g, '');
        return cleanContent.length > length ? cleanContent.substring(0, length) + '...' : cleanContent;
    };

    // If activeTab is 'new', show AddNewPage component
    if (activeTab === 'new') {
        return (
            <AddNewPage 
                editingPage={editingPage}
                onBack={handleBack}
            />
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Main Content */}
            <div className="p-4 sm:p-6 lg:p-8">
                <div className="max-w-full mx-auto">

                    {/* Add New Button */}
                    <div className="flex justify-end mb-6">
                        <MainButton
                            onClick={handleAddNew}
                        >
                            <FaPlus className="text-sm" />
                            নতুন পৃষ্ঠা
                        </MainButton>
                    </div>

                    {/* Pages List */}
                    <div className="bg-white rounded-lg shadow border border-gray-200">
                        {/* Loading State */}
                        {loading && (
                            <div className="p-8 text-center">
                                <Loader />
                                <p className="text-gray-600 mt-2 text-sm">পৃষ্ঠা লোড হচ্ছে...</p>
                            </div>
                        )}

                        {/* Empty State */}
                        {!loading && pages.length === 0 && (
                            <div className="p-8 text-center">
                                <div className="text-4xl mb-3">📄</div>
                                <h3 className="text-lg font-semibold text-gray-800 mb-2">কোন পৃষ্ঠা পাওয়া যায়নি</h3>
                                <p className="text-gray-600 mb-4 text-sm">আপনার প্রথম পৃষ্ঠা তৈরি করুন।</p>
                                <button
                                    onClick={handleAddNew}
                                    className="px-5 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
                                >
                                    পৃষ্ঠা তৈরি করুন
                                </button>
                            </div>
                        )}

                        {/* Pages Table */}
                        {!loading && pages.length > 0 && (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50 border-b border-gray-200">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">পৃষ্ঠা নাম</th>
                                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">বিবরণ</th>
                                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">কন্টেন্ট</th>
                                            <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">একশন্স</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {pages.map((page) => (
                                            <tr key={page._id} className="hover:bg-gray-50">
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                                            <span className="text-blue-600 font-semibold text-sm">
                                                                {page.name.charAt(0).toUpperCase()}
                                                            </span>
                                                        </div>
                                                        <div>
                                                            <p className="font-medium text-gray-800 text-sm">{page.name}</p>
                                                            <p className="text-xs text-gray-500">
                                                                তৈরি: {new Date(page.createdAt).toLocaleDateString('bn-BD')}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <p className="text-sm text-gray-600 leading-relaxed max-w-xs">
                                                        {page.description || 'কোন বিবরণ নেই'}
                                                    </p>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <p className="text-sm text-gray-600 leading-relaxed max-w-md">
                                                        {truncateContent(page.data)}
                                                    </p>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex gap-2 justify-center">
                                                        <button
                                                            onClick={() => handleEdit(page)}
                                                            className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors text-xs flex items-center gap-1"
                                                        >
                                                            <FaEdit className="text-xs" />
                                                            এডিট
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(page._id)}
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
                    {pages.length > 0 && (
                        <div className="mt-4 text-sm text-gray-600">
                            মোট পৃষ্ঠা: {pages.length}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Pages;