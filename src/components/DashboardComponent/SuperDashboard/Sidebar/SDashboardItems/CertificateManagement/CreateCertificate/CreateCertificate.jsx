// src/pages/certificate/CreateCertificate/CreateCertificate.jsx
import { useRef, useState } from 'react';
import { FaPrint, FaSave } from 'react-icons/fa';
import { useReactToPrint } from 'react-to-print';
import Swal from 'sweetalert2';
import axiosInstance from '../../../../../../../hooks/axiosInstance/axiosInstance';
import Loader from '../../../../../../sharedItems/Loader/Loader';
import MainButton from '../../../../../../sharedItems/Mainbutton/Mainbutton';

const CreateCertificate = () => {
  const [loading, setLoading] = useState(false);
  const [certificate, setCertificate] = useState(null);
  const printRef = useRef();

  const [form, setForm] = useState({
    rollNo: '', studentName: '', fatherName: '', institute: 'আমাদের স্কুল',
    examination: '', year: '', result: '', dateOfBirth: ''
  });

  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    documentTitle: `Certificate_${form.rollNo}_${form.studentName}`,
    pageStyle: `
      @page { size: A4 landscape; margin: 5mm; }
      @media print { body { -webkit-print-color-background: true; } }
    `
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axiosInstance.post('/certificate/generate-certificate', form);
      setCertificate(res.data.data);
      Swal.fire({
        title: 'সফল!',
        text: 'সার্টিফিকেট তৈরি হয়েছে!',
        icon: 'success',
        timer: 2000
      });
    } catch (err) {
      Swal.fire('ত্রুটি!', err.response?.data?.message || 'সমস্যা হয়েছে', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader />;

  if (certificate) {
    return (
      <div className="max-w-6xl mx-auto p-8">
        <div ref={printRef} className="bg-white relative overflow-hidden rounded-3xl shadow-2xl">
          {/* Watermark */}
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <img src="/logo.png" alt="watermark" className="w-full h-full object-contain" />
          </div>

          {/* Certificate Body */}
          <div className="relative border-8 border-double border-amber-600 p-16 bg-linear-to-br from-amber-50 to-yellow-50">
            {/* Header */}
            <div className="text-center mb-12">
              <h1 className="text-6xl font-bold text-amber-800 mb-4">সার্টিফিকেট</h1>
              <p className="text-3xl text-amber-700">Certificate of Completion</p>
              <div className="mt-6 flex justify-center gap-16">
                <img src="/logo.png" alt="school" className="h-24" />
                <div>
                  <h2 className="text-4xl font-bold text-blue-900">{form.institute}</h2>
                  <p className="text-xl text-gray-700">স্থাপিত: ১৯৮৫</p>
                </div>
                <img src="/emblem.png" alt="emblem" className="h-24" />
              </div>
            </div>

            {/* Content */}
            <div className="text-center space-y-8 text-2xl">
              <p>এই মর্মে প্রত্যয়ন করা যাচ্ছে যে,</p>
              <h3 className="text-5xl font-bold text-blue-900 underline">{certificate.studentName}</h3>
              <p>পিতা: <strong>{certificate.fatherName}</strong></p>
              <p>রোল নং: <strong>{certificate.rollNo}</strong> | জন্মতারিখ: <strong>{certificate.dateOfBirth}</strong></p>
              <p className="text-3xl mt-10">
                <strong>{certificate.examination}</strong> পরীক্ষায় <strong>{certificate.year}</strong> সালে
                <span className="text-green-600 font-bold"> {certificate.result}</span> ফলাফল করিয়াছেন।
              </p>
              <p className="mt-12 text-3xl">শুভকামনা রইল!</p>
            </div>

            {/* Footer */}
            <div className="mt-20 flex justify-between items-end">
              <div className="text-center">
                <img src="/signature.png" alt="headmaster" className="h-20 mx-auto mb-2" />
                <p className="border-t-2 border-black w-48 mx-auto pt-2 font-bold">প্রধান শিক্ষক</p>
              </div>
              <div className="text-center">
                <div className="border-4 border-blue-800 rounded-full p-4 inline-block">
                  <img src="/seal.png" alt="seal" className="h-32" />
                </div>
                <p className="mt-4 font-bold text-blue-900">অফিসিয়াল সিল</p>
              </div>
              <div className="text-center">
                <p className="text-sm">Certificate ID: {certificate.certificateId}</p>
                <img src={certificate.qrCode} alt="QR" className="h-24 mt-2" />
                <p className="text-xs">Verify: yourschool.com/verify</p>
              </div>
            </div>

            <div className="text-center mt-10 text-sm text-gray-600">
              <p>ইস্যুর তারিখ: {new Date(certificate.issuedAt).toLocaleDateString('bn-BD')}</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="text-center mt-12 space-x-6">
          <MainButton onClick={handlePrint} >
            <FaPrint /> প্রিন্ট করুন
          </MainButton>
          <MainButton onClick={() => setCertificate(null)} >
            <FaSave /> নতুন সার্টিফিকেট
          </MainButton>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-8">
      <div className="bg-white rounded-3xl shadow-2xl p-12 border border-gray-200">
        <h2 className="text-4xl font-bold text-center mb-12">সার্টিফিকেট তৈরি করুন</h2>
        
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <input required placeholder="রোল নং *" value={form.rollNo} onChange={e => setForm({...form, rollNo: e.target.value})} className="px-6 py-5 border-2 rounded-2xl text-lg" />
            <input required placeholder="শিক্ষার্থীর নাম *" value={form.studentName} onChange={e => setForm({...form, studentName: e.target.value})} className="px-6 py-5 border-2 rounded-2xl text-lg" />
            <input required placeholder="পিতার নাম *" value={form.fatherName} onChange={e => setForm({...form, fatherName: e.target.value})} className="px-6 py-5 border-2 rounded-2xl text-lg" />
            <input placeholder="ইনস্টিটিউট" value={form.institute} onChange={e => setForm({...form, institute: e.target.value})} className="px-6 py-5 border-2 rounded-2xl text-lg" />
            <input required placeholder="পরীক্ষার নাম *" value={form.examination} onChange={e => setForm({...form, examination: e.target.value})} className="px-6 py-5 border-2 rounded-2xl text-lg" />
            <input required placeholder="সাল *" value={form.year} onChange={e => setForm({...form, year: e.target.value})} className="px-6 py-5 border-2 rounded-2xl text-lg" />
            <input required placeholder="ফলাফল (যেমন: GPA-5.00) *" value={form.result} onChange={e => setForm({...form, result: e.target.value})} className="px-6 py-5 border-2 rounded-2xl text-lg" />
            <input required type="date" placeholder="জন্ম তারিখ *" value={form.dateOfBirth} onChange={e => setForm({...form, dateOfBirth: e.target.value})} className="px-6 py-5 border-2 rounded-2xl text-lg" />
          </div>

          <div className="text-center pt-10">
            <MainButton type="submit">
              সার্টিফিকেট জেনারেট করুন
            </MainButton>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateCertificate;