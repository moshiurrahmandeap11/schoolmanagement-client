import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import axiosInstance, { baseImageURL } from '../../../hooks/axiosInstance/axiosInstance';
import Loader from '../../../components/sharedItems/Loader/Loader';

const LatestBlogs = () => {
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        fetchLatestBlogs();
    }, []);

    const fetchLatestBlogs = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get('/blogs?page=1&limit=3');
            
            if (response.data.success) {
                // Filter only active blogs and take latest 3
                const activeBlogs = response.data.data
                    .filter(blog => blog.isActive)
                    .slice(0, 3);
                setBlogs(activeBlogs);
            } else {
                setError('Failed to load blogs');
            }
        } catch (error) {
            console.error('Error fetching blogs:', error);
            setError('Failed to load latest blogs');
        } finally {
            setLoading(false);
        }
    };

    const handleViewMore = () => {
        navigate('/blogs');
    };

    const handleBlogClick = (blogId) => {
        navigate(`/blog-details/${blogId}`);
    };

    const truncateContent = (htmlContent, maxLength = 150) => {
        // Check if content is undefined or null
        if (!htmlContent) return 'কোন কন্টেন্ট নেই';
        
        // Remove HTML tags and truncate text
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = htmlContent;
        const text = tempDiv.textContent || tempDiv.innerText || '';
        
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    };

    const calculateReadTime = (content) => {
        // Check if content is undefined or null
        if (!content) return 1;
        
        // Calculate reading time (average 200 words per minute)
        const wordCount = content.split(/\s+/).length;
        return Math.max(1, Math.ceil(wordCount / 200)); // At least 1 minute
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

    if (loading) {
        return <Loader />;
    }

    if (error) {
        return (
            <div className="bg-white rounded-lg shadow-sm border border-red-200 p-8 text-center">
                <div className="text-red-500 text-4xl mb-3">⚠️</div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">লোড করতে সমস্যা</h3>
                <p className="text-red-500 text-sm">{error}</p>
            </div>
        );
    }

    if (blogs.length === 0) {
        return (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
                <div className="text-4xl mb-3">📝</div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">কোন ব্লগ নেই</h3>
                <p className="text-gray-600 text-sm">শীঘ্রই নতুন ব্লগ আপলোড করা হবে</p>
            </div>
        );
    }

    return (
        <div className="py-12 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header Section */}
                <div className="text-center mb-12">
                    <h2 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-4">
                        BLOG
                    </h2>
                    <div className="w-24 h-1 bg-black mx-auto mt-4"></div>
                </div>

                {/* Blogs Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                    {blogs.map((blog) => (
                        <div 
                            key={blog._id}
                            className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 hover:transform hover:scale-105 cursor-pointer group"
                            onClick={() => handleBlogClick(blog._id)}
                        >
                            {/* Blog Thumbnail */}
                            <div className="relative h-48 overflow-hidden">
                                <img
                                    src={`${baseImageURL}${blog.thumbnail}`}
                                    alt={blog.title}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                    onError={(e) => {
                                        e.target.src = '/images/blog-placeholder.jpg';
                                    }}
                                />
                                <div className="absolute inset-0 bg-black/40 bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300"></div>
                                
                                {/* Date Badge */}
                                <div className="absolute top-4 left-4">
                                    <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                                        {formatDate(blog.createdAt)}
                                    </span>
                                </div>
                            </div>

                            {/* Blog Content */}
                            <div className="p-6">
                                <h3 className="text-xl font-bold text-gray-800 mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors">
                                    {blog.title || 'নামহীন ব্লগ'}
                                </h3>
                                
                                <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                                    {truncateContent(blog.body)}
                                </p>

                                <div className="flex items-center justify-between">
                                    <span className="text-blue-500 text-sm font-semibold group-hover:text-blue-700 transition-colors">
                                        আরও পড়ুন →
                                    </span>
                                    
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* View More Button */}
                <div className="text-center">
                    <button
                        onClick={handleViewMore}
                        className="bg-blue-500 text-white px-8 py-3 rounded-lg hover:bg-blue-600 transition-all duration-300 transform hover:scale-105 font-semibold shadow-lg hover:shadow-xl"
                    >
                        সব ব্লগ দেখুন
                    </button>
                </div>
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
            `}</style>
        </div>
    );
};

export default LatestBlogs;