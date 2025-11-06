import React, { useState, useEffect } from 'react';
import { FaArrowLeft, FaSave, FaUserPlus } from 'react-icons/fa';
import axiosInstance from '../../../../../../../../hooks/axiosInstance/axiosInstance';
import Loader from '../../../../../../../sharedItems/Loader/Loader';

const NewDonor = ({ onBack }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // ফর্মের ডাটা
  const [formData, setFormData] = useState({
    categoryId: '',
    donorName: '',
    mobile: '',
    address: '',
    regularAmount: '',
    donationPeriod: 'monthly'
  });

  // ক্যাটাগরি লোড
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axiosInstance.get('/donation/categories');
        if (res.data.success) {
          setCategories(res.data.data);
          if (res.data.data.length > 0) {
            setFormData(prev => ({ ...prev, categoryId: res.data.data[0]._id }));
          }
        }
      } catch  {
        alert('ক্যাটাগরি লোড করতে সমস্যা');
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ভ্যালিডেশন
    if (!formData.categoryId) return alert('ক্যাটাগরি নির্বাচন করুন');
    if (!formData.donorName.trim()) return alert('দাতার নাম লিখুন');
    if (!formData.mobile.trim()) return alert('মোবাইল নম্বর দিন');
    if (!/^\d{11}$/.test(formData.mobile)) return alert('মোবাইল ১১ সংখ্যার হতে হবে');
    if (!formData.regularAmount || formData.regularAmount <= 0) return alert('নিয়মিত পরিমাণ দিন');

    setSaving(true);
    try {
      const payload = {
        categoryId: formData.categoryId,
        donorName: formData.donorName.trim(),
        mobile: formData.mobile.trim(),
        address: formData.address.trim(),
        regularAmount: parseFloat(formData.regularAmount),
        donationType: formData.donationPeriod === 'monthly' ? 'monthly' : 'yearly',
        donationPeriod: formData.donationPeriod
      };

      const res = await axiosInstance.post('/donation/donors', payload);

      if (res.data.success) {
        alert('দাতা সফলভাবে যোগ হয়েছে!');
        onBack();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'দাতা যোগ করতে সমস্যা হয়েছে');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="max-w-full mx-auto p-4">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition font-medium text-sm"
          >
            <FaArrowLeft /> ফিরে যান
          </button>
          <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
            <FaUserPlus className="text-blue-600" /> নতুন দাতা যোগ করুন
          </h2>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              দাতা ক্যাটাগরি <span className="text-red-500">*</span>
            </label>
            <select
              name="categoryId"
              value={formData.categoryId}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              required
            >
              <option value="">-- ক্যাটাগরি নির্বাচন করুন --</option>
              {categories.map(cat => (
                <option key={cat._id} value={cat._id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Name + Mobile */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                দাতার নাম <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="donorName"
                value={formData.donorName}
                onChange={handleChange}
                placeholder="যেমন: আব্দুল করিম"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                মোবাইল নম্বর <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="mobile"
                value={formData.mobile}
                onChange={handleChange}
                placeholder="০১৭০০০০০০০০"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                maxLength="11"
                required
              />
            </div>
          </div>

          {/* Address */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ঠিকানা (ঐচ্ছিক)
            </label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
              rows="2"
              placeholder="গ্রাম, থানা, জেলা..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition resize-none"
            />
          </div>

          {/* Regular Amount + Period */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                নিয়মিত দানের পরিমাণ (টাকা) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-sm font-medium text-green-600">৳</span>
                <input
                  type="number"
                  name="regularAmount"
                  value={formData.regularAmount}
                  onChange={handleChange}
                  placeholder="৫০০"
                  className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                  min="1"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                অনুদানের সময়কাল <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="donationPeriod"
                    value="monthly"
                    checked={formData.donationPeriod === 'monthly'}
                    onChange={handleChange}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="text-sm">মাসিক</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="donationPeriod"
                    value="yearly"
                    checked={formData.donationPeriod === 'yearly'}
                    onChange={handleChange}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="text-sm">বার্ষিক</span>
                </label>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-center pt-4">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium disabled:opacity-70"
            >
              <FaSave />
              {saving ? 'সংরক্ষণ হচ্ছে...' : 'দাতা যোগ করুন'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewDonor;