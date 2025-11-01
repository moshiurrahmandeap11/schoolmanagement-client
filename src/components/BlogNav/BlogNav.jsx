import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import axiosInstance, { baseImageURL } from '../../hooks/axiosInstance/axiosInstance';
import Loader from '../sharedItems/Loader/Loader';

const BlogNav = () => {
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const blogsPerPage = 9;
    const navigate = useNavigate();

    useEffect(() => {
        fetchBlogs();
    }, [currentPage, searchTerm]);

    const fetchBlogs = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get(
                `/blogs?page=${currentPage}&limit=${blogsPerPage}&search=${searchTerm}`
            );
            
            if (response.data.success) {
                setBlogs(response.data.data || []);
                setTotalPages(response.data.pagination?.totalPages || 1);
            } else {
                setError('Failed to load blogs');
            }
        } catch (error) {
            console.error('Error fetching blogs:', error);
            setError('Failed to load blogs');
        } finally {
            setLoading(false);
        }
    };

    const handleBlogClick = (blogId) => {
        navigate(`/blog-details/${blogId}`);
    };

    const truncateContent = (htmlContent, maxLength = 120) => {
        if (!htmlContent) return 'কোন কন্টেন্ট নেই';
        
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = htmlContent;
        const text = tempDiv.textContent || tempDiv.innerText || '';
        
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    };

    const calculateReadTime = (content) => {
        if (!content) return 1;
        const wordCount = content.split(/\s+/).length;
        return Math.max(1, Math.ceil(wordCount / 200));
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'তারিখ নেই';
        
        try {
            return new Date(dateString).toLocaleDateString('bn-BD', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        } catch (error) {
            return 'তারিখ নেই';
        }
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1);
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
        if (currentPage > 1) {
            pages.push(
                <button
                    key="prev"
                    onClick={() => handlePageChange(currentPage - 1)}
                    className="px-3 py-2 sm:px-4 sm:py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                >
                    ← পূর্ববর্তী
                </button>
            );
        }

        // First page
        if (startPage > 1) {
            pages.push(
                <button
                    key={1}
                    onClick={() => handlePageChange(1)}
                    className="px-3 py-2 sm:px-4 sm:py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                >
                    1
                </button>
            );
            if (startPage > 2) {
                pages.push(
                    <span key="ellipsis1" className="px-2 py-2 text-gray-500">
                        ...
                    </span>
                );
            }
        }

        // Page numbers
        for (let i = startPage; i <= endPage; i++) {
            pages.push(
                <button
                    key={i}
                    onClick={() => handlePageChange(i)}
                    className={`px-3 py-2 sm:px-4 sm:py-2 rounded-lg transition-colors text-sm font-medium ${
                        currentPage === i
                            ? 'bg-blue-500 text-white shadow-lg'
                            : 'bg-white border border-gray-300 hover:bg-gray-50'
                    }`}
                >
                    {i}
                </button>
            );
        }

        // Last page
        if (endPage < totalPages) {
            if (endPage < totalPages - 1) {
                pages.push(
                    <span key="ellipsis2" className="px-2 py-2 text-gray-500">
                        ...
                    </span>
                );
            }
            pages.push(
                <button
                    key={totalPages}
                    onClick={() => handlePageChange(totalPages)}
                    className="px-3 py-2 sm:px-4 sm:py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                >
                    {totalPages}
                </button>
            );
        }

        // Next button
        if (currentPage < totalPages) {
            pages.push(
                <button
                    key="next"
                    onClick={() => handlePageChange(currentPage + 1)}
                    className="px-3 py-2 sm:px-4 sm:py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                >
                    পরবর্তী →
                </button>
            );
        }

        return pages;
    };

    if (loading) {
        return <Loader />;
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-lg shadow-sm border border-red-200 p-8 text-center max-w-md w-full">
                    <div className="text-red-500 text-4xl mb-3">⚠️</div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">লোড করতে সমস্যা</h3>
                    <p className="text-red-500 text-sm mb-4">{error}</p>
                    <button
                        onClick={fetchBlogs}
                        className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium text-sm"
                    >
                        আবার চেষ্টা করুন
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header Section */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-4">
                        আমাদের সব ব্লগ
                    </h1>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-6">
                        জ্ঞান, তথ্য এবং আপডেটের সংগ্রহশালা
                    </p>
                    <div className="w-24 h-1 bg-blue-500 mx-auto"></div>
                </div>

                {/* Search Bar */}
                <div className="mb-8 max-w-md mx-auto">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="ব্লগ খুঁজুন..."
                            value={searchTerm}
                            onChange={handleSearch}
                            className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                    </div>
                </div>

                {/* Blogs Count */}
                <div className="mb-6 text-center">
                    <p className="text-gray-600 text-sm">
                        মোট {blogs.length} টি ব্লগ পাওয়া গেছে
                    </p>
                </div>

                {/* Blogs Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                    {blogs.map((blog) => (
                        <div 
                            key={blog._id}
                            className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 hover:transform hover:scale-105 cursor-pointer group"
                            onClick={() => handleBlogClick(blog._id)}
                        >
                            {/* Blog Thumbnail */}
                            <div className="relative h-48 sm:h-56 overflow-hidden">
                                <img
                                    src={`${baseImageURL}${blog.thumbnail}`}
                                    alt={blog.title}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                    onError={(e) => {
                                        e.target.src = '/images/blog-placeholder.jpg';
                                        e.target.className = 'w-full h-full object-cover bg-gray-200';
                                    }}
                                />
                                <div className="absolute inset-0 bg-black/40 bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300"></div>
                                
                                {/* Date Badge */}
                                <div className="absolute top-4 left-4">
                                    <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg">
                                        {formatDate(blog.createdAt)}
                                    </span>
                                </div>
                            </div>

                            {/* Blog Content */}
                            <div className="p-4 sm:p-6">
                                <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors">
                                    {blog.title || 'নামহীন ব্লগ'}
                                </h3>
                                
                                <p className="text-gray-600 text-sm mb-4 line-clamp-3 leading-relaxed">
                                    {truncateContent(blog.body)}
                                </p>

                                <div className="flex items-center justify-between">
                                    <span className="text-blue-500 text-sm font-semibold group-hover:text-blue-700 transition-colors flex items-center gap-1">
                                        আরও পড়ুন
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* No Blogs Message */}
                {blogs.length === 0 && !loading && (
                    <div className="text-center py-12">
                        <div className="text-6xl mb-4">📝</div>
                        <h3 className="text-xl font-semibold text-gray-800 mb-2">কোন ব্লগ পাওয়া যায়নি</h3>
                        <p className="text-gray-600">
                            {searchTerm ? 'আপনার সার্চের সাথে মিলছে না' : 'শীঘ্রই নতুন ব্লগ আপলোড করা হবে'}
                        </p>
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex justify-center">
                        <div className="flex flex-wrap gap-2 justify-center items-center">
                            {renderPagination()}
                        </div>
                    </div>
                )}
            </div>

            {/* Custom Styles */}
            <style jsx>{`
                .line-clamp-2 {
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                }
                
                .line-clamp-3 {
                    display: -webkit-box;
                    -webkit-line-clamp: 3;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                }

                /* Responsive design improvements */
                @media (max-width: 640px) {
                    .grid-cols-1 {
                        grid-template-columns: 1fr;
                    }
                }

                @media (min-width: 641px) and (max-width: 1024px) {
                    .grid-cols-2 {
                        grid-template-columns: repeat(2, 1fr);
                    }
                }

                @media (min-width: 1025px) {
                    .grid-cols-3 {
                        grid-template-columns: repeat(3, 1fr);
                    }
                }
            `}</style>
        </div>
    );
};

export default BlogNav;