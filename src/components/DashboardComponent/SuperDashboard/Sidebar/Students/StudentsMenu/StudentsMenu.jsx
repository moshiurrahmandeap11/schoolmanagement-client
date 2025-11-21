import { useEffect, useState } from 'react';
import { FaArrowLeft, FaEdit, FaMoneyBill, FaPlus, FaPrint, FaSearch, FaTrash } from 'react-icons/fa';
import Swal from 'sweetalert2';
import axiosInstance, { baseImageURL } from '../../../../../../hooks/axiosInstance/axiosInstance';
import Loader from '../../../../../sharedItems/Loader/Loader';
import MainButton from '../../../../../sharedItems/Mainbutton/Mainbutton';
import AddNewStudent from './AddNewStudent/AddNewStudent';

const StudentsMenu = ({ onBack }) => {
    const [activeComponent, setActiveComponent] = useState('list');
    const [loading, setLoading] = useState(true);
    const [students, setStudents] = useState([]);
    const [classes, setClasses] = useState([]);
    const [totalStudents, setTotalStudents] = useState(0);
    const [filterData, setFilterData] = useState({
        search: '',
        classId: ''
    });
    const [editingStudent, setEditingStudent] = useState(null);

    useEffect(() => {
        if (activeComponent === 'list') {
            fetchStudents();
            fetchClasses();
        }
    }, [activeComponent]);

    const fetchStudents = async (filters = {}) => {
        try {
            setLoading(true);
            const params = new URLSearchParams();
            
            if (filters.search) params.append('search', filters.search);
            if (filters.classId) params.append('classId', filters.classId);

            const response = await axiosInstance.get(`/students?${params}`);
            
            if (response.data.success) {
                setStudents(response.data.data || []);
                setTotalStudents(response.data.total || 0);
            } else {
                showSweetAlert('error', response.data.message || 'শিক্ষার্থী লোড করতে সমস্যা হয়েছে');
            }
        } catch (error) {
            console.error('Error fetching students:', error);
            showSweetAlert('error', 'শিক্ষার্থী লোড করতে সমস্যা হয়েছে');
        } finally {
            setLoading(false);
        }
    };

    const fetchClasses = async () => {
        try {
            const response = await axiosInstance.get('/class');
            if (response.data.success) {
                setClasses(response.data.data || []);
            }
        } catch (error) {
            console.error('Error fetching classes:', error);
        }
    };

    const showSweetAlert = (icon, title, text = '') => {
        Swal.fire({
            icon,
            title,
            text,
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true,
        });
    };

    const handlePrint = (student) => {
        // Create a new window for printing
        const printWindow = window.open('', '_blank');
        
        // Format the student data for printing
        const printContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Student Information - ${student.name}</title>
                <style>
                    body {
                        font-family: 'Arial', sans-serif;
                        margin: 20px;
                        color: #333;
                        line-height: 1.6;
                    }
                    .header {
                        text-align: center;
                        border-bottom: 3px solid #1e90c9;
                        padding-bottom: 20px;
                        margin-bottom: 30px;
                    }
                    .header h1 {
                        color: #1e90c9;
                        margin: 0;
                        font-size: 28px;
                    }
                    .header .subtitle {
                        color: #666;
                        font-size: 16px;
                    }
                    .student-info {
                        display: grid;
                        grid-template-columns: 1fr 1fr;
                        gap: 30px;
                        margin-bottom: 30px;
                    }
                    .section {
                        margin-bottom: 25px;
                    }
                    .section-title {
                        background: #1e90c9;
                        color: white;
                        padding: 10px 15px;
                        margin: 0;
                        border-radius: 5px;
                        font-size: 18px;
                    }
                    .info-grid {
                        display: grid;
                        grid-template-columns: 1fr 1fr;
                        gap: 15px;
                        margin-top: 15px;
                    }
                    .info-item {
                        margin-bottom: 10px;
                    }
                    .info-label {
                        font-weight: bold;
                        color: #555;
                        display: block;
                        margin-bottom: 2px;
                    }
                    .info-value {
                        color: #333;
                    }
                    .photo-section {
                        text-align: center;
                        grid-column: 1 / -1;
                    }
                    .student-photo {
                        max-width: 200px;
                        max-height: 200px;
                        border: 2px solid #ddd;
                        border-radius: 10px;
                    }
                    .fees-section {
                        background: #f8f9fa;
                        padding: 15px;
                        border-radius: 8px;
                        border-left: 4px solid #1e90c9;
                    }
                    .fee-item {
                        display: flex;
                        justify-content: space-between;
                        margin-bottom: 8px;
                        padding-bottom: 8px;
                        border-bottom: 1px solid #eee;
                    }
                    .fee-total {
                        font-weight: bold;
                        font-size: 18px;
                        color: #1e90c9;
                        border-top: 2px solid #1e90c9;
                        padding-top: 10px;
                        margin-top: 10px;
                    }
                    @media print {
                        body { margin: 0; }
                        .no-print { display: none; }
                    }
                    .footer {
                        text-align: center;
                        margin-top: 40px;
                        padding-top: 20px;
                        border-top: 2px solid #ddd;
                        color: #666;
                        font-size: 14px;
                    }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>STUDENT INFORMATION</h1>
                    <div class="subtitle">Generated on ${new Date().toLocaleDateString('en-BD')}</div>
                </div>

                <div class="student-info">
                    <!-- Personal Information -->
                    <div class="section">
                        <h2 class="section-title">Personal Information</h2>
                        <div class="info-grid">
                            <div class="info-item">
                                <span class="info-label">Student ID:</span>
                                <span class="info-value">${student.studentId || 'N/A'}</span>
                            </div>
                            <div class="info-item">
                                <span class="info-label">Smart ID:</span>
                                <span class="info-value">${student.smartId || 'N/A'}</span>
                            </div>
                            <div class="info-item">
                                <span class="info-label">Dakhela Number:</span>
                                <span class="info-value">${student.dakhelaNumber || 'N/A'}</span>
                            </div>
                            <div class="info-item">
                                <span class="info-label">Full Name:</span>
                                <span class="info-value">${student.name || 'N/A'}</span>
                            </div>
                            <div class="info-item">
                                <span class="info-label">Date of Birth:</span>
                                <span class="info-value">${student.dob ? new Date(student.dob).toLocaleDateString('en-BD') : 'N/A'}</span>
                            </div>
                            <div class="info-item">
                                <span class="info-label">Gender:</span>
                                <span class="info-value">${student.gender || 'N/A'}</span>
                            </div>
                            <div class="info-item">
                                <span class="info-label">Mobile:</span>
                                <span class="info-value">${student.mobile || 'N/A'}</span>
                            </div>
                            <div class="info-item">
                                <span class="info-label">Blood Group:</span>
                                <span class="info-value">${student.bloodGroup || 'N/A'}</span>
                            </div>
                            <div class="info-item">
                                <span class="info-label">Status:</span>
                                <span class="info-value">${getStatusText(student.status)}</span>
                            </div>
                        </div>
                    </div>

                    <!-- Family Information -->
                    <div class="section">
                        <h2 class="section-title">Family Information</h2>
                        <div class="info-grid">
                            <div class="info-item">
                                <span class="info-label">Father's Name:</span>
                                <span class="info-value">${student.fatherName || 'N/A'}</span>
                            </div>
                            <div class="info-item">
                                <span class="info-label">Mother's Name:</span>
                                <span class="info-value">${student.motherName || 'N/A'}</span>
                            </div>
                            <div class="info-item">
                                <span class="info-label">Guardian's Name:</span>
                                <span class="info-value">${student.guardianName || 'N/A'}</span>
                            </div>
                            <div class="info-item">
                                <span class="info-label">Guardian Mobile:</span>
                                <span class="info-value">${student.guardianMobile || 'N/A'}</span>
                            </div>
                            <div class="info-item">
                                <span class="info-label">Relation:</span>
                                <span class="info-value">${student.relation || 'N/A'}</span>
                            </div>
                            <div class="info-item">
                                <span class="info-label">Guardian NID:</span>
                                <span class="info-value">${student.guardianNid || 'N/A'}</span>
                            </div>
                        </div>
                    </div>

                    <!-- Academic Information -->
                    <div class="section">
                        <h2 class="section-title">Academic Information</h2>
                        <div class="info-grid">
                            <div class="info-item">
                                <span class="info-label">Class:</span>
                                <span class="info-value">${student.class?.name || 'N/A'}</span>
                            </div>
                            <div class="info-item">
                                <span class="info-label">Section:</span>
                                <span class="info-value">${student.section?.name || 'N/A'}</span>
                            </div>
                            <div class="info-item">
                                <span class="info-label">Batch:</span>
                                <span class="info-value">${student.batch?.name || 'N/A'}</span>
                            </div>
                            <div class="info-item">
                                <span class="info-label">Session:</span>
                                <span class="info-value">${student.session?.name || 'N/A'}</span>
                            </div>
                            <div class="info-item">
                                <span class="info-label">Class Roll:</span>
                                <span class="info-value">${student.classRoll || 'N/A'}</span>
                            </div>
                            <div class="info-item">
                                <span class="info-label">Student Type:</span>
                                <span class="info-value">${student.studentType || 'N/A'}</span>
                            </div>
                        </div>
                    </div>

                    <!-- Photo Section -->
                    <div class="section photo-section">
                        <h2 class="section-title">Student Photo</h2>
                        ${student.photo ? 
                            `<img src="${baseImageURL}${student.photo}" alt="${student.name}" class="student-photo" onerror="this.style.display='none'" />` : 
                            '<p>No photo available</p>'
                        }
                    </div>

                    <!-- Fee Information -->
                    <div class="section">
                        <h2 class="section-title">Fee Information</h2>
                        <div class="fees-section">
                            <div class="fee-item">
                                <span>Admission Fee:</span>
                                <span>${formatCurrency(student.admissionFee || 0)}</span>
                            </div>
                            <div class="fee-item">
                                <span>Monthly Fee:</span>
                                <span>${formatCurrency(student.monthlyFee || 0)}</span>
                            </div>
                            <div class="fee-item">
                                <span>Session Fee:</span>
                                <span>${formatCurrency(student.sessionFee || 0)}</span>
                            </div>
                            <div class="fee-item">
                                <span>Boarding Fee:</span>
                                <span>${formatCurrency(student.boardingFee || 0)}</span>
                            </div>
                            <div class="fee-item">
                                <span>Transport Fee:</span>
                                <span>${formatCurrency(student.transportFee || 0)}</span>
                            </div>
                            <div class="fee-item">
                                <span>Residence Fee:</span>
                                <span>${formatCurrency(student.residenceFee || 0)}</span>
                            </div>
                            <div class="fee-item">
                                <span>Other Fee:</span>
                                <span>${formatCurrency(student.otherFee || 0)}</span>
                            </div>
                            <div class="fee-item">
                                <span>Previous Dues:</span>
                                <span>${formatCurrency(student.previousDues || 0)}</span>
                            </div>
                            <div class="fee-item fee-total">
                                <span>TOTAL FEES:</span>
                                <span>${formatCurrency(student.totalFees || 0)}</span>
                            </div>
                            <div class="fee-item">
                                <span>Paid Fees:</span>
                                <span>${formatCurrency(student.paidFees || 0)}</span>
                            </div>
                            <div class="fee-item fee-total">
                                <span>DUE FEES:</span>
                                <span>${formatCurrency(student.dueFees || 0)}</span>
                            </div>
                        </div>
                    </div>

                    <!-- Address Information -->
                    <div class="section">
                        <h2 class="section-title">Address Information</h2>
                        <div class="info-grid">
                            <div class="info-item">
                                <span class="info-label">Permanent Address:</span>
                                <span class="info-value">
                                    ${[student.permanentVillage, student.permanentPostOffice, student.permanentThana, student.permanentDistrict]
                                        .filter(Boolean).join(', ') || 'N/A'}
                                </span>
                            </div>
                            <div class="info-item">
                                <span class="info-label">Current Address:</span>
                                <span class="info-value">
                                    ${student.sameAsPermanent ? 'Same as Permanent Address' : 
                                        [student.currentVillage, student.currentPostOffice, student.currentThana, student.currentDistrict]
                                            .filter(Boolean).join(', ') || 'N/A'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="footer">
                    <p>This document was generated automatically from the Student Management System</p>
                    <p>© ${new Date().getFullYear()} - All rights reserved</p>
                </div>

                <script>
                    // Auto print when window loads
                    window.onload = function() {
                        window.print();
                        // setTimeout(() => window.close(), 1000);
                    };
                </script>
            </body>
            </html>
        `;

        printWindow.document.write(printContent);
        printWindow.document.close();
    };

    const handleDelete = async (studentId, studentName) => {
        const result = await Swal.fire({
            title: 'নিশ্চিত?',
            text: `আপনি কি "${studentName}" শিক্ষার্থীটি মুছে ফেলতে চান?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'হ্যাঁ, মুছুন',
            cancelButtonText: 'না',
            reverseButtons: true
        });

        if (result.isConfirmed) {
            try {
                setLoading(true);
                const response = await axiosInstance.delete(`/students/${studentId}`);

                if (response.data.success) {
                    showSweetAlert('success', 'শিক্ষার্থী সফলভাবে মুছে ফেলা হয়েছে!');
                    fetchStudents();
                } else {
                    showSweetAlert('error', response.data.message || 'শিক্ষার্থী মুছতে সমস্যা হয়েছে');
                }
            } catch (error) {
                console.error('Error deleting student:', error);
                showSweetAlert('error', 'শিক্ষার্থী মুছতে সমস্যা হয়েছে');
            } finally {
                setLoading(false);
            }
        }
    };

    const handleCollectFee = (student) => {
        showSweetAlert('info', 'ফি সংগ্রহ ফিচার শীঘ্রই আসছে');
    };

    const handleEdit = (student) => {
        setEditingStudent(student);
        setActiveComponent('edit');
    };

    const getStatusText = (status) => {
        const statusMap = {
            'active': 'সক্রিয়',
            'inactive': 'নিষ্ক্রিয়',
            'admission_pending': 'ভর্তি প্রক্রিয়াধীন',
            'admission_rejected': 'ভর্তি বাতিল',
            'expelled': 'বহিষ্কৃত',
            'moved': 'অন্য প্রতিষ্ঠানে স্থানান্তরিত'
        };
        return statusMap[status] || status;
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilterData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleApplyFilter = () => {
        fetchStudents(filterData);
    };

    const handleClearFilter = () => {
        setFilterData({
            search: '',
            classId: ''
        });
        fetchStudents();
    };

    const handleBackToList = () => {
        setActiveComponent('list');
        setEditingStudent(null);
    };

    const handleSuccess = () => {
        setActiveComponent('list');
        setEditingStudent(null);
        fetchStudents();
    };

    // Format currency
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-BD', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    };

    if (activeComponent === 'new' || activeComponent === 'edit') {
        return (
            <AddNewStudent 
                onBack={handleBackToList} 
                onSuccess={handleSuccess} 
                editData={activeComponent === 'edit' ? editingStudent : null}
                mode={activeComponent}
            />
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm">
                <div className="flex items-center justify-between p-4 sm:p-6">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={onBack}
                            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                            <FaArrowLeft className="text-xl text-gray-600" />
                        </button>
                        <h1 className="text-2xl font-bold text-gray-800">
                            শিক্ষার্থী ব্যবস্থাপনা
                        </h1>
                    </div>
                    
                    <MainButton
                        onClick={() => setActiveComponent('new')}
                    >
                        <FaPlus className="text-sm mr-2" />
                        New Student
                    </MainButton>
                </div>
            </div>

            {/* Main Content */}
            <div className="p-4 sm:p-6 lg:p-8">
                <div className="max-w-full mx-auto">
                    {/* Stats and Filter Section */}
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 mb-6">
                        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                            {/* Total Students */}
                            <div className="bg-blue-50 rounded-lg p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-blue-800">মোট শিক্ষার্থী</p>
                                        <p className="text-2xl font-bold text-blue-900">{totalStudents}</p>
                                    </div>
                                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                                        <span className="text-[#1e90c9] text-xl">👥</span>
                                    </div>
                                </div>
                            </div>

                            {/* Search */}
                            <div className="lg:col-span-2">
                                <label className="block text-gray-700 font-medium mb-2 text-sm">
                                    Search Student ID / Smart ID / Name
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        name="search"
                                        value={filterData.search}
                                        onChange={handleFilterChange}
                                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9] focus:border-transparent transition-colors"
                                        placeholder="আইডি, স্মার্ট আইডি বা নাম দ্বারা খুঁজুন..."
                                    />
                                    <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                </div>
                            </div>

                            {/* Class Filter */}
                            <div>
                                <label className="block text-gray-700 font-medium mb-2 text-sm">
                                    Class
                                </label>
                                <select
                                    name="classId"
                                    value={filterData.classId}
                                    onChange={handleFilterChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9] transition-colors"
                                >
                                    <option value="">সকল ক্লাস</option>
                                    {classes.map(classItem => (
                                        <option key={classItem._id} value={classItem._id}>
                                            {classItem.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Filter Buttons */}
                        <div className="flex gap-4 mt-4">
                            <MainButton
                                onClick={handleApplyFilter}
                                className="rounded-md"
                            >
                                Apply Filter
                            </MainButton>
                            <button
                                onClick={handleClearFilter}
                                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                Clear
                            </button>
                        </div>
                    </div>

                    {/* Students Table */}
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-200">
                        {/* Loading State */}
                        {loading && (
                            <div className="p-8 text-center">
                                <Loader />
                                <p className="text-gray-600 mt-2 text-sm">শিক্ষার্থী লোড হচ্ছে...</p>
                            </div>
                        )}

                        {/* Empty State */}
                        {!loading && students.length === 0 && (
                            <div className="p-8 text-center">
                                <div className="text-4xl mb-3">🎓</div>
                                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                                    কোন শিক্ষার্থী পাওয়া যায়নি
                                </h3>
                                <p className="text-gray-600 mb-4 text-sm">
                                    আপনার প্রথম শিক্ষার্থী তৈরি করুন।
                                </p>
                                <MainButton
                                    onClick={() => setActiveComponent('new')}
                                >
                                    শিক্ষার্থী তৈরি করুন
                                </MainButton>
                            </div>
                        )}

                        {/* Students Table */}
                        {!loading && students.length > 0 && (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50 border-b border-gray-200">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">আইডি</th>
                                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Smart ID</th>
                                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Dakhela Number</th>
                                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">নাম</th>
                                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Collect Fee</th>
                                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">ক্লাস</th>
                                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Class Roll</th>
                                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">সেকশন/ব্যাচ</th>
                                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">মোবাইল</th>
                                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">অবস্থান</th>
                                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">ছবি</th>
                                            <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">একশন</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {students.map((student) => (
                                            <tr key={student._id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-4 py-3">
                                                    <span className="font-medium text-gray-800 text-sm">
                                                        {student.studentId}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className="text-gray-600 text-sm">
                                                        {student.smartId || 'N/A'}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className="text-gray-600 text-sm">
                                                        {student.dakhelaNumber || 'N/A'}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-3">
                                                        {student.photo ? (
                                                            <img 
                                                                src={`${baseImageURL}${student.photo}`} 
                                                                alt={student.name}
                                                                className="w-8 h-8 rounded-full object-cover"
                                                                onError={(e) => {
                                                                    e.target.style.display = 'none';
                                                                    e.target.nextSibling.style.display = 'flex';
                                                                }}
                                                            />
                                                        ) : null}
                                                        <div className={`w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center ${student.photo ? 'hidden' : 'flex'}`}>
                                                            <span className="text-blue-600 text-sm">👤</span>
                                                        </div>
                                                        <div>
                                                            <p className="font-medium text-gray-800 text-sm">
                                                                {student.name}
                                                            </p>
                                                            <p className="text-xs text-gray-500">
                                                                {student.guardianMobile || student.mobile || 'N/A'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <MainButton
                                                        onClick={() => handleCollectFee(student)}
                                                        className="rounded-md "
                                                        title="ফি সংগ্রহ করুন"
                                                    >
                                                        <FaMoneyBill className="text-xs mr-2" />
                                                        Collect
                                                    </MainButton>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                        {student.class?.name || 'N/A'}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className="text-gray-600 text-sm">
                                                        {student.classRoll}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className="text-gray-600 text-sm">
                                                        {student.section?.name || 'N/A'} / {student.batch?.name || 'N/A'}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className="text-gray-600 text-sm">
                                                        {student.mobile || 'N/A'}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                        student.status === 'active' 
                                                            ? 'bg-[#1e90c9] text-white'
                                                            : student.status === 'inactive'
                                                            ? 'bg-red-100 text-red-800'
                                                            : 'bg-yellow-100 text-yellow-800'
                                                    }`}>
                                                        {getStatusText(student.status)}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    {student.photo ? (
                                                        <img 
                                                            src={`${baseImageURL}${student?.photo}`} 
                                                            alt={student.name}
                                                            className="w-10 h-10 rounded object-cover border"
                                                            onError={(e) => {
                                                                e.target.style.display = 'none';
                                                                e.target.nextSibling.style.display = 'block';
                                                            }}
                                                        />
                                                    ) : null}
                                                    <span className={`text-gray-400 text-xs ${student.photo ? 'hidden' : 'block'}`}>
                                                        No Image
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex gap-2 justify-center">
                                                        {/* Print Button */}
                                                        <button
                                                            onClick={() => handlePrint(student)}
                                                            className="p-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                                                            title="প্রিন্ট করুন"
                                                        >
                                                            <FaPrint className="text-xs" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleEdit(student)}
                                                            className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                                                            title="এডিট করুন"
                                                        >
                                                            <FaEdit className="text-xs" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(student._id, student.name)}
                                                            className="p-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                                                            title="ডিলিট করুন"
                                                        >
                                                            <FaTrash className="text-xs" />
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
                    {!loading && students.length > 0 && (
                        <div className="mt-4 flex justify-between items-center">
                            <div className="text-sm text-gray-600">
                                দেখানো হচ্ছে {students.length} টি শিক্ষার্থী
                                {filterData.search && (
                                    <span className="ml-2 text-blue-600">
                                        (খুঁজেছেন: "{filterData.search}")
                                    </span>
                                )}
                            </div>
                            <div className="text-sm text-gray-600">
                                মোট শিক্ষার্থী: {totalStudents}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default StudentsMenu;