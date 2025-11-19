import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';

import { FaArrowLeft, FaCalendarAlt, FaClock, FaEye } from 'react-icons/fa';
import Loader from '../../components/sharedItems/Loader/Loader';
import axiosInstance from '../../hooks/axiosInstance/axiosInstance';

const Announcement = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [announcement, setAnnouncement] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Fetch announcement data by ID
    useEffect(() => {
        const fetchAnnouncement = async () => {
            try {
                setLoading(true);
                setError('');
                const response = await axiosInstance.get(`/recently/${id}`);
                
                if (response.data.success) {
                    setAnnouncement(response.data.data);
                } else {
                    setError('Announcement not found');
                }
            } catch (error) {
                console.error('Failed to fetch announcement:', error);
                setError('Failed to load announcement');
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchAnnouncement();
        }
    }, [id]);

    const handleGoBack = () => {
        navigate(-1);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-BD', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const formatTime = (dateString) => {
        return new Date(dateString).toLocaleTimeString('en-BD', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const baseImage = axiosInstance.defaults.baseURL;
    const second = (announcement?.image);
    const sum = baseImage+second;

    if (loading) {
        return <Loader></Loader>
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-24 h-24 mx-auto mb-4 text-red-500">
                        <FaEye className="w-full h-full" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Announcement Not Found</h2>
                    <p className="text-gray-600 mb-6">{error}</p>
                    <button
                        onClick={handleGoBack}
                        className="px-6 py-3 bg-[#1e90c9] text-white rounded-lg  transition-colors"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    if (!announcement) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">No Announcement Found</h2>
                    <button
                        onClick={handleGoBack}
                        className="px-6 py-3 bg-[#1e90c9] text-white rounded-lg  transition-colors"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Back Button */}
                <button
                    onClick={handleGoBack}
                    className="flex items-center gap-2 text-[#1e90c9] mb-6 transition-colors"
                >
                    <FaArrowLeft className="w-4 h-4" />
                    <span>Back to Previous Page</span>
                </button>

                {/* Main Content Card */}
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                    {/* Featured Image */}
                    {announcement.image && (
                        <div className="w-full h-64 sm:h-80 md:h-96 bg-gray-200">
                            <img
                                src={`${sum}`}
                                alt={announcement.title}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                    e.target.style.display = 'none';
                                }}
                            />
                        </div>
                    )}

                    {/* Content */}
                    <div className="p-6 sm:p-8">
                        {/* Title */}
                        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4 leading-tight">
                            {announcement.title}
                        </h1>

                        {/* Meta Information */}
                        <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-sm text-gray-600 mb-6 pb-6 border-b border-gray-200">
                            <div className="flex items-center gap-2">
                                <FaCalendarAlt className="w-4 h-4" />
                                <span>Created: {formatDate(announcement.createdAt)}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <FaClock className="w-4 h-4" />
                                <span>Time: {formatTime(announcement.createdAt)}</span>
                            </div>
                            {announcement.updatedAt !== announcement.createdAt && (
                                <div className="flex items-center gap-2">
                                    <FaClock className="w-4 h-4" />
                                    <span>Updated: {formatDate(announcement.updatedAt)}</span>
                                </div>
                            )}
                            <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                announcement.isActive 
                                    ? 'bg-[#1e90c9] text-white' 
                                    : 'bg-red-100 text-red-800'
                            }`}>
                                {announcement.isActive ? 'Active' : 'Inactive'}
                            </div>
                        </div>

                        {/* Body Content */}
                        <div className="prose prose-lg max-w-none">
                            <div 
                                className="announcement-body"
                                dangerouslySetInnerHTML={{ __html: announcement.body }}
                            />
                        </div>

                        {/* Additional Info */}
                        <div className="mt-8 pt-6 border-t border-gray-200">
                            <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                                <span>Announcement ID: {announcement._id}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Custom Styles for the HTML Content */}
            <style jsx>{`
                .announcement-body {
                    line-height: 1.8;
                    color: #374151;
                    font-size: 1.125rem;
                }

                .announcement-body h1,
                .announcement-body h2,
                .announcement-body h3,
                .announcement-body h4,
                .announcement-body h5,
                .announcement-body h6 {
                    color: #1f2937;
                    margin-top: 1.5em;
                    margin-bottom: 0.5em;
                    font-weight: 600;
                }

                .announcement-body h1 { font-size: 2.25rem; }
                .announcement-body h2 { font-size: 1.875rem; }
                .announcement-body h3 { font-size: 1.5rem; }
                .announcement-body h4 { font-size: 1.25rem; }
                .announcement-body h5 { font-size: 1.125rem; }
                .announcement-body h6 { font-size: 1rem; }

                .announcement-body p {
                    margin-bottom: 1.5em;
                }

                .announcement-body ul,
                .announcement-body ol {
                    margin: 1em 0;
                    padding-left: 2em;
                }

                .announcement-body li {
                    margin: 0.5em 0;
                }

                .announcement-body ul {
                    list-style-type: disc;
                }

                .announcement-body ol {
                    list-style-type: decimal;
                }

                .announcement-body a {
                    color: #3b82f6;
                    text-decoration: underline;
                    transition: color 0.2s;
                }

                .announcement-body a:hover {
                    color: #1d4ed8;
                }

                .announcement-body strong {
                    font-weight: 700;
                    color: #1f2937;
                }

                .announcement-body em {
                    font-style: italic;
                }

                .announcement-body u {
                    text-decoration: underline;
                }

                .announcement-body img {
                    max-width: 100%;
                    height: auto;
                    border-radius: 8px;
                    margin: 1em 0;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
                }

                .announcement-body blockquote {
                    border-left: 4px solid #3b82f6;
                    padding-left: 1em;
                    margin: 1.5em 0;
                    font-style: italic;
                    color: #6b7280;
                }

                .announcement-body code {
                    background-color: #f3f4f6;
                    padding: 0.2em 0.4em;
                    border-radius: 4px;
                    font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
                    font-size: 0.875em;
                }

                .announcement-body pre {
                    background-color: #1f2937;
                    color: #f9fafb;
                    padding: 1em;
                    border-radius: 8px;
                    overflow-x: auto;
                    margin: 1.5em 0;
                }

                .announcement-body pre code {
                    background: none;
                    padding: 0;
                    color: inherit;
                }

                /* Responsive design */
                @media (max-width: 640px) {
                    .announcement-body {
                        font-size: 1rem;
                    }
                    
                    .announcement-body h1 { font-size: 1.875rem; }
                    .announcement-body h2 { font-size: 1.5rem; }
                    .announcement-body h3 { font-size: 1.25rem; }
                }
            `}</style>
        </div>
    );
};

export default Announcement;