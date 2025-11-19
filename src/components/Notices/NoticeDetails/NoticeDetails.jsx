import { useEffect, useState } from 'react';
import { FaArrowLeft, FaCalendarAlt, FaImage } from 'react-icons/fa';
import { useNavigate, useParams } from 'react-router';
import axiosInstance, { baseImageURL } from '../../../hooks/axiosInstance/axiosInstance';
import Loader from '../../sharedItems/Loader/Loader';

const NoticeDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [notice, setNotice] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchNoticeDetails();
    }, [id]);

    const fetchNoticeDetails = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get(`/notices/${id}`);
            
            if (response.data.success) {
                setNotice(response.data.data);
            } else {
                setError('Notice not found');
            }
        } catch (error) {
            console.error('Error fetching notice details:', error);
            setError('Error loading notice');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <Loader></Loader>
    }

    if (error || !notice) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-red-600 text-lg mb-4">{error || 'Notice not found'}</p>
                    <button 
                        onClick={() => navigate(-1)}
                        className="bg-[#1e90c9] text-white px-6 py-2 rounded-lg "
                    >
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-5xl mx-auto px-4">
                {/* Back Button */}
                <button 
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-[#1e90c9] mb-6"
                >
                    <FaArrowLeft />
                    Back to Notices
                </button>

                {/* Notice Card */}
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    {/* Header */}
                    <div className="bg-[#051939] px-6 py-4">
                        <h1 className="text-2xl font-bold text-white">{notice.title}</h1>
                        <div className="flex items-center gap-4 mt-2 text-blue-200">
                            <div className="flex items-center gap-1">
                                <FaCalendarAlt className="text-sm" />
                                <span className="text-sm">
                                    {new Date(notice.createdAt).toLocaleDateString('en-BD', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}
                                </span>
                            </div>
                            <span className={`px-2 py-1 text-xs rounded-full ${
                                notice.isPublished 
                                    ? 'bg-[#1e90c9] text-white' 
                                    : 'bg-yellow-500 text-white'
                            }`}>
                                {notice.isPublished ? 'Published' : 'Draft'}
                            </span>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                        {/* Attachment Image - Show at the top if exists */}
                        {notice.attachment && (
                            <div className="mb-6">
                                <div className="flex items-center gap-2 mb-3">
                                    <FaImage className="text-blue-600" />
                                    <h3 className="text-lg font-semibold text-gray-800">Attachment</h3>
                                </div>
                                <div className="border rounded-lg overflow-hidden">
                                    <img 
                                        src={`${baseImageURL}/api/uploads/${notice.attachment.filename}`}
                                        alt={notice.attachment.originalName}
                                        className="w-full h-auto max-h-96 object-contain bg-gray-100"
                                        onError={(e) => {
                                            e.target.style.display = 'none';
                                            e.target.nextSibling.style.display = 'block';
                                        }}
                                    />
                                    {/* Fallback if image fails to load */}
                                    <div 
                                        className="hidden p-8 text-center bg-gray-100 text-gray-500"
                                        style={{display: 'none'}}
                                    >
                                        <FaImage className="text-4xl mx-auto mb-2 text-gray-400" />
                                        <p>Image preview not available</p>
                                        <p className="text-sm mt-1">{notice.attachment.originalName}</p>
                                    </div>
                                </div>
                                <p className="text-sm text-gray-600 mt-2 text-center">
                                    {notice.attachment.originalName}
                                </p>
                            </div>
                        )}

                        {/* Notice Body */}
                        <div 
                            className="prose max-w-none"
                            dangerouslySetInnerHTML={{ __html: notice.body }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NoticeDetails;