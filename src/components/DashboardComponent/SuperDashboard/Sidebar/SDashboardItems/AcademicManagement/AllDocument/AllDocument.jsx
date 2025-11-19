import { useEffect, useState } from 'react';
import { FaArrowLeft, FaDownload, FaEye, FaFilter, FaFolder, FaPlus, FaSearch, FaTrash, FaUpload } from 'react-icons/fa';
import Swal from 'sweetalert2';
import axiosInstance, { baseImageURL } from '../../../../../../../hooks/axiosInstance/axiosInstance';
import Loader from '../../../../../../sharedItems/Loader/Loader';
import MainButton from '../../../../../../sharedItems/Mainbutton/Mainbutton';
import BulkDocument from '../BulkDocument/BulkDocument';
import Categories from '../Category/Category';
import NewDocument from '../NewDocument/NewDocument';

const AllDocument = ({ onBack }) => {
    const [activeComponent, setActiveComponent] = useState('list'); // 'list', 'new', 'bulk', 'categories'
    const [loading, setLoading] = useState(true);
    const [documents, setDocuments] = useState([]);
    const [categories, setCategories] = useState([]);
    const [filteredDocuments, setFilteredDocuments] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');

    // Fetch documents and categories
    useEffect(() => {
        if (activeComponent === 'list') {
            fetchDocuments();
            fetchCategories();
        }
    }, [activeComponent]);

    // Filter documents when search term or category changes
    useEffect(() => {
        let filtered = documents;

        // Filter by search term
        if (searchTerm) {
            filtered = filtered.filter(doc =>
                doc.title.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Filter by category
        if (selectedCategory) {
            filtered = filtered.filter(doc =>
                doc.category === selectedCategory
            );
        }

        setFilteredDocuments(filtered);
    }, [documents, searchTerm, selectedCategory]);

    const fetchDocuments = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get('/documents');
            
            if (response.data.success) {
                setDocuments(response.data.data || []);
            } else {
                showSweetAlert('error', response.data.message || 'ডকুমেন্ট লোড করতে সমস্যা হয়েছে');
            }
        } catch (error) {
            console.error('Error fetching documents:', error);
            showSweetAlert('error', 'ডকুমেন্ট লোড করতে সমস্যা হয়েছে: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await axiosInstance.get('/document-categories');
            if (response.data.success) {
                setCategories(response.data.data || []);
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
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

    const handleSearch = (e) => {
        if (e.key === 'Enter') {
            // Search is already handled in useEffect
        }
    };

    const handleFilter = () => {
        // Filter is already handled in useEffect
    };

    const handleDelete = async (documentId, documentTitle) => {
        const result = await Swal.fire({
            title: 'নিশ্চিত?',
            text: `আপনি কি "${documentTitle}" ডকুমেন্টটি মুছে ফেলতে চান?`,
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
                const response = await axiosInstance.delete(`/documents/${documentId}`);

                if (response.data.success) {
                    showSweetAlert('success', 'ডকুমেন্ট সফলভাবে মুছে ফেলা হয়েছে!');
                    fetchDocuments();
                } else {
                    showSweetAlert('error', response.data.message || 'ডকুমেন্ট মুছতে সমস্যা হয়েছে');
                }
            } catch (error) {
                console.error('Error deleting document:', error);
                const errorMessage = error.response?.data?.message || 'ডকুমেন্ট মুছতে সমস্যা হয়েছে';
                showSweetAlert('error', errorMessage);
            } finally {
                setLoading(false);
            }
        }
    };

    const handleDownload = async (document) => {
        try {
            // Increment download count
            await axiosInstance.patch(`/documents/${document._id}/download`);
            
            // Create download link
            const link = document.filePath.startsWith('http') 
                ? document.filePath 
                : `${baseImageURL}${document.filePath}`;
            
            window.open(link, '_blank');
            
            showSweetAlert('success', 'ডকুমেন্ট ডাউনলোড শুরু হয়েছে');
        } catch (error) {
            console.error('Error downloading document:', error);
            showSweetAlert('error', 'ডকুমেন্ট ডাউনলোড করতে সমস্যা হয়েছে');
        }
    };

    const getCategoryName = (categoryId) => {
        const category = categories.find(cat => cat._id === categoryId);
        return category ? category.name : 'N/A';
    };

    const getFileIcon = (fileType) => {
        if (fileType.startsWith('image/')) return '🖼️';
        if (fileType.includes('pdf')) return '📕';
        if (fileType.includes('word') || fileType.includes('document')) return '📘';
        if (fileType.includes('excel') || fileType.includes('spreadsheet')) return '📗';
        if (fileType.includes('powerpoint') || fileType.includes('presentation')) return '📙';
        return '📄';
    };

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const handleBackToList = () => {
        setActiveComponent('list');
    };

    // Render different components based on activeComponent
    if (activeComponent === 'new') {
        return <NewDocument onBack={handleBackToList} />;
    }

    if (activeComponent === 'bulk') {
        return <BulkDocument onBack={handleBackToList} />;
    }

    if (activeComponent === 'categories') {
        return <Categories onBack={handleBackToList} />;
    }

    // Main list view
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
                        সকল ডকুমেন্ট
                    </h1>
                </div>
            </div>

            {/* Main Content */}
            <div className="p-4 sm:p-6 lg:p-8">
                <div className="max-w-full mx-auto">
                    {/* Search and Filter Section */}
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 mb-6">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
                            {/* Search by Title */}
                            <div className="relative">
                                <label className="block text-gray-700 font-medium mb-2 text-sm">
                                    শিরোনাম দ্বারা খুঁজুন
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        onKeyPress={handleSearch}
                                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9] focus:border-transparent transition-colors"
                                        placeholder="শিরোনাম লিখে Enter চাপুন..."
                                    />
                                    <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                </div>
                            </div>

                            {/* Categories Dropdown */}
                            <div>
                                <label className="block text-gray-700 font-medium mb-2 text-sm">
                                    ক্যাটাগরী দ্বারা ফিল্টার
                                </label>
                                <select
                                    value={selectedCategory}
                                    onChange={(e) => setSelectedCategory(e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9] focus:border-transparent transition-colors"
                                >
                                    <option value="">সকল ক্যাটাগরী</option>
                                    {categories.map(category => (
                                        <option key={category._id} value={category._id}>
                                            {category.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Filter Button */}
                            <div className="flex items-end">
                                <MainButton
                                    onClick={handleFilter}
                                    className="w-full px-4 py-3 rounded-md transition-colors font-medium flex items-center justify-center gap-2"
                                >
                                    <FaFilter className="text-sm" />
                                    ফিল্টার প্রয়োগ করুন
                                </MainButton>
                            </div>
                        </div>

                        {/* Action Buttons - এই বাটনগুলোতে ক্লিক করলে respective কম্পোনেন্ট render হবে */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <MainButton
                                onClick={() => setActiveComponent('new')}
                                className='flex items-center  justify-center'
                            >
                                <FaPlus className="text-sm mr-2" />
                                Upload Document
                            </MainButton>
                            <MainButton
                                onClick={() => setActiveComponent('bulk')}
                                className="flex items-center justify-center"
                            >
                                <FaUpload className="text-sm mr-2" />
                                Bulk Upload
                            </MainButton>
                            <MainButton
                                onClick={() => setActiveComponent('categories')}
                                className="flex items-center justify-center"
                            >
                                <FaFolder className="text-sm mr-2" />
                                Categories
                            </MainButton>
                        </div>
                    </div>

                    {/* Documents Table */}
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-200">
                        {/* Loading State */}
                        {loading && (
                            <Loader></Loader>
                        )}

                        {/* Empty State */}
                        {!loading && filteredDocuments.length === 0 && (
                            <div className="p-8 text-center">
                                <div className="text-4xl mb-3">📁</div>
                                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                                    {documents.length === 0 ? 'কোন ডকুমেন্ট পাওয়া যায়নি' : 'ফিল্টারে কোন ডকুমেন্ট পাওয়া যায়নি'}
                                </h3>
                                <p className="text-gray-600 mb-4 text-sm">
                                    {documents.length === 0 
                                        ? 'আপনার প্রথম ডকুমেন্ট তৈরি করুন।' 
                                        : 'অন্যান্য ফিল্টার চেষ্টা করুন।'
                                    }
                                </p>
                                <MainButton
                                    onClick={() => setActiveComponent('new')}
                                >
                                    ডকুমেন্ট তৈরি করুন
                                </MainButton>
                            </div>
                        )}

                        {/* Documents Table */}
                        {!loading && filteredDocuments.length > 0 && (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50 border-b border-gray-200">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">শিরোনাম</th>
                                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">ক্যাটাগরী</th>
                                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">দেখার সুযোগ</th>
                                            <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {filteredDocuments.map((document) => (
                                            <tr key={document._id} className="hover:bg-gray-50">
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center shrink-0">
                                                            <span className="text-[#1e90c9] text-lg">
                                                                {getFileIcon(document.fileType)}
                                                            </span>
                                                        </div>
                                                        <div className="min-w-0 flex-1">
                                                            <p className="font-medium text-gray-800 text-sm truncate">
                                                                {document.title}
                                                            </p>
                                                            <div className="flex flex-wrap gap-2 mt-1">
                                                                <span className="text-xs text-gray-500">
                                                                    {document.fileName}
                                                                </span>
                                                                <span className="text-xs text-gray-400">
                                                                    {formatFileSize(document.fileSize)}
                                                                </span>
                                                                <span className="text-xs text-gray-400">
                                                                    ডাউনলোড: {document.downloads || 0}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#1e90c9] text-white">
                                                        {getCategoryName(document.category)}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-2">
                                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                            document.isActive 
                                                                ? 'bg-green-100 text-green-800' 
                                                                : 'bg-red-100 text-red-800'
                                                        }`}>
                                                            <FaEye className="mr-1 text-xs" />
                                                            {document.isActive ? 'সক্রিয়' : 'নিষ্ক্রিয়'}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex gap-2 justify-center">
                                                        <button
                                                            onClick={() => handleDownload(document)}
                                                            className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 transition-colors text-xs flex items-center gap-1"
                                                            title="ডাউনলোড করুন"
                                                        >
                                                            <FaDownload className="text-xs" />
                                                            ডাউনলোড
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(document._id, document.title)}
                                                            className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors text-xs flex items-center gap-1"
                                                            title="ডিলিট করুন"
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

                    {/* Summary and Pagination */}
                    {!loading && filteredDocuments.length > 0 && (
                        <div className="mt-4 flex flex-col sm:flex-row justify-between items-center gap-4">
                            <div className="text-sm text-gray-600">
                                মোট ডকুমেন্ট: {filteredDocuments.length} / {documents.length}
                                {selectedCategory && (
                                    <span className="ml-2">
                                        (ফিল্টার: {getCategoryName(selectedCategory)})
                                    </span>
                                )}
                            </div>
                            
                            {/* Simple Pagination - You can enhance this later */}
                            <div className="flex gap-2">
                                <button className="px-3 py-1 border border-gray-300 rounded text-sm text-gray-600 hover:bg-gray-50">
                                    পূর্ববর্তী
                                </button>
                                <button className="px-3 py-1 border border-gray-300 rounded text-sm text-gray-600 hover:bg-gray-50">
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

export default AllDocument;