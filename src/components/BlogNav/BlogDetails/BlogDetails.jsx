import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import Loader from '../../../components/sharedItems/Loader/Loader';
import axiosInstance, { baseImageURL } from '../../../hooks/axiosInstance/axiosInstance';
import MainButton from '../../sharedItems/Mainbutton/Mainbutton';

const BlogDetails = () => {
    const [blog, setBlog] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { id } = useParams();
    const navigate = useNavigate();
    console.log(blog);

    useEffect(() => {
        fetchBlogDetails();
    }, [id]);

    const fetchBlogDetails = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get(`/blogs/${id}`);
            
            if (response.data.success) {
                setBlog(response.data.data);
            } else {
                setError('ব্লগটি পাওয়া যায়নি');
            }
        } catch (error) {
            console.error('Error fetching blog details:', error);
            setError('ব্লগ লোড করতে সমস্যা হয়েছে');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'তারিখ নেই';
        
        try {
            return new Date(dateString).toLocaleDateString('bn-BD', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                weekday: 'long'
            });
        } catch {
            return 'তারিখ নেই';
        }
    };

    const calculateReadTime = (content) => {
        if (!content) return 1;
        const wordCount = content.split(/\s+/).length;
        return Math.max(1, Math.ceil(wordCount / 200));
    };

    const handleGoBack = () => {
        navigate(-1);
    };

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: blog.title,
                    text: blog.body ? blog.body.replace(/<[^>]*>/g, '').substring(0, 100) + '...' : '',
                    url: window.location.href,
                });
            } catch (error) {
                console.log('Error sharing:', error);
            }
        } else {
            // Fallback: copy to clipboard
            navigator.clipboard.writeText(window.location.href).then(() => {
                alert('লিঙ্ক কপি হয়েছে!');
            });
        }
    };

    if (loading) {
        return <Loader />;
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-xl shadow-lg p-8 text-center max-w-md w-full">
                    <div className="text-red-500 text-6xl mb-4">⚠️</div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-3">সমস্যা হয়েছে</h2>
                    <p className="text-gray-600 mb-6">{error}</p>
                    <div className="flex gap-3 justify-center">
                        <button
                            onClick={handleGoBack}
                            className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors font-medium"
                        >
                            পিছনে যান
                        </button>
                        <button
                            onClick={fetchBlogDetails}
                            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
                        >
                            আবার চেষ্টা করুন
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (!blog) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-xl shadow-lg p-8 text-center max-w-md w-full">
                    <div className="text-6xl mb-4">📝</div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-3">ব্লগ পাওয়া যায়নি</h2>
                    <p className="text-gray-600 mb-6">আপনি যে ব্লগটি খুঁজছেন তা পাওয়া যায়নি</p>
                    <button
                        onClick={handleGoBack}
                        className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
                    >
                        ব্লগ লিস্টে ফিরে যান
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Back Button */}
                <div className="mb-6">
                    <button
                        onClick={handleGoBack}
                        className="flex items-center gap-2 text-[#1e90c9] transition-colors font-medium"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        ব্লগ লিস্টে ফিরে যান
                    </button>
                </div>

                {/* Blog Header */}
                <article className="bg-white rounded-xl shadow-lg overflow-hidden">
                    {/* Blog Thumbnail */}
                    <div className="relative h-64 sm:h-80 lg:h-96 overflow-hidden">
                        <img
                            src={`${baseImageURL}${blog.thumbnail}`}
                            alt={blog.title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                                e.target.src = '/images/blog-placeholder.jpg';
                                e.target.className = 'w-full h-full object-cover bg-gray-200';
                            }}
                        />
                        <div className="absolute inset-0 bg-linear-to-t from-black/50 to-transparent"></div>
                        
                        {/* Overlay Content */}
                        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                            <div className="max-w-3xl mx-auto">
                                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 leading-tight">
                                    {blog.title}
                                </h1>
                                
                                {/* Meta Information */}
                                <div className="flex flex-wrap items-center gap-4 text-sm sm:text-base">
                                    <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                        <span>{blog.author || 'অজানা লেখক'}</span>
                                    </div>
                                    
                                    <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        <span>{formatDate(blog.createdAt)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Blog Content */}
                    <div className="p-6 sm:p-8 lg:p-12">
                        {/* Action Buttons */}
                        <div className="flex flex-wrap gap-3 mb-8 pb-6 border-b border-gray-200">
                            <MainButton
                                onClick={handleShare}
                            >
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                                </svg>
                                শেয়ার করুন
                            </MainButton>
                            
                            <span className={`inline-flex items-center px-4 py-1 rounded-3xl text-xs font-semibold ${
                                blog.isActive 
                                    ? 'bg-[#1e90c9] text-white' 
                                    : 'bg-red-100 text-red-800'
                            }`}>
                                {blog.isActive ? 'সক্রিয়' : 'নিষ্ক্রিয়'}
                            </span>
                        </div>

                        {/* Blog Body Content */}
                        <div 
                            className="prose prose-lg max-w-none 
                                      prose-headings:text-gray-800
                                      prose-p:text-gray-700 prose-p:leading-relaxed
                                      prose-strong:text-gray-900
                                      prose-em:text-gray-600
                                      prose-ul:text-gray-700
                                      prose-ol:text-gray-700
                                      prose-li:text-gray-700
                                      prose-blockquote:border-blue-500 prose-blockquote:bg-blue-50
                                      prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline
                                      prose-img:rounded-lg prose-img:shadow-md
                                      prose-table:border-gray-300
                                      prose-th:bg-gray-100
                                      prose-td:border-gray-300"
                            dangerouslySetInnerHTML={{ __html: blog.body || 'কোন কন্টেন্ট নেই' }}
                        />
                    </div>
                </article>

                {/* Additional Information */}
                <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
                    <h3 className="text-xl font-bold text-gray-800 mb-4">ব্লগ তথ্য</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                        <div>
                            <span className="font-semibold text-gray-600">লেখক:</span>
                            <p className="text-gray-800">{blog.author || 'অজানা লেখক'}</p>
                        </div>
                        <div>
                            <span className="font-semibold text-gray-600">প্রকাশিত:</span>
                            <p className="text-gray-800">{formatDate(blog.createdAt)}</p>
                        </div>
                        <div>
                            <span className="font-semibold text-gray-600">আপডেট:</span>
                            <p className="text-gray-800">{formatDate(blog.updatedAt)}</p>
                        </div>
                        <div>
                            <span className="font-semibold text-gray-600">স্ট্যাটাস:</span>
                            <p className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold ${
                                blog.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                                {blog.isActive ? 'সক্রিয়' : 'নিষ্ক্রিয়'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Call to Action */}
                <div className="mt-8 text-center">
                    <MainButton
                        onClick={handleGoBack}
                    >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        সব ব্লগ দেখুন
                    </MainButton>
                </div>
            </div>

            {/* Custom Styles */}
            <style jsx>{`
                /* Custom prose styles for better typography */
                .prose {
                    line-height: 1.7;
                }
                
                .prose p {
                    margin-bottom: 1.5em;
                }
                
                .prose h1, .prose h2, .prose h3, .prose h4 {
                    margin-top: 2em;
                    margin-bottom: 1em;
                }
                
                .prose ul, .prose ol {
                    margin-bottom: 1.5em;
                }
                
                .prose li {
                    margin-bottom: 0.5em;
                }
                
                .prose blockquote {
                    padding: 1.5em;
                    margin: 2em 0;
                    border-left-width: 4px;
                }
                
                /* Responsive improvements */
                @media (max-width: 640px) {
                    .prose {
                        font-size: 0.95rem;
                    }
                }
            `}</style>
        </div>
    );
};

export default BlogDetails;