import { useEffect, useState } from "react";
import { FaHistory } from "react-icons/fa";
import { useNavigate } from "react-router";
import Loader from "../../../components/sharedItems/Loader/Loader";
import MainButton from "../../../components/sharedItems/Mainbutton/Mainbutton";
import axiosInstance from "../../../hooks/axiosInstance/axiosInstance";

const HistorySchool = () => {
  const navigate = useNavigate();
  const [historyData, setHistoryData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch school history data
  useEffect(() => {
    const fetchSchoolHistory = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get("/school-history");

        if (response.data.success && response.data.data) {
          setHistoryData(response.data.data);
        } else {
          setError("No school history found");
        }
      } catch (error) {
        console.error("Failed to fetch school history:", error);
        setError("Failed to load school history");
      } finally {
        setLoading(false);
      }
    };

    fetchSchoolHistory();
  }, []);

  // Strip HTML tags and get first 20 words
  const getFirst20Words = (htmlContent) => {
    if (!htmlContent) return "";

    // Remove HTML tags
    const text = htmlContent.replace(/<[^>]*>/g, " ");
    // Remove extra spaces and get words
    const words = text.trim().split(/\s+/);
    // Get first 20 words
    return words.slice(0, 60).join(" ") + (words.length > 20 ? "..." : "");
  };

  const handleReadMore = () => {
    if (historyData && historyData._id) {
      navigate(`/school-history/${historyData._id}`);
    }
  };

  if (loading) {
    return <Loader></Loader>;
  }

  if (error || !historyData) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 text-center">
        <div className="text-gray-500 mb-4">
          <svg
            className="w-16 h-16 mx-auto"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">
          No History Available
        </h3>
        <p className="text-gray-600">
          School history information will be added soon.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-md shadow-sm border border-gray-200 overflow-hidden transition-all duration-300">
      <h2 className="text-xl my-2 mx-2 px-5 bg-[#016496] sm:text-xl py-3 font-bold text-white leading-tight flex items-center gap-2 rounded">
        <FaHistory className="text-white text-xl" />
        {historyData.title}
      </h2>

      {/* Content */}
      <div className="px-3 pb-2">
        {/* Body Preview (First 20 words) */}
        <div className="mb-2">
          <p className="text-gray-700 text-lg leading-relaxed">
            {getFirst20Words(historyData.body)}
          </p>
        </div>

        {/* Read More Button */}
        <MainButton
          onClick={handleReadMore}
        >
          <span> আরো জানুন...</span>
        </MainButton>
      </div>
    </div>
  );
};

export default HistorySchool;
