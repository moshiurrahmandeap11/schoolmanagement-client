// src/pages/certificate/InstituteFormList/InstituteFormList.jsx
import { useEffect, useRef, useState } from 'react';
import { FaEdit, FaPlus, FaPrint, FaSave, FaTrash } from 'react-icons/fa';
import { useReactToPrint } from 'react-to-print';
import Swal from 'sweetalert2';
import axiosInstance from '../../../../../../../hooks/axiosInstance/axiosInstance';
import Loader from '../../../../../../sharedItems/Loader/Loader';

const InstantStudentForm = ({ onBack }) => {
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [previewData, setPreviewData] = useState(null);

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
  }, []);

  const fetchForms = async () => {
    try {
      const res = await axiosInstance.get('/certificate/instant-form');
      setForms(res.data.data || []);
    } catch{
      Swal.fire({
        title: 'ত্রুটি!',
        text: 'ফর্ম লোড করতে সমস্যা হয়েছে',
        icon: 'error',
        confirmButtonText: 'ঠিক আছে',
        confirmButtonColor: '#2563eb',
      });
    } finally {
      setLoading(false);
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
          confirmButtonColor: '#2563eb',
        });
      }
      setEditingId(null);
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
        confirmButtonColor: '#2563eb',
      });
    }
  };

  const handleEdit = (data) => {
    setForm(data);
    setEditingId(data._id);
    setShowForm(true);
    setPreviewData(null);
  };

  const handleDelete = (id, name) => {
    Swal.fire({
      title: 'আপনি কি নিশ্চিত?',
      html: `<strong>"${name}"</strong> ফর্ম মুছে ফেলবেন?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'হ্যাঁ, মুছে ফেলুন',
      cancelButtonText: 'বাতিল করুন',
      confirmButtonColor: '#dc2626',
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
            confirmButtonColor: '#2563eb',
          });
          fetchForms();
        } catch {
          Swal.fire({
            title: 'ত্রুটি!',
            text: 'মুছে ফেলতে সমস্যা হয়েছে',
            icon: 'error',
            confirmButtonText: 'ঠিক আছে',
            confirmButtonColor: '#2563eb',
          });
        }
      }
    });
  };

  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    documentTitle: `Form_${previewData?.name || 'Student'}`
  });

  if (loading) return <Loader />;

  if (previewData) {
    return (
      <div className="max-w-full mx-auto p-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6" ref={printRef}>
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-blue-700">ইনস্টিটিউট ফর্ম</h2>
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
          <div className="mt-6 flex justify-center gap-3">
            <button 
              onClick={() => handleEdit(previewData)} 
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm"
            >
              <FaEdit /> এডিট
            </button>
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
            <button 
              onClick={() => setShowForm(true)} 
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm"
            >
              <FaPlus /> নতুন ফর্ম
            </button>
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">শিক্ষার্থীর আইডি</label>
              <input 
                value={form.studentId} 
                onChange={e => setForm({...form, studentId: e.target.value})} 
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">শিক্ষার্থীর নাম *</label>
              <input 
                value={form.name} 
                onChange={e => setForm({...form, name: e.target.value})} 
                required 
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">জন্ম তারিখ *</label>
              <input 
                type="date" 
                value={form.birthDate} 
                onChange={e => setForm({...form, birthDate: e.target.value})} 
                required 
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">লিঙ্গ</label>
              <select 
                value={form.gender} 
                onChange={e => setForm({...form, gender: e.target.value})} 
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ব্লাড গ্রুপ</label>
              <select 
                value={form.bloodGroup} 
                onChange={e => setForm({...form, bloodGroup: e.target.value})} 
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">মাতার নাম</label>
              <input 
                value={form.motherName} 
                onChange={e => setForm({...form, motherName: e.target.value})} 
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">গার্ডিয়ানের নাম</label>
              <input 
                value={form.guardianName} 
                onChange={e => setForm({...form, guardianName: e.target.value})} 
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">প্যারেন্ট মোবাইল</label>
              <input 
                value={form.parentMobile} 
                onChange={e => setForm({...form, parentMobile: e.target.value})} 
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">রোল নম্বর *</label>
              <input 
                value={form.rollNumber} 
                onChange={e => setForm({...form, rollNumber: e.target.value})} 
                required 
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ক্লাস *</label>
              <input 
                value={form.className} 
                onChange={e => setForm({...form, className: e.target.value})} 
                required 
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ব্যাচ</label>
              <input 
                value={form.batch} 
                onChange={e => setForm({...form, batch: e.target.value})} 
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">সেকশন</label>
              <input 
                value={form.section} 
                onChange={e => setForm({...form, section: e.target.value})} 
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">সেশন *</label>
              <input 
                value={form.session} 
                onChange={e => setForm({...form, session: e.target.value})} 
                required 
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">ঠিকানা</label>
              <textarea 
                value={form.address} 
                onChange={e => setForm({...form, address: e.target.value})} 
                rows="3" 
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition resize-none"
              />
            </div>
          </div>
          
          <div className="flex justify-center pt-4">
            <button 
              type="submit" 
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
            >
              <FaSave /> {editingId ? 'আপডেট করুন' : 'সংরক্ষণ করুন'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InstantStudentForm;