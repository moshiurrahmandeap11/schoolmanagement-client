import { useEffect, useState } from "react";
import { FaDeleteLeft } from "react-icons/fa6";
import Swal from "sweetalert2";
import axiosInstance, {
  baseImageURL,
} from "../../../../../hooks/axiosInstance/axiosInstance";
import Loader from "../../../../sharedItems/Loader/Loader";
import MainButton from "../../../../sharedItems/Mainbutton/Mainbutton";

const TeacherListAdmin = () => {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState(null);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [showSubjectManager, setShowSubjectManager] = useState(false);
  const [newSubject, setNewSubject] = useState("");
  const [subjects, setSubjects] = useState([
    "Bangla",
    "English",
    "Mathematics",
    "Physics",
    "Chemistry",
    "Biology",
    "Higher Mathematics",
    "Social Science",
    "Religion",
    "ICT",
    "Accounting",
    "Finance",
    "Business Studies",
    "Economics",
    "Geography",
    "History",
  ]);

  // Filter states
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    search: "",
    session: "",
    mobile: "",
    staffType: "",
    position: "",
  });

  // Form state with ALL NEW FIELDS
  const [formData, setFormData] = useState({
    // Personal Information
    teacherId: "",
    personalPhone: "",
    teacherSerial: "",
    teacherEmail: "",
    smartId: "",
    bloodGroup: "",
    name: "",
    gender: "Male",
    englishName: "",
    photo: "",
    dob: "",

    // Address Information
    permanentVillage: "",
    permanentPostOffice: "",
    permanentThana: "",
    permanentDistrict: "",
    currentVillage: "",
    currentPostOffice: "",
    currentThana: "",
    currentDistrict: "",
    sameAsPermanent: false,

    // Professional Information
    designation: "",
    monthlySalary: "",
    department: "",
    staffType: "Teacher",
    joiningDate: "",
    residenceType: "Permanent",

    // Additional Information
    guardianPhone: "",
    youtubeChannel: "",
    facebookProfile: "",
    position: "Active",
    twitterProfile: "",
    language: "Bangla",

    // Session Information
    session: "",

    // Certificate Information
    certificateName1: "",
    certificateImage1: "",
    certificateName2: "",
    certificateImage2: "",

    // Existing fields
    fingerId: "",
    biboron: "",
    salary: "",
  });

  const [sessions, setSessions] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [certificateFile1, setCertificateFile1] = useState(null);
  const [certificateFile2, setCertificateFile2] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    const fetchingSessions = async () => {
      try {
        const res = await axiosInstance.get("/sessions");
        setSessions(res.data.data);
      } catch {
        Swal.fire("failed to get sessions");
      }
    };
    fetchingSessions();
  }, []);

  // Fetch teachers
  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get("/teacher-list");

      if (response.data.success) {
        setTeachers(response.data.data);
      } else {
        showSweetAlert(
          "error",
          response.data.message || "Failed to load teachers"
        );
      }
    } catch (error) {
      console.error("Error fetching teachers:", error);
      showSweetAlert("error", "Failed to load teachers list: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const showSweetAlert = (icon, title, text = "") => {
    Swal.fire({
      icon,
      title,
      text,
      toast: true,
      position: "top-end",
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
    });
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: "", text: "" }), 5000);
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      setFormData((prev) => ({
        ...prev,
        [name]: checked
      }));

      // Handle same as permanent address
      if (name === 'sameAsPermanent' && checked) {
        setFormData(prev => ({
          ...prev,
          currentVillage: prev.permanentVillage,
          currentPostOffice: prev.permanentPostOffice,
          currentThana: prev.permanentThana,
          currentDistrict: prev.permanentDistrict
        }));
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Apply filters
  const applyFilters = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get("/teacher-list/search/filter", {
        params: filters,
      });

      if (response.data.success) {
        setTeachers(response.data.data);
        showSweetAlert("success", "Filters applied successfully!");
      }
    } catch (error) {
      console.error("Error applying filters:", error);
      showSweetAlert("error", "Failed to apply filters");
    } finally {
      setLoading(false);
    }
  };

  // Clear filters
  const clearFilters = () => {
    setFilters({
      search: "",
      session: "",
      mobile: "",
      staffType: "",
      position: "",
    });
    fetchTeachers();
    showSweetAlert("info", "Filters cleared!");
  };

  // Handle file selection for profile photo
  const handleFileSelect = (e) => {
    const file = e.target.files[0];

    if (file) {
      const allowedTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/gif",
      ];
      if (!allowedTypes.includes(file.type)) {
        showSweetAlert(
          "error",
          "Please select a valid image file (JPEG, PNG, GIF)"
        );
        return;
      }

      if (file.size > 2 * 1024 * 1024) {
        showSweetAlert("error", "Image size should be less than 2MB");
        return;
      }

      setSelectedFile(file);

      const reader = new FileReader();
      reader.onload = (e) => {
        setFormData((prev) => ({ ...prev, photo: e.target.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle certificate file selection
  const handleCertificateFileSelect = (e, certificateNumber) => {
    const file = e.target.files[0];

    if (file) {
      const allowedTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/gif",
        "application/pdf"
      ];
      if (!allowedTypes.includes(file.type)) {
        showSweetAlert(
          "error",
          "Please select a valid file (JPEG, PNG, GIF, PDF)"
        );
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        showSweetAlert("error", "File size should be less than 5MB");
        return;
      }

      if (certificateNumber === 1) {
        setCertificateFile1(file);
        const reader = new FileReader();
        reader.onload = (e) => {
          setFormData((prev) => ({ ...prev, certificateImage1: e.target.result }));
        };
        reader.readAsDataURL(file);
      } else {
        setCertificateFile2(file);
        const reader = new FileReader();
        reader.onload = (e) => {
          setFormData((prev) => ({ ...prev, certificateImage2: e.target.result }));
        };
        reader.readAsDataURL(file);
      }
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      // Personal Information
      teacherId: "",
      personalPhone: "",
      teacherSerial: "",
      teacherEmail: "",
      smartId: "",
      bloodGroup: "",
      name: "",
      gender: "Male",
      englishName: "",
      photo: "",
      dob: "",

      // Address Information
      permanentVillage: "",
      permanentPostOffice: "",
      permanentThana: "",
      permanentDistrict: "",
      currentVillage: "",
      currentPostOffice: "",
      currentThana: "",
      currentDistrict: "",
      sameAsPermanent: false,

      // Professional Information
      designation: "",
      monthlySalary: "",
      department: "",
      staffType: "Teacher",
      joiningDate: "",
      residenceType: "Permanent",

      // Additional Information
      guardianPhone: "",
      youtubeChannel: "",
      facebookProfile: "",
      position: "Active",
      twitterProfile: "",
      language: "Bangla",

      // Session Information
      session: "",

      // Certificate Information
      certificateName1: "",
      certificateImage1: "",
      certificateName2: "",
      certificateImage2: "",

      // Existing fields
      fingerId: "",
      biboron: "",
      salary: "",
    });
    setSelectedFile(null);
    setCertificateFile1(null);
    setCertificateFile2(null);
    setUploadProgress(0);
    setEditingTeacher(null);
    setShowForm(false);
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.name.trim() || !formData.personalPhone.trim()) {
      showSweetAlert(
        "error",
        "Please fill in all required fields (Name, Personal Phone)"
      );
      return;
    }

    const mobileRegex = /^[0-9]{11}$/;
    if (!mobileRegex.test(formData.personalPhone)) {
      showSweetAlert("error", "Please enter a valid 11-digit mobile number");
      return;
    }

    try {
      setLoading(true);

      const submitFormData = new FormData();

      // Append all form data
      Object.keys(formData).forEach((key) => {
        if (key !== "photo" && key !== "certificateImage1" && key !== "certificateImage2") {
          submitFormData.append(key, formData[key]);
        }
      });

      if (selectedFile) {
        submitFormData.append("photo", selectedFile);
      }
      if (certificateFile1) {
        submitFormData.append("certificateImage1", certificateFile1);
      }
      if (certificateFile2) {
        submitFormData.append("certificateImage2", certificateFile2);
      }

      let response;

      if (editingTeacher) {
        response = await axiosInstance.put(
          `/teacher-list/${editingTeacher._id}`,
          submitFormData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
      } else {
        response = await axiosInstance.post("/teacher-list", submitFormData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
      }

      if (response.data.success) {
        showSweetAlert(
          "success",
          editingTeacher
            ? "Teacher updated successfully!"
            : "Teacher added successfully!"
        );
        resetForm();
        fetchTeachers();
      } else {
        showSweetAlert(
          "error",
          response.data.message || "Failed to save teacher"
        );
      }
    } catch (error) {
      console.error("Error saving teacher:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to save teacher";
      showSweetAlert("error", errorMessage);
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  // Edit teacher
  const handleEdit = (teacher) => {
    setEditingTeacher(teacher);
    setFormData({
      // Personal Information
      teacherId: teacher.teacherId || "",
      personalPhone: teacher.personalPhone || "",
      teacherSerial: teacher.teacherSerial || "",
      teacherEmail: teacher.teacherEmail || "",
      smartId: teacher.smartId || "",
      bloodGroup: teacher.bloodGroup || "",
      name: teacher.name || "",
      gender: teacher.gender || "Male",
      englishName: teacher.englishName || "",
      photo: teacher.photo || "",
      dob: teacher.dob || "",

      // Address Information
      permanentVillage: teacher.permanentVillage || "",
      permanentPostOffice: teacher.permanentPostOffice || "",
      permanentThana: teacher.permanentThana || "",
      permanentDistrict: teacher.permanentDistrict || "",
      currentVillage: teacher.currentVillage || "",
      currentPostOffice: teacher.currentPostOffice || "",
      currentThana: teacher.currentThana || "",
      currentDistrict: teacher.currentDistrict || "",
      sameAsPermanent: teacher.sameAsPermanent || false,

      // Professional Information
      designation: teacher.designation || "",
      monthlySalary: teacher.monthlySalary || "",
      department: teacher.department || "",
      staffType: teacher.staffType || "Teacher",
      joiningDate: teacher.joiningDate || "",
      residenceType: teacher.residenceType || "Permanent",

      // Additional Information
      guardianPhone: teacher.guardianPhone || "",
      youtubeChannel: teacher.youtubeChannel || "",
      facebookProfile: teacher.facebookProfile || "",
      position: teacher.position || "Active",
      twitterProfile: teacher.twitterProfile || "",
      language: teacher.language || "Bangla",

      // Session Information
      session: teacher.session || "",

      // Certificate Information
      certificateName1: teacher.certificateName1 || "",
      certificateImage1: teacher.certificateImage1 || "",
      certificateName2: teacher.certificateName2 || "",
      certificateImage2: teacher.certificateImage2 || "",

      // Existing fields
      fingerId: teacher.fingerId || "",
      biboron: teacher.biboron || "",
      salary: teacher.salary || "",
    });
    setSelectedFile(null);
    setCertificateFile1(null);
    setCertificateFile2(null);
    setShowForm(true);
  };

  // Delete teacher
  const handleDelete = async (teacherId) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      try {
        setLoading(true);
        const response = await axiosInstance.delete(
          `/teacher-list/${teacherId}`
        );

        if (response.data.success) {
          showSweetAlert("success", "Teacher deleted successfully!");
          fetchTeachers();
        } else {
          showSweetAlert(
            "error",
            response.data.message || "Failed to delete teacher"
          );
        }
      } catch (error) {
        console.error("Error deleting teacher:", error);
        const errorMessage =
          error.response?.data?.message || "Failed to delete teacher";
        showSweetAlert("error", errorMessage);
      } finally {
        setLoading(false);
      }
    }
  };

  // Add new subject
  const handleAddSubject = () => {
    if (newSubject.trim() && !subjects.includes(newSubject.trim())) {
      setSubjects((prev) => [...prev, newSubject.trim()]);
      setNewSubject("");
      showSweetAlert("success", "Subject added successfully!");
    } else {
      showSweetAlert("error", "Subject already exists or is empty");
    }
  };

  // Remove subject
  const handleRemoveSubject = (subjectToRemove) => {
    if (subjects.length > 1) {
      setSubjects((prev) =>
        prev.filter((subject) => subject !== subjectToRemove)
      );
      showSweetAlert("success", "Subject removed successfully!");
    } else {
      showSweetAlert("error", "Cannot remove the last subject");
    }
  };

  // Common designations
  const designations = [
    "Headmaster",
    "Assistant Headmaster",
    "Senior Teacher",
    "Teacher",
    "Assistant Teacher",
    "Guest Teacher",
    "Principal",
    "Vice Principal",
    "Coordinator",
  ];

  // Staff types
  const staffTypes = ["Teacher", "Staff"];

  // Position types
  const positions = ["Active", "Transferred", "Retired", "Deactivated"];

  // Blood groups
  const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

  // Languages
  const languages = ["Bangla", "English", "Arabic", "Hindi", "Urdu"];

  // Residence types
  const residenceTypes = ["Permanent", "Temporary", "Contractual"];

  // Departments
  const departments = [
    "Science",
    "Commerce",
    "Arts",
    "Mathematics",
    "English",
    "Bangla",
    "ICT",
    "Religion",
    "Physical Education"
  ];

  // Get filtered teachers (client-side filtering as fallback)
  const filteredTeachers = teachers.filter((teacher) => {
    const matchesSearch =
      !filters.search ||
      teacher.smartId?.toLowerCase().includes(filters.search.toLowerCase()) ||
      teacher.fingerId?.toLowerCase().includes(filters.search.toLowerCase()) ||
      teacher.name?.toLowerCase().includes(filters.search.toLowerCase()) ||
      teacher.teacherId?.toLowerCase().includes(filters.search.toLowerCase());

    const matchesMobile =
      !filters.mobile || teacher.personalPhone?.includes(filters.mobile);

    const matchesStaffType =
      !filters.staffType || teacher.staffType === filters.staffType;

    const matchesPosition =
      !filters.position || teacher.position === filters.position;

    const matchesSession =
      !filters.session || teacher.session?.includes(filters.session);

    return (
      matchesSearch &&
      matchesMobile &&
      matchesStaffType &&
      matchesPosition &&
      matchesSession
    );
  });

  const totalTeachers = teachers.length;
  const activeTeachers = teachers.filter((t) => t.position === "Active").length;

  return (
    <div className="max-w-full mx-auto p-4 sm:p-6">
      {/* Header with Summary */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
            Teacher/Staff Management
          </h1>
          <div className="flex flex-wrap gap-4 text-sm text-gray-600">
            <div className="bg-[#1e90c9] text-white px-3 py-1 rounded-lg">
              <strong>Total Teacher/Staff:</strong> {totalTeachers}
            </div>
            <div className="bg-green-50 px-3 py-1 rounded-lg">
              <strong>Active:</strong> {activeTeachers}
            </div>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 mt-4 lg:mt-0">
          <MainButton onClick={() => setShowSubjectManager(true)}>
            Manage Subjects
          </MainButton>
          <MainButton onClick={() => setShowForm(true)}>
            <span>+</span>
            NEW TEACHER / STAFF
          </MainButton>
        </div>
      </div>

      {/* Filters Section */}
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 mb-6">
        <div className="p-4 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors font-medium flex items-center gap-2"
            >
              Toggle Filters
            </button>
          </div>
        </div>

        {showFilters && (
          <div className="p-4 bg-gray-50 border-t border-gray-200">
            {/* Search and Filter Inputs in one line */}
            <div className="grid grid-cols-1 lg:grid-cols-6 gap-4 mb-4">
              <div className="lg:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Search (Name, ID)
                </label>
                <input
                  type="text"
                  name="search"
                  value={filters.search}
                  onChange={handleFilterChange}
                  placeholder="Search by name, smart ID, finger ID..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Session
                </label>
                <input
                  type="text"
                  name="session"
                  value={filters.session}
                  onChange={handleFilterChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9]"
                  placeholder="2024"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mobile
                </label>
                <input
                  type="text"
                  name="mobile"
                  value={filters.mobile}
                  onChange={handleFilterChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9]"
                  placeholder="01XXXXXXXXX"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Staff Type
                </label>
                <select
                  name="staffType"
                  value={filters.staffType}
                  onChange={handleFilterChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9]"
                >
                  <option value="">All Types</option>
                  {staffTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Position
                </label>
                <select
                  name="position"
                  value={filters.position}
                  onChange={handleFilterChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Positions</option>
                  {positions.map((position) => (
                    <option key={position} value={position}>
                      {position}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Apply and Clear buttons on right side */}
            <div className="flex justify-end gap-2">
              <MainButton
                onClick={applyFilters}
                className="px-4 py-2 text-white rounded-lg transition-colors font-medium"
              >
                Apply Filters
              </MainButton>
              <button
                onClick={clearFilters}
                className="px-4 py-2 cursor-pointer bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors font-medium"
              >
                Clear Filters
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Subject Manager Modal */}
      {showSubjectManager && (
        <div className="fixed inset-0 bg-black/40 bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-800">
                Manage Subjects
              </h2>
            </div>
            <div className="p-6">
              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  placeholder="Enter new subject"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9]"
                />
                <MainButton onClick={handleAddSubject} className="rounded-md">
                  Add
                </MainButton>
              </div>
              <div className="max-h-60 overflow-y-auto">
                {subjects.map((subject, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 border-b border-gray-200"
                  >
                    <span className="text-gray-700">{subject}</span>
                    <button
                      onClick={() => handleRemoveSubject(subject)}
                      className="text-red-500 hover:text-red-700 transition-colors"
                    >
                      <FaDeleteLeft className="cursor-pointer"></FaDeleteLeft>
                    </button>
                  </div>
                ))}
              </div>
            </div>
            <div className="p-4 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => setShowSubjectManager(false)}
                className="px-4 py-2 bg-gray-500 cursor-pointer text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Teacher Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 bg-opacity-50 z-50 flex md:mt-16 items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-800">
                {editingTeacher
                  ? "Edit Teacher/Staff"
                  : "Add New Teacher/Staff"}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Personal Information Section */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">
                  Personal Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Teacher ID
                    </label>
                    <input
                      type="text"
                      name="teacherId"
                      value={formData.teacherId}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9]"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Personal Phone *
                    </label>
                    <input
                      type="tel"
                      name="personalPhone"
                      value={formData.personalPhone}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9]"
                      placeholder="01XXXXXXXXX"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Teacher Serial
                    </label>
                    <input
                      type="text"
                      name="teacherSerial"
                      value={formData.teacherSerial}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9]"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Teacher Email
                    </label>
                    <input
                      type="email"
                      name="teacherEmail"
                      value={formData.teacherEmail}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9]"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Smart ID
                    </label>
                    <input
                      type="text"
                      name="smartId"
                      value={formData.smartId}
                      onChange={handleInputChange}
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
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9]"
                    >
                      <option value="">Select Blood Group</option>
                      {bloodGroups.map((group) => (
                        <option key={group} value={group}>
                          {group}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9]"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Gender
                    </label>
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9]"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      English Name
                    </label>
                    <input
                      type="text"
                      name="englishName"
                      value={formData.englishName}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9]"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date of Birth
                    </label>
                    <input
                      type="date"
                      name="dob"
                      value={formData.dob}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9]"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Profile Photo
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9]"
                    />
                    {formData.photo && (
                      <div className="mt-2">
                        <img
                          src={formData.photo.startsWith('data:') ? formData.photo : `${baseImageURL}${formData.photo}`}
                          alt="Preview"
                          className="w-20 h-20 object-cover rounded-lg border"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Address Information Section */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">
                  Address Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Permanent Address */}
                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-700">Permanent Address</h4>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Village
                      </label>
                      <input
                        type="text"
                        name="permanentVillage"
                        value={formData.permanentVillage}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9]"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Post Office
                      </label>
                      <input
                        type="text"
                        name="permanentPostOffice"
                        value={formData.permanentPostOffice}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9]"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Thana
                      </label>
                      <input
                        type="text"
                        name="permanentThana"
                        value={formData.permanentThana}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9]"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        District
                      </label>
                      <input
                        type="text"
                        name="permanentDistrict"
                        value={formData.permanentDistrict}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9]"
                      />
                    </div>
                  </div>

                  {/* Current Address */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-gray-700">Current Address</h4>
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          name="sameAsPermanent"
                          checked={formData.sameAsPermanent}
                          onChange={handleInputChange}
                          className="mr-2"
                        />
                        <label className="text-sm text-gray-700">Same as Permanent</label>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Village
                      </label>
                      <input
                        type="text"
                        name="currentVillage"
                        value={formData.currentVillage}
                        onChange={handleInputChange}
                        disabled={formData.sameAsPermanent}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9] disabled:bg-gray-100"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Post Office
                      </label>
                      <input
                        type="text"
                        name="currentPostOffice"
                        value={formData.currentPostOffice}
                        onChange={handleInputChange}
                        disabled={formData.sameAsPermanent}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9] disabled:bg-gray-100"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Thana
                      </label>
                      <input
                        type="text"
                        name="currentThana"
                        value={formData.currentThana}
                        onChange={handleInputChange}
                        disabled={formData.sameAsPermanent}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9] disabled:bg-gray-100"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        District
                      </label>
                      <input
                        type="text"
                        name="currentDistrict"
                        value={formData.currentDistrict}
                        onChange={handleInputChange}
                        disabled={formData.sameAsPermanent}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9] disabled:bg-gray-100"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Professional Information Section */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">
                  Professional Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Designation
                    </label>
                    <select
                      name="designation"
                      value={formData.designation}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9]"
                    >
                      <option value="">Select Designation</option>
                      {designations.map((designation) => (
                        <option key={designation} value={designation}>
                          {designation}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Monthly Salary
                    </label>
                    <input
                      type="number"
                      name="monthlySalary"
                      value={formData.monthlySalary}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9]"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Department
                    </label>
                    <select
                      name="department"
                      value={formData.department}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9]"
                    >
                      <option value="">Select Department</option>
                      {departments.map((dept) => (
                        <option key={dept} value={dept}>
                          {dept}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Staff Type
                    </label>
                    <select
                      name="staffType"
                      value={formData.staffType}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9]"
                    >
                      {staffTypes.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Joining Date
                    </label>
                    <input
                      type="date"
                      name="joiningDate"
                      value={formData.joiningDate}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9]"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Residence Type
                    </label>
                    <select
                      name="residenceType"
                      value={formData.residenceType}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9]"
                    >
                      {residenceTypes.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Additional Information Section */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">
                  Additional Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Guardian's Phone
                    </label>
                    <input
                      type="tel"
                      name="guardianPhone"
                      value={formData.guardianPhone}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9]"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      YouTube Channel
                    </label>
                    <input
                      type="url"
                      name="youtubeChannel"
                      value={formData.youtubeChannel}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9]"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Facebook Profile
                    </label>
                    <input
                      type="url"
                      name="facebookProfile"
                      value={formData.facebookProfile}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9]"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Position
                    </label>
                    <select
                      name="position"
                      value={formData.position}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9]"
                    >
                      {positions.map((position) => (
                        <option key={position} value={position}>
                          {position}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Twitter Profile
                    </label>
                    <input
                      type="url"
                      name="twitterProfile"
                      value={formData.twitterProfile}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9]"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Language
                    </label>
                    <select
                      name="language"
                      value={formData.language}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9]"
                    >
                      {languages.map((language) => (
                        <option key={language} value={language}>
                          {language}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

{/* Session Information Section */}
<div className="bg-gray-50 p-4 rounded-lg">
  <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">
    Session Information
  </h3>
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-2">
        Active Session *
      </label>
      <select
        name="session"
        value={formData.session || ""}   // ← এখানে || "" দিয়ে safe করা
        onChange={handleInputChange}
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9] focus:border-[#1e90c9] transition bg-white text-gray-900"
        required
      >
        <option value="" disabled>
          সেশন নির্বাচন করুন
        </option>
        {sessions && sessions.length > 0 ? (
          sessions.map((session) => (
            <option key={session._id} value={session.year}>
              {session.year} ({session.name || 'Session'})
            </option>
          ))
        ) : (
          <option disabled>কোনো সেশন পাওয়া যায়নি</option>
        )}
      </select>
      {/* যদি sessions লোড না হয় তাহলে দেখাবে */}
      {sessions.length === 0 && (
        <p className="text-red-500 text-xs mt-1">সেশন লোড হচ্ছে বা কোনো সেশন নেই</p>
      )}
    </div>
  </div>
</div>

              {/* Certificate Information Section */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">
                  Certificate Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Certificate 1 */}
                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-700">Certificate 1</h4>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Name of certificate / academic ID / others
                      </label>
                      <input
                        type="text"
                        name="certificateName1"
                        value={formData.certificateName1}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9]"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Image of certificate / academic ID / others
                      </label>
                      <input
                        type="file"
                        accept="image/*,application/pdf"
                        onChange={(e) => handleCertificateFileSelect(e, 1)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9]"
                      />
                      {formData.certificateImage1 && (
                        <div className="mt-2">
                          {formData.certificateImage1.startsWith('data:image/') ? (
                            <img
                              src={formData.certificateImage1}
                              alt="Certificate Preview"
                              className="w-20 h-20 object-cover rounded-lg border"
                            />
                          ) : (
                            <div className="text-blue-600 text-sm">
                              Certificate file uploaded
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Certificate 2 */}
                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-700">Certificate 2</h4>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Name of certificate / academic ID / others
                      </label>
                      <input
                        type="text"
                        name="certificateName2"
                        value={formData.certificateName2}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9]"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Image of certificate / academic ID / others
                      </label>
                      <input
                        type="file"
                        accept="image/*,application/pdf"
                        onChange={(e) => handleCertificateFileSelect(e, 2)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9]"
                      />
                      {formData.certificateImage2 && (
                        <div className="mt-2">
                          {formData.certificateImage2.startsWith('data:image/') ? (
                            <img
                              src={formData.certificateImage2}
                              alt="Certificate Preview"
                              className="w-20 h-20 object-cover rounded-lg border"
                            />
                          ) : (
                            <div className="text-blue-600 text-sm">
                              Certificate file uploaded
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Existing Fields Section */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">
                  Other Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Finger ID
                    </label>
                    <input
                      type="text"
                      name="fingerId"
                      value={formData.fingerId}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9]"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      বিবরণ (Description)
                    </label>
                    <textarea
                      name="biboron"
                      value={formData.biboron}
                      onChange={handleInputChange}
                      rows="3"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9]"
                      placeholder="Additional information about the teacher/staff"
                    />
                  </div>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
                <MainButton
                  type="submit"
                  disabled={loading}
                  className="rounded-md flex-1 flex items-center justify-center"
                >
                  {loading
                    ? "Saving..."
                    : editingTeacher
                    ? "Update Teacher/Staff"
                    : "Add Teacher/Staff"}
                </MainButton>
                <button
                  type="button"
                  onClick={resetForm}
                  disabled={loading}
                  className="flex-1 px-4 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50 transition-colors font-medium"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

{/* Teachers List */}
<div className="bg-white rounded-lg shadow-lg border border-gray-200">
  {/* Loading State */}
  {loading && !showForm && (
      <Loader></Loader>
  )}

  {/* Empty State */}
  {!loading && filteredTeachers.length === 0 && (
    <div className="p-8 text-center">
      <div className="text-6xl mb-4">👨‍🏫</div>
      <h3 className="text-xl font-semibold text-gray-800 mb-2">
        No Teachers/Staff Found
      </h3>
      <p className="text-gray-600 mb-4">
        Get started by adding your first teacher/staff member.
      </p>
      <MainButton
        onClick={() => setShowForm(true)}
      >
        Add Teacher/Staff
      </MainButton>
    </div>
  )}

  {/* Teachers Table */}
  {!loading && filteredTeachers.length > 0 && (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[800px]">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
              আইডি
            </th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
              Smart ID
            </th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
              নাম
            </th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
              মোবাইল
            </th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
              পদবি
            </th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
              বেতন
            </th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
              অবস্থান
            </th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
              ছবি
            </th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
              এডিট / ডিলিট
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {filteredTeachers.map((teacher) => (
            <tr key={teacher._id} className="hover:bg-gray-50 transition-colors">
              <td className="px-4 py-3 text-sm text-gray-900 font-medium">
                {teacher.teacherId || teacher._id?.toString().substring(18, 24) || "N/A"}
              </td>
              <td className="px-4 py-3 text-sm text-gray-900">
                {teacher.smartId || "N/A"}
              </td>
              <td className="px-4 py-3">
                <div>
                  <p className="font-medium text-gray-800 text-sm">
                    {teacher.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {teacher.staffType} • {teacher.department || "N/A"}
                  </p>
                </div>
              </td>
              <td className="px-4 py-3 text-sm text-gray-600">
                {teacher.personalPhone || teacher.mobile || "N/A"}
              </td>
              <td className="px-4 py-3 text-sm">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-[#1e90c9] text-white">
                  {teacher.designation || "N/A"}
                </span>
              </td>
              <td className="px-4 py-3 text-sm text-gray-600 font-medium">
                {teacher.monthlySalary ? `৳${teacher.monthlySalary}` : teacher.salary ? `৳${teacher.salary}` : "N/A"}
              </td>
              <td className="px-4 py-3 text-sm">
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                    teacher.position === "Active"
                      ? "bg-green-100 text-green-800 border border-green-200"
                      : teacher.position === "Transferred"
                      ? "bg-yellow-100 text-yellow-800 border border-yellow-200"
                      : teacher.position === "Retired"
                      ? "bg-blue-100 text-blue-800 border border-blue-200"
                      : "bg-red-100 text-red-800 border border-red-200"
                  }`}
                >
                  {teacher.position || "Active"}
                </span>
              </td>
              <td className="px-4 py-3">
                {teacher.photo ? (
                  <img
                    src={`${baseImageURL}${teacher.photo}`}
                    alt={teacher.name}
                    className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                {!teacher.photo && (
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-sm">
                    <span className="text-white font-bold text-sm">
                      {teacher.name?.charAt(0).toUpperCase() || "U"}
                    </span>
                  </div>
                )}
              </td>
              <td className="px-4 py-3">
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(teacher)}
                    className="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-xs font-medium flex items-center gap-1"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    এডিট
                  </button>
                  <button
                    onClick={() => handleDelete(teacher._id)}
                    className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-xs font-medium flex items-center gap-1"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    ডিলিট
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )}
</div>

      {/* Summary */}
      {filteredTeachers.length > 0 && (
        <div className="mt-4 text-sm text-gray-600">
          Showing {filteredTeachers.length} of {totalTeachers} teachers/staff |
          Active: {activeTeachers} | Teachers:{" "}
          {teachers.filter((t) => t.staffType === "Teacher").length} | Staff:{" "}
          {teachers.filter((t) => t.staffType === "Staff").length}
        </div>
      )}
    </div>
  );
};

export default TeacherListAdmin;