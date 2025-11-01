import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { FaCalendarAlt, FaArrowLeft, FaSearch, FaDownload, FaEye } from 'react-icons/fa';
import axiosInstance, { baseImageURL } from '../../../../hooks/axiosInstance/axiosInstance';


const AllCirculars = () => {
    const [circulars, setCirculars] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('all');
    const [filterFileType, setFilterFileType] = useState('all');
    const navigate = useNavigate();
    
    const circularsPerPage = 10;

    const categories = [
        'academic',
        'administration', 
        'exam',
        'holiday',
        'event',
        'notice',
        'general'
    ];

    useEffect(() => {
        fetchAllCirculars();
    }, [currentPage, searchTerm, filterCategory, filterFileType]);

    const fetchAllCirculars = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get('/circulars');
            
            if (response.data.success) {
                let filteredCirculars = response.data.data;

                // Active circulars only
                filteredCirculars = filteredCirculars.filter(circular => circular.isActive);

                // Search filter
                if (searchTerm) {
                    filteredCirculars = filteredCirculars.filter(circular =>
                        circular.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        circular.description?.toLowerCase().includes(searchTerm.toLowerCase())
                    );
                }

                // Category filter
                if (filterCategory !== 'all') {
                    filteredCirculars = filteredCirculars.filter(circular => circular.category === filterCategory);
                }

                // File type filter
                if (filterFileType !== 'all') {
                    filteredCirculars = filteredCirculars.filter(circular => {
                        if (filterFileType === 'pdf') return circular.fileType.includes('pdf');
                        if (filterFileType === 'image') return circular.fileType.includes('image');
                        if (filterFileType === 'word') return circular.fileType.includes('word');
                        if (filterFileType === 'excel') return circular.fileType.includes('excel') || circular.fileType.includes('sheet');
                        if (filterFileType === 'text') return circular.fileType.includes('text');
                        return true;
                    });
                }

                // Sort by date (newest first)
                filteredCirculars.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

                // Calculate pagination
                const totalCirculars = filteredCirculars.length;
                setTotalPages(Math.ceil(totalCirculars / circularsPerPage));

                // Get current page circulars
                const startIndex = (currentPage - 1) * circularsPerPage;
                const currentCirculars = filteredCirculars.slice(startIndex, startIndex + circularsPerPage);
                
                setCirculars(currentCirculars);
            }
        } catch (error) {
            console.error('Error fetching circulars:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCircularClick = (circular) => {
        if (circular.filePath) {
            const fileUrl = `${baseImageURL}${circular.filePath}`;
            window.open(fileUrl, '_blank');
        }
    };

    const handleDownload = async (circular, e) => {
        e.stopPropagation();
        try {
            // Increment download count
            await axiosInstance.patch(`/circulars/${circular._id}/download`);
            
            // Create download link
            const link = document.createElement('a');
            link.href = `${baseImageURL}${circular.filePath}`;
            link.download = circular.fileName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            // Refresh list to update download count
            fetchAllCirculars();
        } catch (error) {
            console.error('Error downloading file:', error);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        setCurrentPage(1);
        fetchAllCirculars();
    };

    const handleFilterChange = (filter, value) => {
        if (filter === 'category') setFilterCategory(value);
        if (filter === 'fileType') setFilterFileType(value);
        setCurrentPage(1);
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-BD', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const getFileIcon = (fileType) => {
        if (fileType.includes('pdf')) return '📄';
        if (fileType.includes('image')) return '🖼️';
        if (fileType.includes('word')) return '📝';
        if (fileType.includes('excel') || fileType.includes('sheet')) return '📊';
        if (fileType.includes('text')) return '📃';
        return '📎';
    };

    const getFileTypeName = (fileType) => {
        if (fileType.includes('pdf')) return 'PDF';
        if (fileType.includes('jpeg') || fileType.includes('jpg')) return 'JPEG Image';
        if (fileType.includes('png')) return 'PNG Image';
        if (fileType.includes('word')) return 'Word Document';
        if (fileType.includes('excel') || fileType.includes('sheet')) return 'Excel Document';
        if (fileType.includes('text')) return 'Text File';
        return fileType;
    };

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const renderPagination = () => {
        const pages = [];
        const maxVisiblePages = 5;
        
        let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
        let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
        
        if (endPage - startPage + 1 < maxVisiblePages) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }

        // Previous button
        pages.push(
            <button
                key="prev"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                Previous
            </button>
        );

        // Page numbers
        for (let i = startPage; i <= endPage; i++) {
            pages.push(
                <button
                    key={i}
                    onClick={() => handlePageChange(i)}
                    className={`px-3 py-2 rounded-lg border ${
                        currentPage === i
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                    }`}
                >
                    {i}
                </button>
            );
        }

        // Next button
        pages.push(
            <button
                key="next"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                Next
            </button>
        );

        return pages;
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-6xl mx-auto px-4">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                    <div className="flex items-center gap-3">
                        <button 
                            onClick={() => navigate(-1)}
                            className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
                        >
                            <FaArrowLeft />
                            Back
                        </button>
                        <h1 className="text-2xl font-bold text-gray-800">All Circulars</h1>
                    </div>
                    
                    {/* Search and Filter */}
                    <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                        <form onSubmit={handleSearch} className="flex gap-2">
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Search circulars..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-64"
                                />
                                <FaSearch className="absolute left-3 top-3 text-gray-400" />
                            </div>
                            <button
                                type="submit"
                                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                Search
                            </button>
                        </form>
                        
                        <select
                            value={filterCategory}
                            onChange={(e) => handleFilterChange('category', e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="all">All Categories</option>
                            {categories.map(cat => (
                                <option key={cat} value={cat}>
                                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                                </option>
                            ))}
                        </select>

                        <select
                            value={filterFileType}
                            onChange={(e) => handleFilterChange('fileType', e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="all">All File Types</option>
                            <option value="pdf">PDF</option>
                            <option value="image">Images</option>
                            <option value="word">Word Documents</option>
                            <option value="excel">Excel Files</option>
                            <option value="text">Text Files</option>
                        </select>
                    </div>
                </div>

                {/* Circulars List */}
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    {loading ? (
                        <div className="flex justify-center items-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                            <span className="ml-3 text-gray-600">Loading circulars...</span>
                        </div>
                    ) : circulars.length > 0 ? (
                        <>
                            {/* Desktop Table View */}
                            <div className="hidden lg:block overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                File
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Details
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Category
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Stats
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Date
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {circulars.map((circular) => (
                                            <tr 
                                                key={circular._id}
                                                className="hover:bg-gray-50 cursor-pointer"
                                            >
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="text-2xl">
                                                            {getFileIcon(circular.fileType)}
                                                        </div>
                                                        <div>
                                                            <div className="text-sm font-medium text-gray-900">
                                                                {circular.fileName}
                                                            </div>
                                                            <div className="text-sm text-gray-500">
                                                                {getFileTypeName(circular.fileType)}
                                                            </div>
                                                            <div className="text-xs text-gray-400">
                                                                {formatFileSize(circular.fileSize)}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {circular.title}
                                                    </div>
                                                    {circular.description && (
                                                        <div className="text-sm text-gray-500 line-clamp-2">
                                                            {circular.description}
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                                                        {circular.category}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    <div className="flex items-center gap-4">
                                                        <div className="flex items-center gap-1">
                                                            <FaEye className="text-xs" />
                                                            {circular.views || 0}
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            <FaDownload className="text-xs" />
                                                            {circular.downloads || 0}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    <div className="flex items-center gap-1">
                                                        <FaCalendarAlt className="text-xs" />
                                                        {formatDate(circular.createdAt)}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                    <button
                                                        onClick={() => handleCircularClick(circular)}
                                                        className="text-blue-600 hover:text-blue-900 mr-3"
                                                    >
                                                        View
                                                    </button>
                                                    <button
                                                        onClick={(e) => handleDownload(circular, e)}
                                                        className="text-green-600 hover:text-green-900"
                                                    >
                                                        Download
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Mobile Card View */}
                            <div className="lg:hidden">
                                <div className="p-4 space-y-4">
                                    {circulars.map((circular) => (
                                        <div 
                                            key={circular._id}
                                            onClick={() => handleCircularClick(circular)}
                                            className="bg-white p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-md cursor-pointer transition-all duration-200"
                                        >
                                            <div className="flex items-start gap-3 mb-3">
                                                <div className="text-2xl">
                                                    {getFileIcon(circular.fileType)}
                                                </div>
                                                <div className="flex-1">
                                                    <h3 className="font-medium text-gray-900">
                                                        {circular.title}
                                                    </h3>
                                                    <p className="text-sm text-gray-600 mt-1">
                                                        {circular.fileName}
                                                    </p>
                                                </div>
                                            </div>
                                            
                                            <div className="flex flex-wrap items-center gap-2 mb-3">
                                                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                                                    {circular.category}
                                                </span>
                                                <span className="text-xs text-gray-500">
                                                    {getFileTypeName(circular.fileType)}
                                                </span>
                                                <span className="text-xs text-gray-500">
                                                    {formatFileSize(circular.fileSize)}
                                                </span>
                                            </div>

                                            <div className="flex justify-between items-center text-sm text-gray-500">
                                                <div className="flex items-center gap-1">
                                                    <FaCalendarAlt className="text-xs" />
                                                    {formatDate(circular.createdAt)}
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <div className="flex items-center gap-1">
                                                        <FaEye className="text-xs" />
                                                        {circular.views || 0}
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <FaDownload className="text-xs" />
                                                        {circular.downloads || 0}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex gap-3 mt-3">
                                                <button
                                                    onClick={() => handleCircularClick(circular)}
                                                    className="flex-1 py-2 text-center text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50"
                                                >
                                                    View
                                                </button>
                                                <button
                                                    onClick={(e) => handleDownload(circular, e)}
                                                    className="flex-1 py-2 text-center text-green-600 border border-green-600 rounded-lg hover:bg-green-50"
                                                >
                                                    Download
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="px-6 py-4 border-t border-gray-200">
                                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                                        <div className="text-sm text-gray-600">
                                            Showing {(currentPage - 1) * circularsPerPage + 1} to{' '}
                                            {Math.min(currentPage * circularsPerPage, circulars.length + (currentPage - 1) * circularsPerPage)} of{' '}
                                            {circulars.length + (currentPage - 1) * circularsPerPage} results
                                        </div>
                                        <div className="flex gap-2 flex-wrap justify-center">
                                            {renderPagination()}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="text-center py-12">
                            <div className="text-gray-400 text-6xl mb-4">📋</div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No circulars found</h3>
                            <p className="text-gray-500">
                                {searchTerm || filterCategory !== 'all' || filterFileType !== 'all'
                                    ? 'Try changing your search or filter criteria'
                                    : 'No circulars have been published yet'
                                }
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AllCirculars;