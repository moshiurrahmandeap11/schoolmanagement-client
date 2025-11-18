import { useEffect, useState } from "react";
import { GiHamburgerMenu } from "react-icons/gi";
import { GrDocument } from "react-icons/gr";
import { useNavigate } from "react-router";
import axiosInstance from "../../hooks/axiosInstance/axiosInstance";
import MainButton from "../sharedItems/Mainbutton/Mainbutton";

const Notices = () => {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchNotices();
  }, []);

  const fetchNotices = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get("/notices");

      if (response.data.success) {
        // Published notices only, sorted by creation date (newest first), take latest 5
        const activeNotices = response.data.data
          .filter((notice) => notice.isPublished) // Only published notices
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) // Sort by newest first
          .slice(0, 5); // Take only 5 latest
        setNotices(activeNotices);
      }
    } catch (error) {
      console.error("Error fetching notices:", error);
    } finally {
      setLoading(false);
    }
  };

// Notices.jsx - শুধু এই লাইনটি পরিবর্তন করুন
const handleNoticeClick = (id) => {
  navigate(`/notice-details/${id}`);
};

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* Header */}
      <h2 className="text-xl sm:text-xl px-4 sm:px-5 bg-[#016496] py-3 font-bold text-white leading-tight flex items-center gap-2 sm:gap-3 rounded">
        <GiHamburgerMenu className="text-white text-lg sm:text-xl flex-shrink-0" />
        নোটিশ
      </h2>

      {/* Notices List */}
      <div className="p-4">
        {loading ? (
          <div className="flex justify-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          </div>
        ) : notices.length > 0 ? (
          <div className="space-y-2">
            {notices.map((notice) => (
              <div
                key={notice._id}
                onClick={() => handleNoticeClick(notice._id)}
                className="py-1 px-2 border border-gray-200 bg-gray-50 shadow-sm rounded-md last:border-b-0  cursor-pointer transition-colors duration-150 group"
              >
                <div className="flex items-center gap-2 ">
                  <GrDocument className="text-purple-600" />
                  <p className="text-black text-sm line-clamp-2 group-hover:text-black transition-colors duration-150">
                    {notice.title}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-gray-500 text-sm">
            Notice will arrive here
            <br />
            <span className="text-xs">নোটিশ এখানে আসবে</span>
          </div>
        )}
      </div>

      {/* View All Button (Optional) */}
      {notices.length > 0 && (
        <div className="px-4 pb-4">
          <MainButton
            onClick={() => navigate("/all-notices")}
            className="flex items-center justify-center w-full rounded-md"
          >
            সব নোটিশ দেখুন
          </MainButton>
        </div>
      )}
    </div>
  );
};

export default Notices;
