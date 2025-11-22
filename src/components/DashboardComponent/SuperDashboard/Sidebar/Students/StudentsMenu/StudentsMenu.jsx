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

    
// এই ফাংশনটা handlePrint এর আগে রাখো (যেকোনো জায়গায় handlePrint এর আগে)
const getPositionLabel = (position) => {
  const labels = {
    'Active': 'সক্রিয়',
    'Inactive': 'নিষ্ক্রিয়',
    'Admission Pending': 'ভর্তি অপেক্ষমাণ',
    'Admission Rejected': 'ভর্তি বাতিল',
    'Expelled': 'বহিষ্কৃত',
    'Moved To Another Institute': 'অন্য প্রতিষ্ঠানে স্থানান্তরিত'
  };
  return labels[position] || position || 'N/A';
};

const handlePrint = (student) => {
  const printWindow = window.open("", "_blank");
  
  // ছবির URL (যদি না থাকে তাহলে placeholder)
  const photoUrl = student.photo 
    ? `${baseImageURL}${student.photo}` 
    : "https://via.placeholder.com/150?text=ছবি+নেই";

  printWindow.document.write(`
    <!DOCTYPE html>
    <html lang="bn">
    <head>
      <meta charset="UTF-8">
      <title>শিক্ষার্থীর তথ্য - ${student.name}</title>
      <style>
        body { 
          font-family: 'Kalpurush', 'SolaimanLipi', Arial, sans-serif; 
          padding: 30px; 
          line-height: 1.7; 
          color: #333; 
          background: #f9f9f9;
        }
        .container { 
          max-width: 850px; 
          margin: 0 auto; 
          border: 3px solid #1e90c9; 
          padding: 35px; 
          border-radius: 12px; 
          background: #fff;
          box-shadow: 0 10px 30px rgba(0,0,0,0.1);
        }
        h1 { 
          text-align: center; 
          color: #1e90c9; 
          margin-bottom: 8px; 
          font-size: 28px; 
          font-weight: bold;
        }
        .subtitle { 
          text-align: center; 
          color: #555; 
          margin-bottom: 25px; 
          font-size: 16px; 
        }
        .photo { 
          text-align: center; 
          margin: 25px 0; 
        }
        .photo img { 
          width: 150px; 
          height: 150px; 
          border-radius: 50%; 
          border: 5px solid #1e90c9; 
          object-fit: cover; 
          box-shadow: 0 4px 15px rgba(30,144,201,0.3);
        }
        h2 { 
          background: #1e90c9; 
          color: white; 
          padding: 12px 18px; 
          border-radius: 8px; 
          margin: 30px 0 18px 0; 
          font-size: 19px; 
          font-weight: bold;
        }
        table { 
          width: 100%; 
          border-collapse: collapse; 
          margin: 18px 0; 
          font-size: 15.5px; 
        }
        td { 
          padding: 12px 15px; 
          border: 1.5px solid #ddd; 
          vertical-align: top; 
        }
        .label { 
          font-weight: bold; 
          background: #e3f2fd; 
          color: #1e90c9; 
          width: 38%; 
          text-align: right;
        }
        .highlight { 
          background: #e8f5e8; 
          font-weight: bold; 
          font-size: 16px;
        }
        .text-center { text-align: center; }
        .footer { 
          margin-top: 60px; 
          padding-top: 25px; 
          border-top: 2px dashed #1e90c9; 
          text-align: center; 
          color: #666; 
          font-size: 14px; 
        }
        @media print {
          body { padding: 10px; background: white; }
          .container { border: 2px solid #1e90c9; }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>শিক্ষার্থীর বিস্তারিত তথ্য</h1>
        <div class="subtitle">প্রিন্ট তারিখ: ${new Date().toLocaleDateString('bn-BD')}</div>

        <div class="photo">
          <img src="${photoUrl}" alt="Student Photo" onerror="this.src='https://via.placeholder.com/150?text=ছবি+নেই'" />
        </div>

        <p class="text-center highlight">
          <strong>শিক্ষার্থী আইডি:</strong> ${student.studentId || 'N/A'} 
          ${student.smartIdCard ? `| <strong>Smart ID:</strong> ${student.smartIdCard}` : ''}
          ${student.dakhelaNumber ? `| <strong>Dakhela:</strong> ${student.dakhelaNumber}` : ''}
        </p>

        <h2>ব্যক্তিগত তথ্য</h2>
        <table>
          <tr><td class="label">নাম</td><td>${student.name}</td></tr>
          <tr><td class="label">জন্ম তারিখ</td><td>${student.birthDate ? new Date(student.birthDate).toLocaleDateString('bn-BD') : 'N/A'}</td></tr>
          <tr><td class="label">লিঙ্গ</td><td>${student.gender === 'Male' ? 'পুরুষ' : student.gender === 'Female' ? 'মহিলা' : 'অন্যান্য'}</td></tr>
          <tr><td class="label">রক্তের গ্রুপ</td><td>${student.bloodGroup || 'N/A'}</td></tr>
          <tr><td class="label">মোবাইল</td><td>${student.mobile || 'N/A'}</td></tr>
          <tr><td class="label">জন্ম নিবন্ধন নং</td><td>${student.birthRegNo || 'N/A'}</td></tr>
        </table>

        <h2>পারিবারিক তথ্য</h2>
        <table>
          <tr><td class="label">পিতার নাম</td><td>${student.fatherName}</td></tr>
          <tr><td class="label">মাতার নাম</td><td>${student.motherName}</td></tr>
          <tr><td class="label">অভিভাবকের নাম</td><td>${student.guardianName || 'N/A'}</td></tr>
          <tr><td class="label">অভিভাবকের মোবাইল</td><td>${student.guardianMobile || 'N/A'}</td></tr>
          <tr><td class="label">সম্পর্ক</td><td>${student.guardianRelation || 'N/A'}</td></tr>
          <tr><td class="label">এনআইডি</td><td>${student.nid || 'N/A'}</td></tr>
        </table>

        <h2>শিক্ষা সংক্রান্ত তথ্য</h2>
        <table>
          <tr><td class="label">ক্লাস</td><td>${student.className || 'N/A'}</td></tr>
          <tr><td class="label">ব্যাচ</td><td>${student.batchName || 'N/A'}</td></tr>
          <tr><td class="label">সেকশন</td><td>${student.sectionName || 'N/A'}</td></tr>
          <tr><td class="label">সেশন</td><td>${student.sessionName || 'N/A'}</td></tr>
          <tr><td class="label">ক্লাস রোল</td><td>${student.classRoll || 'N/A'}</td></tr>
          <tr><td class="label">অবস্থান</td><td>${getPositionLabel(student.position)}</td></tr>
          <tr><td class="label">শিক্ষার্থী ধরন</td><td>${student.studentType || 'Non-Residential'}</td></tr>
        </table>

        <h2>ঠিকানা</h2>
        <table>
          <tr><td class="label">স্থায়ী ঠিকানা</td>
            <td>${[student.permanentVillage, student.permanentPostOffice, student.permanentThana, student.permanentDistrict].filter(Boolean).join(', ') || 'N/A'}</td></tr>
          <tr><td class="label">বর্তমান ঠিকানা</td>
            <td>${student.currentSameAsPermanent 
              ? 'স্থায়ী ঠিকানার মতো একই' 
              : [student.currentVillage, student.currentPostOffice, student.currentThana, student.currentDistrict].filter(Boolean).join(', ') || 'N/A'}</td></tr>
        </table>

        <h2>ফি তথ্য</h2>
        <table>
          <tr><td class="label">ভর্তি ফি</td><td>${student.admissionFee || 0} টাকা</td></tr>
          <tr><td class="label">মাসিক ফি</td><td>${student.monthlyFee || 0} টাকা</td></tr>
          <tr><td class="label">পূর্বের বকেয়া</td><td>${student.previousDues || 0} টাকা</td></tr>
          <tr><td class="label">সেশন ফি</td><td>${student.sessionFee || 0} টাকা</td></tr>
          <tr><td class="label">অন্যান্য ফি</td><td>${student.otherFee || 0} টাকা</td></tr>
        </table>

        <div class="footer">
          <p><strong>এই ডকুমেন্টটি স্বয়ংক্রিয়ভাবে তৈরি করা হয়েছে</strong></p>
          <small>© ${new Date().getFullYear()} - সকল অধিকার সংরক্ষিত</small>
        </div>
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
                                                        {student.smartIdCard || 'N/A'}
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
                                                        {student.className || 'N/A'}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className="text-gray-600 text-sm">
                                                        {student.classRoll}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className="text-gray-600 text-sm">
                                                        {student.sectionName || 'N/A'} / {student.batchName || 'N/A'}
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
                                                        {getPositionLabel(student.position)}
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