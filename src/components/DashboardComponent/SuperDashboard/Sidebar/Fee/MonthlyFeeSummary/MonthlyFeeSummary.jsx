import { useEffect, useState } from "react";
import axiosInstance from "../../../../../../hooks/axiosInstance/axiosInstance";

const MonthlyFeeSummary = () => {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [data, setData] = useState({
    months: [],
    grandTotal: 0,
  });
  const [loading, setLoading] = useState(true);

  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await axiosInstance.get(
          `/collected-fee?year=${selectedYear}`
        );
        setData(res.data);
      } catch (error) {
        console.error("Error fetching fee summary:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [selectedYear]);

  return (
    <div className="w-full max-w-full mx-auto p-6 bg-white rounded-2xl shadow-md mt-10">
      <div className="text-center mb-8">
        <h2 className="text-2xl md:text-3xl font-semibold text-gray-800">
          Monthly Fee Collection Summary
        </h2>
        <p className="text-gray-500 mt-1 text-sm md:text-base">
          Comprehensive overview of fee collections by month
        </p>
      </div>

      {loading ? (
        <div className="text-center text-gray-500 py-6">Loading...</div>
      ) : (
        <div className="flex flex-col md:flex-row justify-between items-center gap-5">
          {/* Select Year */}
          <div className="flex flex-col">
            <label
              htmlFor="year"
              className="text-gray-600 font-medium mb-1 text-sm md:text-base"
            >
              Select Year
            </label>
            <select
              id="year"
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              {years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>

          {/* Active Months */}
          <div className="flex flex-col items-center">
            <p className="text-gray-600 font-medium text-sm md:text-base">
              Active Months
            </p>
            <span className="text-blue-600 font-semibold text-lg md:text-xl">
              {data?.months?.length || 0}
            </span>
          </div>

          {/* Selected Year */}
          <div className="flex flex-col items-center">
            <p className="text-gray-600 font-medium text-sm md:text-base">
              Selected Year
            </p>
            <span className="text-blue-600 font-semibold text-lg md:text-xl">
              {selectedYear}
            </span>
          </div>

          {/* Grand Total */}
          <div className="flex flex-col items-center">
            <p className="text-gray-600 font-medium text-sm md:text-base">
              Grand Total
            </p>
            <span className="text-green-600 font-semibold text-lg md:text-xl">
              ৳ {data?.grandTotal?.toLocaleString("en-US") || 0}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default MonthlyFeeSummary;
