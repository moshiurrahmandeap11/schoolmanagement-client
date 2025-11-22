import { useEffect, useState } from "react";
import MainButton from "../../components/sharedItems/Mainbutton/Mainbutton";
import axiosInstance from "../../hooks/axiosInstance/axiosInstance";

const Results = () => {
  const [sessions, setSessions] = useState([]);
  const [classes, setClasses] = useState([]);
  const [examCategories, setExamCategories] = useState([]);
  const [allStudents, setAllStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showResult, setShowResult] = useState(false); // নতুন স্টেট
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    session: "",
    class: "",
    examCategory: "",
    studentName: "",
  });

  // Fetch all data
  useEffect(() => {
    fetchSessions();
    fetchClasses();
    fetchExamCategories();
    fetchAllStudents();
  }, []);

  const fetchSessions = async () => {
    try {
      const res = await axiosInstance.get("/sessions");
      if (res.data.success) setSessions(res.data.data);
    } catch (err) { console.error(err); }
  };

  const fetchClasses = async () => {
    try {
      const res = await axiosInstance.get("/class");
      if (res.data.success) setClasses(res.data.data);
    } catch (err) { console.error(err); }
  };

  const fetchExamCategories = async () => {
    try {
      const res = await axiosInstance.get("/exam-categories");
      if (res.data.success) setExamCategories(res.data.data);
    } catch (err) { console.error(err); }
  };

  const fetchAllStudents = async () => {
    try {
      const res = await axiosInstance.get("/students");
      if (res.data.success) setAllStudents(res.data.data);
    } catch (err) { console.error(err); }
  };

  const getFilteredStudentsForSuggestions = () => {
    let students = allStudents;

    if (formData.session) students = students.filter(s => s.sessionId === formData.session);
    if (formData.class) students = students.filter(s => s.classId === formData.class);
    if (formData.examCategory) {
      students = students.filter(student =>
        student.results?.some(r => typeof r === 'object' && r.examCategoryId === formData.examCategory)
      );
    }
    return students;
  };

  const handleStudentNameChange = (value) => {
    setFormData(prev => ({ ...prev, studentName: value }));

    if (value.length >= 2) {
      const filtered = getFilteredStudentsForSuggestions().filter(s =>
        s.name.toLowerCase().includes(value.toLowerCase()) ||
        s.studentId.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredStudents(filtered);
    } else {
      setFilteredStudents([]);
    }
  };

  const handleStudentSelect = (student) => {
    setSelectedStudent(student);
    setFormData(prev => ({ ...prev, studentName: student.name }));
    setFilteredStudents([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedStudent || !formData.examCategory) return;

    setLoading(true);

    const result = selectedStudent.results?.find(r =>
      typeof r === 'object' && r.examCategoryId === formData.examCategory
    );

    if (!result) {
      alert("এই পরীক্ষার জন্য কোনো ফলাফল পাওয়া যায়নি");
      setLoading(false);
      return;
    }

    // রেজাল্ট পাওয়া গেলে ফর্ম গায়েব, টেবিল দেখাবে
    setShowResult({ ...result, studentName: selectedStudent.name, studentId: selectedStudent.studentId });
    setLoading(false);
  };

  // আবার ফর্মে ফিরে যাওয়া
  const handleBackToSearch = () => {
    setShowResult(false);
    setSelectedStudent(null);
    setFormData({ session: "", class: "", examCategory: "", studentName: "" });
    setFilteredStudents([]);
  };

  return (
    <section className="bg-gray-50 py-16 px-4 sm:px-6 lg:px-20 min-h-screen">
      <div className="max-w-4xl mx-auto">

        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">পরীক্ষার ফলাফল</h2>
        </div>

        {/* যদি রেজাল্ট দেখানো হয় */}
        {showResult ? (
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className=" text-center p-6">
              <h3 className="text-2xl font-bold">{showResult.examCategoryName}</h3>
              <p className="">শিক্ষার্থীর ফলাফল</p>
            </div>

            <div className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div>
                  <p className="text-sm text-gray-600">শিক্ষার্থীর নাম</p>
                  <p className="text-xl font-bold text-gray-800">{showResult.studentName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">আইডি</p>
                  <p className="text-xl font-bold text-gray-800">{showResult.studentId}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">গড় মার্কস</p>
                  <p className="text-3xl font-bold text-blue-600">{showResult.averageMarks}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">গ্রেড</p>
                  <p className="text-3xl font-bold text-green-600">{showResult.averageLetterGrade}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">মোট উপস্থিতি</p>
                  <p className="text-2xl font-semibold text-gray-800">{showResult.totalPresent || 0}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">মোট অনুপস্থিতি</p>
                  <p className="text-2xl font-semibold text-red-600">{showResult.totalAbsent || 0}</p>
                </div>
                {showResult.order && (
                  <div>
                    <p className="text-sm text-gray-600">মেধা ক্রম</p>
                    <p className="text-2xl font-bold text-purple-600">#{showResult.order}</p>
                  </div>
                )}
                {showResult.marksheet && (
                  <div className="md:col-span-2">
                    <p className="text-sm text-gray-600">মার্কশিট</p>
                    <a href={showResult.marksheet} target="_blank" rel="noopener noreferrer"
                       className="inline-block mt-2 px-5 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                      মার্কশিট ডাউনলোড করুন
                    </a>
                  </div>
                )}
              </div>

              <div className="text-center pt-6">
                <MainButton onClick={handleBackToSearch} className="px-8">
                  আরেকটা রেজাল্ট দেখুন
                </MainButton>
              </div>
            </div>
          </div>
        ) : (
          /* ফর্ম দেখাবে */
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <form onSubmit={handleSubmit} className="space-y-6">

              {/* Session */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">সেশন *</label>
                <select
                  value={formData.session}
                  onChange={(e) => setFormData(prev => ({ ...prev, session: e.target.value, studentName: "", examCategory: "" }))}
                  className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#1e90c9]"
                  required
                >
                  <option value="">সেশন সিলেক্ট করুন</option>
                  {sessions.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                </select>
              </div>

              {/* Class */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">ক্লাস *</label>
                <select
                  value={formData.class}
                  onChange={(e) => setFormData(prev => ({ ...prev, class: e.target.value, studentName: "" }))}
                  className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#1e90c9]"
                  required
                >
                  <option value="">ক্লাস সিলেক্ট করুন</option>
                  {classes.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                </select>
              </div>

              {/* Exam */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">পরীক্ষা *</label>
                <select
                  value={formData.examCategory}
                  onChange={(e) => setFormData(prev => ({ ...prev, examCategory: e.target.value, studentName: "" }))}
                  className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#1e90c9]"
                  required
                >
                  <option value="">পরীক্ষা সিলেক্ট করুন</option>
                  {examCategories.map(exam => <option key={exam._id} value={exam._id}>{exam.name}</option>)}
                </select>
              </div>

              {/* Student Search */}
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-2">শিক্ষার্থীর নাম / আইডি *</label>
                <input
                  type="text"
                  value={formData.studentName}
                  onChange={(e) => handleStudentNameChange(e.target.value)}
                  placeholder="নাম বা আইডি লিখুন..."
                  className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#1e90c9]"
                  required
                />
                {filteredStudents.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-2xl max-h-64 overflow-y-auto">
                    {filteredStudents.map(student => (
                      <div
                        key={student._id}
                        onClick={() => handleStudentSelect(student)}
                        className="px-4 py-3 hover:bg-blue-50 cursor-pointer border-b"
                      >
                        <div className="font-semibold">{student.name}</div>
                        <div className="text-sm text-gray-600">আইডি: {student.studentId} | রোল: {student.classRoll}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-6">
                <MainButton type="submit" disabled={loading || !selectedStudent} className="w-full text-lg py-4 flex icons-center justify-center">
                  {loading ? "খুঁজছে..." : "ফলাফল দেখুন"}
                </MainButton>
              </div>
            </form>
          </div>
        )}
      </div>
    </section>
  );
};

export default Results;