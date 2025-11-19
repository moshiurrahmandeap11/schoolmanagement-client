import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import Loader from "../../../components/sharedItems/Loader/Loader";
import MainButton from "../../../components/sharedItems/Mainbutton/Mainbutton";
import axiosInstance, {
  baseImageURL,
} from "../../../hooks/axiosInstance/axiosInstance";

const AllTeachersAndWorkers = () => {
  const [teachers, setTeachers] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const scrollContainerRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  useEffect(() => {
    fetchAllData();
  }, []);

  // Auto scroll functionality
  useEffect(() => {
    if (!scrollContainerRef.current || isDragging) return;

    const container = scrollContainerRef.current;
    let scrollAmount = 0;

    const autoScroll = setInterval(() => {
      if (container) {
        scrollAmount += 1;
        container.scrollLeft = scrollAmount;

        // Reset to start when reaching end
        if (scrollAmount >= container.scrollWidth - container.clientWidth) {
          scrollAmount = 0;
        }
      }
    }, 30); // Smooth scroll speed

    return () => clearInterval(autoScroll);
  }, [isDragging, teachers.length, workers.length]);

  const fetchAllData = async () => {
    try {
      setLoading(true);

      const [teachersResponse, workersResponse] = await Promise.all([
        axiosInstance.get("/teacher-list"),
        axiosInstance.get("/workers-list"),
      ]);

      if (teachersResponse.data.success && workersResponse.data.success) {
        setTeachers(teachersResponse.data.data || []);
        setWorkers(workersResponse.data.data || []);
      } else {
        setError("Failed to load data");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setError("Failed to load teachers and workers list");
    } finally {
      setLoading(false);
    }
  };

  // Combine teachers and workers
  const allStaff = [...teachers, ...workers];

  // Duplicate staff for infinite scroll effect
  const infiniteStaff = [...allStaff, ...allStaff];

  // Mouse drag handlers
  const handleMouseDown = (e) => {
    setIsDragging(true);
    setStartX(e.pageX - scrollContainerRef.current.offsetLeft);
    setScrollLeft(scrollContainerRef.current.scrollLeft);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - scrollContainerRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    scrollContainerRef.current.scrollLeft = scrollLeft - walk;
  };

  // Touch handlers for mobile
  const handleTouchStart = (e) => {
    setIsDragging(true);
    setStartX(e.touches[0].pageX - scrollContainerRef.current.offsetLeft);
    setScrollLeft(scrollContainerRef.current.scrollLeft);
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;
    const x = e.touches[0].pageX - scrollContainerRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    scrollContainerRef.current.scrollLeft = scrollLeft - walk;
  };

  const getStaffType = (staff) => {
    if (teachers.some((teacher) => teacher._id === staff._id)) {
      return { type: "Teacher", badge: "Teacher" };
    } else {
      return { type: "Staff", badge: "Staff" };
    }
  };

  if (loading) {
    return <Loader></Loader>;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-sm border border-red-200 p-8 text-center">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Unable to Load
            </h2>
            <p className="text-red-500 mb-6">{error}</p>
            <button
              onClick={fetchAllData}
              className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (allStaff.length === 0) {
    return (
      <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
            <div className="text-6xl mb-4">👥</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              No Data Found
            </h3>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className=" py-16">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            শিক্ষক ও কর্মচারীবৃন্দ
          </h1>
        </div>

        {/* Scrollable Cards Container */}
        <div
          ref={scrollContainerRef}
          className="overflow-hidden cursor-grab active:cursor-grabbing"
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onMouseMove={handleMouseMove}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onTouchMove={handleTouchMove}
          style={{
            scrollBehavior: isDragging ? "auto" : "smooth",
            userSelect: "none",
          }}
        >
          <div className="flex gap-4 sm:gap-6" style={{ width: "max-content" }}>
            {infiniteStaff.map((staff, index) => {
              const staffType = getStaffType(staff);

              return (
                <div
                  key={`${staff._id}-${index}`}
                  className="shrink-0 w-52 sm:w-64 bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300"
                  style={{ pointerEvents: isDragging ? "none" : "auto" }}
                >
                  {/* Image Section */}
                  <div className="relative h-52 sm:h-64 bg-linear-to-br from-gray-50 to-gray-100">
                    {staff.photo ? (
                      <img
                        src={`${baseImageURL}${staff.photo}`}
                        alt={staff.name}
                        className="w-full h-full object-cover"
                        draggable="false"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="text-6xl sm:text-8xl text-gray-300">
                          {staffType.badge}
                        </div>
                      </div>
                    )}

                    {/* Type Badge */}
                    <div className="absolute top-2 left-2">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-bold ${
                          staffType.type === "Teacher"
                            ? "bg-[#1e90c9] text-white"
                            : "bg-[#1e90c9] text-white"
                        } shadow-lg`}
                      >
                        {staffType.badge}
                      </span>
                    </div>
                  </div>

                  {/* Info Section */}
                  <div className="p-4 text-center">
                    <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-1">
                      {staff.name}
                    </h3>

                    <p className="text-xs sm:text-sm text-gray-600">
                      {staff.designation}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
          <Link
            to={"/teachers-list"}
            className="flex items-center justify-end mt-6"
          >
            <MainButton>বিস্তারিত দেখুন...</MainButton>
          </Link>
      </div>

      {/* Custom Styles */}
      <style jsx>{`
        /* No custom styles needed */
      `}</style>
    </div>
  );
};

export default AllTeachersAndWorkers;
