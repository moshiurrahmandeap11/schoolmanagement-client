import { useEffect, useState } from "react";
import MainButton from "../../components/sharedItems/Mainbutton/Mainbutton";
import axiosInstance from "../../hooks/axiosInstance/axiosInstance";

const Results = () => {
  const [sessions, setSessions] = useState([]);
  const [classes, setClasses] = useState([]);
  const [examCategories, setExamCategories] = useState([]);
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);

  const [formData, setFormData] = useState({
    session: "",
    class: "",
    examCategory: "",
    studentId: "",
    studentName: "",
  });

  // Fetch initial data
  useEffect(() => {
    fetchSessions();
    fetchClasses();
    fetchExamCategories();
    fetchStudents();
  }, []);

  const fetchSessions = async () => {
    try {
      const response = await axiosInstance.get("/sessions");
      if (response.data.success) {
        setSessions(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching sessions:", error);
    }
  };

  const fetchClasses = async () => {
    try {
      const response = await axiosInstance.get("/class");
      if (response.data.success) {
        setClasses(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching classes:", error);
    }
  };

  const fetchExamCategories = async () => {
    try {
      const response = await axiosInstance.get("/exam-categories");
      if (response.data.success) {
        setExamCategories(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching exam categories:", error);
    }
  };

  const fetchStudents = async () => {
    try {
      const response = await axiosInstance.get("/students");
      if (response.data.success) {
        setStudents(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching students:", error);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Student search functionality
    if (field === "studentName") {
      if (value.length > 2) {
        const filtered = students.filter(
          (student) =>
            student.name?.toLowerCase().includes(value.toLowerCase()) ||
            student.studentId?.toLowerCase().includes(value.toLowerCase())
        );
        setFilteredStudents(filtered);
      } else {
        setFilteredStudents([]);
      }
    }
  };

  const handleStudentSelect = (student) => {
    setFormData((prev) => ({
      ...prev,
      studentId: student._id,
      studentName: student.name,
    }));
    setFilteredStudents([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.session ||
      !formData.class ||
      !formData.examCategory ||
      !formData.studentId
    ) {
      alert("দয়া করে সবগুলো ফিল্ড পূরণ করুন");
      return;
    }

    try {
      setLoading(true);
      const response = await axiosInstance.get("/results", {
        params: {
          session: formData.session,
          class: formData.class,
          examCategory: formData.examCategory,
          studentId: formData.studentId,
        },
      });

      if (response.data.success) {
        setResults(response.data.data);
      } else {
        setResults([]);
        alert("কোন রেজাল্ট পাওয়া যায়নি");
      }
    } catch (error) {
      console.error("Error fetching results:", error);
      alert("রেজাল্ট লোড করতে সমস্যা হয়েছে");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="bg-gray-50 py-16 px-4 sm:px-6 lg:px-20">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            পরীক্ষার ফলাফল
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            আপনার পরীক্ষার ফলাফল দেখতে নিচের তথ্যগুলো পূরণ করুন
          </p>
        </div>

        {/* Search Form */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Session Dropdown */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                সেশন *
              </label>
              <select
                value={formData.session}
                onChange={(e) => handleInputChange("session", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9]"
                required
              >
                <option value="">সিলেক্ট করুন</option>
                {sessions.map((session) => (
                  <option key={session._id} value={session._id}>
                    {session.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Class Dropdown */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ক্লাস *
              </label>
              <select
                value={formData.class}
                onChange={(e) => handleInputChange("class", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9]"
                required
              >
                <option value="">সিলেক্ট করুন</option>
                {classes.map((classItem) => (
                  <option key={classItem._id} value={classItem._id}>
                    {classItem.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Exam Category Dropdown */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                পরীক্ষা *
              </label>
              <select
                value={formData.examCategory}
                onChange={(e) =>
                  handleInputChange("examCategory", e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9]"
                required
              >
                <option value="">সিলেক্ট করুন</option>
                {examCategories.map((exam) => (
                  <option key={exam._id} value={exam._id}>
                    {exam.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Student Search */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                শিক্ষার্থীর নাম/আইডি *
              </label>
              <input
                type="text"
                value={formData.studentName}
                onChange={(e) =>
                  handleInputChange("studentName", e.target.value)
                }
                placeholder="নাম বা আইডি লিখুন"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9]"
                required
              />

              {/* Student Suggestions */}
              {filteredStudents.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {filteredStudents.map((student) => (
                    <div
                      key={student._id}
                      className="px-3 py-2 hover:bg-blue-50 cursor-pointer border-b border-gray-100"
                      onClick={() => handleStudentSelect(student)}
                    >
                      <div className="font-medium">{student.name}</div>
                      <div className="text-sm text-gray-500">
                        আইডি: {student.studentId}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="flex justify-center pt-4">
              <MainButton
                type="submit"
                disabled={loading}
              >
                {loading ? "লোড হচ্ছে..." : "ফলাফল দেখুন"}
              </MainButton>
            </div>
          </form>
        </div>

        {/* Results Table */}
        {results.length > 0 && (
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-blue-600 text-white">
                  <tr>
                    <th className="py-3 px-6 text-left">শিক্ষার্থী</th>
                    <th className="py-3 px-6 text-left">গড় নম্বর</th>
                    <th className="py-3 px-6 text-left">গ্রেড</th>
                    <th className="py-3 px-6 text-left">উপস্থিতি</th>
                    <th className="py-3 px-6 text-left">অনুপস্থিতি</th>
                  </tr>
                </thead>

                <tbody>
                  {results.map((result, index) => (
                    <tr
                      key={result._id}
                      className={index % 2 === 0 ? "bg-gray-50" : "bg-white"}
                    >
                      <td className="py-3 px-6">{result.studentName}</td>
                      <td className="py-3 px-6">{result.averageMarks}</td>
                      <td className="py-3 px-6">{result.averageLetterGrade}</td>
                      <td className="py-3 px-6">{result.totalPresent}</td>
                      <td className="py-3 px-6">{result.totalAbsent}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* No Results Message */}
        {results.length === 0 && !loading && (
          <div className="text-center py-8">
            <p className="text-gray-500 text-lg">
              ফলাফল দেখতে উপরের ফর্মটি পূরণ করুন এবং সার্চ বাটনে ক্লিক করুন
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

export default Results;
