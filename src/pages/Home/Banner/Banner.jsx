import { useEffect, useState } from 'react';
import Loader from '../../../components/sharedItems/Loader/Loader';
import axiosInstance, { baseImageURL } from '../../../hooks/axiosInstance/axiosInstance';

const Slider = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [allImages, setAllImages] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch sliders from backend
  useEffect(() => {
    fetchSliders();
  }, []);

  const fetchSliders = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/sliders');
      
      if (response.data.success && response.data.data.length > 0) {
        // Combine all images from all sliders into one array
        const combinedImages = [];
        
        response.data.data.forEach(slider => {
          slider.images.forEach(img => {
            combinedImages.push({
              url: img.path.startsWith('http') ? img.path : `${baseImageURL}${img.path}`,
              title: slider.title,
              originalName: img.originalName,
              sliderId: slider._id
            });
          });
        });
        
        setAllImages(combinedImages);
      }
    } catch (err) {
      console.error('Error fetching sliders:', err);
    } finally {
      setLoading(false);
    }
  };

  // Auto-play functionality
  useEffect(() => {
    if (allImages.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % allImages.length);
    }, 3000); // Default speed

    return () => clearInterval(interval);
  }, [allImages, currentSlide]);

  // Manual navigation
  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  const goToNextSlide = () => {
    if (allImages.length === 0) return;
    setCurrentSlide((prev) => (prev + 1) % allImages.length);
  };

  const goToPrevSlide = () => {
    if (allImages.length === 0) return;
    setCurrentSlide((prev) => 
      prev === 0 ? allImages.length - 1 : prev - 1
    );
  };

  if (loading) {
    return <Loader />
  }

  if (allImages.length === 0) {
    return (
      <section className="relative bg-gray-200 h-64 sm:h-80 md:h-96 lg:h-[500px] flex items-center justify-center">
        <div className="text-center text-gray-500">
          <p>No slider content available</p>
        </div>
      </section>
    );
  }

  const currentImage = allImages[currentSlide];

  return (
    <section className="relative h-64 sm:h-80 md:h-96 lg:h-[400px] xl:h-[400px] overflow-hidden">
      {/* Background Images with smooth transition */}
      {allImages.map((image, index) => (
        <div
          key={`${image.sliderId}-${index}`}
          className={`absolute inset-0 bg-cover bg-center transition-opacity duration-700 ease-in-out ${
            index === currentSlide ? 'opacity-100' : 'opacity-0'
          }`}
          style={{
            backgroundImage: `url('${image.url}')`,
          }}
        >
          {/* Dark overlay for better text visibility */}
          <div className="absolute inset-0 bg-black/30"></div>
        </div>
      ))}

{/* Slide Content - Bottom Left Title */}
<div className="relative h-full flex items-end">
  <div className="text-left text-white px-6 pb-6 max-w-4xl">
    <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-bold drop-shadow-lg">
      {currentImage.title}
    </h1>
  </div>
</div>


      {/* Navigation Arrows - Only show if multiple images */}
      {allImages.length > 1 && (
        <>
          {/* Previous Button */}
          <button
            onClick={goToPrevSlide}
            className="absolute left-2 sm:left-4 top-1/2 transform -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-2 sm:p-3 rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/50"
            aria-label="Previous slide"
          >
            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {/* Next Button */}
          <button
            onClick={goToNextSlide}
            className="absolute right-2 sm:right-4 top-1/2 transform -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-2 sm:p-3 rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/50"
            aria-label="Next slide"
          >
            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </>
      )}

      {/* Dots Indicator - Only show if multiple images */}
      {allImages.length > 1 && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {allImages.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-all duration-300 ${
                index === currentSlide 
                  ? 'bg-white scale-125' 
                  : 'bg-white/50 hover:bg-white/70'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Auto-play indicator */}
      {allImages.length > 1 && (
        <div >
          
        </div>
      )}

      {/* Slide counter */}
      {allImages.length > 1 && (
        <div className="absolute top-4 left-4 bg-black/50 text-white px-2 py-1 rounded text-xs">
          {currentSlide + 1} / {allImages.length}
        </div>
      )}
    </section>
  );
};

export default Slider;