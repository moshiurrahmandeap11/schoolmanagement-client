import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";

import { FaArrowLeft, FaCalendarAlt, FaClock, FaHistory } from "react-icons/fa";
import Loader from "../../components/sharedItems/Loader/Loader";
import MainButton from "../../components/sharedItems/Mainbutton/Mainbutton";
import axiosInstance from "../../hooks/axiosInstance/axiosInstance";

const SchoolHistoryDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [historyData, setHistoryData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch school history details by ID
  useEffect(() => {
    const fetchHistoryDetails = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await axiosInstance.get(`/school-history/${id}`);

        if (response.data.success) {
          setHistoryData(response.data.data);
        } else {
          setError("School history not found");
        }
      } catch (error) {
        console.error("Failed to fetch school history:", error);
        setError("Failed to load school history details");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchHistoryDetails();
    }
  }, [id]);

  const handleGoBack = () => {
    navigate(-1);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-BD", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString("en-BD", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };



  if (loading) {
    return <Loader></Loader>;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-linear-to-br from-gray-50 to-blue-50 flex items-center justify-center py-12">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-24 h-24 mx-auto mb-6 text-red-500">
            <FaHistory className="w-full h-full" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-3">
            History Not Found
          </h2>
          <p className="text-gray-600 mb-6 text-lg">{error}</p>
          <button
            onClick={handleGoBack}
            className="px-8 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-semibold shadow-lg hover:shadow-xl"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!historyData) {
    return (
      <div className="min-h-screen bg-linear-to-br from-gray-50 to-blue-50 flex items-center justify-center py-12">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-3">
            No History Data Found
          </h2>
          <button
            onClick={handleGoBack}
            className="px-8 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-semibold"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-blue-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <div className="mb-8">
          <button
            onClick={handleGoBack}
            className="flex items-center gap-3 text-[#1e90c9] transition-colors group"
          >
            <FaArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="text-lg font-semibold">Back to Previous Page</span>
          </button>
        </div>

        {/* Main Content Card */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
          {/* Featured Image with Gradient Overlay */}
          {historyData.image && (
            <div className="relative w-full h-80 sm:h-96 bg-gray-200">
              <img
                src={`${axiosInstance.defaults.baseURL}${historyData?.image}`}
                alt={historyData.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.style.display = "none";
                }}
              />
              {/* <div className="absolute inset-0 bg-linear-to-t from-black/30 to-transparent"></div> */}
              <div className="absolute bottom-6 left-8">
                <div className="flex items-center gap-2 text-white/90">
                  <FaHistory className="w-5 h-5" />
                  <span className="text-sm font-medium">School History</span>
                </div>
              </div>
            </div>
          )}

          {/* Content */}
          <div className="p-8">
            {/* Title Section */}
            <div className="mb-8">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 leading-tight">
                {historyData.title}
              </h1>

              {/* Meta Information */}
              <div className="flex flex-wrap items-center gap-6 text-gray-600">
                <div className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-full">
                  <FaCalendarAlt className="w-4 h-4 text-[#1e90c9]" />
                  <span className="text-sm font-medium">
                    Created: {formatDate(historyData.createdAt)}
                  </span>
                </div>
                <div className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-full">
                  <FaClock className="w-4 h-4 text-[#1e90c9]" />
                  <span className="text-sm font-medium">
                    Time: {formatTime(historyData.createdAt)}
                  </span>
                </div>
                {historyData.updatedAt !== historyData.createdAt && (
                  <div className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-full">
                    <FaClock className="w-4 h-4 text-[#1e90c9]" />
                    <span className="text-sm font-medium">
                      Updated: {formatDate(historyData.updatedAt)}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Body Content */}
            <div className="prose prose-lg sm:prose-xl max-w-none">
              <div
                className="history-content"
                dangerouslySetInnerHTML={{ __html: historyData.body }}
              />
            </div>

            {/* Additional Info Footer */}
            <div className="mt-12 pt-8 border-t border-gray-200">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="text-sm text-gray-500">
                  <p className="font-medium">
                    History ID:{" "}
                    <span className="font-mono text-gray-700">
                      {historyData._id}
                    </span>
                  </p>
                </div>
                <div className="text-sm text-gray-500">
                  <p>
                    Last modified: {formatDate(historyData.updatedAt)} at{" "}
                    {formatTime(historyData.updatedAt)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="mt-12 text-center">
          <MainButton
            onClick={handleGoBack}
          >
            <FaArrowLeft className="w-5 h-5 mr-2" />
            <span>Back to History Overview</span>
          </MainButton>
        </div>
      </div>

      {/* Custom Styles for the HTML Content */}
      <style jsx>{`
        .history-content {
          line-height: 1.8;
          color: #374151;
          font-size: 1.125rem;
        }

        .history-content h1,
        .history-content h2,
        .history-content h3,
        .history-content h4,
        .history-content h5,
        .history-content h6 {
          color: #1f2937;
          margin-top: 2em;
          margin-bottom: 0.8em;
          font-weight: 700;
          line-height: 1.3;
        }

        .history-content h1 {
          font-size: 2.5rem;
          border-bottom: 3px solid #3b82f6;
          padding-bottom: 0.5rem;
        }
        .history-content h2 {
          font-size: 2rem;
          border-left: 4px solid #3b82f6;
          padding-left: 1rem;
        }
        .history-content h3 {
          font-size: 1.75rem;
        }
        .history-content h4 {
          font-size: 1.5rem;
        }
        .history-content h5 {
          font-size: 1.25rem;
        }
        .history-content h6 {
          font-size: 1.125rem;
        }

        .history-content p {
          margin-bottom: 1.5em;
          text-align: justify;
        }

        .history-content ul,
        .history-content ol {
          margin: 1.5em 0;
          padding-left: 2em;
        }

        .history-content li {
          margin: 0.8em 0;
          padding-left: 0.5em;
        }

        .history-content ul {
          list-style-type: disc;
        }

        .history-content ul li::marker {
          color: #3b82f6;
        }

        .history-content ol {
          list-style-type: decimal;
        }

        .history-content ol li::marker {
          color: #3b82f6;
          font-weight: bold;
        }

        .history-content a {
          color: #3b82f6;
          text-decoration: none;
          font-weight: 600;
          border-bottom: 2px solid #3b82f6;
          transition: all 0.3s ease;
        }

        .history-content a:hover {
          color: #1d4ed8;
          border-bottom-color: #1d4ed8;
          background-color: #dbeafe;
          padding: 0.1rem 0.3rem;
          border-radius: 0.25rem;
        }

        .history-content strong {
          font-weight: 700;
          color: #1f2937;
          background: linear-gradient(120deg, #dbeafe 0%, #dbeafe 100%);
          background-repeat: no-repeat;
          background-size: 100% 0.4em;
          background-position: 0 88%;
        }

        .history-content em {
          font-style: italic;
          color: #6b7280;
        }

        .history-content u {
          text-decoration: underline;
          text-decoration-color: #3b82f6;
          text-decoration-thickness: 2px;
        }

        .history-content img {
          max-width: 100%;
          height: auto;
          border-radius: 12px;
          margin: 2em 0;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
          border: 1px solid #e5e7eb;
        }

        .history-content blockquote {
          border-left: 6px solid #3b82f6;
          padding: 2rem;
          margin: 2em 0;
          background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
          border-radius: 0 12px 12px 0;
          font-style: italic;
          color: #475569;
          position: relative;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
        }

        .history-content blockquote::before {
          content: '"';
          font-size: 4rem;
          color: #3b82f6;
          position: absolute;
          top: -1rem;
          left: 1rem;
          opacity: 0.3;
          font-family: serif;
        }

        .history-content code {
          background-color: #1f2937;
          color: #f9fafb;
          padding: 0.3em 0.6em;
          border-radius: 8px;
          font-family: "Monaco", "Menlo", "Ubuntu Mono", monospace;
          font-size: 0.9em;
          border: 1px solid #374151;
        }

        .history-content pre {
          background-color: #1f2937;
          color: #f9fafb;
          padding: 1.5em;
          border-radius: 12px;
          overflow-x: auto;
          margin: 2em 0;
          border: 1px solid #374151;
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
        }

        .history-content pre code {
          background: none;
          padding: 0;
          color: inherit;
          border: none;
        }

        .history-content table {
          width: 100%;
          border-collapse: collapse;
          margin: 2em 0;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          border-radius: 12px;
          overflow: hidden;
        }

        .history-content th,
        .history-content td {
          padding: 1em;
          text-align: left;
          border-bottom: 1px solid #e5e7eb;
        }

        .history-content th {
          background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
          color: white;
          font-weight: 600;
        }

        .history-content tr:nth-child(even) {
          background-color: #f8fafc;
        }

        .history-content tr:hover {
          background-color: #f1f5f9;
        }

        /* Responsive design */
        @media (max-width: 768px) {
          .history-content {
            font-size: 1rem;
          }

          .history-content h1 {
            font-size: 2rem;
          }
          .history-content h2 {
            font-size: 1.75rem;
          }
          .history-content h3 {
            font-size: 1.5rem;
          }

          .history-content blockquote {
            padding: 1.5rem;
            margin: 1.5em 0;
          }

          .history-content pre {
            padding: 1em;
          }
        }

        @media (max-width: 480px) {
          .history-content h1 {
            font-size: 1.75rem;
          }
          .history-content h2 {
            font-size: 1.5rem;
          }
          .history-content h3 {
            font-size: 1.25rem;
          }

          .history-content blockquote {
            padding: 1rem;
          }

          .history-content ul,
          .history-content ol {
            padding-left: 1.5em;
          }
        }
      `}</style>
    </div>
  );
};

export default SchoolHistoryDetails;
