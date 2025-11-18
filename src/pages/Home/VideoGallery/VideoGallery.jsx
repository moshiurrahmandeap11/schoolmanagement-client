import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import Loader from "../../../components/sharedItems/Loader/Loader";
import MainButton from "../../../components/sharedItems/Mainbutton/Mainbutton";
import axiosInstance from "../../../hooks/axiosInstance/axiosInstance";

const VideoGallery = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedVideo, setSelectedVideo] = useState(null);

  const scrollContainerRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  useEffect(() => {
    fetchVideos();
  }, []);

  // Auto scroll
  useEffect(() => {
    if (!scrollContainerRef.current || isDragging || videos.length === 0)
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
  }, [isDragging, videos.length]);

  const fetchVideos = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get("/gallery/videos");
      if (response.data.success) {
        const activeVideos = (response.data.data || []).filter(
          (v) => v.isActive
        );
        setVideos(activeVideos);
      } else {
        setError("Failed to load videos");
      }
    } catch (error) {
      console.error("Error fetching videos:", error);
      setError("Failed to load video gallery");
    } finally {
      setLoading(false);
    }
  };

  const infiniteVideos = [...videos, ...videos];

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
  const openVideoModal = (video) => {
    if (isDragging) return; // Prevent click during drag
    setSelectedVideo(video);
  };

  const closeModal = () => setSelectedVideo(null);

  // Fallback Thumbnail (if maxresdefault fails)
  const getThumbnail = (videoId) => {
    return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`; // Always exists
  };

  if (loading) return <Loader />;

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-sm border border-red-200 p-8 text-center">
            <div className="text-red-500 text-6xl mb-4">Warning</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Unable to Load
            </h2>
            <p className="text-red-500 mb-6">{error}</p>
            <button
              onClick={fetchVideos}
              className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 font-medium"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (videos.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
            <div className="text-6xl mb-4">No Video</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              কোনো ভিডিও পাওয়া যায়নি
            </h3>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-12 ">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-black mb-4">
            ভিডিও গ্যালারি
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
            {infiniteVideos.map((video, index) => (
              <div
                key={`${video._id}-${index}`}
                className="shrink-0 w-64 sm:w-84 bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer"
                onClick={() => openVideoModal(video)}
              >
                {/* Thumbnail */}
                <div className="relative h-40 sm:h-48 bg-gray-200">
                  <img
                    src={getThumbnail(video.videoId)}
                    alt={video.caption}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = `https://img.youtube.com/vi/${video.videoId}/default.jpg`;
                    }}
                    draggable="false"
                  />

                  {/* Play Button */}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 bg-opacity-30 hover:bg-opacity-50 transition-all">
                    <div className="bg-red-600 text-white rounded-full p-3 sm:p-4 shadow-lg hover:scale-110 transition-transform">
                      <svg
                        className="w-6 h-6 sm:w-8 sm:h-8"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Caption */}
                <div className="p-3 sm:p-4 text-center">
                  <p className="text-sm sm:text-base font-medium text-gray-800 line-clamp-2">
                    {video.caption}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
        <Link to={"/video-gallery"} className="flex items-center justify-end mt-6">
          <MainButton>সব ভিডিও দেখুন...</MainButton>
        </Link>

      {/* Modal */}
      {selectedVideo && (
        <div
          className="fixed inset-0 bg-black/40 bg-opacity-90 flex items-center justify-center z-50 p-4"
          onClick={closeModal}
        >
          <div
            className="relative w-full max-w-4xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={closeModal}
              className="absolute -top-12 right-0 text-white text-4xl hover:text-gray-400 transition"
            >
              ×
            </button>
            <div className="relative pt-[56.25%] bg-black rounded-lg overflow-hidden shadow-2xl">
              <iframe
                src={`https://www.youtube.com/embed/${selectedVideo.videoId}?autoplay=1&rel=0`}
                title={selectedVideo.caption}
                className="absolute top-0 left-0 w-full h-full"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
            <p className="text-white text-center mt-4 text-lg font-medium">
              {selectedVideo.caption}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoGallery;
