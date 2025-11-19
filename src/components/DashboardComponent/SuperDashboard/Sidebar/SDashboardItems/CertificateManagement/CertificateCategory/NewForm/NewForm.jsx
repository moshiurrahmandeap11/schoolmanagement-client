// src/pages/certificate/CertificateCategory/NewForm.jsx
import { useEffect, useState } from 'react';
import { FaArrowLeft, FaSave } from 'react-icons/fa';
import Swal from 'sweetalert2';
import axiosInstance from '../../../../../../../../hooks/axiosInstance/axiosInstance';
import MainButton from '../../../../../../../sharedItems/Mainbutton/Mainbutton';

const NewForm = ({ editingCategory, onBack }) => {
  const [form, setForm] = useState({
    name: '',
    language: 'Bengali'
  });
  const [loading, setLoading] = useState(false);

  const languages = [
    { value: 'Bengali', label: 'বাংলা' },
    { value: 'English', label: 'English' },
    { value: 'Arabic', label: 'العربية' },
    { value: 'Hindi', label: 'हिंदी' },
    { value: 'Urdu', label: 'اردو' }
  ];

  useEffect(() => {
    if (editingCategory) {
      setForm({
        name: editingCategory.name || '',
        language: editingCategory.language || 'Bengali'
      });
    }
  }, [editingCategory]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    if (!form.name.trim()) {
      Swal.fire('ভুল!', 'ক্যাটাগরির নাম দিন', 'warning');
      setLoading(false);
      return;
    }

    try {
      if (editingCategory) {
        await axiosInstance.put(`/certificate/certificate-category/${editingCategory._id}`, form);
        Swal.fire('সফল!', 'ক্যাটাগরি আপডেট করা হয়েছে', 'success');
      } else {
        await axiosInstance.post('/certificate/certificate-category', form);
        Swal.fire('সফল!', 'নতুন ক্যাটাগরি তৈরি হয়েছে', 'success');
      }
      onBack();
    } catch (err) {
      console.error('Error:', err);
      Swal.fire(
        'ত্রুটি!', 
        err.response?.data?.message || 'সমস্যা হয়েছে', 
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-full mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200">
          <div className="flex items-center gap-4 mb-8">
            <button
              onClick={onBack}
              className="p-3 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              disabled={loading}
            >
              <FaArrowLeft className="text-lg" />
            </button>
            <h2 className="text-2xl font-bold ">
              {editingCategory ? 'ক্যাটাগরি এডিট করুন' : 'নতুন ক্যাটাগরি তৈরি করুন'}
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-lg font-semibold text-gray-700 mb-3">
                ক্যাটাগরির নাম <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="যেমন: টেস্টিমোনিয়াল, ডিগ্রী, প্রশংসাপত্র"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-[#1e90c9] focus:ring-2 focus:ring-[#1e90c9] transition"
                required
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-lg font-semibold text-gray-700 mb-3">
                ভাষা নির্বাচন করুন
              </label>
              <select
                value={form.language}
                onChange={(e) => setForm({ ...form, language: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-[#1e90c9] focus:ring-2 focus:ring-[#1e90c9] transition"
                disabled={loading}
              >
                {languages.map(lang => (
                  <option key={lang.value} value={lang.value}>
                    {lang.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="text-center pt-6">
              <MainButton
                type="submit"
                disabled={loading}
              >
                <FaSave /> 
                {loading ? 'সংরক্ষণ হচ্ছে...' : (editingCategory ? 'আপডেট করুন' : 'সংরক্ষণ করুন')}
              </MainButton>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default NewForm;