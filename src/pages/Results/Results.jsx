import { useEffect, useState } from "react";
import MainButton from "../../components/sharedItems/Mainbutton/Mainbutton";
import axiosInstance, { baseImageURL } from "../../hooks/axiosInstance/axiosInstance";

const Results = () => {
  const [sessions, setSessions] = useState([]);
  const [classes, setClasses] = useState([]);
  const [examCategories, setExamCategories] = useState([]);
  const [allStudents, setAllStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [loading, setLoading] = useState(false);
  const [instituteInfo, setInstituteInfo] = useState(null);
  const [bannerImage, setBannerImage] = useState("");


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
    fetchInstituteInfo();
    fetchBannerImage();
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

  const fetchInstituteInfo = async () => {
    try {
      const res = await axiosInstance.get("/institute-info");
      if (res.data.success) setInstituteInfo(res.data.data);
    } catch (err) { 
      console.error("Institute info fetch error:", err);
      // Fallback institute info
      setInstituteInfo({
        logo: "",
        principalSignature: "",
        name: "মশিউর স্কুল এন্ড কলেজ",
        address: "ঢাকা, বাংলাদেশ"
      });
    }
  };

  const fetchBannerImage = async () => {
    try {
      const res = await axiosInstance.get("/banners");
      if (res.data.success && res.data.data.length > 0) {
        // প্রথম ব্যানার ইমেজ নিব
        setBannerImage(res.data.data[0].image || "");
      }
    } catch (err) { 
      console.error("Banner fetch error:", err);
    }
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
    setShowResult({ 
      ...result, 
      studentName: selectedStudent.name, 
      studentId: selectedStudent.studentId,
      classRoll: selectedStudent.classRoll,
      className: classes.find(c => c._id === selectedStudent.classId)?.name || 'N/A',
      sessionName: sessions.find(s => s._id === selectedStudent.sessionId)?.name || 'N/A'
    });
    setLoading(false);
  };

  // আবার ফর্মে ফিরে যাওয়া
  const handleBackToSearch = () => {
    setShowResult(false);
    setSelectedStudent(null);
    setFormData({ session: "", class: "", examCategory: "", studentName: "" });
    setFilteredStudents([]);
  };

  // প্রিন্ট মার্কশিট
  const handlePrintMarksheet = () => {
    window.print();
  };

  // গ্রেড কালার ফাংশন
  const getGradeColor = (grade) => {
    const gradeColors = {
      'A+': 'bg-green-100 text-green-800 border-green-200',
      'A': 'bg-green-50 text-green-700 border-green-100',
      'A-': 'bg-blue-50 text-blue-700 border-blue-100',
      'B': 'bg-yellow-50 text-yellow-700 border-yellow-100',
      'C': 'bg-orange-50 text-orange-700 border-orange-100',
      'D': 'bg-red-50 text-red-700 border-red-100',
      'F': 'bg-red-100 text-red-800 border-red-200'
    };
    return gradeColors[grade] || 'bg-gray-50 text-gray-700 border-gray-100';
  };

  // পাশ/ফেল স্ট্যাটাস
  const getPassFailStatus = (averageLetterGrade) => {
    const failGrades = ['F'];
    const passGrades = ['A+', 'A', 'A-', 'B', 'C', 'D'];
    
    if (failGrades.includes(averageLetterGrade)) {
      return { status: 'ফেল', color: 'bg-red-100 text-red-800 border-red-200' };
    } else if (passGrades.includes(averageLetterGrade)) {
      return { status: 'পাশ', color: 'bg-green-100 text-green-800 border-green-200' };
    } else {
      return { status: 'অনির্ধারিত', color: 'bg-gray-100 text-gray-800 border-gray-200' };
    }
  };

  // বিষয়ের মোট মার্কস ক্যালকুলেশন
  const calculateSubjectTotal = (subject) => {
    const cq = subject.cqMarks || 0;
    const mcq = subject.mcqMarks || 0;
    const practical = subject.practicalMarks || 0;
    return cq + mcq + practical;
  };

  return (
    <section className="bg-gray-50 py-16 px-4 sm:px-6 lg:px-20 min-h-screen">
      <div className="max-w-6xl mx-auto">

        {/* যদি রেজাল্ট দেখানো হয় */}
        {showResult ? (
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden print:shadow-none print:rounded-none">
            {/* প্রিন্ট মার্কশিট হেডার */}
            <div className="hidden print:block">
              <div className="text-center py-6 border-b-4 border-blue-800 relative">
                {/* ব্যানার ইমেজ */}
                {bannerImage && (
                  <div className="absolute inset-0 z-0">
                    <img 
                      src={`${baseImageURL}${bannerImage}`} 
                      alt="Institute Banner" 
                      className="w-full h-full object-cover opacity-15"
                    />
                  </div>
                )}
                
                {/* প্রতিষ্ঠানের তথ্য */}
                <div className="relative z-10">
                  {/* প্রতিষ্ঠানের লোগো */}
                  {instituteInfo?.logo ? (
                    <div className="w-20 h-20 mx-auto mb-3">
                      <img 
                        src={`${baseImageURL}${instituteInfo.logo}`} 
                        alt="Institute Logo" 
                        className="w-full h-full object-contain"
                      />
                    </div>
                  ) : (
                    <div className="w-20 h-20 mx-auto mb-3 bg-blue-100 rounded-full flex items-center justify-center border-4 border-blue-300">
                      <span className="text-xl font-bold text-blue-800">এম.এস</span>
                    </div>
                  )}
                  
                  <h1 className="text-2xl font-bold text-blue-900">
                    {instituteInfo?.name || "মশিউর স্কুল এন্ড কলেজ"}
                  </h1>
                  <p className="text-md text-gray-700 mt-1">
                    {instituteInfo?.address || "ঢাকা, বাংলাদেশ"}
                  </p>
                  <p className="text-lg font-semibold text-blue-800 mt-3">
                    {showResult.examCategoryName} - মার্কশিট
                  </p>
                </div>
              </div>
            </div>

            {/* ওয়েব ভিউ হেডার */}
            <div className="print:hidden bg-blue-50 text-black text-center p-6">
              <h3 className="text-2xl font-bold">{showResult.examCategoryName}</h3>
              <p className="text-black">শিক্ষার্থীর ফলাফল</p>
            </div>

            <div className="p-8 print:p-4 relative">
              {/* ওয়াটারমার্ক হিসেবে প্রতিষ্ঠানের লোগো - শুধু প্রিন্টে */}
              <div className="hidden print:block absolute inset-0 flex items-center justify-center pointer-events-none z-0">
                <div className="opacity-5 transform rotate-45">
                  {instituteInfo?.logo ? (
                    <img 
                      src={instituteInfo.logo} 
                      alt="Watermark Logo" 
                      className="w-64 h-64 object-contain"
                    />
                  ) : (
                    <div className="text-8xl font-bold text-blue-400">এম.এস</div>
                  )}
                </div>
              </div>

              <div className="relative z-10">
                {/* শিক্ষার্থীর তথ্য */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 print:grid-cols-2 print:gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg ">
                    <p className="text-sm text-gray-600">শিক্ষার্থীর নাম</p>
                    <p className="text-xl font-bold text-gray-800">{showResult.studentName}</p>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg ">
                    <p className="text-gray-600">আইডি</p>
                    <p className="text-xl font-bold text-gray-800">{showResult.studentId}</p>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg ">
                    <p className="text-sm text-gray-600">রোল নং</p>
                    <p className="text-xl font-bold text-gray-800">{showResult.classRoll || 'N/A'}</p>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg ">
                    <p className="text-sm text-gray-600">ক্লাস</p>
                    <p className="text-xl font-bold text-gray-800">{showResult.className}</p>
                  </div>
                </div>

                {/* সামারি কার্ড */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 print:grid-cols-4">
                  <div className="bg-[#1e90c9] text-white p-4 rounded-lg text-center">
                    <p className="text-sm opacity-90">গড় মার্কস</p>
                    <p className="text-3xl font-bold">{showResult.averageMarks}</p>
                  </div>
                  <div className="bg-[#1e90c9] text-white p-4 rounded-lg text-center">
                    <p className="text-sm opacity-90">গ্রেড</p>
                    <p className="text-3xl font-bold">{showResult.averageLetterGrade}</p>
                  </div>
                  <div className="bg-[#1e90c9] text-white p-4 rounded-lg text-center">
                    <p className="text-sm opacity-90">উপস্থিতি</p>
                    <p className="text-3xl font-bold">{showResult.totalPresent || 0}</p>
                  </div>
                  <div className={`p-4 rounded-lg text-center ${
                    getPassFailStatus(showResult.averageLetterGrade).status === 'পাশ' 
                      ? 'bg-[#1e90c9]' 
                      : 'bg-gradient-to-br from-red-500 to-red-600'
                  } text-white`}>
                    <p className="text-sm opacity-90">স্ট্যাটাস</p>
                    <p className="text-2xl font-bold">{getPassFailStatus(showResult.averageLetterGrade).status}</p>
                  </div>
                </div>

                {/* বিষয়ভিত্তিক মার্কস টেবিল */}
                <div className="mb-8">
                  <h3 className="text-xl font-bold text-gray-800 mb-4 text-center print:text-left">
                    বিষয়ভিত্তিক ফলাফল
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse border border-gray-300 print:border-2">
                      <thead>
                        <tr className="bg-gray-100 print:bg-gray-200">
                          <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-700">
                            বিষয়
                          </th>
                          <th className="border border-gray-300 px-4 py-3 text-center font-semibold text-gray-700">
                            CQ মার্কস
                          </th>
                          <th className="border border-gray-300 px-4 py-3 text-center font-semibold text-gray-700">
                            MCQ মার্কস
                          </th>
                          <th className="border border-gray-300 px-4 py-3 text-center font-semibold text-gray-700">
                            প্র্যাকটিক্যাল
                          </th>
                          <th className="border border-gray-300 px-4 py-3 text-center font-semibold text-gray-700">
                            মোট মার্কস
                          </th>
                          <th className="border border-gray-300 px-4 py-3 text-center font-semibold text-gray-700">
                            গ্রেড
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {showResult.subjectMarks?.map((subject, index) => (
                          <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                            <td className="border border-gray-300 px-4 py-3 font-medium text-gray-800">
                              {subject.subjectName}
                            </td>
                            <td className="border border-gray-300 px-4 py-3 text-center">
                              {subject.cqMarks || '-'}
                            </td>
                            <td className="border border-gray-300 px-4 py-3 text-center">
                              {subject.mcqMarks || '-'}
                            </td>
                            <td className="border border-gray-300 px-4 py-3 text-center">
                              {subject.practicalMarks || '-'}
                            </td>
                            <td className="border border-gray-300 px-4 py-3 text-center font-semibold text-blue-600">
                              {calculateSubjectTotal(subject)}
                            </td>
                            <td className="border border-gray-300 px-4 py-3 text-center">
                              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getGradeColor(subject.letterGrade)}`}>
                                {subject.letterGrade}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="bg-gray-100 font-semibold print:bg-gray-200">
                          <td colSpan="4" className="border border-gray-300 px-4 py-3 text-right">
                            সর্বমোট:
                          </td>
                          <td className="border border-gray-300 px-4 py-3 text-center text-green-600">
                            {showResult.subjectMarks?.reduce((total, subject) => total + calculateSubjectTotal(subject), 0)}
                          </td>
                          <td className="border border-gray-300 px-4 py-3 text-center">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold ${getGradeColor(showResult.averageLetterGrade)}`}>
                              {showResult.averageLetterGrade}
                            </span>
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>

                {/* অতিরিক্ত তথ্য */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 print:grid-cols-3">
                  <div className="text-center p-4 border border-gray-200 rounded-lg">
                    <p className="text-sm text-gray-600">অনুপস্থিতি</p>
                    <p className="text-2xl font-semibold text-red-600">{showResult.totalAbsent || 0} দিন</p>
                  </div>
                  {showResult.order && (
                    <div className="text-center p-4 border border-gray-200 rounded-lg">
                      <p className="text-sm text-gray-600">মেধা ক্রম</p>
                      <p className="text-2xl font-bold text-purple-600">#{showResult.order}</p>
                    </div>
                  )}
                  <div className="text-center p-4 border border-gray-200 rounded-lg">
                    <p className="text-sm text-gray-600">সেশন</p>
                    <p className="text-lg font-semibold text-gray-800">{showResult.sessionName}</p>
                  </div>
                </div>

                {/* প্রিন্সিপাল সিগনেচার সেকশন - শুধু প্রিন্টে দেখাবে */}
                <div className="hidden print:block mt-12 pt-8 border-t-2 border-gray-300">
                  <div className="flex justify-between items-end">
                    <div className="text-center">
                      <div className="mb-2 border-b border-gray-400 pb-1 inline-block">
                        <p className="text-sm text-gray-600">তারিখ</p>
                      </div>
                      <p className="text-gray-700">{new Date().toLocaleDateString('bn-BD')}</p>
                    </div>
                    <div className="text-center">
                      <div className="mb-2 border-b border-gray-400 pb-1 inline-block">
                        <p className="text-sm text-gray-600">প্রিন্সিপালের স্বাক্ষর</p>
                      </div>
                      {instituteInfo?.principalSignature ? (
                        <div className="h-20 w-48 mx-auto">
                          <img 
                            src={`${baseImageURL}${instituteInfo.principalSignature}`} 
                            alt="Principal Signature" 
                            className="w-full h-full object-contain"
                          />
                        </div>
                      ) : (
                        <div className="h-16 w-48 border-t border-gray-400 mx-auto"></div>
                      )}
                      <p className="text-gray-700 mt-2 font-semibold">প্রিন্সিপাল</p>
                      <p className="text-sm text-gray-600">
                        {instituteInfo?.name || "মশিউর স্কুল এন্ড কলেজ"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* অ্যাকশন বাটন - শুধু ওয়েবে দেখাবে */}
                <div className="print:hidden flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
                  <MainButton 
                    onClick={handlePrintMarksheet} 
                    className="px-8 bg-blue-600 hover:bg-blue-700"
                  >
                    প্রিন্ট মার্কশিট
                  </MainButton>
                  <MainButton 
                    onClick={handleBackToSearch} 
                    className="px-8 bg-gray-600 hover:bg-gray-700"
                  >
                    আরেকটা রেজাল্ট দেখুন
                  </MainButton>
                </div>
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
                <MainButton type="submit" disabled={loading || !selectedStudent} className="w-full text-lg py-4 flex items-center justify-center">
                  {loading ? "খুঁজছে..." : "ফলাফল দেখুন"}
                </MainButton>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* প্রিন্ট স্টাইল */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print\\:shadow-none,
          .print\\:shadow-none * {
            visibility: visible;
          }
          .print\\:shadow-none {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            background: white;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>
    </section>
  );
};

export default Results;