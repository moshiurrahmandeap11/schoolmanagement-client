import { useEffect, useState } from 'react';
import Loader from '../../../components/sharedItems/Loader/Loader';
import axiosInstance from '../../../hooks/axiosInstance/axiosInstance';

const PhotoGalleryNav = () => {
    const [photos, setPhotos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedPhoto, setSelectedPhoto] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const photosPerPage = 6;

    useEffect(() => {
        fetchPhotos();
    }, []);

    const fetchPhotos = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get('/gallery/photos');
            if (response.data.success) {
                const activePhotos = (response.data.data || [])
                    .filter(p => p.isActive)
                    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)); // Latest first
                setPhotos(activePhotos);
            } else {
                setError('Failed to load photos');
            }
        } catch (error) {
            console.error('Error fetching photos:', error);
            setError('Failed to load photo gallery');
        } finally {
            setLoading(false);
        }
    };

    // Pagination
    const indexOfLastPhoto = currentPage * photosPerPage;
    const indexOfFirstPhoto = indexOfLastPhoto - photosPerPage;
    const currentPhotos = photos.slice(indexOfFirstPhoto, indexOfLastPhoto);
    const totalPages = Math.ceil(photos.length / photosPerPage);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    // Lightbox
    const openLightbox = (photo) => setSelectedPhoto(photo);
    const closeLightbox = () => setSelectedPhoto(null);

    const imageu = axiosInstance.defaults.baseURL;

    if (loading) return <Loader />;

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <div className="bg-white rounded-lg shadow-sm border border-red-200 p-8">
                        <div className="text-red-500 text-6xl mb-4">Warning</div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">Unable to Load</h2>
                        <p className="text-red-500 mb-6">{error}</p>
                        <button onClick={fetchPhotos} className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 font-medium">
                            Try Again
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (photos.length === 0) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                        <div className="text-6xl mb-4">No Photo</div>
                        <h3 className="text-xl font-semibold text-gray-800">কোনো ছবি পাওয়া যায়নি</h3>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="py-12 bg-gradient-to-br from-blue-50 to-indigo-100">
            <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">

                {/* Header */}
                <div className="text-center mb-10">
                    <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                        ফটো গ্যালারি
                    </h1>
                </div>

                {/* Photo Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                    {currentPhotos.map((photo) => (
                        <div
                            key={photo._id}
                            onClick={() => openLightbox(photo)}
                            className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer group"
                        >
                            <div className="relative aspect-video md:aspect-square bg-gray-200">
                                <img
                                    src={`${imageu}${photo.image}`}
                                    alt={photo.caption}
                                    className="w-full h-full object-cover"
                                    loading="lazy"
                                />
                                {/* Hover Overlay */}
                                <div className="absolute inset-0 bg-black/40 bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
                                    <div className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                            <div className="p-3 text-center">
                                <p className="text-sm md:text-base font-medium text-gray-800 line-clamp-2">
                                    {photo.caption}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex justify-center items-center gap-2 flex-wrap">
                        <button
                            onClick={() => paginate(currentPage - 1)}
                            disabled={currentPage === 1}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                                currentPage === 1
                                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                    : 'bg-blue-500 text-white hover:bg-blue-600'
                            }`}
                        >
                            Previous
                        </button>

                        {[...Array(totalPages)].map((_, i) => (
                            <button
                                key={i + 1}
                                onClick={() => paginate(i + 1)}
                                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                                    currentPage === i + 1
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                                }`}
                            >
                                {i + 1}
                            </button>
                        ))}

                        <button
                            onClick={() => paginate(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                                currentPage === totalPages
                                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                    : 'bg-blue-500 text-white hover:bg-blue-600'
                            }`}
                        >
                            Next
                        </button>
                    </div>
                )}
            </div>

            {/* Lightbox Modal */}
            {selectedPhoto && (
                <div
                    className="fixed inset-0 bg-black/40 bg-opacity-95 flex items-center justify-center z-50 p-4"
                    onClick={closeLightbox}
                >
                    <div
                        className="relative max-w-5xl w-full"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            onClick={closeLightbox}
                            className="absolute -top-12 right-0 text-white text-4xl hover:text-gray-400 transition"
                        >
                            ×
                        </button>

                        <div className="bg-white rounded-lg shadow-2xl overflow-hidden">
                            <img
                                src={`${imageu}${selectedPhoto.image}`}
                                alt={selectedPhoto.caption}
                                className="w-full h-auto max-h-screen object-contain"
                            />
                            <div className="p-4 bg-white">
                                <p className="text-lg font-medium text-gray-800 text-center">
                                    {selectedPhoto.caption}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PhotoGalleryNav;