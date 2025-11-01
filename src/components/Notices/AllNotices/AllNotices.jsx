import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { FaCalendarAlt, FaArrowLeft, FaSearch } from 'react-icons/fa';
import axiosInstance from '../../../hooks/axiosInstance/axiosInstance';

const AllNotices = () => {
    const [notices, setNotices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterPublished, setFilterPublished] = useState('all');
    const navigate = useNavigate();
    
    const noticesPerPage = 10;

    useEffect(() => {
        fetchAllNotices();
    }, [currentPage, searchTerm, filterPublished]);

    const fetchAllNotices = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get('/notices');
            
            if (response.data.success) {
                let filteredNotices = response.data.data;

                // Search filter
                if (searchTerm) {
                    filteredNotices = filteredNotices.filter(notice =>
                        notice.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        notice.body.toLowerCase().includes(searchTerm.toLowerCase())
                    );
                }

                // Published status filter
                if (filterPublished !== 'all') {
                    const isPublished = filterPublished === 'published';
                    filteredNotices = filteredNotices.filter(notice => notice.isPublished === isPublished);
                }

                // Sort by date (newest first)
                filteredNotices.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

                // Calculate pagination
                const totalNotices = filteredNotices.length;
                setTotalPages(Math.ceil(totalNotices / noticesPerPage));

                // Get current page notices
                const startIndex = (currentPage - 1) * noticesPerPage;
                const currentNotices = filteredNotices.slice(startIndex, startIndex + noticesPerPage);
                
                setNotices(currentNotices);
            }
        } catch (error) {
            console.error('Error fetching notices:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleNoticeClick = (id) => {
        navigate(`/notice-details/${id}`);
    };

    const handleSearch = (e) => {
        e.preventDefault();
        setCurrentPage(1);
        fetchAllNotices();
    };

    const handleFilterChange = (e) => {
        setFilterPublished(e.target.value);
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
                        <h1 className="text-2xl font-bold text-gray-800">All Notices</h1>
                    </div>
                    
                    {/* Search and Filter */}
                    <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                        <form onSubmit={handleSearch} className="flex gap-2">
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Search notices..."
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
                            value={filterPublished}
                            onChange={handleFilterChange}
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="all">All Status</option>
                            <option value="published">Published</option>
                            <option value="draft">Draft</option>
                        </select>
                    </div>
                </div>

                {/* Notices List */}
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    {loading ? (
                        <div className="flex justify-center items-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                            <span className="ml-3 text-gray-600">Loading notices...</span>
                        </div>
                    ) : notices.length > 0 ? (
                        <>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Title
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Status
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Date
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Attachment
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {notices.map((notice) => (
                                            <tr 
                                                key={notice._id}
                                                onClick={() => handleNoticeClick(notice._id)}
                                                className="hover:bg-gray-50 cursor-pointer transition-colors duration-150"
                                            >
                                                <td className="px-6 py-4">
                                                    <div className="text-sm font-medium text-gray-900 line-clamp-2">
                                                        {notice.title}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span
                                                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                                            notice.isPublished
                                                                ? 'bg-green-100 text-green-800'
                                                                : 'bg-yellow-100 text-yellow-800'
                                                        }`}
                                                    >
                                                        {notice.isPublished ? 'Published' : 'Draft'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center gap-1 text-sm text-gray-500">
                                                        <FaCalendarAlt className="text-xs" />
                                                        {formatDate(notice.createdAt)}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {notice.attachment ? (
                                                        <span className="text-blue-600">Yes</span>
                                                    ) : (
                                                        <span className="text-gray-400">No</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="px-6 py-4 border-t border-gray-200">
                                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                                        <div className="text-sm text-gray-600">
                                            Showing {(currentPage - 1) * noticesPerPage + 1} to{' '}
                                            {Math.min(currentPage * noticesPerPage, notices.length + (currentPage - 1) * noticesPerPage)} of{' '}
                                            {notices.length + (currentPage - 1) * noticesPerPage} results
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
                            <div className="text-gray-400 text-6xl mb-4">📄</div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No notices found</h3>
                            <p className="text-gray-500">
                                {searchTerm || filterPublished !== 'all' 
                                    ? 'Try changing your search or filter criteria'
                                    : 'No notices have been created yet'
                                }
                            </p>
                        </div>
                    )}
                </div>

                {/* Mobile Card View (Hidden on larger screens) */}
                <div className="lg:hidden mt-6">
                    {!loading && notices.length > 0 && (
                        <div className="space-y-4">
                            {notices.map((notice) => (
                                <div 
                                    key={notice._id}
                                    onClick={() => handleNoticeClick(notice._id)}
                                    className="bg-white p-4 rounded-lg shadow-md border border-gray-200 cursor-pointer hover:shadow-lg transition-shadow duration-200"
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="font-medium text-gray-900 line-clamp-2 flex-1">
                                            {notice.title}
                                        </h3>
                                        <span
                                            className={`ml-2 flex-shrink-0 px-2 py-1 text-xs font-semibold rounded-full ${
                                                notice.isPublished
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-yellow-100 text-yellow-800'
                                            }`}
                                        >
                                            {notice.isPublished ? 'Published' : 'Draft'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm text-gray-500">
                                        <div className="flex items-center gap-1">
                                            <FaCalendarAlt className="text-xs" />
                                            {formatDate(notice.createdAt)}
                                        </div>
                                        <span>
                                            {notice.attachment ? '📎' : ''}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AllNotices;