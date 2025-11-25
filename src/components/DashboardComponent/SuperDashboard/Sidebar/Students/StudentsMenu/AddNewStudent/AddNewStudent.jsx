import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import axiosInstance, {
  baseImageURL,
} from "../../../../../../../hooks/axiosInstance/axiosInstance";

const AddNewStudent = ({ onBack, onSuccess, editData, mode = "new" }) => {
  const [formData, setFormData] = useState({
    studentId: "",
    dakhelaNumber: "",
    smartIdCard: "",
    name: "",
    birthDate: "",
    birthRegNo: "",
    gender: "",
    mobile: "",
    bloodGroup: "",
    branch: "",
    attachments: null,
    fatherName: "",
    motherName: "",
    guardianName: "",
    guardianMobile: "",
    guardianRelation: "",
    nid: "",
    permanentVillage: "",
    permanentPostOffice: "",
    permanentDistrict: "",
    permanentThana: "",
    currentSameAsPermanent: false,
    currentVillage: "",
    currentPostOffice: "",
    currentDistrict: "",
    currentThana: "",
    classId: "",
    className: "",
    batchId: "",
    batchName: "",
    sectionId: "",
    sectionName: "",
    sessionId: "",
    sessionName: "",
    classRoll: "",
    position: "",
    studentType: "Non-Residential",
    mentorId: "",
    note: "",
    admissionFee: 0,
    monthlyFee: 0,
    previousDues: 0,
    sessionFee: 0,
    boardingFee: 0,
    otherFee: 0,
    transportFee: 0,
    residenceFee: 0,
    sendAdmissionSMS: true,
    sendAttendanceSMS: false,
    studentSerial: "",
  });

  const [image, setImage] = useState(null);
  const [existingImage, setExistingImage] = useState("");
  const [loading, setLoading] = useState(false);

  // Dropdown data
  const [classes, setClasses] = useState([]);
  const [batches, setBatches] = useState([]);
  const [sections, setSections] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [teachers, setTeachers] = useState([]);

  useEffect(() => {
    const fetchDropdowns = async () => {
      try {
        const endpoints = [
          "/class",
          "/batches",
          "/sections",
          "/sessions",
          "/teacher-list",
        ];
        const responses = await Promise.all(
          endpoints.map((ep) => axiosInstance.get(ep))
        );

        const extract = (res) =>
          Array.isArray(res.data)
            ? res.data
            : res.data?.data || res.data?.result || [];

        setClasses(extract(responses[0]));
        setBatches(extract(responses[1]));
        setSections(extract(responses[2]));
        setSessions(extract(responses[3]));
        setTeachers(extract(responses[4]));
      } catch (err) {
        console.error(err);
        setClasses([]);
        setBatches([]);
        setSections([]);
        setSessions([]);
        setTeachers([]);
      }
    };

    fetchDropdowns();
  }, []);

  // Edit mode এ data preload
  useEffect(() => {
    if (mode === "edit" && editData) {
      loadEditData();
    }
  }, [mode, editData]);

  const loadEditData = () => {
    if (!editData) return;

    // Basic information
    setFormData({
      studentId: editData.studentId || "",
      dakhelaNumber: editData.dakhelaNumber || "",
      smartIdCard: editData.smartIdCard || "",
      name: editData.name || "",
      birthDate: editData.birthDate ? editData.birthDate.split('T')[0] : "",
      birthRegNo: editData.birthRegNo || "",
      gender: editData.gender || "",
      mobile: editData.mobile || "",
      bloodGroup: editData.bloodGroup || "",
      branch: editData.branch || "",
      attachments: null,
      fatherName: editData.fatherName || "",
      motherName: editData.motherName || "",
      guardianName: editData.guardianName || "",
      guardianMobile: editData.guardianMobile || "",
      guardianRelation: editData.guardianRelation || "",
      nid: editData.nid || "",
      permanentVillage: editData.permanentVillage || "",
      permanentPostOffice: editData.permanentPostOffice || "",
      permanentDistrict: editData.permanentDistrict || "",
      permanentThana: editData.permanentThana || "",
      currentSameAsPermanent: editData.currentSameAsPermanent || false,
      currentVillage: editData.currentVillage || "",
      currentPostOffice: editData.currentPostOffice || "",
      currentDistrict: editData.currentDistrict || "",
      currentThana: editData.currentThana || "",
      classId: editData.classId || "",
      className: editData.className || "",
      batchId: editData.batchId || "",
      batchName: editData.batchName || "",
      sectionId: editData.sectionId || "",
      sectionName: editData.sectionName || "",
      sessionId: editData.sessionId || "",
      sessionName: editData.sessionName || "",
      classRoll: editData.classRoll || "",
      position: editData.position || "Active",
      studentType: editData.studentType || "Non-Residential",
      mentorId: editData.mentorId || "",
      note: editData.note || "",
      admissionFee: editData.admissionFee || 0,
      monthlyFee: editData.monthlyFee || 0,
      previousDues: editData.previousDues || 0,
      sessionFee: editData.sessionFee || 0,
      boardingFee: editData.boardingFee || 0,
      otherFee: editData.otherFee || 0,
      transportFee: editData.transportFee || 0,
      residenceFee: editData.residenceFee || 0,
      sendAdmissionSMS: editData.sendAdmissionSMS !== undefined ? editData.sendAdmissionSMS : true,
      sendAttendanceSMS: editData.sendAttendanceSMS || false,
      studentSerial: editData.studentSerial || "",
    });

    // Existing image
    if (editData.photo) {
      setExistingImage(`${baseImageURL}${editData.photo}`);
    }
  };

  // Auto generate Student ID (only for new mode)
  useEffect(() => {
    if (mode === "new" && formData.name && formData.birthDate) {
      const id = Math.floor(1000 + Math.random() * 9000);
      setFormData((prev) => ({ ...prev, studentId: `ps-${id}` }));
    }
  }, [formData.name, formData.birthDate, mode]);

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;

    if (type === "checkbox") {
      if (name === "currentSameAsPermanent") {
        setFormData((prev) => ({
          ...prev,
          currentSameAsPermanent: checked,
          currentVillage: checked ? prev.permanentVillage : "",
          currentPostOffice: checked ? prev.permanentPostOffice : "",
          currentDistrict: checked ? prev.permanentDistrict : "",
          currentThana: checked ? prev.permanentThana : "",
        }));
      } else {
        setFormData((prev) => ({ ...prev, [name]: checked }));
      }
    } else if (type === "file") {
      setImage(files[0]);
      setExistingImage(""); // নতুন ছবি আপলোড করলে পুরানো ছবি hide হবে
    } else if (name === "classId") {
      const selected = classes.find((c) => c._id === value);
      setFormData((prev) => ({
        ...prev,
        classId: value,
        className: selected?.name || "",
      }));
    } else if (name === "batchId") {
      const selected = batches.find((b) => b._id === value);
      setFormData((prev) => ({
        ...prev,
        batchId: value,
        batchName: selected?.name || "",
      }));
    } else if (name === "sectionId") {
      const selected = sections.find((s) => s._id === value);
      setFormData((prev) => ({
        ...prev,
        sectionId: value,
        sectionName: selected?.name || "",
      }));
    } else if (name === "sessionId") {
      const selected = sessions.find((s) => s._id === value);
      const displayName =
        selected?.year ||
        selected?.name ||
        selected?.sessionName ||
        selected?.title ||
        "";
      setFormData((prev) => ({
        ...prev,
        sessionId: value,
        sessionName: displayName,
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const data = new FormData();
    Object.keys(formData).forEach((key) => {
      if (formData[key] !== null && formData[key] !== undefined) {
        data.append(key, formData[key]);
      }
    });
    if (image) data.append("photo", image);

    try {
      let response;
      
      if (mode === "edit" && editData) {
        // Edit mode - PUT request
        response = await axiosInstance.put(`/students/${editData._id}`, data, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        // New mode - POST request
        response = await axiosInstance.post("/students", data, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      const successMessage = mode === "edit" 
        ? "শিক্ষার্থীর তথ্য সফলভাবে আপডেট করা হয়েছে" 
        : "শিক্ষার্থী সফলভাবে যোগ করা হয়েছে";

      const result = await Swal.fire({
        title: "অভিনন্দন!",
        text: successMessage,
        icon: "success",
        showCancelButton: true,
        confirmButtonText: "প্রিন্ট করুন",
        cancelButtonText: "ওকে",
        confirmButtonColor: "#1e90c9",
        cancelButtonColor: "#6b7280",
        reverseButtons: true,
      });

      if (result.isConfirmed) {
        printStudentInfo(response.data.data);
      } else {
        if (onSuccess) {
          onSuccess();
        } 
      }
    } catch (err) {
      console.error(err);
      Swal.fire({
        title: "দুঃখিত!",
        text:
          err.response?.data?.message || 
          (mode === "edit" ? "শিক্ষার্থী আপডেট করতে সমস্যা হয়েছে" : "শিক্ষার্থী যোগ করতে সমস্যা হয়েছে"),
        icon: "error",
        confirmButtonColor: "#ef4444",
      });
    } finally {
      setLoading(false);
    }
  };

  const printStudentInfo = (student) => {
    const printWindow = window.open("", "_blank");
    const photoUrl = student.photo ? `${baseImageURL}${student.photo}` : '';

    printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>শিক্ষার্থীর তথ্য - ${student.name}</title>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Kalpurush', Arial, sans-serif; padding: 30px; line-height: 1.6; }
        .container { max-width: 800px; margin: 0 auto; border: 2px solid #1e90c9; padding: 30px; border-radius: 10px; }
        h1 { color: #1e90c9; text-align: center; margin-bottom: 10px; }
        h2 { color: #1e90c9; border-bottom: 2px solid #1e90c9; padding-bottom: 5px; }
        .info { margin: 15px 0; }
        .label { font-weight: bold; color: #1e90c9; }
        .photo { text-align: center; margin: 20px 0; }
        .photo img { width: 150px; height: 150px; border-radius: 50%; border: 4px solid #1e90c9; object-fit: cover; }
        table { width: 100%; border-collapse: collapse; margin: 15px 0; }
        td { padding: 8px; border: 1px solid #ddd; }
        .text-center { text-align: center; }
        @page { margin: 1cm; }
        @media print {
          body { padding: 10px; }
          .no-print { display: none; }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>শিক্ষার্থীর বিস্তারিত তথ্য</h1>
        <div class="text-center"><small>প্রিন্ট তারিখ: ${new Date().toLocaleDateString("bn-BD")}</small></div>

        ${photoUrl ? `
        <div class="photo">
          <img src="${photoUrl}" alt="Student Photo" onerror="this.style.display='none'">
        </div>
        ` : ''}

        <p class="text-center"><strong>আইডি:</strong> ${
          student.studentId || "N/A"
        }</p>

        <h2>ব্যক্তিগত তথ্য</h2>
        <table>
          <tr><td class="label">নাম</td><td>${student.name}</td></tr>
          <tr><td class="label">জন্ম তারিখ</td><td>${
            student.birthDate || "N/A"
          }</td></tr>
          <tr><td class="label">লিঙ্গ</td><td>${
            student.gender === "Male"
              ? "পুরুষ"
              : student.gender === "Female"
              ? "মহিলা"
              : "অন্যান্য"
          }</td></tr>
          <tr><td class="label">রক্তের গ্রুপ</td><td>${
            student.bloodGroup || "N/A"
          }</td></tr>
          <tr><td class="label">মোবাইল</td><td>${
            student.mobile || "N/A"
          }</td></tr>
        </table>

        <h2>পারিবারিক তথ্য</h2>
        <table>
          <tr><td class="label">পিতার নাম</td><td>${
            student.fatherName
          }</td></tr>
          <tr><td class="label">মাতার নাম</td><td>${
            student.motherName
          }</td></tr>
          <tr><td class="label">অভিভাবক</td><td>${
            student.guardianName || "N/A"
          }</td></tr>
        </table>

        <h2>শিক্ষা সংক্রান্ত তথ্য</h2>
        <table>
          <tr><td class="label">ক্লাস</td><td>${
            student.className || "N/A"
          }</td></tr>
          <tr><td class="label">সেশন</td><td>${
            student.sessionName || "N/A"
          }</td></tr>
          <tr><td class="label">রোল</td><td>${student.classRoll}</td></tr>
          <tr><td class="label">অবস্থান</td><td>${getPositionLabel(
            student.position
          )}</td></tr>
        </table>

        <h2>ফি তথ্য</h2>
        <table>
          <tr><td class="label">ভর্তি ফি</td><td>${
            student.admissionFee || 0
          } টাকা</td></tr>
          <tr><td class="label">মাসিক ফি</td><td>${
            student.monthlyFee || 0
          } টাকা</td></tr>
          <tr><td class="label">পূর্বের বকেয়া</td><td>${
            student.previousDues || 0
          } টাকা</td></tr>
        </table>
      </div>

      <script>
        window.onload = function() {
          window.print();
          window.onafterprint = function() {
            window.close();
          };
        };
      </script>
    </body>
    </html>
  `);

    printWindow.document.close();
  };

  // Helper function for position label
  const getPositionLabel = (position) => {
    const labels = {
      Active: "সক্রিয়",
      Inactive: "নিষ্ক্রিয়",
      "Admission Pending": "ভর্তি অপেক্ষমাণ",
      "Admission Rejected": "ভর্তি বাতিল",
      Expelled: "বহিষ্কৃত",
      "Moved To Another Institute": "অন্য প্রতিষ্ঠানে স্থানান্তরিত",
    };
    return labels[position] || position;
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      window.history.back();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={handleBack}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            <h1 className="text-2xl font-bold text-gray-800">
              {mode === "edit" ? "শিক্ষার্থী এডিট করুন" : "নতুন শিক্ষার্থী যোগ করুন"}
            </h1>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg p-6">
          {/* Personal Information */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2 border-[#1e90c9]">
              ব্যক্তিগত তথ্য
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  শিক্ষার্থীর আইডি {mode === "new" && "*"}
                </label>
                <input
                  type="text"
                  name="studentId"
                  value={formData.studentId}
                  onChange={handleChange}
                  required={mode === "new"}
                  disabled={mode === "edit"}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9] disabled:bg-gray-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Dakhela Number
                </label>
                <input
                  name="dakhelaNumber"
                  value={formData.dakhelaNumber}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Smart ID Card
                </label>
                <input
                  name="smartIdCard"
                  value={formData.smartIdCard}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  নাম <span className="text-red-500">*</span>
                </label>
                <input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  জন্ম তারিখ <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="birthDate"
                  value={formData.birthDate}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  জন্ম নিবন্ধন নং
                </label>
                <input
                  name="birthRegNo"
                  value={formData.birthRegNo}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  লিঙ্গ <span className="text-red-500">*</span>
                </label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9]"
                >
                  <option value="">নির্বাচন করুন</option>
                  <option value="Male">পুরুষ</option>
                  <option value="Female">মহিলা</option>
                  <option value="Other">অন্যান্য</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  মোবাইল
                </label>
                <input
                  name="mobile"
                  value={formData.mobile}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Blood Group
                </label>
                <select
                  name="bloodGroup"
                  value={formData.bloodGroup}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9]"
                >
                  <option value="">নির্বাচন করুন</option>
                  {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  শাখা
                </label>
                <select
                  name="branch"
                  value={formData.branch}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9]"
                >
                  <option value="">নির্বাচন করুন</option>
                  <option value="cadet">ক্যাডেট শাখা</option>
                  <option value="other">অন্যান্য শাখা</option>
                </select>
              </div>

              <div className="md:col-span-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ছবি আপলোড
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9]"
                />
                {existingImage && (
                  <div className="mt-2">
                    <p className="text-sm text-gray-600 mb-2">বর্তমান ছবি:</p>
                    <img 
                      src={existingImage} 
                      alt="Current" 
                      className="w-20 h-20 object-cover rounded-lg border"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Rest of the form sections remain the same as before */}
          {/* Family Information, Address Information, Academic Information, Fee Information, Other Settings */}

          {/* Family Information */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2 border-[#1e90c9]">
              পারিবারিক তথ্য
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  পিতার নাম <span className="text-red-500">*</span>
                </label>
                <input
                  name="fatherName"
                  value={formData.fatherName}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  মাতার নাম <span className="text-red-500">*</span>
                </label>
                <input
                  name="motherName"
                  value={formData.motherName}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  অভিভাবকের নাম
                </label>
                <input
                  name="guardianName"
                  value={formData.guardianName}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  অভিভাবকের মোবাইল
                </label>
                <input
                  name="guardianMobile"
                  value={formData.guardianMobile}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  সম্পর্ক
                </label>
                <input
                  name="guardianRelation"
                  value={formData.guardianRelation}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  জাতীয় পরিচয়পত্র (পিতা/মাতা/অভিভাবক)
                </label>
                <input
                  name="nid"
                  value={formData.nid}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9]"
                />
              </div>
            </div>
          </div>

          {/* Address Information - Same as before */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2 border-[#1e90c9]">
              ঠিকানা
            </h2>
            
            {/* Permanent Address */}
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-700 mb-3">স্থায়ী ঠিকানা</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    গ্রাম <span className="text-red-500">*</span>
                  </label>
                  <input
                    placeholder="গ্রাম"
                    name="permanentVillage"
                    value={formData.permanentVillage}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ডাকঘর <span className="text-red-500">*</span>
                  </label>
                  <input
                    placeholder="ডাকঘর"
                    name="permanentPostOffice"
                    value={formData.permanentPostOffice}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    জেলা
                  </label>
                  <input
                    placeholder="জেলা"
                    name="permanentDistrict"
                    value={formData.permanentDistrict}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    থানা
                  </label>
                  <input
                    placeholder="থানা"
                    name="permanentThana"
                    value={formData.permanentThana}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9]"
                  />
                </div>
              </div>
            </div>

            {/* Same Address Checkbox */}
            <div className="mb-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="currentSameAsPermanent"
                  checked={formData.currentSameAsPermanent}
                  onChange={handleChange}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">বর্তমান ঠিকানা স্থায়ী ঠিকানার মতো একই</span>
              </label>
            </div>

            {/* Current Address */}
            <div>
              <h3 className="text-lg font-medium text-gray-700 mb-3">বর্তমান ঠিকানা</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    গ্রাম <span className="text-red-500">*</span>
                  </label>
                  <input
                    placeholder="গ্রাম"
                    name="currentVillage"
                    value={formData.currentVillage}
                    onChange={handleChange}
                    required
                    disabled={formData.currentSameAsPermanent}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9] disabled:bg-gray-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ডাকঘর <span className="text-red-500">*</span>
                  </label>
                  <input
                    placeholder="ডাকঘর"
                    name="currentPostOffice"
                    value={formData.currentPostOffice}
                    onChange={handleChange}
                    required
                    disabled={formData.currentSameAsPermanent}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9] disabled:bg-gray-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    জেলা
                  </label>
                  <input
                    placeholder="জেলা"
                    name="currentDistrict"
                    value={formData.currentDistrict}
                    onChange={handleChange}
                    disabled={formData.currentSameAsPermanent}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9] disabled:bg-gray-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    থানা
                  </label>
                  <input
                    placeholder="থানা"
                    name="currentThana"
                    value={formData.currentThana}
                    onChange={handleChange}
                    disabled={formData.currentSameAsPermanent}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9] disabled:bg-gray-100"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Academic Information */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2 border-[#1e90c9]">
              শিক্ষা সংক্রান্ত তথ্য
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ক্লাস <span className="text-red-500">*</span>
                </label>
                <select
                  name="classId"
                  value={formData.classId}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9]"
                >
                  <option value="">নির্বাচন করুন</option>
                  {classes.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ব্যাচ
                </label>
                <select
                  name="batchId"
                  value={formData.batchId}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9]"
                >
                  <option value="">নির্বাচন করুন</option>
                  {batches.map((b) => (
                    <option key={b._id} value={b._id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  সেকশন
                </label>
                <select
                  name="sectionId"
                  value={formData.sectionId}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9]"
                >
                  <option value="">নির্বাচন করুন</option>
                  {sections.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  সেশন <span className="text-red-500">*</span>
                </label>
                <select
                  name="sessionId"
                  value={formData.sessionId}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9]"
                >
                  <option value="">-- সেশন নির্বাচন করুন --</option>
                  {sessions.map((session) => {
                    const display =
                      session.year ||
                      session.name ||
                      session.sessionName ||
                      session.title ||
                      "অজানা";
                    return (
                      <option key={session._id} value={session._id}>
                        {display}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ক্লাস রোল <span className="text-red-500">*</span>
                </label>
                <input
                  name="classRoll"
                  value={formData.classRoll}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  অবস্থান <span className="text-red-500">*</span>
                </label>
                <select
                  name="position"
                  value={formData.position}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9]"
                >
                  <option value="">-- অবস্থান নির্বাচন করুন --</option>
                  <option value="Active">Active (সক্রিয়)</option>
                  <option value="Inactive">Inactive (নিষ্ক্রিয়)</option>
                  <option value="Admission Pending">Admission Pending (ভর্তি অপেক্ষমাণ)</option>
                  <option value="Admission Rejected">Admission Rejected (ভর্তি বাতিল)</option>
                  <option value="Expelled">Expelled (বহিষ্কৃত)</option>
                  <option value="Moved To Another Institute">Moved To Another Institute (অন্য প্রতিষ্ঠানে স্থানান্তরিত)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Student Type
                </label>
                <select
                  name="studentType"
                  value={formData.studentType}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9]"
                >
                  <option value="Non-Residential">Non-Residential</option>
                  <option value="Residential">Residential</option>
                  <option value="Day Care">Day Care</option>
                  <option value="Boarding">Boarding</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Academic Mentor
                </label>
                <select
                  name="mentorId"
                  value={formData.mentorId}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9]"
                >
                  <option value="">নির্বাচন করুন</option>
                  {teachers.map((t) => (
                    <option key={t._id} value={t._id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  অতিরিক্ত নোট
                </label>
                <textarea
                  name="note"
                  rows="3"
                  value={formData.note}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9]"
                ></textarea>
              </div>
            </div>
          </div>

          {/* Fee Information */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2 border-[#1e90c9]">
              ফি সংক্রান্ত তথ্য
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { key: "admissionFee", label: "ভর্তি ফি" },
                { key: "monthlyFee", label: "মাসিক ফি" },
                { key: "previousDues", label: "পূর্বের বকেয়া" },
                { key: "sessionFee", label: "সেশন ফি" },
                { key: "boardingFee", label: "বোর্ডিং ফি" },
                { key: "otherFee", label: "অন্যান্য ফি" },
                { key: "transportFee", label: "পরিবহন ফি" },
                { key: "residenceFee", label: "আবাসিক ফি" },
              ].map((fee) => (
                <div key={fee.key}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {fee.label}
                  </label>
                  <input
                    type="number"
                    name={fee.key}
                    value={formData[fee.key]}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9]"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Other Settings */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2 border-[#1e90c9]">
              অন্যান্য সেটিংস
            </h2>
            <div className="flex flex-wrap gap-6">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="sendAdmissionSMS"
                  checked={formData.sendAdmissionSMS}
                  onChange={handleChange}
                />
                <span className="text-sm text-gray-700">Send Admission SMS</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="sendAttendanceSMS"
                  checked={formData.sendAttendanceSMS}
                  onChange={handleChange}
                />
                <span className="text-sm text-gray-700">Send Attendance SMS</span>
              </label>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Student Serial
                </label>
                <input
                  name="studentSerial"
                  value={formData.studentSerial}
                  onChange={handleChange}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9]"
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={handleBack}
              className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors font-medium"
            >
              বাতিল করুন
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-[#1e90c9] text-white rounded-lg hover:bg-blue-600 transition-colors font-medium disabled:opacity-50"
            >
              {loading 
                ? "সাবমিট হচ্ছে..." 
                : mode === "edit" 
                  ? "আপডেট করুন" 
                  : "শিক্ষার্থী যোগ করুন"
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddNewStudent;