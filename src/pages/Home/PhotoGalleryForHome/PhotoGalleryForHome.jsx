import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import Loader from "../../../components/sharedItems/Loader/Loader";
import MainButton from "../../../components/sharedItems/Mainbutton/Mainbutton";
import axiosInstance from "../../../hooks/axiosInstance/axiosInstance";

const PhotoGalleryForHome = () => {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  const scrollContainerRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  useEffect(() => {
    fetchPhotos();
  }, []);

  // Auto scroll
  useEffect(() => {
    if (!scrollContainerRef.current || isDragging || photos.length === 0)
      return;

    const container = scrollContainerRef.current;
    let scrollAmount = 0;

    const autoScroll = setInterval(() => {
      scrollAmount += 1;
      container.scrollLeft = scrollAmount;

      if (scrollAmount >= container.scrollWidth / 2) {
        scrollAmount = 0;
      }
    }, 30);

    return () => clearInterval(autoScroll);
  }, [isDragging, photos.length]);

  const fetchPhotos = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get("/gallery/photos");
      if (response.data.success) {
        const activePhotos = (response.data.data || []).filter(
          (p) => p.isActive
        );
        setPhotos(activePhotos);
      } else {
        setError("Failed to load photos");
      }
    } catch (error) {
      console.error("Error fetching photos:", error);
      setError("Failed to load photo gallery");
    } finally {
      setLoading(false);
    }
  };

  const infinitePhotos = [...photos, ...photos];

  // Drag handlers
  const handleMouseDown = (e) => {
    setIsDragging(true);
    setStartX(e.pageX - scrollContainerRef.current.offsetLeft);
    setScrollLeft(scrollContainerRef.current.scrollLeft);
  };

  const handleMouseUp = () => setIsDragging(false);
  const handleMouseLeave = () => setIsDragging(false);

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - scrollContainerRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    scrollContainerRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleTouchStart = (e) => {
    setIsDragging(true);
    setStartX(e.touches[0].pageX - scrollContainerRef.current.offsetLeft);
    setScrollLeft(scrollContainerRef.current.scrollLeft);
  };

  const handleTouchEnd = () => setIsDragging(false);

  const handleTouchMove = (e) => {
    if (!isDragging) return;
    const x = e.touches[0].pageX - scrollContainerRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    scrollContainerRef.current.scrollLeft = scrollLeft - walk;
  };

  // Open Modal
  const openPhotoModal = (photo) => {
    if (isDragging) return; // Prevent click during drag
    setSelectedPhoto(photo);
  };

  const closeModal = () => setSelectedPhoto(null);

  // Get full image URL
  const getImageUrl = (imagePath) => {
    const baseUrl = axiosInstance.defaults.baseURL;
    return `${baseUrl}${imagePath}`;
  };

  if (loading) return <Loader />;

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-sm border border-red-200 p-8 text-center">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Unable to Load
            </h2>
            <p className="text-red-500 mb-6">{error}</p>
            <button
              onClick={fetchPhotos}
              className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 font-medium"
            >
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
            <div className="text-6xl mb-4">📷</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              কোনো ফটো পাওয়া যায়নি
            </h3>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-12">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-black mb-4">
            ফটো গ্যালারি
          </h1>
        </div>

        {/* Scrollable Container */}
        <div
          ref={scrollContainerRef}
          className="overflow-hidden cursor-grab active:cursor-grabbing select-none"
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
          onMouseMove={handleMouseMove}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onTouchMove={handleTouchMove}
          style={{ scrollBehavior: isDragging ? "auto" : "smooth" }}
        >
          <div className="flex gap-4 sm:gap-6" style={{ width: "max-content" }}>
            {infinitePhotos.map((photo, index) => (
              <div
                key={`${photo._id}-${index}`}
                className="shrink-0 w-64 sm:w-84 bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer"
                onClick={() => openPhotoModal(photo)}
              >
                {/* Photo */}
                <div className="relative h-40 sm:h-48 bg-gray-200">
                  <img
                    src={getImageUrl(photo.image)}
                    alt={photo.caption}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='Arial' font-size='12' fill='%239ca3af'%3ENo Image%3C/text%3E%3C/svg%3E";
                    }}
                    draggable="false"
                  />

                  {/* View Icon */}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/40 transition-all">
                    <div className="bg-white/90 text-gray-800 rounded-full p-3 sm:p-4 shadow-lg hover:scale-110 transition-transform">
                      <svg
                        className="w-6 h-6 sm:w-8 sm:h-8"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"
                        />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Caption */}
                <div className="p-3 sm:p-4 text-center">
                  <p className="text-sm sm:text-base font-medium text-gray-800 line-clamp-2">
                    {photo.caption}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* View All Button */}
      <Link to={"/photo-gallery"} className="flex items-center justify-end mt-6">
        <MainButton>সব ফটো দেখুন...</MainButton>
      </Link>

      {/* Modal */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4"
          onClick={closeModal}
        >
          <div
            className="relative w-full max-w-4xl max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={closeModal}
              className="absolute -top-12 right-0 text-white text-4xl hover:text-gray-400 transition z-10"
            >
              ×
            </button>
            
            {/* Image Container */}
            <div className="bg-white rounded-lg overflow-hidden shadow-2xl max-h-[80vh] flex flex-col">
              <div className="flex-1 overflow-hidden">
                <img
                  src={getImageUrl(selectedPhoto.image)}
                  alt={selectedPhoto.caption}
                  className="w-full h-full object-contain max-h-[70vh]"
                />
              </div>
              
              {/* Caption */}
              <div className="bg-white p-4 border-t border-gray-200">
                <p className="text-gray-800 text-center text-lg font-medium">
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

export default PhotoGalleryForHome;