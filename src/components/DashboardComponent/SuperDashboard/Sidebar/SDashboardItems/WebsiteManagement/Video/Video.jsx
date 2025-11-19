import { useEffect, useState } from 'react';
import { FaCrown, FaEdit, FaPlus, FaTrash } from 'react-icons/fa';
import Swal from 'sweetalert2';
import axiosInstance from '../../../../../../../hooks/axiosInstance/axiosInstance';
import Loader from '../../../../../../sharedItems/Loader/Loader';
import MainButton from '../../../../../../sharedItems/Mainbutton/Mainbutton';
import AddNewVideo from './AddNewVideo/AddNewVideo';


const Video = () => {
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('list'); // 'list' or 'new'
    const [editingVideo, setEditingVideo] = useState(null);

    // Fetch videos
    useEffect(() => {
        fetchVideos();
    }, []);

    const fetchVideos = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get('/videos');
            
            if (response.data.success) {
                setVideos(response.data.data || []);
            } else {
                showSweetAlert('error', response.data.message || 'ভিডিও লোড করতে সমস্যা হয়েছে');
            }
        } catch (error) {
            console.error('Error fetching videos:', error);
            showSweetAlert('error', 'ভিডিও লোড করতে সমস্যা হয়েছে: ' + error.message);
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
        setEditingVideo(null);
        setActiveTab('new');
    };

    const handleEdit = (video) => {
        setEditingVideo(video);
        setActiveTab('new');
    };

    const handleDelete = async (videoId) => {
        const result = await Swal.fire({
            title: 'নিশ্চিত?',
            text: "আপনি কি এই ভিডিওটি মুছে ফেলতে চান?",
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
                const response = await axiosInstance.delete(`/videos/${videoId}`);

                if (response.data.success) {
                    showSweetAlert('success', 'ভিডিও সফলভাবে মুছে ফেলা হয়েছে!');
                    fetchVideos();
                } else {
                    showSweetAlert('error', response.data.message || 'ভিডিও মুছতে সমস্যা হয়েছে');
                }
            } catch (error) {
                console.error('Error deleting video:', error);
                const errorMessage = error.response?.data?.message || 'ভিডিও মুছতে সমস্যা হয়েছে';
                showSweetAlert('error', errorMessage);
            } finally {
                setLoading(false);
            }
        }
    };

    const handleBack = () => {
        setActiveTab('list');
        setEditingVideo(null);
        fetchVideos();
    };

    // If activeTab is 'new', show AddNewVideo component
    if (activeTab === 'new') {
        return (
            <AddNewVideo 
                editingVideo={editingVideo}
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
                            নতুন ভিডিও
                        </MainButton>
                    </div>

                    {/* Videos List */}
                    <div className="bg-white rounded-lg shadow border border-gray-200">
                        {/* Loading State */}
                        {loading && (
                            <Loader></Loader>
                        )}

                        {/* Empty State */}
                        {!loading && videos.length === 0 && (
                            <div className="p-8 text-center">
                                <div className="text-4xl mb-3">🎬</div>
                                <h3 className="text-lg font-semibold text-gray-800 mb-2">কোন ভিডিও পাওয়া যায়নি</h3>
                                <p className="text-gray-600 mb-4 text-sm">আপনার প্রথম ভিডিও তৈরি করুন।</p>
                                <MainButton
                                    onClick={handleAddNew}
                                >
                                    ভিডিও তৈরি করুন
                                </MainButton>
                            </div>
                        )}

                        {/* Videos Table */}
                        {!loading && videos.length > 0 && (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50 border-b border-gray-200">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">ভিডিও শিরোনাম</th>
                                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Premium/Free</th>
                                            <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">একশন্স</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {videos.map((video) => (
                                            <tr key={video._id} className="hover:bg-gray-50">
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center shrink-0">
                                                            <span className="text-[#1e90c9] font-semibold text-sm">
                                                                🎬
                                                            </span>
                                                        </div>
                                                        <div>
                                                            <p className="font-medium text-gray-800 text-sm">{video.title}</p>
                                                            <p className="text-xs text-gray-500">
                                                                ID: {video.videoId}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium w-fit ${
                                                        video.isPremium 
                                                            ? 'bg-[#1e90c9] text-white' 
                                                            : 'bg-[#1e90c9] text-white'
                                                    }`}>
                                                        {video.isPremium && <FaCrown className="text-xs" />}
                                                        {video.isPremium ? 'Premium' : 'Free'}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex gap-2 justify-center">
                                                        <button
                                                            onClick={() => handleEdit(video)}
                                                            className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors text-xs flex items-center gap-1"
                                                        >
                                                            <FaEdit className="text-xs" />
                                                            এডিট
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(video._id)}
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
                    {videos.length > 0 && (
                        <div className="mt-4 text-sm text-gray-600 flex flex-wrap gap-4">
                            <span>মোট ভিডিও: {videos.length}</span>
                            <span>Premium: {videos.filter(v => v.isPremium).length}</span>
                            <span>Free: {videos.filter(v => !v.isPremium).length}</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Video;