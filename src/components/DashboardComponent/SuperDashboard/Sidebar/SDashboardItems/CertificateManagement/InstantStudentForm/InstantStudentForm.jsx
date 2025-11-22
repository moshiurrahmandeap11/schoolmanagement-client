import 'jspdf-autotable';
import { useEffect, useRef, useState } from 'react';
import { FaEdit, FaPlus, FaPrint, FaSave, FaTrash } from 'react-icons/fa';
import Swal from 'sweetalert2';
import axiosInstance from '../../../../../../../hooks/axiosInstance/axiosInstance';
import Loader from '../../../../../../sharedItems/Loader/Loader';
import MainButton from '../../../../../../sharedItems/Mainbutton/Mainbutton';

const InstantStudentForm = ({ onBack }) => {
  const [forms, setForms] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [previewData, setPreviewData] = useState(null);
  const [selectedStudentId, setSelectedStudentId] = useState('');

  const printRef = useRef();

  const [form, setForm] = useState({
    studentId: '', name: '', birthDate: '', gender: 'Male', mobile: '',
    bloodGroup: '', fatherName: '', motherName: '', guardianName: '',
    parentMobile: '', rollNumber: '', className: '', batch: '', section: '',
    session: '', address: ''
  });

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  useEffect(() => {
    fetchForms();
    fetchStudents();
  }, []);

  const fetchForms = async () => {
    try {
      const res = await axiosInstance.get('/certificate/instant-form');
      setForms(res.data.data || []);
    } catch {
      Swal.fire({
        title: 'ত্রুটি!',
        text: 'ফর্ম লোড করতে সমস্যা হয়েছে',
        icon: 'error',
        confirmButtonText: 'ঠিক আছে',
        confirmButtonColor: '#1e90c9',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      const res = await axiosInstance.get('/students');
      if (res.data.success) {
        setStudents(res.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  const handleStudentSelect = (studentId) => {
    setSelectedStudentId(studentId);
    const selectedStudent = students.find(s => s.studentId === studentId);
    
    if (selectedStudent) {
      // Auto-fill all fields from selected student
      setForm({
        studentId: selectedStudent.studentId || '',
        name: selectedStudent.name || '',
        birthDate: selectedStudent.dob ? new Date(selectedStudent.dob).toISOString().split('T')[0] : 
                 selectedStudent.birthDate ? new Date(selectedStudent.birthDate).toISOString().split('T')[0] : '',
        gender: selectedStudent.gender || 'Male',
        mobile: selectedStudent.mobile || selectedStudent.personalPhone || '',
        bloodGroup: selectedStudent.bloodGroup || '',
        fatherName: selectedStudent.fatherName || '',
        motherName: selectedStudent.motherName || '',
        guardianName: selectedStudent.guardianName || selectedStudent.guardianName || '',
        parentMobile: selectedStudent.guardianMobile || selectedStudent.parentMobile || selectedStudent.mobile || '',
        rollNumber: selectedStudent.classRoll?.toString() || selectedStudent.rollNumber || '',
        className: selectedStudent.class?.name || selectedStudent.className || '',
        batch: selectedStudent.batch?.name || selectedStudent.batchName || '',
        section: selectedStudent.section?.name || selectedStudent.sectionName || '',
        session: selectedStudent.session?.name || selectedStudent.sessionName || 
                selectedStudent.session?.year || '',
        address: [
          selectedStudent.permanentVillage,
          selectedStudent.permanentPostOffice,
          selectedStudent.permanentThana,
          selectedStudent.permanentDistrict
        ].filter(Boolean).join(', ') || 
        [
          selectedStudent.currentVillage,
          selectedStudent.currentPostOffice,
          selectedStudent.currentThana,
          selectedStudent.currentDistrict
        ].filter(Boolean).join(', ') || 
        selectedStudent.address || ''
      });

      // Show success message
      Swal.fire({
        title: 'অটো-ফিল সম্পন্ন!',
        text: `${selectedStudent.name} এর সকল তথ্য অটোমেটিকভাবে ভরে দেওয়া হয়েছে`,
        icon: 'success',
        timer: 2000,
        showConfirmButton: false
      });
    } else {
      // Reset form if no student selected
      setForm({
        studentId: '', name: '', birthDate: '', gender: 'Male', mobile: '',
        bloodGroup: '', fatherName: '', motherName: '', guardianName: '',
        parentMobile: '', rollNumber: '', className: '', batch: '', section: '',
        session: '', address: ''
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await axiosInstance.put(`/certificate/instant-form/${editingId}`, form);
        Swal.fire({
          title: 'সফল!',
          text: 'ফর্ম আপডেট করা হয়েছে',
          icon: 'success',
          confirmButtonText: 'ঠিক আছে',
          confirmButtonColor: '#2563eb',
        });
      } else {
        const res = await axiosInstance.post('/certificate/instant-form', form);
        setPreviewData(res.data.data);
        Swal.fire({
          title: 'সফল!',
          text: 'ফর্ম তৈরি করা হয়েছে',
          icon: 'success',
          confirmButtonText: 'ঠিক আছে',
          confirmButtonColor: '#1e90c9',
        });
      }
      setEditingId(null);
      setSelectedStudentId('');
      setForm({
        studentId: '', name: '', birthDate: '', gender: 'Male', mobile: '',
        bloodGroup: '', fatherName: '', motherName: '', guardianName: '',
        parentMobile: '', rollNumber: '', className: '', batch: '', section: '',
        session: '', address: ''
      });
      fetchForms();
      setShowForm(false);
    } catch (err) {
      Swal.fire({
        title: 'ত্রুটি!',
        text: err.response?.data?.message || 'সমস্যা হয়েছে',
        icon: 'error',
        confirmButtonText: 'ঠিক আছে',
        confirmButtonColor: '#1e90c9',
      });
    }
  };

  const handleEdit = (data) => {
    setForm(data);
    setEditingId(data._id);
    setShowForm(true);
    setPreviewData(null);
    setSelectedStudentId(data.studentId);
  };

  const handleDelete = (id, name) => {
    Swal.fire({
      title: 'আপনি কি নিশ্চিত?',
      html: `<strong>"${name}"</strong> ফর্ম মুছে ফেলবেন?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'হ্যাঁ, মুছে ফেলুন',
      cancelButtonText: 'বাতিল করুন',
      confirmButtonColor: '#1e90c9',
      cancelButtonColor: '#6b7280',
      reverseButtons: true,
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axiosInstance.delete(`/certificate/instant-form/${id}`);
          Swal.fire({
            title: 'মুছে ফেলা হয়েছে!',
            text: 'ফর্ম সফলভাবে মুছে ফেলা হয়েছে',
            icon: 'success',
            confirmButtonText: 'ঠিক আছে',
            confirmButtonColor: '#1e90c9',
          });
          fetchForms();
        } catch {
          Swal.fire({
            title: 'ত্রুটি!',
            text: 'মুছে ফেলতে সমস্যা হয়েছে',
            icon: 'error',
            confirmButtonText: 'ঠিক আছে',
            confirmButtonColor: '#1e90c9',
          });
        }
      }
    });
  };

  // ==================== প্রিন্ট ফাংশন ====================
  const handlePrint = () => {
    if (!previewData) return;

    const printWindow = window.open('', '_blank', 'width=1000,height=800');

    const printContent = `
      <!DOCTYPE html>
      <html lang="bn">
      <head>
        <meta charset="UTF-8">
        <title>${previewData.name} - ইনস্টিটিউট ফর্ম</title>
        <style>
          body { font-family: 'Arial', sans-serif; margin: 30px; line-height: 1.6; color: #333; }
          .header { text-align: center; border-bottom: 4px double #1e90c9; padding-bottom: 20px; margin-bottom: 30px; }
          .header h1 { color: #1e90c9; margin: 0; font-size: 32px; }
          .header p { margin: 10px 0 0; color: #666; font-size: 16px; }
          .container { max-width: 900px; margin: 0 auto; }
          table { width: 100%; border-collapse: collapse; margin: 30px 0; }
          th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
          th { background: #1e90c9; color: white; font-weight: bold; }
          tr:nth-child(even) { background: #f8fdff; }
          .footer { text-align: center; margin-top: 50px; padding-top: 20px; border-top: 2px solid #1e90c9; color: #666; font-size: 14px; }
          @media print { body { margin: 10mm; } }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>ইনস্টিটিউট ফর্ম</h1>
            <p>শিক্ষার্থীর বিস্তারিত তথ্য | তারিখ: ${new Date().toLocaleDateString('bn-BD')}</p>
          </div>

          <table>
            <tr><th>ক্ষেত্র</th><th>তথ্য</th></tr>
            <tr><td>আইডি</td><td>${previewData.studentId || 'N/A'}</td></tr>
            <tr><td>নাম</td><td>${previewData.name || 'N/A'}</td></tr>
            <tr><td>জন্ম তারিখ</td><td>${previewData.birthDate || 'N/A'}</td></tr>
            <tr><td>লিঙ্গ</td><td>${previewData.gender || 'N/A'}</td></tr>
            <tr><td>মোবাইল</td><td>${previewData.mobile || 'N/A'}</td></tr>
            <tr><td>ব্লাড গ্রুপ</td><td>${previewData.bloodGroup || 'N/A'}</td></tr>
            <tr><td>পিতার নাম</td><td>${previewData.fatherName || 'N/A'}</td></tr>
            <tr><td>মাতার নাম</td><td>${previewData.motherName || 'N/A'}</td></tr>
            <tr><td>গার্ডিয়ান</td><td>${previewData.guardianName || 'N/A'}</td></tr>
            <tr><td>প্যারেন্ট মোবাইল</td><td>${previewData.parentMobile || 'N/A'}</td></tr>
            <tr><td>রোল নম্বর</td><td>${previewData.rollNumber || 'N/A'}</td></tr>
            <tr><td>ক্লাস</td><td>${previewData.className || 'N/A'}</td></tr>
            <tr><td>ব্যাচ</td><td>${previewData.batch || 'N/A'}</td></tr>
            <tr><td>সেকশন</td><td>${previewData.section || 'N/A'}</td></tr>
            <tr><td>সেশন</td><td>${previewData.session || 'N/A'}</td></tr>
            <tr><td>ঠিকানা</td><td>${previewData.address || 'N/A'}</td></tr>
          </table>

          <div class="footer">
            <p>এই ডকুমেন্ট স্বয়ংক্রিয়ভাবে তৈরি করা হয়েছে</p>
            <p>© Institute Management System ${new Date().getFullYear()}</p>
          </div>
        </div>

        <script>
          window.onload = () => {
            window.print();
            // window.close(); // চাইলে প্রিন্টের পর উইন্ডো বন্ধ করবে
          };
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(printContent);
    printWindow.document.close();
  };

  if (loading) return <Loader />;

  if (previewData) {
    return (
      <div className="max-w-full mx-auto p-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6" ref={printRef}>
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-[#1e90c9]">ইনস্টিটিউট ফর্ম</h2>
            <p className="text-gray-600">শিক্ষার্থীর বিস্তারিত তথ্য</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div><strong>আইডি:</strong> {previewData.studentId}</div>
            <div><strong>নাম:</strong> {previewData.name}</div>
            <div><strong>জন্মতারিখ:</strong> {previewData.birthDate}</div>
            <div><strong>লিঙ্গ:</strong> {previewData.gender}</div>
            <div><strong>মোবাইল:</strong> {previewData.mobile}</div>
            <div><strong>ব্লাড গ্রুপ:</strong> {previewData.bloodGroup}</div>
            <div><strong>পিতার নাম:</strong> {previewData.fatherName}</div>
            <div><strong>মাতার নাম:</strong> {previewData.motherName}</div>
            <div><strong>গার্ডিয়ান:</strong> {previewData.guardianName}</div>
            <div><strong>প্যারেন্ট মোবাইল:</strong> {previewData.parentMobile}</div>
            <div><strong>রোল:</strong> {previewData.rollNumber}</div>
            <div><strong>ক্লাস:</strong> {previewData.className}</div>
            <div><strong>ব্যাচ:</strong> {previewData.batch}</div>
            <div><strong>সেকশন:</strong> {previewData.section}</div>
            <div><strong>সেশন:</strong> {previewData.session}</div>
            <div className="md:col-span-2"><strong>ঠিকানা:</strong> {previewData.address}</div>
          </div>
          <div className="mt-6 flex justify-center gap-3 flex-wrap">
            <MainButton 
              onClick={() => handleEdit(previewData)} 
            >
              <FaEdit /> এডিট
            </MainButton>
            <button 
              onClick={() => handleDelete(previewData._id, previewData.name)} 
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm"
            >
              <FaTrash /> ডিলিট
            </button>
            <button 
              onClick={handlePrint} 
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm"
            >
              <FaPrint /> প্রিন্ট
            </button>
          </div>
        </div>
        <div className="text-center mt-4">
          <button 
            onClick={() => { setPreviewData(null); setShowForm(true); }} 
            className="text-blue-600 hover:text-blue-700 text-sm"
          >
            নতুন ফর্ম তৈরি করুন
          </button>
        </div>
      </div>
    );
  }

  if (!showForm) {
    return (
      <div className="max-w-full mx-auto p-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-800">ফর্ম তালিকা</h2>
            <MainButton 
              onClick={() => setShowForm(true)} 
            >
              <FaPlus /> নতুন ফর্ম
            </MainButton>
          </div>
          
          {forms.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl text-gray-300 mb-4">📋</div>
              <p className="text-gray-500">কোনো ফর্ম নেই</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {forms.map(f => (
                <div key={f._id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                  <h3 className="text-lg font-medium text-gray-800 mb-2">{f.name}</h3>
                  <p className="text-sm text-gray-600 mb-1"><strong>রোল:</strong> {f.rollNumber}</p>
                  <p className="text-sm text-gray-600 mb-1"><strong>ক্লাস:</strong> {f.className}</p>
                  <p className="text-sm text-gray-600 mb-3"><strong>সেশন:</strong> {f.session}</p>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setPreviewData(f)} 
                      className="flex-1 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition text-sm"
                    >
                      দেখুন
                    </button>
                    <button 
                      onClick={() => handleEdit(f)} 
                      className="flex-1 px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition text-sm"
                    >
                      এডিট
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-full mx-auto p-4">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-center mb-6 text-gray-800">
          {editingId ? 'ফর্ম এডিট করুন' : 'নতুন শিক্ষার্থী ফর্ম'}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Student Selection Dropdown - Enhanced */}
          <div className="mb-6 p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
            <label className="block text-sm font-bold text-blue-800 mb-2">
              🎓 শিক্ষার্থী সিলেক্ট করুন (অটোফিলের জন্য)
            </label>
            <select
              value={selectedStudentId}
              onChange={(e) => handleStudentSelect(e.target.value)}
              className="w-full px-4 py-3 border-2 border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition bg-white text-blue-800 font-medium"
            >
              <option value="">👉 একজন শিক্ষার্থী সিলেক্ট করুন</option>
              {students.map(student => (
                <option key={student._id} value={student.studentId}>
                  📝 {student.studentId} - {student.name} - {student.class?.name} - রোল: {student.classRoll}
                </option>
              ))}
            </select>
            <p className="text-sm text-blue-600 mt-2 flex items-center gap-2">
              💡 <strong>টিপ:</strong> একজন শিক্ষার্থী সিলেক্ট করলে সব তথ্য অটোমেটিকভাবে ভরে যাবে!
            </p>
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">শিক্ষার্থীর আইডি</label>
              <input 
                value={form.studentId} 
                onChange={e => setForm({...form, studentId: e.target.value})} 
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1e90c9] focus:border-[#1e90c9] outline-none transition"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">শিক্ষার্থীর নাম *</label>
              <input 
                value={form.name} 
                onChange={e => setForm({...form, name: e.target.value})} 
                required 
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1e90c9] focus:border-[#1e90c9] outline-none transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">জন্ম তারিখ *</label>
              <input 
                type="date" 
                value={form.birthDate} 
                onChange={e => setForm({...form, birthDate: e.target.value})} 
                required 
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1e90c9] focus:border-[#1e90c9] outline-none transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">লিঙ্গ</label>
              <select 
                value={form.gender} 
                onChange={e => setForm({...form, gender: e.target.value})} 
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1e90c9] focus:border-[#1e90c9] outline-none transition"
              >
                <option>Male</option>
                <option>Female</option>
                <option>Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">মোবাইল *</label>
              <input 
                value={form.mobile} 
                onChange={e => setForm({...form, mobile: e.target.value})} 
                required 
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1e90c9] focus:border-[#1e90c9] outline-none transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ব্লাড গ্রুপ</label>
              <select 
                value={form.bloodGroup} 
                onChange={e => setForm({...form, bloodGroup: e.target.value})} 
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1e90c9] focus:border-[#1e90c9] outline-none transition"
              >
                <option value="">ব্লাড গ্রুপ</option>
                {bloodGroups.map(bg => <option key={bg}>{bg}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">পিতার নাম</label>
              <input 
                value={form.fatherName} 
                onChange={e => setForm({...form, fatherName: e.target.value})} 
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1e90c9] focus:border-[#1e90c9] outline-none transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">মাতার নাম</label>
              <input 
                value={form.motherName} 
                onChange={e => setForm({...form, motherName: e.target.value})} 
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1e90c9] focus:border-[#1e90c9] outline-none transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">গার্ডিয়ানের নাম</label>
              <input 
                value={form.guardianName} 
                onChange={e => setForm({...form, guardianName: e.target.value})} 
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1e90c9] focus:border-[#1e90c9] outline-none transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">প্যারেন্ট মোবাইল</label>
              <input 
                value={form.parentMobile} 
                onChange={e => setForm({...form, parentMobile: e.target.value})} 
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1e90c9] focus:border-[#1e90c9] outline-none transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">রোল নম্বর *</label>
              <input 
                value={form.rollNumber} 
                onChange={e => setForm({...form, rollNumber: e.target.value})} 
                required 
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1e90c9] focus:border-[#1e90c9] outline-none transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ক্লাস *</label>
              <input 
                value={form.className} 
                onChange={e => setForm({...form, className: e.target.value})} 
                required 
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1e90c9] focus:border-[#1e90c9] outline-none transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ব্যাচ</label>
              <input 
                value={form.batch} 
                onChange={e => setForm({...form, batch: e.target.value})} 
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1e90c9] focus:border-[#1e90c9] outline-none transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">সেকশন</label>
              <input 
                value={form.section} 
                onChange={e => setForm({...form, section: e.target.value})} 
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1e90c9] focus:border-[#1e90c9] outline-none transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">সেশন *</label>
              <input 
                value={form.session} 
                onChange={e => setForm({...form, session: e.target.value})} 
                required 
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1e90c9] focus:border-[#1e90c9] outline-none transition"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">ঠিকানা</label>
              <textarea 
                value={form.address} 
                onChange={e => setForm({...form, address: e.target.value})} 
                rows="3" 
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1e90c9] focus:border-[#1e90c9] outline-none transition resize-none"
              />
            </div>
          </div>
          
          <div className="flex justify-center pt-4">
            <MainButton 
              type="submit" 
            >
              <FaSave /> {editingId ? 'আপডেট করুন' : 'সংরক্ষণ করুন'}
            </MainButton>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InstantStudentForm;